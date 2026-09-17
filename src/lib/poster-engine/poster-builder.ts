import {
  DocumentSpec,
  PageSpec,
  ContentElement,
  CANVAS_PRESETS,
  ThemeSpec,
  AspectRatio,
} from "@/types/document-spec";
import {
  PosterConfig,
  PosterMood,
  PosterTypographyStyle,
  POSTER_CATEGORIES,
  POSTER_MOOD_PALETTES,
  POSTER_TYPOGRAPHY_STYLES,
} from "./poster-types";
import {
  resolveFormatPreset,
  presetToThemeSpec,
  presetToPageBackground,
  presetToVisualDirection,
} from "@/lib/generators/format-design-engine";

export { POSTER_MOOD_PALETTES, POSTER_TYPOGRAPHY_STYLES };

/**
 * Builds a deterministic, production-ready Poster DocumentSpec
 */
export function buildPosterDocumentSpec(config: PosterConfig): DocumentSpec {
  const categoryMeta = POSTER_CATEGORIES[config.posterType] || POSTER_CATEGORIES.college_event;
  const aspectRatio: AspectRatio = config.dimensions || categoryMeta.suggestedAspectRatio;
  const preset = CANVAS_PRESETS[aspectRatio] || CANVAS_PRESETS["A4_portrait"];

  const mood = config.designMood || categoryMeta.defaultMood;
  const formatPreset = resolveFormatPreset("poster", mood);
  const theme = presetToThemeSpec(formatPreset);
  const background = presetToPageBackground(formatPreset);
  const visualDirection = presetToVisualDirection(formatPreset, config.title);

  const elements: ContentElement[] = [];

  // 1. Hero Title & Subtitle text blocks
  elements.push({
    type: "text",
    id: "poster-title",
    variant: "h1",
    content: config.title,
    align: "center",
  });

  if (config.subtitle) {
    elements.push({
      type: "text",
      id: "poster-subtitle",
      variant: "subtitle",
      content: config.subtitle,
      align: "center",
    });
  }

  // 2. Event Details Block (Date, Time, Venue)
  if (config.eventDate || config.eventVenue) {
    elements.push({
      type: "event_details",
      id: "poster-event-details",
      date: config.eventDate || "Upcoming Date",
      time: config.eventTime || "10:00 AM - 5:00 PM",
      venue: config.eventVenue || "Campus Auditorium / Live Stream",
      price: config.pricingOrFee || "Free Registration",
    });
  }

  // 3. Highlight Metrics or Features
  if (config.highlights && config.highlights.length > 0) {
    config.highlights.slice(0, 3).forEach((h, idx) => {
      let value = `0${idx + 1}`;
      let label = h;
      if (h.includes(":")) {
        const parts = h.split(":");
        value = parts[0].trim();
        label = parts[1].trim();
      } else {
        const match = h.match(/^([$€£¥]?[\d,.]+[kKmMbB%+]*)\s+(.*)$/);
        if (match) {
          value = match[1];
          label = match[2];
        } else {
          value = `0${idx + 1}`;
          label = h;
        }
      }
      elements.push({
        type: "metric",
        id: `poster-metric-${idx + 1}`,
        value,
        label,
      });
    });
  } else if (config.posterType === "hackathon") {
    elements.push(
      { type: "metric", id: "m1", value: "$10,000+", label: "Cash & Tech Prize Pool" },
      { type: "metric", id: "m2", value: "36 Hours", label: "Continuous Sprint" },
      { type: "metric", id: "m3", value: "Global", label: "Developer Community" }
    );
  }

  // 4. Keynote Speakers / Mentors
  if (config.speakers && config.speakers.length > 0) {
    config.speakers.slice(0, 3).forEach((spk, idx) => {
      elements.push({
        type: "speaker_card",
        id: `poster-speaker-${idx + 1}`,
        name: spk.name,
        title: spk.title,
        company: spk.company,
        avatarUrl: spk.avatarUrl,
      });
    });
  }

  // 5. Sponsors Grid (for Hackathons and Expos)
  if (config.sponsors && config.sponsors.length > 0) {
    elements.push({
      type: "sponsor_grid",
      id: "poster-sponsors",
      title: "Featured Partners",
      sponsors: config.sponsors,
    });
  }

  // 6. Call to Action Badge
  elements.push({
    type: "cta_badge",
    id: "poster-cta",
    variant: "primary",
    text: config.callToActionText || "Register Now",
    link: config.callToActionUrl || config.qrUrl || "https://slidecraft.ai/event",
  });

  // 7. QR Code Area
  if (config.qrUrl) {
    elements.push({
      type: "qrcode",
      id: "poster-qrcode",
      url: config.qrUrl,
      label: config.qrScanHint || "Scan to Register",
      scanHint: "Instant RSVP & Ticket Pass",
      sizePx: 140,
      position: "bottom_right",
    });
  }

  // 8. Organizer Contact Info
  if (config.organizerName || config.contactEmail || config.website) {
    elements.push({
      type: "organizer_info",
      id: "poster-organizer-info",
      organization: config.organizerName || "SlideCraft Events Committee",
      contactEmail: config.contactEmail || "events@slidecraft.ai",
      contactPhone: config.contactPhone,
      website: config.website || "www.slidecraft.ai",
      socialHandles: ["@SlideCraftAI"],
    });
  }

  const page: PageSpec = {
    id: "poster-page-1",
    pageNumber: 1,
    archetype: categoryMeta.archetype,
    title: config.title,
    subtitle: config.subtitle,
    badge: config.badge || categoryMeta.label.toUpperCase(),
    background,
    backgroundOverride: background.type === "solid" ? background.value : undefined,
    backgroundSpec: {
      type: background.type === "gradient" ? "gradient" : "solid",
      color: background.value,
      glow: background.glow as any,
      decorativeShapes: background.decorativeShapes as any,
    },
    notes: `Poster presentation notes: Target audience for ${categoryMeta.label}. Key date: ${config.eventDate || "TBA"} at ${config.eventVenue || "TBA"}.`,
    elements,
  };

  return {
    version: "1.0.0",
    documentType: "poster",
    meta: {
      title: config.title,
      description: config.subtitle || `${categoryMeta.label} Poster`,
      author: config.organizerName || "SlideCraft AI",
      tags: ["poster", config.posterType, mood],
      designStyle: mood === "dark_cyberpunk" ? "dark_technology" : mood === "academic_scholarly" ? "modern_academic" : "corporate",
    },
    canvas: {
      width: preset.width,
      height: preset.height,
      aspectRatio,
      unit: "px",
      dpi: 96,
    },
    theme,
    visualDirection,
    pages: [page],
  };
}
