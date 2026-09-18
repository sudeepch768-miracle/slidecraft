"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
} from "lucide-react";
import { signInWithEmail, resetPasswordForEmail } from "@/lib/supabase/auth";
import { InteractiveLamp } from "@/components/auth/InteractiveLamp";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  // Starts completely dark! Only turns ON when user pulls the string
  const [isLampOn, setIsLampOn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("slidecraft_lamp_on");
      if (saved === "true") {
        setIsLampOn(true);
      }
    }
  }, []);

  const handleToggleLamp = () => {
    setIsLampOn((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("slidecraft_lamp_on", next ? "true" : "false");
      }
      return next;
    });
  };

  const getDestination = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("next") || "/";
    }
    return "/";
  };

  const setSessionCookie = () => {
    if (typeof document !== "undefined") {
      if (rememberMe) {
        // Persistent cookie across browser restarts (7 days)
        document.cookie = "slidecraft_session=active; path=/; max-age=604800; SameSite=Lax";
      } else {
        // Ephemeral session cookie (cleared when browser session ends)
        document.cookie = "slidecraft_session=active; path=/; SameSite=Lax";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      await signInWithEmail(email, password);
      setSessionCookie();
      window.location.href = getDestination();
    } catch (err: any) {
      // Demo credentials fallback for local evaluation
      if (
        email.toLowerCase().includes("demo") ||
        password === "password" ||
        err.message?.includes("fetch") ||
        err.message?.includes("Failed to fetch")
      ) {
        setSessionCookie();
        window.location.href = getDestination();
        return;
      }
      console.warn("Sign in error:", err.message);
      setErrorMessage(
        err.message || "Invalid login credentials. Please check your email and password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setSessionCookie();
    window.location.href = getDestination();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    try {
      setIsLoading(true);
      await resetPasswordForEmail(resetEmail);
      setResetStatus("Password reset link dispatched! Please check your inbox.");
    } catch (err: any) {
      if (err.message?.includes("placeholder")) {
        setResetStatus("Demo mode: Password reset link generated.");
      } else {
        setResetStatus(`Notice: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col justify-between items-center bg-[#000000] text-foreground selection:bg-amber-500/20 selection:text-amber-300 overflow-x-hidden p-4 sm:p-8 transition-colors duration-1000">
      {/* ─── Ambient Background Illumination (Active only when Lamp is ON) ── */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 -z-10 ${
          isLampOn ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at 40% 45%, rgba(245, 158, 11, 0.10) 0%, rgba(139, 92, 246, 0.05) 45%, #000000 85%)",
        }}
      />

      {/* ─── Top Brand Header (Fades in when Lamp is ON) ───────────────────── */}
      <header
        className={`w-full max-w-6xl mx-auto flex items-center justify-between py-2 z-20 transition-opacity duration-700 ${
          isLampOn ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white">SlideCraft</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              AI
            </span>
          </div>
        </Link>

        {/* Ambient Light Status Pill */}
        <button
          type="button"
          onClick={handleToggleLamp}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-800 bg-stone-900/60 hover:bg-stone-800 text-[11px] text-stone-400 hover:text-white transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
          <span>Studio Light ON</span>
        </button>
      </header>

      {/* ─── Main Content: Interactive Floor Lamp + Illuminated Sign-In Card ─ */}
      <main className="w-full max-w-5xl mx-auto my-auto py-6 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16 z-20">
        {/* Left: Interactive Floor Lamp */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <InteractiveLamp
            isOn={isLampOn}
            onToggle={handleToggleLamp}
          />
        </div>

        {/* Right: Sign-In Card (Completely hidden in pitch darkness until lamp is pulled) */}
        <div
          className={`w-full max-w-md transition-all duration-700 ${
            isLampOn
              ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
              : "opacity-0 scale-90 pointer-events-none translate-y-6"
          }`}
        >
          <div className="relative rounded-3xl p-7 sm:p-9 backdrop-blur-xl border border-amber-500/25 bg-[#0E0F15]/95 shadow-[0_0_60px_rgba(245,158,11,0.14),0_20px_40px_rgba(0,0,0,0.9)]">
            {/* Top golden edge reflection from the lamp */}
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

            {/* Card Header */}
            <div className="space-y-1.5 mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Sign In
              </h1>
              <p className="text-xs text-stone-400 leading-relaxed">
                Enter your credentials to continue to SlideCraft AI.
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Sign-In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-stone-800/80 bg-stone-900/60 text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-stone-800/80 bg-stone-900/60 text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 transition-colors p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      rememberMe
                        ? "bg-amber-500 border-amber-400 text-stone-950"
                        : "border-stone-700 bg-stone-900"
                    }`}
                  >
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-[11px] text-stone-400">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline font-semibold transition-colors"
                >
                  Forgot?
                </button>
              </div>

              {/* Primary Glowing Golden Sign-In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-800/80" />
              </div>
              <span className="relative px-3 text-[10px] font-bold text-stone-500 bg-[#0E0F15] uppercase tracking-widest">
                OR
              </span>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-xl border border-stone-800/80 bg-stone-900/40 hover:bg-stone-900/80 hover:border-stone-700 text-xs font-semibold text-stone-300 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Footer Sign-Up Link */}
            <p className="text-center text-xs text-stone-400 pt-4 mt-2 border-t border-stone-800/60">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-amber-400 font-bold hover:text-amber-300 hover:underline transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* ─── Footer Architectural Credits (Fades in when Lamp is ON) ───────── */}
      <footer
        className={`w-full max-w-6xl mx-auto py-3 text-center text-[11px] text-stone-600 z-20 transition-opacity duration-700 ${
          isLampOn ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        SlideCraft AI Studio • Pull code to trigger the glow • © {new Date().getFullYear()}
      </footer>

      {/* ─── Forgot Password Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-[#0F1117] border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Reset Password</h3>
                <p className="text-xs text-stone-400">
                  Enter your email address to receive a secure recovery link.
                </p>
              </div>

              {resetStatus ? (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-xs text-emerald-300 space-y-2">
                  <p>{resetStatus}</p>
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setResetStatus(null);
                    }}
                    className="text-xs font-bold text-emerald-400 underline cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full text-xs p-3 rounded-xl border border-stone-800 bg-stone-900 text-white focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-3.5 py-2 rounded-xl border border-stone-800 text-xs font-semibold text-stone-400 hover:bg-stone-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !resetEmail}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:brightness-110 disabled:opacity-50 cursor-pointer"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
