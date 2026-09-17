import * as fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
let geminiKey = "";
for (const line of envContent.split("\n")) {
  if (line.startsWith("GEMINI_API_KEY=")) {
    geminiKey = line.split("=")[1].trim().replace(/^["']|["']$/g, "");
  }
}

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.models) {
    console.log("Available Gemini models:");
    const names = data.models.map((m: any) => m.name.replace("models/", ""));
    console.log(names.slice(0, 10));
  } else {
    console.log("List models error:", res.status, data);
  }

  // Also test gemini-3.6-flash
  const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`;
  const tRes = await fetch(testUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "Hello, reply with 1 word" }] }],
    }),
  });
  const tData = await tRes.json().catch(() => ({}));
  console.log("gemini-3.6-flash status:", tRes.status);
  console.log("gemini-3.6-flash output:", tData?.candidates?.[0]?.content?.parts?.[0]?.text || tData);
}

listModels();
