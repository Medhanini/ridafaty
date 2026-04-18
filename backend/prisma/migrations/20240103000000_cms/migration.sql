-- CreateTable: categories
CREATE TABLE `categories` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `name`      VARCHAR(150) NOT NULL,
  `slug`      VARCHAR(200) NOT NULL,
  `lang`      ENUM('fr','en','ar') NOT NULL,
  `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_key` (`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: sub_categories
CREATE TABLE `sub_categories` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(150) NOT NULL,
  `slug`       VARCHAR(200) NOT NULL,
  `lang`       ENUM('fr','en','ar') NOT NULL,
  `categoryId` INT          NOT NULL,
  `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`  DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sub_categories_slug_key` (`slug`),
  CONSTRAINT `sub_categories_categoryId_fkey`
    FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: tags
CREATE TABLE `tags` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `name`      VARCHAR(100) NOT NULL,
  `slug`      VARCHAR(150) NOT NULL,
  `lang`      ENUM('fr','en','ar') NOT NULL,
  `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_slug_key` (`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: media
CREATE TABLE `media` (
  `id`        INT           NOT NULL AUTO_INCREMENT,
  `url`       VARCHAR(1000) NOT NULL,
  `type`      ENUM('image','video') NOT NULL,
  `alt`       VARCHAR(255)  NULL,
  `createdAt` DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3)   NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: articles
CREATE TABLE `articles` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `title`         VARCHAR(300) NOT NULL,
  `slug`          VARCHAR(350) NOT NULL,
  `content`       LONGTEXT     NOT NULL,
  `excerpt`       TEXT         NULL,
  `lang`          ENUM('fr','en','ar') NOT NULL,
  `userId`        INT          NOT NULL,
  `subCategoryId` INT          NOT NULL,
  `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_key` (`slug`),
  CONSTRAINT `articles_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `articles_subCategoryId_fkey`
    FOREIGN KEY (`subCategoryId`) REFERENCES `sub_categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: article_tags
CREATE TABLE `article_tags` (
  `articleId` INT NOT NULL,
  `tagId`     INT NOT NULL,
  PRIMARY KEY (`articleId`, `tagId`),
  CONSTRAINT `article_tags_articleId_fkey`
    FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `article_tags_tagId_fkey`
    FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: article_media
CREATE TABLE `article_media` (
  `articleId` INT NOT NULL,
  `mediaId`   INT NOT NULL,
  PRIMARY KEY (`articleId`, `mediaId`),
  CONSTRAINT `article_media_articleId_fkey`
    FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `article_media_mediaId_fkey`
    FOREIGN KEY (`mediaId`) REFERENCES `media` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
