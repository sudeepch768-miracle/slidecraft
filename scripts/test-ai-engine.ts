import { getAiService, setAiServiceForTesting } from "../src/lib/ai/service/ai-factory";
import { AiService, AiMessage, AiCompletionOptions, AiCompletionResult } from "../src/lib/ai/service/ai-service-interface";
import { normalizeContentInput } from "../src/lib/ai/content-normalizer";
import { classifyContent, selectLayoutArchetype } from "../src/lib/ai/layout-selector";
import { selectThemeFromPrompt } from "../src/lib/ai/theme-generator";
import {
  validateFormatSpec,
  PresentationSpecSchema,
  PosterSpecSchema,
  InfographicSpecSchema,
  SocialDesignSpecSchema,
  ResumeSpecSchema,
  LetterSpecSchema,
  DiagramSpecSchema,
  ChartSpecSchema,
} from "../src/types/schemas/project-spec-schemas";

import {
  executeGenerationPipeline,
  createDeterministicFallbackDoc,
  PipelineProgressUpdate,
} from "../src/lib/ai/generation-pipeline";
import { DocumentType } from "../src/types/document-spec";

// Mock AI Service for deterministic offline test verification
class MockTestAiService implements AiService {
  readonly providerName = "mock-groq";
  readonly defaultModel = "llama-3.3-70b-mock";
  readonly fallbackModel = "llama-3.1-8b-mock";

  public chatCalls: Array<{ messages: AiMessage[]; options?: AiCompletionOptions }> = [];
  public returnInvalidFirst = false;
  public repairCallCount = 0;

  isConfigured(): boolean {
    return true;
  }

  async chat(
    messages: AiMessage[],
    options: AiCompletionOptions = {}
  ): Promise<AiCompletionResult> {
    this.chatCalls.push({ messages, options });

    const isRepairPrompt = messages.some(
      (m) =>
        m.content.includes("Fix JSON schema errors") ||
        m.content.includes("The following JSON failed validation")
    );

    if (isRepairPrompt) {
      this.repairCallCount++;
      // Return fixed presentation JSON
      const brief2 = normalizeContentInput("SlideCraft AI Architecture & Scale Strategy. $15M ARR, 99.9% uptime. Must ensure SOC2.");
      const repairedDoc = createDeterministicFallbackDoc(
        brief2,
        "presentation",
        "16:9",
        ["hero_title", "four_metric_dashboard", "three_card_grid"],
        selectThemeFromPrompt("SlideCraft AI Architecture & Scale Strategy")
      );
      return {
        content: JSON.stringify(repairedDoc),
        modelUsed: this.fallbackModel,
        durationMs: 45,
        tokensUsed: 850,
      };
    }

    if (this.returnInvalidFirst && this.repairCallCount === 0) {
      // Return invalid JSON missing required fields to trigger self-repair
      return {
        content: JSON.stringify({
          version: "1.0.0",
          documentType: "presentation",
          meta: { title: "Broken Document Missing Canvas & Theme" },
          pages: [],
        }),
        modelUsed: this.defaultModel,
        durationMs: 90,
        tokensUsed: 400,
      };
    }

    // Default: Return valid presentation spec
    const brief3 = normalizeContentInput("SlideCraft AI Architecture & Scale Strategy. $15M ARR, 99.9% uptime. Must ensure SOC2.");
    const doc = createDeterministicFallbackDoc(
      brief3,
      "presentation",
      "16:9",
      ["hero_title", "four_metric_dashboard", "three_card_grid"],
      selectThemeFromPrompt("SlideCraft AI Architecture & Scale Strategy")
    );

    return {
      content: JSON.stringify(doc),
      modelUsed: this.defaultModel,
      durationMs: 120,
      tokensUsed: 1250,
    };
  }
}

async function runAiEngineVerificationTests() {
  console.log("==================================================================");
  console.log("SLIDECRAFT AI - CORE AI GENERATION ENGINE COMPREHENSIVE TEST SUITE");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}${detail ? ` - ${detail}` : ""}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  // TEST SUITE 1: Pluggable AI Service Abstraction
  console.log("\n--- SUITE 1: Pluggable AI Service Abstraction & Security ---");
  const defaultService = getAiService();
  assert(defaultService.providerName === "groq", "Default AI provider is Groq");
  assert(typeof defaultService.chat === "function", "AI service exposes chat interface");
  assert(typeof defaultService.isConfigured === "function", "AI service provides isConfigured check");

  // TEST SUITE 2: Content Normalization & Constraint Extraction
  console.log("\n--- SUITE 2: Content Normalization & Hard Constraint Extraction ---");
  const samplePrompt = `
We are pitching to Series A investors for SlideCraft AI.
Target ARR: $18.5M by 2026.
System SLA is 99.95% uptime.
Must include SOC2 Type II compliance roadmap.
Ensure pricing is $49/seat.
Always highlight deterministic vector layout compilation vs static raster images.
`;

  const normalized = normalizeContentInput(samplePrompt, { documentType: "presentation", requestedPageCount: 4 });
  assert(normalized.coreTopic.length > 0, "Core topic extracted", normalized.coreTopic);
  assert(normalized.targetAudience.includes("Investors"), "Audience correctly identified as Investors", normalized.targetAudience);
  assert(normalized.hardConstraints.some((c) => c.includes("$18.5M")), "Financial metric constraint $18.5M preserved");
  assert(normalized.hardConstraints.some((c) => c.includes("99.95%")), "Percentage constraint 99.95% preserved");
  assert(normalized.hardConstraints.some((c) => c.includes("SOC2")), "User rule constraint SOC2 preserved");
  assert(normalized.keyThemes.length >= 3, "Content segmented into narrative themes", `Themes: ${normalized.keyThemes.length}`);

  // TEST SUITE 3: Content Classification & Layout Selection (Anti-Monotony)
  console.log("\n--- SUITE 3: Content Classification & Layout Variety ---");
  const metricText = "Target ARR: $18.5M, Net Retention: 142%, LTV/CAC: 3.8x, Growth: +95% YoY";
  const catMetric = classifyContent(metricText);
  assert(catMetric.includes("statistic"), "Classified metric text as statistic");

  const timelineText = "Phase 1: Q1 2025 Architecture, Phase 2: Q2 2025 Beta Launch, Phase 3: Q3 Scale";
  const catTimeline = classifyContent(timelineText);
  assert(catTimeline.includes("timeline"), "Classified roadmap as timeline");

  const processText = "Step 1: Ingest source document, Step 2: Extract AST, Step 3: Compile vector PPTX";
  const catProcess = classifyContent(processText);
  assert(catProcess.includes("process"), "Classified workflow as process");

  // Verify layout selection prevents consecutive duplicates
  const arch0 = selectLayoutArchetype(["statistic"], 0, []);
  assert(arch0 === "hero_title", "Page 0 is hero_title cover archetype");

  const arch1 = selectLayoutArchetype(["statistic"], 1, [arch0]);
  assert(arch1 === "four_metric_dashboard", "Statistic content receives four_metric_dashboard");

  const arch2 = selectLayoutArchetype(["statistic"], 2, [arch0, arch1]);
  assert(arch2 !== "four_metric_dashboard", "Prevents duplicate four_metric_dashboard consecutively", `Selected: ${arch2}`);

  const arch3 = selectLayoutArchetype(["timeline"], 3, [arch0, arch1, arch2]);
  assert(arch3 === "horizontal_timeline", "Timeline content receives horizontal_timeline");

  // TEST SUITE 4: Zod Schema Validation for all 8 Project Types
  console.log("\n--- SUITE 4: Zod Schema Validation Across All 8 Project Types ---");
  const docTypes: DocumentType[] = [
    "presentation",
    "poster",
    "infographic",
    "social_media",
    "resume",
    "letter",
    "diagram",
    "chart",
  ];

  for (const dt of docTypes) {
    const brief = normalizeContentInput(`Executive overview of ${dt} generation`, { documentType: dt });
    const aspectRatioForDt = dt === "infographic" ? "9:16" : dt === "social_media" ? "1:1" : dt === "letter" ? "US_letter" : dt === "poster" || dt === "resume" ? "A4_portrait" : "16:9";
    const fallbackSpec = createDeterministicFallbackDoc(brief, dt, aspectRatioForDt, ["hero_title", "three_card_grid"], selectThemeFromPrompt(`${dt} generation`));
    const valResult = validateFormatSpec(fallbackSpec);
    assert(valResult.success, `Format schema validated for '${dt}'`);
  }

  // TEST SUITE 5: Rejection of Invalid Specifications
  console.log("\n--- SUITE 5: Schema Strictness & Invalid Spec Rejection ---");
  const invalidSpec = {
    version: "1.0.0",
    documentType: "presentation",
    meta: { title: "Test" },
    // missing canvas, theme, and pages
  };
  const invalidResult = validateFormatSpec(invalidSpec);
  assert(!invalidResult.success, "Invalid document spec correctly rejected by Zod");

  // TEST SUITE 6: Self-Repair Reflection Loop
  console.log("\n--- SUITE 6: Self-Repair Reflection Loop Execution ---");
  const mockAi = new MockTestAiService();
  mockAi.returnInvalidFirst = true; // Trigger self-repair on first pass

  const progressUpdates: PipelineProgressUpdate[] = [];
  const repairResult = await executeGenerationPipeline(
    {
      prompt: "SlideCraft Architecture and Seed Round. $3M Target. SOC2 required.",
      documentType: "presentation",
      pageCount: 3,
    },
    {
      aiService: mockAi,
      onProgress: (p) => progressUpdates.push(p),
    }
  );

  assert(repairResult.success, "Pipeline succeeded with self-repair");
  assert(mockAi.repairCallCount > 0, "Self-repair reflection prompt invoked to heal invalid JSON", `Repair calls: ${mockAi.repairCallCount}`);
  assert(repairResult.wasRepaired, "Pipeline flagged document as successfully repaired");

  // TEST SUITE 7: Complete 14-Stage Pipeline Lifecycle
  console.log("\n--- SUITE 7: End-to-End 14-Stage Pipeline Lifecycle & Progress Updates ---");
  const stageNumbers = progressUpdates.map((u) => u.stageNumber);
  assert(stageNumbers.includes(1), "Stage 1: Received user prompt executed");
  assert(stageNumbers.includes(2), "Stage 2: Validate input executed");
  assert(stageNumbers.includes(3), "Stage 3: Extract and normalize content executed");
  assert(stageNumbers.includes(4), "Stage 4: Identify project type executed");
  assert(stageNumbers.includes(5), "Stage 5: Understand audience and purpose executed");
  assert(stageNumbers.includes(6), "Stage 6: Create content outline executed");
  assert(stageNumbers.includes(7), "Stage 7: Classify content executed");
  assert(stageNumbers.includes(8), "Stage 8: Select suitable layouts executed");
  assert(stageNumbers.includes(9), "Stage 9: Generate structured specification executed");
  assert(stageNumbers.includes(10), "Stage 10: Validate specification with Zod executed");
  assert(stageNumbers.includes(11), "Stage 11: Self-repair reflection executed");
  assert(stageNumbers.includes(12), "Stage 12: Save specification step executed");
  assert(stageNumbers.includes(13), "Stage 13: Finalizing executed");
  assert(stageNumbers.includes(14), "Stage 14: Completed executed (100%)");

  const lastProgress = progressUpdates[progressUpdates.length - 1];
  assert(lastProgress.percent === 100, "Progress reached 100% completion");

  console.log("\n==================================================================");
  console.log(`AI GENERATION ENGINE TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAiEngineVerificationTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
