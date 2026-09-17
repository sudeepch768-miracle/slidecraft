/**
 * text-measurer.ts
 * Pixel-accurate text measurement utilities for layout engine.
 * Used by both PageRenderer (browser preview) and PPTX compiler.
 *
 * Browser: uses Canvas 2D measureText API
 * Server/fallback: uses character-count heuristic lookup table
 */

// ─────────────────────────────────────────────────────────────────────────────
// Heuristic character-width lookup (em units, approximate for common fonts)
// These are average char widths at 1px font size as a fraction of font size.
// ─────────────────────────────────────────────────────────────────────────────

const FONT_CHAR_WIDTH_RATIO: Record<string, number> = {
  // Sans-serif (Inter, Open Sans, Roboto, Nunito, Poppins)
  "Inter": 0.55,
  "Open Sans": 0.56,
  "Roboto": 0.54,
  "Nunito": 0.57,
  "Poppins": 0.55,
  "Lato": 0.54,
  "Source Sans Pro": 0.53,
  "Plus Jakarta Sans": 0.56,
  "Raleway": 0.52,
  "Segoe UI": 0.54,
  "IBM Plex Sans": 0.55,
  "Montserrat": 0.58,

  // Serif (Playfair Display, Merriweather, Georgia)
  "Playfair Display": 0.60,
  "Merriweather": 0.60,
  "Georgia": 0.58,
  "Courier Prime": 0.62,

  // Monospace
  "JetBrains Mono": 0.62,
  "IBM Plex Mono": 0.62,
  "Consolas": 0.60,
  "Share Tech Mono": 0.62,

  // Fallback
  "default": 0.56,
};

/** Get the approximate character width ratio for a given font */
function getCharWidthRatio(fontFamily: string): number {
  // Try exact match first
  if (FONT_CHAR_WIDTH_RATIO[fontFamily]) return FONT_CHAR_WIDTH_RATIO[fontFamily];

  // Try partial match (font stacks like "Inter, sans-serif")
  for (const [key, ratio] of Object.entries(FONT_CHAR_WIDTH_RATIO)) {
    if (fontFamily.includes(key)) return ratio;
  }

  return FONT_CHAR_WIDTH_RATIO.default;
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas-based measurement (browser only)
// ─────────────────────────────────────────────────────────────────────────────

let _canvas: HTMLCanvasElement | null = null;
let _ctx: CanvasRenderingContext2D | null = null;

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!_canvas) {
    _canvas = document.createElement("canvas");
    _ctx = _canvas.getContext("2d");
  }
  return _ctx;
}

/**
 * Measure the pixel width of a single line of text.
 * Uses canvas measureText in browser, heuristic on server.
 */
export function measureTextWidth(
  text: string,
  fontSizePx: number,
  fontFamily: string = "Inter",
  fontWeight: string = "normal"
): number {
  const ctx = getCanvasContext();
  if (ctx) {
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
    return ctx.measureText(text).width;
  }

  // Server-side heuristic
  const ratio = getCharWidthRatio(fontFamily);
  // Bold text is ~15% wider
  const boldMultiplier = fontWeight === "bold" || fontWeight === "700" ? 1.15 : 1.0;
  return text.length * fontSizePx * ratio * boldMultiplier;
}

/**
 * Calculate the optimal font size to fit text within a bounding box.
 * Returns the largest font size at which the text fits.
 */
export function calculateFittedFontSize(
  text: string,
  maxWidthPx: number,
  maxHeightPx: number,
  initialSizePx: number,
  minSizePx: number = 10,
  fontFamily: string = "Inter",
  fontWeight: string = "normal",
  lineHeightRatio: number = 1.4
): { fontSize: number; lineCount: number; fits: boolean } {
  let size = initialSizePx;

  while (size >= minSizePx) {
    const lines = wrapText(text, maxWidthPx, size, fontFamily, fontWeight);
    const totalHeight = lines.length * size * lineHeightRatio;

    if (totalHeight <= maxHeightPx) {
      return { fontSize: size, lineCount: lines.length, fits: true };
    }

    size = Math.floor(size * 0.9); // Reduce by 10% each step
  }

  // Even at minimum size it may not fit — return minimum anyway
  const lines = wrapText(text, maxWidthPx, minSizePx, fontFamily, fontWeight);
  return { fontSize: minSizePx, lineCount: lines.length, fits: false };
}

/**
 * Wrap text into lines that fit within maxWidthPx at the given font size.
 * Returns an array of line strings.
 */
export function wrapText(
  text: string,
  maxWidthPx: number,
  fontSizePx: number,
  fontFamily: string = "Inter",
  fontWeight: string = "normal"
): string[] {
  if (!text || !text.trim()) return [];

  const words = text.replace(/\n/g, " \n ").split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (word === "\n") {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = "";
      continue;
    }

    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = measureTextWidth(testLine, fontSizePx, fontFamily, fontWeight);

    if (width > maxWidthPx && currentLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine.trim()) lines.push(currentLine.trim());

  return lines;
}

/**
 * Check if text overflows a bounding box at the given font size.
 */
export function doesTextOverflow(
  text: string,
  maxWidthPx: number,
  maxHeightPx: number,
  fontSizePx: number,
  fontFamily: string = "Inter",
  fontWeight: string = "normal",
  lineHeightRatio: number = 1.4
): boolean {
  const lines = wrapText(text, maxWidthPx, fontSizePx, fontFamily, fontWeight);
  const totalHeight = lines.length * fontSizePx * lineHeightRatio;
  return totalHeight > maxHeightPx;
}

/**
 * Truncate text to fit within a bounding box, appending "…" if truncated.
 * Useful for single-line elements like headings.
 */
export function truncateToFit(
  text: string,
  maxWidthPx: number,
  fontSizePx: number,
  fontFamily: string = "Inter",
  fontWeight: string = "bold"
): string {
  const fullWidth = measureTextWidth(text, fontSizePx, fontFamily, fontWeight);
  if (fullWidth <= maxWidthPx) return text;

  let truncated = text;
  while (truncated.length > 1) {
    truncated = truncated.slice(0, -1);
    const w = measureTextWidth(truncated + "…", fontSizePx, fontFamily, fontWeight);
    if (w <= maxWidthPx) return truncated + "…";
  }

  return "…";
}

// ─────────────────────────────────────────────────────────────────────────────
// PPTX-specific text fitting (uses inch/point units like PptxGenJS)
// ─────────────────────────────────────────────────────────────────────────────

const POINTS_PER_INCH = 72;
const PIXELS_PER_INCH = 96;

/** Convert points to pixels */
export function ptToPx(pt: number): number {
  return (pt / POINTS_PER_INCH) * PIXELS_PER_INCH;
}

/** Convert pixels to points */
export function pxToPt(px: number): number {
  return (px / PIXELS_PER_INCH) * POINTS_PER_INCH;
}

/** Convert inches to pixels */
export function inToPx(inches: number): number {
  return inches * PIXELS_PER_INCH;
}

/**
 * Calculate text fitting for PPTX textboxes.
 * width and height are in inches, fontSize in points.
 * Returns adjusted font size in points and cleaned text.
 */
export function calculateTextFitting(
  text: string,
  widthInches: number,
  heightInches: number,
  fontSizePt: number,
  fontFamily: string = "Inter",
  fontWeight: string = "normal",
  minFontSizePt: number = 8
): { adjustedFontSizePt: number; cleanText: string; lineCount: number; fits: boolean } {
  const maxWidthPx = inToPx(widthInches);
  const maxHeightPx = inToPx(heightInches);
  const fontSizePx = ptToPx(fontSizePt);
  const minFontSizePx = ptToPx(minFontSizePt);

  // Clean the text
  const cleanText = text
    .replace(/\s+/g, " ")
    .trim();

  const result = calculateFittedFontSize(
    cleanText,
    maxWidthPx,
    maxHeightPx,
    fontSizePx,
    minFontSizePx,
    fontFamily,
    fontWeight
  );

  return {
    adjustedFontSizePt: pxToPt(result.fontSize),
    cleanText,
    lineCount: result.lineCount,
    fits: result.fits,
  };
}

/**
 * Clamp an element's bounding box to slide boundaries.
 * All values in inches.
 */
export function clampToSlideBoundaries(
  x: number, y: number, w: number, h: number,
  slideW: number, slideH: number,
  marginInches: number = 0.25
): { x: number; y: number; w: number; h: number } {
  const safeX = Math.max(marginInches, Math.min(x, slideW - w - marginInches));
  const safeY = Math.max(marginInches, Math.min(y, slideH - h - marginInches));
  const safeW = Math.min(w, slideW - safeX - marginInches);
  const safeH = Math.min(h, slideH - safeY - marginInches);
  return {
    x: safeX,
    y: Math.max(0, safeY),
    w: Math.max(0.1, safeW),
    h: Math.max(0.1, safeH),
  };
}

/**
 * Check if two rectangles overlap (all values in same unit).
 */
export function doRectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  tolerance: number = 0.05
): boolean {
  return !(
    a.x + a.w <= b.x + tolerance ||
    b.x + b.w <= a.x + tolerance ||
    a.y + a.h <= b.y + tolerance ||
    b.y + b.h <= a.y + tolerance
  );
}
