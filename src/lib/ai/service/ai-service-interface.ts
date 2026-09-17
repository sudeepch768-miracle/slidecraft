export type AiRole = "system" | "user" | "assistant";

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface AiCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

export interface AiCompletionResult {
  content: string;
  modelUsed: string;
  durationMs: number;
  tokensUsed?: number;
}

export interface AiService {
  /**
   * The provider brand name (e.g. "groq", "openai", "anthropic")
   */
  readonly providerName: string;

  /**
   * Primary LLM model identifier
   */
  readonly defaultModel: string;

  /**
   * Check if credentials are appropriately configured
   */
  isConfigured(): boolean;

  /**
   * Execute chat completion
   */
  chat(messages: AiMessage[], options?: AiCompletionOptions): Promise<AiCompletionResult>;
}
