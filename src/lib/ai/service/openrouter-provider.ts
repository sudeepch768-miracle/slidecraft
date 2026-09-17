import {
  AiService,
  AiMessage,
  AiCompletionOptions,
  AiCompletionResult,
} from "./ai-service-interface";

/**
 * Clean environment variable values by stripping surrounding quotes and whitespace.
 */
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

// In-memory cache for verified zero-pricing models from OpenRouter catalog
const verifiedFreeModelsCache = new Map<string, boolean>();

/**
 * Strict Zero-Cost Validator for OpenRouter models.
 * Rules:
 * - openrouter/auto is strictly FORBIDDEN.
 * - Allowed: "openrouter/free" or any model ending with ":free".
 * - Or verified against pricing API with 0 prompt and 0 completion cost.
 * - Any model without confirmed zero pricing is immediately blocked.
 */
export function isGuaranteedFreeOpenRouterModel(model: string): boolean {
  if (!model || typeof model !== "string") return false;
  const normalized = model.trim().toLowerCase();

  // Explicitly block openrouter/auto
  if (normalized === "openrouter/auto" || normalized.includes("/auto")) {
    return false;
  }

  // OpenRouter's official free meta-router
  if (normalized === "openrouter/free") {
    return true;
  }

  // Explicit free model tier convention on OpenRouter
  if (normalized.endsWith(":free")) {
    return true;
  }

  // Check verified cache
  if (verifiedFreeModelsCache.get(normalized) === true) {
    return true;
  }

  return false;
}

/**
 * Async check against OpenRouter model catalog verifying prompt and completion pricing are exactly zero.
 */
export async function verifyOpenRouterPricingIsZero(model: string, apiKey?: string): Promise<boolean> {
  if (isGuaranteedFreeOpenRouterModel(model)) return true;

  const normalized = model.trim().toLowerCase();
  if (normalized === "openrouter/auto" || normalized.includes("/auto")) return false;

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers,
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = await res.json();
      const modelData = json.data?.find((m: any) => m.id?.toLowerCase() === normalized);
      if (modelData) {
        const promptPrice = parseFloat(modelData.pricing?.prompt || "0");
        const completionPrice = parseFloat(modelData.pricing?.completion || "0");
        const isFree = promptPrice === 0 && completionPrice === 0;
        verifiedFreeModelsCache.set(normalized, isFree);
        return isFree;
      }
    }
  } catch (err) {
    console.warn(`[OpenRouter] Could not verify model pricing for "${model}":`, err);
  }

  return false;
}

export class OpenRouterService implements AiService {
  readonly providerName = "openrouter";
  readonly isFreeOnly = true;
  public lastError: string | null = null;
  public status: "available" | "not_configured" | "invalid_key" | "blocked_non_free" | "rate_limited" | "error" = "not_configured";

  get apiKey(): string {
    return cleanEnvValue(process.env.OPENROUTER_API_KEY);
  }

  get defaultModel(): string {
    const configuredModel = cleanEnvValue(process.env.OPENROUTER_TEXT_MODEL) || "openrouter/free";
    if (!isGuaranteedFreeOpenRouterModel(configuredModel)) {
      return "openrouter/free";
    }
    return configuredModel;
  }

  constructor() {
    if (!this.apiKey || this.apiKey.includes("dummy") || this.apiKey.includes("placeholder")) {
      this.status = "not_configured";
      this.lastError = "OPENROUTER_API_KEY is not configured.";
    } else {
      this.status = "available";
    }
  }

  isConfigured(): boolean {
    const key = this.apiKey;
    return Boolean(
      key &&
        !key.includes("dummy") &&
        !key.includes("placeholder")
    );
  }

  async chat(
    messages: AiMessage[],
    options: AiCompletionOptions = {}
  ): Promise<AiCompletionResult> {
    const startTime = Date.now();
    const targetModel = options.model || this.defaultModel;

    // 1. Strict zero-cost gatekeeper check
    let isFree = isGuaranteedFreeOpenRouterModel(targetModel);
    if (!isFree) {
      // Attempt zero-pricing catalog check
      isFree = await verifyOpenRouterPricingIsZero(targetModel, this.apiKey);
    }

    if (!isFree) {
      const errMsg = `[OpenRouter Blocked] Model "${targetModel}" is not confirmed zero-cost. OpenRouter usage is strictly restricted to free-only models (openrouter/free, ':free' suffix, or confirmed zero-pricing). Never use openrouter/auto or paid models.`;
      this.status = "blocked_non_free";
      this.lastError = errMsg;
      console.error(errMsg);
      throw new Error(errMsg);
    }

    if (!this.isConfigured()) {
      const errMsg = "OpenRouter API key is not configured in environment variables.";
      this.status = "not_configured";
      this.lastError = errMsg;
      throw new Error(errMsg);
    }

    const temperature = options.temperature ?? 0.3;
    const maxTokens = options.maxTokens ?? 4096;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        options.timeoutMs || 45000
      );

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://slidecraft.ai",
          "X-Title": "SlideCraft AI Studio",
        },
        body: JSON.stringify({
          model: targetModel,
          messages,
          temperature,
          max_tokens: maxTokens,
          response_format: options.jsonMode ? { type: "json_object" } : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errData: any = {};
        try {
          errData = await response.json();
        } catch {
          // ignore
        }

        const statusCode = response.status;
        const errorMsg = errData?.error?.message || response.statusText;

        if (statusCode === 401 || statusCode === 403) {
          this.status = "invalid_key";
          this.lastError = "Invalid or unauthorized OpenRouter API key.";
        } else if (statusCode === 429) {
          this.status = "rate_limited";
          this.lastError = "OpenRouter free-tier rate limit exceeded.";
        } else if (statusCode === 404) {
          this.status = "error";
          this.lastError = `Free model "${targetModel}" is currently unavailable on OpenRouter.`;
        } else {
          this.status = "error";
          this.lastError = `OpenRouter API error (HTTP ${statusCode}): ${errorMsg}`;
        }

        throw new Error(`[OpenRouterService] ${this.lastError}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        this.status = "error";
        this.lastError = "Empty response received from OpenRouter API.";
        throw new Error(`[OpenRouterService] ${this.lastError}`);
      }

      this.status = "available";
      this.lastError = null;

      return {
        content,
        modelUsed: data.model || targetModel,
        durationMs: Date.now() - startTime,
        tokensUsed: data.usage?.total_tokens,
      };
    } catch (err: any) {
      if (!this.lastError) {
        this.lastError = err.message || "Unknown OpenRouter network error.";
      }
      throw err;
    }
  }
}
