"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Presentation,
  FileText,
  Globe,
  Upload,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sliders,
  Palette,
  Layers,
  Zap,
  Download,
  ShieldCheck,
  Check,
  ExternalLink,
  Play,
  Copy,
  ChevronLeft,
  FileUp,
  Link2,
  Image as ImageIcon,
  BarChart2,
  Mail,
  GitBranch,
  LineChart,
  Grid,
  FileCode,
  Smartphone,
  Cpu,
  BookmarkCheck,
  Maximize2,
  Layers3,
  Menu,
  X,
  Loader2,
  PlayCircle,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import { MidnightVioletBackground } from "@/components/landing/MidnightVioletBackground";
import { DemoModal } from "@/components/landing/DemoModal";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { useAuth } from "@/components/providers/AuthProvider";

// ─── Format Definitions & Capabilities ─────────────────────────────────────────

export interface GenerationFormat {
  id: string;
  name: string;
  category: string;
  badge: string;
  ratio: string;
  icon: any;
  tagline: string;
  description: string;
  capabilities: string[];
  samplePrompt: string;
  path: string;
  gradient: string;
  accentColor: string;
  outputTypes: string[];
}

const ALL_GENERATION_FORMATS: GenerationFormat[] = [
  {
    id: "presentation",
    name: "Presentations & Pitch Decks",
    category: "Decks",
    badge: "16:9 Widescreen",
    ratio: "16:9",
    icon: Presentation,
    tagline: "Content-aware slides with 25+ layout archetypes",
    description:
      "Generate investor pitch decks, executive board briefings, all-hands decks, and technical keynotes with real metrics, timelines, and 3-card pillars.",
    capabilities: [
      "25+ Dynamic archetypes (Hero, 3-Card Grid, 4-Metric KPI, Timeline)",
      "Interactive Content Planner with slide locking & AI rewrite",
      "Native vector PPTX export — 100% editable in PowerPoint",
      "Sub-second NVIDIA FLUX.2 Klein 4B visual imagery",
    ],
    samplePrompt:
      "Series A pitch deck for an autonomous drone logistics startup: market TAM, proprietary robotics hardware, $4.2M ARR traction, and 24-month expansion roadmap.",
    path: "/create/presentation",
    gradient: "from-purple-600 via-indigo-600 to-pink-500",
    accentColor: "#8B5CF6",
    outputTypes: [".pptx", ".pdf", ".png", "Web deck"],
  },
  {
    id: "poster",
    name: "Posters & Print Banners",
    category: "Print",
    badge: "A4 / 3mm Bleed",
    ratio: "A4 Portrait",
    icon: ImageIcon,
    tagline: "High-impact, print-ready promotional posters",
    description:
      "Create hackathon announcements, research posters, product launch promos, and corporate event banners with professional typography and 3mm bleed margins.",
    capabilities: [
      "Industry-standard 3mm bleed margin for professional printing",
      "Event date pills, venue callouts, and organizer badges",
      "Dynamic QR code placement with custom target links",
      "CMYK-compatible high-contrast color palettes",
    ],
    samplePrompt:
      "Global AI & Robotics Innovation Summit 2026 poster: Nov 14-16 at Grand Auditorium, keynote speakers, hackathon track prizes, and student registration link.",
    path: "/create/poster",
    gradient: "from-rose-600 via-pink-600 to-amber-500",
    accentColor: "#EC4899",
    outputTypes: ["Print PDF", ".pptx", "High-Res PNG"],
  },
  {
    id: "infographic",
    name: "Visual Infographics",
    category: "Infographics",
    badge: "9:16 Vertical",
    ratio: "9:16 / Tall",
    icon: BarChart2,
    tagline: "High-density sequential visual stories",
    description:
      "Synthesize step-by-step processes, statistical comparisons, historical milestones, and cyclical workflows into scannable vertical infographics.",
    capabilities: [
      "Multi-step connected workflow nodes with status pills",
      "Dominant statistical KPI cards with YoY comparisons",
      "Timeline milestones with chronological progress lines",
      "Optimized for mobile scrolling, Pinterest, and newsletter embeds",
    ],
    samplePrompt:
      "Evolution of Large Language Models (2020-2026): From GPT-3 to MoE architectures, parameter efficiency breakthroughs, and inference cost reduction metrics.",
    path: "/create/infographic",
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    accentColor: "#10B981",
    outputTypes: ["Tall PNG", "Vector PDF", "Social 9:16"],
  },
  {
    id: "social",
    name: "Social Media Graphics",
    category: "Social",
    badge: "1:1 / 9:16 / 16:9",
    ratio: "Multi-Ratio",
    icon: Smartphone,
    tagline: "Thumb-stopping carousels & feed posts",
    description:
      "Craft high-converting Instagram carousels, LinkedIn thought leadership slides, YouTube thumbnails, and Twitter/X graphic cards with brand handles.",
    capabilities: [
      "Automatic safe-zone margins for Instagram, TikTok & LinkedIn",
      "Brand handle integration, custom hashtags, and action pills",
      "Bold hook headlines with subtitle proof points",
      "Batch multi-slide carousel generation",
    ],
    samplePrompt:
      "LinkedIn Carousel: 5 Architectural Lessons from scaling an AI agent cluster to 100M daily API calls without cloud cost blowouts.",
    path: "/create/social",
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    accentColor: "#A855F7",
    outputTypes: ["1:1 Post", "9:16 Story", "16:9 Thumbnail"],
  },
  {
    id: "resume",
    name: "Executive Resumes & CVs",
    category: "Career",
    badge: "ATS-Friendly A4",
    ratio: "A4 Portrait",
    icon: FileText,
    tagline: "Polished, scan-optimized career profiles",
    description:
      "Transform your experience into executive resumes, academic CVs, and technical portfolios formatted for both human reviewers and ATS parsing algorithms.",
    capabilities: [
      "ATS-compliant clean hierarchy — zero unreadable text frames",
      "Quantified achievement bullets and leadership tags",
      "Clean contact headers with LinkedIn, GitHub, and email links",
      "One-click Word (.docx) and PDF export",
    ],
    samplePrompt:
      "Executive Resume for Senior VP of Engineering: 15+ years experience leading distributed cloud infrastructure, $40M budget management, and 120-person global org.",
    path: "/create/resume",
    gradient: "from-amber-600 via-orange-600 to-red-600",
    accentColor: "#F59E0B",
    outputTypes: [".docx", "Vector PDF", "ATS Plain Text"],
  },
  {
    id: "letter",
    name: "Corporate & Formal Letters",
    category: "Correspondence",
    badge: "US Letter / A4",
    ratio: "US Letter",
    icon: Mail,
    tagline: "Formal business proposals & executive correspondence",
    description:
      "Draft polished executive cover letters, formal enterprise proposals, official memorandums, and university recommendation letters in seconds.",
    capabilities: [
      "Standard executive letterheads and sender/recipient blocks",
      "Formal editorial tone calibration from respectful to assertive",
      "Dedicated signature block with credential placeholders",
      "Export directly to Microsoft Word (.docx) with exact margins",
    ],
    samplePrompt:
      "Formal Enterprise Partnership Proposal: Proposing joint AI integration with Fortune 500 healthcare provider, pilot scope, and data governance guarantees.",
    path: "/create/letter",
    gradient: "from-teal-600 via-cyan-600 to-blue-600",
    accentColor: "#0D9488",
    outputTypes: [".docx", "Vector PDF", "Print Ready"],
  },
  {
    id: "diagram",
    name: "System Architecture & Flowcharts",
    category: "Technical",
    badge: "Vector Canvas",
    ratio: "16:9 Canvas",
    icon: GitBranch,
    tagline: "DAG pipelines, microservices & process flows",
    description:
      "Visualize cloud microservices, event-driven streaming DAGs, sequential business workflows, and decision trees with clean vector connections.",
    capabilities: [
      "Directed node connections with custom edge labels",
      "Node status indicators (Completed, Active, Milestone, Caution)",
      "Pill, rectangle, diamond, and database cylinder node shapes",
      "Export as native vector PowerPoint shapes — move and edit lines",
    ],
    samplePrompt:
      "Distributed Cloud Architecture Flowchart: Kafka event ingestion, Redis cache layer, Flink stream processing, and Snowflake analytical warehouse sync.",
    path: "/create/diagram",
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    accentColor: "#3B82F6",
    outputTypes: ["Vector PPTX", "SVG", "PNG"],
  },
  {
    id: "chart",
    name: "Living Excel-Backed Charts",
    category: "Data",
    badge: "Excel Vector",
    ratio: "16:9 Data",
    icon: LineChart,
    tagline: "Native Office charts with embedded data tables",
    description:
      "Generate multi-series bar, column, line, area, and donut charts backed by real data tables. Charts remain 100% interactive and editable in Microsoft Office.",
    capabilities: [
      "True PowerPoint chart shapes with embedded workbook data",
      "Automatic takeaway insight callouts next to every chart",
      "Multi-series comparison with custom theme color palettes",
      "Zero static screenshots — every number is editable in Excel",
    ],
    samplePrompt:
      "Q3 SaaS Revenue Performance Report: Quarterly ARR growth from Q1 2024 to Q3 2026, Net Retention Rate at 128%, and CAC payback down to 9 months.",
    path: "/create/chart",
    gradient: "from-cyan-600 via-sky-600 to-blue-700",
    accentColor: "#0284C7",
    outputTypes: ["Native PPTX", "Excel Embed", "Vector PDF"],
  },
];

const THEME_PREVIEWS = [
  {
    id: "obsidian",
    name: "Obsidian Neon",
    mode: "dark",
    bg: "#0B0F19",
    cardBg: "#111827",
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#38BDF8",
    font: "Plus Jakarta Sans",
  },
  {
    id: "warm",
    name: "Warm Editorial",
    mode: "light",
    bg: "#FAF9F6",
    cardBg: "#FFFFFF",
    primary: "#7C3AED",
    secondary: "#D946EF",
    accent: "#F59E0B",
    font: "Playfair Display",
  },
  {
    id: "electric",
    name: "Electric Blue",
    mode: "dark",
    bg: "#060B14",
    cardBg: "#0E182A",
    primary: "#0EA5E9",
    secondary: "#6366F1",
    accent: "#10B981",
    font: "Space Grotesk",
  },
  {
    id: "matcha",
    name: "Matcha Botanical",
    mode: "light",
    bg: "#F4F7F4",
    cardBg: "#FFFFFF",
    primary: "#059669",
    secondary: "#10B981",
    accent: "#D97706",
    font: "Inter",
  },
];

export default function GammaLandingPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [hasSessionCookie, setHasSessionCookie] = useState(false);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      setHasSessionCookie(
        document.cookie.includes("slidecraft_session=active") ||
        document.cookie.includes("slidecraft_auth=")
      );
    }
  }, [user]);

  const isLoggedIn = !!user || hasSessionCookie;
  const [composerTab, setComposerTab] = useState<"generate" | "paste" | "import">("generate");
  const [selectedFormat, setSelectedFormat] = useState("presentation");
  const [prompt, setPrompt] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [activeThemePreview, setActiveThemePreview] = useState(THEME_PREVIEWS[0]);
  const [activeShowcaseSlide, setActiveShowcaseSlide] = useState(0);
  const [carouselDirection, setCarouselDirection] = useState(1);
  const [activeDetailFormatId, setActiveDetailFormatId] = useState("presentation");
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const currentFormatObj =
    ALL_GENERATION_FORMATS.find((f) => f.id === selectedFormat) || ALL_GENERATION_FORMATS[0];

  const activeDetailFormat =
    ALL_GENERATION_FORMATS.find((f) => f.id === activeDetailFormatId) || ALL_GENERATION_FORMATS[0];

  const handleLaunch = (targetPrompt?: string, targetFormat?: string) => {
    setIsLaunching(true);
    const formatToUse = targetFormat || selectedFormat;
    const textToUse = targetPrompt || (composerTab === "paste" ? pasteText : prompt);
    const fmtObj =
      ALL_GENERATION_FORMATS.find((f) => f.id === formatToUse) || ALL_GENERATION_FORMATS[0];
    const finalPrompt = textToUse.trim() || fmtObj.samplePrompt;

    if (formatToUse === "presentation") {
      const params = new URLSearchParams({
        prompt: finalPrompt,
        slideCount: "10",
        depth: "in_depth",
      });
      router.push(`/planner?${params.toString()}`);
    } else {
      router.push(`${fmtObj.path}?prompt=${encodeURIComponent(finalPrompt)}`);
    }
  };

  return (
    <div className="dark relative min-h-screen w-screen flex flex-col bg-[#070914] text-[#F8FAFC] selection:bg-pink-500/30 selection:text-pink-300 overflow-x-hidden font-sans">
      {/* ─── Midnight Violet Layered Animated Background ─────────────────── */}
      <MidnightVioletBackground />

      {/* ─── 1. Minimalist Frosted Glass Navigation Bar (Floating Capsule) ─── */}
      <header className="sticky top-3 sm:top-4 z-50 w-full px-4 sm:px-6 md:px-8 max-w-6xl mx-auto transition-all">
        <div className="rounded-full border border-violet-500/20 bg-[#090b18]/75 backdrop-blur-xl px-4 sm:px-6 h-13 sm:h-14 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7C3AED] via-[#9333EA] to-[#EC4899] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-purple-500/30 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-[#F8FAFC]">SlideCraft</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#13162b] text-violet-300 border border-violet-500/30">
                  AI
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-medium text-[#A7A9BC]">
              <a
                href="#everything"
                className="hover:text-white transition-colors"
              >
                What You Can Generate
              </a>
              <a
                href="#matrix"
                className="hover:text-white transition-colors"
              >
                Capabilities
              </a>
              <a
                href="#showcase"
                className="hover:text-white transition-colors"
              >
                Card Studio
              </a>
              <a
                href="#theming"
                className="hover:text-white transition-colors"
              >
                Themes
              </a>
              <a
                href="#faq"
                className="hover:text-white transition-colors"
              >
                FAQ
              </a>
              <Link
                href="/dashboard"
                className="hover:text-white transition-colors"
              >
                Workspace
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <ThemeToggle className="!rounded-full !w-8 !h-8 !p-0 flex items-center justify-center !bg-[#0f1430]/70 !border-violet-500/20 hover:!border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.15)]" />

            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full midnight-glass-interactive text-[#e2e4f0] hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-pink-500 text-pink-500" />
              <span>Tour</span>
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full btn-midnight-gradient text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-full midnight-glass-interactive hover:bg-rose-500/15 hover:border-rose-500/40 text-[#A7A9BC] hover:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                  title="Log out of SlideCraft"
                >
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-xs font-medium px-3.5 py-1.5 rounded-full midnight-glass-interactive text-[#A7A9BC] hover:text-white transition-all active:scale-95"
                >
                  Log in
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full btn-midnight-gradient text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full border border-violet-500/20 bg-[#0c1026]/80 hover:bg-violet-500/10 text-white transition-all cursor-pointer active:scale-90"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Animated Dropdown Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="lg:hidden border-b border-border bg-background/95 backdrop-blur-xl px-6 py-5 space-y-4 z-40"
          >
            <nav className="flex flex-col space-y-2.5 text-xs font-semibold">
              <a
                href="#everything"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>What You Can Generate</span>
              </a>
              <a
                href="#matrix"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors py-1.5"
              >
                Capabilities & Specs
              </a>
              <a
                href="#showcase"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors py-1.5"
              >
                Interactive Card Studio
              </a>
              <a
                href="#theming"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors py-1.5"
              >
                Theme Studio
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors py-1.5"
              >
                Frequently Asked Questions
              </a>
            </nav>

            <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsDemoModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary py-1.5"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Quick Tour</span>
              </button>
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Log in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. Hero Section with Signature Gamma Multi-Format Composer ───────── */}
      <main className="relative z-10 flex-1 flex flex-col">
        <section className="relative pt-14 pb-14 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto w-full text-center space-y-6">
          {/* Announcement badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/25 text-xs font-medium shadow-[0_0_15px_rgba(139,92,246,0.15)] backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>8 Visual Formats · 25+ Archetypes · 100% Vector PPTX &amp; Docx</span>
          </motion.div>

          {/* Headline matching reference image */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F8FAFC] leading-[1.08] max-w-4xl mx-auto"
          >
            A new medium for<br className="hidden sm:inline" />{" "}
            presenting ideas,{" "}
            <span className="bg-gradient-to-r from-[#EC4899] to-[#F472B6] bg-clip-text text-transparent">
              powered
            </span>
            <br />
            <span className="text-[#8B7CFF]">by </span>
            <span className="bg-gradient-to-r from-[#FB923C] to-[#F5B84B] bg-clip-text text-transparent">
              AI.
            </span>
            <span className="text-[#EC4899] animate-pulse font-light ml-0.5">|</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base sm:text-lg text-[#A7A9BC] max-w-2xl mx-auto leading-relaxed"
          >
            Generate presentations, posters, infographics, diagrams, charts, and executive documents
            in seconds. Fully responsive cards, 100% editable outside SlideCraft.
          </motion.p>

          {/* Quick Interactive Tour Trigger Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="flex items-center justify-center gap-3 pt-1"
          >
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full midnight-glass-interactive text-xs font-semibold text-[#F8FAFC] shadow-sm transition-all active:scale-95 cursor-pointer hover:border-pink-500/40"
            >
              <Play className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              <span>Explore 60-second studio overview</span>
            </button>
          </motion.div>

          {/* ─── Signature Midnight Violet Glass Generator Card ───────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="pt-2 max-w-3xl mx-auto w-full relative"
          >
            <div className="midnight-glass midnight-card-glow rounded-3xl p-3 sm:p-5 text-left transition-all relative overflow-hidden">
              {/* Subtle inner top highlight border */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent pointer-events-none" />

              {/* Top Workflow Modes Tabs: Generate / Paste in text / Import */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-violet-500/15 gap-3">
                <div className="flex items-center gap-1 p-1 bg-[#090b18]/60 rounded-full border border-violet-500/20">
                  {[
                    { id: "generate", label: "Generate", icon: Sparkles },
                    { id: "paste", label: "Paste in text", icon: FileText },
                    { id: "import", label: "Import", icon: Upload },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = composerTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setComposerTab(tab.id as any)}
                        className={cn(
                          "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer select-none",
                          isActive
                            ? "text-white"
                            : "text-[#A7A9BC] hover:text-white"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="composerActiveTabPill"
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#EC4899] to-[#F43F5E] shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Format Pills */}
                <div className="flex items-center gap-1 text-[11px] overflow-x-auto max-w-full pb-1 sm:pb-0">
                  {ALL_GENERATION_FORMATS.slice(0, 5).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setSelectedFormat(f.id);
                        if (!prompt) setPrompt(f.samplePrompt);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap active:scale-95 cursor-pointer",
                        selectedFormat === f.id
                          ? "bg-pink-500/15 text-pink-400 font-semibold border border-pink-500/40 shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                          : "text-[#A7A9BC] hover:text-white hover:bg-violet-500/10 border border-transparent"
                      )}
                    >
                      {f.name.split(" ")[0]}
                    </button>
                  ))}
                  <a
                    href="#everything"
                    className="text-[11px] text-[#A7A9BC] hover:text-pink-400 font-medium pl-1 transition-colors"
                  >
                    +3 More
                  </a>
                </div>
              </div>

              {/* Composer Input Area with Smooth Tab Crossfade */}
              <div className="py-3 min-h-[90px]">
                <AnimatePresence mode="wait">
                  {composerTab === "generate" ? (
                    <motion.div
                      key="tab-generate"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
                            e.preventDefault();
                            handleLaunch();
                          }
                        }}
                        rows={3}
                        placeholder={`Describe your ${currentFormatObj.name.toLowerCase()} (e.g. "${currentFormatObj.samplePrompt.slice(0, 90)}...")...`}
                        className="w-full text-sm sm:text-base bg-transparent border-none resize-none focus:outline-none placeholder:text-[#A7A9BC]/50 text-[#F8FAFC] leading-relaxed"
                      />
                    </motion.div>
                  ) : composerTab === "paste" ? (
                    <motion.div
                      key="tab-paste"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        rows={4}
                        placeholder="Paste rough notes, meeting transcripts, research bullet points, or document draft here..."
                        className="w-full text-xs sm:text-sm font-mono bg-transparent border-none resize-none focus:outline-none placeholder:text-[#A7A9BC]/50 text-[#F8FAFC] leading-relaxed"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="tab-import"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="py-6 text-center border-2 border-dashed border-violet-500/25 rounded-2xl bg-violet-950/20 flex flex-col items-center justify-center gap-2"
                    >
                      <FileUp className="w-8 h-8 text-pink-400 opacity-80 animate-pulse" />
                      <p className="text-xs font-semibold text-[#F8FAFC]">
                        Drop PowerPoint, Word, or PDF file to enhance
                      </p>
                      <Link
                        href="/dashboard"
                        className="text-[11px] text-pink-400 hover:underline font-medium"
                      >
                        Or import from URL in workspace →
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-2.5 border-t border-violet-500/15 gap-2">
                <div className="flex items-center gap-2 text-xs text-[#A7A9BC]">
                  <span className="text-[11px] opacity-80 flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Selected format:</span>
                    <strong className="text-[#F8FAFC]">{currentFormatObj.name}</strong>
                    <span className="opacity-60 hidden sm:inline">({currentFormatObj.ratio})</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunch()}
                  disabled={isLaunching}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full btn-midnight-gradient font-bold text-xs shadow-md transition-all flex-shrink-0 cursor-pointer active:scale-95 disabled:opacity-80"
                >
                  {isLaunching ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isLaunching
                      ? "Launching Studio..."
                      : `Generate ${currentFormatObj.category}`}
                  </span>
                  {!isLaunching && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Bottom Reference Accent: Stacked IDEAS — INTO — IMPACT on the bottom right */}
            <div className="flex items-center justify-end pt-4 pr-1 select-none">
              <div className="flex flex-col items-end text-[10px] tracking-[0.28em] uppercase text-[#A7A9BC]/50 font-mono leading-tight">
                <span>IDEAS</span>
                <span>— INTO —</span>
                <span>IMPACT</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── 3. FEATURE: EVERYTHING YOU CAN GENERATE (MAIN EXPANDED SHOWCASE) ──── */}
        <section id="everything" className="py-16 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto w-full scroll-mt-20">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Creative Capabilities</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              Everything you can generate with SlideCraft
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              SlideCraft goes far beyond simple slide decks. From print-ready posters to interactive charts
              and cloud architecture diagrams, explore the complete universe of AI generation.
            </p>
          </div>

          {/* Interactive Format Selector Tabs with Spring Highlight Pill */}
          <div className="w-full overflow-x-auto pb-3 mb-8 scrollbar-thin scrollbar-thumb-muted-foreground/20">
            <div className="flex items-center gap-2 w-max mx-auto px-1">
              {ALL_GENERATION_FORMATS.map((f) => {
                const Icon = f.icon;
                const isSelected = activeDetailFormatId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveDetailFormatId(f.id)}
                    className={cn(
                      "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border whitespace-nowrap cursor-pointer select-none active:scale-95",
                      isSelected
                        ? "border-pink-500/40 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]"
                        : "border-violet-500/15 bg-[#0c1026]/70 hover:bg-violet-500/10 text-[#B7B5C8] hover:text-[#F8FAFC]"
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="formatDetailActiveTab"
                        className="absolute inset-0 rounded-xl bg-pink-500/15 ring-1 ring-pink-500/35 shadow-xs"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{f.name.split(" &")[0]}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Format Spotlight Card with Smooth Crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDetailFormat.id}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="rounded-3xl border border-violet-500/20 bg-[#0c1026]/85 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden"
            >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Details, Capabilities, and Launch */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="gamma-tag">
                    {activeDetailFormat.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground font-medium">
                    {activeDetailFormat.ratio}
                  </span>
                  <div className="flex gap-1">
                    {activeDetailFormat.outputTypes.map((ext) => (
                      <span
                        key={ext}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {activeDetailFormat.name}
                  </h3>
                  <p className="text-sm font-semibold text-primary">
                    {activeDetailFormat.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {activeDetailFormat.description}
                  </p>
                </div>

                {/* Key Architectural Features */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Included Capabilities:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeDetailFormat.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Prompt Box */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Sample Prompt
                  </span>
                  <p className="text-xs italic text-foreground leading-relaxed">
                    &quot;{activeDetailFormat.samplePrompt}&quot;
                  </p>
                </div>

                {/* Action CTA Row */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleLaunch(activeDetailFormat.samplePrompt, activeDetailFormat.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full btn-midnight-gradient font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate this format with AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={activeDetailFormat.path}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full gamma-btn-secondary text-xs font-semibold transition-all"
                  >
                    <span>Configure Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Mockup Container */}
              <div className="lg:col-span-5 h-72 sm:h-80 w-full rounded-2xl bg-muted/30 border border-border p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
                {/* Gradient Header Banner */}
                <div
                  className={cn(
                    "w-full h-24 rounded-xl bg-gradient-to-br p-3.5 text-white flex flex-col justify-between shadow-md relative overflow-hidden",
                    activeDetailFormat.gradient
                  )}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs">
                      {activeDetailFormat.category}
                    </span>
                    <span className="text-[10px] opacity-80">{activeDetailFormat.ratio}</span>
                  </div>
                  <div className="font-extrabold text-sm relative z-10 truncate">
                    {activeDetailFormat.name}
                  </div>
                </div>

                {/* Mock Card Content Blocks */}
                <div className="space-y-2.5 pt-2">
                  <div className="w-4/5 h-2 rounded-full bg-primary/40" />
                  <div className="w-full h-1.5 rounded-full bg-muted-foreground/20" />
                  <div className="w-2/3 h-1.5 rounded-full bg-muted-foreground/15" />

                  {/* Micro metric pill or flowchart node */}
                  <div className="pt-2 flex items-center gap-2">
                    <div className="flex-1 p-2 rounded-lg bg-background/80 border border-border text-left">
                      <div className="text-xs font-bold text-primary">Native Vector</div>
                      <div className="text-[9px] text-muted-foreground">Office OpenXML</div>
                    </div>
                    <div className="flex-1 p-2 rounded-lg bg-background/80 border border-border text-left">
                      <div className="text-xs font-bold text-purple-500">AI Powered</div>
                      <div className="text-[9px] text-muted-foreground">FLUX.2 4B Visuals</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </AnimatePresence>

          {/* ─── 8 Format Grid Cards Overview ──────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-10">
            {ALL_GENERATION_FORMATS.map((fmt) => {
              const Icon = fmt.icon;
              return (
                <div
                  key={fmt.id}
                  onClick={() => {
                    setActiveDetailFormatId(fmt.id);
                    const el = document.getElementById("everything");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-2xl border border-border bg-card/80 backdrop-blur-xs p-5 gamma-card-hover group cursor-pointer text-left space-y-3 shadow-xs active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground font-semibold px-2 py-0.5 rounded-md bg-muted">
                      {fmt.ratio}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {fmt.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {fmt.tagline}
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-border/60 text-[11px] font-semibold text-primary">
                    <span>Explore details</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 4. CAPABILITIES MATRIX & SPECIFICATION COMPARISON ────────────────── */}
        <section id="matrix" className="py-16 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto w-full">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Full Technical Parity
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              Format Matrix & Export Fidelity
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Every format is compiled into real native vector objects, not flattened screenshots.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold">
                    <th className="py-3.5 px-4 sm:px-6">Format Type</th>
                    <th className="py-3.5 px-4">Standard Ratio</th>
                    <th className="py-3.5 px-4">Default Scope</th>
                    <th className="py-3.5 px-4">AI Engine</th>
                    <th className="py-3.5 px-4">Export Fidelity</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {ALL_GENERATION_FORMATS.map((fmt) => (
                    <tr key={fmt.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-foreground flex items-center gap-2.5">
                        <fmt.icon className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{fmt.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-mono">
                        {fmt.ratio}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {fmt.id === "presentation" ? "5 to 20 Slides" : "1 High-Density Page"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-[10px]">
                          Groq LPU + FLUX 4B
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {fmt.outputTypes.join(" · ")}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Link
                          href={fmt.path}
                          className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                        >
                          <span>Generate</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── 5. Interactive "Cards, not slides" Showcase Deck ────────────────── */}
        <section id="showcase" className="py-16 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto w-full">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              The Canvas Evolution
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              Cards, not slides. Break free from rigid templates.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Content flows naturally without arbitrary slide boundaries. Responsive, modular, and
              interactive on any screen.
            </p>
          </div>

          {/* Interactive Card Canvas Preview */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-xl space-y-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-bold text-foreground pl-2">
                  NeuroInsight: Autonomous Diagnostics Deck
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold">
                  Card {activeShowcaseSlide + 1} of 4
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCarouselDirection(-1);
                      setActiveShowcaseSlide((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={activeShowcaseSlide === 0}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all active:scale-90 cursor-pointer disabled:cursor-not-allowed hover:bg-muted"
                    aria-label="Previous card"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCarouselDirection(1);
                      setActiveShowcaseSlide((prev) => Math.min(3, prev + 1));
                    }}
                    disabled={activeShowcaseSlide === 3}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all active:scale-90 cursor-pointer disabled:cursor-not-allowed hover:bg-muted"
                    aria-label="Next card"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Render Active Card with Smooth Directional Slide */}
            <div className="min-h-[320px] flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait" custom={carouselDirection}>
                <motion.div
                  key={activeShowcaseSlide}
                  custom={carouselDirection}
                  initial={{ opacity: 0, x: carouselDirection > 0 ? 25 : -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: carouselDirection > 0 ? -25 : 25 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="w-full"
                >
                  {activeShowcaseSlide === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
                  <div className="md:col-span-7 space-y-4 text-left">
                    <span className="gamma-tag">EXECUTIVE BRIEFING</span>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                      Decoding Neural Intent with Real-Time Latency
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Next-generation neural decoding models achieving 94.2% motor intention accuracy
                      with under 12ms end-to-end inference latency.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-muted/40 border border-border">
                        <div className="text-lg font-bold text-primary">94.2%</div>
                        <div className="text-[10px] text-muted-foreground">Decoding Precision</div>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-border">
                        <div className="text-lg font-bold text-purple-500">&lt; 12ms</div>
                        <div className="text-[10px] text-muted-foreground">Closed-Loop Latency</div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 h-64 rounded-2xl gamma-gradient-primary flex items-center justify-center p-6 text-white shadow-lg">
                    <div className="text-center space-y-2">
                      <Sparkles className="w-10 h-10 mx-auto opacity-90 animate-bounce" />
                      <div className="text-sm font-bold">Spatial-Temporal Transformer</div>
                      <div className="text-xs opacity-80">1,024 High-Density Channels</div>
                    </div>
                  </div>
                </div>
              )}

              {activeShowcaseSlide === 1 && (
                <div className="w-full space-y-6 text-left">
                  <div className="space-y-1">
                    <span className="gamma-tag">ARCHITECTURE PILLARS</span>
                    <h3 className="text-2xl font-bold text-foreground">
                      Three Core System Modalities
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { num: "01", title: "Signal Ingestion", desc: "Multi-modal temporal spike sorting with microvolt noise rejection." },
                      { num: "02", title: "Latent Manifold", desc: "Continuous manifold trajectory projection with Kalman filtering." },
                      { num: "03", title: "Actuation Interface", desc: "Sub-millisecond robotic arm actuation and sensory feedback loop." },
                    ].map((p) => (
                      <div key={p.num} className="p-5 rounded-2xl bg-muted/30 border border-border space-y-2">
                        <div className="text-xs font-black text-primary">{p.num}</div>
                        <h4 className="text-sm font-bold text-foreground">{p.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeShowcaseSlide === 2 && (
                <div className="w-full space-y-6 text-left">
                  <div className="space-y-1">
                    <span className="gamma-tag">PERFORMANCE METRICS</span>
                    <h3 className="text-2xl font-bold text-foreground">
                      Validated Clinical Benchmarks
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { val: "99.4%", label: "Channel Fidelity", delta: "+14% YoY" },
                      { val: "4.8x", label: "Inference Speedup", delta: "vs Prior SOTA" },
                      { val: "Zero", label: "Data Drift Rate", delta: "100-Hr Continuous" },
                      { val: "FDA 510(k)", label: "Clearance Pathway", delta: "Phase II Verified" },
                    ].map((m, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-muted/30 border border-border space-y-1">
                        <div className="text-2xl font-black text-foreground">{m.val}</div>
                        <div className="text-xs font-semibold text-foreground/90">{m.label}</div>
                        <div className="text-[10px] text-primary font-medium">{m.delta}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeShowcaseSlide === 3 && (
                <div className="w-full space-y-6 text-left">
                  <div className="space-y-1">
                    <span className="gamma-tag">ROADMAP</span>
                    <h3 className="text-2xl font-bold text-foreground">
                      Strategic 24-Month Execution
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      { phase: "Q1 2026", title: "Pilot Deployment", desc: "3 university clinical research centers." },
                      { phase: "Q2 2026", title: "Model Shrinkage", desc: "4-bit quantized edge inferencing." },
                      { phase: "Q4 2026", title: "Commercial Rollout", desc: "Enterprise surgical theater licensing." },
                      { phase: "2027", title: "Global Expansion", desc: "EU CE mark and multi-lingual documentation." },
                    ].map((step, sIdx) => (
                      <div key={sIdx} className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{step.phase}</div>
                        <div className="text-xs font-bold text-foreground">{step.title}</div>
                        <div className="text-[11px] text-muted-foreground">{step.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ─── 6. Interactive Theme Studio Section ──────────────────────────────── */}
        <section id="theming" className="py-16 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto w-full">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              One-Click Theming
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              Restyle your entire creation in a single click
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Never manually re-color 40 boxes. Gamma themes automatically adapt colors, typography,
              border radiuses, and contrast across all formats.
            </p>
          </div>

          {/* Theme Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {THEME_PREVIEWS.map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setActiveThemePreview(th)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border cursor-pointer",
                  activeThemePreview.id === th.id
                    ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                    : "border-border bg-card hover:bg-muted text-muted-foreground"
                )}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/20 inline-block"
                  style={{ backgroundColor: th.primary }}
                />
                <span>{th.name}</span>
              </button>
            ))}
          </div>

          {/* Live Themed Card Preview */}
          <div
            className="rounded-3xl p-8 transition-colors duration-300 border shadow-2xl max-w-3xl mx-auto text-left"
            style={{
              backgroundColor: activeThemePreview.bg,
              borderColor: `${activeThemePreview.primary}30`,
              color: activeThemePreview.mode === "dark" ? "#F8FAFC" : "#0F172A",
              fontFamily: activeThemePreview.font,
            }}
          >
            <div
              className="p-6 rounded-2xl border shadow-lg space-y-4"
              style={{
                backgroundColor: activeThemePreview.cardBg,
                borderColor: `${activeThemePreview.primary}20`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${activeThemePreview.primary}15`,
                    color: activeThemePreview.primary,
                  }}
                >
                  {activeThemePreview.name} Preview
                </span>
                <span className="text-xs opacity-60">Font: {activeThemePreview.font}</span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight">
                Fluid design systems with zero manual pixel-pushing
              </h3>

              <p className="text-xs leading-relaxed opacity-80">
                Colors, fonts, and borders harmonize automatically. When you switch to a dark
                palette, text colors invert and contrast is dynamically calibrated to WCAG standards.
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: activeThemePreview.primary }}
                >
                  Primary Action
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors"
                  style={{
                    borderColor: `${activeThemePreview.primary}40`,
                    color: activeThemePreview.primary,
                  }}
                >
                  Secondary Outline
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. Interactive Accordion FAQ ─────────────────────────────────────── */}
        <LandingFaq />

        {/* ─── 8. Final Call to Action ─────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto w-full text-center space-y-6">
          <div className="p-8 sm:p-12 rounded-3xl midnight-glass midnight-card-glow border border-violet-500/25 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-[#9333EA] to-[#EC4899] text-white flex items-center justify-center mx-auto shadow-md shadow-purple-500/30">
              <Sparkles className="w-6 h-6" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F8FAFC] tracking-tight">
              Ready to generate your first creation?
            </h2>

            <p className="text-sm sm:text-base text-[#B7B5C8] max-w-xl mx-auto leading-relaxed">
              Join millions of creators generating presentations, posters, infographics, and technical diagrams at the speed of thought.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-full btn-midnight-gradient font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get started for free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-full midnight-glass-interactive text-sm font-semibold text-[#F8FAFC] transition-all"
              >
                Sign in to workspace
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── 8. Minimalist Midnight Footer ────────────────────────────────────── */}
      <footer className="relative z-10 w-full border-t border-violet-500/15 bg-[#050711] py-10 px-4 sm:px-8 text-xs text-[#B7B5C8]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center font-bold text-[10px]">
              ✦
            </div>
            <span className="font-bold text-[#F8FAFC]">SlideCraft AI</span>
            <span className="text-[11px] opacity-60">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#everything" className="hover:text-white transition-colors">
              Formats
            </a>
            <a href="#matrix" className="hover:text-white transition-colors">
              Capabilities
            </a>
            <a href="#theming" className="hover:text-white transition-colors">
              Themes
            </a>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Workspace
            </Link>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="hover:text-rose-400 text-rose-500 hover:underline transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </footer>

      {/* ─── Interactive Architecture & Product Tour Modal ────────────────────── */}
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}
