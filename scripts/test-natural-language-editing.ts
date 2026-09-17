import {
  DocumentSpec,
  createEmptyDocument,
  DocumentSpecSchema,
} from "../src/types/document-spec";
import { resolveEditScope } from "../src/lib/ai/editor/scope-resolver";
import { executePatches, generateAlternativeVariants } from "../src/lib/ai/editor/patch-engine";
import { runQualityChecks } from "../src/lib/ai/editor/quality-checker";
import { modifyDocumentWithAi } from "../src/lib/ai/editor/modifier-service";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${message}`);
}

async function runNaturalLanguageEditingTests() {
  console.log("=== STARTING NATURAL-LANGUAGE EDITING VERIFICATION SUITE ===\n");

  // Setup base test document with 5 slides
  const baseDoc = createEmptyDocument("Enterprise Cloud Deck");
  baseDoc.pages = [
    {
      id: "slide-1",
      pageNumber: 1,
      archetype: "hero_title",
      title: "Enterprise Cloud Architecture",
      subtitle: "Accelerating mission-critical deployments",
      elements: [
        {
          type: "text",
          id: "t1",
          variant: "h1",
          content: "Enterprise Cloud Architecture",
          align: "left",
        },
      ],
    },
    {
      id: "slide-2",
      pageNumber: 2,
      archetype: "three_card_grid",
      title: "Core Pillars",
      elements: [
        {
          type: "text",
          id: "t2",
          variant: "body",
          content:
            "Our multi-tier infrastructure enables resilient distributed execution with zero downtime and automated failover guarantees across availability zones.",
          align: "left",
        },
      ],
    },
    {
      id: "slide-3",
      pageNumber: 3,
      archetype: "two_column_split",
      title: "Performance Metrics",
      elements: [
        {
          type: "metric",
          id: "m1",
          value: "99.99%",
          label: "Uptime SLA",
        },
      ],
    },
    {
      id: "slide-4",
      pageNumber: 4,
      archetype: "title_and_content",
      title: "Detailed Operations",
      elements: [
        {
          type: "text",
          id: "t4",
          variant: "body",
          content:
            "This is an extraordinarily verbose paragraph describing operational logistics in extensive depth. It continues across many lines discussing maintenance windows, database indexing procedures, backup rotation policies, and telemetry monitoring guidelines.",
          align: "left",
        },
      ],
    },
    {
      id: "slide-5",
      pageNumber: 5,
      archetype: "closing_slide",
      title: "Next Steps & Discussion",
      elements: [
        {
          type: "text",
          id: "t5",
          variant: "h1",
          content: "Thank You",
          align: "center",
        },
      ],
    },
  ];

  // --------------------------------------------------------------------------
  // TEST 1: Scope Resolver & Ambiguity Detection
  // --------------------------------------------------------------------------
  console.log("[TEST 1] Scope Resolution & Ambiguity Detection");

  // 1a: Specific slide targeting ("Reduce the text on slide 4")
  const scopeSlide4 = resolveEditScope("Reduce the text on slide 4", {
    doc: baseDoc,
    activePageIndex: 0,
  });
  assert(scopeSlide4.scope.type === "page", "Identifies page scope for 'slide 4'");
  assert(scopeSlide4.scope.pageIndex === 3, "Resolves 'slide 4' to 0-indexed pageIndex 3");

  // 1b: Whole document targeting ("Make this more professional")
  const scopeDoc = resolveEditScope("Make this more professional", {
    doc: baseDoc,
    activePageIndex: 1,
  });
  assert(scopeDoc.scope.type === "document", "Identifies document scope for 'Make this more professional'");

  // 1c: Element level targeting with selectedElementId
  const scopeEl = resolveEditScope("Make this bolder", {
    doc: baseDoc,
    activePageIndex: 0,
    selectedElementId: "t1",
  });
  assert(scopeEl.scope.type === "element", "Identifies element scope when element is selected");
  assert(scopeEl.scope.elementId === "t1", "Targets selectedElementId 't1'");

  // 1d: Ambiguity detection ("make it better")
  const ambiguousCheck = resolveEditScope("make it better", {
    doc: baseDoc,
    activePageIndex: 0,
  });
  assert(
    ambiguousCheck.clarification !== undefined && ambiguousCheck.clarification.needsClarification === true,
    "Flags 'make it better' as ambiguous"
  );
  assert(
    ambiguousCheck.clarification!.options.length >= 3,
    "Provides clickable clarification options"
  );

  // --------------------------------------------------------------------------
  // TEST 2: Patch Execution Engine - Scenarios 1 to 7
  // --------------------------------------------------------------------------
  console.log("\n[TEST 2] Atomic Patch Execution on Scenarios 1 to 7");

  // Scenario 1: "Make this more professional"
  const resProf = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Make this more professional",
    pageIndex: 0,
  });
  assert(resProf.success, "Executes 'Make this more professional'");
  assert(resProf.updatedDocument.theme.colors.primary === "#1E3A8A", "Applies Classic Navy primary color");
  assert(resProf.updatedDocument.theme.typography.headingFont === "Plus Jakarta Sans", "Applies Plus Jakarta Sans");

  // Scenario 2: "Reduce the text on slide 4"
  const resReduce = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Reduce the text on slide 4",
    pageIndex: 0,
  });
  assert(resReduce.success, "Executes 'Reduce the text on slide 4'");
  const slide4Text = (resReduce.updatedDocument.pages[3].elements[0] as any).content;
  assert(slide4Text.length < (baseDoc.pages[3].elements[0] as any).content.length, "Condenses verbose text on slide 4");

  // Scenario 3: "Convert this slide into a timeline"
  const resTimeline = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Convert this slide into a timeline",
    pageIndex: 1,
  });
  assert(resTimeline.success, "Executes 'Convert this slide into a timeline'");
  assert(resTimeline.updatedDocument.pages[1].archetype === "horizontal_timeline", "Updates archetype to horizontal_timeline");
  const hasTimelineFlow = resTimeline.updatedDocument.pages[1].elements.some(
    (e) => e.type === "infographic_workflow"
  );
  assert(hasTimelineFlow, "Injects infographic timeline workflow element");

  // Scenario 4: "Make the poster more colorful"
  const posterDoc = createEmptyDocument("Campus Tech Summit", "poster");
  const resColorful = await modifyDocumentWithAi({
    currentDocument: posterDoc,
    instruction: "Make the poster more colorful",
  });
  assert(resColorful.success, "Executes 'Make the poster more colorful'");

  // Scenario 5: "Use a Microsoft-inspired design"
  const resMs = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Use a Microsoft-inspired design",
  });
  assert(resMs.success, "Executes 'Use a Microsoft-inspired design'");
  assert(resMs.updatedDocument.theme.colors.primary === "#0078D4", "Applies Microsoft Fluent Blue (#0078D4)");
  assert(resMs.updatedDocument.theme.typography.headingFont === "Segoe UI", "Applies Segoe UI font");

  // Scenario 6: "Increase the title size"
  const resTitle = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Increase the title size",
    pageIndex: 0,
  });
  assert(resTitle.success, "Executes 'Increase the title size'");

  // Scenario 7: "Change the background to dark blue"
  const resDarkBlue = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Change the background to dark blue",
  });
  assert(resDarkBlue.success, "Executes 'Change the background to dark blue'");
  assert(resDarkBlue.updatedDocument.theme.colors.background === "#0A192F", "Applies deep marine background #0A192F");

  // --------------------------------------------------------------------------
  // TEST 3: Patch Execution Engine - Scenarios 8 to 14
  // --------------------------------------------------------------------------
  console.log("\n[TEST 3] Atomic Patch Execution on Scenarios 8 to 14");

  // Scenario 8: "Make the layout more minimal"
  const resMinimal = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Make the layout more minimal",
    pageIndex: 0,
  });
  assert(resMinimal.success, "Executes 'Make the layout more minimal'");
  assert(resMinimal.updatedDocument.theme.colors.background === "#FFFFFF", "Applies clean white minimal canvas");

  // Scenario 9: "Add a comparison table"
  const resTable = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Add a comparison table",
    pageIndex: 2,
  });
  assert(resTable.success, "Executes 'Add a comparison table'");
  assert(resTable.updatedDocument.pages[2].archetype === "comparison_table", "Sets archetype to comparison_table");
  assert(resTable.updatedDocument.pages[2].elements.some((e) => e.type === "table"), "Appends table element");

  // Scenario 10: "Turn this paragraph into three visual steps"
  const resSteps = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Turn this paragraph into three visual steps",
    pageIndex: 1,
  });
  assert(resSteps.success, "Executes 'Turn this paragraph into three visual steps'");
  assert(resSteps.updatedDocument.pages[1].archetype === "process_flowchart", "Sets archetype to process_flowchart");

  // Scenario 11: "Make all diagrams editable"
  const resDiag = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Make all diagrams editable",
  });
  assert(resDiag.success, "Executes 'Make all diagrams editable'");
  const hasDiagramOnAnySlide = resDiag.updatedDocument.pages.some((p) =>
    p.elements.some((e) => e.type === "diagram")
  );
  assert(hasDiagramOnAnySlide, "Injects structured editable DAG diagram");

  // Scenario 12: "Reorder slides"
  const resReorder = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Reorder slides",
  });
  assert(resReorder.success, "Executes 'Reorder slides'");
  assert(resReorder.updatedDocument.pages[0].id === "slide-5", "Reorders slides sequence as requested");

  // Scenario 13: "Create two alternative versions"
  const resAlts = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "Create two alternative versions",
  });
  assert(resAlts.success, "Executes 'Create two alternative versions'");
  assert(resAlts.alternatives !== undefined && resAlts.alternatives.length === 2, "Returns exactly 2 design alternatives");
  assert(resAlts.alternatives![0].id === "variant-a", "Variant A is present");
  assert(resAlts.alternatives![1].id === "variant-b", "Variant B is present");

  // --------------------------------------------------------------------------
  // TEST 4: Quality Checks & Automated Repair
  // --------------------------------------------------------------------------
  console.log("\n[TEST 4] Quality Checker & Auto-Repair");

  // Document with bad contrast (dark gray text on black background)
  const badDoc = JSON.parse(JSON.stringify(baseDoc)) as DocumentSpec;
  badDoc.theme.colors.background = "#000000";
  badDoc.theme.colors.textPrimary = "#111111"; // Very low contrast
  (badDoc.pages[0].elements[0] as any).position = { x: -50, y: -20, width: 400, height: 100 }; // Out of bounds

  const qualityReport = runQualityChecks(badDoc, true);
  assert(qualityReport.issues.length >= 2, "Identified contrast and boundary issues");
  assert(qualityReport.repairedAutomatically, "Successfully repaired issues automatically");
  assert((badDoc.pages[0].elements[0] as any).position!.x === 0, "Clamped negative X coordinate to 0");
  assert(badDoc.theme.colors.textPrimary === "#F8FAFC", "Auto-repaired text color to high-contrast white");

  // --------------------------------------------------------------------------
  // TEST 5: Zod Schema Compliance on All Outputs
  // --------------------------------------------------------------------------
  console.log("\n[TEST 5] Complete DocumentSpec Zod Validation on Outputs");
  DocumentSpecSchema.parse(resProf.updatedDocument);
  DocumentSpecSchema.parse(resReduce.updatedDocument);
  DocumentSpecSchema.parse(resTimeline.updatedDocument);
  DocumentSpecSchema.parse(resMs.updatedDocument);
  DocumentSpecSchema.parse(resTable.updatedDocument);
  DocumentSpecSchema.parse(resSteps.updatedDocument);
  DocumentSpecSchema.parse(resDiag.updatedDocument);
  DocumentSpecSchema.parse(resAlts.alternatives![0].document);
  DocumentSpecSchema.parse(resAlts.alternatives![1].document);
  console.log("  ✓ PASS: All 9 modified outputs strictly satisfy DocumentSpecSchema");

  console.log("\n============================================================");
  console.log("ALL NATURAL-LANGUAGE EDITING TESTS PASSED SUCCESSFULLY!");
  console.log("============================================================\n");
}

runNaturalLanguageEditingTests().catch((err) => {
  console.error("Test Suite Unhandled Exception:", err);
  process.exit(1);
});
