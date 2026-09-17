"use client";

import React from "react";
import { EventDetailsElement, ThemeSpec } from "@/types/document-spec";
import { Calendar, Clock, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDetailsBlockProps {
  element: EventDetailsElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const EventDetailsBlock: React.FC<EventDetailsBlockProps> = ({
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
        "p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer shadow-sm w-full flex flex-col gap-2 sm:gap-2.5 min-h-0",
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/40 border-border"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      {/* Date & Time */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${theme.colors.secondary}15` }}
        >
          <Calendar className="w-4 h-4" style={{ color: theme.colors.secondary }} />
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="text-[10px] font-bold uppercase tracking-wider block"
            style={{ color: theme.colors.textSecondary }}
          >
            Date & Time
          </span>
          <span
            className="text-xs sm:text-sm font-bold block truncate"
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.headingFont,
            }}
          >
            {element.date}
          </span>
          {element.time && (
            <span
              className="text-[11px] flex items-center gap-1 opacity-80"
              style={{ color: theme.colors.textSecondary }}
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate">{element.time}</span>
            </span>
          )}
        </div>
      </div>

      {/* Venue / Location */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/40">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${theme.colors.accent}15` }}
        >
          <MapPin className="w-4 h-4" style={{ color: theme.colors.accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="text-[10px] font-bold uppercase tracking-wider block"
            style={{ color: theme.colors.textSecondary }}
          >
            Venue / Hall
          </span>
          <span
            className="text-xs sm:text-sm font-bold block truncate"
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.headingFont,
            }}
          >
            {element.venue}
          </span>
          <span className="text-[11px] opacity-75 block truncate" style={{ color: theme.colors.textSecondary }}>
            In-Person & Online
          </span>
        </div>
      </div>

      {/* Pricing / Admission */}
      {element.price && (
        <div className="flex items-center gap-3 pt-2 border-t border-border/40">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/10"
          >
            <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span
              className="text-[10px] font-bold uppercase tracking-wider block"
              style={{ color: theme.colors.textSecondary }}
            >
              Admission
            </span>
            <span
              className="text-xs sm:text-sm font-extrabold block text-emerald-600 dark:text-emerald-400"
              style={{ fontFamily: theme.typography.headingFont }}
            >
              {element.price}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
