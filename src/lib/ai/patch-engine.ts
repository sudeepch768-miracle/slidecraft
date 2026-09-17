import { DocumentSpec, PageSpec, PageSpecSchema, DocumentSpecSchema } from "@/types/document-spec";
import { extractJsonString } from "./parser";

export function applyPagePatch(
  originalDoc: DocumentSpec,
  pageIndex: number,
  rawModifiedPageJson: string
): DocumentSpec {
  const cleaned = extractJsonString(rawModifiedPageJson);
  const parsed = JSON.parse(cleaned);
  const validated = PageSpecSchema.parse(parsed);

  const updatedPages = [...originalDoc.pages];
  if (pageIndex >= 0 && pageIndex < updatedPages.length) {
    updatedPages[pageIndex] = {
      ...validated,
      pageNumber: pageIndex + 1, // ensure sequence integrity
    };
  }

  return {
    ...originalDoc,
    pages: updatedPages,
  };
}

export function applyGlobalPatch(
  originalDoc: DocumentSpec,
  rawModifiedDocJson: string
): DocumentSpec {
  const cleaned = extractJsonString(rawModifiedDocJson);
  const parsed = JSON.parse(cleaned);
  const validated = DocumentSpecSchema.parse(parsed);

  return validated;
}
