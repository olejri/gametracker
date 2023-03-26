import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "npm/server/api/trpc";
import { type Game, type GameSessionWithPlayers, type Player } from "npm/components/Types";
import { FindGameSessionStatus } from "npm/components/HelperFunctions";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { filterUserForClient } from "npm/server/api/helpers/filterUserForClient";

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
        const playerMap = new Map<string, Player>();
        const gameMap = new Map<string, Game>();
        const players = await ctx.prisma.player.findMany({
          where: {
            groupId: input.data.groupId
          }
        });
        const gameInfo = await ctx.prisma.game.findMany();

        //make a map that has the player id as the key and the player object as the value
        players.forEach((player) => {
          playerMap.set(player.id, player);
        });
        gameInfo.forEach((game) => {
          gameMap.set(game.id, game);
        });

        const sessions = await ctx.prisma.gameSession.findMany({
          where: {
            groupId: input.data.groupId
          },
          include: {
            PlayerGameSessionJunction: true,
            GameSessionGameJunction: true
          },
          orderBy: {
            createdAt: "desc"
          }
        });

        const usersWithImages = (
          await clerkClient.users.getUserList({
            userId: players.map((player) => player.clerkId),
            limit: 110
          })
        ).map(filterUserForClient);

        return sessions.map((session) => {
          const playerGameSessions = session.PlayerGameSessionJunction;
          // Map over each playerGameSession to extract player information
          const players = playerGameSessions.map((playerGameSession) => ({
            nickname: playerMap.get(playerGameSession.playerId)?.nickname ?? "",
            clerkId: playerMap.get(playerGameSession.playerId)?.clerkId ?? "",
            score: playerGameSession.score ?? "",
            position: playerGameSession.position ?? 0,
            playerId: playerGameSession.playerId,
            junctionId: playerMap.get(playerGameSession.playerId)?.id ?? "",
            profileImageUrl: usersWithImages.find((user) => user.id === playerMap.get(playerGameSession.playerId)?.clerkId)?.profileImageUrl ?? ""
          }));
          // Map over each gameSessionGame to extract game information
          const expansions = session.GameSessionGameJunction.map((gameSessionGame) => ({
            gameName: gameMap.get(gameSessionGame.gameId)?.name ?? "",
            image_url: gameMap.get(gameSessionGame.gameId)?.image_url ?? "",
            gameId: gameSessionGame.gameId

          }));
          const gameSessionWithoutPlayers: GameSessionWithPlayers = {
            gameName: gameMap.get(session.gameId)?.name ?? "",
            image_url: gameMap.get(session.gameId)?.image_url ?? "",
            updatedAt: session.updatedAt,
            sessionId: session.id,
            players: players,
            expansions: expansions,
            description: session.description ?? "",
            status: FindGameSessionStatus(session.status),
            baseGameId: session.gameId,
            groupId: session.groupId
          };
          // Return a new object that includes players and their scores and positions
          return gameSessionWithoutPlayers;
        });
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
      const foundGame = await ctx.prisma.game.findUnique({
        where: {
          name: input.data.gameName
        }
      });

      if (foundGame === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Game ${input.data.gameName} does not exist`
        });
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
          updatedAt: input.data.updatedAt
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
    }),
  getGameASession: publicProcedure
    .input(
      z.object({
        data: z.object({
          id: z.string()
        })
      })
    ).query(async ({ ctx, input }) => {
      const session = await ctx.prisma.gameSession.findUnique({
        where: {
          id: input.data.id
        },
        include: {
          PlayerGameSessionJunction: true,
          GameSessionGameJunction: true
        }
      });

      if (session === null || session === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Session ${input.data.id} does not exist`
        });
      }

      const playerMap = new Map<string, Player>();
      const playerIds = session.PlayerGameSessionJunction.map((playerGameSession) => {
        return playerGameSession.playerId;
      });

      await ctx.prisma.player.findMany({
        where: {
          id: {
            in: playerIds
          }
        }
      }).then((players) => {
        players.forEach((player) => {
          playerMap.set(player.id, player);
        });
      });

      const playersFromDb = await ctx.prisma.player.findMany({
        where: {
          groupId: session.groupId
        }
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: playersFromDb.map((player) => player.clerkId),
          limit: 100
        })
      ).map((user) => filterUserForClient(user));

      const playerGameSessions = session.PlayerGameSessionJunction;
      // Map over each playerGameSession to extract player information
      const players = playerGameSessions.map((playerGameSession) => ({
        nickname: playerMap.get(playerGameSession.playerId)?.nickname ?? "",
        clerkId: playerMap.get(playerGameSession.playerId)?.clerkId ?? "",
        score: playerGameSession.score ?? "",
        position: playerGameSession.position ?? 0,
        junctionId: playerGameSession.id,
        playerId: playerGameSession.playerId,
        profileImageUrl: users.find((user) => user.id === playerMap.get(playerGameSession.playerId)?.clerkId)?.profileImageUrl ?? ""
      }));

      const gameMap = new Map<string, Game>();
      await ctx.prisma.game.findUnique({
        where: {
          id: session.gameId
        }
      }).then(
        (game) => {
          if (game !== null) {
            gameMap.set(game.id, game);
          }
        }
      );

      await ctx.prisma.game.findMany({
        where: {
          id: {
            in: session.GameSessionGameJunction.map((gameSessionGame) => {
              return gameSessionGame.gameId;
            })
          }
        }
      }).then((games) => {
        games.forEach((game) => {
          gameMap.set(game.id, game);
        });
      });

      // Map over each gameSessionGame to extract game information
      const expansions = session.GameSessionGameJunction.map((gameSessionGame) => ({
        gameName: gameMap.get(gameSessionGame.gameId)?.name ?? "",
        image_url: gameMap.get(gameSessionGame.gameId)?.image_url ?? "",
        gameId: gameSessionGame.gameId

      }));

      const gameSession: GameSessionWithPlayers = {
        gameName: gameMap.get(session.gameId)?.name ?? "",
        image_url: gameMap.get(session.gameId)?.image_url ?? "",
        updatedAt: session.updatedAt,
        sessionId: session.id,
        players: players,
        expansions: expansions,
        description: session.description ?? "",
        status: FindGameSessionStatus(session.status),
        baseGameId: session.gameId,
        groupId: session.groupId
      };
      // Return a new object that includes players and their scores and positions
      return gameSession;
    }),

  startANewGameSession: privateProcedure
    .input(
      z.object({
        gameId: z.string(),
        groupId: z.string(),
        players: z.array(z.string()),
        expansions: z.array(z.string())
      })
    ).mutation(async ({ ctx, input }) => {

      const foundGame = await ctx.prisma.game.findUnique({
        where: {
          id: input.gameId
        }
      });

      if (foundGame === null) {
        throw new TRPCError(
          {
            code: "BAD_REQUEST",
            message: "Game does not exist"
          }
        );
      }
      const session = await ctx.prisma.gameSession.create({
        data: {
          gameId: input.gameId,
          groupId: input.groupId,
          status: "Ongoing"
        }
      });

      for (const playerId of input.players) {
        const foundPlayer = await ctx.prisma.player.findUnique({
          where: {
            id: playerId
          }
        });

        if (foundPlayer === null) {
          throw new Error(`Player ${playerId} does not exist`);
        }

        await ctx.prisma.playerGameSessionJunction.create({
          data: {
            playerId: foundPlayer.id,
            gameSessionId: session.id,
          }
        });
      }

      for (const expansionId of input.expansions) {
        const foundExpansion = await ctx.prisma.game.findUnique({
          where: {
            id: expansionId
          }
        });

        if (foundExpansion === null) {
          throw new TRPCError(
            {
              code: "BAD_REQUEST",
              message: `Expansion with ${expansionId} does not exist`
            })
        }

        await ctx.prisma.gameSessionGameJunction.create({
          data: {
            gameId: foundExpansion.id,
            gameSessionId: session.id
          }
        });
      }
      return session;
    }),

  updateGameSession: privateProcedure
    .input(
      z.object({
        gameSessionId: z.string(),
        status: z.string(),
        description: z.string().optional(),
        players: z.array(
          z.object({
            junctionId: z.string(),
            score: z.string().optional(),
            position: z.number().optional()
          })
        ).optional(),
        expansions: z.array(
          z.object({
            gameId: z.string()
          })
        ).optional()
      })
    ).mutation(async ({ ctx, input }) => {
      await ctx.prisma.gameSession.update({
        where: {
          id: input.gameSessionId
        },
        data: {
          status: input.status,
          description: input.description
        }
      });

      console.log(input.players)
      input.players?.map((async (player) => {
        await ctx.prisma.playerGameSessionJunction.update({
          data: {
            score: player.score,
            position: player.position
          },
          where: {
            id: player.junctionId,
          }
        });
      }));
    }),

  updatePlayerScoreJunction: privateProcedure
    .input(
      z.object({
        junctionId: z.string(),
        score: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      await ctx.prisma.playerGameSessionJunction.update({
        data: {
          score: input.score,
        },
        where: {
          id: input.junctionId,
        }
      });
    }),

  updatePlayerPosJunction: privateProcedure
    .input(
      z.object({
        junctionId: z.string(),
        position: z.number()
      })
    ).mutation(async ({ ctx, input }) => {
      await ctx.prisma.playerGameSessionJunction.update({
        data: {
          position: input.position
        },
        where: {
          id: input.junctionId,
        }
      });
    }),

  finishGameSession: privateProcedure
    .input(
      z.object({
        sessionId: z.string(),
        players: z.array(
          z.object({
            playerId: z.string().min(1, "Missing player id"),
            score: z.string().min(1, "Missing final player score"),
            position: z.number().min(1, "Missing position in the game")
          })
        ).min(1),
      })
    ).mutation(async ({ ctx, input }) => {
      return await ctx.prisma.gameSession.update({
        where: {
          id: input.sessionId
        },
        data: {
          status: "Completed"
        }
      });
    }),
});