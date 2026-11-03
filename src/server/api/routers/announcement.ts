import { createTRPCRouter, privateProcedure, superAdminProcedure } from "npm/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getPlayerByClerkId } from "npm/server/helpers/filterUserForClient";

// "2026-11" + "New: photo albums!" -> "2026-11-new-photo-albums"
const announcementId = (title: string, date: Date) => {
  const month = date.toISOString().slice(0, 7);
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug ? `${month}-${slug}` : month;
};

export const announcementRouter = createTRPCRouter({
  // Every active announcement the current player has not dismissed yet, oldest first
  getUnseen: privateProcedure
    .query(async ({ ctx }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);
      return ctx.prisma.announcement.findMany({
        where: {
          active: true,
          AnnouncementDismissal: {
            none: { playerId: player.id }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      });
    }),

  // Dismisses all the announcements the player paged through in one go
  dismiss: privateProcedure
    .input(
      z.object({
        announcementIds: z.array(z.string()).min(1)
      })
    ).mutation(async ({ ctx, input }) => {
      const player = await getPlayerByClerkId(ctx.prisma, ctx.userId);
      return ctx.prisma.announcementDismissal.createMany({
        data: input.announcementIds.map((announcementId) => ({
          announcementId,
          playerId: player.id
        })),
        skipDuplicates: true
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
    }),

  create: superAdminProcedure
    .input(
      z.object({
        title: z.string().trim().min(1).max(191),
        body: z.string().trim().min(1),
        active: z.boolean()
      })
    ).mutation(async ({ ctx, input }) => {
      const now = new Date();
      const baseId = announcementId(input.title, now);
      let id = baseId;
      for (let n = 2; await ctx.prisma.announcement.findUnique({ where: { id } }); n++) {
        id = `${baseId}-${n}`;
      }
      return ctx.prisma.announcement.create({
        data: { id, title: input.title, body: input.body, active: input.active, createdAt: now }
      });
    }),

  setActive: superAdminProcedure
    .input(
      z.object({
        announcementId: z.string(),
        active: z.boolean()
      })
    ).mutation(async ({ ctx, input }) => {
      return ctx.prisma.announcement.update({
        where: { id: input.announcementId },
        data: { active: input.active }
      });
    }),

  delete: superAdminProcedure
    .input(
      z.object({
        announcementId: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.announcement.findUnique({ where: { id: input.announcementId } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }
      await ctx.prisma.$transaction([
        ctx.prisma.announcementDismissal.deleteMany({ where: { announcementId: input.announcementId } }),
        ctx.prisma.announcement.delete({ where: { id: input.announcementId } })
      ]);
      return existing;
    })
});
