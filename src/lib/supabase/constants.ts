/**
 * Shared auth constants used by both Edge runtime (middleware) and Node.js runtime (server).
 * This file must not import any Node.js-only or browser-only modules.
 */
export const SUPABASE_PROJECT_REF = "ieiqdodjsldxbsfyjgtp";
export const AUTH_COOKIE_NAME = `sb-${SUPABASE_PROJECT_REF}-auth-token`;
