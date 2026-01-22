-- Insert achievements for unique mechanics won (4 tiers)
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-mechanic-explorer-apprentice', 'mechanic_explorer_apprentice', 'Mechanic Explorer Apprentice', 'Win games with 5 different mechanics', 'mechanic_explorer', 'bronze', 5, 'puzzle', 10, 'win_unique_mechanics', 1, NOW(), NOW()),
('ach-mechanic-explorer-journeyman', 'mechanic_explorer_journeyman', 'Mechanic Explorer Journeyman', 'Win games with 10 different mechanics', 'mechanic_explorer', 'silver', 10, 'puzzle', 25, 'win_unique_mechanics', 2, NOW(), NOW()),
('ach-mechanic-explorer-expert', 'mechanic_explorer_expert', 'Mechanic Explorer Expert', 'Win games with 20 different mechanics', 'mechanic_explorer', 'gold', 20, 'puzzle', 50, 'win_unique_mechanics', 3, NOW(), NOW()),
('ach-mechanic-explorer-master', 'mechanic_explorer_master', 'Mechanic Explorer Master', 'Win games with 35 different mechanics', 'mechanic_explorer', 'platinum', 35, 'puzzle', 100, 'win_unique_mechanics', 4, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `category` = VALUES(`category`),
  `tier` = VALUES(`tier`),
  `goal` = VALUES(`goal`),
  `iconType` = VALUES(`iconType`),
  `points` = VALUES(`points`),
  `groupKey` = VALUES(`groupKey`),
  `tierOrder` = VALUES(`tierOrder`),
  `updatedAt` = NOW();

-- Insert rule for unique mechanics won achievements (COUNT_UNIQUE_MECHANICS)
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_unique_mechanics',
    'COUNT_UNIQUE_MECHANICS',
    '{"position": 1}',
    'COUNT_DISTINCT',
    'mechanicId',
    '{"extractMechanicNames": true, "field": "mechanics"}',
    NOW(),
    NOW()
);
