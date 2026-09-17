/**
 * Image Generation — Shared Types
 * All image generation for SlideCraft AI goes through this interface.
 * NVIDIA FLUX.2 Klein 4B is the current provider.
 */

export type ImageAspectRatio =
  | "1:1"   // Square — social media, avatars
  | "16:9"  // Landscape widescreen — slides, banners
  | "9:16"  // Portrait — stories, phone wallpapers
  | "4:3"   // Classic landscape — presentations
  | "3:4"   // Classic portrait — posters
  | "21:9"  // Ultra-wide — cinema, headers
  | "3:2"   // Photo landscape
  | "2:3";  // Photo portrait

export type ImageFitMode = "cover" | "contain" | "fill";
export type ImageQuality = "draft" | "standard" | "high";

export interface GenerateImageRequest {
  /** Natural language prompt describing the desired image */
  prompt: string;
  /** Negative prompt — elements to avoid (optional) */
  negativePrompt?: string;
  /** Target aspect ratio for the output image */
  aspectRatio?: ImageAspectRatio;
  /** Output quality tier — affects steps/guidance */
  quality?: ImageQuality;
  /** Seed for reproducibility (optional; omit for random) */
  seed?: number;
  /** Project ID — used for Supabase storage path (optional) */
  projectId?: string;
  /** User ID — used for Supabase storage path (optional) */
  userId?: string;
}

export interface GenerateImageResult {
  /** Public or signed URL to the stored image */
  url: string;
  /** Storage path within the bucket (relative) */
  storagePath: string | null;
  /** Actual pixel width of the generated image */
  width: number;
  /** Actual pixel height of the generated image */
  height: number;
  /** Seed that was used (for reproducibility) */
  seed: number | null;
  /** Provider that generated the image */
  provider: "nvidia-flux";
  /** ISO 8601 timestamp */
  generatedAt: string;
}

export interface GenerateImageError {
  code:
    | "PROVIDER_ERROR"
    | "RATE_LIMITED"
    | "INVALID_PROMPT"
    | "STORAGE_ERROR"
    | "NETWORK_ERROR"
    | "CONFIG_ERROR"
    | "MODEL_NOT_FOUND"
    | "UNKNOWN";
  message: string;
  /** Original provider error detail (never exposed to client) */
  detail?: string;
  retryable: boolean;
}

/** Width/height values keyed by aspect ratio */
export const ASPECT_RATIO_DIMENSIONS: Record<ImageAspectRatio, { width: number; height: number }> = {
  "1:1":  { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768  },
  "9:16": { width: 768,  height: 1344 },
  "4:3":  { width: 1152, height: 864  },
  "3:4":  { width: 864,  height: 1152 },
  "21:9": { width: 1536, height: 640  },
  "3:2":  { width: 1248, height: 832  },
  "2:3":  { width: 832,  height: 1248 },
};

/** Recommended aspect ratio per document type */
export const FORMAT_DEFAULT_ASPECT_RATIO: Record<string, ImageAspectRatio> = {
  presentation: "16:9",
  poster:        "3:4",
  infographic:   "9:16",
  social:        "1:1",
  resume:        "3:4",
  letter:        "3:4",
  diagram:       "16:9",
};
