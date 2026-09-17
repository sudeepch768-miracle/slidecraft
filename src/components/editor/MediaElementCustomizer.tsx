"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaElementCustomizerProps {
  element: MediaElement;
  onClose?: () => void;
}

export const MediaElementCustomizer: React.FC<MediaElementCustomizerProps> = ({ element, onClose }) => {
  const { updateElement, deleteElementFromActivePage, undo, canUndo, document, activePageIndex } = useEditorStore();

  const [prompt, setPrompt] = useState(element.caption || "High-tech futuristic infrastructure");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
          aspectRatio: "16:9",
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
      });
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError("Failed to read image file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // 3. One-click Regenerate
  const handleRegenerate = () => {
    handleGenerateFlux();
  };

  // 4. Change Fit mode
  const handleFitChange = (fit: "cover" | "contain" | "fill") => {
    updateElement(element.id, { fit });
  };

  // 5. Change Border radius
  const handleBorderRadiusChange = (radius: number) => {
    updateElement(element.id, { borderRadius: radius });
  };

  const currentUrl = element.url || element.src;

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-border/70">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">Image Customizer</span>
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

      {/* AI Image Generation (NVIDIA FLUX) */}
      <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Generate with NVIDIA FLUX</span>
          </span>
          <span className="text-[9px] font-mono uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            FLUX.2 Klein 4B
          </span>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
            Prompt / Scene Description
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
            onClick={handleRegenerate}
            disabled={isGenerating || !prompt.trim()}
            className="p-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
            title="Regenerate Image"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Replace from Upload */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground block">
          Upload Custom Image
        </label>
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
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-border/80 hover:border-primary bg-card hover:bg-muted/40 text-xs font-semibold text-foreground transition-all"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Uploading Asset...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>Browse Image from Computer</span>
            </>
          )}
        </button>
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
      </div>
    </div>
  );
};
