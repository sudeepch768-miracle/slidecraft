/**
 * End-to-End Test for SlideCraft Multi-Provider Pipelines:
 * 1. Presentation Pipeline (Gemini -> Groq -> OpenRouter -> Gemini)
 * 2. Poster / Infographic Pipeline (Gemini -> Groq -> OpenRouter -> Gemini)
 * 3. Modification Pipeline (Gemini -> Groq -> OpenRouter -> Gemini)
 */

import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

import { presentationPipeline } from "../src/lib/ai/pipelines/presentation-pipeline";
import { posterInfographicPipeline } from "../src/lib/ai/pipelines/poster-infographic-pipeline";
import { modificationPipeline } from "../src/lib/ai/pipelines/modification-pipeline";

async function runPipelineTests() {
  console.log("\n=======================================================");
  console.log("TESTING MULTI-PROVIDER PIPELINES END-TO-END");
  console.log("=======================================================\n");

  // 1. Test Presentation Pipeline
  console.log("Step 1: Testing Presentation Pipeline (Gemini + Groq + OpenRouter)...");
  const presResult = await presentationPipeline.execute({
    prompt: "Modern Quantum Computing breakthrough",
    slideCount: 3,
    tone: "professional",
  });

  console.log("  [PASS] Presentation Pipeline completed!");
  console.log("  Steps executed:", presResult.stepsExecuted);
  console.log(`  Pages generated: ${presResult.document.pages.length}`);
  console.log(`  First slide title: "${presResult.document.pages[0].title}"`);
  console.log(`  QA review passed: ${presResult.review.passed}`);

  // 2. Test Poster Pipeline
  console.log("\nStep 2: Testing Poster / Infographic Pipeline...");
  const posterResult = await posterInfographicPipeline.execute({
    headline: "AI Innovation Hackathon 2026",
    format: "poster",
    aspectRatio: "A4_portrait",
  });

  console.log("  [PASS] Poster Pipeline completed!");
  console.log("  Steps executed:", posterResult.stepsExecuted);
  console.log(`  Headline: "${posterResult.document.pages[0].title}"`);
  console.log(`  Elements count: ${posterResult.document.pages[0].elements.length}`);

  // 3. Test Targeted Modification Pipeline
  console.log("\nStep 3: Testing Targeted Modification Pipeline (Text Edit)...");
  const modResult = await modificationPipeline.execute({
    document: presResult.document,
    instruction: "Change title of first slide to: Quantum Superposition Mastery",
    activePageIndex: 0,
  });

  console.log("  [PASS] Modification Pipeline completed!");
  console.log("  Steps executed:", modResult.stepsExecuted);
  console.log("  Action category:", modResult.analysis.actionCategory);

  console.log("\n=======================================================");
  console.log("ALL 3 MULTI-PROVIDER PIPELINES PASSED END-TO-END!");
  console.log("=======================================================\n");
}

runPipelineTests().catch((err) => {
  console.error("Pipeline test failed:", err);
  process.exit(1);
});
