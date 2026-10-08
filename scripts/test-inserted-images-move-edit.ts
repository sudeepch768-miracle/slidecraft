/**
 * Test Suite: Inserted Images Move & Edit Functionality
 * Verifies:
 * 1. Image insertion with default positioning and sizing
 * 2. Moving image (drag/repositioning x, y in canvas %)
 * 3. Resizing image (width, height in canvas %)
 * 4. Image properties editing (URL, fit mode, border radius, alt, caption)
 * 5. Layer reordering (bringElementForward, sendElementBackward)
 * 6. Quality rules boundary validation with percentage coordinates
 * 7. PPTX compilation with positioned and custom-sized media elements
 */

import { DocumentSpec, ContentElement, MediaElement, PageSpec } from "../src/types/document-spec";
import { useEditorStore } from "../src/store/editor-store";
import { checkBoundaryViolations } from "../src/lib/quality/quality-rules";
import { executeAllAutoRepairs } from "../src/lib/quality/auto-repair-engine";
import { compileDocumentToPptx } from "../src/lib/compiler/pptx/pptx-builder";
import assert from "assert";

async function runTests() {
  console.log("===============================================================");
  console.log("🖼️  TESTING INSERTED IMAGES: MOVE, RESIZE & EDIT CAPABILITIES");
  console.log("===============================================================\n");

  const store = useEditorStore.getState();

  // Test 1: Insert Image to Active Slide
  console.log("▶ TEST 1: Insert Image to Active Slide");
  const testImgUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80";
  const insertedElement: MediaElement = {
    type: "media",
    id: `media-${Date.now()}`,
    mediaType: "image",
    url: testImgUrl,
    src: testImgUrl,
    alt: "Technology Infrastructure Visual",
    caption: "Cloud Architecture Concept",
    fit: "cover",
    borderRadius: 12,
    position: { x: 50, y: 22, width: 42, height: 50 },
  };

  store.addElementToActivePage(insertedElement);

  const updatedDoc = useEditorStore.getState().document;
  const activePage = updatedDoc.pages[useEditorStore.getState().activePageIndex];
  const found = activePage.elements.find((el) => el.id === insertedElement.id) as MediaElement;

  assert(found, "Inserted media element should be present in active page elements");
  assert.strictEqual(found.url, testImgUrl, "URL matches inserted image");
  assert.strictEqual(found.position?.x, 50, "Default X position is 50%");
  assert.strictEqual(found.position?.y, 22, "Default Y position is 22%");
  assert.strictEqual(found.position?.width, 42, "Default width is 42%");
  assert.strictEqual(found.position?.height, 50, "Default height is 50%");
  assert.strictEqual(useEditorStore.getState().selectedElementId, insertedElement.id, "Inserted element should be automatically selected");
  console.log("  ✅ Image inserted with coordinates { x: 50%, y: 22%, w: 42%, h: 50% } and automatically selected\n");

  // Test 2: Moving Image (Drag / Reposition Coordinates)
  console.log("▶ TEST 2: Moving Image (Reposition X, Y)");
  store.updateElement(insertedElement.id, {
    position: {
      ...found.position,
      x: 15,
      y: 35,
    },
  });

  const docAfterMove = useEditorStore.getState().document;
  const movedElem = docAfterMove.pages[useEditorStore.getState().activePageIndex].elements.find(
    (el) => el.id === insertedElement.id
  ) as MediaElement;

  assert.strictEqual(movedElem.position?.x, 15, "X coordinate updated to 15%");
  assert.strictEqual(movedElem.position?.y, 35, "Y coordinate updated to 35%");
  assert.strictEqual(movedElem.position?.width, 42, "Width remains unchanged");
  console.log("  ✅ Image moved to new coordinates { x: 15%, y: 35% }\n");

  // Test 3: Resizing Image (Width, Height)
  console.log("▶ TEST 3: Resizing Image (Bounding Box Resize)");
  store.updateElement(insertedElement.id, {
    position: {
      ...movedElem.position,
      width: 65,
      height: 55,
    },
  });

  const docAfterResize = useEditorStore.getState().document;
  const resizedElem = docAfterResize.pages[useEditorStore.getState().activePageIndex].elements.find(
    (el) => el.id === insertedElement.id
  ) as MediaElement;

  assert.strictEqual(resizedElem.position?.width, 65, "Width updated to 65%");
  assert.strictEqual(resizedElem.position?.height, 55, "Height updated to 55%");
  console.log("  ✅ Image resized to { width: 65%, height: 55% }\n");

  // Test 4: Editing Image Properties (Fit mode, Radius, Prompt, Alt, URL)
  console.log("▶ TEST 4: Editing Image Properties");
  const newImgUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80";
  store.updateElement(insertedElement.id, {
    url: newImgUrl,
    src: newImgUrl,
    fit: "contain",
    borderRadius: 24,
    alt: "Updated Microchip Hardware Visual",
    caption: "Semiconductor Breakthrough",
    prompt: "Ultra-detailed macro photo of next-gen neuromorphic chip",
  });

  const docAfterEdit = useEditorStore.getState().document;
  const editedElem = docAfterEdit.pages[useEditorStore.getState().activePageIndex].elements.find(
    (el) => el.id === insertedElement.id
  ) as MediaElement;

  assert.strictEqual(editedElem.url, newImgUrl, "Image source URL updated");
  assert.strictEqual(editedElem.fit, "contain", "Fit mode set to contain");
  assert.strictEqual(editedElem.borderRadius, 24, "Border radius set to 24px");
  assert.strictEqual(editedElem.alt, "Updated Microchip Hardware Visual", "Alt text updated");
  assert.strictEqual(editedElem.prompt, "Ultra-detailed macro photo of next-gen neuromorphic chip", "Prompt updated");
  console.log("  ✅ Image properties successfully modified (fit='contain', radius=24px, new URL, prompt)\n");

  // Test 5: Element Layering Reordering
  console.log("▶ TEST 5: Layering (Bring Forward & Send Backward)");
  const pageElementsBefore = useEditorStore.getState().document.pages[useEditorStore.getState().activePageIndex].elements;
  const initialIndex = pageElementsBefore.findIndex((el) => el.id === insertedElement.id);

  // Send backward
  store.sendElementBackward(insertedElement.id);
  const elementsAfterBackward = useEditorStore.getState().document.pages[useEditorStore.getState().activePageIndex].elements;
  const newIndexBackward = elementsAfterBackward.findIndex((el) => el.id === insertedElement.id);
  assert(newIndexBackward === 0, "sendElementBackward moved element to the back (index 0)");

  // Bring forward
  store.bringElementForward(insertedElement.id);
  const elementsAfterForward = useEditorStore.getState().document.pages[useEditorStore.getState().activePageIndex].elements;
  const newIndexForward = elementsAfterForward.findIndex((el) => el.id === insertedElement.id);
  assert(newIndexForward === elementsAfterForward.length - 1, "bringElementForward moved element to front (last index)");
  console.log("  ✅ Layer ordering verified (sendElementBackward -> index 0, bringElementForward -> front)\n");

  // Test 6: Quality Rules Validation with Percentage Coordinates
  console.log("▶ TEST 6: Quality Rules Boundary Validation");
  const issues = checkBoundaryViolations(useEditorStore.getState().document);
  const falseBoundaryViolations = issues.filter((i) => i.elementId === insertedElement.id && i.code === "boundary_violation");
  assert.strictEqual(falseBoundaryViolations.length, 0, "Valid percentage coordinates should NOT trigger false boundary violations");
  console.log("  ✅ Zero false boundary violations for percentage-based element coordinates\n");

  // Test 7: Export to PPTX with Positioned Media
  console.log("▶ TEST 7: Compile Document to Native PPTX with Positioned Media");
  const pptx = await compileDocumentToPptx(useEditorStore.getState().document);
  const pptxBuffer = await pptx.write({ outputType: "nodebuffer" });
  assert(pptxBuffer && Buffer.isBuffer(pptxBuffer), "PPTX compiler should return binary buffer");
  assert(pptxBuffer.length > 20000, `Exported PPTX should contain slide data (actual: ${pptxBuffer.length} bytes)`);
  console.log(`  ✅ PPTX compilation succeeded: ${pptxBuffer.length} bytes package created with positioned media\n`);

  console.log("===============================================================");
  console.log("🎉 ALL TESTS PASSED: INSERTED IMAGES CAN BE FREELY MOVED, RESIZED & EDITED!");
  console.log("===============================================================");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
