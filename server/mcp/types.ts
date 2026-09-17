/**
 * SlideCraft MCP Server - Types and Zod Schemas
 *
 * Strict validation for all 5 initial MCP tools:
 * 1. get_project
 * 2. validate_layout
 * 3. change_page_background
 * 4. apply_change_to_all_pages
 * 5. generate_relevant_image
 */

import { z } from "zod";
import {
  DocumentSpec,
  DocumentSpecSchema,
  PageBackgroundSchema,
  ThemeColorsSchema,
  ThemeTypographySchema,
  MediaElement,
} from "@/types/document-spec";

// ─── Standardized MCP Tool Result Structure ────────────────────────────────────

export interface McpToolResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  affectedIds?: string[];
  warnings?: string[];
  changeSummary?: string;
  undoPatch?: Record<string, any>;
}

// ─── 1. get_project ───────────────────────────────────────────────────────────

export const GetProjectInputSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  userId: z.string().min(1, "userId is required for ownership validation"),
});
export type GetProjectInput = z.infer<typeof GetProjectInputSchema>;

export interface GetProjectResultData {
  id: string;
  name: string;
  projectType: string;
  status: string;
  pageCount: number;
  currentSpec: DocumentSpec;
  createdAt: string;
  updatedAt: string;
}

// ─── 2. validate_layout ───────────────────────────────────────────────────────

export const ValidateLayoutInputSchema = z
  .object({
    projectId: z.string().optional(),
    userId: z.string().optional(),
    documentSpec: DocumentSpecSchema.optional(),
  })
  .refine(
    (val) => Boolean(val.projectId || val.documentSpec),
    "Either 'projectId' (with 'userId') or 'documentSpec' must be provided."
  );
export type ValidateLayoutInput = z.infer<typeof ValidateLayoutInputSchema>;

export interface ValidateLayoutResultData {
  overallScore: number;
  passed: boolean;
  collisionCount: number;
  issueCount: number;
  categories: Record<
    string,
    {
      label: string;
      score: number;
      status: "good" | "warning" | "critical";
      issuesCount: number;
    }
  >;
  issues: Array<{
    code: string;
    category: string;
    severity: "error" | "warning" | "info";
    message: string;
    pageIndex?: number;
    elementId?: string;
    suggestion?: string;
  }>;
}

// ─── 3. change_page_background ────────────────────────────────────────────────

export const ChangePageBackgroundInputSchema = z
  .object({
    projectId: z.string().optional(),
    userId: z.string().optional(),
    documentSpec: DocumentSpecSchema.optional(),
    pageIndex: z.number().int().min(0, "pageIndex must be non-negative"),
    background: PageBackgroundSchema,
    syncThemeBackground: z.boolean().optional().default(false),
    persist: z.boolean().optional().default(false),
  })
  .refine(
    (val) => Boolean(val.projectId || val.documentSpec),
    "Either 'projectId' (with 'userId') or 'documentSpec' must be provided."
  );
export type ChangePageBackgroundInput = z.infer<typeof ChangePageBackgroundInputSchema>;

export interface ChangePageBackgroundResultData {
  pageIndex: number;
  pageId: string;
  previousBackground: any;
  newBackground: any;
  updatedDocument: DocumentSpec;
}

// ─── 4. apply_change_to_all_pages ─────────────────────────────────────────────

export const ApplyChangeToAllPagesInputSchema = z
  .object({
    projectId: z.string().optional(),
    userId: z.string().optional(),
    documentSpec: DocumentSpecSchema.optional(),
    changeType: z.enum(["background", "theme_palette", "typography"]),
    background: PageBackgroundSchema.optional(),
    palette: ThemeColorsSchema.optional(),
    typography: ThemeTypographySchema.optional(),
    persist: z.boolean().optional().default(false),
  })
  .refine(
    (val) => Boolean(val.projectId || val.documentSpec),
    "Either 'projectId' (with 'userId') or 'documentSpec' must be provided."
  )
  .refine((val) => {
    if (val.changeType === "background" && !val.background) return false;
    if (val.changeType === "theme_palette" && !val.palette) return false;
    if (val.changeType === "typography" && !val.typography) return false;
    return true;
  }, "Payload matching 'changeType' must be supplied (e.g. 'background' for 'background' changeType).");
export type ApplyChangeToAllPagesInput = z.infer<typeof ApplyChangeToAllPagesInputSchema>;

export interface ApplyChangeToAllPagesResultData {
  changeType: "background" | "theme_palette" | "typography";
  affectedPageIndices: number[];
  affectedPageIds: string[];
  updatedDocument: DocumentSpec;
}

// ─── 5. generate_relevant_image ───────────────────────────────────────────────

export const GenerateRelevantImageInputSchema = z.object({
  prompt: z
    .string()
    .min(3, "Prompt must be at least 3 characters")
    .max(1000, "Prompt must not exceed 1000 characters"),
  topic: z.string().optional(),
  slideTitle: z.string().optional(),
  role: z
    .enum(["hero", "card", "diagram", "background", "editorial", "case_study"])
    .optional()
    .default("card"),
  aspectRatio: z
    .enum(["16:9", "1:1", "9:16", "4:3", "3:4", "21:9", "3:2", "2:3"])
    .optional()
    .default("16:9"),
  projectId: z.string().optional(),
  userId: z.string().optional(),
});
export type GenerateRelevantImageInput = z.infer<typeof GenerateRelevantImageInputSchema>;

export interface GenerateRelevantImageResultData {
  url: string;
  storagePath?: string;
  width: number;
  height: number;
  seed?: number;
  role: string;
  mediaElement: MediaElement;
}
