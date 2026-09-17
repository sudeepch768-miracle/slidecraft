import { ChartRecommendation, ChartTypeKind } from "./chart-types";

export interface DataColumnInfo {
  header: string;
  isNumeric: boolean;
  isDateOrYear: boolean;
  uniqueValuesCount: number;
  sampleValues: any[];
}

/**
 * Inspect columns to recommend optimal chart type and warn against misleading charts.
 */
export function recommendChartType(
  headers: string[],
  rows: Array<Array<string | number>>
): ChartRecommendation {
  const warnings: string[] = [];

  if (!headers || headers.length === 0 || !rows || rows.length === 0) {
    return {
      recommendedType: "column",
      confidence: 0.5,
      reasoning: "Defaulted to column chart due to insufficient data preview.",
      warnings: ["No tabular data points detected."],
      alternativeTypes: ["bar", "line"],
    };
  }

  const columnCount = headers.length;
  const rowCount = rows.length;

  // Analyze column 0 (typically label/dimension) and column 1..N (metrics)
  const firstColValues = rows.map((r) => String(r[0] || "").trim());
  const dateRegex = /^(19|20)\d\d|^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|^\d{1,2}\/\d{1,2}|\b(q1|q2|q3|q4)\b/i;
  const isFirstColTemporal = firstColValues.every(
    (v) => v.length > 0 && (dateRegex.test(v) || !isNaN(Date.parse(v)))
  );

  // Check if second column is numeric
  const numericColumns: number[] = [];
  for (let c = 1; c < columnCount; c++) {
    const isNum = rows.every((r) => {
      const val = r[c];
      return typeof val === "number" || (!isNaN(Number(val)) && String(val).trim() !== "");
    });
    if (isNum) numericColumns.push(c);
  }

  // Check if two numeric continuous dimensions (Bivariate scatter candidate)
  const isFirstColNumeric = rows.every((r) => !isNaN(Number(r[0])) && String(r[0]).trim() !== "");
  if (isFirstColNumeric && numericColumns.length >= 1) {
    return {
      recommendedType: "scatter",
      confidence: 0.92,
      reasoning: "Detected two continuous numerical dimensions, ideal for correlation scatter plot.",
      warnings: [],
      alternativeTypes: ["line", "column"],
    };
  }

  // Check for part-to-whole / percentage share
  const values = rows.map((r) => Number(r[1]) || 0);
  const sumValues = values.reduce((acc, v) => acc + v, 0);
  const looksLikePercentages = Math.abs(sumValues - 100) < 3 || Math.abs(sumValues - 1.0) < 0.05;

  if (looksLikePercentages || (rowCount <= 6 && !isFirstColTemporal && columnCount === 2)) {
    if (rowCount > 7) {
      warnings.push("Pie/Doughnut charts with > 7 slices create cognitive clutter. Group smaller categories into 'Other'.");
    }
    return {
      recommendedType: "doughnut",
      confidence: 0.88,
      reasoning: "Part-to-whole distribution with few categories is optimal for Doughnut / Pie representation.",
      warnings,
      alternativeTypes: ["pie", "bar", "column"],
    };
  }

  // Check temporal time-series
  if (isFirstColTemporal || rowCount >= 8) {
    if (rowCount > 15) {
      warnings.push("High density of time periods. Ensure data points have visible trendline smoothing.");
    }
    return {
      recommendedType: "line",
      confidence: 0.94,
      reasoning: "Time-series sequence detected. Continuous line chart preserves temporal trajectory and trends.",
      warnings,
      alternativeTypes: ["area", "column"],
    };
  }

  // Categorical rankings or comparisons
  const hasLongLabels = firstColValues.some((v) => v.length > 14);
  if (hasLongLabels) {
    return {
      recommendedType: "bar",
      confidence: 0.9,
      reasoning: "Long text labels detected. Horizontal bar chart ensures labels remain readable without truncating.",
      warnings: ["Always ensure bar charts maintain a zero baseline to prevent misleading relative magnitude."],
      alternativeTypes: ["column"],
    };
  }

  return {
    recommendedType: "column",
    confidence: 0.85,
    reasoning: "Discrete categorical data with short labels is standardly compared via vertical column chart.",
    warnings: ["Bar and column charts must start at zero on the Y-axis to avoid exaggerating small variance."],
    alternativeTypes: ["bar", "line"],
  };
}
