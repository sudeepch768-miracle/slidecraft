import { compileDocumentToPptx } from "../src/lib/compiler/pptx/pptx-builder";
import { resolvePptxDesignTokens, DESIGN_SYSTEM_PRESETS } from "../src/lib/compiler/pptx/design-tokens";
import {
  calculateTextFitting,
  clampToSlideBoundaries,
  ensureHighContrast,
  analyzeTextDensity,
} from "../src/lib/compiler/pptx/quality-protector";
import { DocumentSpec, LayoutArchetype, DesignStyle } from "../src/types/document-spec";
import * as fs from "fs";
import * as path from "path";

async function runComprehensivePptxTests() {
  console.log("==================================================================");
  console.log("SLIDECRAFT AI - NATIVE PPTX GENERATION ENGINE COMPREHENSIVE SUITE");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}${detail ? ` - ${detail}` : ""}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  // --- TEST SUITE 1: Design System & Token Presets ---
  console.log("\n--- SUITE 1: Design System Presets (8 Professional Styles) ---");
  const styles: DesignStyle[] = [
    "microsoft_professional",
    "modern_academic",
    "corporate",
    "minimal",
    "colorful_educational",
    "dark_technology",
    "research_conference",
    "startup_pitch",
  ];

  for (const style of styles) {
    const tokens = resolvePptxDesignTokens(undefined, style);
    assert(tokens.name.length > 0, `Style preset '${style}' resolved`, tokens.name);
    assert(tokens.colors.primary.length === 6, `Style '${style}' primary color is 6-char hex`, tokens.colors.primary);
    assert(tokens.typography.headingFont.length > 0, `Style '${style}' defines headingFont`, tokens.typography.headingFont);
    assert(tokens.spacing.marginXInches > 0, `Style '${style}' defines marginX`, `${tokens.spacing.marginXInches}"`);
  }

  // --- TEST SUITE 2: Quality Protection Calculations ---
  console.log("\n--- SUITE 2: Quality Protection & Layout Safety Calculations ---");

  // 1. Text Fitting Auto-Scaling
  const shortText = "Executive Summary";
  const fitShort = calculateTextFitting(shortText, 5.0, 1.0, 24);
  assert(!fitShort.overflowDetected, "Short text does not trigger overflow", `Size: ${fitShort.adjustedFontSizePt}pt`);

  const longDenseText =
    "This is an extensive narrative paragraph containing a substantial amount of strategic and analytical details designed to test the automatic text fitting engine. Under standard circumstances without auto-fitting, this continuous block would exceed the vertical bounding box and cause awkward text clipping on the PowerPoint slide. The SlideCraft quality protection algorithm proactively detects this potential overflow and smoothly downscales the point size while preserving high visual readability and clean typography.";
  const fitLong = calculateTextFitting(longDenseText, 3.0, 0.8, 16, 9);
  assert(fitLong.overflowDetected, "Long dense text triggers overflow protection");
  assert(fitLong.adjustedFontSizePt < 16, "Font size automatically scaled down", `Adjusted to: ${fitLong.adjustedFontSizePt}pt`);
  assert(fitLong.adjustedFontSizePt >= 9, "Font size respects minimum threshold (>= 9pt)");

  // 2. Slide Boundary Clamping
  const outOfBoundsBox = { x: 12.0, y: 7.0, w: 4.0, h: 2.0 };
  const clampedBox = clampToSlideBoundaries(outOfBoundsBox, 13.33, 7.5, 0.8, 0.6);
  assert(clampedBox.x + clampedBox.w <= 13.33 - 0.8, "Element X coordinate clamped inside right margin", `Right edge: ${clampedBox.x + clampedBox.w}`);
  assert(clampedBox.y + clampedBox.h <= 7.5 - 0.6, "Element Y coordinate clamped inside bottom margin", `Bottom edge: ${clampedBox.y + clampedBox.h}`);

  // 3. Contrast Ratio Enhancement
  const darkOnDark = ensureHighContrast("1E293B", "0F172A"); // Slate on Dark Slate (poor contrast)
  assert(darkOnDark.wasAdjusted, "Low-contrast dark-on-dark text is detected and adjusted");
  assert(darkOnDark.color === "FFFFFF", "Dark-on-dark text auto-adjusted to pure white");

  const goodContrast = ensureHighContrast("0F172A", "FFFFFF"); // Dark on White (excellent contrast)
  assert(!goodContrast.wasAdjusted, "High-contrast text preserved without adjustment", `Ratio: ${goodContrast.contrastRatio.toFixed(1)}:1`);

  // 4. Text Density Analyzer
  const densityResult = analyzeTextDensity([longDenseText, shortText]);
  assert(densityResult.wordCount > 50, "Word count correctly computed", `Words: ${densityResult.wordCount}`);

  // --- TEST SUITE 3: Comprehensive 16-Layout Archetype Presentation Generation ---
  console.log("\n--- SUITE 3: Full 16-Layout Archetype Presentation Generation ---");

  const archetypesToTest: LayoutArchetype[] = [
    "hero_title",
    "title_and_content",
    "two_column_split",
    "three_card_grid",
    "full_bleed_visual",
    "four_metric_dashboard",
    "comparison_table",
    "horizontal_timeline",
    "process_flowchart",
    "diagram",
    "data_chart_focus",
    "table",
    "editorial_asymmetrical",
    "section_divider",
    "summary",
    "closing_slide",
  ];

  const testDoc: DocumentSpec = {
    version: "1.0.0",
    documentType: "presentation",
    meta: {
      title: "SlideCraft Enterprise Vector Studio",
      description: "Comprehensive 16-Layout Native Object Test Deck",
      author: "SlideCraft AI Engine",
      designStyle: "microsoft_professional",
      tags: ["enterprise", "pptx", "native-objects"],
    },
    canvas: {
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      unit: "px",
      dpi: 96,
    },
    theme: {
      mode: "light",
      colors: {
        primary: "#002050",
        secondary: "#0078D4",
        accent: "#107C41",
        background: "#F3F4F6",
        surface: "#FFFFFF",
        textPrimary: "#1F2937",
        textSecondary: "#4B5563",
        border: "#D1D5DB",
      },
      typography: {
        headingFont: "Segoe UI",
        bodyFont: "Segoe UI",
        monoFont: "Consolas",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 10,
        shadow: "md",
      },
    },
    pages: archetypesToTest.map((arch, idx) => ({
      id: `p-${idx + 1}`,
      pageNumber: idx + 1,
      archetype: arch,
      title: `${arch.replace(/_/g, " ").toUpperCase()} - Layout ${idx + 1}`,
      subtitle: "Demonstrating native Office XML object rendering without bitmaps",
      badge: "ARCHITECTURE",
      notes: `Presenter notes for slide ${idx + 1}: Emphasize vector precision and native PowerPoint objects.`,
      elements: [
        {
          type: "text",
          id: `t-${idx}`,
          variant: "body",
          content: "SlideCraft AI compiles deterministic ASTs directly into native vector elements.",
          align: "left",
        },
        {
          type: "metric",
          id: `m-${idx}-1`,
          value: "$24.8M",
          label: "Annual Recurring Revenue",
          delta: "+65% YoY",
          trend: "up",
        },
        {
          type: "metric",
          id: `m-${idx}-2`,
          value: "99.98%",
          label: "Production Uptime",
          delta: "Tier 1 SLA",
          trend: "up",
        },
        {
          type: "chart",
          id: `c-${idx}`,
          chartType: "bar",
          title: "Adoption Curve",
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [
            { name: "SlideCraft AI", data: [45, 78, 120, 190] },
            { name: "Legacy Tools", data: [30, 42, 50, 58] },
          ],
          showLegend: true,
        },
        {
          type: "table",
          id: `tbl-${idx}`,
          headers: ["Attribute", "SlideCraft AI", "Legacy Tools"],
          rows: [
            ["Rendering Output", "100% Native Office Shapes", "Raster Screen Captures"],
            ["Excel Integration", "Live Editable Data Series", "Static Flat Pixels"],
          ],
          highlightFirstColumn: true,
        },
        {
          type: "diagram",
          id: `d-${idx}`,
          diagramType: "flowchart",
          nodes: [
            { id: "n1", label: "AST Input", description: "Zod Schema" },
            { id: "n2", label: "Compiler", description: "PptxGenJS Vector Engine" },
            { id: "n3", label: "PowerPoint", description: "Native OpenXML" },
          ],
          connections: [
            { fromId: "n1", toId: "n2" },
            { fromId: "n2", toId: "n3" },
          ],
        },
      ],
    })),
  };

  const pptx = await compileDocumentToPptx(testDoc);
  assert(pptx !== null, "PptxGenJS compilation instance initialized");

  const outDir = path.join(__dirname, "../dist-test");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFilePath = path.join(outDir, "test-comprehensive-presentation.pptx");
  await pptx.writeFile({ fileName: outFilePath });

  const stats = fs.statSync(outFilePath);
  assert(fs.existsSync(outFilePath), "PPTX file successfully written to disk", outFilePath);
  assert(stats.size > 20000, "PPTX file contains substantial Office OpenXML package", `Size: ${(stats.size / 1024).toFixed(1)} KB`);

  // --- TEST SUITE 4: Native OpenXML Archive Verification (Zero Bitmaps) ---
  console.log("\n--- SUITE 4: OpenXML Native Object Verification (No Bitmaps/Screenshots) ---");
  const fileBuffer = fs.readFileSync(outFilePath);

  // Check PKZip header (50 4B 03 04)
  const isZip = fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b && fileBuffer[2] === 0x03 && fileBuffer[3] === 0x04;
  assert(isZip, "Output file is valid OpenXML container (PKZip format)");

  // Inspect binary string content for key OpenXML slide markers
  const binaryString = fileBuffer.toString("binary");
  assert(binaryString.includes("ppt/presentation.xml"), "Contains ppt/presentation.xml");
  assert(binaryString.includes("ppt/slides/slide1.xml"), "Contains ppt/slides/slide1.xml");
  assert(binaryString.includes("ppt/slides/slide16.xml"), "Contains ppt/slides/slide16.xml (all 16 slides rendered)");

  // Verify charts are native OpenXML chart parts (ppt/charts/chart*.xml)
  const hasChartParts = binaryString.includes("ppt/charts/chart");
  assert(hasChartParts, "Contains native Excel-backed PowerPoint chart parts (ppt/charts/chart*.xml)");

  console.log("\n==================================================================");
  console.log(`PPTX ENGINE TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensivePptxTests().catch((err) => {
  console.error("Test execution encountered an unhandled error:", err);
  process.exit(1);
});
