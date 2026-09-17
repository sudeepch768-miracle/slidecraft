import {
  AspectRatio,
  PageSpec,
  ContentElement,
} from "@/types/document-spec";
import { ProjectSpec } from "@/types/schemas/project-spec-schemas";
import { SocialConfig, SOCIAL_PLATFORMS } from "./social-types";
import {
  resolveFormatPreset,
  presetToThemeSpec,
  presetToPageBackground,
  presetToVisualDirection,
} from "@/lib/generators/format-design-engine";

export function buildSocialDocumentSpec(config: SocialConfig): ProjectSpec {
  const platformMeta = SOCIAL_PLATFORMS[config.platform] || SOCIAL_PLATFORMS.instagram_post;
  const aspectRatio: AspectRatio = config.aspectRatio || platformMeta.aspectRatio;
  const dimensions = platformMeta.dimensionsPx;

  const formatPreset = resolveFormatPreset("social_media", config.platform);
  const theme = presetToThemeSpec(formatPreset);
  const background = presetToPageBackground(formatPreset);
  const visualDirection = presetToVisualDirection(formatPreset, config.headline || "Social Graphic");

  const elements: ContentElement[] = [
    {
      type: "social_overlay",
      id: "social-overlay-main",
      platform: config.platform,
      headline: config.headline || "Transform Your Workflow With AI",
      subheadline:
        config.subheadline ||
        "Next-generation automated design engine for high-impact visual presentations.",
      callToAction: config.callToAction || "Explore Now ➔",
      handleOrBrand: config.handleOrBrand || "@slidecraft.ai",
      badgeText: config.badgeText || "NEW RELEASE",
      accentColor: formatPreset.colors.secondary,
      safeZonePadding: platformMeta.safeZones,
    },
  ];

  if (config.highlightStats && config.highlightStats.length > 0) {
    config.highlightStats.slice(0, 3).forEach((st, idx) => {
      elements.push({
        type: "metric",
        id: `social-stat-${idx + 1}`,
        value: st.value,
        label: st.label,
        trend: "up",
      });
    });
  }

  const page: PageSpec = {
    id: "social-page-1",
    pageNumber: 1,
    archetype: platformMeta.archetype,
    title: config.headline || "Social Graphic Showcase",
    subtitle: config.subheadline,
    badge: config.badgeText || platformMeta.label.toUpperCase(),
    background,
    backgroundOverride: background.type === "solid" ? background.value : undefined,
    backgroundSpec: {
      type: background.type === "gradient" ? "gradient" : "solid",
      color: background.value,
      glow: background.glow as any,
      decorativeShapes: background.decorativeShapes as any,
    },
    elements,
  };

  return {
    version: "1.0.0",
    documentType: "social_media",
    meta: {
      title: config.headline || "Social Design",
      description: config.subheadline || platformMeta.description,
      author: config.handleOrBrand || "SlideCraft AI",
      tags: ["social", config.platform, "visual-marketing"],
      purpose: platformMeta.description,
    },
    canvas: {
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio,
      unit: "px",
      dpi: 96,
    },
    theme,
    visualDirection,
    pages: [page],
  };
}
