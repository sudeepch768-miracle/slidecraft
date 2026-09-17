import { NextRequest, NextResponse } from "next/server";
import { compileDocumentToPptx } from "@/lib/compiler/pptx/pptx-builder";
import { DocumentSpec, DocumentSpecSchema } from "@/types/document-spec";
import { validateBeforeExport } from "@/lib/compiler/pptx/pre-export-validator";
import { createClient } from "@/lib/supabase/server";
import { uploadUserFile, createSignedDownloadUrl } from "@/lib/supabase/storage";
import { createGeneratedAsset } from "@/lib/supabase/db";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawDoc = body.document;
    const projectId = body.projectId;
    const designStyle = body.designStyle;

    if (!rawDoc) {
      return NextResponse.json({ error: "Document specification is required." }, { status: 400 });
    }

    const val = DocumentSpecSchema.safeParse(rawDoc);
    if (!val.success) {
      return NextResponse.json(
        { error: "Invalid document specification.", details: val.error.format() },
        { status: 400 }
      );
    }
    const document: DocumentSpec = val.data;

    // Run pre-export validation
    const exportValidation = validateBeforeExport(document);
    if (!exportValidation.canExport) {
      return NextResponse.json(
        {
          error: "Document failed pre-export validation.",
          issues: exportValidation.issues,
        },
        { status: 422 }
      );
    }

    // Compile PPTX using native PptxGenJS engine with visual direction tracing
    const pptx = await compileDocumentToPptx(document, {
      designStyle,
      projectId: projectId || document.id || "proj-export",
      documentId: document.id || "doc-export",
    });
    const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;

    const safeTitle = (document.meta.title || "presentation")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/gi, "_");
    const fileName = `${safeTitle}-${Date.now()}.pptx`;

    // Attempt Supabase authentication and private storage upload
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Upload to user-scoped folder in generated-assets bucket
        const uploadRes = await uploadUserFile(
          supabase,
          "generated-assets",
          user.id,
          fileName,
          buffer,
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        );

        if (!uploadRes.error && uploadRes.path) {
          // Record generated asset in database
          let assetId: string | undefined = undefined;
          if (projectId) {
            const { asset } = await createGeneratedAsset(supabase, {
              projectId,
              userId: user.id,
              assetType: "pptx",
              storagePath: uploadRes.path,
              mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              fileSize: buffer.length,
            });
            assetId = asset?.id;
          }

          // Generate secure signed download URL (1 hour expiry)
          const { signedUrl } = await createSignedDownloadUrl(
            supabase,
            "generated-assets",
            uploadRes.path,
            3600
          );

          if (signedUrl) {
            return NextResponse.json({
              success: true,
              downloadUrl: signedUrl,
              fileName,
              fileSize: buffer.length,
              assetId,
              storagePath: uploadRes.path,
            });
          }
        }
      }
    } catch (storageErr: any) {
      console.warn("[PPTX Export] Cloud storage upload bypassed:", storageErr.message);
    }

    // Fallback for unauthenticated or local usage: return binary stream directly
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("[PPTX Export Route Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PPTX file." },
      { status: 500 }
    );
  }
}
