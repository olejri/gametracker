import { createTRPCRouter, privateProcedure, publicProcedure } from "npm/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server"
import { z } from "zod";
import { filterUserForClient } from "npm/server/api/helpers/filterUserForClient";

export const playerRouter = createTRPCRouter({
  addPlayer: privateProcedure
    .input(
      z.object({
        name: z.string(),
        groupId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.upsert({
        where: {
          clerkId: ctx.userId
        },
        create: {
          name: input.name,
          clerkId: ctx.userId,
          groupId: input.groupId
        },
        update: {
          name: input.name,
          groupId: input.groupId
        }
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
      const players = await ctx.prisma.player.findMany({
        where: {
          groupId: input.groupId
        }
      });
      const users = (
        await clerkClient.users.getUserList({
        userId: players.map((player) => player.clerkId),
        limit: 100
      })
      ).map((user) => filterUserForClient(user));

      return {
        data: players.map((player) => {
          const user = users.find((user) => user.id === player.clerkId);
          return {
            ...player,
            profileImageUrl: user?.profileImageUrl ?? ""
          };
        })
      };
    })
});