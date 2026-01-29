CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyId` int,
	`botId` int,
	`action` varchar(100) NOT NULL,
	`actionType` enum('create','update','delete','start','stop') NOT NULL,
	`description` text,
	`details` text,
	`status` enum('success','failed') NOT NULL DEFAULT 'success',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyId` int NOT NULL,
	`botId` int,
	`type` enum('bot_stopped','key_expiring','key_expired','bot_error','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
