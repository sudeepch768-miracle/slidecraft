import { z } from "zod";
import { VisualDirectionSchema, type VisualDirection } from "./visual-direction";
export { VisualDirectionSchema, type VisualDirection } from "./visual-direction";

export const SlideContentTypeSchema = z.enum([
  "bullets",
  "paragraph",
  "comparison",
  "timeline",
  "case-study",
  "data",
  "quote",
  "mixed",
]);
export type SlideContentType = z.infer<typeof SlideContentTypeSchema>;

export const SlidePlanContentSchema = z.object({
  type: SlideContentTypeSchema,
  heading: z.string().optional(),
  points: z.array(z.string()).default([]),
  explanation: z.string().optional(),
  examples: z.array(z.string()).optional(),
  statistics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        context: z.string().optional(),
      })
    )
    .optional(),
  quote: z
    .object({
      text: z.string(),
      author: z.string().optional(),
    })
    .optional(),
  comparison: z
    .object({
      items: z.array(
        z.object({
          title: z.string(),
          points: z.array(z.string()),
        })
      ),
    })
    .optional(),
  timeline: z
    .object({
      steps: z.array(
        z.object({
          timeOrPhase: z.string(),
          title: z.string(),
          description: z.string(),
        })
      ),
    })
    .optional(),
  caseStudy: z
    .object({
      clientOrContext: z.string(),
      problem: z.string(),
      solution: z.string(),
      impact: z.string(),
    })
    .optional(),
});
export type SlidePlanContent = z.infer<typeof SlidePlanContentSchema>;

export const SlidePlanSchema = z.object({
  id: z.string().optional(),
  slideNumber: z.number(),
  title: z.string(),
  purpose: z.string(),
  keyMessage: z.string(),
  content: SlidePlanContentSchema,
  visualSuggestion: z.string().optional(),
  imageSuggestion: z.string().optional(),
  layoutSuggestion: z.string().optional(),
  speakerNotes: z.string().optional(),
  isLocked: z.boolean().default(false).optional(),
  section: z.string().optional(),
});
export type SlidePlan = z.infer<typeof SlidePlanSchema>;

export const PresentationPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  topic: z.string(),
  objective: z.string(),
  targetAudience: z.string().default("General Professional & Academic Audience"),
  presentationType: z
    .enum(["educational", "pitch", "conference", "corporate", "technical", "workshop"])
    .default("educational"),
  tone: z.string().default("Authoritative, engaging, and clear"),
  language: z.string().default("English"),
  slideCount: z.number().int().min(1).max(25).default(10),
  contentDepth: z.enum(["concise", "balanced", "detailed", "comprehensive"]).default("detailed"),
  estimatedDuration: z.string().default("15-20 minutes"),
  keyMessage: z.string(),
  sections: z.array(z.string()).default([]),
  slidePlans: z.array(SlidePlanSchema),
  citationPreference: z
    .enum(["academic_ieee", "apa", "footnote", "none"])
    .default("footnote")
    .optional(),
  includeSpeakerNotes: z.boolean().default(true),
  status: z.enum(["draft", "approved", "generated"]).default("draft"),
  templateConfig: z
    .object({
      mode: z.enum(["new_design", "use_template", "follow_sample", "combine"]).default("new_design"),
      templateName: z.string().optional(),
      sampleName: z.string().optional(),
      extractedTheme: z.any().optional(),
    })
    .optional(),
  visualDirection: VisualDirectionSchema.optional(),
  variationSeed: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PresentationPlan = z.infer<typeof PresentationPlanSchema>;

export interface PlanValidationResult {
  score: number;
  isComplete: boolean;
  warnings: string[];
  suggestions: string[];
}

export function createDefaultSlidePlan(
  slideNumber: number,
  title = "Untitled Slide",
  purpose = "Explain core insights"
): SlidePlan {
  return {
    id: `slide-${slideNumber}-${Date.now()}`,
    slideNumber,
    title,
    purpose,
    keyMessage: `Key takeaway for slide ${slideNumber}`,
    content: {
      type: "bullets",
      points: [
        "First substantive explanation point detailing the foundational insight.",
        "Secondary point connecting application to measurable real-world outcomes.",
        "Third contextual observation addressing operational or strategic considerations.",
      ],
      explanation: "Comprehensive overview providing clear context and depth for this topic.",
      examples: ["Practical application example demonstrating measurable impact."],
    },
    visualSuggestion: "Clean two-column layout with an informative callout card.",
    imageSuggestion: "Relevant professional high-resolution photography illustrating the core theme.",
    layoutSuggestion: "two_column_split",
    speakerNotes: `Deliver this slide with emphasis on ${title}. Highlight key takeaways and invite audience questions on the examples.`,
    isLocked: false,
    section: "Main Content",
  };
}

export function createDefaultPresentationPlan(
  prompt: string,
  slideCount = 10
): PresentationPlan {
  const now = new Date().toISOString();
  const title = prompt.length > 50 ? prompt.slice(0, 48) + "..." : prompt || "New Presentation";

  const slidePlans: SlidePlan[] = [];
  for (let i = 1; i <= slideCount; i++) {
    slidePlans.push(
      createDefaultSlidePlan(
        i,
        i === 1 ? title : `Key Topic Section ${i}`,
        i === 1 ? "Introduce the topic and outline core objectives" : `Deep dive into dimension ${i}`
      )
    );
  }

  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    title,
    topic: prompt,
    objective: "Educate and align audience on strategic insights and actionable takeaways.",
    targetAudience: "College Students, Researchers, and Professionals",
    presentationType: "educational",
    tone: "Informative, academic, and engaging",
    language: "English",
    slideCount,
    contentDepth: "detailed",
    estimatedDuration: `${Math.round(slideCount * 1.8)}-${Math.round(slideCount * 2.2)} minutes`,
    keyMessage: "Core understanding and actionable implications of the subject matter.",
    sections: ["Introduction", "Core Concepts", "Applications & Analysis", "Challenges & Future", "Conclusion"],
    slidePlans,
    citationPreference: "footnote",
    includeSpeakerNotes: true,
    status: "draft",
    templateConfig: {
      mode: "new_design",
    },
    createdAt: now,
    updatedAt: now,
  };
}
