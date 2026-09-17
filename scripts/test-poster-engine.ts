import { buildPosterDocumentSpec } from "../src/lib/poster-engine/poster-builder";
import {
  POSTER_CATEGORIES,
  POSTER_MOOD_PALETTES,
  POSTER_TYPOGRAPHY_STYLES,
  PosterCategory,
} from "../src/lib/poster-engine/poster-types";
import {
  applyDeterministicPosterModification,
  modifyPosterDocument,
} from "../src/lib/poster-engine/poster-modifier";
import { DocumentSpecSchema, CANVAS_PRESETS } from "../src/types/document-spec";
import { PosterSpecSchema } from "../src/types/schemas/project-spec-schemas";
import { compileDocumentToPptx } from "../src/lib/compiler/pptx/pptx-builder";

async function runPosterEngineTests() {
  console.log("================================================================================");
  console.log("🚀 SLIDECRAFT AI POSTER & VISUAL-DESIGN GENERATION ENGINE: VERIFICATION SUITE");
  console.log("================================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (detail) console.error(`     Detail: ${detail}`);
      process.exitCode = 1;
    }
  }

  // TEST SUITE 1: ALL 9 POSTER CATEGORIES & DETERMINISTIC COMPOSITION
  console.log("👉 Test Suite 1: Verifying All 9 Poster Archetypes & Composition Specs...");
  const categories = Object.keys(POSTER_CATEGORIES) as PosterCategory[];

  for (const cat of categories) {
    const meta = POSTER_CATEGORIES[cat];
    const doc = buildPosterDocumentSpec({
      posterType: cat,
      title: `${meta.label} 2026 Showcase`,
      subtitle: `Official visual announcement and presentation for ${meta.label}`,
      dimensions: meta.suggestedAspectRatio,
      eventDate: "November 20-22, 2026",
      eventTime: "09:00 AM - 06:00 PM EST",
      eventVenue: "Metropolitan Tech Pavilion & Virtual Hub",
      qrUrl: "https://slidecraft.ai/register/event-101",
      qrScanHint: "Scan for Free VIP Passes",
      organizerName: "SlideCraft Global Events Council",
      contactEmail: "summit@slidecraft.ai",
      callToActionText: "Reserve Your Spot",
      highlights: [
        "1,000+ : Registered Delegates",
        "$50,000 : Prize Pool & Grants",
        "48 Hours : Continuous Sprint",
      ],
      speakers: [
        { name: "Dr. Elena Rostova", title: "Chief AI Architect", company: "DeepMind Neural Labs" },
        { name: "Marcus Vance", title: "Head of Product Design", company: "VectorWorks Studio" },
      ],
      sponsors: [
        { name: "Google Cloud", tier: "title" },
        { name: "Next.js & Vercel", tier: "platinum" },
        { name: "Groq LPU", tier: "gold" },
      ],
    });

    // 1. Zod DocumentSpec validation
    const docSpecParse = DocumentSpecSchema.safeParse(doc);
    assert(docSpecParse.success, `${cat}: DocumentSpec schema validation`);

    // 2. Format-specific PosterSpec validation
    const posterSpecParse = PosterSpecSchema.safeParse(doc);
    assert(posterSpecParse.success, `${cat}: PosterSpec schema validation`);

    // 3. Visual composition integrity checks
    const page = doc.pages[0];
    assert(page.archetype === meta.archetype, `${cat}: Layout archetype matches (${meta.archetype})`);
    assert(page.elements.length >= 6, `${cat}: Rich element count (${page.elements.length} elements)`);

    const hasTitle = page.elements.some((e) => e.type === "text" && e.id === "poster-title");
    const hasEventDetails = page.elements.some((e) => e.type === "event_details");
    const hasQrCode = page.elements.some((e) => e.type === "qrcode");
    const hasCta = page.elements.some((e) => e.type === "cta_badge");
    const hasSpeakers = page.elements.some((e) => e.type === "speaker_card");
    const hasSponsors = page.elements.some((e) => e.type === "sponsor_grid");

    assert(hasTitle, `${cat}: Contains prominent title block`);
    assert(hasEventDetails, `${cat}: Contains event date & venue anchor`);
    assert(hasQrCode, `${cat}: Contains functional QR code element`);
    assert(hasCta, `${cat}: Contains CTA badge button`);
    assert(hasSpeakers, `${cat}: Contains speaker profile cards`);
    assert(hasSponsors, `${cat}: Contains partner & sponsor grid`);
  }

  // TEST SUITE 2: PAPER SIZES & SOCIAL DIMENSIONS
  console.log("\n👉 Test Suite 2: Verifying A-Series Paper Sizes & Social Media Dimensions...");
  const dimensionCases = [
    { ratio: "A4_portrait", w: 1240, h: 1754, name: "A4 Portrait (Print Standard)" },
    { ratio: "A3_portrait", w: 1754, h: 2480, name: "A3 Portrait (Display Poster)" },
    { ratio: "A2_portrait", w: 2480, h: 3508, name: "A2 Portrait (Exhibition Poster)" },
    { ratio: "A1_portrait", w: 3508, h: 4960, name: "A1 Portrait (Academic Giant)" },
    { ratio: "1:1", w: 1080, h: 1080, name: "Square 1:1 (Instagram / LinkedIn Feed)" },
    { ratio: "4:5", w: 1080, h: 1350, name: "Portrait 4:5 (Instagram Portrait Post)" },
    { ratio: "9:16", w: 1080, h: 1920, name: "Vertical 9:16 (Stories & TikTok)" },
    { ratio: "16:9", w: 1920, h: 1080, name: "Landscape 16:9 (Display Screen / Banner)" },
  ] as const;

  for (const dim of dimensionCases) {
    const doc = buildPosterDocumentSpec({
      posterType: "hackathon",
      title: `Global Hackathon: ${dim.name}`,
      dimensions: dim.ratio,
      qrUrl: "https://slidecraft.ai/hackathon",
    });

    assert(doc.canvas.width === dim.w, `${dim.name}: Width matches preset (${dim.w}px)`);
    assert(doc.canvas.height === dim.h, `${dim.name}: Height matches preset (${dim.h}px)`);
    assert(doc.canvas.aspectRatio === dim.ratio, `${dim.name}: Aspect ratio matches`);
    assert(PosterSpecSchema.safeParse(doc).success, `${dim.name}: Validates against PosterSpecSchema`);
  }

  // TEST SUITE 3: DESIGN MOODS & TYPOGRAPHY STYLES
  console.log("\n👉 Test Suite 3: Verifying Color Palettes & Typography Styles...");
  const moods = Object.keys(POSTER_MOOD_PALETTES) as (keyof typeof POSTER_MOOD_PALETTES)[];
  const typographies = Object.keys(POSTER_TYPOGRAPHY_STYLES) as (keyof typeof POSTER_TYPOGRAPHY_STYLES)[];

  for (const mood of moods) {
    const doc = buildPosterDocumentSpec({
      posterType: "workshop",
      title: `AI Workshop in ${mood}`,
      dimensions: "A4_portrait",
      designMood: mood,
    });
    const expectedColors = POSTER_MOOD_PALETTES[mood];
    assert(
      doc.theme.colors.secondary === expectedColors.secondary,
      `Mood ${mood}: Secondary color applied (${expectedColors.secondary})`
    );
  }

  for (const typo of typographies) {
    const doc = buildPosterDocumentSpec({
      posterType: "seminar",
      title: `Keynote Seminar in ${typo}`,
      dimensions: "A4_portrait",
      typographyStyle: typo,
    });
    const expectedTypo = POSTER_TYPOGRAPHY_STYLES[typo];
    assert(
      doc.theme.typography.headingFont === expectedTypo.headingFont,
      `Typography ${typo}: Heading font applied (${expectedTypo.headingFont})`
    );
  }

  // TEST SUITE 4: CONVERSATIONAL REFINEMENT & DATA PRESERVATION
  console.log("\n👉 Test Suite 4: Conversational Natural Language Refinement & Preservation...");
  const basePoster = buildPosterDocumentSpec({
    posterType: "college_event",
    title: "InnovateX Annual Tech Fest",
    subtitle: "Igniting the Future of Creative Computing",
    dimensions: "A4_portrait",
    eventDate: "October 15, 2026",
    eventVenue: "Campus Main Auditorium",
    qrUrl: "https://slidecraft.ai/fest",
    organizerName: "Student Council & ACM Chapter",
    speakers: [{ name: "Sarah Connor", title: "Robotics Lead", company: "Cyberdyne Systems" }],
    sponsors: [{ name: "TechCorp", tier: "platinum" }],
  });

  // Edit 1: "Make it more colorful"
  const colorfulDoc = applyDeterministicPosterModification(basePoster, "Make it more colorful and vibrant");
  assert(
    colorfulDoc.theme.colors.secondary === POSTER_MOOD_PALETTES.vibrant_modern.secondary,
    "Refine 'more colorful': Palette updated to vibrant modern indigo"
  );
  assert(
    colorfulDoc.pages[0].title === basePoster.pages[0].title,
    "Refine 'more colorful': Title preserved"
  );
  assert(
    colorfulDoc.pages[0].elements.some((e) => e.type === "event_details" && (e as any).date === "October 15, 2026"),
    "Refine 'more colorful': Event date preserved"
  );

  // Edit 2: "Make suitable for Instagram"
  const igDoc = applyDeterministicPosterModification(basePoster, "Make suitable for Instagram feed");
  assert(igDoc.canvas.aspectRatio === "1:1", "Refine 'Instagram': Canvas resized to square 1:1");
  assert(igDoc.canvas.width === 1080 && igDoc.canvas.height === 1080, "Refine 'Instagram': Dimensions are 1080x1080");
  assert(igDoc.pages[0].title === "InnovateX Annual Tech Fest", "Refine 'Instagram': Title preserved");

  // Edit 3: "Use a professional style"
  const profDoc = applyDeterministicPosterModification(basePoster, "Use a professional corporate style");
  assert(
    profDoc.theme.colors.secondary === POSTER_MOOD_PALETTES.corporate_clean.secondary,
    "Refine 'professional': Corporate clean theme applied"
  );
  assert(
    profDoc.pages[0].elements.some((e) => e.type === "speaker_card" && (e as any).name === "Sarah Connor"),
    "Refine 'professional': Speaker cards preserved"
  );

  // Edit 4: "Change the background to dark"
  const darkDoc = applyDeterministicPosterModification(basePoster, "Change the background to dark cyberpunk black");
  assert(darkDoc.theme.colors.background === "#090D16", "Refine 'dark background': Background set to deep dark space");
  assert(darkDoc.theme.mode === "dark", "Refine 'dark background': Mode set to dark");
  assert(
    darkDoc.pages[0].elements.some((e) => e.type === "event_details" && (e as any).venue === "Campus Main Auditorium"),
    "Refine 'dark background': Venue location preserved"
  );

  // Edit 5: "Make title uppercase"
  const upperDoc = applyDeterministicPosterModification(basePoster, "Make the title uppercase");
  const titleElem = upperDoc.pages[0].elements.find((e) => e.id === "poster-title" && e.type === "text");
  assert(
    (titleElem as any)?.content === "INNOVATEX ANNUAL TECH FEST",
    "Refine 'title uppercase': Title converted to uppercase"
  );

  // TEST SUITE 5: PPTX GENERATION FROM POSTER SPEC
  console.log("\n👉 Test Suite 5: PowerPoint Engine (.pptx) Compatibility with Poster Specs...");
  try {
    const pptx = await compileDocumentToPptx(basePoster);
    assert(pptx !== null && typeof pptx.writeFile === "function", "compileDocumentToPptx compiles Poster DocumentSpec to real editable PowerPoint file");
  } catch (pptxErr: any) {
    assert(false, "PPTX compiler should support poster spec", pptxErr.message);
  }

  // SUMMARY
  console.log("\n================================================================================");
  console.log(`🏁 POSTER ENGINE VERIFICATION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log("================================================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPosterEngineTests().catch((err) => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
