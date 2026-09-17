import mammoth from "mammoth";

export async function extractTextFromDocx(
  buffer: Buffer
): Promise<{ text: string; rawHtml?: string }> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value || "",
    };
  } catch (error: any) {
    console.error("DOCX extraction error:", error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}
