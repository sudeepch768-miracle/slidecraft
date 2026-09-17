const fs = require("fs");
const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/GROQ_API_KEY="?([^"\r\n]+)"?/);
if (!match) {
  console.error("No GROQ key found");
  process.exit(1);
}
const key = match[1].trim();
fetch("https://api.groq.com/openai/v1/models", {
  headers: { Authorization: "Bearer " + key }
}).then(r => r.json()).then(d => {
  if (d.data) {
    console.log("Available Groq Models:\n" + d.data.map(m => m.id).join("\n"));
  } else {
    console.log("Groq response:", d);
  }
}).catch(e => console.error(e));
