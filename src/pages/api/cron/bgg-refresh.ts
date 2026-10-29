import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "npm/server/db";
import { refreshBggRatings } from "npm/server/bgg";

// Weekly Vercel Cron job (see vercel.json) that refreshes the BGG ratings
// stored on games. Skips itself until BGG_API_TOKEN is set.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await refreshBggRatings(prisma);
    return res.status(200).json(result);
  } catch (error) {
    console.error("BGG rating refresh failed:", error);
    return res.status(500).json({ error: "BGG rating refresh failed" });
  }
}

export const config = {
  maxDuration: 60
};
