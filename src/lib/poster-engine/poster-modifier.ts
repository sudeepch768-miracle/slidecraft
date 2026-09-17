import { DocumentSpec, DocumentSpecSchema, CANVAS_PRESETS, AspectRatio } from "@/types/document-spec";
import { callGroqChat } from "@/lib/ai/groq";
import { extractJsonString } from "@/lib/ai/parser";
import { POSTER_MOOD_PALETTES, POSTER_TYPOGRAPHY_STYLES } from "./poster-types";

/**
 * Modifies a Poster DocumentSpec based on natural language instructions,
 * strictly preserving existing event metadata, dates, venues, and speakers.
 */
export async function modifyPosterDocument(
  currentDoc: DocumentSpec,
  instruction: string
): Promise<DocumentSpec> {
  const instructionLower = (instruction || "").toLowerCase();

  // 1. Surgical background modification: NEVER let LLM regenerate full document for background changes
  if (instructionLower.includes("background") || instructionLower.includes("bg")) {
    return applyDeterministicPosterModification(currentDoc, instructionLower);
  }

  // Try AI-powered modification first via Groq
  try {
    const prompt = `You are SlideCraft AI's specialized Poster Design Modifier.
The user wants to refine their existing poster design.

### USER INSTRUCTION:
"${instruction}"

### CURRENT POSTER DOCUMENT SPECIFICATION:
${JSON.stringify(currentDoc, null, 2)}

### CRITICAL RULES:
1. STRICT CONTENT PRESERVATION: Never delete or randomize real event information! Retain existing title, dates, venues, speakers, sponsors, and organizer contact details unless the user explicitly asks to remove them.
2. If the user asks for "more colorful", update the color palette with vibrant, high-contrast accent colors.
3. If the user asks for "professional style", update theme colors and fonts to a clean corporate/scholarly look.
4. If the user asks for "suitable for Instagram", set canvas aspectRatio to "1:1" (1080x1080) or "4:5" (1080x1350) or "9:16" (1080x1920) with matching canvas width and height.
5. If the user asks to "add a QR code" and none exists, add a valid "qrcode" element to elements list.
6. If the user asks to "change the background", adjust theme.colors.background or page.backgroundOverride.
7. Return ONLY a single valid JSON object representing the entire updated DocumentSpec. No markdown codeblocks or text outside the JSON.`;

    const rawResult = await callGroqChat(
      [
        {
          role: "system",
          content: "You are a professional graphic design system. Return ONLY valid JSON matching DocumentSpec.",
        },
        { role: "user", content: prompt },
      ],
      { jsonMode: true, temperature: 0.2 }
    );

    const jsonStr = extractJsonString(rawResult);
    const parsed = JSON.parse(jsonStr);
    const validated = DocumentSpecSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.warn("Groq poster modifier fallback triggered:", error);
    // Execute deterministic rule-based modification fallback
    return applyDeterministicPosterModification(currentDoc, instructionLower);
  }
}

/**
 * Deterministic modifier applying direct AST mutations based on intent keywords.
 */
export function applyDeterministicPosterModification(
  doc: DocumentSpec,
  instruction: string
): DocumentSpec {
  const instructionLower = (instruction || "").toLowerCase();
  const cloned: DocumentSpec = JSON.parse(JSON.stringify(doc));
  const page = cloned.pages[0];

  // 1. Color / Mood adjustments
  if (
    instructionLower.includes("colorful") ||
    instructionLower.includes("vibrant") ||
    instructionLower.includes("fun")
  ) {
    cloned.theme.colors = { ...POSTER_MOOD_PALETTES.vibrant_modern };
    cloned.theme.mode = "light";
  } else if (
    instructionLower.includes("professional") ||
    instructionLower.includes("corporate") ||
    instructionLower.includes("formal")
  ) {
    cloned.theme.colors = { ...POSTER_MOOD_PALETTES.corporate_clean };
    cloned.theme.typography = { ...POSTER_TYPOGRAPHY_STYLES.modern_sans };
  } else if (
    instructionLower.includes("dark") ||
    instructionLower.includes("cyberpunk") ||
    instructionLower.includes("neon")
  ) {
    cloned.theme.colors = { ...POSTER_MOOD_PALETTES.dark_cyberpunk };
    cloned.theme.mode = "dark";
  } else if (instructionLower.includes("retro") || instructionLower.includes("vintage")) {
    cloned.theme.colors = { ...POSTER_MOOD_PALETTES.retro_bold };
  }

  // 2. Decoupled background changes (Elements are 100% preserved)
  if (
    instructionLower.includes("background") ||
    instructionLower.includes("bg")
  ) {
    if (instructionLower.includes("dark") || instructionLower.includes("black")) {
      cloned.theme.colors.background = "#090D16";
      cloned.theme.colors.surface = "#111827";
      cloned.theme.colors.textPrimary = "#F9FAFB";
      cloned.theme.colors.textSecondary = "#9CA3AF";
      cloned.theme.mode = "dark";
      if (page) {
        page.background = {
          type: "solid",
          value: "#090D16",
          glow: { enabled: true, position: "bottom_right", color: "#38BDF8", blur: 80, opacity: 0.2 },
        };
        page.backgroundOverride = "#090D16";
      }
    } else if (instructionLower.includes("light") || instructionLower.includes("white")) {
      cloned.theme.colors.background = "#FFFFFF";
      cloned.theme.colors.surface = "#F8FAFC";
      cloned.theme.colors.textPrimary = "#0F172A";
      cloned.theme.colors.textSecondary = "#64748B";
      cloned.theme.mode = "light";
      if (page) {
        page.background = {
          type: "solid",
          value: "#FFFFFF",
        };
        page.backgroundOverride = "#FFFFFF";
      }
    } else if (instructionLower.includes("gradient") || instructionLower.includes("purple")) {
      cloned.theme.colors.background = "#1E1B4B";
      cloned.theme.colors.surface = "#2E1065";
      cloned.theme.colors.secondary = "#C084FC";
      cloned.theme.colors.textPrimary = "#FAF5FF";
      cloned.theme.mode = "dark";
      if (page) {
        page.background = {
          type: "gradient",
          value: "linear-gradient(135deg, #1E1B4B 0%, #2E1065 100%)",
          glow: { enabled: true, position: "top_right", color: "#C084FC", blur: 80, opacity: 0.25 },
        };
        page.backgroundOverride = "#1E1B4B";
      }
    }
  }

  // 3. Social media / Instagram dimension resizing
  if (
    instructionLower.includes("instagram") ||
    instructionLower.includes("social") ||
    instructionLower.includes("square") ||
    instructionLower.includes("story")
  ) {
    let targetRatio: AspectRatio = "1:1";
    if (instructionLower.includes("story") || instructionLower.includes("reel")) {
      targetRatio = "9:16";
    } else if (instructionLower.includes("portrait") || instructionLower.includes("4:5")) {
      targetRatio = "4:5";
    }
    const preset = CANVAS_PRESETS[targetRatio];
    cloned.canvas.aspectRatio = targetRatio;
    cloned.canvas.width = preset.width;
    cloned.canvas.height = preset.height;
  }

  // 4. QR Code area addition
  if (
    instructionLower.includes("qr") ||
    instructionLower.includes("code") ||
    instructionLower.includes("scan")
  ) {
    const hasQr = page?.elements.some((e) => e.type === "qrcode");
    if (!hasQr && page) {
      page.elements.push({
        type: "qrcode",
        id: "poster-qrcode",
        url: "https://slidecraft.ai/register",
        label: "Scan to Register",
        scanHint: "Instant RSVP & Check-in",
        sizePx: 140,
        position: "bottom_right",
      });
    }
  }

  // 5. Title sizing or emphasis
  if (
    instructionLower.includes("title") ||
    instructionLower.includes("headline")
  ) {
    const titleElem = page?.elements.find((e) => e.id === "poster-title" && e.type === "text");
    if (titleElem && titleElem.type === "text") {
      titleElem.variant = "h1";
      if (instructionLower.includes("uppercase") || instructionLower.includes("caps")) {
        titleElem.content = titleElem.content.toUpperCase();
      }
    }
  }

  // 6. Reduce text density
  if (
    instructionLower.includes("reduce text") ||
    instructionLower.includes("less text") ||
    instructionLower.includes("cleaner")
  ) {
    if (page) {
      // Remove verbose captions or sub-items, shorten subtitle
      if (page.subtitle && page.subtitle.length > 60) {
        page.subtitle = page.subtitle.slice(0, 50) + "...";
      }
    }
  }

  return cloned;
}
