import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "npm/server/api/trpc";
import { type Game, type GameSessionWithPlayers, type Player } from "npm/components/Types";

export const sessionRouter = createTRPCRouter({
  getAllCompletedSessions: publicProcedure
    .input(
      z.object({
        data: z.object({
          groupId: z.string()
        })
        })
    )
    .query(async ({ ctx, input }) => {
        try {
          const playerMap = new Map<string, Player>();
          const gameMap = new Map<string, Game>();
          const players = await ctx.prisma.player.findMany({
            where: {
              groupId: input.data.groupId
            },
          });

          const gameInfo = await ctx.prisma.game.findMany();

          //make a map that has the player id as the key and the player object as the value
          players.forEach((player) => {
            playerMap.set(player.id, player);
          });

          gameInfo.forEach((game) => {
            gameMap.set(game.id, game);
          });

          const games = await ctx.prisma.gameSession.findMany({
            where: {
              groupId: input.data.groupId
            },
            include: {
              PlayerGameSessionJunction: true,
              GameSessionGameJunction: true
            },
            orderBy: {
              createdAt: "desc",
            }
          });

          return games.map((game) => {
            const playerGameSessions = game.PlayerGameSessionJunction;
            // Map over each playerGameSession to extract player information
            const players = playerGameSessions.map((playerGameSession) => ({
              nickname: playerMap.get(playerGameSession.playerId)?.nickname ?? "",
              clerkId: playerMap.get(playerGameSession.playerId)?.clerkId ?? "",
              score: playerGameSession.score ?? "",
              position: playerGameSession.position ?? 0
            }));
            // Map over each gameSessionGame to extract game information
            const expansions = game.GameSessionGameJunction.map((gameSessionGame) => ({
              gameName: gameMap.get(gameSessionGame.gameId)?.name ?? "",
              image_url: gameMap.get(gameSessionGame.gameId)?.image_url ?? ""
            }));
            const gameSessionWithoutPlayers: GameSessionWithPlayers = {
              gameName: gameMap.get(game.gameId)?.name ?? "",
              image_url: gameMap.get(game.gameId)?.image_url ?? "",
              updatedAt: game.updatedAt,
              players: players,
              expansions: expansions,
              description: game.description ?? "",
              status: game.status ?? ""
            }
            // Return a new object that includes players and their scores and positions
            return gameSessionWithoutPlayers;
          });
        } catch (err) {
          const err1 = err as Error;
          throw new Error(`Failed to get games: ${err1.message}`);
        }
      }
    ),
  addACompletedSession: publicProcedure
    .input(
      z.object({
        data: z.object({
          players: z.array(z.object({
            playerId: z.string(),
            position: z.number(),
            score: z.string()
          })),
          gameName: z.string(),
          expansionNames: z.array(z.string()).optional(),
          groupId: z.string(),
          status: z.string(),
          description: z.string().optional(),
          createdAt: z.date(),
          updatedAt: z.date()
        })
      })
    ).mutation(async ({ ctx, input }) => {
      try {
        const foundGame = await ctx.prisma.game.findUnique({
          where: {
            name: input.data.gameName
          }
        });

        if (foundGame === null) {
          throw new Error(`Game ${input.data.gameName} does not exist`);
        }

        const foundGroup = await ctx.prisma.gameGroup.findUnique({
          where: {
            id: input.data.groupId
          }
        });

        if (foundGroup === null) {
          throw new Error(`GameGroup ${input.data.groupId} does not exist`);
        }

        for (const player of input.data.players) {
          const foundPlayer = await ctx.prisma.player.findUnique({
            where: {
              id: player.playerId
            }
          });

          if (foundPlayer === null) {
            throw new Error(`Player ${player.playerId} does not exist`);
          }
        }

        const session = await ctx.prisma.gameSession.create({
          data: {
            gameId: foundGame.id,
            groupId: input.data.groupId,
            status: input.data.status,
            description: input.data.description,
            createdAt: input.data.createdAt,
            updatedAt: input.data.updatedAt,
          }
        });

        for (const player of input.data.players) {
          const foundPlayer = await ctx.prisma.player.findUnique({
            where: {
              id: player.playerId
            }
          });

          if (foundPlayer === null) {
            throw new Error(`Player ${player.playerId} does not exist`);
          }

          await ctx.prisma.playerGameSessionJunction.create({
            data: {
              playerId: foundPlayer.id,
              gameSessionId: session.id,
              position: player.position,
              score: player.score
            }
          });
        }

        for (const expansionName of input.data.expansionNames ?? []) {
          const foundExpansion = await ctx.prisma.game.findUnique({
            where: {
              name: expansionName
            }
          });

          if (foundExpansion === null) {
            throw new Error(`Expansion ${expansionName} does not exist`);
          }

          await ctx.prisma.gameSessionGameJunction.create({
            data: {
              gameId: foundExpansion.id,
              gameSessionId: session.id
            }
          });
        }
        return { session };
      } catch (err) {
        const err1 = err as Error;
        throw new Error(`Failed to create session: ${err1.message}`);
      }
    }),
  getGameASession: publicProcedure
    .input(
      z.object({
        data: z.object({
          id: z.string()
        })
      })
    ).query(async ({ ctx, input }) => {
        const game = await ctx.prisma.gameSession.findUnique({
          where: {
            id: input.data.id
          },
          include: {
            PlayerGameSessionJunction: true,
            GameSessionGameJunction: true
          },
        });
      if (game === null || game === undefined) {
        return { data: null };
      }

    }),
});