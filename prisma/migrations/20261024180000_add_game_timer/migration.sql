-- CreateTable
CREATE TABLE `GameTimer` (
    `id` VARCHAR(191) NOT NULL,
    `gameSessionId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'setup',
    `activePlayerId` VARCHAR(191) NULL,
    `turnStartedAt` DATETIME(3) NULL,
    `pausedFrom` VARCHAR(191) NULL,
    `adminMs` INTEGER NOT NULL DEFAULT 0,
    `totalMs` INTEGER NULL,
    `startedAt` DATETIME(3) NULL,
    `finishedAt` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GameTimer_gameSessionId_key`(`gameSessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameTimerPlayer` (
    `id` VARCHAR(191) NOT NULL,
    `timerId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `seatOrder` INTEGER NOT NULL,
    `startMs` INTEGER NOT NULL,
    `remainingMs` INTEGER NOT NULL,

    INDEX `GameTimerPlayer_playerId_idx`(`playerId`),
    UNIQUE INDEX `GameTimerPlayer_timerId_playerId_key`(`timerId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameTimerTurn` (
    `id` VARCHAR(191) NOT NULL,
    `timerId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NULL,
    `startedAt` DATETIME(3) NOT NULL,
    `endedAt` DATETIME(3) NOT NULL,

    INDEX `GameTimerTurn_timerId_idx`(`timerId`),
    INDEX `GameTimerTurn_playerId_idx`(`playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

