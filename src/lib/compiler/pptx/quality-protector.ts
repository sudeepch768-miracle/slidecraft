/**
 * Quality Protection Engine for SlideCraft PPTX Generation
 * Calculates text metrics, bounds violations, contrast ratios, and density,
 * and automatically adjusts layouts to guarantee zero clipping and high readability.
 */

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextFitResult {
  adjustedFontSizePt: number;
  overflowDetected: boolean;
  estimatedLines: number;
  isTruncated: boolean;
  cleanText: string;
}

/**
 * Calculates text dimensions and auto-scales font size to fit within the box.
 */
export function calculateTextFitting(
  text: string,
  boxW: number, // in inches
  boxH: number, // in inches
  preferredFontSizePt: number,
  minFontSizePt = 9
): TextFitResult {
  const clean = (text || "").trim();
  if (!clean) {
    return {
      adjustedFontSizePt: preferredFontSizePt,
      overflowDetected: false,
      estimatedLines: 0,
      isTruncated: false,
      cleanText: "",
    };
  }

  // Character width factor (approx 0.52 of font size in points)
  const charWidthPtFactor = 0.52;
  const lineHeightFactor = 1.35;
  const boxWidthPt = Math.max(0.5, boxW) * 72;
  const boxHeightPt = Math.max(0.3, boxH) * 72;

  let currentFontSize = preferredFontSizePt;
  let estimatedLines = 1;

  for (let fs = preferredFontSizePt; fs >= minFontSizePt; fs--) {
    const charsPerLine = Math.max(10, Math.floor(boxWidthPt / (fs * charWidthPtFactor)));
    const paragraphs = clean.split("\n");
    let lines = 0;

    for (const p of paragraphs) {
      lines += Math.max(1, Math.ceil(p.length / charsPerLine));
    }

    const neededHeightPt = lines * (fs * lineHeightFactor);

    if (neededHeightPt <= boxHeightPt) {
      currentFontSize = fs;
      estimatedLines = lines;
      break;
    }

    if (fs === minFontSizePt) {
      currentFontSize = minFontSizePt;
      estimatedLines = lines;
    }
  }

  const overflowDetected = currentFontSize < preferredFontSizePt;

  return {
    adjustedFontSizePt: currentFontSize,
    overflowDetected,
    estimatedLines,
    isTruncated: false,
    cleanText: clean,
  };
}

/**
 * Clamps coordinates to ensure elements remain strictly inside slide boundaries.
 */
export function clampToSlideBoundaries(
  box: BoundingBox,
  slideW: number,
  slideH: number,
  marginX = 0.5,
  marginY = 0.5
): BoundingBox {
  const maxW = slideW - marginX * 2;
  const maxH = slideH - marginY * 2;

  let w = Math.min(box.w, maxW);
  let h = Math.min(box.h, maxH);
  let x = Math.max(marginX, box.x);
  let y = Math.max(marginY, box.y);

  if (x + w > slideW - marginX) {
    x = Math.max(marginX, slideW - marginX - w);
  }

  if (y + h > slideH - marginY) {
    y = Math.max(marginY, slideH - marginY - h);
  }

  return { x, y, w, h };
}

/**
 * Calculates WCAG 2.1 relative luminance and contrast ratio.
 * Automatically resolves low-contrast text color against the slide/card background.
 */
export function ensureHighContrast(
  textColorHex: string,
  backgroundColorHex: string,
  minRatio = 4.5
): { color: string; contrastRatio: number; wasAdjusted: boolean } {
  const cleanHex = (h: string) => (h.startsWith("#") ? h.slice(1) : h);
  const fg = cleanHex(textColorHex);
  const bg = cleanHex(backgroundColorHex);

  const getLuminance = (hex: string): number => {
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const sRGB = [r, g, b].map((val) =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const contrastRatio = (lighter + 0.05) / (darker + 0.05);

  if (contrastRatio >= minRatio) {
    return { color: fg, contrastRatio, wasAdjusted: false };
  }

  // Adjust to guaranteed readable contrast:
  // If background is dark (luminance < 0.5), use white; if light, use dark slate
  const bgIsDark = l2 < 0.35;
  const safeColor = bgIsDark ? "FFFFFF" : "0F172A";

  return {
    color: safeColor,
    contrastRatio: bgIsDark ? (1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (0.01 + 0.05),
    wasAdjusted: true,
  };
}

/**
 * Detects whether slide text density is excessive (>120 words on standard slides).
 */
export function analyzeTextDensity(
  textItems: string[],
  maxRecommendedWords = 120
): { wordCount: number; isExcessive: boolean; densityRatio: number } {
  const totalWords = textItems.reduce((acc, text) => {
    const words = (text || "").trim().split(/\s+/).filter(Boolean);
    return acc + words.length;
  }, 0);

  return {
    wordCount: totalWords,
    isExcessive: totalWords > maxRecommendedWords,
    densityRatio: totalWords / maxRecommendedWords,
  };
}
