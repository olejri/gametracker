import { adminProcedure, createTRPCRouter, groupAdminProcedure, privateProcedure } from "npm/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as process from "process";
import { type ClerkInvite } from "npm/components/Types";
import { checkIfGameGroupExists, getPlayerByClerkId, getPlayerById } from "npm/server/helpers/filterUserForClient";
import { clerkClient } from "@clerk/nextjs/server";

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

  acceptInvite: groupAdminProcedure
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
      const pendingPlayers = await ctx.prisma.playerGameGroupJunction.findMany({
        where: {
          groupId: input.gameGroup,
          inviteStatus: "PENDING"
        }, include: {
          Player: true
        }
      });

      // Enrich with Clerk email if available
      const enrichedPlayers = await Promise.all(
        pendingPlayers.map(async (junction) => {
          let clerkEmail = junction.Player.email;
          
          // If player has clerkId but no email, try to fetch from Clerk
          if (junction.Player.clerkId && !clerkEmail) {
            try {
              const clerkUser = await clerkClient.users.getUser(junction.Player.clerkId);
              const primaryEmail = clerkUser.emailAddresses.find(
                e => e.id === clerkUser.primaryEmailAddressId
              );
              clerkEmail = primaryEmail?.emailAddress ?? null;
            } catch (error) {
              // If we can't fetch from Clerk, just use what we have
              console.error("Failed to fetch Clerk user email:", error);
            }
          }

          return {
            ...junction,
            Player: {
              ...junction.Player,
              email: clerkEmail
            }
          };
        })
      );

      return enrichedPlayers;
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
    }),

  promoteToAdmin: groupAdminProcedure
    .input(
      z.object({
        groupId: z.string(),
        playerId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      await checkIfGameGroupExists(ctx.prisma, input.groupId);
      const player = await getPlayerById(ctx.prisma, input.playerId);

      // Check if player is already in the group
      const existingJunction = await ctx.prisma.playerGameGroupJunction.findUnique({
        where: {
          groupId_playerId: {
            groupId: input.groupId,
            playerId: player.id
          }
        }
      });

      if (!existingJunction) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Player is not a member of this group"
        });
      }

      if (existingJunction.role === "ADMIN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Player is already an admin"
        });
      }

      return ctx.prisma.playerGameGroupJunction.update({
        where: {
          groupId_playerId: {
            groupId: input.groupId,
            playerId: player.id
          }
        },
        data: {
          role: "ADMIN"
        }
      });
    }),

  removeUserFromGroup: groupAdminProcedure
    .input(
      z.object({
        groupId: z.string(),
        playerId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      await checkIfGameGroupExists(ctx.prisma, input.groupId);
      const player = await getPlayerById(ctx.prisma, input.playerId);
      const currentUser = await getPlayerByClerkId(ctx.prisma, ctx.userId);

      // Prevent admin from removing themselves
      if (player.id === currentUser.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot remove yourself from the group"
        });
      }

      // Check if player is in the group
      const existingJunction = await ctx.prisma.playerGameGroupJunction.findUnique({
        where: {
          groupId_playerId: {
            groupId: input.groupId,
            playerId: player.id
          }
        }
      });

      if (!existingJunction) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Player is not a member of this group"
        });
      }

      // Update player nickname to "Removed" and mark as inactive
      // This preserves game history while indicating the player is no longer active
      await ctx.prisma.player.update({
        where: { id: player.id },
        data: { nickname: "Removed" }
      });

      // Set player as inactive in the group
      return ctx.prisma.playerGameGroupJunction.update({
        where: {
          groupId_playerId: {
            groupId: input.groupId,
            playerId: player.id
          }
        },
        data: {
          inviteStatus: "REMOVED",
          gameGroupIsActive: false
        }
      });
    }),

  declineInvite: groupAdminProcedure
    .input(
      z.object({
        groupId: z.string(),
        playerId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      await checkIfGameGroupExists(ctx.prisma, input.groupId);
      const player = await getPlayerById(ctx.prisma, input.playerId);

      // Check if player has a pending invite
      const existingJunction = await ctx.prisma.playerGameGroupJunction.findUnique({
        where: {
          groupId_playerId: {
            groupId: input.groupId,
            playerId: player.id
          }
        }
      });

      if (!existingJunction) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No invite found for this player"
        });
      }

      if (existingJunction.inviteStatus !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invite is not pending"
        });
      }

      // Delete the pending invitation
      return ctx.prisma.playerGameGroupJunction.delete({
        where: {
          groupId_playerId: {
            groupId: input.groupId,
            playerId: player.id
          }
        }
      });
    })
});