/**
 * SlideCraft AI - Quality Checker Bridge
 * Delegates to the comprehensive 14-rule Quality Engine in src/lib/quality/
 */

import { DocumentSpec } from "@/types/document-spec";
import { QualityReport, QualityCheckIssue } from "./editor-types";
import { analyzeQuality, repairAndAnalyze } from "@/lib/quality/quality-engine";
import { calculateContrastRatio } from "@/lib/quality/quality-rules";

export { calculateContrastRatio };

/**
 * Runs quality checks on a DocumentSpec with optional auto-repair.
 */
export function runQualityChecks(doc: DocumentSpec, autoRepair: boolean = true): QualityReport {
  if (autoRepair) {
    const { report } = repairAndAnalyze(doc);
    const mappedIssues: QualityCheckIssue[] = report.issues.map((i) => ({
      code: i.code,
      severity: i.severity,
      category: i.category,
      message: i.message,
      elementId: i.elementId,
      pageIndex: i.pageIndex,
      fixable: i.fixable,
    }));

    return {
      passed: report.passed,
      score: report.overallScore,
      issues: mappedIssues,
      repairedAutomatically: report.repairedAutomatically,
      repairs: report.repairs,
      comprehensiveReport: report,
    };
  }

  const report = analyzeQuality(doc);
  const mappedIssues: QualityCheckIssue[] = report.issues.map((i) => ({
    code: i.code,
    severity: i.severity,
    category: i.category,
    message: i.message,
    elementId: i.elementId,
    pageIndex: i.pageIndex,
    fixable: i.fixable,
  }));

  return {
    passed: report.passed,
    score: report.overallScore,
    issues: mappedIssues,
    repairedAutomatically: false,
    repairs: [],
    comprehensiveReport: report,
  };
}
