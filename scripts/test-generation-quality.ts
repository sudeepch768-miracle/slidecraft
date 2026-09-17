/**
 * test-generation-quality.ts
 * Rigorous end-to-end test suite for the overhauled generation pipeline,
 * theme engine, layout selection, text fitting, and PPTX export consistency.
 */

import { normalizeContentInput } from "../src/lib/ai/content-normalizer";
import { selectLayoutArchetype, classifyContent } from "../src/lib/ai/layout-selector";
import { selectThemeFromPrompt, detectPromptDomain, detectPromptTone } from "../src/lib/ai/theme-generator";
import { createDeterministicFallbackDoc, executeGenerationPipeline } from "../src/lib/ai/generation-pipeline";
import { validateFormatSpec } from "../src/types/schemas/project-spec-schemas";
import { calculateFittedFontSize, wrapText, measureTextWidth } from "../src/lib/layout-engine/text-measurer";
import { validateBeforeExport } from "../src/lib/compiler/pptx/pre-export-validator";
import { compileDocumentToPptx } from "../src/lib/compiler/pptx/pptx-builder";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, description: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${description}`);
  } else {
    console.error(`  ❌ FAIL: ${description}`);
  }
}

async function runQualityTests() {
  console.log("==================================================================");
  console.log("SLIDECRAFT AI — GENERATION QUALITY & ARCHITECTURE TEST SUITE");
  console.log("==================================================================");

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 1: Topic Domain & Tone Detection
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 1] Domain & Tone Detection");
  {
    const techPrompt = "Kubernetes cloud microservices deployment on AWS infrastructure";
    assert(detectPromptDomain(techPrompt) === "technology", "Detected 'technology' domain for Kubernetes prompt");

    const medPrompt = "Clinical study on patient oncology outcomes in regional hospital";
    assert(detectPromptDomain(medPrompt) === "healthcare", "Detected 'healthcare' domain for medical prompt");

    const finPrompt = "Q3 annual revenue analysis, EBITDA growth and portfolio returns";
    assert(detectPromptDomain(finPrompt) === "finance", "Detected 'finance' domain for financial prompt");

    const academicPrompt = "Formal academic thesis methodology and systematic literature review";
    assert(detectPromptTone(academicPrompt) === "academic", "Detected 'academic' tone for thesis prompt");
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 2: Theme Selection Responsiveness (No Fixed Navy Theme)
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 2] Prompt-Responsive Theme Selection");
  {
    const techTheme = selectThemeFromPrompt("Kubernetes microservices architecture on AWS cloud");
    const financeTheme = selectThemeFromPrompt("Q3 corporate banking portfolio investment returns");
    const healthTheme = selectThemeFromPrompt("Clinical healthcare oncology patient trials in hospital");
    const creativeTheme = selectThemeFromPrompt("Creative visual design agency portfolio and brand identity");

    // Must NOT all be the same color
    const uniquePrimaryColors = new Set([
      techTheme.colors.primary,
      financeTheme.colors.primary,
      healthTheme.colors.primary,
      creativeTheme.colors.primary,
    ]);

    assert(uniquePrimaryColors.size >= 3, `Diverse themes selected across domains (got ${uniquePrimaryColors.size} unique primaries)`);
    assert(techTheme.mode === "dark", "Tech theme correctly defaults to dark mode");
    assert(healthTheme.typography.headingFont === "Nunito", "Health theme uses friendly Nunito typography");
    assert(financeTheme.typography.headingFont === "Playfair Display", "Finance theme uses formal Playfair Display typography");
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 3: Content Normalizer Intent & Entity Extraction
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 3] Intent, Constraints, and Entity Extraction");
  {
    const richPrompt = `Series A Pitch Deck for Synthetix AI.
We have reached $4.2M ARR with +120% YoY growth across 18,000 active enterprises.
Founded in 2023 by Dr. Sarah Chen and Marcus Vance.
Targeting Q4 2026 expansion into European markets.
Must ensure SOC2 Type II compliance and 99.99% availability SLA.
Visit https://synthetix.ai/investors for data room.`;

    const brief = normalizeContentInput(richPrompt, { documentType: "presentation" });

    assert(brief.hardConstraints.some(c => c.includes("$4.2M")), "Extracted financial metric ($4.2M)");
    assert(brief.hardConstraints.some(c => c.includes("+120%")), "Extracted growth percentage (+120%)");
    assert(brief.extractedDates.some(d => d.includes("2023") || d.includes("Q4")), "Extracted milestone date/quarter");
    assert(brief.extractedUrls.some(u => u.includes("synthetix.ai")), "Extracted investor URL");
    assert(brief.targetAudience.toLowerCase().includes("investor"), "Identified investor audience");
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 4: Layout Archetype Diversity (No Consecutive Duplicates)
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 4] Layout Archetype Diversity & Transition Rules");
  {
    const categories = classifyContent("Q3 ARR reached $15M with 45% margin and 3.2x LTV");
    assert(categories.includes("statistic"), "Content classified as 'statistic'");

    const processCategories = classifyContent("Phase 1 discovery, then architecture design, followed by deployment pipeline");
    assert(processCategories.includes("process") || processCategories.includes("timeline"), "Content classified as 'process' or 'timeline'");

    const assigned: any[] = [];
    for (let i = 0; i < 6; i++) {
      const cats = i % 2 === 0 ? ["statistic"] : ["bullet_list"];
      const arch = selectLayoutArchetype(cats as any, i, assigned, 6);
      assigned.push(arch);
    }

    // Check no two consecutive archetypes are identical
    let hasConsecutiveDupes = false;
    for (let i = 1; i < assigned.length; i++) {
      if (assigned[i] === assigned[i - 1]) {
        hasConsecutiveDupes = true;
        break;
      }
    }
    assert(!hasConsecutiveDupes, "Zero consecutive duplicate layout archetypes in 6-slide deck");
    assert(assigned[0] === "hero_title", "First slide is hero_title");
    assert(assigned[5] === "closing_slide" || assigned[5] === "summary", "Last slide is closing_slide or summary");
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 5: Deterministic Fallback Quality (Zero Generic SlideCraft Filler)
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 5] Deterministic Fallback Real Data Retention");
  {
    const prompt = "Cybersecurity incident response plan for Global Logistics Inc. Target SLA: 15 minutes. Contact security@globallogistics.com.";
    const brief = normalizeContentInput(prompt, { documentType: "presentation" });
    const theme = selectThemeFromPrompt(prompt);
    const doc = createDeterministicFallbackDoc(brief, "presentation", "16:9", ["hero_title", "two_column_split", "closing_slide"], theme);

    const docString = JSON.stringify(doc);

    assert(!docString.includes("candidate@slidecraft.ai"), "Eliminated hardcoded candidate@slidecraft.ai");
    assert(!docString.includes("SlideCraft Events Committee"), "Eliminated hardcoded SlideCraft Events Committee");
    assert(!docString.includes("Alex Mercer"), "Eliminated hardcoded Alex Mercer");
    assert(docString.includes("Cybersecurity") || docString.includes("Global Logistics"), "Retains actual prompt terminology");

    const valResult = validateFormatSpec(doc);
    assert(valResult.success, "Deterministic fallback conforms strictly to ProjectSpec schema");
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 6: All 8 Document Types Produce Valid Schemas
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 6] Multi-Format Schema Validation (All 8 Types)");
  {
    const formats = [
      "presentation",
      "poster",
      "infographic",
      "social_media",
      "resume",
      "letter",
      "diagram",
      "chart",
    ] as const;

    for (const fmt of formats) {
      const brief = normalizeContentInput(`Specialized ${fmt} demonstration for enterprise client`, { documentType: fmt });
      const theme = selectThemeFromPrompt(brief.coreTopic);
      const aspect = fmt === "infographic" ? "9:16" : fmt === "social_media" ? "1:1" : fmt === "letter" ? "US_letter" : fmt === "poster" || fmt === "resume" ? "A4_portrait" : "16:9";
      const doc = createDeterministicFallbackDoc(brief, fmt, aspect, ["hero_title", "three_card_grid"], theme);
      const val = validateFormatSpec(doc);
      assert(val.success, `Format '${fmt}' produces valid schema (${val.success})`);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 7: Text Measurer & Auto-Fitting
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 7] Text Measurement & Auto-Fitting Algorithms");
  {
    const shortText = "Executive Summary";
    const longParagraph = "Our enterprise platform coordinates distributed microservices across multi-region Kubernetes clusters, providing real-time telemetry, automated zero-downtime canary rollouts, and deep cryptographic attestation for critical workloads.";

    const shortWidth = measureTextWidth(shortText, 24, "Inter", "bold");
    assert(shortWidth > 50 && shortWidth < 400, `Calculated reasonable width for short heading (${shortWidth.toFixed(1)}px)`);

    const lines = wrapText(longParagraph, 300, 16, "Inter");
    assert(lines.length >= 3, `Wrapped long text into ${lines.length} lines for 300px width`);

    const fitted = calculateFittedFontSize(longParagraph, 400, 100, 32, 12, "Inter");
    assert(fitted.fits, `Auto-fit scaled down font size to ${fitted.fontSize}px to fit bounding box`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 8: Pre-Export Validator
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 8] Pre-Export Validation Checks");
  {
    const brief = normalizeContentInput("Valid presentation test");
    const theme = selectThemeFromPrompt("test");
    const validDoc = createDeterministicFallbackDoc(brief, "presentation", "16:9", ["hero_title", "two_column_split"], theme);

    const validResult = validateBeforeExport(validDoc as any);
    assert(validResult.canExport, "Valid document passes pre-export validation");

    // Invalid document: empty pages
    const emptyDoc: any = {
      version: "1.0.0",
      documentType: "presentation",
      meta: { title: "Empty" },
      canvas: validDoc.canvas,
      theme: validDoc.theme,
      pages: [],
    };
    const invalidResult = validateBeforeExport(emptyDoc);
    assert(!invalidResult.canExport, "Document with 0 pages correctly blocked from export");
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 9: PPTX Native Compiler Execution
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 9] Native PPTX Compiler Buffer Generation");
  {
    const brief = normalizeContentInput("High-Performance Cloud Computing Architecture with 99.99% Availability");
    const theme = selectThemeFromPrompt("cloud computing");
    const doc = createDeterministicFallbackDoc(brief, "presentation", "16:9", ["hero_title", "four_metric_dashboard", "two_column_split", "closing_slide"], theme);

    try {
      const pptx = await compileDocumentToPptx(doc as any);
      const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
      assert(buffer.length > 5000, `PPTX compiled successfully into valid binary buffer (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      assert(false, `PPTX compilation failed: ${err.message}`);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 10: End-to-End Pipeline Execution (Dry Run with Deterministic Mode)
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 10] Full Generation Pipeline Execution");
  {
    const result = await executeGenerationPipeline({
      prompt: "AI-Powered Diagnostics in Telemedicine. $28M revenue, 98.4% diagnostic accuracy across 500 clinics.",
      documentType: "presentation",
      pageCount: 4,
    });

    assert(result.success, "Pipeline completed successfully");
    assert(result.document.pages.length === 4, `Generated exact requested page count (${result.document.pages.length} slides)`);
    assert(result.chosenTheme.colors.primary !== "#000000", `Selected valid theme color (${result.chosenTheme.colors.primary})`);
    assert(result.progressUpdates.length >= 10, `Emitted comprehensive progress telemetry (${result.progressUpdates.length} updates)`);
  }

  console.log("\n==================================================================");
  console.log(`RESULTS: ${passedTests} / ${totalTests} assertions passed (${((passedTests / totalTests) * 100).toFixed(0)}%)`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runQualityTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
