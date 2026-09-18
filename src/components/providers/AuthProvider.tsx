"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { signOut as authSignOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Check current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
      } else if (
        typeof document !== "undefined" &&
        (document.cookie.includes("slidecraft_session=active") || document.cookie.includes("slidecraft_auth="))
      ) {
        setUser({
          id: "demo-user",
          email: "creator@slidecraft.ai",
          user_metadata: { full_name: "SlideCraft Creator" },
        } as any);
      }
      setLoading(false);
    });

    // Listen to auth state transitions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
      } else if (
        typeof document !== "undefined" &&
        (document.cookie.includes("slidecraft_session=active") || document.cookie.includes("slidecraft_auth="))
      ) {
        setUser({
          id: "demo-user",
          email: "creator@slidecraft.ai",
          user_metadata: { full_name: "SlideCraft Creator" },
        } as any);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      if (typeof document !== "undefined") {
        document.cookie = "slidecraft_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "slidecraft_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        // Also ensure any split supabase cookies are cleared
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
          if (name.startsWith("sb-") || name.startsWith("slidecraft_")) {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
          }
        });
      }
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("slidecraft_lamp_on");
      }
      try {
        await authSignOut();
      } catch {
        // Safe fallback for local/offline sessions
      }
      setUser(null);
      setSession(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("Sign out error:", err);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
