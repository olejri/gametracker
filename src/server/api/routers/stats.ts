import { createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { getPlayerByClerkId } from "npm/server/helpers/filterUserForClient";
import { type Game, type GameStatsResult } from "npm/components/Types";
import { z } from "zod";

export const statsRouter = createTRPCRouter({
  // ────────────────────────────────────────────────────────────────
  // EXISTING: get stats per game for a specific player
  // ────────────────────────────────────────────────────────────────
  getGameStatsForPlayer: privateProcedure
    .input(z.object({ groupName: z.string() }))
    .query(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);

      const allGameSession = await ctx.prisma.gameSession.findMany({
        include: { PlayerGameSessionJunction: true },
        where: { groupId: input.groupName },
      });

      const gameInfo = await ctx.prisma.game.findMany({});
      const gameMap = new Map<string, Game>(gameInfo.map((g) => [g.id, g]));

      const allGames = allGameSession.filter((session) =>
        session.PlayerGameSessionJunction.some(
          (pgsj) => pgsj.playerId === player.id
        )
      );

      const result: GameStatsResult[] = [];

      for (const g of allGames) {
        const gameName = gameMap.get(g.gameId)?.name ?? "Unknown";
        const playerGameSession = g.PlayerGameSessionJunction.find(
          (pgs) => pgs.playerId === player.id
        );
        if (!playerGameSession) continue;

        let gameStats = result.find((x) => x.gameName === gameName);
        if (!gameStats) {
          gameStats = {
            gameName,
            numberOfGamesPlayed: 0,
            numberOfFirstPlaceWins: 0,
            numberOfSecondPlaceWins: 0,
            numberOfThirdPlaceWins: 0,
            winPrecentage: 0,
          };
          result.push(gameStats);
        }

        if (playerGameSession.position === 1)
          gameStats.numberOfFirstPlaceWins++;
        else if (playerGameSession.position === 2)
          gameStats.numberOfSecondPlaceWins++;
        else if (playerGameSession.position === 3)
          gameStats.numberOfThirdPlaceWins++;

        gameStats.numberOfGamesPlayed++;
      }

      for (const game of result) {
        game.winPrecentage =
          (game.numberOfFirstPlaceWins / game.numberOfGamesPlayed) * 100;
      }

      result.sort((a, b) => b.numberOfGamesPlayed - a.numberOfGamesPlayed);
      return result;
    }),

  // ────────────────────────────────────────────────────────────────
  // NEW: Player/Game win-rate matrix (for heatmap)
  // ────────────────────────────────────────────────────────────────
  getPlayerGamePerformanceMatrix: privateProcedure
    .input(
      z.object({
        groupId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      // Fetch all completed sessions in this group
      const sessions = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED" },
        include: {
          PlayerGameSessionJunction: {
            include: { player: true },
          },
          GameSessionGameJunction: {
            include: {
              game: true,
            },
          },
        },
      });

      // Build a nested structure: player → game → stats
      const matrix = new Map<string, Map<string, { wins: number; total: number }>>();

      for (const session of sessions) {
        // 🧩 Support both new (junction-based) and legacy (direct gameId) data
        const gamesInSession =
          session.GameSessionGameJunction.length > 0
            ? session.GameSessionGameJunction.map((g) => g.game)
            : session.gameId
              ? [
                await ctx.prisma.game.findUnique({
                  where: { id: session.gameId },
                }),
              ]
              : [];

        for (const game of gamesInSession) {
          if (!game) continue;

          // Keep base game logic if needed
          const baseGame =
            game.isExpansion && game.baseGameId
              ? await ctx.prisma.game.findUnique({
                where: { id: game.baseGameId },
              })
              : game;

          if (!baseGame) continue;

          const gameName = baseGame.name;

          for (const pgs of session.PlayerGameSessionJunction) {
            const nickname = pgs.player.nickname ?? pgs.player.name;
            if (!nickname) continue;

            let playerMap = matrix.get(nickname);
            if (!playerMap) {
              playerMap = new Map<string, { wins: number; total: number }>();
              matrix.set(nickname, playerMap);
            }

            let stats = playerMap.get(gameName);
            if (!stats) {
              stats = { wins: 0, total: 0 };
              playerMap.set(gameName, stats);
            }

            stats.total++;
            if (pgs.position === 1) stats.wins++;
          }
        }
      }

      // Build lists for output
      const players = Array.from(matrix.keys());
      const games = Array.from(
        new Set([...matrix.values()].flatMap((m) => Array.from(m.keys())))
      );

      const data = games.map((game) => {
        const row: Record<string, number> = {};
        for (const player of players) {
          const stat = matrix.get(player)?.get(game);
          row[player] = stat ? stat.wins / stat.total : 0;
        }
        return { game, ...row } as { game: string } & Record<string, number>;
      });

      return { players, games, data };
    }),
});
