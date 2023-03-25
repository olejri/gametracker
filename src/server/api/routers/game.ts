import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "npm/server/api/trpc";
import { TRPCError } from "@trpc/server";
import useFetch from "npm/lib/FetchFromAtlas";
import type { Mechanic, MechanicsResponse } from "npm/components/Types";

export const gameRouter = createTRPCRouter({
  addGame: publicProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string(),
          description: z.string(),
          image_url: z.string(),
          players: z.string(),
          playtime: z.string(),
          mechanics: z.string(),
          categories: z.string(),
          isExpansion: z.boolean(),
          baseGameId: z.string().optional()
        })
      })
    )
    .mutation(async ({ ctx, input }) => {
      let baseGame = null;
      if(input.data.baseGameId) {
        baseGame = await ctx.prisma.game.findUnique(
          {
            where: {
              id: input.data.baseGameId
            }
          }
        )
      }

      if(input.data.isExpansion && baseGame === null) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Failed to create game: baseGameId is required for expansions`
        });
      }

      if(input.data.baseGameId && baseGame === null) {
        throw new TRPCError(
          {
            code: 'BAD_REQUEST',
            message: `Failed to create game: baseGameId ${input.data.baseGameId} does not exist`
          }
        );
      }
      try {
        const game = await ctx.prisma.game.create({
          data: input.data
        });
        return { game };
      } catch (err) {
        const err1 = err as Error;
        throw new Error(`Failed to create game: ${err1.message}`);
      }
    }),

  getAllGames: publicProcedure
    .query(async ({ ctx }) => {
        try {
          const games = await ctx.prisma.game.findMany();
          return { games };
        } catch (err) {
          const err1 = err as Error;
          throw new Error(`Failed to get games: ${err1.message}`);
        }
      }
    )
});