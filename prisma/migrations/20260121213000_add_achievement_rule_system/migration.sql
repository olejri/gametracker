-- CreateTable
CREATE TABLE IF NOT EXISTS `AchievementRule` (
    `id` VARCHAR(191) NOT NULL,
    `groupKey` VARCHAR(191) NOT NULL,
    `ruleType` VARCHAR(191) NOT NULL,
    `filters` JSON NULL,
    `aggregation` VARCHAR(191) NOT NULL,
    `targetField` VARCHAR(191) NULL,
    `metadataConfig` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AchievementRule_groupKey_key`(`groupKey`),
    INDEX `AchievementRule_groupKey_idx`(`groupKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert rule for specialist achievements (COUNT_WINS_PER_GAME)
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_same_game',
    'COUNT_WINS_PER_GAME',
    '{"position": 1}',
    'MAX_PER_GROUP',
    'gameId',
    '{"extractGameName": true, "field": "gameName"}',
    NOW(),
    NOW()
);

-- Insert rule for generalist achievements (COUNT_UNIQUE_GAMES)
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_different_games',
    'COUNT_UNIQUE_GAMES',
    '{"position": 1}',
    'COUNT_DISTINCT',
    'gameId',
    '{"extractGameNames": true, "field": "games"}',
    NOW(),
    NOW()
);
