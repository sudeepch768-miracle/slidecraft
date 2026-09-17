import { AspectRatio, LayoutArchetype } from "@/types/document-spec";

export type ResumeType =
  | "ats_friendly"
  | "academic_cv"
  | "internship"
  | "creative"
  | "portfolio_profile";

export interface ResumeTypeMeta {
  id: ResumeType;
  archetype: LayoutArchetype;
  label: string;
  description: string;
  suggestedAspectRatio: AspectRatio;
}

export const RESUME_TYPES: Record<ResumeType, ResumeTypeMeta> = {
  ats_friendly: {
    id: "ats_friendly",
    archetype: "resume_ats_friendly",
    label: "ATS-Optimized Resume",
    description: "Clean single-column hierarchical format parsed flawlessly by ATS scanners",
    suggestedAspectRatio: "A4_portrait",
  },
  academic_cv: {
    id: "academic_cv",
    archetype: "resume_academic_cv",
    label: "Academic & Research CV",
    description: "Scholarly curriculum vitae with publications, research grants, and teaching",
    suggestedAspectRatio: "A4_portrait",
  },
  internship: {
    id: "internship",
    archetype: "resume_internship",
    label: "Student & Internship Resume",
    description: "Highlighting coursework, academic projects, leadership, and technical competencies",
    suggestedAspectRatio: "A4_portrait",
  },
  creative: {
    id: "creative",
    archetype: "resume_creative",
    label: "Creative Two-Column Resume",
    description: "Modern split layout with vibrant sidebar, skill badges, and project highlights",
    suggestedAspectRatio: "A4_portrait",
  },
  portfolio_profile: {
    id: "portfolio_profile",
    archetype: "resume_portfolio_profile",
    label: "Executive Portfolio Profile",
    description: "High-impact leadership summary, career achievements, and strategic competencies",
    suggestedAspectRatio: "A4_portrait",
  },
};

export interface ResumeContactInfo {
  name: string;
  title?: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ResumeSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  dateRange?: string;
  location?: string;
  bullets: string[];
  tags?: string[];
}

export interface ResumeConfig {
  resumeType: ResumeType;
  contactInfo: ResumeContactInfo;
  summaryText?: string;
  experience?: ResumeSectionItem[];
  education?: ResumeSectionItem[];
  skills?: string[];
  projects?: ResumeSectionItem[];
  certifications?: ResumeSectionItem[];
  awards?: ResumeSectionItem[];
  aspectRatio?: AspectRatio;
}
