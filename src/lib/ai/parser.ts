import { DocumentSpec, DocumentSpecSchema, createEmptyDocument } from "@/types/document-spec";
import { callGroqChat, FAST_GROQ_MODEL } from "./groq";

/**
 * Clean string to extract pure JSON
 */
export function extractJsonString(raw: string): string {
  let cleaned = raw.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Safe synchronous JSON parser with default fallback
 */
export function safeParseJson<T>(raw: string, fallback: T): T {
  try {
    const cleaned = extractJsonString(raw);
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

/**
 * Robust JSON parser with Zod validation and AI self-repair loop
 */
export async function parseAndValidateDocumentSpec(
  rawContent: string,
  maxRetries = 2
): Promise<DocumentSpec> {
  let currentJsonString = extractJsonString(rawContent);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const parsedObject = JSON.parse(currentJsonString);
      const validation = DocumentSpecSchema.safeParse(parsedObject);

      if (validation.success) {
        return validation.data;
      }

      console.warn(`[Validation Attempt ${attempt + 1}] Schema errors:`, validation.error.format());

      if (attempt < maxRetries) {
        // AI self-repair reflection prompt
        const repairPrompt = `The following JSON failed validation against the SlideCraft DocumentSpec schema:
Errors:
${JSON.stringify(validation.error.format(), null, 2)}

Original JSON:
${currentJsonString}

Please fix the validation errors and return ONLY the corrected, valid JSON conforming to the schema. Do not include markdown codeblocks or conversational text.`;

        const repairedResponse = await callGroqChat(
          [
            {
              role: "system",
              content:
                "You are an expert JSON repair assistant. Output ONLY valid JSON matching the requested schema.",
            },
            { role: "user", content: repairPrompt },
          ],
          { model: FAST_GROQ_MODEL, jsonMode: true, temperature: 0.1 }
        );

        currentJsonString = extractJsonString(repairedResponse);
      }
    } catch (parseError: any) {
      console.warn(`[JSON Parse Attempt ${attempt + 1}] Failed to parse JSON:`, parseError.message);

      if (attempt < maxRetries) {
        const syntaxRepairPrompt = `The following text could not be parsed as valid JSON:
${currentJsonString}

Error: ${parseError.message}

Please repair the syntax and return ONLY valid JSON.`;

        const repaired = await callGroqChat(
          [
            {
              role: "system",
              content: "You are a JSON syntax repair agent. Return only valid JSON.",
            },
            { role: "user", content: syntaxRepairPrompt },
          ],
          { model: FAST_GROQ_MODEL, jsonMode: true, temperature: 0.1 }
        );
        currentJsonString = extractJsonString(repaired);
      }
    }
  }

  // Graceful fallback if self-repair exhausts retries
  console.error("All validation attempts exhausted. Creating safe fallback document.");
  return createEmptyDocument("Generated Presentation", "presentation", "16:9");
}
