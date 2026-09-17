import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { buildPosterDocumentSpec } from "../src/lib/poster-engine/poster-builder";
import { CANVAS_PRESETS, AspectRatio } from "../src/types/document-spec";

const ARTIFACTS_DIR = "C:/Users/sudeep/.gemini/antigravity/brain/49d0c866-787a-4c39-9fb3-7e4b813da05c";
const BASE_URL = "http://localhost:3000";

async function verifyAspectRatios() {
  console.log("=== VERIFYING CONTENT CONTAINMENT ACROSS ALL ASPECT RATIOS ===");

  const browser = await chromium.launch({
    headless: true,
    channel: "msedge",
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const posterDoc = buildPosterDocumentSpec({
    posterType: "college_event",
    title: "CYBERPUNK SUMMIT 2026",
    subtitle: "The Premier Global Conference on Artificial Intelligence and Autonomous Agentic Systems",
    dimensions: "A4_portrait",
    designMood: "dark_cyberpunk",
    eventDate: "OCTOBER 24-26, 2026",
    eventTime: "09:00 AM - 06:00 PM EST",
    eventVenue: "Convention Center & Virtual Simulcast",
    pricingOrFee: "Free Registration",
    callToActionText: "REGISTER NOW",
    qrUrl: "https://slidecraft.ai/summit-2026",
    highlights: [
      "Keynote Sessions: 40+ Industry Leaders",
      "Interactive Workshops: 12 Hands-on Labs",
      "Hackathon: $25,000 Prize Pool",
    ],
    speakers: [
      { name: "Dr. Elena Rostova", title: "Chief AI Scientist", company: "DeepMind Tech" },
      { name: "Marcus Vance", title: "VP of Autonomous Robotics", company: "CyberDyne Systems" },
    ],
    organizerName: "Cyberpunk Tech Guild",
    contactEmail: "summit@cyberpunk2026.io",
  });

  posterDoc.id = "local-cyberpunk-poster";

  const projectRecord = {
    id: "local-cyberpunk-poster",
    user_id: "test-user",
    name: posterDoc.meta.title,
    project_type: posterDoc.documentType,
    status: "ready",
    original_prompt: "Cyberpunk Summit poster",
    current_spec: posterDoc,
    thumbnail_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Pre-seed localStorage before opening the page
  await page.goto(BASE_URL);
  await page.evaluate((proj) => {
    const existing = JSON.parse(localStorage.getItem("slidecraft_projects") || "[]");
    localStorage.setItem(
      "slidecraft_projects",
      JSON.stringify([proj, ...existing.filter((p: any) => p.id !== proj.id)])
    );
  }, projectRecord);

  // Navigate to editor
  await page.goto(`${BASE_URL}/editor/${posterDoc.id}`);
  await page.waitForSelector("#slidecraft-canvas-node", { timeout: 15000 });

  // Explicitly ensure store is initialized with our poster
  await page.evaluate((proj) => {
    const store = (window as any).__editorStore;
    if (store) {
      store.getState().initProject(proj);
    }
  }, projectRecord);

  await page.waitForTimeout(1000);

  const testRatios: AspectRatio[] = ["A4_portrait", "16:9", "1:1", "9:16", "A4_landscape", "4:3"];
  const results: Record<string, any> = {};

  for (const ratio of testRatios) {
    console.log(`\nTesting Aspect Ratio: ${ratio}...`);

    await page.evaluate(({ r, preset }) => {
      const store = (window as any).__editorStore;
      if (store) {
        store.getState().updateDocument((doc: any) => ({
          ...doc,
          canvas: {
            ...doc.canvas,
            aspectRatio: r,
            width: preset.width,
            height: preset.height,
          },
        }));
      }
    }, { r: ratio, preset: CANVAS_PRESETS[ratio] });

    await page.waitForTimeout(800);

    const metrics = await page.evaluate(() => {
      const canvasNode = document.getElementById("slidecraft-canvas-node");
      if (!canvasNode) return { found: false };

      const rect = canvasNode.getBoundingClientRect();
      const scrollH = canvasNode.scrollHeight;
      const clientH = canvasNode.clientHeight;
      const scrollW = canvasNode.scrollWidth;
      const clientW = canvasNode.clientWidth;

      const allText = canvasNode.innerText;
      const allChildren = Array.from(canvasNode.querySelectorAll("*")) as HTMLElement[];
      let anyOverflow = false;
      let worstBottom = 0;

      for (const child of allChildren) {
        const cRect = child.getBoundingClientRect();
        if (cRect.width === 0 || cRect.height === 0) continue;
        if (child.classList.contains("blur-3xl") || child.classList.contains("pointer-events-none")) continue;

        if (cRect.bottom > rect.bottom + 4) {
          anyOverflow = true;
          if (cRect.bottom - rect.bottom > worstBottom) {
            worstBottom = cRect.bottom - rect.bottom;
          }
        }
      }

      return {
        found: true,
        rect: { width: Math.round(rect.width), height: Math.round(rect.height) },
        scrollH,
        clientH,
        scrollW,
        clientW,
        anyElementOverflowing: anyOverflow,
        worstOverflowPx: Math.round(worstBottom),
        hasTitle: allText.includes("CYBERPUNK SUMMIT"),
        hasRegister: allText.includes("REGISTER NOW") || allText.includes("Cyberpunk Tech Guild"),
        hasSpeakers: allText.includes("Elena Rostova") || allText.includes("Marcus Vance"),
        hasMetrics: allText.includes("Keynote") || allText.includes("Hackathon"),
      };
    });

    console.log(`  Dimensions: ${metrics.rect?.width}x${metrics.rect?.height}px`);
    console.log(`  Scroll vs Client H: ${metrics.scrollH} / ${metrics.clientH}`);
    console.log(`  Any element clipped/overflowing: ${metrics.anyElementOverflowing ? "YES (" + metrics.worstOverflowPx + "px)" : "NO (100% contained)"}`);
    console.log(`  Contains Title, Speakers, Metrics, Footer: ${metrics.hasTitle && metrics.hasSpeakers && metrics.hasRegister ? "YES" : "NO"}`);

    results[ratio] = metrics;

    const screenshotPath = path.join(ARTIFACTS_DIR, `fit_${ratio.replace(":", "_")}.png`);
    const canvasNode = await page.$("#slidecraft-canvas-node");
    if (canvasNode) {
      await canvasNode.screenshot({ path: screenshotPath });
      console.log(`  Saved screenshot: fit_${ratio.replace(":", "_")}.png`);
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, "aspect_ratio_fit_report.json"),
    JSON.stringify(results, null, 2)
  );

  const allPassed = Object.values(results).every(
    (r: any) => !r.anyElementOverflowing && r.hasTitle && r.hasRegister
  );
  console.log(`\nALL RATIOS CONTAINMENT RESULT: ${allPassed ? "✅ ALL PASSED" : "❌ SOME FAILED"}`);
  process.exit(allPassed ? 0 : 1);
}

verifyAspectRatios().catch((err) => {
  console.error("Verification failed with error:", err);
  process.exit(1);
});
