import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "npm/server/api/trpc";
import { TRPCError } from "@trpc/server";
import fetch from "node-fetch-native";
import type { AtlasResponse, CategoriesResponse, MechanicsResponse } from "npm/components/Types";
import { makeBoardGameAtlasSearchUrl } from "npm/components/HelperFunctions";

export const gameRouter = createTRPCRouter({
  addGame: publicProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string().min(1),
          description: z.string().min(1),
          image_url: z.string().min(1),
          players: z.string().min(1),
          playtime: z.string().min(1),
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
    .input(
      z.object({
        withExpansions: z.boolean().optional()
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if(input?.withExpansions === undefined)  {
        return await ctx.prisma.game.findMany();
      } else {
        return await ctx.prisma.game.findMany({
          where: {
            isExpansion: input.withExpansions
          }
        });
      }
    }),

  getAllMechanics: publicProcedure
    .query(async ({  }) => {
      const mechanismUrl = "https://api.boardgameatlas.com/api/game/mechanics?client_id=1rbEg28jEc";
      const response = await fetch(mechanismUrl);

      if(response.ok) {
        const json = await response.json() as unknown as MechanicsResponse;
        return json.mechanics;
      }
      return [];
    }),

  getAllCategories: publicProcedure
    .query(async ({  }) => {
      const categoryUrl = "https://api.boardgameatlas.com/api/game/categories?client_id=1rbEg28jEc";
      const response = await fetch(categoryUrl);

      if(response.ok) {
        const json = await response.json() as unknown as CategoriesResponse;
        return json.categories;
      }
      return [];
    }),

  searchForGame: publicProcedure
    .input(
      z.object({
        searchName: z.string().optional(),
        mechanic: z.string().optional(),
        category: z.string().optional(),
      }
    ))
    .mutation(async ({ input }) => {
      const url = makeBoardGameAtlasSearchUrl(input?.searchName ?? "", input?.mechanic ?? "", input?.category ?? "");
      const response = await fetch(url);

      if(response.ok) {
        const json = await response.json() as unknown as AtlasResponse;
        return json.games;
      }
      return [] as AtlasResponse["games"];
    })
});