"use client";

import React from "react";
import { OrganizerInfoElement, ThemeSpec } from "@/types/document-spec";
import { Mail, Phone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizerInfoBlockProps {
  element: OrganizerInfoElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const OrganizerInfoBlock: React.FC<OrganizerInfoBlockProps> = ({
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
        "p-2 sm:px-3 sm:py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs min-h-0",
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/40 border-border"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      <div className="min-w-0 flex-1">
        <span
          className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block"
          style={{ color: theme.colors.textSecondary }}
        >
          Organized By
        </span>
        <span
          className="font-bold text-xs sm:text-sm block truncate"
          style={{
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.headingFont,
          }}
        >
          {element.organization}
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-2.5 truncate text-[11px]" style={{ color: theme.colors.textSecondary }}>
        {element.contactEmail && (
          <span className="flex items-center gap-1 hover:underline truncate">
            <Mail className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">{element.contactEmail}</span>
          </span>
        )}
        {element.website && (
          <span className="flex items-center gap-1 hover:underline truncate">
            <Globe className="w-3 h-3 text-secondary shrink-0" />
            <span className="truncate">{element.website}</span>
          </span>
        )}
      </div>
    </div>
  );
};
