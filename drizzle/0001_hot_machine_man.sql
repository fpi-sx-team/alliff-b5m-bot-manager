CREATE TABLE `bots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyId` int NOT NULL,
	`botName` varchar(255) NOT NULL,
	`adminUid` varchar(255) NOT NULL,
	`adminName` varchar(255) NOT NULL,
	`accountUid` varchar(255) NOT NULL,
	`accountPassword` varchar(255) NOT NULL,
	`devName` varchar(255) NOT NULL DEFAULT 'AlliFF',
	`telegramUsername` varchar(255) NOT NULL DEFAULT '@AlliFF_BOT',
	`instagramUsername` varchar(255),
	`tiktokUsername` varchar(255),
	`welcomeMessage` text,
	`helpMessage` text,
	`status` enum('running','stopped') NOT NULL DEFAULT 'stopped',
	`processId` varchar(255),
	`botDirectory` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyCode` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`maxBots` int NOT NULL DEFAULT 1,
	`expiryDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`isAdmin` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `keys_keyCode_unique` UNIQUE(`keyCode`)
);
--> statement-breakpoint
CREATE TABLE `statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`totalBotsCreated` int NOT NULL DEFAULT 0,
	`activeBotsCount` int NOT NULL DEFAULT 0,
	`totalUsers` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `statistics_id` PRIMARY KEY(`id`)
);
