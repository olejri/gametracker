import { adminProcedure, createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as process from "process";
import { type ClerkInvite } from "npm/components/Types";
import { checkIfGameGroupExists, getPlayerByClerkId, getPlayerById } from "npm/server/helpers/filterUserForClient";

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
      await checkIfGameGroupExists(ctx.prisma, input.groupId);
      const player = await getPlayerById(ctx.prisma, input.playerId);

      await ctx.prisma.playerGameGroupJunction.updateMany({
        where: {
          playerId: player.id
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
      await checkIfGameGroupExists(ctx.prisma, input.groupId);
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId)

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
      await checkIfGameGroupExists(ctx.prisma, input.gameGroup);
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
    ).mutation(async ({ input }) => {
      const apiKey = process.env.CLERK_SECRET_KEY;
      const apiUrl = 'https://api.clerk.dev/v1/invitations';

      const requestData = {
        email_address: input.emailAddress,
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey ?? ""}`,
        },
        body: JSON.stringify(requestData),
      })

      //check if status code is 422, if so, throw error
      if (res.status === 422) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `This email address has already been invited.`
        });
      }
      //if response is not ok, throw error
      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send invite: ${res.statusText}`
        });
      }
      //return tRPC success
      return {
        data: true
      }
    }),

  getPendingEmailInvites: adminProcedure
    .query(async () => {
      const apiKey = process.env.CLERK_SECRET_KEY;
      const apiUrl = 'https://api.clerk.dev/v1/invitations';

      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey ?? ""}`,
        },
      })

      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get pending invites: ${res.statusText}`
        });
      }
      const result = await res.json() as ClerkInvite[];
      //only pending
      return {
        data: result.filter((invite) => invite.status === "pending")
      };
    })
});