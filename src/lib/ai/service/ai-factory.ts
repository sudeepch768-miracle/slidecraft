import { AiService } from "./ai-service-interface";
import { GroqAiService } from "./groq-provider";
import { OpenRouterService } from "./openrouter-provider";
import { GeminiAiService } from "./gemini-provider";
import { ChainedFallbackAiService } from "./chained-fallback-service";
import { aiTaskRouter, AiTaskRouter } from "../routing/ai-task-router";

let currentService: AiService | null = null;

/**
 * Returns the active AI text generation service.
 * By default, returns a ChainedFallbackAiService executing:
 *   Groq (Primary) → OpenRouter Free (Fallback)
 * Can be locked to a single provider via AI_PROVIDER environment variable.
 */
export function getAiService(): AiService {
  if (!currentService) {
    const provider = (process.env.AI_PROVIDER || "chain").toLowerCase().trim();

    switch (provider) {
      case "groq":
        currentService = new GroqAiService();
        break;
      case "openrouter":
        currentService = new OpenRouterService();
        break;
      case "gemini":
        currentService = new GeminiAiService();
        break;
      case "chain":
      default:
        currentService = new ChainedFallbackAiService();
        break;
    }
  }

  return currentService;
}

/**
 * Returns the centralized multi-provider task router
 */
export function getAiTaskRouter(): AiTaskRouter {
  return aiTaskRouter;
}

/**
 * Allow test suites or custom runners to inject mock AI service
 */
export function setAiServiceForTesting(mockService: AiService | null) {
  currentService = mockService;
}
