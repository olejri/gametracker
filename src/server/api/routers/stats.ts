import { createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { getPlayerByClerkId } from "npm/server/helpers/filterUserForClient";
import { type Game, type GameStatsResult } from "npm/components/Types";
import { z } from "zod";
import dayjs from "dayjs";
import { type PrismaClient, type Game as PrismaGame, type Player, type PlayerGameSessionJunction, type GameSessionGameJunction } from "@prisma/client";

// Type for session with player junction
type SessionWithPlayerJunction = {
  id: string;
  gameId: string;
  PlayerGameSessionJunction: PlayerGameSessionJunction[];
};

// Type for session with full relations
type SessionWithRelations = {
  id: string;
  gameId: string;
  PlayerGameSessionJunction: (PlayerGameSessionJunction & { player: Player })[];
  GameSessionGameJunction: (GameSessionGameJunction & { game: PrismaGame })[];
};

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

      const allGameSession: SessionWithPlayerJunction[] = await ctx.prisma.gameSession.findMany({
        include: { PlayerGameSessionJunction: true },
        where: { groupId: input.groupName, isTeamGame: false },
      });

      const gameInfo = await ctx.prisma.game.findMany({});
      const gameMap = new Map<string, Game>(gameInfo.map((g) => [g.id, g]));

      const allGames = allGameSession.filter((session) =>
        session.PlayerGameSessionJunction.some(
          (pgsj: PlayerGameSessionJunction) => pgsj.playerId === player.id
        )
      );

      const result: GameStatsResult[] = [];

      for (const g of allGames) {
        const gameName = gameMap.get(g.gameId)?.name ?? "Unknown";
        const playerGameSession = g.PlayerGameSessionJunction.find(
          (pgs: PlayerGameSessionJunction) => pgs.playerId === player.id
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

        const position = playerGameSession.position;
        if (position === 1)
          gameStats.numberOfFirstPlaceWins++;
        else if (position === 2)
          gameStats.numberOfSecondPlaceWins++;
        else if (position === 3)
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
  // Plays, wins and finishing positions per player, per game and overall
  // ────────────────────────────────────────────────────────────────
  getPlayerGameBreakdown: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      const sessions: SessionWithRelations[] = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED", isTeamGame: false },
        include: {
          PlayerGameSessionJunction: { include: { player: true } },
          GameSessionGameJunction: { include: { game: true } },
        },
      });

      const allGames = await ctx.prisma.game.findMany();
      const gameMap = new Map(allGames.map((g) => [g.id, g]));

      type Tally = { plays: number; wins: number; positions: number[] };
      const newTally = (): Tally => ({ plays: 0, wins: 0, positions: [] });
      const record = (tally: Tally, position: number | null) => {
        tally.plays += 1;
        if (position === 1) tally.wins += 1;
        // positions[i] counts finishes in place i + 1
        if (position && position > 0) {
          while (tally.positions.length < position) tally.positions.push(0);
          tally.positions[position - 1] = (tally.positions[position - 1] ?? 0) + 1;
        }
      };

      const overall = new Map<string, Tally>();
      const perGame = new Map<string, Map<string, Tally>>();
      const sessionsPerGame = new Map<string, number>();

      for (const session of sessions) {
        const baseGame = session.gameId ? [gameMap.get(session.gameId) ?? null] : [];
        const expansionGames: (PrismaGame | null)[] = session.GameSessionGameJunction.map((g) => g.game);

        // Expansions count toward their base game
        const baseIdsInSession = new Set<string>();
        for (const g of [...baseGame, ...expansionGames]) {
          if (!g) continue;
          baseIdsInSession.add(g.isExpansion && g.baseGameId ? g.baseGameId : g.id);
        }

        for (const baseId of baseIdsInSession) {
          sessionsPerGame.set(baseId, (sessionsPerGame.get(baseId) ?? 0) + 1);
        }

        for (const pgs of session.PlayerGameSessionJunction) {
          const nickname: string | null = pgs.player.nickname ?? pgs.player.name;
          if (!nickname) continue;

          const total = overall.get(nickname) ?? newTally();
          overall.set(nickname, total);
          record(total, pgs.position);

          for (const baseId of baseIdsInSession) {
            let byPlayer = perGame.get(baseId);
            if (!byPlayer) {
              byPlayer = new Map<string, Tally>();
              perGame.set(baseId, byPlayer);
            }
            const tally = byPlayer.get(nickname) ?? newTally();
            byPlayer.set(nickname, tally);
            record(tally, pgs.position);
          }
        }
      }

      const activePlayerNicknames = await getActivePlayerNicknames(ctx.prisma, groupId);

      const players = Array.from(overall.entries()).map(([name, tally]) => ({
        name,
        isActive: activePlayerNicknames.has(name),
        ...tally,
      }));

      const games = Array.from(perGame.entries())
        .map(([id, byPlayer]) => ({
          id,
          name: gameMap.get(id)?.name ?? id,
          sessions: sessionsPerGame.get(id) ?? 0,
          players: Array.from(byPlayer.entries()).map(([name, tally]) => ({ name, ...tally })),
        }))
        .sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name));

      return { players, games };
    }),

  // ────────────────────────────────────────────────────────────────
  // NEW: Game High Scores (only integer scores)
  // ────────────────────────────────────────────────────────────────
  getGameHighScores: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      const sessions: SessionWithRelations[] = await ctx.prisma.gameSession.findMany({
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
        const expansionGames: (PrismaGame | null)[] = session.GameSessionGameJunction.map((g) => g.game);
        const gamesInSession = [...baseGame, ...expansionGames];

        const baseIdsInSession = new Set<string>();
        for (const g of gamesInSession) {
          if (!g) continue;
          const baseId: string = g.isExpansion && g.baseGameId ? g.baseGameId : g.id;
          baseIdsInSession.add(baseId);
        }

        for (const baseId of baseIdsInSession) {
          const game = gameMap.get(baseId);
          if (!game) continue;

          for (const pgs of session.PlayerGameSessionJunction) {
            const score: string | null = pgs.score;
            if (!score) continue;

            // Try to parse the score as an integer
            const scoreNum: number = parseInt(score, 10);
            if (isNaN(scoreNum)) continue;

            const playerName: string = pgs.player.nickname ?? pgs.player.name ?? "";
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

      const sessions: SessionWithRelations[] = await ctx.prisma.gameSession.findMany({
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
        const expansionGames: (PrismaGame | null)[] = session.GameSessionGameJunction.map((g) => g.game);
        const gamesInSession = [...baseGame, ...expansionGames];

        const baseIdsInSession = new Set<string>();
        for (const g of gamesInSession) {
          if (!g) continue;
          const baseId: string = g.isExpansion && g.baseGameId ? g.baseGameId : g.id;
          baseIdsInSession.add(baseId);
        }

        // --- Get Player Count & Validate ---
        const numPlayers: number = session.PlayerGameSessionJunction.length;
        if (numPlayers <= 1) {
          // Can't normalize rank for 1-player games, so we skip them
          continue;
        }

        for (const baseId of baseIdsInSession) {
          for (const pgs of session.PlayerGameSessionJunction) {
            const nickname: string | null = pgs.player.nickname ?? pgs.player.name;
            if (!nickname) continue;

            // Get or create stats object
            let playerStatsMap = playerGameStats.get(nickname);
            if (!playerStatsMap) {
              playerStatsMap = new Map();
              playerGameStats.set(nickname, playerStatsMap);
            }
            let stats = playerStatsMap.get(baseId);
            if (!stats) {
              stats = { normalizedScores: [], positions: [], gamesPlayed: 0 };
              playerStatsMap.set(baseId, stats);
            }

            // --- NEW NORMALIZED RANK LOGIC ---
            const position: number | null = pgs.position;
            if (position && position > 0) {
              // (NumPlayers - Position) / (NumPlayers - 1)
              const normalizedScore: number = (numPlayers - position) / (numPlayers - 1);

              // Clamp between 0 and 1
              const clampedScore: number = Math.max(0, Math.min(1, normalizedScore));

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

  // ────────────────────────────────────────────────────────────────
  // Fun stats for the group dashboard (streaks, records, etc.)
  // ────────────────────────────────────────────────────────────────
  getFunStats: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      const sessions = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED" },
        include: { PlayerGameSessionJunction: { include: { player: true } } },
        orderBy: { createdAt: "asc" },
      });

      const allGames = await ctx.prisma.game.findMany();
      const gameMap = new Map(allGames.map((g) => [g.id, g]));

      const hotSince = dayjs().subtract(30, "day").toDate();

      const streaks = new Map<string, { current: number; best: number }>();
      const recentWins = new Map<string, number>();
      const secondPlaces = new Map<string, number>();
      const gameCounts = new Map<string, number>();
      const dayCounts = new Map<string, number>();
      let highScore: { score: number; playerName: string; gameName: string } | null = null;

      for (const session of sessions) {
        gameCounts.set(session.gameId, (gameCounts.get(session.gameId) ?? 0) + 1);
        const day = dayjs(session.createdAt).format("YYYY-MM-DD");
        dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);

        // Team games have no individual placements, so they only count for game and date stats
        if (session.isTeamGame) continue;

        for (const pgs of session.PlayerGameSessionJunction) {
          const name = pgs.player.nickname ?? pgs.player.name;

          const streak = streaks.get(name) ?? { current: 0, best: 0 };
          streak.current = pgs.position === 1 ? streak.current + 1 : 0;
          streak.best = Math.max(streak.best, streak.current);
          streaks.set(name, streak);

          if (pgs.position === 1 && session.createdAt >= hotSince) {
            recentWins.set(name, (recentWins.get(name) ?? 0) + 1);
          }
          if (pgs.position === 2) {
            secondPlaces.set(name, (secondPlaces.get(name) ?? 0) + 1);
          }

          const score = pgs.score ? parseInt(pgs.score, 10) : NaN;
          if (!isNaN(score) && (!highScore || score > highScore.score)) {
            highScore = { score, playerName: name, gameName: gameMap.get(session.gameId)?.name ?? "Unknown" };
          }
        }
      }

      // Highest count wins; ties keep the first entry found
      const topEntry = (counts: Map<string, number>): [string, number] | null => {
        let top: [string, number] | null = null;
        for (const entry of counts) {
          if (!top || entry[1] > top[1]) top = entry;
        }
        return top;
      };

      // Prefer a streak that is still running when two players share the record
      let longestStreak: { playerName: string; length: number; isActive: boolean } | null = null;
      for (const [name, streak] of streaks) {
        if (streak.best === 0) continue;
        const isActive = streak.current === streak.best;
        if (
          !longestStreak ||
          streak.best > longestStreak.length ||
          (streak.best === longestStreak.length && isActive && !longestStreak.isActive)
        ) {
          longestStreak = { playerName: name, length: streak.best, isActive };
        }
      }

      const hottest = topEntry(recentWins);
      const runnerUp = topEntry(secondPlaces);
      const mostPlayed = topEntry(gameCounts);
      const bestNight = topEntry(dayCounts);

      return {
        longestStreak,
        hottestPlayer: hottest ? { playerName: hottest[0], wins: hottest[1] } : null,
        mostPlayedGame: mostPlayed
          ? { gameName: gameMap.get(mostPlayed[0])?.name ?? "Unknown", sessions: mostPlayed[1] }
          : null,
        highScore,
        mostSecondPlaces: runnerUp ? { playerName: runnerUp[0], count: runnerUp[1] } : null,
        bestGameNight: bestNight ? { date: bestNight[0], sessions: bestNight[1] } : null,
      };
    }),
});
