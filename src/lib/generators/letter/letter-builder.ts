import {
  AspectRatio,
  CANVAS_PRESETS,
  PageSpec,
  ContentElement,
} from "@/types/document-spec";
import { ProjectSpec } from "@/types/schemas/project-spec-schemas";
import { LetterConfig, LETTER_TYPES } from "./letter-types";

export function buildLetterDocumentSpec(config: LetterConfig): ProjectSpec {
  const meta = LETTER_TYPES[config.letterType] || LETTER_TYPES.business;
  const aspectRatio: AspectRatio = config.aspectRatio || meta.suggestedAspectRatio || "US_letter";
  const canvasPreset = CANVAS_PRESETS[aspectRatio] || CANVAS_PRESETS["US_letter"];

  const elements: ContentElement[] = [];

  // 1. Sender Header / Letterhead
  elements.push({
    type: "letter_block",
    id: "letter-sender-header",
    sectionType: "sender_header",
    sender: config.sender,
  });

  // 2. Date Line
  elements.push({
    type: "letter_block",
    id: "letter-date-line",
    sectionType: "date_line",
    date: config.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  });

  // 3. Recipient Header
  elements.push({
    type: "letter_block",
    id: "letter-recipient-header",
    sectionType: "recipient_header",
    recipient: config.recipient,
  });

  // 4. Subject Line
  elements.push({
    type: "letter_block",
    id: "letter-subject-line",
    sectionType: "subject_line",
    subject: config.subject,
  });

  // 5. Salutation
  elements.push({
    type: "letter_block",
    id: "letter-salutation",
    sectionType: "salutation",
    salutation: config.salutation || `Dear ${config.recipient.name || "Sir / Madam"},`,
  });

  // 6. Body Paragraphs
  const paragraphs =
    config.bodyParagraphs && config.bodyParagraphs.length > 0
      ? config.bodyParagraphs
      : [
          "I am writing to formally submit this correspondence regarding the aforementioned subject.",
          "Please review the enclosed details at your earliest convenience. We remain available for any clarifications or supporting documentation required.",
          "Thank you for your consideration and prompt attention to this matter.",
        ];

  paragraphs.forEach((p, idx) => {
    elements.push({
      type: "letter_block",
      id: `letter-body-${idx + 1}`,
      sectionType: "body_paragraph",
      content: p,
    });
  });

  // 7. Complimentary Close
  elements.push({
    type: "letter_block",
    id: "letter-closing",
    sectionType: "complimentary_close",
    closing: config.closing || (config.tone === "cordial" ? "Warm regards," : "Sincerely,"),
  });

  // 8. Signature Block
  elements.push({
    type: "letter_block",
    id: "letter-signature",
    sectionType: "signature_block",
    signer: config.signer || config.sender,
  });

  // 9. Enclosures (if any)
  if (config.enclosures && config.enclosures.length > 0) {
    elements.push({
      type: "letter_block",
      id: "letter-enclosures",
      sectionType: "enclosures",
      content: `Enclosures: ${config.enclosures.join(", ")}`,
    });
  }

  const page: PageSpec = {
    id: "letter-page-1",
    pageNumber: 1,
    archetype: meta.archetype,
    title: config.subject || "Official Letter",
    subtitle: `${meta.label} - ${config.sender.name}`,
    badge: meta.label.toUpperCase(),
    elements,
  };

  return {
    version: "1.0.0",
    documentType: "letter",
    meta: {
      title: config.subject || "Official Correspondence",
      description: `${meta.label} prepared for ${config.recipient.organization || config.recipient.name}`,
      author: config.sender.name || "SlideCraft AI",
      tags: ["letter", config.letterType, "correspondence", "official"],
      purpose: meta.description,
    },
    canvas: {
      width: canvasPreset.width,
      height: canvasPreset.height,
      aspectRatio,
      unit: "px",
      dpi: 96,
    },
    theme: {
      mode: "light",
      colors: {
        primary: "#1E293B",
        secondary: "#2563EB",
        accent: "#0369A1",
        background: "#FFFFFF",
        surface: "#F8FAFC",
        textPrimary: "#0F172A",
        textSecondary: "#334155",
        border: "#E2E8F0",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 14,
      },
      styleTokens: {
        borderRadiusPx: 4,
        shadow: "none",
      },
    },
    exportSettings: {
      targetFormat: "docx",
      resolutionDpi: 96,
      includeSpeakerNotes: false,
      embedFonts: true,
      vectorPreservation: true,
    },
    pages: [page],
  };
}
