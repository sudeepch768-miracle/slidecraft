const {
  p,
  sectionHeading,
  createTable,
  createFigure
} = require("./helpers");

function getChapter3_B() {
  const elements = [];

  elements.push(sectionHeading("3.4 Non-Functional Requirements"));
  elements.push(p(
    "Non-functional requirements dictate the architectural quality attributes, performance thresholds, security baselines, and reliability standards governing the platform. Table 3.2 details these engineering constraints."
  ));

  const nfrHeaders = ["Quality Attribute", "Engineering Metric / Standard", "Implementation Enforcement Technique", "Status"];
  const nfrRows = [
    ["Performance", "Slide text generation latency < 2.5s", "Groq LPU acceleration (LLaMA-3.3-70B inference)", "TESTED"],
    ["Export Velocity", "Client PPTX compilation < 500ms for 10 slides", "In-memory pptxgenjs compilation without server hops", "TESTED"],
    ["Data Integrity", "0% loss of user text during AI modifications", "Atomic patch engine with content preservation guards", "TESTED"],
    ["Visual Accessibility", "WCAG 2.1 AA contrast ratio (>= 4.5:1 text/bg)", "Mathematical luminance ratio calculation in theme engine", "IMPLEMENTED"],
    ["Type Safety", "Zero unhandled runtime type exceptions", "TypeScript 5.x strict mode + Zod schema validation", "TESTED"],
    ["Security", "Zero leakage of server-side API keys", "Next.js server-only environment variable encapsulation", "IMPLEMENTED"],
    ["Edge Protection", "100% intercept of unauthorized visitors", "Edge Middleware cookie validation with redirect guards", "TESTED"],
    ["Cross-Device UI", "Fluid responsiveness from 375px to 2560px", "Tailwind CSS responsive breakpoints + flex/grid layout", "TESTED"],
  ];
  elements.push(...createTable("Table 3.2: Non-Functional Engineering Requirements", nfrHeaders, nfrRows, [18, 32, 38, 12]));

  elements.push(sectionHeading("3.5 User Workflow"));
  elements.push(p(
    "The user interaction lifecycle in SlideCraft AI is architected as an intuitive four-phase workflow designed to provide maximal creative agency with minimal operational friction: (1) Ingestion & Format Selection, (2) Blueprint Review & Refinement, (3) Generation & Dynamic Direction, and (4) Studio Editing & Native Export. Figure 3.2 illustrates this sequential workflow."
  ));

  const fig3_2_lines = [
    "[User Enters Site] ---> [Dark Lamp Login] ---> (Authenticated Session Established)",
    "                                                          |",
    "                                                          v",
    "[Creation Hub] <==========================================+",
    "      |",
    "      +---> Select Visual Format (Presentation, Poster, Infographic, etc.)",
    "      +---> Input Prompt / Topic OR Upload File (PDF, DOCX, CSV, TXT)",
    "      |",
    "      v",
    "[Presentation Blueprint Planner]",
    "      |",
    "      +---> Inspect AI-Generated Slide Outline & Archetypes",
    "      +---> Reorder Slides, Edit Summaries, Lock Desired Content Cards",
    "      +---> Run \"Health Check\" (Content Density & Structure Validation)",
    "      |",
    "      v [Confirm & Generate]",
    "[Multi-Provider AI Execution Pipeline]",
    "      |",
    "      +---> Groq LLaMA-3.3 Generates Slide Content Elements",
    "      +---> Dynamic Visual Direction Engine Computes 5-Stop Palette & Tokens",
    "      +---> NVIDIA FLUX Generates High-Fidelity Aspect-Ratio-Calibrated Images",
    "      |",
    "      v",
    "[Unified Visual Studio Editor]",
    "      |",
    "      +---> Interactive 16:9 Canvas Preview with Real-Time Editing",
    "      +---> Floating AI Assistant (Non-Destructive Content Modifications)",
    "      +---> Regenerate Backgrounds, Swap Themes, Reorder Elements",
    "      |",
    "      v [Export Action]",
    "[Native Client-Side PPTX Download] ---> (Editable Microsoft PowerPoint Presentation)"
  ];
  elements.push(...createFigure(fig3_2_lines, "Figure 3.2: User-to-Presentation Generation Workflow"));

  elements.push(sectionHeading("3.6 Creation Hub"));
  elements.push(p(
    "SlideCraft AI transcends standard single-purpose presentation tools by functioning as a versatile Creation Hub supporting eight distinct visual communication formats. Each format enforces specialized dimensional aspect ratios, typographical scales, safe-margin constraints, and layout archetype allocations. Table 3.5 summarizes these formats."
  ));

  const fmtHeaders = ["Format Category", "Target Dimensional Ratio", "Primary Use Case", "Layout Archetype Examples", "Export Target"];
  const fmtRows = [
    ["Presentation Deck", "16:9 Widescreen (1920x1080)", "Executive pitches, lectures, reports", "hero_title, two_column_split, three_card_grid", "Native .pptx, Web"],
    ["Academic / Event Poster", "4:5 / 3:4 Vertical Poster", "Conferences, hackathons, symposiums", "hackathon_poster, research_poster, seminar", "Web Canvas, Print"],
    ["Process Infographic", "1:2 Tall Vertical Banner", "Step-by-step flows, timeline roadmaps", "infographic_process, timeline, statistics", "Web Canvas, Vector"],
    ["Social Media Graphic", "1:1 Square / 9:16 Story", "LinkedIn posts, Twitter banners, stories", "social_linkedin_post, instagram_story", "Web Canvas, PNG"],
    ["Technical Resume", "A4 Portrait (210x297mm)", "Academic CVs, internship applications", "resume_ats_friendly, resume_split_profile", "Web Canvas, OpenXML"],
    ["Formal Letter", "Letter Portrait (8.5x11in)", "Executive notices, institutional letters", "letter_formal, executive_announcement", "Web Canvas, DOCX"],
    ["System Diagram", "16:9 Landscape Canvas", "Cloud architectures, engineering flows", "diagram_architecture, sequence_flow", "Web Canvas, Vector"],
    ["Data / Metric Report", "16:9 / 4:3 Dashboard", "Financial statements, analytics reviews", "four_metric_dashboard, data_chart_focus", "Native .pptx, Web"],
  ];
  elements.push(...createTable("Table 3.5: Supported Visual Formats and Spatial Specifications", fmtHeaders, fmtRows, [18, 18, 24, 25, 15]));

  elements.push(sectionHeading("3.7 Presentation Generation Workflow"));
  elements.push(p(
    "The core presentation generation pipeline operates as an orchestrated, 10-stage state machine that transitions raw user intent into an OpenXML-compliant PowerPoint file. Figure 3.4 diagrams the end-to-end processing pipeline."
  ));

  const fig3_4_lines = [
    "(Stage 1: Ingestion) ----> [Prompt & Document Analysis (Semantic Intent & Token Budget)]",
    "                                      |",
    "(Stage 2: Blueprint) <----------------+",
    "      v",
    "[Content Blueprint Planner (Outline Synthesis & Layout Archetype Allocation)]",
    "      |",
    "(Stage 3: Approval) -------> [User Review, Slide Locking & Health Audit]",
    "                                      |",
    "(Stage 4: Visual Direction) <---------+",
    "      v",
    "[Dynamic Visual Direction Engine (Seed Extraction, Palette Synthesis, Glow Tokens)]",
    "      |",
    "(Stage 5: Text Synthesis) --> [Groq LPU LLaMA-3.3-70B (Slide Elements Generation)]",
    "                                      |",
    "(Stage 6: Image Synthesis) <--+-------+",
    "      v                       |",
    "[NVIDIA FLUX Diffusion API]   v (Stage 7: AST Assembly)",
    "      |                   [DocumentSpec AST Construction & Zod Schema Validation]",
    "      +---------------------->|",
    "                              v",
    "(Stage 8: Render) ----------> [Interactive HTML5/Tailwind 16:9 Studio Canvas]",
    "                                      |",
    "(Stage 9: AI Refinement) ---> [Conversational Non-Destructive Patch Editing]",
    "                                      |",
    "(Stage 10: Compilation) ----> [pptxgenjs OpenXML Compilation & .pptx Download]"
  ];
  elements.push(...createFigure(fig3_4_lines, "Figure 3.4: Presentation Generation Pipeline"));

  elements.push(sectionHeading("3.8 AI Requirement Analysis"));
  elements.push(p(
    "Upon receiving an input payload, the system's Requirement Analyzer classifies the prompt across three orthogonal axes: (1) Domain Complexity (technical, educational, corporate, or artistic), (2) Information Density (bullet-driven versus narrative-driven), and (3) Target Audience Orientation. This analysis informs the token budget, determines the optimal slide count, and primes downstream archetype selection."
  ));

  return elements;
}

module.exports = { getChapter3_B };
