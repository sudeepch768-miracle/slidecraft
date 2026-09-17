import { createEmptyDocument, DocumentType } from "../src/types/document-spec";

async function testAutoSyncEngine() {
  console.log("==================================================================");
  console.log("SLIDECRAFT AI - AUTO-SAVE & LIVE AUTO-FETCH VERIFICATION SUITE");
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

  // 1. In-memory LocalStorage mock for Node environment testing
  const storageMock: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => storageMock[key] || null,
    setItem: (key: string, val: string) => {
      storageMock[key] = val;
    },
    removeItem: (key: string) => {
      delete storageMock[key];
    },
    clear: () => {
      for (const k in storageMock) delete storageMock[k];
    },
  };
  (global as any).window = {};

  // Import projectService dynamically after window/localStorage is polyfilled
  const { projectService } = await import("../src/lib/projects/project-service");

  // TEST 1: Initial starter projects load
  console.log("\n--- TEST 1: Starter Projects Initial Load ---");
  const initial = await projectService.fetchUserProjects();
  assert(initial.projects.length >= 3, "Starter projects initialized", `Found ${initial.projects.length} projects`);
  assert(initial.source === "local", "Source correctly resolved as local/fallback in test environment");

  // TEST 2: Create a new project via projectService
  console.log("\n--- TEST 2: Create New Project ---");
  const testDoc = createEmptyDocument("Series A Pitch Deck", "presentation");
  testDoc.pages[0].elements.push({
    id: "el-1",
    type: "metric",
    label: "Annual Recurring Revenue",
    value: "$10M ARR",
    delta: "+125% YoY",
    trend: "up",
  });

  const created = await projectService.createProject({
    name: "Series A Pitch Deck",
    projectType: "presentation",
    originalPrompt: "Create a 5-slide pitch deck for venture capital investors",
    currentSpec: testDoc,
  });

  assert(!!created.id, "Project created with unique ID", `ID: ${created.id}`);
  assert(created.name === "Series A Pitch Deck", "Project name matches input");
  assert(created.current_spec.pages[0].elements.some((el) => el.type === "metric"), "Project AST contains custom metric element");

  // TEST 3: Fetch updated project list
  console.log("\n--- TEST 3: Live Auto-Fetch List Sync ---");
  const fetchedList = await projectService.fetchUserProjects();
  const foundInList = fetchedList.projects.find((p) => p.id === created.id);
  assert(!!foundInList, "Newly created project appears in live fetched list");
  assert(foundInList?.name === "Series A Pitch Deck", "Fetched project name is accurate");

  // TEST 4: Get single project by ID
  console.log("\n--- TEST 4: Get Project By ID ---");
  const retrieved = await projectService.getProject(created.id);
  assert(retrieved !== null, "Project retrieved by ID");
  assert(retrieved?.id === created.id, "Retrieved ID matches requested ID");

  // TEST 5: Auto-Save / Mutation
  console.log("\n--- TEST 5: Auto-Save and Mutation Sync ---");
  const modifiedDoc = {
    ...testDoc,
    meta: { ...testDoc.meta, title: "Series A Pitch Deck (Updated OKRs)" },
  };
  const saveResult = await projectService.saveProject(created.id, {
    name: "Series A Pitch Deck (Updated OKRs)",
    current_spec: modifiedDoc,
  });

  assert(saveResult.project !== null, "Auto-save executed successfully");
  assert(saveResult.project?.name === "Series A Pitch Deck (Updated OKRs)", "Project name updated");
  assert(saveResult.project?.current_spec.meta.title === "Series A Pitch Deck (Updated OKRs)", "AST title updated");

  // TEST 6: Rename Project
  console.log("\n--- TEST 6: Project Rename ---");
  const renamed = await projectService.renameProject(created.id, "Series A Pitch Deck - Final Board Approved");
  assert(renamed !== null, "Rename call succeeded");
  assert(renamed?.name === "Series A Pitch Deck - Final Board Approved", "Renamed title persisted");

  // TEST 7: Version History
  console.log("\n--- TEST 7: Version History Snapshots ---");
  const versions = await projectService.getProjectVersions(created.id);
  assert(versions.length >= 2, "Multiple version snapshots recorded", `Found ${versions.length} versions`);
  assert(versions[0].version_number > versions[1].version_number, "Versions are sorted descending");

  // TEST 8: Version Restoration
  console.log("\n--- TEST 8: Version Snapshot Restore ---");
  const restored = await projectService.restoreVersion(created.id, 1);
  assert(restored !== null, "Restore operation completed");
  assert(restored?.current_spec.meta.title === "Series A Pitch Deck", "Canvas restored to Version 1 title");

  // TEST 9: Project Duplication
  console.log("\n--- TEST 9: Project Duplication ---");
  const duplicated = await projectService.duplicateProject(created.id);
  assert(duplicated !== null, "Duplication executed successfully");
  assert(duplicated?.id !== created.id, "Cloned project has distinct unique ID");
  assert(Boolean(duplicated?.name.includes("(Copy)")), "Cloned project name has (Copy) suffix", duplicated?.name);

  // TEST 10: All 8 Project Types Creation & Validation
  console.log("\n--- TEST 10: All 8 Project Types Supported ---");
  const allTypes: DocumentType[] = [
    "presentation",
    "poster",
    "infographic",
    "social_media",
    "resume",
    "letter",
    "diagram",
    "chart",
  ];

  for (const pType of allTypes) {
    const doc = createEmptyDocument(`Test ${pType}`, pType);
    const p = await projectService.createProject({
      name: `Test ${pType}`,
      projectType: pType,
      currentSpec: doc,
    });
    assert(p.project_type === pType, `Format "${pType}" initialized and persisted`);
  }

  // TEST 11: Project Deletion
  console.log("\n--- TEST 11: Project Deletion ---");
  const deleted = await projectService.deleteProject(created.id);
  assert(deleted === true, "Delete call returned true");
  const afterDeleteList = await projectService.fetchUserProjects();
  const stillExists = afterDeleteList.projects.some((p) => p.id === created.id);
  assert(!stillExists, "Project deleted from persistent store");

  // Summary
  console.log("\n==================================================================");
  console.log(`AUTO-SYNC VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

testAutoSyncEngine().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
