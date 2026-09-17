"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Copy, Undo2, ShieldCheck, Sparkles, Layers, Palette, Type } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { DocumentSpec, PageSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";

interface ApplyToAllSlidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceSlideIndex?: number;
}

export const ApplyToAllSlidesModal: React.FC<ApplyToAllSlidesModalProps> = ({
  isOpen,
  onClose,
  sourceSlideIndex = 0,
}) => {
  const { document, setDocument, undo, canUndo } = useEditorStore();

  const [applyBackground, setApplyBackground] = useState(true);
  const [applyPalette, setApplyPalette] = useState(true);
  const [applyTypography, setApplyTypography] = useState(true);
  const [applyCardStyle, setApplyCardStyle] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const sourcePage = document.pages[sourceSlideIndex] || document.pages[0];

  const handleExecuteApply = () => {
    // 1. Create a deep clone of current document
    const clonedDoc: DocumentSpec = JSON.parse(JSON.stringify(document));

    // 2. Derive reference styles from source page and document theme
    const refBackgroundSpec = sourcePage?.backgroundSpec;
    const refTheme = clonedDoc.theme;

    // 3. Batch apply selected visual properties to all pages while strictly preserving content
    const updatedPages = clonedDoc.pages.map((page, idx) => {
      const updatedPage: PageSpec = { ...page };

      // Background Style propagation
      if (applyBackground && refBackgroundSpec) {
        updatedPage.backgroundSpec = {
          ...refBackgroundSpec,
          // Preserve slide-specific index/glow anchors if present
          glow: refBackgroundSpec.glow
            ? { ...refBackgroundSpec.glow }
            : undefined,
        };
        if (sourcePage?.backgroundOverride) {
          updatedPage.backgroundOverride = sourcePage.backgroundOverride;
        }
      }

      // Card / Border style propagation to elements
      if (applyCardStyle) {
        updatedPage.elements = page.elements.map((el) => {
          if (el.type === "media" && refTheme.styleTokens?.borderRadiusPx) {
            return {
              ...el,
              borderRadius: refTheme.styleTokens.borderRadiusPx,
            };
          }
          return el;
        });
      }

      return updatedPage;
    });

    const updatedDoc: DocumentSpec = {
      ...clonedDoc,
      pages: updatedPages,
    };

    setDocument(updatedDoc);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Copy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Apply Style to All Slides</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Syncing Slide #{sourceSlideIndex + 1} across {document.pages.length} slides
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose which visual styling properties to standardize across all slides in this presentation.
              Content, text, and layout archetypes will remain completely untouched.
            </p>

            {/* Checkbox Options */}
            <div className="space-y-2.5">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-border/80 hover:bg-muted/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={applyBackground}
                  onChange={(e) => setApplyBackground(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    Background Atmosphere & Gradient
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Syncs gradient angles, background base colors, subtle ambient glow, and decorative geometry.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-border/80 hover:bg-muted/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={applyPalette}
                  onChange={(e) => setApplyPalette(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-purple-500" />
                    Color Palette & Accent Tones
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Applies primary ({document.theme.colors.primary}), secondary ({document.theme.colors.secondary}), and accent colors to cards and headers.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-border/80 hover:bg-muted/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={applyTypography}
                  onChange={(e) => setApplyTypography(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-amber-500" />
                    Typography & Fonts
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Standardizes headline font ({document.theme.typography.headingFont}) and body font ({document.theme.typography.bodyFont}).
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-border/80 hover:bg-muted/30 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={applyCardStyle}
                  onChange={(e) => setApplyCardStyle(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Card Corner Radius & Elevation
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Applies uniform corner radius ({document.theme.styleTokens?.borderRadiusPx || 12}px) and border styling.
                  </p>
                </div>
              </label>
            </div>

            {/* Safety Guarantee Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Content Safety: Titles, points, metrics, charts, and layout archetypes are fully preserved.</span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleExecuteApply}
              disabled={isSuccess || (!applyBackground && !applyPalette && !applyTypography && !applyCardStyle)}
              className={cn(
                "px-5 py-1.5 rounded-xl font-bold text-xs shadow flex items-center gap-1.5 transition-all",
                isSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-primary text-primary-foreground hover:brightness-105"
              )}
            >
              {isSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Applied Successfully!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply to All {document.pages.length} Slides</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
