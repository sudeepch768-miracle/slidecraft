import { buildPosterDocumentSpec } from "../src/lib/poster-engine/poster-builder";
import { buildInfographicDocumentSpec } from "../src/lib/generators/infographic/infographic-builder";
import { buildSocialDocumentSpec } from "../src/lib/generators/social/social-builder";
import { buildResumeDocumentSpec } from "../src/lib/generators/resume/resume-builder";
import { buildLetterDocumentSpec } from "../src/lib/generators/letter/letter-builder";
import { buildDiagramDocumentSpec } from "../src/lib/generators/diagram/diagram-builder";
import { buildChartDocumentSpec } from "../src/lib/generators/chart/chart-builder";
import { projectService } from "../src/lib/projects/project-service";

async function verifyDedicatedWorkspaces() {
  console.log("===============================================================");
  console.log("  VERIFYING DEDICATED WORKSPACE SPEC BUILDERS & ISOLATION");
  console.log("===============================================================\n");

  const projectIds: string[] = [];
  const specs: any[] = [];

  // 1. Poster
  console.log("[1/7] Building Dedicated Poster Spec...");
  const poster = buildPosterDocumentSpec({
    posterType: "hackathon",
    title: "AI AGENT HACKATHON 2026",
    subtitle: "Build the Future of Autonomous Code",
    dimensions: "A4_portrait",
    eventDate: "Oct 25, 2026",
    eventVenue: "Tech Innovation Hub",
    qrUrl: "https://slidecraft.ai/hackathon",
    organizerName: "Developer Community",
  });
  const projPoster = await projectService.createProject({
    name: poster.meta.title,
    projectType: "poster",
    currentSpec: poster,
  });
  projectIds.push(projPoster.id);
  specs.push(poster);
  console.log(`  ✓ Poster Created: ID=${projPoster.id}, type=${poster.documentType}, ratio=${poster.canvas.aspectRatio}`);

  // 2. Infographic
  console.log("[2/7] Building Dedicated Infographic Spec...");
  const infographic = buildInfographicDocumentSpec({
    infographicType: "process",
    title: "4-Stage Autonomous Pipeline",
    dimensions: "9:16",
    steps: [
      { title: "Stage 1", description: "Intent Deconstruction" },
      { title: "Stage 2", description: "Deterministic AST Generation" },
      { title: "Stage 3", description: "Zod Schema Verification" },
      { title: "Stage 4", description: "Vector Binary Compilation" },
    ],
  });
  const projInfo = await projectService.createProject({
    name: infographic.meta.title,
    projectType: "infographic",
    currentSpec: infographic,
  });
  projectIds.push(projInfo.id);
  specs.push(infographic);
  console.log(`  ✓ Infographic Created: ID=${projInfo.id}, type=${infographic.documentType}, ratio=${infographic.canvas.aspectRatio}`);

  // 3. Social Media
  console.log("[3/7] Building Dedicated Social Graphic Spec...");
  const social = buildSocialDocumentSpec({
    platform: "instagram_story",
    headline: "SlideCraft 2.0 Now Live",
    subheadline: "Deterministic multi-format visual studio for modern creators",
    aspectRatio: "9:16",
    callToAction: "Install CLI ➔",
    handleOrBrand: "@slidecraft.ai",
  });
  const projSocial = await projectService.createProject({
    name: social.meta.title,
    projectType: "social_media",
    currentSpec: social,
  });
  projectIds.push(projSocial.id);
  specs.push(social);
  console.log(`  ✓ Social Created: ID=${projSocial.id}, type=${social.documentType}, ratio=${social.canvas.aspectRatio}`);

  // 4. Resume
  console.log("[4/7] Building Dedicated Executive Resume Spec...");
  const resume = buildResumeDocumentSpec({
    resumeType: "ats_friendly",
    contactInfo: {
      name: "Dr. Sarah Lin",
      email: "sarah.lin@example.com",
      title: "Principal Research Scientist",
      phone: "+1 (555) 234-5678",
      location: "Seattle, WA",
    },
    summaryText: "Senior AI researcher specializing in multi-agent orchestration and deterministic compilers.",
    skills: ["TypeScript", "PyTorch", "Next.js", "Docker"],
    aspectRatio: "A4_portrait",
  });
  const projResume = await projectService.createProject({
    name: resume.meta.title,
    projectType: "resume",
    currentSpec: resume,
  });
  projectIds.push(projResume.id);
  specs.push(resume);
  console.log(`  ✓ Resume Created: ID=${projResume.id}, type=${resume.documentType}, ratio=${resume.canvas.aspectRatio}`);

  // 5. Letter
  console.log("[5/7] Building Dedicated Corporate Letter Spec...");
  const letter = buildLetterDocumentSpec({
    letterType: "business",
    tone: "executive",
    subject: "Strategic Partnership Memorandum",
    sender: { name: "Marcus Thorne", title: "VP of Enterprise", organization: "SlideCraft AI" },
    recipient: { name: "Claire Dupont", title: "Chief Innovation Officer", organization: "Apex Global" },
    bodyParagraphs: ["We are delighted to submit our formal roadmap...", "Our benchmarks indicate 100% vector accuracy..."],
    closing: "With high regards,",
    aspectRatio: "US_letter",
  });
  const projLetter = await projectService.createProject({
    name: letter.meta.title,
    projectType: "letter",
    currentSpec: letter,
  });
  projectIds.push(projLetter.id);
  specs.push(letter);
  console.log(`  ✓ Letter Created: ID=${projLetter.id}, type=${letter.documentType}, ratio=${letter.canvas.aspectRatio}`);

  // 6. Diagram
  console.log("[6/7] Building Dedicated Workflow Diagram Spec...");
  const diagram = buildDiagramDocumentSpec({
    diagramCategory: "system_architecture",
    title: "Edge Microservices Cluster",
    nodes: [
      { id: "n1", label: "Edge Gateway", shape: "cloud", status: "completed" },
      { id: "n2", label: "Inference Engine", shape: "rectangle", status: "active" },
      { id: "n3", label: "Vector DB", shape: "database", status: "pending" },
    ],
    connections: [
      { fromId: "n1", toId: "n2", label: "REST payload" },
      { fromId: "n2", toId: "n3", label: "Embeddings query" },
    ],
    aspectRatio: "16:9",
  });
  const projDiagram = await projectService.createProject({
    name: diagram.meta.title,
    projectType: "diagram",
    currentSpec: diagram,
  });
  projectIds.push(projDiagram.id);
  specs.push(diagram);
  console.log(`  ✓ Diagram Created: ID=${projDiagram.id}, type=${diagram.documentType}, ratio=${diagram.canvas.aspectRatio}`);

  // 7. Chart
  console.log("[7/7] Building Dedicated Chart Report Spec...");
  const chart = buildChartDocumentSpec({
    chartType: "column",
    title: "Q1-Q4 Enterprise Growth",
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [{ name: "Revenue (\$M)", data: [12, 19, 28, 42] }],
    kpis: [{ label: "Annual ARR", value: "\$101M", delta: "+48%", trend: "up" }],
    aspectRatio: "16:9",
  });
  const projChart = await projectService.createProject({
    name: chart.meta.title,
    projectType: "chart",
    currentSpec: chart,
  });
  projectIds.push(projChart.id);
  specs.push(chart);
  console.log(`  ✓ Chart Created: ID=${projChart.id}, type=${chart.documentType}, ratio=${chart.canvas.aspectRatio}`);

  // Verification Checks
  console.log("\n--- Verifying Strict Project Isolation ---");
  const uniqueIds = new Set(projectIds);
  if (uniqueIds.size !== projectIds.length) {
    throw new Error(`Duplicate project IDs detected! Expected 7 unique IDs, got ${uniqueIds.size}`);
  }
  console.log(`  ✓ All ${projectIds.length} project IDs are strictly unique!`);

  // Verify no mutations between formats
  if (specs[0].documentType !== "poster") throw new Error("Poster documentType was mutated!");
  if (specs[1].documentType !== "infographic") throw new Error("Infographic documentType was mutated!");
  if (specs[2].documentType !== "social_media") throw new Error("Social documentType was mutated!");
  if (specs[3].documentType !== "resume") throw new Error("Resume documentType was mutated!");
  if (specs[4].documentType !== "letter") throw new Error("Letter documentType was mutated!");
  if (specs[5].documentType !== "diagram") throw new Error("Diagram documentType was mutated!");
  if (specs[6].documentType !== "chart") throw new Error("Chart documentType was mutated!");
  console.log("  ✓ Zero cross-format mutations detected across all independent project records!");

  console.log("\n===============================================================");
  console.log("  ALL DEDICATED WORKSPACE BUILDERS & ISOLATION CHECKS PASSED!");
  console.log("===============================================================");
}

verifyDedicatedWorkspaces().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
