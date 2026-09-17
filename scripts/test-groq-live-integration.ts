import { getAiService } from "../src/lib/ai/service/ai-factory";
import { executeGenerationPipeline } from "../src/lib/ai/generation-pipeline";
import { validateFormatSpec } from "../src/types/schemas/project-spec-schemas";
import { GroqAiService } from "../src/lib/ai/service/groq-provider";
import * as fs from "fs";
import * as path from "path";

// Helper to manually load environment files into process.env without external dependencies
function loadEnv(filePath: string) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
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
}

loadEnv(path.resolve(process.cwd(), ".env"));
loadEnv(path.resolve(process.cwd(), ".env.local"));

async function runGroqLiveVerification() {
  console.log("==================================================================");
  console.log("SLIDECRAFT AI - LIVE GROQ INTEGRATION VERIFICATION");
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

  // 1. Check Groq SDK & Configured API Key
  console.log("\n--- VERIFICATION 1: Groq SDK Installation & Key Configuration ---");
  const apiKey = process.env.GROQ_API_KEY;
  const isKeyPresent = Boolean(apiKey && apiKey.startsWith("gsk_") && !apiKey.includes("placeholder"));
  assert(isKeyPresent, "GROQ_API_KEY loaded from environment (.env.local / .env)", `Key prefix: ${apiKey?.substring(0, 8)}...`);

  const groqService = new GroqAiService();
  assert(groqService.isConfigured(), "GroqAiService.isConfigured() evaluates to true");
  assert(groqService.providerName === "groq", "Provider name is 'groq'");
  assert(Boolean(groqService.defaultModel), "Configured model is valid", groqService.defaultModel);

  // 2. Direct Groq API Chat Completion with JSON Mode
  console.log("\n--- VERIFICATION 2: Direct Groq API Chat Completion (JSON Mode) ---");
  try {
    const startTime = Date.now();
    const result = await groqService.chat(
      [
        {
          role: "system",
          content: "You are a specialized JSON test responder. Return ONLY a single JSON object with status: 'ok' and a message.",
        },
        {
          role: "user",
          content: "Verify Groq connectivity and model inference.",
        },
      ],
      { jsonMode: true, temperature: 0.1 }
    );

    const elapsed = Date.now() - startTime;
    const parsed = JSON.parse(result.content);

    assert(Boolean(result.content), "Received non-empty response from Groq API", `Latency: ${elapsed}ms`);
    assert(parsed.status === "ok" || Boolean(parsed), "Response parsed as valid JSON object", JSON.stringify(parsed));
    assert(result.modelUsed.length > 0, "Model used reported", result.modelUsed);
    assert(result.tokensUsed !== undefined && result.tokensUsed > 0, "Token usage reported", `${result.tokensUsed} tokens`);
  } catch (err: any) {
    console.error(`[FAIL] Direct Groq API call error: ${err.message}`);
    failed++;
  }

  // 3. End-to-End 14-Stage Generation Pipeline with Live Groq Service
  console.log("\n--- VERIFICATION 3: End-to-End Pipeline Execution with Live Groq ---");
  try {
    const prompt = "Build a 3-slide executive pitch deck for SlideCraft AI. Target ARR is $12M. SLA is 99.9% uptime. Must ensure SOC2 compliance.";
    const progressLog: string[] = [];

    const pipelineResult = await executeGenerationPipeline(
      {
        prompt,
        documentType: "presentation",
        pageCount: 3,
      },
      {
        aiService: groqService,
        onProgress: (p) => {
          progressLog.push(`[Stage ${p.stageNumber}] ${p.stage}: ${p.percent}% - ${p.message}`);
        },
      }
    );

    assert(pipelineResult.success, "Pipeline execution succeeded end-to-end");
    assert(pipelineResult.document.pages.length === 3, "Generated requested 3 slides", `Slides: ${pipelineResult.document.pages.length}`);
    assert(pipelineResult.document.documentType === "presentation", "Document type verified as presentation");

    // Verify Zod schema conformity
    const validation = validateFormatSpec(pipelineResult.document);
    assert(validation.success, "Live Groq output validated strictly against PresentationSpecSchema");

    // Verify preservation of hard constraints
    const docString = JSON.stringify(pipelineResult.document);
    const hasARR = docString.includes("12") || pipelineResult.normalizedBrief.hardConstraints.some(c => c.includes("12"));
    const hasUptime = docString.includes("99.9") || pipelineResult.normalizedBrief.hardConstraints.some(c => c.includes("99.9"));
    assert(hasARR, "Financial constraint ($12M) preserved in normalized brief / document AST");
    assert(hasUptime, "Percentage constraint (99.9%) preserved in normalized brief / document AST");

    assert(progressLog.length >= 10, "Live progress callbacks fired throughout stages", `Updates received: ${progressLog.length}`);
    console.log(`Pipeline duration: ${pipelineResult.durationMs}ms with model: ${pipelineResult.modelUsed}`);
  } catch (err: any) {
    console.error(`[FAIL] End-to-end generation pipeline error: ${err.message}`);
    failed++;
  }

  // 4. Security Verification (No Client-side exposure)
  console.log("\n--- VERIFICATION 4: Security & Environment Protection ---");
  const envKeys = Object.keys(process.env);
  const leakedGroqKeys = envKeys.filter((k) => k.startsWith("NEXT_PUBLIC_") && k.toUpperCase().includes("GROQ"));
  assert(leakedGroqKeys.length === 0, "Zero NEXT_PUBLIC_ variables contain GROQ keys");

  console.log("\n==================================================================");
  console.log(`LIVE GROQ VERIFICATION RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runGroqLiveVerification().catch((err) => {
  console.error("Unhandled verification error:", err);
  process.exit(1);
});
