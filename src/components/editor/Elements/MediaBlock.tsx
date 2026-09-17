"use client";

import React, { useState, useEffect } from "react";
import { MediaElement, ThemeSpec } from "@/types/document-spec";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageRegenerationModal } from "../ImageRegenerationModal";
import { useEditorStore } from "@/store/editor-store";

interface MediaBlockProps {
  element: MediaElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
  slideId?: string;
}

// Global registries to prevent duplicate in-flight requests and reuse generated results
const generationPromiseMap = new Map<string, Promise<string | null>>();
const generatedUrlCache = new Map<string, string>();

/**
 * Checks if a text string resembles an internal image prompt rather than an editorial caption.
 * Prompts must NEVER be displayed to the user as visible content.
 */
function isPromptLike(text?: string): boolean {
  if (!text) return false;
  const upper = text.toUpperCase();
  return (
    text.length > 50 ||
    upper.includes("IMAGE") ||
    upper.includes("PHOTO") ||
    upper.includes("BACKGROUND") ||
    upper.includes("HERO") ||
    upper.includes("PROMPT") ||
    upper.includes("OVERLAY") ||
    upper.includes("DISPLAYED") ||
    upper.includes("ILLUSTRAT") ||
    upper.includes("GPU PROMINENTLY")
  );
}

/**
 * MediaBlock — renders image, illustration, or icon elements in the preview.
 * Supports automatic background generation via NVIDIA FLUX when a placeholder is detected.
 */
export const MediaBlock: React.FC<MediaBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
  slideId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [localSrc, setLocalSrc] = useState<string | null>(null);

  const effectivePrompt = element.prompt || element.promptSummary || element.alt;
  const elementKey = element.id || `${slideId}-${effectivePrompt?.slice(0, 30)}`;

  const cachedUrl = generatedUrlCache.get(elementKey);
  const src = localSrc || cachedUrl || element.src || element.url;
  const fit = element.fit || "cover";
  const hasOverlay = element.overlayColor && (element.overlayOpacity ?? 0) > 0;
  const isSvgPlaceholder = !src || src.startsWith("data:image/svg+xml");

  // Position style — if element has explicit position, use it
  const positionStyle: React.CSSProperties = element.position
    ? {
        position: "absolute",
        left: `${element.position.x ?? 0}%`,
        top: `${element.position.y ?? 0}%`,
        width: `${element.position.width ?? 50}%`,
        height: `${element.position.height ?? 40}%`,
      }
    : {
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "220px",
      };

  const objectFit: React.CSSProperties["objectFit"] =
    fit === "cover" ? "cover" : fit === "contain" ? "contain" : "fill";

  // Automatic Background Generation via NVIDIA FLUX
  useEffect(() => {
    if (!isSvgPlaceholder || !effectivePrompt) {
      setIsAutoGenerating(false);
      return;
    }

    if (generatedUrlCache.has(elementKey)) {
      setLocalSrc(generatedUrlCache.get(elementKey)!);
      setIsAutoGenerating(false);
      return;
    }

    let isMounted = true;

    // Helper to update Zustand store
    const commitToStore = (url: string) => {
      const store = useEditorStore.getState();
      const currentDoc = store.document;
      const updatedPages = [...currentDoc.pages];
      const pageIndex =
        slideId && updatedPages.findIndex((p) => p.id === slideId) !== -1
          ? updatedPages.findIndex((p) => p.id === slideId)
          : store.activePageIndex;

      if (updatedPages[pageIndex]) {
        const page = { ...updatedPages[pageIndex] };
        page.elements = page.elements.map((el) => {
          if (el.id === element.id) {
            return {
              ...el,
              url,
              src: url,
              provider: "nvidia-flux",
              generatedAt: new Date().toISOString(),
            } as MediaElement;
          }
          return el;
        });
        updatedPages[pageIndex] = page;
        store.setDocument({ ...currentDoc, pages: updatedPages });
      }
    };

    const normalizedAspectRatio =
      element.aspectRatio && ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "3:2", "2:3"].includes(element.aspectRatio)
        ? element.aspectRatio
        : "16:9";

    let p = generationPromiseMap.get(elementKey);
    if (!p) {
      p = (async () => {
        try {
          const res = await fetch("/api/ai/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: effectivePrompt,
              aspectRatio: normalizedAspectRatio,
              quality: "standard",
              format: "presentation",
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => null);
            throw new Error(errData?.error?.message || `Generation failed (${res.status})`);
          }

          const data = await res.json();
          if (data?.url) {
            generatedUrlCache.set(elementKey, data.url);
            if (isMounted) {
              setLocalSrc(data.url);
              setIsAutoGenerating(false);
            }
            commitToStore(data.url);
            return data.url as string;
          }
          return null;
        } catch (err: any) {
          console.warn(`[MediaBlock] Auto-generation error for ${elementKey}:`, err.message);
          throw err;
        } finally {
          generationPromiseMap.delete(elementKey);
        }
      })();

      generationPromiseMap.set(elementKey, p);
    }

    setIsAutoGenerating(true);
    setGenerationError(null);

    p.then((url) => {
      if (isMounted) {
        if (url) {
          setLocalSrc(url);
        }
        setIsAutoGenerating(false);
      }
    }).catch((err) => {
      if (isMounted) {
        setGenerationError(err.message || "Image generation failed");
        setIsAutoGenerating(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [element.id, isSvgPlaceholder, effectivePrompt, elementKey, slideId]);

  const handleRetry = () => {
    generatedUrlCache.delete(elementKey);
    generationPromiseMap.delete(elementKey);
    setGenerationError(null);
    setIsAutoGenerating(true);

    const normalizedAspectRatio =
      element.aspectRatio && ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "3:2", "2:3"].includes(element.aspectRatio)
        ? element.aspectRatio
        : "16:9";

    fetch("/api/ai/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: effectivePrompt,
        aspectRatio: normalizedAspectRatio,
        quality: "standard",
        format: "presentation",
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error?.message || `Generation failed (${res.status})`);
        }
        const data = await res.json();
        if (data?.url) {
          generatedUrlCache.set(elementKey, data.url);
          setLocalSrc(data.url);
          const store = useEditorStore.getState();
          const currentDoc = store.document;
          const updatedPages = [...currentDoc.pages];
          const pageIndex =
            slideId && updatedPages.findIndex((p) => p.id === slideId) !== -1
              ? updatedPages.findIndex((p) => p.id === slideId)
              : store.activePageIndex;

          if (updatedPages[pageIndex]) {
            const page = { ...updatedPages[pageIndex] };
            page.elements = page.elements.map((el) => {
              if (el.id === element.id) {
                return {
                  ...el,
                  url: data.url,
                  src: data.url,
                  provider: data.provider || "nvidia-flux",
                  generatedAt: data.generatedAt || new Date().toISOString(),
                } as MediaElement;
              }
              return el;
            });
            updatedPages[pageIndex] = page;
            store.setDocument({ ...currentDoc, pages: updatedPages });
          }
        }
      })
      .catch((err) => {
        setGenerationError(err.message || "Retry failed");
      })
      .finally(() => {
        setIsAutoGenerating(false);
      });
  };

  return (
    <div
      className={cn(
        "overflow-hidden group relative",
        isSelected && "ring-2 ring-purple-500"
      )}
      style={{
        ...positionStyle,
        borderRadius: element.borderRadius ? `${element.borderRadius}px` : "12px",
        cursor: "pointer",
      }}
      onClick={onSelect}
    >
      {/* 1. Clear Editor-Only Error State (No fake prompt text) */}
      {generationError ? (
        <div
          className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-2.5 p-6 text-center rounded-xl bg-destructive/10 border border-destructive/20 select-none"
        >
          <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">Visual Generation Interrupted</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">{generationError}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRetry();
            }}
            className="mt-1 px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            Retry Generation
          </button>
        </div>
      ) : src ? (
        <div className="relative w-full h-full">
          {/* Actual image */}
          <img
            src={src}
            alt={element.alt || "Slide visual"}
            style={{ width: "100%", height: "100%", objectFit }}
            loading="lazy"
            className={cn(
              "transition-opacity duration-500",
              isAutoGenerating && isSvgPlaceholder ? "opacity-40 filter blur-[1px]" : "opacity-100"
            )}
          />

          {/* Overlay */}
          {hasOverlay && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: element.overlayColor,
                opacity: element.overlayOpacity,
              }}
            />
          )}

          {/* Caption — strictly filtered to prevent prompt leakage */}
          {element.caption && !isAutoGenerating && !isPromptLike(element.caption) && (
            <div
              className="absolute bottom-0 left-0 right-0 px-2.5 py-1 text-[11px] font-medium backdrop-blur-xs"
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "#fff",
              }}
            >
              {element.caption}
            </div>
          )}
        </div>
      ) : (
        // Editor-only state: image placeholder
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-3 select-none"
          style={{
            backgroundColor: theme.colors.surface,
            border: `2px dashed ${theme.colors.border}`,
            color: theme.colors.textSecondary,
          }}
        >
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="opacity-30">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-center px-4">
            <p className="text-xs font-semibold opacity-60">Visual Placeholder</p>
            <p className="text-[10px] opacity-40 mt-0.5">Generating with NVIDIA FLUX...</p>
          </div>
        </div>
      )}

      {/* Real-time In-Flight Generation Badge */}
      {isAutoGenerating && isSvgPlaceholder && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20 transition-all p-4 text-center">
          <div className="w-9 h-9 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <span className="text-xs font-bold block">Generating with NVIDIA FLUX...</span>
            <span className="text-[10px] text-white/70 block mt-0.5">
              Sub-second diffusion rendering
            </span>
          </div>
        </div>
      )}

      {/* Hover action badge to trigger manual AI regeneration */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black/95 text-white text-[10px] font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg border border-white/20 backdrop-blur-xs"
      >
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span>Regenerate Visual</span>
      </button>

      {/* Interactive AI Regeneration Modal */}
      <ImageRegenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        element={element}
        slideId={slideId || "slide"}
      />
    </div>
  );
};
