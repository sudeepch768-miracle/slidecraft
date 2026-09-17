import { z } from "zod";

export const VisualStyleFamilySchema = z.enum([
  "deep_navy_electric_blue",
  "indigo_violet_gradient",
  "teal_emerald_technology",
  "midnight_blue_coral",
  "charcoal_amber_highlights",
  "blue_lavender_editorial",
  "dark_aurora_gradient",
  "subtle_geometric_grid",
  "soft_abstract_mesh",
  "clean_light_blue_pro",
  "warm_editorial",
  "high_contrast_monochrome",
  "green_environmental",
  "red_orange_energetic",
  "purple_creative",
  "minimal_white_light_blue",
]);
export type VisualStyleFamily = z.infer<typeof VisualStyleFamilySchema>;

export const BackgroundStyleTypeSchema = z.enum([
  "solid_gradient",
  "mesh_gradient",
  "aurora",
  "geometric",
  "editorial",
  "abstract_image",
]);
export type BackgroundStyleType = z.infer<typeof BackgroundStyleTypeSchema>;

export const GlowPositionSchema = z.enum([
  "top_left",
  "top_right",
  "bottom_left",
  "bottom_right",
  "center",
  "asymmetric",
]);
export type GlowPosition = z.infer<typeof GlowPositionSchema>;

export const DecorativeShapeTypeSchema = z.enum([
  "none",
  "geometric_circles",
  "accent_rail",
  "tech_brackets",
  "aurora_ribbon",
  "corner_frame",
  "editorial_lines",
]);
export type DecorativeShapeType = z.infer<typeof DecorativeShapeTypeSchema>;

export const TexturePatternTypeSchema = z.enum([
  "none",
  "subtle_grid",
  "dots",
  "mesh",
  "circuit",
  "editorial_lines",
]);
export type TexturePatternType = z.infer<typeof TexturePatternTypeSchema>;

export const VisualDirectionColorsSchema = z.object({
  background: z.string().describe("Base page background color (HEX)"),
  backgroundSecondary: z.string().describe("Secondary / gradient destination background color (HEX)"),
  primary: z.string().describe("Primary brand / headline accent color (HEX)"),
  secondary: z.string().describe("Supporting secondary color (HEX)"),
  accent: z.string().describe("Callout / highlight color (HEX)"),
  accentSecondary: z.string().describe("Secondary highlight color (HEX)"),
  surface: z.string().describe("Card & content container fill (HEX)"),
  surfaceElevated: z.string().describe("Elevated card / modal container fill (HEX)"),
  surfaceBorder: z.string().describe("Container border stroke color (HEX)"),
  textPrimary: z.string().describe("High-contrast text color (HEX)"),
  textSecondary: z.string().describe("Muted text & secondary copy color (HEX)"),
});
export type VisualDirectionColors = z.infer<typeof VisualDirectionColorsSchema>;

export const VisualDirectionGradientSchema = z.object({
  direction: z.enum(["to_bottom", "to_right", "to_bottom_right", "to_top_right", "radial"]),
  angleDeg: z.number().min(0).max(360).default(135),
  stops: z.array(
    z.object({
      color: z.string(),
      position: z.number().min(0).max(100),
    })
  ),
});
export type VisualDirectionGradient = z.infer<typeof VisualDirectionGradientSchema>;

export const VisualDirectionGlowSchema = z.object({
  enabled: z.boolean().default(true),
  position: GlowPositionSchema.default("bottom_right"),
  color: z.string(),
  secondaryColor: z.string().optional(),
  blur: z.number().min(0).max(200).default(80),
  opacity: z.number().min(0).max(1).default(0.25),
  scale: z.number().min(0.5).max(3).default(1),
});
export type VisualDirectionGlow = z.infer<typeof VisualDirectionGlowSchema>;

export const VisualDirectionDecorativeShapesSchema = z.object({
  type: DecorativeShapeTypeSchema.default("none"),
  color: z.string(),
  opacity: z.number().min(0).max(1).default(0.3),
});
export type VisualDirectionDecorativeShapes = z.infer<typeof VisualDirectionDecorativeShapesSchema>;

export const VisualDirectionTexturePatternSchema = z.object({
  type: TexturePatternTypeSchema.default("none"),
  opacity: z.number().min(0).max(1).default(0.12),
});
export type VisualDirectionTexturePattern = z.infer<typeof VisualDirectionTexturePatternSchema>;

export const VisualDirectionBorderTreatmentSchema = z.object({
  radiusPx: z.number().min(0).max(32).default(14),
  widthPx: z.number().min(1).max(4).default(1),
  color: z.string(),
  opacity: z.number().min(0).max(1).default(0.3),
});
export type VisualDirectionBorderTreatment = z.infer<typeof VisualDirectionBorderTreatmentSchema>;

export const VisualDirectionImageTreatmentSchema = z.object({
  mode: z.enum(["darkened", "blurred", "side_panel", "mesh_overlay", "none"]).default("darkened"),
  overlayColor: z.string(),
  overlayOpacity: z.number().min(0).max(1).default(0.5),
});
export type VisualDirectionImageTreatment = z.infer<typeof VisualDirectionImageTreatmentSchema>;

export const VisualDirectionTypographyContrastSchema = z.object({
  minTextContrastRatio: z.number().min(4.5).default(7.0),
  surfacePanelRequired: z.boolean().default(true),
  headingWeight: z.number().default(800),
  bodyOpacity: z.number().min(0.5).max(1).default(0.9),
});
export type VisualDirectionTypographyContrast = z.infer<typeof VisualDirectionTypographyContrastSchema>;

export const VisualDirectionSchema = z.object({
  id: z.string(),
  variationSeed: z.string(),
  styleFamily: VisualStyleFamilySchema,
  styleName: z.string(),
  mode: z.enum(["dark", "light"]).default("dark"),
  backgroundStyle: BackgroundStyleTypeSchema,
  colors: VisualDirectionColorsSchema,
  gradient: VisualDirectionGradientSchema,
  glow: VisualDirectionGlowSchema,
  decorativeShapes: VisualDirectionDecorativeShapesSchema,
  texturePattern: VisualDirectionTexturePatternSchema,
  borderTreatment: VisualDirectionBorderTreatmentSchema,
  imageTreatment: VisualDirectionImageTreatmentSchema,
  typographyContrast: VisualDirectionTypographyContrastSchema,
  visualDensity: z.enum(["compact", "balanced", "spacious"]).default("balanced"),
  generatedAt: z.string(),
});
export type VisualDirection = z.infer<typeof VisualDirectionSchema>;

/**
 * Lightweight recent style record used to avoid repeating families
 */
export interface RecentStyleMetadata {
  styleFamily: VisualStyleFamily;
  backgroundStyle: BackgroundStyleType;
  primaryColorFamily: string;
  generatedAt: string;
}
