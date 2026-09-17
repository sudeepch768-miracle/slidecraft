const fs = require("fs");
const Groq = require("groq-sdk");
const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/GROQ_API_KEY="?([^"\r\n]+)"?/);
const key = match[1].trim();
const groq = new Groq({ apiKey: key });

async function testGroq() {
  const res = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [{ role: "user", content: "Tell me what 2+2 is" }],
    max_tokens: 50,
  });
  console.log("Full Groq response:\n", JSON.stringify(res, null, 2));
}

testGroq().catch(err => console.error("Groq error:", err));
