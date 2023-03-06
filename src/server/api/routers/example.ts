import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "npm/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  postExample: publicProcedure
    .input(z.object({ id: z.string(), createdAt: z.date(), updatedAt: z.date() }))
    .query(({ctx, input }) => {
      ctx.prisma.example.upsert({
        where: {
          id: input.id,
        },
        update: {
          updatedAt: input.updatedAt,
        },
        create: {
          id: input.id,
          createdAt: input.createdAt,
          updatedAt: input.updatedAt
        },
      }).catch((err) => {
        console.log(err);
      });
    }),
});
