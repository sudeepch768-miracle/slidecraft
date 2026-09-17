export type ModularRatio =
  | "minor_second"
  | "major_second"
  | "minor_third"
  | "major_third"
  | "perfect_fourth"
  | "golden_ratio";

export const SCALE_RATIOS: Record<ModularRatio, number> = {
  minor_second: 1.067,
  major_second: 1.125,
  minor_third: 1.2,
  major_third: 1.25,
  perfect_fourth: 1.333,
  golden_ratio: 1.618,
};

export interface TypographyCalculations {
  h1: number;
  h2: number;
  h3: number;
  subtitle: number;
  body: number;
  caption: number;
  quote: number;
}

export function computeTypeScale(
  baseSize = 16,
  ratioKey: ModularRatio = "major_third"
): TypographyCalculations {
  const ratio = SCALE_RATIOS[ratioKey];

  return {
    caption: Math.round(baseSize / ratio),
    body: baseSize,
    subtitle: Math.round(baseSize * ratio),
    h3: Math.round(baseSize * Math.pow(ratio, 2)),
    h2: Math.round(baseSize * Math.pow(ratio, 3)),
    h1: Math.round(baseSize * Math.pow(ratio, 4.5)),
    quote: Math.round(baseSize * Math.pow(ratio, 1.8)),
  };
}

export function getFontWeights(variant: string): number {
  switch (variant) {
    case "h1":
      return 800;
    case "h2":
      return 700;
    case "h3":
      return 600;
    case "subtitle":
      return 500;
    case "body":
      return 400;
    case "caption":
      return 400;
    case "quote":
      return 500;
    default:
      return 400;
  }
}
