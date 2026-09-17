/**
 * presentation-image-service.ts
 *
 * Dedicated Presentation Image Generation Service for SlideCraft AI.
 * Bridges presentation content planning with NVIDIA FLUX 4B image generation.
 *
 * Core capabilities:
 * - generateImagePromptFromSlideContent(): Creates nuanced, topic-relevant image prompts
 * - generateSlideVisual(): Calls NVIDIA FLUX to create high-resolution slide visual assets
 * - generatePresentationImage(): General image generation for presentations
 * - generateBackgroundAsset(): Dynamic abstract atmospheric visuals
 */

import { SlidePlan } from "@/types/planner";
import { VisualDirection } from "@/types/visual-direction";
import { MediaElement } from "@/types/document-spec";
import { generateImage } from "./image-generation";
import { GenerateImageResult, GenerateImageError, ImageAspectRatio } from "./image-generation/types";

export const STRICT_NEGATIVE_PROMPT =
  "text, words, letters, labels, logos, watermarks, signature, user interface, ui, screen, fake slide, presentation, diagram labels, low quality, distorted, blurry, artifacts";

export interface SlideVisualOptions {
  slide: SlidePlan;
  topic: string;
  visualDirection?: VisualDirection;
  role?: "hero" | "card" | "diagram" | "background" | "editorial" | "case_study";
  aspectRatio?: ImageAspectRatio;
  projectId?: string;
}

/**
 * Derives a topic-specific visual metaphor and prompt from actual slide content and visual direction.
 * Explicitly forbids text/words and anchors to the presentation theme's color palette.
 */
export function generateImagePromptFromSlideContent(
  slide: SlidePlan,
  topic: string,
  visualDirection?: VisualDirection,
  role: "hero" | "card" | "diagram" | "background" | "editorial" | "case_study" = "card"
): { prompt: string; negativePrompt: string; promptSummary: string } {
  const slideTitle = slide.title || "Key Concept";
  const slidePurpose = slide.purpose || "Domain Analysis";
  const keyMessage = slide.keyMessage || slide.content.explanation || "";
  const suggestedQuery = slide.imageSuggestion || slide.visualSuggestion || "";

  // Topic category detection
  const lowerTopic = `${topic} ${slideTitle} ${keyMessage}`.toLowerCase();

  let subjectDomain = "modern high-tech conceptual photography, cinematic studio lighting";
  if (lowerTopic.includes("neuro") || lowerTopic.includes("brain") || lowerTopic.includes("neural") || lowerTopic.includes("medic") || lowerTopic.includes("health")) {
    subjectDomain = "3D bio-computational neural network visualization, glowing synaptic pathways, clinical research laboratory environment, advanced neuroscience visualization, ultra-clean glass optics";
  } else if (lowerTopic.includes("agri") || lowerTopic.includes("crop") || lowerTopic.includes("verdant") || lowerTopic.includes("soil") || lowerTopic.includes("farm") || lowerTopic.includes("plant")) {
    subjectDomain = "autonomous agricultural drones over emerald green smart crop fields, multi-spectral soil sensor arrays, precision ecology, golden morning daylight, macro botanical chlorophyll";
  } else if (lowerTopic.includes("aero") || lowerTopic.includes("flight") || lowerTopic.includes("evtol") || lowerTopic.includes("aviation") || lowerTopic.includes("space")) {
    subjectDomain = "futuristic autonomous electric aircraft aerodynamic fuselage, sleek carbon fiber wing geometry, urban skyline at twilight, atmospheric vapor trails, aerospace telemetry aesthetics";
  } else if (lowerTopic.includes("quantum") || lowerTopic.includes("physics") || lowerTopic.includes("qubit")) {
    subjectDomain = "dilution refrigerator cryostat chamber, golden coaxial quantum wiring, topological quantum surface lattice, laser-trapped ions in vacuum, deep cosmic atmosphere";
  } else if (lowerTopic.includes("finance") || lowerTopic.includes("revenue") || lowerTopic.includes("saas") || lowerTopic.includes("market") || lowerTopic.includes("growth")) {
    subjectDomain = "abstract geometric architectural glass towers, kinetic data streams, dynamic modern financial exchange infrastructure, refined editorial perspective";
  }

  // Color harmony from visual direction if available
  const paletteNotes = visualDirection
    ? `Harmonious color grading influenced by ${visualDirection.colors.primary} and ${visualDirection.colors.accent} with deep ${visualDirection.colors.background} ambient contrast.`
    : "Moody cinematic lighting, professional dynamic color grading.";

  const roleGuidance =
    role === "hero"
      ? "Sweeping wide hero visual, deep atmospheric depth, cinematic 8k composition, high visual impact, focal subject positioned for elegant slide framing."
      : role === "case_study"
      ? "Focused documentary-style environmental framing, authentic laboratory or field deployment, clean crisp depth of field."
      : "Balanced modular composition, refined lighting, clean negative space, premium architectural design aesthetic.";

  const prompt = [
    `Subject: ${subjectDomain}.`,
    `Context: ${topic} — ${slideTitle}.`,
    `Focus: ${suggestedQuery || keyMessage.slice(0, 90)}.`,
    `Style: ${paletteNotes}`,
    roleGuidance,
    "Strict rule: Pure photography or 3D render without any text, typography, symbols, numbers, watermarks, or slide layouts.",
  ]
    .filter(Boolean)
    .join(" ");

  const promptSummary = `${topic}: ${slideTitle} (${role})`;

  return {
    prompt: prompt.slice(0, 550), // keep strictly under NVIDIA FLUX 800 char total limit
    negativePrompt: STRICT_NEGATIVE_PROMPT,
    promptSummary,
  };
}

/**
 * Generates an image using the configured image-generation provider (NVIDIA FLUX 4B).
 * Returns a complete MediaElement ready to place on a slide.
 */
export async function generateSlideVisual(options: SlideVisualOptions): Promise<MediaElement> {
  const { slide, topic, visualDirection, role = "card", aspectRatio = "16:9", projectId } = options;

  const { prompt, negativePrompt, promptSummary } = generateImagePromptFromSlideContent(
    slide,
    topic,
    visualDirection,
    role
  );

  const slideId = slide.id || `slide-${slide.slideNumber}`;
  const elementId = `${slideId}-visual-${Date.now().toString(36)}`;

  try {
    const result = await generateImage({
      prompt,
      negativePrompt,
      aspectRatio,
      quality: "standard",
      projectId,
    });

    if ("url" in result && result.url) {
      return {
        type: "media",
        id: elementId,
        mediaType: "image",
        url: result.url,
        src: result.url,
        alt: `${slide.title} visual illustration`,
        caption: slide.title,
        imageId: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        provider: "nvidia-flux",
        promptSummary,
        prompt,
        intendedRole: role,
        aspectRatio,
        storagePath: result.storagePath || undefined,
        generatedAt: result.generatedAt,
        fit: "cover",
        borderRadius: 12,
      };
    } else {
      const err = result as GenerateImageError;
      console.warn("Image generation returned error status:", err.message);
      return createProceduralVisualFallback(elementId, slide, visualDirection, role, promptSummary, prompt, aspectRatio);
    }
  } catch (error: any) {
    console.error("Failed to generate slide visual asset:", error);
    return createProceduralVisualFallback(elementId, slide, visualDirection, role, promptSummary, prompt, aspectRatio);
  }
}

/**
 * General presentation image generation helper.
 */
export async function generatePresentationImage(
  prompt: string,
  options: {
    negativePrompt?: string;
    aspectRatio?: ImageAspectRatio;
    projectId?: string;
  } = {}
): Promise<GenerateImageResult | GenerateImageError> {
  return generateImage({
    prompt,
    negativePrompt: options.negativePrompt || STRICT_NEGATIVE_PROMPT,
    aspectRatio: options.aspectRatio || "16:9",
    quality: "standard",
    projectId: options.projectId,
  });
}

/**
 * Creates a high-fidelity SVG/gradient fallback image if image generation is unavailable or rate-limited,
 * preserving clean layout and metadata.
 */
function createProceduralVisualFallback(
  id: string,
  slide: SlidePlan,
  visualDirection: VisualDirection | undefined,
  role: "hero" | "card" | "diagram" | "background" | "editorial" | "case_study",
  promptSummary: string,
  prompt: string,
  aspectRatio: ImageAspectRatio
): MediaElement {
  const primary = visualDirection?.colors.primary || "#38bdf8";
  const secondary = visualDirection?.colors.secondary || "#818cf8";
  const bg = visualDirection?.colors.background || "#0B1528";

  // Clean, elegant geometric SVG placeholder data URI
  const svgDataUri =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="576" viewBox="0 0 1024 576" fill="none">` +
        `<rect width="1024" height="576" fill="${bg}"/>` +
        `<defs>` +
        `<linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">` +
        `<stop offset="0%" stop-color="${primary}" stop-opacity="0.35"/>` +
        `<stop offset="100%" stop-color="${secondary}" stop-opacity="0.1"/>` +
        `</linearGradient>` +
        `<radialGradient id="r1" cx="50%" cy="50%" r="50%">` +
        `<stop offset="0%" stop-color="${primary}" stop-opacity="0.25"/>` +
        `<stop offset="100%" stop-color="${bg}" stop-opacity="0"/>` +
        `</radialGradient>` +
        `</defs>` +
        `<rect width="1024" height="576" fill="url(#g1)"/>` +
        `<circle cx="512" cy="288" r="240" fill="url(#r1)"/>` +
        `<rect x="120" y="80" width="784" height="416" rx="20" stroke="${primary}" stroke-opacity="0.2" stroke-width="1.5" stroke-dasharray="8 8"/>` +
        `<circle cx="512" cy="288" r="70" stroke="${primary}" stroke-opacity="0.5" stroke-width="2"/>` +
        `<circle cx="512" cy="288" r="40" stroke="${secondary}" stroke-opacity="0.6" stroke-width="1.5"/>` +
        `<circle cx="512" cy="288" r="10" fill="${primary}" fill-opacity="0.8"/>` +
        `</svg>`
    );

  return {
    type: "media",
    id,
    mediaType: "image",
    url: svgDataUri,
    src: svgDataUri,
    alt: `${slide.title} visual graphic`,
    caption: slide.title,
    imageId: `fallback-${Date.now()}`,
    provider: "procedural-fallback",
    promptSummary,
    prompt,
    intendedRole: role,
    aspectRatio,
    generatedAt: new Date().toISOString(),
    fit: "cover",
    borderRadius: 12,
  };
}
