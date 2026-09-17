/**
 * SlideCraft MCP Server - Safe Logger
 *
 * All logs are strictly routed to `process.stderr` so that `process.stdout`
 * remains dedicated 100% to MCP JSON-RPC protocol frames.
 * Sensitive tokens and keys (NVIDIA, Groq, Supabase) are automatically redacted.
 */

const REDACTED_PATTERNS = [
  /nvapi-[a-zA-Z0-9_-]+/g,
  /gsk_[a-zA-Z0-9_-]+/g,
  /sk-[a-zA-Z0-9_-]+/g,
  /bearer\s+[a-zA-Z0-9_.-]+/gi,
  /key=[a-zA-Z0-9_.-]+/gi,
];

function sanitize(message: string): string {
  let cleaned = message;
  for (const pattern of REDACTED_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[REDACTED_SECRET]");
  }
  return cleaned;
}

export const mcpLogger = {
  info(msg: string, ...args: any[]) {
    const serialized = args.length > 0 ? " " + JSON.stringify(args) : "";
    process.stderr.write(`[SlideCraft MCP INFO] ${sanitize(msg + serialized)}\n`);
  },
  warn(msg: string, ...args: any[]) {
    const serialized = args.length > 0 ? " " + JSON.stringify(args) : "";
    process.stderr.write(`[SlideCraft MCP WARN] ${sanitize(msg + serialized)}\n`);
  },
  error(msg: string, error?: any) {
    const errDetails = error
      ? error instanceof Error
        ? `\n${error.stack || error.message}`
        : `\n${JSON.stringify(error)}`
      : "";
    process.stderr.write(`[SlideCraft MCP ERROR] ${sanitize(msg + errDetails)}\n`);
  },
};
