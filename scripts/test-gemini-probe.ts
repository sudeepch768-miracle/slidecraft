import * as fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
let geminiKey = "";
let geminiModel = "";
for (const line of envContent.split("\n")) {
  if (line.startsWith("GEMINI_API_KEY=")) {
    geminiKey = line.split("=")[1].trim().replace(/^["']|["']$/g, "");
  }
  if (line.startsWith("GEMINI_MODEL=")) {
    geminiModel = line.split("=")[1].trim().replace(/^["']|["']$/g, "");
  }
}

console.log("Configured model:", geminiModel);
console.log("Gemini Key prefix:", geminiKey.slice(0, 8));

async function probe(model: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "ping" }] }],
      generationConfig: { maxOutputTokens: 5 },
    }),
  });
  console.log(`Model '${model}' -> Status: ${res.status}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log("Error response:", data?.error?.message || data);
  } else {
    console.log("Success response text:", data?.candidates?.[0]?.content?.parts?.[0]?.text);
  }
}

async function run() {
  await probe(geminiModel);
  await probe("gemini-2.0-flash");
  await probe("gemini-1.5-flash");
}
run();
