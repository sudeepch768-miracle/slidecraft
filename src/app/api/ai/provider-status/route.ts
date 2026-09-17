import { NextResponse } from "next/server";
import { isGuaranteedFreeOpenRouterModel } from "@/lib/ai/service/openrouter-provider";
import { TASK_ROUTING_MATRIX, aiTaskRouter } from "@/lib/ai/routing/ai-task-router";

export const dynamic = "force-dynamic";

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

export async function GET() {
  const groqKey = cleanEnv(process.env.GROQ_API_KEY);
  const openRouterKey = cleanEnv(process.env.OPENROUTER_API_KEY);
  const nvidiaKey = cleanEnv(process.env.NVIDIA_API_KEY);
  const geminiKey = cleanEnv(process.env.GEMINI_API_KEY);

  const rawGroqModel = cleanEnv(process.env.GROQ_MODEL) || "llama-3.3-70b-versatile";
  const rawOpenRouterModel = cleanEnv(process.env.OPENROUTER_TEXT_MODEL) || "openrouter/free";
  const nvidiaModel = cleanEnv(process.env.NVIDIA_IMAGE_MODEL) || "black-forest-labs/flux.2-klein-4b";
  const rawGeminiModel = cleanEnv(process.env.GEMINI_MODEL) || "gemini-3.6-flash";

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Diagnostics: Groq (Text Generation & Fast Content Tasks)
  // ─────────────────────────────────────────────────────────────────────────
  let groqStatus: "available" | "invalid_model" | "invalid_key" | "rate_limited" | "not_configured" | "error" = "not_configured";
  let groqError: string | null = null;
  let groqEffectiveModel = rawGroqModel;

  if (!groqKey) {
    groqStatus = "not_configured";
    groqError = "GROQ_API_KEY is not configured in .env.local.";
  } else {
    try {
      const testRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: rawGroqModel,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 15,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (testRes.ok) {
        groqStatus = "available";
        groqError = null;
      } else {
        const errJson = await testRes.json().catch(() => ({}));
        const msg = errJson?.error?.message || testRes.statusText;

        if (testRes.status === 401) {
          groqStatus = "invalid_key";
          groqError = "Invalid Groq API key.";
        } else if (testRes.status === 404 || msg.includes("model_not_found")) {
          const altModel = "openai/gpt-oss-120b";
          try {
            const altRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${groqKey}`,
              },
              body: JSON.stringify({
                model: altModel,
                messages: [{ role: "user", content: "ping" }],
                max_tokens: 15,
              }),
              signal: AbortSignal.timeout(6000),
            });
            if (altRes.ok) {
              groqStatus = "available";
              groqError = null;
              groqEffectiveModel = `${altModel} (auto-switched)`;
            } else {
              groqStatus = "invalid_model";
              groqError = `Groq model '${rawGroqModel}' not found on this account.`;
            }
          } catch {
            groqStatus = "invalid_model";
            groqError = `Groq model '${rawGroqModel}' not found on this account.`;
          }
        } else if (testRes.status === 429) {
          groqStatus = "rate_limited";
          groqError = "Groq rate limit exceeded.";
        } else {
          groqStatus = "error";
          groqError = `Groq test error: ${msg}`;
        }
      }
    } catch (err: any) {
      groqStatus = "error";
      groqError = `Failed to connect to Groq: ${err.message}`;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Diagnostics: OpenRouter (Technical & Implementation - Strict Free-Only)
  // ─────────────────────────────────────────────────────────────────────────
  let openRouterStatus: "available" | "blocked_non_free" | "invalid_key" | "rate_limited" | "not_configured" | "error" = "not_configured";
  let openRouterError: string | null = null;
  const isModelFree = isGuaranteedFreeOpenRouterModel(rawOpenRouterModel);

  if (!openRouterKey) {
    openRouterStatus = "not_configured";
    openRouterError = "OPENROUTER_API_KEY is not configured in .env.local.";
  } else if (!isModelFree) {
    openRouterStatus = "blocked_non_free";
    openRouterError = `Model '${rawOpenRouterModel}' is not confirmed zero-cost. Paid models and openrouter/auto are strictly blocked.`;
  } else {
    try {
      const testRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://slidecraft.ai",
          "X-Title": "SlideCraft AI Studio",
        },
        body: JSON.stringify({
          model: rawOpenRouterModel,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 2,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (testRes.ok) {
        openRouterStatus = "available";
        openRouterError = null;
      } else {
        const errJson = await testRes.json().catch(() => ({}));
        const msg = errJson?.error?.message || testRes.statusText;

        if (testRes.status === 401 || testRes.status === 403) {
          openRouterStatus = "invalid_key";
          openRouterError = "Invalid OpenRouter API key.";
        } else if (testRes.status === 429) {
          openRouterStatus = "rate_limited";
          openRouterError = "OpenRouter free-tier rate limit exceeded.";
        } else {
          openRouterStatus = "error";
          openRouterError = `OpenRouter API returned HTTP ${testRes.status}: ${msg}`;
        }
      }
    } catch (err: any) {
      openRouterStatus = "error";
      openRouterError = `Failed to connect to OpenRouter: ${err.message}`;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Diagnostics: NVIDIA FLUX (Dedicated Image & Visual Design)
  // ─────────────────────────────────────────────────────────────────────────
  const nvidiaStatus: "available" | "not_configured" = nvidiaKey ? "available" : "not_configured";
  const nvidiaError = nvidiaKey ? null : "NVIDIA_API_KEY is not configured in .env.local.";

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Diagnostics: Google Gemini (Complex Reasoning, QA & Orchestration)
  // ─────────────────────────────────────────────────────────────────────────
  let geminiStatus: "available" | "invalid_key" | "invalid_model" | "rate_limited" | "not_configured" | "error" = "not_configured";
  let geminiError: string | null = null;

  if (!geminiKey) {
    geminiStatus = "not_configured";
    geminiError = "GEMINI_API_KEY is not configured in .env.local.";
  } else {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(rawGeminiModel)}:generateContent?key=${geminiKey}`;
      const gRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "ping" }] }],
          generationConfig: { maxOutputTokens: 2 },
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (gRes.ok) {
        geminiStatus = "available";
        geminiError = null;
      } else {
        const errJson = await gRes.json().catch(() => ({}));
        const msg = errJson?.error?.message || gRes.statusText;

        if (gRes.status === 400 && msg.toLowerCase().includes("key")) {
          geminiStatus = "invalid_key";
          geminiError = "Invalid Gemini API key.";
        } else if (gRes.status === 404) {
          geminiStatus = "invalid_model";
          geminiError = `Gemini model '${rawGeminiModel}' not found.`;
        } else if (gRes.status === 429) {
          geminiStatus = "rate_limited";
          geminiError = "Gemini rate limit exceeded.";
        } else {
          geminiStatus = "error";
          geminiError = `Gemini error: ${msg}`;
        }
      }
    } catch (err: any) {
      geminiStatus = "error";
      geminiError = `Failed to connect to Gemini: ${err.message}`;
    }
  }

  // Active Provider Summary
  let activeTextProvider = "None (No provider available)";
  if (groqStatus === "available") {
    activeTextProvider = `Groq (${groqEffectiveModel})`;
  } else if (openRouterStatus === "available") {
    activeTextProvider = `OpenRouter Free (${rawOpenRouterModel})`;
  }

  const routerDiagnostics = await aiTaskRouter.getDiagnostics();

  return NextResponse.json({
    architecture: "Strict Multi-Provider Decoupled Routing",
    activeTextProvider,
    activeImageProvider: nvidiaKey ? `NVIDIA FLUX (${nvidiaModel})` : "Not Configured",
    activeReasoningProvider: geminiStatus === "available" ? `Gemini (${rawGeminiModel})` : "OpenRouter Free (Fallback)",
    activeImplementationProvider: openRouterStatus === "available" ? `OpenRouter Free (${rawOpenRouterModel})` : "Gemini (Fallback)",
    providers: {
      groq: {
        name: "Groq",
        role: "Text Generation & Content Planning",
        configuredModel: rawGroqModel,
        effectiveModel: groqEffectiveModel,
        status: groqStatus,
        lastError: groqError,
        isFreeOnly: false,
        keyPresent: Boolean(groqKey),
        concurrencyLimit: 10,
        circuitBreakerOpen: routerDiagnostics.providers.groq.circuitBreakerOpen,
      },
      nvidia: {
        name: "NVIDIA FLUX",
        role: "Dedicated Image Generation & Visual Design",
        configuredModel: nvidiaModel,
        effectiveModel: nvidiaModel,
        status: nvidiaStatus,
        lastError: nvidiaError,
        isFreeOnly: false,
        keyPresent: Boolean(nvidiaKey),
        concurrencyLimit: 2,
        circuitBreakerOpen: routerDiagnostics.providers.nvidia.circuitBreakerOpen,
      },
      openrouter: {
        name: "OpenRouter (Free Tier Only)",
        role: "Implementation, Code, and Layout Structure",
        configuredModel: rawOpenRouterModel,
        effectiveModel: rawOpenRouterModel,
        status: openRouterStatus,
        lastError: openRouterError,
        isFreeOnly: true, // STRICT ZERO COST
        isModelVerifiedFree: isModelFree,
        keyPresent: Boolean(openRouterKey),
        concurrencyLimit: 3,
        circuitBreakerOpen: routerDiagnostics.providers.openrouter.circuitBreakerOpen,
      },
      gemini: {
        name: "Google Gemini",
        role: "Complex Reasoning, QA Review & Orchestration",
        configuredModel: rawGeminiModel,
        effectiveModel: rawGeminiModel,
        status: geminiStatus,
        lastError: geminiError,
        isFreeOnly: false,
        keyPresent: Boolean(geminiKey),
        concurrencyLimit: 4,
        circuitBreakerOpen: routerDiagnostics.providers.gemini.circuitBreakerOpen,
      },
    },
    routingMatrix: TASK_ROUTING_MATRIX,
    recentAuditLogs: routerDiagnostics.recentAuditLogs,
  });
}
