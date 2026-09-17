"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InteractiveLampProps {
  isOn: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Synthesizes a crisp physical pull-chain click sound via Web Audio API.
 * Completely self-contained with silent fallback if audio is disabled.
 */
function playSwitchSound(type: "down" | "up") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const freq = type === "down" ? 720 : 540;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Graceful silent fallback
  }
}

export const InteractiveLamp: React.FC<InteractiveLampProps> = ({
  isOn,
  onToggle,
  className = "",
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [showTooltip, setShowTooltip] = useState(!isOn);

  const handlePull = useCallback(() => {
    setIsPulling(true);
    playSwitchSound("down");

    setTimeout(() => {
      onToggle();
      playSwitchSound("up");
      setIsPulling(false);
      setShowTooltip(false);
    }, 180);
  }, [onToggle]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none scale-[0.68] sm:scale-100 origin-center -my-14 sm:my-0 transition-transform ${className}`}
      style={{ minWidth: "320px", height: "540px" }}
    >
      {/* ─── Ambient Glow in Background when Lamp is ON ────────────────────── */}
      <div
        className={`absolute -top-10 left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full pointer-events-none transition-opacity duration-700 ${
          isOn ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(255, 215, 120, 0.18) 0%, rgba(245, 158, 11, 0.08) 45%, rgba(139, 92, 246, 0.04) 70%, transparent 85%)",
          filter: "blur(40px)",
        }}
      />

      {/* ─── Volumetric Light Cone ─────────────────────────────────────────── */}
      <div
        className={`absolute top-[96px] left-1/2 -translate-x-1/2 w-[340px] sm:w-[420px] h-[360px] sm:h-[400px] pointer-events-none transition-all duration-700 ${
          isOn ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{
          clipPath: "polygon(34% 0%, 66% 0%, 100% 100%, 0% 100%)",
          background:
            "linear-gradient(to bottom, rgba(255, 245, 200, 0.55) 0%, rgba(255, 220, 130, 0.22) 30%, rgba(245, 158, 11, 0.08) 70%, transparent 100%)",
          filter: "blur(2.5px)",
        }}
      />

      {/* Secondary Inner Bright Core Cone */}
      <div
        className={`absolute top-[96px] left-1/2 -translate-x-1/2 w-[220px] sm:w-[260px] h-[320px] pointer-events-none transition-all duration-500 ${
          isOn ? "opacity-100" : "opacity-0"
        }`}
        style={{
          clipPath: "polygon(38% 0%, 62% 0%, 90% 100%, 10% 100%)",
          background:
            "linear-gradient(to bottom, rgba(255, 255, 235, 0.65) 0%, rgba(255, 235, 160, 0.20) 40%, transparent 95%)",
          filter: "blur(1.5px)",
        }}
      />

      {/* ─── Lamp Top Cap / Finial ─────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-col items-center">
        <div className="w-5 h-2 rounded-t-sm bg-gradient-to-r from-amber-700 via-amber-300 to-amber-800 shadow-xs" />
        <div className="w-9 h-1 rounded-sm bg-amber-400/80 shadow-xs" />

        {/* ─── Conical Lampshade ────────────────────────────────────────────── */}
        <div
          className="relative w-36 sm:w-44 h-20 transition-all duration-300"
          style={{
            clipPath: "polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)",
            background: isOn
              ? "linear-gradient(180deg, #3A3228 0%, #2A241C 65%, #1F1B14 100%)"
              : "linear-gradient(180deg, #1C1917 0%, #151311 65%, #0F0E0C 100%)",
            boxShadow: isOn ? "inset 0 -12px 20px rgba(255, 200, 80, 0.4)" : "none",
          }}
        >
          {/* Subtle shade metallic bevel highlight */}
          <div className="absolute top-0 left-[22%] right-[22%] h-[1px] bg-amber-400/40" />
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-amber-500/30" />
        </div>

        {/* ─── Horizontal Luminous Light Band / Diffuser Ring ──────────────── */}
        <div
          className={`relative z-20 w-36 sm:w-44 h-3.5 rounded-b-md transition-all duration-500 flex items-center justify-center ${
            isOn
              ? "bg-gradient-to-r from-amber-100 via-white to-amber-100 shadow-[0_0_25px_#FFE699,0_0_50px_rgba(255,215,100,0.85),0_0_90px_rgba(245,158,11,0.5)]"
              : "bg-stone-800/80 border-t border-white/5 shadow-inner"
          }`}
        >
          {isOn && (
            <div className="w-3/4 h-[2px] bg-white rounded-full blur-[0.5px] opacity-95 animate-pulse" />
          )}
        </div>

        {/* ─── Interactive Pull-Cord & Beaded Chain ─────────────────────────── */}
        <div className="absolute top-[88px] right-3 sm:right-5 z-30 flex flex-col items-center">
          {/* Fixed Mount Point */}
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-xs" />

          {/* Animated Spring Cord */}
          <motion.div
            className="flex flex-col items-center cursor-pointer group"
            animate={{
              y: isPulling ? 24 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 14,
            }}
            onClick={handlePull}
            title={isOn ? "Pull to turn off light" : "Pull to turn on light"}
            role="button"
            aria-label="Pull cord to toggle lamp"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePull();
              }
            }}
          >
            {/* Beaded Chain Wire */}
            <div
              className={`w-[2px] transition-colors duration-300 ${
                isOn ? "bg-amber-300/90 shadow-[0_0_4px_rgba(255,215,100,0.8)]" : "bg-stone-500"
              }`}
              style={{
                height: "58px",
                backgroundImage:
                  "radial-gradient(circle, rgba(245, 158, 11, 0.9) 1px, transparent 1px)",
                backgroundSize: "2px 5px",
              }}
            />

            {/* Glowing Golden Tassel / Pull Pendant */}
            <div className="relative">
              <div
                className={`w-3.5 h-7 rounded-full transition-all duration-300 border ${
                  isOn
                    ? "bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 border-amber-200 shadow-[0_0_12px_rgba(255,215,100,0.9)]"
                    : "bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 border-amber-300/70 shadow-[0_0_15px_rgba(245,158,11,0.85),0_0_25px_rgba(245,158,11,0.4)] animate-pulse"
                } group-hover:scale-110 group-active:scale-95`}
              >
                {/* Metallic Accent Bands */}
                <div className="absolute top-1.5 inset-x-0.5 h-[1px] bg-white/60" />
                <div className="absolute bottom-1.5 inset-x-0.5 h-[1px] bg-black/30" />
              </div>

              {/* Interactive Tooltip Callout */}
              <AnimatePresence>
                {(!isOn || showTooltip) && (
                  <motion.div
                    initial={{ opacity: 0, x: 8, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.9 }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-black shadow-lg shadow-amber-500/30 flex items-center gap-1 pointer-events-none"
                  >
                    <span>Pull code</span>
                    <span className="text-[12px]">↓</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Lamp Stand Stem ───────────────────────────────────────────────── */}
      <div className="relative z-10 w-[4px] h-[340px] bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 shadow-[0_0_6px_rgba(245,158,11,0.4)] rounded-full -mt-1" />

      {/* ─── Lamp Circular Floor Base ──────────────────────────────────────── */}
      <div className="relative z-20 flex flex-col items-center -mt-1">
        {/* Base collar */}
        <div className="w-6 h-2 rounded-t-sm bg-gradient-to-r from-amber-700 via-amber-300 to-amber-800 shadow-sm" />
        {/* Flat circular base */}
        <div className="w-28 sm:w-36 h-3 rounded-full bg-gradient-to-r from-stone-900 via-amber-800 to-stone-900 border border-amber-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute inset-x-2 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        </div>
      </div>

      {/* ─── Warm Floor Light Puddle / Reflection ───────────────────────────── */}
      <div
        className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-[280px] sm:w-[360px] h-[55px] rounded-[50%] pointer-events-none transition-opacity duration-700 ${
          isOn ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255, 220, 130, 0.40) 0%, rgba(245, 158, 11, 0.15) 50%, transparent 80%)",
          filter: "blur(12px)",
        }}
      />
    </div>
  );
};
