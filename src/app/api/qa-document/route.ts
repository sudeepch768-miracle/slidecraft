import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  const jsonPath = "C:/Users/sudeep/.gemini/antigravity/brain/49d0c866-787a-4c39-9fb3-7e4b813da05c/scratch/neuroinsight-doc.json";
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  }
  return NextResponse.json({ error: "Document not found yet" }, { status: 404 });
}
