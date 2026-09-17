"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Check, Sparkles, Sliders, Palette, Layers } from "lucide-react";
import { VisualDirection } from "@/types/visual-direction";
import {
  generateVisualDirection,
  visualDirectionToThemeSpec,
  createSlideBackgroundFromVisualDirection,
} from "@/lib/ai/visual-direction-engine";
import { visualDirectionTracer } from "@/lib/ai/visual-direction-tracer";
import { useEditorStore } from "@/store/editor-store";
import { SlideBackgroundLayer } from "./SlideBackgroundLayer";

interface RegenerateBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PREFERRED_STYLE_STORAGE_KEY = "slidecraft_preferred_style";

export const RegenerateBackgroundModal: React.FC<RegenerateBackgroundModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { document, updateDocument, activePageIndex, projectId } = useEditorStore();
  const [candidate, setCandidate] = useState<VisualDirection | null>(null);
  const [reuseForFuture, setReuseForFuture] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if a preferred style was already saved
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(PREFERRED_STYLE_STORAGE_KEY);
      if (saved) {
        setReuseForFuture(true);
      }
    }
  }, []);

  // Generate an initial candidate on modal open
  useEffect(() => {
    if (isOpen) {
      generateCandidate();
    }
  }, [isOpen]);

  const generateCandidate = () => {
    setIsGenerating(true);
    try {
      const newVd = generateVisualDirection(
        document.meta.title || "Professional Presentation",
        {
          seed: `manual-regen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        }
      );
      setCandidate(newVd);
    } catch (err) {
      console.warn("Failed to generate candidate style:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyStyle = () => {
    if (!candidate) return;

    // 1. Convert candidate VisualDirection to ThemeSpec
    const newTheme = visualDirectionToThemeSpec(candidate, document.theme.mode);

    // 2. Update document and slide background specs while preserving all content & layout archetypes
    updateDocument((doc) => {
      const updatedPages = doc.pages.map((page) => ({
        ...page,
        backgroundSpec: createSlideBackgroundFromVisualDirection(
          candidate,
          page.archetype,
          page.pageNumber,
          doc.pages.length
        ),
      }));

      return {
        ...doc,
        visualDirection: candidate,
        theme: newTheme,
        pages: updatedPages,
      };
    });

    // 3. Store in localStorage if user toggled "Reuse this style"
    if (typeof window !== "undefined") {
      if (reuseForFuture) {
        localStorage.setItem(PREFERRED_STYLE_STORAGE_KEY, JSON.stringify(candidate));
      } else {
        localStorage.removeItem(PREFERRED_STYLE_STORAGE_KEY);
      }
    }

    // 4. Record trace
    visualDirectionTracer.recordTrace({
      projectId: projectId || (document as any).id || "doc-regen",
      documentId: (document as any).id || "doc-regen",
      visualDirectionId: candidate.id,
      variationSeed: candidate.variationSeed,
      styleFamily: candidate.styleFamily,
      stage: "VISUAL_DIRECTION_CREATED",
      generatedAtStage: "RegenerateBackgroundModal",
      consumedBy: "User Background Regeneration",
      metadata: { action: "keep_this_style", reuseForFuture },
    });

    onClose();
  };

  if (!isOpen) return null;

  const activePage = document.pages[activePageIndex] || document.pages[0];
  const candidateTheme = candidate
    ? visualDirectionToThemeSpec(candidate, document.theme.mode)
    : document.theme;
  const previewBgSpec = candidate && activePage
    ? createSlideBackgroundFromVisualDirection(candidate, activePage.archetype, activePage.pageNumber, document.pages.length)
    : activePage?.backgroundSpec;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Regenerate Background Style</h3>
                <p className="text-xs text-muted-foreground">
                  Explore fresh procedural color harmonies, dynamic gradients, and ambient lighting
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {candidate && (
              <>
                {/* Live Mini Preview Canvas */}
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border/70 shadow-inner flex flex-col justify-between p-6">
                  {/* Procedural Dynamic Background */}
                  <SlideBackgroundLayer
                    backgroundSpec={previewBgSpec}
                    visualDirection={candidate}
                    theme={candidateTheme}
                  />

                  {/* Content Preview Mock */}
                  <div className="relative z-10">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${candidateTheme.colors.secondary}20`,
                        color: candidateTheme.colors.secondary,
                      }}
                    >
                      {activePage?.badge || "Live Style Preview"}
                    </span>
                    <h4
                      className="text-lg md:text-xl font-black mt-2 tracking-tight"
                      style={{ color: candidateTheme.colors.textPrimary }}
                    >
                      {activePage?.title || "Neural Signal Synthesis"}
                    </h4>
                    <p
                      className="text-xs mt-1 max-w-md line-clamp-2"
                      style={{ color: candidateTheme.colors.textSecondary }}
                    >
                      {activePage?.subtitle || "Dynamic background adapts without altering editable content or layout structure."}
                    </p>
                  </div>

                  {/* Footer metadata in preview */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono opacity-70 border-t pt-2" style={{ borderColor: `${candidateTheme.colors.border}40`, color: candidateTheme.colors.textSecondary }}>
                    <span>{candidate.styleFamily.replace(/_/g, " ").toUpperCase()}</span>
                    <span>Seed: {candidate.variationSeed.slice(0, 8)}...</span>
                  </div>
                </div>

                {/* Style Breakdown Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Style Family</span>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {candidate.styleFamily.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Color Palette</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: candidate.colors.primary }} title="Primary" />
                      <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: candidate.colors.secondary }} title="Secondary" />
                      <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: candidate.colors.accent }} title="Accent" />
                      <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: candidate.colors.background }} title="Background" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Gradient Angle</span>
                    <span className="text-xs font-semibold text-foreground">
                      {candidate.gradient.angleDeg}° ({candidate.gradient.direction.replace(/_/g, " ")})
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Glow & Shapes</span>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {candidate.glow.position.replace(/_/g, " ")} / {candidate.decorativeShapes.type.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Reuse Style Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/10">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">Reuse this style</span>
                    <span className="text-[11px] text-muted-foreground">
                      Remember this visual direction for newly generated decks
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reuseForFuture}
                    onChange={(e) => setReuseForFuture(e.target.checked)}
                    className="w-4 h-4 text-primary accent-primary rounded cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/30">
            <button
              type="button"
              onClick={generateCandidate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              Try Another Style
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyStyle}
                disabled={!candidate || isGenerating}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Keep This Style
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
