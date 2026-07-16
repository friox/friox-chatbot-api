import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull(),
  senderName: text('sender_name'),
  message: text('message').notNull(),
  mediaUrls: text('media_urls', { mode: 'json' }).$type<string[]>(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const chatSessions = sqliteTable('chat_sessions', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const sessionConfigs = sqliteTable('session_configs', {
  sessionId: text('session_id').primaryKey().references(() => chatSessions.id, { onDelete: 'cascade' }),
  botTriggerWord: text('bot_trigger_word').default('잼민이').notNull(),
  reactionEnabled: integer('reaction_enabled', { mode: 'boolean' }).default(true).notNull(),
  aiEnabled: integer('ai_enabled', { mode: 'boolean' }).default(true).notNull(),
  aiTriggerWord: text('ai_trigger_word').default('잼민').notNull(),
  previousInteractionId: text('previous_interaction_id'),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;

export type SessionConfig = typeof sessionConfigs.$inferSelect;
export type NewSessionConfig = typeof sessionConfigs.$inferInsert;
