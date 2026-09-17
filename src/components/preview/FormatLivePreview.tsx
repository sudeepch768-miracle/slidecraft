"use client";

import React from "react";
import { DocumentType, AspectRatio, CANVAS_PRESETS } from "@/types/document-spec";
import { resolveFormatPreset, presetToThemeSpec, presetToPageBackground } from "@/lib/generators/format-design-engine";
import { SlideBackgroundLayer } from "@/components/editor/SlideBackgroundLayer";
import { Sparkles, Calendar, MapPin, QrCode, ArrowRight, ShieldCheck, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormatLivePreviewProps {
  documentType: DocumentType;
  title: string;
  subtitle?: string;
  aspectRatio?: AspectRatio;
  moodOrCategory?: string;
  details?: {
    date?: string;
    venue?: string;
    cta?: string;
    badge?: string;
    handle?: string;
    metrics?: Array<{ label: string; value: string }>;
  };
  showBleedGuides?: boolean;
  className?: string;
}

export const FormatLivePreview: React.FC<FormatLivePreviewProps> = ({
  documentType,
  title,
  subtitle,
  aspectRatio = "A4_portrait",
  moodOrCategory,
  details = {},
  showBleedGuides = false,
  className,
}) => {
  const preset = resolveFormatPreset(documentType, moodOrCategory);
  const theme = presetToThemeSpec(preset);
  const bg = presetToPageBackground(preset);

  // Aspect Ratio calculations
  const getAspectClass = () => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square max-w-[420px]";
      case "4:5":
        return "aspect-[4/5] max-w-[380px]";
      case "9:16":
        return "aspect-[9/16] max-w-[320px]";
      case "16:9":
        return "aspect-[16/9] max-w-[560px]";
      case "A4_portrait":
      case "A3_portrait":
      default:
        return "aspect-[1/1.414] max-w-[380px]";
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-4 sm:p-6 w-full", className)}>
      {/* Live Indicator Header */}
      <div className="flex items-center justify-between w-full max-w-[480px] mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Design Preview</span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/50">
          {preset.name}
        </span>
      </div>

      {/* Main Preview Frame */}
      <div
        className={cn(
          "w-full rounded-2xl sm:rounded-3xl shadow-2xl border border-border/80 overflow-hidden relative flex flex-col transition-all duration-300 select-none",
          getAspectClass()
        )}
        style={{
          backgroundColor: theme.colors.background,
        }}
      >
        {/* Dynamic Background Layer */}
        <SlideBackgroundLayer
          backgroundSpec={{
            type: bg.type === "gradient" ? "gradient" : "solid",
            color: bg.value,
            glow: bg.glow as any,
            decorativeShapes: bg.decorativeShapes as any,
          }}
          theme={theme}
          bgOverride={bg.type === "solid" ? bg.value : undefined}
        />

        {/* Optional 3mm Print Bleed Guide Overlay */}
        {showBleedGuides && (
          <div className="absolute inset-2 sm:inset-3 border border-dashed border-sky-400/40 pointer-events-none rounded-xl z-20 flex flex-col justify-between p-1.5">
            <span className="text-[9px] font-mono text-sky-400/80 uppercase tracking-widest">
              3mm Bleed Safe Zone
            </span>
            <span className="text-[9px] font-mono text-sky-400/80 uppercase tracking-widest text-right">
              Trim Boundary
            </span>
          </div>
        )}

        {/* Format Specific Preview Composition */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
          {/* 1. Poster Composition */}
          {documentType === "poster" && (
            <div className="flex-1 flex flex-col justify-between gap-3 overflow-hidden">
              {/* Header */}
              <div className="flex flex-col items-center text-center gap-1">
                {details.badge && (
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm"
                    style={{
                      backgroundColor: `${theme.colors.secondary}20`,
                      color: theme.colors.secondary,
                    }}
                  >
                    {details.badge}
                  </span>
                )}
                <h2
                  className="text-lg sm:text-xl font-black tracking-tight leading-tight line-clamp-2"
                  style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
                >
                  {title || "Event Poster Headline"}
                </h2>
                {subtitle && (
                  <p
                    className="text-[11px] font-medium opacity-85 line-clamp-2"
                    style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Body 2-Column Grid */}
              <div className="grid grid-cols-2 gap-2 my-auto">
                {/* Left: Event Details & Metrics */}
                <div className="flex flex-col gap-1.5 p-2 rounded-lg border bg-background/50 text-[10px]">
                  {details.date && (
                    <div className="flex items-center gap-1 font-semibold" style={{ color: theme.colors.textPrimary }}>
                      <Calendar className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{details.date}</span>
                    </div>
                  )}
                  {details.venue && (
                    <div className="flex items-center gap-1 opacity-80" style={{ color: theme.colors.textSecondary }}>
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{details.venue}</span>
                    </div>
                  )}
                  {details.metrics && details.metrics.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {details.metrics.slice(0, 2).map((m, idx) => (
                        <div key={idx} className="flex-1 p-1 rounded bg-muted/40 text-center">
                          <div className="font-bold text-[10px] text-primary">{m.value}</div>
                          <div className="text-[8px] opacity-70 truncate">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Speaker/Highlights Silhouette */}
                <div className="flex flex-col gap-1.5 p-2 rounded-lg border bg-background/50 text-[10px] justify-center">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Featured Sessions</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/20 shrink-0 flex items-center justify-center font-bold text-[8px] text-primary">
                      K
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-[10px] truncate" style={{ color: theme.colors.textPrimary }}>Keynote Panel</div>
                      <div className="text-[8px] opacity-70 truncate">Industry Leaders</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 shrink-0 flex items-center justify-center font-bold text-[8px] text-secondary">
                      W
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-[10px] truncate" style={{ color: theme.colors.textPrimary }}>Interactive Lab</div>
                      <div className="text-[8px] opacity-70 truncate">Live Demonstrations</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-2 rounded-lg border bg-background/70 text-[10px] shrink-0">
                <div className="flex items-center gap-1.5">
                  <div
                    className="px-2.5 py-1 rounded font-bold text-[10px] shadow-sm"
                    style={{ backgroundColor: theme.colors.primary, color: "#FFFFFF" }}
                  >
                    {details.cta || "REGISTER NOW"}
                  </div>
                  <span className="text-[9px] text-muted-foreground hidden sm:inline">Free Pass</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono opacity-80">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span>Scan RSVP</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Social Media Composition */}
          {documentType === "social_media" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between">
                {details.badge && (
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: theme.colors.secondary, color: "#FFFFFF" }}
                  >
                    {details.badge}
                  </span>
                )}
                {details.handle && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {details.handle}
                  </span>
                )}
              </div>

              <div className="my-auto py-2">
                <h2
                  className="text-base sm:text-lg font-black tracking-tight leading-tight line-clamp-3"
                  style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
                >
                  {title || "Impactful Social Media Hook"}
                </h2>
                {subtitle && (
                  <p
                    className="text-[11px] mt-1.5 opacity-85 line-clamp-2"
                    style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div
                  className="px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm inline-flex items-center gap-1"
                  style={{ backgroundColor: theme.colors.secondary, color: "#FFFFFF" }}
                >
                  <span>{details.cta || "Learn More"}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">SlideCraft AI</span>
              </div>
            </div>
          )}

          {/* 3. Infographic Composition */}
          {documentType === "infographic" && (
            <div className="flex-1 flex flex-col justify-between gap-2 overflow-hidden">
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-secondary">Step-by-Step Flow</span>
                <h3 className="text-sm font-bold truncate" style={{ color: theme.colors.textPrimary }}>
                  {title || "Workflow Infographic"}
                </h3>
              </div>

              <div className="space-y-1.5 my-auto">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2 p-1.5 rounded-lg border bg-background/50 text-[10px]">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0"
                      style={{ backgroundColor: theme.colors.secondary, color: "#FFFFFF" }}
                    >
                      {step}
                    </span>
                    <div className="truncate">
                      <div className="font-bold truncate" style={{ color: theme.colors.textPrimary }}>
                        Phase 0{step}: Architecture Step
                      </div>
                      <div className="text-[8px] opacity-70 truncate">Automated data narrative mapping</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center text-[9px] text-muted-foreground border-t pt-1">
                Synthesized by SlideCraft AI
              </div>
            </div>
          )}

          {/* 4. Resume Composition */}
          {documentType === "resume" && (
            <div className="flex-1 flex flex-col gap-2 text-[10px] overflow-hidden">
              <div className="border-b pb-1.5">
                <h3 className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>
                  {title || "Candidate Name"}
                </h3>
                <p className="text-[10px] font-semibold" style={{ color: theme.colors.secondary }}>
                  {subtitle || "Professional Title & Specialty"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div>
                  <div className="font-bold text-[9px] uppercase tracking-wider border-b pb-0.5 text-secondary">
                    Professional Summary
                  </div>
                  <p className="text-[9px] opacity-80 line-clamp-2 mt-0.5" style={{ color: theme.colors.textSecondary }}>
                    Experienced technologist with a proven track record of architecting mission-critical distributed systems.
                  </p>
                </div>

                <div>
                  <div className="font-bold text-[9px] uppercase tracking-wider border-b pb-0.5 text-secondary">
                    Core Skills
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["TypeScript", "Distributed Systems", "AI/ML", "Cloud"].map((sk) => (
                      <span key={sk} className="text-[8px] px-1.5 py-0.5 rounded border bg-muted/40">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Diagram & Chart fallback */}
          {(documentType === "diagram" || documentType === "chart") && (
            <div className="flex-1 flex flex-col justify-between text-center overflow-hidden">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-secondary">
                  {documentType.toUpperCase()} ARCHITECTURE
                </span>
                <h3 className="text-sm font-bold truncate mt-0.5" style={{ color: theme.colors.textPrimary }}>
                  {title || "System Diagram"}
                </h3>
              </div>

              <div className="flex items-center justify-center gap-2 my-auto">
                <div className="p-2 rounded border bg-background/60 text-[9px] font-bold">Node A</div>
                <ArrowRight className="w-3 h-3 text-secondary" />
                <div className="p-2 rounded border bg-background/60 text-[9px] font-bold">Processor</div>
                <ArrowRight className="w-3 h-3 text-secondary" />
                <div className="p-2 rounded border bg-background/60 text-[9px] font-bold">Node B</div>
              </div>

              <div className="text-[9px] text-muted-foreground border-t pt-1">
                Vector Precision Layout Engine
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
