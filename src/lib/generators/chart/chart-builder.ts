import {
  AspectRatio,
  CANVAS_PRESETS,
  PageSpec,
  ContentElement,
  LayoutArchetype,
} from "@/types/document-spec";
import { ProjectSpec } from "@/types/schemas/project-spec-schemas";
import { ChartConfig } from "./chart-types";
import {
  resolveFormatPreset,
  presetToThemeSpec,
  presetToPageBackground,
  presetToVisualDirection,
} from "@/lib/generators/format-design-engine";

export function buildChartDocumentSpec(config: ChartConfig): ProjectSpec {
  const aspectRatio: AspectRatio = config.aspectRatio || "16:9";
  const canvasPreset = CANVAS_PRESETS[aspectRatio] || CANVAS_PRESETS["16:9"];

  const formatPreset = resolveFormatPreset("chart", config.chartType);
  const theme = presetToThemeSpec(formatPreset);
  const background = presetToPageBackground(formatPreset);
  const visualDirection = presetToVisualDirection(formatPreset, config.title || "Analytical Chart");

  let archetype: LayoutArchetype = "chart_deep_dive";
  if (config.archetype === "kpi_dashboard") {
    archetype = "chart_kpi_dashboard";
  } else if (config.archetype === "comparison_view") {
    archetype = "chart_comparison_view";
  }

  const elements: ContentElement[] = [];

  // 1. KPI cards if present
  if (config.kpis && config.kpis.length > 0) {
    config.kpis.slice(0, 4).forEach((kpi, idx) => {
      elements.push({
        type: "metric",
        id: `chart-kpi-${idx + 1}`,
        value: kpi.value,
        label: kpi.label,
        delta: kpi.delta,
        trend: kpi.trend || "up",
      });
    });
  }

  // 2. Chart Element
  elements.push({
    type: "chart",
    id: "chart-element-main",
    chartType: config.chartType || "column",
    title: config.title,
    labels: config.labels,
    datasets: config.datasets,
    showLegend: true,
    scatterData: config.scatterData,
    kpis: config.kpis,
    recommendationNote: config.recommendationNote,
  });

  const page: PageSpec = {
    id: "chart-page-1",
    pageNumber: 1,
    archetype,
    title: config.title || "Analytical Chart Report",
    subtitle: config.subtitle || "Data synthesized and validated by SlideCraft AI",
    badge: (config.chartType || "DATA").toUpperCase(),
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
    documentType: "chart",
    meta: {
      title: config.title || "Chart Analysis",
      description: config.subtitle || "Quantitative analytics dashboard",
      author: "SlideCraft AI",
      tags: ["chart", config.chartType || "analytics", "dashboard"],
      purpose: "Quantitative visual storytelling",
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
