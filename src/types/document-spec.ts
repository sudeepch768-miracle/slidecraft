import { z } from "zod";
import { VisualDirectionSchema, VisualDirection } from "./visual-direction";
export { VisualDirectionSchema, type VisualDirection } from "./visual-direction";

// 1. Canvas Dimensions & Aspect Ratio
export const AspectRatioSchema = z.enum([
  "16:9",
  "4:3",
  "1:1",
  "9:16",
  "4:5", // Instagram Portrait
  "A4_portrait",
  "A4_landscape",
  "A3_portrait",
  "A3_landscape",
  "A2_portrait",
  "A1_portrait",
  "US_letter",
]);
export type AspectRatio = z.infer<typeof AspectRatioSchema>;

export const CanvasSpecSchema = z.object({
  width: z.number().describe("Width in virtual units/pixels"),
  height: z.number().describe("Height in virtual units/pixels"),
  aspectRatio: AspectRatioSchema,
  unit: z.enum(["px", "pt", "in"]).default("px"),
  dpi: z.number().default(96),
});
export type CanvasSpec = z.infer<typeof CanvasSpecSchema>;

// Standard dimensions presets
export const CANVAS_PRESETS: Record<
  AspectRatio,
  { width: number; height: number; pptxLayout?: string }
> = {
  "16:9": { width: 1920, height: 1080, pptxLayout: "LAYOUT_16x9" },
  "4:3": { width: 1440, height: 1080, pptxLayout: "LAYOUT_4x3" },
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "4:5": { width: 1080, height: 1350 },
  A4_portrait: { width: 1240, height: 1754 },
  A4_landscape: { width: 1754, height: 1240 },
  A3_portrait: { width: 1754, height: 2480 },
  A3_landscape: { width: 2480, height: 1754 },
  A2_portrait: { width: 2480, height: 3508 },
  A1_portrait: { width: 3508, height: 4960 },
  US_letter: { width: 1275, height: 1650 },
};

// 2. Theme Specification
export const ThemeColorsSchema = z.object({
  primary: z.string().describe("Dominant brand color (HEX)"),
  secondary: z.string().describe("Supporting secondary color (HEX)"),
  accent: z.string().describe("Callout / highlight color (HEX)"),
  background: z.string().describe("Page base background color (HEX)"),
  surface: z.string().describe("Card and block background color (HEX)"),
  textPrimary: z.string().describe("High-contrast headline & body text (HEX)"),
  textSecondary: z.string().describe("Muted captions and labels (HEX)"),
  border: z.string().describe("Card strokes and dividers (HEX)"),
});
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;

export const ThemeTypographySchema = z.object({
  headingFont: z.string().default("Plus Jakarta Sans"),
  bodyFont: z.string().default("Inter"),
  monoFont: z.string().default("JetBrains Mono"),
  baseSizePx: z.number().default(16),
});
export type ThemeTypography = z.infer<typeof ThemeTypographySchema>;

export const ThemeSpecSchema = z.object({
  mode: z.enum(["light", "dark"]).default("light"),
  colors: ThemeColorsSchema,
  typography: ThemeTypographySchema,
  styleTokens: z.object({
    borderRadiusPx: z.number().default(10),
    shadow: z.enum(["none", "sm", "md", "lg"]).default("md"),
  }),
});
export type ThemeSpec = z.infer<typeof ThemeSpecSchema>;

// 3. Layout Archetypes
export const LayoutArchetypeSchema = z.enum([
  "hero_title", // Title slide / opening poster
  "two_column_split", // 50/50 or 60/40 text & media/chart split
  "three_card_grid", // 3 feature cards / pillars
  "four_metric_dashboard", // 4 KPI callouts with trends
  "horizontal_timeline", // 3 to 5 milestone points
  "comparison_table", // Features or options side-by-side
  "process_flowchart", // Sequential connected process nodes
  "infographic_radial", // Center key anchor with peripheral cards
  "editorial_asymmetrical", // High-impact pull quote + insights
  "resume_split_profile", // Sidebar skills + main experience
  "data_chart_focus", // Dominant chart + summary takeaway
  "letter_formal", // Executive letter / memo structure
  // Native PowerPoint presentation layouts
  "title_and_content", // Title + narrative/bullet points
  "two_column", // Dual-column side-by-side
  "three_column", // Three column cards / features
  "full_bleed_visual", // Impactful visual anchor with overlay
  "big_statistic", // Big bold metric statistics
  "comparison", // Side-by-side comparison
  "timeline", // Chronological roadmap
  "process_flow", // Multi-step workflow
  "diagram", // Architecture diagram / DAG
  "chart", // Dedicated data chart slide
  "table", // Structured data table
  "quote", // High-impact quotation slide
  "section_divider", // Chapter or section break
  "summary", // Executive recap & takeaways
  "closing_slide", // Contact & call to action slide
  // Specialized Poster & Visual Design Archetypes
  "college_event_poster", // College cultural/tech event with headline, date, venue, QR code
  "workshop_poster", // Hands-on technical workshop with mentors, schedule, registration
  "seminar_poster", // Academic/formal seminar with distinguished speaker and venue
  "hackathon_poster", // High-energy tech competition with prize pool, tracks, sponsors
  "research_poster", // 3-column academic scientific poster with abstract, charts, methodology
  "project_exhibition_poster", // Showcase poster for student/enterprise project demonstrations
  "product_promotion_poster", // Commercial promotional poster with value props, pricing, CTA
  "awareness_campaign_poster", // Social/health/advocacy poster with high-impact stats and helpline
  "social_announcement_poster", // Compact square or vertical social bulletin
  // Specialized Infographic Archetypes
  "infographic_process", // Step-by-step numbered process flow
  "infographic_timeline", // Milestone roadmap infographic
  "infographic_comparison", // Comparative feature analysis
  "infographic_statistics", // Large metric callouts and KPI data
  "infographic_hierarchy", // Tree/organization hierarchy
  "infographic_cause_effect", // Cause -> Mechanism -> Effect flow
  "infographic_step_by_step", // Instructional sequential guide
  "infographic_circular_workflow", // Closed-loop lifecycle
  // Specialized Social Media Archetypes
  "social_instagram_post", // 1:1 or 4:5 visual feed post
  "social_instagram_story", // 9:16 vertical story with safe zones
  "social_linkedin_post", // 16:9 or 1:1 professional feed banner
  "social_youtube_thumbnail", // 16:9 video thumbnail with timestamp safe zone
  "social_twitter_graphic", // 16:9 post announcement graphic
  "social_whatsapp_status", // 9:16 mobile status update
  // Specialized Resume Archetypes
  "resume_ats_friendly", // Single-column ATS-parsable standard
  "resume_academic_cv", // Academic research, publications, teaching
  "resume_internship", // Early career, coursework, student projects
  "resume_creative", // Elegant 2-column layout with skill badges
  "resume_portfolio_profile", // Portfolio case study & competencies
  // Specialized Letter Archetypes
  "letter_leave", // Formal leave application
  "letter_permission", // Request for institutional permission
  "letter_request", // Official request letter
  "letter_complaint", // Formal grievance / complaint
  "letter_internship_application", // Student internship application
  "letter_job_application", // Professional job application
  "letter_cover", // Tailored executive cover letter
  "letter_resignation", // Formal resignation letter
  "letter_invitation", // Dignitary / keynote invitation
  "letter_college_correspondence", // Academic / administrative memo
  "letter_business", // Commercial B2B letter
  // Specialized Diagram Archetypes
  "diagram_flowchart", // Flowchart with conditional branches
  "diagram_uml", // UML use-case and class relationships
  "diagram_er", // Entity relationship database schema
  "diagram_system_architecture", // Multi-tier cloud microservices
  "diagram_mindmap", // Radiating concept map
  "diagram_decision_tree", // Probability / logic branching
  "diagram_process_workflow", // State transitions and triggers
  // Specialized Chart Archetypes
  "chart_kpi_dashboard", // Multi-metric KPI board
  "chart_comparison_view", // Categorical comparative metrics
  "chart_deep_dive", // Single deep analytical chart view
  // Specialized Content-Rich Archetypes
  "case_study_card", // Problem -> Solution -> Measurable Impact case study
  "quote_editorial", // Authoritative quote with contextual explanation
  "detailed_information", // Multi-section detailed prose & bullet cards
]);
export type LayoutArchetype = z.infer<typeof LayoutArchetypeSchema>;

// 4. Element Schemas
export const TextElementSchema = z.object({
  type: z.literal("text"),
  id: z.string(),
  variant: z.enum(["h1", "h2", "h3", "subtitle", "body", "caption", "quote"]),
  content: z.string(),
  align: z.enum(["left", "center", "right", "justify"]).default("left"),
  colorOverride: z.string().optional(),
});
export type TextElement = z.infer<typeof TextElementSchema>;

export const MetricCardSchema = z.object({
  type: z.literal("metric"),
  id: z.string(),
  value: z.string().describe("Key figure, e.g. '$24.5M' or '99.4%'"),
  label: z.string().describe("Metric description"),
  delta: z.string().optional().describe("Trend text, e.g. '+32% YoY'"),
  trend: z.enum(["up", "down", "neutral"]).optional(),
  icon: z.string().optional().describe("Lucide icon identifier"),
});
export type MetricCard = z.infer<typeof MetricCardSchema>;

export const ChartElementSchema = z.object({
  type: z.literal("chart"),
  id: z.string(),
  chartType: z.enum(["bar", "column", "line", "pie", "doughnut", "area", "scatter"]),
  title: z.string().optional(),
  labels: z.array(z.string()),
  datasets: z.array(
    z.object({
      name: z.string(),
      data: z.array(z.number()),
      color: z.string().optional(),
    })
  ),
  showLegend: z.boolean().default(true),
  scatterData: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
        z: z.number().optional(),
        name: z.string().optional(),
      })
    )
    .optional(),
  kpis: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        delta: z.string().optional(),
        trend: z.enum(["up", "down", "neutral"]).optional(),
      })
    )
    .optional(),
  recommendationNote: z.string().optional(),
});
export type ChartElement = z.infer<typeof ChartElementSchema>;

export const DiagramElementSchema = z.object({
  type: z.literal("diagram"),
  id: z.string(),
  diagramType: z.enum([
    "flowchart",
    "process_steps",
    "cycle",
    "funnel",
    "hierarchy",
    "uml",
    "er",
    "system_architecture",
    "mindmap",
    "decision_tree",
  ]),
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
      status: z.enum(["completed", "active", "pending"]).optional(),
      shape: z
        .enum([
          "rectangle",
          "pill",
          "circle",
          "diamond",
          "database",
          "cloud",
          "actor",
          "class_box",
        ])
        .optional(),
      fields: z
        .array(
          z.object({
            name: z.string(),
            type: z.string(),
            isKey: z.boolean().optional(),
          })
        )
        .optional(),
      parent: z.string().optional(),
      x: z.number().optional(),
      y: z.number().optional(),
    })
  ),
  connections: z.array(
    z.object({
      fromId: z.string(),
      toId: z.string(),
      label: z.string().optional(),
      connectionType: z
        .enum([
          "directed",
          "bidirectional",
          "dotted",
          "inheritance",
          "aggregation",
          "composition",
          "one_to_many",
          "many_to_many",
        ])
        .optional(),
    })
  ),
});
export type DiagramElement = z.infer<typeof DiagramElementSchema>;

export const TableElementSchema = z.object({
  type: z.literal("table"),
  id: z.string(),
  title: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  highlightFirstColumn: z.boolean().default(false),
});
export type TableElement = z.infer<typeof TableElementSchema>;

export const ShapeElementSchema = z.object({
  type: z.literal("shape"),
  id: z.string(),
  shape: z.enum(["rectangle", "pill", "circle", "divider", "badge"]),
  label: z.string().optional(),
  background: z.string().optional(),
  border: z.string().optional(),
});
export type ShapeElement = z.infer<typeof ShapeElementSchema>;

export const ListElementSchema = z.object({
  type: z.literal("list"),
  id: z.string(),
  listType: z.enum(["bullet", "numbered", "checklist", "steps"]),
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      subtext: z.string().optional(),
      icon: z.string().optional(),
      checked: z.boolean().optional(),
    })
  ),
});
export type ListElement = z.infer<typeof ListElementSchema>;

export const MediaElementSchema = z.object({
  type: z.literal("media"),
  id: z.string(),
  mediaType: z.enum(["image", "icon", "illustration"]),
  // Image source: can be a URL, base64 data URI, or Supabase storage path
  url: z.string().optional(),
  src: z.string().optional(), // alias for url, used in PPTX compiler
  alt: z.string().optional(),
  caption: z.string().optional(),
  iconName: z.string().optional(),
  // Extended AI Image Metadata
  imageId: z.string().optional(),
  provider: z.string().optional(),
  promptSummary: z.string().optional(),
  prompt: z.string().optional(),
  intendedRole: z.enum(["hero", "card", "diagram", "background", "editorial", "case_study"]).optional(),
  aspectRatio: z.string().optional(),
  storagePath: z.string().optional(),
  generatedAt: z.string().optional(),
  // Layout
  fit: z.enum(["cover", "contain", "fill"]).default("cover").optional(),
  // Position (optional absolute positioning in canvas %)
  position: z.object({
    x: z.number().optional(), // left % (0-100)
    y: z.number().optional(), // top % (0-100)
    width: z.number().optional(), // % of canvas
    height: z.number().optional(), // % of canvas
  }).optional(),
  // Visual effects
  borderRadius: z.number().default(0).optional(), // px
  overlayColor: z.string().optional(), // hex
  overlayOpacity: z.number().min(0).max(1).default(0).optional(), // 0-1
});
export type MediaElement = z.infer<typeof MediaElementSchema>;


// Poster & Visual Design Element Schemas
export const QRCodeElementSchema = z.object({
  type: z.literal("qrcode"),
  id: z.string(),
  url: z.string(),
  label: z.string().optional(),
  scanHint: z.string().default("Scan to Register"),
  sizePx: z.number().default(140),
  position: z.enum(["bottom_right", "bottom_left", "center", "custom"]).default("bottom_right"),
});
export type QRCodeElement = z.infer<typeof QRCodeElementSchema>;

export const EventDetailsElementSchema = z.object({
  type: z.literal("event_details"),
  id: z.string(),
  date: z.string(),
  time: z.string().optional(),
  venue: z.string(),
  mapLink: z.string().optional(),
  price: z.string().optional(),
  eligibility: z.string().optional(),
});
export type EventDetailsElement = z.infer<typeof EventDetailsElementSchema>;

export const CtaBadgeElementSchema = z.object({
  type: z.literal("cta_badge"),
  id: z.string(),
  text: z.string(),
  link: z.string().optional(),
  deadline: z.string().optional(),
  variant: z.enum(["primary", "secondary", "accent", "outline"]).default("primary"),
});
export type CtaBadgeElement = z.infer<typeof CtaBadgeElementSchema>;

export const OrganizerInfoElementSchema = z.object({
  type: z.literal("organizer_info"),
  id: z.string(),
  organization: z.string(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  website: z.string().optional(),
  socialHandles: z.array(z.string()).default([]),
});
export type OrganizerInfoElement = z.infer<typeof OrganizerInfoElementSchema>;

export const SpeakerCardElementSchema = z.object({
  type: z.literal("speaker_card"),
  id: z.string(),
  name: z.string(),
  title: z.string().optional(),
  company: z.string().optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
});
export type SpeakerCardElement = z.infer<typeof SpeakerCardElementSchema>;

export const SponsorGridElementSchema = z.object({
  type: z.literal("sponsor_grid"),
  id: z.string(),
  title: z.string().default("Partners & Sponsors"),
  sponsors: z.array(
    z.object({
      name: z.string(),
      logoUrl: z.string().optional(),
      tier: z.enum(["title", "platinum", "gold", "silver"]).default("gold"),
    })
  ),
});
export type SponsorGridElement = z.infer<typeof SponsorGridElementSchema>;

// Resume Element Schema
export const ResumeBlockSchema = z.object({
  type: z.literal("resume_block"),
  id: z.string(),
  sectionType: z.enum([
    "header",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "publications",
    "awards",
  ]),
  contactInfo: z
    .object({
      name: z.string(),
      title: z.string().optional(),
      email: z.string(),
      phone: z.string().optional(),
      location: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  summaryText: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        subtitle: z.string().optional(),
        dateRange: z.string().optional(),
        location: z.string().optional(),
        bullets: z.array(z.string()).default([]),
        tags: z.array(z.string()).optional(),
      })
    )
    .optional(),
});
export type ResumeBlockElement = z.infer<typeof ResumeBlockSchema>;

// Letter Element Schema
export const LetterBlockSchema = z.object({
  type: z.literal("letter_block"),
  id: z.string(),
  sectionType: z.enum([
    "sender_header",
    "recipient_header",
    "date_line",
    "subject_line",
    "salutation",
    "body_paragraph",
    "complimentary_close",
    "signature_block",
    "enclosures",
  ]),
  sender: z
    .object({
      name: z.string(),
      title: z.string().optional(),
      organization: z.string().optional(),
      address: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  recipient: z
    .object({
      name: z.string(),
      title: z.string().optional(),
      organization: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  date: z.string().optional(),
  subject: z.string().optional(),
  salutation: z.string().optional(),
  content: z.string().optional(),
  closing: z.string().optional(),
  signer: z
    .object({
      name: z.string(),
      title: z.string().optional(),
      organization: z.string().optional(),
      designation: z.string().optional(),
    })
    .optional(),
});
export type LetterBlockElement = z.infer<typeof LetterBlockSchema>;

// Infographic Workflow Element Schema
export const InfographicWorkflowSchema = z.object({
  type: z.literal("infographic_workflow"),
  id: z.string(),
  workflowType: z.enum([
    "process",
    "timeline",
    "comparison",
    "statistics",
    "hierarchy",
    "cause_effect",
    "step_by_step",
    "circular",
    "circular_workflow",
  ]),
  title: z.string().optional(),
  steps: z
    .array(
      z.object({
        id: z.string(),
        stepNumber: z.number(),
        title: z.string(),
        description: z.string(),
        icon: z.string().optional(),
        metric: z.string().optional(),
        tag: z.string().optional(),
        accentColor: z.string().optional(),
      })
    )
    .default([]),
  comparisonColumns: z
    .array(
      z.object({
        columnTitle: z.string(),
        badge: z.string().optional(),
        items: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
            highlight: z.boolean().optional(),
          })
        ),
      })
    )
    .optional(),
});
export type InfographicWorkflowElement = z.infer<typeof InfographicWorkflowSchema>;

// Social Graphic Overlay Element Schema
export const SocialGraphicOverlaySchema = z.object({
  type: z.literal("social_overlay"),
  id: z.string(),
  platform: z.enum([
    "instagram_post",
    "instagram_story",
    "linkedin_post",
    "youtube_thumbnail",
    "twitter_graphic",
    "whatsapp_status",
  ]),
  headline: z.string(),
  subheadline: z.string().optional(),
  callToAction: z.string().optional(),
  handleOrBrand: z.string().optional(),
  badgeText: z.string().optional(),
  accentColor: z.string().optional(),
  safeZonePadding: z
    .object({
      top: z.number().default(0),
      bottom: z.number().default(0),
      left: z.number().default(0),
      right: z.number().default(0),
    })
    .default({ top: 0, bottom: 0, left: 0, right: 0 }),
});
export type SocialGraphicOverlayElement = z.infer<typeof SocialGraphicOverlaySchema>;

// Discriminated Union of all valid content elements
export const ContentElementSchema = z.discriminatedUnion("type", [
  TextElementSchema,
  MetricCardSchema,
  ChartElementSchema,
  DiagramElementSchema,
  TableElementSchema,
  ShapeElementSchema,
  ListElementSchema,
  MediaElementSchema,
  QRCodeElementSchema,
  EventDetailsElementSchema,
  CtaBadgeElementSchema,
  OrganizerInfoElementSchema,
  SpeakerCardElementSchema,
  SponsorGridElementSchema,
  ResumeBlockSchema,
  LetterBlockSchema,
  InfographicWorkflowSchema,
  SocialGraphicOverlaySchema,
]);
export type ContentElement = z.infer<typeof ContentElementSchema>;

// 4.5 Background Specification Schema
export const BackgroundSpecSchema = z.object({
  type: z.enum(["solid", "gradient", "pattern", "image", "layered"]).default("solid"),
  color: z.string().optional(),
  gradient: z
    .object({
      direction: z
        .enum(["to_right", "to_bottom", "to_bottom_right", "radial", "to_top_right"])
        .default("to_bottom_right"),
      angleDeg: z.number().optional(),
      stops: z.array(
        z.object({
          color: z.string(),
          position: z.number().min(0).max(100),
        })
      ),
    })
    .optional(),
  pattern: z
    .enum(["none", "subtle_grid", "dots", "mesh", "circuit", "editorial_lines", "diagonal_stripes"])
    .default("none")
    .optional(),
  patternOpacity: z.number().optional(),
  glow: z
    .object({
      enabled: z.boolean().default(true),
      position: z.enum(["top_left", "top_right", "bottom_left", "bottom_right", "center", "asymmetric"]).default("bottom_right"),
      color: z.string(),
      secondaryColor: z.string().optional(),
      blur: z.number().default(80),
      blurPx: z.number().optional(),
      opacity: z.number().default(0.25),
      scale: z.number().default(1),
    })
    .optional(),
  decorativeShapes: z
    .object({
      type: z.enum(["none", "geometric_circles", "accent_rail", "tech_brackets", "aurora_ribbon", "corner_frame", "editorial_lines"]).default("none"),
      style: z.enum(["none", "geometric_circles", "accent_rail", "tech_brackets", "aurora_ribbon", "corner_frame", "editorial_lines"]).optional(),
      position: z.enum(["top_right", "bottom_right", "bottom_left", "top_left", "split_corners", "side_rails"]).default("top_right").optional(),
      color: z.string(),
      secondaryColor: z.string().optional(),
      opacity: z.number().default(0.2),
    })
    .optional(),
  image: z
    .object({
      url: z.string(),
      mode: z
        .enum(["full", "blurred", "darkened", "side_panel", "card", "overlay", "decorative"])
        .default("full"),
      opacity: z.number().min(0).max(1).default(1),
      blurPx: z.number().min(0).max(40).default(0),
      brightness: z.number().min(0).max(2).default(1),
      contrast: z.number().min(0).max(2).default(1),
      overlayColor: z.string().optional(),
      overlayOpacity: z.number().min(0).max(1).default(0.4),
      position: z.enum(["cover", "left_half", "right_half", "card_center"]).default("cover"),
    })
    .optional(),
});
export type BackgroundSpec = z.infer<typeof BackgroundSpecSchema>;

// 4.6 First-Class Decoupled Page Background Schema
export const PageBackgroundSchema = z.object({
  type: z.enum(["solid", "gradient", "image", "texture", "layered"]).default("solid"),
  value: z.string().describe("Hex color, CSS gradient, image URL, or pattern ID"),
  opacity: z.number().min(0).max(1).default(1).optional(),
  position: z.string().optional(),
  scale: z.number().optional(),
  glow: z
    .object({
      enabled: z.boolean().default(true),
      position: z.string().default("bottom_right"),
      color: z.string(),
      secondaryColor: z.string().optional(),
      blur: z.number().default(80),
      opacity: z.number().default(0.25),
    })
    .optional(),
  decorativeShapes: z
    .object({
      type: z.string().default("none"),
      position: z.string().optional(),
      color: z.string(),
      secondaryColor: z.string().optional(),
      opacity: z.number().default(0.2),
    })
    .optional(),
});
export type PageBackground = z.infer<typeof PageBackgroundSchema>;

// 5. Page / Slide Specification
export const PageSpecSchema = z.object({
  id: z.string(),
  pageNumber: z.number(),
  archetype: LayoutArchetypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  badge: z.string().optional().describe("Category tag or slide index indicator"),
  backgroundOverride: z.string().optional(),
  backgroundSpec: BackgroundSpecSchema.optional(),
  background: PageBackgroundSchema.optional(),
  notes: z.string().optional().describe("Speaker or presenter notes"),
  isLocked: z.boolean().optional().describe("Whether this slide is locked from regeneration"),
  elements: z.array(ContentElementSchema),
});
export type PageSpec = z.infer<typeof PageSpecSchema>;

// 6. Document Specification (AST Root)
export const DocumentTypeSchema = z.enum([
  "presentation",
  "poster",
  "infographic",
  "social_media",
  "resume",
  "letter",
  "diagram",
  "chart",
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

// Design Style Presets
export const DesignStyleSchema = z.enum([
  "microsoft_professional",
  "modern_academic",
  "corporate",
  "minimal",
  "colorful_educational",
  "dark_technology",
  "research_conference",
  "startup_pitch",
]);
export type DesignStyle = z.infer<typeof DesignStyleSchema>;

export const GeneratedDesignSystemSchema = z.object({
  name: z.string(),
  visualDirection: z.string(),
  palette: z.object({
    background: z.string(),
    surface: z.string(),
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    text: z.string(),
    mutedText: z.string(),
    border: z.string().optional(),
  }),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    monoFont: z.string().optional(),
    displayScale: z.array(z.number()),
    weights: z.array(z.number()),
  }),
  spacing: z.object({
    unit: z.number(),
    sectionGap: z.number(),
    elementGap: z.number(),
    pagePadding: z.number(),
  }),
  shapes: z.object({
    cornerRadius: z.number(),
    borderWidth: z.number(),
    shadowStyle: z.string(),
  }),
  imagery: z.object({
    treatment: z.string(),
    aspectPreference: z.string(),
    overlayStyle: z.string(),
  }),
  composition: z.object({
    alignment: z.string(),
    density: z.string(),
    hierarchy: z.string(),
    grid: z.string(),
  }),
});
export type GeneratedDesignSystem = z.infer<typeof GeneratedDesignSystemSchema>;

export const DocumentSpecSchema = z.object({
  id: z.string().optional(),
  version: z.literal("1.0.0"),
  documentType: DocumentTypeSchema,
  meta: z.object({
    title: z.string(),
    description: z.string().optional(),
    author: z.string().default("SlideCraft AI"),
    tags: z.array(z.string()).default([]),
    designStyle: DesignStyleSchema.optional(),
    variationSeed: z.string().optional(),
  }),
  canvas: CanvasSpecSchema,
  theme: ThemeSpecSchema,
  designSystem: GeneratedDesignSystemSchema.optional(),
  visualDirection: VisualDirectionSchema.optional(),
  pages: z.array(PageSpecSchema).min(1),
});
export type DocumentSpec = z.infer<typeof DocumentSpecSchema>;

export interface ArtifactProject {
  id: string;
  userId: string;
  projectType: DocumentType;
  title: string;
  description?: string;
  prompt: string;
  generationConfig?: Record<string, any>;
  designSystem?: GeneratedDesignSystem;
  content: DocumentSpec;
  pages: PageSpec[];
  assets?: any[];
  createdAt: string;
  updatedAt: string;
  status: "draft" | "generating" | "ready" | "archived";
  exportFormats: string[];
}

// 7. Standard Factory Defaults
export const DEFAULT_THEME: ThemeSpec = {
  mode: "light",
  colors: {
    primary: "#0F172A", // Slate 900
    secondary: "#2563EB", // Blue 600
    accent: "#06B6D4", // Cyan 500
    background: "#F8FAFC", // Slate 50
    surface: "#FFFFFF", // Pure White
    textPrimary: "#0F172A", // Slate 900
    textSecondary: "#64748B", // Slate 500
    border: "#E2E8F0", // Slate 200
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
};

export const SEMANTIC_ACCENTS = {
  teal: "#06B6D4",
  violet: "#8B5CF6",
  coral: "#F43F5E",
  emerald: "#10B981",
  amber: "#F59E0B",
  blue: "#3B82F6",
} as const;

export const DARK_THEME: ThemeSpec = {
  mode: "dark",
  colors: {
    primary: "#38BDF8", // Electric Sky 400 (High contrast)
    secondary: "#818CF8", // Indigo 400
    accent: "#F43F5E", // Rose 500
    background: "#0B0F19", // Deep Obsidian Navy
    surface: "#131C2E", // Elevated Dark Island Card
    textPrimary: "#F8FAFC", // White 50
    textSecondary: "#94A3B8", // Slate 400
    border: "#1E293B", // Subtle Card Border
  },
  typography: {
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
    baseSizePx: 16,
  },
  styleTokens: {
    borderRadiusPx: 16,
    shadow: "lg",
  },
};

export function createEmptyDocument(
  title = "New Presentation",
  documentType: DocumentType = "presentation",
  aspectRatio: AspectRatio = "16:9"
): DocumentSpec {
  const preset = CANVAS_PRESETS[aspectRatio];
  return {
    version: "1.0.0",
    documentType,
    meta: {
      title,
      description: "Generated by SlideCraft AI",
      author: "SlideCraft AI",
      tags: [],
    },
    canvas: {
      width: preset.width,
      height: preset.height,
      aspectRatio,
      unit: "px",
      dpi: 96,
    },
    theme: DEFAULT_THEME,
    pages: [
      {
        id: "page-1",
        pageNumber: 1,
        archetype: "hero_title",
        title,
        subtitle: "Created with SlideCraft AI visual content studio",
        badge: "INTRO",
        elements: [
          {
            type: "text",
            id: "elem-1",
            variant: "h1",
            content: title,
            align: "center",
          },
          {
            type: "text",
            id: "elem-2",
            variant: "subtitle",
            content: "Created with SlideCraft AI visual content studio",
            align: "center",
          },
        ],
      },
    ],
  };
}
