import { AspectRatio, LayoutArchetype } from "@/types/document-spec";

export type SocialPlatform =
  | "instagram_post"
  | "instagram_story"
  | "linkedin_post"
  | "youtube_thumbnail"
  | "twitter_graphic"
  | "whatsapp_status";

export interface SocialPlatformMeta {
  id: SocialPlatform;
  archetype: LayoutArchetype;
  label: string;
  description: string;
  aspectRatio: AspectRatio;
  dimensionsPx: { width: number; height: number };
  safeZones: {
    top: number; // In pixels
    bottom: number;
    left: number;
    right: number;
    notes?: string;
  };
}

export const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialPlatformMeta> = {
  instagram_post: {
    id: "instagram_post",
    archetype: "social_instagram_post",
    label: "Instagram Post (Square)",
    description: "High-contrast square format for feed carousels and announcement graphics",
    aspectRatio: "1:1",
    dimensionsPx: { width: 1080, height: 1080 },
    safeZones: { top: 40, bottom: 40, left: 40, right: 40 },
  },
  instagram_story: {
    id: "instagram_story",
    archetype: "social_instagram_story",
    label: "Instagram Story & Reel",
    description: "Vertical 9:16 format with top header & bottom reply box safe zones",
    aspectRatio: "9:16",
    dimensionsPx: { width: 1080, height: 1920 },
    safeZones: {
      top: 220, // Avoid username / story progress bars
      bottom: 250, // Avoid send message / reaction UI
      left: 60,
      right: 60,
      notes: "Content kept strictly within central zone to avoid UI overlap",
    },
  },
  linkedin_post: {
    id: "linkedin_post",
    archetype: "social_linkedin_post",
    label: "LinkedIn Professional Graphic",
    description: "B2B thought leadership, milestone showcases, and hiring broadcasts",
    aspectRatio: "16:9",
    dimensionsPx: { width: 1920, height: 1080 },
    safeZones: { top: 50, bottom: 50, left: 60, right: 60 },
  },
  youtube_thumbnail: {
    id: "youtube_thumbnail",
    archetype: "social_youtube_thumbnail",
    label: "YouTube Video Thumbnail",
    description: "Ultra-bold 16:9 thumbnail with timestamp badge safe zone protection",
    aspectRatio: "16:9",
    dimensionsPx: { width: 1920, height: 1080 },
    safeZones: {
      top: 40,
      bottom: 120, // Avoid bottom-right video duration timestamp
      left: 60,
      right: 180, // Avoid right-hand overlay controls
      notes: "Bottom-right timestamp badge safe zone protected",
    },
  },
  twitter_graphic: {
    id: "twitter_graphic",
    archetype: "social_twitter_graphic",
    label: "X / Twitter Header & Card",
    description: "Inline feed preview optimized for card previews and timeline scrolling",
    aspectRatio: "16:9",
    dimensionsPx: { width: 1920, height: 1080 },
    safeZones: { top: 40, bottom: 40, left: 50, right: 50 },
  },
  whatsapp_status: {
    id: "whatsapp_status",
    archetype: "social_whatsapp_status",
    label: "WhatsApp Status Update",
    description: "Full-screen vertical broadcast with top header and caption margins",
    aspectRatio: "9:16",
    dimensionsPx: { width: 1080, height: 1920 },
    safeZones: { top: 160, bottom: 180, left: 50, right: 50 },
  },
};

export interface SocialConfig {
  platform: SocialPlatform;
  headline: string;
  subheadline?: string;
  callToAction?: string;
  handleOrBrand?: string;
  badgeText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  aspectRatio?: AspectRatio;
  highlightStats?: Array<{ label: string; value: string }>;
}
