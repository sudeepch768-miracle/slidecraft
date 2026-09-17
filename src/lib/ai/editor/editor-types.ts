import {
  DocumentSpec,
  PageSpec,
  ContentElement,
  LayoutArchetype,
  ThemeSpec,
  AspectRatio,
  PageBackground,
} from "@/types/document-spec";

export type EditScopeType = "document" | "page" | "element" | "section" | "auto";

export interface ResolvedScope {
  type: "document" | "page" | "element" | "section";
  targetName: string;
  pageIndex?: number;
  elementId?: string;
  sectionId?: string;
  confidence: number;
}

export interface ClarificationPayload {
  needsClarification: boolean;
  question: string;
  options: string[];
  suggestedScope?: EditScopeType;
}

export type PatchOperation =
  | { op: "update_text"; elementId: string; newText: string; field?: "content" | "title" | "subtitle" }
  | { op: "replace_element"; elementId: string; newElement: ContentElement }
  | { op: "move_element"; elementId: string; x: number; y: number }
  | { op: "resize_element"; elementId: string; w: number; h: number }
  | { op: "change_colors"; palette: Partial<ThemeSpec["colors"]>; targetScope?: "document" | "page" }
  | { op: "change_typography"; typography: Partial<ThemeSpec["typography"]> }
  | { op: "change_layout"; pageIndex: number; newArchetype: LayoutArchetype; elements?: ContentElement[] }
  | { op: "add_element"; pageIndex: number; element: ContentElement }
  | { op: "delete_element"; pageIndex: number; elementId: string }
  | { op: "reorder_slides"; pageOrder: number[] }
  | { op: "regenerate_slide"; pageIndex: number; newPageSpec: PageSpec }
  | { op: "regenerate_section"; sectionType: string; newElements: ContentElement[] }
  | { op: "update_page_background"; pageIndex: number; background: Partial<PageBackground>; syncThemeBackground?: boolean }
  | { op: "set_meta"; patch: Partial<DocumentSpec["meta"]> };

export interface DesignAlternative {
  id: string;
  title: string;
  description: string;
  document: DocumentSpec;
}

import { ComprehensiveQualityReport, AutoRepairAction } from "@/lib/quality/quality-types";

export interface QualityCheckIssue {
  severity: "info" | "warning" | "error";
  category: string;
  message: string;
  elementId?: string;
  pageIndex?: number;
  code?: string;
  fixable?: boolean;
}

export interface QualityReport {
  passed: boolean;
  score: number; // 0 to 100
  issues: QualityCheckIssue[];
  repairedAutomatically: boolean;
  repairs?: AutoRepairAction[];
  comprehensiveReport?: ComprehensiveQualityReport;
}

export interface ModificationResult {
  success: boolean;
  updatedDocument: DocumentSpec;
  scope: ResolvedScope;
  appliedOperations: string[];
  versionNumber?: number;
  clarification?: ClarificationPayload;
  alternatives?: DesignAlternative[];
  qualityReport: QualityReport;
}
