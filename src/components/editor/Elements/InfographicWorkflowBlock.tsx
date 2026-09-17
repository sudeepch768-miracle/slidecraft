"use client";

import React from "react";
import { InfographicWorkflowElement, ThemeSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  GitCommit,
  Layers,
  Repeat,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";

interface InfographicWorkflowBlockProps {
  element: InfographicWorkflowElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
  isLandscape?: boolean;
}

export const InfographicWorkflowBlock: React.FC<InfographicWorkflowBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
  isLandscape,
}) => {
  const { workflowType, steps, comparisonColumns } = element;

  // Comparison layout
  if (workflowType === "comparison" && comparisonColumns && comparisonColumns.length > 0) {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "relative grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border transition-all cursor-pointer shadow-sm w-full",
          isSelected && "ring-2 ring-primary ring-offset-2"
        )}
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: `${theme.styleTokens?.borderRadiusPx ?? 12}px`,
        }}
      >
        {comparisonColumns.map((col, idx) => (
          <div
            key={idx}
            className="flex flex-col p-5 rounded-xl border"
            style={{
              backgroundColor: theme.colors.background,
              borderColor: idx === 0 ? theme.colors.border : theme.colors.secondary,
            }}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <h4
                className="text-lg font-bold"
                style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
              >
                {col.columnTitle}
              </h4>
              {col.badge && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                  style={{
                    backgroundColor: `${theme.colors.secondary}20`,
                    color: theme.colors.secondary,
                  }}
                >
                  {col.badge}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {col.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-lg text-sm",
                    item.highlight ? "font-semibold" : ""
                  )}
                  style={{
                    backgroundColor: item.highlight ? `${theme.colors.secondary}10` : "transparent",
                  }}
                >
                  <span style={{ color: theme.colors.textSecondary }}>{item.label}</span>
                  <span style={{ color: theme.colors.textPrimary }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Timeline / Vertical Process layout
  if (workflowType === "timeline") {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "relative flex flex-col p-6 rounded-2xl border transition-all cursor-pointer shadow-sm w-full",
          isSelected && "ring-2 ring-primary ring-offset-2"
        )}
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: `${theme.styleTokens?.borderRadiusPx ?? 12}px`,
        }}
      >
        <div className="relative border-l-2 ml-4 pl-6 space-y-6" style={{ borderColor: theme.colors.secondary }}>
          {steps.map((step) => (
            <div key={step.id} className="relative group">
              {/* Dot marker */}
              <div
                className="absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                style={{ backgroundColor: step.accentColor || theme.colors.secondary }}
              >
                {step.stepNumber}
              </div>
              <div
                className="p-4 rounded-xl border transition-transform group-hover:-translate-y-0.5"
                style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h5
                    className="font-semibold text-base"
                    style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
                  >
                    {step.title}
                  </h5>
                  {step.metric && (
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${theme.colors.accent}20`,
                        color: theme.colors.accent,
                      }}
                    >
                      {step.metric}
                    </span>
                  )}
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}
                >
                  {step.description}
                </p>
                {step.tag && (
                  <span
                    className="inline-block mt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    #{step.tag}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Circular / Cycle Workflow layout
  if (workflowType === "circular") {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "relative flex flex-col items-center p-6 rounded-2xl border transition-all cursor-pointer shadow-sm w-full",
          isSelected && "ring-2 ring-primary ring-offset-2"
        )}
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: `${theme.styleTokens?.borderRadiusPx ?? 12}px`,
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            return (
              <div
                key={step.id}
                className="relative flex flex-col p-4 rounded-xl border transition-all hover:shadow-md"
                style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: step.accentColor || theme.colors.secondary }}
                  >
                    {step.stepNumber}
                  </div>
                  <Repeat className="w-4 h-4 text-muted-foreground" />
                </div>
                <h5
                  className="font-semibold text-base mb-1.5"
                  style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
                >
                  {step.title}
                </h5>
                <p
                  className="text-xs leading-relaxed flex-1"
                  style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}
                >
                  {step.description}
                </p>
                {step.metric && (
                  <div
                    className="mt-3 pt-2 border-t text-xs font-semibold flex items-center gap-1.5"
                    style={{ borderColor: theme.colors.border, color: theme.colors.accent }}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{step.metric}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default Step-by-Step / Process cards layout
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col rounded-2xl border transition-all cursor-pointer shadow-sm w-full min-h-0",
        isLandscape ? "p-3 sm:p-4" : "p-4 sm:p-6",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: `${theme.styleTokens?.borderRadiusPx ?? 12}px`,
      }}
    >
      <div className={cn(
        "w-full",
        isLandscape
          ? steps.length <= 3
            ? "grid grid-cols-1 sm:grid-cols-3 gap-2.5"
            : "grid grid-cols-2 lg:grid-cols-4 gap-2.5"
          : "flex flex-col gap-3 sm:gap-4"
      )}>
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "rounded-xl border transition-all hover:shadow-sm min-h-0",
              isLandscape
                ? "flex flex-col gap-2 p-3"
                : "flex items-start gap-4 p-3.5 sm:p-4"
            )}
            style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
          >
            <div className="flex items-center justify-between gap-2">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                style={{ backgroundColor: step.accentColor || theme.colors.secondary }}
              >
                0{step.stepNumber}
              </div>
              {step.tag && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full truncate"
                  style={{
                    backgroundColor: `${theme.colors.secondary}15`,
                    color: theme.colors.secondary,
                  }}
                >
                  {step.tag}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h5
                className="font-semibold text-sm sm:text-base leading-snug line-clamp-1 mb-1"
                style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
              >
                {step.title}
              </h5>
              <p
                className="text-xs leading-relaxed opacity-90 line-clamp-2"
                style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}
              >
                {step.description}
              </p>
            </div>
            {step.metric && (
              <div
                className="shrink-0 font-mono font-bold text-xs pt-1 border-t mt-auto"
                style={{ borderColor: theme.colors.border, color: theme.colors.accent }}
              >
                {step.metric}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
