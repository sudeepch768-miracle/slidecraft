"use client";

export const dynamic = "force-dynamic";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import {
  Presentation,
  Image as ImageIcon,
  BarChart2,
  FileText,
  Mail,
  GitBranch,
  LineChart,
  Sparkles,
  ArrowRight,
  Search,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FormatCategory = "all" | "presentations" | "marketing" | "documents" | "data";

interface StudioFormat {
  id: string;
  route: string;
  title: string;
  category: "presentations" | "marketing" | "documents" | "data";
  categoryLabel: string;
  desc: string;
  dimensions: string;
  formats: string;
  features: string[];
  icon: any;
  badge?: string;
}

const STUDIO_FORMATS: StudioFormat[] = [
  {
    id: "presentation",
    route: "/create/presentation",
    title: "PowerPoint Deck",
    category: "presentations",
    categoryLabel: "Presentations",
    desc: "16:9 widescreen presentation slides with multi-step blueprint planner, vector layouts, speaker notes, and native PPTX/PDF export.",
    dimensions: "16:9 Widescreen (1920 × 1080 px)",
    formats: "PPTX · PDF · DOCX · PNG",
    features: ["Content Blueprint Planner", "Template & Sample PPT Import", "Speaker Notes & Citations", "Layered Backgrounds"],
    icon: Presentation,
    badge: "Full Planner",
  },
  {
    id: "poster",
    route: "/create/poster",
    title: "Poster & Banner",
    category: "marketing",
    categoryLabel: "Marketing & Creative",
    desc: "A4, A3, and display banners for college events, conferences, seminars, hackathons, and product marketing with 3mm print bleed.",
    dimensions: "A4 / A3 / A2 (300 DPI Print)",
    formats: "PDF (Print) · PNG · JPG",
    features: ["Print Bleed Guidelines (3mm)", "Event Schedule & QR Code", "Sponsor Logos Bar", "7 Mood Color Palettes"],
    icon: ImageIcon,
    badge: "Print Ready",
  },
  {
    id: "infographic",
    route: "/create/infographic",
    title: "Visual Infographic",
    category: "marketing",
    categoryLabel: "Marketing & Creative",
    desc: "Long-form vertical infographics, process milestones, comparison matrix, and statistical storytelling with responsive section blocks.",
    dimensions: "9:16 Vertical / 4:5 Portrait",
    formats: "PNG · SVG · PDF",
    features: ["Timeline & Process Flows", "Metric Callout Cards", "Comparison Grids", "Reorderable Sections"],
    icon: BarChart2,
    badge: "Data Story",
  },
  {
    id: "social",
    route: "/create/social",
    title: "Social Graphic",
    category: "marketing",
    categoryLabel: "Marketing & Creative",
    desc: "Platform-optimized graphics for Instagram Posts, Stories & Reels, LinkedIn Banners, YouTube Thumbnails, and X with safe-zone guides.",
    dimensions: "1:1 Square · 9:16 Story · 16:9 Banner",
    formats: "PNG (2x Retina) · JPG",
    features: ["Feed & Story Safe-Zone Guides", "Call-to-Action Badges", "Hashtag AI Suggestions", "Multi-Platform Presets"],
    icon: Sparkles,
    badge: "Safe-Zone Protected",
  },
  {
    id: "resume",
    route: "/create/resume",
    title: "Executive Resume & CV",
    category: "documents",
    categoryLabel: "Documents & Editorial",
    desc: "ATS-optimized curriculum vitae with strict factual accuracy, skills radar, work history chronologies, and one-to-two page limiters.",
    dimensions: "A4 / US Letter (Single/Double Page)",
    formats: "PDF · DOCX (Word) · ATS Text",
    features: ["100% ATS Safe Typography", "Strict Zero-Hallucination", "Skills & Metrics Grid", "Page Overflow Limiter"],
    icon: FileText,
    badge: "ATS Validated",
  },
  {
    id: "letter",
    route: "/create/letter",
    title: "Corporate Letter",
    category: "documents",
    categoryLabel: "Documents & Editorial",
    desc: "Executive letterhead proposals, permission applications, formal requests, and official correspondence with reference headers.",
    dimensions: "US Letter / A4 Document",
    formats: "PDF · DOCX · Print Ready",
    features: ["Formal Letterhead Branding", "Official Reference & Date Header", "Executive Sign-Off Block", "5 Tone Presets"],
    icon: Mail,
    badge: "Official Letterhead",
  },
  {
    id: "diagram",
    route: "/create/diagram",
    title: "Workflow Diagram",
    category: "data",
    categoryLabel: "Data & Diagrams",
    desc: "System architecture topologies, microservice DAGs, flowcharts, UML diagrams, decision trees, and process DAGs with connector routing.",
    dimensions: "16:9 Landscape / Custom Infinite",
    formats: "SVG Vector · PNG · PDF",
    features: ["Node-and-Connector DAG", "Directional Routing (TB / LR)", "Microservice & Cloud Topologies", "Shape Archetypes"],
    icon: GitBranch,
    badge: "Vector DAG",
  },
  {
    id: "chart",
    route: "/create/chart",
    title: "Chart Report",
    category: "data",
    categoryLabel: "Data & Diagrams",
    desc: "Analytical data visualization reports with interactive data table editing, CSV dataset upload, multi-series charts, and AI data takeaways.",
    dimensions: "16:9 Landscape Analytics",
    formats: "CSV · PNG · SVG · PDF",
    features: ["Live Data Table & CSV Import", "8 Chart Kinds (Bar/Line/Pie/etc)", "AI Data Key Insights", "Multi-KPI Cards"],
    icon: LineChart,
    badge: "Live CSV Data",
  },
];

// Realistic Miniature Previews matching actual output
const FormatVisualPreview: React.FC<{ formatId: string }> = ({ formatId }) => {
  switch (formatId) {
    case "presentation":
      return (
        <div className="w-full h-28 rounded-xl bg-muted/40 border border-border/60 p-2.5 flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
            <div className="w-20 h-1.5 rounded-full bg-primary/70" />
            <div className="w-8 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-2 rounded-lg bg-card border border-border/60 space-y-1 shadow-sm">
              <div className="w-10 h-1 rounded-full bg-primary/60" />
              <div className="w-14 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="p-2 rounded-lg bg-card border border-border/60 space-y-1 shadow-sm">
              <div className="w-12 h-1 rounded-full bg-primary/50" />
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground pt-0.5">
            <span>16:9 Deck</span>
            <span className="text-primary font-bold">10 Slides</span>
          </div>
        </div>
      );
    case "poster":
      return (
        <div className="w-full h-28 rounded-xl bg-muted/40 border border-border/60 p-2.5 flex flex-col justify-between overflow-hidden relative border-dashed">
          <div className="flex items-center justify-between">
            <div className="w-14 h-2 rounded bg-rose-500/70" />
            <div className="w-4 h-4 rounded bg-rose-500/20 flex items-center justify-center text-[7px] text-rose-500 font-bold">QR</div>
          </div>
          <div className="w-full h-10 rounded-lg bg-card border border-border/60 flex flex-col justify-center px-2.5 space-y-1 shadow-sm">
            <div className="w-24 h-1.5 rounded-full bg-foreground/70" />
            <div className="w-16 h-1 rounded-full bg-muted-foreground/40" />
          </div>
          <div className="flex justify-between items-center text-[9px] text-muted-foreground font-mono">
            <span>3mm Print Bleed</span>
            <span className="text-rose-500 font-bold">300 DPI</span>
          </div>
        </div>
      );
    case "infographic":
      return (
        <div className="w-full h-28 rounded-xl bg-muted/40 border border-border/60 p-2.5 flex items-center justify-between overflow-hidden relative">
          <div className="h-full w-1 bg-emerald-500/30 rounded-full mx-2 relative flex flex-col justify-around py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-0.5" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-0.5" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-0.5" />
          </div>
          <div className="flex-1 flex flex-col justify-around h-full pl-2 space-y-1">
            <div className="w-24 h-1.5 rounded-full bg-emerald-500/80" />
            <div className="w-28 h-1.5 rounded-full bg-muted-foreground/40" />
            <div className="w-16 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>
          <span className="text-[9px] font-mono text-emerald-500 self-end">9:16</span>
        </div>
      );
    case "social":
      return (
        <div className="w-full h-28 rounded-xl bg-muted/40 border border-border/60 p-2.5 flex flex-col justify-between overflow-hidden relative">
          <div className="w-full h-full border border-dashed border-purple-400/50 rounded-lg p-2.5 flex flex-col justify-between items-center bg-card">
            <div className="w-16 h-1.5 rounded-full bg-purple-500/60" />
            <div className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[8px] font-bold">
              Safe Zone
            </div>
            <div className="w-12 h-1 rounded-full bg-muted-foreground/40" />
          </div>
        </div>
      );
    case "resume":
      return (
        <div className="w-full h-28 rounded-xl bg-muted/40 border border-border/60 p-2.5 flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center gap-2 border-b border-border/40 pb-1">
            <div className="w-4 h-4 rounded-full bg-sky-500/30" />
            <div className="w-20 h-1.5 rounded-full bg-foreground/70" />
          </div>
          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="space-y-1">
              <div className="w-10 h-1 rounded-full bg-sky-500/60" />
              <div className="w-14 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <div className="w-12 h-1 rounded-full bg-muted-foreground/50" />
              <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
            </div>
          </div>
          <span className="text-[9px] font-mono text-sky-500">100% ATS Validated</span>
        </div>
      );
    case "letter":
      return (
        <div className="w-full h-28 rounded-xl bg-muted/40 border border-border/60 p-2.5 flex flex-col justify-between overflow-hidden relative">
          <div className="flex justify-between items-center border-b border-border/40 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-amber-500" />
            <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="space-y-1.5 py-1">
            <div className="w-full h-1 rounded-full bg-muted-foreground/35" />
            <div className="w-4/5 h-1 rounded-full bg-muted-foreground/35" />
            <div className="w-2/3 h-1 rounded-full bg-muted-foreground/35" />
          </div>
          <div className="w-10 h-1 rounded-full bg-foreground/60 self-end" />
        </div>
      );
    case "diagram":
      return (
        <div className="w-full h-28 rounded-xl bg-muted/40 border border-border/60 p-2.5 flex items-center justify-around overflow-hidden relative">
          <div className="w-8 h-7 rounded bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-[7px] text-teal-600 dark:text-teal-400 font-bold">
            Src
          </div>
          <div className="w-6 h-0.5 bg-teal-500/40 relative">
            <div className="absolute right-0 -top-0.5 w-1 h-1 border-t border-r border-teal-500 transform rotate-45" />
          </div>
          <div className="w-8 h-7 rounded bg-primary/15 border border-primary/40 flex items-center justify-center text-[7px] text-primary font-bold">
            Proc
          </div>
          <div className="w-6 h-0.5 bg-teal-500/40 relative">
            <div className="absolute right-0 -top-0.5 w-1 h-1 border-t border-r border-teal-500 transform rotate-45" />
          </div>
          <div className="w-8 h-7 rounded bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-[7px] text-emerald-600 dark:text-emerald-400 font-bold">
            Out
          </div>
        </div>
      );
    case "chart":
    default:
      return (
        <div className="w-full h-28 rounded-xl bg-muted/40 border border-border/60 p-2.5 flex items-end justify-around gap-1.5 overflow-hidden relative">
          <div className="w-4 h-8 rounded-t bg-cyan-500/40" />
          <div className="w-4 h-16 rounded-t bg-cyan-500/70" />
          <div className="w-4 h-11 rounded-t bg-cyan-500/50" />
          <div className="w-4 h-18 rounded-t bg-cyan-500" />
          <div className="w-4 h-10 rounded-t bg-cyan-500/60" />
        </div>
      );
  }
};

export default function CreateStudioHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<FormatCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFormats = useMemo(() => {
    return STUDIO_FORMATS.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <AppShell title="Creation Studio Hub" subtitle="Select canvas format">
      <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-2 sm:pt-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-between py-2 px-4 rounded-2xl bg-card border border-border/70 text-xs shadow-sm">
          <Link
            href="/dashboard"
            className="font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Dashboard
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Format</span>
            </div>
            <span className="text-muted-foreground/40 font-bold">→</span>
            <div className="flex items-center gap-1.5 text-muted-foreground/60 font-medium">
              <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Prompt & Brief</span>
            </div>
            <span className="text-muted-foreground/40 font-bold">→</span>
            <div className="flex items-center gap-1.5 text-muted-foreground/60 font-medium">
              <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Content Blueprint</span>
            </div>
            <span className="text-muted-foreground/40 font-bold">→</span>
            <div className="flex items-center gap-1.5 text-muted-foreground/60 font-medium">
              <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Visual Studio</span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-muted-foreground font-mono">
            8 Specialized Formats
          </span>
        </div>

        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Choose your canvas format
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Every format has a tailored workflow, domain configuration, content planner, and specialized canvas controls.
          </p>
        </div>

        {/* Category Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {[
              { id: "all", label: "All Formats" },
              { id: "presentations", label: "Presentations" },
              { id: "marketing", label: "Creative & Marketing" },
              { id: "documents", label: "Documents" },
              { id: "data", label: "Data & Diagrams" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as FormatCategory)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                  selectedCategory === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formats..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border/80 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Format Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredFormats.map((format) => {
            const Icon = format.icon;
            return (
              <Link
                key={format.id}
                href={format.route}
                className="group relative rounded-3xl border border-border/80 bg-card p-5 sm:p-6 flex flex-col justify-between transition-all gamma-card-hover shadow-sm hover:border-primary/50"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          {format.categoryLabel}
                        </span>
                        <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {format.title}
                        </h2>
                      </div>
                    </div>

                    {format.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {format.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {format.desc}
                  </p>

                  {/* Realistic Miniature Preview */}
                  <FormatVisualPreview formatId={format.id} />
                </div>

                {/* Card Footer with CTA affordance */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {format.dimensions}
                  </span>
                  <div className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>Select Format</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
