"use client";

import React from "react";
import { useEditorStore } from "@/store/editor-store";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Cloud,
  Loader2,
  AlertCircle,
  Undo2,
  Redo2,
  ShieldCheck,
  Play,
  Printer,
} from "lucide-react";
import { CANVAS_PRESETS } from "@/types/document-spec";
import { cn } from "@/lib/utils";

export const StudioStatusBar: React.FC = () => {
  const {
    document,
    activePageIndex,
    setActivePage,
    addPage,
    zoomLevel,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    saveStatus,
    setPresenterMode,
    qualityReport,
    setQualityModalOpen,
  } = useEditorStore();

  const totalPages = document.pages.length;
  const aspectRatio = document.canvas.aspectRatio;
  const preset = CANVAS_PRESETS[aspectRatio] || CANVAS_PRESETS["16:9"];

  const isSinglePage = totalPages === 1 && document.documentType !== "presentation";

  return (
    <footer className="h-11 w-full border-t border-border bg-card/90 backdrop-blur-md px-4 flex items-center justify-between z-20 select-none text-xs text-muted-foreground shadow-sm">
      {/* Left: Slide Pagination & Navigation or Format Badge */}
      <div className="flex items-center gap-2">
        {isSinglePage ? (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
              {document.documentType.replace("_", " ")}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Page 1 of 1
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/50">
              <button
                type="button"
                disabled={activePageIndex <= 0}
                onClick={() => setActivePage(activePageIndex - 1)}
                className="p-1 rounded hover:bg-background disabled:opacity-30 disabled:hover:bg-transparent text-foreground transition-colors"
                title="Previous Slide (Arrow Left)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 text-[11px] font-bold text-foreground min-w-[70px] text-center">
                {activePageIndex + 1} / {totalPages}
              </span>

              <button
                type="button"
                disabled={activePageIndex >= totalPages - 1}
                onClick={() => setActivePage(activePageIndex + 1)}
                className="p-1 rounded hover:bg-background disabled:opacity-30 disabled:hover:bg-transparent text-foreground transition-colors"
                title="Next Slide (Arrow Right)"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => addPage()}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/70 hover:bg-muted text-[11px] font-semibold text-foreground transition-colors"
              title="Add New Slide"
            >
              <Plus className="w-3 h-3 text-primary" />
              <span className="hidden sm:inline">Add Slide</span>
            </button>
          </>
        )}

        <div className="h-3 w-px bg-border/70 mx-1 hidden sm:block" />

        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground hidden md:inline">
          {preset.width} × {preset.height} px ({aspectRatio.replace("_", " ")})
        </span>
      </div>

      {/* Center: Save & Health Diagnostics */}
      <div className="flex items-center gap-3">
        {/* Autosave Status */}
        <div className="flex items-center gap-1 text-[11px]">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="hidden sm:inline">Saving changes...</span>
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden sm:inline">All changes saved</span>
            </span>
          )}
          {saveStatus === "offline" && (
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
              <Cloud className="w-3 h-3" />
              <span className="hidden sm:inline">Saved locally</span>
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="hidden sm:inline">Unsaved</span>
            </span>
          )}
        </div>

        {/* Quality Report Pill */}
        {qualityReport && (
          <button
            onClick={() => setQualityModalOpen(true)}
            className="hidden lg:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            title="Inspect SlideCraft Quality Metrics"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Score: {qualityReport.overallScore}%</span>
          </button>
        )}
      </div>

      {/* Right: History & Zoom Controls */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1 rounded-lg hover:bg-muted disabled:opacity-30 text-foreground transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1 rounded-lg hover:bg-muted disabled:opacity-30 text-foreground transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-3 w-px bg-border/70 mx-0.5" />

        {/* Zoom */}
        <button
          onClick={() => setZoom(Math.max(40, zoomLevel - 10))}
          className="p-1 rounded-lg hover:bg-muted text-foreground transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setZoom(100)}
          className="text-[11px] font-bold text-foreground px-1 hover:text-primary transition-colors min-w-[40px] text-center"
          title="Reset Zoom to 100%"
        >
          {zoomLevel}%
        </button>

        <button
          onClick={() => setZoom(Math.min(200, zoomLevel + 10))}
          className="p-1 rounded-lg hover:bg-muted text-foreground transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
