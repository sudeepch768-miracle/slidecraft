/**
 * SlideCraft MCP Server
 *
 * Exposes application-specific tools over Model Context Protocol (MCP):
 * 1. get_project
 * 2. validate_layout
 * 3. change_page_background
 * 4. apply_change_to_all_pages
 * 5. generate_relevant_image
 *
 * Implements strict user authorization, canonical DocumentSpec validation,
 * zero-destructive background editing, and safe logging.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  PageBackgroundSchema,
  ThemeColorsSchema,
  ThemeTypographySchema,
} from "@/types/document-spec";
import { mcpLogger } from "./logger";
import {
  GetProjectInputSchema,
  GenerateRelevantImageInputSchema,
} from "./types";
import { handleGetProject } from "./tools/get-project";
import { handleValidateLayout } from "./tools/validate-layout";
import { handleChangePageBackground } from "./tools/change-page-background";
import { handleApplyChangeToAllPages } from "./tools/apply-change-to-all-pages";
import { handleGenerateRelevantImage } from "./tools/generate-relevant-image";

export function createSlideCraftMcpServer(): McpServer {
  const server = new McpServer({
    name: "slidecraft-mcp-server",
    version: "1.0.0",
  });

  // 1. Tool: get_project
  server.tool(
    "get_project",
    "Retrieve a SlideCraft project by ID with its canonical DocumentSpec, layout metadata, and status. Validates user ownership.",
    GetProjectInputSchema.shape,
    async (args) => {
      mcpLogger.info("Invoked tool: get_project", { projectId: args.projectId });
      const result = await handleGetProject(args);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // 2. Tool: validate_layout
  server.tool(
    "validate_layout",
    "Validate document layout using SlideCraft's 14 design quality rules (collision detection, overlap analysis, readability, contrast, density).",
    {
      projectId: z.string().optional().describe("ID of project to validate"),
      userId: z.string().optional().describe("Authenticated user ID for ownership validation"),
      documentSpec: z.any().optional().describe("In-memory DocumentSpec object to validate directly"),
    },
    async (args) => {
      mcpLogger.info("Invoked tool: validate_layout", { projectId: args.projectId });
      const result = await handleValidateLayout(args);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // 3. Tool: change_page_background
  server.tool(
    "change_page_background",
    "Surgically update the background of a specific slide/page in a DocumentSpec. Strictly preserves 100% of text, images, shapes, and layout elements. Returns undo patch.",
    {
      projectId: z.string().optional().describe("ID of project to modify"),
      userId: z.string().optional().describe("Authenticated user ID for ownership validation"),
      documentSpec: z.any().optional().describe("In-memory DocumentSpec object"),
      pageIndex: z.number().int().min(0).describe("0-based page index to update"),
      background: PageBackgroundSchema.describe("Background specification object"),
      syncThemeBackground: z
        .boolean()
        .optional()
        .describe("Optionally synchronize solid color with global theme background"),
      persist: z.boolean().optional().describe("Whether to persist changes directly to project storage"),
    },
    async (args) => {
      mcpLogger.info("Invoked tool: change_page_background", {
        pageIndex: args.pageIndex,
        bgType: args.background?.type,
      });
      const result = await handleChangePageBackground(args as any);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // 4. Tool: apply_change_to_all_pages
  server.tool(
    "apply_change_to_all_pages",
    "Uniformly apply a background, theme palette, or typography change across all pages while preserving all content elements. Returns undo patch.",
    {
      projectId: z.string().optional().describe("ID of project to update"),
      userId: z.string().optional().describe("Authenticated user ID for ownership validation"),
      documentSpec: z.any().optional().describe("In-memory DocumentSpec object"),
      changeType: z
        .enum(["background", "theme_palette", "typography"])
        .describe("Type of change to apply globally"),
      background: PageBackgroundSchema.optional().describe("PageBackground object for background changeType"),
      palette: ThemeColorsSchema.optional().describe("ThemeColors object for theme_palette changeType"),
      typography: ThemeTypographySchema.optional().describe("ThemeTypography object for typography changeType"),
      persist: z.boolean().optional().describe("Whether to persist changes directly to project storage"),
    },
    async (args) => {
      mcpLogger.info("Invoked tool: apply_change_to_all_pages", { changeType: args.changeType });
      const result = await handleApplyChangeToAllPages(args as any);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // 5. Tool: generate_relevant_image
  server.tool(
    "generate_relevant_image",
    "Generate a topic-relevant, studio-grade photorealistic visual asset using NVIDIA FLUX 4B. Enforces negative prompt so image prompt never leaks into slide copy.",
    GenerateRelevantImageInputSchema.shape,
    async (args) => {
      mcpLogger.info("Invoked tool: generate_relevant_image", {
        role: args.role,
        aspectRatio: args.aspectRatio,
      });
      const result = await handleGenerateRelevantImage(args);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  return server;
}
