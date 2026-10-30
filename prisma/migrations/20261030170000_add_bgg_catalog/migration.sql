-- AlterTable
ALTER TABLE `Game` ADD COLUMN `bggWeight` DOUBLE NULL;

-- CreateTable
CREATE TABLE `BggCatalogGame` (
    `bggId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `year` INTEGER NULL,
    `rank` INTEGER NULL,
    `average` DOUBLE NULL,
    `bayesAverage` DOUBLE NULL,
    `usersRated` INTEGER NULL,
    `weight` DOUBLE NULL,
    `minPlayers` INTEGER NULL,
    `maxPlayers` INTEGER NULL,
    `bestPlayers` VARCHAR(191) NULL,
    `minPlaytime` INTEGER NULL,
    `maxPlaytime` INTEGER NULL,
    `thumbnail` TEXT NULL,
    `mechanics` TEXT NOT NULL,
    `categories` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BggCatalogGame_rank_idx`(`rank`),
    PRIMARY KEY (`bggId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
