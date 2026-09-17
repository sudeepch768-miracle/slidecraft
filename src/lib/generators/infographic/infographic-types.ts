import { AspectRatio, LayoutArchetype } from "@/types/document-spec";

export type InfographicType =
  | "process"
  | "timeline"
  | "comparison"
  | "statistics"
  | "hierarchy"
  | "cause_effect"
  | "step_by_step"
  | "circular_workflow";

export interface InfographicMeta {
  id: InfographicType;
  archetype: LayoutArchetype;
  label: string;
  description: string;
  suggestedAspectRatio: AspectRatio;
}

export const INFOGRAPHIC_TYPES: Record<InfographicType, InfographicMeta> = {
  process: {
    id: "process",
    archetype: "infographic_process",
    label: "Linear Process Infographic",
    description: "Multi-stage sequential workflows with milestones and key metrics",
    suggestedAspectRatio: "9:16",
  },
  timeline: {
    id: "timeline",
    archetype: "infographic_timeline",
    label: "Vertical Timeline",
    description: "Chronological journey, historical events, roadmap progression",
    suggestedAspectRatio: "9:16",
  },
  comparison: {
    id: "comparison",
    archetype: "infographic_comparison",
    label: "Side-by-Side Comparison",
    description: "Direct comparative feature matrices, pros vs cons, before vs after",
    suggestedAspectRatio: "9:16",
  },
  statistics: {
    id: "statistics",
    archetype: "infographic_statistics",
    label: "Statistical Data Infographic",
    description: "Data-heavy layout showcasing high-impact metrics and percentage cards",
    suggestedAspectRatio: "9:16",
  },
  hierarchy: {
    id: "hierarchy",
    archetype: "infographic_hierarchy",
    label: "Organizational Hierarchy",
    description: "Top-down organizational structure, taxonomies, and tiered architectures",
    suggestedAspectRatio: "9:16",
  },
  cause_effect: {
    id: "cause_effect",
    archetype: "infographic_cause_effect",
    label: "Cause & Effect Diagram",
    description: "Root-cause analysis, drivers, impacts, and outcome relationships",
    suggestedAspectRatio: "9:16",
  },
  step_by_step: {
    id: "step_by_step",
    archetype: "infographic_step_by_step",
    label: "Step-by-Step Guide",
    description: "Numbered instructional guide with clear instructions and takeaway tips",
    suggestedAspectRatio: "9:16",
  },
  circular_workflow: {
    id: "circular_workflow",
    archetype: "infographic_circular_workflow",
    label: "Circular Lifecycle & Loop",
    description: "Continuous feedback cycles, iteration loops, agile workflows",
    suggestedAspectRatio: "9:16",
  },
};

export interface InfographicConfig {
  infographicType: InfographicType;
  title: string;
  subtitle?: string;
  badge?: string;
  dimensions?: AspectRatio;
  steps?: Array<{
    title: string;
    description: string;
    metric?: string;
    tag?: string;
    icon?: string;
  }>;
  comparisonColumns?: Array<{
    columnTitle: string;
    badge?: string;
    items: Array<{ label: string; value: string; highlight?: boolean }>;
  }>;
  primaryColor?: string;
  secondaryColor?: string;
}
