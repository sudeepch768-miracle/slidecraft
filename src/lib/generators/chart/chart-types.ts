import { AspectRatio, LayoutArchetype } from "@/types/document-spec";

export type ChartTypeKind =
  | "bar"
  | "column"
  | "line"
  | "pie"
  | "doughnut"
  | "area"
  | "scatter";

export type ChartArchetypeCategory =
  | "kpi_dashboard"
  | "comparison_view"
  | "deep_dive";

export interface ChartTypeMeta {
  id: ChartTypeKind;
  label: string;
  bestFor: string;
  suitableDataTypes: string[];
}

export const CHART_TYPES_META: Record<ChartTypeKind, ChartTypeMeta> = {
  column: {
    id: "column",
    label: "Vertical Column Chart",
    bestFor: "Comparing discrete categories or showing changes over small time frames",
    suitableDataTypes: ["categorical", "temporal_discrete"],
  },
  bar: {
    id: "bar",
    label: "Horizontal Bar Chart",
    bestFor: "Ranking items, long category labels, or survey rankings",
    suitableDataTypes: ["categorical", "rankings"],
  },
  line: {
    id: "line",
    label: "Continuous Line Chart",
    bestFor: "Time-series trends, financial trajectories, and continuous rates",
    suitableDataTypes: ["temporal_continuous", "rate_over_time"],
  },
  area: {
    id: "area",
    label: "Cumulative Area Chart",
    bestFor: "Volume trends over time and part-to-whole accumulation",
    suitableDataTypes: ["temporal_continuous", "volume"],
  },
  pie: {
    id: "pie",
    label: "Proportional Pie Chart",
    bestFor: "Part-to-whole breakdowns summing to 100% (max 5-6 segments)",
    suitableDataTypes: ["percentage_share", "proportions"],
  },
  doughnut: {
    id: "doughnut",
    label: "Doughnut Chart",
    bestFor: "Part-to-whole proportions with central metric focus",
    suitableDataTypes: ["percentage_share", "kpi_ratio"],
  },
  scatter: {
    id: "scatter",
    label: "Correlation Scatter Plot",
    bestFor: "Two continuous variables showing correlation, clusters, or outliers",
    suitableDataTypes: ["numeric_x_numeric_y", "bivariate"],
  },
};

export interface ChartRecommendation {
  recommendedType: ChartTypeKind;
  confidence: number; // 0 to 1
  reasoning: string;
  warnings: string[];
  alternativeTypes: ChartTypeKind[];
}

export interface ChartConfig {
  chartType?: ChartTypeKind;
  archetype?: ChartArchetypeCategory;
  title: string;
  subtitle?: string;
  labels: string[];
  datasets: Array<{
    name: string;
    data: number[];
    color?: string;
  }>;
  scatterData?: Array<{ x: number; y: number; z?: number; name?: string }>;
  kpis?: Array<{ label: string; value: string; delta?: string; trend?: "up" | "down" | "neutral" }>;
  recommendationNote?: string;
  aspectRatio?: AspectRatio;
}
