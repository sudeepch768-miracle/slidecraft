import { DocumentSpec, PageSpec } from "@/types/document-spec";

export function buildPageModifierPrompt(
  currentPage: PageSpec,
  userInstruction: string,
  documentTheme: DocumentSpec["theme"]
): string {
  return `You are SlideCraft AI's precision design editor.
Your task is to modify the current page/slide based strictly on the user's natural language instruction.

### USER INSTRUCTION
"${userInstruction}"

### CURRENT DOCUMENT THEME
${JSON.stringify(documentTheme, null, 2)}

### CURRENT PAGE JSON
${JSON.stringify(currentPage, null, 2)}

### MANDATE
1. Apply the user's requested changes accurately.
2. If they ask to add a chart, add a valid "chart" element with realistic labels and datasets.
3. If they ask to change the archetype (e.g. from split to cards or metrics), update "archetype" and compose appropriate elements.
4. Keep the page ID the same ("${currentPage.id}").
5. Return ONLY a single valid JSON object representing the UPDATED PageSpec conforming to the PageSpec schema.
6. Do NOT include markdown ticks or conversational text.`;
}

export function buildGlobalModifierPrompt(
  currentDocument: DocumentSpec,
  userInstruction: string
): string {
  return `You are SlideCraft AI's master design editor.
Your task is to modify the entire document based on the user's natural language instruction (e.g. reskinning themes, changing fonts, adding a new section, updating branding).

### USER INSTRUCTION
"${userInstruction}"

### CURRENT DOCUMENT JSON
${JSON.stringify(currentDocument, null, 2)}

### MANDATE
1. Return ONLY a single valid JSON object representing the entire updated DocumentSpec.
2. Ensure all existing pages maintain continuity unless the user explicitly requested additions or deletions.
3. Keep valid Zod schema adherence. Do NOT wrap in markdown ticks.`;
}
