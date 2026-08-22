-- DropForeignKey
ALTER TABLE `check_in_logs`
DROP FOREIGN KEY `check_in_logs_userId_fkey`;

-- DropIndex
DROP INDEX `check_in_logs_userId_createdAt_idx` ON `check_in_logs`;

-- DropIndex
DROP INDEX `qr_tokens_token_idx` ON `qr_tokens`;

-- CreateIndex
CREATE INDEX `check_in_logs_userId_type_createdAt_idx` ON `check_in_logs` (`userId`, `type`, `createdAt`);

-- CreateIndex
CREATE INDEX `check_in_logs_type_createdAt_idx` ON `check_in_logs` (`type`, `createdAt`);

-- AddForeignKey
ALTER TABLE `check_in_logs`
ADD CONSTRAINT `check_in_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `memberships_userId_status_endDate_idx` ON `memberships` (`userId`, `status`, `endDate`);

-- CreateIndex
CREATE INDEX `notifications_userId_isRead_idx` ON `notifications` (`userId`, `isRead`);

-- CreateIndex
CREATE INDEX `payments_status_idx` ON `payments` (`status`);

-- CreateIndex
CREATE INDEX `pt_bookings_status_idx` ON `pt_bookings` (`status`);