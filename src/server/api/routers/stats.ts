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
        const baseGame = session.gameId ? [gameMap.get(session.gameId) ?? null] : [];
        const expansionGames = session.GameSessionGameJunction.map((g) => g.game);
        const gamesInSession = [...baseGame, ...expansionGames];

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
        const baseGame = session.gameId ? [gameMap.get(session.gameId) ?? null] : [];
        const expansionGames = session.GameSessionGameJunction.map((g) => g.game);
        const gamesInSession = [...baseGame, ...expansionGames];

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

      // --- REFACTOR: Added 'positions' array to stats object ---
      // Map: playerNickname -> gameBaseId -> { scores: number[], gamesPlayed: number, positions: number[] }
      const playerGameStats = new Map<
        string,
        Map<string, { scores: number[]; gamesPlayed: number; positions: number[] }>
      >();

      // Position weights: 1st = 1.0, 2nd = 0.6, 3rd = 0.3, 4th+ = 0.1
      const getPositionWeight = (position: number | null): number => {
        if (!position) return 0;
        if (position === 1) return 1.0;
        if (position === 2) return 0.6;
        if (position === 3) return 0.3;
        return 0.1;
      };

      for (const session of sessions) {
        const baseGame = session.gameId ? [gameMap.get(session.gameId) ?? null] : [];
        const expansionGames = session.GameSessionGameJunction.map((g) => g.game);
        const gamesInSession = [...baseGame, ...expansionGames];

        const baseIdsInSession = new Set<string>();
        for (const g of gamesInSession) {
          if (!g) continue;
          const baseId = g.isExpansion && g.baseGameId ? g.baseGameId : g.id;
          baseIdsInSession.add(baseId);
        }

        // This logic is correct: it loops through the single baseId for the session
        for (const baseId of baseIdsInSession) {
          for (const pgs of session.PlayerGameSessionJunction) {
            const nickname = pgs.player.nickname ?? pgs.player.name;
            if (!nickname) continue;

            let gameMap = playerGameStats.get(nickname);
            if (!gameMap) {
              gameMap = new Map<
                string,
                { scores: number[]; gamesPlayed: number; positions: number[] }
              >();
              playerGameStats.set(nickname, gameMap);
            }

            let stats = gameMap.get(baseId);
            if (!stats) {
              // --- REFACTOR: Initialize 'positions' array ---
              stats = { scores: [], gamesPlayed: 0, positions: [] };
              gameMap.set(baseId, stats);
            }

            const weight = getPositionWeight(pgs.position);
            stats.scores.push(weight);

            // --- REFACTOR: Store the actual position for a true average ---
            stats.positions.push(pgs.position ?? 0); // Store 0 for null, filter later

            stats.gamesPlayed += 1;
          }
        }
      }

      // Calculate best game for each player
      const result: Array<{
        playerName: string;
        bestGame: string;
        weightedWinRate: number; // The raw avg score (0-100)
        gamesPlayed: number;
        avgPosition: number;
        confidenceScore: number; // The score after the play-count penalty (0-100)
      }> = [];

      for (const [playerName, gameStats] of playerGameStats.entries()) {
        let bestGameId: string | null = null;
        let bestGamesPlayed = 0;
        let bestAvgPosition = 0;

        // --- REFACTOR: Renamed variables for clarity ---
        let bestPenalizedScore = -1; // Use -1 to allow 0-score games to be picked
        let bestRawAvgScore = 0;

        for (const [gameId, stats] of gameStats.entries()) {
          if (stats.gamesPlayed === 0) continue; // Should be impossible, but good check

          // Calculate average weighted score
          const avgWeightedScore = stats.scores.reduce((sum, s) => sum + s, 0) / stats.gamesPlayed;

          // --- REFACTOR #1: Use a softer, square-root penalty ---
          // This is much less aggressive than a linear / 3 penalty.
          const confidenceFactor = Math.min(1.0, Math.sqrt(stats.gamesPlayed / 3.0));
          const penalizedScore = avgWeightedScore * confidenceFactor;

          // --- REFACTOR #2: Calculate true average position ---
          const validPositions = stats.positions.filter(p => p > 0); // Filter out 0s
          const trueAvgPosition = validPositions.length > 0
            ? validPositions.reduce((sum, p) => sum + p, 0) / validPositions.length
            : 0;

          // --- REFACTOR: Use clearer variable names for comparison ---
          if (penalizedScore > bestPenalizedScore) {
            bestPenalizedScore = penalizedScore;
            bestRawAvgScore = avgWeightedScore;
            bestGameId = gameId;
            bestGamesPlayed = stats.gamesPlayed;
            bestAvgPosition = trueAvgPosition;
          }
        }

        if (bestGameId) {
          const game = gameMap.get(bestGameId);
          result.push({
            playerName,
            bestGame: game?.name ?? "Unknown",
            // 'weightedWinRate' is the raw, un-penalized score
            weightedWinRate: Math.round(bestRawAvgScore * 100),
            gamesPlayed: bestGamesPlayed,
            avgPosition: Math.round(bestAvgPosition * 10) / 10,
            // 'confidenceScore' is the final score *after* the penalty
            confidenceScore: Math.round(bestPenalizedScore * 100),
          });
        }
      }

      result.sort((a, b) => a.playerName.localeCompare(b.playerName));
      return result;
    }),
});
