import {z} from "zod";

import {createTRPCRouter, privateProcedure, publicProcedure} from "npm/server/api/trpc";
import {TRPCError} from "@trpc/server";
import fetch from "node-fetch-native";
import type {AtlasResponse, CategoriesResponse, MechanicsResponse} from "npm/components/Types";
import {OpenaiResponse} from "npm/components/Types";
import {makeBoardGameAtlasSearchUrl} from "npm/components/HelperFunctions";
import OpenAI from "openai";
import * as process from "process";

export const gameRouter = createTRPCRouter({
  addGame: publicProcedure
    .input(
      z.object({
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
    )
    .mutation(async ({ ctx, input }) => {
      let baseGame = null;
      if (input.baseGameId) {
        baseGame = await ctx.prisma.game.findUnique(
          {
            where: {
              id: input.baseGameId
            }
          }
        );
      }

      if (input.isExpansion && baseGame === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to create game: baseGameId is required for expansions`
        });
      }

      if (input.baseGameId && baseGame === null) {
        throw new TRPCError(
          {
            code: "BAD_REQUEST",
            message: `Failed to create game: baseGameId ${input.baseGameId} does not exist`
          }
        );
      }
      try {
        const game = await ctx.prisma.game.create({
          data: input
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
      if (input?.withExpansions === undefined) {
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
    .query(async ({}) => {
      const mechanismUrl = "https://api.boardgameatlas.com/api/game/mechanics?client_id=1rbEg28jEc";
      const response = await fetch(mechanismUrl);

      if (response.ok) {
        const json = await response.json() as unknown as MechanicsResponse;
        return json.mechanics;
      }
      return [];
    }),

  getAllCategories: publicProcedure
    .query(async ({}) => {
      const categoryUrl = "https://api.boardgameatlas.com/api/game/categories?client_id=1rbEg28jEc";
      const response = await fetch(categoryUrl);

      if (response.ok) {
        const json = await response.json() as unknown as CategoriesResponse;
        return json.categories;
      }
      return [];
    }),

  //searchForGame using openai
  searchForGameWithOpenai: publicProcedure
    .input(
      z.object({
          searchQuery: z.string()
        }
      ))
    .mutation(async ({ input }) => {
      const client = new OpenAI(({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 15 * 1000, // 15 seconds (default is 10 minutes)
      }));

      const query = "I want information about a board game called " + input.searchQuery + ". " +
        "Create a valid JSON object that looks like this: {\n" +
        "    name: string\n" +
        "    min_players: number\n" +
        "    max_players: number\n" +
        "    min_playtime: number\n" +
        "    max_playtime: number\n" +
        "    mechanics: string[]\n" +
        "    categories: string[]\n" +
        "    description: string\n" +
        "} \n" +
          "Do not escape the double quotes in the output:";

      const response = await client.chat.completions
        .create({
          messages: [{ role: 'user', content: query }],
          model: 'gpt-4-1106-preview',
          response_format: { "type":"json_object" }
        })
        .asResponse();

        const openai = await response.json() as OpenaiResponse
        return openai?.choices[0]?.message?.content ?? "no response";
    }),

  searchForGame: publicProcedure
    .input(
      z.object({
          searchName: z.string().optional(),
          mechanic: z.string().optional(),
          category: z.string().optional()
        }
      ))
    .mutation(async ({ input }) => {
      const url = makeBoardGameAtlasSearchUrl(input?.searchName ?? "", input?.mechanic ?? "", input?.category ?? "");
      const response = await fetch(url);

      if (response.ok) {
        const json = await response.json() as unknown as AtlasResponse;
        return json.games;
      }
      return [] as AtlasResponse["games"];
    }),

  getGameOwnedBy: privateProcedure
    .query(async ({ ctx }) => {
      const player = await ctx.prisma.player.findUnique({
        where: {
          clerkId: ctx.userId
        },
        include: {
          PlayerGameJunction: true
        }
      });
      if (!player) {
        throw new TRPCError(
          {
            code: "NOT_FOUND",
            message: "Player not found"
          }
        );
      }
      return await ctx.prisma.game.findMany({
        where: {
          id: {
            in: player.PlayerGameJunction.map(junction => junction.gameId)
          }
        }
      });
    })
});