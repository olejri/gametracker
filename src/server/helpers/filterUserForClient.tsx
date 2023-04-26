import type { User } from "@clerk/nextjs/dist/api";
import { type Prisma, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl
  };
};

export async function getLoggedInPlayer(prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>, userId: string) {
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
