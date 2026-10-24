import { z } from "zod";
import { type Prisma, type PrismaClient } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { getGroupMembership } from "npm/server/helpers/sessionPhotos";
import { BOT_AVATAR_URL } from "npm/server/helpers/filterUserForClient";
import { notifyTimerUpdate } from "npm/server/pusher";
import {
  applyTimerAction,
  DEFAULT_TIMER_MS,
  MAX_TIMER_MS,
  type TimerAction,
  type TimerCore,
  toTimerStatus
} from "npm/lib/gameTimer";

// Avatars rarely change and the timer page polls, so keep Clerk lookups out of every request
const AVATAR_CACHE_MS = 10 * 60 * 1000;
const avatarCache = new Map<string, { url: string; fetchedAt: number }>();

async function getAvatarUrls(clerkIds: string[]) {
  const now = Date.now();
  const missing = clerkIds.filter((id) => {
    const cached = avatarCache.get(id);
    return !cached || now - cached.fetchedAt > AVATAR_CACHE_MS;
  });
  if (missing.length > 0) {
    try {
      const users = await clerkClient.users.getUserList({ userId: missing, limit: 100 });
      missing.forEach((id) => {
        const user = users.find((u) => u.id === id);
        avatarCache.set(id, { url: user?.imageUrl ?? BOT_AVATAR_URL, fetchedAt: now });
      });
    } catch (error) {
      console.error("Failed to load avatars for game timer", error);
    }
  }
  return (clerkId: string | null) => (clerkId ? avatarCache.get(clerkId)?.url ?? BOT_AVATAR_URL : BOT_AVATAR_URL);
}

async function getPlayerInfo(prisma: PrismaClient, playerIds: string[]) {
  const players = await prisma.player.findMany({ where: { id: { in: playerIds } } });
  const avatarFor = await getAvatarUrls(players.flatMap((player) => (player.clerkId ? [player.clerkId] : [])));
  return new Map(
    players.map((player) => [
      player.id,
      { name: player.nickname ?? player.name, profileImageUrl: avatarFor(player.clerkId) }
    ])
  );
}

// Loads the session and makes sure the user is a member of its group
async function getSessionForMember(prisma: PrismaClient, userId: string, sessionId: string) {
  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw new TRPCError({ code: "NOT_FOUND", message: `Session ${sessionId} does not exist` });
  }
  const membership = await getGroupMembership(prisma, userId, session.groupId);
  if (!membership) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this game group" });
  }
  return session;
}

async function getTimerForMember(prisma: PrismaClient, userId: string, timerId: string) {
  const timer = await prisma.gameTimer.findUnique({
    where: { id: timerId },
    include: { players: true }
  });
  if (!timer) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Timer does not exist" });
  }
  await getSessionForMember(prisma, userId, timer.gameSessionId);
  return timer;
}

type TimerRow = NonNullable<Awaited<ReturnType<typeof getTimerForMember>>>;

const toCore = (timer: TimerRow): TimerCore => ({
  status: toTimerStatus(timer.status) ?? "setup",
  activePlayerId: timer.activePlayerId,
  turnStartedAt: timer.turnStartedAt,
  pausedFrom: toTimerStatus(timer.pausedFrom),
  adminMs: timer.adminMs,
  totalMs: timer.totalMs,
  startedAt: timer.startedAt,
  finishedAt: timer.finishedAt,
  version: timer.version,
  players: timer.players.map((player) => ({
    playerId: player.playerId,
    seatOrder: player.seatOrder,
    startMs: player.startMs,
    remainingMs: player.remainingMs
  }))
});

// Full timer state for the client. serverNow lets clients correct for clock skew.
async function loadTimerState(prisma: PrismaClient, gameSessionId: string) {
  const timer = await prisma.gameTimer.findUnique({
    where: { gameSessionId },
    include: { players: { orderBy: { seatOrder: "asc" } } }
  });
  if (!timer) {
    return { timer: null, serverNow: new Date() };
  }
  const info = await getPlayerInfo(prisma, timer.players.map((player) => player.playerId));
  const core = toCore(timer);
  return {
    timer: {
      ...core,
      id: timer.id,
      gameSessionId: timer.gameSessionId,
      players: core.players.map((player) => ({
        ...player,
        name: info.get(player.playerId)?.name ?? "",
        profileImageUrl: info.get(player.playerId)?.profileImageUrl ?? BOT_AVATAR_URL
      }))
    },
    serverNow: new Date()
  };
}

export type TimerState = Awaited<ReturnType<typeof loadTimerState>>;

/**
 * Applies an action if the client saw the latest version. A stale or
 * inapplicable action changes nothing and returns the current state, so two
 * phones tapping at once can never switch twice.
 */
async function runTimerAction(
  prisma: PrismaClient,
  userId: string,
  timerId: string,
  expectedVersion: number,
  action: TimerAction
) {
  const timer = await getTimerForMember(prisma, userId, timerId);
  const current = toCore(timer);
  const result = current.version === expectedVersion ? applyTimerAction(current, action, new Date()) : null;

  let applied = false;
  if (result) {
    const { state, segment } = result;
    applied = await prisma.$transaction(async (tx) => {
      if (!(await claimVersion(tx, timerId, expectedVersion, state.version))) return false;
      await tx.gameTimer.update({
        where: { id: timerId },
        data: {
          status: state.status,
          activePlayerId: state.activePlayerId,
          turnStartedAt: state.turnStartedAt,
          pausedFrom: state.pausedFrom,
          adminMs: state.adminMs,
          totalMs: state.totalMs,
          finishedAt: state.finishedAt
        }
      });

      for (const player of state.players) {
        const before = current.players.find((p) => p.playerId === player.playerId);
        if (before && before.remainingMs !== player.remainingMs) {
          await tx.gameTimerPlayer.update({
            where: { timerId_playerId: { timerId, playerId: player.playerId } },
            data: { remainingMs: player.remainingMs }
          });
        }
      }
      if (segment) {
        await tx.gameTimerTurn.create({ data: { timerId, ...segment } });
      }
      return true;
    });
    if (applied) {
      await notifyTimerUpdate(timerId, state.version);
    }
  }

  return { ...(await loadTimerState(prisma, timer.gameSessionId)), applied };
}

/**
 * Moves the timer from one version to the next, or returns false when another
 * request got there first. One conditional UPDATE locks the row, so of two
 * simultaneous requests for the same version only one succeeds. (Prisma's
 * updateMany reads matching ids before updating, which is not safe for this.)
 */
async function claimVersion(tx: Prisma.TransactionClient, timerId: string, expectedVersion: number, nextVersion: number) {
  const affected = await tx.$executeRaw`UPDATE GameTimer SET version = ${nextVersion} WHERE id = ${timerId} AND version = ${expectedVersion}`;
  return affected === 1;
}

const actionInput = z.object({
  timerId: z.string().min(1),
  expectedVersion: z.number().int()
});

export const timerRouter = createTRPCRouter({
  getBySessionId: privateProcedure
    .input(z.object({ sessionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await getSessionForMember(ctx.prisma, ctx.userId, input.sessionId);
      return loadTimerState(ctx.prisma, input.sessionId);
    }),

  // Players and pots for the setup screen
  getDefaults: privateProcedure
    .input(z.object({ sessionId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionForMember(ctx.prisma, ctx.userId, input.sessionId);
      const junctions = await ctx.prisma.playerGameSessionJunction.findMany({
        where: { gameSessionId: session.id },
        include: { player: true }
      });
      const info = await getPlayerInfo(ctx.prisma, junctions.map((junction) => junction.playerId));

      // Seats rolled for this session are stored by player name
      const seatLog = await ctx.prisma.gameSessionRandomizationLog.findFirst({
        where: { gameSessionId: session.id, type: "seat_order" },
        orderBy: { createdAt: "desc" }
      });
      const seatsByName = (seatLog?.data ?? null) as Record<string, number> | null;

      // The most recent timer this group used for the same game
      const previous = await ctx.prisma.gameTimer.findFirst({
        where: {
          gameSessionId: { not: session.id },
          startedAt: { not: null },
          gameSession: { groupId: session.groupId, gameId: session.gameId }
        },
        orderBy: { startedAt: "desc" },
        include: { players: true }
      });

      // The pot most players had last time, used for "time for everyone" and newcomers
      const potCounts = new Map<number, number>();
      previous?.players.forEach((player) => potCounts.set(player.startMs, (potCounts.get(player.startMs) ?? 0) + 1));
      const defaultMs = [...potCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? DEFAULT_TIMER_MS;

      const players = junctions.map((junction, index) => {
        const previousPlayer = previous?.players.find((player) => player.playerId === junction.playerId);
        const rolledSeat = seatsByName?.[junction.player.nickname ?? junction.player.name];
        return {
          playerId: junction.playerId,
          name: info.get(junction.playerId)?.name ?? "",
          profileImageUrl: info.get(junction.playerId)?.profileImageUrl ?? BOT_AVATAR_URL,
          startMs: previousPlayer?.startMs ?? defaultMs,
          // Rolled seats win, then last time's order, then the order players were added
          sortKey: typeof rolledSeat === "number"
            ? rolledSeat
            : seatsByName
              ? 1000 + index
              : previousPlayer
                ? previousPlayer.seatOrder
                : 1000 + index
        };
      });

      return {
        defaultMs,
        fromPreviousTimer: !!previous,
        fromSeatRoll: !!seatsByName,
        players: players
          .sort((a, b) => a.sortKey - b.sortKey)
          .map((player, seatOrder) => ({
            playerId: player.playerId,
            name: player.name,
            profileImageUrl: player.profileImageUrl,
            startMs: player.startMs,
            seatOrder
          }))
      };
    }),

  saveSetupAndStart: privateProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        players: z
          .array(
            z.object({
              playerId: z.string().min(1),
              seatOrder: z.number().int(),
              startMs: z.number().int().min(1000).max(MAX_TIMER_MS)
            })
          )
          .min(1)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getSessionForMember(ctx.prisma, ctx.userId, input.sessionId);
      const junctions = await ctx.prisma.playerGameSessionJunction.findMany({
        where: { gameSessionId: session.id }
      });
      const sessionPlayerIds = new Set(junctions.map((junction) => junction.playerId));
      const uniqueIds = new Set(input.players.map((player) => player.playerId));
      if (uniqueIds.size !== input.players.length || input.players.some((p) => !sessionPlayerIds.has(p.playerId))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Timer players must be the players in this session" });
      }

      const seated = [...input.players]
        .sort((a, b) => a.seatOrder - b.seatOrder)
        .map((player, seatOrder) => ({
          playerId: player.playerId,
          seatOrder,
          startMs: player.startMs,
          remainingMs: player.startMs
        }));
      const now = new Date();
      const startData = {
        status: "running",
        activePlayerId: seated[0]?.playerId ?? null,
        turnStartedAt: now,
        startedAt: now,
        pausedFrom: null,
        adminMs: 0,
        totalMs: null,
        finishedAt: null
      };

      const existing = await ctx.prisma.gameTimer.findUnique({ where: { gameSessionId: session.id } });
      let timerId: string | null = null;
      if (existing) {
        // Someone else already started it; show them the running timer
        if (existing.status === "setup") {
          const updated = await ctx.prisma.$transaction(async (tx) => {
            if (!(await claimVersion(tx, existing.id, existing.version, existing.version + 1))) return false;
            await tx.gameTimer.update({ where: { id: existing.id }, data: startData });
            await tx.gameTimerPlayer.deleteMany({ where: { timerId: existing.id } });
            await tx.gameTimerPlayer.createMany({
              data: seated.map((player) => ({ ...player, timerId: existing.id }))
            });
            return true;
          });
          if (updated) timerId = existing.id;
        }
      } else {
        try {
          const created = await ctx.prisma.gameTimer.create({
            data: {
              ...startData,
              gameSessionId: session.id,
              version: 1,
              players: { create: seated }
            }
          });
          timerId = created.id;
        } catch (error) {
          // Two phones pressed Start at once; the unique session id lets only one win
          if ((error as { code?: string }).code !== "P2002") throw error;
        }
      }

      if (timerId) {
        await notifyTimerUpdate(timerId, existing ? existing.version + 1 : 1);
      }
      return { ...(await loadTimerState(ctx.prisma, session.id)), applied: !!timerId };
    }),

  switchTo: privateProcedure
    .input(actionInput.extend({ playerId: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      runTimerAction(ctx.prisma, ctx.userId, input.timerId, input.expectedVersion, {
        type: "switchTo",
        playerId: input.playerId
      })
    ),

  next: privateProcedure
    .input(actionInput)
    .mutation(({ ctx, input }) =>
      runTimerAction(ctx.prisma, ctx.userId, input.timerId, input.expectedVersion, { type: "next" })
    ),

  toggleAdmin: privateProcedure
    .input(actionInput)
    .mutation(({ ctx, input }) =>
      runTimerAction(ctx.prisma, ctx.userId, input.timerId, input.expectedVersion, { type: "toggleAdmin" })
    ),

  pause: privateProcedure
    .input(actionInput)
    .mutation(({ ctx, input }) =>
      runTimerAction(ctx.prisma, ctx.userId, input.timerId, input.expectedVersion, { type: "pause" })
    ),

  resume: privateProcedure
    .input(actionInput)
    .mutation(({ ctx, input }) =>
      runTimerAction(ctx.prisma, ctx.userId, input.timerId, input.expectedVersion, { type: "resume" })
    ),

  finish: privateProcedure
    .input(actionInput)
    .mutation(({ ctx, input }) =>
      runTimerAction(ctx.prisma, ctx.userId, input.timerId, input.expectedVersion, { type: "finish" })
    )
});
