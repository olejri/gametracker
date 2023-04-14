import { createTRPCRouter, privateProcedure } from "npm/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { filterUserForClientWithOrg } from "npm/server/api/helpers/filterUserForClient";
import { TRPCError } from "@trpc/server";
import { OrganizationMembershipRole } from "@clerk/backend/dist/types/api/resources/Enums";

export const userRouter = createTRPCRouter({
  getClerkUser: privateProcedure.query(async ({ ctx }) => {

    //dev mode
    if (process.env.NODE_ENV === "development") {
      return {
        id: "user.id",
        username: "user.username",
        profileImageUrl: "user.profileImageUrl",
        organizationSlug: "game-night",
      }
    }

    const user = await clerkClient.users.getUser(ctx.userId);
    if (!user) {
      throw new TRPCError(
        {
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get user: user ${ctx.userId} does not exist`
        }
      );
    }
    const organizationMemberships = await clerkClient.users.getOrganizationMembershipList({
      userId: ctx.userId
    });

    const organizationMembership = organizationMemberships[0];
    if (!organizationMembership) {
      throw new TRPCError(
        {
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get user: user ${ctx.userId} is not a member of an organization`
        }
      );
    }
    const userWithOrg = filterUserForClientWithOrg({user, organizationMembership});
    // adding a new game group if it doesn't exist
    await ctx.prisma.gameGroup.upsert({
      where: {
        id: userWithOrg.organizationSlug
      },
      create : {
        id: userWithOrg.organizationSlug,
      }, update : {
      }
    });
    // adding a new player if it doesn't exist
    await ctx.prisma.player.upsert({
      where: {
        clerkId: ctx.userId
      },
      create: {
        name: userWithOrg.username ?? "unknown",
        clerkId: ctx.userId,
        groupId: userWithOrg.organizationSlug
      },
      update: {
      }
    });
    return userWithOrg;
  }),

  getPlayer: privateProcedure
    .input(
      z.object({
        clerkId: z.string()
      })
    ).query(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.findUnique({
        where: {
          clerkId: input.clerkId
        }
      });
      return {
        data: player
      };
    }),

  invitePlayer: privateProcedure
    .input(
      z.object({
        email: z.string(),
        slug: z.string()
      })
    ).mutation(async ({ input, ctx }) => {
      const organization = await clerkClient.organizations.getOrganization(
        {
          slug: input.slug
        }
      )
      if (!organization) {
        throw new TRPCError(
          {
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to get organization: organization ${input.slug} does not exist`
          }
        );
      }
      const invitation = await clerkClient.organizations.createOrganizationInvitation({
        organizationId: organization.id,
        inviterUserId: ctx.userId,
        emailAddress: input.email,
        role: "basic_member" as OrganizationMembershipRole
      });
      return invitation;
    }),

  getPendingPlayers: privateProcedure
    .input(
      z.object({
        slug: z.string()
      })
    )
    .query(async ({ input }) => {
      const organization = await clerkClient.organizations.getOrganization(
        {
          slug: input.slug
        }
      )
      if (!organization) {
        throw new TRPCError(
          {
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to get organization: organization ${input.slug} does not exist`
          }
        );
      }

      return await clerkClient.organizations.getPendingOrganizationInvitationList(
        {
          organizationId: organization.id
        }
      );
    })
});