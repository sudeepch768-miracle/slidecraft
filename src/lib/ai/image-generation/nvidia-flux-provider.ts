/**
 * NVIDIA FLUX.1 Schnell — Image Generation Provider (CORRECTED)
 *
 * Verified API contract (from live testing):
 *   POST https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell
 *   Body: { prompt, width, height, steps, seed }
 *   Valid dimensions: 768 | 832 | 896 | 960 | 1024 | 1088 | 1152 | 1216 | 1280 | 1344
 *   Response: { artifacts: [{ base64, content_type, finish_reason }] }
 *
 * This module is SERVER-SIDE ONLY. The NVIDIA API key must never be sent to the browser.
 */

import {
  GenerateImageRequest,
  GenerateImageResult,
  GenerateImageError,
  ImageAspectRatio,
  ImageQuality,
} from "./types";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Constants ────────────────────────────────────────────────────────────────

// NVIDIA FLUX uses a separate genai endpoint (NOT integrate.api.nvidia.com)
const NVIDIA_GENAI_BASE = (process.env.NVIDIA_API_BASE_URL || "https://ai.api.nvidia.com/v1/genai").replace(/\/+$/, "");
const DEFAULT_MODEL = "black-forest-labs/flux.2-klein-4b";


const STORAGE_BUCKET = "generated-assets";

/**
 * Valid pixel values accepted by NVIDIA FLUX.
 * Both width and height must be one of these values.
 */
const VALID_SIZES = [768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344] as const;
type ValidSize = typeof VALID_SIZES[number];

/**
 * Clamp an arbitrary pixel value to the nearest valid NVIDIA FLUX size.
 */
function clampToValidSize(value: number): ValidSize {
  let closest: ValidSize = VALID_SIZES[0];
  let minDist = Math.abs(value - closest);
  for (const s of VALID_SIZES) {
    const dist = Math.abs(value - s);
    if (dist < minDist) {
      minDist = dist;
      closest = s;
    }
  }
  return closest;
}

/**
 * Map an aspect ratio to validated NVIDIA FLUX width × height.
 * Both dimensions must be in VALID_SIZES.
 */
function aspectRatioDimensions(ratio?: ImageAspectRatio): { width: ValidSize; height: ValidSize } {
  switch (ratio) {
    case "16:9":  return { width: 1344, height: 768  };
    case "9:16":  return { width: 768,  height: 1344 };
    case "4:3":   return { width: 1088, height: 832  };
    case "3:4":   return { width: 832,  height: 1088 };
    case "21:9":  return { width: 1344, height: 832  }; // closest supported ultra-wide
    case "3:2":   return { width: 1152, height: 768  };
    case "2:3":   return { width: 768,  height: 1152 };
    case "1:1":
    default:      return { width: 1024, height: 1024 };
  }
}

/**
 * Map quality to number of diffusion steps.
 * FLUX.2 Klein 4B is a 4-step distilled model: input must be <= 4 steps.
 */
function qualityToSteps(quality?: ImageQuality): number {
  switch (quality) {
    case "draft":    return 2;
    case "standard": return 4;
    case "high":     return 4;
    default:         return 4;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.NVIDIA_API_KEY?.replace(/^["']|["']$/g, "").trim();
  if (!key) {
    throw buildError(
      "CONFIG_ERROR",
      "NVIDIA_API_KEY is not configured. Add it to your .env.local file.",
      false
    );
  }
  return key;
}

function buildError(
  code: GenerateImageError["code"],
  message: string,
  retryable: boolean,
  detail?: string
): GenerateImageError {
  return { code, message, retryable, ...(detail ? { detail } : {}) };
}

/**
 * List available NVIDIA models for the diagnostics endpoint.
 * NOTE: FLUX image models are NOT listed via /v1/models — that endpoint
 * only returns LLM models. We verify the key is valid separately.
 */
export async function listNvidiaModels(): Promise<{ models: string[]; error: string | null }> {
  try {
    const key = getApiKey();
    const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
    if (!res.ok) {
      return { models: [], error: `NVIDIA /v1/models returned HTTP ${res.status}` };
    }
    const json = await res.json();
    const ids = (json.data ?? []).map((m: { id: string }) => m.id);
    return { models: ids, error: null };
  } catch (err) {
    return { models: [], error: String(err) };
  }
}

// ─── Core generation ─────────────────────────────────────────────────────────

export async function generateImage(
  request: GenerateImageRequest
): Promise<GenerateImageResult | GenerateImageError> {
  // 1. Validate API key
  let apiKey: string;
  try {
    apiKey = getApiKey();
  } catch (err) {
    return err as GenerateImageError;
  }

  const { prompt, negativePrompt, aspectRatio, quality, seed, projectId, userId } = request;

  if (!prompt || prompt.trim().length < 3) {
    return buildError("INVALID_PROMPT", "Prompt must be at least 3 characters.", false);
  }

  const { width, height } = aspectRatioDimensions(aspectRatio);
  const steps = qualityToSteps(quality);
  const usedSeed = seed ?? Math.floor(Math.random() * 2_147_483_647);

  const model = (process.env.NVIDIA_IMAGE_MODEL || DEFAULT_MODEL).replace(/^\/+/, "");
  const endpoint = `${NVIDIA_GENAI_BASE}/${model}`;

  // Enforce NVIDIA FLUX prompt limit (strictly <= 800 chars)
  const cleanUserPrompt = prompt.trim();
  const maxUserPromptLen = 640;
  const truncatedUserPrompt =
    cleanUserPrompt.length > maxUserPromptLen
      ? cleanUserPrompt.slice(0, maxUserPromptLen)
      : cleanUserPrompt;

  const negativeClauses = [
    "clean composition",
    "professional visual asset",
    "high quality",
    "no text",
    "no words",
    "no letters",
    "no typography",
    "no watermarks",
    "no logos",
    "no labels",
    negativePrompt?.trim() || "",
  ]
    .filter(Boolean)
    .join(", ");

  let finalPrompt = `${truncatedUserPrompt}, ${negativeClauses}`;
  if (finalPrompt.length > 795) {
    finalPrompt = finalPrompt.slice(0, 795);
  }

  // 2. Build NVIDIA FLUX request body
  // Verified schema for FLUX.2 Klein 4B: prompt, width, height, steps (<= 4), seed
  const requestBody: Record<string, unknown> = {
    prompt: finalPrompt,
    width,
    height,
    steps,
    seed: usedSeed,
  };

  // 3. Call NVIDIA API (server-side only)
  let nvidiaResponse: Response;
  try {
    nvidiaResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(120_000), // 2-minute timeout
    });

    // If initial call fails with 422, 400, or 5xx, try once with a simplified fallback prompt
    if (!nvidiaResponse.ok && nvidiaResponse.status !== 401 && nvidiaResponse.status !== 403) {
      const fallbackPrompt = `${cleanUserPrompt.slice(0, 250).trim()}, high quality photography, no text`.slice(0, 400);
      try {
        const retryRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            prompt: fallbackPrompt,
            width,
            height,
            steps,
            seed: usedSeed,
          }),
          signal: AbortSignal.timeout(45_000),
        });
        if (retryRes.ok) {
          nvidiaResponse = retryRes;
        }
      } catch {
        // Fall back to handling original response
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = msg.includes("TimeoutError") || msg.includes("AbortError");
    return buildError(
      "NETWORK_ERROR",
      isTimeout
        ? "Image generation timed out. Try using Draft quality."
        : "Failed to reach NVIDIA API. Check your internet connection.",
      true
    );
  }

  // 4. Parse response
  if (!nvidiaResponse.ok) {
    const status = nvidiaResponse.status;
    let detail = "";
    try {
      detail = JSON.stringify(await nvidiaResponse.json());
    } catch {
      detail = await nvidiaResponse.text().catch(() => "");
    }

    if (status === 429) return buildError("RATE_LIMITED", "NVIDIA rate limit exceeded. Please wait and try again.", true, detail);
    if (status === 404) return buildError("MODEL_NOT_FOUND", `FLUX model not found at ${endpoint}. Check NVIDIA_IMAGE_MODEL in .env.local.`, false, detail);
    if (status === 401 || status === 403) return buildError("CONFIG_ERROR", "NVIDIA API key is invalid or lacks permission.", false, detail);
    if (status === 422) return buildError("INVALID_PROMPT", "Image prompt format was rejected by FLUX. Prompt was automatically adjusted.", true, detail);
    return buildError("PROVIDER_ERROR", `NVIDIA API returned HTTP ${status}.`, status >= 500, detail);
  }

  let responseJson: {
    artifacts?: Array<{
      base64?: string;
      content_type?: string;
      finish_reason?: string;
      finishReason?: string;
      seed?: number;
    }>;
  };
  try {
    responseJson = await nvidiaResponse.json();
  } catch {
    return buildError("PROVIDER_ERROR", "NVIDIA API returned an unreadable response.", false);
  }

  // 5. Extract image bytes from artifacts[0].base64
  const artifact = responseJson.artifacts?.[0];
  const finishReason = artifact?.finishReason || artifact?.finish_reason;

  if (finishReason === "CONTENT_FILTERED") {
    return buildError(
      "INVALID_PROMPT",
      "The prompt was filtered by NVIDIA safety policies. Please rephrase or use different wording.",
      false
    );
  }

  if (!artifact?.base64) {
    return buildError(
      "PROVIDER_ERROR",
      "NVIDIA API response contained no image data.",
      false
    );
  }

  const imageBuffer = Buffer.from(artifact.base64, "base64");

  // 6. Store in Supabase (generated-assets bucket)
  const imageId = `${Date.now()}-${usedSeed}`;
  const storagePath = projectId && userId
    ? `${userId}/projects/${projectId}/generated-images/${imageId}.png`
    : `anonymous/generated-images/${imageId}.png`;

  let publicUrl = "";
  let finalStoragePath: string | null = null;

  try {
    const supabase = createAdminClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, imageBuffer, { contentType: "image/png", upsert: false });

    if (uploadError) {
      console.error("[image-gen] Supabase upload failed:", uploadError.message);
      // Fallback: return data URL so the image is still usable
      publicUrl = `data:image/png;base64,${artifact.base64}`;
    } else {
      finalStoragePath = uploadData.path;
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadData.path);
      publicUrl = urlData.publicUrl;
    }
  } catch (err) {
    console.error("[image-gen] Supabase error:", err);
    publicUrl = `data:image/png;base64,${artifact.base64}`;
  }

  return {
    url: publicUrl,
    storagePath: finalStoragePath,
    width,
    height,
    seed: usedSeed,
    provider: "nvidia-flux",
    generatedAt: new Date().toISOString(),
  };
}
