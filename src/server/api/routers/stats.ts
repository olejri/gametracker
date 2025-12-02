import { createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { getPlayerByClerkId } from "npm/server/helpers/filterUserForClient";
import { type Game, type GameStatsResult } from "npm/components/Types";
import { z } from "zod";
import { type PrismaClient } from "@prisma/client";

// Helper function to get active player nicknames in a group
async function getActivePlayerNicknames(prisma: PrismaClient, groupId: string): Promise<Set<string>> {
  const activeJunctions = await prisma.playerGameGroupJunction.findMany({
    where: {
      groupId,
      inviteStatus: "ACCEPTED"
    },
    include: {
      Player: true
    }
  });

  const activeNicknames = new Set<string>();
  for (const junction of activeJunctions) {
    const nickname = junction.Player.nickname ?? junction.Player.name;
    if (nickname) {
      activeNicknames.add(nickname);
    }
  }
  return activeNicknames;
}

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
        where: { groupId: input.groupName, isTeamGame: false },
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
        where: { groupId, status: "COMPLETED", isTeamGame: false },
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

      // Get active players in the group
      const activePlayerNicknames = await getActivePlayerNicknames(ctx.prisma, groupId);
      const activePlayers = players.filter((p) => activePlayerNicknames.has(p));

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
      return { players, games, data, activePlayers };
    }),

  // ────────────────────────────────────────────────────────────────
  // NEW: Player Position Distribution Matrix (for heatmap)
  // ────────────────────────────────────────────────────────────────
  getPlayerPositionMatrix: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      const sessions = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED", isTeamGame: false },
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

      // Get active players in the group
      const activePlayerNicknames = await getActivePlayerNicknames(ctx.prisma, groupId);
      const activePlayers = players.filter((p) => activePlayerNicknames.has(p));

      const data: Array<{ position: number } & Record<string, number>> = [];
      for (let pos = 1; pos <= maxPosition; pos++) {
        const row: { position: number } & Record<string, number> = { position: pos };
        for (const player of players) {
          const count = matrix.get(player)?.get(pos) ?? 0;
          row[player] = count;
        }
        data.push(row);
      }

      return { players, positions: Array.from({ length: maxPosition }, (_, i) => i + 1), data, activePlayers };
    }),

  // ────────────────────────────────────────────────────────────────
  // NEW: Game High Scores (only integer scores)
  // ────────────────────────────────────────────────────────────────
  getGameHighScores: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      const sessions = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED", isTeamGame: false },
        include: {
          PlayerGameSessionJunction: { include: { player: true } },
          GameSessionGameJunction: { include: { game: true } },
        },
      });

      const allGames = await ctx.prisma.game.findMany();
      const gameMap = new Map(allGames.map((g) => [g.id, g]));

      // Get active players in the group
      const activePlayerNicknames = await getActivePlayerNicknames(ctx.prisma, groupId);

      const gameHighScores = new Map<string, { gameName: string; highScore: number; playerName: string; isActivePlayer: boolean }>();

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
                isActivePlayer: activePlayerNicknames.has(playerName),
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
  // REFACTORED: Best Game Per Player (Normalized Rank + Bayesian)
  // ────────────────────────────────────────────────────────────────
  getBestGamePerPlayer: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      const sessions = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED", isTeamGame: false },
        include: {
          PlayerGameSessionJunction: { include: { player: true } },
          GameSessionGameJunction: { include: { game: true } },
        },
      });

      const allGames = await ctx.prisma.game.findMany();
      const gameMap = new Map(allGames.map((g) => [g.id, g]));

      // Map: playerNickname -> gameBaseId -> stats
      const playerGameStats = new Map<
        string,
        Map<
          string,
          {
            normalizedScores: number[]; // Scores from 0.0 to 1.0
            positions: number[]; // Raw positions (1, 2, 3...)
            gamesPlayed: number; // Count of games with a valid score
          }
        >
      >();

      for (const session of sessions) {
        // --- Find the single Base Game ID for this session ---
        const baseGame = session.gameId ? [gameMap.get(session.gameId) ?? null] : [];
        const expansionGames = session.GameSessionGameJunction.map((g) => g.game);
        const gamesInSession = [...baseGame, ...expansionGames];

        const baseIdsInSession = new Set<string>();
        for (const g of gamesInSession) {
          if (!g) continue;
          const baseId = g.isExpansion && g.baseGameId ? g.baseGameId : g.id;
          baseIdsInSession.add(baseId);
        }

        // --- Get Player Count & Validate ---
        const numPlayers = session.PlayerGameSessionJunction.length;
        if (numPlayers <= 1) {
          // Can't normalize rank for 1-player games, so we skip them
          continue;
        }

        for (const baseId of baseIdsInSession) {
          for (const pgs of session.PlayerGameSessionJunction) {
            const nickname = pgs.player.nickname ?? pgs.player.name;
            if (!nickname) continue;

            // Get or create stats object
            let gameMap = playerGameStats.get(nickname);
            if (!gameMap) {
              gameMap = new Map();
              playerGameStats.set(nickname, gameMap);
            }
            let stats = gameMap.get(baseId);
            if (!stats) {
              stats = { normalizedScores: [], positions: [], gamesPlayed: 0 };
              gameMap.set(baseId, stats);
            }

            // --- NEW NORMALIZED RANK LOGIC ---
            const position = pgs.position;
            if (position && position > 0) {
              // (NumPlayers - Position) / (NumPlayers - 1)
              const normalizedScore = (numPlayers - position) / (numPlayers - 1);

              // Clamp between 0 and 1
              const clampedScore = Math.max(0, Math.min(1, normalizedScore));

              stats.normalizedScores.push(clampedScore);
              stats.positions.push(position);
              stats.gamesPlayed += 1;
            }
          }
        }
      }

      // --- Calculate best game for each player using Bayesian Average ---
      // Get active players in the group
      const activePlayerNicknames = await getActivePlayerNicknames(ctx.prisma, groupId);

      const result: Array<{
        playerName: string;
        bestGame: string;
        trueAvgScore: number; // The raw avg of normalized scores
        gamesPlayed: number;
        avgPosition: number;
        bayesianScore: number; // The new confidence score
        isActivePlayer: boolean;
      }> = [];

      // Bayesian average parameters:
      const C = 5; // Our "confidence" parameter (like adding 5 "average" games)
      const P = 0.5; // Our "prior" score (50th percentile)

      for (const [playerName, gameStats] of playerGameStats.entries()) {
        let bestGameId: string | null = null;
        let bestBayesianScore = -1;
        let bestTrueAvg = 0;
        let bestGamesPlayed = 0;
        let bestAvgPosition = 0;

        for (const [gameId, stats] of gameStats.entries()) {
          if (stats.gamesPlayed === 0) continue;

          // Calculate the "True Average" (raw normalized score)
          const avgNormalizedScore =
            stats.normalizedScores.reduce((sum, s) => sum + s, 0) / stats.gamesPlayed;

          // Calculate the "True Average Position"
          const avgPosition =
            stats.positions.reduce((sum, p) => sum + p, 0) / stats.positions.length;

          // --- NEW BAYESIAN AVERAGE LOGIC ---
          // (avgScore * gamesPlayed + P * C) / (gamesPlayed + C)
          // This score is the "confidence" score
          const bayesianScore =
            (avgNormalizedScore * stats.gamesPlayed + P * C) / (stats.gamesPlayed + C);

          if (bayesianScore > bestBayesianScore) {
            bestBayesianScore = bayesianScore;
            bestGameId = gameId;
            bestTrueAvg = avgNormalizedScore;
            bestGamesPlayed = stats.gamesPlayed;
            bestAvgPosition = avgPosition;
          }
        }

        if (bestGameId) {
          const game = gameMap.get(bestGameId);
          result.push({
            playerName,
            bestGame: game?.name ?? "Unknown",
            trueAvgScore: bestTrueAvg,
            gamesPlayed: bestGamesPlayed,
            avgPosition: bestAvgPosition,
            bayesianScore: bestBayesianScore,
            isActivePlayer: activePlayerNicknames.has(playerName),
          });
        }
      }

      result.sort((a, b) => a.playerName.localeCompare(b.playerName));
      return result;
    }),
});
