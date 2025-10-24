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
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { groupId } = input;

      // Fetch all completed sessions (new + legacy structure supported)
      const sessions = await ctx.prisma.gameSession.findMany({
        where: { groupId, status: "COMPLETED" },
        include: {
          PlayerGameSessionJunction: { include: { player: true } },
          GameSessionGameJunction: { include: { game: true } },
        },
      });

      // Preload all games so we never query inside loops
      const allGames = await ctx.prisma.game.findMany();
      const gameMap = new Map(allGames.map((g) => [g.id, g]));

      // matrix: nickname -> baseGameId -> { wins, total }
      const matrix = new Map<string, Map<string, { wins: number; total: number }>>();
      // count how many sessions included each base game (deduped per session)
      const gameCountsByBaseId = new Map<string, number>();

      for (const session of sessions) {
        // collect games in this session (junction first, fallback to legacy gameId)
        const gamesInSession =
          session.GameSessionGameJunction.length > 0
            ? session.GameSessionGameJunction.map((g) => g.game)
            : (session.gameId ? [gameMap.get(session.gameId) ?? null] : []);

        // resolve to unique baseGameIds for this session
        const baseIdsInSession = new Set<string>();
        for (const g of gamesInSession) {
          if (!g) continue;
          const baseId = g.isExpansion && g.baseGameId ? g.baseGameId : g.id;
          baseIdsInSession.add(baseId);
        }

        // increment gameCount ONCE per base game per session
        for (const baseId of baseIdsInSession) {
          gameCountsByBaseId.set(baseId, (gameCountsByBaseId.get(baseId) ?? 0) + 1);

          // update per-player stats ONCE per base game per session
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

      // Build players list
      const players = Array.from(matrix.keys());

      // Build games list (names) in a stable order (by name)
      const allBaseIds = new Set<string>();
      for (const m of matrix.values()) for (const id of m.keys()) allBaseIds.add(id);

      const gamesMeta = Array.from(allBaseIds).map((id) => {
        const g = gameMap.get(id);
        // fallback name just in case, but id should always exist
        return { id, name: g?.name ?? id };
      });
      gamesMeta.sort((a, b) => a.name.localeCompare(b.name));

      // Build data rows with win rates and gameCount
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

      // Return names (not ids) for the games array, to match your UI
      const games = gamesMeta.map((g) => g.name);

      return { players, games, data };
    }),

});
