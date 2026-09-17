import {
  AspectRatio,
  CANVAS_PRESETS,
  PageSpec,
  ContentElement,
} from "@/types/document-spec";
import { ProjectSpec } from "@/types/schemas/project-spec-schemas";
import { ResumeConfig, RESUME_TYPES } from "./resume-types";
import {
  resolveFormatPreset,
  presetToThemeSpec,
  presetToPageBackground,
  presetToVisualDirection,
} from "@/lib/generators/format-design-engine";

export function buildResumeDocumentSpec(config: ResumeConfig): ProjectSpec {
  const meta = RESUME_TYPES[config.resumeType] || RESUME_TYPES.ats_friendly;
  const aspectRatio: AspectRatio = config.aspectRatio || meta.suggestedAspectRatio || "A4_portrait";
  const canvasPreset = CANVAS_PRESETS[aspectRatio] || CANVAS_PRESETS["A4_portrait"];

  const formatPreset = resolveFormatPreset("resume", config.resumeType);
  const theme = presetToThemeSpec(formatPreset);
  const background = presetToPageBackground(formatPreset);
  const visualDirection = presetToVisualDirection(formatPreset, config.contactInfo?.name || "Professional Resume");

  const elements: ContentElement[] = [];

  // 1. Header Contact Block
  elements.push({
    type: "resume_block",
    id: "resume-header-block",
    sectionType: "header",
    contactInfo: config.contactInfo,
  });

  // 2. Summary Block (if provided)
  if (config.summaryText && config.summaryText.trim().length > 0) {
    elements.push({
      type: "resume_block",
      id: "resume-summary-block",
      sectionType: "summary",
      summaryText: config.summaryText,
    });
  }

  // 3. Experience Block (strictly based on input, never invented)
  if (config.experience && config.experience.length > 0) {
    elements.push({
      type: "resume_block",
      id: "resume-experience-block",
      sectionType: "experience",
      items: config.experience,
    });
  }

  // 4. Education Block
  if (config.education && config.education.length > 0) {
    elements.push({
      type: "resume_block",
      id: "resume-education-block",
      sectionType: "education",
      items: config.education,
    });
  }

  // 5. Skills Block
  if (config.skills && config.skills.length > 0) {
    elements.push({
      type: "resume_block",
      id: "resume-skills-block",
      sectionType: "skills",
      items: [
        {
          id: "skills-item-1",
          title: "Technical & Core Competencies",
          tags: config.skills,
          bullets: [],
        },
      ],
    });
  }

  // 6. Projects Block
  if (config.projects && config.projects.length > 0) {
    elements.push({
      type: "resume_block",
      id: "resume-projects-block",
      sectionType: "projects",
      items: config.projects,
    });
  }

  // 7. Certifications Block
  if (config.certifications && config.certifications.length > 0) {
    elements.push({
      type: "resume_block",
      id: "resume-certs-block",
      sectionType: "certifications",
      items: config.certifications,
    });
  }

  // 8. Awards Block
  if (config.awards && config.awards.length > 0) {
    elements.push({
      type: "resume_block",
      id: "resume-awards-block",
      sectionType: "awards",
      items: config.awards,
    });
  }

  const page: PageSpec = {
    id: "resume-page-1",
    pageNumber: 1,
    archetype: meta.archetype,
    title: config.contactInfo?.name || "Professional Resume",
    subtitle: config.contactInfo?.title || "Curriculum Vitae",
    badge: meta.label.toUpperCase(),
    background,
    backgroundOverride: background.type === "solid" ? background.value : undefined,
    elements,
  };

  return {
    version: "1.0.0",
    documentType: "resume",
    meta: {
      title: `${config.contactInfo?.name || "Candidate"} - Resume`,
      description: `${meta.label} compiled with verified credentials and structured ATS schema`,
      author: config.contactInfo?.name || "SlideCraft AI",
      tags: ["resume", config.resumeType, "cv", "career"],
      purpose: meta.description,
    },
    canvas: {
      width: canvasPreset.width,
      height: canvasPreset.height,
      aspectRatio,
      unit: "px",
      dpi: 96,
    },
    theme,
    visualDirection,
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
