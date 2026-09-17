import fs from "fs";

const content = fs.readFileSync(
  "C:/Users/sudee/.gemini/antigravity/brain/e87583d0-c603-436a-aa28-4c63442f4d78/.system_generated/logs/chunks/transcript/00000082.jsonl",
  "utf8"
);
const lines = content.split("\n");
for (const line of lines) {
  if (line.includes("credit_balance_exhausted") || line.includes("insufficient_quota") || line.includes("models")) {
    try {
      const obj = JSON.parse(line);
      console.log("type:", obj.type, "tool:", obj.tool_calls?.[0]?.toolSummary);
      console.log("content snippet:", obj.content?.slice(0, 300));
      console.log("thinking snippet:", obj.thinking?.slice(0, 300));
    } catch {}
  }
}
