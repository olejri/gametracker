import { adminProcedure, createTRPCRouter, privateProcedure, publicProcedure } from "npm/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  checkIfGameGroupExists,
  filterUserForClient,
  getPlayerByClerkId,
} from "npm/server/helpers/filterUserForClient";
import { TRPCError } from "@trpc/server";
import type { Game } from "npm/components/Types";
import { getAchievements } from "npm/server/helpers/achievementHelper";

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
          PlayerGameGroupJunction: true
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
          const user = users.find((user) => user.id === player.clerkId);
          return {
            ...player,
            profileImageUrl: user?.profileImageUrl ?? ""
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
        nickname: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId)

      //check if nickname is already taken
      const allPlayers = await ctx.prisma.player.findMany({});

      const nicknameAlreadyTaken = allPlayers.some((player) => player.nickname === input.nickname);
      if (nicknameAlreadyTaken) throw new TRPCError(
        {
          code: "BAD_REQUEST",
          message: "Nickname already taken"
        });

      return await ctx.prisma.player.update({
        where: {
          id: player.id
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
      //check if game group exists
      await checkIfGameGroupExists(ctx.prisma, input.gameGroup);
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId)
      const gameMap = new Map<string, Game>();
      const gameInfo = await ctx.prisma.game.findMany();
      gameInfo.forEach((game) => {
        gameMap.set(game.id, game);
      });


      const numberOfFirstPlacePrGame = new Map<string, number>();
      const sessions = await ctx.prisma.gameSession.findMany({
        where: {
          groupId: input.gameGroup
        },
        include: {
          PlayerGameSessionJunction: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      //loop through all sessions and count the number of first place wins per game
      sessions.forEach((session) => {
        const firstPlacePlayer = session.PlayerGameSessionJunction.find((playerSession) => playerSession.position === 1 && playerSession.playerId === player.id);
        if (firstPlacePlayer) {
          const gameId = gameMap.get(session.gameId)?.name ?? "Unknown";
          const numberOfWins = numberOfFirstPlacePrGame.get(gameId) ?? 0;
          numberOfFirstPlacePrGame.set(gameId, numberOfWins + 1);
        }
      });
      let maxWins = 0;
      let gameWithMaxWins = "";

      for (const [gameName, numberOfWins] of numberOfFirstPlacePrGame) {
        if (numberOfWins > maxWins) {
          maxWins = numberOfWins;
          gameWithMaxWins = gameName;
        }
      }

      const { ach1,
        ach2,
        ach3,
        ach4,
        ach5,
        ach6,
        ach7,
        ach8 } = getAchievements(maxWins, gameWithMaxWins, numberOfFirstPlacePrGame.size);


      return [ach1, ach2, ach3, ach4, ach5, ach6, ach7, ach8];
    })
});