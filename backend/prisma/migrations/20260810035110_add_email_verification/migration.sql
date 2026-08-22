/*
  Warnings:

  - A unique constraint covering the columns `[emailVerifyToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `emailVerifyExpiry` DATETIME(3) NULL,
    ADD COLUMN `emailVerifyToken` VARCHAR(191) NULL,
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `users_emailVerifyToken_key` ON `users`(`emailVerifyToken`);
