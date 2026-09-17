/**
 * MCP Tool: get_project
 *
 * Retrieves canonical DocumentSpec, layout metadata, and status for a SlideCraft project.
 * Validates user ownership before returning any data.
 */

import { validateProjectOwnership } from "../auth";
import { mcpLogger } from "../logger";
import {
  GetProjectInput,
  GetProjectInputSchema,
  GetProjectResultData,
  McpToolResponse,
} from "../types";

export async function handleGetProject(
  input: GetProjectInput
): Promise<McpToolResponse<GetProjectResultData>> {
  const parsed = GetProjectInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: parsed.error.errors.map((e) => e.message).join("; "),
      },
    };
  }

  const { projectId, userId } = parsed.data;
  mcpLogger.info(`Executing get_project for ${projectId}`);

  const auth = await validateProjectOwnership(projectId, userId);
  if (!auth.authorized || !auth.project) {
    return {
      success: false,
      error: auth.error || {
        code: "UNAUTHORIZED",
        message: "Project access unauthorized.",
      },
    };
  }

  const p = auth.project;
  const spec = p.current_spec;

  return {
    success: true,
    data: {
      id: p.id,
      name: p.name,
      projectType: p.project_type,
      status: p.status,
      pageCount: spec.pages?.length || 0,
      currentSpec: spec,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    },
    affectedIds: [p.id],
    changeSummary: `Successfully retrieved project '${p.name}' with ${spec.pages?.length || 0} pages.`,
  };
}
