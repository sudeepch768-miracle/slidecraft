import {
  VisualDirection,
  VisualStyleFamily,
  BackgroundStyleType,
  GlowPosition,
  DecorativeShapeType,
  TexturePatternType,
  RecentStyleMetadata,
} from "@/types/visual-direction";
import { ThemeSpec, BackgroundSpec, LayoutArchetype } from "@/types/document-spec";
import crypto from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// 1. In-Memory Recent Style Tracker (5–10 items)
// ─────────────────────────────────────────────────────────────────────────────
const recentStylesHistory: RecentStyleMetadata[] = [];

export function recordRecentStyle(vd: VisualDirection): void {
  recentStylesHistory.unshift({
    styleFamily: vd.styleFamily,
    backgroundStyle: vd.backgroundStyle,
    primaryColorFamily: vd.colors.primary,
    generatedAt: vd.generatedAt,
  });
  if (recentStylesHistory.length > 10) {
    recentStylesHistory.pop();
  }
}

export function getRecentStyles(): RecentStyleMetadata[] {
  return [...recentStylesHistory];
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Cryptographic & Topic Seed Generator
// ─────────────────────────────────────────────────────────────────────────────
export function generateUniqueSeed(topic: string): string {
  const randomBytes = crypto.randomBytes(6).toString("hex");
  const timestamp = Date.now();
  // Simple deterministic hash of topic characters
  let topicHash = 0;
  for (let i = 0; i < topic.length; i++) {
    topicHash = (topicHash << 5) - topicHash + topic.charCodeAt(i);
    topicHash |= 0;
  }
  const cleanHash = Math.abs(topicHash).toString(36).substring(0, 6);
  return `seed-${timestamp}-${cleanHash}-${randomBytes}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRNG (Mulberry32) for Deterministic Procedural Variations from Seed
// ─────────────────────────────────────────────────────────────────────────────
function createPrng(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function () {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Color Adjustment Helpers (Subtle Hue/Luminance shifts for endless variety)
// ─────────────────────────────────────────────────────────────────────────────
function hexToHsl(hex: string): [number, number, number] {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  const r = (num >> 16) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function adjustHex(hex: string, deltaH: number, deltaS: number, deltaL: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h + deltaH, s + deltaS, l + deltaL);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. 10 Controlled Style Family Archetypes (Dynamic Foundations)
// ─────────────────────────────────────────────────────────────────────────────
interface StyleFamilyBlueprint {
  family: VisualStyleFamily;
  name: string;
  mode: "dark" | "light";
  backgroundStyle: BackgroundStyleType;
  baseColors: {
    background: string;
    backgroundSecondary: string;
    primary: string;
    secondary: string;
    accent: string;
    accentSecondary: string;
    surface: string;
    surfaceElevated: string;
    surfaceBorder: string;
    textPrimary: string;
    textSecondary: string;
  };
  defaultAngle: number;
  glowColor: string;
  decorativeType: DecorativeShapeType;
  patternType: TexturePatternType;
  patternOpacity: number;
  keywords: string[];
}

const STYLE_FAMILIES: StyleFamilyBlueprint[] = [
  {
    family: "deep_navy_electric_blue",
    name: "Deep Navy & Electric Azure Glow",
    mode: "dark",
    backgroundStyle: "solid_gradient",
    baseColors: {
      background: "#070E1E",
      backgroundSecondary: "#0B1528",
      primary: "#38bdf8",
      secondary: "#0ea5e9",
      accent: "#f59e0b",
      accentSecondary: "#3b82f6",
      surface: "#0F1A30",
      surfaceElevated: "#14223E",
      surfaceBorder: "#1E2F52",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
    },
    defaultAngle: 135,
    glowColor: "#38bdf8",
    decorativeType: "accent_rail",
    patternType: "subtle_grid",
    patternOpacity: 0.12,
    keywords: ["flight", "aviation", "aero", "cloud", "software", "network", "cyber", "ai"],
  },
  {
    family: "indigo_violet_gradient",
    name: "Midnight Indigo & Royal Violet",
    mode: "dark",
    backgroundStyle: "mesh_gradient",
    baseColors: {
      background: "#0A091A",
      backgroundSecondary: "#120E2E",
      primary: "#a855f7",
      secondary: "#8b5cf6",
      accent: "#ec4899",
      accentSecondary: "#c084fc",
      surface: "#140F35",
      surfaceElevated: "#1B1445",
      surfaceBorder: "#2D2060",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
    },
    defaultAngle: 145,
    glowColor: "#a855f7",
    decorativeType: "geometric_circles",
    patternType: "mesh",
    patternOpacity: 0.14,
    keywords: ["quantum", "neuro", "brain", "physics", "crypto", "deep learning", "cognitive"],
  },
  {
    family: "teal_emerald_technology",
    name: "Deep Obsidian & Tech Emerald Atmosphere",
    mode: "dark",
    backgroundStyle: "solid_gradient",
    baseColors: {
      background: "#041412",
      backgroundSecondary: "#071E1B",
      primary: "#14b8a6",
      secondary: "#10b981",
      accent: "#06b6d4",
      accentSecondary: "#34d399",
      surface: "#092521",
      surfaceElevated: "#0E322D",
      surfaceBorder: "#144840",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
    },
    defaultAngle: 125,
    glowColor: "#10b981",
    decorativeType: "tech_brackets",
    patternType: "circuit",
    patternOpacity: 0.12,
    keywords: ["agriculture", "verdant", "nature", "climate", "sustain", "carbon", "eco", "biology"],
  },
  {
    family: "midnight_blue_coral",
    name: "Midnight Sapphire with Vibrant Coral Accents",
    mode: "dark",
    backgroundStyle: "solid_gradient",
    baseColors: {
      background: "#081026",
      backgroundSecondary: "#0D1938",
      primary: "#3b82f6",
      secondary: "#f43f5e",
      accent: "#fb7185",
      accentSecondary: "#60a5fa",
      surface: "#111F42",
      surfaceElevated: "#172A58",
      surfaceBorder: "#203B78",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
    },
    defaultAngle: 155,
    glowColor: "#f43f5e",
    decorativeType: "corner_frame",
    patternType: "dots",
    patternOpacity: 0.14,
    keywords: ["pitch", "finance", "revenue", "saas", "market", "sales", "venture", "growth"],
  },
  {
    family: "charcoal_amber_highlights",
    name: "Warm Charcoal & Amber Gold Highlights",
    mode: "dark",
    backgroundStyle: "editorial",
    baseColors: {
      background: "#121316",
      backgroundSecondary: "#1A1C23",
      primary: "#f59e0b",
      secondary: "#fbbf24",
      accent: "#ea580c",
      accentSecondary: "#fde047",
      surface: "#1E2129",
      surfaceElevated: "#252933",
      surfaceBorder: "#343A47",
      textPrimary: "#F8FAFC",
      textSecondary: "#A1A1AA",
    },
    defaultAngle: 130,
    glowColor: "#f59e0b",
    decorativeType: "editorial_lines",
    patternType: "editorial_lines",
    patternOpacity: 0.1,
    keywords: ["leadership", "board", "executive", "industrial", "energy", "hardware", "engineering"],
  },
  {
    family: "blue_lavender_editorial",
    name: "Slate Obsidian & Blue-Lavender Editorial",
    mode: "dark",
    backgroundStyle: "editorial",
    baseColors: {
      background: "#0B0F1A",
      backgroundSecondary: "#101726",
      primary: "#a5b4fc",
      secondary: "#818cf8",
      accent: "#c084fc",
      accentSecondary: "#38bdf8",
      surface: "#131C31",
      surfaceElevated: "#1A253F",
      surfaceBorder: "#243254",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
    },
    defaultAngle: 140,
    glowColor: "#818cf8",
    decorativeType: "editorial_lines",
    patternType: "subtle_grid",
    patternOpacity: 0.1,
    keywords: ["research", "academic", "university", "paper", "ethics", "law", "philosophy", "analysis"],
  },
  {
    family: "dark_aurora_gradient",
    name: "Cosmic Abyss & Multi-Stop Dark Aurora",
    mode: "dark",
    backgroundStyle: "aurora",
    baseColors: {
      background: "#050814",
      backgroundSecondary: "#080D21",
      primary: "#2dd4bf",
      secondary: "#818cf8",
      accent: "#f43f5e",
      accentSecondary: "#38bdf8",
      surface: "#0E152F",
      surfaceElevated: "#141D40",
      surfaceBorder: "#212F62",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
    },
    defaultAngle: 160,
    glowColor: "#2dd4bf",
    decorativeType: "aurora_ribbon",
    patternType: "mesh",
    patternOpacity: 0.15,
    keywords: ["future", "vision", "space", "astronomy", "defense", "satellite", "next-gen", "frontier"],
  },
  {
    family: "subtle_geometric_grid",
    name: "Tech Graphite & Cyber Geometric Grid",
    mode: "dark",
    backgroundStyle: "geometric",
    baseColors: {
      background: "#0F131C",
      backgroundSecondary: "#141A26",
      primary: "#06b6d4",
      secondary: "#3b82f6",
      accent: "#10b981",
      accentSecondary: "#67e8f9",
      surface: "#172030",
      surfaceElevated: "#1D283C",
      surfaceBorder: "#293750",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
    },
    defaultAngle: 120,
    glowColor: "#06b6d4",
    decorativeType: "tech_brackets",
    patternType: "subtle_grid",
    patternOpacity: 0.18,
    keywords: ["devops", "cloud", "infra", "database", "security", "api", "architecture", "microservices"],
  },
  {
    family: "soft_abstract_mesh",
    name: "Velvet Obsidian & Soft Abstract Mesh",
    mode: "dark",
    backgroundStyle: "mesh_gradient",
    baseColors: {
      background: "#0D0B18",
      backgroundSecondary: "#161226",
      primary: "#e879f9",
      secondary: "#38bdf8",
      accent: "#a78bfa",
      accentSecondary: "#f472b6",
      surface: "#1B172E",
      surfaceElevated: "#231E3B",
      surfaceBorder: "#342C56",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
    },
    defaultAngle: 145,
    glowColor: "#e879f9",
    decorativeType: "geometric_circles",
    patternType: "mesh",
    patternOpacity: 0.16,
    keywords: ["creative", "design", "art", "media", "story", "brand", "marketing", "culture"],
  },
  {
    family: "clean_light_blue_pro",
    name: "Crisp Executive Azure & High-Contrast Light",
    mode: "light",
    backgroundStyle: "solid_gradient",
    baseColors: {
      background: "#F0F6FC",
      backgroundSecondary: "#E6EEF8",
      primary: "#1d4ed8",
      secondary: "#0284c7",
      accent: "#059669",
      accentSecondary: "#2563eb",
      surface: "#FFFFFF",
      surfaceElevated: "#F8FAFC",
      surfaceBorder: "#CBD5E1",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
    },
    defaultAngle: 135,
    glowColor: "#93c5fd",
    decorativeType: "accent_rail",
    patternType: "subtle_grid",
    patternOpacity: 0.08,
    keywords: ["healthcare", "clinic", "hospital", "pharma", "formal", "government", "public sector", "clean"],
  },
  {
    family: "warm_editorial",
    name: "Warm Terracotta & Editorial Cream",
    mode: "light",
    backgroundStyle: "editorial",
    baseColors: {
      background: "#FAF7F2",
      backgroundSecondary: "#F2EBE1",
      primary: "#9A3412",
      secondary: "#C2410C",
      accent: "#D97706",
      accentSecondary: "#B45309",
      surface: "#FFFFFF",
      surfaceElevated: "#F5EFE6",
      surfaceBorder: "#E5DCCE",
      textPrimary: "#292524",
      textSecondary: "#78716C",
    },
    defaultAngle: 135,
    glowColor: "#FBBF24",
    decorativeType: "editorial_lines",
    patternType: "editorial_lines",
    patternOpacity: 0.12,
    keywords: ["editorial", "humanities", "publishing", "author", "books", "history", "culture", "warm", "story", "essay"],
  },
  {
    family: "high_contrast_monochrome",
    name: "Stark Monochrome & Electric Lime Accent",
    mode: "dark",
    backgroundStyle: "geometric",
    baseColors: {
      background: "#050505",
      backgroundSecondary: "#121212",
      primary: "#84cc16",
      secondary: "#a3e635",
      accent: "#22c55e",
      accentSecondary: "#eab308",
      surface: "#18181B",
      surfaceElevated: "#27272A",
      surfaceBorder: "#3F3F46",
      textPrimary: "#FAFAFA",
      textSecondary: "#A1A1AA",
    },
    defaultAngle: 120,
    glowColor: "#84cc16",
    decorativeType: "tech_brackets",
    patternType: "subtle_grid",
    patternOpacity: 0.15,
    keywords: ["monochrome", "minimalist", "swiss", "stark", "contrast", "developer", "terminal", "hacker", "hardcore", "code"],
  },
  {
    family: "green_environmental",
    name: "Deep Botanical Forest & Sustainable Sage",
    mode: "dark",
    backgroundStyle: "solid_gradient",
    baseColors: {
      background: "#06130B",
      backgroundSecondary: "#0B1E13",
      primary: "#22c55e",
      secondary: "#16a34a",
      accent: "#86efac",
      accentSecondary: "#4ade80",
      surface: "#0F2A1C",
      surfaceElevated: "#163B27",
      surfaceBorder: "#22593D",
      textPrimary: "#F0FDF4",
      textSecondary: "#86EFAC",
    },
    defaultAngle: 140,
    glowColor: "#22c55e",
    decorativeType: "accent_rail",
    patternType: "mesh",
    patternOpacity: 0.12,
    keywords: ["environment", "green", "sustainability", "climate", "forest", "ecology", "carbon", "renewable", "clean tech", "planet"],
  },
  {
    family: "red_orange_energetic",
    name: "Crimson Magma & High-Energy Vermilion",
    mode: "dark",
    backgroundStyle: "solid_gradient",
    baseColors: {
      background: "#180608",
      backgroundSecondary: "#24090D",
      primary: "#f43f5e",
      secondary: "#fb923c",
      accent: "#ea580c",
      accentSecondary: "#fda4af",
      surface: "#2E0E14",
      surfaceElevated: "#3D131B",
      surfaceBorder: "#5A1B27",
      textPrimary: "#FFF1F2",
      textSecondary: "#FECDD3",
    },
    defaultAngle: 150,
    glowColor: "#f43f5e",
    decorativeType: "corner_frame",
    patternType: "dots",
    patternOpacity: 0.14,
    keywords: ["energy", "action", "launch", "urgent", "sales", "breakthrough", "bold", "dynamic", "speed", "power"],
  },
  {
    family: "purple_creative",
    name: "Deep Amethyst & Cyber Magenta Fusion",
    mode: "dark",
    backgroundStyle: "mesh_gradient",
    baseColors: {
      background: "#110724",
      backgroundSecondary: "#1A0B36",
      primary: "#c084fc",
      secondary: "#e879f9",
      accent: "#f43f5e",
      accentSecondary: "#a855f7",
      surface: "#230F47",
      surfaceElevated: "#2F155E",
      surfaceBorder: "#46208A",
      textPrimary: "#FAF5FF",
      textSecondary: "#E9D5FF",
    },
    defaultAngle: 145,
    glowColor: "#c084fc",
    decorativeType: "geometric_circles",
    patternType: "mesh",
    patternOpacity: 0.16,
    keywords: ["creative", "agency", "branding", "entertainment", "music", "metaverse", "gaming", "creator", "digital art"],
  },
  {
    family: "minimal_white_light_blue",
    name: "Alpine White & Whisper-Frosted Cyan",
    mode: "light",
    backgroundStyle: "solid_gradient",
    baseColors: {
      background: "#FFFFFF",
      backgroundSecondary: "#F1F5F9",
      primary: "#0284c7",
      secondary: "#0ea5e9",
      accent: "#06b6d4",
      accentSecondary: "#38bdf8",
      surface: "#FFFFFF",
      surfaceElevated: "#F8FAFC",
      surfaceBorder: "#E2E8F0",
      textPrimary: "#0F172A",
      textSecondary: "#64748B",
    },
    defaultAngle: 125,
    glowColor: "#38bdf8",
    decorativeType: "editorial_lines",
    patternType: "subtle_grid",
    patternOpacity: 0.06,
    keywords: ["minimal", "white", "clean", "simple", "medical", "clarity", "pure", "scandinavian", "light", "crisp"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. Select Style Family with Recent History Avoidance
// ─────────────────────────────────────────────────────────────────────────────
export function selectStyleFamily(
  seed: string,
  topic: string,
  recentHistory: RecentStyleMetadata[] = recentStylesHistory,
  preferredFamily?: VisualStyleFamily
): StyleFamilyBlueprint {
  if (preferredFamily) {
    const found = STYLE_FAMILIES.find((f) => f.family === preferredFamily);
    if (found) return found;
  }

  const prng = createPrng(seed);
  const lowerTopic = topic.toLowerCase();

  // 1. Gather recently used families (last 3) to prevent consecutive repetition
  const recentlyUsed = new Set(recentHistory.slice(0, 3).map((r) => r.styleFamily));

  // 2. Score families by topic keywords
  const scored = STYLE_FAMILIES.map((fam) => {
    let score = 0;
    fam.keywords.forEach((kw) => {
      if (lowerTopic.includes(kw)) score += 5;
    });
    // Penalize recently used
    if (recentlyUsed.has(fam.family)) {
      score -= 20;
    }
    // Add controlled pseudo-random jitter from seed
    score += prng() * 4;
    return { fam, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].fam;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Perceptual Visual Distinctiveness Validator
// ─────────────────────────────────────────────────────────────────────────────
export interface DistinctivenessResult {
  isDistinct: boolean;
  score: number;
  reasons: string[];
}

export function validateVisualDistinctiveness(
  current: VisualDirection,
  previous?: VisualDirection
): DistinctivenessResult {
  if (!previous) {
    return { isDistinct: true, score: 100, reasons: ["Initial project; guaranteed distinct."] };
  }

  const reasons: string[] = [];
  let score = 0;

  // 1. Style family difference
  if (current.styleFamily !== previous.styleFamily) {
    score += 35;
    reasons.push(`Different style family: ${current.styleFamily} vs ${previous.styleFamily}`);
  }

  // 2. Mode difference (dark vs light)
  if (current.mode !== previous.mode) {
    score += 30;
    reasons.push(`Opposite light/dark mode: ${current.mode} vs ${previous.mode}`);
  }

  // 3. Background style type
  if (current.backgroundStyle !== previous.backgroundStyle) {
    score += 20;
    reasons.push(`Different background archetype: ${current.backgroundStyle} vs ${previous.backgroundStyle}`);
  }

  // 4. Gradient angle difference (> 15 deg)
  const angleDiff = Math.abs(current.gradient.angleDeg - previous.gradient.angleDeg);
  if (angleDiff >= 15) {
    score += 10;
    reasons.push(`Gradient angle divergence: ${current.gradient.angleDeg}° vs ${previous.gradient.angleDeg}°`);
  }

  // 5. Glow position difference
  if (current.glow.position !== previous.glow.position) {
    score += 10;
    reasons.push(`Glow anchor shift: ${current.glow.position} vs ${previous.glow.position}`);
  }

  // 6. Decorative shape style difference
  if (current.decorativeShapes.type !== previous.decorativeShapes.type) {
    score += 10;
    reasons.push(`Decorative geometry shift: ${current.decorativeShapes.type} vs ${previous.decorativeShapes.type}`);
  }

  // 7. Texture pattern shift
  if (current.texturePattern.type !== previous.texturePattern.type) {
    score += 10;
    reasons.push(`Texture pattern shift: ${current.texturePattern.type} vs ${previous.texturePattern.type}`);
  }

  return {
    isDistinct: score >= 45,
    score,
    reasons,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Visual Direction Synthesizer (Single Authoritative Generator)
// ─────────────────────────────────────────────────────────────────────────────
export interface GenerateVisualDirectionOptions {
  preferredFamily?: VisualStyleFamily;
  seed?: string;
  reuseStyle?: VisualDirection;
  recentHistory?: RecentStyleMetadata[];
  previousDirection?: VisualDirection;
}

export function generateVisualDirection(
  topic: string,
  options: GenerateVisualDirectionOptions = {}
): VisualDirection {
  // If user explicitly requested "reuse this style", return a clone with timestamp update
  if (options.reuseStyle) {
    return {
      ...options.reuseStyle,
      generatedAt: new Date().toISOString(),
    };
  }

  let seed = options.seed || generateUniqueSeed(topic);
  let attempts = 0;
  const maxAttempts = 4;
  let bestCandidate: VisualDirection | null = null;
  let bestScore = -1;

  while (attempts < maxAttempts) {
    const prng = createPrng(seed);
    const blueprint = selectStyleFamily(seed, topic, options.recentHistory, options.preferredFamily);

    // Procedural color variations (hue +/- 8deg, sat +/- 6%, lum +/- 4%)
    const deltaH = Math.round((prng() - 0.5) * 16);
    const deltaS = Math.round((prng() - 0.5) * 12);
    const deltaL = Math.round((prng() - 0.5) * 8);

    const bg = adjustHex(blueprint.baseColors.background, deltaH, deltaS, deltaL);
    const bgSec = adjustHex(blueprint.baseColors.backgroundSecondary, deltaH, deltaS, deltaL);
    const primary = adjustHex(blueprint.baseColors.primary, deltaH, deltaS, deltaL);
    const secondary = adjustHex(blueprint.baseColors.secondary, deltaH, deltaS, deltaL);
    const accent = adjustHex(blueprint.baseColors.accent, deltaH, deltaS, deltaL);
    const accentSec = adjustHex(blueprint.baseColors.accentSecondary, deltaH, deltaS, deltaL);
    const surface = adjustHex(blueprint.baseColors.surface, deltaH, deltaS, deltaL);
    const surfaceElevated = adjustHex(blueprint.baseColors.surfaceElevated, deltaH, deltaS, deltaL);
    const surfaceBorder = adjustHex(blueprint.baseColors.surfaceBorder, deltaH, deltaS, deltaL);

    // Procedural gradient angle (default +/- 25deg)
    const angleDeg = Math.round(blueprint.defaultAngle + (prng() - 0.5) * 50);

    // Glow position rotation
    const glowPositions: GlowPosition[] = [
      "bottom_right",
      "top_right",
      "bottom_left",
      "top_left",
      "center",
      "asymmetric",
    ];
    const glowPos = glowPositions[Math.floor(prng() * glowPositions.length)];

    // Gradient stops (2-stop or 3-stop)
    const isThreeStop = prng() > 0.4;
    const gradientStops = isThreeStop
      ? [
          { color: bg, position: 0 },
          { color: bgSec, position: Math.round(45 + prng() * 20) },
          { color: bg, position: 100 },
        ]
      : [
          { color: bg, position: 0 },
          { color: bgSec, position: 100 },
        ];

    const candidate: VisualDirection = {
      id: `vd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      variationSeed: seed,
      styleFamily: blueprint.family,
      styleName: blueprint.name,
      mode: blueprint.mode,
      backgroundStyle: blueprint.backgroundStyle,
      colors: {
        background: bg,
        backgroundSecondary: bgSec,
        primary,
        secondary,
        accent,
        accentSecondary: accentSec,
        surface,
        surfaceElevated,
        surfaceBorder,
        textPrimary: blueprint.baseColors.textPrimary,
        textSecondary: blueprint.baseColors.textSecondary,
      },
      gradient: {
        direction: "to_bottom_right",
        angleDeg,
        stops: gradientStops,
      },
      glow: {
        enabled: true,
        position: glowPos,
        color: blueprint.glowColor,
        secondaryColor: accent,
        blur: Math.round(70 + prng() * 50),
        opacity: Number((0.2 + prng() * 0.15).toFixed(2)),
        scale: Number((0.9 + prng() * 0.4).toFixed(2)),
      },
      decorativeShapes: {
        type: blueprint.decorativeType,
        color: secondary,
        opacity: Number((0.25 + prng() * 0.15).toFixed(2)),
      },
      texturePattern: {
        type: blueprint.patternType,
        opacity: Number((blueprint.patternOpacity + (prng() - 0.5) * 0.04).toFixed(2)),
      },
      borderTreatment: {
        radiusPx: Math.round(12 + prng() * 6),
        widthPx: 1,
        color: surfaceBorder,
        opacity: 0.8,
      },
      imageTreatment: {
        mode: "darkened",
        overlayColor: bg,
        overlayOpacity: 0.65,
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

    const validation = validateVisualDistinctiveness(candidate, options.previousDirection);
    if (validation.isDistinct) {
      recordRecentStyle(candidate);
      return candidate;
    }

    if (validation.score > bestScore) {
      bestScore = validation.score;
      bestCandidate = candidate;
    }

    // Try a different seed for next iteration
    attempts++;
    seed = generateUniqueSeed(`${topic}-v${attempts}`);
  }

  // Fallback to highest scoring candidate if retry limit reached
  const result = bestCandidate || generateFallbackDirection(topic, seed);
  recordRecentStyle(result);
  return result;
}

function generateFallbackDirection(topic: string, seed: string): VisualDirection {
  const bp = STYLE_FAMILIES[0];
  return {
    id: `vd-${Date.now()}-fb`,
    variationSeed: seed,
    styleFamily: bp.family,
    styleName: bp.name,
    mode: bp.mode,
    backgroundStyle: bp.backgroundStyle,
    colors: bp.baseColors,
    gradient: {
      direction: "to_bottom_right",
      angleDeg: bp.defaultAngle,
      stops: [
        { color: bp.baseColors.background, position: 0 },
        { color: bp.baseColors.backgroundSecondary, position: 100 },
      ],
    },
    glow: {
      enabled: true,
      position: "bottom_right",
      color: bp.glowColor,
      blur: 80,
      opacity: 0.25,
      scale: 1,
    },
    decorativeShapes: {
      type: bp.decorativeType,
      color: bp.baseColors.secondary,
      opacity: 0.3,
    },
    texturePattern: {
      type: bp.patternType,
      opacity: bp.patternOpacity,
    },
    borderTreatment: {
      radiusPx: 14,
      widthPx: 1,
      color: bp.baseColors.surfaceBorder,
      opacity: 0.8,
    },
    imageTreatment: {
      mode: "darkened",
      overlayColor: bp.baseColors.background,
      overlayOpacity: 0.65,
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

// ─────────────────────────────────────────────────────────────────────────────
// 9. Visual Direction to ThemeSpec Converter
// ─────────────────────────────────────────────────────────────────────────────
export function visualDirectionToThemeSpec(vd: VisualDirection, modeOverride?: "light" | "dark"): ThemeSpec {
  return {
    mode: modeOverride || vd.mode,
    colors: {
      primary: vd.colors.primary,
      secondary: vd.colors.secondary,
      accent: vd.colors.accent,
      background: vd.colors.background,
      surface: vd.colors.surface,
      textPrimary: vd.colors.textPrimary,
      textSecondary: vd.colors.textSecondary,
      border: vd.colors.surfaceBorder,
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      monoFont: "JetBrains Mono",
      baseSizePx: 16,
    },
    styleTokens: {
      borderRadiusPx: vd.borderTreatment.radiusPx,
      shadow: "lg",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Slide-Level Background Generator (Nuance with Palette Cohesion)
// ─────────────────────────────────────────────────────────────────────────────
export function createSlideBackgroundFromVisualDirection(
  vd: VisualDirection,
  archetype: LayoutArchetype,
  slideIndex: number,
  totalSlides: number = 10
): BackgroundSpec {
  const isHero = slideIndex === 0 || archetype === "hero_title";
  const isClosing = slideIndex === totalSlides - 1 || archetype === "closing_slide";
  const isMetric = archetype === "four_metric_dashboard" || archetype === "big_statistic";
  const isTimeline = archetype === "horizontal_timeline" || archetype === "process_flowchart";
  const isQuote = archetype === "quote_editorial" || archetype === "quote";

  // Slide-Level Variation Rules
  let stops = vd.gradient.stops;
  let glowOpacity = vd.glow.opacity;
  let glowScale = vd.glow.scale;
  let pattern = vd.texturePattern.type;
  let patternOpacity = vd.texturePattern.opacity;
  let decorativeType = vd.decorativeShapes.type;

  if (isHero) {
    // Cover: Strongest depth, prominent glow, mesh overlay
    glowOpacity = Math.min(0.45, vd.glow.opacity * 1.5);
    glowScale = vd.glow.scale * 1.3;
    pattern = vd.texturePattern.type === "none" ? "mesh" : vd.texturePattern.type;
    patternOpacity = Math.min(0.25, vd.texturePattern.opacity * 1.4);
  } else if (isClosing) {
    // Closing: Strong finish, balanced ambient glow, high-contrast framing
    glowOpacity = Math.min(0.35, vd.glow.opacity * 1.2);
    glowScale = vd.glow.scale * 1.15;
  } else if (isMetric) {
    // Metric slides: Accentuated secondary tint, quieter background for KPI focus
    glowOpacity = vd.glow.opacity * 0.9;
    stops = [
      { color: vd.colors.background, position: 0 },
      { color: vd.colors.backgroundSecondary, position: 100 },
    ];
  } else if (isTimeline) {
    // Timeline slides: Directional flow, subtle accent rail
    stops = [
      { color: vd.colors.background, position: 0 },
      { color: vd.colors.backgroundSecondary, position: 100 },
    ];
    decorativeType = "accent_rail";
  } else if (isQuote) {
    // Quote slides: Quieter editorial matte background, high contrast typography
    glowOpacity = vd.glow.opacity * 0.7;
    patternOpacity = vd.texturePattern.opacity * 0.7;
  } else {
    // Standard Content: Restrained background, clear framing
    glowOpacity = vd.glow.opacity * 0.85;
  }

  return {
    type: "gradient",
    color: vd.colors.background,
    gradient: {
      direction: vd.gradient.direction,
      angleDeg: vd.gradient.angleDeg,
      stops,
    },
    pattern,
    patternOpacity,
    glow: {
      enabled: vd.glow.enabled,
      position: vd.glow.position,
      color: vd.glow.color,
      blur: vd.glow.blur,
      opacity: glowOpacity,
      scale: glowScale,
    },
    decorativeShapes: {
      type: decorativeType,
      color: vd.decorativeShapes.color,
      opacity: vd.decorativeShapes.opacity,
    },
  };
}
