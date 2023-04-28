import { adminProcedure, createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {clerkClient} from "@clerk/nextjs/server";

export const userRouter = createTRPCRouter({
  getPlayer: privateProcedure
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

  acceptInvite: adminProcedure
    .input(
      z.object({
        groupId: z.string(),
        playerId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      //check if game group exists
      if (!await ctx.prisma.gameGroup.findUnique({
        where: {
          id: input.groupId
        }
      })) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get group: group ${input.groupId} does not exist`
        });
      }

      const player = await ctx.prisma.player.findUnique({
        where: {
          id: input.playerId
        }
      });
      if (!player) {
        throw new TRPCError(
          {
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to get player: player ${input.playerId} does not exist`
          }
        );
      }

      await ctx.prisma.playerGameGroupJunction.updateMany({
        where: {
          playerId: input.playerId
        }, data: {
          gameGroupIsActive: false
        }
      });

      return ctx.prisma.playerGameGroupJunction.update({
        where: {
          groupId_playerId: {
            groupId: input.groupId,
            playerId: input.playerId
          }
        }, data: {
          inviteStatus: "ACCEPTED",
          role: "MEMBER",
          gameGroupIsActive: true
        }
      });
    }),

  askForInvite: privateProcedure
    .input(
      z.object({
        groupId: z.string()
      })
    ).mutation(async ({ input, ctx }) => {
      //check if game group exists
      if (!await ctx.prisma.gameGroup.findUnique({
        where: {
          id: input.groupId
        }
      })) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get group: group ${input.groupId} does not exist`
        });
      }

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

      return ctx.prisma.playerGameGroupJunction.create({
        data: {
          groupId: input.groupId,
          playerId: player.id,
          inviteStatus: "PENDING",
          role: "MEMBER"
        }
      });
    }),

  getPendingPlayers: privateProcedure
    .input(
      z.object({
        gameGroup: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      //check if game group exists
      if (!await ctx.prisma.gameGroup.findUnique({
        where: {
          id: input.gameGroup
        }
      })) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get group: group ${input.gameGroup} does not exist`
        });
      }

      return ctx.prisma.playerGameGroupJunction.findMany({
        where: {
          groupId: input.gameGroup,
          inviteStatus: "PENDING"
        }, include: {
          Player: true
        }
      });
    }),

  sendInvite: adminProcedure
    .input(
        z.object({
          emailAddress: z.string(),
        })
    ).mutation(async ({ input, ctx }) => {
      const token = await ctx.getToken()

      console.log("token", token)

      const invitation = await clerkClient.invitations.createInvitation({
        emailAddress: input.emailAddress,
      })
        return invitation;
      })
});