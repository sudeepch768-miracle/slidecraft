import {
  AspectRatio,
  CANVAS_PRESETS,
  PageSpec,
  ContentElement,
} from "@/types/document-spec";
import { ProjectSpec } from "@/types/schemas/project-spec-schemas";
import { InfographicConfig, INFOGRAPHIC_TYPES } from "./infographic-types";
import {
  resolveFormatPreset,
  presetToThemeSpec,
  presetToPageBackground,
  presetToVisualDirection,
} from "@/lib/generators/format-design-engine";

export function buildInfographicDocumentSpec(config: InfographicConfig): ProjectSpec {
  const meta = INFOGRAPHIC_TYPES[config.infographicType] || INFOGRAPHIC_TYPES.process;
  const aspectRatio: AspectRatio = config.dimensions || meta.suggestedAspectRatio || "9:16";
  const canvasPreset = CANVAS_PRESETS[aspectRatio] || CANVAS_PRESETS["9:16"];

  const formatPreset = resolveFormatPreset("infographic", config.infographicType);
  const theme = presetToThemeSpec(formatPreset);
  const background = presetToPageBackground(formatPreset);
  const visualDirection = presetToVisualDirection(formatPreset, config.title || "Visual Infographic");

  const primary = formatPreset.colors.primary;
  const secondary = formatPreset.colors.secondary;
  const accent = formatPreset.colors.accent;

  const defaultSteps: Array<{
    title: string;
    description: string;
    metric?: string;
    tag?: string;
    icon?: string;
  }> = [
    {
      title: "Discovery & Analysis",
      description: "Gather system inputs, stakeholder constraints, and baseline telemetry metrics.",
      metric: "Phase 01",
      tag: "Foundation",
    },
    {
      title: "Architecture Synthesis",
      description: "Map data contracts, vector abstractions, and modular component boundaries.",
      metric: "Phase 02",
      tag: "Design",
    },
    {
      title: "Automated Verification",
      description: "Run end-to-end integration test suites with zero error tolerance.",
      metric: "Phase 03",
      tag: "Quality",
    },
    {
      title: "Production Deployment",
      description: "Continuous delivery to high-availability global CDN edge network.",
      metric: "Phase 04",
      tag: "Scale",
    },
  ];

  const stepsToUse = config.steps && config.steps.length > 0 ? config.steps : defaultSteps;

  const elements: ContentElement[] = [
    {
      type: "infographic_workflow",
      id: "info-workflow-main",
      workflowType: config.infographicType,
      title: config.title,
      steps: stepsToUse.map((s, idx) => ({
        id: `step-${idx + 1}`,
        stepNumber: idx + 1,
        title: s.title,
        description: s.description,
        metric: s.metric,
        tag: s.tag,
        icon: s.icon,
        accentColor: idx % 2 === 0 ? secondary : accent,
      })),
      comparisonColumns: config.comparisonColumns,
    },
  ];

  const page: PageSpec = {
    id: "infographic-page-1",
    pageNumber: 1,
    archetype: meta.archetype,
    title: config.title || "Infographic Synthesis",
    subtitle: config.subtitle || "Structured data narrative powered by SlideCraft AI",
    badge: config.badge || meta.label.toUpperCase(),
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
    documentType: "infographic",
    meta: {
      title: config.title || "Visual Infographic",
      description: config.subtitle || meta.description,
      author: "SlideCraft AI",
      tags: ["infographic", config.infographicType, "data-storytelling"],
      purpose: meta.description,
    },
    canvas: {
      width: canvasPreset.width,
      height: canvasPreset.height,
      aspectRatio,
      unit: "px",
      dpi: 96,
    },
    theme,
    visualDirection,
    pages: [page],
  };
}
