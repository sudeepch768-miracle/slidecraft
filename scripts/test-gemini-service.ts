import { GeminiAiService } from "../src/lib/ai/service/gemini-provider";
import * as fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) {
    const key = match[1];
    let val = match[2].trim().replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
}

async function test() {
  process.env.GEMINI_MODEL = "gemini-3.6-flash";
  console.log("Testing GeminiAiService with gemini-3.6-flash...");
  const gemini = new GeminiAiService();
  console.log("Configured:", gemini.isConfigured());
  console.log("Model:", gemini.defaultModel);

  const res = await gemini.chat([
    { role: "system", content: "You are a concise AI evaluator. Output JSON." },
    { role: "user", content: "Evaluate quality of prompt: 'Clinical AI in Cardiology'. Output JSON with score (1-10) and feedback." }
  ], { jsonMode: true });

  console.log("Gemini response duration:", res.durationMs, "ms");
  console.log("Model used:", res.modelUsed);
  console.log("Content:", res.content);
}

test().catch((e) => console.error("Test failed:", e));
