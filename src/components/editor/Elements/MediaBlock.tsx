"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MediaElement, ThemeSpec } from "@/types/document-spec";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Move,
  Maximize2,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Crop,
  Square,
  Check,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageRegenerationModal } from "../ImageRegenerationModal";
import { useEditorStore } from "@/store/editor-store";

interface MediaBlockProps {
  element: MediaElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (patch: Partial<MediaElement>) => void;
  onDelete?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  slideId?: string;
  slideContainerRef?: React.RefObject<HTMLDivElement | null>;
  isFreeform?: boolean;
}

// Global registries to prevent duplicate in-flight requests and reuse generated results
const generationPromiseMap = new Map<string, Promise<string | null>>();
const generatedUrlCache = new Map<string, string>();

/**
 * Checks if a text string resembles an internal image prompt rather than an editorial caption.
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

type ResizeDirection = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

/**
 * MediaBlock — interactive, draggable, resizable, and editable image component.
 */
export const MediaBlock: React.FC<MediaBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  slideId,
  slideContainerRef,
  isFreeform = false,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [localSrc, setLocalSrc] = useState<string | null>(null);

  // Drag and Resize State
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    startX: number;
    startY: number;
    initialPos: { x: number; y: number; width: number; height: number };
  } | null>(null);

  const [resizeState, setResizeState] = useState<{
    direction: ResizeDirection;
    startX: number;
    startY: number;
    initialPos: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // Live Position while manipulating
  const [livePos, setLivePos] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const effectivePrompt = element.prompt || element.promptSummary || element.alt;
  const elementKey = element.id || `${slideId}-${effectivePrompt?.slice(0, 30)}`;

  const cachedUrl = generatedUrlCache.get(elementKey);
  const rawSrc = localSrc || cachedUrl || element.src || element.url;
  const src = rawSrc
    ? rawSrc.startsWith("data:image/svg+xml;utf8,")
      ? rawSrc.replace("data:image/svg+xml;utf8,", "data:image/svg+xml;charset=utf-8,")
      : rawSrc
    : null;
  const fit = element.fit || "cover";
  const hasOverlay = element.overlayColor && (element.overlayOpacity ?? 0) > 0;
  const isSvgPlaceholder = !src || src.startsWith("data:image/svg+xml");

  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    setImageLoadError(false);
  }, [src]);

  // Keep livePos synced with element.position when not dragging/resizing
  useEffect(() => {
    if (!dragState && !resizeState) {
      setLivePos(null);
    }
  }, [element.position, dragState, resizeState]);

  // Current effective position
  const pos = livePos || element.position;

  // Pointer drag handler for moving the image
  const handleStartMove = useCallback(
    (e: React.PointerEvent) => {
      // Don't drag if clicking buttons, inputs or handles
      const target = e.target as HTMLElement;
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("[data-resize-handle]")
      ) {
        return;
      }

      e.stopPropagation();
      onSelect?.();

      let currentBox: { x: number; y: number; width: number; height: number };

      if (pos && typeof pos.x === "number") {
        currentBox = {
          x: pos.x,
          y: pos.y ?? 22,
          width: pos.width ?? 40,
          height: pos.height ?? 50,
        };
      } else {
        // Measure element rect relative to slide container to initialize freeform position
        const elemRect = rootRef.current?.getBoundingClientRect();
        const slideRect = slideContainerRef?.current?.getBoundingClientRect();

        if (elemRect && slideRect && slideRect.width > 0 && slideRect.height > 0) {
          currentBox = {
            x: Math.max(0, Math.min(90, ((elemRect.left - slideRect.left) / slideRect.width) * 100)),
            y: Math.max(0, Math.min(90, ((elemRect.top - slideRect.top) / slideRect.height) * 100)),
            width: Math.max(15, Math.min(90, (elemRect.width / slideRect.width) * 100)),
            height: Math.max(15, Math.min(90, (elemRect.height / slideRect.height) * 100)),
          };
        } else {
          currentBox = { x: 50, y: 22, width: 42, height: 50 };
        }
      }

      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        initialPos: currentBox,
      });
      setLivePos(currentBox);
    },
    [pos, onSelect, slideContainerRef]
  );

  // Pointer resize handler for resizing
  const handleStartResize = useCallback(
    (direction: ResizeDirection, e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect?.();

      let currentBox: { x: number; y: number; width: number; height: number };

      if (pos && typeof pos.x === "number") {
        currentBox = {
          x: pos.x,
          y: pos.y ?? 22,
          width: pos.width ?? 40,
          height: pos.height ?? 50,
        };
      } else {
        const elemRect = rootRef.current?.getBoundingClientRect();
        const slideRect = slideContainerRef?.current?.getBoundingClientRect();

        if (elemRect && slideRect && slideRect.width > 0 && slideRect.height > 0) {
          currentBox = {
            x: Math.max(0, Math.min(90, ((elemRect.left - slideRect.left) / slideRect.width) * 100)),
            y: Math.max(0, Math.min(90, ((elemRect.top - slideRect.top) / slideRect.height) * 100)),
            width: Math.max(15, Math.min(90, (elemRect.width / slideRect.width) * 100)),
            height: Math.max(15, Math.min(90, (elemRect.height / slideRect.height) * 100)),
          };
        } else {
          currentBox = { x: 50, y: 22, width: 42, height: 50 };
        }
      }

      setResizeState({
        direction,
        startX: e.clientX,
        startY: e.clientY,
        initialPos: currentBox,
      });
      setLivePos(currentBox);
    },
    [pos, onSelect, slideContainerRef]
  );

  // Global window listeners for drag move and resize
  useEffect(() => {
    if (!dragState && !resizeState) return;

    const handlePointerMove = (e: PointerEvent) => {
      const slideEl = slideContainerRef?.current;
      if (!slideEl) return;
      const slideRect = slideEl.getBoundingClientRect();
      if (slideRect.width <= 0 || slideRect.height <= 0) return;

      if (dragState) {
        const deltaX_pct = ((e.clientX - dragState.startX) / slideRect.width) * 100;
        const deltaY_pct = ((e.clientY - dragState.startY) / slideRect.height) * 100;

        const w = dragState.initialPos.width;
        const h = dragState.initialPos.height;
        const newX = Math.max(0, Math.min(100 - w, dragState.initialPos.x + deltaX_pct));
        const newY = Math.max(0, Math.min(100 - h, dragState.initialPos.y + deltaY_pct));

        setLivePos({
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
          width: w,
          height: h,
        });
      } else if (resizeState) {
        const deltaX_pct = ((e.clientX - resizeState.startX) / slideRect.width) * 100;
        const deltaY_pct = ((e.clientY - resizeState.startY) / slideRect.height) * 100;
        const init = resizeState.initialPos;

        let newX = init.x;
        let newY = init.y;
        let newW = init.width;
        let newH = init.height;

        const dir = resizeState.direction;

        // Horizontal adjustment
        if (dir.includes("e")) {
          newW = Math.max(8, Math.min(100 - init.x, init.width + deltaX_pct));
        } else if (dir.includes("w")) {
          const maxLeftShift = init.width - 8;
          const shift = Math.max(-init.x, Math.min(maxLeftShift, deltaX_pct));
          newX = init.x + shift;
          newW = init.width - shift;
        }

        // Vertical adjustment
        if (dir.includes("s")) {
          newH = Math.max(8, Math.min(100 - init.y, init.height + deltaY_pct));
        } else if (dir.includes("n")) {
          const maxTopShift = init.height - 8;
          const shift = Math.max(-init.y, Math.min(maxTopShift, deltaY_pct));
          newY = init.y + shift;
          newH = init.height - shift;
        }

        setLivePos({
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
          width: Math.round(newW * 10) / 10,
          height: Math.round(newH * 10) / 10,
        });
      }
    };

    const handlePointerUp = () => {
      if (livePos) {
        onUpdate?.({ position: livePos });
      }
      setDragState(null);
      setResizeState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, resizeState, livePos, slideContainerRef, onUpdate]);

  // Fit toggle handler
  const handleCycleFit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const modes: Array<"cover" | "contain" | "fill"> = ["cover", "contain", "fill"];
    const nextIdx = (modes.indexOf(fit) + 1) % modes.length;
    onUpdate?.({ fit: modes[nextIdx] });
  };

  // Border radius cycle handler
  const handleCycleRadius = (e: React.MouseEvent) => {
    e.stopPropagation();
    const radiuses = [0, 8, 16, 28, 9999];
    const cur = element.borderRadius || 0;
    const nextIdx = (radiuses.indexOf(cur) + 1) % radiuses.length;
    onUpdate?.({ borderRadius: radiuses[nextIdx] });
  };

  // Local file replacement
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLocalSrc(dataUrl);
      onUpdate?.({
        url: dataUrl,
        src: dataUrl,
        caption: file.name.replace(/\.[^/.]+$/, ""),
        alt: file.name.replace(/\.[^/.]+$/, ""),
      });
    };
    reader.readAsDataURL(file);
  };

  // Background FLUX Generation (if placeholder detected)
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

    const commitToStore = (url: string) => {
      onUpdate?.({
        url,
        src: url,
        provider: "nvidia-flux",
        generatedAt: new Date().toISOString(),
      });
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
        if (url) setLocalSrc(url);
        setIsAutoGenerating(false);
      }
    }).catch((err) => {
      if (isMounted) {
        console.warn(`[MediaBlock] Background auto-generation failed for ${elementKey}:`, err.message);
        // Do not break the visual presentation layout with an error card during background auto-enhancement.
        // Keep the existing clean SVG fallback visual intact.
        setIsAutoGenerating(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [element.id, isSvgPlaceholder, effectivePrompt, elementKey, element.aspectRatio, onUpdate]);

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
          onUpdate?.({
            url: data.url,
            src: data.url,
            provider: data.provider || "nvidia-flux",
            generatedAt: data.generatedAt || new Date().toISOString(),
          });
        }
      })
      .catch((err) => {
        setGenerationError(err.message || "Retry failed");
      })
      .finally(() => {
        setIsAutoGenerating(false);
      });
  };

  // Position Styling
  const positionStyle: React.CSSProperties =
    pos && typeof pos.x === "number"
      ? {
          position: "absolute",
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          width: `${pos.width ?? 40}%`,
          height: `${pos.height ?? 50}%`,
          zIndex: isSelected ? 40 : 25,
        }
      : {
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: "220px",
        };

  const objectFit: React.CSSProperties["objectFit"] =
    fit === "cover" ? "cover" : fit === "contain" ? "contain" : "fill";

  const isRepositioning = Boolean(dragState || resizeState);

  return (
    <div
      ref={rootRef}
      className={cn(
        "group relative select-none transition-shadow",
        isFreeform ? "cursor-move" : "cursor-pointer",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-2xl",
        isRepositioning && "opacity-95 shadow-2xl"
      )}
      style={{
        ...positionStyle,
        borderRadius: element.borderRadius ? `${element.borderRadius}px` : "12px",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onPointerDown={handleStartMove}
    >
      {/* Hidden File Input for Image Replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ─── FLOATING ACTION TOOLBAR (ATTACHED ABOVE SELECTED IMAGE) ─── */}
      {isSelected && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-full px-2.5 py-1 z-50 transition-all pointer-events-auto",
            (pos?.y ?? 30) < 14 ? "-bottom-12" : "-top-12"
          )}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Drag Handle Indicator */}
          <div
            className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground mr-1 px-1.5 py-0.5 rounded cursor-move hover:text-foreground"
            title="Drag anywhere to move"
          >
            <Move className="w-3 h-3 text-primary" />
            <span className="hidden sm:inline">Move</span>
          </div>

          <div className="w-[1px] h-3.5 bg-border mx-0.5" />

          {/* Replace from Computer */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Upload Replacement Image"
          >
            <Upload className="w-3.5 h-3.5 text-blue-500" />
          </button>

          {/* AI Regenerate Modal */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-purple-400 transition-colors"
            title="Regenerate with AI (FLUX)"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          </button>

          <div className="w-[1px] h-3.5 bg-border mx-0.5" />

          {/* Fit Mode Toggle */}
          <button
            type="button"
            onClick={handleCycleFit}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-muted text-[10px] font-bold text-foreground capitalize transition-colors"
            title={`Fit: ${fit} (click to cycle)`}
          >
            <Crop className="w-3 h-3 text-muted-foreground" />
            <span>{fit}</span>
          </button>

          {/* Radius Toggle */}
          <button
            type="button"
            onClick={handleCycleRadius}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-muted text-[10px] font-bold text-foreground transition-colors"
            title="Border Radius (click to cycle)"
          >
            <Square className="w-3 h-3 text-muted-foreground" />
            <span>{element.borderRadius || 0}px</span>
          </button>

          <div className="w-[1px] h-3.5 bg-border mx-0.5" />

          {/* Layer Ordering */}
          {onBringForward && (
            <button
              type="button"
              onClick={onBringForward}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Bring Forward"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {onSendBackward && (
            <button
              type="button"
              onClick={onSendBackward}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Send Backward"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Element */}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1 rounded-full hover:bg-rose-500/20 text-rose-500 transition-colors ml-0.5"
              title="Delete Image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ─── 8 INTERACTIVE RESIZE HANDLES ─── */}
      {isSelected && (
        <>
          {/* Top-Left */}
          <div
            data-resize-handle="nw"
            onPointerDown={(e) => handleStartResize("nw", e)}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-xs shadow-md cursor-nwse-resize z-50 transition-transform hover:scale-125"
          />
          {/* Top-Center */}
          <div
            data-resize-handle="n"
            onPointerDown={(e) => handleStartResize("n", e)}
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-primary rounded-xs shadow-md cursor-ns-resize z-50 transition-transform hover:scale-125"
          />
          {/* Top-Right */}
          <div
            data-resize-handle="ne"
            onPointerDown={(e) => handleStartResize("ne", e)}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-xs shadow-md cursor-nesw-resize z-50 transition-transform hover:scale-125"
          />
          {/* Middle-Right */}
          <div
            data-resize-handle="e"
            onPointerDown={(e) => handleStartResize("e", e)}
            className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-xs shadow-md cursor-ew-resize z-50 transition-transform hover:scale-125"
          />
          {/* Bottom-Right */}
          <div
            data-resize-handle="se"
            onPointerDown={(e) => handleStartResize("se", e)}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-xs shadow-md cursor-nwse-resize z-50 transition-transform hover:scale-125"
          />
          {/* Bottom-Center */}
          <div
            data-resize-handle="s"
            onPointerDown={(e) => handleStartResize("s", e)}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-primary rounded-xs shadow-md cursor-ns-resize z-50 transition-transform hover:scale-125"
          />
          {/* Bottom-Left */}
          <div
            data-resize-handle="sw"
            onPointerDown={(e) => handleStartResize("sw", e)}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-xs shadow-md cursor-nesw-resize z-50 transition-transform hover:scale-125"
          />
          {/* Middle-Left */}
          <div
            data-resize-handle="w"
            onPointerDown={(e) => handleStartResize("w", e)}
            className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-primary rounded-xs shadow-md cursor-ew-resize z-50 transition-transform hover:scale-125"
          />
        </>
      )}

      {/* ─── IMAGE CONTENT & RENDERING ─── */}
      <div
        className="w-full h-full overflow-hidden relative"
        style={{
          borderRadius: element.borderRadius ? `${element.borderRadius}px` : "12px",
        }}
      >
        {/* Error or Broken Image State */}
        {generationError || imageLoadError ? (
          <div
            className="w-full h-full min-h-[180px] flex flex-col items-center justify-center gap-2.5 p-4 text-center rounded-xl border select-none"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: `${theme.colors.border}80`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
              style={{
                backgroundColor: `${theme.colors.secondary}15`,
                color: theme.colors.secondary,
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: theme.colors.textPrimary }}>
                {generationError ? "Generation Error" : "Visual Illustration"}
              </p>
              <p className="text-[11px] mt-0.5 max-w-xs line-clamp-2" style={{ color: theme.colors.textSecondary }}>
                {generationError || element.promptSummary || element.alt || "Click below to generate or customize this image"}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetry();
                }}
                className="px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                Generate Image
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1 border border-border hover:bg-muted text-foreground rounded-lg text-xs font-semibold transition-colors"
              >
                Upload File
              </button>
            </div>
          </div>
        ) : src ? (
          <div className="relative w-full h-full pointer-events-none">
            {/* Image */}
            <img
              src={src}
              alt={element.alt || "Slide visual"}
              style={{ width: "100%", height: "100%", objectFit }}
              loading="lazy"
              draggable={false}
              onError={() => setImageLoadError(true)}
              className={cn(
                "w-full h-full select-none transition-opacity duration-300",
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

            {/* Caption */}
            {element.caption && !isAutoGenerating && !isSvgPlaceholder && !isPromptLike(element.caption) && (
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
          /* Placeholder */
          <div
            className="w-full h-full min-h-[180px] flex flex-col items-center justify-center gap-2.5 select-none p-4"
            style={{
              backgroundColor: theme.colors.surface,
              border: `2px dashed ${theme.colors.border}`,
              color: theme.colors.textSecondary,
            }}
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="opacity-30">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="text-center">
              <p className="text-xs font-semibold opacity-70">Visual Asset</p>
              <p className="text-[10px] opacity-40 mt-0.5">Click to configure or generate</p>
            </div>
          </div>
        )}

        {/* Real-time In-Flight Generation Badge */}
        {isAutoGenerating && isSvgPlaceholder && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20 transition-all p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <span className="text-xs font-bold block">Generating with NVIDIA FLUX...</span>
            </div>
          </div>
        )}
      </div>

      {/* AI Regeneration Modal */}
      <ImageRegenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        element={element}
        slideId={slideId || "slide"}
      />
    </div>
  );
};
