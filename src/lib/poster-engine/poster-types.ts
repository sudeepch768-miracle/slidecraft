import { AspectRatio, LayoutArchetype, ThemeSpec } from "@/types/document-spec";

export type PosterCategory =
  | "college_event"
  | "workshop"
  | "seminar"
  | "hackathon"
  | "research_poster"
  | "project_exhibition"
  | "product_promotion"
  | "awareness_campaign"
  | "social_announcement";

export type PosterMood =
  | "vibrant_modern"
  | "academic_scholarly"
  | "dark_cyberpunk"
  | "minimalist_editorial"
  | "corporate_clean"
  | "retro_bold"
  | "startup_pitch";

export type PosterTypographyStyle =
  | "modern_sans"
  | "bold_display"
  | "elegant_serif"
  | "tech_mono";

export interface PosterCategoryMeta {
  id: PosterCategory;
  archetype: LayoutArchetype;
  label: string;
  description: string;
  suggestedAspectRatio: AspectRatio;
  defaultMood: PosterMood;
}

export const POSTER_CATEGORIES: Record<PosterCategory, PosterCategoryMeta> = {
  college_event: {
    id: "college_event",
    archetype: "college_event_poster",
    label: "College Event & Fest",
    description: "Cultural festivals, inter-collegiate summits, concerts, and campus activities",
    suggestedAspectRatio: "A4_portrait",
    defaultMood: "vibrant_modern",
  },
  workshop: {
    id: "workshop",
    archetype: "workshop_poster",
    label: "Workshop & Hands-On Lab",
    description: "Technical training, skill bootcamps, masterclasses, and hands-on tutorials",
    suggestedAspectRatio: "A4_portrait",
    defaultMood: "corporate_clean",
  },
  seminar: {
    id: "seminar",
    archetype: "seminar_poster",
    label: "Academic Seminar & Keynote",
    description: "Scholarly lectures, department seminars, research talks, and symposiums",
    suggestedAspectRatio: "A4_portrait",
    defaultMood: "academic_scholarly",
  },
  hackathon: {
    id: "hackathon",
    archetype: "hackathon_poster",
    label: "Hackathon & Code Sprint",
    description: "Competitive hackathons, prize pool showcases, coding tournaments, and tracks",
    suggestedAspectRatio: "A4_portrait",
    defaultMood: "dark_cyberpunk",
  },
  research_poster: {
    id: "research_poster",
    archetype: "research_poster",
    label: "Research & Scientific Poster",
    description: "Academic conference posters with abstract, methodology, charts, and findings",
    suggestedAspectRatio: "A3_landscape",
    defaultMood: "academic_scholarly",
  },
  project_exhibition: {
    id: "project_exhibition",
    archetype: "project_exhibition_poster",
    label: "Project Exhibition & Expo",
    description: "Student capstone projects, engineering expos, prototype demonstrations",
    suggestedAspectRatio: "A4_portrait",
    defaultMood: "vibrant_modern",
  },
  product_promotion: {
    id: "product_promotion",
    archetype: "product_promotion_poster",
    label: "Product Promotion & Launch",
    description: "New product reveals, promotional campaigns, seasonal sales, feature highlights",
    suggestedAspectRatio: "A4_portrait",
    defaultMood: "startup_pitch",
  },
  awareness_campaign: {
    id: "awareness_campaign",
    archetype: "awareness_campaign_poster",
    label: "Awareness & Public Health",
    description: "Social causes, community awareness, environmental initiatives, civic campaigns",
    suggestedAspectRatio: "A4_portrait",
    defaultMood: "minimalist_editorial",
  },
  social_announcement: {
    id: "social_announcement",
    archetype: "social_announcement_poster",
    label: "Social Announcement",
    description: "Compact Instagram/LinkedIn announcements, quick bulletins, club updates",
    suggestedAspectRatio: "1:1",
    defaultMood: "vibrant_modern",
  },
};

export const POSTER_MOOD_PALETTES: Record<PosterMood, ThemeSpec["colors"]> = {
  vibrant_modern: {
    primary: "#0F172A",
    secondary: "#6366F1", // Indigo
    accent: "#EC4899", // Pink
    background: "#F8FAFC",
    surface: "#FFFFFF",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
  },
  academic_scholarly: {
    primary: "#1E293B",
    secondary: "#1E3A8A", // Deep Navy
    accent: "#B91C1C", // Crimson
    background: "#FFFFFF",
    surface: "#F8FAFC",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    border: "#CBD5E1",
  },
  dark_cyberpunk: {
    primary: "#F8FAFC",
    secondary: "#38BDF8", // Neon Cyan
    accent: "#A855F7", // Neon Purple
    background: "#090D16", // Deep Dark Space
    surface: "#111827",
    textPrimary: "#F9FAFB",
    textSecondary: "#9CA3AF",
    border: "#1F2937",
  },
  minimalist_editorial: {
    primary: "#09090B",
    secondary: "#18181B",
    accent: "#71717A",
    background: "#FFFFFF",
    surface: "#FAFAFA",
    textPrimary: "#09090B",
    textSecondary: "#52525B",
    border: "#E4E4E7",
  },
  corporate_clean: {
    primary: "#0F172A",
    secondary: "#2563EB", // Royal Blue
    accent: "#10B981", // Emerald
    background: "#F8FAFC",
    surface: "#FFFFFF",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
  },
  retro_bold: {
    primary: "#18181B",
    secondary: "#EA580C", // Retro Orange
    accent: "#EAB308", // Golden Yellow
    background: "#FFFBEB", // Warm cream
    surface: "#FFFFFF",
    textPrimary: "#18181B",
    textSecondary: "#78716C",
    border: "#FDE68A",
  },
  startup_pitch: {
    primary: "#0F172A",
    secondary: "#4F46E5", // Electric Violet
    accent: "#F43F5E", // Rose
    background: "#FAFAFA",
    surface: "#FFFFFF",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
  },
};

export const POSTER_TYPOGRAPHY_STYLES: Record<
  PosterTypographyStyle,
  ThemeSpec["typography"]
> = {
  modern_sans: {
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
    baseSizePx: 16,
  },
  bold_display: {
    headingFont: "Montserrat",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
    baseSizePx: 16,
  },
  elegant_serif: {
    headingFont: "Playfair Display",
    bodyFont: "Georgia",
    monoFont: "Courier New",
    baseSizePx: 16,
  },
  tech_mono: {
    headingFont: "Space Grotesk",
    bodyFont: "JetBrains Mono",
    monoFont: "JetBrains Mono",
    baseSizePx: 15,
  },
};

export interface PosterConfig {
  posterType: PosterCategory;
  title: string;
  subtitle?: string;
  badge?: string;
  dimensions: AspectRatio;
  designMood?: PosterMood;
  typographyStyle?: PosterTypographyStyle;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  qrUrl?: string;
  qrScanHint?: string;
  organizerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  speakers?: Array<{ name: string; title: string; company?: string; avatarUrl?: string }>;
  sponsors?: Array<{ name: string; tier: "title" | "platinum" | "gold" | "silver" }>;
  highlights?: string[];
  callToActionText?: string;
  callToActionUrl?: string;
  pricingOrFee?: string;
}
