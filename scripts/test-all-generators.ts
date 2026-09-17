import { validateFormatSpec } from "../src/types/schemas/project-spec-schemas";
import { buildInfographicDocumentSpec } from "../src/lib/generators/infographic/infographic-builder";
import { buildSocialDocumentSpec } from "../src/lib/generators/social/social-builder";
import { buildResumeDocumentSpec } from "../src/lib/generators/resume/resume-builder";
import { buildLetterDocumentSpec } from "../src/lib/generators/letter/letter-builder";
import { buildDiagramDocumentSpec } from "../src/lib/generators/diagram/diagram-builder";
import { buildChartDocumentSpec } from "../src/lib/generators/chart/chart-builder";
import { recommendChartType } from "../src/lib/generators/chart/chart-recommender";
import { compileDocumentToDocxBuffer } from "../src/lib/compiler/docx/docx-builder";
import { executeGenerationPipeline } from "../src/lib/ai/generation-pipeline";
import { DocumentType } from "../src/types/document-spec";

async function runAllGeneratorTests() {
  console.log("=== STARTING COMPLETE 6-GENERATOR SUITE VERIFICATION ===");
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

  // TEST 1: Infographic Generator
  console.log("\n[TEST 1] Infographic Generator (Process, Timeline, Comparison, Circular)");
  const processInfo = buildInfographicDocumentSpec({
    infographicType: "process",
    title: "AI Inference Pipeline",
    steps: [
      { title: "Input Validation", description: "Sanitize user prompt against Zod schema" },
      { title: "LPU Execution", description: "Execute sub-second token generation on Groq" },
      { title: "AST Compilation", description: "Compile vector layouts to PPTX" },
    ],
  });
  const valInfo = validateFormatSpec(processInfo);
  assert(valInfo.success, "Process Infographic conforms to InfographicSpecSchema");
  assert(processInfo.pages[0].elements[0].type === "infographic_workflow", "Has infographic_workflow element");

  const comparisonInfo = buildInfographicDocumentSpec({
    infographicType: "comparison",
    title: "SlideCraft vs Legacy Slides",
    comparisonColumns: [
      {
        columnTitle: "SlideCraft AI",
        badge: "Next Gen",
        items: [
          { label: "Generation Speed", value: "< 3 seconds", highlight: true },
          { label: "Vector Quality", value: "Native Shapes", highlight: true },
        ],
      },
      {
        columnTitle: "Legacy Tools",
        items: [
          { label: "Generation Speed", value: "Manual Hours" },
          { label: "Vector Quality", value: "Flattened Screenshots" },
        ],
      },
    ],
  });
  const valComp = validateFormatSpec(comparisonInfo);
  assert(valComp.success, "Comparison Infographic conforms to InfographicSpecSchema");

  // TEST 2: Social Media Generator
  console.log("\n[TEST 2] Social Media Generator (Instagram, Story, LinkedIn, YouTube)");
  const igStory = buildSocialDocumentSpec({
    platform: "instagram_story",
    headline: "Unveiling SlideCraft 2.0",
    subheadline: "Deterministic AI Presentations with Zero Hallucination",
    callToAction: "Swipe Up To Create",
    handleOrBrand: "@slidecraft",
  });
  const valIg = validateFormatSpec(igStory);
  assert(valIg.success, "Instagram Story conforms to SocialDesignSpecSchema");
  assert(igStory.canvas.aspectRatio === "9:16", "Story has 9:16 aspect ratio");
  const overlayElem = igStory.pages[0].elements[0] as any;
  assert(overlayElem.safeZonePadding.top > 100, "Safe zone padding top protects header overlap");

  const ytThumb = buildSocialDocumentSpec({
    platform: "youtube_thumbnail",
    headline: "HOW WE BUILT AN AI OFFICE SUITE",
    callToAction: "Watch Now",
    aspectRatio: "16:9",
  });
  const valYt = validateFormatSpec(ytThumb);
  assert(valYt.success, "YouTube Thumbnail conforms to SocialDesignSpecSchema");

  // TEST 3: Resume Generator
  console.log("\n[TEST 3] Resume Generator (ATS-friendly, Academic, Internship, Creative)");
  const atsResume = buildResumeDocumentSpec({
    resumeType: "ats_friendly",
    contactInfo: {
      name: "Sudeepta Sharma",
      title: "Staff Software Engineer & Distributed Systems Lead",
      email: "sudeepta@slidecraft.ai",
      phone: "+1 (555) 349-2918",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/sudeepta",
      github: "github.com/sudeepta",
    },
    summaryText:
      "10+ years engineering high-scale distributed systems and real-time AI pipelines.",
    experience: [
      {
        id: "exp-1",
        title: "Staff Software Engineer",
        subtitle: "Google DeepMind / Cloud Platform",
        dateRange: "2021 - Present",
        location: "Mountain View, CA",
        bullets: [
          "Architected low-latency inference orchestration engine handling 500k QPS.",
          "Designed deterministic schema compiler ensuring zero output drift.",
        ],
        tags: ["TypeScript", "Rust", "Distributed Systems", "PostgreSQL"],
      },
    ],
    education: [
      {
        id: "edu-1",
        title: "Master of Science in Computer Science",
        subtitle: "Stanford University",
        dateRange: "2019 - 2021",
        bullets: ["Specialization in Artificial Intelligence and Distributed Computing"],
      },
    ],
    skills: ["TypeScript", "Next.js", "Python", "PostgreSQL", "System Architecture", "Groq API"],
  });
  const valResume = validateFormatSpec(atsResume);
  assert(valResume.success, "Resume conforms to ResumeSpecSchema");
  assert(atsResume.pages[0].elements.length >= 4, "Resume contains header, summary, experience, skills");

  // TEST 4: Letter Generator
  console.log("\n[TEST 4] Letter Generator (Leave, Job Application, Business Memo)");
  const bizLetter = buildLetterDocumentSpec({
    letterType: "business",
    tone: "executive",
    sender: {
      name: "Jordan Lee",
      title: "Chief Executive Officer",
      organization: "Enterprise AI Solutions",
      address: "100 California St, San Francisco, CA",
      email: "jordan@enterpriseai.com",
    },
    recipient: {
      name: "Dr. Elena Rostova",
      title: "Vice President of Technology",
      organization: "Global Fintech Partners",
      address: "500 Madison Ave, New York, NY",
    },
    subject: "Strategic Enterprise Partnership and Technology Licensing Agreement",
    bodyParagraphs: [
      "I am pleased to formally submit our proposal for deploying the SlideCraft AI enterprise generation engine across your global teams.",
      "Our platform provides native OpenXML presentation generation with complete deterministic schema validation and strict RLS telemetry security.",
      "We welcome the opportunity to discuss implementation timelines with your executive committee at your earliest convenience.",
    ],
    closing: "Sincerely and with best regards,",
  });
  const valLetter = validateFormatSpec(bizLetter);
  assert(valLetter.success, "Letter conforms to LetterSpecSchema");
  assert(bizLetter.pages[0].elements.some((e) => e.type === "letter_block"), "Contains letter_block elements");

  // TEST 5: Diagram Generator
  console.log("\n[TEST 5] Diagram Generator (Flowchart, UML, ER, Architecture)");
  const archDiag = buildDiagramDocumentSpec({
    diagramCategory: "system_architecture",
    title: "Microservices Architecture DAG",
  });
  const valArch = validateFormatSpec(archDiag);
  assert(valArch.success, "System Architecture conforms to DiagramSpecSchema");
  const diagElem = archDiag.pages[0].elements[0] as any;
  assert(diagElem.nodes.length >= 4, "Diagram contains structured graph nodes");
  assert(diagElem.connections.length >= 3, "Diagram preserves explicit AST connections");
  assert(diagElem.connections[0].fromId && diagElem.connections[0].toId, "Connections map fromId to toId");

  const erDiag = buildDiagramDocumentSpec({
    diagramCategory: "er",
    title: "Supabase Relational Database Schema",
  });
  const valEr = validateFormatSpec(erDiag);
  assert(valEr.success, "ER Diagram conforms to DiagramSpecSchema");
  const erElem = erDiag.pages[0].elements[0] as any;
  assert(erElem.nodes.some((n: any) => n.shape === "database"), "ER Diagram contains database entities");

  // TEST 6: Chart Generator & Intelligent Recommender
  console.log("\n[TEST 6] Chart Generator & Intelligent Recommender");
  const scatterChart = buildChartDocumentSpec({
    chartType: "scatter",
    title: "Inference Latency vs Parameter Size",
    labels: ["Model A", "Model B", "Model C", "Model D"],
    datasets: [{ name: "Latency (ms)", data: [120, 240, 480, 920] }],
    scatterData: [
      { x: 7, y: 120, name: "7B" },
      { x: 13, y: 240, name: "13B" },
      { x: 70, y: 480, name: "70B" },
      { x: 120, y: 920, name: "120B" },
    ],
    kpis: [
      { label: "P99 Latency", value: "320ms", delta: "-42% YoY" },
      { label: "Token Throughput", value: "480 tok/s", delta: "+18%" },
    ],
  });
  const valChart = validateFormatSpec(scatterChart);
  assert(valChart.success, "Scatter Chart conforms to ChartSpecSchema");

  // Test recommender with time series
  const timeSeriesRec = recommendChartType(
    ["Date", "Revenue"],
    [
      ["2024-01-01", 100],
      ["2024-02-01", 130],
      ["2024-03-01", 160],
      ["2024-04-01", 190],
    ]
  );
  assert(timeSeriesRec.recommendedType === "line", "Recommends Line chart for time-series date sequences");

  // Test recommender with proportion shares
  const pieRec = recommendChartType(
    ["Browser", "MarketShare"],
    [
      ["Chrome", 65],
      ["Safari", 20],
      ["Edge", 10],
      ["Firefox", 5],
    ]
  );
  assert(
    pieRec.recommendedType === "doughnut" || pieRec.recommendedType === "pie",
    "Recommends Doughnut/Pie chart for percentage distributions summing to 100%"
  );

  // Test recommender with continuous bivariate data
  const scatterRec = recommendChartType(
    ["Advertising Spend ($k)", "Signups (k)"],
    [
      [10, 2],
      [20, 5],
      [30, 9],
      [40, 14],
      [50, 21],
    ]
  );
  assert(scatterRec.recommendedType === "scatter", "Recommends Scatter plot for two numeric dimensions");

  // TEST 7: DOCX Binary Compilation
  console.log("\n[TEST 7] DOCX Binary Word Document Compilation");
  const resumeBuffer = await compileDocumentToDocxBuffer(atsResume);
  assert(Buffer.isBuffer(resumeBuffer), "Compiled resume to native Buffer");
  assert(resumeBuffer.length > 2000, `Generated valid .docx binary (${resumeBuffer.length} bytes)`);

  const letterBuffer = await compileDocumentToDocxBuffer(bizLetter);
  assert(letterBuffer.length > 2000, `Generated valid letter .docx binary (${letterBuffer.length} bytes)`);

  // TEST 8: Full End-to-End Pipeline for All 8 Document Types
  console.log("\n[TEST 8] End-to-End Pipeline Fallback Execution for All 8 Document Types");
  const docTypes: DocumentType[] = [
    "presentation",
    "poster",
    "infographic",
    "social_media",
    "resume",
    "letter",
    "diagram",
    "chart",
  ];

  for (const dt of docTypes) {
    const res = await executeGenerationPipeline({
      prompt: `Comprehensive technical synthesis for ${dt} testing`,
      documentType: dt,
    });
    assert(res.success, `Generation pipeline succeeded for ${dt}`);
    assert(res.document.documentType === dt, `Document type strictly preserved as ${dt}`);
    const valid = validateFormatSpec(res.document);
    assert(valid.success, `Pipeline output passes format Zod validation for ${dt}`);
  }

  console.log(`\n======================================================`);
  console.log(`ALL TESTS PASSED! (${passed}/${total} assertions successful)`);
  console.log(`======================================================\n`);
}

runAllGeneratorTests().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
