import { NextRequest, NextResponse } from "next/server";
import { executeGenerationPipeline } from "@/lib/ai/generation-pipeline";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60; // 60s max execution duration for AI inference

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "A valid prompt or content source is required." }, { status: 400 });
    }

    // Attempt to authenticate request context via Supabase server client
    let supabaseClient: any = undefined;
    let userId: string | undefined = undefined;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        supabaseClient = supabase;
        userId = user.id;
      }
    } catch {
      // Unauthenticated or local development without active session
    }

    // Execute 14-stage generation pipeline
    const result = await executeGenerationPipeline(
      {
        prompt: prompt.trim(),
        uploadedSource: body.uploadedSource,
        documentType: body.projectType || body.documentType || "presentation",
        aspectRatio: body.aspectRatio,
        platform: body.platform,
        dimensions: body.dimensions,
        designMode: body.designMode || "auto",
        brandKitId: body.brandKitId,
        brandKitPalette: body.brandKitPalette,
        colorPreferences: body.colorPreferences,
        typographyPreferences: body.typographyPreferences,
        tone: body.tone,
        style: body.style,
        pageCount: body.pageCount ? Number(body.pageCount) : undefined,
        targetAudience: body.targetAudience,
        purpose: body.purpose,
        sourceProjectId: body.sourceProjectId || null,
        userId: userId || body.userId,
      },
      {
        supabaseClient,
      }
    );

    return NextResponse.json({
      document: result.document,
      designSystem: result.designSystem,
      meta: {
        documentType: result.documentType,
        aspectRatio: result.aspectRatio,
        modelUsed: result.modelUsed,
        durationMs: result.durationMs,
        tokensUsed: result.tokensUsed,
        wasRepaired: result.wasRepaired,
        assignedArchetypes: result.assignedArchetypes,
        savedProjectId: result.savedProjectId,
        progressUpdates: result.progressUpdates,
      },
    });
  } catch (error: any) {
    console.error("[AI Generation Route Error]:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during AI generation." },
      { status: 500 }
    );
  }
}
