/**
 * MCP Tool: change_page_background
 *
 * Surgically updates `page.background` for a specific slide or document page.
 *
 * Strict invariants:
 * - Updates ONLY `page.background` (plus legacy compatibility fields).
 * - Strictly NEVER alters, deletes, or regenerates text, images, shapes, or layout.
 * - Provides an `undoPatch` containing previous state for instant reversibility.
 */

import { executePatches } from "@/lib/ai/editor/patch-engine";
import { DocumentSpec } from "@/types/document-spec";
import { validateProjectOwnership } from "../auth";
import { mcpLogger } from "../logger";
import {
  ChangePageBackgroundInput,
  ChangePageBackgroundInputSchema,
  ChangePageBackgroundResultData,
  McpToolResponse,
} from "../types";

export async function handleChangePageBackground(
  input: ChangePageBackgroundInput
): Promise<McpToolResponse<ChangePageBackgroundResultData>> {
  const parsed = ChangePageBackgroundInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: parsed.error.errors.map((e) => e.message).join("; "),
      },
    };
  }

  const { projectId, userId, pageIndex, background, syncThemeBackground } = parsed.data;

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

  if (pageIndex < 0 || pageIndex >= doc.pages.length) {
    return {
      success: false,
      error: {
        code: "INDEX_OUT_OF_BOUNDS",
        message: `pageIndex ${pageIndex} is out of bounds (document has ${doc.pages.length} pages).`,
      },
    };
  }

  const targetPage = doc.pages[pageIndex];
  const pageId = targetPage.id;

  // Snapshot previous background and content elements to guarantee zero element corruption
  const previousBackground = JSON.parse(
    JSON.stringify(targetPage.background || { type: "solid", value: doc.theme?.colors?.background || "#FFFFFF" })
  );
  const elementsBefore = JSON.stringify(targetPage.elements);

  mcpLogger.info(
    `Executing change_page_background on page ${pageIndex + 1} (${pageId}) of ${targetId}`
  );

  // Execute surgical background patch through SlideCraft's canonical patch engine
  const { updatedDocument, appliedSummary } = executePatches(doc, [
    {
      op: "update_page_background",
      pageIndex,
      background,
      syncThemeBackground,
    },
  ]);

  // Strict invariant verification: elements must be 100% byte-identical
  const elementsAfter = JSON.stringify(updatedDocument.pages[pageIndex].elements);
  if (elementsBefore !== elementsAfter) {
    mcpLogger.error(
      `CRITICAL INVARIANT VIOLATION: Elements on slide ${pageIndex + 1} were mutated during background change!`
    );
    return {
      success: false,
      error: {
        code: "INVARIANT_VIOLATION",
        message: "Safety assertion failed: Content elements were altered during background modification.",
      },
    };
  }

  // Generate undo patch
  const undoPatch = {
    tool: "change_page_background",
    pageIndex,
    background: previousBackground,
    syncThemeBackground,
  };

  return {
    success: true,
    data: {
      pageIndex,
      pageId,
      previousBackground,
      newBackground: updatedDocument.pages[pageIndex].background,
      updatedDocument,
    },
    affectedIds: [pageId, targetId],
    changeSummary: `Page ${pageIndex + 1} background updated to ${background.type} (${background.value}) with 0 element alterations.`,
    undoPatch,
  };
}
