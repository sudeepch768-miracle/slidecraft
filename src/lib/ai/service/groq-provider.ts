import Groq from "groq-sdk";
import {
  AiService,
  AiMessage,
  AiCompletionOptions,
  AiCompletionResult,
} from "./ai-service-interface";

function cleanEnvValue(val: string | undefined): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export class GroqAiService implements AiService {
  readonly providerName = "groq";
  readonly defaultModel: string;
  readonly fallbackModel: string;
  private client: Groq | null = null;
  public status: "available" | "rate_limited" | "invalid_model" | "invalid_key" | "not_configured" | "error" = "not_configured";
  public lastError: string | null = null;

  constructor() {
    const rawModel = cleanEnvValue(process.env.GROQ_MODEL);
    const key = cleanEnvValue(process.env.GROQ_API_KEY);

    if (!key || key.includes("dummy") || key.includes("placeholder")) {
      this.status = "not_configured";
      this.lastError = "GROQ_API_KEY is not configured in .env.local.";
    } else {
      this.status = "available";
    }

    // Default to configured GROQ_MODEL, falling back to openai/gpt-oss-120b and openai/gpt-oss-20b
    this.defaultModel = rawModel || "openai/gpt-oss-120b";
    this.fallbackModel = "openai/gpt-oss-20b";
  }

  isConfigured(): boolean {
    const key = cleanEnvValue(process.env.GROQ_API_KEY);
    return Boolean(key && !key.includes("dummy") && !key.includes("placeholder"));
  }

  private getClient(): Groq {
    if (!this.client) {
      const apiKey = cleanEnvValue(process.env.GROQ_API_KEY) || "gsk_dummy_key_for_development";
      this.client = new Groq({ apiKey });
    }
    return this.client;
  }

  /**
   * Validate authentication and model availability against Groq
   */
  async validateConfiguration(): Promise<{
    isValid: boolean;
    status: GroqAiService["status"];
    error: string | null;
  }> {
    if (!this.isConfigured()) {
      return {
        isValid: false,
        status: "not_configured",
        error: "GROQ_API_KEY is not configured in .env.local.",
      };
    }

    try {
      const groq = this.getClient();
      const testRes = await groq.chat.completions.create({
        model: this.defaultModel,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 30,
      });

      if (testRes.choices?.[0]?.message?.content !== undefined) {
        this.status = "available";
        this.lastError = null;
        return { isValid: true, status: "available", error: null };
      }

      this.status = "error";
      this.lastError = "Groq returned empty response during health check.";
      return { isValid: false, status: "error", error: this.lastError };
    } catch (err: any) {
      const status = err?.status;
      const msg = err?.message || String(err);

      if (status === 401) {
        this.status = "invalid_key";
        this.lastError = "Invalid Groq API key.";
      } else if (status === 404 || msg.includes("model_not_found")) {
        this.status = "invalid_model";
        this.lastError = `Groq model '${this.defaultModel}' not found on this API account.`;
      } else if (status === 429) {
        this.status = "rate_limited";
        this.lastError = "Groq rate limit exceeded.";
      } else {
        this.status = "error";
        this.lastError = `Groq check failed: ${msg}`;
      }

      return { isValid: false, status: this.status, error: this.lastError };
    }
  }

  async chat(
    messages: AiMessage[],
    options: AiCompletionOptions = {}
  ): Promise<AiCompletionResult> {
    const startTime = Date.now();
    const groq = this.getClient();
    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.3;
    // Provide sufficient tokens for reasoning models (e.g. openai/gpt-oss-120b) + output content
    const maxTokens = Math.max(options.maxTokens ?? 4096, 1024);
    const maxRetries = 3;

    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          response_format: options.jsonMode ? { type: "json_object" } : undefined,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response received from Groq API");
        }

        this.status = "available";
        this.lastError = null;

        const durationMs = Date.now() - startTime;
        return {
          content,
          modelUsed: model,
          durationMs,
          tokensUsed: response.usage?.total_tokens,
        };
      } catch (err: any) {
        lastError = err;

        // Categorize error
        if (err?.status === 401) {
          this.status = "invalid_key";
          this.lastError = "Invalid Groq API key.";
          throw new Error(`[GroqAiService] ${this.lastError}`);
        }

        if (
          err?.status === 404 ||
          err?.status === 429 ||
          err?.status === 400 ||
          err?.message?.includes("model_not_found") ||
          err?.message?.includes("json_validate_failed")
        ) {
          // Attempt fallbackModel if primary model hit rate limit, validation issue, or not found
          if (model !== this.fallbackModel) {
            console.warn(`[GroqAiService] Model '${model}' failed (${err?.message?.slice(0, 100)}). Attempting alternative '${this.fallbackModel}'...`);
            try {
              const fallbackResponse = await groq.chat.completions.create({
                model: this.fallbackModel,
                messages,
                temperature,
                max_tokens: maxTokens,
                response_format: err?.message?.includes("json_validate_failed") ? undefined : (options.jsonMode ? { type: "json_object" } : undefined),
              });

              const fbContent = fallbackResponse.choices[0]?.message?.content;
              if (fbContent) {
                this.status = "available";
                this.lastError = null;
                return {
                  content: fbContent,
                  modelUsed: this.fallbackModel,
                  durationMs: Date.now() - startTime,
                  tokensUsed: fallbackResponse.usage?.total_tokens,
                };
              }
            } catch (retryErr) {
              console.warn(`[GroqAiService] Alternative model '${this.fallbackModel}' also failed:`, retryErr);
            }
          }

          this.status = "invalid_model";
          this.lastError = `Groq model '${model}' not found on this account.`;
          throw new Error(`[GroqAiService] ${this.lastError}`);
        }

        // If rate limited or 503 service unavailable, attempt fast fallback model with backoff
        const isRateLimit = err?.status === 429 || err?.code === "rate_limit_exceeded";
        const isOverloaded = err?.status === 503;

        if (isRateLimit) {
          this.status = "rate_limited";
          this.lastError = "Groq rate limit exceeded.";
        }

        if ((isRateLimit || isOverloaded) && attempt < maxRetries) {
          const delayMs = attempt * 1200;
          console.warn(
            `[GroqAiService] Rate limit/overload encountered. Attempting fallback model (${this.fallbackModel}) in ${delayMs}ms...`
          );

          await new Promise((resolve) => setTimeout(resolve, delayMs));

          try {
            const fallbackResponse = await groq.chat.completions.create({
              model: this.fallbackModel,
              messages,
              temperature,
              max_tokens: 4096,
              response_format: options.jsonMode ? { type: "json_object" } : undefined,
            });

            const fbContent = fallbackResponse.choices[0]?.message?.content;
            if (fbContent) {
              this.status = "available";
              this.lastError = null;
              return {
                content: fbContent,
                modelUsed: this.fallbackModel,
                durationMs: Date.now() - startTime,
                tokensUsed: fallbackResponse.usage?.total_tokens,
              };
            }
          } catch (fallbackErr) {
            console.warn("[GroqAiService] Fallback model failed as well, retrying...", fallbackErr);
          }
        }
      }
    }

    this.lastError = `Groq AI Service failed after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`;
    throw new Error(`[GroqAiService] ${this.lastError}`);
  }
}
