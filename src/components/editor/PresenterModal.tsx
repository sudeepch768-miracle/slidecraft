"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import { PageRenderer } from "./PageRenderer";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Expand,
  Shrink,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const PresenterModal: React.FC = () => {
  const {
    document,
    activePageIndex,
    setActivePage,
    isPresenterMode,
    setPresenterMode,
    projectId,
  } = useEditorStore();

  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fitMode, setFitMode] = useState<"fit" | "fill">("fit");
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrev = useCallback(() => {
    if (activePageIndex > 0) setActivePage(activePageIndex - 1);
  }, [activePageIndex, setActivePage]);

  const handleNext = useCallback(() => {
    if (activePageIndex < document.pages.length - 1) {
      setActivePage(activePageIndex + 1);
    }
  }, [activePageIndex, document.pages.length, setActivePage]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(window.document.fullscreenElement));
    };
    window.document.addEventListener("fullscreenchange", handleFsChange);
    return () => window.document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isPresenterMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showThumbnails) setShowThumbnails(false);
        else setPresenterMode(false);
      } else if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === "t") {
        setShowThumbnails((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenterMode, handleNext, handlePrev, setPresenterMode, toggleFullscreen, showThumbnails]);

  if (!isPresenterMode || document.documentType !== "presentation") return null;

  const currentPage = document.pages[activePageIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden select-none"
    >
      {/* ─── Top Minimal Bar ────────────────────────────────────────────── */}
      <div className="w-full max-w-7xl flex items-center justify-between text-white/80 z-20 px-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold tracking-wider text-white/60 uppercase">
            {document.meta?.title || "Presentation"}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
            {activePageIndex + 1} of {document.pages.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPresenterMode(false)}
            title="Exit Presentation Mode (Esc)"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>

      {/* ─── Main Centered Slide Container (Aspect 16:9) ─────────────────── */}
      <div className="flex-1 w-full flex items-center justify-center relative p-2 min-h-0">
        <div
          className={cn(
            "w-full aspect-[16/9] shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden relative flex flex-col border border-white/10 transition-all duration-200",
            fitMode === "fit" ? "max-w-6xl max-h-[78vh]" : "max-w-full max-h-[88vh]"
          )}
        >
          {currentPage && (
            <PageRenderer
              page={currentPage}
              theme={document.theme}
              totalSlides={document.pages.length}
              visualDirection={document.visualDirection}
              aspectRatio={document.canvas?.aspectRatio}
              documentType={document.documentType}
              projectId={projectId || document.id}
              documentId={document.id}
              className="w-full h-full"
            />
          )}
        </div>
      </div>

      {/* ─── Collapsible Thumbnail Drawer ───────────────────────────────── */}
      {showThumbnails && (
        <div className="w-full max-w-5xl py-3 px-4 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 text-white z-30 mb-2 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/70">
              Slide Thumbnails ({document.pages.length})
            </span>
            <button
              onClick={() => setShowThumbnails(false)}
              className="text-white/60 hover:text-white text-xs"
            >
              Close
            </button>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {document.pages.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => {
                  setActivePage(idx);
                  setShowThumbnails(false);
                }}
                className={cn(
                  "flex-shrink-0 w-36 aspect-[16/9] rounded-lg border text-left p-2 flex flex-col justify-between transition-all text-xs group",
                  activePageIndex === idx
                    ? "border-purple-400 bg-purple-950/50 ring-2 ring-purple-500/40"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30"
                )}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                  <span>#{idx + 1}</span>
                  <span className="truncate max-w-[80px]">{p.archetype.replace(/_/g, " ")}</span>
                </div>
                <span className="text-[11px] font-medium text-white/90 truncate group-hover:text-white">
                  {p.title || `Slide ${idx + 1}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Clean Floating Presentation Toolbar ─────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white border border-white/15 shadow-2xl z-20">
        <button
          onClick={handlePrev}
          disabled={activePageIndex === 0}
          title="Previous Slide (Left Arrow)"
          className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-semibold px-2">
          {activePageIndex + 1} / {document.pages.length}
        </span>

        <button
          onClick={handleNext}
          disabled={activePageIndex === document.pages.length - 1}
          title="Next Slide (Right Arrow or Space)"
          className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-white/20 mx-1" />

        <button
          onClick={() => setShowThumbnails((prev) => !prev)}
          title="Toggle Thumbnails (T)"
          className={cn(
            "p-1.5 rounded-full transition-colors",
            showThumbnails ? "bg-purple-600 text-white" : "hover:bg-white/20 text-white/80"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button
          onClick={() => setFitMode((prev) => (prev === "fit" ? "fill" : "fit"))}
          title={fitMode === "fit" ? "Fill Viewport" : "Fit Widescreen"}
          className="p-1.5 rounded-full hover:bg-white/20 text-white/80 transition-colors"
        >
          {fitMode === "fit" ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen (F)"
          className="p-1.5 rounded-full hover:bg-white/20 text-white/80 transition-colors"
        >
          {isFullscreen ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
