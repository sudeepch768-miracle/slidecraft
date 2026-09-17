import { ThemeSpec, DesignStyle } from "@/types/document-spec";

export interface PptxDesignTokens {
  name: string;
  colors: {
    primary: string; // 6-digit hex string without '#'
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    muted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    monoFont: string;
    heroSizePt: number;
    h1SizePt: number;
    h2SizePt: number;
    h3SizePt: number;
    bodySizePt: number;
    captionSizePt: number;
  };
  spacing: {
    marginXInches: number;
    marginYInches: number;
    gutterInches: number;
    cardPaddingInches: number;
  };
  style: {
    borderRadius: number; // For PptxGenJS roundRect (0.05 to 0.25)
    borderWidthPt: number;
    hasShadow: boolean;
    headerYInches: number;
    footerYInches: number;
  };
}

export function cleanHex(color: string): string {
  if (!color) return "000000";
  return color.startsWith("#") ? color.slice(1) : color;
}

export const DESIGN_SYSTEM_PRESETS: Record<DesignStyle, PptxDesignTokens> = {
  microsoft_professional: {
    name: "Microsoft-Inspired Professional",
    colors: {
      primary: "002050",
      secondary: "0078D4",
      accent: "107C41",
      background: "F3F4F6",
      surface: "FFFFFF",
      textPrimary: "1F2937",
      textSecondary: "4B5563",
      border: "D1D5DB",
      muted: "E5E7EB",
    },
    typography: {
      headingFont: "Segoe UI",
      bodyFont: "Segoe UI",
      monoFont: "Consolas",
      heroSizePt: 42,
      h1SizePt: 26,
      h2SizePt: 20,
      h3SizePt: 16,
      bodySizePt: 13,
      captionSizePt: 10,
    },
    spacing: {
      marginXInches: 0.8,
      marginYInches: 0.6,
      gutterInches: 0.35,
      cardPaddingInches: 0.25,
    },
    style: {
      borderRadius: 0.08,
      borderWidthPt: 1,
      hasShadow: true,
      headerYInches: 0.6,
      footerYInches: 7.0,
    },
  },

  modern_academic: {
    name: "Modern Academic",
    colors: {
      primary: "1E293B",
      secondary: "991B1B", // Crimson
      accent: "0D9488", // Teal
      background: "F8FAFC",
      surface: "FFFFFF",
      textPrimary: "0F172A",
      textSecondary: "475569",
      border: "CBD5E1",
      muted: "F1F5F9",
    },
    typography: {
      headingFont: "Georgia",
      bodyFont: "Calibri",
      monoFont: "Courier New",
      heroSizePt: 40,
      h1SizePt: 24,
      h2SizePt: 19,
      h3SizePt: 15,
      bodySizePt: 12,
      captionSizePt: 10,
    },
    spacing: {
      marginXInches: 0.9,
      marginYInches: 0.65,
      gutterInches: 0.3,
      cardPaddingInches: 0.25,
    },
    style: {
      borderRadius: 0.04,
      borderWidthPt: 1,
      hasShadow: false,
      headerYInches: 0.65,
      footerYInches: 7.0,
    },
  },

  corporate: {
    name: "Corporate Executive",
    colors: {
      primary: "0F172A",
      secondary: "1E40AF", // Cobalt
      accent: "F59E0B", // Amber
      background: "F8FAFC",
      surface: "FFFFFF",
      textPrimary: "0F172A",
      textSecondary: "64748B",
      border: "E2E8F0",
      muted: "F1F5F9",
    },
    typography: {
      headingFont: "Arial",
      bodyFont: "Arial",
      monoFont: "Courier New",
      heroSizePt: 44,
      h1SizePt: 26,
      h2SizePt: 20,
      h3SizePt: 16,
      bodySizePt: 13,
      captionSizePt: 10,
    },
    spacing: {
      marginXInches: 0.8,
      marginYInches: 0.6,
      gutterInches: 0.35,
      cardPaddingInches: 0.25,
    },
    style: {
      borderRadius: 0.1,
      borderWidthPt: 1,
      hasShadow: true,
      headerYInches: 0.6,
      footerYInches: 7.0,
    },
  },

  minimal: {
    name: "Minimal Monochrome",
    colors: {
      primary: "09090B",
      secondary: "27272A",
      accent: "71717A",
      background: "FFFFFF",
      surface: "FAFAFA",
      textPrimary: "09090B",
      textSecondary: "71717A",
      border: "E4E4E7",
      muted: "F4F4F5",
    },
    typography: {
      headingFont: "Helvetica",
      bodyFont: "Helvetica",
      monoFont: "Courier New",
      heroSizePt: 46,
      h1SizePt: 26,
      h2SizePt: 19,
      h3SizePt: 15,
      bodySizePt: 13,
      captionSizePt: 10,
    },
    spacing: {
      marginXInches: 1.0,
      marginYInches: 0.7,
      gutterInches: 0.4,
      cardPaddingInches: 0.25,
    },
    style: {
      borderRadius: 0.02,
      borderWidthPt: 0.75,
      hasShadow: false,
      headerYInches: 0.7,
      footerYInches: 7.0,
    },
  },

  colorful_educational: {
    name: "Colorful Educational",
    colors: {
      primary: "0369A1",
      secondary: "059669", // Emerald
      accent: "D97706", // Amber
      background: "FDF4FF", // Soft warm tint
      surface: "FFFFFF",
      textPrimary: "1E293B",
      textSecondary: "64748B",
      border: "FBCFE8",
      muted: "F5F3FF",
    },
    typography: {
      headingFont: "Trebuchet MS",
      bodyFont: "Calibri",
      monoFont: "Consolas",
      heroSizePt: 42,
      h1SizePt: 26,
      h2SizePt: 20,
      h3SizePt: 16,
      bodySizePt: 13,
      captionSizePt: 11,
    },
    spacing: {
      marginXInches: 0.8,
      marginYInches: 0.6,
      gutterInches: 0.35,
      cardPaddingInches: 0.3,
    },
    style: {
      borderRadius: 0.15,
      borderWidthPt: 1.5,
      hasShadow: true,
      headerYInches: 0.6,
      footerYInches: 7.0,
    },
  },

  dark_technology: {
    name: "Dark Technology",
    colors: {
      primary: "F1F5F9",
      secondary: "38BDF8", // Cyan
      accent: "A78BFA", // Violet
      background: "0B0F19", // Deep space dark
      surface: "151D2F",
      textPrimary: "F8FAFC",
      textSecondary: "94A3B8",
      border: "1E293B",
      muted: "1E293B",
    },
    typography: {
      headingFont: "Segoe UI",
      bodyFont: "Segoe UI",
      monoFont: "Consolas",
      heroSizePt: 44,
      h1SizePt: 26,
      h2SizePt: 20,
      h3SizePt: 16,
      bodySizePt: 13,
      captionSizePt: 10,
    },
    spacing: {
      marginXInches: 0.8,
      marginYInches: 0.6,
      gutterInches: 0.35,
      cardPaddingInches: 0.25,
    },
    style: {
      borderRadius: 0.1,
      borderWidthPt: 1,
      hasShadow: true,
      headerYInches: 0.6,
      footerYInches: 7.0,
    },
  },

  research_conference: {
    name: "Research Conference",
    colors: {
      primary: "1C3D5A",
      secondary: "0E7490",
      accent: "15803D",
      background: "F8FAFC",
      surface: "FFFFFF",
      textPrimary: "0F172A",
      textSecondary: "334155",
      border: "CBD5E1",
      muted: "E2E8F0",
    },
    typography: {
      headingFont: "Times New Roman",
      bodyFont: "Calibri",
      monoFont: "Courier New",
      heroSizePt: 38,
      h1SizePt: 24,
      h2SizePt: 18,
      h3SizePt: 15,
      bodySizePt: 12,
      captionSizePt: 10,
    },
    spacing: {
      marginXInches: 0.75,
      marginYInches: 0.6,
      gutterInches: 0.3,
      cardPaddingInches: 0.2,
    },
    style: {
      borderRadius: 0.04,
      borderWidthPt: 1,
      hasShadow: false,
      headerYInches: 0.6,
      footerYInches: 7.0,
    },
  },

  startup_pitch: {
    name: "Startup Pitch",
    colors: {
      primary: "0F172A",
      secondary: "4F46E5", // Electric Indigo
      accent: "F43F5E", // Vibrant Rose
      background: "FAFAFA",
      surface: "FFFFFF",
      textPrimary: "0F172A",
      textSecondary: "64748B",
      border: "E2E8F0",
      muted: "F1F5F9",
    },
    typography: {
      headingFont: "Arial",
      bodyFont: "Arial",
      monoFont: "Consolas",
      heroSizePt: 46,
      h1SizePt: 28,
      h2SizePt: 22,
      h3SizePt: 16,
      bodySizePt: 13,
      captionSizePt: 10,
    },
    spacing: {
      marginXInches: 0.8,
      marginYInches: 0.6,
      gutterInches: 0.35,
      cardPaddingInches: 0.25,
    },
    style: {
      borderRadius: 0.12,
      borderWidthPt: 1,
      hasShadow: true,
      headerYInches: 0.6,
      footerYInches: 7.0,
    },
  },
};

/**
 * Resolves design tokens by marrying the requested design style with any custom document theme overrides.
 */
export function resolvePptxDesignTokens(
  theme?: ThemeSpec,
  requestedStyle?: DesignStyle | string
): PptxDesignTokens {
  const baseStyleKey = (requestedStyle && requestedStyle in DESIGN_SYSTEM_PRESETS)
    ? (requestedStyle as DesignStyle)
    : "corporate";

  const baseTokens = DESIGN_SYSTEM_PRESETS[baseStyleKey];

  if (!theme) {
    return baseTokens;
  }

  // Overlay custom theme colors & typography onto base tokens
  return {
    ...baseTokens,
    colors: {
      primary: cleanHex(theme.colors.primary) || baseTokens.colors.primary,
      secondary: cleanHex(theme.colors.secondary) || baseTokens.colors.secondary,
      accent: cleanHex(theme.colors.accent) || baseTokens.colors.accent,
      background: cleanHex(theme.colors.background) || baseTokens.colors.background,
      surface: cleanHex(theme.colors.surface) || baseTokens.colors.surface,
      textPrimary: cleanHex(theme.colors.textPrimary) || baseTokens.colors.textPrimary,
      textSecondary: cleanHex(theme.colors.textSecondary) || baseTokens.colors.textSecondary,
      border: cleanHex(theme.colors.border) || baseTokens.colors.border,
      muted: baseTokens.colors.muted,
    },
    typography: {
      ...baseTokens.typography,
      headingFont: theme.typography.headingFont || baseTokens.typography.headingFont,
      bodyFont: theme.typography.bodyFont || baseTokens.typography.bodyFont,
      monoFont: theme.typography.monoFont || baseTokens.typography.monoFont,
    },
  };
}
