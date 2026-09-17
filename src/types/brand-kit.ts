import { ThemeColors, ThemeTypography } from "./document-spec";

export interface BrandKit {
  id: string;
  userId: string;
  name: string;
  logoUrl?: string;
  colorPalette: ThemeColors;
  typography: ThemeTypography;
  styleTokens: {
    borderRadiusPx: number;
    shadow: "none" | "sm" | "md" | "lg";
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const PRESET_BRAND_KITS: Omit<BrandKit, "id" | "userId" | "createdAt" | "updatedAt">[] = [
  {
    name: "Modern Executive",
    isDefault: true,
    colorPalette: {
      primary: "#0F172A",
      secondary: "#2563EB",
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
      baseSizePx: 16,
    },
    styleTokens: {
      borderRadiusPx: 12,
      shadow: "md",
    },
  },
  {
    name: "Vibrant Tech",
    isDefault: false,
    colorPalette: {
      primary: "#4F46E5",
      secondary: "#7C3AED",
      accent: "#F43F5E",
      background: "#090D16",
      surface: "#111827",
      textPrimary: "#F9FAFB",
      textSecondary: "#9CA3AF",
      border: "#1F2937",
    },
    typography: {
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
      baseSizePx: 16,
    },
    styleTokens: {
      borderRadiusPx: 14,
      shadow: "lg",
    },
  },
  {
    name: "Forest & Sage",
    isDefault: false,
    colorPalette: {
      primary: "#14532D",
      secondary: "#15803D",
      accent: "#EAB308",
      background: "#F0FDF4",
      surface: "#FFFFFF",
      textPrimary: "#14532D",
      textSecondary: "#4B5563",
      border: "#BBF7D0",
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
      baseSizePx: 16,
    },
    styleTokens: {
      borderRadiusPx: 8,
      shadow: "sm",
    },
  },
  {
    name: "Warm Editorial",
    isDefault: false,
    colorPalette: {
      primary: "#451A03",
      secondary: "#9A3412",
      accent: "#D97706",
      background: "#FFFBEB",
      surface: "#FFFFFF",
      textPrimary: "#451A03",
      textSecondary: "#78350F",
      border: "#FDE68A",
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Source Sans 3",
      monoFont: "JetBrains Mono",
      baseSizePx: 16,
    },
    styleTokens: {
      borderRadiusPx: 6,
      shadow: "md",
    },
  },
];
