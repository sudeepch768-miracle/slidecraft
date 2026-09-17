import { NextRequest, NextResponse } from "next/server";
import {
  generatePresentationPlan,
  refineSlideContent,
  convertSlideContentType,
  executePlannerChatInstruction,
  validatePresentationPlan,
  regenerateSlide,
  regenerateSection,
  PlannerGenerateParams,
} from "@/lib/ai/content-planner";
import { PresentationPlan, SlideContentType } from "@/types/planner";
import { generateVisualDirection } from "@/lib/ai/visual-direction-engine";
import { visualDirectionTracer } from "@/lib/ai/visual-direction-tracer";

export const maxDuration = 60; // 60s max execution duration for AI planning

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "generate_plan";

    switch (action) {
      case "generate_plan": {
        const {
          prompt,
          slideCount,
          targetAudience,
          presentationType,
          tone,
          language,
          contentDepth,
          estimatedDuration,
          citationPreference,
          includeSpeakerNotes,
          templateConfig,
          projectId,
          documentId,
          preferredStyleFamily,
          reuseStyle,
        } = body;

        if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
          return NextResponse.json(
            { error: "A valid presentation prompt is required." },
            { status: 400 }
          );
        }

        const params: PlannerGenerateParams = {
          prompt: prompt.trim(),
          slideCount: slideCount ? Number(slideCount) : 10,
          targetAudience: targetAudience || "General Professional & Academic",
          presentationType: presentationType || "educational",
          tone: tone || "Modern Editorial",
          language: language || "English",
          contentDepth: contentDepth || "detailed",
          estimatedDuration: estimatedDuration || "20-25 mins",
          citationPreference: citationPreference || "academic_ieee",
          includeSpeakerNotes: includeSpeakerNotes !== false,
          templateConfig: templateConfig || { mode: "new_design" },
        };

        const effectiveProjId = projectId || `proj-${Date.now()}`;
        const effectiveDocId = documentId || `doc-${Date.now()}`;

        // Stage 1: Requirement Analysis & Visual Direction Synthesis (Authoritative Generation Point)
        const visualDirection = generateVisualDirection(params.prompt || "Professional Presentation", {
          preferredFamily: preferredStyleFamily,
          reuseStyle,
        });

        visualDirectionTracer.recordTrace({
          projectId: effectiveProjId,
          documentId: effectiveDocId,
          visualDirectionId: visualDirection.id,
          variationSeed: visualDirection.variationSeed,
          styleFamily: visualDirection.styleFamily,
          stage: "REQUIREMENTS_ANALYZED",
          generatedAtStage: "planner_api",
        });

        visualDirectionTracer.recordTrace({
          projectId: effectiveProjId,
          documentId: effectiveDocId,
          visualDirectionId: visualDirection.id,
          variationSeed: visualDirection.variationSeed,
          styleFamily: visualDirection.styleFamily,
          stage: "VISUAL_DIRECTION_CREATED",
          generatedAtStage: "planner_api",
        });

        const plan = await generatePresentationPlan(params, visualDirection);

        visualDirectionTracer.recordTrace({
          projectId: effectiveProjId,
          documentId: effectiveDocId,
          visualDirectionId: visualDirection.id,
          variationSeed: visualDirection.variationSeed,
          styleFamily: visualDirection.styleFamily,
          stage: "PLAN_CREATED",
          generatedAtStage: "planner_api",
        });

        const validation = validatePresentationPlan(plan);

        return NextResponse.json({
          success: true,
          plan,
          validation,
        });
      }

      case "refine_slide": {
        const { plan, slideId, refinementAction } = body;

        if (!plan || !slideId || !refinementAction) {
          return NextResponse.json(
            { error: "plan, slideId, and refinementAction are required." },
            { status: 400 }
          );
        }

        const clonedPlan: PresentationPlan = JSON.parse(JSON.stringify(plan));
        const targetIdx = clonedPlan.slidePlans.findIndex(
          (s, idx) => (s.id && s.id === slideId) || String(s.slideNumber) === String(slideId) || String(idx) === String(slideId)
        );

        if (targetIdx !== -1) {
          clonedPlan.slidePlans[targetIdx] = await refineSlideContent(
            clonedPlan.slidePlans[targetIdx],
            refinementAction
          );
          clonedPlan.updatedAt = new Date().toISOString();
        }

        const validation = validatePresentationPlan(clonedPlan);

        return NextResponse.json({
          success: true,
          plan: clonedPlan,
          validation,
        });
      }

      case "convert_type": {
        const { plan, slideId, targetType } = body;

        if (!plan || !slideId || !targetType) {
          return NextResponse.json(
            { error: "plan, slideId, and targetType are required." },
            { status: 400 }
          );
        }

        const clonedPlan: PresentationPlan = JSON.parse(JSON.stringify(plan));
        const targetIdx = clonedPlan.slidePlans.findIndex(
          (s, idx) => (s.id && s.id === slideId) || String(s.slideNumber) === String(slideId) || String(idx) === String(slideId)
        );

        if (targetIdx !== -1) {
          clonedPlan.slidePlans[targetIdx] = convertSlideContentType(
            clonedPlan.slidePlans[targetIdx],
            targetType as SlideContentType
          );
          clonedPlan.updatedAt = new Date().toISOString();
        }

        const validation = validatePresentationPlan(clonedPlan);

        return NextResponse.json({
          success: true,
          plan: clonedPlan,
          validation,
        });
      }

      case "regenerate_slide": {
        const { plan, slideId } = body;
        if (!plan || !slideId) {
          return NextResponse.json(
            { error: "plan and slideId are required for regenerate_slide." },
            { status: 400 }
          );
        }

        const updatedPlan = await regenerateSlide(plan as PresentationPlan, String(slideId));
        const validation = validatePresentationPlan(updatedPlan);

        return NextResponse.json({
          success: true,
          plan: updatedPlan,
          validation,
        });
      }

      case "regenerate_section": {
        const { plan, sectionName } = body;
        if (!plan || !sectionName) {
          return NextResponse.json(
            { error: "plan and sectionName are required for regenerate_section." },
            { status: 400 }
          );
        }

        const updatedPlan = await regenerateSection(plan as PresentationPlan, String(sectionName));
        const validation = validatePresentationPlan(updatedPlan);

        return NextResponse.json({
          success: true,
          plan: updatedPlan,
          validation,
        });
      }

      case "chat_instruction": {
        const { plan, instruction } = body;

        if (!plan || !instruction || typeof instruction !== "string") {
          return NextResponse.json(
            { error: "plan and instruction string are required." },
            { status: 400 }
          );
        }

        const updatedPlan = await executePlannerChatInstruction(
          plan as PresentationPlan,
          instruction.trim()
        );
        const validation = validatePresentationPlan(updatedPlan);

        return NextResponse.json({
          success: true,
          plan: updatedPlan,
          explanation: `Applied instruction: "${instruction}" across the presentation plan.`,
          validation,
        });
      }

      case "validate_plan": {
        const { plan } = body;

        if (!plan) {
          return NextResponse.json(
            { error: "plan is required for validation." },
            { status: 400 }
          );
        }

        const validation = validatePresentationPlan(plan as PresentationPlan);

        return NextResponse.json({
          success: true,
          validation,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown planner action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("[Planner API Route Error]:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred in the Presentation Planner.",
      },
      { status: 500 }
    );
  }
}
