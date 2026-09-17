import pdf from "pdf-parse";

export async function extractTextFromPdf(
  buffer: Buffer
): Promise<{ text: string; pages: number; info?: any }> {
  try {
    const data = await pdf(buffer);
    return {
      text: data.text || "",
      pages: data.numpages || 1,
      info: data.info,
    };
  } catch (error: any) {
    console.error("PDF Extraction error:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}
