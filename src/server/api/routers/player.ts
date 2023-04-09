import { createTRPCRouter, privateProcedure, publicProcedure } from "npm/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { filterUserForClient } from "npm/server/api/helpers/filterUserForClient";
import { TRPCError } from "@trpc/server";

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
      if (!player) {
        throw new TRPCError(
          {
            code: "NOT_FOUND",
            message: "Player not found"
          }
        )
      }
      return player;
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
    }),

  markGameAsOwned: privateProcedure
    .input(
      z.object({
        gameId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.findUnique({
        where: {
          clerkId: ctx.userId
        }
      });
      if (!player) {
        throw new TRPCError(
          {
            code: "NOT_FOUND",
            message: "Player not found"
          }
        )
      }
      const playerGameJunction = await ctx.prisma.playerGameJunction.create({
        data: {
          gameId: input.gameId,
          playerId: player.id
        }
      });

      if(!playerGameJunction) {
        throw new TRPCError(
          {
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to mark game as owned"
          }
        )
      }
      return playerGameJunction;
    }),

  getLogInPlayer: privateProcedure
    .query(async ({ ctx }) => {
      const player = await ctx.prisma.player.findUnique({
        where: {
          clerkId: ctx.userId
        }
      });
      if (!player) {
        throw new TRPCError(
          {
            code: "NOT_FOUND",
            message: "Player not found"
          }
        )
      }
      return player;
    }),

  updatePlayer: privateProcedure
    .input(
      z.object({
        nickname: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.findUnique({
        where: {
          clerkId: ctx.userId
        }
      });
      if (!player) {
        throw new TRPCError(
          {
            code: "NOT_FOUND",
            message: "Player not found"
          }
        )
      }

      //check if nickname is already taken
      const allPlayers = await ctx.prisma.player.findMany({
      });

      const nicknameAlreadyTaken = allPlayers.some((player) => player.nickname === input.nickname);
      if(nicknameAlreadyTaken) throw new TRPCError(
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
    })
});