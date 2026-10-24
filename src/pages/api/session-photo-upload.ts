import { type NextApiRequest, type NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "npm/server/db";
import {
  getGroupMembership,
  MAX_SESSION_PHOTO_BYTES,
  MAX_SESSION_PHOTOS,
  photosEnabled,
  SESSION_PHOTO_CONTENT_TYPES,
  sessionPhotoPrefix
} from "npm/server/helpers/sessionPhotos";

// Issues short-lived client tokens so the browser can upload a session photo straight to Vercel Blob
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!photosEnabled()) {
    return res.status(503).json({ error: "Photo uploads are not enabled" });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "You must be signed in to upload photos" });
  }

  try {
    const result = await handleUpload({
      request: req,
      body: req.body as HandleUploadBody,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { gameSessionId } = JSON.parse(clientPayload ?? "{}") as { gameSessionId?: string };
        if (!gameSessionId) {
          throw new Error("Missing game session");
        }

        const session = await prisma.gameSession.findUnique({
          where: { id: gameSessionId },
          select: { groupId: true }
        });
        if (!session) {
          throw new Error("Game session not found");
        }

        const membership = await getGroupMembership(prisma, userId, session.groupId);
        if (!membership) {
          throw new Error("You are not a member of this group");
        }

        const imageCount = await prisma.gameSessionImage.count({
          where: { gameSessionId }
        });
        if (imageCount >= MAX_SESSION_PHOTOS) {
          throw new Error(`A game session can have at most ${MAX_SESSION_PHOTOS} photos`);
        }

        if (!pathname.startsWith(sessionPhotoPrefix(gameSessionId)) || pathname.includes("..")) {
          throw new Error("Invalid upload path");
        }

        return {
          allowedContentTypes: SESSION_PHOTO_CONTENT_TYPES,
          maximumSizeInBytes: MAX_SESSION_PHOTO_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ gameSessionId, userId })
        };
      }
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
}
