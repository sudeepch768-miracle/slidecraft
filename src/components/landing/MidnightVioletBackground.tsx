"use client";

import React from "react";

/**
 * Deterministic star coordinates for zero-hydration mismatch.
 * Combines 4-point diamond sparkles with subtle stardust micro-dots.
 */
const FIXED_STARS = [
  // Prominent 4-point diamond sparkle stars
  { x: 48.5, y: 16.5, size: 3.5, anim: "animate-star-1", opacity: 0.95, sparkle: true }, // Right above announcement badge
  { x: 18, y: 21, size: 3.5, anim: "animate-star-2", opacity: 0.95, sparkle: true }, // Upper left sky
  { x: 82, y: 18, size: 3.5, anim: "animate-star-2", opacity: 0.95, sparkle: true }, // Upper right sky
  { x: 64, y: 7, size: 3.5, anim: "animate-star-1", opacity: 0.95, sparkle: true }, // Top center-right
  { x: 93, y: 25, size: 3.2, anim: "animate-star-1", opacity: 0.9, sparkle: true }, // Near right celestial sphere
  { x: 8, y: 24, size: 2.5, anim: "animate-star-1", opacity: 0.85, sparkle: true }, // Far left horizon
  { x: 82, y: 64, size: 2.8, anim: "animate-star-2", opacity: 0.85, sparkle: true }, // Lower right sky

  // Soft atmospheric stardust micro-dots
  { x: 8, y: 14, size: 2, anim: "animate-star-1", opacity: 0.7 },
  { x: 26, y: 8, size: 1.5, anim: "animate-star-1", opacity: 0.6 },
  { x: 35, y: 28, size: 2, anim: "animate-star-2", opacity: 0.7 },
  { x: 42, y: 12, size: 1.5, anim: "animate-star-1", opacity: 0.5 },
  { x: 55, y: 18, size: 2.5, anim: "animate-star-2", opacity: 0.8 },
  { x: 72, y: 24, size: 2, anim: "animate-star-2", opacity: 0.75 },
  { x: 88, y: 32, size: 2.5, anim: "animate-star-2", opacity: 0.85 },
  { x: 12, y: 48, size: 1.5, anim: "animate-star-2", opacity: 0.5 },
  { x: 22, y: 56, size: 2, anim: "animate-star-1", opacity: 0.7 },
  { x: 79, y: 48, size: 2, anim: "animate-star-2", opacity: 0.65 },
  { x: 89, y: 58, size: 1.5, anim: "animate-star-1", opacity: 0.5 },
  { x: 95, y: 42, size: 2, anim: "animate-star-2", opacity: 0.7 },
];

export const MidnightVioletBackground: React.FC = () => {
  return (
    <div
      id="midnight-violet-bg"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* ─── Layer 1: Deep Cosmic Navy Foundation ────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 0%, #15102F 0%, #0D1026 45%, #070914 100%)",
        }}
      />

      {/* ─── Layer 2: Ambient Diffuse Nebulae Glows ──────────────────────── */}
      {/* Top Left Violet/Indigo Glow */}
      <div
        className="absolute -top-32 -left-32 w-[650px] sm:w-[850px] h-[650px] sm:h-[850px] rounded-full blur-[140px] opacity-70 animate-orb-1"
        style={{
          background:
            "radial-gradient(circle, rgba(109, 74, 255, 0.35) 0%, rgba(139, 92, 246, 0.16) 45%, transparent 70%)",
        }}
      />

      {/* Top Right Blue/Cyan Glow */}
      <div
        className="absolute -top-28 -right-28 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full blur-[130px] opacity-65 animate-orb-2"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(99, 102, 241, 0.18) 50%, transparent 70%)",
        }}
      />

      {/* Right Edge Electric Aurora Glow */}
      <div
        className="absolute top-1/4 -right-20 w-[450px] sm:w-[650px] h-[550px] sm:h-[750px] rounded-full blur-[130px] opacity-65 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at right, rgba(56, 189, 248, 0.28) 0%, rgba(99, 102, 241, 0.18) 45%, transparent 70%)",
        }}
      />

      {/* Center Behind Hero: Soft Pink/Violet Ambient Bloom */}
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[750px] sm:w-[1100px] h-[450px] sm:h-[600px] rounded-full blur-[150px] opacity-55 animate-pulse-glow"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(236, 72, 153, 0.16) 0%, rgba(168, 85, 247, 0.18) 40%, rgba(109, 74, 255, 0.06) 70%, transparent 80%)",
        }}
      />

      {/* ─── Layer 3: Celestial Spheres / Planets (Reference-Aligned Shading) ─ */}
      {/* Upper-Right Celestial Sphere (Crescent lit on upper-right rim) */}
      <div className="absolute top-[25%] right-[9%] sm:right-[11%] w-22 sm:w-32 h-22 sm:h-32 rounded-full animate-celestial-1 pointer-events-none">
        <div
          className="w-full h-full rounded-full relative overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 75% 25%, #4C1D95 0%, #1E1538 55%, #0A0914 95%)",
            boxShadow:
              "inset 8px -8px 24px rgba(0, 0, 0, 0.95), inset -5px 5px 14px rgba(244, 114, 182, 0.75), inset -1px 1px 4px rgba(255, 255, 255, 0.85), 0 0 35px rgba(168, 85, 247, 0.35)",
          }}
        >
          {/* Atmosphere crescent highlight */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 80% 20%, rgba(244, 114, 182, 0.5) 0%, transparent 60%)",
            }}
          />
        </div>
      </div>

      {/* Mid-Left Major Celestial Sphere (Crescent lit on inner-RIGHT rim facing hero) */}
      <div className="absolute top-[37%] left-[3%] sm:left-[4.5%] w-30 sm:w-40 h-30 sm:h-40 rounded-full animate-celestial-2 pointer-events-none">
        <div
          className="w-full h-full rounded-full relative overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 75% 50%, #3F1574 0%, #181130 50%, #060510 92%)",
            boxShadow:
              "inset 12px 0px 30px rgba(0, 0, 0, 0.96), inset -8px 0px 20px rgba(236, 72, 153, 0.85), inset -2px 0px 6px rgba(255, 255, 255, 0.92), 0 0 45px rgba(168, 85, 247, 0.35)",
          }}
        >
          {/* Atmosphere crescent glow facing right */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 85% 50%, rgba(236, 72, 153, 0.55) 0%, transparent 60%)",
            }}
          />
        </div>
      </div>

      {/* Lower-Left Ambient Sphere (Floating above the valley mist) */}
      <div className="hidden sm:block absolute top-[57%] left-[10%] sm:left-[11%] w-14 sm:w-16 h-14 sm:h-16 rounded-full opacity-80 animate-celestial-1 pointer-events-none z-10">
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 75% 35%, #581C87 0%, #1B1842 60%, #060712 100%)",
            boxShadow:
              "inset -4px 1px 10px rgba(236, 72, 153, 0.65), inset -1px 0px 3px rgba(255, 255, 255, 0.75), 0 0 25px rgba(139, 92, 246, 0.3)",
          }}
        />
      </div>

      {/* ─── Layer 4: Flowing Aurora Ribbons / Curved Light Trails ───────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Neon Aurora Gradient: Left Swoop (Violet to Hot Pink to White) */}
          <linearGradient id="auroraLeftGrad" x1="0%" y1="100%" x2="60%" y2="40%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.05" />
            <stop offset="30%" stopColor="#8B5CF6" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#EC4899" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#F472B6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
          </linearGradient>

          {/* Secondary Soft Pink Flare */}
          <linearGradient id="auroraLeftWide" x1="0%" y1="80%" x2="55%" y2="45%">
            <stop offset="0%" stopColor="#6D28D9" stopOpacity="0" />
            <stop offset="35%" stopColor="#9333EA" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#EC4899" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
          </linearGradient>

          {/* Left Aurora Borealis Curtain / Drapery */}
          <linearGradient id="auroraCurtainGrad" x1="0%" y1="100%" x2="35%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
            <stop offset="25%" stopColor="#8B5CF6" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#C026D3" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#EC4899" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>

          {/* Neon Aurora Gradient: Right Arc Loop (Cyan/Indigo to Violet) */}
          <linearGradient id="auroraRightGrad" x1="100%" y1="20%" x2="35%" y2="75%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#6366F1" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#A855F7" stopOpacity="0.85" />
            <stop offset="90%" stopColor="#EC4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>

          {/* Ribbon Soft Filters */}
          <filter id="auroraBloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="auroraWideGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
        </defs>

        {/* Left Aurora Veil / Curtain (Ethereal northern lights drape) */}
        <path
          d="M-40,650 C20,480 80,340 180,240 C280,140 420,110 560,140 C420,260 260,420 140,580 C60,690 0,760 -40,800 Z"
          fill="url(#auroraCurtainGrad)"
          filter="url(#auroraWideGlow)"
          className="animate-aurora-left"
        />

        {/* Wide Ambient Aurora Glow (Left: sweeps under the left sphere) */}
        <path
          d="M-60,495 C100,520 220,580 380,635 C540,680 700,680 840,650"
          stroke="url(#auroraLeftWide)"
          strokeWidth="64"
          fill="none"
          filter="url(#auroraWideGlow)"
          className="animate-aurora-left"
        />

        {/* Primary Crisp Sweeping Ribbon (Left: swooping under the left sphere down towards card) */}
        <g className="animate-aurora-left">
          {/* Base Glow */}
          <path
            d="M-50,490 C100,515 220,575 380,630 C540,680 700,680 840,650"
            stroke="url(#auroraLeftGrad)"
            strokeWidth="9"
            fill="none"
            filter="url(#auroraBloom)"
            strokeLinecap="round"
          />
          {/* Core Radiant Filament */}
          <path
            d="M-45,490 C105,515 225,575 380,630 C540,680 700,680 840,650"
            stroke="url(#auroraLeftGrad)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.95"
          />
          {/* White hot laser core */}
          <path
            d="M-40,490 C108,515 228,575 380,630 C540,680 700,680 840,650"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>

        {/* Right Arc Orbital Loop */}
        <g className="animate-aurora-right">
          {/* Wide Glow */}
          <path
            d="M1500,165 C1380,265 1220,440 1080,550 C940,660 760,695 620,675"
            stroke="url(#auroraRightGrad)"
            strokeWidth="22"
            fill="none"
            filter="url(#auroraBloom)"
            opacity="0.55"
          />
          {/* Radiant Edge */}
          <path
            d="M1480,170 C1370,270 1215,445 1080,550 C940,660 760,695 620,675"
            stroke="url(#auroraRightGrad)"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.88"
          />
          {/* Laser Core */}
          <path
            d="M1470,175 C1365,275 1210,450 1080,550 C940,660 760,695 620,675"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      </svg>

      {/* ─── Layer 5: Sparkling Starfield & Cosmic Dust ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {FIXED_STARS.map((star, idx) => {
          if (star.sparkle) {
            return (
              <div
                key={idx}
                className={`absolute ${star.anim}`}
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size * 5}px`,
                  height: `${star.size * 5}px`,
                  opacity: star.opacity,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* 4-point Diamond Sparkle */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-full h-full drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]"
                >
                  <path
                    d="M12 0L14 9.5L24 12L14 14.5L12 24L10 14.5L0 12L10 9.5L12 0Z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>
            );
          }
          return (
            <div
              key={idx}
              className={`absolute rounded-full bg-white ${star.anim}`}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                boxShadow: "0 0 6px 1px rgba(168, 85, 247, 0.7)",
              }}
            />
          );
        })}
      </div>

      {/* ─── Layer 6: Realistic Mountain Terrain Silhouettes with Valley Mist ── */}
      <div className="absolute bottom-0 inset-x-0 h-72 sm:h-[400px] pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 400"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Craggy Mountain Silhouettes Gradient Fills */}
            <linearGradient id="backRidgeGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#141A3E" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#0B0F28" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#050712" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="frontRidgeGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#090E25" stopOpacity="0.98" />
              <stop offset="65%" stopColor="#050714" stopOpacity="1" />
              <stop offset="100%" stopColor="#020308" stopOpacity="1" />
            </linearGradient>

            {/* Valley Mist Soft Radial Glows */}
            <radialGradient id="leftValleyMist" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(109, 74, 255, 0.28)" />
              <stop offset="45%" stopColor="rgba(79, 70, 229, 0.14)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <radialGradient id="rightValleyMist" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(236, 72, 153, 0.22)" />
              <stop offset="50%" stopColor="rgba(139, 92, 246, 0.12)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <radialGradient id="centerValleyBloom" cx="50%" cy="75%" r="50%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.22)" />
              <stop offset="40%" stopColor="rgba(139, 92, 246, 0.12)" />
              <stop offset="80%" stopColor="transparent" />
            </radialGradient>

            {/* Subtle atmospheric ridge rim highlight */}
            <linearGradient id="leftRidgeRimGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="rightRidgeRimGlow" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Valley Ambient Mist Ellipses */}
          <ellipse cx="180" cy="250" rx="340" ry="140" fill="url(#leftValleyMist)" />
          <ellipse cx="1260" cy="250" rx="340" ry="140" fill="url(#rightValleyMist)" />
          <ellipse cx="720" cy="330" rx="460" ry="110" fill="url(#centerValleyBloom)" />

          {/* Left Mountain: Realistic Craggy Back Ridge */}
          <path
            d="M-40,400 L-40,130 L30,120 L75,145 L125,115 L175,150 L230,135 L290,180 L360,195 L440,245 L530,285 L630,335 L740,380 L760,400 Z"
            fill="url(#backRidgeGrad)"
          />

          {/* Left Mountain: Foreground Craggy Ridge Facets */}
          <path
            d="M-40,400 L-40,210 L50,190 L110,225 L180,205 L260,255 L340,270 L430,330 L530,365 L630,400 Z"
            fill="url(#frontRidgeGrad)"
          />

          {/* Right Mountain: Realistic Craggy Back Ridge */}
          <path
            d="M1480,400 L1480,120 L1410,110 L1360,140 L1300,120 L1240,155 L1180,140 L1110,190 L1030,210 L940,265 L840,315 L740,365 L680,400 Z"
            fill="url(#backRidgeGrad)"
          />

          {/* Right Mountain: Foreground Craggy Ridge Facets */}
          <path
            d="M1480,400 L1480,200 L1420,185 L1360,220 L1290,205 L1210,260 L1130,275 L1030,335 L930,370 L830,400 Z"
            fill="url(#frontRidgeGrad)"
          />
        </svg>
      </div>

      {/* ─── Layer 7: Subtle Cosmic Vignette ────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 45%, rgba(7, 9, 20, 0.35) 80%, rgba(4, 6, 12, 0.7) 100%)",
        }}
      />
    </div>
  );
};
