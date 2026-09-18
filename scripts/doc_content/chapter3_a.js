const {
  p,
  chapterHeading,
  sectionHeading,
  createTable,
  createFigure
} = require("./helpers");

function getChapter3_A() {
  const elements = [];

  elements.push(...chapterHeading("CHAPTER 3\nPROJECT DESCRIPTION / METHODOLOGY", true));

  elements.push(sectionHeading("3.1 System Overview"));
  elements.push(p(
    "SlideCraft AI is an AI-powered, multi-format creative design and presentation generation platform engineered to synthesize structured, aesthetically polished, and fully editable visual communication artifacts from natural language prompts, arbitrary text documents, and tabular data files. Rather than operating as a monolithic black-box generator, SlideCraft AI decomposes the content synthesis, graphic design, and export compilation workflows into an asynchronous pipeline coordinated around a strongly typed intermediate representation: the DocumentSpec Abstract Syntax Tree (AST)."
  ));
  elements.push(p(
    "The system combines state-of-the-art Large Language Models (Groq LLaMA-3.3-70B, Google Gemini 1.5 Flash, and OpenRouter fallbacks) for semantic planning and text generation, diffusion models (NVIDIA FLUX API) for contextual visual synthesis, a mathematical visual direction engine for procedural aesthetic coherence, an interactive web studio for non-destructive human-AI collaboration, and a client-side OpenXML compiler for native Microsoft PowerPoint (.pptx) export."
  ));

  elements.push(sectionHeading("3.2 System Architecture"));
  elements.push(p(
    "The overall architectural topology of SlideCraft AI is structured across three primary computational tiers: the Presentation and Interaction Layer (Client-Side), the Application and Orchestration Layer (Next.js 15 Server-Side), and the Distributed Services Tier (AI Providers and Supabase Persistence). Figure 3.1 illustrates the architectural components and communication protocols governing the platform."
  ));

  const fig3_1_lines = [
    "+-----------------------------------------------------------------------------------------+",
    "|                       CLIENT TIER: BROWSER INTERACTION & EDITING                        |",
    "|  +---------------------+   +---------------------+   +-------------------------------+  |",
    "|  |  Creation Hub / UI  |   | Presentation Planner|   | Unified Studio Visual Editor  |  |",
    "|  |  (Input / Uploads)  |-->| (Outline / Health)  |-->| (Canvas, PageRenderer, Tools) |  |",
    "|  +---------------------+   +---------------------+   +-------------------------------+  |",
    "|                                                                      |                  |",
    "|                                                                      v                  |",
    "|                                                       +-------------------------------+ |",
    "|                                                       | Native PPTX Compiler (pptxgen)| |",
    "+----------------------------------------------------------------------|------------------+",
    "                                   ^                                   | Direct .pptx     ",
    "                        HTTPS / REST API Requests                      v File Download    ",
    "+-----------------------------------------------------------------------------------------+",
    "|                  SERVER TIER: NEXT.JS 15 APP ROUTER & ORCHESTRATION                     |",
    "|  +-------------------+   +--------------------+   +----------------------------------+  |",
    "|  | Edge Auth Guard   |   | AI Task Router     |   | Dynamic Visual Direction Engine  |  |",
    "|  | & Rate Limiter    |-->| (Provider Matrix)  |-->| (Procedural Palettes & Tokens)   |  |",
    "|  +-------------------+   +--------------------+   +----------------------------------+  |",
    "|                                    |                                                    |",
    "|                                    v                                                    |",
    "|  +-----------------------------------------------------------------------------------+  |",
    "|  | DocumentSpec AST Pipeline (Zod Runtime Validation, Schema Sanitizer, Patch Engine)|  |",
    "|  +-----------------------------------------------------------------------------------+  |",
    "+------------------------------------|----------------------------------------------------+",
    "                                     v External APIs                                      ",
    "+-----------------------------------------------------------------------------------------+",
    "|                         DISTRIBUTED SERVICES & PERSISTENCE TIER                         |",
    "|  +----------------+  +-----------------+  +-----------------+  +---------------------+  |",
    "|  |   Groq LPUs    |  | NVIDIA FLUX API |  |  Google Gemini  |  | Supabase PostgreSQL |  |",
    "|  | (LLaMA-3.3 70B)|  | (Diffusion Img) |  | (1.5 Flash Doc) |  | (Auth, RLS, Storage)|  |",
    "|  +----------------+  +-----------------+  +-----------------+  +---------------------+  |",
    "+-----------------------------------------------------------------------------------------+",
  ];
  elements.push(...createFigure(fig3_1_lines, "Figure 3.1: Overall SlideCraft AI System Architecture"));

  elements.push(sectionHeading("3.3 Functional Requirements"));
  elements.push(p(
    "Functional requirements define the specific operational capabilities, behavioral responses, and computational features implemented within SlideCraft AI. Table 3.1 categorizes the core functional requirements across system modules."
  ));

  const fnHeaders = ["Module ID", "Functional Requirement Description", "Input Parameters", "Output Artifact / State", "Status"];
  const fnRows = [
    ["FR-01", "Multi-Source Prompt Ingestion", "Raw topic, text, or file upload", "Normalized text & intent payload", "IMPLEMENTED"],
    ["FR-02", "Document Extraction (PDF/DOCX/CSV)", "Binary document stream", "Clean markdown text & table arrays", "IMPLEMENTED"],
    ["FR-03", "AI Blueprint Outline Generation", "User topic & slide count preference", "Structured outline with archetypes", "IMPLEMENTED"],
    ["FR-04", "Interactive Outline Reordering & Locking", "User drag actions, lock toggles", "Updated blueprint state in store", "IMPLEMENTED"],
    ["FR-05", "Multi-Provider AI Task Routing", "Task type (Text, Plan, Vision)", "Dispatched HTTP request to optimal AI", "IMPLEMENTED"],
    ["FR-06", "Procedural Visual Direction Synthesis", "Topic string & variation seed", "5-stop palette, typography, glow tokens", "IMPLEMENTED"],
    ["FR-07", "Contextual Diffusion Image Generation", "Slide topic, container ratio, style", "16:9 or 4:3 PNG image URL", "IMPLEMENTED"],
    ["FR-08", "DocumentSpec AST Schema Validation", "Serialized JSON from AI pipeline", "Strictly validated DocumentSpec object", "IMPLEMENTED"],
    ["FR-09", "16:9 Responsive Canvas Slide Rendering", "DocumentSpec page element array", "Interactive SVG/HTML5 slide canvas", "IMPLEMENTED"],
    ["FR-10", "Surgical Atomic Patch Slide Editing", "Natural language edit prompt", "Preserved content + updated elements", "IMPLEMENTED"],
    ["FR-11", "Client-Side Native PPTX Compilation", "Complete DocumentSpec tree", "Binary .pptx file downloaded in browser", "IMPLEMENTED"],
    ["FR-12", "User Authentication & Dark Lamp Gate", "Email, password, session cookies", "JWT session & PostgreSQL user record", "IMPLEMENTED"],
    ["FR-13", "Project Persistence & Row-Level Security", "User ID, DocumentSpec AST, metadata", "Encrypted relational DB row in Supabase", "IMPLEMENTED"],
  ];
  elements.push(...createTable("Table 3.1: Comprehensive Functional Requirements", fnHeaders, fnRows, [12, 30, 24, 24, 10]));

  return elements;
}

module.exports = { getChapter3_A };
