-- AlterTable
ALTER TABLE `trainer_profiles` ADD COLUMN `facebookUrl` VARCHAR(191) NULL,
    ADD COLUMN `instagramUrl` VARCHAR(191) NULL,
    ADD COLUMN `tiktokUrl` VARCHAR(191) NULL,
    ADD COLUMN `whatsappUrl` VARCHAR(191) NULL,
    MODIFY `bio` VARCHAR(191) NULL;
