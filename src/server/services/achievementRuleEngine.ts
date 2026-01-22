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
  mechanics?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
};

export type FilterConfig = {
  position?: number;
  mechanicName?: string;
  categoryName?: string;
  gameId?: string;
};

function applyFilters(sessions: SessionData[], filters: FilterConfig | null): SessionData[] {
  if (!filters) return sessions;

  return sessions.filter((session) => {
    if (filters.position !== undefined && session.position !== filters.position) {
      return false;
    }

    if (filters.gameId !== undefined && session.gameId !== filters.gameId) {
      return false;
    }

    if (filters.mechanicName !== undefined) {
      const hasMechanic = session.mechanics?.some(
        (m) => m.name.toLowerCase() === filters.mechanicName!.toLowerCase()
      );
      if (!hasMechanic) return false;
    }

    if (filters.categoryName !== undefined) {
      const hasCategory = session.categories?.some(
        (c) => c.name.toLowerCase() === filters.categoryName!.toLowerCase()
      );
      if (!hasCategory) return false;
    }

    return true;
  });
}

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
    case "COUNT_UNIQUE_MECHANICS":
      return executeCountUniqueMechanics(sessions, rule);
    case "COUNT_WINS":
      return executeCountWins(sessions, rule);
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
  const gameMechanicsMap = new Map<string, Array<{ id: string; name: string }>>();
  const gameCategoriesMap = new Map<string, Array<{ id: string; name: string }>>();
  
  const games = (await prisma.game.findMany({
    include: {
      GameMechanic: {
        include: {
          mechanic: true,
        },
      },
      GameCategory: {
        include: {
          category: true,
        },
      },
    },
  })) as unknown as Array<{
    id: string;
    name: string;
    GameMechanic: Array<{
      mechanic: {
        id: string;
        name: string;
      };
    }>;
    GameCategory: Array<{
      category: {
        id: string;
        name: string;
      };
    }>;
  }>;
  
  games.forEach((game) => {
    gameMap.set(game.id, game.name);
    const mechanics = game.GameMechanic.map((gm) => ({
      id: gm.mechanic.id,
      name: gm.mechanic.name,
    }));
    gameMechanicsMap.set(game.id, mechanics);
    
    const categories = game.GameCategory.map((gc) => ({
      id: gc.category.id,
      name: gc.category.name,
    }));
    gameCategoriesMap.set(game.id, categories);
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
        mechanics: gameMechanicsMap.get(session.gameId),
        categories: gameCategoriesMap.get(session.gameId),
      };
    });
}

function executeCountWinsPerGame(
  sessions: SessionData[],
  rule: { filters?: unknown; metadataConfig?: unknown }
): RuleExecutionResult {
  const filters = rule.filters as FilterConfig | null;
  const metadataConfig = rule.metadataConfig as { extractGameName?: boolean; field?: string } | null;

  const filteredSessions = applyFilters(sessions, filters);

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
  const filters = rule.filters as FilterConfig | null;
  const metadataConfig = rule.metadataConfig as { extractGameNames?: boolean; field?: string } | null;

  const filteredSessions = applyFilters(sessions, filters);

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

function executeCountUniqueMechanics(
  sessions: SessionData[],
  rule: { filters?: unknown; metadataConfig?: unknown }
): RuleExecutionResult {
  const filters = rule.filters as FilterConfig | null;
  const metadataConfig = rule.metadataConfig as { extractMechanicNames?: boolean; field?: string } | null;

  const filteredSessions = applyFilters(sessions, filters);

  const uniqueMechanics = new Set<string>();
  const mechanicNames: string[] = [];

  filteredSessions.forEach((session) => {
    if (session.mechanics && session.mechanics.length > 0) {
      session.mechanics.forEach((mechanic) => {
        if (!uniqueMechanics.has(mechanic.id)) {
          uniqueMechanics.add(mechanic.id);
          mechanicNames.push(mechanic.name);
        }
      });
    }
  });

  const metadata: Record<string, unknown> = {};
  if (metadataConfig?.extractMechanicNames && mechanicNames.length > 0) {
    const field = metadataConfig.field ?? "mechanics";
    metadata[field] = mechanicNames;
  }

  return {
    progress: uniqueMechanics.size,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

function executeCountWins(
  sessions: SessionData[],
  rule: { filters?: unknown; metadataConfig?: unknown }
): RuleExecutionResult {
  const filters = rule.filters as FilterConfig | null;
  const metadataConfig = rule.metadataConfig as { extractDetails?: boolean; field?: string } | null;

  const filteredSessions = applyFilters(sessions, filters);

  const metadata: Record<string, unknown> = {};
  if (metadataConfig?.extractDetails) {
    const field = metadataConfig.field ?? "details";
    const details: Record<string, unknown> = {
      totalWins: filteredSessions.length,
    };
    
    if (filters?.mechanicName) {
      details.mechanic = filters.mechanicName;
    }
    
    if (filters?.categoryName) {
      details.category = filters.categoryName;
    }
    
    metadata[field] = details;
  }

  return {
    progress: filteredSessions.length,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}
