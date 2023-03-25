import { createTRPCRouter, publicProcedure } from "npm/server/api/trpc";
import { z } from "zod";

export const groupRouter = createTRPCRouter({
  addOrGetGroup: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    ).mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.gameGroup.upsert({
        where: { 
          id: input.id 
        },
        create : {
          id: input.id,
        }, update : {
          id: input.id,
        }
      });
      return { data: group };
    }),
});