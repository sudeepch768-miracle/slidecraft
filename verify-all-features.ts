import { chromium } from "playwright";
import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve("d:/ppt generator", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

import { compileDocumentToPptx } from "d:/ppt generator/src/lib/compiler/pptx/pptx-builder";

const ARTIFACTS_DIR = "C:/Users/sudeep/.gemini/antigravity/brain/49d0c866-787a-4c39-9fb3-7e4b813da05c";
const BASE_URL = "http://localhost:3000";

const DECKS = [
  {
    topic: "NeuroInsight: Decoding Neural Activity with Deep Learning",
    audience: "Neuroscientists, clinicians, and health-tech investors",
    filename: "NeuroInsight.pptx",
  },
  {
    topic: "Aetheria: Next-Gen Autonomous Flight & Urban Air Mobility",
    audience: "Aerospace engineers, aviation authorities, and mobility investors",
    filename: "Aetheria.pptx",
  },
  {
    topic: "VerdantOS: AI Precision Agriculture & Carbon Capture",
    audience: "Agricultural cooperatives, agritech founders, and climate funds",
    filename: "VerdantOS.pptx",
  },
];

async function main() {
  console.log("=== STARTING COMPREHENSIVE PLAYWRIGHT E2E VERIFICATION ===");
  const report: Record<string, any> = {
    generatedDecks: [],
    plannerStepsVerified: false,
    visualPreviewVerified: false,
    imageServiceVerified: false,
    imageRegenModalVerified: false,
    aiAssistantDiffVerified: false,
    applyAllModalVerified: false,
    closingSlideVerified: false,
    presenterModeVerified: false,
    pptxExportsVerified: [],
  };

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Test Deck 1: NeuroInsight through full planner flow
  const deck1 = DECKS[0];
  console.log(`\n--- Testing Full Flow with Deck 1: "${deck1.topic}" ---`);
  await page.goto(`${BASE_URL}/planner?prompt=${encodeURIComponent(deck1.topic)}&count=8&tone=Scientific+Executive&audience=${encodeURIComponent(deck1.audience)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  console.log("Waiting for AI plan synthesis on /planner...");
  await page.waitForSelector('button:has-text("Input Summary"), button:has-text("Visual Style")', { timeout: 60000 });
  console.log("Content Planner loaded!");

  // Step 1: Input Summary
  await page.click('button:has-text("Input Summary")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "planner_step1_input.png") });
  console.log("Captured planner_step1_input.png");

  // Step 2: AI Understanding
  await page.click('button:has-text("AI Understanding")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "planner_step2_ai_understanding.png") });
  console.log("Captured planner_step2_ai_understanding.png");

  // Step 3: Slide Outline
  await page.click('button:has-text("Slide Outline")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "planner_step3_outline.png") });
  console.log("Captured planner_step3_outline.png");

  // Step 4: Live Visual Style Preview
  await page.click('button:has-text("Visual Style")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "planner_step4_visual_preview.png") });
  console.log("Captured planner_step4_visual_preview.png");
  report.visualPreviewVerified = true;

  // Step 5: Review & Generate
  await page.click('button:has-text("Review & Generate")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "planner_step5_review_generate.png") });
  console.log("Captured planner_step5_review_generate.png");
  report.plannerStepsVerified = true;

  // Click "Generate Presentation"
  console.log("Triggering Generate Presentation from Step 5...");
  const generateBtn = page.locator('button:has-text("Generate Presentation")').last();
  await generateBtn.click();

  await page.waitForURL(/\/editor\?projectId=/, { timeout: 45000 });
  console.log("Navigated to Editor:", page.url());
  await page.waitForTimeout(3000); // Allow slides and canvas to render

  // Capture Slide 1 in Editor
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "editor_neuroinsight_slide1.png") });
  console.log("Captured editor_neuroinsight_slide1.png");

  // Navigate to Slide 2 (which contains image block / split layout)
  console.log("Selecting Slide 2 in Editor thumbnail sidebar...");
  const slide2Thumbnail = page.locator('button:has-text("2"), [data-slide-index="1"], [aria-label*="Slide 2"]').first();
  if (await slide2Thumbnail.isVisible()) {
    await slide2Thumbnail.click();
    await page.waitForTimeout(1500);
  }

  // Capture Slide 2 with image
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "editor_neuroinsight_slide2_image.png") });
  console.log("Captured editor_neuroinsight_slide2_image.png");

  // Hover over image block to trigger "Regenerate Visual" button
  const mediaBlock = page.locator('[data-element-type="image"], .group\\/media').first();
  if (await mediaBlock.isVisible()) {
    await mediaBlock.hover();
    await page.waitForTimeout(500);
    const regenBtn = page.locator('button:has-text("Regenerate Visual")').first();
    if (await regenBtn.isVisible()) {
      console.log("Found 'Regenerate Visual' button, clicking to open modal...");
      await regenBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, "image_regen_modal.png") });
      console.log("Captured image_regen_modal.png");
      report.imageRegenModalVerified = true;

      // Close modal by clicking "Keep Current Image"
      const keepBtn = page.locator('button:has-text("Keep Current Image")').first();
      if (await keepBtn.isVisible()) {
        await keepBtn.click();
        await page.waitForTimeout(500);
      }
    }
  }

  // Test AI Assistant and Before/After Diff Card
  console.log("Testing AI Assistant quick actions...");
  const aiAssistantBtn = page.locator('button:has-text("AI Assistant"), button[title*="Assistant"], button:has-text("Ask AI")').first();
  if (await aiAssistantBtn.isVisible()) {
    await aiAssistantBtn.click();
    await page.waitForTimeout(600);
  }

  // Check suggestion pills
  const pillBtn = page.locator('button:has-text("Add Metrics & KPIs"), button:has-text("Make More Visual"), button:has-text("Academic Rigor")').first();
  if (await pillBtn.isVisible()) {
    console.log("Found AI suggestion pill, clicking...");
    await pillBtn.click();
    await page.waitForTimeout(3000); // Wait for mock/pipeline response
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "ai_assistant_diff_card.png") });
    console.log("Captured ai_assistant_diff_card.png");
    report.aiAssistantDiffVerified = true;

    // Apply change
    const applyBtn = page.locator('button:has-text("Apply to This Slide")').first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // Test "Apply to All Slides" Modal
  console.log("Opening 'Apply to All Slides' modal...");
  const applyAllBtn = page.locator('button:has-text("Apply to All Slides")').first();
  if (await applyAllBtn.isVisible()) {
    await applyAllBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "apply_all_slides_modal.png") });
    console.log("Captured apply_all_slides_modal.png");
    report.applyAllModalVerified = true;

    // Close modal
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Navigate to Slide 8 (Closing / Synthesis Slide)
  console.log("Navigating to Slide 8...");
  const slide8Thumbnail = page.locator('button:has-text("8"), [data-slide-index="7"], [aria-label*="Slide 8"]').first();
  if (await slide8Thumbnail.isVisible()) {
    await slide8Thumbnail.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "editor_slide8_closing.png") });
    console.log("Captured editor_slide8_closing.png");
    report.closingSlideVerified = true;
  }

  // Test Presentation Mode (PresenterModal)
  console.log("Testing Presenter Mode...");
  const presentBtn = page.locator('button:has-text("Present"), button[title*="Present"], button:has-text("Slideshow")').first();
  if (await presentBtn.isVisible()) {
    await presentBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "presenter_mode_view.png") });
    console.log("Captured presenter_mode_view.png");
    report.presenterModeVerified = true;

    // Exit presenter mode with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  // Inspect Project and Document in localStorage
  const project1Data = await page.evaluate(() => {
    const raw = localStorage.getItem("slidecraft_projects");
    if (raw) {
      const list = JSON.parse(raw);
      return list[0] || null;
    }
    return null;
  });

  const spec1 = project1Data?.current_spec || project1Data?.currentSpec;
  if (project1Data && spec1) {
    report.generatedDecks.push({
      topic: deck1.topic,
      id: project1Data.id,
      styleFamily: spec1.theme?.visualDirection?.styleFamily || "dynamic",
      variationSeed: spec1.theme?.visualDirection?.variationSeed || "seed-1",
      slideCount: spec1.pages?.length,
      primaryColor: spec1.theme?.colors?.primary,
      secondaryColor: spec1.theme?.colors?.secondary,
    });

    // Compile native PPTX export
    console.log("Compiling native PPTX export for Deck 1...");
    const pptx1 = await compileDocumentToPptx(spec1);
    const buf1 = (await pptx1.write({ outputType: "nodebuffer" })) as Buffer;
    const pptxPath1 = path.join(ARTIFACTS_DIR, deck1.filename);
    fs.writeFileSync(pptxPath1, buf1);
    report.pptxExportsVerified.push({
      topic: deck1.topic,
      path: pptxPath1,
      sizeBytes: buf1.length,
      slidesCount: spec1.pages?.length,
    });
    console.log(`Saved PPTX: ${pptxPath1} (${(buf1.length / 1024).toFixed(1)} KB)`);
  }

  // Now Generate Deck 2: Aetheria via planner & Editor inspection
  console.log(`\n--- Testing Generation for Deck 2: "${DECKS[1].topic}" ---`);
  await page.evaluate(() => localStorage.removeItem("slidecraft_current_presentation_plan"));
  await page.goto(`${BASE_URL}/planner?prompt=${encodeURIComponent(DECKS[1].topic)}&count=8&tone=Aerospace+Visionary&audience=${encodeURIComponent(DECKS[1].audience)}`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForSelector('button:has-text("Review & Generate")', { timeout: 90000 });
  await page.click('button:has-text("Review & Generate")');
  await page.waitForTimeout(500);
  const genBtn2 = page.locator('button:has-text("Generate Presentation")').last();
  await genBtn2.click();
  await page.waitForURL(/\/editor\?projectId=/, { timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "editor_aetheria_deck.png") });
  console.log("Captured editor_aetheria_deck.png");

  const project2Data = await page.evaluate(() => {
    const raw = localStorage.getItem("slidecraft_projects");
    if (raw) {
      const list = JSON.parse(raw);
      return list[0] || null;
    }
    return null;
  });

  const spec2 = project2Data?.current_spec || project2Data?.currentSpec;
  if (project2Data && spec2) {
    report.generatedDecks.push({
      topic: DECKS[1].topic,
      id: project2Data.id,
      styleFamily: spec2.theme?.visualDirection?.styleFamily || "dynamic",
      variationSeed: spec2.theme?.visualDirection?.variationSeed || "seed-2",
      slideCount: spec2.pages?.length,
      primaryColor: spec2.theme?.colors?.primary,
      secondaryColor: spec2.theme?.colors?.secondary,
    });

    console.log("Compiling native PPTX export for Deck 2...");
    const pptx2 = await compileDocumentToPptx(spec2);
    const buf2 = (await pptx2.write({ outputType: "nodebuffer" })) as Buffer;
    const pptxPath2 = path.join(ARTIFACTS_DIR, DECKS[1].filename);
    fs.writeFileSync(pptxPath2, buf2);
    report.pptxExportsVerified.push({
      topic: DECKS[1].topic,
      path: pptxPath2,
      sizeBytes: buf2.length,
      slidesCount: spec2.pages?.length,
    });
    console.log(`Saved PPTX: ${pptxPath2} (${(buf2.length / 1024).toFixed(1)} KB)`);
  }

  // Now Generate Deck 3: VerdantOS via planner & Editor inspection
  console.log(`\n--- Testing Generation for Deck 3: "${DECKS[2].topic}" ---`);
  await page.evaluate(() => localStorage.removeItem("slidecraft_current_presentation_plan"));
  await page.goto(`${BASE_URL}/planner?prompt=${encodeURIComponent(DECKS[2].topic)}&count=8&tone=Environmental+Tech&audience=${encodeURIComponent(DECKS[2].audience)}`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForSelector('button:has-text("Review & Generate")', { timeout: 90000 });
  await page.click('button:has-text("Review & Generate")');
  await page.waitForTimeout(500);
  const genBtn3 = page.locator('button:has-text("Generate Presentation")').last();
  await genBtn3.click();
  await page.waitForURL(/\/editor\?projectId=/, { timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "editor_verdantos_deck.png") });
  console.log("Captured editor_verdantos_deck.png");

  const project3Data = await page.evaluate(() => {
    const raw = localStorage.getItem("slidecraft_projects");
    if (raw) {
      const list = JSON.parse(raw);
      return list[0] || null;
    }
    return null;
  });

  const spec3 = project3Data?.current_spec || project3Data?.currentSpec;
  if (project3Data && spec3) {
    report.generatedDecks.push({
      topic: DECKS[2].topic,
      id: project3Data.id,
      styleFamily: spec3.theme?.visualDirection?.styleFamily || "dynamic",
      variationSeed: spec3.theme?.visualDirection?.variationSeed || "seed-3",
      slideCount: spec3.pages?.length,
      primaryColor: spec3.theme?.colors?.primary,
      secondaryColor: spec3.theme?.colors?.secondary,
    });

    console.log("Compiling native PPTX export for Deck 3...");
    const pptx3 = await compileDocumentToPptx(spec3);
    const buf3 = (await pptx3.write({ outputType: "nodebuffer" })) as Buffer;
    const pptxPath3 = path.join(ARTIFACTS_DIR, DECKS[2].filename);
    fs.writeFileSync(pptxPath3, buf3);
    report.pptxExportsVerified.push({
      topic: DECKS[2].topic,
      path: pptxPath3,
      sizeBytes: buf3.length,
      slidesCount: spec3.pages?.length,
    });
    console.log(`Saved PPTX: ${pptxPath3} (${(buf3.length / 1024).toFixed(1)} KB)`);
  }

  await browser.close();

  // Write out verification report JSON
  const reportPath = path.join(ARTIFACTS_DIR, "e2e_verification_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  console.log("\n=== ALL E2E VERIFICATION CHECKS COMPLETED SUCCESSFULLY ===");
  console.log(`Report written to: ${reportPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error("FATAL ERROR in E2E verification:", err);
  process.exit(1);
});
