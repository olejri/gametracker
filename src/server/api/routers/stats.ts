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
  // Player/Game win-rate matrix (for heatmap)
  // ────────────────────────────────────────────────────────────────
  getPlayerGamePerformanceMatrix: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      const sessions = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED" },
        include: {
          PlayerGameSessionJunction: { include: { player: true } },
          GameSessionGameJunction: { include: { game: true } },
        },
      });

      const allGames = await ctx.prisma.game.findMany();
      const gameMap = new Map(allGames.map((g) => [g.id, g]));

      const matrix = new Map<string, Map<string, { wins: number; total: number }>>();
      const gameCountsByBaseId = new Map<string, number>();

      for (const session of sessions) {
        const gamesInSession =
          session.GameSessionGameJunction.length > 0
            ? session.GameSessionGameJunction.map((g) => g.game)
            : (session.gameId ? [gameMap.get(session.gameId) ?? null] : []);

        const baseIdsInSession = new Set<string>();
        for (const g of gamesInSession) {
          if (!g) continue;
          const baseId = g.isExpansion && g.baseGameId ? g.baseGameId : g.id;
          baseIdsInSession.add(baseId);
        }

        for (const baseId of baseIdsInSession) {
          gameCountsByBaseId.set(baseId, (gameCountsByBaseId.get(baseId) ?? 0) + 1);

          for (const pgs of session.PlayerGameSessionJunction) {
            const nickname = pgs.player.nickname ?? pgs.player.name;
            if (!nickname) continue;

            let playerMap = matrix.get(nickname);
            if (!playerMap) {
              playerMap = new Map<string, { wins: number; total: number }>();
              matrix.set(nickname, playerMap);
            }

            let stats = playerMap.get(baseId);
            if (!stats) {
              stats = { wins: 0, total: 0 };
              playerMap.set(baseId, stats);
            }

            stats.total += 1;
            if (pgs.position === 1) stats.wins += 1;
          }
        }
      }

      const players = Array.from(matrix.keys());

      const allBaseIds = new Set<string>();
      for (const m of matrix.values()) for (const id of m.keys()) allBaseIds.add(id);

      const gamesMeta = Array.from(allBaseIds).map((id) => {
        const g = gameMap.get(id);
        return { id, name: g?.name ?? id };
      });
      gamesMeta.sort((a, b) => a.name.localeCompare(b.name));

      const data: Array<{ game: string; gameCount: number } & Record<string, number>> =
        gamesMeta.map(({ id, name }) => {
          const row: { game: string; gameCount: number } & Record<string, number> = {
            game: name,
            gameCount: gameCountsByBaseId.get(id) ?? 0,
          } as { game: string; gameCount: number } & Record<string, number>;

          for (const player of players) {
            const stat = matrix.get(player)?.get(id);
            row[player] = stat ? stat.wins / stat.total : 0;
          }
          return row;
        });

      const games = gamesMeta.map((g) => g.name);
      return { players, games, data };
    }),

  // ────────────────────────────────────────────────────────────────
  // NEW: Player Position Distribution Matrix (for heatmap)
  // ────────────────────────────────────────────────────────────────
  getPlayerPositionMatrix: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      const sessions = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED" },
        include: {
          PlayerGameSessionJunction: { include: { player: true } },
        },
      });

      let maxPosition = 0;
      for (const session of sessions) {
        const count = session.PlayerGameSessionJunction.length;
        if (count > maxPosition) maxPosition = count;
      }

      const matrix = new Map<string, Map<number, number>>();

      for (const session of sessions) {
        for (const pgs of session.PlayerGameSessionJunction) {
          const nickname = pgs.player.nickname ?? pgs.player.name;
          if (!nickname) continue;

          let posMap = matrix.get(nickname);
          if (!posMap) {
            posMap = new Map<number, number>();
            matrix.set(nickname, posMap);
          }

          const pos = pgs.position ?? 0;
          if (pos > 0) {
            posMap.set(pos, (posMap.get(pos) ?? 0) + 1);
          }
        }
      }

      const players = Array.from(matrix.keys()).sort();

      const data: Array<{ position: number } & Record<string, number>> = [];
      for (let pos = 1; pos <= maxPosition; pos++) {
        const row: { position: number } & Record<string, number> = { position: pos };
        for (const player of players) {
          const count = matrix.get(player)?.get(pos) ?? 0;
          row[player] = count;
        }
        data.push(row);
      }

      return { players, positions: Array.from({ length: maxPosition }, (_, i) => i + 1), data };
    }),

  // ────────────────────────────────────────────────────────────────
  // NEW: Game High Scores (only integer scores)
  // ────────────────────────────────────────────────────────────────
  getGameHighScores: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      const sessions = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED" },
        include: {
          PlayerGameSessionJunction: { include: { player: true } },
          GameSessionGameJunction: { include: { game: true } },
        },
      });

      const allGames = await ctx.prisma.game.findMany();
      const gameMap = new Map(allGames.map((g) => [g.id, g]));

      const gameHighScores = new Map<string, { gameName: string; highScore: number; playerName: string }>();

      for (const session of sessions) {
        const gamesInSession =
          session.GameSessionGameJunction.length > 0
            ? session.GameSessionGameJunction.map((g) => g.game)
            : (session.gameId ? [gameMap.get(session.gameId) ?? null] : []);

        const baseIdsInSession = new Set<string>();
        for (const g of gamesInSession) {
          if (!g) continue;
          const baseId = g.isExpansion && g.baseGameId ? g.baseGameId : g.id;
          baseIdsInSession.add(baseId);
        }

        for (const baseId of baseIdsInSession) {
          const game = gameMap.get(baseId);
          if (!game) continue;

          for (const pgs of session.PlayerGameSessionJunction) {
            if (!pgs.score) continue;

            // Try to parse the score as an integer
            const scoreNum = parseInt(pgs.score, 10);
            if (isNaN(scoreNum)) continue;

            const playerName = pgs.player.nickname ?? pgs.player.name;
            const existing = gameHighScores.get(baseId);

            if (!existing || scoreNum > existing.highScore) {
              gameHighScores.set(baseId, {
                gameName: game.name,
                highScore: scoreNum,
                playerName,
              });
            }
          }
        }
      }

      const result = Array.from(gameHighScores.values()).sort((a, b) => 
        a.gameName.localeCompare(b.gameName)
      );

      return result;
    }),

  // ────────────────────────────────────────────────────────────────
  // NEW: Best Game Per Player (weighted by position and sample size)
  // ────────────────────────────────────────────────────────────────
  getBestGamePerPlayer: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      const sessions = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED" },
        include: {
          PlayerGameSessionJunction: { include: { player: true } },
          GameSessionGameJunction: { include: { game: true } },
        },
      });

      const allGames = await ctx.prisma.game.findMany();
      const gameMap = new Map(allGames.map((g) => [g.id, g]));

      // Map: playerNickname -> gameBaseId -> { scores: number[], gamesPlayed: number }
      const playerGameStats = new Map<string, Map<string, { scores: number[]; gamesPlayed: number }>>();

      // Position weights: 1st = 1.0, 2nd = 0.6, 3rd = 0.3, 4th+ = 0.1
      const getPositionWeight = (position: number | null): number => {
        if (!position) return 0;
        if (position === 1) return 1.0;
        if (position === 2) return 0.6;
        if (position === 3) return 0.3;
        return 0.1;
      };

      for (const session of sessions) {
        const gamesInSession =
          session.GameSessionGameJunction.length > 0
            ? session.GameSessionGameJunction.map((g) => g.game)
            : (session.gameId ? [gameMap.get(session.gameId) ?? null] : []);

        const baseIdsInSession = new Set<string>();
        for (const g of gamesInSession) {
          if (!g) continue;
          const baseId = g.isExpansion && g.baseGameId ? g.baseGameId : g.id;
          baseIdsInSession.add(baseId);
        }

        for (const baseId of baseIdsInSession) {
          for (const pgs of session.PlayerGameSessionJunction) {
            const nickname = pgs.player.nickname ?? pgs.player.name;
            if (!nickname) continue;

            let gameMap = playerGameStats.get(nickname);
            if (!gameMap) {
              gameMap = new Map<string, { scores: number[]; gamesPlayed: number }>();
              playerGameStats.set(nickname, gameMap);
            }

            let stats = gameMap.get(baseId);
            if (!stats) {
              stats = { scores: [], gamesPlayed: 0 };
              gameMap.set(baseId, stats);
            }

            const weight = getPositionWeight(pgs.position);
            stats.scores.push(weight);
            stats.gamesPlayed += 1;
          }
        }
      }

      // Calculate best game for each player
      const result: Array<{
        playerName: string;
        bestGame: string;
        weightedWinRate: number;
        gamesPlayed: number;
        avgPosition: number;
        confidenceScore: number;
      }> = [];

      for (const [playerName, gameStats] of playerGameStats.entries()) {
        let bestGameId: string | null = null;
        let bestScore = 0;
        let bestGamesPlayed = 0;
        let bestAvgPosition = 0;
        let bestConfidence = 0;

        for (const [gameId, stats] of gameStats.entries()) {
          // Calculate average weighted score
          const avgWeightedScore = stats.scores.reduce((sum, s) => sum + s, 0) / stats.gamesPlayed;
          
          // Apply confidence factor based on sample size
          // Games with fewer than 3 plays get penalized
          const confidenceFactor = Math.min(1.0, stats.gamesPlayed / 3);
          const confidenceScore = avgWeightedScore * confidenceFactor;

          // Calculate average position for display
          const avgPosition = stats.scores.reduce((sum, s) => {
            if (s >= 1.0) return sum + 1;
            if (s >= 0.6) return sum + 2;
            if (s >= 0.3) return sum + 3;
            return sum + 4;
          }, 0) / stats.gamesPlayed;

          if (confidenceScore > bestScore) {
            bestScore = confidenceScore;
            bestGameId = gameId;
            bestGamesPlayed = stats.gamesPlayed;
            bestAvgPosition = avgPosition;
            bestConfidence = avgWeightedScore;
          }
        }

        if (bestGameId) {
          const game = gameMap.get(bestGameId);
          result.push({
            playerName,
            bestGame: game?.name ?? "Unknown",
            weightedWinRate: Math.round(bestConfidence * 100),
            gamesPlayed: bestGamesPlayed,
            avgPosition: Math.round(bestAvgPosition * 10) / 10,
            confidenceScore: Math.round(bestScore * 100),
          });
        }
      }

      result.sort((a, b) => a.playerName.localeCompare(b.playerName));
      return result;
    }),
});
