import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "npm/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch the last 5 completed game sessions
    const sessions = await prisma.gameSession.findMany({
      where: {
        status: "COMPLETED"
      },
      select: {
        id: true,
        gameId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    // Get the game information for these sessions (only game titles, no player data)
    const gameIds = sessions.map((session) => session.gameId);
    const games = await prisma.game.findMany({
      where: {
        id: {
          in: gameIds
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Map game names to sessions
    const gameMap = new Map(games.map((game) => [game.id, game.name]));
    
    const recentGames = sessions.map((session) => ({
      id: session.id,
      gameName: gameMap.get(session.gameId) || "Unknown Game",
      playedAt: session.createdAt
    }));

    res.status(200).json(recentGames);
  } catch (error) {
    console.error("Error fetching recent games:", error);
    res.status(500).json({ error: "Failed to fetch recent games" });
  }
}
