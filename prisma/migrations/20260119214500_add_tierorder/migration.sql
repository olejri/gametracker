-- Step 1: Add tierOrder column with default value
ALTER TABLE `Achievement` ADD COLUMN `tierOrder` INT NOT NULL DEFAULT 0;

-- Step 2: Update existing 8 production achievements with tierOrder values
-- Specialist achievements (bronze=1, silver=2, gold=3, platinum=4)
UPDATE `Achievement` SET `tierOrder` = 1 WHERE `key` = 'specialist_apprentice';
UPDATE `Achievement` SET `tierOrder` = 2 WHERE `key` = 'specialist_journeyman';
UPDATE `Achievement` SET `tierOrder` = 3 WHERE `key` = 'specialist_expert';
UPDATE `Achievement` SET `tierOrder` = 4 WHERE `key` = 'specialist_master';

-- Generalist achievements (bronze=1, silver=2, gold=3, platinum=4)
UPDATE `Achievement` SET `tierOrder` = 1 WHERE `key` = 'generalist_apprentice';
UPDATE `Achievement` SET `tierOrder` = 2 WHERE `key` = 'generalist_journeyman';
UPDATE `Achievement` SET `tierOrder` = 3 WHERE `key` = 'generalist_expert';
UPDATE `Achievement` SET `tierOrder` = 4 WHERE `key` = 'generalist_master';
