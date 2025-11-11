import { createTRPCRouter, superAdminProcedure } from "npm/server/api/trpc";
import { z } from "zod";

export const superAdminRouter = createTRPCRouter({
  getAllPlayers: superAdminProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.player.findMany({
        include: {
          PlayerGameGroupJunction: {
            include: {
              GameGroup: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    }),

  getAllGroups: superAdminProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.gameGroup.findMany({
        include: {
          PlayerGameGroupJunction: {
            include: {
              Player: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    }),

  getAllAdmins: superAdminProcedure
    .query(async ({ ctx }) => {
      const adminJunctions = await ctx.prisma.playerGameGroupJunction.findMany({
        where: {
          role: "ADMIN",
          inviteStatus: { not: "REMOVED" }
        },
        include: {
          Player: true,
          GameGroup: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      return adminJunctions;
    }),

  toggleSuperAdmin: superAdminProcedure
    .input(
      z.object({
        playerId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.findUnique({
        where: {
          id: input.playerId
        }
      });

      if (!player) {
        throw new Error("Player not found");
      }

      return ctx.prisma.player.update({
        where: {
          id: input.playerId
        },
        data: {
          isSuperAdmin: !player.isSuperAdmin
        }
      });
    }),

  removePlayerFromGroup: superAdminProcedure
    .input(
      z.object({
        playerId: z.string(),
        groupId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.playerGameGroupJunction.delete({
        where: {
          groupId_playerId: {
            groupId: input.groupId,
            playerId: input.playerId
          }
        }
      });
    }),

  changePlayerRole: superAdminProcedure
    .input(
      z.object({
        playerId: z.string(),
        groupId: z.string(),
        newRole: z.enum(["ADMIN", "MEMBER"])
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.playerGameGroupJunction.update({
        where: {
          groupId_playerId: {
            groupId: input.groupId,
            playerId: input.playerId
          }
        },
        data: {
          role: input.newRole
        }
      });
    }),

  deleteGroup: superAdminProcedure
    .input(
      z.object({
        groupId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First delete all junctions
      await ctx.prisma.playerGameGroupJunction.deleteMany({
        where: {
          groupId: input.groupId
        }
      });

      // Then delete the group
      return ctx.prisma.gameGroup.delete({
        where: {
          id: input.groupId
        }
      });
    }),

  createGroup: superAdminProcedure
    .input(
      z.object({
        groupId: z.string(),
        groupName: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if group ID already exists
      const existingGroup = await ctx.prisma.gameGroup.findUnique({
        where: {
          id: input.groupId
        }
      });

      if (existingGroup) {
        throw new Error("A group with this ID already exists");
      }

      return ctx.prisma.gameGroup.create({
        data: {
          id: input.groupId,
          name: input.groupName
        }
      });
    }),

  addPlayerToGroup: superAdminProcedure
    .input(
      z.object({
        playerId: z.string(),
        groupId: z.string(),
        role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if player is already in the group
      const existingJunction = await ctx.prisma.playerGameGroupJunction.findUnique({
        where: {
          groupId_playerId: {
            groupId: input.groupId,
            playerId: input.playerId
          }
        }
      });

      if (existingJunction) {
        throw new Error("Player is already a member of this group");
      }

      // Check if player exists
      const player = await ctx.prisma.player.findUnique({
        where: {
          id: input.playerId
        }
      });

      if (!player) {
        throw new Error("Player not found");
      }

      // Check if group exists
      const group = await ctx.prisma.gameGroup.findUnique({
        where: {
          id: input.groupId
        }
      });

      if (!group) {
        throw new Error("Group not found");
      }

      return ctx.prisma.playerGameGroupJunction.create({
        data: {
          playerId: input.playerId,
          groupId: input.groupId,
          role: input.role,
          inviteStatus: "ACCEPTED",
          gameGroupIsActive: false
        }
      });
    })
});
