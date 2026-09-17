"use client";

import React from "react";

/**
 * LandingBackground
 *
 * Sophisticated, high-performance ambient animated background for the landing page.
 *
 * Visual Direction:
 * - Deep navy foundation in dark mode (#070A13 / #0D0D12) with slowly drifting
 *   violet, cyan, royal blue, and fuchsia gradient orbs.
 * - Warm pearlescent foundation in light mode (#FAF9F6) with delicate lavender and sky-blue glows.
 * - Subtle geometric grid lattice with radial vignette mask.
 * - Pure GPU-accelerated CSS keyframe transforms (translate3d, scale) for 60fps smoothness with zero CPU overhead.
 * - 100% compliant with prefers-reduced-motion (animations safely disabled via CSS media query).
 * - Fixed positioning, -z-10, overflow-hidden: guarantees no layout shifts or horizontal scrolling.
 */
export const LandingBackground: React.FC = () => {
  return (
    <div
      id="landing-bg"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* ─── Layer 1: Dark Navy Foundation Gradient ────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070A13] via-[#0B0F19] to-[#070A13] dark:opacity-100 opacity-0 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] via-[#F5F4F0] to-[#FAF9F6] dark:opacity-0 opacity-100 transition-opacity duration-500" />

      {/* ─── Layer 2: Floating Organic Gradient Orbs ───────────────────── */}
      {/* Orb 1: Violet / Purple (Top-Left Drifter) */}
      <div
        className="absolute -top-24 -left-24 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] rounded-full blur-[110px] sm:blur-[130px] opacity-70 dark:opacity-80 animate-orb-1"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(124, 58, 237, 0.15) 50%, transparent 70%)",
        }}
      />

      {/* Orb 2: Electric Cyan / Sky Blue (Top-Right Drifter) */}
      <div
        className="absolute -top-20 -right-20 w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full blur-[100px] sm:blur-[120px] opacity-60 dark:opacity-75 animate-orb-2"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.30) 0%, rgba(14, 165, 233, 0.15) 50%, transparent 70%)",
        }}
      />

      {/* Orb 3: Royal Blue / Indigo (Mid-Center Ambient Anchor) */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[500px] rounded-full blur-[120px] sm:blur-[150px] opacity-50 dark:opacity-65 animate-orb-3"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.12) 50%, transparent 75%)",
        }}
      />

      {/* Orb 4: Vivid Fuchsia / Magenta (Bottom-Left Counter-Weight) */}
      <div
        className="absolute top-2/3 -left-32 w-[450px] sm:w-[580px] h-[450px] sm:h-[580px] rounded-full blur-[110px] sm:blur-[140px] opacity-40 dark:opacity-60 animate-orb-4"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(217, 70, 239, 0.12) 50%, transparent 70%)",
        }}
      />

      {/* Orb 5: Deep Violet Glow (Bottom-Right) */}
      <div
        className="absolute bottom-10 -right-24 w-[400px] sm:w-[550px] h-[400px] sm:h-[550px] rounded-full blur-[110px] sm:blur-[130px] opacity-45 dark:opacity-60 animate-orb-2"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.28) 0%, rgba(139, 92, 246, 0.10) 50%, transparent 70%)",
        }}
      />

      {/* ─── Layer 3: Central Spotlight Ambient Pulse ──────────────────── */}
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[350px] sm:h-[450px] rounded-full blur-[100px] opacity-40 dark:opacity-60 animate-pulse-glow"
        style={{
          background: "radial-gradient(ellipse at center, rgba(147, 51, 234, 0.22) 0%, rgba(79, 70, 229, 0.10) 45%, transparent 70%)",
        }}
      />

      {/* ─── Layer 4: Geometric Subtle Grid Lattice Overlay ────────────── */}
      <div className="absolute inset-0 landing-grid-pattern landing-radial-vignette opacity-70 dark:opacity-60" />

      {/* ─── Layer 5: Soft Noise / Glass Surface Sheen ─────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/90" />
    </div>
  );
};
