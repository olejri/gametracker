-- Step 1: Add groupKey as nullable first
ALTER TABLE `Achievement` ADD COLUMN `groupKey` VARCHAR(191);

-- Step 2: Update existing 8 production achievements with appropriate groupKey values
-- Specialist achievements (win same game X times)
UPDATE `Achievement` SET `groupKey` = 'win_same_game' WHERE `key` IN ('specialist_apprentice', 'specialist_journeyman', 'specialist_expert', 'specialist_master');

-- Generalist achievements (win X different games)
UPDATE `Achievement` SET `groupKey` = 'win_different_games' WHERE `key` IN ('generalist_apprentice', 'generalist_journeyman', 'generalist_expert', 'generalist_master');

-- Set a default groupKey for any remaining achievements that don't match patterns
UPDATE `Achievement` SET `groupKey` = 'general' WHERE `groupKey` IS NULL;

-- Step 3: Now make groupKey NOT NULL
ALTER TABLE `Achievement` MODIFY COLUMN `groupKey` VARCHAR(191) NOT NULL;

-- Step 4: Create indexes
CREATE INDEX `Achievement_groupKey_idx` ON `Achievement`(`groupKey`);
CREATE UNIQUE INDEX `Achievement_groupKey_tier_key` ON `Achievement`(`groupKey`, `tier`);
