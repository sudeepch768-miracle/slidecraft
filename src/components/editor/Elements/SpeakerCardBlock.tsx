"use client";

import React from "react";
import { SpeakerCardElement, ThemeSpec } from "@/types/document-spec";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeakerCardBlockProps {
  element: SpeakerCardElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const SpeakerCardBlock: React.FC<SpeakerCardBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={cn(
        "p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shadow-sm flex items-center gap-2.5 min-h-0",
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/40 border-border"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      {/* Avatar or Icon Frame */}
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 border"
        style={{
          backgroundColor: `${theme.colors.secondary}15`,
          borderColor: theme.colors.secondary,
        }}
      >
        <User className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.colors.secondary }} />
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className="text-sm font-bold truncate"
          style={{
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.headingFont,
          }}
        >
          {element.name}
        </h4>
        {element.title && (
          <p
            className="text-xs truncate"
            style={{ color: theme.colors.textSecondary }}
          >
            {element.title}
          </p>
        )}
        {element.company && (
          <span
            className="text-[10px] font-semibold uppercase tracking-wider block mt-0.5"
            style={{ color: theme.colors.secondary }}
          >
            {element.company}
          </span>
        )}
      </div>
    </div>
  );
};
