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

      //make a playerInfo map for easy lookup
      const playerInfoMap = new Map<string, Player>();
      for (const player of playerInfo) {
        playerInfoMap.set(player.id, player);
      }

      //write to csv
      const csvData: Input = [];

      if (input.groupId === "game-night") {
      for (const session of allGames) {
        const row = {
          "Game Name": gameInfoMap.get(session.gameId)?.name,
          "Game Date": session.createdAt.toISOString(),
          "Game Description": session.description,
          "Nelich Score": "",
          "Nelich Position": 0,
          "Andriod Score": "",
          "Andriod Position": 0,
          "Oivind Score": "",
          "Oivind Position": 0,
          "dTd Score": "",
          "dTd Position": 0,
          "Jinxen Score": "",
          "Jinxen Position": 0,
        };

        session.PlayerGameSessionJunction.map((player) => {
          const nickname = playerInfoMap.get(player.playerId)?.nickname;
          if (nickname === 'Nelich') {
            row["Nelich Score"] = player.score ?? "";
            row["Nelich Position"] = player.position ?? 0;
          }
          if (nickname === 'Andriod') {
            row["Andriod Score"] = player.score ?? "";
            row["Andriod Position"] = player.position ?? 0;
          }
          if (nickname === 'Oivind') {
            row["Oivind Score"] = player.score ?? "";
            row["Oivind Position"] = player.position ?? 0;
          }
          if (nickname === 'dTd') {
            row["dTd Score"] = player.score ?? "";
            row["dTd Position"] = player.position ?? 0;
          }
          if (nickname === 'Jinxen') {
            row["Jinxen Score"] = player.score ?? "";
            row["Jinxen Position"] = player.position ?? 0;
          }
        });
        csvData.push(row);
      }
    } else if (input.groupId === "avsn") {
        for (const session of allGames) {
          const row = {
            "Game Name": gameInfoMap.get(session.gameId)?.name,
            "Game Date": session.createdAt.toISOString(),
            "Game Description": session.description,
            "Nelich Score": "",
            "Nelich Position": 0,
            "Andriod Score": "",
            "Andriod Position": 0,
          };
          session.PlayerGameSessionJunction.map((player) => {
            const nickname = playerInfoMap.get(player.playerId)?.nickname;
            if (nickname === 'Nelich') {
              row["Nelich Score"] = player.score ?? "";
              row["Nelich Position"] = player.position ?? 0;
            }
            if (nickname === 'Andriod') {
              row["Andriod Score"] = player.score ?? "";
              row["Andriod Position"] = player.position ?? 0;
            }
          });
          csvData.push(row);
        }
      }
      const csvString = await new Promise<string>((resolve, reject) => {
        stringify(csvData,{header:true} , (err, output) => {
          if (err) {
            reject(err);
          } else {
            resolve(output);
          }
        });
      });
      return {
       data: csvString
     }
    }),
});