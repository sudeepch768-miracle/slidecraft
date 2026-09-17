/**
 * reference-extractor.ts
 * Lawful reference-design workflow:
 * Analyzes reference inputs (user reference files, style directions, or color schemes)
 * to extract inspiration tokens (palette, typography, layout direction)
 * without copying proprietary content or infringing copyrighted layouts.
 */

import { ThemeSpec, DesignStyle } from "@/types/document-spec";
import { THEME_PRESETS, FONT_PAIRINGS } from "../ai/theme-generator";

export interface DesignDirectionPreset {
  id: string;
  name: string;
  category: "corporate" | "tech" | "creative" | "academic" | "minimal" | "bold";
  description: string;
  style: DesignStyle;
  theme: ThemeSpec;
  keyArchetypes: string[];
}

export const DESIGN_DIRECTIONS: DesignDirectionPreset[] = [
  {
    id: "dir-microsoft",
    name: "Microsoft Modern Professional",
    category: "corporate",
    description: "Enterprise clarity with Segoe UI, corporate blue accents, and structured multi-column matrices.",
    style: "microsoft_professional",
    theme: {
      mode: "light",
      colors: {
        primary: "#002050",
        secondary: "#0078D4",
        accent: "#107C41",
        background: "#F3F4F6",
        surface: "#FFFFFF",
        textPrimary: "#1F2937",
        textSecondary: "#4B5563",
        border: "#D1D5DB",
      },
      typography: {
        headingFont: "Segoe UI",
        bodyFont: "Segoe UI",
        monoFont: "Consolas",
        baseSizePx: 16,
      },
      styleTokens: { borderRadiusPx: 6, shadow: "sm" },
    },
    keyArchetypes: ["hero_title", "comparison_table", "four_metric_dashboard", "three_card_grid"],
  },
  {
    id: "dir-tech-dark",
    name: "SaaS & AI Dark Grid",
    category: "tech",
    description: "High-contrast dark theme with vibrant cyan/purple accents, JetBrains mono codes, and flowchart DAGs.",
    style: "dark_technology",
    theme: {
      mode: "dark",
      colors: {
        primary: "#7C3AED",
        secondary: "#06B6D4",
        accent: "#10B981",
        background: "#0F172A",
        surface: "#1E293B",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#334155",
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: { borderRadiusPx: 10, shadow: "md" },
    },
    keyArchetypes: ["hero_title", "process_flowchart", "four_metric_dashboard", "data_chart_focus"],
  },
  {
    id: "dir-academic",
    name: "Academic & Research Paper",
    category: "academic",
    description: "Serif elegance with Merriweather & Lato, muted earth tones, and analytical data charts.",
    style: "modern_academic",
    theme: {
      mode: "light",
      colors: {
        primary: "#1E3A5F",
        secondary: "#E07B39",
        accent: "#2D9CDB",
        background: "#FAFAF8",
        surface: "#FFFFFF",
        textPrimary: "#1A2332",
        textSecondary: "#596574",
        border: "#E0D9CF",
      },
      typography: {
        headingFont: "Merriweather",
        bodyFont: "Lato",
        monoFont: "Courier Prime",
        baseSizePx: 16,
      },
      styleTokens: { borderRadiusPx: 4, shadow: "sm" },
    },
    keyArchetypes: ["hero_title", "data_chart_focus", "two_column_split", "horizontal_timeline"],
  },
  {
    id: "dir-creative-vibrant",
    name: "Creative & Agency Showcase",
    category: "creative",
    description: "Playful, colorful gradients, Raleway headings, large pill badges, and asymmetrical pull quotes.",
    style: "colorful_educational",
    theme: {
      mode: "light",
      colors: {
        primary: "#E91E8C",
        secondary: "#7C3AED",
        accent: "#F59E0B",
        background: "#FEFEFE",
        surface: "#FFFFFF",
        textPrimary: "#1A1A2E",
        textSecondary: "#6B7280",
        border: "#F3E8FF",
      },
      typography: {
        headingFont: "Raleway",
        bodyFont: "Poppins",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: { borderRadiusPx: 16, shadow: "lg" },
    },
    keyArchetypes: ["hero_title", "editorial_asymmetrical", "three_card_grid", "full_bleed_visual"],
  },
  {
    id: "dir-clean-minimal",
    name: "Editorial Minimalist",
    category: "minimal",
    description: "Pure whitespace, precise Plus Jakarta typography, subtle 1px border cards, and calm slate tones.",
    style: "minimal",
    theme: {
      mode: "light",
      colors: {
        primary: "#18181B",
        secondary: "#71717A",
        accent: "#3B82F6",
        background: "#FFFFFF",
        surface: "#FAFAFA",
        textPrimary: "#09090B",
        textSecondary: "#71717A",
        border: "#E4E4E7",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: { borderRadiusPx: 8, shadow: "sm" },
    },
    keyArchetypes: ["hero_title", "two_column_split", "three_card_grid", "summary"],
  },
];

/**
 * Extracts inspiration tokens from reference text, file names, or style descriptions.
 */
export function extractReferenceInspiration(referenceInput: string): {
  directionPreset: DesignDirectionPreset;
  extractedColors: string[];
  notes: string;
} {
  const lower = referenceInput.toLowerCase();

  let matchedDirection = DESIGN_DIRECTIONS[0];

  if (lower.includes("academic") || lower.includes("research") || lower.includes("thesis") || lower.includes("paper")) {
    matchedDirection = DESIGN_DIRECTIONS.find((d) => d.id === "dir-academic") || matchedDirection;
  } else if (lower.includes("tech") || lower.includes("saas") || lower.includes("dark") || lower.includes("code") || lower.includes("ai")) {
    matchedDirection = DESIGN_DIRECTIONS.find((d) => d.id === "dir-tech-dark") || matchedDirection;
  } else if (lower.includes("creative") || lower.includes("vibrant") || lower.includes("colorful") || lower.includes("agency")) {
    matchedDirection = DESIGN_DIRECTIONS.find((d) => d.id === "dir-creative-vibrant") || matchedDirection;
  } else if (lower.includes("minimal") || lower.includes("clean") || lower.includes("simple") || lower.includes("white")) {
    matchedDirection = DESIGN_DIRECTIONS.find((d) => d.id === "dir-clean-minimal") || matchedDirection;
  }

  // Extract any hex codes mentioned in reference
  const hexMatches = referenceInput.match(/#[0-9A-Fa-f]{6}\b/g) || [];

  return {
    directionPreset: matchedDirection,
    extractedColors: hexMatches,
    notes: `Derived original design inspired by '${matchedDirection.name}' style principles.`,
  };
}
