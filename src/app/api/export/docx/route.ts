import { NextRequest, NextResponse } from "next/server";
import { compileDocumentToDocxBuffer } from "@/lib/compiler/docx/docx-builder";
import { DocumentSpec, DocumentSpecSchema } from "@/types/document-spec";
import { createClient } from "@/lib/supabase/server";
import { uploadUserFile, createSignedDownloadUrl } from "@/lib/supabase/storage";
import { createGeneratedAsset } from "@/lib/supabase/db";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawDoc = body.document;
    const projectId = body.projectId;

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

    // Compile DOCX buffer using native docx engine
    const buffer = await compileDocumentToDocxBuffer(document);

    const safeTitle = (document.meta.title || "document")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/gi, "_");
    const fileName = `${safeTitle}-${Date.now()}.docx`;

    // Attempt Supabase authentication and private storage upload
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const uploadRes = await uploadUserFile(
          supabase,
          "generated-assets",
          user.id,
          fileName,
          buffer,
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

        if (!uploadRes.error && uploadRes.path) {
          let assetId: string | undefined = undefined;
          if (projectId) {
            const { asset } = await createGeneratedAsset(supabase, {
              projectId,
              userId: user.id,
              assetType: "pdf", // store as doc asset
              storagePath: uploadRes.path,
              mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              fileSize: buffer.length,
            });
            assetId = asset?.id;
          }

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
      console.warn("[DOCX Export] Cloud storage upload bypassed:", storageErr.message);
    }

    // Direct binary stream response fallback
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("DOCX Export API Error:", error);
    return NextResponse.json(
      { error: "Failed to compile DOCX document.", message: error.message },
      { status: 500 }
    );
  }
}
