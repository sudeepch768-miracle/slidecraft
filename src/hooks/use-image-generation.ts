/**
 * useImageGeneration — React hook for FLUX image generation
 *
 * Calls the server-side /api/ai/generate-image route.
 * The NVIDIA API key is NEVER used or accessible on the client.
 * Images are deduplicated by prompt+settings hash to prevent re-generation on re-renders.
 */

"use client";

import { useState, useCallback, useRef } from "react";

export type ImageAspectRatio =
  | "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "3:2" | "2:3";

export type ImageQuality = "draft" | "standard" | "high";

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: ImageAspectRatio;
  quality?: ImageQuality;
  seed?: number;
  projectId?: string;
  format?: string;
}

export interface GeneratedImage {
  url: string;
  storagePath: string | null;
  width: number;
  height: number;
  seed: number | null;
  provider: string;
  generatedAt: string;
  prompt: string;
}

interface GenerationState {
  isGenerating: boolean;
  image: GeneratedImage | null;
  error: string | null;
  retryable: boolean;
}

function optionsHash(opts: GenerateImageOptions): string {
  return JSON.stringify({
    prompt: opts.prompt.trim(),
    negativePrompt: opts.negativePrompt ?? "",
    aspectRatio: opts.aspectRatio ?? "16:9",
    quality: opts.quality ?? "standard",
    seed: opts.seed ?? null,
    format: opts.format ?? "",
  });
}

export function useImageGeneration() {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    image: null,
    error: null,
    retryable: false,
  });

  // Track the last successfully generated options hash to avoid duplicate requests
  const lastGeneratedHash = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (opts: GenerateImageOptions) => {
    const hash = optionsHash(opts);

    // Skip if the same options were already generated
    if (hash === lastGeneratedHash.current && state.image) {
      return state.image;
    }

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ isGenerating: true, image: null, error: null, retryable: false });

    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: opts.prompt.trim(),
          negativePrompt: opts.negativePrompt,
          aspectRatio: opts.aspectRatio,
          quality: opts.quality ?? "standard",
          seed: opts.seed,
          projectId: opts.projectId,
          format: opts.format,
        }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const errCode = data.error?.code ?? "UNKNOWN";
        const errMsg = data.error?.message ?? "Image generation failed.";
        const retryable = data.error?.retryable ?? false;
        setState({ isGenerating: false, image: null, error: errMsg, retryable });

        // Provide actionable hint for missing config
        if (errCode === "CONFIG_ERROR") {
          console.error("[SlideCraft] NVIDIA API key not configured. Add NVIDIA_API_KEY to .env.local");
        }
        return null;
      }

      const image: GeneratedImage = { ...data, prompt: opts.prompt };
      lastGeneratedHash.current = hash;
      setState({ isGenerating: false, image, error: null, retryable: false });
      return image;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setState({ isGenerating: false, image: null, error: null, retryable: false });
        return null;
      }
      const msg = err instanceof Error ? err.message : "Network error during image generation.";
      setState({ isGenerating: false, image: null, error: msg, retryable: true });
      return null;
    }
  }, [state.image]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    lastGeneratedHash.current = null;
    setState({ isGenerating: false, image: null, error: null, retryable: false });
  }, []);

  return {
    generate,
    reset,
    isGenerating: state.isGenerating,
    image: state.image,
    error: state.error,
    retryable: state.retryable,
  };
}
