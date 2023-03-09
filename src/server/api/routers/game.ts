import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "npm/server/api/trpc";

export const gameRouter = createTRPCRouter({
    addOrUpdateGame: publicProcedure
    .input(z.object({
        id: z.string().optional(),
        name: z.string(),
        description: z.string().optional()
    }))
    .query(({ctx, input }) => {
      ctx.prisma.game.create({
        data: {
            name: input.name,
            description: input.description,
        },
      }).catch((err) => {
        console.log(err);
      });
    }),
});
