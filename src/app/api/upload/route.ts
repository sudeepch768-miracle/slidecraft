import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/parsers/pdf-extractor";
import { extractTextFromDocx } from "@/lib/parsers/docx-extractor";
import { extractTabularData } from "@/lib/parsers/tabular-extractor";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();

    let extractedText = "";
    let extractedType = "text";
    let summary = "";

    if (fileName.endsWith(".pdf")) {
      const result = await extractTextFromPdf(buffer);
      extractedText = result.text;
      extractedType = "pdf";
      summary = `Extracted from PDF (${result.pages} pages).`;
    } else if (fileName.endsWith(".docx")) {
      const result = await extractTextFromDocx(buffer);
      extractedText = result.text;
      extractedType = "docx";
      summary = "Extracted from Microsoft Word document.";
    } else if (fileName.endsWith(".csv")) {
      const rawCsv = buffer.toString("utf-8");
      const tableData = extractTabularData(rawCsv);
      extractedText = JSON.stringify(tableData);
      extractedType = "csv";
      summary = tableData.summary;
    } else {
      // Plain text or Markdown
      extractedText = buffer.toString("utf-8");
      extractedType = "text";
      summary = `Extracted ${extractedText.length} characters of text.`;
    }

    // Limit extracted text to reasonable size for Groq context window (first ~12,000 characters)
    const truncatedText = extractedText.slice(0, 12000);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType: extractedType,
      summary,
      extractedContent: truncatedText,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process uploaded file." },
      { status: 500 }
    );
  }
}
