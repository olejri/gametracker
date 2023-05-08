import { createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { getPlayerByClerkId } from "npm/server/helpers/filterUserForClient";
import { type Game, type GameStatsResult } from "npm/components/Types";
import { z } from "zod";

export const statsRouter = createTRPCRouter({
  getGameStatsForPlayer: privateProcedure
    .input(
      z.object({
        groupName: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);

      const allGameSession = await ctx.prisma.gameSession.findMany({
        include: {
          PlayerGameSessionJunction: true
        },
        where: {
          groupId: input.groupName
        }
      });

      const gameInfo = await ctx.prisma.game.findMany({});
      const gameMap = new Map<string, Game>();
      gameInfo.forEach((game) => {
        gameMap.set(game.id, game);
      });

      //find all games that player played
      const allGames = allGameSession.filter((gameSession) => {
        return gameSession.PlayerGameSessionJunction.some((playerGameSessionJunction) => {
          return playerGameSessionJunction.playerId === player.id;
        });
      });

      const result: GameStatsResult[] = [];
      //group pr game the number of 1, 2, 3 positons for the player
      allGames.map((g) => {
        const gameName = gameMap.get(g.gameId)?.name ?? "Unknown";
        const playerGameSession = g.PlayerGameSessionJunction.find((playerGameSession) => playerGameSession.playerId === player.id);
        if (playerGameSession) {
          const gameStats = result.find((game) => game.gameName === gameName);
          if (gameStats) {
            if (playerGameSession.position === 1) {
              gameStats.numberOfFirstPlaceWins++;
            } else if (playerGameSession.position === 2) {
              gameStats.numberOfSecondPlaceWins++;
            } else if (playerGameSession.position === 3) {
              gameStats.numberOfThirdPlaceWins++;
            } 
            gameStats.numberOfGamesPlayed++;
          } else {
            result.push({
              gameName: gameName,
              numberOfGamesPlayed: 1,
              numberOfFirstPlaceWins: playerGameSession.position === 1 ? 1 : 0,
              numberOfSecondPlaceWins: playerGameSession.position === 2 ? 1 : 0,
              numberOfThirdPlaceWins: playerGameSession.position === 3 ? 1 : 0,
              winPrecentage: 0
            } as GameStatsResult);
          }
        }
      });
      //calculate win precentage
      result.forEach((game) => {
        game.winPrecentage = (game.numberOfFirstPlaceWins / (game.numberOfGamesPlayed)) * 100;
      });
      //sort by number of games played
      result.sort((a, b) => {
        return b.numberOfGamesPlayed - a.numberOfGamesPlayed;
      });
      return result;
    })
});