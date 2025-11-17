import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "npm/server/api/trpc";
import { type Game, type GameSessionWithPlayers, type Player } from "npm/components/Types";
import { FindGameSessionStatus } from "npm/components/HelperFunctions";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { checkIfGameGroupExists, filterUserForClient, getPlayerById } from "npm/server/helpers/filterUserForClient";

export const sessionRouter = createTRPCRouter({
  getAllCompletedSessionsAsc: publicProcedure
    .input(
      z.object({
        data: z.object({
          groupId: z.string()
        })
      })
    )
    .query(async ({ ctx, input }) => {
        await checkIfGameGroupExists(ctx.prisma, input.data.groupId);

        const playerMap = new Map<string, Player>();
        const gameMap = new Map<string, Game>();

        const group = await ctx.prisma.gameGroup.findUnique({
          where: {
            id: input.data.groupId
          },
          include: {
            PlayerGameGroupJunction: true
          }
        });


        const players = await ctx.prisma.player.findMany({
          where: {
            id: {
              in: group?.PlayerGameGroupJunction.map((junction) => junction.playerId) ?? []
            }
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
            createdAt: "asc"
          }
        });

        const usersWithImages = (
          await clerkClient.users.getUserList({
            userId: players.map((player) => player.clerkId ?? ""),
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
            createdAt: session.createdAt,
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

  getAllCompletedSessions: publicProcedure
    .input(
      z.object({
        data: z.object({
          groupId: z.string()
        })
      })
    )
    .query(async ({ ctx, input }) => {
        await checkIfGameGroupExists(ctx.prisma, input.data.groupId);
        const playerMap = new Map<string, Player>();
        const gameMap = new Map<string, Game>();

        const group = await ctx.prisma.gameGroup.findUnique({
          where: {
            id: input.data.groupId
          },
          include: {
            PlayerGameGroupJunction: true
          }
        });

        const players = await ctx.prisma.player.findMany({
          where: {
            id: {
              in: group?.PlayerGameGroupJunction.map((junction) => junction.playerId) ?? []
            }
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
            userId: players.map((player) => player.clerkId ?? ""),
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
            createdAt: session.createdAt,
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
  getLastFiveCompletedSessions: publicProcedure
    .input(
      z.object({
        groupId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      await checkIfGameGroupExists(ctx.prisma, input.groupId);

      const playerMap = new Map<string, Player>();
        const gameMap = new Map<string, Game>();

        const group = await ctx.prisma.gameGroup.findUnique({
          where: {
            id: input.groupId
          },
          include: {
            PlayerGameGroupJunction: true
          }
        });

        const players = await ctx.prisma.player.findMany({
          where: {
            id: {
              in: group?.PlayerGameGroupJunction.map((junction) => junction.playerId) ?? []
            }
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
            groupId: input.groupId
          },
          include: {
            PlayerGameSessionJunction: true,
            GameSessionGameJunction: true
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 5
        });

        const usersWithImages = (
          await clerkClient.users.getUserList({
            userId: players.map((player) => player.clerkId ?? ""),
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
            createdAt: session.createdAt,
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

      await checkIfGameGroupExists(ctx.prisma, session.groupId);
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

      const group = await ctx.prisma.gameGroup.findUnique({
        where: {
          id: session.groupId
        },
        include: {
          PlayerGameGroupJunction: true
        }
      });

      const playersFromDb = await ctx.prisma.player.findMany({
        where: {
          id: {
            in: group?.PlayerGameGroupJunction.map((junction) => junction.playerId) ?? []
          }
        }
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: playersFromDb.map((player) => player.clerkId ?? ""),
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
        createdAt: session.createdAt,
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
      await checkIfGameGroupExists(ctx.prisma, input.groupId);
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
        const foundPlayer = await getPlayerById(ctx.prisma, playerId);

        await ctx.prisma.playerGameSessionJunction.create({
          data: {
            playerId: foundPlayer.id,
            gameSessionId: session.id,
            position: 1,
            score: ""
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
            });
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

      input.players?.map((async (player) => {
        await ctx.prisma.playerGameSessionJunction.update({
          data: {
            score: player.score,
            position: player.position
          },
          where: {
            id: player.junctionId
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
          score: input.score
        },
        where: {
          id: input.junctionId
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
          id: input.junctionId
        }
      });
    }),

  deleteAGameSession: privateProcedure
    .input(
      z.object({
        sessionId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      await ctx.prisma.playerGameSessionJunction.deleteMany({
        where: {
          gameSessionId: input.sessionId
        }
      });
      await ctx.prisma.gameSessionGameJunction.deleteMany({
        where: {
          gameSessionId: input.sessionId
        }
      });
      await ctx.prisma.gameSession.delete({
        where: {
          id: input.sessionId
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
        ).min(1)
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

  updateGameSessionDescription: privateProcedure
    .input(
      z.object({
        description: z.string().min(1),
        gameSessionId: z.string().min(1)
      }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.gameSession.update({
        where: {
          id: input.gameSessionId
        },
        data: {
          description: input.description
        }
      });
      if (session.description === null) throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Game session does not exist"
      });

      return session.description;
    }),

  updateGameSessionDate: privateProcedure
    .input(
      z.object({
        date: z.date(),
        gameSessionId: z.string().min(1)
      }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.gameSession.update({
        where: {
          id: input.gameSessionId
        },
        data: {
          createdAt: input.date
        }
      });
    }),

  rollSeats: privateProcedure
    .input(
      z.object({
        gameSessionId: z.string().min(1)
      }))
    .mutation(async ({ ctx, input }) => {
      // Fetch all players in this game session
      const playerJunctions = await ctx.prisma.playerGameSessionJunction.findMany({
        where: {
          gameSessionId: input.gameSessionId
        },
        include: {
          player: true
        }
      });

      if (playerJunctions.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No players found in this game session"
        });
      }

      // Shuffle the players
      const shuffled = [...playerJunctions].sort(() => Math.random() - 0.5);

      // Assign seat positions
      const seatAssignments: Record<string, number> = {};
      shuffled.forEach((junction, index) => {
        seatAssignments[junction.player.nickname ?? junction.player.name] = index + 1;
      });

      // Save to randomization log
      const log = await ctx.prisma.gameSessionRandomizationLog.create({
        data: {
          gameSessionId: input.gameSessionId,
          type: "seat_order",
          data: seatAssignments
        }
      });

      return {
        log,
        seatAssignments
      };
    }),

  rollStartingPlayer: privateProcedure
    .input(
      z.object({
        gameSessionId: z.string().min(1)
      }))
    .mutation(async ({ ctx, input }) => {
      // Fetch all players in this game session
      const playerJunctions = await ctx.prisma.playerGameSessionJunction.findMany({
        where: {
          gameSessionId: input.gameSessionId
        },
        include: {
          player: true
        }
      });

      if (playerJunctions.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No players found in this game session"
        });
      }

      // Select a random player
      const randomIndex = Math.floor(Math.random() * playerJunctions.length);
      const selectedPlayer = playerJunctions[randomIndex];
      
      if (!selectedPlayer) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to select starting player"
        });
      }

      const startingPlayerName = selectedPlayer.player.nickname ?? selectedPlayer.player.name;

      // Save to randomization log
      const log = await ctx.prisma.gameSessionRandomizationLog.create({
        data: {
          gameSessionId: input.gameSessionId,
          type: "starting_player",
          data: { startingPlayer: startingPlayerName }
        }
      });

      return {
        log,
        startingPlayer: startingPlayerName
      };
    }),

  getRandomizationHistory: publicProcedure
    .input(
      z.object({
        gameSessionId: z.string().min(1)
      }))
    .query(async ({ ctx, input }) => {
      const logs = await ctx.prisma.gameSessionRandomizationLog.findMany({
        where: {
          gameSessionId: input.gameSessionId
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      return logs;
    })

});