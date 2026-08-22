-- CreateTable
CREATE TABLE `drop_in_visits` (
    `id` VARCHAR(191) NOT NULL,
    `visitorName` VARCHAR(191) NOT NULL,
    `visitorPhone` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `checkInTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `checkOutTime` DATETIME(3) NULL,
    `recordedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `drop_in_visits` ADD CONSTRAINT `drop_in_visits_recordedBy_fkey` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
