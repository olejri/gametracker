-- CreateTable
CREATE TABLE `Announcement` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnnouncementDismissal` (
    `id` VARCHAR(191) NOT NULL,
    `announcementId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `dismissedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AnnouncementDismissal_playerId_idx`(`playerId`),
    UNIQUE INDEX `AnnouncementDismissal_announcementId_playerId_key`(`announcementId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- First announcement. Each line of `body` is shown as one bullet in the popup.
INSERT INTO `Announcement` (`id`, `title`, `body`, `active`, `createdAt`) VALUES
('2026-10-mobile-and-photos', 'What''s new in Game Tracker',
'A more compact layout on mobile, so more fits on your screen at the game table.\nPolished dark mode across the app, including the sign-in and account menus.\nAdd up to 3 photos to each game session, straight from your camera or gallery.\nSwipe between photos when viewing a session.',
true, NOW());
