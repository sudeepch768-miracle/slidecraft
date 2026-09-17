/**
 * MCP Tool: apply_change_to_all_pages
 *
 * Uniformly applies a design update across all pages of a DocumentSpec:
 * - "background": updates page.background for every page while preserving all elements
 * - "theme_palette": updates global theme colors
 * - "typography": updates global typography tokens
 *
 * Includes full undo support and asserts zero content element corruption.
 */

import { executePatches } from "@/lib/ai/editor/patch-engine";
import { PatchOperation } from "@/lib/ai/editor/editor-types";
import { DocumentSpec } from "@/types/document-spec";
import { validateProjectOwnership } from "../auth";
import { mcpLogger } from "../logger";
import {
  ApplyChangeToAllPagesInput,
  ApplyChangeToAllPagesInputSchema,
  ApplyChangeToAllPagesResultData,
  McpToolResponse,
} from "../types";

export async function handleApplyChangeToAllPages(
  input: ApplyChangeToAllPagesInput
): Promise<McpToolResponse<ApplyChangeToAllPagesResultData>> {
  const parsed = ApplyChangeToAllPagesInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: parsed.error.errors.map((e) => e.message).join("; "),
      },
    };
  }

  const { projectId, userId, changeType, background, palette, typography } = parsed.data;

  let doc: DocumentSpec;
  let targetId = "in_memory";

  if (parsed.data.documentSpec) {
    doc = parsed.data.documentSpec;
  } else if (projectId) {
    const auth = await validateProjectOwnership(projectId, userId || "anonymous");
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

  mcpLogger.info(
    `Executing apply_change_to_all_pages (${changeType}) across ${doc.pages.length} pages of ${targetId}`
  );

  const affectedPageIndices: number[] = [];
  const affectedPageIds: string[] = [];
  const patches: PatchOperation[] = [];

  // Snapshot before state for undo and assertion
  const elementsBeforeByPage = doc.pages.map((p) => JSON.stringify(p.elements));
  const previousBackgroundsByPage = doc.pages.map((p) =>
    JSON.parse(JSON.stringify(p.background || { type: "solid", value: doc.theme?.colors?.background || "#FFFFFF" }))
  );
  const previousThemeColors = doc.theme ? JSON.parse(JSON.stringify(doc.theme.colors)) : null;
  const previousTypography = doc.theme ? JSON.parse(JSON.stringify(doc.theme.typography)) : null;

  if (changeType === "background" && background) {
    for (let i = 0; i < doc.pages.length; i++) {
      affectedPageIndices.push(i);
      affectedPageIds.push(doc.pages[i].id);
      patches.push({
        op: "update_page_background",
        pageIndex: i,
        background,
      });
    }
  } else if (changeType === "theme_palette" && palette) {
    patches.push({
      op: "change_colors",
      palette,
    });
    affectedPageIds.push(targetId);
  } else if (changeType === "typography" && typography) {
    patches.push({
      op: "change_typography",
      typography,
    });
    affectedPageIds.push(targetId);
  }

  const { updatedDocument, appliedSummary } = executePatches(doc, patches);

  // Assert that elements on all pages are completely unchanged
  for (let i = 0; i < updatedDocument.pages.length; i++) {
    const afterElements = JSON.stringify(updatedDocument.pages[i].elements);
    if (elementsBeforeByPage[i] !== afterElements) {
      mcpLogger.error(
        `CRITICAL INVARIANT VIOLATION: Page ${i + 1} elements altered during apply_change_to_all_pages!`
      );
      return {
        success: false,
        error: {
          code: "INVARIANT_VIOLATION",
          message: `Safety assertion failed: Elements on page ${i + 1} were altered during bulk update.`,
        },
      };
    }
  }

  // Construct structured undo patch
  let undoPatch: Record<string, any>;
  if (changeType === "background") {
    undoPatch = {
      tool: "apply_change_to_all_pages",
      changeType: "background_revert",
      previousBackgroundsByPage,
    };
  } else if (changeType === "theme_palette") {
    undoPatch = {
      tool: "apply_change_to_all_pages",
      changeType: "theme_palette",
      palette: previousThemeColors,
    };
  } else {
    undoPatch = {
      tool: "apply_change_to_all_pages",
      changeType: "typography",
      typography: previousTypography,
    };
  }

  return {
    success: true,
    data: {
      changeType,
      affectedPageIndices,
      affectedPageIds,
      updatedDocument,
    },
    affectedIds: affectedPageIds,
    changeSummary: `Applied ${changeType} update to all ${doc.pages.length} pages (${appliedSummary.length} operations applied, 0 element corruptions).`,
    undoPatch,
  };
}
