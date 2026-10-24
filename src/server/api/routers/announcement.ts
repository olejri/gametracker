import { createTRPCRouter, privateProcedure, superAdminProcedure } from "npm/server/api/trpc";
import { z } from "zod";
import { getPlayerByClerkId } from "npm/server/helpers/filterUserForClient";

export const announcementRouter = createTRPCRouter({
  // Newest active announcement the current player has not dismissed yet
  getUnseen: privateProcedure
    .query(async ({ ctx }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);
      return ctx.prisma.announcement.findFirst({
        where: {
          active: true,
          AnnouncementDismissal: {
            none: { playerId: player.id }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    }),

  dismiss: privateProcedure
    .input(
      z.object({
        announcementId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);
      return ctx.prisma.announcementDismissal.upsert({
        where: {
          announcementId_playerId: {
            announcementId: input.announcementId,
            playerId: player.id
          }
        },
        create: {
          announcementId: input.announcementId,
          playerId: player.id
        },
        update: {}
      });
    }),

  getAllWithDismissals: superAdminProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.announcement.findMany({
        include: {
          AnnouncementDismissal: {
            include: {
              Player: true
            },
            orderBy: {
              dismissedAt: "desc"
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    })
});
