CREATE TABLE `chat_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`sender_name` text,
	`message` text NOT NULL,
	`media_urls` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session_configs` (
	`session_id` text PRIMARY KEY NOT NULL,
	`bot_trigger_word` text DEFAULT '잼민이' NOT NULL,
	`reaction_enabled` integer DEFAULT true NOT NULL,
	`ai_enabled` integer DEFAULT true NOT NULL,
	`ai_trigger_word` text DEFAULT '잼민' NOT NULL,
	`previous_interaction_id` text,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
