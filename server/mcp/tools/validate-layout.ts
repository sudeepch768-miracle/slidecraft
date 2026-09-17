/**
 * MCP Tool: validate_layout
 *
 * Runs SlideCraft's comprehensive 14-rule design and quality checker on a project
 * or in-memory DocumentSpec. Detects element collisions/overlaps, readability flaws,
 * contrast issues, spacing density, and technical validity.
 */

import { analyzeQuality } from "@/lib/quality/quality-engine";
import { DocumentSpec } from "@/types/document-spec";
import { validateProjectOwnership } from "../auth";
import { mcpLogger } from "../logger";
import {
  ValidateLayoutInput,
  ValidateLayoutInputSchema,
  ValidateLayoutResultData,
  McpToolResponse,
} from "../types";

export async function handleValidateLayout(
  input: ValidateLayoutInput
): Promise<McpToolResponse<ValidateLayoutResultData>> {
  const parsed = ValidateLayoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: parsed.error.errors.map((e) => e.message).join("; "),
      },
    };
  }

  let doc: DocumentSpec;
  let targetId = "in_memory";

  if (parsed.data.documentSpec) {
    doc = parsed.data.documentSpec;
  } else if (parsed.data.projectId) {
    const auth = await validateProjectOwnership(
      parsed.data.projectId,
      parsed.data.userId || "anonymous"
    );
    if (!auth.authorized || !auth.project) {
      return {
        success: false,
        error: auth.error || {
          code: "UNAUTHORIZED",
          message: "Project access unauthorized.",
        },
      };
    }
    doc = auth.project.current_spec;
    targetId = auth.project.id;
  } else {
    return {
      success: false,
      error: {
        code: "MISSING_PAYLOAD",
        message: "Neither projectId nor documentSpec was provided.",
      },
    };
  }

  mcpLogger.info(`Executing validate_layout for ${targetId}`);

  try {
    const report = analyzeQuality(doc);

    const collisionIssues = report.issues.filter((i) => i.code === "overlapping_elements");
    const warnings = report.issues
      .filter((i) => i.severity === "warning" || i.severity === "error")
      .map((i) => `[${i.category.toUpperCase()}] ${i.message}`);

    const categoriesSummary: Record<string, any> = {};
    for (const [key, cat] of Object.entries(report.categories)) {
      categoriesSummary[key] = {
        label: cat.label,
        score: cat.score,
        status: cat.status,
        issuesCount: cat.issuesCount,
      };
    }

    return {
      success: true,
      data: {
        overallScore: report.overallScore,
        passed: report.passed,
        collisionCount: collisionIssues.length,
        issueCount: report.issues.length,
        categories: categoriesSummary,
        issues: report.issues.map((i) => ({
          code: i.code,
          category: i.category,
          severity: i.severity,
          message: i.message,
          pageIndex: i.pageIndex,
          elementId: i.elementId,
          suggestion: i.suggestion,
        })),
      },
      affectedIds: [targetId],
      warnings: warnings.slice(0, 10), // Return top 10 warnings
      changeSummary: `Layout evaluation completed: Score ${report.overallScore}/100 (${report.passed ? "PASSED" : "NEEDS_REVISION"}), ${collisionIssues.length} collisions detected, ${report.issues.length} total issues found.`,
    };
  } catch (err: any) {
    mcpLogger.error("Error executing validate_layout", err);
    return {
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: err.message || "Quality engine failed to analyze layout.",
      },
    };
  }
}
