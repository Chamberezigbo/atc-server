-- CreateTable
CREATE TABLE `hero_slides` (
    `id` VARCHAR(191) NOT NULL,
    `tip` TEXT NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
