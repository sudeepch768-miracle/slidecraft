import { modifyDocumentWithAi } from "../src/lib/ai/editor/modifier-service";
import { createEmptyDocument, DocumentSpec } from "../src/types/document-spec";

async function runModifierTests() {
  console.log("--- Starting AI Modification Operations Tests ---");

  // Build a test document with 4 slides
  const baseDoc: DocumentSpec = createEmptyDocument("Strategic Enterprise Transformation");
  baseDoc.pages = [
    {
      id: "slide-1",
      pageNumber: 1,
      archetype: "hero_title",
      title: "Executive Vision",
      subtitle: "Navigating AI Transformation",
      elements: [
        { type: "text", id: "txt-1", variant: "body", content: "Initial high-level summary.", align: "left" }
      ]
    },
    {
      id: "slide-2",
      pageNumber: 2,
      archetype: "two_column_split",
      title: "Operational Pillars",
      isLocked: true, // LOCKED SLIDE
      elements: [
        { type: "text", id: "txt-2", variant: "body", content: "Locked content that must never be altered.", align: "left" }
      ]
    },
    {
      id: "slide-3",
      pageNumber: 3,
      archetype: "title_and_content",
      title: "Technology Stack",
      elements: [
        { type: "text", id: "txt-3", variant: "body", content: "Overview of core architecture.", align: "left" }
      ]
    },
    {
      id: "slide-4",
      pageNumber: 4,
      archetype: "full_bleed_visual",
      title: "Visual Assets",
      elements: [
        { type: "media", id: "med-4", url: "https://old-image.png", mediaType: "image", fit: "cover" }
      ]
    }
  ];

  // Test 1: "Make slide 3 more detailed"
  console.log("\n[Test 1] Executing: 'make slide 3 more detailed'...");
  const res1 = await modifyDocumentWithAi({
    currentDocument: baseDoc,
    instruction: "make slide 3 more detailed",
    pageIndex: 0, // Even if user is on slide 1, it must target slide 3!
  });

  const slide3Res = res1.updatedDocument.pages[2];
  if (!slide3Res) throw new Error("Slide 3 not found in result");
  const hasDetailList = slide3Res.elements.some((e) => e.type === "list");
  if (!hasDetailList) throw new Error("Test 1 Failed: Slide 3 was not expanded with detailed items");
  if ((res1.updatedDocument.pages[1].elements[0] as any).content !== "Locked content that must never be altered.") {
    throw new Error("Test 1 Failed: Slide 2 (locked) was mutated!");
  }
  console.log("✓ Test 1 Passed: Slide 3 targeted and expanded; locked Slide 2 unchanged.");

  // Test 2: "Add a case study" on Slide 1
  console.log("\n[Test 2] Executing: 'add a case study' on Slide 1...");
  const res2 = await modifyDocumentWithAi({
    currentDocument: res1.updatedDocument,
    instruction: "add a case study",
    pageIndex: 0,
  });
  const hasCaseStudy = res2.updatedDocument.pages[0].elements.some(
    (e: any) => e.content?.includes("Case Study") || e.title?.includes("Case Study")
  );
  if (!hasCaseStudy) throw new Error("Test 2 Failed: Case study element was not added to Slide 1");
  console.log("✓ Test 2 Passed: Case study card added to Slide 1.");

  // Test 3: "Add statistics" on Slide 3
  console.log("\n[Test 3] Executing: 'add statistics' on Slide 3...");
  const res3 = await modifyDocumentWithAi({
    currentDocument: res2.updatedDocument,
    instruction: "add statistics to slide 3",
    pageIndex: 2,
  });
  const hasMetric = res3.updatedDocument.pages[2].elements.some((e) => e.type === "metric");
  if (!hasMetric) throw new Error("Test 3 Failed: Metric statistic was not added to Slide 3");
  console.log("✓ Test 3 Passed: Metric statistic added to Slide 3.");

  // Test 4: "Change theme to dark navy and warm orange"
  console.log("\n[Test 4] Executing: 'change theme to dark navy and warm orange'...");
  const res4 = await modifyDocumentWithAi({
    currentDocument: res3.updatedDocument,
    instruction: "change theme to dark navy and warm orange",
    pageIndex: 0,
  });
  const themeColors = res4.updatedDocument.theme.colors;
  if (themeColors.primary !== "#0F172A" || themeColors.secondary !== "#EA580C" || themeColors.accent !== "#F97316") {
    throw new Error(`Test 4 Failed: Expected dark navy & warm orange palette, got ${JSON.stringify(themeColors)}`);
  }
  console.log("✓ Test 4 Passed: Theme palette updated to dark navy (#0F172A) & warm orange (#EA580C, #F97316).");

  // Test 5: "Replace image" on Slide 4
  console.log("\n[Test 5] Executing: 'replace image' on Slide 4...");
  const res5 = await modifyDocumentWithAi({
    currentDocument: res4.updatedDocument,
    instruction: "replace image on slide 4",
    pageIndex: 3,
  });
  const mediaEl = res5.updatedDocument.pages[3].elements.find((e) => e.type === "media") as any;
  if (!mediaEl || mediaEl.url === "https://old-image.png") {
    throw new Error("Test 5 Failed: Media element image was not replaced");
  }
  console.log("✓ Test 5 Passed: Image asset replaced on Slide 4.");

  // Test 6: Attempt to modify locked slide (Slide 2)
  console.log("\n[Test 6] Executing: 'make slide 2 more detailed' (LOCKED slide)...");
  const res6 = await modifyDocumentWithAi({
    currentDocument: res5.updatedDocument,
    instruction: "make slide 2 more detailed",
    pageIndex: 1,
  });
  const lockedSlideContent = res6.updatedDocument.pages[1].elements[0] as any;
  if (lockedSlideContent.content !== "Locked content that must never be altered.") {
    throw new Error("Test 6 Failed: Locked slide 2 content was modified!");
  }
  console.log("✓ Test 6 Passed: Locked slide was strictly preserved.");

  console.log("\n==========================================");
  console.log("ALL AI MODIFICATION HANDLER TESTS PASSED!");
  console.log("==========================================");
}

runModifierTests().catch((err) => {
  console.error("Modifier Test Failed:", err);
  process.exit(1);
});
