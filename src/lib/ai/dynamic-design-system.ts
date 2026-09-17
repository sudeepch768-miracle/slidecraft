/**
 * dynamic-design-system.ts
 *
 * Dynamic Design-System Generation Pipeline
 * Synthesizes a bespoke GeneratedDesignSystem for every prompt and artifact type:
 * - Visual style & semantic direction
 * - Palette: background, surface, primary, secondary, accent, text, mutedText, border
 * - Typography: headingFont, bodyFont, monoFont, displayScale, weights
 * - Spacing: unit, sectionGap, elementGap, pagePadding
 * - Shapes: cornerRadius, borderWidth, shadowStyle
 * - Imagery: treatment, aspectPreference, overlayStyle
 * - Composition: alignment, density, hierarchy, grid
 *
 * Never forces global fixed templates or brand kit presets.
 */

import {
  DocumentType,
  GeneratedDesignSystem,
  ThemeSpec,
  AspectRatio,
} from "@/types/document-spec";

export interface DesignSystemSynthesisInput {
  prompt: string;
  documentType: DocumentType;
  platform?: string;
  suggestedAspectRatio?: AspectRatio;
  colorPreferences?: string[];
  typographyPreferences?: string[];
  tonePreference?: string;
  stylePreference?: string;
  brandKitPalette?: {
    primary: string;
    secondary: string;
    accent: string;
    background?: string;
    surface?: string;
  };
}

/**
 * Hash function to provide deterministic yet diverse procedural color variations
 * when prompt doesn't specify explicit hex codes.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Analyzes semantic keywords in the prompt to determine the bespoke visual personality.
 */
export function synthesizeDynamicDesignSystem(
  input: DesignSystemSynthesisInput
): GeneratedDesignSystem {
  const text = input.prompt.toLowerCase();
  const docType = input.documentType;
  const hash = hashString(input.prompt);

  // 1. Detect Domain & Visual Aesthetic Signals
  const isLuxury = /\b(luxury|skincare|cosmetics|beauty|spa|couture|prestige|perfume|elegance|fashion|jewelry|gold|champagne|bespoke)\b/.test(text);
  const isCyberpunkOrGaming = /\b(cyberpunk|neon|gaming|esports|synthwave|hacker|terminal|matrix|arcade|futuristic|sci-fi|glitch|virtual|techno)\b/.test(text);
  const isAcademicOrResearch = /\b(academic|research|paper|study|university|thesis|quantum|scientific|water cycle|physics|chemistry|biology|biology|history|peer-reviewed)\b/.test(text);
  const isChildrenOrPlayful = /\b(children|kids|playful|kindergarten|planets|story|fun|cartoon|preschool|elementary|nursery|toy|game)\b/.test(text);
  const isDarkStartupOrInvestor = /\b(startup|investor|pitch|deck|seed|series a|series b|venture|arr|growth|metrics|saas|ai platform)\b/.test(text) && /\b(dark|black|obsidian|stealth)\b/.test(text);
  const isStartupGeneral = /\b(startup|pitch|deck|venture|seed|growth|saas|fintech)\b/.test(text);
  const isFestivalOrEvent = /\b(festival|concert|music|carnival|fiesta|party|celebration|announcement|summer|live)\b/.test(text);
  const isExecutiveOrLegal = /\b(letter|formal|business letter|memo|agreement|proposal|contract|official|corporate executive)\b/.test(text);
  const isResume = docType === "resume" || /\b(resume|cv|curriculum vitae|bio|portfolio)\b/.test(text);
  const isMinimal = /\b(minimal|minimalist|clean|simple|understated|neutral|monochrome)\b/.test(text);

  // 2. Synthesize Palette & Mood
  let name = "Bespoke Dynamic Design";
  let visualDirection = "Modern Contemporary";
  let background = "#FFFFFF";
  let surface = "#F8FAFC";
  let primary = "#0F172A";
  let secondary = "#2563EB";
  let accent = "#F59E0B";
  let textPrimary = "#0F172A";
  let mutedText = "#64748B";
  let border = "#E2E8F0";

  let headingFont = "Plus Jakarta Sans";
  let bodyFont = "Inter";
  let monoFont = "JetBrains Mono";
  let cornerRadius = 8;
  let borderWidth = 1;
  let shadowStyle = "subtle";
  let alignment = "left";
  let density = "balanced";
  let hierarchy = "balanced_title_body";
  let grid = "standard_columns";
  let imageTreatment = "editorial_clean";

  // ── Aesthetic Profiles ───────────────────────────────────────────────────

  if (isLuxury) {
    name = "Luxury Skincare & Editorial Prestige";
    visualDirection = "Soft warm beige tones, deep charcoal serif typography, and elegant editorial framing";
    background = "#FBF8F3"; // Soft creamy warm beige
    surface = "#FFFFFF";
    primary = "#121212";   // Deep charcoal black
    secondary = "#8C7A6B"; // Warm taupe
    accent = "#C5A880";    // Soft champagne gold
    textPrimary = "#181614";
    mutedText = "#7D756D";
    border = "#EAE3D9";
    headingFont = "Playfair Display";
    bodyFont = "Montserrat";
    monoFont = "Courier Prime";
    cornerRadius = 4;
    borderWidth = 1;
    shadowStyle = "none";
    alignment = "center";
    density = "airy";
    hierarchy = "dramatic_editorial_headline";
    grid = "asymmetrical_editorial";
    imageTreatment = "editorial_clean";
  } else if (isCyberpunkOrGaming) {
    name = "Cyberpunk High-Octane Neon";
    visualDirection = "Obsidian void background, electric neon cyan and magenta accents, sharp HUD typography";
    background = "#050811"; // Pitch cyber black
    surface = "#0D1424";    // Deep navy panel
    primary = "#00F0FF";   // Electric Neon Cyan
    secondary = "#FF0055"; // Hot Fluorescent Pink
    accent = "#FFE600";    // Laser Yellow
    textPrimary = "#F0F6FC";
    mutedText = "#8B949E";
    border = "#1F2E4D";
    headingFont = "JetBrains Mono";
    bodyFont = "Inter";
    monoFont = "JetBrains Mono";
    cornerRadius = 2; // Sharp cyber edges
    borderWidth = 1.5;
    shadowStyle = "neon_glow";
    alignment = "left";
    density = "dense";
    hierarchy = "high_contrast_kpi";
    grid = "dense_hud_grid";
    imageTreatment = "high_contrast";
  } else if (isChildrenOrPlayful) {
    name = "Playful Educational & Exploratory";
    visualDirection = "Bright cheerful sunshine hues, sky blue anchors, organic friendly rounded typography";
    background = "#FEFCE8"; // Warm sunshine cream
    surface = "#FFFFFF";
    primary = "#0284C7";   // Bright Sky Blue
    secondary = "#FACC15"; // Sunny Yellow
    accent = "#22C55E";    // Fresh Green
    textPrimary = "#1E293B";
    mutedText = "#475569";
    border = "#FDE047";
    headingFont = "Nunito";
    bodyFont = "Nunito";
    monoFont = "JetBrains Mono";
    cornerRadius = 20; // Extra friendly soft corners
    borderWidth = 2;
    shadowStyle = "elevated";
    alignment = "center";
    density = "balanced";
    hierarchy = "bold_playful_cards";
    grid = "flexible_card_clusters";
    imageTreatment = "soft_rounded";
  } else if (isAcademicOrResearch) {
    name = "Serene Academic & Scientific Paper";
    visualDirection = "Pristine academic ivory, deep navy authority, crisp serif research clarity";
    background = "#FFFFFF";
    surface = "#F8FAFC";
    primary = "#1E3A5F";   // Deep Oxford Navy
    secondary = "#0284C7"; // Oceanic Insight Blue
    accent = "#D97706";    // Amber highlight
    textPrimary = "#0F172A";
    mutedText = "#64748B";
    border = "#E2E8F0";
    headingFont = "Merriweather";
    bodyFont = "Lato";
    monoFont = "IBM Plex Mono";
    cornerRadius = 2;
    borderWidth = 1;
    shadowStyle = "subtle";
    alignment = "left";
    density = "balanced";
    hierarchy = "academic_citation_flow";
    grid = "structured_analytical_flow";
    imageTreatment = "editorial_clean";
  } else if (isDarkStartupOrInvestor) {
    name = "Dark Obsidian Venture Pitch";
    visualDirection = "Stealth obsidian backdrop, glowing purple/emerald metrics, high-impact venture storytelling";
    background = "#0B0F19"; // Obsidian deep slate
    surface = "#161F30";
    primary = "#8B5CF6";   // Electric Purple
    secondary = "#10B981"; // Growth Emerald
    accent = "#06B6D4";    // Cyan highlight
    textPrimary = "#F8FAFC";
    mutedText = "#94A3B8";
    border = "#24324D";
    headingFont = "Plus Jakarta Sans";
    bodyFont = "Inter";
    monoFont = "JetBrains Mono";
    cornerRadius = 12;
    borderWidth = 1;
    shadowStyle = "elevated";
    alignment = "left";
    density = "balanced";
    hierarchy = "metric_forward_dashboard";
    grid = "modular_metric_grid";
    imageTreatment = "gradient_tinted";
  } else if (isFestivalOrEvent) {
    name = "Vibrant Festival & Cultural Celebration";
    visualDirection = "Dynamic rich magenta and sunset orange, festive high-energy typography";
    background = "#1C0B2B"; // Deep festive plum
    surface = "#2D1245";
    primary = "#FF007A";   // Electric Festival Magenta
    secondary = "#FF8A00"; // Sunset Tangerine
    accent = "#FFE500";    // Bright Sun
    textPrimary = "#FFFFFF";
    mutedText = "#D1B3E0";
    border = "#4D2175";
    headingFont = "Montserrat";
    bodyFont = "Open Sans";
    monoFont = "JetBrains Mono";
    cornerRadius = 16;
    borderWidth = 1;
    shadowStyle = "elevated";
    alignment = "center";
    density = "airy";
    hierarchy = "gigantic_display_title";
    grid = "dynamic_poster_asymmetry";
    imageTreatment = "high_contrast";
  } else if (isResume) {
    name = "Executive Engineering & Leadership CV";
    visualDirection = "Clean ATS-compliant document white, authoritative slate, structured typography hierarchy";
    background = "#FFFFFF";
    surface = "#F8FAFC";
    primary = "#0F172A";   // Slate 900
    secondary = "#2563EB"; // Professional Cobalt
    accent = "#10B981";    // Skills Emerald
    textPrimary = "#1E293B";
    mutedText = "#64748B";
    border = "#CBD5E1";
    headingFont = "Plus Jakarta Sans";
    bodyFont = "Inter";
    monoFont = "JetBrains Mono";
    cornerRadius = 4;
    borderWidth = 1;
    shadowStyle = "none";
    alignment = "left";
    density = "dense";
    hierarchy = "chronological_sections";
    grid = "two_column_cv";
    imageTreatment = "editorial_clean";
  } else if (isExecutiveOrLegal) {
    name = "Minimalist Business Letterhead";
    visualDirection = "Crisp formal stationery, authoritative dark navy, formal serif typography and balanced margins";
    background = "#FAFAF9"; // Fine paper ivory
    surface = "#FFFFFF";
    primary = "#1C1917";   // Deep warm ink
    secondary = "#1E3A5F"; // Classic executive navy
    accent = "#78716C";    // Warm graphite
    textPrimary = "#1C1917";
    mutedText = "#57534E";
    border = "#E7E5E4";
    headingFont = "Playfair Display";
    bodyFont = "Source Sans Pro";
    monoFont = "Courier Prime";
    cornerRadius = 0; // Pure print stationery
    borderWidth = 1;
    shadowStyle = "none";
    alignment = "left";
    density = "airy";
    hierarchy = "formal_document_header";
    grid = "single_column_prose";
    imageTreatment = "editorial_clean";
  } else if (docType === "social_media" || input.platform?.includes("instagram")) {
    name = "High-Engagement Social Feed Graphic";
    visualDirection = "Vibrant attention-commanding contrast, bold focal typography, and mobile-optimized framing";
    background = hash % 2 === 0 ? "#0F172A" : "#FFFFFF";
    const isDark = background !== "#FFFFFF";
    primary = isDark ? "#38BDF8" : "#2563EB";
    secondary = isDark ? "#EC4899" : "#7C3AED";
    accent = "#F59E0B";
    surface = isDark ? "#1E293B" : "#F8FAFC";
    textPrimary = isDark ? "#F8FAFC" : "#0F172A";
    mutedText = isDark ? "#94A3B8" : "#64748B";
    border = isDark ? "#334155" : "#E2E8F0";
    headingFont = "Montserrat";
    bodyFont = "Inter";
    cornerRadius = 14;
    shadowStyle = "elevated";
  } else if (docType === "poster") {
    name = "Modern High-Impact Print Poster";
    visualDirection = "High-contrast visual hierarchy, large focal headline, and prominent callout badges";
    background = "#FFFFFF";
    surface = "#F1F5F9";
    primary = "#0F172A";
    secondary = "#3B82F6";
    accent = "#EF4444";
    textPrimary = "#0F172A";
    mutedText = "#475569";
    border = "#E2E8F0";
    headingFont = "Montserrat";
    bodyFont = "Inter";
    cornerRadius = 8;
  } else if (docType === "infographic") {
    name = "Vertical Narrative Storyboard Infographic";
    visualDirection = "Sequential color-coded milestones, clean iconography, and high-readability metric badges";
    background = "#F8FAFC";
    surface = "#FFFFFF";
    primary = "#0284C7";
    secondary = "#10B981";
    accent = "#F59E0B";
    textPrimary = "#0F172A";
    mutedText = "#64748B";
    border = "#E2E8F0";
    headingFont = "Plus Jakarta Sans";
    bodyFont = "Inter";
    cornerRadius = 10;
  } else if (docType === "diagram") {
    name = "Clean Architectural DAG & Flowchart";
    visualDirection = "Structured technical grid, clear node status distinctions, and high-contrast vector connectors";
    background = "#0B0F19";
    surface = "#111827";
    primary = "#38BDF8";
    secondary = "#818CF8";
    accent = "#34D399";
    textPrimary = "#F9FAFB";
    mutedText = "#9CA3AF";
    border = "#1F2937";
    headingFont = "JetBrains Mono";
    bodyFont = "Inter";
    monoFont = "JetBrains Mono";
    cornerRadius = 6;
  } else if (docType === "chart") {
    name = "Analytical Financial Benchmark Report";
    visualDirection = "High-clarity data palettes, muted gridlines, and bold KPI metric chips";
    background = "#FFFFFF";
    surface = "#F8FAFC";
    primary = "#1E293B";
    secondary = "#0284C7";
    accent = "#10B981";
    textPrimary = "#0F172A";
    mutedText = "#64748B";
    border = "#E2E8F0";
    headingFont = "Plus Jakarta Sans";
    bodyFont = "Inter";
    monoFont = "JetBrains Mono";
    cornerRadius = 8;
  }

  // 3. Apply Brand Kit Override ONLY when user explicitly selected one
  if (input.brandKitPalette) {
    primary = input.brandKitPalette.primary;
    secondary = input.brandKitPalette.secondary;
    accent = input.brandKitPalette.accent;
    if (input.brandKitPalette.background) background = input.brandKitPalette.background;
    if (input.brandKitPalette.surface) surface = input.brandKitPalette.surface;
  }

  // 4. User Color Preferences Override
  if (input.colorPreferences && input.colorPreferences.length > 0) {
    if (input.colorPreferences[0]) primary = input.colorPreferences[0];
    if (input.colorPreferences[1]) secondary = input.colorPreferences[1];
    if (input.colorPreferences[2]) accent = input.colorPreferences[2];
  }

  // 5. User Typography Preferences Override
  if (input.typographyPreferences && input.typographyPreferences.length > 0) {
    if (input.typographyPreferences[0]) headingFont = input.typographyPreferences[0];
    if (input.typographyPreferences[1]) bodyFont = input.typographyPreferences[1];
  }

  const isDark = background !== "#FFFFFF" && background !== "#FAFAF9" && background !== "#FBF8F3" && background !== "#FEFCE8" && background !== "#F8FAFC";

  return {
    name,
    visualDirection,
    palette: {
      background,
      surface,
      primary,
      secondary,
      accent,
      text: textPrimary,
      mutedText,
      border,
    },
    typography: {
      headingFont,
      bodyFont,
      monoFont,
      displayScale: [14, 16, 20, 24, 32, 44, 60],
      weights: [400, 500, 600, 700, 800],
    },
    spacing: {
      unit: 4,
      sectionGap: density === "airy" ? 32 : density === "dense" ? 16 : 24,
      elementGap: density === "dense" ? 8 : 14,
      pagePadding: density === "airy" ? 48 : 32,
    },
    shapes: {
      cornerRadius,
      borderWidth,
      shadowStyle,
    },
    imagery: {
      treatment: imageTreatment,
      aspectPreference: docType === "social_media" ? "square" : "landscape",
      overlayStyle: isDark ? "subtle_dark_gradient" : "none",
    },
    composition: {
      alignment,
      density,
      hierarchy,
      grid,
    },
  };
}

/**
 * Converts a GeneratedDesignSystem into a standard SlideCraft ThemeSpec
 * so all existing renderers, components, and export compilers remain 100% compatible.
 */
export function designSystemToThemeSpec(ds: GeneratedDesignSystem): ThemeSpec {
  const isDark =
    ds.palette.background !== "#FFFFFF" &&
    ds.palette.background !== "#FAFAF9" &&
    ds.palette.background !== "#FBF8F3" &&
    ds.palette.background !== "#FEFCE8" &&
    ds.palette.background !== "#F8FAFC";

  return {
    mode: isDark ? "dark" : "light",
    colors: {
      primary: ds.palette.primary,
      secondary: ds.palette.secondary,
      accent: ds.palette.accent,
      background: ds.palette.background,
      surface: ds.palette.surface,
      textPrimary: ds.palette.text,
      textSecondary: ds.palette.mutedText,
      border: ds.palette.border || (isDark ? "#334155" : "#E2E8F0"),
    },
    typography: {
      headingFont: ds.typography.headingFont,
      bodyFont: ds.typography.bodyFont,
      monoFont: ds.typography.monoFont || "JetBrains Mono",
      baseSizePx: 16,
    },
    styleTokens: {
      borderRadiusPx: ds.shapes.cornerRadius,
      shadow: ds.shapes.shadowStyle === "none" ? "none" : ds.shapes.shadowStyle === "elevated" ? "lg" : "md",
    },
  };
}
