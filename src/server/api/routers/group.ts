import { adminProcedure, createTRPCRouter, privateProcedure, publicProcedure } from "npm/server/api/trpc";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { filterUserForClient, getPlayerByClerkId } from "npm/server/helpers/filterUserForClient";
import { type GameOwedByPlayers } from "npm/components/Types";

export const groupRouter = createTRPCRouter({
  addOrGetGroup: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.gameGroup.upsert({
        where: { id: input.id },
        create: { id: input.id },
        update: { id: input.id }
      });
      return { data: group };
    }),

  getActiveGameGroup: privateProcedure.query(async ({ ctx }) => {
    const clerkUser = await clerkClient.users.getUser(ctx.userId);
    let player = await ctx.prisma.player.findUnique({
      where: { clerkId: ctx.userId }
    });

    if (!player) {
      player = await ctx.prisma.player.findUnique({
        where: { email: clerkUser.primaryEmailAddressId ?? "" }
      });

      if (player) {
        await ctx.prisma.player.update({
          where: { id: player.id },
          data: { clerkId: ctx.userId }
        });
      }
    }

    if (!player) {
      const user = filterUserForClient(clerkUser);
      player = await ctx.prisma.player.create({
        data: {
          clerkId: ctx.userId,
          name: user.username ?? "New Player"
        }
      });
    }

    const group = await ctx.prisma.playerGameGroupJunction.findFirst({
      where: { playerId: player.id, gameGroupIsActive: true }
    });

    if (!group) return null;

    return {
      groupId: group.groupId,
      role: group.role
    };
  }),

  isUserActiveInGroup: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);
      const group = await ctx.prisma.playerGameGroupJunction.findFirst({
        where: { playerId: player.id, gameGroupIsActive: true }
      });

      if (!group || group.groupId !== input.groupId) {
        return null;
      }

      return {
        groupId: group.groupId,
        role: group.role
      };
    }),

  getAllGameGroups: privateProcedure.query(async ({ ctx }) => {
    const res = await ctx.prisma.gameGroup.findMany({
      include: { PlayerGameGroupJunction: true }
    });

    return res.map((group) => ({
      hidden: group.hidden,
      name: group.name,
      id: group.id,
      players: group.PlayerGameGroupJunction.map((player) => player.playerId)
    }));
  }),

  getGameGroupsWithStatus: privateProcedure.query(async ({ ctx: { prisma, userId } }) => {
    const player = await getPlayerByClerkId(prisma, userId);
    return await prisma.playerGameGroupJunction.findMany({
      where: { playerId: player.id },
      include: { GameGroup: true },
      orderBy: { gameGroupIsActive: "desc" }
    });
  }),

  switchActiveGameGroup: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx: { prisma, userId }, input }) => {
      const player = await getPlayerByClerkId(prisma, userId);

      // Set all groups to inactive
      await prisma.playerGameGroupJunction.updateMany({
        where: { playerId: player.id },
        data: { gameGroupIsActive: false }
      });

      // Set the chosen group to active
      const updated = await prisma.playerGameGroupJunction.update({
        where: {
          groupId_playerId: {
            playerId: player.id,
            groupId: input.groupId
          }
        },
        data: { gameGroupIsActive: true }
      });

      // ✅ Only return what the client expects
      return { groupId: updated.groupId };
    }),

  getAllPendingGameGroups: privateProcedure.query(async ({ ctx }) => {
    const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);
    return await ctx.prisma.playerGameGroupJunction.findMany({
      where: { playerId: player.id, inviteStatus: "PENDING" }
    });
  }),

  getAllGamesOwnedByTheGroup: privateProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const playersFromDb = await ctx.prisma.playerGameGroupJunction.findMany({
        where: { groupId: input.groupId },
        include: { Player: true }
      });

      const players = playersFromDb.map((p) => p.Player);
      const games = await ctx.prisma.game.findMany({
        where: {
          PlayerGameJunction: {
            some: { playerId: { in: playersFromDb.map((p) => p.playerId) } }
          }
        },
        include: { PlayerGameJunction: true }
      });

      const result: GameOwedByPlayers[] = games.map((game) => {
        const ownedPlayers = players.filter((p) =>
          game.PlayerGameJunction.some((j) => j.playerId === p.id)
        );
        return {
          gameName: game.name,
          ownedByPlayers: ownedPlayers.map((p) => p.nickname ?? p.name ?? "Unknown")
        };
      });

      result.sort((a, b) => a.gameName.localeCompare(b.gameName));
      return result;
    }),

  getAllPlayersInGroup: adminProcedure
    .input(z.object({ gameGroup: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.playerGameGroupJunction.findMany({
        where: { groupId: input.gameGroup },
        include: { Player: true }
      });
    })
});
