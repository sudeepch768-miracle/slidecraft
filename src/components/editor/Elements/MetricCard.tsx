"use client";

import React from "react";
import { MetricCard as MetricCardType, ThemeSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  element: MetricCardType;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (patch: Partial<MetricCardType>) => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ element, theme, isSelected, onSelect, onUpdate }) => {
  const { value, label, delta, trend } = element;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col justify-between p-2 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group min-h-0",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: `${theme.styleTokens?.borderRadiusPx ?? 12}px`,
      }}
    >
      {/* Top Row: Icon Badge + Delta Indicator */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
          style={{
            backgroundColor: `${theme.colors.primary}18`,
            color: theme.colors.primary,
          }}
        >
          {trend === "up" ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : trend === "down" ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : (
            <span className="font-extrabold text-[10px]">KPI</span>
          )}
        </div>

        {delta && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border",
              trend === "up" &&
                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
              trend === "down" &&
                "bg-rose-500/10 text-rose-500 border-rose-500/20",
              (!trend || trend === "neutral") &&
                "bg-muted text-muted-foreground border-border"
            )}
          >
            {trend === "up" && <TrendingUp className="w-3 h-3" />}
            {trend === "down" && <TrendingDown className="w-3 h-3" />}
            {(!trend || trend === "neutral") && <Minus className="w-3 h-3" />}
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdate?.({ delta: e.currentTarget.textContent || delta })}
              className="outline-none"
            >
              {delta}
            </span>
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.({ value: e.currentTarget.textContent || value })}
        className={cn(
          "font-black tracking-tight my-1 outline-none focus:bg-primary/5 rounded px-1 cursor-text truncate",
          value.length <= 4
            ? "text-3xl sm:text-4xl lg:text-5xl"
            : value.length <= 8
            ? "text-xl sm:text-2xl lg:text-3xl"
            : "text-base sm:text-lg"
        )}
        style={{
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.headingFont,
        }}
      >
        {value}
      </div>

      {/* Context Description / Label */}
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.({ label: e.currentTarget.textContent || label })}
        className="text-xs md:text-sm font-normal leading-relaxed opacity-85 mt-2 outline-none focus:bg-primary/5 rounded px-1 cursor-text"
        style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}
      >
        {label}
      </div>
    </div>
  );
};
