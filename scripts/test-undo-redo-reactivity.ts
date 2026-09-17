import { useEditorStore } from "../src/store/editor-store";
import { createEmptyDocument } from "../src/types/document-spec";

async function runUndoRedoTest() {
  console.log("--- Starting Undo/Redo Reactivity Tests ---");

  // 1. Initial State
  const initialDoc = createEmptyDocument("Initial Test Deck");
  useEditorStore.getState().initProject({
    id: "test-proj-1",
    current_spec: initialDoc,
  });

  const state1 = useEditorStore.getState();
  if (state1.canUndo !== false || state1.canRedo !== false) {
    throw new Error(`Test 1 Failed: Expected canUndo=false, canRedo=false, got canUndo=${state1.canUndo}, canRedo=${state1.canRedo}`);
  }
  console.log("✓ Test 1: Initial state has canUndo=false, canRedo=false");

  // 2. Make a change (update active page title)
  useEditorStore.getState().updateActivePageTitle("Changed Slide Title");
  const state2 = useEditorStore.getState();
  if (state2.canUndo !== true || state2.canRedo !== false) {
    throw new Error(`Test 2 Failed: After change, expected canUndo=true, canRedo=false, got canUndo=${state2.canUndo}, canRedo=${state2.canRedo}`);
  }
  if (state2.document.pages[0].title !== "Changed Slide Title") {
    throw new Error(`Test 2 Failed: Title was not updated`);
  }
  console.log("✓ Test 2: Mutation enables canUndo=true, canRedo=false and updates title");

  // 3. Switch slide / page navigation preserves canUndo and canRedo
  useEditorStore.getState().setActivePage(0);
  const state3 = useEditorStore.getState();
  if (state3.canUndo !== true || state3.canRedo !== false) {
    throw new Error(`Test 3 Failed: Slide navigation corrupted canUndo or canRedo`);
  }
  console.log("✓ Test 3: Page navigation preserves canUndo=true, canRedo=false");

  // 4. Undo restores initial document
  useEditorStore.getState().undo();
  const state4 = useEditorStore.getState();
  if (state4.canUndo !== false || state4.canRedo !== true) {
    throw new Error(`Test 4 Failed: After undo, expected canUndo=false, canRedo=true, got canUndo=${state4.canUndo}, canRedo=${state4.canRedo}`);
  }
  if (state4.document.pages[0].title === "Changed Slide Title") {
    throw new Error(`Test 4 Failed: Undo did not restore previous title`);
  }
  console.log("✓ Test 4: Undo restores previous document and sets canUndo=false, canRedo=true");

  // 5. Redo restores the mutation
  useEditorStore.getState().redo();
  const state5 = useEditorStore.getState();
  if (state5.canUndo !== true || state5.canRedo !== false) {
    throw new Error(`Test 5 Failed: After redo, expected canUndo=true, canRedo=false, got canUndo=${state5.canUndo}, canRedo=${state5.canRedo}`);
  }
  if (state5.document.pages[0].title !== "Changed Slide Title") {
    throw new Error(`Test 5 Failed: Redo did not restore mutated title`);
  }
  console.log("✓ Test 5: Redo restores mutation and sets canUndo=true, canRedo=false");

  // 6. Multiple sequential mutations and multi-step undo
  useEditorStore.getState().addPage(); // 2 pages now
  useEditorStore.getState().updateActivePageTitle("Second Slide Added");
  useEditorStore.getState().addPage(); // 3 pages now

  const state6 = useEditorStore.getState();
  if (state6.document.pages.length !== 3) {
    throw new Error(`Test 6 Failed: Expected 3 pages, got ${state6.document.pages.length}`);
  }
  console.log("✓ Test 6: 3 sequential mutations applied");

  // Undo 1: Reverts 3rd page
  useEditorStore.getState().undo();
  if (useEditorStore.getState().document.pages.length !== 2) {
    throw new Error("Test 6a Failed: Undo did not revert 3rd page");
  }
  // Undo 2: Reverts 2nd slide title
  useEditorStore.getState().undo();
  // Undo 3: Reverts 2nd slide
  useEditorStore.getState().undo();
  if (useEditorStore.getState().document.pages.length !== 1) {
    throw new Error("Test 6b Failed: Multi-step undo did not restore 1 page");
  }
  console.log("✓ Test 6c: Multi-step individual undo works sequentially");

  console.log("ALL UNDO/REDO REACTIVITY TESTS PASSED!");
}

runUndoRedoTest().catch((err) => {
  console.error("Undo/Redo Test Failed:", err);
  process.exit(1);
});
