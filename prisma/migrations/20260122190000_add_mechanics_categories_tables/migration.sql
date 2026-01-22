-- CreateTable
CREATE TABLE `Mechanic` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Mechanic_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameMechanic` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `mechanicId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GameMechanic_gameId_idx`(`gameId`),
    INDEX `GameMechanic_mechanicId_idx`(`mechanicId`),
    UNIQUE INDEX `GameMechanic_gameId_mechanicId_key`(`gameId`, `mechanicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameCategory` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GameCategory_gameId_idx`(`gameId`),
    INDEX `GameCategory_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `GameCategory_gameId_categoryId_key`(`gameId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Extract unique mechanics from existing Game records
INSERT IGNORE INTO `Mechanic` (`id`, `name`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as id,
    mechanic_name as name,
    NOW() as createdAt,
    NOW() as updatedAt
FROM (
    SELECT DISTINCT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(mechanics, ',', numbers.n), ',', -1)) as mechanic_name
    FROM 
        (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
         UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
         UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
         UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20) numbers
    INNER JOIN `Game` ON CHAR_LENGTH(mechanics) - CHAR_LENGTH(REPLACE(mechanics, ',', '')) >= numbers.n - 1
    WHERE mechanics IS NOT NULL AND mechanics != ''
) AS unique_mechanics
WHERE mechanic_name != '';

-- Extract unique categories from existing Game records
INSERT IGNORE INTO `Category` (`id`, `name`, `createdAt`, `updatedAt`)
SELECT 
    UUID() as id,
    category_name as name,
    NOW() as createdAt,
    NOW() as updatedAt
FROM (
    SELECT DISTINCT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(categories, ',', numbers.n), ',', -1)) as category_name
    FROM 
        (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
         UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
         UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
         UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20) numbers
    INNER JOIN `Game` ON CHAR_LENGTH(categories) - CHAR_LENGTH(REPLACE(categories, ',', '')) >= numbers.n - 1
    WHERE categories IS NOT NULL AND categories != ''
) AS unique_categories
WHERE category_name != '';

-- Create GameMechanic junction records
INSERT IGNORE INTO `GameMechanic` (`id`, `gameId`, `mechanicId`, `createdAt`)
SELECT 
    UUID() as id,
    g.id as gameId,
    m.id as mechanicId,
    NOW() as createdAt
FROM `Game` g
CROSS JOIN 
    (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
     UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
     UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
     UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20) numbers
INNER JOIN `Mechanic` m ON m.name = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(g.mechanics, ',', numbers.n), ',', -1))
WHERE g.mechanics IS NOT NULL 
  AND g.mechanics != ''
  AND CHAR_LENGTH(g.mechanics) - CHAR_LENGTH(REPLACE(g.mechanics, ',', '')) >= numbers.n - 1;

-- Create GameCategory junction records
INSERT IGNORE INTO `GameCategory` (`id`, `gameId`, `categoryId`, `createdAt`)
SELECT 
    UUID() as id,
    g.id as gameId,
    c.id as categoryId,
    NOW() as createdAt
FROM `Game` g
CROSS JOIN 
    (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
     UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
     UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
     UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20) numbers
INNER JOIN `Category` c ON c.name = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(g.categories, ',', numbers.n), ',', -1))
WHERE g.categories IS NOT NULL 
  AND g.categories != ''
  AND CHAR_LENGTH(g.categories) - CHAR_LENGTH(REPLACE(g.categories, ',', '')) >= numbers.n - 1;
