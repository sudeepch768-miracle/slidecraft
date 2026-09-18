/**
 * Centralized Multi-Provider AI Task Router for SlideCraft AI
 *
 * Implements strict workload distribution:
 * - GROQ: Primary for fast text generation, outlines, slides, notes, JSON content
 * - NVIDIA: Dedicated exclusively for image generation & visual assets
 * - OPENROUTER: Implementation, code, layout structures (strictly free-tier only)
 * - GEMINI: Complex reasoning, prompt breakdown, visual QA, and workflow orchestration
 *
 * NEVER uses OpenAI.
 * NEVER allows cross-domain fallback (e.g. image -> text).
 */

import {
  AiService,
  AiMessage,
  AiCompletionOptions,
  AiCompletionResult,
} from "../service/ai-service-interface";
import { GroqAiService } from "../service/groq-provider";
import { OpenRouterService } from "../service/openrouter-provider";
import { GeminiAiService } from "../service/gemini-provider";
import { generateImage } from "../image-generation/nvidia-flux-provider";
import { GenerateImageRequest, GenerateImageResult, GenerateImageError } from "../image-generation/types";
import { executeMcpTool, SlideCraftMcpToolName } from "@/lib/mcp/client";
import { McpToolResponse } from "../../../../server/mcp/types";

// ─── Task Type Definitions ───────────────────────────────────────────────────

export type AiTaskType =
  // MCP Controlled Tool Execution
  | "MCP_TOOL_EXECUTION"
  // Groq Responsibilities (Text & Content)
  | "TEXT_CONTENT"
  | "CONTENT_PLANNING"
  | "CONTENT_PLANNER"
  | "STRUCTURED_JSON"
  | "SLIDE_TEXT"
  | "BULLETS"
  | "SPEAKER_NOTES"
  | "COPYWRITING"
  | "OUTLINE"
  // NVIDIA Responsibilities (Visual & Image only)
  | "IMAGE_GENERATION"
  | "VISUAL_ASSET"
  | "BACKGROUND_IMAGE"
  // OpenRouter Responsibilities (Implementation, Code, Layout)
  | "CODE_IMPLEMENTATION"
  | "CODE_GEN"
  | "REACT_COMPONENTS"
  | "SVG_GEN"
  | "MERMAID"
  | "LAYOUT_CALC"
  | "EXPORT_COMPILE"
  | "UI_IMPLEMENTATION"
  | "BACKEND_IMPLEMENTATION"
  | "PPTX_IMPLEMENTATION"
  | "PDF_IMPLEMENTATION"
  // Gemini Responsibilities (Reasoning, Review, QA, Orchestration)
  | "REQUIREMENT_ANALYSIS"
  | "DEEP_REASONING"
  | "PROMPT_ANALYSIS"
  | "REQUIREMENT_EXTRACTION"
  | "QUALITY_REVIEW"
  | "VISUAL_REVIEW"
  | "OVERFLOW_QA"
  | "QUALITY_SCORING"
  | "CONSISTENCY_CHECK"
  | "CODE_REVIEW"
  | "ERROR_DIAGNOSIS"
  | "FINAL_VALIDATION"
  | "MULTI_PROVIDER_ORCHESTRATION";

export type ProviderId = "groq" | "nvidia" | "openrouter" | "gemini";

export interface TaskRouteDefinition {
  primaryProvider: ProviderId;
  fallbackProvider: ProviderId | null;
  allowedProviders: ProviderId[];
}

export const TASK_ROUTING_MATRIX: Record<AiTaskType, TaskRouteDefinition> = {
  // 0. MCP Controlled Tool Execution
  MCP_TOOL_EXECUTION: {
    primaryProvider: "groq",
    fallbackProvider: null,
    allowedProviders: ["groq"],
  },
  // 1. Text & Content tasks -> Groq (Fallback: Gemini, Tertiary: OpenRouter)
  TEXT_CONTENT: {
    primaryProvider: "groq",
    fallbackProvider: "gemini",
    allowedProviders: ["groq", "gemini", "openrouter"],
  },
  CONTENT_PLANNING: {
    primaryProvider: "groq",
    fallbackProvider: "gemini",
    allowedProviders: ["groq", "gemini", "openrouter"],
  },
  CONTENT_PLANNER: {
    primaryProvider: "groq",
    fallbackProvider: "gemini",
    allowedProviders: ["groq", "gemini", "openrouter"],
  },
  STRUCTURED_JSON: {
    primaryProvider: "groq",
    fallbackProvider: "gemini",
    allowedProviders: ["groq", "gemini", "openrouter"],
  },
  SLIDE_TEXT: {
    primaryProvider: "groq",
    fallbackProvider: "gemini",
    allowedProviders: ["groq", "gemini", "openrouter"],
  },
  BULLETS: {
    primaryProvider: "groq",
    fallbackProvider: "gemini",
    allowedProviders: ["groq", "gemini", "openrouter"],
  },
  SPEAKER_NOTES: {
    primaryProvider: "groq",
    fallbackProvider: "gemini",
    allowedProviders: ["groq", "gemini", "openrouter"],
  },
  COPYWRITING: {
    primaryProvider: "groq",
    fallbackProvider: "gemini",
    allowedProviders: ["groq", "gemini", "openrouter"],
  },
  OUTLINE: {
    primaryProvider: "groq",
    fallbackProvider: "gemini",
    allowedProviders: ["groq", "gemini", "openrouter"],
  },

  // 2. Image tasks -> NVIDIA (No text fallback permitted)
  IMAGE_GENERATION: {
    primaryProvider: "nvidia",
    fallbackProvider: null,
    allowedProviders: ["nvidia"],
  },
  VISUAL_ASSET: {
    primaryProvider: "nvidia",
    fallbackProvider: null,
    allowedProviders: ["nvidia"],
  },
  BACKGROUND_IMAGE: {
    primaryProvider: "nvidia",
    fallbackProvider: null,
    allowedProviders: ["nvidia"],
  },

  // 3. Technical & Implementation tasks -> OpenRouter (Fallback: Gemini)
  CODE_IMPLEMENTATION: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },
  CODE_GEN: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },
  REACT_COMPONENTS: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },
  SVG_GEN: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },
  MERMAID: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },
  LAYOUT_CALC: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },
  EXPORT_COMPILE: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },
  UI_IMPLEMENTATION: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },
  BACKEND_IMPLEMENTATION: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },
  PPTX_IMPLEMENTATION: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },
  PDF_IMPLEMENTATION: {
    primaryProvider: "openrouter",
    fallbackProvider: "gemini",
    allowedProviders: ["openrouter", "gemini"],
  },

  // 4. Reasoning, Review, QA tasks -> Gemini (Fallback: OpenRouter free-only)
  REQUIREMENT_ANALYSIS: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  DEEP_REASONING: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  PROMPT_ANALYSIS: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  REQUIREMENT_EXTRACTION: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  QUALITY_REVIEW: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  VISUAL_REVIEW: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  OVERFLOW_QA: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  QUALITY_SCORING: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  CONSISTENCY_CHECK: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  CODE_REVIEW: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  ERROR_DIAGNOSIS: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  FINAL_VALIDATION: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
  MULTI_PROVIDER_ORCHESTRATION: {
    primaryProvider: "gemini",
    fallbackProvider: "openrouter",
    allowedProviders: ["gemini", "openrouter"],
  },
};

// ─── Concurrency & Circuit Breaker Types ─────────────────────────────────────

interface ProviderCircuitBreaker {
  failureCount: number;
  lastFailureTime: number;
  isOpen: boolean; // true = tripped / degraded
}

export interface TaskAuditLog {
  taskId: string;
  taskType: AiTaskType;
  selectedProvider: ProviderId;
  fallbackProvider?: ProviderId;
  modelUsed: string;
  durationMs: number;
  success: boolean;
  retryCount: number;
  errorCategory?: string;
  timestamp: string;
}

// ─── Central Router Implementation ───────────────────────────────────────────

export class AiTaskRouter {
  private groqService: GroqAiService;
  private openRouterService: OpenRouterService;
  private geminiService: GeminiAiService;

  // Concurrency tracking: current active counts
  private activeConcurrency: Record<ProviderId, number> = {
    groq: 0,
    openrouter: 0,
    nvidia: 0,
    gemini: 0,
  };

  // Concurrency limits per provider
  private concurrencyLimits: Record<ProviderId, number> = {
    groq: 10,
    openrouter: 3,
    nvidia: 2,
    gemini: 4,
  };

  // Circuit breaker state per provider
  private circuitBreakers: Record<ProviderId, ProviderCircuitBreaker> = {
    groq: { failureCount: 0, lastFailureTime: 0, isOpen: false },
    openrouter: { failureCount: 0, lastFailureTime: 0, isOpen: false },
    nvidia: { failureCount: 0, lastFailureTime: 0, isOpen: false },
    gemini: { failureCount: 0, lastFailureTime: 0, isOpen: false },
  };

  // Request deduplication cache: signature -> Promise
  private activeDeduplications = new Map<string, Promise<any>>();

  // Audit logs (ring buffer of last 100 entries)
  private auditLogs: TaskAuditLog[] = [];

  constructor() {
    this.groqService = new GroqAiService();
    this.openRouterService = new OpenRouterService();
    this.geminiService = new GeminiAiService();
  }

  /**
   * Get reference to underlying provider service
   */
  getProvider(providerId: ProviderId): AiService {
    switch (providerId) {
      case "groq":
        return this.groqService;
      case "openrouter":
        return this.openRouterService;
      case "gemini":
        return this.geminiService;
      case "nvidia":
        throw new Error("NVIDIA provider is strictly for image generation; use executeImageTask().");
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }

  /**
   * Check if a provider's circuit breaker allows requests
   */
  private canUseProvider(providerId: ProviderId): boolean {
    const cb = this.circuitBreakers[providerId];
    if (!cb.isOpen) return true;

    // Auto-recovery check after 30 seconds
    const now = Date.now();
    if (now - cb.lastFailureTime > 30000) {
      cb.isOpen = false;
      cb.failureCount = 0;
      return true;
    }
    return false;
  }

  private recordProviderSuccess(providerId: ProviderId) {
    const cb = this.circuitBreakers[providerId];
    cb.failureCount = 0;
    cb.isOpen = false;
  }

  private recordProviderFailure(providerId: ProviderId) {
    const cb = this.circuitBreakers[providerId];
    cb.failureCount++;
    cb.lastFailureTime = Date.now();
    if (cb.failureCount >= 3) {
      cb.isOpen = true;
      console.warn(`[AiTaskRouter] Circuit breaker TRIPPED for provider '${providerId}' (3 consecutive failures).`);
    }
  }

  /**
   * Execute task with concurrency limit control
   */
  private async executeWithConcurrencyLimit<T>(
    providerId: ProviderId,
    fn: () => Promise<T>
  ): Promise<T> {
    const limit = this.concurrencyLimits[providerId];

    // Simple polling wait if over limit
    let waitAttempts = 0;
    while (this.activeConcurrency[providerId] >= limit && waitAttempts < 40) {
      await new Promise((res) => setTimeout(res, 150));
      waitAttempts++;
    }

    this.activeConcurrency[providerId]++;
    try {
      return await fn();
    } finally {
      this.activeConcurrency[providerId] = Math.max(0, this.activeConcurrency[providerId] - 1);
    }
  }

  /**
   * Primary Entry Point: Execute a structured text/reasoning/code AI task.
   * Every request MUST declare its task type.
   */
  async executeTask(
    taskType: AiTaskType,
    messages: AiMessage[],
    options: AiCompletionOptions = {},
    dedupKey?: string
  ): Promise<AiCompletionResult> {
    // 1. Validate route configuration
    const route = TASK_ROUTING_MATRIX[taskType];
    if (!route) {
      throw new Error(`[AiTaskRouter] Unknown task type '${taskType}'. Every AI request must declare a valid task type.`);
    }

    // 2. Reject image tasks through text router
    if (taskType === "IMAGE_GENERATION" || taskType === "VISUAL_ASSET" || taskType === "BACKGROUND_IMAGE") {
      throw new Error(
        `[AiTaskRouter] Task '${taskType}' is an image task. Use router.executeImageTask() with NVIDIA FLUX exclusively.`
      );
    }

    // 3. Request Deduplication: if active task with same key is running, reuse its promise
    if (dedupKey) {
      const existing = this.activeDeduplications.get(dedupKey);
      if (existing) {
        return existing;
      }
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();

    const taskExecutionPromise = (async () => {
      let selectedProvider: ProviderId = route.primaryProvider;
      let fallbackProviderUsed: ProviderId | undefined = undefined;
      let retryCount = 0;
      let lastError: any = null;

      // 4. Attempt Primary Provider
      const primaryService = this.getProvider(selectedProvider);
      const isPrimaryAvailable = primaryService.isConfigured() && this.canUseProvider(selectedProvider);

      if (isPrimaryAvailable) {
        try {
          const result = await this.executeWithConcurrencyLimit(selectedProvider, () =>
            primaryService.chat(messages, options)
          );
          this.recordProviderSuccess(selectedProvider);
          this.logAudit({
            taskId,
            taskType,
            selectedProvider,
            modelUsed: result.modelUsed,
            durationMs: Date.now() - startTime,
            success: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          });
          return result;
        } catch (err: any) {
          lastError = err;
          retryCount++;
          this.recordProviderFailure(selectedProvider);
          console.warn(
            `[AiTaskRouter] Primary provider '${selectedProvider}' failed for task '${taskType}': ${err.message}. Checking fallback...`
          );
        }
      } else {
        lastError = new Error(
          `Primary provider '${selectedProvider}' is not configured or circuit breaker is open.`
        );
      }

      // 5. Attempt Task-Specific Fallback if allowed
      if (route.fallbackProvider) {
        fallbackProviderUsed = route.fallbackProvider;
        const fallbackService = this.getProvider(fallbackProviderUsed);

        if (fallbackService.isConfigured() && this.canUseProvider(fallbackProviderUsed)) {
          try {
            console.log(
              `[AiTaskRouter] Routing '${taskType}' to fallback provider '${fallbackProviderUsed}'...`
            );
            const result = await this.executeWithConcurrencyLimit(fallbackProviderUsed, () =>
              fallbackService.chat(messages, options)
            );
            this.recordProviderSuccess(fallbackProviderUsed);
            this.logAudit({
              taskId,
              taskType,
              selectedProvider,
              fallbackProvider: fallbackProviderUsed,
              modelUsed: result.modelUsed,
              durationMs: Date.now() - startTime,
              success: true,
              retryCount,
              timestamp: new Date().toISOString(),
            });
            return result;
          } catch (fbErr: any) {
            this.recordProviderFailure(fallbackProviderUsed);
            lastError = fbErr;
            console.error(
              `[AiTaskRouter] Fallback provider '${fallbackProviderUsed}' also failed for task '${taskType}': ${fbErr.message}`
            );
          }
        }
      }

      // 5b. Attempt Tertiary Provider if available in allowedProviders
      const remainingProviders = route.allowedProviders.filter(
        (p) => p !== selectedProvider && p !== fallbackProviderUsed
      );
      for (const tertiary of remainingProviders) {
        const tertiaryService = this.getProvider(tertiary);
        if (tertiaryService.isConfigured() && this.canUseProvider(tertiary)) {
          try {
            console.log(
              `[AiTaskRouter] Routing '${taskType}' to tertiary safety provider '${tertiary}'...`
            );
            const result = await this.executeWithConcurrencyLimit(tertiary, () =>
              tertiaryService.chat(messages, options)
            );
            this.recordProviderSuccess(tertiary);
            this.logAudit({
              taskId,
              taskType,
              selectedProvider,
              fallbackProvider: tertiary,
              modelUsed: result.modelUsed,
              durationMs: Date.now() - startTime,
              success: true,
              retryCount: retryCount + 1,
              timestamp: new Date().toISOString(),
            });
            return result;
          } catch (tertErr: any) {
            this.recordProviderFailure(tertiary);
            lastError = tertErr;
          }
        }
      }

      // 6. Exhaustion
      this.logAudit({
        taskId,
        taskType,
        selectedProvider,
        fallbackProvider: fallbackProviderUsed,
        modelUsed: "none",
        durationMs: Date.now() - startTime,
        success: false,
        retryCount,
        errorCategory: lastError?.message || "All providers exhausted",
        timestamp: new Date().toISOString(),
      });

      throw new Error(
        `[AiTaskRouter] Failed to execute task '${taskType}'. Primary provider '${selectedProvider}' and fallback '${route.fallbackProvider || "none"}' failed: ${lastError?.message}`
      );
    })();

    if (dedupKey) {
      this.activeDeduplications.set(dedupKey, taskExecutionPromise);
      taskExecutionPromise.finally(() => {
        this.activeDeduplications.delete(dedupKey);
      });
    }

    return taskExecutionPromise;
  }

  /**
   * Dedicated Image Generation Task Runner.
   * Exclusively routed to NVIDIA FLUX. Never falls back to a text provider.
   */
  async executeImageTask(
    options: GenerateImageRequest,
    taskType: "IMAGE_GENERATION" | "VISUAL_ASSET" | "BACKGROUND_IMAGE" = "IMAGE_GENERATION"
  ): Promise<GenerateImageResult | GenerateImageError> {
    const taskId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();

    try {
      const result = await this.executeWithConcurrencyLimit("nvidia", () =>
        generateImage(options)
      );

      if ("code" in result) {
        this.recordProviderFailure("nvidia");
        this.logAudit({
          taskId,
          taskType,
          selectedProvider: "nvidia",
          modelUsed: process.env.NVIDIA_IMAGE_MODEL || "flux.2-klein-4b",
          durationMs: Date.now() - startTime,
          success: false,
          retryCount: 0,
          errorCategory: result.code,
          timestamp: new Date().toISOString(),
        });
        return result;
      }

      this.recordProviderSuccess("nvidia");
      this.logAudit({
        taskId,
        taskType,
        selectedProvider: "nvidia",
        modelUsed: result.provider,
        durationMs: Date.now() - startTime,
        success: true,
        retryCount: 0,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (err: any) {
      this.recordProviderFailure("nvidia");
      this.logAudit({
        taskId,
        taskType,
        selectedProvider: "nvidia",
        modelUsed: process.env.NVIDIA_IMAGE_MODEL || "flux.2-klein-4b",
        durationMs: Date.now() - startTime,
        success: false,
        retryCount: 0,
        errorCategory: err.message,
        timestamp: new Date().toISOString(),
      });
      throw err;
    }
  }

  /**
   * Health Diagnostics for all 4 providers
   */
  async getDiagnostics(): Promise<{
    providers: Record<ProviderId, {
      name: string;
      configured: boolean;
      status: string;
      circuitBreakerOpen: boolean;
      activeConcurrency: number;
      defaultModel: string;
    }>;
    matrix: Record<AiTaskType, TaskRouteDefinition>;
    recentAuditLogs: TaskAuditLog[];
  }> {
    return {
      providers: {
        groq: {
          name: "Groq",
          configured: this.groqService.isConfigured(),
          status: this.groqService.status,
          circuitBreakerOpen: this.circuitBreakers.groq.isOpen,
          activeConcurrency: this.activeConcurrency.groq,
          defaultModel: this.groqService.defaultModel,
        },
        nvidia: {
          name: "NVIDIA FLUX",
          configured: Boolean(process.env.NVIDIA_API_KEY?.trim()),
          status: Boolean(process.env.NVIDIA_API_KEY?.trim()) ? "available" : "not_configured",
          circuitBreakerOpen: this.circuitBreakers.nvidia.isOpen,
          activeConcurrency: this.activeConcurrency.nvidia,
          defaultModel: process.env.NVIDIA_IMAGE_MODEL || "black-forest-labs/flux.2-klein-4b",
        },
        openrouter: {
          name: "OpenRouter (Free Only)",
          configured: this.openRouterService.isConfigured(),
          status: this.openRouterService.status,
          circuitBreakerOpen: this.circuitBreakers.openrouter.isOpen,
          activeConcurrency: this.activeConcurrency.openrouter,
          defaultModel: this.openRouterService.defaultModel,
        },
        gemini: {
          name: "Google Gemini",
          configured: this.geminiService.isConfigured(),
          status: this.geminiService.status,
          circuitBreakerOpen: this.circuitBreakers.gemini.isOpen,
          activeConcurrency: this.activeConcurrency.gemini,
          defaultModel: this.geminiService.defaultModel,
        },
      },
      matrix: TASK_ROUTING_MATRIX,
      recentAuditLogs: this.auditLogs.slice(-20),
    };
  }

  private logAudit(entry: TaskAuditLog) {
    this.auditLogs.push(entry);
    if (this.auditLogs.length > 100) {
      this.auditLogs.shift();
    }
    console.log(
      `[AI Audit] [${entry.taskType}] Provider: ${entry.selectedProvider}${entry.fallbackProvider ? ` -> ${entry.fallbackProvider}` : ""
      } | Model: ${entry.modelUsed} | Duration: ${entry.durationMs}ms | Success: ${entry.success}`
    );
  }

  /**
   * Dispatches an MCP tool execution through the controlled SlideCraft MCP layer.
   */
  public async executeMcpTool<T = any>(
    toolName: SlideCraftMcpToolName,
    args: Record<string, any>
  ): Promise<McpToolResponse<T>> {
    return executeMcpTool<T>(toolName, args);
  }
}

// Global Singleton Router Instance
export const aiTaskRouter = new AiTaskRouter();
