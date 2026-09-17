#!/usr/bin/env node
/**
 * SlideCraft MCP Server - Stdio CLI Entrypoint
 *
 * Runs the SlideCraft MCP server over standard input/output (stdio)
 * for local development and integration with MCP clients.
 *
 * Usage:
 *   npx tsx server/mcp/index.ts
 */

import fs from "node:fs";
import path from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSlideCraftMcpServer } from "./server";
import { mcpLogger } from "./logger";

// Automatically load .env.local / .env for standalone stdio process execution
function loadEnvFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // Ignore if file unreadable
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

async function main() {
  mcpLogger.info("Starting SlideCraft MCP Server over stdio transport...");

  const server = createSlideCraftMcpServer();
  const transport = new StdioServerTransport();

  process.on("SIGINT", async () => {
    mcpLogger.info("Received SIGINT, closing SlideCraft MCP server...");
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    mcpLogger.info("Received SIGTERM, closing SlideCraft MCP server...");
    await server.close();
    process.exit(0);
  });

  try {
    await server.connect(transport);
    mcpLogger.info("SlideCraft MCP Server connected and listening on stdio.");
  } catch (err: any) {
    mcpLogger.error("Fatal error connecting MCP stdio transport", err);
    process.exit(1);
  }
}

main().catch((err) => {
  mcpLogger.error("Unhandled top-level error in MCP server", err);
  process.exit(1);
});
