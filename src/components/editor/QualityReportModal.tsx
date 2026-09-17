"use client";

import React from "react";
import { useEditorStore } from "@/store/editor-store";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Info,
  Wand2,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QualityCategory } from "@/lib/quality/quality-types";

export const QualityReportModal: React.FC = () => {
  const {
    isQualityModalOpen,
    setQualityModalOpen,
    qualityReport,
    runQualityAutoRepair,
  } = useEditorStore();

  if (!isQualityModalOpen || !qualityReport) return null;

  const score = qualityReport.overallScore;
  const scoreColor =
    score >= 85
      ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
      : score >= 70
      ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
      : "text-rose-500 border-rose-500/30 bg-rose-500/10";

  const categories = Object.values(qualityReport.categories);
  const issues = qualityReport.issues;
  const repairs = qualityReport.repairs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                Design Quality Inspector
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  14 Engine Checks
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Automated evaluation across 8 design categories with non-destructive auto-repair
              </p>
            </div>
          </div>

          <button
            onClick={() => setQualityModalOpen(false)}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-border bg-gradient-to-r from-background via-muted/10 to-background gap-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shadow-inner flex-shrink-0",
                  scoreColor
                )}
              >
                <span className="text-2xl font-black">{score}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">Score</span>
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-foreground">
                  {score >= 85
                    ? "Production Ready & High Polish"
                    : score >= 70
                    ? "Good Quality (Minor Optimizations Found)"
                    : "Design Needs Attention"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {qualityReport.passed
                    ? "Meets all presentation and contrast standards with zero blocking flaws."
                    : "Some elements require spacing, alignment, or contrast adjustment."}
                </p>
              </div>
            </div>

            <button
              onClick={() => runQualityAutoRepair()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md flex-shrink-0"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Run Quality Auto-Repair</span>
            </button>
          </div>

          {/* 8 Categories Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Category Scoring Breakdown (8 Dimensions)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const statusColor =
                  cat.status === "good"
                    ? "bg-emerald-500"
                    : cat.status === "warning"
                    ? "bg-amber-500"
                    : "bg-rose-500";

                return (
                  <div
                    key={cat.category}
                    className="p-3 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{cat.label}</span>
                      <span className="font-bold text-xs">{cat.score}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-500", statusColor)}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Weight: {Math.round(cat.weight * 100)}%</span>
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded font-medium",
                          cat.status === "good"
                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                            : cat.status === "warning"
                            ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                            : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
                        )}
                      >
                        {cat.issuesCount === 0 ? "Flawless" : `${cat.issuesCount} issue(s)`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto-Repairs Applied Section */}
          {repairs && repairs.length > 0 && (
            <div className="space-y-2.5 p-4 rounded-2xl border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Automatic Repairs Applied ({repairs.length})</span>
                </h3>
                <span className="text-[10px] text-primary/80 font-semibold uppercase tracking-wider">
                  Non-Destructive Polishing
                </span>
              </div>
              <div className="space-y-2">
                {repairs.map((repair, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-2.5 rounded-xl bg-background/80 border border-primary/10 text-xs flex items-start gap-2.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">{repair.description}</p>
                      <p className="text-[11px] text-muted-foreground">{repair.appliedFix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected Issues List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Active Design Issues ({issues.length})</span>
              {issues.length === 0 && (
                <span className="text-emerald-500 text-[11px] font-semibold flex items-center gap-1 normal-case">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All 14 checks passed cleanly
                </span>
              )}
            </h3>

            {issues.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Zero design flaws detected! Your project complies with optimal spacing, typography, contrast, and layout standards.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {issues.map((issue, iIdx) => {
                  const sevIcon =
                    issue.severity === "error" ? (
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    ) : issue.severity === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    );

                  return (
                    <div
                      key={iIdx}
                      className="p-3 rounded-xl border border-border bg-background hover:bg-muted/30 transition-colors flex items-start gap-3 text-xs"
                    >
                      {sevIcon}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-[11px]">
                            {issue.message}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-muted text-muted-foreground">
                            {issue.category}
                          </span>
                          {issue.pageIndex !== undefined && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/10 text-primary">
                              Slide {issue.pageIndex + 1}
                            </span>
                          )}
                        </div>
                        {issue.suggestion && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 text-primary flex-shrink-0" />
                            <span>{issue.suggestion}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/80 bg-muted/20">
          <div className="text-[11px] text-muted-foreground">
            SlideCraft AI Quality Protection Engine v2.0
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => runQualityAutoRepair()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Repair All</span>
            </button>
            <button
              onClick={() => setQualityModalOpen(false)}
              className="px-4 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
