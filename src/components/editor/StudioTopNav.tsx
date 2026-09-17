"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { compileDocumentToPptx } from "@/lib/compiler/pptx/pptx-builder";
import { compileDocumentToDocxBlob } from "@/lib/compiler/docx/docx-builder";
import { AspectRatio, CANVAS_PRESETS, LayoutArchetype, DARK_THEME, DEFAULT_THEME, ContentElement } from "@/types/document-spec";
import { PRESET_BRAND_KITS } from "@/types/brand-kit";
import { RegenerateBackgroundModal } from "./RegenerateBackgroundModal";
import { toPng, toJpeg } from "html-to-image";
import {
  Sparkles,
  ArrowLeft,
  LayoutDashboard,
  Layers,
  Palette,
  Image as ImageIcon,
  Sliders,
  Play,
  Download,
  CheckCircle2,
  Cloud,
  Loader2,
  RefreshCw,
  History,
  X,
  Search,
  Upload,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Type,
  TrendingUp,
  BarChart2,
  Table,
  AlignLeft,
  FileSpreadsheet,
  FileText,
  FileCode,
  Printer,
  ShieldCheck,
  User,
  LogOut,
  FolderOpen,
  GitBranch,
  ExternalLink,
  Undo2,
  Redo2,
  Maximize2,
  Eye,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

export type StudioDrawerType = "content" | "design" | "blocks" | "assets" | "customize" | "export" | "format" | null;

export const StudioTopNav: React.FC = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    document,
    updateDocument,
    activePageIndex,
    setActivePage,
    addPage,
    deletePage,
    reorderPages,
    selectedElementId,
    setSelectedElement,
    updateElement,
    addElementToActivePage,
    deleteElementFromActivePage,
    updateActivePageArchetype,
    updateActivePageTitle,
    projectId,
    setProjectId,
    saveStatus,
    setPresenterMode,
    setVersionHistoryOpen,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore();

  const [activeDrawer, setActiveDrawer] = useState<StudioDrawerType>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isRegenBackgroundOpen, setIsRegenBackgroundOpen] = useState(false);

  // Asset search state
  const [imageQuery, setImageQuery] = useState("business technology");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const activePage = document.pages[activePageIndex] || document.pages[0];
  const selectedElement = activePage?.elements.find((el) => el.id === selectedElementId);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Creator";

  // Automatically open Customize drawer if user selects an element on the canvas
  useEffect(() => {
    if (selectedElementId) {
      setActiveDrawer("customize");
    }
  }, [selectedElementId]);

  // Image Search
  const handleSearchImages = async (query: string) => {
    if (!query.trim()) return;
    try {
      setIsSearching(true);
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(query)}&page=1&perPage=8`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.images || []);
      }
    } catch (err) {
      console.error("Image search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (activeDrawer === "assets" && searchResults.length === 0) {
      handleSearchImages(imageQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDrawer]);

  const handleInsertImage = (img: any) => {
    const newElement: ContentElement = {
      type: "media",
      id: `media-${Date.now()}`,
      mediaType: "image",
      url: img.url,
      caption: img.alt || "Presentation Image",
      fit: "cover",
    };
    addElementToActivePage(newElement);
    setActiveDrawer(null);
  };

  // Export handlers
  const handleExportPptx = async () => {
    try {
      setIsExporting(true);
      const pptx = await compileDocumentToPptx(document, {
        projectId: projectId || (document as any).id || "doc-export",
        documentId: (document as any).id || "doc-export",
      });
      await pptx.writeFile({
        fileName: `${(document.meta.title || "presentation").replace(/\s+/g, "_")}.pptx`,
      });
      setActiveDrawer(null);
    } catch (err: any) {
      alert(`Export notice: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      const blob = await compileDocumentToDocxBlob(document);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${(document.meta.title || "document").replace(/\s+/g, "_")}.docx`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      setActiveDrawer(null);
    } catch (err: any) {
      alert(`Word Export notice: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = async () => {
    const node = window.document.getElementById("slidecraft-canvas-node");
    if (!node) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 });
      const a = window.document.createElement("a");
      a.href = dataUrl;
      a.download = `slide-${activePageIndex + 1}.png`;
      a.click();
      setActiveDrawer(null);
    } catch (err: any) {
      alert(`Image Export notice: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJpg = async () => {
    const node = window.document.getElementById("slidecraft-canvas-node");
    if (!node) return;
    try {
      setIsExporting(true);
      const dataUrl = await toJpeg(node, { quality: 0.92, pixelRatio: 2 });
      const a = window.document.createElement("a");
      a.href = dataUrl;
      a.download = `slide-${activePageIndex + 1}.jpg`;
      a.click();
      setActiveDrawer(null);
    } catch (err: any) {
      alert(`JPEG Export notice: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = () => {
    const rows = [["Slide Number", "Title", "Archetype", "Content Summary"]];
    document.pages.forEach((p, i) => {
      const summary = p.elements.map((e: any) => e.content || e.title || e.label || "").join(" | ");
      rows.push([String(i + 1), `"${p.title.replace(/"/g, '""')}"`, p.archetype, `"${summary.replace(/"/g, '""')}"`]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = window.document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${(document.meta.title || "export").replace(/\s+/g, "_")}.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    setActiveDrawer(null);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(document, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${(document.meta.title || "spec").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveDrawer(null);
  };

  return (
    <div className="relative z-30 select-none">
      {/* 1. Minimal Top Toolbar */}
      <header className="h-14 w-full border-b border-border/80 bg-card/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-3 shadow-sm">
        {/* Left: Back Arrow, Brand & Project Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link href="/dashboard" className="flex items-center gap-1.5 group">
            <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              S
            </div>
          </Link>

          <div className="h-4 w-px bg-border/80 mx-0.5" />

          {/* Project Title Input */}
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              type="text"
              value={document.meta.title}
              onChange={(e) =>
                updateDocument((doc) => ({
                  ...doc,
                  meta: { ...doc.meta, title: e.target.value },
                }))
              }
              className="text-xs sm:text-sm font-semibold bg-transparent border-b border-transparent hover:border-border/70 focus:border-primary focus:outline-none px-1 py-0.5 max-w-[140px] sm:max-w-[220px] truncate text-foreground"
              title="Click to rename"
            />

            {/* Autosave Status */}
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Loader2 className="w-2.5 h-2.5 animate-spin text-primary" />
                <span className="hidden md:inline">Saving</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span className="hidden md:inline">Saved</span>
              </span>
            )}
            {saveStatus === "offline" && (
              <span className="flex items-center gap-1 text-[10px] text-sky-500 font-medium">
                <Cloud className="w-2.5 h-2.5" />
                <span className="hidden md:inline">Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Contextual Tool Triggers */}
        <nav className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
          {/* Outline / Slides Drawer Trigger */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === "content" ? null : "content")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
              activeDrawer === "content"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
            title="View & reorder slide outline"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Slides</span>
            <span className="text-[10px] opacity-80 font-mono">({document.pages.length})</span>
          </button>

          {/* Theme & Design Drawer Trigger */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === "design" ? null : "design")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
              activeDrawer === "design"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
            title="Brand kits, palettes & fonts"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>

          {/* Dynamic Background Regeneration Trigger */}
          <button
            type="button"
            onClick={() => setIsRegenBackgroundOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            title="Regenerate presentation background style"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Background</span>
          </button>

          {/* Add Blocks Drawer Trigger */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === "blocks" ? null : "blocks")}
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
              activeDrawer === "blocks"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
            title="Insert text, charts, and diagrams"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Blocks</span>
          </button>

          {/* Assets Drawer Trigger */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === "assets" ? null : "assets")}
            className={cn(
              "hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
              activeDrawer === "assets"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
            title="Search & insert images"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Assets</span>
          </button>

          {/* Canvas Format Selector */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === "format" ? null : "format")}
            className={cn(
              "hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              activeDrawer === "format"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
            title="Slide aspect ratio"
          >
            <span className="font-mono text-[11px] uppercase">{document.canvas.aspectRatio}</span>
          </button>
        </nav>

        {/* Right: Undo/Redo, Presenter, Export, Theme, User */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center gap-0.5">
            <button
              type="button"
              disabled={!canUndo}
              onClick={undo}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={redo}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-border/70 hidden sm:block" />

          {/* Format-Aware Action CTA: Present only for presentations; Format preview/print for others */}
          {document.documentType === "presentation" ? (
            <button
              type="button"
              onClick={() => setPresenterMode(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border/80 transition-all"
              title="Fullscreen presentation mode (F5)"
            >
              <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
              <span className="hidden sm:inline">Present</span>
            </button>
          ) : document.documentType === "poster" || document.documentType === "resume" || document.documentType === "letter" ? (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border/80 transition-all"
              title="Print / PDF Preview (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveDrawer(activeDrawer === "export" ? null : "export")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border/80 transition-all"
              title="Format Preview & Download"
            >
              <Eye className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          )}

          {/* Export Button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === "export" ? null : "export")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-lg border border-border/70 hover:bg-muted transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-primary/15 text-primary font-bold text-xs flex items-center justify-center">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.1 }}
                  onMouseLeave={() => setUserMenuOpen(false)}
                  className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl p-1.5 z-50 space-y-0.5"
                >
                  <div className="px-2.5 py-1.5 border-b border-border/60">
                    <span className="text-xs font-semibold text-foreground block truncate">{displayName}</span>
                    <span className="text-[10px] text-muted-foreground block truncate">{user?.email || "Local Workspace"}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-muted text-foreground transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/projects"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-muted text-foreground transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>My Projects</span>
                  </Link>
                  <div className="pt-1 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* 2. Sleek Docked LEFT Drawer: Slide Navigator & Outline */}
      <AnimatePresence>
        {activeDrawer === "content" && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed top-14 left-0 bottom-0 w-72 bg-card/95 backdrop-blur-md border-r border-border/80 z-40 flex flex-col shadow-xl"
          >
            <div className="p-3 border-b border-border/70 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Slide Navigator ({document.pages.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vertical Slide Thumbnails List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {document.pages.map((p, idx) => {
                const isActive = activePageIndex === idx;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActivePage(idx)}
                    className={cn(
                      "p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 gamma-card-hover",
                      isActive
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border/70 bg-background/80 hover:bg-muted/50 hover:border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        Slide {idx + 1}
                      </span>
                      <button
                        type="button"
                        disabled={document.pages.length <= 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(idx);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-rose-500 disabled:opacity-20"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate block">
                      {p.title || `Untitled Slide ${idx + 1}`}
                    </span>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-primary">
                      {p.archetype}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Slide Button */}
            <div className="p-3 border-t border-border/70 bg-muted/20">
              <button
                type="button"
                onClick={() => addPage()}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 3. Sleek Docked RIGHT Drawer: Theme, Blocks, Assets, Customize, Export, Format */}
      <AnimatePresence>
        {activeDrawer && activeDrawer !== "content" && (
          <motion.aside
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed top-14 right-0 bottom-0 w-80 sm:w-96 bg-card/95 backdrop-blur-md border-l border-border/80 z-40 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-border/70 flex items-center justify-between bg-muted/20">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {activeDrawer === "design" && "Theme & Brand Kits"}
                {activeDrawer === "blocks" && "Insert Blocks & Layouts"}
                {activeDrawer === "assets" && "Curated Image Assets"}
                {activeDrawer === "customize" && "Element Properties"}
                {activeDrawer === "export" && "Export & Share"}
                {activeDrawer === "format" && "Canvas Dimensions"}
              </span>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* THEME & DESIGN */}
              {activeDrawer === "design" && (
                <div className="space-y-4">
                  {/* Dynamic Background Engine Card */}
                  <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                        <span>Dynamic Background</span>
                      </div>
                      {document.visualDirection && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                          {document.visualDirection.styleFamily.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Procedural gradients, ambient lighting, and subtle decorative framing generated for this presentation.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsRegenBackgroundOpen(true)}
                      className="w-full py-2 px-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 shadow hover:bg-primary/90 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate Background Style
                    </button>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-foreground block mb-2">Brand Kits</span>
                    <div className="space-y-2">
                      {PRESET_BRAND_KITS.map((kit, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            updateDocument((doc) => ({
                              ...doc,
                              theme: {
                                ...doc.theme,
                                colors: kit.colorPalette,
                                typography: kit.typography,
                                styleTokens: kit.styleTokens,
                              },
                            }));
                          }}
                          className="w-full p-2.5 rounded-xl border border-border/70 bg-muted/20 hover:border-primary text-left transition-all group"
                        >
                          <span className="text-xs font-bold text-foreground block mb-1">{kit.name}</span>
                          <div className="flex items-center gap-1 h-3.5 rounded overflow-hidden border border-border/60">
                            <div className="flex-1 h-full" style={{ backgroundColor: kit.colorPalette.primary }} />
                            <div className="flex-1 h-full" style={{ backgroundColor: kit.colorPalette.secondary }} />
                            <div className="flex-1 h-full" style={{ backgroundColor: kit.colorPalette.accent }} />
                            <div className="flex-1 h-full" style={{ backgroundColor: kit.colorPalette.surface }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/60">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={document.theme.colors.primary}
                          onChange={(e) =>
                            updateDocument((doc) => ({
                              ...doc,
                              theme: {
                                ...doc.theme,
                                colors: { ...doc.theme.colors, primary: e.target.value },
                              },
                            }))
                          }
                          className="w-8 h-8 rounded border border-border cursor-pointer"
                        />
                        <span className="text-xs font-mono font-semibold">{document.theme.colors.primary}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">Heading Font</label>
                      <select
                        value={document.theme.typography.headingFont}
                        onChange={(e) =>
                          updateDocument((doc) => ({
                            ...doc,
                            theme: {
                              ...doc.theme,
                              typography: { ...doc.theme.typography, headingFont: e.target.value },
                            },
                          }))
                        }
                        className="w-full text-xs p-2 rounded-xl border border-border bg-card text-foreground"
                      >
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                        <option value="Inter">Inter (Swiss Neutral)</option>
                        <option value="Playfair Display">Playfair Display (Editorial Serif)</option>
                        <option value="Montserrat">Montserrat (Bold Punchy)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech Future)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* BLOCKS & INSERTERS */}
              {activeDrawer === "blocks" && (
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    Click an element to append to active slide
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: "Heading",
                        icon: Type,
                        action: () =>
                          addElementToActivePage({
                            type: "text",
                            id: `txt-${Date.now()}`,
                            variant: "h2",
                            align: "left",
                            content: "Strategic Objective",
                          }),
                      },
                      {
                        label: "Paragraph",
                        icon: AlignLeft,
                        action: () =>
                          addElementToActivePage({
                            type: "text",
                            id: `para-${Date.now()}`,
                            variant: "body",
                            align: "left",
                            content: "Detailed operational observations contextualizing key performance milestones.",
                          }),
                      },
                      {
                        label: "KPI Metric",
                        icon: TrendingUp,
                        action: () =>
                          addElementToActivePage({
                            type: "metric",
                            id: `kpi-${Date.now()}`,
                            value: "+48%",
                            label: "Annual Revenue Growth",
                            delta: "+12.4%",
                            trend: "up",
                          }),
                      },
                      {
                        label: "Column Chart",
                        icon: BarChart2,
                        action: () =>
                          addElementToActivePage({
                            type: "chart",
                            id: `chart-${Date.now()}`,
                            chartType: "column",
                            title: "Quarterly Performance",
                            labels: ["Q1", "Q2", "Q3", "Q4"],
                            showLegend: true,
                            datasets: [{ name: "Target", data: [120, 160, 210, 290] }],
                          }),
                      },
                      {
                        label: "Process Flow",
                        icon: GitBranch,
                        action: () =>
                          addElementToActivePage({
                            type: "diagram",
                            id: `diag-${Date.now()}`,
                            diagramType: "process_steps",
                            nodes: [
                              { id: "step-1", label: "Discovery", status: "completed" },
                              { id: "step-2", label: "Processing", status: "active" },
                              { id: "step-3", label: "Deployment", status: "pending" },
                            ],
                            connections: [
                              { fromId: "step-1", toId: "step-2", connectionType: "directed" },
                              { fromId: "step-2", toId: "step-3", connectionType: "directed" },
                            ],
                          }),
                      },
                      {
                        label: "Event Block",
                        icon: Layers,
                        action: () =>
                          addElementToActivePage({
                            type: "event_details",
                            id: `evt-${Date.now()}`,
                            date: "Friday, Nov 20, 2026",
                            time: "10:00 AM - 4:00 PM",
                            venue: "Grand Auditorium Hall",
                          }),
                      },
                    ].map((item, i) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            item.action();
                            setActiveDrawer(null);
                          }}
                          className="p-3 rounded-xl border border-border/80 bg-muted/20 hover:border-primary/50 text-left flex flex-col gap-1.5 transition-all gamma-card-hover"
                        >
                          <ItemIcon className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold text-foreground">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ASSETS / IMAGE SEARCH + FLUX GENERATION */}
              {activeDrawer === "assets" && (
                <AssetsDrawerContent
                  imageQuery={imageQuery}
                  setImageQuery={setImageQuery}
                  searchResults={searchResults}
                  isSearching={isSearching}
                  handleSearchImages={handleSearchImages}
                  handleInsertImage={handleInsertImage}
                  onInsertGeneratedImage={(url: string) => {
                    const newElement: ContentElement = {
                      type: "media",
                      id: `flux-${Date.now()}`,
                      mediaType: "image",
                      url,
                      caption: "AI-Generated Image",
                      fit: "cover",
                    };
                    addElementToActivePage(newElement);
                    setActiveDrawer(null);
                  }}
                  documentFormat={document.documentType ?? "presentation"}
                  projectId={projectId ?? undefined}
                />
              )}


              {/* CUSTOMIZE ELEMENT OR SLIDE ARCHETYPE */}
              {activeDrawer === "customize" && (
                <div>
                  {selectedElement ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <span className="text-xs font-bold text-foreground">
                          {selectedElement.type.toUpperCase()}
                        </span>
                        <button
                          onClick={() => {
                            deleteElementFromActivePage(selectedElement.id);
                            setSelectedElement(null);
                          }}
                          className="text-xs text-rose-500 font-semibold hover:underline"
                        >
                          Delete Element
                        </button>
                      </div>

                      {selectedElement.type === "text" && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-foreground block">Text Content</label>
                          <textarea
                            value={(selectedElement as any).content || ""}
                            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                            rows={4}
                            className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground"
                          />
                        </div>
                      )}

                      {selectedElement.type === "metric" && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Value</label>
                            <input
                              type="text"
                              value={(selectedElement as any).value || ""}
                              onChange={(e) => updateElement(selectedElement.id, { value: e.target.value } as any)}
                              className="w-full text-xs p-2 rounded-lg border border-border bg-card text-foreground font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Label</label>
                            <input
                              type="text"
                              value={(selectedElement as any).label || ""}
                              onChange={(e) => updateElement(selectedElement.id, { label: e.target.value } as any)}
                              className="w-full text-xs p-2 rounded-lg border border-border bg-card text-foreground"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-foreground block">
                        Change Slide #{activePageIndex + 1} Layout Archetype
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "hero_title", label: "Hero Title" },
                          { id: "four_metric_dashboard", label: "4 Metrics" },
                          { id: "three_card_grid", label: "3 Cards" },
                          { id: "two_column_split", label: "2 Columns" },
                          { id: "comparison_table", label: "Comparison" },
                          { id: "process_flowchart", label: "Process Flow" },
                          { id: "data_chart_focus", label: "Data Chart" },
                        ].map((arch) => (
                          <button
                            key={arch.id}
                            type="button"
                            onClick={() => {
                              updateActivePageArchetype(arch.id);
                              setActiveDrawer(null);
                            }}
                            className={cn(
                              "p-2.5 rounded-xl border text-center text-xs font-semibold transition-all",
                              activePage?.archetype === arch.id
                                ? "border-primary bg-primary/10 text-primary font-bold"
                                : "border-border/80 bg-muted/20 hover:bg-muted/60 text-foreground"
                            )}
                          >
                            {arch.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EXPORT OPTIONS */}
              {activeDrawer === "export" && (
                <div className="space-y-2.5">
                  <button
                    onClick={handleExportPptx}
                    disabled={isExporting}
                    className="w-full p-3 rounded-2xl border border-border/80 hover:border-primary bg-muted/20 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-foreground">PowerPoint (.pptx)</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">Native vector shapes and editable slides</span>
                  </button>

                  <button
                    onClick={handleExportDocx}
                    disabled={isExporting}
                    className="w-full p-3 rounded-2xl border border-border/80 hover:border-primary bg-muted/20 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-sky-500" />
                      <span className="text-xs font-bold text-foreground">Word Document (.docx)</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">ATS-friendly formatted document</span>
                  </button>

                  <button
                    onClick={handleExportPng}
                    disabled={isExporting}
                    className="w-full p-3 rounded-2xl border border-border/80 hover:border-primary bg-muted/20 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-foreground">PNG Slide (.png)</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">2x high-resolution raster image</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveDrawer(null);
                      window.print();
                    }}
                    className="w-full p-3 rounded-2xl border border-border/80 hover:border-primary bg-muted/20 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Printer className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-foreground">Print / PDF</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">Print-ready document</span>
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="w-full p-3 rounded-2xl border border-border/80 hover:border-primary bg-muted/20 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Table className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-bold text-foreground">Export CSV</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">Structured table data</span>
                  </button>
                </div>
              )}

              {/* FORMAT OPTIONS */}
              {activeDrawer === "format" && (
                <div className="space-y-2">
                  {[
                    { ar: "16:9", label: "16:9 Widescreen", desc: "1920 × 1080 px (Standard)" },
                    { ar: "4:3", label: "4:3 Classic", desc: "1024 × 768 px" },
                    { ar: "1:1", label: "1:1 Square", desc: "1080 × 1080 px (Social)" },
                    { ar: "9:16", label: "9:16 Vertical", desc: "1080 × 1920 px (Mobile / Infographic)" },
                    { ar: "A4_portrait", label: "A4 Portrait", desc: "Print (8.3 × 11.7 in)" },
                    { ar: "US_letter", label: "US Letter", desc: "Executive (8.5 × 11 in)" },
                  ].map((fmt) => (
                    <button
                      key={fmt.ar}
                      type="button"
                      onClick={() => {
                        updateDocument((doc) => ({
                          ...doc,
                          canvas: { ...doc.canvas, aspectRatio: fmt.ar as AspectRatio },
                        }));
                        setActiveDrawer(null);
                      }}
                      className={cn(
                        "w-full p-2.5 rounded-xl border text-left transition-all",
                        document.canvas.aspectRatio === fmt.ar
                          ? "border-primary bg-primary/10 text-foreground font-semibold"
                          : "border-border/80 bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-xs font-bold block text-foreground">{fmt.label}</span>
                      <span className="text-[10px] opacity-75">{fmt.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Dynamic Background Regeneration Modal */}
      <RegenerateBackgroundModal
        isOpen={isRegenBackgroundOpen}
        onClose={() => setIsRegenBackgroundOpen(false)}
      />
    </div>
  );
};

// ─── AssetsDrawerContent ──────────────────────────────────────────────────────
// Tabbed panel: "Search" (Unsplash) | "Generate" (NVIDIA FLUX)
// Isolated into its own component so that FLUX generation state does NOT
// re-render the parent and does NOT re-trigger on drawer open.

interface AssetsDrawerContentProps {
  imageQuery: string;
  setImageQuery: (q: string) => void;
  searchResults: any[];
  isSearching: boolean;
  handleSearchImages: (q: string) => void;
  handleInsertImage: (img: any) => void;
  onInsertGeneratedImage: (url: string) => void;
  documentFormat: string;
  projectId?: string;
}

type AssetsTab = "search" | "generate";

const ASPECT_RATIO_OPTIONS = [
  { value: "16:9",  label: "16:9 — Widescreen" },
  { value: "1:1",   label: "1:1 — Square" },
  { value: "9:16",  label: "9:16 — Portrait" },
  { value: "4:3",   label: "4:3 — Classic" },
  { value: "3:4",   label: "3:4 — Poster" },
  { value: "3:2",   label: "3:2 — Photo" },
];

const FORMAT_ASPECT_DEFAULTS: Record<string, string> = {
  presentation: "16:9",
  poster:        "3:4",
  infographic:   "9:16",
  social:        "1:1",
  resume:        "3:4",
  letter:        "3:4",
  diagram:       "16:9",
};

function AssetsDrawerContent({
  imageQuery,
  setImageQuery,
  searchResults,
  isSearching,
  handleSearchImages,
  handleInsertImage,
  onInsertGeneratedImage,
  documentFormat,
  projectId,
}: AssetsDrawerContentProps) {
  const [tab, setTab] = React.useState<AssetsTab>("search");

  // FLUX state — all local, never synced to parent, never resets on re-render
  const [fluxPrompt, setFluxPrompt] = React.useState("");
  const [fluxNegative, setFluxNegative] = React.useState("");
  const [fluxQuality, setFluxQuality] = React.useState<"draft" | "standard" | "high">("standard");
  const [fluxAspect, setFluxAspect] = React.useState<string>(
    FORMAT_ASPECT_DEFAULTS[documentFormat] ?? "16:9"
  );
  const [fluxGenerating, setFluxGenerating] = React.useState(false);
  const [fluxImage, setFluxImage] = React.useState<{ url: string; width: number; height: number } | null>(null);
  const [fluxError, setFluxError] = React.useState<string | null>(null);
  const [fluxRetryable, setFluxRetryable] = React.useState(false);

  // Track the last generated prompt+settings to prevent duplicate fetches
  const lastRequestKey = React.useRef<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const requestKey = `${fluxPrompt.trim()}|${fluxQuality}|${fluxAspect}`;

  const handleGenerate = async () => {
    if (!fluxPrompt.trim() || fluxGenerating) return;
    if (requestKey === lastRequestKey.current && fluxImage) return; // exact duplicate

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFluxGenerating(true);
    setFluxError(null);
    setFluxImage(null);

    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fluxPrompt.trim(),
          negativePrompt: fluxNegative.trim() || undefined,
          aspectRatio: fluxAspect,
          quality: fluxQuality,
          projectId,
          format: documentFormat,
        }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const errCode = data.error?.code ?? "UNKNOWN";
        const msg = data.error?.message ?? "Image generation failed.";
        setFluxError(
          errCode === "CONFIG_ERROR"
            ? "NVIDIA API key is not configured. Add NVIDIA_API_KEY to .env.local and restart the server."
            : msg
        );
        setFluxRetryable(data.error?.retryable ?? false);
        return;
      }

      lastRequestKey.current = requestKey;
      setFluxImage({ url: data.url, width: data.width, height: data.height });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setFluxError("Network error. Please try again.");
      setFluxRetryable(true);
    } finally {
      setFluxGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
        <button
          type="button"
          onClick={() => setTab("search")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
            tab === "search"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Search className="w-3.5 h-3.5" />
          Search
        </button>
        <button
          type="button"
          onClick={() => setTab("generate")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
            tab === "generate"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          Generate
        </button>
      </div>

      {/* Search Tab */}
      {tab === "search" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={imageQuery}
                onChange={(e) => setImageQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchImages(imageQuery)}
                placeholder="Search imagery..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-card border border-border text-foreground"
              />
            </div>
            <button
              onClick={() => handleSearchImages(imageQuery)}
              disabled={isSearching}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {searchResults.map((img, i) => (
              <div
                key={i}
                onClick={() => handleInsertImage(img)}
                className="group relative rounded-xl overflow-hidden border border-border hover:border-primary cursor-pointer aspect-video bg-muted"
              >
                <img
                  src={img.thumbUrl || img.url}
                  alt={img.alt || "Asset"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white text-[9px]">
                  <span>Click to insert</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate with FLUX Tab */}
      {tab === "generate" && (
        <div className="space-y-3">
          {/* Header badge */}
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-violet-700 dark:text-violet-300 block">NVIDIA FLUX</span>
              <span className="text-[10px] text-muted-foreground">AI image generation · server-side</span>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Image Prompt</label>
            <textarea
              value={fluxPrompt}
              onChange={(e) => setFluxPrompt(e.target.value)}
              rows={3}
              placeholder="A serene mountain landscape at golden hour, photorealistic, 8K..."
              className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
          </div>

          {/* Negative Prompt (collapsible) */}
          <details className="group">
            <summary className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none list-none flex items-center gap-1">
              <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
              Negative Prompt (optional)
            </summary>
            <textarea
              value={fluxNegative}
              onChange={(e) => setFluxNegative(e.target.value)}
              rows={2}
              placeholder="blurry, low quality, watermark, text, artifacts..."
              className="mt-1.5 w-full text-xs p-2 rounded-xl border border-border bg-card text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
          </details>

          {/* Quality + Aspect */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Quality</label>
              <select
                value={fluxQuality}
                onChange={(e) => setFluxQuality(e.target.value as "draft" | "standard" | "high")}
                className="w-full text-xs p-1.5 rounded-xl border border-border bg-card text-foreground"
              >
                <option value="draft">Draft (fast)</option>
                <option value="standard">Standard</option>
                <option value="high">High (slow)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Aspect</label>
              <select
                value={fluxAspect}
                onChange={(e) => setFluxAspect(e.target.value)}
                className="w-full text-xs p-1.5 rounded-xl border border-border bg-card text-foreground"
              >
                {ASPECT_RATIO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!fluxPrompt.trim() || fluxGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm",
              fluxPrompt.trim() && !fluxGenerating
                ? "bg-violet-600 hover:bg-violet-700 text-white"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {fluxGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating with FLUX…
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Image
              </>
            )}
          </button>

          {/* Error State */}
          {fluxError && (
            <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{fluxError}</p>
              {fluxRetryable && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 underline"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Generated Image Preview */}
          {fluxImage && !fluxGenerating && (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden border border-violet-500/30 bg-muted">
                <img
                  src={fluxImage.url}
                  alt="FLUX generated image"
                  className="w-full object-contain max-h-48"
                />
                <div className="absolute top-2 right-2 bg-violet-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  FLUX
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onInsertGeneratedImage(fluxImage.url)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Insert into Slide
                </button>
                <button
                  type="button"
                  onClick={() => { setFluxImage(null); lastRequestKey.current = null; }}
                  className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground text-center">
                {fluxImage.width}×{fluxImage.height}px · NVIDIA FLUX · server-side
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
