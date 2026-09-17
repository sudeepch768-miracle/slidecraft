import { compileDocumentToPptx } from "../src/lib/compiler/pptx/pptx-builder";
import { DocumentSpec } from "../src/types/document-spec";
import * as fs from "fs";
import * as path from "path";

async function runTest() {
  console.log("Starting PPTX compiler verification test...");

  const testDoc: DocumentSpec = {
    version: "1.0.0",
    documentType: "presentation",
    meta: {
      title: "SlideCraft Architecture & Benchmark",
      description: "Automated compiler verification deck",
      author: "SlideCraft Test Suite",
      tags: ["architecture", "benchmark"],
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
        primary: "#0F172A",
        secondary: "#2563EB",
        accent: "#06B6D4",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        textPrimary: "#0F172A",
        textSecondary: "#64748B",
        border: "#E2E8F0",
      },
      typography: {
        headingFont: "Arial",
        bodyFont: "Arial",
        monoFont: "Courier New",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 12,
        shadow: "md",
      },
    },
    pages: [
      {
        id: "p1",
        pageNumber: 1,
        archetype: "hero_title",
        title: "SlideCraft AI Studio",
        subtitle: "Deterministic Vector Compilation & Dynamic AI Composition",
        badge: "PRODUCTION SUITE",
        notes: "Welcome the audience and introduce the core vision.",
        elements: [],
      },
      {
        id: "p2",
        pageNumber: 2,
        archetype: "four_metric_dashboard",
        title: "Platform Performance Metrics",
        subtitle: "Real-time production velocity and efficiency benchmarks",
        badge: "BENCHMARKS",
        notes: "Emphasize the 3.2x speedup compared to manual PowerPoint preparation.",
        elements: [
          {
            type: "metric",
            id: "m1",
            value: "2.1s",
            label: "Average Inference Latency",
            delta: "-65%",
            trend: "up",
          },
          {
            type: "metric",
            id: "m2",
            value: "100%",
            label: "Native Vector Fidelity",
            delta: "Zero Bitmaps",
            trend: "up",
          },
          {
            type: "metric",
            id: "m3",
            value: "48.5k",
            label: "Rendered Slides",
            delta: "+120% MoM",
            trend: "up",
          },
          {
            type: "metric",
            id: "m4",
            value: "0",
            label: "Schema Validation Failures",
            delta: "Guaranteed",
            trend: "neutral",
          },
        ],
      },
      {
        id: "p3",
        pageNumber: 3,
        archetype: "data_chart_focus",
        title: "Generation Throughput By Format",
        subtitle: "Decks vs Posters vs Social Media graphics",
        badge: "ANALYTICS",
        notes: "Explain how presentations dominate 60% of studio usage.",
        elements: [
          {
            type: "chart",
            id: "c1",
            chartType: "bar",
            title: "Monthly Volume (Thousands of Units)",
            labels: ["Presentations", "Posters", "Infographics", "Social Graphics"],
            datasets: [
              { name: "Q1 2026", data: [45, 22, 18, 30] },
              { name: "Q2 2026", data: [78, 35, 29, 48] },
            ],
            showLegend: true,
          },
          {
            type: "text",
            id: "t1",
            variant: "body",
            content:
              "The content-aware layout engine dynamically adapts to content density and element frequencies, generating diverse professional compositions.",
            align: "left",
          },
        ],
      },
      {
        id: "p4",
        pageNumber: 4,
        archetype: "comparison_table",
        title: "Architectural Differentiation",
        subtitle: "Why deterministic IR surpasses direct code hallucination",
        badge: "COMPARISON",
        elements: [
          {
            type: "table",
            id: "tbl1",
            headers: ["Feature Dimension", "SlideCraft AI", "Legacy AI Deck Tools"],
            rows: [
              [
                "Generation Output",
                "Validated JSON AST (Zod-enforced)",
                "Arbitrary JSX / HTML strings",
              ],
              [
                "PowerPoint Export",
                "100% Native Vector Shapes & Excel Charts",
                "Flat image snapshots or corrupted XML",
              ],
              [
                "Layout Variety",
                "Content-aware dynamic archetype composer",
                "Small set of 5-10 fixed templates",
              ],
              [
                "Conversational Edits",
                "Scoped diff/patch engine with undo/redo",
                "Regenerates entire deck from scratch",
              ],
            ],
            highlightFirstColumn: true,
          },
        ],
      },
    ],
  };

  const pptx = await compileDocumentToPptx(testDoc);
  const outDir = path.join(__dirname, "../dist-test");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFilePath = path.join(outDir, "test-output.pptx");
  await pptx.writeFile({ fileName: outFilePath });

  const stats = fs.statSync(outFilePath);
  console.log(
    `PPTX compilation succeeded! Output file size: ${stats.size} bytes at ${outFilePath}`
  );
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
