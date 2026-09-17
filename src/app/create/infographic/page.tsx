"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  BarChart2,
  ArrowLeft,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Loader2,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/types/document-spec";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { buildInfographicDocumentSpec } from "@/lib/generators/infographic/infographic-builder";
import {
  INFOGRAPHIC_TYPES,
  InfographicType,
} from "@/lib/generators/infographic/infographic-types";
import { FormatLivePreview } from "@/components/preview/FormatLivePreview";

interface StepItem {
  title: string;
  description: string;
  metric?: string;
  tag?: string;
}

export default function InfographicCreatePage() {
  const router = useRouter();
  const { setDocument, setProjectId } = useEditorStore();

  const [type, setType] = useState<InfographicType>("process");
  const [title, setTitle] = useState("Autonomous AI Development Lifecycle");
  const [subtitle, setSubtitle] = useState("5 Strategic Milestones from Architecture Blueprint to Production Deployment");
  const [badge, setBadge] = useState("2026 BENCHMARK REPORT");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");

  const [steps, setSteps] = useState<StepItem[]>([
    {
      title: "1. Intent Analysis & Spec Synthesis",
      description: "Deconstructing natural language prompts into typed semantic requirements and AST nodes.",
      metric: "99.4% Accuracy",
      tag: "Phase 1",
    },
    {
      title: "2. Deterministic Layout Formulation",
      description: "Selecting optimal grid containers, mathematical aspect ratios, and visual weights.",
      metric: "12ms Latency",
      tag: "Phase 2",
    },
    {
      title: "3. Schema & Contrast Validation",
      description: "Zod AST validation verifying WCAG AA contrast compliance and zero text clipping.",
      metric: "100% Validated",
      tag: "Phase 3",
    },
    {
      title: "4. Multi-Format Native Compilation",
      description: "Direct vector conversion into PowerPoint shapes, Word runs, or print-ready PDFs.",
      metric: "Zero Loss",
      tag: "Phase 4",
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddStep = () => {
    if (steps.length >= 8) {
      alert("Maximum 8 sections allowed in one vertical infographic.");
      return;
    }
    const idx = steps.length + 1;
    setSteps([
      ...steps,
      {
        title: `${idx}. Milestone Stage`,
        description: "Add detailed explanation and key insights for this milestone stage.",
        metric: "Metric",
        tag: `Phase ${idx}`,
      },
    ]);
  };

  const handleRemoveStep = (idx: number) => {
    if (steps.length <= 2) {
      alert("At least 2 steps are required for a sequential infographic.");
      return;
    }
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleStepChange = (idx: number, field: keyof StepItem, val: string) => {
    const updated = [...steps];
    updated[idx] = { ...updated[idx], [field]: val };
    setSteps(updated);
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert("Please provide a title for your infographic.");
      return;
    }

    try {
      setIsGenerating(true);

      const infoDoc = buildInfographicDocumentSpec({
        infographicType: type,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        badge: badge.trim() || undefined,
        dimensions: aspectRatio,
        steps,
      });

      // Strict Project Isolation
      const newProject = await projectService.createProject({
        name: title.slice(0, 45),
        projectType: "infographic",
        originalPrompt: `${type}: ${title}`,
        currentSpec: infoDoc,
      });

      setDocument(infoDoc);
      setProjectId(newProject.id);

      router.push(`/editor?projectId=${newProject.id}`);
    } catch (err: any) {
      console.error("Infographic creation error:", err);
      alert("Failed to build infographic: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell title="Visual Infographic Studio" subtitle="Design vertical data storytelling and multi-stage processes">
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio Hub</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Infographic Studio
          </span>
        </div>

        {/* Title Header */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Visual Infographic Studio</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Construct high-impact visual timelines, comparative breakdowns, and vertical sequential narratives with custom step callouts.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Config Form on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Infographic Archetype */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                1
              </span>
              <h2 className="text-sm font-bold text-foreground">Infographic Structure</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {Object.values(INFOGRAPHIC_TYPES).map((info) => {
                const isSelected = type === info.id;
                return (
                  <button
                    key={info.id}
                    type="button"
                    onClick={() => {
                      setType(info.id);
                      setAspectRatio(info.suggestedAspectRatio);
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-left flex flex-col justify-between transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground"
                        : "border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div>
                      <span className="text-xs font-bold block mb-1">{info.label}</span>
                      <p className="text-[10px] opacity-75 line-clamp-2">{info.description}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3] mt-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Header & Topic */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                2
              </span>
              <h2 className="text-sm font-bold text-foreground">Title & Header Content</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-foreground">Infographic Main Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous AI Development Lifecycle"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Header Badge</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. 2026 BENCHMARK"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Subtitle / Narrative Summary</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Strategic steps from conceptual brief to production-grade vector execution"
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          {/* 3. Steps & Milestone Builder */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                  3
                </span>
                <h2 className="text-sm font-bold text-foreground">Sequential Steps & Metrics ({steps.length})</h2>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                        placeholder="Step Title"
                        className="w-full text-xs font-bold bg-transparent border-b border-transparent focus:border-primary focus:outline-none py-0.5 text-foreground"
                      />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Remove Step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) => handleStepChange(idx, "description", e.target.value)}
                        placeholder="Detailed milestone description..."
                        className="w-full text-[11px] p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={step.metric || ""}
                        onChange={(e) => handleStepChange(idx, "metric", e.target.value)}
                        placeholder="Metric / Callout (e.g. +45% Speed)"
                        className="w-full text-[11px] p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Canvas Aspect Ratio */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                4
              </span>
              <h2 className="text-sm font-bold text-foreground">Canvas Aspect Ratio</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "9:16", label: "9:16 Vertical", desc: "Long-form Mobile & Web" },
                { id: "4:5", label: "4:5 Portrait", desc: "Social Media Feed Post" },
                { id: "16:9", label: "16:9 Landscape", desc: "Slide Presentation Story" },
              ].map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id as any)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    aspectRatio === ar.id
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground"
                      : "border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-xs font-bold block">{ar.label}</span>
                  <span className="text-[10px] opacity-75">{ar.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Generate Button */}
          <div className="flex items-center justify-between p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Ready to render your infographic?</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Builds an independent infographic project with custom section containers and vector icons.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/95 transition-all shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Infographic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Generate Infographic</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Sticky Live Preview Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
            <FormatLivePreview
              documentType="infographic"
              title={title || "Untitled Infographic"}
              subtitle={subtitle}
              aspectRatio={aspectRatio}
              moodOrCategory={type}
              details={{
                badge: badge,
                cta: "EXPLORE REPORT",
                metrics: steps.slice(0, 3).map((s) => ({
                  label: s.title.replace(/^\d+\.\s*/, ""),
                  value: s.metric || "100%",
                })),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </AppShell>
  );
}
