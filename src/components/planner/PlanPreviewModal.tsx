"use client";

import React from "react";
import { X, Layers, Clock, Users, BookOpen, Sparkles } from "lucide-react";
import { PresentationPlan } from "@/types/planner";
import { Button } from "@/components/ui/button";

interface PlanPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PresentationPlan;
  onApproveAndGenerate: () => void;
}

export const PlanPreviewModal: React.FC<PlanPreviewModalProps> = ({
  isOpen,
  onClose,
  plan,
  onApproveAndGenerate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 z-50 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-mono tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                Executive Presentation Blueprint
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{plan.slidePlans.length} Slides</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">{plan.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Modal Overview Ribbon */}
        <div className="px-6 py-3 border-b border-border bg-background/50 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>Audience: <strong>{plan.targetAudience}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tone: <strong>{plan.tone}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Est. Duration: <strong>{plan.estimatedDuration}</strong></span>
          </span>
        </div>

        {/* Slide List */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {plan.slidePlans.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="p-4 rounded-xl border border-border/80 bg-background/60 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                    Slide {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold text-sm text-foreground">{slide.title}</span>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {slide.content.type}
                </span>
              </div>

              <p className="text-muted-foreground font-medium italic">
                “{slide.keyMessage}”
              </p>

              {slide.content.explanation && (
                <p className="text-foreground leading-relaxed">
                  {slide.content.explanation}
                </p>
              )}

              {slide.content.points && slide.content.points.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  {slide.content.points.map((p, pIdx) => (
                    <li key={pIdx} className="leading-snug">{p}</li>
                  ))}
                </ul>
              )}

              {slide.content.examples && slide.content.examples.length > 0 && (
                <div className="pt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <span className="font-semibold">Implementation Benchmark: </span>
                  {slide.content.examples.join("; ")}
                </div>
              )}

              {slide.speakerNotes && (
                <div className="pt-2 border-t border-border/30 text-[11px] text-muted-foreground/80">
                  <span className="font-semibold text-muted-foreground">Presenter Remarks: </span>
                  {slide.speakerNotes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-background/50 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Close Preview
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onClose();
              onApproveAndGenerate();
            }}
            className="h-8 text-xs bg-primary text-primary-foreground font-semibold px-4 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Approve Blueprint & Generate Presentation</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
