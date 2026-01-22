-- Migration: Add mechanic-based achievements
-- This creates achievements for winning games with specific mechanics
-- Uses the COUNT_WINS rule type with mechanicName filter

-- Achievements for Take That
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-take_that-bronze', 'take_that_bronze', 'Take That Bronze', 'Win 10 games with Take That', 'take_that', 'bronze', 10, 'sparkles', 10, 'win_take_that', 1, NOW(), NOW()),
('ach-take_that-silver', 'take_that_silver', 'Take That Silver', 'Win 25 games with Take That', 'take_that', 'silver', 25, 'sparkles', 25, 'win_take_that', 2, NOW(), NOW()),
('ach-take_that-gold', 'take_that_gold', 'Take That Gold', 'Win 50 games with Take That', 'take_that', 'gold', 50, 'sparkles', 50, 'win_take_that', 3, NOW(), NOW()),
('ach-take_that-platinum', 'take_that_platinum', 'Take That Platinum', 'Win 100 games with Take That', 'take_that', 'platinum', 100, 'sparkles', 100, 'win_take_that', 4, NOW(), NOW())
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

-- Rule for Take That
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_take_that',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Take That"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Hand Management
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-hand_management-bronze', 'hand_management_bronze', 'Hand Management Bronze', 'Win 10 games with Hand Management', 'hand_management', 'bronze', 10, 'sparkles', 10, 'win_hand_management', 1, NOW(), NOW()),
('ach-hand_management-silver', 'hand_management_silver', 'Hand Management Silver', 'Win 25 games with Hand Management', 'hand_management', 'silver', 25, 'sparkles', 25, 'win_hand_management', 2, NOW(), NOW()),
('ach-hand_management-gold', 'hand_management_gold', 'Hand Management Gold', 'Win 50 games with Hand Management', 'hand_management', 'gold', 50, 'sparkles', 50, 'win_hand_management', 3, NOW(), NOW()),
('ach-hand_management-platinum', 'hand_management_platinum', 'Hand Management Platinum', 'Win 100 games with Hand Management', 'hand_management', 'platinum', 100, 'sparkles', 100, 'win_hand_management', 4, NOW(), NOW())
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

-- Rule for Hand Management
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_hand_management',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Hand Management"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Variable Player Powers
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-variable_player_powers-bronze', 'variable_player_powers_bronze', 'Variable Player Powers Bronze', 'Win 10 games with Variable Player Powers', 'variable_player_powers', 'bronze', 10, 'sparkles', 10, 'win_variable_player_powers', 1, NOW(), NOW()),
('ach-variable_player_powers-silver', 'variable_player_powers_silver', 'Variable Player Powers Silver', 'Win 25 games with Variable Player Powers', 'variable_player_powers', 'silver', 25, 'sparkles', 25, 'win_variable_player_powers', 2, NOW(), NOW()),
('ach-variable_player_powers-gold', 'variable_player_powers_gold', 'Variable Player Powers Gold', 'Win 50 games with Variable Player Powers', 'variable_player_powers', 'gold', 50, 'sparkles', 50, 'win_variable_player_powers', 3, NOW(), NOW()),
('ach-variable_player_powers-platinum', 'variable_player_powers_platinum', 'Variable Player Powers Platinum', 'Win 100 games with Variable Player Powers', 'variable_player_powers', 'platinum', 100, 'sparkles', 100, 'win_variable_player_powers', 4, NOW(), NOW())
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

-- Rule for Variable Player Powers
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_variable_player_powers',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Variable Player Powers"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Variable Phase Order
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-variable_phase_order-bronze', 'variable_phase_order_bronze', 'Variable Phase Order Bronze', 'Win 10 games with Variable Phase Order', 'variable_phase_order', 'bronze', 10, 'sparkles', 10, 'win_variable_phase_order', 1, NOW(), NOW()),
('ach-variable_phase_order-silver', 'variable_phase_order_silver', 'Variable Phase Order Silver', 'Win 25 games with Variable Phase Order', 'variable_phase_order', 'silver', 25, 'sparkles', 25, 'win_variable_phase_order', 2, NOW(), NOW()),
('ach-variable_phase_order-gold', 'variable_phase_order_gold', 'Variable Phase Order Gold', 'Win 50 games with Variable Phase Order', 'variable_phase_order', 'gold', 50, 'sparkles', 50, 'win_variable_phase_order', 3, NOW(), NOW()),
('ach-variable_phase_order-platinum', 'variable_phase_order_platinum', 'Variable Phase Order Platinum', 'Win 100 games with Variable Phase Order', 'variable_phase_order', 'platinum', 100, 'sparkles', 100, 'win_variable_phase_order', 4, NOW(), NOW())
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

-- Rule for Variable Phase Order
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_variable_phase_order',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Variable Phase Order"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Tile Placement
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-tile_placement-bronze', 'tile_placement_bronze', 'Tile Placement Bronze', 'Win 10 games with Tile Placement', 'tile_placement', 'bronze', 10, 'sparkles', 10, 'win_tile_placement', 1, NOW(), NOW()),
('ach-tile_placement-silver', 'tile_placement_silver', 'Tile Placement Silver', 'Win 25 games with Tile Placement', 'tile_placement', 'silver', 25, 'sparkles', 25, 'win_tile_placement', 2, NOW(), NOW()),
('ach-tile_placement-gold', 'tile_placement_gold', 'Tile Placement Gold', 'Win 50 games with Tile Placement', 'tile_placement', 'gold', 50, 'sparkles', 50, 'win_tile_placement', 3, NOW(), NOW()),
('ach-tile_placement-platinum', 'tile_placement_platinum', 'Tile Placement Platinum', 'Win 100 games with Tile Placement', 'tile_placement', 'platinum', 100, 'sparkles', 100, 'win_tile_placement', 4, NOW(), NOW())
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

-- Rule for Tile Placement
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_tile_placement',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Tile Placement"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Player Elimination
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-player_elimination-bronze', 'player_elimination_bronze', 'Player Elimination Bronze', 'Win 10 games with Player Elimination', 'player_elimination', 'bronze', 10, 'sparkles', 10, 'win_player_elimination', 1, NOW(), NOW()),
('ach-player_elimination-silver', 'player_elimination_silver', 'Player Elimination Silver', 'Win 25 games with Player Elimination', 'player_elimination', 'silver', 25, 'sparkles', 25, 'win_player_elimination', 2, NOW(), NOW()),
('ach-player_elimination-gold', 'player_elimination_gold', 'Player Elimination Gold', 'Win 50 games with Player Elimination', 'player_elimination', 'gold', 50, 'sparkles', 50, 'win_player_elimination', 3, NOW(), NOW()),
('ach-player_elimination-platinum', 'player_elimination_platinum', 'Player Elimination Platinum', 'Win 100 games with Player Elimination', 'player_elimination', 'platinum', 100, 'sparkles', 100, 'win_player_elimination', 4, NOW(), NOW())
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

-- Rule for Player Elimination
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_player_elimination',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Player Elimination"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Modular Board
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-modular_board-bronze', 'modular_board_bronze', 'Modular Board Bronze', 'Win 10 games with Modular Board', 'modular_board', 'bronze', 10, 'sparkles', 10, 'win_modular_board', 1, NOW(), NOW()),
('ach-modular_board-silver', 'modular_board_silver', 'Modular Board Silver', 'Win 25 games with Modular Board', 'modular_board', 'silver', 25, 'sparkles', 25, 'win_modular_board', 2, NOW(), NOW()),
('ach-modular_board-gold', 'modular_board_gold', 'Modular Board Gold', 'Win 50 games with Modular Board', 'modular_board', 'gold', 50, 'sparkles', 50, 'win_modular_board', 3, NOW(), NOW()),
('ach-modular_board-platinum', 'modular_board_platinum', 'Modular Board Platinum', 'Win 100 games with Modular Board', 'modular_board', 'platinum', 100, 'sparkles', 100, 'win_modular_board', 4, NOW(), NOW())
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

-- Rule for Modular Board
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_modular_board',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Modular Board"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Grid Movement
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-grid_movement-bronze', 'grid_movement_bronze', 'Grid Movement Bronze', 'Win 10 games with Grid Movement', 'grid_movement', 'bronze', 10, 'sparkles', 10, 'win_grid_movement', 1, NOW(), NOW()),
('ach-grid_movement-silver', 'grid_movement_silver', 'Grid Movement Silver', 'Win 25 games with Grid Movement', 'grid_movement', 'silver', 25, 'sparkles', 25, 'win_grid_movement', 2, NOW(), NOW()),
('ach-grid_movement-gold', 'grid_movement_gold', 'Grid Movement Gold', 'Win 50 games with Grid Movement', 'grid_movement', 'gold', 50, 'sparkles', 50, 'win_grid_movement', 3, NOW(), NOW()),
('ach-grid_movement-platinum', 'grid_movement_platinum', 'Grid Movement Platinum', 'Win 100 games with Grid Movement', 'grid_movement', 'platinum', 100, 'sparkles', 100, 'win_grid_movement', 4, NOW(), NOW())
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

-- Rule for Grid Movement
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_grid_movement',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Grid Movement"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Dice Rolling
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-dice_rolling-bronze', 'dice_rolling_bronze', 'Dice Rolling Bronze', 'Win 10 games with Dice Rolling', 'dice_rolling', 'bronze', 10, 'sparkles', 10, 'win_dice_rolling', 1, NOW(), NOW()),
('ach-dice_rolling-silver', 'dice_rolling_silver', 'Dice Rolling Silver', 'Win 25 games with Dice Rolling', 'dice_rolling', 'silver', 25, 'sparkles', 25, 'win_dice_rolling', 2, NOW(), NOW()),
('ach-dice_rolling-gold', 'dice_rolling_gold', 'Dice Rolling Gold', 'Win 50 games with Dice Rolling', 'dice_rolling', 'gold', 50, 'sparkles', 50, 'win_dice_rolling', 3, NOW(), NOW()),
('ach-dice_rolling-platinum', 'dice_rolling_platinum', 'Dice Rolling Platinum', 'Win 100 games with Dice Rolling', 'dice_rolling', 'platinum', 100, 'sparkles', 100, 'win_dice_rolling', 4, NOW(), NOW())
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

-- Rule for Dice Rolling
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_dice_rolling',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Dice Rolling"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Area Control
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-area_control-bronze', 'area_control_bronze', 'Area Control Bronze', 'Win 10 games with Area Control', 'area_control', 'bronze', 10, 'sparkles', 10, 'win_area_control', 1, NOW(), NOW()),
('ach-area_control-silver', 'area_control_silver', 'Area Control Silver', 'Win 25 games with Area Control', 'area_control', 'silver', 25, 'sparkles', 25, 'win_area_control', 2, NOW(), NOW()),
('ach-area_control-gold', 'area_control_gold', 'Area Control Gold', 'Win 50 games with Area Control', 'area_control', 'gold', 50, 'sparkles', 50, 'win_area_control', 3, NOW(), NOW()),
('ach-area_control-platinum', 'area_control_platinum', 'Area Control Platinum', 'Win 100 games with Area Control', 'area_control', 'platinum', 100, 'sparkles', 100, 'win_area_control', 4, NOW(), NOW())
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

-- Rule for Area Control
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_area_control',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Area Control"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Set Collection
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-set_collection-bronze', 'set_collection_bronze', 'Set Collection Bronze', 'Win 10 games with Set Collection', 'set_collection', 'bronze', 10, 'sparkles', 10, 'win_set_collection', 1, NOW(), NOW()),
('ach-set_collection-silver', 'set_collection_silver', 'Set Collection Silver', 'Win 25 games with Set Collection', 'set_collection', 'silver', 25, 'sparkles', 25, 'win_set_collection', 2, NOW(), NOW()),
('ach-set_collection-gold', 'set_collection_gold', 'Set Collection Gold', 'Win 50 games with Set Collection', 'set_collection', 'gold', 50, 'sparkles', 50, 'win_set_collection', 3, NOW(), NOW()),
('ach-set_collection-platinum', 'set_collection_platinum', 'Set Collection Platinum', 'Win 100 games with Set Collection', 'set_collection', 'platinum', 100, 'sparkles', 100, 'win_set_collection', 4, NOW(), NOW())
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

-- Rule for Set Collection
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_set_collection',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Set Collection"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Negotiation
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-negotiation-bronze', 'negotiation_bronze', 'Negotiation Bronze', 'Win 10 games with Negotiation', 'negotiation', 'bronze', 10, 'sparkles', 10, 'win_negotiation', 1, NOW(), NOW()),
('ach-negotiation-silver', 'negotiation_silver', 'Negotiation Silver', 'Win 25 games with Negotiation', 'negotiation', 'silver', 25, 'sparkles', 25, 'win_negotiation', 2, NOW(), NOW()),
('ach-negotiation-gold', 'negotiation_gold', 'Negotiation Gold', 'Win 50 games with Negotiation', 'negotiation', 'gold', 50, 'sparkles', 50, 'win_negotiation', 3, NOW(), NOW()),
('ach-negotiation-platinum', 'negotiation_platinum', 'Negotiation Platinum', 'Win 100 games with Negotiation', 'negotiation', 'platinum', 100, 'sparkles', 100, 'win_negotiation', 4, NOW(), NOW())
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

-- Rule for Negotiation
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_negotiation',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Negotiation"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Drafting
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-drafting-bronze', 'drafting_bronze', 'Drafting Bronze', 'Win 10 games with Drafting', 'drafting', 'bronze', 10, 'sparkles', 10, 'win_drafting', 1, NOW(), NOW()),
('ach-drafting-silver', 'drafting_silver', 'Drafting Silver', 'Win 25 games with Drafting', 'drafting', 'silver', 25, 'sparkles', 25, 'win_drafting', 2, NOW(), NOW()),
('ach-drafting-gold', 'drafting_gold', 'Drafting Gold', 'Win 50 games with Drafting', 'drafting', 'gold', 50, 'sparkles', 50, 'win_drafting', 3, NOW(), NOW()),
('ach-drafting-platinum', 'drafting_platinum', 'Drafting Platinum', 'Win 100 games with Drafting', 'drafting', 'platinum', 100, 'sparkles', 100, 'win_drafting', 4, NOW(), NOW())
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

-- Rule for Drafting
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_drafting',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Drafting"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Bribery
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-bribery-bronze', 'bribery_bronze', 'Bribery Bronze', 'Win 10 games with Bribery', 'bribery', 'bronze', 10, 'sparkles', 10, 'win_bribery', 1, NOW(), NOW()),
('ach-bribery-silver', 'bribery_silver', 'Bribery Silver', 'Win 25 games with Bribery', 'bribery', 'silver', 25, 'sparkles', 25, 'win_bribery', 2, NOW(), NOW()),
('ach-bribery-gold', 'bribery_gold', 'Bribery Gold', 'Win 50 games with Bribery', 'bribery', 'gold', 50, 'sparkles', 50, 'win_bribery', 3, NOW(), NOW()),
('ach-bribery-platinum', 'bribery_platinum', 'Bribery Platinum', 'Win 100 games with Bribery', 'bribery', 'platinum', 100, 'sparkles', 100, 'win_bribery', 4, NOW(), NOW())
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

-- Rule for Bribery
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_bribery',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Bribery"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Bluffing
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-bluffing-bronze', 'bluffing_bronze', 'Bluffing Bronze', 'Win 10 games with Bluffing', 'bluffing', 'bronze', 10, 'sparkles', 10, 'win_bluffing', 1, NOW(), NOW()),
('ach-bluffing-silver', 'bluffing_silver', 'Bluffing Silver', 'Win 25 games with Bluffing', 'bluffing', 'silver', 25, 'sparkles', 25, 'win_bluffing', 2, NOW(), NOW()),
('ach-bluffing-gold', 'bluffing_gold', 'Bluffing Gold', 'Win 50 games with Bluffing', 'bluffing', 'gold', 50, 'sparkles', 50, 'win_bluffing', 3, NOW(), NOW()),
('ach-bluffing-platinum', 'bluffing_platinum', 'Bluffing Platinum', 'Win 100 games with Bluffing', 'bluffing', 'platinum', 100, 'sparkles', 100, 'win_bluffing', 4, NOW(), NOW())
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

-- Rule for Bluffing
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_bluffing',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Bluffing"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Betting
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-betting-bronze', 'betting_bronze', 'Betting Bronze', 'Win 10 games with Betting', 'betting', 'bronze', 10, 'sparkles', 10, 'win_betting', 1, NOW(), NOW()),
('ach-betting-silver', 'betting_silver', 'Betting Silver', 'Win 25 games with Betting', 'betting', 'silver', 25, 'sparkles', 25, 'win_betting', 2, NOW(), NOW()),
('ach-betting-gold', 'betting_gold', 'Betting Gold', 'Win 50 games with Betting', 'betting', 'gold', 50, 'sparkles', 50, 'win_betting', 3, NOW(), NOW()),
('ach-betting-platinum', 'betting_platinum', 'Betting Platinum', 'Win 100 games with Betting', 'betting', 'platinum', 100, 'sparkles', 100, 'win_betting', 4, NOW(), NOW())
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

-- Rule for Betting
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_betting',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Betting"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Trick-taking
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-trick_taking-bronze', 'trick_taking_bronze', 'Trick-taking Bronze', 'Win 10 games with Trick-taking', 'trick_taking', 'bronze', 10, 'sparkles', 10, 'win_trick_taking', 1, NOW(), NOW()),
('ach-trick_taking-silver', 'trick_taking_silver', 'Trick-taking Silver', 'Win 25 games with Trick-taking', 'trick_taking', 'silver', 25, 'sparkles', 25, 'win_trick_taking', 2, NOW(), NOW()),
('ach-trick_taking-gold', 'trick_taking_gold', 'Trick-taking Gold', 'Win 50 games with Trick-taking', 'trick_taking', 'gold', 50, 'sparkles', 50, 'win_trick_taking', 3, NOW(), NOW()),
('ach-trick_taking-platinum', 'trick_taking_platinum', 'Trick-taking Platinum', 'Win 100 games with Trick-taking', 'trick_taking', 'platinum', 100, 'sparkles', 100, 'win_trick_taking', 4, NOW(), NOW())
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

-- Rule for Trick-taking
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_trick_taking',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Trick-taking"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Tableau Building
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-tableau_building-bronze', 'tableau_building_bronze', 'Tableau Building Bronze', 'Win 10 games with Tableau Building', 'tableau_building', 'bronze', 10, 'sparkles', 10, 'win_tableau_building', 1, NOW(), NOW()),
('ach-tableau_building-silver', 'tableau_building_silver', 'Tableau Building Silver', 'Win 25 games with Tableau Building', 'tableau_building', 'silver', 25, 'sparkles', 25, 'win_tableau_building', 2, NOW(), NOW()),
('ach-tableau_building-gold', 'tableau_building_gold', 'Tableau Building Gold', 'Win 50 games with Tableau Building', 'tableau_building', 'gold', 50, 'sparkles', 50, 'win_tableau_building', 3, NOW(), NOW()),
('ach-tableau_building-platinum', 'tableau_building_platinum', 'Tableau Building Platinum', 'Win 100 games with Tableau Building', 'tableau_building', 'platinum', 100, 'sparkles', 100, 'win_tableau_building', 4, NOW(), NOW())
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

-- Rule for Tableau Building
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_tableau_building',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Tableau Building"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Income
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-income-bronze', 'income_bronze', 'Income Bronze', 'Win 10 games with Income', 'income', 'bronze', 10, 'sparkles', 10, 'win_income', 1, NOW(), NOW()),
('ach-income-silver', 'income_silver', 'Income Silver', 'Win 25 games with Income', 'income', 'silver', 25, 'sparkles', 25, 'win_income', 2, NOW(), NOW()),
('ach-income-gold', 'income_gold', 'Income Gold', 'Win 50 games with Income', 'income', 'gold', 50, 'sparkles', 50, 'win_income', 3, NOW(), NOW()),
('ach-income-platinum', 'income_platinum', 'Income Platinum', 'Win 100 games with Income', 'income', 'platinum', 100, 'sparkles', 100, 'win_income', 4, NOW(), NOW())
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

-- Rule for Income
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_income',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Income"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Hexagon Grid
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-hexagon_grid-bronze', 'hexagon_grid_bronze', 'Hexagon Grid Bronze', 'Win 10 games with Hexagon Grid', 'hexagon_grid', 'bronze', 10, 'sparkles', 10, 'win_hexagon_grid', 1, NOW(), NOW()),
('ach-hexagon_grid-silver', 'hexagon_grid_silver', 'Hexagon Grid Silver', 'Win 25 games with Hexagon Grid', 'hexagon_grid', 'silver', 25, 'sparkles', 25, 'win_hexagon_grid', 2, NOW(), NOW()),
('ach-hexagon_grid-gold', 'hexagon_grid_gold', 'Hexagon Grid Gold', 'Win 50 games with Hexagon Grid', 'hexagon_grid', 'gold', 50, 'sparkles', 50, 'win_hexagon_grid', 3, NOW(), NOW()),
('ach-hexagon_grid-platinum', 'hexagon_grid_platinum', 'Hexagon Grid Platinum', 'Win 100 games with Hexagon Grid', 'hexagon_grid', 'platinum', 100, 'sparkles', 100, 'win_hexagon_grid', 4, NOW(), NOW())
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

-- Rule for Hexagon Grid
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_hexagon_grid',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Hexagon Grid"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for End Game Bonuses
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-end_game_bonuses-bronze', 'end_game_bonuses_bronze', 'End Game Bonuses Bronze', 'Win 10 games with End Game Bonuses', 'end_game_bonuses', 'bronze', 10, 'sparkles', 10, 'win_end_game_bonuses', 1, NOW(), NOW()),
('ach-end_game_bonuses-silver', 'end_game_bonuses_silver', 'End Game Bonuses Silver', 'Win 25 games with End Game Bonuses', 'end_game_bonuses', 'silver', 25, 'sparkles', 25, 'win_end_game_bonuses', 2, NOW(), NOW()),
('ach-end_game_bonuses-gold', 'end_game_bonuses_gold', 'End Game Bonuses Gold', 'Win 50 games with End Game Bonuses', 'end_game_bonuses', 'gold', 50, 'sparkles', 50, 'win_end_game_bonuses', 3, NOW(), NOW()),
('ach-end_game_bonuses-platinum', 'end_game_bonuses_platinum', 'End Game Bonuses Platinum', 'Win 100 games with End Game Bonuses', 'end_game_bonuses', 'platinum', 100, 'sparkles', 100, 'win_end_game_bonuses', 4, NOW(), NOW())
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

-- Rule for End Game Bonuses
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_end_game_bonuses',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "End Game Bonuses"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Cooperative Play
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-cooperative_play-bronze', 'cooperative_play_bronze', 'Cooperative Play Bronze', 'Win 10 games with Cooperative Play', 'cooperative_play', 'bronze', 10, 'sparkles', 10, 'win_cooperative_play', 1, NOW(), NOW()),
('ach-cooperative_play-silver', 'cooperative_play_silver', 'Cooperative Play Silver', 'Win 25 games with Cooperative Play', 'cooperative_play', 'silver', 25, 'sparkles', 25, 'win_cooperative_play', 2, NOW(), NOW()),
('ach-cooperative_play-gold', 'cooperative_play_gold', 'Cooperative Play Gold', 'Win 50 games with Cooperative Play', 'cooperative_play', 'gold', 50, 'sparkles', 50, 'win_cooperative_play', 3, NOW(), NOW()),
('ach-cooperative_play-platinum', 'cooperative_play_platinum', 'Cooperative Play Platinum', 'Win 100 games with Cooperative Play', 'cooperative_play', 'platinum', 100, 'sparkles', 100, 'win_cooperative_play', 4, NOW(), NOW())
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

-- Rule for Cooperative Play
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_cooperative_play',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Cooperative Play"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Card Drafting
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-card_drafting-bronze', 'card_drafting_bronze', 'Card Drafting Bronze', 'Win 10 games with Card Drafting', 'card_drafting', 'bronze', 10, 'sparkles', 10, 'win_card_drafting', 1, NOW(), NOW()),
('ach-card_drafting-silver', 'card_drafting_silver', 'Card Drafting Silver', 'Win 25 games with Card Drafting', 'card_drafting', 'silver', 25, 'sparkles', 25, 'win_card_drafting', 2, NOW(), NOW()),
('ach-card_drafting-gold', 'card_drafting_gold', 'Card Drafting Gold', 'Win 50 games with Card Drafting', 'card_drafting', 'gold', 50, 'sparkles', 50, 'win_card_drafting', 3, NOW(), NOW()),
('ach-card_drafting-platinum', 'card_drafting_platinum', 'Card Drafting Platinum', 'Win 100 games with Card Drafting', 'card_drafting', 'platinum', 100, 'sparkles', 100, 'win_card_drafting', 4, NOW(), NOW())
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

-- Rule for Card Drafting
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_card_drafting',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Card Drafting"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Simultaneous Play
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-simultaneous_play-bronze', 'simultaneous_play_bronze', 'Simultaneous Play Bronze', 'Win 10 games with Simultaneous Play', 'simultaneous_play', 'bronze', 10, 'sparkles', 10, 'win_simultaneous_play', 1, NOW(), NOW()),
('ach-simultaneous_play-silver', 'simultaneous_play_silver', 'Simultaneous Play Silver', 'Win 25 games with Simultaneous Play', 'simultaneous_play', 'silver', 25, 'sparkles', 25, 'win_simultaneous_play', 2, NOW(), NOW()),
('ach-simultaneous_play-gold', 'simultaneous_play_gold', 'Simultaneous Play Gold', 'Win 50 games with Simultaneous Play', 'simultaneous_play', 'gold', 50, 'sparkles', 50, 'win_simultaneous_play', 3, NOW(), NOW()),
('ach-simultaneous_play-platinum', 'simultaneous_play_platinum', 'Simultaneous Play Platinum', 'Win 100 games with Simultaneous Play', 'simultaneous_play', 'platinum', 100, 'sparkles', 100, 'win_simultaneous_play', 4, NOW(), NOW())
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

-- Rule for Simultaneous Play
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_simultaneous_play',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Simultaneous Play"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Simulation
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-simulation-bronze', 'simulation_bronze', 'Simulation Bronze', 'Win 10 games with Simulation', 'simulation', 'bronze', 10, 'sparkles', 10, 'win_simulation', 1, NOW(), NOW()),
('ach-simulation-silver', 'simulation_silver', 'Simulation Silver', 'Win 25 games with Simulation', 'simulation', 'silver', 25, 'sparkles', 25, 'win_simulation', 2, NOW(), NOW()),
('ach-simulation-gold', 'simulation_gold', 'Simulation Gold', 'Win 50 games with Simulation', 'simulation', 'gold', 50, 'sparkles', 50, 'win_simulation', 3, NOW(), NOW()),
('ach-simulation-platinum', 'simulation_platinum', 'Simulation Platinum', 'Win 100 games with Simulation', 'simulation', 'platinum', 100, 'sparkles', 100, 'win_simulation', 4, NOW(), NOW())
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

-- Rule for Simulation
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_simulation',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Simulation"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Secret Unit Deployment
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-secret_unit_deployment-bronze', 'secret_unit_deployment_bronze', 'Secret Unit Deployment Bronze', 'Win 10 games with Secret Unit Deployment', 'secret_unit_deployment', 'bronze', 10, 'sparkles', 10, 'win_secret_unit_deployment', 1, NOW(), NOW()),
('ach-secret_unit_deployment-silver', 'secret_unit_deployment_silver', 'Secret Unit Deployment Silver', 'Win 25 games with Secret Unit Deployment', 'secret_unit_deployment', 'silver', 25, 'sparkles', 25, 'win_secret_unit_deployment', 2, NOW(), NOW()),
('ach-secret_unit_deployment-gold', 'secret_unit_deployment_gold', 'Secret Unit Deployment Gold', 'Win 50 games with Secret Unit Deployment', 'secret_unit_deployment', 'gold', 50, 'sparkles', 50, 'win_secret_unit_deployment', 3, NOW(), NOW()),
('ach-secret_unit_deployment-platinum', 'secret_unit_deployment_platinum', 'Secret Unit Deployment Platinum', 'Win 100 games with Secret Unit Deployment', 'secret_unit_deployment', 'platinum', 100, 'sparkles', 100, 'win_secret_unit_deployment', 4, NOW(), NOW())
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

-- Rule for Secret Unit Deployment
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_secret_unit_deployment',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Secret Unit Deployment"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Press Your Luck
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-press_your_luck-bronze', 'press_your_luck_bronze', 'Press Your Luck Bronze', 'Win 10 games with Press Your Luck', 'press_your_luck', 'bronze', 10, 'sparkles', 10, 'win_press_your_luck', 1, NOW(), NOW()),
('ach-press_your_luck-silver', 'press_your_luck_silver', 'Press Your Luck Silver', 'Win 25 games with Press Your Luck', 'press_your_luck', 'silver', 25, 'sparkles', 25, 'win_press_your_luck', 2, NOW(), NOW()),
('ach-press_your_luck-gold', 'press_your_luck_gold', 'Press Your Luck Gold', 'Win 50 games with Press Your Luck', 'press_your_luck', 'gold', 50, 'sparkles', 50, 'win_press_your_luck', 3, NOW(), NOW()),
('ach-press_your_luck-platinum', 'press_your_luck_platinum', 'Press Your Luck Platinum', 'Win 100 games with Press Your Luck', 'press_your_luck', 'platinum', 100, 'sparkles', 100, 'win_press_your_luck', 4, NOW(), NOW())
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

-- Rule for Press Your Luck
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_press_your_luck',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Press Your Luck"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Action Point Allowance System
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-action_point_allowance_system-bronze', 'action_point_allowance_system_bronze', 'Action Point Allowance System Bronze', 'Win 10 games with Action Point Allowance System', 'action_point_allowance_system', 'bronze', 10, 'sparkles', 10, 'win_action_point_allowance_system', 1, NOW(), NOW()),
('ach-action_point_allowance_system-silver', 'action_point_allowance_system_silver', 'Action Point Allowance System Silver', 'Win 25 games with Action Point Allowance System', 'action_point_allowance_system', 'silver', 25, 'sparkles', 25, 'win_action_point_allowance_system', 2, NOW(), NOW()),
('ach-action_point_allowance_system-gold', 'action_point_allowance_system_gold', 'Action Point Allowance System Gold', 'Win 50 games with Action Point Allowance System', 'action_point_allowance_system', 'gold', 50, 'sparkles', 50, 'win_action_point_allowance_system', 3, NOW(), NOW()),
('ach-action_point_allowance_system-platinum', 'action_point_allowance_system_platinum', 'Action Point Allowance System Platinum', 'Win 100 games with Action Point Allowance System', 'action_point_allowance_system', 'platinum', 100, 'sparkles', 100, 'win_action_point_allowance_system', 4, NOW(), NOW())
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

-- Rule for Action Point Allowance System
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_action_point_allowance_system',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Action Point Allowance System"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Engine Building
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-engine_building-bronze', 'engine_building_bronze', 'Engine Building Bronze', 'Win 10 games with Engine Building', 'engine_building', 'bronze', 10, 'sparkles', 10, 'win_engine_building', 1, NOW(), NOW()),
('ach-engine_building-silver', 'engine_building_silver', 'Engine Building Silver', 'Win 25 games with Engine Building', 'engine_building', 'silver', 25, 'sparkles', 25, 'win_engine_building', 2, NOW(), NOW()),
('ach-engine_building-gold', 'engine_building_gold', 'Engine Building Gold', 'Win 50 games with Engine Building', 'engine_building', 'gold', 50, 'sparkles', 50, 'win_engine_building', 3, NOW(), NOW()),
('ach-engine_building-platinum', 'engine_building_platinum', 'Engine Building Platinum', 'Win 100 games with Engine Building', 'engine_building', 'platinum', 100, 'sparkles', 100, 'win_engine_building', 4, NOW(), NOW())
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

-- Rule for Engine Building
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_engine_building',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Engine Building"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Network and Route Building
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-network_and_route_building-bronze', 'network_and_route_building_bronze', 'Network and Route Building Bronze', 'Win 10 games with Network and Route Building', 'network_and_route_building', 'bronze', 10, 'sparkles', 10, 'win_network_and_route_building', 1, NOW(), NOW()),
('ach-network_and_route_building-silver', 'network_and_route_building_silver', 'Network and Route Building Silver', 'Win 25 games with Network and Route Building', 'network_and_route_building', 'silver', 25, 'sparkles', 25, 'win_network_and_route_building', 2, NOW(), NOW()),
('ach-network_and_route_building-gold', 'network_and_route_building_gold', 'Network and Route Building Gold', 'Win 50 games with Network and Route Building', 'network_and_route_building', 'gold', 50, 'sparkles', 50, 'win_network_and_route_building', 3, NOW(), NOW()),
('ach-network_and_route_building-platinum', 'network_and_route_building_platinum', 'Network and Route Building Platinum', 'Win 100 games with Network and Route Building', 'network_and_route_building', 'platinum', 100, 'sparkles', 100, 'win_network_and_route_building', 4, NOW(), NOW())
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

-- Rule for Network and Route Building
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_network_and_route_building',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Network and Route Building"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Partnerships
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-partnerships-bronze', 'partnerships_bronze', 'Partnerships Bronze', 'Win 10 games with Partnerships', 'partnerships', 'bronze', 10, 'sparkles', 10, 'win_partnerships', 1, NOW(), NOW()),
('ach-partnerships-silver', 'partnerships_silver', 'Partnerships Silver', 'Win 25 games with Partnerships', 'partnerships', 'silver', 25, 'sparkles', 25, 'win_partnerships', 2, NOW(), NOW()),
('ach-partnerships-gold', 'partnerships_gold', 'Partnerships Gold', 'Win 50 games with Partnerships', 'partnerships', 'gold', 50, 'sparkles', 50, 'win_partnerships', 3, NOW(), NOW()),
('ach-partnerships-platinum', 'partnerships_platinum', 'Partnerships Platinum', 'Win 100 games with Partnerships', 'partnerships', 'platinum', 100, 'sparkles', 100, 'win_partnerships', 4, NOW(), NOW())
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

-- Rule for Partnerships
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_partnerships',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Partnerships"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Area Movement
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-area_movement-bronze', 'area_movement_bronze', 'Area Movement Bronze', 'Win 10 games with Area Movement', 'area_movement', 'bronze', 10, 'sparkles', 10, 'win_area_movement', 1, NOW(), NOW()),
('ach-area_movement-silver', 'area_movement_silver', 'Area Movement Silver', 'Win 25 games with Area Movement', 'area_movement', 'silver', 25, 'sparkles', 25, 'win_area_movement', 2, NOW(), NOW()),
('ach-area_movement-gold', 'area_movement_gold', 'Area Movement Gold', 'Win 50 games with Area Movement', 'area_movement', 'gold', 50, 'sparkles', 50, 'win_area_movement', 3, NOW(), NOW()),
('ach-area_movement-platinum', 'area_movement_platinum', 'Area Movement Platinum', 'Win 100 games with Area Movement', 'area_movement', 'platinum', 100, 'sparkles', 100, 'win_area_movement', 4, NOW(), NOW())
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

-- Rule for Area Movement
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_area_movement',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Area Movement"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Paper and Pencil
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-paper_and_pencil-bronze', 'paper_and_pencil_bronze', 'Paper and Pencil Bronze', 'Win 10 games with Paper and Pencil', 'paper_and_pencil', 'bronze', 10, 'sparkles', 10, 'win_paper_and_pencil', 1, NOW(), NOW()),
('ach-paper_and_pencil-silver', 'paper_and_pencil_silver', 'Paper and Pencil Silver', 'Win 25 games with Paper and Pencil', 'paper_and_pencil', 'silver', 25, 'sparkles', 25, 'win_paper_and_pencil', 2, NOW(), NOW()),
('ach-paper_and_pencil-gold', 'paper_and_pencil_gold', 'Paper and Pencil Gold', 'Win 50 games with Paper and Pencil', 'paper_and_pencil', 'gold', 50, 'sparkles', 50, 'win_paper_and_pencil', 3, NOW(), NOW()),
('ach-paper_and_pencil-platinum', 'paper_and_pencil_platinum', 'Paper and Pencil Platinum', 'Win 100 games with Paper and Pencil', 'paper_and_pencil', 'platinum', 100, 'sparkles', 100, 'win_paper_and_pencil', 4, NOW(), NOW())
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

-- Rule for Paper and Pencil
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_paper_and_pencil',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Paper and Pencil"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Point to Point Movement
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-point_to_point_movement-bronze', 'point_to_point_movement_bronze', 'Point to Point Movement Bronze', 'Win 10 games with Point to Point Movement', 'point_to_point_movement', 'bronze', 10, 'sparkles', 10, 'win_point_to_point_movement', 1, NOW(), NOW()),
('ach-point_to_point_movement-silver', 'point_to_point_movement_silver', 'Point to Point Movement Silver', 'Win 25 games with Point to Point Movement', 'point_to_point_movement', 'silver', 25, 'sparkles', 25, 'win_point_to_point_movement', 2, NOW(), NOW()),
('ach-point_to_point_movement-gold', 'point_to_point_movement_gold', 'Point to Point Movement Gold', 'Win 50 games with Point to Point Movement', 'point_to_point_movement', 'gold', 50, 'sparkles', 50, 'win_point_to_point_movement', 3, NOW(), NOW()),
('ach-point_to_point_movement-platinum', 'point_to_point_movement_platinum', 'Point to Point Movement Platinum', 'Win 100 games with Point to Point Movement', 'point_to_point_movement', 'platinum', 100, 'sparkles', 100, 'win_point_to_point_movement', 4, NOW(), NOW())
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

-- Rule for Point to Point Movement
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_point_to_point_movement',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Point to Point Movement"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Pick-up and Deliver
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-pick_up_and_deliver-bronze', 'pick_up_and_deliver_bronze', 'Pick-up and Deliver Bronze', 'Win 10 games with Pick-up and Deliver', 'pick_up_and_deliver', 'bronze', 10, 'sparkles', 10, 'win_pick_up_and_deliver', 1, NOW(), NOW()),
('ach-pick_up_and_deliver-silver', 'pick_up_and_deliver_silver', 'Pick-up and Deliver Silver', 'Win 25 games with Pick-up and Deliver', 'pick_up_and_deliver', 'silver', 25, 'sparkles', 25, 'win_pick_up_and_deliver', 2, NOW(), NOW()),
('ach-pick_up_and_deliver-gold', 'pick_up_and_deliver_gold', 'Pick-up and Deliver Gold', 'Win 50 games with Pick-up and Deliver', 'pick_up_and_deliver', 'gold', 50, 'sparkles', 50, 'win_pick_up_and_deliver', 3, NOW(), NOW()),
('ach-pick_up_and_deliver-platinum', 'pick_up_and_deliver_platinum', 'Pick-up and Deliver Platinum', 'Win 100 games with Pick-up and Deliver', 'pick_up_and_deliver', 'platinum', 100, 'sparkles', 100, 'win_pick_up_and_deliver', 4, NOW(), NOW())
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

-- Rule for Pick-up and Deliver
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_pick_up_and_deliver',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Pick-up and Deliver"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Bag Building
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-bag_building-bronze', 'bag_building_bronze', 'Bag Building Bronze', 'Win 10 games with Bag Building', 'bag_building', 'bronze', 10, 'sparkles', 10, 'win_bag_building', 1, NOW(), NOW()),
('ach-bag_building-silver', 'bag_building_silver', 'Bag Building Silver', 'Win 25 games with Bag Building', 'bag_building', 'silver', 25, 'sparkles', 25, 'win_bag_building', 2, NOW(), NOW()),
('ach-bag_building-gold', 'bag_building_gold', 'Bag Building Gold', 'Win 50 games with Bag Building', 'bag_building', 'gold', 50, 'sparkles', 50, 'win_bag_building', 3, NOW(), NOW()),
('ach-bag_building-platinum', 'bag_building_platinum', 'Bag Building Platinum', 'Win 100 games with Bag Building', 'bag_building', 'platinum', 100, 'sparkles', 100, 'win_bag_building', 4, NOW(), NOW())
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

-- Rule for Bag Building
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_bag_building',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Bag Building"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Race
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-race-bronze', 'race_bronze', 'Race Bronze', 'Win 10 games with Race', 'race', 'bronze', 10, 'sparkles', 10, 'win_race', 1, NOW(), NOW()),
('ach-race-silver', 'race_silver', 'Race Silver', 'Win 25 games with Race', 'race', 'silver', 25, 'sparkles', 25, 'win_race', 2, NOW(), NOW()),
('ach-race-gold', 'race_gold', 'Race Gold', 'Win 50 games with Race', 'race', 'gold', 50, 'sparkles', 50, 'win_race', 3, NOW(), NOW()),
('ach-race-platinum', 'race_platinum', 'Race Platinum', 'Win 100 games with Race', 'race', 'platinum', 100, 'sparkles', 100, 'win_race', 4, NOW(), NOW())
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

-- Rule for Race
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_race',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Race"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Voting
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-voting-bronze', 'voting_bronze', 'Voting Bronze', 'Win 10 games with Voting', 'voting', 'bronze', 10, 'sparkles', 10, 'win_voting', 1, NOW(), NOW()),
('ach-voting-silver', 'voting_silver', 'Voting Silver', 'Win 25 games with Voting', 'voting', 'silver', 25, 'sparkles', 25, 'win_voting', 2, NOW(), NOW()),
('ach-voting-gold', 'voting_gold', 'Voting Gold', 'Win 50 games with Voting', 'voting', 'gold', 50, 'sparkles', 50, 'win_voting', 3, NOW(), NOW()),
('ach-voting-platinum', 'voting_platinum', 'Voting Platinum', 'Win 100 games with Voting', 'voting', 'platinum', 100, 'sparkles', 100, 'win_voting', 4, NOW(), NOW())
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

-- Rule for Voting
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_voting',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Voting"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Teams
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-teams-bronze', 'teams_bronze', 'Teams Bronze', 'Win 10 games with Teams', 'teams', 'bronze', 10, 'sparkles', 10, 'win_teams', 1, NOW(), NOW()),
('ach-teams-silver', 'teams_silver', 'Teams Silver', 'Win 25 games with Teams', 'teams', 'silver', 25, 'sparkles', 25, 'win_teams', 2, NOW(), NOW()),
('ach-teams-gold', 'teams_gold', 'Teams Gold', 'Win 50 games with Teams', 'teams', 'gold', 50, 'sparkles', 50, 'win_teams', 3, NOW(), NOW()),
('ach-teams-platinum', 'teams_platinum', 'Teams Platinum', 'Win 100 games with Teams', 'teams', 'platinum', 100, 'sparkles', 100, 'win_teams', 4, NOW(), NOW())
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

-- Rule for Teams
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_teams',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Teams"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Hidden Traitor
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-hidden_traitor-bronze', 'hidden_traitor_bronze', 'Hidden Traitor Bronze', 'Win 10 games with Hidden Traitor', 'hidden_traitor', 'bronze', 10, 'sparkles', 10, 'win_hidden_traitor', 1, NOW(), NOW()),
('ach-hidden_traitor-silver', 'hidden_traitor_silver', 'Hidden Traitor Silver', 'Win 25 games with Hidden Traitor', 'hidden_traitor', 'silver', 25, 'sparkles', 25, 'win_hidden_traitor', 2, NOW(), NOW()),
('ach-hidden_traitor-gold', 'hidden_traitor_gold', 'Hidden Traitor Gold', 'Win 50 games with Hidden Traitor', 'hidden_traitor', 'gold', 50, 'sparkles', 50, 'win_hidden_traitor', 3, NOW(), NOW()),
('ach-hidden_traitor-platinum', 'hidden_traitor_platinum', 'Hidden Traitor Platinum', 'Win 100 games with Hidden Traitor', 'hidden_traitor', 'platinum', 100, 'sparkles', 100, 'win_hidden_traitor', 4, NOW(), NOW())
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

-- Rule for Hidden Traitor
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_hidden_traitor',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Hidden Traitor"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Hidden Roles
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-hidden_roles-bronze', 'hidden_roles_bronze', 'Hidden Roles Bronze', 'Win 10 games with Hidden Roles', 'hidden_roles', 'bronze', 10, 'sparkles', 10, 'win_hidden_roles', 1, NOW(), NOW()),
('ach-hidden_roles-silver', 'hidden_roles_silver', 'Hidden Roles Silver', 'Win 25 games with Hidden Roles', 'hidden_roles', 'silver', 25, 'sparkles', 25, 'win_hidden_roles', 2, NOW(), NOW()),
('ach-hidden_roles-gold', 'hidden_roles_gold', 'Hidden Roles Gold', 'Win 50 games with Hidden Roles', 'hidden_roles', 'gold', 50, 'sparkles', 50, 'win_hidden_roles', 3, NOW(), NOW()),
('ach-hidden_roles-platinum', 'hidden_roles_platinum', 'Hidden Roles Platinum', 'Win 100 games with Hidden Roles', 'hidden_roles', 'platinum', 100, 'sparkles', 100, 'win_hidden_roles', 4, NOW(), NOW())
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

-- Rule for Hidden Roles
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_hidden_roles',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Hidden Roles"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Unknown
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-unknown-bronze', 'unknown_bronze', 'Unknown Bronze', 'Win 10 games with Unknown', 'unknown', 'bronze', 10, 'sparkles', 10, 'win_unknown', 1, NOW(), NOW()),
('ach-unknown-silver', 'unknown_silver', 'Unknown Silver', 'Win 25 games with Unknown', 'unknown', 'silver', 25, 'sparkles', 25, 'win_unknown', 2, NOW(), NOW()),
('ach-unknown-gold', 'unknown_gold', 'Unknown Gold', 'Win 50 games with Unknown', 'unknown', 'gold', 50, 'sparkles', 50, 'win_unknown', 3, NOW(), NOW()),
('ach-unknown-platinum', 'unknown_platinum', 'Unknown Platinum', 'Win 100 games with Unknown', 'unknown', 'platinum', 100, 'sparkles', 100, 'win_unknown', 4, NOW(), NOW())
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

-- Rule for Unknown
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_unknown',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Unknown"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Auction
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-auction-bronze', 'auction_bronze', 'Auction Bronze', 'Win 10 games with Auction', 'auction', 'bronze', 10, 'sparkles', 10, 'win_auction', 1, NOW(), NOW()),
('ach-auction-silver', 'auction_silver', 'Auction Silver', 'Win 25 games with Auction', 'auction', 'silver', 25, 'sparkles', 25, 'win_auction', 2, NOW(), NOW()),
('ach-auction-gold', 'auction_gold', 'Auction Gold', 'Win 50 games with Auction', 'auction', 'gold', 50, 'sparkles', 50, 'win_auction', 3, NOW(), NOW()),
('ach-auction-platinum', 'auction_platinum', 'Auction Platinum', 'Win 100 games with Auction', 'auction', 'platinum', 100, 'sparkles', 100, 'win_auction', 4, NOW(), NOW())
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

-- Rule for Auction
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_auction',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Auction"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Area Majority/ Influence
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-area_majority__influence-bronze', 'area_majority__influence_bronze', 'Area Majority/ Influence Bronze', 'Win 10 games with Area Majority/ Influence', 'area_majority__influence', 'bronze', 10, 'sparkles', 10, 'win_area_majority__influence', 1, NOW(), NOW()),
('ach-area_majority__influence-silver', 'area_majority__influence_silver', 'Area Majority/ Influence Silver', 'Win 25 games with Area Majority/ Influence', 'area_majority__influence', 'silver', 25, 'sparkles', 25, 'win_area_majority__influence', 2, NOW(), NOW()),
('ach-area_majority__influence-gold', 'area_majority__influence_gold', 'Area Majority/ Influence Gold', 'Win 50 games with Area Majority/ Influence', 'area_majority__influence', 'gold', 50, 'sparkles', 50, 'win_area_majority__influence', 3, NOW(), NOW()),
('ach-area_majority__influence-platinum', 'area_majority__influence_platinum', 'Area Majority/ Influence Platinum', 'Win 100 games with Area Majority/ Influence', 'area_majority__influence', 'platinum', 100, 'sparkles', 100, 'win_area_majority__influence', 4, NOW(), NOW())
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

-- Rule for Area Majority/ Influence
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_area_majority__influence',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Area Majority/ Influence"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Simultaneous action selection
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-simultaneous_action_selection-bronze', 'simultaneous_action_selection_bronze', 'Simultaneous action selection Bronze', 'Win 10 games with Simultaneous action selection', 'simultaneous_action_selection', 'bronze', 10, 'sparkles', 10, 'win_simultaneous_action_selection', 1, NOW(), NOW()),
('ach-simultaneous_action_selection-silver', 'simultaneous_action_selection_silver', 'Simultaneous action selection Silver', 'Win 25 games with Simultaneous action selection', 'simultaneous_action_selection', 'silver', 25, 'sparkles', 25, 'win_simultaneous_action_selection', 2, NOW(), NOW()),
('ach-simultaneous_action_selection-gold', 'simultaneous_action_selection_gold', 'Simultaneous action selection Gold', 'Win 50 games with Simultaneous action selection', 'simultaneous_action_selection', 'gold', 50, 'sparkles', 50, 'win_simultaneous_action_selection', 3, NOW(), NOW()),
('ach-simultaneous_action_selection-platinum', 'simultaneous_action_selection_platinum', 'Simultaneous action selection Platinum', 'Win 100 games with Simultaneous action selection', 'simultaneous_action_selection', 'platinum', 100, 'sparkles', 100, 'win_simultaneous_action_selection', 4, NOW(), NOW())
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

-- Rule for Simultaneous action selection
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_simultaneous_action_selection',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Simultaneous action selection"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Follow
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-follow-bronze', 'follow_bronze', 'Follow Bronze', 'Win 10 games with Follow', 'follow', 'bronze', 10, 'sparkles', 10, 'win_follow', 1, NOW(), NOW()),
('ach-follow-silver', 'follow_silver', 'Follow Silver', 'Win 25 games with Follow', 'follow', 'silver', 25, 'sparkles', 25, 'win_follow', 2, NOW(), NOW()),
('ach-follow-gold', 'follow_gold', 'Follow Gold', 'Win 50 games with Follow', 'follow', 'gold', 50, 'sparkles', 50, 'win_follow', 3, NOW(), NOW()),
('ach-follow-platinum', 'follow_platinum', 'Follow Platinum', 'Win 100 games with Follow', 'follow', 'platinum', 100, 'sparkles', 100, 'win_follow', 4, NOW(), NOW())
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

-- Rule for Follow
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_follow',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Follow"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Acting
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-acting-bronze', 'acting_bronze', 'Acting Bronze', 'Win 10 games with Acting', 'acting', 'bronze', 10, 'sparkles', 10, 'win_acting', 1, NOW(), NOW()),
('ach-acting-silver', 'acting_silver', 'Acting Silver', 'Win 25 games with Acting', 'acting', 'silver', 25, 'sparkles', 25, 'win_acting', 2, NOW(), NOW()),
('ach-acting-gold', 'acting_gold', 'Acting Gold', 'Win 50 games with Acting', 'acting', 'gold', 50, 'sparkles', 50, 'win_acting', 3, NOW(), NOW()),
('ach-acting-platinum', 'acting_platinum', 'Acting Platinum', 'Win 100 games with Acting', 'acting', 'platinum', 100, 'sparkles', 100, 'win_acting', 4, NOW(), NOW())
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

-- Rule for Acting
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_acting',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Acting"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Worker Placement
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-worker_placement-bronze', 'worker_placement_bronze', 'Worker Placement Bronze', 'Win 10 games with Worker Placement', 'worker_placement', 'bronze', 10, 'sparkles', 10, 'win_worker_placement', 1, NOW(), NOW()),
('ach-worker_placement-silver', 'worker_placement_silver', 'Worker Placement Silver', 'Win 25 games with Worker Placement', 'worker_placement', 'silver', 25, 'sparkles', 25, 'win_worker_placement', 2, NOW(), NOW()),
('ach-worker_placement-gold', 'worker_placement_gold', 'Worker Placement Gold', 'Win 50 games with Worker Placement', 'worker_placement', 'gold', 50, 'sparkles', 50, 'win_worker_placement', 3, NOW(), NOW()),
('ach-worker_placement-platinum', 'worker_placement_platinum', 'Worker Placement Platinum', 'Win 100 games with Worker Placement', 'worker_placement', 'platinum', 100, 'sparkles', 100, 'win_worker_placement', 4, NOW(), NOW())
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

-- Rule for Worker Placement
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_worker_placement',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Worker Placement"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Trading
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-trading-bronze', 'trading_bronze', 'Trading Bronze', 'Win 10 games with Trading', 'trading', 'bronze', 10, 'sparkles', 10, 'win_trading', 1, NOW(), NOW()),
('ach-trading-silver', 'trading_silver', 'Trading Silver', 'Win 25 games with Trading', 'trading', 'silver', 25, 'sparkles', 25, 'win_trading', 2, NOW(), NOW()),
('ach-trading-gold', 'trading_gold', 'Trading Gold', 'Win 50 games with Trading', 'trading', 'gold', 50, 'sparkles', 50, 'win_trading', 3, NOW(), NOW()),
('ach-trading-platinum', 'trading_platinum', 'Trading Platinum', 'Win 100 games with Trading', 'trading', 'platinum', 100, 'sparkles', 100, 'win_trading', 4, NOW(), NOW())
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

-- Rule for Trading
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_trading',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Trading"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Pool Building
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-pool_building-bronze', 'pool_building_bronze', 'Pool Building Bronze', 'Win 10 games with Pool Building', 'pool_building', 'bronze', 10, 'sparkles', 10, 'win_pool_building', 1, NOW(), NOW()),
('ach-pool_building-silver', 'pool_building_silver', 'Pool Building Silver', 'Win 25 games with Pool Building', 'pool_building', 'silver', 25, 'sparkles', 25, 'win_pool_building', 2, NOW(), NOW()),
('ach-pool_building-gold', 'pool_building_gold', 'Pool Building Gold', 'Win 50 games with Pool Building', 'pool_building', 'gold', 50, 'sparkles', 50, 'win_pool_building', 3, NOW(), NOW()),
('ach-pool_building-platinum', 'pool_building_platinum', 'Pool Building Platinum', 'Win 100 games with Pool Building', 'pool_building', 'platinum', 100, 'sparkles', 100, 'win_pool_building', 4, NOW(), NOW())
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

-- Rule for Pool Building
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_pool_building',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Pool Building"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Force Commitment
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-force_commitment-bronze', 'force_commitment_bronze', 'Force Commitment Bronze', 'Win 10 games with Force Commitment', 'force_commitment', 'bronze', 10, 'sparkles', 10, 'win_force_commitment', 1, NOW(), NOW()),
('ach-force_commitment-silver', 'force_commitment_silver', 'Force Commitment Silver', 'Win 25 games with Force Commitment', 'force_commitment', 'silver', 25, 'sparkles', 25, 'win_force_commitment', 2, NOW(), NOW()),
('ach-force_commitment-gold', 'force_commitment_gold', 'Force Commitment Gold', 'Win 50 games with Force Commitment', 'force_commitment', 'gold', 50, 'sparkles', 50, 'win_force_commitment', 3, NOW(), NOW()),
('ach-force_commitment-platinum', 'force_commitment_platinum', 'Force Commitment Platinum', 'Win 100 games with Force Commitment', 'force_commitment', 'platinum', 100, 'sparkles', 100, 'win_force_commitment', 4, NOW(), NOW())
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

-- Rule for Force Commitment
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_force_commitment',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Force Commitment"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Card Play Conflict Resolution
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-card_play_conflict_resolution-bronze', 'card_play_conflict_resolution_bronze', 'Card Play Conflict Resolution Bronze', 'Win 10 games with Card Play Conflict Resolution', 'card_play_conflict_resolution', 'bronze', 10, 'sparkles', 10, 'win_card_play_conflict_resolution', 1, NOW(), NOW()),
('ach-card_play_conflict_resolution-silver', 'card_play_conflict_resolution_silver', 'Card Play Conflict Resolution Silver', 'Win 25 games with Card Play Conflict Resolution', 'card_play_conflict_resolution', 'silver', 25, 'sparkles', 25, 'win_card_play_conflict_resolution', 2, NOW(), NOW()),
('ach-card_play_conflict_resolution-gold', 'card_play_conflict_resolution_gold', 'Card Play Conflict Resolution Gold', 'Win 50 games with Card Play Conflict Resolution', 'card_play_conflict_resolution', 'gold', 50, 'sparkles', 50, 'win_card_play_conflict_resolution', 3, NOW(), NOW()),
('ach-card_play_conflict_resolution-platinum', 'card_play_conflict_resolution_platinum', 'Card Play Conflict Resolution Platinum', 'Win 100 games with Card Play Conflict Resolution', 'card_play_conflict_resolution', 'platinum', 100, 'sparkles', 100, 'win_card_play_conflict_resolution', 4, NOW(), NOW())
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

-- Rule for Card Play Conflict Resolution
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_card_play_conflict_resolution',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Card Play Conflict Resolution"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Movement Points
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-movement_points-bronze', 'movement_points_bronze', 'Movement Points Bronze', 'Win 10 games with Movement Points', 'movement_points', 'bronze', 10, 'sparkles', 10, 'win_movement_points', 1, NOW(), NOW()),
('ach-movement_points-silver', 'movement_points_silver', 'Movement Points Silver', 'Win 25 games with Movement Points', 'movement_points', 'silver', 25, 'sparkles', 25, 'win_movement_points', 2, NOW(), NOW()),
('ach-movement_points-gold', 'movement_points_gold', 'Movement Points Gold', 'Win 50 games with Movement Points', 'movement_points', 'gold', 50, 'sparkles', 50, 'win_movement_points', 3, NOW(), NOW()),
('ach-movement_points-platinum', 'movement_points_platinum', 'Movement Points Platinum', 'Win 100 games with Movement Points', 'movement_points', 'platinum', 100, 'sparkles', 100, 'win_movement_points', 4, NOW(), NOW())
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

-- Rule for Movement Points
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_movement_points',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Movement Points"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Map Addition
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-map_addition-bronze', 'map_addition_bronze', 'Map Addition Bronze', 'Win 10 games with Map Addition', 'map_addition', 'bronze', 10, 'sparkles', 10, 'win_map_addition', 1, NOW(), NOW()),
('ach-map_addition-silver', 'map_addition_silver', 'Map Addition Silver', 'Win 25 games with Map Addition', 'map_addition', 'silver', 25, 'sparkles', 25, 'win_map_addition', 2, NOW(), NOW()),
('ach-map_addition-gold', 'map_addition_gold', 'Map Addition Gold', 'Win 50 games with Map Addition', 'map_addition', 'gold', 50, 'sparkles', 50, 'win_map_addition', 3, NOW(), NOW()),
('ach-map_addition-platinum', 'map_addition_platinum', 'Map Addition Platinum', 'Win 100 games with Map Addition', 'map_addition', 'platinum', 100, 'sparkles', 100, 'win_map_addition', 4, NOW(), NOW())
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

-- Rule for Map Addition
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_map_addition',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Map Addition"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Evolving Game Board
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-evolving_game_board-bronze', 'evolving_game_board_bronze', 'Evolving Game Board Bronze', 'Win 10 games with Evolving Game Board', 'evolving_game_board', 'bronze', 10, 'sparkles', 10, 'win_evolving_game_board', 1, NOW(), NOW()),
('ach-evolving_game_board-silver', 'evolving_game_board_silver', 'Evolving Game Board Silver', 'Win 25 games with Evolving Game Board', 'evolving_game_board', 'silver', 25, 'sparkles', 25, 'win_evolving_game_board', 2, NOW(), NOW()),
('ach-evolving_game_board-gold', 'evolving_game_board_gold', 'Evolving Game Board Gold', 'Win 50 games with Evolving Game Board', 'evolving_game_board', 'gold', 50, 'sparkles', 50, 'win_evolving_game_board', 3, NOW(), NOW()),
('ach-evolving_game_board-platinum', 'evolving_game_board_platinum', 'Evolving Game Board Platinum', 'Win 100 games with Evolving Game Board', 'evolving_game_board', 'platinum', 100, 'sparkles', 100, 'win_evolving_game_board', 4, NOW(), NOW())
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

-- Rule for Evolving Game Board
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_evolving_game_board',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Evolving Game Board"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Competitive Play
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-competitive_play-bronze', 'competitive_play_bronze', 'Competitive Play Bronze', 'Win 10 games with Competitive Play', 'competitive_play', 'bronze', 10, 'sparkles', 10, 'win_competitive_play', 1, NOW(), NOW()),
('ach-competitive_play-silver', 'competitive_play_silver', 'Competitive Play Silver', 'Win 25 games with Competitive Play', 'competitive_play', 'silver', 25, 'sparkles', 25, 'win_competitive_play', 2, NOW(), NOW()),
('ach-competitive_play-gold', 'competitive_play_gold', 'Competitive Play Gold', 'Win 50 games with Competitive Play', 'competitive_play', 'gold', 50, 'sparkles', 50, 'win_competitive_play', 3, NOW(), NOW()),
('ach-competitive_play-platinum', 'competitive_play_platinum', 'Competitive Play Platinum', 'Win 100 games with Competitive Play', 'competitive_play', 'platinum', 100, 'sparkles', 100, 'win_competitive_play', 4, NOW(), NOW())
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

-- Rule for Competitive Play
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_competitive_play',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Competitive Play"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Rock-Paper-Scissors
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-rock_paper_scissors-bronze', 'rock_paper_scissors_bronze', 'Rock-Paper-Scissors Bronze', 'Win 10 games with Rock-Paper-Scissors', 'rock_paper_scissors', 'bronze', 10, 'sparkles', 10, 'win_rock_paper_scissors', 1, NOW(), NOW()),
('ach-rock_paper_scissors-silver', 'rock_paper_scissors_silver', 'Rock-Paper-Scissors Silver', 'Win 25 games with Rock-Paper-Scissors', 'rock_paper_scissors', 'silver', 25, 'sparkles', 25, 'win_rock_paper_scissors', 2, NOW(), NOW()),
('ach-rock_paper_scissors-gold', 'rock_paper_scissors_gold', 'Rock-Paper-Scissors Gold', 'Win 50 games with Rock-Paper-Scissors', 'rock_paper_scissors', 'gold', 50, 'sparkles', 50, 'win_rock_paper_scissors', 3, NOW(), NOW()),
('ach-rock_paper_scissors-platinum', 'rock_paper_scissors_platinum', 'Rock-Paper-Scissors Platinum', 'Win 100 games with Rock-Paper-Scissors', 'rock_paper_scissors', 'platinum', 100, 'sparkles', 100, 'win_rock_paper_scissors', 4, NOW(), NOW())
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

-- Rule for Rock-Paper-Scissors
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_rock_paper_scissors',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Rock-Paper-Scissors"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Variable Setup
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-variable_setup-bronze', 'variable_setup_bronze', 'Variable Setup Bronze', 'Win 10 games with Variable Setup', 'variable_setup', 'bronze', 10, 'sparkles', 10, 'win_variable_setup', 1, NOW(), NOW()),
('ach-variable_setup-silver', 'variable_setup_silver', 'Variable Setup Silver', 'Win 25 games with Variable Setup', 'variable_setup', 'silver', 25, 'sparkles', 25, 'win_variable_setup', 2, NOW(), NOW()),
('ach-variable_setup-gold', 'variable_setup_gold', 'Variable Setup Gold', 'Win 50 games with Variable Setup', 'variable_setup', 'gold', 50, 'sparkles', 50, 'win_variable_setup', 3, NOW(), NOW()),
('ach-variable_setup-platinum', 'variable_setup_platinum', 'Variable Setup Platinum', 'Win 100 games with Variable Setup', 'variable_setup', 'platinum', 100, 'sparkles', 100, 'win_variable_setup', 4, NOW(), NOW())
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

-- Rule for Variable Setup
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_variable_setup',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Variable Setup"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Card Efficiency
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-card_efficiency-bronze', 'card_efficiency_bronze', 'Card Efficiency Bronze', 'Win 10 games with Card Efficiency', 'card_efficiency', 'bronze', 10, 'sparkles', 10, 'win_card_efficiency', 1, NOW(), NOW()),
('ach-card_efficiency-silver', 'card_efficiency_silver', 'Card Efficiency Silver', 'Win 25 games with Card Efficiency', 'card_efficiency', 'silver', 25, 'sparkles', 25, 'win_card_efficiency', 2, NOW(), NOW()),
('ach-card_efficiency-gold', 'card_efficiency_gold', 'Card Efficiency Gold', 'Win 50 games with Card Efficiency', 'card_efficiency', 'gold', 50, 'sparkles', 50, 'win_card_efficiency', 3, NOW(), NOW()),
('ach-card_efficiency-platinum', 'card_efficiency_platinum', 'Card Efficiency Platinum', 'Win 100 games with Card Efficiency', 'card_efficiency', 'platinum', 100, 'sparkles', 100, 'win_card_efficiency', 4, NOW(), NOW())
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

-- Rule for Card Efficiency
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_card_efficiency',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Card Efficiency"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Strategic Planning
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-strategic_planning-bronze', 'strategic_planning_bronze', 'Strategic Planning Bronze', 'Win 10 games with Strategic Planning', 'strategic_planning', 'bronze', 10, 'sparkles', 10, 'win_strategic_planning', 1, NOW(), NOW()),
('ach-strategic_planning-silver', 'strategic_planning_silver', 'Strategic Planning Silver', 'Win 25 games with Strategic Planning', 'strategic_planning', 'silver', 25, 'sparkles', 25, 'win_strategic_planning', 2, NOW(), NOW()),
('ach-strategic_planning-gold', 'strategic_planning_gold', 'Strategic Planning Gold', 'Win 50 games with Strategic Planning', 'strategic_planning', 'gold', 50, 'sparkles', 50, 'win_strategic_planning', 3, NOW(), NOW()),
('ach-strategic_planning-platinum', 'strategic_planning_platinum', 'Strategic Planning Platinum', 'Win 100 games with Strategic Planning', 'strategic_planning', 'platinum', 100, 'sparkles', 100, 'win_strategic_planning', 4, NOW(), NOW())
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

-- Rule for Strategic Planning
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_strategic_planning',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Strategic Planning"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Resource Management
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-resource_management-bronze', 'resource_management_bronze', 'Resource Management Bronze', 'Win 10 games with Resource Management', 'resource_management', 'bronze', 10, 'sparkles', 10, 'win_resource_management', 1, NOW(), NOW()),
('ach-resource_management-silver', 'resource_management_silver', 'Resource Management Silver', 'Win 25 games with Resource Management', 'resource_management', 'silver', 25, 'sparkles', 25, 'win_resource_management', 2, NOW(), NOW()),
('ach-resource_management-gold', 'resource_management_gold', 'Resource Management Gold', 'Win 50 games with Resource Management', 'resource_management', 'gold', 50, 'sparkles', 50, 'win_resource_management', 3, NOW(), NOW()),
('ach-resource_management-platinum', 'resource_management_platinum', 'Resource Management Platinum', 'Win 100 games with Resource Management', 'resource_management', 'platinum', 100, 'sparkles', 100, 'win_resource_management', 4, NOW(), NOW())
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

-- Rule for Resource Management
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_resource_management',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Resource Management"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Traitor
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-traitor-bronze', 'traitor_bronze', 'Traitor Bronze', 'Win 10 games with Traitor', 'traitor', 'bronze', 10, 'sparkles', 10, 'win_traitor', 1, NOW(), NOW()),
('ach-traitor-silver', 'traitor_silver', 'Traitor Silver', 'Win 25 games with Traitor', 'traitor', 'silver', 25, 'sparkles', 25, 'win_traitor', 2, NOW(), NOW()),
('ach-traitor-gold', 'traitor_gold', 'Traitor Gold', 'Win 50 games with Traitor', 'traitor', 'gold', 50, 'sparkles', 50, 'win_traitor', 3, NOW(), NOW()),
('ach-traitor-platinum', 'traitor_platinum', 'Traitor Platinum', 'Win 100 games with Traitor', 'traitor', 'platinum', 100, 'sparkles', 100, 'win_traitor', 4, NOW(), NOW())
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

-- Rule for Traitor
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_traitor',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Traitor"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);

-- Achievements for Storytelling
INSERT INTO `Achievement` (`id`, `key`, `name`, `description`, `category`, `tier`, `goal`, `iconType`, `points`, `groupKey`, `tierOrder`, `createdAt`, `updatedAt`) VALUES
('ach-storytelling-bronze', 'storytelling_bronze', 'Storytelling Bronze', 'Win 10 games with Storytelling', 'storytelling', 'bronze', 10, 'sparkles', 10, 'win_storytelling', 1, NOW(), NOW()),
('ach-storytelling-silver', 'storytelling_silver', 'Storytelling Silver', 'Win 25 games with Storytelling', 'storytelling', 'silver', 25, 'sparkles', 25, 'win_storytelling', 2, NOW(), NOW()),
('ach-storytelling-gold', 'storytelling_gold', 'Storytelling Gold', 'Win 50 games with Storytelling', 'storytelling', 'gold', 50, 'sparkles', 50, 'win_storytelling', 3, NOW(), NOW()),
('ach-storytelling-platinum', 'storytelling_platinum', 'Storytelling Platinum', 'Win 100 games with Storytelling', 'storytelling', 'platinum', 100, 'sparkles', 100, 'win_storytelling', 4, NOW(), NOW())
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

-- Rule for Storytelling
INSERT IGNORE INTO `AchievementRule` (`id`, `groupKey`, `ruleType`, `filters`, `aggregation`, `targetField`, `metadataConfig`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'win_storytelling',
    'COUNT_WINS',
    '{"position": 1, "mechanicName": "Storytelling"}',
    'COUNT',
    NULL,
    '{"extractDetails": true, "field": "details"}',
    NOW(),
    NOW()
);
