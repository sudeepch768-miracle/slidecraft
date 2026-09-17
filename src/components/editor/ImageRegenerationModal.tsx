"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Check, Sparkles, Trash2, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { MediaElement } from "@/types/document-spec";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

interface ImageRegenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: MediaElement | null;
  slideId: string;
}

export const ImageRegenerationModal: React.FC<ImageRegenerationModalProps> = ({
  isOpen,
  onClose,
  element,
  slideId,
}) => {
  const { document, setDocument, activePageIndex } = useEditorStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(element?.prompt || element?.promptSummary || "");
  const [candidateUrl, setCandidateUrl] = useState<string | null>(null);
  const [candidateMetadata, setCandidateMetadata] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState("");

  // Sync custom prompt when element changes
  React.useEffect(() => {
    if (element) {
      setCustomPrompt(element.prompt || element.promptSummary || element.alt || "");
      setCandidateUrl(null);
    }
  }, [element, isOpen]);

  // Auto-generate candidate visual on open if no candidate is generated yet
  React.useEffect(() => {
    if (isOpen && element && !candidateUrl && !isGenerating) {
      handleGenerateCandidate(element.prompt || element.promptSummary || element.alt);
    }
  }, [isOpen, element?.id]);

  if (!isOpen || !element) return null;

  const handleGenerateCandidate = async (variationPrompt?: string) => {
    setIsGenerating(true);
    setErrorMsg(null);

    const effectivePrompt = variationPrompt || customPrompt || element.alt || "High-tech conceptual photography";

    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: effectivePrompt,
          aspectRatio: element.aspectRatio || "16:9",
          quality: "standard",
          projectId: document.id,
          format: "presentation",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Generation failed (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (data.url) {
        setCandidateUrl(data.url);
        setCandidateMetadata({
          storagePath: data.storagePath,
          generatedAt: data.generatedAt,
          provider: data.provider || "nvidia-flux",
          promptSummary: effectivePrompt.slice(0, 70),
          prompt: effectivePrompt,
        });
      }
    } catch (err: any) {
      console.warn("Image generation fallback:", err);
      setErrorMsg(err.message || "Could not reach image generation provider. Using procedural visual.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyImage = (urlToApply: string) => {
    const updatedPages = [...document.pages];
    const pageIndex = updatedPages.findIndex((p) => p.id === slideId) !== -1
      ? updatedPages.findIndex((p) => p.id === slideId)
      : activePageIndex;

    const page = { ...updatedPages[pageIndex] };
    const elements = page.elements.map((el) => {
      if (el.id === element.id) {
        return {
          ...el,
          url: urlToApply,
          src: urlToApply,
          ...(candidateMetadata || {}),
        } as MediaElement;
      }
      return el;
    });

    page.elements = elements;
    updatedPages[pageIndex] = page;
    setDocument({ ...document, pages: updatedPages });
    onClose();
  };

  const handleRemoveImage = () => {
    const updatedPages = [...document.pages];
    const pageIndex = updatedPages.findIndex((p) => p.id === slideId) !== -1
      ? updatedPages.findIndex((p) => p.id === slideId)
      : activePageIndex;

    const page = { ...updatedPages[pageIndex] };
    page.elements = page.elements.filter((el) => el.id !== element.id);
    updatedPages[pageIndex] = page;
    setDocument({ ...document, pages: updatedPages });
    onClose();
  };

  const currentDisplayUrl = candidateUrl || element.url || element.src;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">AI Visual Asset Manager</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  NVIDIA FLUX 4B  •  {element.aspectRatio || "16:9"}  •  Slide: {slideId}
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
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Visual Canvas Preview */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border bg-black/40 shadow-inner flex items-center justify-center">
              {currentDisplayUrl ? (
                <img
                  src={currentDisplayUrl}
                  alt={element.alt || "Slide visual"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xs text-muted-foreground">No image available</div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                  <span className="text-xs font-semibold tracking-wide">Synthesizing visual via NVIDIA FLUX...</span>
                </div>
              )}

              {candidateUrl && !isGenerating && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold shadow">
                  Fresh Candidate Ready
                </div>
              )}
            </div>

            {/* Error or Warning Banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Prompt Description Editor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>Visual Concept Prompt</span>
                <span className="text-[10px] font-mono opacity-70">Strict: No text in image</span>
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the visual metaphor, scene composition, and lighting..."
                rows={3}
                className="w-full text-xs px-3 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Direct URL Input Option */}
            <div className="pt-2 border-t border-border flex items-center gap-2">
              <input
                type="text"
                placeholder="Or paste external image URL (https://...)"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (customUrlInput.trim()) handleApplyImage(customUrlInput.trim());
                }}
                disabled={!customUrlInput.trim()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-secondary-foreground hover:brightness-105 disabled:opacity-40"
              >
                Use URL
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
            <button
              onClick={handleRemoveImage}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Image</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateCandidate()}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
                <span>{candidateUrl ? "Try Another Visual" : "Regenerate Image"}</span>
              </button>

              {candidateUrl ? (
                <button
                  onClick={() => handleApplyImage(candidateUrl)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Candidate</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-105 transition-all"
                >
                  Keep Current Image
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
