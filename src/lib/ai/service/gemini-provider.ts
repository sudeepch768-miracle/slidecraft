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
  public activeModel: string = "gemini-3.5-flash-lite";

  get defaultModel(): string {
    return cleanEnv(process.env.GEMINI_MODEL) || "gemini-3.5-flash-lite";
  }

  get apiKey(): string {
    return cleanEnv(process.env.GEMINI_API_KEY);
  }

  /**
   * Resilient model cascade: attempts configured model first,
   * then auto-fails over to high-speed stable flash models.
   */
  get modelCascade(): string[] {
    const configured = this.defaultModel;
    const candidates = [
      configured,
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3.6-flash",
      "gemma-4-26b-a4b-it",
    ];
    // Deduplicate
    return Array.from(new Set(candidates.filter(Boolean)));
  }

  constructor() {
    this.activeModel = this.defaultModel;
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
   * Health probe verifying credentials and model availability with auto-failover
   */
  async probeHealth(): Promise<{
    ok: boolean;
    status: "available" | "invalid_key" | "invalid_model" | "rate_limited" | "not_configured" | "error";
    model?: string;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      this.status = "not_configured";
      this.lastError = "GEMINI_API_KEY is missing";
      return { ok: false, status: this.status, error: this.lastError };
    }

    const modelsToProbe = this.modelCascade.slice(0, 3);
    let lastMsg = "";

    for (const model of modelsToProbe) {
      try {
        const url = `${this.apiBaseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${this.apiKey}`;
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
          this.activeModel = model;
          this.lastError = null;
          return { ok: true, status: "available", model };
        }

        const errJson = await res.json().catch(() => ({}));
        lastMsg = errJson?.error?.message || res.statusText;

        if (res.status === 400 && lastMsg.toLowerCase().includes("key")) {
          this.status = "invalid_key";
          this.lastError = lastMsg;
          return { ok: false, status: "invalid_key", error: lastMsg };
        }
      } catch (err: any) {
        lastMsg = err.message || "Failed to reach Gemini API";
      }
    }

    this.status = "error";
    this.lastError = lastMsg;
    return { ok: false, status: this.status, error: lastMsg };
  }

  /**
   * Execute chat completion via Gemini REST API with automated multi-model cascade
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

    const requestedModel = cleanEnv(options.model);
    const candidateModels = requestedModel
      ? [requestedModel, ...this.modelCascade.filter((m) => m !== requestedModel)]
      : this.modelCascade;

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
    const generationConfig: Record<string, any> = {};
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

    let lastError: Error | null = null;

    // Iterate through candidate models in cascade if one experiences high demand (503), 404, or rate limits
    for (const currentModel of candidateModels) {
      const endpoint = `${this.apiBaseUrl}/models/${encodeURIComponent(currentModel)}:generateContent?key=${this.apiKey}`;

      try {
        let res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(timeoutMs),
        });

        // Quick retry on temporary 503 spike
        if (res.status === 503) {
          console.warn(`[Gemini] ${currentModel} returned 503 (high demand). Retrying or cascading...`);
          await new Promise((r) => setTimeout(r, 1000));
          res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(timeoutMs),
          });
        }

        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          const message = errorBody?.error?.message || res.statusText;

          if (res.status === 400 && message.toLowerCase().includes("api key")) {
            this.status = "invalid_key";
            this.lastError = message;
            throw new Error(`Gemini API key is invalid: ${message}`);
          }

          // If high demand (503), model not found (404), or rate limited (429), try next model in cascade
          if (res.status === 503 || res.status === 404 || res.status === 429) {
            console.warn(`[Gemini] Model '${currentModel}' unavailable (HTTP ${res.status}: ${message}). Cascading to next candidate...`);
            lastError = new Error(`Gemini model '${currentModel}' failed (HTTP ${res.status}): ${message}`);
            continue;
          }

          this.status = "error";
          this.lastError = message;
          throw new Error(`Gemini request failed (HTTP ${res.status}): ${message}`);
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        let text =
          candidate?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("") ?? "";

        // If JSON mode was requested, clean any markdown wrap
        if (options.jsonMode) {
          const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            text = jsonMatch[1].trim();
          }
        }

        const tokensUsed =
          data.usageMetadata?.totalTokenCount ||
          (data.usageMetadata?.promptTokenCount ?? 0) + (data.usageMetadata?.candidatesTokenCount ?? 0);

        const durationMs = Date.now() - startTime;
        this.status = "available";
        this.activeModel = currentModel;
        this.lastError = null;

        return {
          content: text,
          modelUsed: currentModel,
          durationMs,
          tokensUsed: tokensUsed || undefined,
        };
      } catch (err: any) {
        if (err.name === "TimeoutError" || err.name === "AbortError") {
          console.warn(`[Gemini] Request with ${currentModel} timed out. Cascading...`);
          lastError = err;
          continue;
        }
        if (err.message?.includes("API key is invalid")) {
          throw err;
        }
        lastError = err;
      }
    }

    throw (
      lastError ||
      new Error(`All Gemini models in cascade failed to complete request.`)
    );
  }
}
