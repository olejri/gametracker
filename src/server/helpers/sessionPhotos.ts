import { type PrismaClient } from "@prisma/client";
import { env } from "npm/env.mjs";

export const MAX_SESSION_PHOTOS = 3;
export const MAX_SESSION_PHOTO_BYTES = 5 * 1024 * 1024;
export const SESSION_PHOTO_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Photos are switched off until a Vercel Blob store is connected
export const photosEnabled = () => !!env.BLOB_READ_WRITE_TOKEN;

// Every photo of a session lives under this prefix in the Blob store
export const sessionPhotoPrefix = (gameSessionId: string) => `session-photos/${gameSessionId}/`;

// Returns the user's accepted membership of the group, or null when they are not a member
export async function getGroupMembership(prisma: PrismaClient, clerkUserId: string | null | undefined, groupId: string) {
  if (!clerkUserId) return null;

  const player = await prisma.player.findUnique({
    where: { clerkId: clerkUserId },
    include: {
      PlayerGameGroupJunction: {
        where: { groupId: groupId, inviteStatus: "ACCEPTED" }
      }
    }
  });

  return player?.PlayerGameGroupJunction[0] ?? null;
}
