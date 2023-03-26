import { createTRPCRouter } from "npm/server/api/trpc";
import { gameRouter } from "npm/server/api/routers/game";
import { playerRouter } from "npm/server/api/routers/player";
import { groupRouter } from "npm/server/api/routers/group";
import { sessionRouter } from "npm/server/api/routers/session";
import { userRouter } from "npm/server/api/routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  game: gameRouter,
  player: playerRouter,
  group : groupRouter,
  session: sessionRouter,
  user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
