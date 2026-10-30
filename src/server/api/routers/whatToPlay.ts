import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { getPlayerByClerkId } from "npm/server/helpers/filterUserForClient";
import { fetchBggGame, isBggSyncEnabled } from "npm/server/bgg";
import { createGameFromBgg } from "npm/server/api/routers/game";

// How many top scoring catalog games the suggestions are drawn from, so
// "Show 5 others" gives new games instead of the same list every time
const SUGGESTION_POOL = 15;
const SUGGESTIONS = 5;

/** Reads "2-4", "2–4 players", "45 min" or "4" as a min/max pair. */
export function parseRange(text: string): { min: number | null; max: number | null } {
  const numbers = (text.match(/\d+/g) ?? []).map(Number).filter((n) => n > 0);
  if (numbers.length === 0) return { min: null, max: null };
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

async function groupMemberIds(prisma: PrismaClient, groupId: string) {
  const members = await prisma.playerGameGroupJunction.findMany({
    where: { groupId, inviteStatus: "ACCEPTED" },
    select: { playerId: true }
  });
  return members.map((m) => m.playerId);
}

const shuffle = <T>(items: T[]) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
};

export const whatToPlayRouter = createTRPCRouter({
  // Every base game owned by someone in the group. The page filters and
  // rolls on these itself, so changing a filter needs no new request.
  shelf: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberIds = await groupMemberIds(ctx.prisma, input.groupId);
      const games = await ctx.prisma.game.findMany({
        where: { isExpansion: false, PlayerGameJunction: { some: { playerId: { in: memberIds } } } },
        include: {
          PlayerGameJunction: {
            where: { playerId: { in: memberIds } },
            include: { Player: { select: { name: true, nickname: true } } }
          }
        }
      });
      const plays = await ctx.prisma.gameSession.groupBy({
        by: ["gameId"],
        where: { groupId: input.groupId, gameId: { in: games.map((g) => g.id) } },
        _count: { _all: true },
        _max: { createdAt: true }
      });
      const playsByGame = new Map(plays.map((p) => [p.gameId, p]));

      return games.map((game) => {
        const players = parseRange(game.players);
        const playtime = parseRange(game.playtime);
        const played = playsByGame.get(game.id);
        return {
          id: game.id,
          name: game.name,
          imageUrl: game.image_url,
          minPlayers: players.min,
          maxPlayers: players.max,
          minPlaytime: playtime.min,
          maxPlaytime: playtime.max,
          bggId: game.bggId,
          bggAverage: game.bggAverage,
          bggRank: game.bggRank,
          bggWeight: game.bggWeight,
          owners: game.PlayerGameJunction.map((j) => j.Player.nickname ?? j.Player.name),
          plays: played?._count._all ?? 0,
          lastPlayed: played?._max.createdAt ?? null
        };
      });
    }),

  // Top ranked BGG games that nobody in the group owns, matching the filters
  suggestions: privateProcedure
    .input(z.object({
      groupId: z.string(),
      players: z.number().int().min(1).max(20).nullable(),
      minPlaytime: z.number().int().nullable(),
      maxPlaytime: z.number().int().nullable(),
      minWeight: z.number().nullable(),
      maxWeight: z.number().nullable(),
      // Changes on "Show 5 others" so the query runs again with a new draw
      roll: z.number().int()
    }))
    .query(async ({ ctx, input }) => {
      const memberIds = await groupMemberIds(ctx.prisma, input.groupId);
      const owned = await ctx.prisma.game.findMany({
        where: { bggId: { not: null }, PlayerGameJunction: { some: { playerId: { in: memberIds } } } },
        select: { bggId: true }
      });

      const where = {
        bggId: { notIn: owned.map((g) => g.bggId as number) },
        ...(input.players !== null && { minPlayers: { lte: input.players }, maxPlayers: { gte: input.players } }),
        ...(input.maxPlaytime !== null && { minPlaytime: { lte: input.maxPlaytime } }),
        ...(input.minPlaytime !== null && { maxPlaytime: { gte: input.minPlaytime } }),
        ...((input.minWeight !== null || input.maxWeight !== null) && {
          weight: { ...(input.minWeight !== null && { gte: input.minWeight }), ...(input.maxWeight !== null && { lt: input.maxWeight }) }
        })
      };
      // Only the best ranked matches can make the pool, so 300 is plenty to score
      const [total, candidates] = await Promise.all([
        ctx.prisma.bggCatalogGame.count({ where }),
        ctx.prisma.bggCatalogGame.findMany({ where, orderBy: { rank: "asc" }, take: 300 })
      ]);

      // The group's most played games give the mechanics it likes
      const topPlayed = await ctx.prisma.gameSession.groupBy({
        by: ["gameId"],
        where: { groupId: input.groupId },
        _count: { _all: true },
        orderBy: { _count: { gameId: "desc" } },
        take: 10
      });
      const favorites = await ctx.prisma.game.findMany({
        where: { id: { in: topPlayed.map((t) => t.gameId) }, bggId: { not: null } },
        select: { id: true, name: true, mechanics: true }
      });
      const favoriteOrder = new Map(topPlayed.map((t, i) => [t.gameId, i]));
      favorites.sort((a, b) => (favoriteOrder.get(a.id) ?? 0) - (favoriteOrder.get(b.id) ?? 0));
      const splitList = (text: string) => text.split(",").map((m) => m.trim()).filter(Boolean);

      const scored = candidates.map((game) => {
        const mechanics = new Set(splitList(game.mechanics));
        let likeGame: { name: string; shared: string[] } | null = null;
        for (const fav of favorites) {
          const shared = splitList(fav.mechanics).filter((m) => mechanics.has(m));
          if (shared.length > (likeGame?.shared.length ?? 1)) likeGame = { name: fav.name, shared };
        }
        const bestAt = input.players !== null && (game.bestPlayers ?? "").split(",").includes(String(input.players));
        const score = (game.bayesAverage ?? 0) + Math.min(likeGame?.shared.length ?? 0, 3) * 0.1 + (bestAt ? 0.25 : 0);
        const reason = likeGame
          ? `Because you play ${likeGame.name}: ${likeGame.shared.slice(0, 2).join(" and ").toLowerCase()}`
          : bestAt ? `BGG players say it's best with ${input.players ?? ""}`
          : `Ranked #${game.rank ?? "?"} on BGG`;
        return { ...game, score, reason, bestAt };
      });

      scored.sort((a, b) => b.score - a.score);
      return {
        total,
        games: shuffle(scored.slice(0, SUGGESTION_POOL)).slice(0, SUGGESTIONS).sort((a, b) => b.score - a.score)
      };
    }),

  // Adds a BGG game to the collection (if it isn't there yet) and marks it as
  // owned by the signed-in player
  addToMyCollection: privateProcedure
    .input(z.object({ bggId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);
      let game = await ctx.prisma.game.findUnique({ where: { bggId: input.bggId } });
      if (!game) {
        if (!isBggSyncEnabled()) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "BGG is not set up yet" });
        }
        const bgg = await fetchBggGame(input.bggId);
        if (!bgg) throw new TRPCError({ code: "NOT_FOUND", message: `BGG game ${input.bggId} not found` });
        // A game with the same name but no BGG link gets the link instead of a duplicate
        const sameName = await ctx.prisma.game.findUnique({ where: { name: bgg.name } });
        game = sameName
          ? await ctx.prisma.game.update({
            where: { id: sameName.id },
            data: sameName.bggId === null ? { bggId: bgg.bggId, bggAverage: bgg.average, bggBayesAverage: bgg.bayesAverage, bggRank: bgg.rank, bggUsersRated: bgg.usersRated, bggWeight: bgg.weight, bggUpdatedAt: new Date() } : {}
          })
          : await createGameFromBgg(ctx.prisma, bgg);
      }
      await ctx.prisma.playerGameJunction.upsert({
        where: { gameId_playerId: { gameId: game.id, playerId: player.id } },
        create: { gameId: game.id, playerId: player.id },
        update: {}
      });
      return { game };
    })
});
