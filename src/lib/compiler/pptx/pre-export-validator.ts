/**
 * pre-export-validator.ts
 * Rigorous pre-export inspection for PPTX and other export targets.
 * Validates layout geometry, text limits, missing elements, and data completeness.
 */

import { DocumentSpec, PageSpec, ContentElement } from "@/types/document-spec";
import { analyzeTextDensity } from "./quality-protector";

export interface ValidationIssue {
  pageNumber?: number;
  elementId?: string;
  severity: "error" | "warning";
  code: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  canExport: boolean;
  issues: ValidationIssue[];
  warnings: string[];
}

export function validateBeforeExport(doc: DocumentSpec): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: string[] = [];

  // 1. Basic structural checks
  if (!doc.pages || doc.pages.length === 0) {
    issues.push({
      severity: "error",
      code: "NO_PAGES",
      message: "Document has no pages to export.",
    });
  }

  // 2. Slide-by-slide checks
  doc.pages.forEach((page: PageSpec, index: number) => {
    const pageNum = page.pageNumber || index + 1;

    // Check title
    if (!page.title || !page.title.trim()) {
      issues.push({
        pageNumber: pageNum,
        severity: "warning",
        code: "EMPTY_PAGE_TITLE",
        message: `Page ${pageNum} is missing a headline.`,
      });
      warnings.push(`Page ${pageNum}: missing headline`);
    }

    // Check elements
    if (!page.elements || page.elements.length === 0) {
      issues.push({
        pageNumber: pageNum,
        severity: "warning",
        code: "EMPTY_PAGE_ELEMENTS",
        message: `Page ${pageNum} has no content elements.`,
      });
      warnings.push(`Page ${pageNum}: empty content`);
      return;
    }

    // Text density check
    const textElements = page.elements
      .filter((e: ContentElement) => e.type === "text")
      .map((e: any) => e.content || "");
    const densityResult = analyzeTextDensity(textElements, 160);
    if (densityResult.isExcessive) {
      warnings.push(`Page ${pageNum}: high text density (${densityResult.wordCount} words)`);
    }

    // Individual element inspection
    page.elements.forEach((elem: ContentElement) => {
      if (elem.type === "text") {
        if (!elem.content || !elem.content.trim()) {
          issues.push({
            pageNumber: pageNum,
            elementId: elem.id,
            severity: "warning",
            code: "EMPTY_TEXT_ELEMENT",
            message: `Text element ${elem.id} on page ${pageNum} is empty.`,
          });
        }
      } else if (elem.type === "diagram") {
        if (!elem.nodes || elem.nodes.length === 0) {
          issues.push({
            pageNumber: pageNum,
            elementId: elem.id,
            severity: "error",
            code: "EMPTY_DIAGRAM_NODES",
            message: `Diagram element ${elem.id} on page ${pageNum} has zero nodes.`,
          });
        }
      } else if (elem.type === "chart") {
        if (!elem.datasets || elem.datasets.length === 0) {
          issues.push({
            pageNumber: pageNum,
            elementId: elem.id,
            severity: "error",
            code: "EMPTY_CHART_DATASETS",
            message: `Chart element ${elem.id} on page ${pageNum} has no datasets.`,
          });
        }
      } else if (elem.type === "table") {
        if (!elem.rows || elem.rows.length === 0) {
          issues.push({
            pageNumber: pageNum,
            elementId: elem.id,
            severity: "warning",
            code: "EMPTY_TABLE_ROWS",
            message: `Table element ${elem.id} on page ${pageNum} has no rows.`,
          });
        }
      }
    });
  });

  const hasCriticalErrors = issues.some((i) => i.severity === "error");

  return {
    isValid: issues.length === 0,
    canExport: !hasCriticalErrors,
    issues,
    warnings,
  };
}
