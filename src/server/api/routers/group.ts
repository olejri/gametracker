import { createTRPCRouter, privateProcedure, publicProcedure } from "npm/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { filterUserForClient } from "npm/server/helpers/filterUserForClient";

export const groupRouter = createTRPCRouter({
  addOrGetGroup: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.gameGroup.upsert({
        where: {
          id: input.id
        },
        create: {
          id: input.id
        }, update: {
          id: input.id
        }
      });
      return { data: group };
    }),

  getActiveGameGroup: privateProcedure
    .query(async ({ ctx }) => {
      let player = await ctx.prisma.player.findUnique({
        where: {
          clerkId: ctx.userId
        }
      });

      //add player
      if (!player) {
        const user = (
          await clerkClient.users.getUserList({
            userId: [ctx.userId],
            limit: 100
          })
        ).map((user) => filterUserForClient(user));

        player = await ctx.prisma.player.create({
          data: {
            clerkId: ctx.userId,
            name: user[0]?.username ?? "Unknown"
          }
        });
      }

      const group = await ctx.prisma.playerGameGroupJunction.findFirst({
        where: {
          playerId: player.id,
          gameGroupIsActive: true
        }
      });

      if (group === null) {
        return null;
      }
      return {
        "groupId": group.groupId,
        "role": group.role
      };
    }),

  isUserActiveInGroup: privateProcedure
    .input(
      z.object({
        groupId: z.string()
      })
    ).query(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.findUnique({
        where: {
          clerkId: ctx.userId
        }
      });

      if (!player) {
        throw new TRPCError(
          {
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to get player: player ${ctx.userId} does not exist`
          }
        );
      }
      const group = await ctx.prisma.playerGameGroupJunction.findFirst({
        where: {
          playerId: player.id,
          gameGroupIsActive: true
        }
      });

      if (group === null || (group?.groupId !== input.groupId)) {
        return null;
      }
      return {
        "groupId": group.groupId,
        "role": group.role
      };
    }),

  getAllGameGroups: privateProcedure
    .query(async ({ ctx }) => {
      const res = await ctx.prisma.gameGroup.findMany(
        {
          include: {
            PlayerGameGroupJunction: true
          }
        }
      );

      return res.map((group) => {
        return {
          "name": group.name,
          "id": group.id,
          players: group.PlayerGameGroupJunction.map((player) => {
            return player.playerId;
          })
        };
      });
    }),


  getAllPendingGameGroups: privateProcedure
    .query(async ({ ctx }) => {
      const player = await ctx.prisma.player.findUnique({
        where: {
          clerkId: ctx.userId
        }
      });

      if (!player) {
        throw new TRPCError(
          {
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to get player: player ${ctx.userId} does not exist`
          }
        );
      }

      return await ctx.prisma.playerGameGroupJunction.findMany(
        {
          where: {
            playerId: player.id,
            inviteStatus: "PENDING"
          }
        });

    }),


});