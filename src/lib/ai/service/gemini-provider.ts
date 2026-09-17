import {
  AiService,
  AiMessage,
  AiCompletionOptions,
  AiCompletionResult,
} from "./ai-service-interface";

function cleanEnv(val: string | undefined): string {
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

export class GeminiAiService implements AiService {
  readonly providerName = "gemini";
  private readonly apiBaseUrl = "https://generativelanguage.googleapis.com/v1beta";

  public status: "available" | "invalid_key" | "invalid_model" | "rate_limited" | "not_configured" | "error" = "not_configured";
  public lastError: string | null = null;
  public lastTestedAt: Date | null = null;

  get defaultModel(): string {
    return cleanEnv(process.env.GEMINI_MODEL) || "gemini-3.6-flash";
  }

  get apiKey(): string {
    return cleanEnv(process.env.GEMINI_API_KEY);
  }

  constructor() {
    if (this.apiKey) {
      this.status = "available";
    } else {
      this.status = "not_configured";
      this.lastError = "GEMINI_API_KEY is not configured in environment.";
    }
  }

  isConfigured(): boolean {
    const key = this.apiKey;
    return Boolean(key && key.length > 5);
  }

  /**
   * Health probe verifying credentials and model availability
   */
  async probeHealth(): Promise<{
    ok: boolean;
    status: "available" | "invalid_key" | "invalid_model" | "rate_limited" | "not_configured" | "error";
    error?: string;
  }> {
    if (!this.isConfigured()) {
      this.status = "not_configured";
      this.lastError = "GEMINI_API_KEY is missing";
      return { ok: false, status: this.status, error: this.lastError };
    }

    try {
      const url = `${this.apiBaseUrl}/models/${encodeURIComponent(this.defaultModel)}:generateContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "ping" }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
        signal: AbortSignal.timeout(6000),
      });

      this.lastTestedAt = new Date();

      if (res.ok) {
        this.status = "available";
        this.lastError = null;
        return { ok: true, status: "available" };
      }

      const errJson = await res.json().catch(() => ({}));
      const msg = errJson?.error?.message || res.statusText;

      if (res.status === 400 && msg.toLowerCase().includes("key")) {
        this.status = "invalid_key";
      } else if (res.status === 404) {
        this.status = "invalid_model";
      } else if (res.status === 429) {
        this.status = "rate_limited";
      } else {
        this.status = "error";
      }

      this.lastError = msg;
      return { ok: false, status: this.status, error: msg };
    } catch (err: any) {
      this.status = "error";
      this.lastError = err.message || "Failed to reach Gemini API";
      return { ok: false, status: "error", error: this.lastError || undefined };
    }
  }

  /**
   * Execute chat completion via Gemini REST API
   */
  async chat(
    messages: AiMessage[],
    options: AiCompletionOptions = {}
  ): Promise<AiCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error(
        "Gemini provider error: GEMINI_API_KEY is not configured in .env.local."
      );
    }

    const model = cleanEnv(options.model) || this.defaultModel;
    const startTime = Date.now();
    const timeoutMs = options.timeoutMs || 45000;

    // Separate system messages from conversation turns
    const systemMessages = messages.filter((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");

    // Format system instruction if present
    const systemInstruction = systemMessages.length > 0
      ? {
          parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }],
        }
      : undefined;

    // Convert messages into Gemini contents format
    const contents = conversationMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Build generation config
    const generationConfig: Record<string, any> = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    };
    if (typeof options.temperature === "number") {
      generationConfig.temperature = Math.max(0, Math.min(2, options.temperature));
    }
    if (options.maxTokens) {
      generationConfig.maxOutputTokens = Math.max(300, options.maxTokens);
    }
    if (options.jsonMode) {
      generationConfig.responseMimeType = "application/json";
    }

    const requestBody: Record<string, any> = { contents };
    if (systemInstruction) requestBody.systemInstruction = systemInstruction;
    if (Object.keys(generationConfig).length > 0) requestBody.generationConfig = generationConfig;

    const endpoint = `${this.apiBaseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${this.apiKey}`;

    try {
    let res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(timeoutMs),
    });

    // Handle temporary 503 (high demand) spike with a quick retry
    if (res.status === 503) {
      await new Promise((r) => setTimeout(r, 1500));
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(timeoutMs),
      });
    }

    const durationMs = Date.now() - startTime;

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody?.error?.message || res.statusText;

      if (res.status === 400 && message.toLowerCase().includes("api key")) {
        this.status = "invalid_key";
        this.lastError = message;
        throw new Error(`Gemini API key is invalid: ${message}`);
      }
      if (res.status === 429) {
        this.status = "rate_limited";
        this.lastError = message;
        throw new Error(`Gemini rate limit exceeded (HTTP 429): ${message}`);
      }
      if (res.status === 404) {
        this.status = "invalid_model";
        this.lastError = message;
        throw new Error(`Gemini model '${model}' not found: ${message}`);
      }

      this.status = "error";
      this.lastError = message;
      throw new Error(`Gemini request failed (HTTP ${res.status}): ${message}`);
    }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const text =
        candidate?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("") ?? "";

      const tokensUsed =
        data.usageMetadata?.totalTokenCount ||
        (data.usageMetadata?.promptTokenCount ?? 0) + (data.usageMetadata?.candidatesTokenCount ?? 0);

      this.status = "available";
      this.lastError = null;

      return {
        content: text,
        modelUsed: model,
        durationMs,
        tokensUsed: tokensUsed || undefined,
      };
    } catch (err: any) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        throw new Error(`Gemini request timed out after ${timeoutMs}ms.`);
      }
      throw err;
    }
  }
}
