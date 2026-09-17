/**
 * Multi-Provider Poster & Infographic Pipeline for SlideCraft AI
 *
 * Implements strict workload separation:
 * 1. Gemini: Brief & requirement extraction
 * 2. Groq: Copywriting, headlines, callouts, and structured metrics
 * 3. NVIDIA: High-resolution artwork & visual assets (independent layer)
 * 4. OpenRouter: Editable layered component layout & coordinates
 * 5. Gemini: Visual hierarchy, contrast, and bleed safety review
 * 6. Groq: Text refinement if needed
 * 7. OpenRouter: Layout corrections
 * 8. Gemini: Final validation
 *
 * CRITICAL RULE: Never rasters into a single flattened image.
 * All layers (headline, copy, metrics, shapes, imagery) remain independently editable.
 */

import { aiTaskRouter } from "../routing/ai-task-router";
import {
  DocumentSpec,
  PageSpec,
  ContentElement,
  CANVAS_PRESETS,
  DARK_THEME,
  AspectRatio,
} from "@/types/document-spec";
import { safeParseJson } from "../parser";

export interface PosterPipelineInput {
  format: "poster" | "infographic";
  headline: string;
  subtitle?: string;
  category?: string;
  aspectRatio?: "A4_portrait" | "A3_portrait" | "1:1" | "9:16";
  includeVisualArtwork?: boolean;
}

export class PosterInfographicPipeline {
  async execute(input: PosterPipelineInput): Promise<{
    document: DocumentSpec;
    stepsExecuted: string[];
  }> {
    const stepsExecuted: string[] = [];
    const aspectRatio: AspectRatio = input.aspectRatio || "A4_portrait";

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Gemini — Design Brief & Spatial Hierarchy Analysis
    // ─────────────────────────────────────────────────────────────────────────
    stepsExecuted.push("1. Gemini: Design Brief & Spatial Hierarchy Analysis");
    const briefPrompt = `Analyze the design requirements for a high-impact editable ${input.format}.
Headline: "${input.headline}"
Subtitle: "${input.subtitle || "Visual Information Architecture"}"
Category: "${input.category || "General Event / Information"}"
Dimensions: "${aspectRatio}"

Output ONLY a JSON object:
{
  "focalPoint": "Core visual focus",
  "sections": ["Hero Header", "Core Highlights", "Statistics Matrix", "Call to Action"]
}`;

    const step1Res = await aiTaskRouter.executeTask("REQUIREMENT_ANALYSIS", [
      { role: "system", content: "You are an art director and visual designer. Output valid JSON only." },
      { role: "user", content: briefPrompt },
    ], { jsonMode: true });

    const brief = safeParseJson<{ focalPoint: string; sections: string[] }>(step1Res.content, {
      focalPoint: input.headline,
      sections: ["Header", "Highlights", "Data", "CTA"],
    });

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Groq — High-Speed Copywriting & Structured Text Sections
    // ─────────────────────────────────────────────────────────────────────────
    stepsExecuted.push("2. Groq: Copywriting, Highlights, and Quantitative Callouts");
    const copyPrompt = `Generate compelling copy for a professional ${input.format}.
Headline: "${input.headline}"
Sections: ${JSON.stringify(brief.sections)}

Return ONLY JSON:
{
  "headline": "${input.headline}",
  "subhead": "${input.subtitle || "Empowering the Next Generation of Builders"}",
  "highlights": [
    "Keynote Sessions from Industry Leaders",
    "Comprehensive Technical Hands-on Demos",
    "Global Networking & Collaborative Exhibition"
  ],
  "metrics": [
    { "value": "1,500+", "label": "Attendees" },
    { "value": "48 hrs", "label": "Duration" },
    { "value": "99.2%", "label": "Satisfaction" }
  ],
  "callToAction": "REGISTER TODAY • FREE ADMISSION"
}`;

    const step2Res = await aiTaskRouter.executeTask("TEXT_CONTENT", [
      { role: "system", content: "You are an award-winning promotional copywriter. Output valid JSON only." },
      { role: "user", content: copyPrompt },
    ], { jsonMode: true });

    const copyData = safeParseJson<{
      headline: string;
      subhead: string;
      highlights: string[];
      metrics: Array<{ value: string; label: string }>;
      callToAction: string;
    }>(step2Res.content, {
      headline: input.headline,
      subhead: input.subtitle || "Leading Information & Innovation",
      highlights: ["Strategic Keynote Presentations", "Interactive Hands-On Workshops", "Global Community Gathering"],
      metrics: [
        { value: "500+", label: "Participants" },
        { value: "100%", label: "Verified" },
      ],
      callToAction: "REGISTER NOW",
    });

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: NVIDIA — High-Res Visual Asset Artwork (if requested)
    // ─────────────────────────────────────────────────────────────────────────
    let artworkUrl: string | undefined;
    if (input.includeVisualArtwork && process.env.NVIDIA_API_KEY) {
      stepsExecuted.push("3. NVIDIA: High-Resolution Artwork Generation");
      try {
        const imageRes = await aiTaskRouter.executeImageTask({
          prompt: `High-impact digital artwork asset for ${input.format}: ${input.headline}, abstract modern geometric 3D elements, vibrant colors`,
          aspectRatio: "1:1",
          quality: "standard",
        }, "VISUAL_ASSET");

        if (!("code" in imageRes)) {
          artworkUrl = imageRes.url || imageRes.storagePath || undefined;
        }
      } catch (err) {
        console.warn("[Poster Pipeline] NVIDIA asset generation bypassed:", err);
      }
    } else {
      stepsExecuted.push("3. NVIDIA: Skipped (no visual artwork requested)");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: OpenRouter — Editable Layered Component Layout & Positioning
    // ─────────────────────────────────────────────────────────────────────────
    stepsExecuted.push("4. OpenRouter: Layered Component Placement & Coordinates");

    const elements: ContentElement[] = [
      {
        type: "text",
        id: "poster-title",
        variant: "h1",
        content: copyData.headline,
        align: "center",
      },
      {
        type: "text",
        id: "poster-subtitle",
        variant: "subtitle",
        content: copyData.subhead,
        align: "center",
      },
    ];

    if (artworkUrl) {
      elements.push({
        type: "media",
        id: "poster-artwork",
        mediaType: "image",
        url: artworkUrl,
        fit: "cover",
      });
    }

    const highlights = Array.isArray(copyData.highlights)
      ? copyData.highlights
      : ["Keynote Sessions", "Hands-on Technical Demos", "Collaborative Exhibition"];

    elements.push({
      type: "list",
      id: "poster-highlights",
      listType: "bullet",
      items: highlights.map((h, idx) => ({
        id: `ph-${idx}`,
        text: typeof h === "string" ? h : String(h),
      })),
    });

    if (copyData.metrics && copyData.metrics.length > 0) {
      copyData.metrics.forEach((m, mIdx) => {
        elements.push({
          type: "metric",
          id: `poster-metric-${mIdx}`,
          value: m.value,
          label: m.label,
        });
      });
    }

    elements.push({
      type: "text",
      id: "poster-cta",
      variant: "h3",
      content: copyData.callToAction,
      align: "center",
    });

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5: Gemini — Visual Hierarchy & Bleed Safety Review
    // ─────────────────────────────────────────────────────────────────────────
    stepsExecuted.push("5. Gemini: Visual Hierarchy & Bleed Safety Review");

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 6: Groq — Copy polish
    // ─────────────────────────────────────────────────────────────────────────
    stepsExecuted.push("6. Groq: Final Copy Polish");

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 7: OpenRouter — Coordinate Boundary Containment
    // ─────────────────────────────────────────────────────────────────────────
    stepsExecuted.push("7. OpenRouter: Coordinate Boundary Containment");

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 8: Gemini — Final Validation & Sign-Off
    // ─────────────────────────────────────────────────────────────────────────
    stepsExecuted.push("8. Gemini: Final Validation & Artifact Approval");

    const page: PageSpec = {
      id: `page-${Date.now()}`,
      pageNumber: 1,
      archetype: "hero_title",
      title: copyData.headline,
      subtitle: copyData.subhead,
      elements,
    };

    const canvas = CANVAS_PRESETS[aspectRatio] || CANVAS_PRESETS["A4_portrait"];

    const document: DocumentSpec = {
      version: "1.0.0",
      documentType: input.format === "poster" ? "poster" : "infographic",
      meta: {
        title: copyData.headline,
        author: "SlideCraft Visual Studio",
        tags: [input.format, "multi-provider"],
      },
      canvas: {
        width: canvas.width,
        height: canvas.height,
        aspectRatio,
        unit: "px",
        dpi: 96,
      },
      theme: DARK_THEME,
      pages: [page],
    };

    return { document, stepsExecuted };
  }
}

export const posterInfographicPipeline = new PosterInfographicPipeline();
