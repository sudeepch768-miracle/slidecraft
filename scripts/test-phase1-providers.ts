import { isGuaranteedFreeOpenRouterModel, OpenRouterService } from "../src/lib/ai/service/openrouter-provider";
import { GroqAiService } from "../src/lib/ai/service/groq-provider";
import { ChainedFallbackAiService } from "../src/lib/ai/service/chained-fallback-service";
import { getAiService } from "../src/lib/ai/service/ai-factory";
import * as fs from "fs";
import * as path from "path";

// Helper to manually load environment files into process.env for standalone test script
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

async function runPhase1Verification() {
  console.log("================================================================");
  console.log("       SLIDECRAFT AI — PHASE 1 PROVIDER VERIFICATION SUITE       ");
  console.log("================================================================\n");

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
      testsFailed++;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 1: OpenRouter Zero-Cost Model Restriction
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST GROUP 1: OpenRouter Free-Only Model Security Gate ---");

  assert(
    isGuaranteedFreeOpenRouterModel("openrouter/free") === true,
    "openrouter/free is permitted"
  );
  assert(
    isGuaranteedFreeOpenRouterModel("meta-llama/llama-3.3-70b-instruct:free") === true,
    "meta-llama/llama-3.3-70b-instruct:free is permitted (:free suffix)"
  );
  assert(
    isGuaranteedFreeOpenRouterModel("google/gemini-2.0-flash-exp:free") === true,
    "google/gemini-2.0-flash-exp:free is permitted"
  );
  assert(
    isGuaranteedFreeOpenRouterModel("openrouter/auto") === false,
    "openrouter/auto is STRICTLY BLOCKED"
  );
  assert(
    isGuaranteedFreeOpenRouterModel("openai/gpt-4o") === false,
    "Paid model openai/gpt-4o is STRICTLY BLOCKED"
  );
  assert(
    isGuaranteedFreeOpenRouterModel("anthropic/claude-3.5-sonnet") === false,
    "Paid model anthropic/claude-3.5-sonnet is STRICTLY BLOCKED"
  );
  assert(
    isGuaranteedFreeOpenRouterModel("") === false,
    "Empty string is rejected"
  );

  const openRouter = new OpenRouterService();
  let blockedCaught = false;
  try {
    await openRouter.chat([{ role: "user", content: "hi" }], {
      model: "openai/gpt-4o",
    });
  } catch (err: any) {
    if (err.message.includes("not confirmed zero-cost") || err.message.includes("restricted to free-only")) {
      blockedCaught = true;
    }
  }
  assert(
    blockedCaught === true,
    "OpenRouterService throws and blocks request when a non-free model is requested"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 2: Groq Model Configuration
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST GROUP 2: Groq Model Configuration & Fallback ---");

  const groq = new GroqAiService();
  assert(
    groq.providerName === "groq",
    "GroqAiService provider name is 'groq'"
  );
  assert(
    groq.defaultModel.length > 0,
    `Groq default model is a valid supported model (${groq.defaultModel})`
  );
  assert(
    groq.fallbackModel.length > 0,
    `Groq fallback model is configured properly (${groq.fallbackModel})`
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 3: Chained Fallback Dispatcher Order & Security
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST GROUP 3: Fallback Hierarchy & Diagnostics Exposure ---");

  const chain = new ChainedFallbackAiService();
  assert(
    chain.isConfigured() === true,
    "ChainedFallbackAiService is configured"
  );

  const diag = chain.getDiagnostics();
  assert(
    diag.chainOrder[0] === "Groq (Primary)" &&
      diag.chainOrder[1] === "OpenRouter (Free Tier Fallback)",
    `Hierarchy order is strictly verified: ${diag.chainOrder.join(" → ")}`
  );
  assert(
    diag.primaryProvider.startsWith("Groq"),
    `Primary provider is Groq (${diag.primaryProvider})`
  );
  assert(
    diag.fallbackProvider.startsWith("OpenRouter Free"),
    `Fallback provider is OpenRouter Free (${diag.fallbackProvider})`
  );

  // Verify no keys are leaked in diagnostics output
  const diagJson = JSON.stringify(diag);
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();

  let keyLeaked = false;
  if (groqKey && groqKey.length > 8 && diagJson.includes(groqKey)) {
    keyLeaked = true;
  }
  if (openRouterKey && openRouterKey.length > 8 && diagJson.includes(openRouterKey)) {
    keyLeaked = true;
  }
  assert(!keyLeaked, "Zero API keys exposed in diagnostics object");

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 5: Live Text Generation via Chained Fallback Dispatcher
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST GROUP 5: Live Text Generation Execution ---");

  try {
    const aiService = getAiService();
    console.log("Dispatching test completion request through provider chain...");
    const res = await aiService.chat([
      {
        role: "user",
        content: "Respond with the single word: READY",
      },
    ]);

    assert(
      typeof res.content === "string" && res.content.length > 0,
      `Chained AI service successfully generated response: "${res.content.trim().slice(0, 40)}"`
    );
    assert(
      typeof res.modelUsed === "string",
      `Model used reported: ${res.modelUsed}`
    );
    console.log(`Execution completed in ${res.durationMs}ms`);
  } catch (err: any) {
    console.error("Live completion error:", err.message);
    assert(false, "Live completion through provider chain succeeded", err.message);
  }

  console.log("\n================================================================");
  console.log(`VERIFICATION SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log("================================================================");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runPhase1Verification().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
