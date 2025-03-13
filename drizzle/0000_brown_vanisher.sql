CREATE TABLE `quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`quote` text NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL
);
