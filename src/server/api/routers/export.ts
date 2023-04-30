import { z } from "zod";
import { type Input, stringify } from "csv-stringify";
import { createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { type Game, type Player } from "npm/components/Types";

export const exportRouter = createTRPCRouter({
  export: privateProcedure
    .input(
      z.object({
        groupId: z.string()
      })
    ).query(async ({ ctx, input }) => {

      const allGames = await ctx.prisma.gameSession.findMany({
        include: {
          PlayerGameSessionJunction: true,
          GameSessionGameJunction: true
        }, where: {
          groupId: input.groupId
        }
      });

      const gameInfo = await ctx.prisma.game.findMany();
      const playerInfo = await ctx.prisma.player.findMany();


      //make a gameInfo map for easy lookup
      const gameInfoMap = new Map<string, Game>();
      for (const game of gameInfo) {
        gameInfoMap.set(game.id, game);
      }

      let players = {};
      //make a playerInfo map for easy lookup
      const playerInfoMap = new Map<string, Player>();
      for (const player of playerInfo) {
        playerInfoMap.set(player.id, player);
        players = {
          ...players,
          [`${player.nickname ?? ""}_score`]: "",
          [`${player.nickname ?? ""}_position`]: 0
        };
      }
      //write to csv
      const csvData: Input = [];
      for (const session of allGames) {
        const row: Record<string, any> = {
          "Game_name": gameInfoMap.get(session.gameId)?.name,
          "Game_date": session.createdAt.toISOString(),
          "Game_description": session.description,
          ...players,
        };

        session.PlayerGameSessionJunction.map((player) => {
          const nickname = playerInfoMap.get(player.playerId)?.nickname;
          row[`${nickname ?? ""}_score`] = player.score ?? "";
          row[`${nickname ?? ""}_position`] = player.position ?? 0;
        });
        csvData.push(row);
      }
      const csvString = await new Promise<string>((resolve, reject) => {
        stringify(csvData, { header: true }, (err, output) => {
          if (err) {
            reject(err);
          } else {
            resolve(output);
          }
        });
      });
      return {
        data: csvString
      };
    })
});