import { type PrismaClient, Prisma } from "@prisma/client";
import { executeAchievementRule } from "./achievementRuleEngine";

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

  // Get all achievements
  const achievements = await prisma.achievement.findMany();

  // Get all rules
  const rules = await prisma.achievementRule.findMany();
  const rulesByGroupKey = new Map(rules.map(rule => [rule.groupKey, rule]));

  for (const achievement of achievements) {
    const rule = rulesByGroupKey.get(achievement.groupKey);
    
    if (!rule) {
      continue;
    }

    let currentProgress = 0;
    let metadata: Record<string, unknown> | undefined = undefined;

    try {
      const result = await executeAchievementRule(
        prisma,
        achievement.groupKey,
        playerId,
        groupId
      );
      currentProgress = result.progress;
      metadata = result.metadata;
    } catch (error) {
      console.error(`Error executing rule for achievement ${achievement.key}:`, error);
      continue;
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
