import { AspectRatio } from "@/types/document-spec";

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridConfig {
  columns: number;
  marginHorizontal: number;
  marginVertical: number;
  gutter: number;
}

export const PPTX_DIMENSIONS: Record<AspectRatio, { wInches: number; hInches: number }> = {
  "16:9": { wInches: 13.333, hInches: 7.5 },
  "4:3": { wInches: 10.0, hInches: 7.5 },
  "1:1": { wInches: 8.5, hInches: 8.5 },
  "9:16": { wInches: 7.5, hInches: 13.333 },
  "4:5": { wInches: 8.0, hInches: 10.0 },
  A4_portrait: { wInches: 8.27, hInches: 11.69 },
  A4_landscape: { wInches: 11.69, hInches: 8.27 },
  A3_portrait: { wInches: 11.69, hInches: 16.54 },
  A3_landscape: { wInches: 16.54, hInches: 11.69 },
  A2_portrait: { wInches: 16.54, hInches: 23.39 },
  A1_portrait: { wInches: 23.39, hInches: 33.11 },
  US_letter: { wInches: 8.5, hInches: 11.0 },
};

/**
 * Calculates responsive column width given canvas dimensions and margins
 */
export function calculateColumnWidth(
  totalWidth: number,
  columns = 12,
  margin = 80,
  gutter = 24
): number {
  const availableWidth = totalWidth - margin * 2 - gutter * (columns - 1);
  return availableWidth / columns;
}

/**
 * Calculates absolute pixel bounding box for a grid column span
 */
export function getColumnSpanBox(
  colStart: number, // 0-indexed
  colSpan: number,
  totalWidth: number,
  totalHeight: number,
  topOffset = 180,
  bottomOffset = 80,
  gutter = 24,
  margin = 80
): BoundingBox {
  const colWidth = calculateColumnWidth(totalWidth, 12, margin, gutter);
  const x = margin + colStart * (colWidth + gutter);
  const w = colSpan * colWidth + (colSpan - 1) * gutter;
  const y = topOffset;
  const h = totalHeight - topOffset - bottomOffset;

  return { x, y, w, h };
}

/**
 * Converts pixel bounding box to PowerPoint inches
 */
export function pxToInches(
  pxBox: BoundingBox,
  canvasWidth: number,
  canvasHeight: number,
  aspectRatio: AspectRatio = "16:9"
): BoundingBox {
  const { wInches, hInches } = PPTX_DIMENSIONS[aspectRatio];

  return {
    x: Number(((pxBox.x / canvasWidth) * wInches).toFixed(3)),
    y: Number(((pxBox.y / canvasHeight) * hInches).toFixed(3)),
    w: Number(((pxBox.w / canvasWidth) * wInches).toFixed(3)),
    h: Number(((pxBox.h / canvasHeight) * hInches).toFixed(3)),
  };
}
