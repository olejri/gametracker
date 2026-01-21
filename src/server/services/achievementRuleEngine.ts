import { type PrismaClient } from "@prisma/client";

export type RuleExecutionResult = {
  progress: number;
  metadata?: Record<string, unknown>;
};

export type SessionData = {
  id: string;
  gameId: string;
  gameName: string;
  createdAt: Date;
  playerId: string;
  position: number | null;
  score: string | null;
};

export async function executeAchievementRule(
  prisma: PrismaClient,
  groupKey: string,
  playerId: string,
  groupId: string
): Promise<RuleExecutionResult> {
  const rule = await prisma.achievementRule.findUnique({
    where: { groupKey },
  });

  if (!rule) {
    throw new Error(`No rule found for groupKey ${groupKey}`);
  }

  const sessions = await getPlayerSessions(prisma, playerId, groupId);

  switch (rule.ruleType) {
    case "COUNT_WINS_PER_GAME":
      return executeCountWinsPerGame(sessions, rule);
    case "COUNT_UNIQUE_GAMES":
      return executeCountUniqueGames(sessions, rule);
    default:
      throw new Error(`Unknown rule type: ${rule.ruleType}`);
  }
}

async function getPlayerSessions(
  prisma: PrismaClient,
  playerId: string,
  groupId: string
): Promise<SessionData[]> {
  const sessions = await prisma.gameSession.findMany({
    where: {
      groupId,
      status: "COMPLETED",
    },
    include: {
      PlayerGameSessionJunction: {
        where: {
          playerId,
        },
      },
    },
  });

  const gameMap = new Map<string, string>();
  const games = await prisma.game.findMany();
  games.forEach((game) => {
    gameMap.set(game.id, game.name);
  });

  return sessions
    .filter((session) => session.PlayerGameSessionJunction.length > 0)
    .map((session) => {
      const playerSession = session.PlayerGameSessionJunction[0]!;
      return {
        id: session.id,
        gameId: session.gameId,
        gameName: gameMap.get(session.gameId) ?? "Unknown",
        createdAt: session.createdAt,
        playerId: playerSession.playerId,
        position: playerSession.position,
        score: playerSession.score,
      };
    });
}

function executeCountWinsPerGame(
  sessions: SessionData[],
  rule: { filters?: unknown; metadataConfig?: unknown }
): RuleExecutionResult {
  const filters = rule.filters as { position?: number } | null;
  const metadataConfig = rule.metadataConfig as { extractGameName?: boolean; field?: string } | null;

  const filteredSessions = sessions.filter((session) => {
    if (filters?.position !== undefined) {
      return session.position === filters.position;
    }
    return true;
  });

  const winsPerGame = new Map<string, { count: number; gameName: string }>();

  filteredSessions.forEach((session) => {
    const existing = winsPerGame.get(session.gameId);
    if (existing) {
      existing.count++;
    } else {
      winsPerGame.set(session.gameId, {
        count: 1,
        gameName: session.gameName,
      });
    }
  });

  let maxWins = 0;
  let gameWithMostWins = "";

  for (const [, data] of winsPerGame.entries()) {
    if (data.count > maxWins) {
      maxWins = data.count;
      gameWithMostWins = data.gameName;
    }
  }

  const metadata: Record<string, unknown> = {};
  if (metadataConfig?.extractGameName && gameWithMostWins) {
    const field = metadataConfig.field ?? "gameName";
    metadata[field] = gameWithMostWins;
  }

  return {
    progress: maxWins,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

function executeCountUniqueGames(
  sessions: SessionData[],
  rule: { filters?: unknown; metadataConfig?: unknown }
): RuleExecutionResult {
  const filters = rule.filters as { position?: number } | null;
  const metadataConfig = rule.metadataConfig as { extractGameNames?: boolean; field?: string } | null;

  const filteredSessions = sessions.filter((session) => {
    if (filters?.position !== undefined) {
      return session.position === filters.position;
    }
    return true;
  });

  const uniqueGames = new Set<string>();
  const gameNames: string[] = [];

  filteredSessions.forEach((session) => {
    if (!uniqueGames.has(session.gameId)) {
      uniqueGames.add(session.gameId);
      gameNames.push(session.gameName);
    }
  });

  const metadata: Record<string, unknown> = {};
  if (metadataConfig?.extractGameNames && gameNames.length > 0) {
    const field = metadataConfig.field ?? "games";
    metadata[field] = gameNames;
  }

  return {
    progress: uniqueGames.size,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}
