"use client";

import React from "react";
import { SocialGraphicOverlayElement, ThemeSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, ShieldAlert } from "lucide-react";

interface SocialGraphicOverlayBlockProps {
  element: SocialGraphicOverlayElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
  showSafeZones?: boolean;
}

export const SocialGraphicOverlayBlock: React.FC<SocialGraphicOverlayBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
  showSafeZones = true,
}) => {
  const { headline, subheadline, callToAction, handleOrBrand, badgeText, safeZonePadding } = element;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border transition-all cursor-pointer shadow-lg w-full h-full min-h-0 overflow-hidden",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      {/* Decorative Gradient Glow */}
      <div
        className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: theme.colors.secondary }}
      />
      <div
        className="absolute -left-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: theme.colors.accent }}
      />

      {/* Safe zone guidance lines if enabled */}
      {showSafeZones && safeZonePadding && (
        <div
          className="absolute inset-0 pointer-events-none border border-dashed border-emerald-500/30 m-3 rounded-xl flex flex-col justify-between p-2"
          title="Safe Zone Boundary (Content is protected from platform UI overlap)"
        >
          <div className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Safe Zone Area
          </div>
        </div>
      )}

      {/* Top Bar: Brand Pill & Badge */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        {badgeText && (
          <span
            className="px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-sm"
            style={{
              backgroundColor: theme.colors.secondary,
              color: "#FFFFFF",
            }}
          >
            {badgeText}
          </span>
        )}

        {handleOrBrand && (
          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
            style={{
              color: theme.colors.textSecondary,
              borderColor: theme.colors.border,
              backgroundColor: `${theme.colors.background}80`,
            }}
          >
            {handleOrBrand}
          </span>
        )}
      </div>

      {/* Center Content: Headline & Subheadline */}
      <div className="relative z-10 my-auto py-4 sm:py-6 flex flex-col gap-3">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
          style={{
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.headingFont,
          }}
        >
          {headline}
        </h1>

        {subheadline && (
          <p
            className="text-xs sm:text-sm md:text-base leading-relaxed opacity-90 line-clamp-3"
            style={{
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.bodyFont,
            }}
          >
            {subheadline}
          </p>
        )}
      </div>

      {/* Bottom CTA Action Button */}
      {callToAction && (
        <div className="relative z-10 flex items-center gap-4">
          <div
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-transform hover:scale-105"
            style={{
              backgroundColor: theme.colors.secondary,
              color: "#FFFFFF",
            }}
          >
            <span>{callToAction}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};
