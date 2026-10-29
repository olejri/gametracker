-- AlterTable
ALTER TABLE `Game` ADD COLUMN `bggAverage` DOUBLE NULL,
    ADD COLUMN `bggBayesAverage` DOUBLE NULL,
    ADD COLUMN `bggId` INTEGER NULL,
    ADD COLUMN `bggRank` INTEGER NULL,
    ADD COLUMN `bggUpdatedAt` DATETIME(3) NULL,
    ADD COLUMN `bggUsersRated` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Game_bggId_key` ON `Game`(`bggId`);
