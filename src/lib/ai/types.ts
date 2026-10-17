// Message roles
export type MessageRole = 'user' | 'assistant' | 'tool';

// Attachment type for multimodal inputs
export interface AIAttachment {
  type: 'image' | 'document';
  mimeType: string;
  data: string; // base64
  name?: string;
}

// A message in the conversation
export interface AIMessage {
  role: MessageRole;
  content: string;
  attachments?: AIAttachment[];
}

// Stream events emitted during generation
export type AIStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; result: unknown }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'error'; error: string }
  | { type: 'done'; finishReason: string };

// Capabilities a provider/model supports
export interface AICapabilities {
  streaming: boolean;
  multimodal: boolean;
  toolUse: boolean;
  maxContextTokens: number;
  maxOutputTokens: number;
}

// Provider configuration
export interface ProviderConfig {
  apiKey: string;
  model: string;
  maxOutputTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

// Tool definition
export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// Citation from search results
export interface AICitation {
  title: string;
  url: string;
  snippet?: string;
}

// Generation request
export interface GenerateRequest {
  messages: AIMessage[];
  systemPrompt?: string;
  maxOutputTokens?: number;
  temperature?: number;
  tools?: AIToolDefinition[];
  signal?: AbortSignal;
  enableSearch?: boolean;
}

// Generation response (non-streaming)
export interface GenerateResponse {
  content: string;
  finishReason: string;
  usage?: { inputTokens: number; outputTokens: number };
  citations?: AICitation[];
}

// Normalized error code
export type AIErrorCode =
  | 'rate_limit'
  | 'invalid_key'
  | 'model_not_found'
  | 'context_length'
  | 'content_filter'
  | 'network'
  | 'timeout'
  | 'unknown';

// Normalized error
export interface AIProviderError {
  code: AIErrorCode;
  message: string;
  provider: string;
  retryable: boolean;
  retryAfterMs?: number;
}

// Concrete error class that implements AIProviderError
export class AIError extends Error implements AIProviderError {
  readonly code: AIErrorCode;
  readonly provider: string;
  readonly retryable: boolean;
  readonly retryAfterMs?: number;

  constructor(options: AIProviderError) {
    super(options.message);
    this.name = 'AIError';
    this.code = options.code;
    this.provider = options.provider;
    this.retryable = options.retryable;
    this.retryAfterMs = options.retryAfterMs;
    Object.setPrototypeOf(this, AIError.prototype);
  }
}

// Model info for UI
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: AICapabilities;
  description?: string;
}

// The unified provider interface
export interface AIProvider {
  readonly name: string;
  readonly displayName: string;
  readonly models?: ModelInfo[];
  getModels?(): ModelInfo[];

  generateResponse(config: ProviderConfig, request: GenerateRequest): Promise<GenerateResponse>;
  streamResponse(config: ProviderConfig, request: GenerateRequest): AsyncGenerator<AIStreamEvent>;
  getCapabilities(model: string): AICapabilities;
  validateConfig(config: ProviderConfig): { valid: boolean; error?: string };
}
