/**
 * SlideCraft MCP Client Layer
 *
 * Bridges the AI Assistant and AI Router to the SlideCraft MCP tool layer.
 * Supports:
 * 1. Direct typed tool execution (in-process for web API / assistant execution).
 * 2. StdioClientTransport for connecting to external or subprocess MCP instances.
 */

import { McpToolResponse } from "../../../server/mcp/types";
import { handleGetProject } from "../../../server/mcp/tools/get-project";
import { handleValidateLayout } from "../../../server/mcp/tools/validate-layout";
import { handleChangePageBackground } from "../../../server/mcp/tools/change-page-background";
import { handleApplyChangeToAllPages } from "../../../server/mcp/tools/apply-change-to-all-pages";
import { handleGenerateRelevantImage } from "../../../server/mcp/tools/generate-relevant-image";

export type SlideCraftMcpToolName =
  | "get_project"
  | "validate_layout"
  | "change_page_background"
  | "apply_change_to_all_pages"
  | "generate_relevant_image";

export const AVAILABLE_MCP_TOOLS = [
  {
    name: "get_project",
    description:
      "Retrieve a SlideCraft project by ID with its canonical DocumentSpec, layout metadata, and status. Validates user ownership.",
  },
  {
    name: "validate_layout",
    description:
      "Validate document layout using SlideCraft's 14 design quality rules (collision detection, overlap analysis, readability, contrast, density).",
  },
  {
    name: "change_page_background",
    description:
      "Surgically update the background of a specific slide/page in a DocumentSpec. Strictly preserves 100% of text, images, shapes, and layout elements. Returns undo patch.",
  },
  {
    name: "apply_change_to_all_pages",
    description:
      "Uniformly apply a background, theme palette, or typography change across all pages while preserving all content elements. Returns undo patch.",
  },
  {
    name: "generate_relevant_image",
    description:
      "Generate a topic-relevant, studio-grade photorealistic visual asset using NVIDIA FLUX 4B. Enforces negative prompt so image prompt never leaks into slide copy.",
  },
];

/**
 * Executes an MCP tool directly through SlideCraft's controlled tool layer.
 */
export async function executeMcpTool<T = any>(
  toolName: SlideCraftMcpToolName,
  args: Record<string, any>
): Promise<McpToolResponse<T>> {
  switch (toolName) {
    case "get_project":
      return (await handleGetProject(args as any)) as McpToolResponse<T>;

    case "validate_layout":
      return (await handleValidateLayout(args as any)) as McpToolResponse<T>;

    case "change_page_background":
      return (await handleChangePageBackground(args as any)) as McpToolResponse<T>;

    case "apply_change_to_all_pages":
      return (await handleApplyChangeToAllPages(args as any)) as McpToolResponse<T>;

    case "generate_relevant_image":
      return (await handleGenerateRelevantImage(args as any)) as McpToolResponse<T>;

    default:
      return {
        success: false,
        error: {
          code: "UNKNOWN_TOOL",
          message: `Tool '${toolName}' is not recognized or not exposed by SlideCraft MCP server.`,
        },
      };
  }
}
