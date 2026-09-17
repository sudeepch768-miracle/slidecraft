"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import {
  RefreshCw,
  X,
  Sparkles,
  Loader2,
  Sliders,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const RegenerateModal: React.FC = () => {
  const {
    document,
    activePageIndex,
    setDocument,
    isRegenerateOpen,
    setRegenerateOpen,
  } = useEditorStore();

  const [scope, setScope] = useState<"slide" | "document">("slide");
  const [prompt, setPrompt] = useState("");
  const [stylePreset, setStylePreset] = useState("Executive & High Contrast");
  const [isLoading, setIsLoading] = useState(false);

  if (!isRegenerateOpen) return null;

  const activePage = document.pages[activePageIndex];

  const handleRegenerate = async () => {
    try {
      setIsLoading(true);

      if (scope === "slide") {
        // Regenerate active slide
        const instruction = prompt.trim()
          ? `${prompt} (Style: ${stylePreset})`
          : `Regenerate and polish this slide with fresh content, high contrast typography, and structured layout. (Style: ${stylePreset})`;

        const res = await fetch("/api/ai/modify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentDocument: document,
            pageIndex: activePageIndex,
            instruction,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Slide regeneration failed");
        }

        const { updatedDocument } = await res.json();
        if (updatedDocument) {
          setDocument(updatedDocument);
          setRegenerateOpen(false);
        }
      } else {
        // Regenerate entire document
        const generationPrompt = prompt.trim()
          ? `${prompt} (Style: ${stylePreset})`
          : `Regenerate complete ${document.documentType} titled "${document.meta.title}" with updated metrics, high-impact storytelling, and comprehensive slides. (Style: ${stylePreset})`;

        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: generationPrompt,
            documentType: document.documentType,
            aspectRatio: document.canvas.aspectRatio,
            pageCount: document.pages.length,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Document regeneration failed");
        }

        const { document: generatedDoc } = await res.json();
        if (generatedDoc) {
          setDocument(generatedDoc);
          setRegenerateOpen(false);
        }
      }
    } catch (err: any) {
      console.error("Regenerate error:", err);
      alert(`Regeneration Notice: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">AI Content Regenerator</h3>
              <p className="text-[11px] text-muted-foreground">
                Re-synthesize layout, copy, and visual tokens with Groq LPU
              </p>
            </div>
          </div>

          <button
            onClick={() => setRegenerateOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {/* Scope Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Regeneration Target</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope("slide")}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-center gap-2 transition-all",
                  scope === "slide"
                    ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted/40"
                )}
              >
                <Layers className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-xs font-bold text-foreground">Current Slide</div>
                  <div className="text-[10px] text-muted-foreground">
                    Slide {activePageIndex + 1}: {activePage?.title || "Active page"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope("document")}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-center gap-2 transition-all",
                  scope === "document"
                    ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted/40"
                )}
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-foreground">Entire Project</div>
                  <div className="text-[10px] text-muted-foreground">
                    All {document.pages.length} slides
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Prompt Refinement */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Direction or Refinement Notes (Optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Focus on market expansion and Q4 revenue metrics', 'Make the headline punchy and bold'..."
              rows={3}
              className="w-full text-xs p-3 bg-background rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
            />
          </div>

          {/* Style & Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Visual & Editorial Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Executive & High Contrast",
                "Technical & Analytical",
                "Bold & Expressive",
                "Minimalist & Clean",
              ].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setStylePreset(style)}
                  className={cn(
                    "p-2 rounded-lg border text-left text-xs transition-all",
                    stylePreset === style
                      ? "border-primary bg-primary/5 font-bold text-primary shadow-xs"
                      : "border-border/70 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
          <button
            onClick={() => setRegenerateOpen(false)}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/95 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isLoading ? "Generating with AI..." : "Regenerate Content"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
