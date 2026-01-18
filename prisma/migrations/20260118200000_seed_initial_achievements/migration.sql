-- Insert initial 8 achievements
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `createdAt`, `updatedAt`) VALUES
('ach-specialist-apprentice', 'specialist_apprentice', 'Specialist Apprentice', 'Win the same game 5 times', 'specialist', 'bronze', 5, 'trophy', 10, NOW(), NOW()),
('ach-specialist-journeyman', 'specialist_journeyman', 'Specialist Journeyman', 'Win the same game 10 times', 'specialist', 'silver', 10, 'trophy', 25, NOW(), NOW()),
('ach-specialist-expert', 'specialist_expert', 'Specialist Expert', 'Win the same game 25 times', 'specialist', 'gold', 25, 'trophy', 50, NOW(), NOW()),
('ach-specialist-master', 'specialist_master', 'Specialist Master', 'Win the same game 50 times', 'specialist', 'platinum', 50, 'trophy', 100, NOW(), NOW()),
('ach-generalist-apprentice', 'generalist_apprentice', 'Generalist Apprentice', 'Win 5 different games', 'generalist', 'bronze', 5, 'star', 10, NOW(), NOW()),
('ach-generalist-journeyman', 'generalist_journeyman', 'Generalist Journeyman', 'Win 10 different games', 'generalist', 'silver', 10, 'star', 25, NOW(), NOW()),
('ach-generalist-expert', 'generalist_expert', 'Generalist Expert', 'Win 25 different games', 'generalist', 'gold', 25, 'star', 50, NOW(), NOW()),
('ach-generalist-master', 'generalist_master', 'Generalist Master', 'Win 50 different games', 'generalist', 'platinum', 50, 'star', 100, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `category` = VALUES(`category`),
  `tier` = VALUES(`tier`),
  `goal` = VALUES(`goal`),
  `iconType` = VALUES(`iconType`),
  `points` = VALUES(`points`),
  `updatedAt` = NOW();
