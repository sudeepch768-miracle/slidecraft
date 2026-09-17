"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  Trash2,
  Mic,
  Lightbulb,
  Maximize2,
  Minimize2,
  GraduationCap,
  FileCheck,
  TrendingUp,
  RefreshCw,
  Loader2,
  Briefcase,
} from "lucide-react";
import { SlidePlan, SlideContentType } from "@/types/planner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlideContentEditorProps {
  slide: SlidePlan;
  totalSlides: number;
  onUpdateSlide: (updated: SlidePlan) => void;
  onConvertType: (targetType: SlideContentType) => void;
  onRefineSlide: (
    action: "expand" | "shorten" | "academic" | "add_examples" | "add_case_study" | "add_statistics" | "rewrite"
  ) => void;
  isRefining?: boolean;
  onRegenerateSlide?: () => void;
  isRegenerating?: boolean;
}

const CONTENT_TYPES: { id: SlideContentType; label: string }[] = [
  { id: "bullets", label: "Bullets & Cards" },
  { id: "paragraph", label: "Detailed Narrative" },
  { id: "case-study", label: "Case Study" },
  { id: "comparison", label: "Comparison" },
  { id: "timeline", label: "Timeline Roadmap" },
  { id: "data", label: "Data & Metrics" },
  { id: "quote", label: "Authoritative Quote" },
  { id: "mixed", label: "Mixed Media" },
];

export const SlideContentEditor: React.FC<SlideContentEditorProps> = ({
  slide,
  totalSlides,
  onUpdateSlide,
  onConvertType,
  onRefineSlide,
  isRefining = false,
  onRegenerateSlide,
  isRegenerating = false,
}) => {
  const content = slide.content;

  const handleUpdate = (partial: Partial<SlidePlan>) => {
    onUpdateSlide({ ...slide, ...partial });
  };

  const handleContentUpdate = (partialContent: Partial<typeof content>) => {
    onUpdateSlide({
      ...slide,
      content: { ...content, ...partialContent },
    });
  };

  // Statistics handlers
  const handleStatChange = (index: number, field: "label" | "value" | "context", val: string) => {
    const stats = [...(content.statistics || [])];
    if (stats[index]) {
      stats[index] = { ...stats[index], [field]: val };
      handleContentUpdate({ statistics: stats });
    }
  };

  const handleAddStat = () => {
    const stats = [...(content.statistics || [])];
    stats.push({
      label: "Growth / Efficiency Metric",
      value: "+45%",
      context: "Measured operational improvement across production deployment",
    });
    handleContentUpdate({ statistics: stats });
  };

  const handleRemoveStat = (index: number) => {
    const stats = (content.statistics || []).filter((_, idx) => idx !== index);
    handleContentUpdate({ statistics: stats });
  };

  // Bullet points handlers
  const handlePointChange = (index: number, val: string) => {
    const updated = [...(content.points || [])];
    updated[index] = val;
    handleContentUpdate({ points: updated });
  };

  const handleAddPoint = () => {
    handleContentUpdate({
      points: [...(content.points || []), "New detailed observation or implementation point."],
    });
  };

  const handleRemovePoint = (index: number) => {
    const updated = (content.points || []).filter((_, idx) => idx !== index);
    handleContentUpdate({ points: updated });
  };

  // Examples handlers
  const handleExampleChange = (index: number, val: string) => {
    const updated = [...(content.examples || [])];
    updated[index] = val;
    handleContentUpdate({ examples: updated });
  };

  const handleAddExample = () => {
    handleContentUpdate({
      examples: [
        ...(content.examples || []),
        "Real-world clinical implementation benchmark across multicenter healthcare cohorts.",
      ],
    });
  };

  const handleRemoveExample = (index: number) => {
    const updated = (content.examples || []).filter((_, idx) => idx !== index);
    handleContentUpdate({ examples: updated });
  };

  // Estimate speaking time from notes (avg 130 words per minute)
  const notesWordCount = (slide.speakerNotes || "").trim().split(/\s+/).filter(Boolean).length;
  const speakingTimeSec = Math.round((notesWordCount / 130) * 60);

  const slideKey = slide.id || `slide-${slide.slideNumber}`;

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background/60 p-6 md:p-8 select-text relative">
      {/* Regeneration Skeleton Overlay */}
      <AnimatePresence>
        {isRegenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="p-6 rounded-3xl gamma-glass-panel shadow-2xl border border-primary/30 flex flex-col items-center gap-3 text-center max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Synthesizing Slide Content</h4>
                <p className="text-xs text-muted-foreground">
                  AI is restructuring points, statistics, and narrative flow...
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                <div className="h-full bg-primary gamma-shimmer-effect w-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={slideKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="max-w-4xl mx-auto w-full space-y-6"
        >
          {/* Slide Navigation Header & Badge */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                Slide {slide.slideNumber} of {totalSlides}
              </span>
              {onRegenerateSlide && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  disabled={isRegenerating || slide.isLocked}
                  onClick={onRegenerateSlide}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-primary/30 hover:border-primary text-foreground text-xs font-semibold bg-background hover:bg-muted transition-all disabled:opacity-40"
                  title={slide.isLocked ? "Unlock slide to regenerate" : "Regenerate this slide content with AI"}
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 text-primary", isRegenerating && "animate-spin")} />
                  <span>{isRegenerating ? "Regenerating..." : "Regenerate Slide"}</span>
                </motion.button>
              )}
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold hidden md:inline">
                Blueprint Editor
              </span>
            </div>

            {/* AI One-Click Refinement Bar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={isRefining || slide.isLocked}
                onClick={() => onRefineSlide("expand")}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs text-foreground font-medium transition-all hover:border-primary/40 disabled:opacity-40"
                title="Expand with operational and methodological detail"
              >
                <Maximize2 className="w-3 h-3 text-blue-500" />
                <span>Expand</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={isRefining || slide.isLocked}
                onClick={() => onRefineSlide("shorten")}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs text-foreground font-medium transition-all hover:border-primary/40 disabled:opacity-40"
                title="Make points more concise"
              >
                <Minimize2 className="w-3 h-3 text-amber-500" />
                <span>Shorten</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={isRefining || slide.isLocked}
                onClick={() => onRefineSlide("academic")}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs text-foreground font-medium transition-all hover:border-primary/40 disabled:opacity-40"
                title="Enhance with academic and empirical citations"
              >
                <GraduationCap className="w-3 h-3 text-purple-500" />
                <span>Academic</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={isRefining || slide.isLocked}
                onClick={() => onRefineSlide("add_case_study")}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs text-foreground font-medium transition-all hover:border-primary/40 disabled:opacity-40"
                title="Add comprehensive case study"
              >
                <Briefcase className="w-3 h-3 text-emerald-500" />
                <span>+ Case Study</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={isRefining || slide.isLocked}
                onClick={() => onRefineSlide("add_examples")}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs text-foreground font-medium transition-all hover:border-primary/40 disabled:opacity-40"
                title="Add practical implementation examples"
              >
                <FileCheck className="w-3 h-3 text-emerald-500" />
                <span>+ Examples</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={isRefining || slide.isLocked}
                onClick={() => onRefineSlide("add_statistics")}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs text-foreground font-medium transition-all hover:border-primary/40 disabled:opacity-40"
                title="Add quantitative metrics"
              >
                <TrendingUp className="w-3 h-3 text-indigo-500" />
                <span>+ Stats</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={isRefining || slide.isLocked}
                onClick={() => onRefineSlide("rewrite")}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs text-foreground font-medium transition-all hover:border-primary/40 disabled:opacity-40"
                title="Strategically rewrite points"
              >
                {isRefining ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <RefreshCw className="w-3 h-3 text-rose-500" />
                )}
                <span>Rewrite</span>
              </motion.button>
            </div>
          </div>

          {/* Slide Title, Purpose, & Key Takeaway */}
          <div className="space-y-3 bg-card p-5 sm:p-6 rounded-2xl border border-border/70 shadow-sm gamma-card-hover transition-all">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Slide Title
              </label>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="w-full text-lg sm:text-xl md:text-2xl font-black bg-background border border-border/60 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="e.g. Diagnostic Computer Vision in Clinical Radiology"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Slide Purpose
                </label>
                <input
                  type="text"
                  value={slide.purpose}
                  onChange={(e) => handleUpdate({ purpose: e.target.value })}
                  className="w-full text-xs bg-background border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder="Core learning objective or slide takeaway"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Key Takeaway Message
                </label>
                <input
                  type="text"
                  value={slide.keyMessage}
                  onChange={(e) => handleUpdate({ keyMessage: e.target.value })}
                  className="w-full text-xs bg-background border border-border/60 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium"
                  placeholder="Single definitive statement audience must remember"
                />
              </div>
            </div>
          </div>

          {/* Content Format Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Content Archetype Format
            </label>
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-muted/50 rounded-2xl border border-border/60">
              {CONTENT_TYPES.map((type) => {
                const isSelected = content.type === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => onConvertType(type.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                      isSelected
                        ? "bg-background text-foreground shadow-sm font-bold ring-1 ring-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Structured Content Form Editor */}
          <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border/70 shadow-sm space-y-5 gamma-card-hover transition-all">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>Detailed Content Elements</span>
                <span className="text-xs font-normal text-muted-foreground">
                  (Full informative sentences, never empty keywords)
                </span>
              </h4>
            </div>

            {/* Detailed Narrative Paragraph */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Contextual Explanation & Narrative
              </label>
              <textarea
                rows={3}
                value={content.explanation || ""}
                onChange={(e) => handleContentUpdate({ explanation: e.target.value })}
                className="w-full text-xs sm:text-sm bg-background border border-border/60 rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y leading-relaxed"
                placeholder="Provide a thorough, informative paragraph contextualizing this slide topic with domain rigor..."
              />
            </div>

            {/* Bullet Points List */}
            {(content.type === "bullets" || content.type === "mixed" || content.type === "paragraph") && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Informative Bullet Points ({content.points?.length || 0})
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddPoint}
                    className="h-6 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Point</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {(content.points || []).map((point, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 group">
                      <span className="text-xs font-mono font-bold text-muted-foreground mt-2 w-5 text-right shrink-0">
                        {pIdx + 1}.
                      </span>
                      <textarea
                        rows={2}
                        value={point}
                        onChange={(e) => handlePointChange(pIdx, e.target.value)}
                        className="flex-1 text-xs bg-background border border-border/60 rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-y leading-relaxed"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePoint(pIdx)}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-500 opacity-60 group-hover:opacity-100 shrink-0 mt-1 rounded-lg"
                        title="Delete Point"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Case Study Editor */}
            {(content.type === "case-study" || content.caseStudy !== undefined) && (
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Structured Case Study Blueprint</span>
                  </label>
                  {content.type !== "case-study" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleContentUpdate({ caseStudy: undefined })}
                      className="h-6 text-[11px] text-muted-foreground hover:text-rose-500"
                    >
                      Remove Case Study
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.caseStudy?.clientOrContext || ""}
                    onChange={(e) =>
                      handleContentUpdate({
                        caseStudy: {
                          ...(content.caseStudy || { problem: "", solution: "", impact: "" }),
                          clientOrContext: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs bg-background border border-border/60 rounded-xl p-2.5 text-foreground"
                    placeholder="Enterprise or Academic Context (e.g. Mayo Clinic & Google Health)"
                  />
                  <textarea
                    rows={2}
                    value={content.caseStudy?.problem || ""}
                    onChange={(e) =>
                      handleContentUpdate({
                        caseStudy: {
                          ...(content.caseStudy || { clientOrContext: "", solution: "", impact: "" }),
                          problem: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs bg-background border border-border/60 rounded-xl p-2.5 text-foreground"
                    placeholder="The Core Challenge or Diagnostic Bottleneck..."
                  />
                  <textarea
                    rows={2}
                    value={content.caseStudy?.solution || ""}
                    onChange={(e) =>
                      handleContentUpdate({
                        caseStudy: {
                          ...(content.caseStudy || { clientOrContext: "", problem: "", impact: "" }),
                          solution: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs bg-background border border-border/60 rounded-xl p-2.5 text-foreground"
                    placeholder="AI Solution Implemented & Architectural Approach..."
                  />
                  <textarea
                    rows={2}
                    value={content.caseStudy?.impact || ""}
                    onChange={(e) =>
                      handleContentUpdate({
                        caseStudy: {
                          ...(content.caseStudy || { clientOrContext: "", problem: "", solution: "" }),
                          impact: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs bg-background border border-border/60 rounded-xl p-2.5 text-foreground font-medium"
                    placeholder="Measurable Clinical & Operational Impact (e.g. 93.4% accuracy, -64% triage time)..."
                  />
                </div>
              </div>
            )}

            {/* Quantitative Statistics & Metrics Editor */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Quantitative Statistics & Metrics ({content.statistics?.length || 0})</span>
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddStat}
                  className="h-6 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Metric</span>
                </Button>
              </div>

              {content.statistics && content.statistics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {content.statistics.map((stat, sIdx) => (
                    <div key={sIdx} className="p-3 bg-background border border-border/60 rounded-xl space-y-2 relative group">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => handleStatChange(sIdx, "value", e.target.value)}
                          className="font-bold text-sm text-primary bg-muted/40 px-2 py-1 rounded-lg border border-border/40 w-24"
                          placeholder="e.g. 94.8%"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveStat(sIdx)}
                          className="h-6 w-6 text-muted-foreground hover:text-rose-500 opacity-60 group-hover:opacity-100 rounded-md"
                          title="Delete Metric"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleStatChange(sIdx, "label", e.target.value)}
                        className="w-full text-xs font-semibold bg-transparent border-b border-border/40 focus:border-primary outline-none py-0.5"
                        placeholder="Metric Label (e.g. Diagnostic Accuracy)"
                      />
                      <input
                        type="text"
                        value={stat.context || ""}
                        onChange={(e) => handleStatChange(sIdx, "context", e.target.value)}
                        className="w-full text-[11px] text-muted-foreground bg-transparent border-b border-border/40 focus:border-primary outline-none py-0.5"
                        placeholder="Context or benchmark comparison"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground italic py-1">
                  No custom quantitative metrics on this slide. Click &quot;Add Metric&quot; or &quot;+ Stats&quot; to highlight key performance figures.
                </p>
              )}
            </div>

            {/* Real-World Examples Section */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  Concrete Real-World Examples ({content.examples?.length || 0})
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddExample}
                  className="h-6 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Example</span>
                </Button>
              </div>

              <div className="space-y-2">
                {(content.examples || []).map((example, exIdx) => (
                  <div key={exIdx} className="flex items-start gap-2 group">
                    <span className="text-xs font-mono font-bold text-muted-foreground mt-2 w-5 text-right shrink-0">
                      Ex {exIdx + 1}:
                    </span>
                    <input
                      type="text"
                      value={example}
                      onChange={(e) => handleExampleChange(exIdx, e.target.value)}
                      className="flex-1 text-xs bg-background border border-border/60 rounded-xl p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExample(exIdx)}
                      className="h-7 w-7 text-muted-foreground hover:text-rose-500 opacity-60 group-hover:opacity-100 shrink-0 rounded-md"
                      title="Delete Example"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Presenter Speaker Notes */}
          <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border/70 shadow-sm space-y-2 gamma-card-hover transition-all">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-primary" />
                <span>Speaker / Presenter Notes</span>
              </label>
              <span className="text-xs text-muted-foreground font-mono">
                {notesWordCount} words (~{speakingTimeSec}s speaking time)
              </span>
            </div>
            <textarea
              rows={3}
              value={slide.speakerNotes || ""}
              onChange={(e) => handleUpdate({ speakerNotes: e.target.value })}
              className="w-full text-xs bg-background border border-border/60 rounded-xl p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-y leading-relaxed"
              placeholder="Detailed spoken remarks, verbal talking points, and pacing guidance for the speaker..."
            />
          </div>

          {/* Visual & Image Placement Suggestions */}
          <div className="bg-muted/40 p-4 sm:p-5 rounded-2xl border border-border/60 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-foreground">AI Visual & Design Placement Guidance:</p>
              <p className="text-muted-foreground">
                {slide.visualSuggestion || "Modern editorial layout with balanced card grid and prominent key metric callout."}
              </p>
              {slide.imageSuggestion && (
                <p className="text-primary font-medium">
                  Imagery theme: {slide.imageSuggestion}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
};
