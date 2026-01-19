import { type PrismaClient, Prisma } from "@prisma/client";

export type UnlockedAchievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  tier: string;
  points: number;
};

export async function updatePlayerAchievements(
  prisma: PrismaClient,
  playerId: string,
  groupId: string
): Promise<UnlockedAchievement[]> {
  const newlyUnlocked: UnlockedAchievement[] = [];

  const sessions = await prisma.gameSession.findMany({
    where: {
      groupId,
      status: "COMPLETED",
    },
    include: {
      PlayerGameSessionJunction: true,
    },
  });

  const gameMap = new Map<string, string>();
  const gameInfo = await prisma.game.findMany();
  gameInfo.forEach((game) => {
    gameMap.set(game.id, game.name);
  });

  const numberOfFirstPlacePerGame = new Map<string, number>();

  sessions.forEach((session) => {
    const firstPlacePlayer = session.PlayerGameSessionJunction.find(
      (playerSession) =>
        playerSession.position === 1 && playerSession.playerId === playerId
    );
    if (firstPlacePlayer) {
      const gameName = gameMap.get(session.gameId) ?? "Unknown";
      const numberOfWins = numberOfFirstPlacePerGame.get(gameName) ?? 0;
      numberOfFirstPlacePerGame.set(gameName, numberOfWins + 1);
    }
  });

  let maxWinsForSingleGame = 0;
  let gameWithMostWins = "";
  for (const [gameName, numberOfWins] of numberOfFirstPlacePerGame.entries()) {
    if (numberOfWins > maxWinsForSingleGame) {
      maxWinsForSingleGame = numberOfWins;
      gameWithMostWins = gameName;
    }
  }

  const numberOfDifferentGamesWon = numberOfFirstPlacePerGame.size;
  const gamesWonList = Array.from(numberOfFirstPlacePerGame.keys());

  const achievements = await prisma.achievement.findMany({
    where: {
      category: {
        in: ["specialist", "generalist"],
      },
    },
  });

  for (const achievement of achievements) {
    let currentProgress = 0;
    let metadata: Record<string, unknown> | undefined = undefined;

    if (achievement.category === "specialist") {
      currentProgress = maxWinsForSingleGame;
      metadata = gameWithMostWins ? { gameName: gameWithMostWins } : undefined;
    } else if (achievement.category === "generalist") {
      currentProgress = numberOfDifferentGamesWon;
      metadata = gamesWonList.length > 0 ? { games: gamesWonList } : undefined;
    }

    const existingPlayerAchievement = await prisma.playerAchievement.findUnique({
      where: {
        playerId_achievementId_groupId: {
          playerId,
          achievementId: achievement.id,
          groupId,
        },
      },
    });

    const isUnlocked = currentProgress >= achievement.goal;
    const wasAlreadyUnlocked = existingPlayerAchievement?.unlockedAt !== null;

    if (existingPlayerAchievement) {
      await prisma.playerAchievement.update({
        where: {
          id: existingPlayerAchievement.id,
        },
        data: {
          progress: currentProgress,
          metadata: metadata as Prisma.InputJsonValue,
          unlockedAt: isUnlocked && !wasAlreadyUnlocked ? new Date() : existingPlayerAchievement.unlockedAt,
        },
      });

      if (isUnlocked && !wasAlreadyUnlocked) {
        newlyUnlocked.push({
          id: achievement.id,
          key: achievement.key,
          name: achievement.name,
          description: achievement.description,
          tier: achievement.tier,
          points: achievement.points,
        });
      }
    } else {
      await prisma.playerAchievement.create({
        data: {
          playerId,
          achievementId: achievement.id,
          groupId,
          progress: currentProgress,
          metadata: metadata as Prisma.InputJsonValue,
          unlockedAt: isUnlocked ? new Date() : null,
        },
      });

      if (isUnlocked) {
        newlyUnlocked.push({
          id: achievement.id,
          key: achievement.key,
          name: achievement.name,
          description: achievement.description,
          tier: achievement.tier,
          points: achievement.points,
        });
      }
    }
  }

  return newlyUnlocked;
}

export async function getPlayerAchievements(
  prisma: PrismaClient,
  playerId: string,
  groupId: string
) {
  const playerAchievements = await prisma.playerAchievement.findMany({
    where: {
      playerId,
      groupId,
    },
    include: {
      achievement: true,
    },
    orderBy: {
      achievement: {
        category: "asc",
      },
    },
  });

  return playerAchievements.map((pa) => ({
    id: pa.id,
    achievementId: pa.achievement.id,
    key: pa.achievement.key,
    name: pa.achievement.name,
    description: pa.achievement.description,
    category: pa.achievement.category,
    tier: pa.achievement.tier,
    tierOrder: pa.achievement.tierOrder,
    groupKey: pa.achievement.groupKey,
    goal: pa.achievement.goal,
    progress: pa.progress,
    fulfilled: pa.unlockedAt !== null,
    unlockedAt: pa.unlockedAt,
    points: pa.achievement.points,
    iconType: pa.achievement.iconType,
    metadata: pa.metadata,
  }));
}
