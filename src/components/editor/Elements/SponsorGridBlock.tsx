"use client";

import React from "react";
import { SponsorGridElement, ThemeSpec } from "@/types/document-spec";
import { Award, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SponsorGridBlockProps {
  element: SponsorGridElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const SponsorGridBlock: React.FC<SponsorGridBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
}) => {
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "title":
        return { label: "Title Partner", bg: "rgba(245, 158, 11, 0.15)", text: "#d97706" };
      case "platinum":
        return { label: "Platinum", bg: "rgba(99, 102, 241, 0.15)", text: "#4f46e5" };
      case "gold":
        return { label: "Gold", bg: "rgba(234, 179, 8, 0.15)", text: "#ca8a04" };
      case "silver":
      default:
        return { label: "Silver", bg: "rgba(148, 163, 184, 0.15)", text: "#64748b" };
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={cn(
        "p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shadow-sm w-full flex flex-col gap-2 min-h-0",
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/40 border-border"
      )}
      style={{
        backgroundColor: `${theme.colors.surface}80`,
        borderColor: theme.colors.border,
      }}
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4" style={{ color: theme.colors.primary }} />
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}
        >
          {element.title || "Partners & Sponsors"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {element.sponsors.map((sponsor, idx) => {
          const badge = getTierBadge(sponsor.tier);
          return (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-background/90 shadow-xs"
              style={{ borderColor: theme.colors.border }}
            >
              <Award className="w-3.5 h-3.5" style={{ color: badge.text }} />
              <span
                className="text-xs font-bold"
                style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
              >
                {sponsor.name}
              </span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ backgroundColor: badge.bg, color: badge.text }}
              >
                {sponsor.tier}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
