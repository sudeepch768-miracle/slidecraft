import {
  DocumentType,
  ThemeSpec,
  PageBackground,
  BackgroundSpec,
} from "@/types/document-spec";
import {
  VisualDirection,
  VisualStyleFamily,
  BackgroundStyleType,
  GlowPosition,
  DecorativeShapeType,
  TexturePatternType,
} from "@/types/visual-direction";

export interface FormatStylePreset {
  id: string;
  name: string;
  family: VisualStyleFamily;
  bgType: "solid" | "gradient" | "pattern" | "layered";
  mode: "light" | "dark";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary?: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
  gradient?: {
    direction: "to_bottom" | "to_right" | "to_bottom_right" | "to_top_right" | "radial";
    angleDeg: number;
    stops: Array<{ color: string; position: number }>;
  };
  glow?: {
    enabled: boolean;
    position: GlowPosition;
    color: string;
    secondaryColor?: string;
    blur: number;
    opacity: number;
    scale: number;
  };
  decorativeShapes?: {
    type: DecorativeShapeType;
    position?: "top_right" | "bottom_right" | "bottom_left" | "top_left" | "split_corners" | "side_rails";
    color: string;
    secondaryColor?: string;
    opacity: number;
  };
  pattern?: TexturePatternType;
  typography: {
    headingFont: string;
    bodyFont: string;
    monoFont: string;
  };
}

// ─── Format Presets Repository ──────────────────────────────────────────────

export const POSTER_PRESETS: Record<string, FormatStylePreset> = {
  high_energy_event: {
    id: "poster_high_energy",
    name: "High Energy Summit",
    family: "indigo_violet_gradient",
    bgType: "gradient",
    mode: "dark",
    colors: {
      primary: "#6366F1",
      secondary: "#A855F7",
      accent: "#EC4899",
      background: "#090A1A",
      backgroundSecondary: "#1E1B4B",
      surface: "#13142D",
      textPrimary: "#FFFFFF",
      textSecondary: "#A5B4FC",
      border: "#312E81",
    },
    gradient: {
      direction: "to_bottom_right",
      angleDeg: 135,
      stops: [
        { color: "#090A1A", position: 0 },
        { color: "#1E1B4B", position: 60 },
        { color: "#2E1065", position: 100 },
      ],
    },
    glow: {
      enabled: true,
      position: "top_right",
      color: "#818CF8",
      secondaryColor: "#EC4899",
      blur: 110,
      opacity: 0.35,
      scale: 1.4,
    },
    decorativeShapes: {
      type: "geometric_circles",
      position: "top_right",
      color: "#A855F7",
      secondaryColor: "#EC4899",
      opacity: 0.25,
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
  academic_conference: {
    id: "poster_academic",
    name: "Academic Scholarly",
    family: "blue_lavender_editorial",
    bgType: "solid",
    mode: "light",
    colors: {
      primary: "#0F172A",
      secondary: "#1E3A8A",
      accent: "#B45309",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      border: "#CBD5E1",
    },
    glow: {
      enabled: false,
      position: "center",
      color: "#3B82F6",
      blur: 0,
      opacity: 0,
      scale: 1,
    },
    decorativeShapes: {
      type: "corner_frame",
      position: "split_corners",
      color: "#1E3A8A",
      opacity: 0.15,
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
  cyberpunk_hackathon: {
    id: "poster_cyberpunk",
    name: "Cyberpunk Hackathon",
    family: "midnight_blue_coral",
    bgType: "gradient",
    mode: "dark",
    colors: {
      primary: "#06B6D4",
      secondary: "#A855F7",
      accent: "#F43F5E",
      background: "#05070E",
      backgroundSecondary: "#0F172A",
      surface: "#0D1527",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
      border: "#1E293B",
    },
    gradient: {
      direction: "to_bottom_right",
      angleDeg: 145,
      stops: [
        { color: "#05070E", position: 0 },
        { color: "#0D1527", position: 50 },
        { color: "#160B28", position: 100 },
      ],
    },
    glow: {
      enabled: true,
      position: "bottom_right",
      color: "#06B6D4",
      secondaryColor: "#F43F5E",
      blur: 100,
      opacity: 0.35,
      scale: 1.3,
    },
    decorativeShapes: {
      type: "tech_brackets",
      position: "split_corners",
      color: "#06B6D4",
      opacity: 0.3,
    },
    pattern: "circuit",
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
  minimalist_culture: {
    id: "poster_minimalist",
    name: "Minimalist Exhibition",
    family: "warm_editorial",
    bgType: "solid",
    mode: "light",
    colors: {
      primary: "#1C1917",
      secondary: "#78716C",
      accent: "#EA580C",
      background: "#FAF8F5",
      surface: "#FFFFFF",
      textPrimary: "#1C1917",
      textSecondary: "#57534E",
      border: "#E7E5E4",
    },
    decorativeShapes: {
      type: "editorial_lines",
      position: "side_rails",
      color: "#EA580C",
      opacity: 0.25,
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
};

export const RESUME_PRESETS: Record<string, FormatStylePreset> = {
  modern_executive: {
    id: "resume_executive",
    name: "Modern Executive",
    family: "clean_light_blue_pro",
    bgType: "solid",
    mode: "light",
    colors: {
      primary: "#0F172A",
      secondary: "#0369A1",
      accent: "#0D9488",
      background: "#FFFFFF",
      surface: "#FFFFFF",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      border: "#E2E8F0",
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
  clean_academic: {
    id: "resume_academic",
    name: "Academic Curriculum Vitae",
    family: "warm_editorial",
    bgType: "solid",
    mode: "light",
    colors: {
      primary: "#18181B",
      secondary: "#4338CA",
      accent: "#B45309",
      background: "#FAF9F6",
      surface: "#FAF9F6",
      textPrimary: "#18181B",
      textSecondary: "#52525B",
      border: "#D4D4D8",
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
  creative_portfolio: {
    id: "resume_creative",
    name: "Creative Modern",
    family: "indigo_violet_gradient",
    bgType: "solid",
    mode: "light",
    colors: {
      primary: "#0F172A",
      secondary: "#6366F1",
      accent: "#06B6D4",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      textPrimary: "#0F172A",
      textSecondary: "#64748B",
      border: "#E2E8F0",
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
};

export const SOCIAL_PRESETS: Record<string, FormatStylePreset> = {
  vibrant_creator: {
    id: "social_vibrant",
    name: "Vibrant Creator",
    family: "indigo_violet_gradient",
    bgType: "gradient",
    mode: "dark",
    colors: {
      primary: "#6366F1",
      secondary: "#EC4899",
      accent: "#38BDF8",
      background: "#0B0F19",
      backgroundSecondary: "#1E1B4B",
      surface: "#131C2E",
      textPrimary: "#FFFFFF",
      textSecondary: "#CBD5E1",
      border: "#312E81",
    },
    gradient: {
      direction: "to_bottom_right",
      angleDeg: 135,
      stops: [
        { color: "#0B0F19", position: 0 },
        { color: "#1E1B4B", position: 55 },
        { color: "#31104B", position: 100 },
      ],
    },
    glow: {
      enabled: true,
      position: "top_right",
      color: "#EC4899",
      secondaryColor: "#6366F1",
      blur: 90,
      opacity: 0.35,
      scale: 1.3,
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
  b2b_authority: {
    id: "social_b2b",
    name: "B2B Thought Leadership",
    family: "clean_light_blue_pro",
    bgType: "solid",
    mode: "light",
    colors: {
      primary: "#0F172A",
      secondary: "#2563EB",
      accent: "#06B6D4",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      border: "#E2E8F0",
    },
    glow: {
      enabled: true,
      position: "bottom_right",
      color: "#38BDF8",
      blur: 70,
      opacity: 0.15,
      scale: 1.1,
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
  tech_announcement: {
    id: "social_tech",
    name: "Tech Product Reveal",
    family: "midnight_blue_coral",
    bgType: "gradient",
    mode: "dark",
    colors: {
      primary: "#10B981",
      secondary: "#06B6D4",
      accent: "#F59E0B",
      background: "#030712",
      backgroundSecondary: "#0F172A",
      surface: "#111827",
      textPrimary: "#F9FAFB",
      textSecondary: "#9CA3AF",
      border: "#1F2937",
    },
    gradient: {
      direction: "to_bottom_right",
      angleDeg: 140,
      stops: [
        { color: "#030712", position: 0 },
        { color: "#064E3B", position: 50 },
        { color: "#0F172A", position: 100 },
      ],
    },
    glow: {
      enabled: true,
      position: "center",
      color: "#10B981",
      blur: 85,
      opacity: 0.28,
      scale: 1.2,
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
};

export const INFOGRAPHIC_PRESETS: Record<string, FormatStylePreset> = {
  process_flow_dynamic: {
    id: "info_process",
    name: "Dynamic Workflow Narrative",
    family: "deep_navy_electric_blue",
    bgType: "solid",
    mode: "light",
    colors: {
      primary: "#0F172A",
      secondary: "#2563EB",
      accent: "#06B6D4",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      border: "#E2E8F0",
    },
    decorativeShapes: {
      type: "accent_rail",
      position: "side_rails",
      color: "#2563EB",
      opacity: 0.2,
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
  data_kpi_dashboard: {
    id: "info_kpi",
    name: "High-Impact Metrics",
    family: "charcoal_amber_highlights",
    bgType: "gradient",
    mode: "dark",
    colors: {
      primary: "#F59E0B",
      secondary: "#38BDF8",
      accent: "#10B981",
      background: "#090D16",
      backgroundSecondary: "#131C2E",
      surface: "#1E293B",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
      border: "#334155",
    },
    gradient: {
      direction: "to_bottom_right",
      angleDeg: 135,
      stops: [
        { color: "#090D16", position: 0 },
        { color: "#131C2E", position: 70 },
        { color: "#1E293B", position: 100 },
      ],
    },
    glow: {
      enabled: true,
      position: "top_right",
      color: "#F59E0B",
      blur: 90,
      opacity: 0.25,
      scale: 1.2,
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
};

export const DIAGRAM_PRESETS: Record<string, FormatStylePreset> = {
  cloud_blueprint: {
    id: "diagram_cloud",
    name: "Architectural Cloud Blueprint",
    family: "deep_navy_electric_blue",
    bgType: "solid",
    mode: "dark",
    colors: {
      primary: "#38BDF8",
      secondary: "#818CF8",
      accent: "#34D399",
      background: "#080E1A",
      surface: "#0F1A2E",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
      border: "#1E3050",
    },
    pattern: "subtle_grid",
    glow: {
      enabled: true,
      position: "bottom_right",
      color: "#38BDF8",
      blur: 70,
      opacity: 0.18,
      scale: 1,
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
  logic_flowchart: {
    id: "diagram_flowchart",
    name: "Clean Logic Flow",
    family: "clean_light_blue_pro",
    bgType: "solid",
    mode: "light",
    colors: {
      primary: "#0F172A",
      secondary: "#2563EB",
      accent: "#10B981",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      border: "#CBD5E1",
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
};

export const CHART_PRESETS: Record<string, FormatStylePreset> = {
  data_analyst_pro: {
    id: "chart_analyst",
    name: "Analytical Benchmark",
    family: "clean_light_blue_pro",
    bgType: "solid",
    mode: "light",
    colors: {
      primary: "#0F172A",
      secondary: "#2563EB",
      accent: "#10B981",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      border: "#E2E8F0",
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
    },
  },
};

// ─── Format Design Engine Resolver ──────────────────────────────────────────

export function resolveFormatPreset(
  documentType: DocumentType,
  requestedMoodOrCategory?: string
): FormatStylePreset {
  const req = (requestedMoodOrCategory || "").toLowerCase();

  switch (documentType) {
    case "poster": {
      if (req.includes("cyber") || req.includes("hackathon") || req.includes("neon") || req.includes("dark")) {
        return POSTER_PRESETS.cyberpunk_hackathon;
      }
      if (req.includes("academic") || req.includes("scholarly") || req.includes("research") || req.includes("seminar")) {
        return POSTER_PRESETS.academic_conference;
      }
      if (req.includes("minimal") || req.includes("editorial") || req.includes("exhibition")) {
        return POSTER_PRESETS.minimalist_culture;
      }
      return POSTER_PRESETS.high_energy_event;
    }

    case "resume": {
      if (req.includes("creative") || req.includes("portfolio")) {
        return RESUME_PRESETS.creative_portfolio;
      }
      if (req.includes("academic") || req.includes("cv")) {
        return RESUME_PRESETS.clean_academic;
      }
      return RESUME_PRESETS.modern_executive;
    }

    case "social_media": {
      if (req.includes("b2b") || req.includes("linkedin") || req.includes("clean") || req.includes("light")) {
        return SOCIAL_PRESETS.b2b_authority;
      }
      if (req.includes("tech") || req.includes("launch") || req.includes("dark")) {
        return SOCIAL_PRESETS.tech_announcement;
      }
      return SOCIAL_PRESETS.vibrant_creator;
    }

    case "infographic": {
      if (req.includes("kpi") || req.includes("stat") || req.includes("metric") || req.includes("dark")) {
        return INFOGRAPHIC_PRESETS.data_kpi_dashboard;
      }
      return INFOGRAPHIC_PRESETS.process_flow_dynamic;
    }

    case "diagram": {
      if (req.includes("cloud") || req.includes("architecture") || req.includes("system") || req.includes("dark")) {
        return DIAGRAM_PRESETS.cloud_blueprint;
      }
      return DIAGRAM_PRESETS.logic_flowchart;
    }

    case "chart": {
      return CHART_PRESETS.data_analyst_pro;
    }

    default:
      return POSTER_PRESETS.high_energy_event;
  }
}

/**
 * Converts a FormatStylePreset into a full ThemeSpec
 */
export function presetToThemeSpec(preset: FormatStylePreset): ThemeSpec {
  return {
    mode: preset.mode,
    colors: {
      primary: preset.colors.primary,
      secondary: preset.colors.secondary,
      accent: preset.colors.accent,
      background: preset.colors.background,
      surface: preset.colors.surface,
      textPrimary: preset.colors.textPrimary,
      textSecondary: preset.colors.textSecondary,
      border: preset.colors.border,
    },
    typography: {
      headingFont: preset.typography.headingFont,
      bodyFont: preset.typography.bodyFont,
      monoFont: preset.typography.monoFont,
      baseSizePx: 16,
    },
    styleTokens: {
      borderRadiusPx: preset.mode === "dark" ? 16 : 10,
      shadow: preset.mode === "dark" ? "lg" : "md",
    },
  };
}

/**
 * Converts a FormatStylePreset into an independent PageBackground
 */
export function presetToPageBackground(preset: FormatStylePreset): PageBackground {
  if (preset.bgType === "gradient" && preset.gradient) {
    const stopsStr = preset.gradient.stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    const gradientCss = `linear-gradient(${preset.gradient.angleDeg}deg, ${stopsStr})`;

    return {
      type: "gradient",
      value: gradientCss,
      glow: preset.glow
        ? {
            enabled: preset.glow.enabled,
            position: preset.glow.position,
            color: preset.glow.color,
            secondaryColor: preset.glow.secondaryColor,
            blur: preset.glow.blur,
            opacity: preset.glow.opacity,
          }
        : undefined,
      decorativeShapes: preset.decorativeShapes
        ? {
            type: preset.decorativeShapes.type,
            position: preset.decorativeShapes.position,
            color: preset.decorativeShapes.color,
            secondaryColor: preset.decorativeShapes.secondaryColor,
            opacity: preset.decorativeShapes.opacity,
          }
        : undefined,
    };
  }

  return {
    type: "solid",
    value: preset.colors.background,
    glow: preset.glow
      ? {
          enabled: preset.glow.enabled,
          position: preset.glow.position,
          color: preset.glow.color,
          secondaryColor: preset.glow.secondaryColor,
          blur: preset.glow.blur,
          opacity: preset.glow.opacity,
        }
      : undefined,
    decorativeShapes: preset.decorativeShapes
      ? {
          type: preset.decorativeShapes.type,
          position: preset.decorativeShapes.position,
          color: preset.decorativeShapes.color,
          secondaryColor: preset.decorativeShapes.secondaryColor,
          opacity: preset.decorativeShapes.opacity,
        }
      : undefined,
  };
}

/**
 * Converts a FormatStylePreset into a full VisualDirection
 */
export function presetToVisualDirection(
  preset: FormatStylePreset,
  title: string,
  seed = "format-seed"
): VisualDirection {
  return {
    id: `vd-${preset.id}-${Date.now().toString(36)}`,
    variationSeed: seed,
    styleFamily: preset.family,
    styleName: preset.name,
    mode: preset.mode,
    backgroundStyle: preset.bgType === "gradient" ? "mesh_gradient" : "editorial",
    colors: {
      background: preset.colors.background,
      backgroundSecondary: preset.colors.backgroundSecondary || preset.colors.surface,
      primary: preset.colors.primary,
      secondary: preset.colors.secondary,
      accent: preset.colors.accent,
      accentSecondary: preset.colors.secondary,
      surface: preset.colors.surface,
      surfaceElevated: preset.colors.surface,
      surfaceBorder: preset.colors.border,
      textPrimary: preset.colors.textPrimary,
      textSecondary: preset.colors.textSecondary,
    },
    gradient: preset.gradient || {
      direction: "to_bottom_right",
      angleDeg: 135,
      stops: [
        { color: preset.colors.background, position: 0 },
        { color: preset.colors.surface, position: 100 },
      ],
    },
    glow: preset.glow || {
      enabled: false,
      position: "center",
      color: preset.colors.primary,
      blur: 0,
      opacity: 0,
      scale: 1,
    },
    decorativeShapes: preset.decorativeShapes || {
      type: "none",
      color: preset.colors.primary,
      opacity: 0,
    },
    texturePattern: {
      type: preset.pattern || "none",
      opacity: 0.15,
    },
    borderTreatment: {
      radiusPx: 12,
      widthPx: 1,
      color: preset.colors.border,
      opacity: 0.3,
    },
    imageTreatment: {
      mode: "darkened",
      overlayColor: preset.colors.primary,
      overlayOpacity: 0.4,
    },
    typographyContrast: {
      minTextContrastRatio: 7.0,
      surfacePanelRequired: true,
      headingWeight: 800,
      bodyOpacity: 0.9,
    },
    visualDensity: "balanced",
    generatedAt: new Date().toISOString(),
  };
}
