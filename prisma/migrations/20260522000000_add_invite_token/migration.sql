-- AlterTable
ALTER TABLE `GameGroup` ADD COLUMN `inviteToken` VARCHAR(191) NULL,
                        ADD COLUMN `inviteTokenExpiresAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `GameGroup_inviteToken_key` ON `GameGroup`(`inviteToken`);

