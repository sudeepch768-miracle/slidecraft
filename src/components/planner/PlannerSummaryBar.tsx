"use client";

import React from "react";
import {
  Clock,
  Layers,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { PlanValidationResult } from "@/types/planner";

interface PlannerSummaryBarProps {
  totalSlides: number;
  estimatedDuration: string;
  validation: PlanValidationResult;
  onOpenWarningsModal?: () => void;
}

export const PlannerSummaryBar: React.FC<PlannerSummaryBarProps> = ({
  totalSlides,
  estimatedDuration,
  validation,
  onOpenWarningsModal,
}) => {
  const hasWarnings = validation.warnings.length > 0;

  return (
    <footer className="h-10 border-t border-border/70 bg-background/95 px-6 flex items-center justify-between text-xs text-muted-foreground select-none z-20">
      {/* Left: Metrics & Duration */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>{totalSlides} Slides</span>
        </span>

        <span className="h-3 w-px bg-border/80" />

        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{estimatedDuration}</span>
        </span>

        <span className="h-3 w-px bg-border/80" />

        {/* Completeness Score Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[11px]">Completeness:</span>
          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                validation.score >= 80
                  ? "bg-emerald-500"
                  : validation.score >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${validation.score}%` }}
            />
          </div>
          <span className="font-mono font-semibold text-[11px] text-foreground">
            {validation.score}%
          </span>
        </div>
      </div>

      {/* Right: Validation & Health Status */}
      <div className="flex items-center gap-2">
        {hasWarnings ? (
          <button
            type="button"
            onClick={onOpenWarningsModal}
            className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{validation.warnings.length} Suggestion{validation.warnings.length > 1 ? "s" : ""}</span>
          </button>
        ) : (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Plan Verified & Complete</span>
          </span>
        )}
      </div>
    </footer>
  );
};
