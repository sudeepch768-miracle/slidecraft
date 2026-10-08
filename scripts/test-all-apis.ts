import { NextRequest } from "next/server";
import { DocumentSpec, LayoutArchetype } from "../src/types/document-spec";

// Route imports
import { GET as getProviderStatus } from "../src/app/api/ai/provider-status/route";
import { GET as searchImages } from "../src/app/api/images/search/route";
import { POST as handleUpload } from "../src/app/api/upload/route";
import { POST as handleGenerators } from "../src/app/api/ai/generators/route";
import { GET as getMcpTools, POST as handleMcpTool } from "../src/app/api/ai/mcp/route";
import { GET as getImageGenHealth, POST as handleImageGen } from "../src/app/api/ai/generate-image/route";
import { POST as handlePptxExport } from "../src/app/api/export/pptx/route";
import { POST as handleDocxExport } from "../src/app/api/export/docx/route";
import { POST as handlePlanner } from "../src/app/api/ai/planner/route";
import { POST as handleModify } from "../src/app/api/ai/modify/route";
import { POST as handleGenerate } from "../src/app/api/ai/generate/route";
import { GET as getProjects, POST as createProject } from "../src/app/api/projects/route";
import { GET as getProjectById, PATCH as updateProjectById, DELETE as deleteProjectById } from "../src/app/api/projects/[id]/route";
import { POST as handleStorageUpload } from "../src/app/api/storage/upload/route";
import { POST as handleSignedUrl } from "../src/app/api/storage/signed-url/route";
import { GET as getQaDocument } from "../src/app/api/qa-document/route";
import { GET as handleSupabaseProxy } from "../src/app/api/supabase/[...path]/route";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failedCount++;
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✅ ${message}`);
    passedCount++;
  }
}

// Minimal valid DocumentSpec fixture for testing exports and modifiers
function createSampleDocumentSpec(title = "AI Enterprise Security Architecture"): DocumentSpec {
  return {
    id: `doc-${Date.now()}`,
    version: "1.0.0",
    documentType: "presentation",
    meta: {
      title,
      description: "Enterprise grade zero-trust security framework",
      author: "SlideCraft Engine",
      tags: ["security", "ai", "enterprise"],
    },
    canvas: {
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      unit: "px",
      dpi: 96,
    },
    theme: {
      mode: "dark",
      colors: {
        primary: "#38bdf8",
        secondary: "#818cf8",
        accent: "#f59e0b",
        background: "#0A0F1D",
        surface: "#131C31",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#1E2A44",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 14,
        shadow: "lg",
      },
    },
    pages: [
      {
        id: "slide-1",
        pageNumber: 1,
        title,
        subtitle: "A modern paradigm for resilient infrastructure",
        archetype: "hero_title" as LayoutArchetype,
        elements: [
          {
            id: "elem-1",
            type: "text",
            variant: "h1",
            content: title,
            align: "left",
          },
          {
            id: "elem-2",
            type: "text",
            variant: "subtitle",
            content: "Zero-trust verification and micro-segmentation",
            align: "left",
          },
        ],
      },
      {
        id: "slide-2",
        pageNumber: 2,
        title: "Key Architecture Pillars",
        archetype: "two_column_split" as LayoutArchetype,
        elements: [
          {
            id: "elem-3",
            type: "text",
            variant: "h2",
            content: "Pillar 1: Continuous Verification",
            align: "left",
          },
          {
            id: "elem-4",
            type: "text",
            variant: "body",
            content: "All network connections are authenticated and authorized dynamically.",
            align: "left",
          },
        ],
      },
    ],
  };
}

async function runAllApiTests() {
  console.log("===============================================================");
  console.log("🚀 SLIDECRAFT AI - COMPREHENSIVE END-TO-END API TEST SUITE");
  console.log("===============================================================\n");

  const startTime = Date.now();

  // ──────────────────────────────────────────────────────────────────────────
  // 1. GET /api/ai/provider-status
  // ──────────────────────────────────────────────────────────────────────────
  console.log("▶ SUITE 1: /api/ai/provider-status (Provider Health & Diagnostics)");
  {
    const res = await getProviderStatus();
    assert(res.status === 200, "GET /api/ai/provider-status returned HTTP 200");
    const data = await res.json();
    assert(typeof data.architecture === "string", "Contains architecture descriptor");
    assert(Boolean(data.providers?.groq), "Provider diagnostics contains Groq");
    assert(Boolean(data.providers?.openrouter), "Provider diagnostics contains OpenRouter");
    assert(Boolean(data.providers?.nvidia), "Provider diagnostics contains NVIDIA");
    assert(Boolean(data.providers?.gemini), "Provider diagnostics contains Gemini");
    assert(Boolean(data.routingMatrix), "Routing matrix configuration exposed");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. GET /api/images/search
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 2: /api/images/search (Stock Photography & Media Library)");
  {
    // 2a. Query search
    const req1 = new NextRequest("http://localhost:3000/api/images/search?query=technology&per_page=6");
    const res1 = await searchImages(req1);
    assert(res1.status === 200, "Search technology images returned HTTP 200");
    const data1 = await res1.json();
    assert(Array.isArray(data1.results), "Results is an array");
    assert(data1.results.length > 0, `Returned ${data1.results.length} images for 'technology'`);
    assert(Boolean(data1.results[0].url), "First image contains valid URL");
    assert(Boolean(data1.results[0].thumbUrl), "First image contains thumbUrl");

    // 2b. Fallback query (empty search)
    const req2 = new NextRequest("http://localhost:3000/api/images/search");
    const res2 = await searchImages(req2);
    assert(res2.status === 200, "Empty search query gracefully returned HTTP 200");
    const data2 = await res2.json();
    assert(data2.results.length > 0, "Empty query falls back to curated stock library");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. POST /api/upload
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 3: /api/upload (Document & Tabular Extraction Parser)");
  {
    // 3a. Missing file error handling
    const emptyForm = new FormData();
    const reqMissing = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: emptyForm,
    });
    const resMissing = await handleUpload(reqMissing);
    assert(resMissing.status === 400, "Missing file returns HTTP 400 bad request");

    // 3b. Text file extraction
    const textForm = new FormData();
    const sampleText = "# Project Plan\n\nSlideCraft AI is an automated visual content engine.\nKey metric: 10x speed.";
    const textBlob = new Blob([sampleText], { type: "text/plain" });
    textForm.append("file", textBlob, "brief.txt");

    const reqText = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: textForm,
    });
    const resText = await handleUpload(reqText);
    assert(resText.status === 200, "Text file extraction returned HTTP 200");
    const dataText = await resText.json();
    assert(dataText.success === true, "Response reports success = true");
    assert(dataText.fileType === "text", "Identified fileType = 'text'");
    assert(dataText.extractedContent.includes("SlideCraft AI"), "Extracted content contains source text");

    // 3c. Tabular CSV extraction
    const csvForm = new FormData();
    const sampleCsv = "Quarter,Revenue,Growth\nQ1,1.2M,15%\nQ2,1.8M,25%\nQ3,2.4M,33%";
    const csvBlob = new Blob([sampleCsv], { type: "text/csv" });
    csvForm.append("file", csvBlob, "metrics.csv");

    const reqCsv = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: csvForm,
    });
    const resCsv = await handleUpload(reqCsv);
    assert(resCsv.status === 200, "CSV file extraction returned HTTP 200");
    const dataCsv = await resCsv.json();
    assert(dataCsv.fileType === "csv", "Identified fileType = 'csv'");
    assert(Boolean(dataCsv.summary), "Generated tabular data summary");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. POST /api/ai/generators
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 4: /api/ai/generators (Dedicated Format Spec Builders)");
  {
    // 4a. Missing action validation
    const reqNoAction = new NextRequest("http://localhost:3000/api/ai/generators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const resNoAction = await handleGenerators(reqNoAction);
    assert(resNoAction.status === 400, "Missing action returns HTTP 400");

    // 4b. Poster generation
    const reqPoster = new NextRequest("http://localhost:3000/api/ai/generators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_poster",
        posterType: "tech_conference",
        title: "AI Developers Summit 2026",
        dimensions: "A3_portrait",
        designMood: "cyber_dark",
      }),
    });
    const resPoster = await handleGenerators(reqPoster);
    assert(resPoster.status === 200, "generate_poster returned HTTP 200");
    const dataPoster = await resPoster.json();
    assert(dataPoster.formatType === "poster", "Poster formatType = 'poster'");
    assert(dataPoster.document.documentType === "poster", "DocumentSpec documentType = 'poster'");

    // 4c. Infographic generation
    const reqInfo = new NextRequest("http://localhost:3000/api/ai/generators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_infographic",
        infographicType: "process",
        title: "Data Pipeline Workflow",
        dimensions: "9:16",
      }),
    });
    const resInfo = await handleGenerators(reqInfo);
    assert(resInfo.status === 200, "generate_infographic returned HTTP 200");
    const dataInfo = await resInfo.json();
    assert(dataInfo.formatType === "infographic", "Infographic formatType = 'infographic'");

    // 4d. Social Media generation
    const reqSocial = new NextRequest("http://localhost:3000/api/ai/generators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_social",
        platform: "instagram_post",
        headline: "Launch Week Day 1",
      }),
    });
    const resSocial = await handleGenerators(reqSocial);
    assert(resSocial.status === 200, "generate_social returned HTTP 200");
    const dataSocial = await resSocial.json();
    assert(dataSocial.formatType === "social_media", "Social formatType = 'social_media'");

    // 4e. Resume generation
    const reqResume = new NextRequest("http://localhost:3000/api/ai/generators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_resume",
        name: "Alex Vance",
        title: "Principal AI Engineer",
      }),
    });
    const resResume = await handleGenerators(reqResume);
    assert(resResume.status === 200, "generate_resume returned HTTP 200");
    const dataResume = await resResume.json();
    assert(dataResume.formatType === "resume", "Resume formatType = 'resume'");

    // 4f. Letter generation
    const reqLetter = new NextRequest("http://localhost:3000/api/ai/generators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_letter",
        subject: "Executive Partnership Proposal",
      }),
    });
    const resLetter = await handleGenerators(reqLetter);
    assert(resLetter.status === 200, "generate_letter returned HTTP 200");

    // 4g. Diagram generation
    const reqDiag = new NextRequest("http://localhost:3000/api/ai/generators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_diagram",
        diagramCategory: "system_architecture",
        title: "Microservices Mesh Topology",
      }),
    });
    const resDiag = await handleGenerators(reqDiag);
    assert(resDiag.status === 200, "generate_diagram returned HTTP 200");

    // 4h. Chart generation
    const reqChart = new NextRequest("http://localhost:3000/api/ai/generators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_chart",
        chartType: "column",
        title: "Quarterly Run-Rate Comparison",
      }),
    });
    const resChart = await handleGenerators(reqChart);
    assert(resChart.status === 200, "generate_chart returned HTTP 200");

    // 4i. Unsupported action
    const reqBadAction = new NextRequest("http://localhost:3000/api/ai/generators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unsupported_xyz" }),
    });
    const resBadAction = await handleGenerators(reqBadAction);
    assert(resBadAction.status === 400, "Unsupported action returns HTTP 400");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. /api/ai/mcp (Model Context Protocol Layer)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 5: /api/ai/mcp (Model Context Protocol Server & Tool Execution)");
  {
    // 5a. GET tools catalog
    const resTools = await getMcpTools();
    assert(resTools.status === 200, "GET /api/ai/mcp returned HTTP 200");
    const dataTools = await resTools.json();
    assert(Array.isArray(dataTools.tools), "Returns tools catalog array");
    assert(dataTools.tools.length >= 5, `Exposes ${dataTools.tools.length} standard MCP tools`);

    // 5b. POST missing tool parameter validation
    const reqNoTool = new NextRequest("http://localhost:3000/api/ai/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const resNoTool = await handleMcpTool(reqNoTool);
    assert(resNoTool.status === 400, "Missing tool argument returns HTTP 400");

    // 5c. POST invoke validate_layout tool
    const sampleDoc = createSampleDocumentSpec("MCP Layout Test");
    const reqValidate = new NextRequest("http://localhost:3000/api/ai/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: "validate_layout",
        args: {
          documentSpec: sampleDoc,
        },
      }),
    });
    const resValidate = await handleMcpTool(reqValidate);
    assert(resValidate.status === 200, "POST /api/ai/mcp 'validate_layout' returned HTTP 200");
    const dataValidate = await resValidate.json();
    assert(dataValidate.success === true, "validate_layout tool executed with success = true");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. /api/ai/generate-image (NVIDIA FLUX Image Engine)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 6: /api/ai/generate-image (Image Generation Health & Validation)");
  {
    // 6a. GET Health & Diagnostics
    const resHealth = await getImageGenHealth();
    assert(resHealth.status === 200, "GET /api/ai/generate-image returned HTTP 200");
    const dataHealth = await resHealth.json();
    assert(Boolean(dataHealth.status), "Reports engine status");

    // 6b. POST invalid prompt validation (empty or too short)
    const reqShortPrompt = new NextRequest("http://localhost:3000/api/ai/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hi" }),
    });
    const resShortPrompt = await handleImageGen(reqShortPrompt);
    assert(resShortPrompt.status === 400, "Too short prompt correctly rejected with HTTP 400");

    // 6c. POST invalid JSON payload
    const reqBadJson = new NextRequest("http://localhost:3000/api/ai/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const resBadJson = await handleImageGen(reqBadJson);
    assert(resBadJson.status === 400, "Malformed JSON correctly rejected with HTTP 400");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. POST /api/export/pptx & POST /api/export/docx
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 7: /api/export/pptx & /api/export/docx (Binary Compilers)");
  {
    const sampleDoc = createSampleDocumentSpec("Export Parity Verification Deck");

    // 7a. PPTX Missing document validation
    const reqPptxEmpty = new NextRequest("http://localhost:3000/api/export/pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const resPptxEmpty = await handlePptxExport(reqPptxEmpty);
    assert(resPptxEmpty.status === 400, "PPTX export without document returns HTTP 400");

    // 7b. PPTX Compilation with valid DocumentSpec
    const reqPptxValid = new NextRequest("http://localhost:3000/api/export/pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document: sampleDoc }),
    });
    const resPptxValid = await handlePptxExport(reqPptxValid);
    assert(resPptxValid.status === 200, "PPTX compilation returned HTTP 200 binary response");
    const pptxBlob = await resPptxValid.arrayBuffer();
    assert(pptxBlob.byteLength > 10000, `Generated valid OpenXML binary (${pptxBlob.byteLength} bytes)`);

    // Check OpenXML PKZip header magic bytes (PK\x03\x04)
    const pptxBytes = new Uint8Array(pptxBlob);
    const isPptxZip = pptxBytes[0] === 0x50 && pptxBytes[1] === 0x4b && pptxBytes[2] === 0x03 && pptxBytes[3] === 0x04;
    assert(isPptxZip, "Exported PPTX is a valid OpenXML ZIP package");

    // 7c. DOCX Missing document validation
    const reqDocxEmpty = new NextRequest("http://localhost:3000/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const resDocxEmpty = await handleDocxExport(reqDocxEmpty);
    assert(resDocxEmpty.status === 400, "DOCX export without document returns HTTP 400");

    // 7d. DOCX Compilation with valid DocumentSpec
    const reqDocxValid = new NextRequest("http://localhost:3000/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document: sampleDoc }),
    });
    const resDocxValid = await handleDocxExport(reqDocxValid);
    assert(resDocxValid.status === 200, "DOCX compilation returned HTTP 200 binary response");
    const docxBlob = await resDocxValid.arrayBuffer();
    assert(docxBlob.byteLength > 5000, `Generated valid Word binary (${docxBlob.byteLength} bytes)`);
    const docxBytes = new Uint8Array(docxBlob);
    const isDocxZip = docxBytes[0] === 0x50 && docxBytes[1] === 0x4b && docxBytes[2] === 0x03 && docxBytes[3] === 0x04;
    assert(isDocxZip, "Exported DOCX is a valid OpenXML ZIP package");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. POST /api/ai/planner (Presentation Planner Multi-Action Endpoint)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 8: /api/ai/planner (Presentation Planner Actions)");
  {
    // 8a. Missing prompt validation
    const reqNoPrompt = new NextRequest("http://localhost:3000/api/ai/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_plan", prompt: "" }),
    });
    const resNoPrompt = await handlePlanner(reqNoPrompt);
    assert(resNoPrompt.status === 400, "Planner missing prompt returns HTTP 400");

    // 8b. Generate Presentation Plan
    const reqGenPlan = new NextRequest("http://localhost:3000/api/ai/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_plan",
        prompt: "Autonomous AI Agents in Healthcare Diagnosis",
        slideCount: 4,
      }),
    });
    const resGenPlan = await handlePlanner(reqGenPlan);
    assert(resGenPlan.status === 200, "generate_plan returned HTTP 200");
    const dataPlan = await resGenPlan.json();
    assert(dataPlan.success === true, "Plan generated with success = true");
    assert(Array.isArray(dataPlan.plan.slidePlans), "Plan has slidePlans array");
    assert(dataPlan.plan.slidePlans.length > 0, `Plan contains ${dataPlan.plan.slidePlans.length} slides`);
    assert(Boolean(dataPlan.plan.visualDirection), "Plan contains synthesized VisualDirection");
    assert(typeof dataPlan.validation.score === "number" && dataPlan.validation.score > 0, `Plan validation calculated health score (${dataPlan.validation.score}/100)`);

    // 8c. Convert Type action
    const reqConvert = new NextRequest("http://localhost:3000/api/ai/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "convert_type",
        plan: dataPlan.plan,
        slideId: dataPlan.plan.slidePlans[1]?.id || "slide-2",
        targetType: "statistic",
      }),
    });
    const resConvert = await handlePlanner(reqConvert);
    assert(resConvert.status === 200, "convert_type action returned HTTP 200");

    // 8d. Validate Plan action
    const reqValPlan = new NextRequest("http://localhost:3000/api/ai/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "validate_plan",
        plan: dataPlan.plan,
      }),
    });
    const resValPlan = await handlePlanner(reqValPlan);
    assert(resValPlan.status === 200, "validate_plan action returned HTTP 200");

    // 8e. Unknown planner action
    const reqBadPlanner = new NextRequest("http://localhost:3000/api/ai/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unknown_planner_action" }),
    });
    const resBadPlanner = await handlePlanner(reqBadPlanner);
    assert(resBadPlanner.status === 400, "Unknown planner action returns HTTP 400");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. POST /api/ai/modify (Natural Language Modifier Service)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 9: /api/ai/modify (Document Modifier API)");
  {
    // 9a. Missing arguments
    const reqModifyEmpty = new NextRequest("http://localhost:3000/api/ai/modify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const resModifyEmpty = await handleModify(reqModifyEmpty);
    assert(resModifyEmpty.status === 400, "Missing modify arguments returns HTTP 400");

    // 9b. Poster modification route branch
    const posterDoc: DocumentSpec = {
      ...createSampleDocumentSpec("Tech Expo Poster"),
      documentType: "poster",
    };
    const reqModifyPoster = new NextRequest("http://localhost:3000/api/ai/modify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentDocument: posterDoc,
        instruction: "Make the headline more futuristic and bold",
      }),
    });
    const resModifyPoster = await handleModify(reqModifyPoster);
    assert(resModifyPoster.status === 200, "Poster modification returned HTTP 200");
    const dataModifyPoster = await resModifyPoster.json();
    assert(dataModifyPoster.success === true, "Poster modifier reports success = true");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 10. POST /api/ai/generate (14-Stage End-to-End Pipeline)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 10: /api/ai/generate (14-Stage Pipeline Execution)");
  {
    // 10a. Missing prompt validation
    const reqGenEmpty = new NextRequest("http://localhost:3000/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "" }),
    });
    const resGenEmpty = await handleGenerate(reqGenEmpty);
    assert(resGenEmpty.status === 400, "Missing generation prompt returns HTTP 400");

    // 10b. Deterministic generation execution (presentation)
    const reqGenValid = new NextRequest("http://localhost:3000/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Quarterly Financial Overview for SaaS Investors",
        projectType: "presentation",
        pageCount: 3,
      }),
    });
    const resGenValid = await handleGenerate(reqGenValid);
    assert(resGenValid.status === 200, "Full pipeline generation returned HTTP 200");
    const dataGen = await resGenValid.json();
    assert(Boolean(dataGen.document), "Generated document spec present");
    assert(dataGen.document.pages.length > 0, `Generated ${dataGen.document.pages.length} slides`);
    assert(Boolean(dataGen.designSystem), "Generated design system present");
    assert(Boolean(dataGen.meta.modelUsed), `Engine used model: ${dataGen.meta.modelUsed}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Security & Authentication Guard Checks (/api/projects & /api/storage)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 11: Security & Auth Guards (/api/projects, /api/storage)");
  {
    // 11a. GET /api/projects without session
    const reqProjectsGet = new NextRequest("http://localhost:3000/api/projects");
    const resProjectsGet = await getProjects(reqProjectsGet);
    assert(resProjectsGet.status === 401, "Unauthenticated GET /api/projects returns HTTP 401 Unauthorized");

    // 11b. POST /api/projects without session
    const reqProjectsPost = new NextRequest("http://localhost:3000/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Proj", currentSpec: createSampleDocumentSpec() }),
    });
    const resProjectsPost = await createProject(reqProjectsPost);
    assert(resProjectsPost.status === 401, "Unauthenticated POST /api/projects returns HTTP 401 Unauthorized");

    // 11c. GET /api/projects/[id] without session
    const reqProjIdGet = new NextRequest("http://localhost:3000/api/projects/proj-123");
    const resProjIdGet = await getProjectById(reqProjIdGet, { params: Promise.resolve({ id: "proj-123" }) });
    assert(resProjIdGet.status === 401, "Unauthenticated GET /api/projects/[id] returns HTTP 401 Unauthorized");

    // 11d. PATCH /api/projects/[id] without session
    const reqProjIdPatch = new NextRequest("http://localhost:3000/api/projects/proj-123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated" }),
    });
    const resProjIdPatch = await updateProjectById(reqProjIdPatch, { params: Promise.resolve({ id: "proj-123" }) });
    assert(resProjIdPatch.status === 401, "Unauthenticated PATCH /api/projects/[id] returns HTTP 401 Unauthorized");

    // 11e. DELETE /api/projects/[id] without session
    const reqProjIdDelete = new NextRequest("http://localhost:3000/api/projects/proj-123", {
      method: "DELETE",
    });
    const resProjIdDelete = await deleteProjectById(reqProjIdDelete, { params: Promise.resolve({ id: "proj-123" }) });
    assert(resProjIdDelete.status === 401, "Unauthenticated DELETE /api/projects/[id] returns HTTP 401 Unauthorized");

    // 11f. POST /api/storage/upload without session
    const storageForm = new FormData();
    storageForm.append("file", new Blob(["dummy"]), "asset.png");
    const reqStorageUpload = new NextRequest("http://localhost:3000/api/storage/upload", {
      method: "POST",
      body: storageForm,
    });
    const resStorageUpload = await handleStorageUpload(reqStorageUpload);
    assert(resStorageUpload.status === 401, "Unauthenticated POST /api/storage/upload returns HTTP 401 Unauthorized");

    // 11g. POST /api/storage/signed-url without session
    const reqSignedUrl = new NextRequest("http://localhost:3000/api/storage/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket: "uploads", filePath: "user1/file.png" }),
    });
    const resSignedUrl = await handleSignedUrl(reqSignedUrl);
    assert(resSignedUrl.status === 401, "Unauthenticated POST /api/storage/signed-url returns HTTP 401 Unauthorized");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Miscellaneous Endpoints (/api/qa-document & /api/supabase proxy)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n▶ SUITE 12: Miscellaneous Endpoints (/api/qa-document, /api/supabase proxy)");
  {
    // 12a. GET /api/qa-document
    const resQa = await getQaDocument();
    assert(resQa.status === 200 || resQa.status === 404, `/api/qa-document returned valid HTTP status (${resQa.status})`);

    // 12b. Supabase Proxy Endpoint
    const reqProxy = new NextRequest("http://localhost:3000/api/supabase/auth/v1/health");
    const resProxy = await handleSupabaseProxy(reqProxy, { params: Promise.resolve({ path: ["auth", "v1", "health"] }) });
    assert(typeof resProxy.status === "number", `Supabase proxy routed successfully (HTTP ${resProxy.status})`);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("\n===============================================================");
  console.log(`🎉 ALL API TESTS COMPLETED IN ${durationSec}s`);
  console.log(`   Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log("===============================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllApiTests().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
