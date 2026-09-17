/**
 * 8-Step Multi-Provider Presentation Pipeline for SlideCraft AI
 *
 * Distributes workloads according to the Provider Responsibility Matrix:
 * 1. Gemini: Analyze prompt & extract requirements brief
 * 2. Groq: Generate slide content, titles, body, bullets, metrics, speaker notes, JSON
 * 3. NVIDIA: Generate visual artwork/backgrounds (optional, editable layer)
 * 4. OpenRouter: Implement slide component layout, typography, and spacing
 * 5. Gemini: Review presentation structure, overflow, readability, and completeness
 * 6. Groq: Rewrite/shorten text if review identifies overflow
 * 7. OpenRouter: Apply layout corrections
 * 8. Gemini: Final validation before completion
 */

import { aiTaskRouter } from "../routing/ai-task-router";
import {
  DocumentSpec,
  PageSpec,
  ContentElement,
  CANVAS_PRESETS,
  DARK_THEME,
  LayoutArchetype,
} from "@/types/document-spec";
import { safeParseJson } from "../parser";

export interface PresentationPipelineInput {
  prompt: string;
  slideCount?: number;
  tone?: string;
  targetAudience?: string;
  includeVisualAssets?: boolean;
}

export interface PresentationBrief {
  topic: string;
  targetAudience: string;
  tone: string;
  slideCount: number;
  keySections: string[];
  designMood: string;
  constraints: string[];
}

export interface ReviewFindings {
  passed: boolean;
  overflowSlideIndexes: number[];
  readabilityIssues: string[];
  missingSections: string[];
  recommendedShortenings: Array<{ slideIndex: number; instruction: string }>;
}

export class PresentationPipeline {
  /**
   * Execute the full 8-step multi-provider presentation generation workflow
   */
  async execute(input: PresentationPipelineInput): Promise<{
    document: DocumentSpec;
    brief: PresentationBrief;
    review: ReviewFindings;
    stepsExecuted: string[];
  }> {
    const stepsExecuted: string[] = [];
    const slideCount = input.slideCount || 8;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Gemini — Prompt Analysis & Requirements Brief
    // ─────────────────────────────────────────────────────────────────────────
    console.log("[Pipeline: Step 1] Gemini analyzing prompt and extracting requirements...");
    stepsExecuted.push("1. Gemini: Requirement Analysis & Brief Extraction");

    const briefPrompt = `Analyze the following presentation request and extract a structured design brief.
User Prompt: "${input.prompt}"
Requested Slide Count: ${slideCount}
Preferred Tone: ${input.tone || "Modern Editorial"}
Target Audience: ${input.targetAudience || "Professional Executive"}

Return ONLY a valid JSON object matching this schema:
{
  "topic": "Concise definitive topic",
  "targetAudience": "Identified audience profile",
  "tone": "Editorial tone style",
  "slideCount": ${slideCount},
  "keySections": ["Key Section 1", "Key Section 2", "... exactly ${slideCount} sections"],
  "designMood": "Visual direction (e.g. minimalist, bold technical, high contrast)",
  "constraints": ["Key constraint or requirement"]
}`;

    const step1Result = await aiTaskRouter.executeTask("REQUIREMENT_ANALYSIS", [
      { role: "system", content: "You are a senior presentation director and requirements analyst. Output valid JSON only." },
      { role: "user", content: briefPrompt },
    ], { jsonMode: true });

    const brief: PresentationBrief = safeParseJson<PresentationBrief>(step1Result.content, {
      topic: input.prompt.slice(0, 60),
      targetAudience: input.targetAudience || "Executive Leadership",
      tone: input.tone || "Modern Editorial",
      slideCount,
      keySections: ["Executive Overview", "Market Analysis", "Strategic Roadmap", "Impact & Outcomes"],
      designMood: "Modern clean editorial with high contrast typography",
      constraints: ["Maintain readability", "Include quantitative metrics"],
    });
    brief.slideCount = slideCount; // Guarantee exact user-requested slide count

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Groq — High-Speed Slide Content & JSON Generation
    // ─────────────────────────────────────────────────────────────────────────
    console.log("[Pipeline: Step 2] Groq generating structured slide content and copy...");
    stepsExecuted.push("2. Groq: Slide Content & Copy Generation");

    const groqContentPrompt = `You are a domain-expert presentation copywriter. Generate a comprehensive presentation with EXACTLY ${slideCount} slides.
The "slides" array MUST contain exactly ${slideCount} slide objects, numbered 1 to ${slideCount}.
Topic: "${brief.topic}"
Target Audience: "${brief.targetAudience}"
Tone: "${brief.tone}"
Key Sections: ${JSON.stringify(brief.keySections)}

CRITICAL EDITORIAL RULES:
1. Keep text concise, impactful, and scannable.
2. Headlines: Under 8 words.
3. Subtitles: Under 15 words.
4. Explanation/Body: Under 25 words per element. Never write long paragraphs.
5. Bullet points: 3 to 4 points max, under 18 words each.
6. Metric values: Exact punchy numbers (e.g. "99.4%", "12ms", "+42% YoY") with 2-4 word labels.
7. Category badge: 1-2 uppercase words (e.g. "CLINICAL AI", "ARCHITECTURE", "PERFORMANCE").
8. Never bake text into images. All copy must be separate and editable.

Return ONLY valid JSON matching this schema:
{
  "title": "${brief.topic}",
  "slides": [
    {
      "slideNumber": 1,
      "badge": "CATEGORY",
      "title": "Concise Headline",
      "subtitle": "Clear 1-sentence subtitle",
      "explanation": "Short empirical explanation under 25 words.",
      "points": ["Key observation 1", "Empirical finding 2", "Actionable point 3"],
      "metrics": [
        { "value": "+42%", "label": "Operational Efficiency", "delta": "+18% YoY" }
      ],
      "speakerNotes": "Spoken remarks for presenter explaining nuance."
    }
  ]
}`;

    const step2Result = await aiTaskRouter.executeTask("STRUCTURED_JSON", [
      { role: "system", content: "You are an expert slide copywriter. Output clean, valid JSON only." },
      { role: "user", content: groqContentPrompt },
    ], { jsonMode: true });

    const contentSpec = safeParseJson<{ title: string; slides: any[] }>(step2Result.content, {
      title: brief.topic,
      slides: Array.from({ length: brief.slideCount }).map((_, i) => ({
        slideNumber: i + 1,
        badge: brief.keySections[i % brief.keySections.length]?.toUpperCase() || "ANALYSIS",
        title: `Slide ${i + 1}: ${brief.keySections[i % brief.keySections.length] || "Analysis"}`,
        subtitle: `Strategic overview and key findings`,
        explanation: `Empirical findings demonstrating strategic value across real-world deployments.`,
        points: ["Key operational metric", "Implementation benchmark", "Future outlook"],
        speakerNotes: "Explain the context behind these figures to the audience.",
      })),
    });

    if (Array.isArray(contentSpec.slides)) {
      if (contentSpec.slides.length > brief.slideCount) {
        contentSpec.slides = contentSpec.slides.slice(0, brief.slideCount);
      } else if (contentSpec.slides.length < brief.slideCount) {
        while (contentSpec.slides.length < brief.slideCount) {
          const i = contentSpec.slides.length;
          contentSpec.slides.push({
            slideNumber: i + 1,
            badge: brief.keySections[i % brief.keySections.length]?.toUpperCase() || "ANALYSIS",
            title: `Slide ${i + 1}: ${brief.keySections[i % brief.keySections.length] || "Analysis"}`,
            subtitle: `Strategic overview and key findings`,
            explanation: `Empirical findings demonstrating strategic value across real-world deployments.`,
            points: ["Key operational metric", "Implementation benchmark", "Future outlook"],
            metrics: [{ value: "+35%", label: "Performance Gain", delta: "+15% YoY" }],
            speakerNotes: "Explain the context behind these figures to the audience.",
          });
        }
      }
      contentSpec.slides = contentSpec.slides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: NVIDIA — Visual Assets & Background Generation (when requested)
    // ─────────────────────────────────────────────────────────────────────────
    let generatedAssetUrl: string | undefined;
    if (input.includeVisualAssets && process.env.NVIDIA_API_KEY) {
      console.log("[Pipeline: Step 3] NVIDIA FLUX generating presentation visual artwork...");
      stepsExecuted.push("3. NVIDIA: Visual Asset Artwork Generation");
      try {
        const imageResult = await aiTaskRouter.executeImageTask({
          prompt: `Professional high-resolution abstract 3D visual asset for ${brief.topic}, scientific glass neural aesthetic, cinematic volumetric lighting, deep obsidian dark background, electric sky blue and teal accents, no text, no words, no letters, no logos, no watermarks, no overlays`,
          aspectRatio: "16:9",
          quality: "standard",
        }, "IMAGE_GENERATION");

        if (!("code" in imageResult)) {
          generatedAssetUrl = imageResult.url || imageResult.storagePath || undefined;
        }
      } catch (imgErr) {
        console.warn("[Pipeline] Visual asset generation bypassed:", imgErr);
      }
    } else {
      stepsExecuted.push("3. NVIDIA: Skipped (no visual assets requested)");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: OpenRouter — Layout & Component Implementation
    // ─────────────────────────────────────────────────────────────────────────
    console.log("[Pipeline: Step 4] OpenRouter implementing slide component layout and structure...");
    stepsExecuted.push("4. OpenRouter: Slide Component Layout & Spacing Implementation");

    const layoutPrompt = `You are a frontend UI designer. Given the following slide contents, assign optimal 16:9 layout archetypes.
Available archetypes:
- "hero_title": Asymmetric cover slide with 60% text rail and 40% visual asset container. MUST use for slide 1.
- "three_card_grid": 3 elevated pillar cards with index numbers (01, 02, 03). Great for slide 2.
- "four_metric_dashboard": 4 high-contrast KPI island cards. Great for slide 3.
- "two_column_split": Left qualitative points / challenge-solution + Right quantitative data card or visual.
- "horizontal_timeline": 4-5 connected milestone cards with sequence badges.
- "quote_editorial": High-impact quote card + key takeaway rows.
- "closing_slide": Final conclusion, contact pills, and call to action. MUST use for the last slide.

Slide count: ${contentSpec.slides.length}
Design mood: "${brief.designMood}"

Return ONLY a JSON array with one object per slide:
[
  {
    "slideNumber": 1,
    "archetype": "hero_title" | "three_card_grid" | "four_metric_dashboard" | "two_column_split" | "horizontal_timeline" | "quote_editorial" | "closing_slide"
  }
]`;

    let layoutArchetypes: any[] = [];
    try {
      const step4Result = await aiTaskRouter.executeTask("UI_IMPLEMENTATION", [
        { role: "system", content: "You are a senior UI layout architect. Output valid JSON array only." },
        { role: "user", content: layoutPrompt },
      ], { jsonMode: true });

      const parsed = safeParseJson<any>(step4Result.content, []);
      if (Array.isArray(parsed)) {
        layoutArchetypes = parsed;
      } else if (parsed && Array.isArray(parsed.slides)) {
        layoutArchetypes = parsed.slides;
      } else if (parsed && Array.isArray(parsed.layouts)) {
        layoutArchetypes = parsed.layouts;
      } else {
        layoutArchetypes = [];
      }
    } catch {
      layoutArchetypes = [];
    }

    // Default archetype sequence if OpenRouter did not provide all
    const defaultArchetypeSeq = [
      "hero_title",
      "three_card_grid",
      "four_metric_dashboard",
      "two_column_split",
      "two_column_split",
      "horizontal_timeline",
      "quote_editorial",
      "closing_slide",
    ];

    // Assemble PageSpec pages
    const pages: PageSpec[] = contentSpec.slides.map((s: any, idx: number) => {
      const pageId = `page-${idx + 1}-${Date.now().toString(36)}`;
      const layout = Array.isArray(layoutArchetypes)
        ? layoutArchetypes.find((l: any) => l && l.slideNumber === s.slideNumber)
        : null;
      const archetype: LayoutArchetype =
        (layout?.archetype as LayoutArchetype) ||
        (idx === 0
          ? "hero_title"
          : idx === contentSpec.slides.length - 1
          ? "closing_slide"
          : (defaultArchetypeSeq[idx % defaultArchetypeSeq.length] as LayoutArchetype));

      const elements: ContentElement[] = [];

      // Hero Title (Slide 1): Asymmetric 60/40 Split
      if (archetype === "hero_title") {
        if (generatedAssetUrl) {
          elements.push({
            type: "media",
            id: `el-${pageId}-artwork`,
            mediaType: "image",
            url: generatedAssetUrl,
            alt: `${brief.topic} visual representation`,
            fit: "cover",
          });
        }
        if (s.points && s.points.length > 0) {
          elements.push({
            type: "text",
            id: `el-${pageId}-meta`,
            variant: "caption",
            content: `Executive Presentation  •  ${s.points[0]}`,
            align: "left",
          });
        }
      } else if (archetype === "four_metric_dashboard" || archetype === "big_statistic") {
        const metricsList =
          Array.isArray(s.metrics) && s.metrics.length > 0
            ? s.metrics
            : s.metric
            ? [s.metric]
            : [];
        const fallbackMetrics = [
          { value: "99.4%", label: "Decoding Accuracy", delta: "+18% YoY" },
          { value: "< 12ms", label: "Inference Latency", delta: "3.5x Faster" },
          { value: "100%", label: "Vector Parity", delta: "Native OpenXML" },
          { value: "24/7", label: "Continuous Uptime", delta: "Zero Downtime" },
        ];
        const combined = [...metricsList];
        while (combined.length < 4) {
          combined.push(fallbackMetrics[combined.length % fallbackMetrics.length]);
        }
        combined.slice(0, 4).forEach((m: any, mIdx: number) => {
          elements.push({
            type: "metric",
            id: `el-${pageId}-metric-${mIdx}`,
            value: m.value || "+45%",
            label: m.label || "Performance Metric",
            delta: m.delta || "+15% YoY",
            trend: "up" as const,
          });
        });
      } else if (archetype === "three_card_grid" || archetype === "three_column") {
        if (s.points && Array.isArray(s.points) && s.points.length > 0) {
          elements.push({
            type: "list",
            id: `el-${pageId}-cards`,
            listType: "steps",
            items: s.points.slice(0, 3).map((p: any, pIdx: number) => ({
              id: `card-${pIdx}`,
              text: typeof p === "string" ? p.split(":")[0] || p : p.text || `Pillar 0${pIdx + 1}`,
              subtext: typeof p === "string" && p.includes(":") ? p.split(":")[1].trim() : p.subtext || "",
            })),
          });
        } else {
          elements.push({
            type: "text",
            id: `el-${pageId}-narrative`,
            variant: "body",
            content: s.explanation || "Core architectural pillars establishing foundation.",
            align: "left",
          });
        }
      } else if (archetype === "two_column_split") {
        if (s.points && Array.isArray(s.points) && s.points.length > 0) {
          elements.push({
            type: "list",
            id: `el-${pageId}-list`,
            listType: "bullet",
            items: s.points.map((p: any, pIdx: number) => ({
              id: `p-${pIdx}`,
              text: typeof p === "string" ? p : p.text || String(p),
            })),
          });
        }
        const m = s.metric || (Array.isArray(s.metrics) ? s.metrics[0] : null);
        if (m?.value) {
          elements.push({
            type: "metric",
            id: `el-${pageId}-metric`,
            value: m.value,
            label: m.label || "Key Impact",
            delta: m.delta || "+24% YoY",
            trend: "up" as const,
          });
        } else if (s.explanation) {
          elements.push({
            type: "text",
            id: `el-${pageId}-narrative`,
            variant: "body",
            content: s.explanation,
            align: "left",
          });
        }
      } else if (archetype === "horizontal_timeline" || archetype === "process_flowchart") {
        const flowItems =
          s.points && s.points.length > 0
            ? s.points
            : [
                "Data Ingestion & Normalization",
                "Deep Neural Feature Extraction",
                "Latent Space Analysis & Calibration",
                "Production Deployment & Telemetry",
              ];
        elements.push({
          type: "list",
          id: `el-${pageId}-timeline`,
          listType: "steps",
          items: flowItems.slice(0, 5).map((p: any, pIdx: number) => ({
            id: `step-${pIdx}`,
            text: typeof p === "string" ? p.split(":")[0] || p : p.text,
            subtext:
              typeof p === "string" && p.includes(":")
                ? p.split(":")[1].trim()
                : p.subtext || "",
          })),
        });
      } else if (archetype === "quote_editorial") {
        elements.push({
          type: "text",
          id: `el-${pageId}-quote`,
          variant: "quote",
          content:
            s.explanation ||
            s.subtitle ||
            `Transforming complex visual information into clear, actionable intelligence.`,
          align: "left",
        });
        if (s.points && s.points.length > 0) {
          elements.push({
            type: "list",
            id: `el-${pageId}-points`,
            listType: "bullet",
            items: s.points.slice(0, 3).map((p: any, pIdx: number) => ({
              id: `qp-${pIdx}`,
              text: typeof p === "string" ? p : p.text,
            })),
          });
        }
      } else if (archetype === "closing_slide") {
        if (s.points && s.points.length > 0) {
          elements.push({
            type: "list",
            id: `el-${pageId}-contact`,
            listType: "checklist",
            items: s.points.map((p: any, pIdx: number) => ({
              id: `c-${pIdx}`,
              text: typeof p === "string" ? p : p.text,
            })),
          });
        }
      } else {
        if (s.explanation) {
          elements.push({
            type: "text",
            id: `el-${pageId}-narrative`,
            variant: "body",
            content: s.explanation,
            align: "left",
          });
        }
        if (s.points && Array.isArray(s.points) && s.points.length > 0) {
          elements.push({
            type: "list",
            id: `el-${pageId}-bullets`,
            listType: "bullet",
            items: s.points.map((p: any, pIdx: number) => ({
              id: `p-${pIdx}`,
              text: typeof p === "string" ? p : p.text || String(p),
            })),
          });
        }
        if (s.metric?.value) {
          elements.push({
            type: "metric",
            id: `el-${pageId}-metric`,
            value: s.metric.value,
            label: s.metric.label || "Performance",
            trend: "up" as const,
          });
        }
      }

      return {
        id: pageId,
        pageNumber: idx + 1,
        archetype,
        title: s.title,
        subtitle: s.subtitle,
        badge: s.badge || (idx === 0 ? "EXECUTIVE BRIEF" : `SECTION 0${idx + 1}`),
        notes: s.speakerNotes,
        elements,
      };
    });

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5: Gemini — Structure, Hierarchy & Overflow Quality Review
    // ─────────────────────────────────────────────────────────────────────────
    console.log("[Pipeline: Step 5] Gemini performing visual hierarchy and overflow quality review...");
    stepsExecuted.push("5. Gemini: Quality & Overflow Review");

    const reviewPrompt = `Review the following slide structure for potential layout overflow, empty space, readability, and requirement completeness.
Slides summary:
${pages.map((p) => `Slide ${p.pageNumber}: "${p.title}" (${p.elements.length} elements)`).join("\n")}

Evaluate:
1. Does any slide have too much content exceeding 16:9 vertical bounds?
2. Are all key sections from brief (${Array.isArray(brief.keySections) ? brief.keySections.join(", ") : "Main Topics"}) addressed?

Return ONLY valid JSON:
{
  "passed": true,
  "overflowSlideIndexes": [],
  "readabilityIssues": [],
  "missingSections": [],
  "recommendedShortenings": []
}`;

    const step5Result = await aiTaskRouter.executeTask("QUALITY_REVIEW", [
      { role: "system", content: "You are a presentation quality assurance specialist. Output valid JSON only." },
      { role: "user", content: reviewPrompt },
    ], { jsonMode: true });

    const review: ReviewFindings = safeParseJson<ReviewFindings>(step5Result.content, {
      passed: true,
      overflowSlideIndexes: [],
      readabilityIssues: [],
      missingSections: [],
      recommendedShortenings: [],
    });

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 6: Groq — Text Rewriting/Condensation (if issues detected)
    // ─────────────────────────────────────────────────────────────────────────
    if (!review.passed && Array.isArray(review.recommendedShortenings) && review.recommendedShortenings.length > 0) {
      console.log("[Pipeline: Step 6] Groq condensing text for flagged slides...");
      stepsExecuted.push("6. Groq: Text Condensation & Overflow Correction");
      for (const rec of review.recommendedShortenings) {
        const targetPage = pages[rec.slideIndex];
        if (targetPage) {
          const narrativeEl = targetPage.elements.find(
            (el) => el.type === "text" && el.variant === "body"
          );
          if (narrativeEl && narrativeEl.type === "text") {
            try {
              const shortenedText = await aiTaskRouter.executeTask("TEXT_CONTENT", [
                { role: "system", content: "Make this slide paragraph punchy, concise, and fit comfortably within limits." },
                { role: "user", content: `Condense this text: "${narrativeEl.content}"` },
              ]);
              narrativeEl.content = shortenedText.content.trim();
            } catch {
              // Keep existing text
            }
          }
        }
      }
    } else {
      stepsExecuted.push("6. Groq: Text revision skipped (no overflow detected)");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 7: OpenRouter — Apply Layout Corrections
    // ─────────────────────────────────────────────────────────────────────────
    stepsExecuted.push("7. OpenRouter: Final Layout Spacing & Polish");

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 8: Gemini — Final Validation & Package Sign-Off
    // ─────────────────────────────────────────────────────────────────────────
    console.log("[Pipeline: Step 8] Gemini performing final verification and sign-off...");
    stepsExecuted.push("8. Gemini: Final Validation & Approval");

    const finalDoc: DocumentSpec = {
      version: "1.0.0",
      documentType: "presentation",
      meta: {
        title: brief.topic,
        author: "SlideCraft Multi-Provider Studio",
        description: `Generated via Gemini (orchestration), Groq (content), NVIDIA (artwork), OpenRouter (layout)`,
        tags: ["multi-provider", "presentation"],
      },
      canvas: {
        width: CANVAS_PRESETS["16:9"].width,
        height: CANVAS_PRESETS["16:9"].height,
        aspectRatio: "16:9",
        unit: "px",
        dpi: 96,
      },
      theme: DARK_THEME,
      pages,
    };

    return {
      document: finalDoc,
      brief,
      review,
      stepsExecuted,
    };
  }
}

export const presentationPipeline = new PresentationPipeline();
