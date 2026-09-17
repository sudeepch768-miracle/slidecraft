/**
 * MCP Tool: generate_relevant_image
 *
 * Generates topic-relevant, studio-grade photorealistic visual assets using
 * SlideCraft's NVIDIA FLUX 4B integration.
 *
 * Strict invariants:
 * - The generation prompt NEVER appears as visible text/copy in the slide document.
 * - Negative prompt strictly forbids letters, labels, words, watermarks, or mock UI text.
 * - API keys and provider tokens are strictly forbidden from appearing in tool output.
 * - Returns a ready-to-insert MediaElement object.
 */

import { generateImage } from "@/lib/ai/image-generation";
import { STRICT_NEGATIVE_PROMPT } from "@/lib/ai/presentation-image-service";
import { MediaElement } from "@/types/document-spec";
import { mcpLogger } from "../logger";
import {
  GenerateRelevantImageInput,
  GenerateRelevantImageInputSchema,
  GenerateRelevantImageResultData,
  McpToolResponse,
} from "../types";

export async function handleGenerateRelevantImage(
  input: GenerateRelevantImageInput
): Promise<McpToolResponse<GenerateRelevantImageResultData>> {
  const parsed = GenerateRelevantImageInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: parsed.error.errors.map((e) => e.message).join("; "),
      },
    };
  }

  const { prompt, topic, slideTitle, role, aspectRatio, projectId, userId } = parsed.data;

  mcpLogger.info(
    `Executing generate_relevant_image for role=${role}, ratio=${aspectRatio}, topic=${topic || "general"}`
  );

  // Synthesize clean prompt with visual style while enforcing zero text in output
  const contextNotes = [
    topic ? `Topic: ${topic}.` : "",
    slideTitle ? `Context: ${slideTitle}.` : "",
    `Subject: ${prompt}.`,
    "Style: Professional cinematic lighting, photorealistic 8k detail, editorial depth of field, elegant color harmony.",
    "Strict rule: No text, no letters, no typography, no labels, no logos, no watermark.",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const result = await generateImage({
      prompt: contextNotes.slice(0, 500),
      negativePrompt: STRICT_NEGATIVE_PROMPT,
      aspectRatio,
      quality: "standard",
      projectId,
      userId,
    });

    if ("code" in result) {
      // GenerateImageError
      mcpLogger.warn(`Image generation provider returned error: ${result.code} - ${result.message}`);
      return {
        success: false,
        error: {
          code: result.code,
          message: result.message,
        },
      };
    }

    // Construct ready-to-embed MediaElement
    // CRITICAL: prompt is NEVER used as title, headline, or body text.
    const elementId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const altDescription = slideTitle
      ? `${slideTitle} - visual concept`
      : topic
      ? `${topic} illustration`
      : "Visual presentation asset";

    const mediaElement: MediaElement = {
      type: "media",
      mediaType: "image",
      id: elementId,
      url: result.url,
      storagePath: result.storagePath ?? undefined,
      alt: altDescription,
      intendedRole: role,
      fit: "cover",
      borderRadius: 12,
      imageId: `flux-${Date.now()}`,
      provider: "nvidia-flux",
      generatedAt: result.generatedAt,
      promptSummary: altDescription, // Clean human-readable label; NOT raw prompt
    };

    return {
      success: true,
      data: {
        url: result.url,
        storagePath: result.storagePath ?? undefined,
        width: result.width,
        height: result.height,
        seed: result.seed ?? undefined,
        role,
        mediaElement,
      },
      affectedIds: [elementId],
      changeSummary: `Generated relevant ${role} visual asset (${result.width}x${result.height}, ratio ${aspectRatio}) with zero text artifacts.`,
      warnings: [],
    };
  } catch (err: any) {
    mcpLogger.error("Failed to execute generate_relevant_image", err);
    return {
      success: false,
      error: {
        code: "GENERATION_FAILED",
        message: err.message || "Failed to generate image via NVIDIA FLUX provider.",
      },
    };
  }
}
