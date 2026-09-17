"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import {
  Presentation,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Upload,
  Clock,
  Users,
  Target,
  Palette,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  {
    tag: "Healthcare",
    label: "Clinical AI Diagnostics",
    prompt: "Autonomous AI Agents in Clinical Diagnostics: Multi-modal radiology, FDA clearance trends, diagnostic accuracy benchmarks, and hospital workflow integration.",
  },
  {
    tag: "Energy",
    label: "Renewable Grid Modernization",
    prompt: "Renewable Energy Grid Modernization: Utility-scale battery storage, AI load balancing, transmission resilience, and 2030 decarbonization milestones.",
  },
  {
    tag: "Finance",
    label: "Q3 SaaS Revenue Review",
    prompt: "Q3 Enterprise Financial & Revenue Performance: Net revenue retention (NRR), SaaS gross margins, CAC payback efficiency, and FY27 expansion projections.",
  },
  {
    tag: "Tech",
    label: "Autonomous Coding Systems",
    prompt: "Autonomous Software Engineering Agents: Self-healing test suites, multi-agent pair programming, code security verification, and enterprise developer productivity.",
  },
  {
    tag: "Startup",
    label: "Seed Round Pitch Deck",
    prompt: "AI Infrastructure Seed Pitch: Market pain point, proprietary technology edge, early customer traction metrics, TAM sizing, and 18-month hiring milestones.",
  },
];

const SLIDE_COUNT_PRESETS = [5, 8, 10, 12, 15, 20];

const DEPTH_OPTIONS = [
  { id: "overview", label: "Executive Overview" },
  { id: "balanced", label: "Balanced" },
  { id: "in_depth", label: "In-Depth" },
  { id: "exhaustive", label: "Exhaustive Deep Dive" },
] as const;

const STYLE_ARCHETYPES = [
  { id: "corporate", label: "Corporate" },
  { id: "pitch", label: "Startup Pitch" },
  { id: "academic", label: "Academic" },
  { id: "educational", label: "Educational" },
  { id: "creative", label: "Creative" },
  { id: "storytelling", label: "Storytelling" },
] as const;

function PresentationCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const initialCount = searchParams.get("count") || searchParams.get("slideCount");

  // Primary Brief State
  const [topic, setTopic] = useState(initialPrompt);
  const [slideCount, setSlideCount] = useState(initialCount ? Number(initialCount) : 8);

  useEffect(() => {
    const p = searchParams.get("prompt");
    if (p) setTopic(p);
    const c = searchParams.get("count") || searchParams.get("slideCount");
    if (c) setSlideCount(Number(c));
  }, [searchParams]);
  const [contentDepth, setContentDepth] = useState<"overview" | "balanced" | "in_depth" | "exhaustive">("in_depth");
  const [presentationStyle, setPresentationStyle] = useState<"corporate" | "pitch" | "academic" | "educational" | "creative" | "storytelling">("corporate");

  // Context & Delivery
  const [audience, setAudience] = useState("Executive & Leadership");
  const [purpose, setPurpose] = useState("Strategic Pitch / Business Review");
  const [duration, setDuration] = useState("15 Minutes");

  // Advanced Options State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [styleSource, setStyleSource] = useState<"new_ai" | "template" | "sample" | "combined">("new_ai");
  const [templateFileName, setTemplateFileName] = useState<string | null>(null);
  const [sampleFileName, setSampleFileName] = useState<string | null>(null);
  const [slideSize, setSlideSize] = useState<"16:9" | "4:3">("16:9");
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [density, setDensity] = useState<"comfortable" | "balanced" | "compact">("balanced");

  const handleLaunchPlanner = () => {
    if (!topic.trim()) {
      alert("Please enter a presentation topic or pick an AI prompt starter.");
      return;
    }

    const params = new URLSearchParams({
      prompt: topic.trim(),
      slideCount: String(slideCount),
      depth: contentDepth,
      audience,
      purpose,
      duration,
      style: presentationStyle,
      styleSource,
      aspectRatio: slideSize,
      speakerNotes: includeSpeakerNotes ? "true" : "false",
      citations: includeCitations ? "true" : "false",
      density,
    });

    if (templateFileName) params.set("template", templateFileName);
    if (sampleFileName) params.set("sample", sampleFileName);

    router.push(`/planner?${params.toString()}`);
  };

  return (
    <AppShell title="Presentation Studio" subtitle="16:9 AI Presentation Creator">
      <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-2 sm:pt-4">
        {/* Minimal Navigation & Step Tracker */}
        <div className="flex items-center justify-between py-2 px-4 rounded-2xl bg-card border border-border/70 text-xs shadow-sm">
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Format Hub</span>
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <Link href="/create" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[9px] font-bold">
                ✓
              </span>
              <span>Format</span>
            </Link>
            <span className="text-muted-foreground/40 font-bold">→</span>
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px]">
                2
              </span>
              <span>Prompt & Brief</span>
            </div>
            <span className="text-muted-foreground/40 font-bold">→</span>
            <div className="flex items-center gap-1.5 text-muted-foreground/50 font-medium">
              <span className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[9px]">
                3
              </span>
              <span>Content Blueprint</span>
            </div>
            <span className="text-muted-foreground/40 font-bold">→</span>
            <div className="flex items-center gap-1.5 text-muted-foreground/50 font-medium">
              <span className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[9px]">
                4
              </span>
              <span>Visual Studio</span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-primary font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            16:9 Presentation Deck
          </span>
        </div>

        {/* Controlled Hero Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            What presentation will you create?
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Enter your topic, drop in notes, or pick a starter. SlideCraft AI generates an editable, structured content blueprint.
          </p>
        </div>

        {/* Central Prompt Composer (The Hero Focus) */}
        <div className="rounded-3xl gamma-composer p-5 sm:p-7 space-y-6 shadow-md border border-border/80">
          {/* Prompt Textarea */}
          <div className="space-y-1.5">
            <textarea
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. A comprehensive 10-slide strategy deck on AI agents in clinical diagnostics, covering FDA clearances, multi-modal vision models, and hospital ROI..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-border/70 bg-background text-foreground placeholder:text-muted-foreground/60 resize-none leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
            />
          </div>

          {/* Quick Starter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground mr-1">Starters:</span>
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(p.prompt)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/70 bg-muted/30 hover:bg-muted text-foreground text-[11px] font-medium transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Inline Segmented Controls */}
          <div className="space-y-4 pt-2 border-t border-border/60">
            {/* Slide Count Pills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Slide Count</span>
                <span className="text-xs font-mono font-bold text-primary">{slideCount} Slides</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {SLIDE_COUNT_PRESETS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSlideCount(count)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-semibold transition-all text-center border",
                      slideCount === count
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/30 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Depth Pills */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground block">Information Depth</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DEPTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setContentDepth(opt.id)}
                    className={cn(
                      "py-2 px-2.5 rounded-xl text-xs font-semibold transition-all text-center border",
                      contentDepth === opt.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/30 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Style Archetype */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground block">Style Tone</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {STYLE_ARCHETYPES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setPresentationStyle(st.id)}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-semibold transition-all text-center border",
                      presentationStyle === st.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/30 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleLaunchPlanner}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-md shadow-primary/25 hover:bg-primary/95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Launch Content Planner</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Collapsible Advanced Options Accordion */}
        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-foreground block">
                  Advanced Presentation Controls
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  PPT template imports, reference sample style, speaker notes & citations
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <span>{showAdvanced ? "Hide" : "Configure"}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="border-t border-border/60 p-5 sm:p-6 space-y-5 bg-muted/10"
              >
                {/* Target Audience & Purpose */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Target Audience</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary"
                    >
                      <option value="Executive & Leadership">Executive & Leadership</option>
                      <option value="Investors & Venture Capital">Investors & Venture Capital</option>
                      <option value="Technical & Engineering">Technical & Engineering Team</option>
                      <option value="Academic & Researchers">Academic & Researchers</option>
                      <option value="Clients & Customers">Prospective Clients / Sales</option>
                      <option value="General Public">General Public / Community</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Presentation Purpose</label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary"
                    >
                      <option value="Strategic Pitch / Business Review">Strategic Pitch / Business Review</option>
                      <option value="Product Launch / Demo">Product Launch / Demo</option>
                      <option value="Keynote Address">Keynote Address</option>
                      <option value="Quarterly Performance Review">Quarterly Performance Review</option>
                      <option value="Educational Lecture">Educational Lecture</option>
                      <option value="Workshop & Training">Workshop & Training</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary"
                    >
                      <option value="5 Minutes">5 Minutes (Lightning Talk)</option>
                      <option value="10 Minutes">10 Minutes (Pitch Deck)</option>
                      <option value="15 Minutes">15 Minutes (Standard Meeting)</option>
                      <option value="30 Minutes">30 Minutes (Deep Dive)</option>
                      <option value="45 Minutes">45 Minutes (Keynote Lecture)</option>
                      <option value="60 Minutes">60 Minutes (Full Seminar)</option>
                    </select>
                  </div>
                </div>

                {/* Template & Reference Source Selection */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-foreground">Template & Reference Strategy</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: "new_ai", label: "Generate New Style", desc: "AI synthesizes unique layout & palette" },
                      { id: "template", label: "Use PPT Template", desc: "Match corporate master slide structure" },
                      { id: "sample", label: "Follow Sample Style", desc: "Extract typography & visual mood" },
                      { id: "combined", label: "Combine Both", desc: "Template layout with sample styling" },
                    ].map((src) => (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => setStyleSource(src.id as any)}
                        className={cn(
                          "p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all",
                          styleSource === src.id
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div>
                          <span className="text-xs font-bold block text-foreground">{src.label}</span>
                          <p className="text-[10px] opacity-75">{src.desc}</p>
                        </div>
                        {styleSource === src.id && <Check className="w-3.5 h-3.5 text-primary stroke-[3] mt-1 self-end" />}
                      </button>
                    ))}
                  </div>

                  {/* Upload Dropzones */}
                  {(styleSource === "template" || styleSource === "sample" || styleSource === "combined") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-2xl border border-dashed border-border bg-card text-center space-y-1.5">
                        <Upload className="w-4 h-4 mx-auto text-muted-foreground" />
                        <div>
                          <span className="text-xs font-semibold text-foreground block">PowerPoint Template (.pptx)</span>
                          <span className="text-[10px] text-muted-foreground">Extract layouts & master bounds</span>
                        </div>
                        <input
                          type="file"
                          accept=".pptx"
                          onChange={(e) => {
                            if (e.target.files?.[0]) setTemplateFileName(e.target.files[0].name);
                          }}
                          className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground cursor-pointer"
                        />
                        {templateFileName && (
                          <span className="text-[10px] text-emerald-500 font-semibold block">Attached: {templateFileName}</span>
                        )}
                      </div>

                      <div className="p-3.5 rounded-2xl border border-dashed border-border bg-card text-center space-y-1.5">
                        <Palette className="w-4 h-4 mx-auto text-muted-foreground" />
                        <div>
                          <span className="text-xs font-semibold text-foreground block">Sample Presentation</span>
                          <span className="text-[10px] text-muted-foreground">Extract typography & colors</span>
                        </div>
                        <input
                          type="file"
                          accept=".pptx,image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) setSampleFileName(e.target.files[0].name);
                          }}
                          className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground cursor-pointer"
                        />
                        {sampleFileName && (
                          <span className="text-[10px] text-emerald-500 font-semibold block">Attached: {sampleFileName}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Aspect Ratio, Density, Speaker Notes, Citations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Slide Aspect Ratio</label>
                    <select
                      value={slideSize}
                      onChange={(e) => setSlideSize(e.target.value as any)}
                      className="w-full text-xs p-2 rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary"
                    >
                      <option value="16:9">16:9 Widescreen (Standard)</option>
                      <option value="4:3">4:3 Traditional Slide</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Layout Density</label>
                    <select
                      value={density}
                      onChange={(e) => setDensity(e.target.value as any)}
                      className="w-full text-xs p-2 rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary"
                    >
                      <option value="comfortable">Comfortable (High breathing room)</option>
                      <option value="balanced">Balanced (Standard)</option>
                      <option value="compact">Compact (Dense metrics)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Speaker Notes</label>
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={includeSpeakerNotes}
                        onChange={(e) => setIncludeSpeakerNotes(e.target.checked)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-medium text-foreground">Include AI Notes</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Citations & Sources</label>
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={includeCitations}
                        onChange={(e) => setIncludeCitations(e.target.checked)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-medium text-foreground">Footnote Sources</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}

export default function PresentationCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <PresentationCreateContent />
    </Suspense>
  );
}
