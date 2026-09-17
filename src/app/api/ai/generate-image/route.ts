/**
 * POST /api/ai/generate-image
 *
 * Server-side only. Generates an image using NVIDIA FLUX.2 Klein 4B.
 * The NVIDIA API key is NEVER exposed to the browser or client code.
 *
 * Request body (JSON):
 *   prompt          string   required  Natural-language image description
 *   negativePrompt  string   optional  Elements to avoid
 *   aspectRatio     string   optional  "16:9" | "1:1" | "9:16" | "4:3" | "3:4" | "21:9" | "3:2" | "2:3"
 *   quality         string   optional  "draft" | "standard" | "high"  (default: "standard")
 *   seed            number   optional  Reproducibility seed
 *   projectId       string   optional  For scoped Supabase storage
 *   format          string   optional  "presentation" | "poster" | "infographic" | "social" | ...
 *
 * Success response (200):
 *   { url, storagePath, width, height, seed, provider, generatedAt }
 *
 * Error response (4xx/5xx):
 *   { error: { code, message, retryable } }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateImage, listNvidiaModels, FORMAT_DEFAULT_ASPECT_RATIO } from "@/lib/ai/image-generation";
import { GenerateImageResult, GenerateImageError } from "@/lib/ai/image-generation/types";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120; // 2-minute budget for high-quality generation

// ─── Request schema ───────────────────────────────────────────────────────────

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "3:2", "2:3"] as const;
const qualityLevels = ["draft", "standard", "high"] as const;
const formatTypes = ["presentation", "poster", "infographic", "social", "resume", "letter", "diagram"] as const;

const RequestSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters.").max(2000, "Prompt is too long."),
  negativePrompt: z.string().max(500).optional(),
  aspectRatio: z.enum(aspectRatios).optional(),
  quality: z.enum(qualityLevels).optional().default("standard"),
  seed: z.number().int().positive().optional(),
  projectId: z.string().optional(),
  format: z.enum(formatTypes).optional(),
});

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "INVALID_PROMPT", "Request body must be valid JSON.", false);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return errorResponse(400, "INVALID_PROMPT", firstError?.message ?? "Invalid request.", false);
  }

  const { prompt, negativePrompt, aspectRatio, quality, seed, projectId, format } = parsed.data;

  // 2. Resolve aspect ratio (format default if not explicit)
  const resolvedAspectRatio =
    aspectRatio ??
    (format ? (FORMAT_DEFAULT_ASPECT_RATIO[format] as typeof aspectRatios[number]) : undefined);

  // 3. Optionally get authenticated user for scoped storage
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) userId = user.id;
  } catch {
    // Unauthenticated is OK — image stored in anonymous/ path
  }

  // 4. Generate image
  let result: GenerateImageResult | GenerateImageError;
  try {
    result = await generateImage({
      prompt,
      negativePrompt,
      aspectRatio: resolvedAspectRatio,
      quality,
      seed,
      projectId,
      userId,
    });
  } catch (err: any) {
    console.error("[generate-image] Unexpected exception in generateImage:", err);
    return errorResponse(500, "PROVIDER_ERROR", err?.message || "Internal image generation failure", true);
  }

  // 5. Distinguish success from error
  if ("code" in result) {
    // GenerateImageError
    const status =
      result.code === "RATE_LIMITED" ? 429
      : result.code === "INVALID_PROMPT" ? 400
      : result.code === "CONFIG_ERROR" ? 500
      : result.code === "MODEL_NOT_FOUND" ? 502
      : result.code === "NETWORK_ERROR" ? 503
      : 500;

    return errorResponse(status, result.code, result.message, result.retryable);
  }

  // GenerateImageResult — never include NVIDIA key or internal detail
  const successResult = result as GenerateImageResult;
  return NextResponse.json({
    url: successResult.url,
    storagePath: successResult.storagePath,
    width: successResult.width,
    height: successResult.height,
    seed: successResult.seed,
    provider: successResult.provider,
    generatedAt: successResult.generatedAt,
  });
}

// ─── Health / diagnostic endpoint ─────────────────────────────────────────────

/**
 * GET /api/ai/generate-image
 * Dev-only endpoint. Returns NVIDIA connectivity status and available models.
 * Returns 404 in production to avoid information leakage.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const configured = Boolean(process.env.NVIDIA_API_KEY?.trim());
  if (!configured) {
    return NextResponse.json({
      status: "unconfigured",
      message: "NVIDIA_API_KEY is not set in .env.local",
      models: [],
    });
  }

  const { models, error } = await listNvidiaModels();
  return NextResponse.json({
    status: error ? "error" : "ok",
    message: error ?? `Connected. ${models.length} models available.`,
    currentModel: process.env.NVIDIA_IMAGE_MODEL ?? "black-forest-labs/flux.2-klein-4b",
    models: ["black-forest-labs/flux.2-klein-4b", "black-forest-labs/flux.1-schnell", "black-forest-labs/flux.1-dev"],
    totalModels: models.length,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorResponse(
  status: number,
  code: string,
  message: string,
  retryable: boolean
) {
  return NextResponse.json(
    { error: { code, message, retryable } },
    { status }
  );
}
