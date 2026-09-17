"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Check,
  CheckCircle2,
  Loader2,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  MessageSquare,
  Hash,
  AtSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { buildSocialDocumentSpec } from "@/lib/generators/social/social-builder";
import {
  SOCIAL_PLATFORMS,
  SocialPlatform,
} from "@/lib/generators/social/social-types";
import { FormatLivePreview } from "@/components/preview/FormatLivePreview";

export default function SocialCreatePage() {
  const router = useRouter();
  const { setDocument, setProjectId } = useEditorStore();

  const [platform, setPlatform] = useState<SocialPlatform>("instagram_post");
  const [headline, setHeadline] = useState("Scale Autonomous AI Agents with 99.8% Reliability");
  const [subheadline, setSubheadline] = useState("Deterministic AST compilation guarantees zero layout shifts and flawless visual exports.");
  const [cta, setCta] = useState("Explore Developer Beta ➔");
  const [handle, setHandle] = useState("@slidecraft.ai");
  const [badgeText, setBadgeText] = useState("ENGINEERING SHOWCASE");

  const [stat1Val, setStat1Val] = useState("10x");
  const [stat1Label, setStat1Label] = useState("Faster Production");
  const [stat2Val, setStat2Val] = useState("99.8%");
  const [stat2Label, setStat2Label] = useState("Vector Precision");

  const [hashtags, setHashtags] = useState("#AI #AgenticCoding #DesignEngineering #SlideCraft");
  const [isGenerating, setIsGenerating] = useState(false);

  const currentPlatformMeta = SOCIAL_PLATFORMS[platform];

  const handleGenerateSocial = async () => {
    if (!headline.trim()) {
      alert("Please provide a headline for your social graphic.");
      return;
    }

    try {
      setIsGenerating(true);

      const stats = [
        { label: stat1Label, value: stat1Val },
        { label: stat2Label, value: stat2Val },
      ].filter((s) => s.label && s.value);

      const socialDoc = buildSocialDocumentSpec({
        platform,
        headline: headline.trim(),
        subheadline: subheadline.trim() || undefined,
        callToAction: cta.trim() || undefined,
        handleOrBrand: handle.trim() || undefined,
        badgeText: badgeText.trim() || undefined,
        highlightStats: stats,
      });

      // Strict Project Isolation
      const newProject = await projectService.createProject({
        name: headline.slice(0, 45),
        projectType: "social_media",
        originalPrompt: `${platform}: ${headline}`,
        currentSpec: socialDoc,
      });

      setDocument(socialDoc);
      setProjectId(newProject.id);

      router.push(`/editor?projectId=${newProject.id}`);
    } catch (err: any) {
      console.error("Social generation error:", err);
      alert("Failed to generate social graphic: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell title="Social Graphic Studio" subtitle="Generate high-converting feed posts and stories with safe-zone guides">
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
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
            Social Studio
          </span>
        </div>

        {/* Title Header */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Social Graphic Studio</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create feed graphics and story visuals bounded by exact UI safe-zones so icons, usernames, and reply bars never occlude your message.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Config Form on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Platform Selection */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                  1
                </span>
                <h2 className="text-sm font-bold text-foreground">Target Social Platform</h2>
              </div>
              <span className="text-[10px] font-bold text-primary">
                {currentPlatformMeta.dimensionsPx.width} × {currentPlatformMeta.dimensionsPx.height} px
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(SOCIAL_PLATFORMS).map((p) => {
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={cn(
                      "p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground"
                        : "border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{p.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />}
                      </div>
                      <span className="text-[10px] text-primary font-semibold block mb-1">
                        {p.dimensionsPx.width} × {p.dimensionsPx.height} px
                      </span>
                      <p className="text-[10px] opacity-75 line-clamp-2">{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Safe Zone Details Callout */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/70 flex items-center gap-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong className="text-foreground font-semibold">Safe Zone Protection: </strong>
                Top margin ({currentPlatformMeta.safeZones.top}px), Bottom margin ({currentPlatformMeta.safeZones.bottom}px). {currentPlatformMeta.safeZones.notes || "All copy centered safely."}
              </span>
            </div>
          </div>

          {/* 2. Headline & Visual Copy */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                2
              </span>
              <h2 className="text-sm font-bold text-foreground">Post Copy & Objective</h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-foreground">Main Post Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Scale Autonomous AI Agents"
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Category Badge</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. NEW FEATURE"
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Supporting Caption / Subheadline</label>
                <textarea
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="Explain the core benefit or takeaway for the audience..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-primary" />
                    <span>Handle or Brand Watermark</span>
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="e.g. @slidecraft.ai"
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Call to Action (CTA)</label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    placeholder="e.g. Try Free Today ➔"
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Metric Callouts & Hashtags */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                3
              </span>
              <h2 className="text-sm font-bold text-foreground">Highlight Metrics & Tags</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Metric Badge 1</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={stat1Val}
                    onChange={(e) => setStat1Val(e.target.value)}
                    placeholder="e.g. 10x"
                    className="text-xs p-2 rounded-lg border border-border bg-background font-bold text-foreground"
                  />
                  <input
                    type="text"
                    value={stat1Label}
                    onChange={(e) => setStat1Label(e.target.value)}
                    placeholder="e.g. Faster Delivery"
                    className="text-xs p-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Metric Badge 2</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={stat2Val}
                    onChange={(e) => setStat2Val(e.target.value)}
                    placeholder="e.g. 99.8%"
                    className="text-xs p-2 rounded-lg border border-border bg-background font-bold text-foreground"
                  />
                  <input
                    type="text"
                    value={stat2Label}
                    onChange={(e) => setStat2Label(e.target.value)}
                    placeholder="e.g. Precision"
                    className="text-xs p-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-primary" />
                <span>Suggested Hashtags</span>
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="e.g. #AI #Design #Technology"
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-background text-foreground"
              />
            </div>
          </div>

          {/* Action Generate Button */}
          <div className="flex items-center justify-between p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Ready to generate your social graphic?</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Creates an independent social project calibrated with live safe-zone overlay guides.
              </p>
            </div>
            <button
              onClick={handleGenerateSocial}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/95 transition-all shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Social Canvas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span>Generate Social Graphic</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Sticky Live Preview Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
            <FormatLivePreview
              documentType="social_media"
              title={headline || "Untitled Post"}
              subtitle={subheadline}
              aspectRatio={currentPlatformMeta.aspectRatio}
              details={{
                badge: badgeText,
                cta: cta,
                handle: handle,
                metrics: [
                  { label: stat1Label, value: stat1Val },
                  { label: stat2Label, value: stat2Val },
                ].filter((m) => m.label && m.value),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </AppShell>
  );
}
