const {
  p,
  chapterHeading,
  sectionHeading,
  createTable
} = require("./helpers");

function createChapter5() {
  const elements = [];

  // CHAPTER 5 HEADING
  elements.push(...chapterHeading("CHAPTER 5\nCONCLUSION AND FUTURE SCOPE", true));

  // 5.1 CONCLUSION
  elements.push(sectionHeading("5.1 Conclusion"));
  elements.push(p(
    "This thesis presented the design, implementation, and empirical validation of SlideCraft AI—an AI-powered, multi-format creative design and presentation generation platform. By bridging the gap between natural language ideation and native, editable visual presentation artifacts, SlideCraft AI resolves long-standing inefficiencies inherent in manual presentation authoring and eliminates the severe architectural constraints of existing commercial AI tools."
  ));
  elements.push(p(
    "Through the implementation of an intermediate DocumentSpec Abstract Syntax Tree, an intelligent Multi-Provider AI Routing Architecture, a Dynamic Visual Direction Engine, an interactive Content Blueprint Planner, an atomic patch-based non-destructive AI Assistant, and a client-side OpenXML PowerPoint compiler, the platform demonstrates that generative visual communication can be automated with mathematical precision, strict data preservation, and open-standard export parity."
  ));

  // 5.2 MAJOR CONTRIBUTIONS
  elements.push(sectionHeading("5.2 Major Contributions"));
  elements.push(p(
    "The principal engineering and scholastic contributions realized by this project include:"
  ));
  elements.push(p(
    "1. Typed DocumentSpec AST: Designed an extensible, strongly typed intermediate representation that formalizes presentation geometry, layout archetypes, color palettes, typography, and content elements, insulating client rendering engines from non-deterministic LLM output."
  ));
  elements.push(p(
    "2. Multi-Provider AI Task Routing: Architected a disaggregated AI orchestration layer that routes specialized sub-tasks across Groq LPUs, NVIDIA FLUX diffusion models, and Google Gemini, achieving sub-2-second text inference and high-fidelity contextual imagery."
  ));
  elements.push(p(
    "3. Procedural Visual Direction Engine: Developed a mathematical design system that synthesizes cohesive, WCAG-compliant design tokens across ten style families using semantic entropy seeds, banishing repetitive template fatigue."
  ));
  elements.push(p(
    "4. Non-Destructive Atomic Patch Engine: Implemented an AI editing assistant that decomposes user refinement commands into surgical patch operations, guaranteeing 100% preservation of existing slide headlines, metrics, and body text."
  ));
  elements.push(p(
    "5. Native PowerPoint OpenXML Compilation: Built a client-side export engine via pptxgenjs that compiles DocumentSpec trees directly into native, editable Microsoft PowerPoint (.pptx) presentations with strict canvas parity."
  ));

  // 5.3 ADVANTAGES
  elements.push(sectionHeading("5.3 Advantages"));
  elements.push(p(
    "SlideCraft AI provides substantial advantages over traditional desktop software and contemporary cloud competitors: (1) Rapid creation cycles reducing presentation authoring latency from hours to seconds; (2) Democratization of visual communication design for non-designers; (3) Open-standard export ensuring full user ownership and offline editability in Microsoft PowerPoint, Apple Keynote, and Google Slides; (4) Multi-format versatility supporting posters, infographics, resumes, and data charts; and (5) Robust user isolation and data persistence via Supabase PostgreSQL and Edge Middleware authentication."
  ));

  // 5.4 CURRENT LIMITATIONS
  elements.push(sectionHeading("5.4 Current Limitations"));
  elements.push(p(
    "While SlideCraft AI delivers a robust, production-ready feature set, certain technical limitations have been identified during experimental evaluation. Table 5.1 outlines these limitations alongside their engineering impact and proposed future enhancements."
  ));

  const limHeaders = ["Identified Limitation", "Technical Root Cause / Context", "Operational Impact", "Proposed Future Enhancement", "Status"];
  const limRows = [
    ["Direct PDF Export", "Lack of server-side headless Chromium PDF rasterizer", "Users must print to PDF via browser or save as PDF in PowerPoint", "Implement Puppeteer/Playwright serverless PDF export microservice", "PROPOSED / FUTURE SCOPE"],
    ["Collaborative Multi-Cursor", "Client-side state managed via local Zustand store", "Only single-user real-time editing currently supported", "Integrate Yjs / CRDTs over Supabase Realtime WebSockets", "PROPOSED / FUTURE SCOPE"],
    ["Complex PowerPoint Animations", "pptxgenjs OpenXML mapping focuses on static shapes", "Slide transitions and object animations must be added manually in PPT", "Extend OpenXML compiler to inject native OOXML transition tags", "PROPOSED / FUTURE SCOPE"],
    ["Speech / Audio Narration", "Audio synthesis was excluded from primary project scope", "Generated presentations do not include voiceover audio tracks", "Integrate ElevenLabs or OpenAI Whisper for automated slide narration", "PROPOSED / FUTURE SCOPE"],
    ["Custom Brand Kit Import", "Themes are procedurally synthesized across 10 style families", "Organizations cannot currently upload custom .potx master templates", "Build XML master slide extractor to infer custom enterprise brand tokens", "PROPOSED / FUTURE SCOPE"],
  ];
  elements.push(...createTable("Table 5.1: System Limitations and Proposed Future Enhancements", limHeaders, limRows, [16, 24, 24, 24, 12]));

  // 5.5 FUTURE SCOPE
  elements.push(sectionHeading("5.5 Future Scope"));
  elements.push(p(
    "Future research and development trajectories for SlideCraft AI encompass several high-impact engineering frontiers:"
  ));
  elements.push(p(
    "1. Real-Time Collaborative Canvas: Integrating Conflict-Free Replicated Data Types (CRDTs) via Yjs over WebSockets to support concurrent multi-user editing, shared commenting, and live cursor tracking within the Unified Studio Editor."
  ));
  elements.push(p(
    "2. Native Vector PDF Compilation: Developing a dedicated vector PDF compilation pipeline utilizing PDFKit or headless Chromium to produce press-ready, CMYK-calibrated academic posters and brochures."
  ));
  elements.push(p(
    "3. Multimodal Voice and Audio Narration: Incorporating text-to-speech synthesis models to automatically generate slide-synchronized audio voiceovers, enabling automated video presentations and lecture recordings."
  ));
  elements.push(p(
    "4. Domain-Specific Fine-Tuned Models: Fine-tuning open-weights models (such as LLaMA-3-8B) on curated corpora of academic research posters and corporate pitch decks to further improve layout archetype prediction and content density optimization."
  ));
  elements.push(p(
    "5. Enterprise Brand Kit Ingestion: Engineering an automated design extractor capable of parsing existing corporate PowerPoint template files (.potx) to dynamically extract custom color tokens, font hierarchies, and company logo placements into the visual direction engine."
  ));

  return elements;
}

module.exports = { createChapter5 };
