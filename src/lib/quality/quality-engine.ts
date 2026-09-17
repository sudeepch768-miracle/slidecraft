/**
 * SlideCraft AI - Master Quality Checker Engine
 * Evaluates 14 design rules, calculates 8 category scores (0-100),
 * orchestrates non-destructive auto-repairs, and generates comprehensive quality reports.
 */

import { DocumentSpec } from "@/types/document-spec";
import {
  ComprehensiveQualityReport,
  CategoryScore,
  QualityCategory,
  CATEGORY_METADATA,
  QualityIssue,
} from "./quality-types";
import { evaluateAllDesignRules } from "./quality-rules";
import { executeAllAutoRepairs } from "./auto-repair-engine";

const CATEGORIES: QualityCategory[] = [
  "readability",
  "alignment",
  "spacing",
  "visual_hierarchy",
  "content_density",
  "contrast",
  "consistency",
  "technical_validity",
];

/**
 * Evaluates document and produces a ComprehensiveQualityReport without modifying the document.
 */
export function analyzeQuality(doc: DocumentSpec): ComprehensiveQualityReport {
  const issues = evaluateAllDesignRules(doc);

  // Group issues by category
  const categoryIssuesMap: Record<QualityCategory, QualityIssue[]> = {
    readability: [],
    alignment: [],
    spacing: [],
    visual_hierarchy: [],
    content_density: [],
    contrast: [],
    consistency: [],
    technical_validity: [],
  };

  issues.forEach((issue) => {
    if (categoryIssuesMap[issue.category]) {
      categoryIssuesMap[issue.category].push(issue);
    }
  });

  // Calculate scores per category (0 to 100)
  const categoryScores: Record<QualityCategory, CategoryScore> = {} as any;
  let weightedScoreSum = 0;
  let totalWeights = 0;

  for (const cat of CATEGORIES) {
    const catIssues = categoryIssuesMap[cat];
    const errors = catIssues.filter((i) => i.severity === "error").length;
    const warnings = catIssues.filter((i) => i.severity === "warning").length;
    const infos = catIssues.filter((i) => i.severity === "info").length;

    // Deduct points based on severity
    const penalty = errors * 32 + warnings * 12 + infos * 4;
    const score = Math.max(0, Math.min(100, 100 - penalty));

    const meta = CATEGORY_METADATA[cat];
    const status: "good" | "warning" | "critical" =
      score >= 85 ? "good" : score >= 65 ? "warning" : "critical";

    categoryScores[cat] = {
      category: cat,
      label: meta.label,
      score,
      weight: meta.weight,
      status,
      issuesCount: catIssues.length,
    };

    weightedScoreSum += score * meta.weight;
    totalWeights += meta.weight;
  }

  const overallScore = Math.round(weightedScoreSum / (totalWeights || 1));
  const hasCriticalErrors = issues.some((i) => i.severity === "error");
  const passed = overallScore >= 70 && !hasCriticalErrors;

  return {
    overallScore,
    passed,
    categories: categoryScores,
    issues,
    repairs: [],
    repairedAutomatically: false,
    timestamp: Date.now(),
  };
}

/**
 * Runs auto-repairs on the document, then re-evaluates the repaired document.
 */
export function repairAndAnalyze(
  doc: DocumentSpec
): { repairedDocument: DocumentSpec; report: ComprehensiveQualityReport } {
  // 1. Detect issues before repairs
  const preReport = analyzeQuality(doc);

  // 2. Execute auto-repairs
  const repairs = executeAllAutoRepairs(doc);

  // 3. Evaluate the repaired document for post-repair score
  const postReport = analyzeQuality(doc);

  return {
    repairedDocument: doc,
    report: {
      ...postReport,
      issues: preReport.issues,
      repairs,
      repairedAutomatically: repairs.length > 0,
    },
  };
}
