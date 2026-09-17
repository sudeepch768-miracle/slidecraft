"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
  Calendar,
  MapPin,
  QrCode,
  Building,
  Palette,
  Type,
  Printer,
  ShieldAlert,
  Loader2,
  Check,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/types/document-spec";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { buildPosterDocumentSpec } from "@/lib/poster-engine/poster-builder";
import {
  POSTER_CATEGORIES,
  PosterCategory,
  PosterMood,
  PosterTypographyStyle,
} from "@/lib/poster-engine/poster-types";
import { FormatLivePreview } from "@/components/preview/FormatLivePreview";

export default function PosterCreatePage() {
  const router = useRouter();
  const { setDocument, setProjectId } = useEditorStore();

  const [category, setCategory] = useState<PosterCategory>("college_event");
  const [headline, setHeadline] = useState("ANNUAL INNOVATION SUMMIT 2026");
  const [subtitle, setSubtitle] = useState("Empowering the Next Generation of Autonomous AI Builders");
  const [dimensions, setDimensions] = useState<AspectRatio>("A4_portrait");
  const [designMood, setDesignMood] = useState<PosterMood>("vibrant_modern");
  const [typography, setTypography] = useState<PosterTypographyStyle>("modern_sans");

  // Event & Meta details
  const [eventDate, setEventDate] = useState("Friday, October 23, 2026");
  const [eventTime, setEventTime] = useState("09:30 AM – 06:00 PM EST");
  const [eventVenue, setEventVenue] = useState("Grand Convention Center & Auditorium Hall 3");
  const [qrUrl, setQrUrl] = useState("https://slidecraft.ai/register");
  const [organizerName, setOrganizerName] = useState("Faculty of Engineering & Innovation");
  const [contactEmail, setContactEmail] = useState("events@slidecraft.ai");
  const [highlights, setHighlights] = useState("Keynote Sessions, \$25K Hackathon, AI Demos, Career Expo");

  // Print controls
  const [isPrintMode, setIsPrintMode] = useState(true);
  const [showBleedGuides, setShowBleedGuides] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePoster = async () => {
    if (!headline.trim()) {
      alert("Please enter a poster headline.");
      return;
    }

    try {
      setIsGenerating(true);

      const splitHighlights = highlights
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const posterDoc = buildPosterDocumentSpec({
        posterType: category,
        title: headline.trim(),
        subtitle: subtitle.trim() || undefined,
        dimensions,
        designMood,
        typographyStyle: typography,
        eventDate,
        eventTime,
        eventVenue,
        qrUrl,
        organizerName,
        contactEmail,
        callToActionText: "REGISTER NOW",
        highlights: splitHighlights.length > 0 ? splitHighlights : ["Free Admission", "Certificate Included", "Global Community"],
      });

      // Strict Project Isolation: create independent project record
      const newProject = await projectService.createProject({
        name: headline.slice(0, 45),
        projectType: "poster",
        originalPrompt: `${category}: ${headline} - ${subtitle}`,
        currentSpec: posterDoc,
      });

      setDocument(posterDoc);
      setProjectId(newProject.id);

      router.push(`/editor?projectId=${newProject.id}`);
    } catch (err: any) {
      console.error("Poster creation error:", err);
      alert("Failed to generate poster: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell title="Poster & Banner Studio" subtitle="Design high-resolution display posters and print marketing">
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
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
            Poster Studio
          </span>
        </div>

        {/* Title Header */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Poster & Banner Design Studio</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate print-ready posters with accurate typography hierarchy, 3mm bleed guides, event scheduling, and high-DPI vector export.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Config Form on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Category Selection */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                  1
                </span>
                <h2 className="text-sm font-bold text-foreground">Select Poster Archetype</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {Object.values(POSTER_CATEGORIES).map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setDimensions(cat.suggestedAspectRatio);
                      setDesignMood(cat.defaultMood);
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-left flex flex-col justify-between transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground"
                        : "border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div>
                      <span className="text-xs font-bold block mb-1">{cat.label}</span>
                      <p className="text-[10px] opacity-75 line-clamp-2">{cat.description}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3] mt-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Headline & Content */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                2
              </span>
              <h2 className="text-sm font-bold text-foreground">Headline & Event Copy</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Main Headline / Title
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. ANNUAL TECH HACKATHON 2026"
                  className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Sub-headline / Tagline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Build, Deploy, and Pitch in 48 Hours"
                  className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Key Highlights (comma-separated badges)
                </label>
                <input
                  type="text"
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="e.g. Keynote Talks, \$20K Prizes, Free Lunch, Certificates"
                  className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>

          {/* 3. Event Scheduling, QR & Organization */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                3
              </span>
              <h2 className="text-sm font-bold text-foreground">Date, Venue & Registration</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Date & Time</span>
                </label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="e.g. Friday, October 23, 2026"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Venue / Location</span>
                </label>
                <input
                  type="text"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  placeholder="e.g. Grand Auditorium Hall 3"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  <span>Registration URL / QR Target</span>
                </label>
                <input
                  type="url"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  placeholder="https://slidecraft.ai/register"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  <span>Organizing Body</span>
                </label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="e.g. Dept of Computing & AI"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>

          {/* 4. Dimensions, Mood & Print Bleed */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                4
              </span>
              <h2 className="text-sm font-bold text-foreground">Dimensions & Print Bleed Specs</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Canvas Size</label>
                <select
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="A4_portrait">A4 Portrait (Print Standard)</option>
                  <option value="A3_portrait">A3 Large Format (Exhibition)</option>
                  <option value="1:1">1:1 Square (Digital Social)</option>
                  <option value="4:5">4:5 Feed Portrait</option>
                  <option value="9:16">9:16 Mobile Vertical</option>
                  <option value="16:9">16:9 Landscape Banner</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-primary" />
                  <span>Color Mood</span>
                </label>
                <select
                  value={designMood}
                  onChange={(e) => setDesignMood(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="vibrant_modern">Vibrant Modern (Indigo / Pink)</option>
                  <option value="academic_scholarly">Academic Scholarly (Navy / Crimson)</option>
                  <option value="dark_cyberpunk">Dark Cyberpunk (Deep Space / Neon)</option>
                  <option value="minimalist_editorial">Minimalist Monochrome</option>
                  <option value="corporate_clean">Corporate Clean (Royal Blue)</option>
                  <option value="retro_bold">Retro Bold (Orange / Gold)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-primary" />
                  <span>Typography Hierarchy</span>
                </label>
                <select
                  value={typography}
                  onChange={(e) => setTypography(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="modern_sans">Modern Sans (Plus Jakarta + Inter)</option>
                  <option value="bold_display">Bold Display (Montserrat + Inter)</option>
                  <option value="elegant_serif">Elegant Serif (Playfair + Georgia)</option>
                  <option value="tech_mono">Tech Mono (Space Grotesk + JetBrains)</option>
                </select>
              </div>
            </div>

            {/* Print Guides Toggle */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <span className="text-xs font-bold text-foreground block">3mm Print Bleed & Margin Safety Guides</span>
                  <span className="text-[11px] text-muted-foreground">
                    Renders safe-zone cut borders on canvas so critical text never gets sliced at print.
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBleedGuides}
                  onChange={(e) => setShowBleedGuides(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Action Generate Button */}
          <div className="flex items-center justify-between p-6 rounded-2xl border border-pink-500/20 bg-pink-500/5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Ready to generate your poster?</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Creates an independent poster project and opens the dedicated poster canvas editor.
              </p>
            </div>
            <button
              onClick={handleGeneratePoster}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/95 transition-all shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Composing Poster...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-pink-300" />
                  <span>Generate Poster & Open Editor</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Sticky Live Preview Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
            <FormatLivePreview
              documentType="poster"
              title={headline || "Untitled Poster"}
              subtitle={subtitle}
              aspectRatio={dimensions}
              moodOrCategory={designMood}
              details={{
                date: eventDate,
                venue: eventVenue,
                badge: category.replace("_", " ").toUpperCase(),
                cta: "REGISTER NOW",
              }}
              showBleedGuides={showBleedGuides}
            />
          </div>
        </div>
      </div>
    </div>
  </AppShell>
  );
}
