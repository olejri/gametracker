import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "npm/server/api/trpc";

export const sessionRouter = createTRPCRouter({
  startNewSession: publicProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string(),
          description: z.string(),
          image_url: z.string(),
          players: z.string(),
          playtime: z.string(),
          mechanics: z.string(),
          categories: z.string()
        })
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const game = await ctx.prisma.game.create({
          data: input.data
        });
        return { game };
      } catch (err) {
        const err1 = err as Error;
        throw new Error(`Failed to create game: ${err1.message}`);
      }
    }),

  getAllFinishSession: publicProcedure
    .query(async ({ ctx }) => {
        try {
          const games = await ctx.prisma.game.findMany();
          return { games };
        } catch (err) {
          const err1 = err as Error;
          throw new Error(`Failed to get games: ${err1.message}`);
        }
      }
    ),

  addACompletedSession: publicProcedure
    .input(
      z.object({
        data: z.object({
          players: z.array(z.object({
            playerId: z.string(),
            position: z.number(),
            score: z.string()
          })),
          gameName: z.string(),
          groupId: z.string(),
          status: z.string(),
          createdAt: z.date(),
          updatedAt: z.date()
        })
      })
    ).mutation(async ({ ctx, input }) => {
      try {
        const foundGame = await ctx.prisma.game.findUnique({
          where: {
            name: input.data.gameName
          }
        });

        if (foundGame === null) {
          throw new Error(`Game ${input.data.gameName} does not exist`);
        }

        const foundGroup = await ctx.prisma.gameGroup.findUnique({
          where: {
            id: input.data.groupId
          }
        });

        if (foundGroup === null) {
          throw new Error(`GameGroup ${input.data.groupId} does not exist`);
        }

        for (const player of input.data.players) {
          const foundPlayer = await ctx.prisma.player.findUnique({
            where: {
              id: player.playerId
            }
          });

          if (foundPlayer === null) {
            throw new Error(`Player ${player.playerId} does not exist`);
          }
        }

        const session = await ctx.prisma.gameSession.create({
          data: {
            gameId: foundGame.id,
            groupId: input.data.groupId,
            status: input.data.status,
            createdAt: input.data.createdAt,
            updatedAt: input.data.updatedAt,

          }
        });

        for (const player of input.data.players) {
          const foundPlayer = await ctx.prisma.player.findUnique({
            where: {
              id: player.playerId
            }
          });

          if (foundPlayer === null) {
            throw new Error(`Player ${player.playerId} does not exist`);
          }

          await ctx.prisma.playerGameSessionJunction.create({
            data: {
              playerId: foundPlayer.id,
              gameSessionId: session.id,
              position: player.position,
              score: player.score
            }
          });
        }
        return { session };
      } catch (err) {
        const err1 = err as Error;
        throw new Error(`Failed to create session: ${err1.message}`);
      }
    } )
});