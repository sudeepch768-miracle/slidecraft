import { createBrowserClient } from "@supabase/ssr";
export { AUTH_COOKIE_NAME } from "./constants";
import { AUTH_COOKIE_NAME } from "./constants";

export function createClient() {
  const isBrowser = typeof window !== "undefined";
  // In the browser, route through the local Next.js proxy to bypass ISP DNS hijacking
  const supabaseUrl = isBrowser
    ? `${window.location.origin}/api/supabase`
    : process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ieiqdodjsldxbsfyjgtp.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createBrowserClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
      name: AUTH_COOKIE_NAME,
    },
  });
}


