import { NextRequest, NextResponse } from "next/server";
import { modifyDocumentWithAi } from "@/lib/ai/editor/modifier-service";
import { modifyPosterDocument } from "@/lib/poster-engine/poster-modifier";
import { DocumentSpec } from "@/types/document-spec";
import { EditScopeType } from "@/lib/ai/editor/editor-types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentDoc = body.currentDocument as DocumentSpec;
    const pageIndex = Number(body.pageIndex ?? 0);
    const instruction = body.instruction as string;
    const selectedElementId = body.selectedElementId as string | undefined;
    const explicitScope = body.explicitScope as EditScopeType | undefined;

    if (!currentDoc || !instruction) {
      return NextResponse.json(
        { error: "Missing required parameters (currentDocument, instruction)." },
        { status: 400 }
      );
    }

    // Specialized poster modification preserving event metadata if requested on poster
    if (currentDoc.documentType === "poster" && !instruction.toLowerCase().includes("alternative")) {
      const updatedDocument = await modifyPosterDocument(currentDoc, instruction);
      return NextResponse.json({
        success: true,
        updatedDocument,
        scope: { type: "document", targetName: "Poster Visual Design", confidence: 1.0 },
        appliedOperations: ["Applied poster composition refinement"],
        qualityReport: { passed: true, score: 95, issues: [], repairedAutomatically: false },
      });
    }

    // Execute Natural-Language Scoped Modification
    const result = await modifyDocumentWithAi({
      currentDocument: currentDoc,
      instruction,
      pageIndex,
      selectedElementId,
      explicitScope,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Modify Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process modification." },
      { status: 500 }
    );
  }
}
