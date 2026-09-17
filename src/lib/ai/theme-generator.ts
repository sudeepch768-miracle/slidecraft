/**
 * theme-generator.ts
 * Derives a visually appropriate, prompt-responsive ThemeSpec from normalized content.
 * 12 domain-matched presets + keyword-based automatic selection.
 * The AI never sees a hardcoded palette — it's chosen dynamically here.
 */
import { ThemeSpec } from "@/types/document-spec";

export interface ThemePreset {
  name: string;
  domains: string[];
  keywords: string[];
  theme: ThemeSpec;
}

export const THEME_PRESETS: ThemePreset[] = [
  // 1. Corporate Finance / Banking
  {
    name: "Corporate Finance",
    domains: ["finance", "banking", "investment", "consulting"],
    keywords: ["finance", "bank", "investment", "revenue", "profit", "portfolio", "hedge", "equity", "fiscal", "quarterly", "annual report", "earnings", "capital", "fund", "investor", "trading", "stock"],
    theme: {
      mode: "light",
      colors: { primary: "#0A2342", secondary: "#C9A84C", accent: "#1B4F8A", background: "#F7F4EF", surface: "#FFFFFF", textPrimary: "#0A2342", textSecondary: "#5A6473", border: "#D5C9B0" },
      typography: { headingFont: "Playfair Display", bodyFont: "Source Sans Pro", monoFont: "Courier Prime", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 4, shadow: "sm" },
    },
  },
  // 2. Technology / SaaS / Startup
  {
    name: "Tech & SaaS",
    domains: ["technology", "software", "saas", "startup", "ai", "cloud"],
    keywords: ["software", "saas", "tech", "api", "cloud", "platform", "startup", "ai", "machine learning", "devops", "kubernetes", "microservices", "backend", "frontend", "react", "node", "python", "infrastructure", "deployment", "ci/cd", "open source"],
    theme: {
      mode: "dark",
      colors: { primary: "#7C3AED", secondary: "#06B6D4", accent: "#10B981", background: "#0F172A", surface: "#1E293B", textPrimary: "#F8FAFC", textSecondary: "#94A3B8", border: "#334155" },
      typography: { headingFont: "Inter", bodyFont: "Inter", monoFont: "JetBrains Mono", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 10, shadow: "md" },
    },
  },
  // 3. Healthcare / Medical
  {
    name: "Healthcare & Medical",
    domains: ["healthcare", "medical", "pharma", "clinical"],
    keywords: ["health", "medical", "patient", "clinical", "hospital", "pharma", "drug", "treatment", "diagnosis", "surgery", "doctor", "nurse", "therapy", "wellness", "care", "medicine", "biotech", "research"],
    theme: {
      mode: "light",
      colors: { primary: "#0C4A6E", secondary: "#0EA5E9", accent: "#22C55E", background: "#F0F9FF", surface: "#FFFFFF", textPrimary: "#0C1E2D", textSecondary: "#475569", border: "#BAE6FD" },
      typography: { headingFont: "Nunito", bodyFont: "Nunito", monoFont: "Courier Prime", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 12, shadow: "sm" },
    },
  },
  // 4. Education / Academic
  {
    name: "Education & Academic",
    domains: ["education", "academic", "university", "research", "school"],
    keywords: ["education", "university", "college", "student", "curriculum", "course", "learn", "academic", "research", "thesis", "paper", "professor", "classroom", "study", "exam", "degree", "faculty", "lecture", "seminar", "campus", "school"],
    theme: {
      mode: "light",
      colors: { primary: "#1E3A5F", secondary: "#E07B39", accent: "#2D9CDB", background: "#FAFAF8", surface: "#FFFFFF", textPrimary: "#1A2332", textSecondary: "#596574", border: "#E0D9CF" },
      typography: { headingFont: "Merriweather", bodyFont: "Lato", monoFont: "Courier Prime", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 6, shadow: "sm" },
    },
  },
  // 5. Creative / Design / Marketing
  {
    name: "Creative & Design",
    domains: ["creative", "design", "marketing", "advertising", "branding"],
    keywords: ["design", "creative", "brand", "marketing", "campaign", "visual", "art", "photography", "portfolio", "advertising", "ux", "ui", "typography", "color", "logo", "agency", "studio", "aesthetic", "editorial"],
    theme: {
      mode: "light",
      colors: { primary: "#E91E8C", secondary: "#7C3AED", accent: "#F59E0B", background: "#FEFEFE", surface: "#FFFFFF", textPrimary: "#1A1A2E", textSecondary: "#6B7280", border: "#F3E8FF" },
      typography: { headingFont: "Raleway", bodyFont: "Poppins", monoFont: "JetBrains Mono", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 16, shadow: "lg" },
    },
  },
  // 6. Corporate / Enterprise / Professional
  {
    name: "Corporate Professional",
    domains: ["corporate", "enterprise", "business", "consulting", "management"],
    keywords: ["corporate", "enterprise", "business", "management", "executive", "strategy", "operations", "leadership", "board", "stakeholder", "quarterly", "annual", "kpi", "roadmap", "vision", "mission", "governance", "compliance", "procurement"],
    theme: {
      mode: "light",
      colors: { primary: "#002050", secondary: "#0078D4", accent: "#107C41", background: "#F3F4F6", surface: "#FFFFFF", textPrimary: "#1F2937", textSecondary: "#4B5563", border: "#D1D5DB" },
      typography: { headingFont: "Segoe UI", bodyFont: "Segoe UI", monoFont: "Consolas", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 6, shadow: "sm" },
    },
  },
  // 7. Science / Engineering / Research
  {
    name: "Science & Engineering",
    domains: ["science", "engineering", "research", "laboratory"],
    keywords: ["science", "engineering", "research", "laboratory", "experiment", "data", "analysis", "hypothesis", "methodology", "results", "conclusion", "physics", "chemistry", "biology", "mathematics", "algorithm", "formula", "simulation", "model"],
    theme: {
      mode: "light",
      colors: { primary: "#1A3C5E", secondary: "#2D8B57", accent: "#D97706", background: "#F8FAFB", surface: "#FFFFFF", textPrimary: "#111827", textSecondary: "#4B5563", border: "#D1E5D8" },
      typography: { headingFont: "IBM Plex Sans", bodyFont: "IBM Plex Sans", monoFont: "IBM Plex Mono", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 4, shadow: "sm" },
    },
  },
  // 8. Events / Festivals / Entertainment
  {
    name: "Events & Entertainment",
    domains: ["event", "festival", "entertainment", "music", "conference"],
    keywords: ["event", "festival", "conference", "concert", "show", "hackathon", "workshop", "meetup", "summit", "expo", "party", "celebration", "cultural", "annual", "fest", "gala", "award", "ceremony", "launch"],
    theme: {
      mode: "dark",
      colors: { primary: "#F59E0B", secondary: "#EF4444", accent: "#8B5CF6", background: "#0F0F1A", surface: "#1A1A2E", textPrimary: "#FAFAFA", textSecondary: "#A1A1AA", border: "#2D2D4A" },
      typography: { headingFont: "Montserrat", bodyFont: "Open Sans", monoFont: "JetBrains Mono", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 12, shadow: "lg" },
    },
  },
  // 9. Environment / Sustainability / NGO
  {
    name: "Environment & Sustainability",
    domains: ["environment", "sustainability", "ngo", "nonprofit"],
    keywords: ["environment", "sustainability", "green", "climate", "carbon", "renewable", "energy", "eco", "forest", "ocean", "wildlife", "conservation", "ngo", "nonprofit", "social impact", "awareness", "campaign"],
    theme: {
      mode: "light",
      colors: { primary: "#14532D", secondary: "#15803D", accent: "#CA8A04", background: "#F0FDF4", surface: "#FFFFFF", textPrimary: "#052E16", textSecondary: "#166534", border: "#BBF7D0" },
      typography: { headingFont: "Nunito", bodyFont: "Nunito", monoFont: "Courier Prime", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 10, shadow: "md" },
    },
  },
  // 10. Minimal / Editorial / Portfolio
  {
    name: "Minimal Editorial",
    domains: ["minimal", "editorial", "portfolio", "personal"],
    keywords: ["minimal", "clean", "portfolio", "resume", "personal", "introduction", "about", "cv", "profile", "story", "journey", "experience", "skill", "project", "showcase"],
    theme: {
      mode: "light",
      colors: { primary: "#18181B", secondary: "#71717A", accent: "#3B82F6", background: "#FFFFFF", surface: "#FAFAFA", textPrimary: "#09090B", textSecondary: "#71717A", border: "#E4E4E7" },
      typography: { headingFont: "Plus Jakarta Sans", bodyFont: "Inter", monoFont: "JetBrains Mono", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 8, shadow: "sm" },
    },
  },
  // 11. Futuristic / AI / Deep Tech
  {
    name: "Futuristic Deep Tech",
    domains: ["ai", "deeptech", "blockchain", "robotics", "space"],
    keywords: ["ai", "artificial intelligence", "neural", "blockchain", "crypto", "robotics", "automation", "autonomous", "space", "quantum", "future", "next-gen", "innovation", "disruption", "deep tech", "generative"],
    theme: {
      mode: "dark",
      colors: { primary: "#00D4FF", secondary: "#7C3AED", accent: "#10B981", background: "#020817", surface: "#0D1B2A", textPrimary: "#E2E8F0", textSecondary: "#64748B", border: "#1E3A5F" },
      typography: { headingFont: "Exo 2", bodyFont: "Rajdhani", monoFont: "Share Tech Mono", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 6, shadow: "lg" },
    },
  },
  // 12. Luxury Black & Gold
  {
    name: "Luxury Black & Gold",
    domains: ["luxury", "real_estate", "hospitality", "private_equity"],
    keywords: ["luxury", "gold", "black and gold", "premium", "prestige", "vip", "high-end", "bespoke", "wealth", "private banking", "couture", "champagne"],
    theme: {
      mode: "dark",
      colors: {
        primary: "#D4AF37",
        secondary: "#C5A059",
        accent: "#F59E0B",
        background: "#0C0A09",
        surface: "#1C1917",
        textPrimary: "#FAF5EF",
        textSecondary: "#A8A29E",
        border: "#292524",
      },
      typography: { headingFont: "Playfair Display", bodyFont: "Source Sans Pro", monoFont: "JetBrains Mono", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 4, shadow: "sm" },
    },
  },
  // 13. Children's Educational
  {
    name: "Children's Educational",
    domains: ["children", "kindergarten", "early_learning", "playful"],
    keywords: ["children", "kids", "kindergarten", "story", "playful", "fun", "preschool", "coloring", "cartoons", "nursery", "elementary"],
    theme: {
      mode: "light",
      colors: {
        primary: "#0284C7",
        secondary: "#FACC15",
        accent: "#22C55E",
        background: "#FEFCE8",
        surface: "#FFFFFF",
        textPrimary: "#1E293B",
        textSecondary: "#475569",
        border: "#FDE047",
      },
      typography: { headingFont: "Nunito", bodyFont: "Nunito", monoFont: "JetBrains Mono", baseSizePx: 17 },
      styleTokens: { borderRadiusPx: 20, shadow: "md" },
    },
  },
  // 14. Editorial Magazine Style
  {
    name: "Editorial Magazine",
    domains: ["magazine", "publishing", "journalism", "culture"],
    keywords: ["magazine", "editorial", "journalism", "article", "curated", "feature story", "monocle", "vogue", "new yorker", "literary"],
    theme: {
      mode: "light",
      colors: {
        primary: "#1C1917",
        secondary: "#DC2626",
        accent: "#78716C",
        background: "#FDFBF7",
        surface: "#FFFFFF",
        textPrimary: "#1C1917",
        textSecondary: "#57534E",
        border: "#E7E5E4",
      },
      typography: { headingFont: "Playfair Display", bodyFont: "Source Sans Pro", monoFont: "Courier Prime", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 0, shadow: "none" },
    },
  },
  // 15. Futuristic Neon Tech
  {
    name: "Futuristic Neon",
    domains: ["cyberpunk", "neon", "gaming", "esports", "future"],
    keywords: ["neon", "cyberpunk", "futuristic", "cyber", "glow", "synthwave", "hacker", "terminal", "matrix", "arcade"],
    theme: {
      mode: "dark",
      colors: {
        primary: "#00F0FF",
        secondary: "#FF0055",
        accent: "#FFE600",
        background: "#050814",
        surface: "#0D1326",
        textPrimary: "#F0F6FC",
        textSecondary: "#7D8590",
        border: "#1F2942",
      },
      typography: { headingFont: "JetBrains Mono", bodyFont: "Inter", monoFont: "JetBrains Mono", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 8, shadow: "lg" },
    },
  },
  // 16. Default — Versatile Professional
  {
    name: "Versatile Professional",
    domains: [],
    keywords: [],
    theme: {
      mode: "light",
      colors: { primary: "#1E293B", secondary: "#3B82F6", accent: "#F59E0B", background: "#F8FAFC", surface: "#FFFFFF", textPrimary: "#0F172A", textSecondary: "#64748B", border: "#E2E8F0" },
      typography: { headingFont: "Plus Jakarta Sans", bodyFont: "Inter", monoFont: "JetBrains Mono", baseSizePx: 16 },
      styleTokens: { borderRadiusPx: 10, shadow: "md" },
    },
  },
];

/** Font pairings that can be applied by detected style */
export const FONT_PAIRINGS: Record<string, { heading: string; body: string }> = {
  formal: { heading: "Playfair Display", body: "Source Sans Pro" },
  academic: { heading: "Merriweather", body: "Lato" },
  corporate: { heading: "Segoe UI", body: "Segoe UI" },
  modern: { heading: "Plus Jakarta Sans", body: "Inter" },
  creative: { heading: "Raleway", body: "Poppins" },
  tech: { heading: "Inter", body: "Inter" },
  minimal: { heading: "Plus Jakarta Sans", body: "Inter" },
  bold: { heading: "Montserrat", body: "Open Sans" },
};

/**
 * Selects the best theme preset by matching prompt text against domain keywords.
 * Falls back to "Versatile Professional" if no strong match found.
 */
export function selectThemeFromPrompt(
  promptText: string,
  detectedDomain?: string
): ThemeSpec {
  const lower = promptText.toLowerCase();

  let bestMatch: ThemePreset | null = null;
  let bestScore = 0;

  for (const preset of THEME_PRESETS) {
    // Skip the default fallback in scoring
    if (preset.keywords.length === 0) continue;

    let score = 0;

    // Domain override
    if (detectedDomain && preset.domains.includes(detectedDomain)) {
      score += 10;
    }

    // Keyword matching
    for (const kw of preset.keywords) {
      if (lower.includes(kw)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = preset;
    }
  }

  // Require at least 1 keyword match to use a specific preset
  if (!bestMatch || bestScore === 0) {
    return THEME_PRESETS[THEME_PRESETS.length - 1].theme; // default
  }

  return bestMatch.theme;
}

/**
 * Detects the design domain from raw prompt text.
 * Returns a domain string that helps theme and layout selection.
 */
export function detectPromptDomain(text: string): string {
  const lower = text.toLowerCase();

  if (/\b(luxury|gold|black and gold|prestige|vip|wealth|bespoke|couture)\b/.test(lower)) return "luxury";
  if (/\b(children|kids|kindergarten|preschool|elementary|playful)\b/.test(lower)) return "children";
  if (/\b(magazine|editorial|journalism|article|curated|publication)\b/.test(lower)) return "magazine";
  if (/\b(neon|cyberpunk|synthwave|arcade|terminal|matrix|futuristic)\b/.test(lower)) return "cyberpunk";
  if (/\b(finance|banking|investment|revenue|profit|equity|fund|capital|fiscal)\b/.test(lower)) return "finance";
  if (/\b(health|medical|patient|clinical|pharma|doctor|surgery|therapy|wellness)\b/.test(lower)) return "healthcare";
  if (/\b(university|college|student|academic|curriculum|thesis|professor|lecture|school)\b/.test(lower)) return "education";
  if (/\b(design|creative|brand|marketing|campaign|photography|portfolio|agency|ux|ui)\b/.test(lower)) return "creative";
  if (/\b(saas|software|platform|cloud|api|devops|kubernetes|microservice|deployment|backend|frontend)\b/.test(lower)) return "technology";
  if (/\b(ai|artificial intelligence|neural|blockchain|robotics|autonomous|quantum|generative)\b/.test(lower)) return "ai";
  if (/\b(event|festival|conference|concert|hackathon|workshop|meetup|summit|expo|celebration)\b/.test(lower)) return "event";
  if (/\b(environment|sustainability|green|climate|carbon|renewable|eco|conservation|ngo)\b/.test(lower)) return "environment";
  if (/\b(science|engineering|laboratory|experiment|hypothesis|physics|chemistry|algorithm|simulation)\b/.test(lower)) return "science";
  if (/\b(corporate|enterprise|strategy|operations|governance|compliance|procurement|executive|board)\b/.test(lower)) return "corporate";

  return "general";
}

/**
 * Detects the intended design tone from prompt vocabulary.
 */
export function detectPromptTone(text: string): string {
  const lower = text.toLowerCase();

  if (/\b(academic|research|scholarly|scientific|peer|rigorous|systematic|thesis|dissertation)\b/.test(lower)) return "academic";
  if (/\b(creative|artistic|expressive|vibrant|colorful|bold|unconventional)\b/.test(lower)) return "creative";
  if (/\b(tech|technical|engineering|developer|code|system|architecture|infrastructure)\b/.test(lower)) return "tech";
  if (/\b(minimal|clean|simple|elegant|understated|whitespace)\b/.test(lower)) return "minimal";
  if (/\b(formal|official|professional|executive|corporate|serious|authoritative)\b/.test(lower)) return "formal";
  if (/\b(bold|impactful|high.energy|loud|dynamic|exciting|powerful)\b/.test(lower)) return "bold";
  if (/\b(startup|pitch|investor|venture|seed|growth|scale)\b/.test(lower)) return "modern";

  return "modern";
}

/**
 * Detects the intended visual density from prompt cues.
 */
export function detectContentDensity(text: string): "light" | "balanced" | "dense" {
  const wordCount = text.split(/\s+/).length;
  const hasDetailKeywords = /\b(detailed|comprehensive|thorough|in-depth|complete|full|extensive)\b/i.test(text);
  const hasSimpleKeywords = /\b(simple|brief|quick|overview|summary|high.level|short)\b/i.test(text);

  if (hasSimpleKeywords || wordCount < 30) return "light";
  if (hasDetailKeywords || wordCount > 200) return "dense";
  return "balanced";
}
