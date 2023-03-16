import { createTRPCRouter, publicProcedure } from "npm/server/api/trpc";
import { z } from "zod";

export const groupRouter = createTRPCRouter({
  addOrGetGroup: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    ).mutation(async ({ ctx, input }) => {
      let group = await ctx.prisma.gameGroup.findUnique({
        where: { id: input.id },
      });
      if (!group) {
        group = await ctx.prisma.gameGroup.create({
          data: {
            id: input.id,
          },
        });
      }
      return { data: group };
    }),
});