import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "npm/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const turnTimerRouter = createTRPCRouter({
  // Initialize turn-based timer for a session
  initializeTurnTimer: privateProcedure
    .input(
      z.object({
        sessionId: z.string(),
        defaultPlayerTimeMs: z.number().min(60000), // At least 1 minute
        playerIds: z.array(z.string()).min(2), // At least 2 players
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify session exists
      const session = await ctx.prisma.gameSession.findUnique({
        where: { id: input.sessionId },
        include: { PlayerGameSessionJunction: true }
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found"
        });
      }

      // Update session with turn timer settings
      const updatedSession = await ctx.prisma.gameSession.update({
        where: { id: input.sessionId },
        data: {
          turnBasedTimerEnabled: true,
          defaultPlayerTimeMs: input.defaultPlayerTimeMs,
          currentTurnPlayerId: input.playerIds[0], // Start with first player
          turnStartedAt: new Date()
        }
      });

      // Initialize remaining time for all players
      for (const playerId of input.playerIds) {
        const junction = session.PlayerGameSessionJunction.find(
          (j) => j.playerId === playerId
        );
        
        if (junction) {
          await ctx.prisma.playerGameSessionJunction.update({
            where: { id: junction.id },
            data: { remainingTimeMs: input.defaultPlayerTimeMs }
          });
        }
      }

      return {
        sessionId: updatedSession.id,
        currentTurnPlayerId: updatedSession.currentTurnPlayerId,
        turnStartedAt: updatedSession.turnStartedAt,
        defaultPlayerTimeMs: updatedSession.defaultPlayerTimeMs
      };
    }),

  // Get current timer state for a session
  getTimerState: publicProcedure
    .input(
      z.object({
        sessionId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const session = await ctx.prisma.gameSession.findUnique({
        where: { id: input.sessionId },
        include: {
          PlayerGameSessionJunction: {
            include: {
              player: true
            }
          }
        }
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found"
        });
      }

      return {
        turnBasedTimerEnabled: session.turnBasedTimerEnabled,
        currentTurnPlayerId: session.currentTurnPlayerId,
        turnStartedAt: session.turnStartedAt,
        defaultPlayerTimeMs: session.defaultPlayerTimeMs,
        players: session.PlayerGameSessionJunction.map((junction) => ({
          playerId: junction.playerId,
          playerName: junction.player.nickname ?? junction.player.name,
          remainingTimeMs: junction.remainingTimeMs ?? session.defaultPlayerTimeMs ?? 0,
          junctionId: junction.id
        }))
      };
    }),

  // Update player's remaining time after their turn
  updatePlayerTime: privateProcedure
    .input(
      z.object({
        junctionId: z.string(),
        remainingTimeMs: z.number().min(0)
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.playerGameSessionJunction.update({
        where: { id: input.junctionId },
        data: { remainingTimeMs: input.remainingTimeMs }
      });

      return { success: true };
    }),

  // Pass turn to next player
  passTurn: privateProcedure
    .input(
      z.object({
        sessionId: z.string(),
        currentPlayerId: z.string(),
        nextPlayerId: z.string(),
        timeUsedMs: z.number().min(0)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.gameSession.findUnique({
        where: { id: input.sessionId },
        include: {
          PlayerGameSessionJunction: true
        }
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found"
        });
      }

      // Find current player's junction to update their time
      const currentPlayerJunction = session.PlayerGameSessionJunction.find(
        (j) => j.playerId === input.currentPlayerId
      );

      if (!currentPlayerJunction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Current player not found in session"
        });
      }

      const currentRemainingTime = currentPlayerJunction.remainingTimeMs ?? session.defaultPlayerTimeMs ?? 0;
      const newRemainingTime = Math.max(0, currentRemainingTime - input.timeUsedMs);

      // Update current player's remaining time
      await ctx.prisma.playerGameSessionJunction.update({
        where: { id: currentPlayerJunction.id },
        data: { remainingTimeMs: newRemainingTime }
      });

      // Update session to reflect new current turn player
      await ctx.prisma.gameSession.update({
        where: { id: input.sessionId },
        data: {
          currentTurnPlayerId: input.nextPlayerId,
          turnStartedAt: new Date()
        }
      });

      return {
        success: true,
        newRemainingTime,
        nextPlayerId: input.nextPlayerId
      };
    }),

  // Disable turn timer for a session
  disableTurnTimer: privateProcedure
    .input(
      z.object({
        sessionId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.gameSession.update({
        where: { id: input.sessionId },
        data: {
          turnBasedTimerEnabled: false,
          currentTurnPlayerId: null,
          turnStartedAt: null
        }
      });

      return { success: true };
    })
});
