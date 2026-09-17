/**
 * SlideCraft AI - Automated Design Quality Checker & Auto-Repair Engine Types
 */

export type QualityCategory =
  | "readability"
  | "alignment"
  | "spacing"
  | "visual_hierarchy"
  | "content_density"
  | "contrast"
  | "consistency"
  | "technical_validity";

export type QualityIssueCode =
  | "text_overflow"
  | "boundary_violation"
  | "overlapping_elements"
  | "unreadable_font_size"
  | "poor_color_contrast"
  | "inconsistent_alignment"
  | "uneven_spacing"
  | "excessive_content_density"
  | "repeated_layouts"
  | "broken_diagrams"
  | "unreadable_charts"
  | "missing_required_info"
  | "incorrect_aspect_ratio"
  | "empty_or_meaningless_elements";

export type QualitySeverity = "info" | "warning" | "error";

export interface QualityIssue {
  code: QualityIssueCode;
  category: QualityCategory;
  severity: QualitySeverity;
  message: string;
  pageIndex?: number;
  elementId?: string;
  fixable: boolean;
  suggestion?: string;
}

export interface AutoRepairAction {
  issueCode: QualityIssueCode;
  category: QualityCategory;
  description: string; // Plain-English user-facing explanation
  pageIndex?: number;
  elementId?: string;
  appliedFix: string;
}

export interface CategoryScore {
  category: QualityCategory;
  label: string;
  score: number; // 0 to 100
  weight: number; // e.g. 0.15
  status: "good" | "warning" | "critical";
  issuesCount: number;
}

export interface ComprehensiveQualityReport {
  overallScore: number; // 0 to 100
  passed: boolean;
  categories: Record<QualityCategory, CategoryScore>;
  issues: QualityIssue[];
  repairs: AutoRepairAction[];
  repairedAutomatically: boolean;
  timestamp: number;
}

export const CATEGORY_METADATA: Record<
  QualityCategory,
  { label: string; weight: number; description: string }
> = {
  readability: {
    label: "Readability",
    weight: 0.15,
    description: "Font scaling, character limits, text wrapping, and line count.",
  },
  alignment: {
    label: "Alignment",
    weight: 0.12,
    description: "Grid adherence, coordinate precision, and structural balance.",
  },
  spacing: {
    label: "Spacing",
    weight: 0.12,
    description: "Safe boundary padding, element margins, and gutter consistency.",
  },
  visual_hierarchy: {
    label: "Visual Hierarchy",
    weight: 0.13,
    description: "Distinction between titles, key metrics, and supporting content.",
  },
  content_density: {
    label: "Content Density",
    weight: 0.13,
    description: "Word density, card count limits, and whitespace ratio.",
  },
  contrast: {
    label: "Contrast",
    weight: 0.15,
    description: "WCAG 2.1 AA luminance ratios across backgrounds and surfaces.",
  },
  consistency: {
    label: "Consistency",
    weight: 0.10,
    description: "Layout variety across slides, uniform color themes, and styling.",
  },
  technical_validity: {
    label: "Technical Validity",
    weight: 0.10,
    description: "Schema integrity, unbroken diagram graphs, and valid chart datasets.",
  },
};
