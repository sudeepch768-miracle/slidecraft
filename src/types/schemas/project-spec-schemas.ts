import { z } from "zod";
import {
  DocumentTypeSchema,
  AspectRatioSchema,
  LayoutArchetypeSchema,
  ThemeSpecSchema,
  PageSpecSchema,
  TextElementSchema,
  MetricCardSchema,
  ChartElementSchema,
  DiagramElementSchema,
  TableElementSchema,
  ShapeElementSchema,
  ListElementSchema,
  MediaElementSchema,
  VisualDirectionSchema,
} from "../document-spec";

// 1. Design Tokens Schema
export const DesignTokensSchema = z.object({
  colors: z.object({
    primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid HEX color required"),
    secondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    accent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    background: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    surface: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    textPrimary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    textSecondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    border: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  }),
  typography: z.object({
    headingFont: z.string().default("Plus Jakarta Sans"),
    bodyFont: z.string().default("Inter"),
    monoFont: z.string().default("JetBrains Mono"),
    scaleRatio: z.number().default(1.25),
    baseSizePx: z.number().default(16),
  }),
  spacing: z.object({
    pagePaddingPx: z.number().default(48),
    elementGapPx: z.number().default(24),
    sectionGapPx: z.number().default(36),
  }).default({}),
  styleTokens: z.object({
    borderRadiusPx: z.number().default(12),
    shadow: z.enum(["none", "sm", "md", "lg"]).default("md"),
    borderWidthPx: z.number().default(1),
  }).default({}),
});
export type DesignTokens = z.infer<typeof DesignTokensSchema>;

// 2. Layout Elements & Placement
export const LayoutElementSchema = z.object({
  id: z.string(),
  box: z.object({
    x: z.number().describe("X coordinate in pixels"),
    y: z.number().describe("Y coordinate in pixels"),
    width: z.number().describe("Width in pixels"),
    height: z.number().describe("Height in pixels"),
  }).optional(),
  padding: z.number().default(16),
  align: z.enum(["left", "center", "right", "justify"]).default("left"),
  zIndex: z.number().default(1),
});
export type LayoutElement = z.infer<typeof LayoutElementSchema>;

// 3. Text Blocks
export const TextBlockSchema = TextElementSchema.extend({
  fontSizePx: z.number().optional(),
  fontWeight: z.enum(["normal", "medium", "semibold", "bold", "extrabold"]).default("normal"),
  lineHeight: z.number().default(1.5),
});
export type TextBlock = z.infer<typeof TextBlockSchema>;

// 4. Images & Visual Media
export const ImageElementSchema = z.object({
  type: z.literal("media"),
  id: z.string(),
  mediaType: z.enum(["image", "icon", "illustration"]).default("image"),
  url: z.string().url().optional(),
  alt: z.string().default("Visual media asset"),
  caption: z.string().optional(),
  aspectRatio: z.enum(["16:9", "4:3", "1:1", "original"]).default("16:9"),
  objectFit: z.enum(["cover", "contain", "fill"]).default("cover"),
});
export type ImageElement = z.infer<typeof ImageElementSchema>;

// 5. Export Settings
export const ExportSettingsSchema = z.object({
  targetFormat: z.enum(["pptx", "json", "pdf", "png", "docx"]),
  resolutionDpi: z.number().default(96),
  includeSpeakerNotes: z.boolean().default(true),
  embedFonts: z.boolean().default(true),
  vectorPreservation: z.boolean().default(true),
});
export type ExportSettings = z.infer<typeof ExportSettingsSchema>;

// 6. Project Specification (Base Root Schema)
export const ProjectSpecSchema = z.object({
  version: z.literal("1.0.0"),
  documentType: DocumentTypeSchema,
  meta: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    author: z.string().default("SlideCraft AI"),
    tags: z.array(z.string()).default([]),
    audience: z.string().optional(),
    purpose: z.string().optional(),
  }),
  canvas: z.object({
    width: z.number(),
    height: z.number(),
    aspectRatio: AspectRatioSchema,
    unit: z.enum(["px", "pt", "in"]).default("px"),
    dpi: z.number().default(96),
  }),
  theme: ThemeSpecSchema,
  visualDirection: VisualDirectionSchema.optional(),
  pages: z.array(PageSpecSchema).min(1),
  exportSettings: ExportSettingsSchema.optional(),
});
export type ProjectSpec = z.infer<typeof ProjectSpecSchema>;

// 7. Format-Specific Specifications (Enforcing Type & Aspect Ratio Alignment)

// Presentation (16:9 or 4:3 pitch decks with notes and slides)
export const PresentationSpecSchema = ProjectSpecSchema.extend({
  documentType: z.literal("presentation"),
  canvas: z.object({
    width: z.number().default(1920),
    height: z.number().default(1080),
    aspectRatio: z.enum(["16:9", "4:3"]).default("16:9"),
    unit: z.enum(["px", "pt", "in"]).default("px"),
    dpi: z.number().default(96),
  }),
  pages: z.array(PageSpecSchema).min(1).max(25),
});
export type PresentationSpec = z.infer<typeof PresentationSpecSchema>;

// Poster (A-series paper sizes or social display banners)
export const PosterSpecSchema = ProjectSpecSchema.extend({
  documentType: z.literal("poster"),
  canvas: z.object({
    width: z.number().default(1240),
    height: z.number().default(1754),
    aspectRatio: z.enum([
      "A4_portrait",
      "A4_landscape",
      "A3_portrait",
      "A3_landscape",
      "A2_portrait",
      "A1_portrait",
      "1:1",
      "9:16",
      "4:5",
      "16:9",
    ]).default("A4_portrait"),
    unit: z.enum(["px", "pt", "in"]).default("px"),
    dpi: z.number().default(96),
  }),
  pages: z.array(PageSpecSchema).min(1).max(5),
});
export type PosterSpec = z.infer<typeof PosterSpecSchema>;

// Infographic (9:16 vertical data storytelling or A4/16:9)
export const InfographicSpecSchema = ProjectSpecSchema.extend({
  documentType: z.literal("infographic"),
  canvas: z.object({
    width: z.number().default(1080),
    height: z.number().default(1920),
    aspectRatio: z.enum(["9:16", "A4_portrait", "16:9"]).default("9:16"),
    unit: z.enum(["px", "pt", "in"]).default("px"),
    dpi: z.number().default(96),
  }),
  pages: z.array(PageSpecSchema).min(1).max(5),
});
export type InfographicSpec = z.infer<typeof InfographicSpecSchema>;

// Social Design (1:1 square, 9:16 story/reels, 4:5 portrait, or 16:9 landscape)
export const SocialDesignSpecSchema = ProjectSpecSchema.extend({
  documentType: z.literal("social_media"),
  canvas: z.object({
    width: z.number().default(1080),
    height: z.number().default(1080),
    aspectRatio: z.enum(["1:1", "9:16", "4:5", "16:9"]).default("1:1"),
    unit: z.enum(["px", "pt", "in"]).default("px"),
    dpi: z.number().default(96),
  }),
  pages: z.array(PageSpecSchema).min(1).max(10),
});
export type SocialDesignSpec = z.infer<typeof SocialDesignSpecSchema>;

// Resume (A4 portrait or US Letter curriculum vitae with two-column profile)
export const ResumeSpecSchema = ProjectSpecSchema.extend({
  documentType: z.literal("resume"),
  canvas: z.object({
    width: z.number().default(1240),
    height: z.number().default(1754),
    aspectRatio: z.enum(["A4_portrait", "US_letter"]).default("A4_portrait"),
    unit: z.enum(["px", "pt", "in"]).default("px"),
    dpi: z.number().default(96),
  }),
  pages: z.array(PageSpecSchema).min(1).max(5),
});
export type ResumeSpec = z.infer<typeof ResumeSpecSchema>;

// Letter (US Letter or A4 formal executive memorandum)
export const LetterSpecSchema = ProjectSpecSchema.extend({
  documentType: z.literal("letter"),
  canvas: z.object({
    width: z.number().default(1275),
    height: z.number().default(1650),
    aspectRatio: z.enum(["US_letter", "A4_portrait"]).default("US_letter"),
    unit: z.enum(["px", "pt", "in"]).default("px"),
    dpi: z.number().default(96),
  }),
  pages: z.array(PageSpecSchema).min(1).max(5),
});
export type LetterSpec = z.infer<typeof LetterSpecSchema>;

// Diagram (16:9, 4:3, 1:1, or A4 landscape architecture flowchart / system DAG)
export const DiagramSpecSchema = ProjectSpecSchema.extend({
  documentType: z.literal("diagram"),
  canvas: z.object({
    width: z.number().default(1920),
    height: z.number().default(1080),
    aspectRatio: z.enum(["16:9", "4:3", "1:1", "A4_landscape"]).default("16:9"),
    unit: z.enum(["px", "pt", "in"]).default("px"),
    dpi: z.number().default(96),
  }),
  pages: z.array(PageSpecSchema).min(1).max(10),
});
export type DiagramSpec = z.infer<typeof DiagramSpecSchema>;

// Chart (16:9, 4:3, 1:1, or A4 landscape analytical KPI dashboard)
export const ChartSpecSchema = ProjectSpecSchema.extend({
  documentType: z.literal("chart"),
  canvas: z.object({
    width: z.number().default(1920),
    height: z.number().default(1080),
    aspectRatio: z.enum(["16:9", "4:3", "1:1", "A4_landscape"]).default("16:9"),
    unit: z.enum(["px", "pt", "in"]).default("px"),
    dpi: z.number().default(96),
  }),
  pages: z.array(PageSpecSchema).min(1).max(10),
});
export type ChartSpec = z.infer<typeof ChartSpecSchema>;

/**
 * Validate document against its format-specific schema.
 */
export function validateFormatSpec(spec: unknown): { success: boolean; data?: ProjectSpec; error?: z.ZodError } {
  const base = ProjectSpecSchema.safeParse(spec);
  if (!base.success) {
    return { success: false, error: base.error };
  }

  const docType = base.data.documentType;
  switch (docType) {
    case "presentation":
      return PresentationSpecSchema.safeParse(spec) as any;
    case "poster":
      return PosterSpecSchema.safeParse(spec) as any;
    case "infographic":
      return InfographicSpecSchema.safeParse(spec) as any;
    case "social_media":
      return SocialDesignSpecSchema.safeParse(spec) as any;
    case "resume":
      return ResumeSpecSchema.safeParse(spec) as any;
    case "letter":
      return LetterSpecSchema.safeParse(spec) as any;
    case "diagram":
      return DiagramSpecSchema.safeParse(spec) as any;
    case "chart":
      return ChartSpecSchema.safeParse(spec) as any;
    default:
      return base as any;
  }
}
