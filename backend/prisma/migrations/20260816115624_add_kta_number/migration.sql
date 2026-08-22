/*
  Warnings:

  - A unique constraint covering the columns `[ktaNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `ktaNumber` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_ktaNumber_key` ON `users`(`ktaNumber`);
