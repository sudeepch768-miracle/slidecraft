"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { MediaElement } from "@/types/document-spec";
import {
  Sparkles,
  Upload,
  RefreshCw,
  Trash2,
  Undo2,
  Image as ImageIcon,
  Loader2,
  Sliders,
  Check,
  Link as LinkIcon,
  Layers,
  ArrowUp,
  ArrowDown,
  Maximize2,
  AlignHorizontalDistributeCenter,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaElementCustomizerProps {
  element: MediaElement;
  onClose?: () => void;
}

export const MediaElementCustomizer: React.FC<MediaElementCustomizerProps> = ({ element, onClose }) => {
  const {
    updateElement,
    deleteElementFromActivePage,
    bringElementForward,
    sendElementBackward,
    undo,
    canUndo,
    document,
  } = useEditorStore();

  const [prompt, setPrompt] = useState(element.prompt || element.promptSummary || element.alt || element.caption || "High-tech futuristic visual");
  const [urlInput, setUrlInput] = useState(element.url || element.src || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(element.url || element.src || "");
    setPrompt(element.prompt || element.promptSummary || element.alt || element.caption || "High-tech futuristic visual");
  }, [element.id, element.url, element.src, element.prompt, element.promptSummary, element.alt, element.caption]);

  // 1. Generate new image with NVIDIA FLUX
  const handleGenerateFlux = async () => {
    if (!prompt.trim()) return;
    try {
      setIsGenerating(true);
      setError(null);

      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          format: document.documentType || "presentation",
          aspectRatio: element.aspectRatio || "16:9",
          quality: "standard",
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || "Failed to generate image with NVIDIA FLUX.");
      }

      const data = await res.json();
      if (data.url) {
        updateElement(element.id, {
          url: data.url,
          src: data.url,
          prompt,
          provider: "nvidia-flux",
          generatedAt: new Date().toISOString(),
        });
        setUrlInput(data.url);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Upload asset from local file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateElement(element.id, {
        url: dataUrl,
        src: dataUrl,
        caption: file.name.replace(/\.[^/.]+$/, ""),
        alt: file.name.replace(/\.[^/.]+$/, ""),
      });
      setUrlInput(dataUrl);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError("Failed to read image file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // 3. Apply custom URL
  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    updateElement(element.id, {
      url: urlInput.trim(),
      src: urlInput.trim(),
    });
  };

  // 4. Change Fit mode
  const handleFitChange = (fit: "cover" | "contain" | "fill") => {
    updateElement(element.id, { fit });
  };

  // 5. Change Border radius
  const handleBorderRadiusChange = (radius: number) => {
    updateElement(element.id, { borderRadius: radius });
  };

  // 6. Change Position / Dimensions
  const currentPos = element.position || { x: 50, y: 22, width: 42, height: 50 };

  const handleUpdatePosition = (patch: Partial<{ x: number; y: number; width: number; height: number }>) => {
    const updated = {
      x: typeof patch.x === "number" ? Math.max(0, Math.min(95, patch.x)) : currentPos.x ?? 50,
      y: typeof patch.y === "number" ? Math.max(0, Math.min(95, patch.y)) : currentPos.y ?? 22,
      width: typeof patch.width === "number" ? Math.max(10, Math.min(100, patch.width)) : currentPos.width ?? 42,
      height: typeof patch.height === "number" ? Math.max(10, Math.min(100, patch.height)) : currentPos.height ?? 50,
    };
    updateElement(element.id, { position: updated });
  };

  const handleAlignPreset = (preset: "center" | "right_half" | "full_bleed" | "reset") => {
    if (preset === "center") {
      handleUpdatePosition({ x: 25, y: 20, width: 50, height: 55 });
    } else if (preset === "right_half") {
      handleUpdatePosition({ x: 52, y: 20, width: 44, height: 55 });
    } else if (preset === "full_bleed") {
      handleUpdatePosition({ x: 5, y: 18, width: 90, height: 60 });
    } else if (preset === "reset") {
      updateElement(element.id, { position: undefined });
    }
  };

  const currentUrl = element.url || element.src;

  return (
    <div className="space-y-4 select-none pb-4">
      {/* Top Bar: Title, Undo, Layering, Delete */}
      <div className="flex items-center justify-between pb-2 border-b border-border/70">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">Image Inspector</span>
        </div>
        <div className="flex items-center gap-2">
          {canUndo && (
            <button
              type="button"
              onClick={undo}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              title="Undo Image Change"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              deleteElementFromActivePage(element.id);
              if (onClose) onClose();
            }}
            className="text-xs text-rose-500 font-semibold hover:underline flex items-center gap-1"
            title="Delete Image"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Current Preview */}
      {currentUrl && (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-border/80 bg-muted/30 group">
          <img
            src={currentUrl}
            alt={element.caption || "Slide Image"}
            className={cn(
              "w-full h-full object-cover transition-transform group-hover:scale-105 duration-300",
              element.fit === "contain" && "object-contain",
              element.fit === "fill" && "object-fill"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <span className="text-[10px] text-white font-medium truncate">
              {element.caption || "Custom Image Asset"}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px]">
          {error}
        </div>
      )}

      {/* Position & Size Controls */}
      <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-primary" />
            <span>Position & Dimensions</span>
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {element.position ? "Custom Canvas %" : "Auto Slot"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">X Position (%)</label>
            <input
              type="number"
              min={0}
              max={95}
              value={Math.round(currentPos.x ?? 0)}
              onChange={(e) => handleUpdatePosition({ x: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs p-1.5 rounded-lg border border-border bg-card text-foreground font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Y Position (%)</label>
            <input
              type="number"
              min={0}
              max={95}
              value={Math.round(currentPos.y ?? 0)}
              onChange={(e) => handleUpdatePosition({ y: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs p-1.5 rounded-lg border border-border bg-card text-foreground font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Width (%)</label>
            <input
              type="number"
              min={10}
              max={100}
              value={Math.round(currentPos.width ?? 40)}
              onChange={(e) => handleUpdatePosition({ width: parseFloat(e.target.value) || 40 })}
              className="w-full text-xs p-1.5 rounded-lg border border-border bg-card text-foreground font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Height (%)</label>
            <input
              type="number"
              min={10}
              max={100}
              value={Math.round(currentPos.height ?? 50)}
              onChange={(e) => handleUpdatePosition({ height: parseFloat(e.target.value) || 50 })}
              className="w-full text-xs p-1.5 rounded-lg border border-border bg-card text-foreground font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => handleAlignPreset("center")}
            className="flex-1 py-1 text-[10px] font-semibold rounded-md border border-border bg-card hover:bg-muted text-foreground transition-all"
            title="Center on Slide"
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => handleAlignPreset("right_half")}
            className="flex-1 py-1 text-[10px] font-semibold rounded-md border border-border bg-card hover:bg-muted text-foreground transition-all"
            title="Right 45%"
          >
            Right Split
          </button>
          <button
            type="button"
            onClick={() => handleAlignPreset("full_bleed")}
            className="flex-1 py-1 text-[10px] font-semibold rounded-md border border-border bg-card hover:bg-muted text-foreground transition-all"
            title="Wide Hero"
          >
            Wide
          </button>
          <button
            type="button"
            onClick={() => handleAlignPreset("reset")}
            className="px-2 py-1 text-[10px] font-semibold rounded-md border border-border bg-card hover:bg-muted text-muted-foreground transition-all"
            title="Reset to Archetype Slot"
          >
            Slot
          </button>
        </div>
      </div>

      {/* Layer Order */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => bringElementForward(element.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
          title="Bring to Front"
        >
          <ArrowUp className="w-3.5 h-3.5 text-primary" />
          <span>Bring to Front</span>
        </button>
        <button
          type="button"
          onClick={() => sendElementBackward(element.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
          title="Send to Back"
        >
          <ArrowDown className="w-3.5 h-3.5 text-primary" />
          <span>Send to Back</span>
        </button>
      </div>

      {/* Direct Image URL & Local Upload */}
      <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2.5">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-primary" />
          <span>Image Source</span>
        </span>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (https://...)"
            className="flex-1 text-xs p-1.5 rounded-lg border border-border bg-card text-foreground"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shrink-0"
          >
            Apply
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg border border-dashed border-border hover:border-primary bg-card hover:bg-muted/40 text-xs font-semibold text-foreground transition-all"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>Upload from Computer</span>
            </>
          )}
        </button>
      </div>

      {/* AI Image Generation (NVIDIA FLUX) */}
      <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Generate with NVIDIA FLUX</span>
          </span>
          <span className="text-[9px] font-mono uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            FLUX.2
          </span>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
            Visual Prompt Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            placeholder="Describe the image you want to generate..."
            className="w-full text-xs p-2 rounded-lg border border-border bg-card text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateFlux}
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/95 disabled:opacity-40 transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Image</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleGenerateFlux}
            disabled={isGenerating || !prompt.trim()}
            className="p-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
            title="Regenerate Image"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Fit & Layout Controls */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
            Fit Mode
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["cover", "contain", "fill"] as const).map((fit) => (
              <button
                key={fit}
                type="button"
                onClick={() => handleFitChange(fit)}
                className={cn(
                  "py-1.5 text-xs font-semibold rounded-lg border capitalize transition-all",
                  (element.fit || "cover") === fit
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-border/80 bg-muted/20 hover:bg-muted/50 text-foreground"
                )}
              >
                {fit}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1">
            <span>Border Radius</span>
            <span className="font-mono text-[10px]">{element.borderRadius || 0}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            step="2"
            value={element.borderRadius || 0}
            onChange={(e) => handleBorderRadiusChange(parseInt(e.target.value, 10))}
            className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
            Alt Text / Accessibility Label
          </label>
          <input
            type="text"
            value={element.alt || ""}
            onChange={(e) => updateElement(element.id, { alt: e.target.value })}
            placeholder="Image description..."
            className="w-full text-xs p-1.5 rounded-lg border border-border bg-card text-foreground"
          />
        </div>
      </div>
    </div>
  );
};
