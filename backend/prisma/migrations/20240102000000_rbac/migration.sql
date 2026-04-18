-- ─────────────────────────────────────────────────────────────────────────────
-- RBAC Migration – adds roles, permissions, profiles; alters users table
-- ─────────────────────────────────────────────────────────────────────────────

-- CreateTable roles
CREATE TABLE `roles` (
    `id`          INTEGER      NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(50)  NOT NULL,
    `description` VARCHAR(255) NULL,
    `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable permissions
CREATE TABLE `permissions` (
    `id`          INTEGER      NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `permissions_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable role_has_permissions (pivot)
CREATE TABLE `role_has_permissions` (
    `roleId`       INTEGER     NOT NULL,
    `permissionId` INTEGER     NOT NULL,
    `assignedAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`roleId`, `permissionId`),
    INDEX `role_has_permissions_permissionId_fkey`(`permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable profiles
CREATE TABLE `profiles` (
    `id`        INTEGER      NOT NULL AUTO_INCREMENT,
    `userId`    INTEGER      NOT NULL,
    `firstName` VARCHAR(50)  NULL,
    `lastName`  VARCHAR(50)  NULL,
    `bio`       TEXT         NULL,
    `avatar`    VARCHAR(500) NULL,
    `phone`     VARCHAR(20)  NULL,
    `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable users – remove role ENUM, add password + roleId
ALTER TABLE `users`
    DROP COLUMN `role`,
    ADD COLUMN `password` VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN `roleId`   INTEGER      NULL;

-- AddForeignKey role_has_permissions → roles
ALTER TABLE `role_has_permissions`
    ADD CONSTRAINT `fk_rhp_role`
    FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey role_has_permissions → permissions
ALTER TABLE `role_has_permissions`
    ADD CONSTRAINT `fk_rhp_permission`
    FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey users → roles
ALTER TABLE `users`
    ADD CONSTRAINT `users_roleId_fkey`
    FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey profiles → users
ALTER TABLE `profiles`
    ADD CONSTRAINT `profiles_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
