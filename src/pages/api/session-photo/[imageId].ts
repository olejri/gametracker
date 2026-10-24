import { type NextApiRequest, type NextApiResponse } from "next";
import { Readable } from "stream";
import { type ReadableStream as NodeReadableStream } from "stream/web";
import { getAuth } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { prisma } from "npm/server/db";
import { getGroupMembership, photosEnabled } from "npm/server/helpers/sessionPhotos";

export const config = {
  api: {
    responseLimit: false
  }
};

// Streams a private session photo to signed-in members of the session's group
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "You must be signed in to view photos" });
  }

  const imageId = req.query.imageId;
  if (typeof imageId !== "string") {
    return res.status(404).json({ error: "Photo not found" });
  }

  const image = await prisma.gameSessionImage.findUnique({
    where: { id: imageId },
    include: { gameSession: { select: { groupId: true } } }
  });
  if (!image) {
    return res.status(404).json({ error: "Photo not found" });
  }

  const membership = await getGroupMembership(prisma, userId, image.gameSession.groupId);
  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this group" });
  }

  if (!photosEnabled()) {
    return res.status(404).json({ error: "Photo not found" });
  }

  try {
    const ifNoneMatch = req.headers["if-none-match"];
    const result = await get(image.storageKey, {
      access: "private",
      ifNoneMatch: typeof ifNoneMatch === "string" ? ifNoneMatch : undefined
    });
    if (!result) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.setHeader("Cache-Control", "private, max-age=86400");
    res.setHeader("ETag", result.blob.etag);

    if (result.statusCode === 304) {
      return res.status(304).end();
    }

    res.setHeader("Content-Type", result.blob.contentType);
    res.setHeader("Content-Length", result.blob.size);
    res.status(200);
    Readable.fromWeb(result.stream as NodeReadableStream<Uint8Array>).pipe(res);
  } catch (error) {
    console.error("Error serving session photo:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to load photo" });
    }
  }
}
