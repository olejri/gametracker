-- Example: Deck Building achievements using COUNT_WINS with mechanic filter
-- This demonstrates how to create achievements for a specific mechanic without code changes

-- Insert achievements for Deck Building wins (4 tiers)
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-deck-builder-apprentice', 'deck_builder_apprentice', 'Deck Builder Apprentice', 'Win 10 games with Deck Building mechanic', 'deck_builder', 'bronze', 10, 'sparkles', 10, 'win_deck_building', 1, NOW(), NOW()),
('ach-deck-builder-journeyman', 'deck_builder_journeyman', 'Deck Builder Journeyman', 'Win 25 games with Deck Building mechanic', 'deck_builder', 'silver', 25, 'sparkles', 25, 'win_deck_building', 2, NOW(), NOW()),
('ach-deck-builder-expert', 'deck_builder_expert', 'Deck Builder Expert', 'Win 50 games with Deck Building mechanic', 'deck_builder', 'gold', 50, 'sparkles', 50, 'win_deck_building', 3, NOW(), NOW()),
('ach-deck-builder-master', 'deck_builder_master', 'Deck Builder Master', 'Win 100 games with Deck Building mechanic', 'deck_builder', 'platinum', 100, 'sparkles', 100, 'win_deck_building', 4, NOW(), NOW())
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

-- Insert rule for Deck Building wins (COUNT_WINS with mechanicName filter)
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_deck_building',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Deck Building"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);
