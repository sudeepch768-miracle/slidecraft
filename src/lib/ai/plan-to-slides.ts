/**
 * plan-to-slides.ts
 *
 * Plan-to-Slides Compiler Engine
 * Translates an approved PresentationPlan blueprint into a fully structured,
 * content-rich DocumentSpec AST ready for interactive editing and native PPTX export.
 *
 * Ensures:
 * - Content fidelity: paragraphs, rich bullets, real examples, statistics, and notes are preserved.
 * - Balanced typography: headers (24-32pt), body (14-16pt), no oversized titles.
 * - Layered visual designs: layered gradients, subtle patterns (grid, dots, mesh),
 *   and thematic background images with customizable filter controls.
 * - Diverse content-aware layout archetypes (hero_title, detailed_information,
 *   two_column_split, three_card_grid, four_metric_dashboard, horizontal_timeline,
 *   case_study_card, quote_editorial, summary, closing_slide).
 */

import {
  DocumentSpec,
  PageSpec,
  ThemeSpec,
  LayoutArchetype,
  ContentElement,
  CANVAS_PRESETS,
  BackgroundSpec,
  DesignStyle,
} from "@/types/document-spec";
import { PresentationPlan, SlidePlan } from "@/types/planner";
import { VisualDirection } from "@/types/visual-direction";
import {
  visualDirectionToThemeSpec,
  createSlideBackgroundFromVisualDirection,
  generateVisualDirection,
} from "./visual-direction-engine";
import { visualDirectionTracer } from "./visual-direction-tracer";
import { generateImagePromptFromSlideContent } from "./presentation-image-service";
import { sanitizeBadge } from "@/lib/utils";

export interface PlanToSlidesOptions {
  visualDirectionOverride?: VisualDirection;
  themeOverride?: ThemeSpec;
  backgroundPattern?: "none" | "subtle_grid" | "dots" | "mesh" | "circuit" | "editorial_lines";
  enableThematicBackgroundImages?: boolean;
  projectId?: string;
  documentId?: string;
}

/**
 * Curated thematic image library for presentations
 */
const THEMATIC_IMAGES = {
  healthcare_ai: [
    {
      url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80",
      caption: "Clinical Diagnostic AI Laboratory",
      alt: "Medical AI Diagnostics in Healthcare",
    },
    {
      url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80",
      caption: "Genomic Sequencing & Biocomputation",
      alt: "Scientific Genomic Research",
    },
    {
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
      caption: "Neural Processing Architecture",
      alt: "Silicon Neural Processing Unit",
    },
    {
      url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=80",
      caption: "Multidisciplinary Clinical Care Team",
      alt: "Healthcare Professionals Reviewing Treatment Data",
    },
  ],
  general_tech: [
    {
      url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
      caption: "Global Data Telemetry Network",
      alt: "Worldwide Connected Cloud Infrastructure",
    },
    {
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
      caption: "Algorithmic Code Matrix",
      alt: "Digital Neural Code Processing",
    },
  ],
};

/**
 * Synthesizes a tailored theme based on presentation domain, tone, and preferences.
 */
/**
 * Synthesizes a tailored theme based on presentation domain, tone, and preferences.
 */
function buildThemeForPlan(plan: PresentationPlan, override?: ThemeSpec): ThemeSpec {
  if (override) return override;

  const text = `${plan.topic} ${plan.title} ${plan.tone}`.toLowerCase();
  const explicitlyLight = plan.tone.toLowerCase().includes("light") && !plan.tone.toLowerCase().includes("dark");

  if (explicitlyLight) {
    return {
      mode: "light",
      colors: {
        primary: "#0284c7",
        secondary: "#6366f1",
        accent: "#0d9488",
        background: "#f8fafc",
        surface: "#ffffff",
        textPrimary: "#0f172a",
        textSecondary: "#475569",
        border: "#cbd5e1",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 12,
        shadow: "md",
      },
    };
  }

  // Domain-specific dark themes with rich contrast
  if (
    text.includes("neuro") ||
    text.includes("neural") ||
    text.includes("brain") ||
    text.includes("deep learning") ||
    text.includes("ai") ||
    text.includes("intelligence")
  ) {
    return {
      mode: "dark",
      colors: {
        primary: "#38bdf8", // Electric Cyan
        secondary: "#818cf8", // Vivid Indigo
        accent: "#34d399", // Emerald
        background: "#0B0F19", // Deep Obsidian
        surface: "#111827", // Elevated Slate Card
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#1E293B",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 14,
        shadow: "lg",
      },
    };
  }

  if (
    text.includes("aero") ||
    text.includes("flight") ||
    text.includes("aviation") ||
    text.includes("mobility") ||
    text.includes("evtol") ||
    text.includes("space")
  ) {
    return {
      mode: "dark",
      colors: {
        primary: "#0ea5e9", // Sky Blue
        secondary: "#06b6d4", // Cyan
        accent: "#f59e0b", // Amber
        background: "#070D18", // Aero Midnight
        surface: "#0F172A",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#1E293B",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 14,
        shadow: "lg",
      },
    };
  }

  if (
    text.includes("quantum") ||
    text.includes("physics") ||
    text.includes("crypt") ||
    text.includes("computing")
  ) {
    return {
      mode: "dark",
      colors: {
        primary: "#a855f7", // Cosmic Violet
        secondary: "#d946ef", // Fuchsia
        accent: "#06b6d4", // Cyan
        background: "#090514", // Cosmic Amethyst
        surface: "#150D2A",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#2E1B4E",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 14,
        shadow: "lg",
      },
    };
  }

  if (
    text.includes("agri") ||
    text.includes("climate") ||
    text.includes("verdant") ||
    text.includes("green") ||
    text.includes("nature") ||
    text.includes("sustain")
  ) {
    return {
      mode: "dark",
      colors: {
        primary: "#10b981", // Emerald
        secondary: "#84cc16", // Lime
        accent: "#14b8a6", // Teal
        background: "#05150E", // Deep Forest Obsidian
        surface: "#0D261A",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#163E2B",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 14,
        shadow: "lg",
      },
    };
  }

  if (
    text.includes("health") ||
    text.includes("medic") ||
    text.includes("clinic") ||
    text.includes("bio")
  ) {
    return {
      mode: "dark",
      colors: {
        primary: "#14b8a6", // Clinical Teal
        secondary: "#06b6d4", // Cyan
        accent: "#10b981", // Emerald
        background: "#060D1A", // Deep Navy
        surface: "#0D192E",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#1B2F4E",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 14,
        shadow: "lg",
      },
    };
  }

  // Default Executive Midnight Navy Theme
  return {
    mode: "dark",
    colors: {
      primary: "#38bdf8", // Sky Cyan
      secondary: "#6366f1", // Royal Indigo
      accent: "#f59e0b", // Amber Accent
      background: "#0A0F1D", // Midnight Navy
      surface: "#131C31", // Elevated Card
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
      border: "#1E2A44",
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
      baseSizePx: 16,
    },
    styleTokens: {
      borderRadiusPx: 14,
      shadow: "lg",
    },
  };
}

/**
 * Creates layered background specifications for a slide.
 */
function createSlideBackground(
  slide: SlidePlan,
  index: number,
  totalSlides: number,
  theme: ThemeSpec,
  patternSetting: "none" | "subtle_grid" | "dots" | "mesh" | "circuit" | "editorial_lines" = "subtle_grid"
): BackgroundSpec {
  const isDark = theme.mode === "dark";
  const isHero = index === 0;
  const isClosing = index === totalSlides - 1;

  // Layered gradient configuration
  let gradientStops = isDark
    ? [
        { color: theme.colors.background, position: 0 },
        { color: theme.colors.surface, position: 100 },
      ]
    : [
        { color: "#f8fafc", position: 0 },
        { color: "#f1f5f9", position: 100 },
      ];

  if (isHero) {
    gradientStops = isDark
      ? [
          { color: theme.colors.background, position: 0 },
          { color: theme.colors.surface, position: 60 },
          { color: theme.colors.background, position: 100 },
        ]
      : [
          { color: "#f0fdfa", position: 0 },
          { color: "#f8fafc", position: 60 },
          { color: "#e2e8f0", position: 100 },
        ];
  } else if (isClosing) {
    gradientStops = isDark
      ? [
          { color: theme.colors.surface, position: 0 },
          { color: theme.colors.background, position: 100 },
        ]
      : [
          { color: "#f8fafc", position: 0 },
          { color: "#ecfeff", position: 100 },
        ];
  }

  // Selected pattern
  const pattern = isHero ? "mesh" : patternSetting;

  // Background Image assignment
  let imageSpec: BackgroundSpec["image"] = undefined;
  if (slide.imageSuggestion || slide.visualSuggestion || isHero) {
    const isMedical =
      slide.title.toLowerCase().includes("health") ||
      slide.title.toLowerCase().includes("clinic") ||
      slide.title.toLowerCase().includes("diagnos") ||
      slide.title.toLowerCase().includes("patient") ||
      slide.keyMessage.toLowerCase().includes("medic") ||
      isHero;

    const imgLibrary = isMedical
      ? THEMATIC_IMAGES.healthcare_ai
      : THEMATIC_IMAGES.general_tech;

    const selectedImg = imgLibrary[index % imgLibrary.length];

    if (isHero) {
      imageSpec = {
        url: selectedImg.url,
        mode: "darkened",
        opacity: isDark ? 0.35 : 0.15,
        blurPx: 0,
        brightness: isDark ? 0.6 : 1.1,
        contrast: 1.1,
        overlayColor: isDark ? theme.colors.background : "#ffffff",
        overlayOpacity: isDark ? 0.75 : 0.85,
        position: "cover",
      };
    } else if (slide.content.type === "case-study" || slide.content.type === "data") {
      imageSpec = {
        url: selectedImg.url,
        mode: "side_panel",
        opacity: 0.9,
        blurPx: 0,
        brightness: 1.0,
        contrast: 1.05,
        overlayOpacity: 0.1,
        position: "right_half",
      };
    }
  }

  return {
    type: imageSpec ? "layered" : "gradient",
    color: theme.colors.background,
    gradient: {
      direction: "to_bottom_right",
      stops: gradientStops,
    },
    pattern,
    image: imageSpec,
  };
}

/**
 * Determines layout archetype based on slide content type and position.
 * Guarantees rich variety and eliminates repetitive detailed_information slides.
 */
function determineLayoutArchetype(
  slide: SlidePlan,
  index: number,
  totalSlides: number
): LayoutArchetype {
  if (index === 0) return "hero_title";
  if (index === totalSlides - 1) return "closing_slide";

  // 1. Check explicit specific layoutSuggestion
  const explicit = (slide.layoutSuggestion || "").toLowerCase();
  if (explicit.includes("three_card") || explicit.includes("three_col")) return "three_card_grid";
  if (explicit.includes("metric") || explicit.includes("dashboard") || explicit.includes("statistic")) return "four_metric_dashboard";
  if (explicit.includes("timeline") || explicit.includes("roadmap") || explicit.includes("process")) return "horizontal_timeline";
  if (explicit.includes("case_study") || explicit.includes("case study")) return "case_study_card";
  if (explicit.includes("quote") || explicit.includes("editorial")) return "quote_editorial";
  if (explicit.includes("comparison") || explicit.includes("table")) return "comparison_table";
  if (explicit.includes("two_col") || explicit.includes("split")) return "two_column_split";

  // 2. Check explicit content.type
  switch (slide.content.type) {
    case "timeline":
      return "horizontal_timeline";
    case "data":
      return "four_metric_dashboard";
    case "case-study":
      return "case_study_card";
    case "quote":
      return "quote_editorial";
    case "comparison":
      return "comparison_table";
  }

  // 3. Semantic keyword inspection from slide title, purpose, keyMessage, and points
  const combinedText = `${slide.title} ${slide.purpose} ${slide.keyMessage} ${slide.content.heading || ""}`.toLowerCase();

  if (/\b(timeline|roadmap|milestone|chronol|phases|evolution|history|pipeline)\b/i.test(combinedText)) {
    return "horizontal_timeline";
  }
  if (
    /\b(metric|statistic|benchmark|performance|accuracy|kpi|roi|data|results|throughput|latency|efficiency)\b/i.test(combinedText) ||
    (slide.content.statistics && slide.content.statistics.length >= 2)
  ) {
    return "four_metric_dashboard";
  }
  if (
    /\b(pillar|architecture|foundations?|core|framework|modality|modalities|principles?|components?)\b/i.test(combinedText) ||
    (slide.content.points && slide.content.points.length === 3)
  ) {
    return "three_card_grid";
  }
  if (
    /\b(case study|clinical trial|real-world|deployment|field study|in practice)\b/i.test(combinedText) ||
    slide.content.caseStudy
  ) {
    return "case_study_card";
  }
  if (
    /\b(comparison|versus|\bvs\b|tradeoff|traditional vs)\b/i.test(combinedText) ||
    slide.content.comparison
  ) {
    return "comparison_table";
  }
  if (
    /\b(quote|vision|philosophy|perspective|insight|future outlook)\b/i.test(combinedText) ||
    slide.content.quote
  ) {
    return "quote_editorial";
  }

  // 4. Cadence fallback ensuring diverse variety across slides:
  // Slide 1: three_card_grid
  // Slide 2: two_column_split
  // Slide 3: four_metric_dashboard
  // Slide 4: case_study_card
  // Slide 5: horizontal_timeline
  // Slide 6: quote_editorial
  const cycle: LayoutArchetype[] = [
    "three_card_grid",
    "two_column_split",
    "four_metric_dashboard",
    "case_study_card",
    "horizontal_timeline",
    "quote_editorial",
  ];

  return cycle[(index - 1) % cycle.length];
}

/**
 * Converts a SlidePlan into an array of concrete ContentElements tailored for the archetype.
 */
function compileSlideElements(
  slide: SlidePlan,
  index: number,
  theme: ThemeSpec,
  archetype: LayoutArchetype,
  visualDirection?: VisualDirection,
  planTopic: string = "Professional Presentation"
): ContentElement[] {
  const elements: ContentElement[] = [];
  const slideId = slide.id || `slide-${slide.slideNumber}`;

  // 1. Hero Title Slide
  if (archetype === "hero_title") {
    // Generate an authoritative visual image prompt for the hero slide
    const { prompt: imgPrompt, promptSummary: imgSummary } = generateImagePromptFromSlideContent(
      slide,
      planTopic,
      visualDirection,
      "hero"
    );

    const primaryColor = visualDirection?.colors.primary || theme.colors.primary;
    const secondaryColor = visualDirection?.colors.secondary || theme.colors.secondary;
    const bgColor = visualDirection?.colors.background || theme.colors.background;

    const svgFallback =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="none">` +
          `<rect width="800" height="500" rx="16" fill="${bgColor}"/>` +
          `<defs>` +
          `<linearGradient id="vg_${slideId}" x1="0%" y1="0%" x2="100%" y2="100%">` +
          `<stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.35"/>` +
          `<stop offset="100%" stop-color="${secondaryColor}" stop-opacity="0.12"/>` +
          `</linearGradient>` +
          `</defs>` +
          `<rect width="800" height="500" rx="16" fill="url(#vg_${slideId})"/>` +
          `<circle cx="400" cy="250" r="140" stroke="${primaryColor}" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="6 6"/>` +
          `<circle cx="400" cy="250" r="70" stroke="${secondaryColor}" stroke-opacity="0.5" stroke-width="2"/>` +
          `<circle cx="400" cy="250" r="12" fill="${primaryColor}" fill-opacity="0.8"/>` +
          `</svg>`
      );

    elements.push({
      type: "media",
      id: `${slideId}-hero-visual`,
      mediaType: "image",
      url: svgFallback,
      src: svgFallback,
      alt: `${slide.title} thematic visual asset`,
      imageId: `img-${slideId}-${Date.now().toString(36)}`,
      provider: "nvidia-flux",
      promptSummary: imgSummary,
      prompt: imgPrompt,
      intendedRole: "hero",
      aspectRatio: "16:9",
      generatedAt: new Date().toISOString(),
      fit: "cover",
      borderRadius: 16,
    });

    if (slide.content.explanation) {
      elements.push({
        type: "text",
        id: `${slideId}-desc`,
        variant: "body",
        content: slide.content.explanation,
        align: "left",
        colorOverride: theme.colors.textSecondary,
      });
    }

    return elements;
  }

  // 2. Three Card Grid Archetype (Pillars / Architecture)
  if (archetype === "three_card_grid" || archetype === "three_column") {
    const points = slide.content.points || [];
    const items: { id: string; text: string; subtext?: string }[] = [];

    for (let i = 0; i < 3; i++) {
      const raw = points[i];
      let title = "";
      let subtext = "";

      if (raw) {
        if (raw.includes(":")) {
          const parts = raw.split(/:\s*(.*)/s);
          title = parts[0].trim();
          subtext = (parts[1] || "").trim();
        } else if (raw.includes(" — ")) {
          const parts = raw.split(/ — \s*(.*)/s);
          title = parts[0].trim();
          subtext = (parts[1] || "").trim();
        } else {
          title = raw.trim();
          subtext = slide.content.examples?.[i] || slide.content.explanation?.slice(0, 110) || "";
        }
      } else {
        title = `Core Pillar 0${i + 1}`;
        subtext = `Critical domain framework component supporting ${slide.title}.`;
      }

      items.push({
        id: `${slideId}-card-${i}`,
        text: title,
        subtext: subtext || undefined,
      });
    }

    elements.push({
      type: "list",
      id: `${slideId}-pillar-cards`,
      listType: "bullet",
      items,
    });

    return elements;
  }

  // 3. Four Metric Dashboard Archetype (KPIs / Performance)
  if (archetype === "four_metric_dashboard" || archetype === "big_statistic") {
    const stats: { value: string; label: string; context?: string }[] = [];

    if (slide.content.statistics && slide.content.statistics.length > 0) {
      slide.content.statistics.forEach((st) => {
        if (st.value && st.label) {
          stats.push({ value: st.value, label: st.label, context: st.context });
        }
      });
    }

    // Try extracting metrics from points if needed
    if (stats.length < 4 && slide.content.points) {
      slide.content.points.forEach((pt) => {
        if (stats.length >= 4) return;
        const match = pt.match(/(\b\d+(\.\d+)?(%|x|k|M|B|ms|fps|db|G|T)?\b)/i);
        if (match) {
          const val = match[1];
          const label = pt.replace(val, "").replace(/^[:\s—-]+/, "").trim().slice(0, 45);
          if (label && !stats.some((s) => s.value === val)) {
            stats.push({ value: val, label: label || "Performance Index", context: "Empirical Metric" });
          }
        }
      });
    }

    // Contextual defaults derived from slide topic if still < 4
    const topicKeywords = `${slide.title} ${slide.keyMessage}`.toLowerCase();
    const fallbackStats = topicKeywords.includes("neuro") || topicKeywords.includes("neural")
      ? [
          { value: "98.4%", label: "Decoding Precision", context: "Multi-electrode validation" },
          { value: "12ms", label: "Real-Time Latency", context: "Closed-loop motor control" },
          { value: "1,024", label: "Neural Channels", context: "High-density silicon probe array" },
          { value: "4.8x", label: "Throughput Acceleration", context: "Spike-sorting inference vs baseline" },
        ]
      : topicKeywords.includes("flight") || topicKeywords.includes("aero")
      ? [
          { value: "185 mph", label: "Cruising Speed", context: "Zero-emission eVTOL transition" },
          { value: "60 mi", label: "Urban Flight Radius", context: "High-density battery pack range" },
          { value: "< 45 dBA", label: "Acoustic Footprint", context: "Whisper-quiet rotor configuration" },
          { value: "99.999%", label: "Safety Reliability", context: "Triple-redundant fly-by-wire" },
        ]
      : [
          { value: "94.6%", label: "System Accuracy", context: "Empirical benchmark evaluation" },
          { value: "3.5x", label: "Operational Speedup", context: "End-to-end automated pipeline" },
          { value: "< 50ms", label: "Processing Latency", context: "Real-time edge computation" },
          { value: "100%", label: "Production Parity", context: "Deterministic export fidelity" },
        ];

    while (stats.length < 4) {
      stats.push(fallbackStats[stats.length]);
    }

    stats.slice(0, 4).forEach((st, sIdx) => {
      elements.push({
        type: "metric",
        id: `${slideId}-metric-${sIdx}`,
        value: st.value,
        label: st.label,
        delta: st.context || "Verified Outcome",
        trend: "up",
      });
    });

    if (slide.content.explanation) {
      elements.push({
        type: "text",
        id: `${slideId}-stats-note`,
        variant: "body",
        content: slide.content.explanation,
        align: "left",
        colorOverride: theme.colors.textSecondary,
      });
    }

    return elements;
  }

  // 4. Horizontal Timeline Archetype (Phases / Roadmap)
  if (archetype === "horizontal_timeline" || archetype === "timeline" || archetype === "process_flowchart") {
    const items: { id: string; text: string; subtext?: string }[] = [];

    if (slide.content.timeline?.steps && slide.content.timeline.steps.length > 0) {
      slide.content.timeline.steps.slice(0, 4).forEach((st, idx) => {
        items.push({
          id: `${slideId}-tl-${idx}`,
          text: `${st.timeOrPhase || `Phase 0${idx + 1}`}: ${st.title}`,
          subtext: st.description,
        });
      });
    } else if (slide.content.points && slide.content.points.length >= 2) {
      slide.content.points.slice(0, 4).forEach((pt, idx) => {
        let title = `Phase 0${idx + 1}`;
        let desc = pt;
        if (pt.includes(":")) {
          const parts = pt.split(/:\s*(.*)/s);
          title = parts[0].trim();
          desc = (parts[1] || "").trim();
        } else if (pt.includes(" — ")) {
          const parts = pt.split(/ — \s*(.*)/s);
          title = parts[0].trim();
          desc = (parts[1] || "").trim();
        }
        items.push({
          id: `${slideId}-tl-${idx}`,
          text: title,
          subtext: desc,
        });
      });
    }

    const defaultSteps = [
      { text: "Phase 01: Signal Acquisition", subtext: "Raw electrode telemetry and artifact noise filtration." },
      { text: "Phase 02: Feature Extraction", subtext: "Temporal spike sorting and latent state embedding." },
      { text: "Phase 03: Neural Decoding", subtext: "Deep recurrent inference with continuous kinematics." },
      { text: "Phase 04: Closed-Loop Control", subtext: "Real-time neuroprosthetic actuation and feedback." },
    ];

    while (items.length < 4) {
      const fb = defaultSteps[items.length];
      items.push({
        id: `${slideId}-tl-${items.length}`,
        text: fb.text,
        subtext: fb.subtext,
      });
    }

    elements.push({
      type: "list",
      id: `${slideId}-timeline-steps`,
      listType: "bullet",
      items,
    });

    return elements;
  }

  // 5. Two Column Split Archetype (Qualitative Left + Quantitative/Callout Right)
  if (archetype === "two_column_split" || archetype === "two_column") {
    if (slide.content.explanation) {
      elements.push({
        type: "text",
        id: `${slideId}-narrative`,
        variant: "body",
        content: slide.content.explanation,
        align: "left",
        colorOverride: theme.colors.textPrimary,
      });
    }

    const points = slide.content.points || [];
    if (points.length > 0) {
      elements.push({
        type: "list",
        id: `${slideId}-left-points`,
        listType: "bullet",
        items: points.slice(0, 3).map((p, pIdx) => ({
          id: `${slideId}-pt-${pIdx}`,
          text: p,
        })),
      });
    }

    // Generate topic-specific image metadata and procedural SVG fallback
    const { prompt: imgPrompt, promptSummary: imgSummary } = generateImagePromptFromSlideContent(
      slide,
      planTopic,
      visualDirection,
      "card"
    );

    const primaryColor = visualDirection?.colors.primary || theme.colors.primary;
    const secondaryColor = visualDirection?.colors.secondary || theme.colors.secondary;
    const bgColor = visualDirection?.colors.background || theme.colors.background;

    const svgFallback =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="none">` +
          `<rect width="800" height="450" rx="16" fill="${bgColor}"/>` +
          `<defs>` +
          `<linearGradient id="vg_${slideId}" x1="0%" y1="0%" x2="100%" y2="100%">` +
          `<stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.35"/>` +
          `<stop offset="100%" stop-color="${secondaryColor}" stop-opacity="0.12"/>` +
          `</linearGradient>` +
          `</defs>` +
          `<rect width="800" height="450" rx="16" fill="url(#vg_${slideId})"/>` +
          `<circle cx="400" cy="225" r="140" stroke="${primaryColor}" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="6 6"/>` +
          `<circle cx="400" cy="225" r="70" stroke="${secondaryColor}" stroke-opacity="0.5" stroke-width="2"/>` +
          `<circle cx="400" cy="225" r="12" fill="${primaryColor}" fill-opacity="0.8"/>` +
          `<rect x="60" y="40" width="680" height="370" rx="12" stroke="${primaryColor}" stroke-opacity="0.15" stroke-width="1.5"/>` +
          `</svg>`
      );

    elements.push({
      type: "media",
      id: `${slideId}-visual`,
      mediaType: "image",
      url: svgFallback,
      src: svgFallback,
      alt: `${slide.title} thematic visual asset`,
      imageId: `img-${slideId}-${Date.now().toString(36)}`,
      provider: "nvidia-flux",
      promptSummary: imgSummary,
      prompt: imgPrompt,
      intendedRole: "card",
      aspectRatio: "16:9",
      generatedAt: new Date().toISOString(),
      fit: "cover",
      borderRadius: 12,
    });

    const stat = slide.content.statistics?.[0];
    if (stat) {
      elements.push({
        type: "metric",
        id: `${slideId}-right-metric`,
        value: stat.value,
        label: stat.label,
        delta: stat.context || "Validated Outcome",
        trend: "up",
      });
    } else {
      elements.push({
        type: "metric",
        id: `${slideId}-right-metric`,
        value: "99.2%",
        label: "Fidelity & Reliability Index",
        delta: "Multi-modal model convergence",
        trend: "up",
      });
    }

    return elements;
  }

  // 6. Case Study Card Archetype
  if (archetype === "case_study_card") {
    const cs = slide.content.caseStudy;
    const rawClient = cs?.clientOrContext || slide.title || "Clinical Trial Implementation";
    const client = rawClient.replace(/^case study:\s*/i, "").trim();
    const problem = cs?.problem || slide.purpose || "High latency and noise in raw bio-signal acquisition.";
    const solution = cs?.solution || slide.content.explanation?.slice(0, 140) || "Deployment of deep recurrent transformers for low-latency neural decoding.";
    const impact = cs?.impact || "Achieved 96.8% decoding accuracy with sub-15ms response latency.";

    elements.push({
      type: "text",
      id: `${slideId}-cs-title`,
      variant: "h3",
      content: `Case Study: ${client}`,
      align: "left",
      colorOverride: theme.colors.primary,
    });

    elements.push({
      type: "text",
      id: `${slideId}-cs-prob`,
      variant: "body",
      content: `Challenge: ${problem}`,
      align: "left",
      colorOverride: theme.colors.textPrimary,
    });

    elements.push({
      type: "text",
      id: `${slideId}-cs-sol`,
      variant: "body",
      content: `Solution: ${solution}`,
      align: "left",
      colorOverride: theme.colors.textSecondary,
    });

    elements.push({
      type: "metric",
      id: `${slideId}-cs-metric`,
      value: impact.match(/(\d+[\.\d]*%?)/)?.[0] || "96.8%",
      label: "Clinical Efficacy & Impact",
      delta: impact,
      trend: "up",
    });

    return elements;
  }

  // 7. Quote Editorial Archetype
  if (archetype === "quote_editorial" || archetype === "quote" || archetype === "editorial_asymmetrical") {
    if (slide.content.points && slide.content.points.length > 0) {
      elements.push({
        type: "list",
        id: `${slideId}-quote-takeaways`,
        listType: "bullet",
        items: slide.content.points.slice(0, 3).map((pt, pIdx) => ({
          id: `${slideId}-qt-${pIdx}`,
          text: pt,
        })),
      });
    }

    const rawQuote =
      slide.content.quote?.text ||
      slide.keyMessage ||
      "Decoding neural activity requires bridging computational neuroscience with deep foundation models.";
    const quoteText = rawQuote.replace(/^[“"']+|[”"']+$/g, "").trim();
    const rawAuthor = slide.content.quote?.author || "Principal Neurocomputation Research Group";
    const author = rawAuthor.replace(/^—\s*/, "").trim();

    elements.push({
      type: "text",
      id: `${slideId}-quote-body`,
      variant: "quote",
      content: `“${quoteText}”`,
      align: "center",
      colorOverride: theme.colors.primary,
    });

    elements.push({
      type: "text",
      id: `${slideId}-quote-author`,
      variant: "caption",
      content: `— ${author}`,
      align: "center",
      colorOverride: theme.colors.textSecondary,
    });

    return elements;
  }

  // 8. Comparison Table Archetype
  if (archetype === "comparison_table" || archetype === "comparison") {
    const comp = slide.content.comparison || {
      items: [
        {
          title: "Conventional Baseline",
          points: slide.content.points?.slice(0, 2) || ["Manual heuristics", "High variance"],
        },
        {
          title: "Deep Learning Accelerated",
          points: slide.content.points?.slice(2, 4) || ["Automated latent decoding", "Sub-second inference"],
        },
      ],
    };

    comp.items.forEach((item, colIdx) => {
      elements.push({
        type: "text",
        id: `${slideId}-comp-${colIdx}-title`,
        variant: "h3",
        content: item.title,
        align: "left",
        colorOverride: colIdx === 1 ? theme.colors.primary : theme.colors.textPrimary,
      });
      elements.push({
        type: "list",
        id: `${slideId}-comp-${colIdx}-pts`,
        listType: "bullet",
        items: item.points.map((pt, pIdx) => ({
          id: `${slideId}-comp-${colIdx}-p-${pIdx}`,
          text: pt,
        })),
      });
    });

    return elements;
  }

  // 9. Closing Slide Archetype (Topic-Tailored Synthesis & Next Steps)
  if (archetype === "closing_slide") {
    const topicKeywords = `${planTopic} ${slide.title} ${slide.keyMessage}`.toLowerCase();
    const isHealthcare =
      topicKeywords.includes("neuro") ||
      topicKeywords.includes("health") ||
      topicKeywords.includes("clinic") ||
      topicKeywords.includes("medic");
    const isAero =
      topicKeywords.includes("flight") ||
      topicKeywords.includes("aero") ||
      topicKeywords.includes("evtol") ||
      topicKeywords.includes("aviation");
    const isAgri =
      topicKeywords.includes("agri") ||
      topicKeywords.includes("crop") ||
      topicKeywords.includes("verdant") ||
      topicKeywords.includes("soil");
    const isQuantum =
      topicKeywords.includes("quantum") ||
      topicKeywords.includes("qubit") ||
      topicKeywords.includes("physics");

    const fallbackPoints = isHealthcare
      ? [
          "Clinical Trial Translation: Advancing from laboratory validation to multi-center clinical trials.",
          "Regulatory & Compliance: Preparing FDA 510(k) documentation and ethics safety dossiers.",
          "Adaptive Online Inference: Calibrating continuous closed-loop bio-telemetry pipelines.",
          "Open Clinical Discussion: Welcome multidisciplinary research inquiries and partnership proposals.",
        ]
      : isAero
      ? [
          "Flight Corridor Certification: Finalizing FAA Part 135 autonomous operational approvals.",
          "Vertiport Integration: Deploying high-throughput urban megawatt charging infrastructure.",
          "Acoustic Signature Auditing: Validating sub-45 dBA noise footprint across dense flight lanes.",
          "Industry Collaboration: Open discussion on municipal air transit integration and pilot programs.",
        ]
      : isAgri
      ? [
          "Farm-Scale Deployment: Scaling multi-spectral sensor arrays across commercial crop acreage.",
          "Carbon Sequestration Auditing: Verifying soil microbiome metrics for verified carbon credit markets.",
          "Autonomous Fleet Integration: Synchronizing robotic harvesters with predictive AI scheduling.",
          "Sustainable Partnership: Collaborative research initiatives with agricultural research centers.",
        ]
      : isQuantum
      ? [
          "Surface Code Optimization: Scaling physical qubit coherence beyond the fault-tolerant threshold.",
          "Cryogenic Envelope Testing: Expanding 15mK dilution refrigeration cooling efficiency.",
          "Algorithmic Benchmark Execution: Demonstrating verifiable quantum advantage on production workloads.",
          "Academic & Industry Q&A: Open discussion on hybrid NISQ-to-FTQC software stacks.",
        ]
      : [
          "Strategic Deployment: Translating key insights into actionable operational milestones.",
          "Quality & Governance: Establishing continuous auditing, telemetry, and verification standards.",
          "Scalable Architecture: Expanding cross-platform integration and infrastructure resilience.",
          "Discussion & Inquiries: Open for questions, strategic feedback, and collaborative next steps.",
        ];

    const items =
      slide.content.points && slide.content.points.length > 0
        ? slide.content.points.slice(0, 4).map((p, idx) => ({
            id: `${slideId}-close-${idx}`,
            text: p,
          }))
        : fallbackPoints.map((p, idx) => ({
            id: `${slideId}-close-${idx}`,
            text: p,
          }));

    const headingText =
      slide.content.heading ||
      (slide.title && !slide.title.toLowerCase().startsWith("slide")
        ? slide.title
        : "Strategic Next Steps & Summary");

    elements.push({
      type: "text",
      id: `${slideId}-close-heading`,
      variant: "h3",
      content: headingText,
      align: "left",
      colorOverride: theme.colors.primary,
    });

    elements.push({
      type: "list",
      id: `${slideId}-close-items`,
      listType: "bullet",
      items,
    });

    if (slide.content.explanation) {
      elements.push({
        type: "text",
        id: `${slideId}-close-note`,
        variant: "body",
        content: slide.content.explanation,
        align: "left",
        colorOverride: theme.colors.textSecondary,
      });
    }

    elements.push({
      type: "text",
      id: `${slideId}-close-contact`,
      variant: "caption",
      content: "Questions & Discussion  •  SlideCraft AI Studio  •  contact@slidecraft.studio",
      align: "left",
      colorOverride: theme.colors.textSecondary,
    });

    return elements;
  }

  // Default / detailed_information fallback
  if (slide.content.explanation) {
    elements.push({
      type: "text",
      id: `${slideId}-narrative`,
      variant: "body",
      content: slide.content.explanation,
      align: "left",
      colorOverride: theme.colors.textPrimary,
    });
  }

  if (slide.content.points && slide.content.points.length > 0) {
    elements.push({
      type: "list",
      id: `${slideId}-points`,
      listType: "bullet",
      items: slide.content.points.map((p, pIdx) => ({
        id: `${slideId}-pt-${pIdx}`,
        text: p,
      })),
    });
  }

  return elements;
}

/**
 * Converts a PresentationPlan into a production-grade DocumentSpec.
 */
export function compilePlanToDocumentSpec(
  plan: PresentationPlan,
  options: PlanToSlidesOptions = {}
): DocumentSpec {
  // 1. Authoritative Visual Direction consumption (generated once upstream)
  let visualDirection = options.visualDirectionOverride || plan.visualDirection;
  if (!visualDirection) {
    console.warn(
      `[plan-to-slides] Warning: PresentationPlan '${plan.id}' missing visualDirection. Synthesizing single emergency fallback.`
    );
    visualDirection = generateVisualDirection(plan.topic);
  }

  // 2. Synthesize ThemeSpec from the presentation's VisualDirection
  const theme = options.themeOverride || visualDirectionToThemeSpec(visualDirection);
  const totalSlides = plan.slidePlans.length;
  const canvas = CANVAS_PRESETS["16:9"];

  // 3. Compile each slide with slide-level background variation derived from VisualDirection
  const pages: PageSpec[] = plan.slidePlans.map((slide, index) => {
    const archetype = determineLayoutArchetype(slide, index, totalSlides);
    const backgroundSpec = createSlideBackgroundFromVisualDirection(
      visualDirection!,
      archetype,
      index,
      totalSlides
    );
    const elements = compileSlideElements(slide, index, theme, archetype, visualDirection, plan.topic);
    const slideId = slide.id || `slide-${slide.slideNumber}`;

    const page: PageSpec = {
      id: slideId,
      pageNumber: slide.slideNumber,
      archetype,
      title: slide.title,
      subtitle: slide.keyMessage,
      badge:
        slide.slideNumber === 1
          ? sanitizeBadge(slide.section, "EXECUTIVE BRIEFING")
          : sanitizeBadge(
              `${String(slide.slideNumber).padStart(2, "0")} / ${archetype.replace(/_/g, " ").toUpperCase()}`
            ),
      backgroundOverride: theme.colors.background,
      backgroundSpec,
      notes: slide.speakerNotes || undefined,
      elements,
    };

    return page;
  });

  const validDesignStyles: DesignStyle[] = [
    "microsoft_professional",
    "modern_academic",
    "corporate",
    "minimal",
    "colorful_educational",
    "dark_technology",
    "research_conference",
    "startup_pitch",
  ];

  const matchedStyle = validDesignStyles.find(
    (s) => s.toLowerCase() === plan.tone.toLowerCase().replace(/\s+/g, "_")
  ) || "modern_academic";

  const effectiveProjId = options.projectId || plan.id || `proj-${Date.now()}`;
  const effectiveDocId = options.documentId || `doc-${Date.now()}`;

  const docSpec: DocumentSpec = {
    version: "1.0.0",
    documentType: "presentation",
    meta: {
      title: plan.title,
      description: `Target Audience: ${plan.targetAudience} | Depth: ${plan.contentDepth} | Tone: ${plan.tone}`,
      author: "SlideCraft AI Presentation Studio",
      tags: [plan.topic, plan.presentationType, plan.tone],
      designStyle: matchedStyle,
      variationSeed: visualDirection.variationSeed,
    },
    canvas: {
      width: canvas.width,
      height: canvas.height,
      aspectRatio: "16:9",
      unit: "px",
      dpi: 96,
    },
    theme,
    visualDirection,
    pages,
  };

  // Trace DocumentSpec creation
  visualDirectionTracer.recordTrace({
    projectId: effectiveProjId,
    documentId: effectiveDocId,
    visualDirectionId: visualDirection.id,
    variationSeed: visualDirection.variationSeed,
    styleFamily: visualDirection.styleFamily,
    stage: "DOCUMENT_SPEC_CREATED",
    generatedAtStage: "plan_to_slides",
    consumedBy: "editor_canvas",
  });

  return docSpec;
}
