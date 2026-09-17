import { AspectRatio, LayoutArchetype } from "@/types/document-spec";

export type LetterType =
  | "leave"
  | "permission"
  | "request"
  | "complaint"
  | "internship_application"
  | "job_application"
  | "cover"
  | "resignation"
  | "invitation"
  | "college_correspondence"
  | "business";

export type LetterTone = "formal" | "executive" | "academic" | "cordial" | "assertive";

export interface LetterTypeMeta {
  id: LetterType;
  archetype: LayoutArchetype;
  label: string;
  description: string;
  defaultTone: LetterTone;
  suggestedAspectRatio: AspectRatio;
}

export const LETTER_TYPES: Record<LetterType, LetterTypeMeta> = {
  leave: {
    id: "leave",
    archetype: "letter_leave",
    label: "Leave Application",
    description: "Formal medical, personal, or sabbatical leave requests with date ranges",
    defaultTone: "formal",
    suggestedAspectRatio: "US_letter",
  },
  permission: {
    id: "permission",
    archetype: "letter_permission",
    label: "Permission & Approval Letter",
    description: "Requests for equipment access, venue clearance, or institutional endorsement",
    defaultTone: "formal",
    suggestedAspectRatio: "US_letter",
  },
  request: {
    id: "request",
    archetype: "letter_request",
    label: "Official Request Letter",
    description: "Formal petition for information, services, funding, or resources",
    defaultTone: "formal",
    suggestedAspectRatio: "US_letter",
  },
  complaint: {
    id: "complaint",
    archetype: "letter_complaint",
    label: "Grievance & Complaint Letter",
    description: "Professional escalation of service discrepancies or contractual issues",
    defaultTone: "assertive",
    suggestedAspectRatio: "US_letter",
  },
  internship_application: {
    id: "internship_application",
    archetype: "letter_internship_application",
    label: "Internship Application Letter",
    description: "Student / graduate internship pitch highlighting relevant skills and interest",
    defaultTone: "cordial",
    suggestedAspectRatio: "US_letter",
  },
  job_application: {
    id: "job_application",
    archetype: "letter_job_application",
    label: "Employment Application Letter",
    description: "Structured job opening candidacy with role matching and availability",
    defaultTone: "executive",
    suggestedAspectRatio: "US_letter",
  },
  cover: {
    id: "cover",
    archetype: "letter_cover",
    label: "Professional Cover Letter",
    description: "Compelling narrative accompanying resume for hiring managers",
    defaultTone: "executive",
    suggestedAspectRatio: "US_letter",
  },
  resignation: {
    id: "resignation",
    archetype: "letter_resignation",
    label: "Formal Resignation Letter",
    description: "Respectful notice of departure with transition support and gratitude",
    defaultTone: "cordial",
    suggestedAspectRatio: "US_letter",
  },
  invitation: {
    id: "invitation",
    archetype: "letter_invitation",
    label: "Dignitary & Speaker Invitation",
    description: "High-level invitation for guest speakers, keynote dignitaries, or panelists",
    defaultTone: "cordial",
    suggestedAspectRatio: "US_letter",
  },
  college_correspondence: {
    id: "college_correspondence",
    archetype: "letter_college_correspondence",
    label: "Academic / Dean Correspondence",
    description: "Official memoranda to faculty deans, department heads, or exam boards",
    defaultTone: "academic",
    suggestedAspectRatio: "US_letter",
  },
  business: {
    id: "business",
    archetype: "letter_business",
    label: "B2B Commercial Letter",
    description: "Partnership proposals, client contracts, and corporate notices",
    defaultTone: "executive",
    suggestedAspectRatio: "US_letter",
  },
};

export interface LetterParty {
  name: string;
  title?: string;
  organization?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface LetterConfig {
  letterType: LetterType;
  tone?: LetterTone;
  sender: LetterParty;
  recipient: LetterParty;
  date?: string;
  subject: string;
  salutation?: string;
  bodyParagraphs: string[];
  closing?: string;
  signer?: LetterParty;
  enclosures?: string[];
  aspectRatio?: AspectRatio;
}
