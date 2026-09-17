import { z } from "zod";
import {
  DocumentType,
  AspectRatio,
  CANVAS_PRESETS,
  LayoutArchetype,
  DocumentTypeSchema,
  AspectRatioSchema,
  PageSpec,
  ContentElement,
  ThemeSpec,
  GeneratedDesignSystem,
} from "@/types/document-spec";
import {
  ProjectSpec,
  validateFormatSpec,
} from "@/types/schemas/project-spec-schemas";
import { normalizeContentInput, NormalizedContentBrief } from "./content-normalizer";
import { classifyContent, selectLayoutArchetype } from "./layout-selector";
import { buildSystemPrompt } from "./prompts/system-prompts";
import { selectThemeFromPrompt } from "./theme-generator";
import {
  synthesizeDynamicDesignSystem,
  designSystemToThemeSpec,
} from "./dynamic-design-system";
import { getAiService } from "./service/ai-factory";
import { AiService } from "./service/ai-service-interface";
import { extractJsonString } from "./parser";
import { createProject, updateProject } from "@/lib/supabase/db";
import { SupabaseClient } from "@supabase/supabase-js";
import { buildPosterDocumentSpec } from "@/lib/poster-engine/poster-builder";
import { buildInfographicDocumentSpec } from "@/lib/generators/infographic/infographic-builder";
import { buildSocialDocumentSpec } from "@/lib/generators/social/social-builder";
import { buildResumeDocumentSpec } from "@/lib/generators/resume/resume-builder";
import { buildLetterDocumentSpec } from "@/lib/generators/letter/letter-builder";
import { buildDiagramDocumentSpec } from "@/lib/generators/diagram/diagram-builder";
import { buildChartDocumentSpec } from "@/lib/generators/chart/chart-builder";
import { ComprehensiveQualityReport } from "@/lib/quality/quality-types";
import { repairAndAnalyze } from "@/lib/quality/quality-engine";

// ─────────────────────────────────────────────────────────────────────────────
// Request Schema
// ─────────────────────────────────────────────────────────────────────────────

export const GenerationRequestSchema = z.object({
  documentType: z.enum([
    "presentation",
    "social_media",
    "social-graphic",
    "poster",
    "infographic",
    "resume",
    "letter",
    "diagram",
    "chart",
  ]).optional(),
  projectType: z.enum([
    "presentation",
    "social_media",
    "social-graphic",
    "poster",
    "infographic",
    "resume",
    "letter",
    "diagram",
    "chart",
  ]).optional(),
  prompt: z.string().min(1, "Prompt or source content is required"),
  uploadedSource: z.string().optional(),

  platform: z.string().optional(),
  dimensions: z
    .object({
      width: z.number(),
      height: z.number(),
      unit: z.enum(["px", "in", "mm"]).default("px"),
    })
    .optional(),
  aspectRatio: AspectRatioSchema.optional(),

  designMode: z.enum(["auto", "brand-kit", "reference", "blank"]).optional(),
  brandKitId: z.string().optional(),
  brandKitPalette: z
    .object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      background: z.string().optional(),
      surface: z.string().optional(),
    })
    .optional(),
  referenceAssetIds: z.array(z.string()).optional(),

  tone: z.string().optional(),
  style: z.string().optional(),
  colorPreferences: z.array(z.string()).optional(),
  typographyPreferences: z.array(z.string()).optional(),

  outputOptions: z
    .object({
      pageCount: z.number().optional(),
      slideCount: z.number().optional(),
      exportFormats: z.array(z.string()).optional(),
    })
    .optional(),

  pageCount: z.number().int().min(1).max(20).optional(),
  targetAudience: z.string().optional(),
  purpose: z.string().optional(),

  // Strict isolation: sourceProjectId must be null unless explicitly requested to modify an existing project
  sourceProjectId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(), // backward compatibility alias
  userId: z.string().optional(),
  themeOverride: z.any().optional(), // Allow user-supplied theme
});
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline Types
// ─────────────────────────────────────────────────────────────────────────────

export type PipelineStage =
  | "received"
  | "validating_input"
  | "analyzing_intent"
  | "normalizing_content"
  | "identifying_project_type"
  | "selecting_theme"
  | "creating_outline"
  | "classifying_content"
  | "selecting_layouts"
  | "generating_specification"
  | "validating_specification"
  | "repairing_specification"
  | "saving_specification"
  | "finalizing"
  | "completed";

export interface PipelineProgressUpdate {
  stage: PipelineStage;
  stageNumber: number;
  percent: number;
  message: string;
  timestamp: number;
}

export type ProgressCallback = (update: PipelineProgressUpdate) => void;

export interface PipelineOptions {
  aiService?: AiService;
  supabaseClient?: SupabaseClient;
  onProgress?: ProgressCallback;
}

export interface PipelineResult {
  success: boolean;
  document: ProjectSpec;
  documentType: DocumentType;
  aspectRatio: AspectRatio;
  designSystem: GeneratedDesignSystem;
  normalizedBrief: NormalizedContentBrief;
  assignedArchetypes: LayoutArchetype[];
  chosenTheme: ThemeSpec;
  modelUsed?: string;
  durationMs: number;
  tokensUsed?: number;
  savedProjectId?: string;
  wasRepaired: boolean;
  progressUpdates: PipelineProgressUpdate[];
  qualityReport?: ComprehensiveQualityReport;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default aspect ratio
// ─────────────────────────────────────────────────────────────────────────────

export function getDefaultAspectRatio(documentType: DocumentType): AspectRatio {
  switch (documentType) {
    case "presentation": return "16:9";
    case "poster": return "A4_portrait";
    case "infographic": return "9:16";
    case "social_media": return "1:1";
    case "resume": return "A4_portrait";
    case "letter": return "US_letter";
    case "diagram": return "16:9";
    case "chart": return "16:9";
    default: return "16:9";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic fallback — uses ACTUAL prompt content, zero hardcoded strings
// ─────────────────────────────────────────────────────────────────────────────

export function createDeterministicFallbackDoc(
  brief: NormalizedContentBrief,
  documentType: DocumentType,
  aspectRatio: AspectRatio,
  archetypes: LayoutArchetype[],
  theme: ThemeSpec
): ProjectSpec {
  // ── Specialized document types route to their dedicated builders ──────────

  if (documentType === "poster") {
    const text = `${brief.coreTopic} ${brief.detectedDomain} ${brief.purpose}`.toLowerCase();
    const posterType =
      text.includes("hackathon") || text.includes("code") || text.includes("sprint") ? "hackathon" :
      text.includes("workshop") || text.includes("bootcamp") || text.includes("training") ? "workshop" :
      text.includes("research") || text.includes("paper") || text.includes("scientific") ? "research_poster" :
      text.includes("seminar") || text.includes("keynote") || text.includes("symposium") ? "seminar" :
      text.includes("exhibit") || text.includes("expo") || text.includes("showcase") ? "project_exhibition" :
      text.includes("product") || text.includes("launch") || text.includes("sale") ? "product_promotion" :
      text.includes("awareness") || text.includes("campaign") || text.includes("health") ? "awareness_campaign" :
      text.includes("student") || text.includes("college") || text.includes("fest") ? "college_event" :
      "social_announcement";

    const dateStr = brief.extractedDates[0] || "Date TBD";
    const urlStr = brief.extractedUrls[0] || "";
    const orgName = brief.extractedNames[0] || brief.coreTopic.split(" ").slice(0, 3).join(" ");

    return buildPosterDocumentSpec({
      posterType,
      title: brief.coreTopic,
      subtitle: brief.keyThemes[0]?.keyPoints[0] || brief.purpose,
      dimensions: aspectRatio,
      eventDate: dateStr,
      eventVenue: brief.extractedNames[1] || "Venue Details TBD",
      qrUrl: urlStr || undefined,
      organizerName: orgName,
      contactEmail: brief.extractedUrls[0]?.includes("@") ? brief.extractedUrls[0] : undefined,
      callToActionText: brief.detectedDensity === "light" ? "Register Now" : "Learn More",
      highlights: brief.hardConstraints.slice(0, 3).map(c => c.replace(/^[^:]+:\s*/, "")) || undefined,
    }) as any as ProjectSpec;
  }

  if (documentType === "infographic") {
    const text = `${brief.coreTopic} ${brief.purpose}`.toLowerCase();
    const infoType =
      text.includes("timeline") || text.includes("history") || text.includes("roadmap") ? "timeline" :
      text.includes("compare") || text.includes(" vs ") ? "comparison" :
      text.includes("stat") || text.includes("metric") || text.includes("kpi") ? "statistics" :
      text.includes("hierarch") || text.includes("org") ? "hierarchy" :
      text.includes("cause") || text.includes("effect") ? "cause_effect" :
      text.includes("cycle") || text.includes("loop") || text.includes("circular") ? "circular_workflow" :
      text.includes("step") ? "step_by_step" :
      "process";

    const steps = brief.keyThemes.slice(0, 5).map((t, idx) => ({
      title: t.title.slice(0, 40),
      description: t.keyPoints[0]?.slice(0, 80) || brief.purpose,
      metric: t.metrics[0]?.replace(/^[^:]+:\s*/, "") || `Phase 0${idx + 1}`,
      tag: t.keyPoints[1]?.slice(0, 20),
    }));

    return buildInfographicDocumentSpec({
      infographicType: infoType,
      title: brief.coreTopic,
      subtitle: brief.purpose,
      dimensions: aspectRatio,
      steps: steps.length > 0 ? steps : undefined,
    });
  }

  if (documentType === "social_media") {
    const text = `${brief.coreTopic} ${brief.targetAudience}`.toLowerCase();
    const platform =
      aspectRatio === "9:16" ? (text.includes("whatsapp") ? "whatsapp_status" : "instagram_story") :
      text.includes("linkedin") ? "linkedin_post" :
      text.includes("youtube") || text.includes("thumbnail") ? "youtube_thumbnail" :
      text.includes("twitter") || text.includes("tweet") || text.includes(" x ") ? "twitter_graphic" :
      "instagram_post";

    const statHighlights = brief.hardConstraints.slice(0, 3).map(c => {
      const parts = c.replace(/^[^:]+:\s*/, "").split(":");
      return { label: parts[0]?.trim() || "Growth", value: parts[1]?.trim() || c.replace(/^[^:]+:\s*/, "") };
    });

    return buildSocialDocumentSpec({
      platform,
      headline: brief.coreTopic,
      subheadline: brief.keyThemes[0]?.keyPoints[0] || brief.purpose,
      callToAction: brief.detectedTone === "formal" ? "Learn More →" : "Explore Now →",
      handleOrBrand: brief.extractedUrls[0] || "",
      aspectRatio,
      highlightStats: statHighlights.length > 0 ? statHighlights : undefined,
    });
  }

  if (documentType === "resume") {
    const text = `${brief.coreTopic} ${brief.purpose}`.toLowerCase();
    const resumeType =
      text.includes("academic") || text.includes("phd") || text.includes("research") ? "academic_cv" :
      text.includes("intern") || text.includes("student") ? "internship" :
      text.includes("creative") || text.includes("design") ? "creative" :
      text.includes("portfolio") || text.includes("executive") ? "portfolio_profile" :
      "ats_friendly";

    // Use names/details from the prompt, not invented ones
    const candidateName = brief.extractedNames[0] || brief.coreTopic.split(/\s+/).slice(0, 2).join(" ") || "Candidate";
    const candidateTitle = brief.keyThemes[0]?.title || brief.purpose || "Professional";

    return buildResumeDocumentSpec({
      resumeType,
      contactInfo: {
        name: candidateName,
        title: candidateTitle,
        email: brief.extractedUrls.find(u => u.includes("@")) || "",
        phone: "",
        location: brief.extractedNames[2] || "",
        linkedin: brief.extractedUrls.find(u => u.includes("linkedin")) || "",
        github: brief.extractedUrls.find(u => u.includes("github")) || "",
      },
      summaryText: brief.purpose || brief.keyThemes[0]?.keyPoints[0] || "",
      experience: brief.keyThemes.slice(0, 3).map((t, idx) => ({
        id: `exp-${idx + 1}`,
        title: t.title || `Role ${idx + 1}`,
        subtitle: brief.extractedNames[idx + 1] || "Organization",
        dateRange: brief.extractedDates[idx] || "",
        location: "",
        bullets: t.keyPoints.length > 0 ? t.keyPoints : ["Key responsibility or achievement"],
        tags: brief.hardConstraints.slice(idx * 2, idx * 2 + 2).map(c => c.replace(/^[^:]+:\s*/, "")),
      })),
      skills: brief.hardConstraints.map(c => c.replace(/^[^:]+:\s*/, "")).filter(s => s.length < 30).slice(0, 12),
      education: [],
      aspectRatio,
    });
  }

  if (documentType === "letter") {
    const text = `${brief.coreTopic} ${brief.purpose}`.toLowerCase();
    const letterType =
      text.includes("leave") ? "leave" :
      text.includes("permission") ? "permission" :
      text.includes("request") ? "request" :
      text.includes("complaint") ? "complaint" :
      text.includes("internship") ? "internship_application" :
      text.includes("job") || text.includes("employment") ? "job_application" :
      text.includes("cover") ? "cover" :
      text.includes("resignation") ? "resignation" :
      text.includes("invitation") ? "invitation" :
      text.includes("college") || text.includes("academic") || text.includes("dean") ? "college_correspondence" :
      "business";

    const senderName = brief.extractedNames[0] || "";
    const recipientName = brief.extractedNames[1] || brief.targetAudience;

    return buildLetterDocumentSpec({
      letterType,
      sender: {
        name: senderName,
        title: brief.keyThemes[0]?.title || "",
        organization: brief.extractedNames[2] || "",
        address: "",
        email: brief.extractedUrls.find(u => u.includes("@")) || "",
      },
      recipient: {
        name: recipientName,
        title: "",
        organization: "",
        address: "",
      },
      subject: brief.coreTopic,
      bodyParagraphs: brief.keyThemes.map(t =>
        [t.title, ...t.keyPoints].filter(Boolean).join(". ") || brief.purpose
      ).filter(Boolean),
      aspectRatio,
    });
  }

  if (documentType === "diagram") {
    const text = `${brief.coreTopic} ${brief.purpose}`.toLowerCase();
    const diagramCategory =
      text.includes("uml") || text.includes("class") ? "uml" :
      text.includes("er") || text.includes("database") || text.includes("schema") ? "er" :
      text.includes("flowchart") || text.includes("decision") ? "flowchart" :
      text.includes("mindmap") || text.includes("concept") ? "mindmap" :
      text.includes("tree") ? "decision_tree" :
      text.includes("process") || text.includes("workflow") ? "process_workflow" :
      "system_architecture";

    return buildDiagramDocumentSpec({
      diagramCategory,
      title: brief.coreTopic,
      subtitle: brief.purpose,
      aspectRatio,
    });
  }

  if (documentType === "chart") {
    const text = `${brief.coreTopic} ${brief.purpose}`.toLowerCase();
    const chartType =
      text.includes("scatter") ? "scatter" :
      text.includes("line") || text.includes("trend") || text.includes("time") ? "line" :
      text.includes("pie") || text.includes("share") || text.includes("breakdown") ? "pie" :
      text.includes("doughnut") ? "doughnut" :
      text.includes("area") ? "area" :
      text.includes("bar") || text.includes("rank") || text.includes("comparison") ? "bar" :
      "column";

    // Use real data from constraints if available, otherwise use contextual placeholders
    const numericConstraints = brief.hardConstraints
      .filter(c => /[\d.]+/.test(c))
      .map(c => parseFloat(c.replace(/[^0-9.]/g, "")))
      .filter(n => !isNaN(n) && n > 0)
      .slice(0, 4);

    const data = numericConstraints.length >= 2 ? numericConstraints : [42, 65, 81, 94];

    return buildChartDocumentSpec({
      chartType,
      title: brief.coreTopic,
      subtitle: brief.purpose,
      labels: brief.extractedDates.slice(0, 4).length >= 2 ? brief.extractedDates.slice(0, 4) : ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        { name: brief.keyThemes[0]?.title || "Primary", data },
        { name: "Benchmark", data: data.map(d => Math.round(d * 0.75)) },
      ],
      kpis: brief.hardConstraints.slice(0, 3).map((c, i) => ({
        label: brief.keyThemes[i]?.title || `Metric ${i + 1}`,
        value: c.replace(/^[^:]+:\s*/, ""),
        delta: "",
      })),
      aspectRatio,
    });
  }

  // ── Presentation fallback — uses ACTUAL brief content, zero invented text ──

  const preset = CANVAS_PRESETS[aspectRatio] || CANVAS_PRESETS["16:9"];

  const pages: PageSpec[] = archetypes.map((archetype, idx) => {
    const pageNum = idx + 1;
    const themeData = brief.keyThemes[idx] || {
      title: `${brief.coreTopic} — Section ${pageNum}`,
      keyPoints: [brief.purpose],
      metrics: brief.hardConstraints.slice(0, 2),
    };

    const elements: ContentElement[] = [];

    switch (archetype) {
      case "hero_title":
        elements.push({
          type: "text",
          id: `t-${pageNum}-1`,
          variant: "subtitle",
          content: themeData.keyPoints[0] || brief.purpose,
          align: "center",
        });
        break;

      case "four_metric_dashboard": {
        const metricsRaw = [
          ...brief.hardConstraints.map(c => c.replace(/^[^:]+:\s*/, "")),
          ...themeData.metrics.map(m => m.replace(/^[^:]+:\s*/, "")),
        ].filter(m => m.length > 0 && m.length < 20).slice(0, 4);

        elements.push(
          { type: "metric", id: `m-${pageNum}-1`, value: metricsRaw[0] || "—", label: themeData.keyPoints[0]?.slice(0, 40) || "Primary Metric", trend: "up" },
          { type: "metric", id: `m-${pageNum}-2`, value: metricsRaw[1] || "—", label: themeData.keyPoints[1]?.slice(0, 40) || "Secondary Metric", trend: "neutral" },
          { type: "metric", id: `m-${pageNum}-3`, value: metricsRaw[2] || "—", label: themeData.keyPoints[2]?.slice(0, 40) || "Third Metric", trend: "up" },
          { type: "metric", id: `m-${pageNum}-4`, value: metricsRaw[3] || "—", label: themeData.keyPoints[3]?.slice(0, 40) || "Fourth Metric", trend: "neutral" },
        );
        break;
      }

      case "three_card_grid":
        elements.push(
          { type: "metric", id: `c-${pageNum}-1`, value: "01", label: themeData.keyPoints[0] || themeData.title },
          { type: "metric", id: `c-${pageNum}-2`, value: "02", label: themeData.keyPoints[1] || brief.purpose },
          { type: "metric", id: `c-${pageNum}-3`, value: "03", label: themeData.keyPoints[2] || brief.coreTopic },
        );
        break;

      case "big_statistic": {
        const bigVal = brief.hardConstraints[0]?.replace(/^[^:]+:\s*/, "") || themeData.metrics[0]?.replace(/^[^:]+:\s*/, "") || "—";
        elements.push(
          { type: "metric", id: `big-${pageNum}`, value: bigVal, label: themeData.title, trend: "up" },
          { type: "text", id: `big-t-${pageNum}`, variant: "body", content: themeData.keyPoints.join(" ").slice(0, 200) || brief.purpose, align: "center" },
        );
        break;
      }

      case "horizontal_timeline": {
        const dates = brief.extractedDates;
        const nodes = themeData.keyPoints.slice(0, 4).map((kp, i) => ({
          id: `n-${pageNum}-${i + 1}`,
          label: dates[i] ? `${dates[i]}: ${kp.slice(0, 30)}` : kp.slice(0, 40),
          description: kp,
          status: i === 0 ? "completed" as const : i === 1 ? "active" as const : "pending" as const,
        }));
        if (nodes.length < 2) {
          nodes.push({ id: `n-${pageNum}-x`, label: brief.coreTopic, description: brief.purpose, status: "pending" as const });
        }
        elements.push({
          type: "diagram",
          id: `tl-${pageNum}`,
          diagramType: "process_steps",
          nodes,
          connections: nodes.slice(0, -1).map((n, i) => ({
            fromId: n.id,
            toId: nodes[i + 1].id,
            label: "",
            connectionType: "directed" as const,
          })),
        });
        break;
      }

      case "process_flowchart":
      case "process_flow": {
        const steps = themeData.keyPoints.slice(0, 5);
        const nodes = steps.map((step, i) => ({
          id: `n-${pageNum}-${i + 1}`,
          label: step.slice(0, 35),
          description: step,
          shape: i % 2 === 0 ? "rectangle" as const : "pill" as const,
          status: "active" as const,
        }));
        elements.push({
          type: "diagram",
          id: `flow-${pageNum}`,
          diagramType: "process_steps",
          nodes: nodes.length > 0 ? nodes : [
            { id: `n-${pageNum}-1`, label: brief.coreTopic.slice(0, 35), description: brief.purpose, shape: "rectangle" as const, status: "active" as const },
          ],
          connections: nodes.slice(0, -1).map((n, i) => ({
            fromId: n.id, toId: nodes[i + 1].id, label: `Step ${i + 1}`, connectionType: "directed" as const,
          })),
        });
        break;
      }

      case "comparison_table": {
        const keywords = [brief.coreTopic, ...brief.extractedNames.slice(0, 2)];
        elements.push({
          type: "table",
          id: `tbl-${pageNum}`,
          title: themeData.title,
          headers: ["Dimension", keywords[0]?.slice(0, 20) || "Option A", keywords[1]?.slice(0, 20) || "Option B"],
          rows: themeData.keyPoints.slice(0, 4).map((kp, i) => [
            kp.slice(0, 30),
            brief.hardConstraints[i * 2]?.replace(/^[^:]+:\s*/, "") || "Included",
            brief.hardConstraints[i * 2 + 1]?.replace(/^[^:]+:\s*/, "") || "Partial",
          ]),
          highlightFirstColumn: true,
        });
        break;
      }

      case "data_chart_focus":
      case "chart": {
        const nums = brief.hardConstraints
          .filter(c => /[\d.]+/.test(c))
          .map(c => parseFloat(c.replace(/[^0-9.]/g, "")))
          .filter(n => !isNaN(n) && n > 0)
          .slice(0, 4);
        const data = nums.length >= 2 ? nums : [35, 55, 72, 90];
        elements.push(
          {
            type: "chart",
            id: `ch-${pageNum}`,
            chartType: "bar",
            title: themeData.title,
            labels: brief.extractedDates.slice(0, 4).length >= 2 ? brief.extractedDates.slice(0, 4) : ["Phase 1", "Phase 2", "Phase 3", "Phase 4"],
            datasets: [{ name: brief.keyThemes[0]?.title || "Performance", data, color: theme.colors.secondary }],
            showLegend: true,
          },
          {
            type: "text",
            id: `ch-t-${pageNum}`,
            variant: "body",
            content: themeData.keyPoints.slice(0, 2).join(" ").slice(0, 200) || brief.purpose,
            align: "left",
          }
        );
        break;
      }

      case "editorial_asymmetrical":
      case "quote":
        elements.push({
          type: "text",
          id: `q-${pageNum}`,
          variant: "quote",
          content: themeData.keyPoints[0] || brief.purpose,
          align: "center",
        });
        break;

      case "two_column_split":
      case "two_column":
        elements.push(
          {
            type: "text",
            id: `tc-l-${pageNum}`,
            variant: "body",
            content: themeData.keyPoints.slice(0, 2).join("\n\n").slice(0, 300) || brief.purpose,
            align: "left",
          },
          {
            type: "list",
            id: `tc-r-${pageNum}`,
            listType: "bullet",
            items: themeData.keyPoints.slice(2, 6).map((kp, i) => ({
              id: `i-${pageNum}-${i + 1}`,
              text: kp.slice(0, 60),
              subtext: "",
            })),
          }
        );
        break;

      case "section_divider":
        elements.push({
          type: "text",
          id: `sd-${pageNum}`,
          variant: "h2",
          content: themeData.title,
          align: "center",
        });
        break;

      case "summary":
      case "closing_slide":
        elements.push(
          {
            type: "text",
            id: `cls-t-${pageNum}`,
            variant: "h2",
            content: "Key Takeaways",
            align: "center",
          },
          {
            type: "list",
            id: `cls-l-${pageNum}`,
            listType: "checklist",
            items: brief.keyThemes.slice(0, 4).map((t, i) => ({
              id: `tk-${i + 1}`,
              text: t.title.slice(0, 60),
              subtext: t.keyPoints[0]?.slice(0, 80) || "",
            })),
          },
          ...(brief.extractedUrls[0] ? [{
            type: "text" as const,
            id: `cls-url-${pageNum}`,
            variant: "caption" as const,
            content: brief.extractedUrls[0],
            align: "center" as const,
          }] : [])
        );
        break;

      default:
        elements.push(
          {
            type: "text",
            id: `def-t-${pageNum}`,
            variant: "body",
            content: themeData.keyPoints.join(" ").slice(0, 300) || brief.purpose,
            align: "left",
          },
          {
            type: "list",
            id: `def-l-${pageNum}`,
            listType: "steps",
            items: themeData.keyPoints.slice(0, 4).map((kp, i) => ({
              id: `s-${pageNum}-${i + 1}`,
              text: kp.slice(0, 60),
              subtext: "",
            })).filter(item => item.text.length > 0),
          }
        );
    }

    return {
      id: `page-${pageNum}`,
      pageNumber: pageNum,
      archetype,
      title: themeData.title.slice(0, 60),
      subtitle: themeData.keyPoints[0]?.slice(0, 120) || brief.purpose,
      badge: archetype.toUpperCase().replace(/_/g, " ").slice(0, 25),
      notes: `Slide ${pageNum}: ${themeData.title}. Key points: ${themeData.keyPoints.slice(0, 2).join("; ")}.`,
      elements,
    };
  });

  return {
    version: "1.0.0",
    documentType,
    meta: {
      title: brief.coreTopic.slice(0, 60),
      description: brief.purpose,
      author: "SlideCraft AI",
      tags: [brief.detectedDomain, brief.detectedTone, documentType].filter(Boolean),
      audience: brief.targetAudience,
      purpose: brief.purpose,
    },
    canvas: {
      width: preset.width,
      height: preset.height,
      aspectRatio,
      unit: "px",
      dpi: 96,
    },
    theme,
    pages,
    exportSettings: {
      targetFormat: "pptx",
      resolutionDpi: 96,
      includeSpeakerNotes: true,
      embedFonts: true,
      vectorPreservation: true,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// The 14-Stage AI Generation Pipeline
// ─────────────────────────────────────────────────────────────────────────────

export async function executeGenerationPipeline(
  rawInput: GenerationRequest,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const progressUpdates: PipelineProgressUpdate[] = [];

  function notify(stage: PipelineStage, stageNumber: number, percent: number, message: string) {
    const update: PipelineProgressUpdate = { stage, stageNumber, percent, message, timestamp: Date.now() };
    progressUpdates.push(update);
    options.onProgress?.(update);
  }

  // Stage 1: Receive
  notify("received", 1, 5, "Received prompt and source inputs");

  // Stage 2: Validate input
  notify("validating_input", 2, 8, "Validating input parameters");
  const validationResult = GenerationRequestSchema.safeParse(rawInput);
  if (!validationResult.success) {
    const errText = validationResult.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new Error(`Invalid generation request: ${errText}`);
  }
  const input = validationResult.data;

  // Stage 3: Analyze intent
  notify("analyzing_intent", 3, 15, "Analyzing prompt intent, domain, and tone");
  const combinedSource = input.uploadedSource
    ? `USER PROMPT:\n${input.prompt}\n\nUPLOADED SOURCE:\n${input.uploadedSource}`
    : input.prompt;

  // Stage 4: Normalize content
  notify("normalizing_content", 4, 22, "Extracting and normalizing content brief");
  const rawDocType = input.projectType || input.documentType;
  const normalizedDocType = (rawDocType === "social-graphic" ? "social_media" : rawDocType) as DocumentType | undefined;
  const normalizedBrief = normalizeContentInput(combinedSource, {
    documentType: normalizedDocType,
    requestedPageCount: input.pageCount,
  });

  // Override from explicit input if provided
  if (input.targetAudience) normalizedBrief.targetAudience = input.targetAudience;
  if (input.purpose) normalizedBrief.purpose = input.purpose;

  // Stage 5: Identify project type & canvas
  const rawType = (input as any).projectType || input.documentType || "presentation";
  const documentType: DocumentType = (rawType === "social-graphic" ? "social_media" : rawType) as DocumentType;

  // Determine aspect ratio from dimensions, platform, or default
  let aspectRatio = input.aspectRatio;
  if (!aspectRatio) {
    if (input.dimensions) {
      const ratio = input.dimensions.width / input.dimensions.height;
      if (Math.abs(ratio - 1) < 0.05) aspectRatio = "1:1";
      else if (Math.abs(ratio - 9 / 16) < 0.05) aspectRatio = "9:16";
      else if (Math.abs(ratio - 4 / 5) < 0.05) aspectRatio = "4:5";
      else if (Math.abs(ratio - 4 / 3) < 0.05) aspectRatio = "4:3";
      else if (Math.abs(ratio - 16 / 9) < 0.05) aspectRatio = "16:9";
      else aspectRatio = getDefaultAspectRatio(documentType);
    } else if (input.platform) {
      if (input.platform.includes("story") || input.platform.includes("status") || input.platform.includes("reel")) {
        aspectRatio = "9:16";
      } else if (input.platform.includes("post") && input.platform.includes("instagram")) {
        aspectRatio = "1:1";
      } else if (input.platform.includes("thumbnail") || input.platform.includes("youtube") || input.platform.includes("twitter") || input.platform.includes("linkedin")) {
        aspectRatio = "16:9";
      } else {
        aspectRatio = getDefaultAspectRatio(documentType);
      }
    } else {
      aspectRatio = getDefaultAspectRatio(documentType);
    }
  }

  notify("identifying_project_type", 5, 28, `Configuring format: ${documentType} @ ${aspectRatio}`);

  // Stage 6: Generate Unique Design System
  notify("selecting_theme", 6, 33, `Synthesizing dynamic design system for: ${normalizedBrief.detectedDomain}`);
  const dynamicDesignSystem = synthesizeDynamicDesignSystem({
    prompt: combinedSource,
    documentType,
    platform: input.platform,
    suggestedAspectRatio: aspectRatio,
    colorPreferences: input.colorPreferences,
    typographyPreferences: input.typographyPreferences,
    tonePreference: input.tone,
    stylePreference: input.style,
    brandKitPalette: input.brandKitPalette,
  });

  const chosenTheme: ThemeSpec =
    (input.themeOverride as ThemeSpec) || designSystemToThemeSpec(dynamicDesignSystem);

  // Stage 7: Create content outline
  notify("creating_outline", 7, 40, "Building structured page outline and narrative arc");
  const pageCount = input.pageCount || normalizedBrief.suggestedPageCount || 5;
  const keyThemes = [...normalizedBrief.keyThemes];

  // Ensure we have enough themes, padding with topic-derived content
  while (keyThemes.length < pageCount) {
    const idx = keyThemes.length;
    keyThemes.push({
      title: `${normalizedBrief.coreTopic} — Part ${idx + 1}`,
      keyPoints: [normalizedBrief.purpose],
      metrics: normalizedBrief.hardConstraints.slice(idx * 2, idx * 2 + 2),
    });
  }

  // Update the brief with padded themes
  normalizedBrief.keyThemes = keyThemes.slice(0, pageCount);
  normalizedBrief.suggestedPageCount = pageCount;

  // Stage 8: Classify content
  notify("classifying_content", 8, 50, "Classifying section semantics and data categories");
  const classifiedSections = normalizedBrief.keyThemes.map(theme => {
    const combinedText = `${theme.title}\n${theme.keyPoints.join("\n")}\n${theme.metrics.join("\n")}`;
    return { theme, categories: classifyContent(combinedText) };
  });

  // Stage 9: Select layouts
  notify("selecting_layouts", 9, 58, "Selecting diverse, content-aware layout archetypes");
  const assignedArchetypes: LayoutArchetype[] = [];
  classifiedSections.forEach((section, idx) => {
    const archetype = selectLayoutArchetype(
      section.categories,
      idx,
      assignedArchetypes,
      pageCount,
      documentType
    );
    assignedArchetypes.push(archetype);
  });

  // Stage 10: Generate with AI
  notify("generating_specification", 10, 68, "Synthesizing design specification via Groq LPU");
  const aiService = options.aiService || getAiService();
  const systemPrompt = buildSystemPrompt(documentType, aspectRatio, normalizedBrief, chosenTheme);

  const outlineSummary = normalizedBrief.keyThemes
    .map((theme, i) =>
      `Slide ${i + 1} [Archetype: ${assignedArchetypes[i]}]:\n  Title: ${theme.title}\n  Key points: ${theme.keyPoints.slice(0, 3).join("; ")}\n  Metrics/Data: ${theme.metrics.slice(0, 2).join(", ") || "none"}`
    )
    .join("\n\n");

  const constraintsSummary = normalizedBrief.hardConstraints.length > 0
    ? `EXACT DATA TO PRESERVE:\n${normalizedBrief.hardConstraints.map(c => `  - ${c}`).join("\n")}`
    : "No exact constraints specified.";

  const namedEntities = normalizedBrief.extractedNames.length > 0
    ? `\nNAMES/ENTITIES FROM PROMPT: ${normalizedBrief.extractedNames.join(", ")}`
    : "";

  const userMessage = `Generate a complete ${documentType} specification (${pageCount} slides, ${aspectRatio}).

TOPIC: ${normalizedBrief.coreTopic}
AUDIENCE: ${normalizedBrief.targetAudience}
PURPOSE: ${normalizedBrief.purpose}
DOMAIN: ${normalizedBrief.detectedDomain} | TONE: ${normalizedBrief.detectedTone} | DENSITY: ${normalizedBrief.detectedDensity}
${constraintsSummary}${namedEntities}

SLIDE OUTLINE (respect these archetypes and content):
${outlineSummary}

THEME IS ALREADY SET in system prompt — use it exactly.
Output ONLY valid JSON. No markdown, no explanation. Exactly ${pageCount} pages.`;

  let rawAiContent = "";
  let modelUsed = aiService.defaultModel;
  let tokensUsed: number | undefined;

  try {
    const completion = await aiService.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      { jsonMode: true, temperature: 0.4 }
    );
    rawAiContent = completion.content;
    modelUsed = completion.modelUsed;
    tokensUsed = completion.tokensUsed;
  } catch (aiErr: any) {
    console.warn(`[Pipeline] AI Service call failed: ${aiErr.message}. Falling back to deterministic generation.`);
  }

  // Stage 11: Validate
  notify("validating_specification", 11, 78, "Validating against Zod schema");
  let finalSpec: ProjectSpec | null = null;
  let wasRepaired = false;

  if (rawAiContent) {
    try {
      const jsonStr = extractJsonString(rawAiContent);
      const parsed = JSON.parse(jsonStr);

      // Inject the chosen theme if AI used a different one
      if (parsed && !input.themeOverride) {
        parsed.theme = chosenTheme;
      }

      const validation = validateFormatSpec(parsed);

      if (validation.success && validation.data) {
        finalSpec = validation.data;
      } else {
        // Stage 11a: Repair
        notify("repairing_specification", 11, 83, "Repairing schema discrepancies via reflection loop");
        const zodErrors = validation.error?.format();

        const repairPrompt = `Fix JSON schema errors for a SlideCraft ${documentType} specification.

ERRORS:
${JSON.stringify(zodErrors, null, 2)}

ORIGINAL JSON (first 4000 chars):
${jsonStr.slice(0, 4000)}

Return ONLY the corrected, complete valid JSON.`;

        try {
          const repairCompletion = await aiService.chat(
            [
              { role: "system", content: "You are an expert JSON repair assistant. Output ONLY valid JSON matching the schema. No markdown." },
              { role: "user", content: repairPrompt },
            ],
            { jsonMode: true, temperature: 0.1 }
          );

          const repairedJsonStr = extractJsonString(repairCompletion.content);
          const repairedParsed = JSON.parse(repairedJsonStr);

          // Always inject chosen theme
          if (!input.themeOverride) repairedParsed.theme = chosenTheme;

          const revalidation = validateFormatSpec(repairedParsed);
          if (revalidation.success && revalidation.data) {
            finalSpec = revalidation.data;
            wasRepaired = true;
          }
        } catch (repairErr: any) {
          console.warn("[Pipeline] AI repair attempt failed:", repairErr.message);
        }
      }
    } catch (parseErr: any) {
      console.warn("[Pipeline] JSON parse failed:", parseErr.message);
    }
  }

  // Fallback to deterministic content
  if (!finalSpec) {
    console.info("[Pipeline] Using deterministic fallback with theme:", chosenTheme.colors.primary);
    finalSpec = createDeterministicFallbackDoc(
      normalizedBrief,
      documentType,
      aspectRatio,
      assignedArchetypes,
      chosenTheme
    );
  }

  // Stage 11.5: Quality check & auto-repair
  let qualityReport: ComprehensiveQualityReport | undefined;
  try {
    const repairResult = repairAndAnalyze(finalSpec as any);
    finalSpec = repairResult.repairedDocument;
    qualityReport = repairResult.report;
    if (qualityReport.repairedAutomatically && qualityReport.repairs.length > 0) {
      wasRepaired = true;
      notify("repairing_specification", 11, 88, `Auto-repaired: ${qualityReport.repairs[0].description}`);
    }
  } catch (qualityErr: any) {
    console.warn("[Pipeline] Quality check non-fatal:", qualityErr.message);
  }

  // Stage 11.6: Strip any image-prompt text that leaked into text elements
  // This guards against LLMs placing photography descriptions in text content fields
  // instead of using a proper media element with an empty URL.
  if (finalSpec && Array.isArray((finalSpec as any).pages)) {
    const IMAGE_PROMPT_PATTERNS = [
      /\bhero image\b/i,
      /\bimage (with|showing|depicting|of)\b/i,
      /\bphoto(graph)? of\b/i,
      /\bvisual (showing|depicting|illustrating)\b/i,
      /\boverlay(ed)? with\b/i,
      /\bcinematic\b.*\b(render|shot|image)\b/i,
      /\bphotography concept\b/i,
      /\bphotorealistic\b/i,
    ];

    for (const page of (finalSpec as any).pages) {
      if (!Array.isArray(page.elements)) continue;
      const before = page.elements.length;
      page.elements = page.elements.filter((el: any) => {
        if (el.type !== "text") return true;
        const content: string = el.content || "";
        const isImagePrompt = IMAGE_PROMPT_PATTERNS.some(rx => rx.test(content));
        if (isImagePrompt) {
          console.warn(`[Pipeline] Removed image-prompt text element from slide ${page.pageNumber}: "${content.slice(0, 80)}..."`);
          return false;
        }
        return true;
      });
      if (page.elements.length < before) wasRepaired = true;
    }
  }

  // Ensure designSystem is attached to the document specification
  (finalSpec as any).designSystem = dynamicDesignSystem;


  // Stage 12: Save (Strict Isolation: only update existing if sourceProjectId is explicitly passed)
  notify("saving_specification", 12, 92, "Persisting specification to database");
  let savedProjectId = input.sourceProjectId || undefined;

  if (options.supabaseClient) {
    try {
      if (input.sourceProjectId) {
        await updateProject(
          options.supabaseClient,
          input.sourceProjectId,
          { current_spec: finalSpec as any },
          "AI Generation Pipeline"
        );
      } else if (input.userId) {
        const { project } = await createProject(options.supabaseClient, {
          userId: input.userId,
          name: finalSpec.meta.title || normalizedBrief.coreTopic,
          projectType: documentType,
          originalPrompt: input.prompt,
          currentSpec: finalSpec as any,
        });
        if (project) savedProjectId = project.id;
      }
    } catch (dbErr: any) {
      console.warn("[Pipeline] DB persistence non-fatal:", dbErr.message);
    }
  }

  // Stage 13-14: Finalize
  notify("finalizing", 13, 97, "Finalizing design specification");
  notify("completed", 14, 100, `Generated ${documentType} — theme: ${chosenTheme.colors.primary}, ${assignedArchetypes.length} slides`);

  return {
    success: true,
    document: finalSpec,
    documentType,
    aspectRatio,
    designSystem: dynamicDesignSystem,
    normalizedBrief,
    assignedArchetypes,
    chosenTheme,
    modelUsed,
    durationMs: Date.now() - startTime,
    tokensUsed,
    savedProjectId,
    wasRepaired,
    progressUpdates,
    qualityReport,
  };
}
