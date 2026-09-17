import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  executeMcpTool,
  AVAILABLE_MCP_TOOLS,
  SlideCraftMcpToolName,
} from "@/lib/mcp/client";

export const maxDuration = 60;

/**
 * GET /api/ai/mcp
 * Returns list of exposed MCP tools and capabilities.
 */
export async function GET() {
  return NextResponse.json({
    server: "slidecraft-mcp-server",
    version: "1.0.0",
    transport: "stdio | in-process",
    tools: AVAILABLE_MCP_TOOLS,
  });
}

/**
 * POST /api/ai/mcp
 * Invokes a specific MCP tool through SlideCraft's controlled tool layer.
 * Enforces user authentication and ownership check.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const toolName = body.tool as SlideCraftMcpToolName;
    const args = body.args || {};

    if (!toolName) {
      return NextResponse.json(
        { error: "Missing required parameter: 'tool'." },
        { status: 400 }
      );
    }

    // Resolve authenticated user if not explicitly passed
    if (!args.userId) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id) {
          args.userId = user.id;
        } else {
          args.userId = "anonymous";
        }
      } catch {
        args.userId = "anonymous";
      }
    }

    const result = await executeMcpTool(toolName, args);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[api/ai/mcp] Tool invocation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to execute MCP tool",
        },
      },
      { status: 500 }
    );
  }
}
