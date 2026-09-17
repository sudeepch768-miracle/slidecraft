import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
let url = "";
let key = "";
for (const line of envContent.split("\n")) {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
    url = line.split("=")[1].trim().replace(/^["']|["']$/g, "");
  }
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
    key = line.split("=")[1].trim().replace(/^["']|["']$/g, "");
  }
}

console.log("Testing Supabase URL:", url);
const supabase = createClient(url, key);

async function check() {
  try {
    const res = await supabase.from("projects").select("*").limit(1);
    console.log("Query result error:", res.error);
    console.log("Query result data count:", res.data?.length);
  } catch (e: any) {
    console.error("Query exception:", e.message);
  }
}
check();
