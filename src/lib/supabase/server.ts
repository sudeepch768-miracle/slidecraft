import "@/lib/supabase/dns-fix";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./constants";

export async function createClient() {
  let cookieStore: any = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Graceful fallback when invoked outside Next.js request scope (e.g. background tasks or test runners)
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ieiqdodjsldxbsfyjgtp.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createServerClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
      name: AUTH_COOKIE_NAME,
    },
    cookies: {
      get(name: string) {
        return cookieStore ? cookieStore.get(name)?.value : undefined;
      },
      set(name: string, value: string, options: CookieOptions) {
        if (cookieStore) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Can happen in Server Components where cookies are read-only
          }
        }
      },
      remove(name: string, options: CookieOptions) {
        if (cookieStore) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Can happen in Server Components
          }
        }
      },
    },
  });
}
