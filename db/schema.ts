import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp('created_at', { mode: 'date' }).notNull().defaultNow();
const updatedAt = () =>
  timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'),
  image: text('image'),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const accounts = pgTable(
  'accounts',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [uniqueIndex('accounts_provider_account_idx').on(t.provider, t.providerAccountId)]
);

export const sessions = pgTable('sessions', {
  id: id(),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

export const conversations = pgTable(
  'conversations',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('Yangi suhbat'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('conversations_user_id_idx').on(t.userId)]
);

export const messages = pgTable(
  'messages',
  {
    id: id(),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'user' | 'assistant' | 'tool'
    content: text('content').notNull(),
    status: text('status').notNull().default('complete'), // 'complete' | 'streaming' | 'error' | 'cancelled'
    provider: text('provider'), // 'gemini' | 'anthropic'
    model: text('model'),
    tokensUsed: integer('tokens_used'),
    createdAt: createdAt(),
  },
  (t) => [index('messages_conversation_id_idx').on(t.conversationId)]
);

export const attachments = pgTable(
  'attachments',
  {
    id: id(),
    messageId: text('message_id').references(() => messages.id, { onDelete: 'cascade' }),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    storagePath: text('storage_path').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index('attachments_conversation_id_idx').on(t.conversationId),
    index('attachments_user_id_idx').on(t.userId),
  ]
);

export const userPreferences = pgTable('user_preferences', {
  id: id(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  theme: text('theme').notNull().default('system'), // 'light' | 'dark' | 'system'
  language: text('language').notNull().default('uz'), // 'uz' | 'en' | 'ru'
  defaultProvider: text('default_provider'),
  defaultModel: text('default_model'),
  searchEnabled: boolean('search_enabled').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const usageRecords = pgTable(
  'usage_records',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    model: text('model').notNull(),
    tokensIn: integer('tokens_in').notNull(),
    tokensOut: integer('tokens_out').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('usage_records_user_id_idx').on(t.userId)]
);

// Server-generated secrets (e.g. Auth.js signing secret when AUTH_SECRET is unset)
export const appSecrets = pgTable('app_secrets', {
  name: text('name').primaryKey(),
  value: text('value').notNull(),
  createdAt: createdAt(),
});
