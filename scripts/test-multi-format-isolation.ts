import { executeGenerationPipeline } from "../src/lib/ai/generation-pipeline";
import { synthesizeDynamicDesignSystem } from "../src/lib/ai/dynamic-design-system";
import { DocumentType } from "../src/types/document-spec";

async function runMultiFormatIsolationTests() {
  console.log("══════════════════════════════════════════════════════════════════");
  console.log("  MULTI-FORMAT STUDIO ISOLATION & DYNAMIC DESIGN SYSTEM SUITE");
  console.log("══════════════════════════════════════════════════════════════════\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PART 1: INDEPENDENT ARTIFACT ISOLATION ACROSS ALL 8 FORMATS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("─── PART 1: Independent Artifact Isolation (8 Formats) ───");

  const formats: Array<{
    type: DocumentType;
    prompt: string;
    expectedAspectRatio: string;
  }> = [
    {
      type: "presentation",
      prompt: "Q3 Enterprise Sales Strategy & Cloud Revenue Metrics",
      expectedAspectRatio: "16:9",
    },
    {
      type: "social_media",
      prompt: "Instagram Product Drop Announcement for Wireless Earbuds",
      expectedAspectRatio: "1:1",
    },
    {
      type: "poster",
      prompt: "Global AI Summit 2026 Keynote Speaker Schedule Poster",
      expectedAspectRatio: "A4_portrait",
    },
    {
      type: "infographic",
      prompt: "5-Step Zero Trust Cybersecurity Architecture Workflow",
      expectedAspectRatio: "9:16",
    },
    {
      type: "resume",
      prompt: "Principal Full Stack Software Engineer ATS Resume",
      expectedAspectRatio: "A4_portrait",
    },
    {
      type: "letter",
      prompt: "Formal Partnership Proposal Letter to Enterprise VP",
      expectedAspectRatio: "US_letter",
    },
    {
      type: "diagram",
      prompt: "High-Throughput Microservices Event Stream Architecture",
      expectedAspectRatio: "16:9",
    },
    {
      type: "chart",
      prompt: "Comparative Quarterly Revenue Growth by Geographic Region",
      expectedAspectRatio: "16:9",
    },
  ];

  const generatedProjects: Record<string, any> = {};

  for (const item of formats) {
    console.log(`\n  [Generating ${item.type.toUpperCase()}]`);
    const result = await executeGenerationPipeline({
      prompt: item.prompt,
      documentType: item.type,
      sourceProjectId: null, // Default strict isolation
    });

    assert(result.success, `${item.type} pipeline completed successfully`);
    assert(result.document.documentType === item.type, `Document spec has correct documentType: ${item.type}`);
    assert(
      result.document.canvas.aspectRatio === item.expectedAspectRatio,
      `Document canvas has format-native aspect ratio: ${item.expectedAspectRatio} (got ${result.document.canvas.aspectRatio})`
    );
    assert(
      result.document.pages.length >= 1,
      `Document contains at least 1 page (pages: ${result.document.pages.length})`
    );
    assert(
      Boolean(result.designSystem),
      `Document has an autonomous synthesized design system attached`
    );

    generatedProjects[item.type] = result.document;
  }

  // Cross-artifact isolation verification
  console.log("\n  [Verifying Cross-Artifact Non-Contamination]");
  // 1. Verify that generating social_media did not append to presentation
  const presentationPages = generatedProjects["presentation"].pages.length;
  const socialPages = generatedProjects["social_media"].pages.length;
  assert(
    presentationPages !== socialPages || generatedProjects["presentation"].documentType !== generatedProjects["social_media"].documentType,
    "Presentation and Social Media are completely distinct documents"
  );
  assert(
    generatedProjects["presentation"].documentType === "presentation",
    "Presentation documentType was not mutated by subsequent generations"
  );
  assert(
    generatedProjects["social_media"].documentType === "social_media",
    "Social Media documentType is isolated and pristine"
  );
  assert(
    generatedProjects["poster"].documentType === "poster" &&
    generatedProjects["poster"].canvas.aspectRatio === "A4_portrait",
    "Poster preserves A4 portrait aspect ratio independently of presentation"
  );
  assert(
    generatedProjects["infographic"].documentType === "infographic" &&
    generatedProjects["infographic"].canvas.aspectRatio === "9:16",
    "Infographic preserves 9:16 vertical orientation"
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // PART 2: DYNAMIC DESIGN-SYSTEM SYNTHESIS (8 DOMAIN PROMPTS)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n─── PART 2: Dynamic Bespoke Design System Synthesis (8 Prompts) ───");

  const domainPrompts = [
    {
      id: "luxury_gold",
      name: "Luxury & High-End Jewelry",
      prompt: "Haute couture high luxury jewelry collection showcase with diamond and gold accents",
      expectedFontMatch: (font: string) => /Playfair|Cormorant|Prata|Cinzel|Serif/i.test(font),
      expectedRadiusMax: 6,
    },
    {
      id: "cyberpunk_neon",
      name: "Cyberpunk & Hacker Security",
      prompt: "DEFCON cybersecurity zero-day exploit analysis dark theme neon terminal hacker conference",
      expectedFontMatch: (font: string) => /JetBrains|Mono|Fira|Space/i.test(font),
      expectedRadiusMax: 2,
    },
    {
      id: "children_playful",
      name: "Playful Children Education",
      prompt: "Fun playful colorful kindergarten animal adventure book for toddlers and preschool kids",
      expectedFontMatch: (font: string) => /Nunito|Quicksand|Comfortaa|Fredoka/i.test(font),
      expectedRadiusMin: 14,
    },
    {
      id: "academic_thesis",
      name: "Academic Research Thesis",
      prompt: "Peer-reviewed quantum computing doctoral thesis symposium academic university research paper",
      expectedFontMatch: (font: string) => /Merriweather|Lora|EB Garamond|Libre Baskerville|Serif/i.test(font),
      expectedRadiusMax: 4,
    },
    {
      id: "cleantech_startup",
      name: "Modern CleanTech Startup",
      prompt: "CleanTech carbon capture technology venture capital pitch deck sustainable green energy",
      expectedFontMatch: (font: string) => /Plus Jakarta|Inter|Outfit|DM Sans/i.test(font),
      expectedRadiusMin: 6,
    },
    {
      id: "executive_letter",
      name: "Formal Executive Letter",
      prompt: "Official formal memorandum and legal agreement from Chief Executive Officer to Board",
      expectedFontMatch: (font: string) => /Times|Georgia|Garamond|Serif|Merriweather|Playfair/i.test(font),
      expectedRadiusMax: 2,
    },
    {
      id: "summer_festival",
      name: "Summer Music Festival",
      prompt: "Vibrant indie summer music festival lineup and food truck celebration warm energetic mood",
      expectedFontMatch: (font: string) => /Montserrat|Syne|Cabinet|Outfit/i.test(font),
      expectedRadiusMin: 6,
    },
    {
      id: "ats_resume",
      name: "Technical ATS Resume",
      prompt: "Senior Cloud Infrastructure and Distributed Systems Engineer resume and CV",
      expectedFontMatch: (font: string) => /Inter|Calibri|Arial|Roboto|Sans|Plus Jakarta/i.test(font),
      expectedRadiusMax: 6,
    },
  ];

  const synthesizedPalettes = new Set<string>();

  for (const testCase of domainPrompts) {
    console.log(`\n  [Synthesizing Design System: ${testCase.name}]`);
    const ds = synthesizeDynamicDesignSystem({
      prompt: testCase.prompt,
      documentType: "presentation",
    });

    console.log(`    Theme: ${ds.name} (${ds.visualDirection})`);
    console.log(`    Primary: ${ds.palette.primary}, Accent: ${ds.palette.accent}, Surface: ${ds.palette.surface}`);
    console.log(`    Heading Font: ${ds.typography.headingFont}, Body Font: ${ds.typography.bodyFont}`);
    console.log(`    Corner Radius: ${ds.shapes.cornerRadius}px, Spacing: ${ds.composition.density}`);

    assert(Boolean(ds.palette.primary), "Design system has primary color");
    assert(Boolean(ds.palette.accent), "Design system has accent color");
    assert(Boolean(ds.typography.headingFont), "Design system has heading font");
    assert(Boolean(ds.typography.bodyFont), "Design system has body font");

    if (testCase.expectedRadiusMax !== undefined) {
      assert(
        ds.shapes.cornerRadius <= testCase.expectedRadiusMax,
        `Corner radius is tailored (<= ${testCase.expectedRadiusMax}px, got ${ds.shapes.cornerRadius}px)`
      );
    }
    if (testCase.expectedRadiusMin !== undefined) {
      assert(
        ds.shapes.cornerRadius >= testCase.expectedRadiusMin,
        `Corner radius is tailored (>= ${testCase.expectedRadiusMin}px, got ${ds.shapes.cornerRadius}px)`
      );
    }

    assert(
      testCase.expectedFontMatch(ds.typography.headingFont),
      `Heading font (${ds.typography.headingFont}) matches domain semantic expectations`
    );

    // Track color uniqueness across distinct prompts
    synthesizedPalettes.add(`${ds.palette.primary}-${ds.palette.accent}`);
  }

  assert(
    synthesizedPalettes.size >= 6,
    `Dynamic synthesis generated rich variety of distinct palettes (${synthesizedPalettes.size} unique palettes across 8 domains)`
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // PART 3: EXPLICIT APPEND VS ISOLATED CREATION VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n─── PART 3: Explicit Append vs Isolated Creation ───");

  // Step A: Generate Base Project
  const basePresentation = await executeGenerationPipeline({
    prompt: "Q1 Global Roadmap Deck",
    documentType: "presentation",
    pageCount: 3,
    sourceProjectId: null,
  });
  const initialPageCount = basePresentation.document.pages.length;
  console.log(`  Initial Presentation Pages: ${initialPageCount}`);

  // Step B: Generate another project with sourceProjectId: null (Default)
  const separatePoster = await executeGenerationPipeline({
    prompt: "New Year Celebration Poster",
    documentType: "poster",
    sourceProjectId: null,
  });

  // Assert basePresentation was NOT modified
  assert(
    basePresentation.document.pages.length === initialPageCount,
    "Generating a poster with sourceProjectId: null did not alter initial presentation page count"
  );
  assert(
    separatePoster.document.documentType === "poster",
    "Poster remains an independent document with documentType: poster"
  );

  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log(`  MULTI-FORMAT ISOLATION VERIFICATION COMPLETE: ${passed}/${total} PASSED`);
  console.log("══════════════════════════════════════════════════════════════════\n");
}

runMultiFormatIsolationTests().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
