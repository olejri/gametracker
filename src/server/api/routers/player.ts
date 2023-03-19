import { createTRPCRouter, publicProcedure } from "npm/server/api/trpc";
import { z } from "zod";
import { Player } from "npm/components/Types";

export const playerRouter = createTRPCRouter({
  addPlayer: publicProcedure
    .input(
      z.object({
        name: z.string(),
        clerkId: z.string(),
        groupId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.create({
        data: input
      });
      return {
        data: player
      };
    }),

  getPlayer: publicProcedure
    .input(
      z.object({
        clerkId: z.string()
      })
    ).query(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.findUnique({
        where: {
          clerkId: input.clerkId
        }
      });
      return {
        data: player
      };
    }),

  getPlayers: publicProcedure
    .input(
      z.object({
        groupId: z.string()
      })
    ).query(async ({ ctx, input }) => {
      const newVar = await ctx.prisma.player.findMany({
        where: {
          groupId: input.groupId
        }
      });
      return {
        data: newVar
      }
    })
});