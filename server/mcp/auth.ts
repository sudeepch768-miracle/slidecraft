/**
 * SlideCraft MCP Server - Authentication & Ownership Authorization
 *
 * Enforces strict multi-tenant project ownership validation.
 * An authenticated user may only inspect or modify their own projects,
 * preventing cross-tenant access. Starter/demo projects are permitted for read/copy.
 */

import { projectService } from "@/lib/projects/project-service";
import { Project } from "@/types/database";
import { mcpLogger } from "./logger";

export interface OwnershipValidationResult {
  authorized: boolean;
  project?: Project;
  error?: {
    code: "UNAUTHORIZED" | "NOT_FOUND" | "FORBIDDEN";
    message: string;
  };
}

/**
 * Validates that a project exists and belongs to the specified user.
 */
export async function validateProjectOwnership(
  projectId: string,
  userId: string
): Promise<OwnershipValidationResult> {
  if (!userId || typeof userId !== "string") {
    mcpLogger.warn(`Ownership check failed: Missing or invalid userId for project ${projectId}`);
    return {
      authorized: false,
      error: {
        code: "UNAUTHORIZED",
        message: "A valid authenticated userId is required to access project resources.",
      },
    };
  }

  const project = await projectService.getProject(projectId);

  if (!project) {
    mcpLogger.warn(`Project not found during ownership check: ${projectId}`);
    return {
      authorized: false,
      error: {
        code: "NOT_FOUND",
        message: `Project '${projectId}' was not found in storage or database.`,
      },
    };
  }

  // Enforce strict project ownership matching project.user_id
  const isOwner = project.user_id === userId;

  if (!isOwner) {
    mcpLogger.warn(
      `Access denied: User '${userId}' attempted to access project '${projectId}' owned by '${project.user_id}'`
    );
    return {
      authorized: false,
      error: {
        code: "FORBIDDEN",
        message: `Access denied: User '${userId}' does not own project '${projectId}'.`,
      },
    };
  }

  return {
    authorized: true,
    project,
  };
}
