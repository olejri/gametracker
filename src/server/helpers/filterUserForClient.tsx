import type { User } from "@clerk/nextjs/dist/api";
import { type Prisma, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? null
  };
};

export async function getPlayerByClerkId(prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>, userId: string) {
  const player = await prisma.player.findUnique({
    where: {
      clerkId: userId
    }
  });

  if (!player) {
    throw new TRPCError(
      {
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to get player: player ${userId} does not exist`
      }
    );
  }
  return player;
}

export async function checkIfGameGroupExists(prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>, groupId: string) {
  const gameGroup = await prisma.gameGroup.findUnique({
    where: {
      id: groupId
    }
  });

  if (!gameGroup) {
    throw new TRPCError(
      {
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to get gameGroup: gameGroup ${groupId} does not exist`
      }
    );
  }
  return gameGroup;
}

export async function getPlayerById(prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>, playerId: string) {
  const player = await prisma.player.findUnique({
    where: {
      id: playerId
    }
  });

  if (!player) {
    throw new TRPCError(
      {
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to get player: player ${playerId} does not exist`
      }
    );
  }
  return player;
}

