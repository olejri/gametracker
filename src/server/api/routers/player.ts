import { adminProcedure, createTRPCRouter, groupAdminProcedure, privateProcedure, publicProcedure } from "npm/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  checkIfGameGroupExists, filterUserForClient,
  getPlayerByClerkId,
  getProfileImageUrl,
} from "npm/server/helpers/filterUserForClient";
import { TRPCError } from "@trpc/server";
import { getPlayerAchievements, updatePlayerAchievements } from "npm/server/services/achievementService";

export const playerRouter = createTRPCRouter({
  addPlayer: privateProcedure
    .input(
      z.object({
        name: z.string(),
        nickname: z.string(),
        email: z.string(),
        groupId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.create({
        data: {
          name: input.name,
          nickname: input.nickname,
          email: input.email,
        }
      });
      //check if group exists
      const group = await checkIfGameGroupExists(ctx.prisma, input.groupId);
      //add to group
      await ctx.prisma.playerGameGroupJunction.create({
        data: {
          playerId: player.id,
          groupId: group.id,
          role: "MEMBER",
          gameGroupIsActive: true,
          inviteStatus: "ACCEPTED"
        }
      });
      return {
        data: player
      };
    }),

  createFakePlayer: groupAdminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        nickname: z.string().min(1, "Nickname is required"),
        email: z.string().optional(),
        groupId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      // Check if nickname is already taken
      const existingPlayer = await ctx.prisma.player.findFirst({
        where: {
          nickname: input.nickname
        }
      });

      if (existingPlayer) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nickname already taken"
        });
      }

      // Create fake player without clerkId
      const player = await ctx.prisma.player.create({
        data: {
          name: input.name,
          nickname: input.nickname,
          email: input.email || null,
          clerkId: null // Explicitly set to null - this is a fake player
        }
      });
      
      // Check if group exists
      const group = await checkIfGameGroupExists(ctx.prisma, input.groupId);
      
      // Add to group with ACCEPTED status
      await ctx.prisma.playerGameGroupJunction.create({
        data: {
          playerId: player.id,
          groupId: group.id,
          role: "MEMBER",
          gameGroupIsActive: true,
          inviteStatus: "ACCEPTED"
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
      return getPlayerByClerkId(ctx.prisma, input.clerkId);
    }),

  getPlayers: publicProcedure
    .input(
      z.object({
        groupId: z.string()
      })
    ).query(async ({ ctx, input }) => {
      const group = await ctx.prisma.gameGroup.findUnique({
        where: {
          id: input.groupId
        },
        include: {
          PlayerGameGroupJunction: {
            where: {
              inviteStatus: "ACCEPTED"
            }
          }
        }
      });

      //check if game group exists
      if (!group) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get group: group ${input.groupId} does not exist`
        });
      }

      const players = await ctx.prisma.player.findMany({
        where: {
          id : {
            in: group?.PlayerGameGroupJunction.map((junction) => junction.playerId) ?? []
          }
        }
      });
      const users = (
        await clerkClient.users.getUserList({
          userId: players.map((player) => player.clerkId ?? ""),
          limit: 100
        })
      ).map((user) => filterUserForClient(user));

      return {
        data: players.map((player) => {
          return {
            ...player,
            profileImageUrl: getProfileImageUrl(player.clerkId, users)
          };
        })
      };
    }),

  markGameAsOwned: privateProcedure
    .input(
      z.object({
        gameId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId)
      const playerGameJunction = await ctx.prisma.playerGameJunction.create({
        data: {
          gameId: input.gameId,
          playerId: player.id
        }
      });

      if (!playerGameJunction) {
        throw new TRPCError(
          {
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to mark game as owned"
          }
        );
      }
      return playerGameJunction;
    }),

  removeGameAsOwned: privateProcedure
    .input(
      z.object({
        gameId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId)
      await ctx.prisma.playerGameJunction.deleteMany({
        where: {
          gameId: input.gameId,
          playerId: player.id
        }
      });
    }),

  getLogInPlayer: privateProcedure
    .query(async ({ ctx }) => {
      return getPlayerByClerkId(ctx.prisma, ctx.userId)
    }),

  updatePlayer: privateProcedure
    .input(
      z.object({
        nickname: z.string(),
        name: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId)

      // Only check if nickname is taken if it has changed
      const nicknameChanged = input.nickname !== player.nickname;
      if (nicknameChanged) {
        const allPlayers = await ctx.prisma.player.findMany({});
        const nicknameAlreadyTaken = allPlayers.some((p) => p.nickname === input.nickname && p.id !== player.id);
        if (nicknameAlreadyTaken) throw new TRPCError(
          {
            code: "BAD_REQUEST",
            message: "Nickname already taken"
          });
      }

      // Build update data with only changed fields
      const updateData: { nickname?: string; name?: string } = {};
      if (nicknameChanged) {
        updateData.nickname = input.nickname;
      }
      if (input.name !== player.name) {
        updateData.name = input.name;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        return player;
      }

      return await ctx.prisma.player.update({
        where: {
          id: player.id
        },
        data: updateData
      });
    }),

  updateNickname: privateProcedure
    .input(
      z.object({
        playerId: z.string(),
        nickname: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if nickname is already taken by another player
      const existingPlayer = await ctx.prisma.player.findFirst({
        where: {
          nickname: input.nickname,
          id: { not: input.playerId }
        }
      });

      if (existingPlayer) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nickname already taken"
        });
      }

      return await ctx.prisma.player.update({
        where: {
          id: input.playerId
        },
        data: {
          nickname: input.nickname
        }
      });
    }),

  updatePlayerAdmin: adminProcedure
    .input(
      z.object({
        nickname: z.string(),
        name: z.string(),
        email: z.string(),
        clerkId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, input.clerkId)
      return await ctx.prisma.player.update({
        where: {
          id: player.id
        },
        data: {
          nickname: input.nickname,
          name: input.name,
          email: input.email
        }
      });
    }),

  addNewPlayer: adminProcedure
    .input(
      z.object({
        name: z.string(),
        nickname: z.string(),
        email: z.string()
      })
    ).query(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.create({
        data: {
          name: input.name,
          nickname: input.nickname,
          email: input.email,
        }
      });
      return {
        data: player
      };
    }),

  calculateAchievements: privateProcedure
    .input(
      z.object({
        gameGroup: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      await checkIfGameGroupExists(ctx.prisma, input.gameGroup);
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);
      
      await updatePlayerAchievements(ctx.prisma, player.id, input.gameGroup);
      
      return await getPlayerAchievements(ctx.prisma, player.id, input.gameGroup);
    }),

  updateAchievementsAfterSession: privateProcedure
    .input(
      z.object({
        groupId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkIfGameGroupExists(ctx.prisma, input.groupId);
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);
      
      const newlyUnlocked = await updatePlayerAchievements(ctx.prisma, player.id, input.groupId);
      
      return { newlyUnlocked };
    })
});