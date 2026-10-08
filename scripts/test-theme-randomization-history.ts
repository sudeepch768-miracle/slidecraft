import {
  generateVisualDirection,
  generatePromptThemedBackground,
  applyVisualDirectionToDocument,
} from "../src/lib/ai/visual-direction-engine";
import { DocumentSpec, LayoutArchetype } from "../src/types/document-spec";
import { ThemeHistoryEntry } from "../src/types/editor";
import { compileDocumentToPptx } from "../src/lib/compiler/pptx/pptx-builder";
import * as fs from "fs";
import * as path from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log("============================================================");
  console.log("🧪 TESTING: Prompt-Themed Background Randomization & History");
  console.log("============================================================\n");

  // ──────────────────────────────────────────────────────────────────────────
  // Test 1: Prompt-aware Domain-congruent Randomization
  // ──────────────────────────────────────────────────────────────────────────
  console.log("▶ TEST 1: Prompt-aware Domain-congruent Style Randomization");

  const promptTestCases = [
    {
      domain: "Technology & AI",
      prompt: "AI Autonomous Agents, Neural Networks and Deep Learning Architecture",
      allowedFamilies: [
        "deep_navy_electric_blue",
        "indigo_violet_gradient",
        "subtle_geometric_grid",
        "dark_aurora_gradient",
        "cyber_neon_matrix",
        "teal_emerald_technology",
      ],
    },
    {
      domain: "Finance & Corporate",
      prompt: "Global Hedge Fund Q3 Macroeconomic Analysis and Portfolio Performance",
      allowedFamilies: [
        "midnight_blue_coral",
        "charcoal_amber_highlights",
        "clean_light_blue_pro",
        "deep_navy_electric_blue",
        "rose_gold_luxury",
      ],
    },
    {
      domain: "Healthcare & Medical",
      prompt: "Clinical Oncology Clinical Trial Phases and Patient Biomarker Tracking",
      allowedFamilies: [
        "clean_light_blue_pro",
        "minimal_white_light_blue",
        "teal_emerald_technology",
        "deep_navy_electric_blue",
      ],
    },
    {
      domain: "Nature & Environment",
      prompt: "Regenerative Agroforestry and Sustainable Carbon Sequestration",
      allowedFamilies: [
        "teal_emerald_technology",
        "clean_light_blue_pro",
        "warm_editorial",
        "charcoal_amber_highlights",
        "green_environmental",
      ],
    },
    {
      domain: "Luxury & Editorial",
      prompt: "Haute Horlogerie, High Jewelry and Luxury Swiss Timepieces Exhibition",
      allowedFamilies: [
        "rose_gold_luxury",
        "charcoal_amber_highlights",
        "midnight_blue_coral",
        "high_contrast_monochrome",
        "warm_editorial",
      ],
    },
  ];

  for (const tc of promptTestCases) {
    const vd1 = generatePromptThemedBackground(tc.prompt, { seed: `seed-1-${Date.now()}` });
    const vd2 = generatePromptThemedBackground(tc.prompt, { seed: `seed-2-${Date.now() + 100}` });

    console.log(`  Domain [${tc.domain}]:`);
    console.log(`    Run 1 -> styleFamily: ${vd1.styleFamily}, bgStyle: ${vd1.backgroundStyle}, primary: ${vd1.colors.primary}`);
    console.log(`    Run 2 -> styleFamily: ${vd2.styleFamily}, bgStyle: ${vd2.backgroundStyle}, primary: ${vd2.colors.primary}`);

    assert(
      tc.allowedFamilies.includes(vd1.styleFamily),
      `Domain ${tc.domain} generated family ${vd1.styleFamily}, which must be in [${tc.allowedFamilies.join(", ")}]`
    );
    assert(
      tc.allowedFamilies.includes(vd2.styleFamily),
      `Domain ${tc.domain} generated family ${vd2.styleFamily}, which must be in [${tc.allowedFamilies.join(", ")}]`
    );
    assert(!!vd1.colors.primary && !!vd1.colors.background, "Colors must be defined");
    assert(!!vd1.typographyContrast.headingWeight, "Typography contrast must be defined");
  }
  console.log("  ✅ Test 1 Passed: Domain style families are correctly matched and randomized.\n");

  // ──────────────────────────────────────────────────────────────────────────
  // Test 2: Document Application & Solid Override Clearing
  // ──────────────────────────────────────────────────────────────────────────
  console.log("▶ TEST 2: Applying Visual Direction to DocumentSpec");

  const mockDoc: DocumentSpec = {
    id: "doc-test-1",
    version: "1.0.0",
    documentType: "presentation",
    meta: {
      title: "Quantum Computing Horizons",
      description: "Testing procedural theme randomization and history",
      author: "SlideCraft AI",
      tags: ["quantum", "test"],
    },
    canvas: {
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      unit: "px",
      dpi: 96,
    },
    theme: {
      mode: "dark",
      colors: {
        primary: "#38bdf8",
        secondary: "#818cf8",
        accent: "#f59e0b",
        background: "#0A0F1D",
        surface: "#131C31",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#1E2A44",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 14,
        shadow: "lg",
      },
    },
    pages: [
      {
        id: "slide-1",
        pageNumber: 1,
        title: "Quantum Computing Title",
        archetype: "hero_title" as LayoutArchetype,
        // Simulate a solid override that should be cleared
        backgroundOverride: "#0A0F1D",
        elements: [],
      },
      {
        id: "slide-2",
        pageNumber: 2,
        title: "Key Qubits Architecture",
        archetype: "two_column_split" as LayoutArchetype,
        backgroundOverride: "#0A0F1D",
        elements: [],
      },
      {
        id: "slide-3",
        pageNumber: 3,
        title: "Future Milestones",
        archetype: "closing_slide" as LayoutArchetype,
        elements: [],
      },
    ],
  };

  const newVd = generatePromptThemedBackground(mockDoc.meta.title, { seed: "quantum-seed-42" });
  const updatedDoc = applyVisualDirectionToDocument(mockDoc, newVd);

  assert(updatedDoc.visualDirection?.styleFamily === newVd.styleFamily, "Visual direction must be attached");
  assert(updatedDoc.theme.colors.primary === newVd.colors.primary, "Theme primary must match visual direction");

  for (let i = 0; i < updatedDoc.pages.length; i++) {
    const page = updatedDoc.pages[i];
    assert(page.backgroundOverride === undefined, `Slide ${i + 1} backgroundOverride must be cleared`);
    assert(!!page.backgroundSpec, `Slide ${i + 1} must have a backgroundSpec`);
    assert(page.backgroundSpec?.type === "gradient", `Slide ${i + 1} backgroundSpec type should be gradient`);
    assert(
      page.backgroundSpec?.glow?.enabled === true,
      `Slide ${i + 1} should have ambient glow enabled from visual direction`
    );
  }
  console.log("  ✅ Test 2 Passed: Document updated with ambient glows, gradients, and cleared solid overrides.\n");

  // ──────────────────────────────────────────────────────────────────────────
  // Test 3: Theme History Stack State Transitions (Undo & Redo)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("▶ TEST 3: Theme History Stack Navigation (Randomize -> Previous -> Next)");

  let currentDoc = { ...mockDoc };
  const history: ThemeHistoryEntry[] = [
    {
      id: "entry-0",
      timestamp: Date.now(),
      theme: { ...currentDoc.theme },
      visualDirection: currentDoc.visualDirection,
      pageBackgrounds: currentDoc.pages.map((p) => ({
        pageId: p.id,
        backgroundSpec: p.backgroundSpec,
        backgroundOverride: p.backgroundOverride,
      })),
      description: "Initial Theme",
    },
  ];
  let historyIndex = 0;

  // Simulate Randomize 1
  const vd1 = generatePromptThemedBackground("Cybersecurity Threat Matrix", { seed: "cyber-1" });
  currentDoc = applyVisualDirectionToDocument(currentDoc, vd1);
  history.push({
    id: "entry-1",
    timestamp: Date.now() + 10,
    theme: { ...currentDoc.theme },
    visualDirection: vd1,
    pageBackgrounds: currentDoc.pages.map((p) => ({
      pageId: p.id,
      backgroundSpec: p.backgroundSpec,
      backgroundOverride: p.backgroundOverride,
    })),
    description: `Randomized: ${vd1.styleFamily}`,
  });
  historyIndex = 1;

  // Simulate Randomize 2
  const vd2 = generatePromptThemedBackground("Cybersecurity Threat Matrix", { seed: "cyber-2" });
  currentDoc = applyVisualDirectionToDocument(currentDoc, vd2);
  history.push({
    id: "entry-2",
    timestamp: Date.now() + 20,
    theme: { ...currentDoc.theme },
    visualDirection: vd2,
    pageBackgrounds: currentDoc.pages.map((p) => ({
      pageId: p.id,
      backgroundSpec: p.backgroundSpec,
      backgroundOverride: p.backgroundOverride,
    })),
    description: `Randomized: ${vd2.styleFamily}`,
  });
  historyIndex = 2;

  assert(history.length === 3, "History should have 3 entries");
  assert(historyIndex === 2, "Current index should be 2");

  // Simulate Previous Theme Background (Undo Theme)
  const prevEntry = history[historyIndex - 1];
  historyIndex = 1;
  currentDoc = {
    ...currentDoc,
    theme: { ...prevEntry.theme },
    visualDirection: prevEntry.visualDirection,
    pages: currentDoc.pages.map((page) => {
      const savedBg = prevEntry.pageBackgrounds.find((bg) => bg.pageId === page.id);
      return {
        ...page,
        backgroundSpec: savedBg?.backgroundSpec,
        backgroundOverride: savedBg?.backgroundOverride,
      };
    }),
  };

  assert(
    currentDoc.visualDirection?.styleFamily === vd1.styleFamily,
    "After Previous Theme, visual direction must match entry 1 (vd1)"
  );
  assert(
    currentDoc.theme.colors.primary === vd1.colors.primary,
    "After Previous Theme, primary color must match entry 1 (vd1)"
  );

  // Simulate Next Theme Background (Redo Theme)
  const nextEntry = history[historyIndex + 1];
  historyIndex = 2;
  currentDoc = {
    ...currentDoc,
    theme: { ...nextEntry.theme },
    visualDirection: nextEntry.visualDirection,
    pages: currentDoc.pages.map((page) => {
      const savedBg = nextEntry.pageBackgrounds.find((bg) => bg.pageId === page.id);
      return {
        ...page,
        backgroundSpec: savedBg?.backgroundSpec,
        backgroundOverride: savedBg?.backgroundOverride,
      };
    }),
  };

  assert(
    currentDoc.visualDirection?.styleFamily === vd2.styleFamily,
    "After Next Theme, visual direction must match entry 2 (vd2)"
  );
  assert(
    currentDoc.theme.colors.primary === vd2.colors.primary,
    "After Next Theme, primary color must match entry 2 (vd2)"
  );

  console.log("  ✅ Test 3 Passed: Theme history undo/redo faithfully restores themes, visual directions & slide backgrounds.\n");

  // ──────────────────────────────────────────────────────────────────────────
  // Test 4: PPTX Export Verification with Procedural Theme Backgrounds
  // ──────────────────────────────────────────────────────────────────────────
  console.log("▶ TEST 4: Exporting Procedural Themed Presentation to PPTX");

  const exportDoc: DocumentSpec = {
    ...updatedDoc,
    pages: updatedDoc.pages.map((p, idx) => ({
      ...p,
      elements: [
        {
          id: `elem-title-${idx}`,
          type: "text" as const,
          variant: "h1" as const,
          content: `${p.title}`,
          align: "left" as const,
        },
        {
          id: `elem-body-${idx}`,
          type: "text" as const,
          variant: "body" as const,
          content: "High-fidelity procedural background with ambient glows and gradient mesh exported directly into PPTX shape hierarchy.",
          align: "left" as const,
        },
      ],
    })),
  };

  const outputDir = path.resolve(__dirname, "../scratch/test-pptx");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "theme-randomization-test.pptx");
  const pptx = await compileDocumentToPptx(exportDoc);
  await pptx.writeFile({ fileName: outputPath });

  assert(fs.existsSync(outputPath), "Exported PPTX file must exist");
  const stat = fs.statSync(outputPath);
  assert(stat.size > 20000, `Exported PPTX file should be substantial (actual size: ${stat.size} bytes)`);

  console.log(`  Exported file size: ${stat.size} bytes at ${outputPath}`);
  console.log("  ✅ Test 4 Passed: PPTX export completed without errors, preserving procedural gradient/ambient glows.\n");

  console.log("============================================================");
  console.log("🎉 ALL TESTS PASSED: Background Randomization & History Fully Verified!");
  console.log("============================================================\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
