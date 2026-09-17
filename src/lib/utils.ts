import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function generateId(prefix = "elem"): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sanitizes badge text to ensure prompt strings, image descriptions, or verbose text
 * never appear as user-visible badges or banners.
 */
export function sanitizeBadge(badge?: string, defaultBadge = "EXECUTIVE BRIEFING"): string {
  if (!badge || typeof badge !== "string") return defaultBadge;
  const trimmed = badge.trim();
  const upper = trimmed.toUpperCase();
  const isPromptLike =
    trimmed.length > 28 ||
    upper.includes("IMAGE") ||
    upper.includes("PHOTO") ||
    upper.includes("BACKGROUND") ||
    upper.includes("HERO") ||
    upper.includes("PROMPT") ||
    upper.includes("GRAPHIC") ||
    upper.includes("ILLUSTRAT") ||
    upper.includes("OVERLAY") ||
    upper.includes("DISPLAYED") ||
    upper.includes("SUBTITLE") ||
    upper.includes("HEADLINE") ||
    upper.includes("H100") ||
    upper.includes("GPU PROMINENTLY");

  if (isPromptLike) {
    return defaultBadge;
  }
  return trimmed.toUpperCase();
}
