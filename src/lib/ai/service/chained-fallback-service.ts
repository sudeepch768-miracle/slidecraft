import {
  AiService,
  AiMessage,
  AiCompletionOptions,
  AiCompletionResult,
} from "./ai-service-interface";
import { GroqAiService } from "./groq-provider";
import { GeminiAiService } from "./gemini-provider";
import { OpenRouterService } from "./openrouter-provider";

export interface ProviderDiagnosticInfo {
  name: string;
  configured: boolean;
  model: string;
  status: string;
  lastError: string | null;
  isFreeOnly: boolean;
  keyPresent: boolean;
}

export class ChainedFallbackAiService implements AiService {
  readonly providerName = "multi-tier-fallback-chain";
  readonly defaultModel = "auto";

  public readonly groqService: GroqAiService;
  public readonly geminiService: GeminiAiService;
  public readonly openRouterService: OpenRouterService;

  constructor() {
    this.groqService = new GroqAiService();
    this.geminiService = new GeminiAiService();
    this.openRouterService = new OpenRouterService();
  }

  isConfigured(): boolean {
    return (
      this.groqService.isConfigured() ||
      this.geminiService.isConfigured() ||
      this.openRouterService.isConfigured()
    );
  }

  getDiagnostics(): {
    chainOrder: string[];
    primaryProvider: string;
    secondaryProvider: string;
    fallbackProvider: string;
    providers: {
      groq: ProviderDiagnosticInfo;
      gemini: ProviderDiagnosticInfo;
      openrouter: ProviderDiagnosticInfo;
    };
  } {
    return {
      chainOrder: [
        "Groq (Primary Fast LPU)",
        "Google Gemini (High Reasoning & Output)",
        "OpenRouter (Free Tier Safety Net)",
      ],
      primaryProvider: `Groq (${this.groqService.defaultModel})`,
      secondaryProvider: `Google Gemini (${this.geminiService.defaultModel})`,
      fallbackProvider: `OpenRouter Free (${this.openRouterService.defaultModel})`,
      providers: {
        groq: {
          name: "Groq",
          configured: this.groqService.isConfigured(),
          model: this.groqService.defaultModel,
          status: this.groqService.status,
          lastError: this.groqService.lastError,
          isFreeOnly: false,
          keyPresent: Boolean(process.env.GROQ_API_KEY?.trim()),
        },
        gemini: {
          name: "Google Gemini",
          configured: this.geminiService.isConfigured(),
          model: this.geminiService.defaultModel,
          status: this.geminiService.status,
          lastError: this.geminiService.lastError,
          isFreeOnly: false,
          keyPresent: Boolean(process.env.GEMINI_API_KEY?.trim()),
        },
        openrouter: {
          name: "OpenRouter (Free Tier Only)",
          configured: this.openRouterService.isConfigured(),
          model: this.openRouterService.defaultModel,
          status: this.openRouterService.status,
          lastError: this.openRouterService.lastError,
          isFreeOnly: true, // STRICT ZERO COST
          keyPresent: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
        },
      },
    };
  }

  async chat(
    messages: AiMessage[],
    options: AiCompletionOptions = {}
  ): Promise<AiCompletionResult> {
    const errors: Array<{ provider: string; error: string }> = [];

    // ─────────────────────────────────────────────────────────────────────────
    // TIER 1: Groq (Primary Text Generation Provider)
    // ─────────────────────────────────────────────────────────────────────────
    if (this.groqService.isConfigured()) {
      try {
        const result = await this.groqService.chat(messages, options);
        return result;
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        console.warn(`[ChainedFallback] Primary provider (Groq) failed: ${errorMsg}. Escalating to Tier 2 (Google Gemini)...`);
        errors.push({ provider: "Groq (Primary)", error: errorMsg });
      }
    } else {
      errors.push({ provider: "Groq (Primary)", error: "GROQ_API_KEY is not configured" });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TIER 2: Google Gemini (Secondary Provider: High reasoning & JSON compliance)
    // ─────────────────────────────────────────────────────────────────────────
    if (this.geminiService.isConfigured()) {
      try {
        const result = await this.geminiService.chat(messages, options);
        return result;
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        console.warn(`[ChainedFallback] Tier 2 provider (Google Gemini) failed: ${errorMsg}. Escalating to Tier 3 (OpenRouter free-only)...`);
        errors.push({ provider: "Google Gemini", error: errorMsg });
      }
    } else {
      errors.push({ provider: "Google Gemini", error: "GEMINI_API_KEY is not configured" });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TIER 3: OpenRouter (Tertiary Free-Only Safety Net)
    // ─────────────────────────────────────────────────────────────────────────
    if (this.openRouterService.isConfigured()) {
      try {
        const result = await this.openRouterService.chat(messages, options);
        return result;
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        console.error(`[ChainedFallback] Fallback provider (OpenRouter free-only) failed: ${errorMsg}.`);
        errors.push({ provider: "OpenRouter (Free Fallback)", error: errorMsg });
      }
    } else {
      errors.push({ provider: "OpenRouter (Free Fallback)", error: "OPENROUTER_API_KEY is not configured" });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Exhaustion: All tiers failed
    // ─────────────────────────────────────────────────────────────────────────
    const summary = errors
      .map((e) => `• ${e.provider}: ${e.error}`)
      .join("\n");

    throw new Error(
      `All active AI providers in the fallback hierarchy failed:\n${summary}\n\nPlease check your provider configuration or connection.`
    );
  }
}
