import { z } from 'zod';

// Chat request
export const chatRequestSchema = z.object({
  conversationId: z.string().cuid().optional(),
  message: z.string().min(1).max(100_000),
  provider: z.enum(['gemini', 'anthropic']).optional(),
  model: z.string().max(100).optional(),
  enableSearch: z.boolean().optional().default(false),
  attachments: z.array(z.object({
    type: z.enum(['image', 'document']),
    mimeType: z.string(),
    data: z.string(), // base64
    name: z.string().optional(),
  })).max(5).optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

// Conversation operations
export const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(200),
});

export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

// Settings
export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['uz', 'en', 'ru']).optional(),
  defaultProvider: z.string().max(50).optional(),
  defaultModel: z.string().max(100).optional(),
  searchEnabled: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

// Registration
export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Search
export const searchSchema = z.object({
  query: z.string().min(1).max(500),
});

export type SearchInput = z.infer<typeof searchSchema>;
