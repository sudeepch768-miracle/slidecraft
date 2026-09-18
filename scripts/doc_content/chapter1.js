const {
  p,
  chapterHeading,
  sectionHeading,
  subsectionHeading,
  createTable
} = require("./helpers");

function createChapter1() {
  const elements = [];

  // CHAPTER 1 HEADING (Begins Arabic page 1)
  elements.push(...chapterHeading("CHAPTER 1\nINTRODUCTION", false));

  // 1.1 BACKGROUND
  elements.push(sectionHeading("1.1 Background"));
  elements.push(p(
    "Effective visual communication has established itself as the cornerstone of human collaboration, scholastic instruction, and corporate strategy in modern society. In educational settings, executive boardrooms, scientific symposiums, and technical conferences, digital slide presentations serve as the primary medium through which complex concepts are structured, contextualized, and disseminated to audiences. The visual presentation bridges the cognitive gap between raw textual documentation and human auditory absorption by combining succinct verbal rhetoric with structured spatial layouts, typography, charts, and contextual imagery."
  ));
  elements.push(p(
    "Historically, the process of preparing high-impact visual presentations has imposed a heavy cognitive and operational tax on authors. Crafting an effective presentation is fundamentally a multi-disciplinary endeavor that demands domain expertise, copywriting proficiency, graphic design literacy, typography judgment, color theory comprehension, and technical familiarity with slide compilation software. The author must not only distill extensive source literature or data tables into digestible conceptual bullets, but also devise appropriate visual hierarchies, select congruent palettes, balance negative margins, source copyright-cleared visual assets, and format layouts to ensure cross-device legibility."
  ));
  elements.push(p(
    "Because the vast majority of professionals, researchers, educators, and software engineers possess deep domain knowledge but lack formal visual communication training, the conventional slide creation workflow is plagued by friction. Authors frequently spend upwards of several hours adjusting text boxes, resizing containers, aligning shapes, and searching for clip art, often resulting in slides that are overcrowded, visually jarring, or stylistically generic. SlideCraft AI addresses this fundamental disparity by introducing an automated, multi-format generative architecture that transforms unstructured ideas into polished, presentation-ready artifacts."
  ));

  // 1.2 EVOLUTION OF DIGITAL PRESENTATION AND VISUAL COMMUNICATION
  elements.push(sectionHeading("1.2 Evolution of Digital Presentation and Visual Communication"));
  elements.push(p(
    "The evolution of presentation technology over the past half-century reflects a continuous trajectory toward reducing visual production latency while enhancing spatial expressiveness. In the mid-twentieth century, visual presentations relied on physical transparencies projected via 35mm slide projectors and overhead optical equipment. Authoring was entirely physical, requiring manual drafting, dry-transfer lettering, and photographic processing, which made iterative revision virtually impossible within practical timeframes."
  ));
  elements.push(p(
    "The advent of personal computing in the early 1980s catalyzed the first digital presentation paradigm shift with software such as Harvard Graphics and Microsoft PowerPoint. These desktop programs digitized the slide creation workflow by providing virtual slides, standardized master layouts, vector shape primitives, and typography rendering engines. While desktop slide software dramatically democratized presentation authoring, it shifted the entire operational burden of layout formatting, asset alignment, and visual design directly onto the user, establishing the ubiquitous \"blank canvas dilemma\" where users face an intimidating empty page with countless formatting options."
  ));
  elements.push(p(
    "In the 2010s, the emergence of cloud-native collaboration tools and web-based template repositories (such as Google Slides and Canva) introduced real-time multi-user editing and pre-designed visual templates. However, template-driven systems introduced a new challenge: template fatigue. Users were constrained to rigid, pre-constructed visual archetypes that rarely matched the organic semantic structure of their specific content. Adapting custom domain data into rigid pre-fabricated cards often required distorting the message to fit the layout. More recently, early AI-driven tools have emerged, yet they predominantly produce locked, proprietary web outputs or flat, uneditable bitmap screenshots. SlideCraft AI represents the next evolutionary paradigm: an open, AST-grounded generative platform combining flexible multi-provider AI planning with native PowerPoint export parity."
  ));

  // 1.3 NEED FOR AI-ASSISTED CONTENT AND PRESENTATION GENERATION
  elements.push(sectionHeading("1.3 Need for AI-Assisted Content and Presentation Generation"));
  elements.push(p(
    "The contemporary knowledge worker is inundated with unprecedented volumes of unstructured information, including multi-page technical reports, academic research papers, enterprise spreadsheets, customer feedback summaries, and conversational notes. Transforming these extensive text documents into concise, visually coherent slides requires hours of cognitive synthesis and formatting labor. The urgent need for AI-assisted presentation generation stems from four fundamental operational challenges:"
  ));
  elements.push(p(
    "1. Cognitive Overload and Content Condensation: Humans struggle to rapidly isolate the executive essence of lengthy documents while preserving critical factual nuances. Large Language Models (LLMs) excel at natural language parsing, semantic distillation, and bullet structuring, enabling near-instantaneous content extraction."
  ));
  elements.push(p(
    "2. Elimination of the Blank Canvas Bottleneck: Confronted with an empty digital canvas, creators frequently experience decision paralysis regarding layout structure, color schemes, and visual flow. Automated blueprint generation provides immediate, high-quality starting points that reduce creation latency by over 80%."
  ));
  elements.push(p(
    "3. Aesthetic Inconsistency and Visual Noise: In manual slide decks, inconsistent margins, mismatched font pairings, conflicting color temperatures, and misaligned iconography degrade audience engagement. An algorithmic visual direction engine enforces strict mathematical design tokens and contrast compliance across every slide."
  ));
  elements.push(p(
    "4. Format Flexibility and Output Portability: Modern communication requires more than traditional 16:9 slides. Users routinely require academic posters, social banners, process flow infographics, technical resumes, and executive data reports. A unified multi-format platform eliminates the need to master multiple disjointed software applications."
  ));

  // 1.4 PROBLEM STATEMENT
  elements.push(sectionHeading("1.4 Problem Statement"));
  elements.push(p(
    "Existing digital presentation and content generation tools suffer from a critical architectural divide. On one hand, legacy desktop presentation software places the entire burden of graphic design, content synthesis, typography selection, and layout alignment on users who typically lack visual design training, leading to inefficient authoring cycles and poor visual communication. On the other hand, emerging AI presentation tools predominantly treat slide creation as either an end-to-end rasterization task—producing static, non-editable pixel graphics—or confine outputs to proprietary web ecosystems that forbid native, editable Microsoft PowerPoint (.pptx) export."
  ));
  elements.push(p(
    "Furthermore, current generative systems rely on monolithic LLM architectures that induce high inference latency and fail to provide non-destructive editing workflows; simple natural language modification commands frequently corrupt or wipe existing slide data, headings, and quantitative facts. Therefore, there is a critical need to design and implement an open, multi-provider AI platform that dynamically synthesizes multi-format visual blueprints from unstructured inputs, applies procedural, contrast-compliant design systems, provides non-destructive surgical editing with zero data loss, and compiles native, vector-editable PowerPoint presentations with strict canvas parity."
  ));

  // 1.5 MOTIVATION
  elements.push(sectionHeading("1.5 Motivation"));
  elements.push(p(
    "The motivation underlying SlideCraft AI is founded upon the principle of democratizing visual literacy and graphic engineering for students, researchers, technical professionals, and educators. While computational tools have automated complex mathematical modeling, software compilation, and data analytics, visual communication design has remained an unautomated craft dependent on specialized graphic designers or tedious manual labor. By synthesizing recent breakthroughs in Large Language Models (Groq LLaMA-3.3, Google Gemini), diffusion-based image synthesis (NVIDIA FLUX), and client-side vector compilation (pptxgenjs), SlideCraft AI bridges the gap between high-level human ideation and professional graphic artifacts."
  ));
  elements.push(p(
    "A further engineering motivation is the realization of true software interoperability. Presentations generated in corporate and academic institutions must integrate seamlessly with existing enterprise software workflows. By grounding the entire system in an extensible, strongly typed DocumentSpec Abstract Syntax Tree and providing direct client-side compilation into Microsoft PowerPoint Open XML format, SlideCraft AI guarantees that user ownership of generated intellectual property is strictly maintained without software lock-in."
  ));

  // 1.6 OBJECTIVES
  elements.push(sectionHeading("1.6 Objectives"));
  elements.push(p(
    "The primary technical objectives of the SlideCraft AI platform are delineated as follows:"
  ));
  elements.push(p(
    "1. Multi-Provider AI Task Routing: Implement an intelligent routing layer that dispatches generative tasks across Groq, NVIDIA FLUX, Google Gemini, and OpenRouter according to operational strengths, throughput benchmarks, and task specializations."
  ));
  elements.push(p(
    "2. Multi-Format Creative Generation: Architect a flexible Creation Hub supporting multiple visual communication formats including 16:9 presentation slide decks, event posters, process flow infographics, social graphics, resumes, formal letters, diagrams, and data reports."
  ));
  elements.push(p(
    "3. Dynamic Visual Direction & Procedural Styling: Develop a mathematical visual direction engine that proceduralizes presentation-level aesthetics across 10 distinct style families using semantic entropy, ensuring visual identity, contrast accessibility, and slide consistency without rigid template duplication."
  ));
  elements.push(p(
    "4. Presentation Blueprint Planning: Construct an interactive pre-generation planning interface enabling users to inspect, reorder, refine, lock, and validate slide outlines prior to final rendering."
  ));
  elements.push(p(
    "5. Non-Destructive AI Slide Editing: Build an atomic patch-based editor assistant that interprets natural language refinement instructions and executes surgical mutations while strictly preserving 100% of existing slide headlines, body text, and quantitative facts."
  ));
  elements.push(p(
    "6. Native PowerPoint Parity Export: Compile native Microsoft PowerPoint (.pptx) presentations client-side via pptxgenjs, ensuring strict structural, typography, and visual parity with the interactive HTML5/Tailwind web canvas."
  ));
  elements.push(p(
    "7. Secure Persistence & Edge Session Isolation: Integrate Supabase PostgreSQL, edge session middleware, and dark interactive lamp authentication to ensure robust user data isolation and security."
  ));

  // Table 1.1: Project Objectives and Implementation Scope
  const objHeaders = ["Objective ID", "Module / Dimension", "Target Capability", "Implementation Scope"];
  const objRows = [
    ["OBJ-01", "AI Task Routing", "Sub-2s inference with chained fallback", "Groq LLaMA-3.3, Gemini 1.5, OpenRouter"],
    ["OBJ-02", "Multi-Format Hub", "8 distinct visual artifact formats", "Decks, Posters, Infographics, Resumes, etc."],
    ["OBJ-03", "Visual Direction", "Procedural styling across 10 families", "Dynamic design tokens, contrast compliance"],
    ["OBJ-04", "Content Planner", "Interactive pre-generation blueprinting", "Slide outlines, health check, slide locking"],
    ["OBJ-05", "Contextual Images", "Diffusion-based asset generation", "NVIDIA FLUX.2-klein with negative prompts"],
    ["OBJ-06", "Surgical AI Editor", "Zero-data-loss slide modification", "Atomic patch engine, scope resolution"],
    ["OBJ-07", "Native PPTX Export", "Full OpenXML vector shape translation", "Client-side pptxgenjs compilation"],
    ["OBJ-08", "Data Persistence", "Secure user isolation and project state", "Supabase PostgreSQL + Edge Auth Middleware"],
  ];
  elements.push(...createTable("Table 1.1: Project Objectives and Implementation Scope", objHeaders, objRows, [15, 25, 30, 30]));

  // 1.7 SCOPE OF THE PROJECT
  elements.push(sectionHeading("1.7 Scope of the Project"));
  elements.push(p(
    "The functional scope of SlideCraft AI encompasses the end-to-end lifecycle of digital presentation and visual content creation. The system accepts diverse user inputs, ranging from short natural language prompts and multi-paragraph thematic descriptions to uploaded reference files in PDF, DOCX, CSV, and plain text formats. The generation scope includes structured content planning, slide archetype assignment, contextual image generation, responsive web rendering, and native PowerPoint OpenXML file export."
  ));
  elements.push(p(
    "The operational boundaries of the project are explicitly defined as follows: While the platform generates production-ready, editable PowerPoint (.pptx) files with vector containers and native typography, it does not attempt to replicate every proprietary animation or macro execution feature of the Microsoft Office desktop suite. Furthermore, audio narration synthesis, real-time multi-cursor collaboration, and standalone vector PDF compilation are designated as future architectural enhancements rather than core project deliverables."
  ));

  // 1.8 SIGNIFICANCE OF THE PROJECT
  elements.push(sectionHeading("1.8 Significance of the Project"));
  elements.push(p(
    "SlideCraft AI offers substantial technological and academic significance to the field of human-computer interaction and generative software engineering. First, it demonstrates how a strongly typed intermediate representation—the DocumentSpec Abstract Syntax Tree—can serve as a robust abstraction barrier between non-deterministic Large Language Models and deterministic client-side rendering engines. This design decoupling prevents hallucinated tokens from crashing the user interface and guarantees structural validity through Zod runtime schema validation."
  ));
  elements.push(p(
    "Second, the project contributes a reproducible methodology for multi-provider AI routing, demonstrating that disaggregating AI workloads across specialized, high-throughput inference engines (such as Groq for text and NVIDIA FLUX for diffusion imagery) delivers superior cost efficiency, response velocity, and output quality compared to monolithic model deployments. Finally, the non-destructive atomic patch engine establishes an engineering benchmark for conversational mixed-initiative interfaces, proving that AI assistants can execute creative layout modifications without risking user data loss."
  ));

  // 1.9 OVERVIEW OF THE PROPOSED SYSTEM
  elements.push(sectionHeading("1.9 Overview of the Proposed System"));
  elements.push(p(
    "The architecture of SlideCraft AI comprises five interconnected subsystems organized in an asynchronous pipeline: the Ingestion and Multi-Format Hub, the Presentation Blueprint Planner, the Multi-Provider AI Inference Engine, the Unified Visual Studio Editor, and the Native OpenXML PPTX Export Engine. When a user enters a topic or uploads a source document, the system analyzes semantic density, establishes the target format, and constructs a structured presentation blueprint containing slide outlines, layout archetypes, and content summaries."
  ));
  elements.push(p(
    "Upon blueprint approval, the generation pipeline synthesizes slide-level text elements via Groq LLaMA-3.3-70B, computes procedural visual direction tokens, generates contextual visual assets through NVIDIA FLUX, and constructs the immutable DocumentSpec AST. The resulting tree is rendered onto an interactive 16:9 canvas using React, Tailwind CSS, and Framer Motion. In the Studio Editor, users can manually adjust elements or issue conversational refinement commands to the AI Assistant. Finally, the pptxgenjs compiler translates the DocumentSpec AST into a native PowerPoint deck, downloading the file directly to the user's filesystem."
  ));

  // 1.10 ORGANIZATION OF THE REPORT
  elements.push(sectionHeading("1.10 Organization of the Report"));
  elements.push(p(
    "This project documentation is organized into five structured chapters following academic reporting guidelines:"
  ));
  elements.push(p(
    "Chapter 1 introduces the background, historical evolution, problem statement, motivation, project objectives, scope, significance, and architectural overview of SlideCraft AI."
  ));
  elements.push(p(
    "Chapter 2 provides an exhaustive Literature Review examining theoretical foundations in Generative AI, Large Language Models, text-to-image diffusion, automated layout algorithms, mixed-initiative editing, and comparative evaluations against existing industry solutions."
  ));
  elements.push(p(
    "Chapter 3 delivers the comprehensive Project Description and Methodology, detailing system architecture, functional/non-functional requirements, the DocumentSpec AST, dynamic visual direction, multi-provider routing algorithms, procedural background synthesis, interactive editing workflows, and native PPTX compilation."
  ));
  elements.push(p(
    "Chapter 4 presents Results and Discussion, encompassing implementation environment details, UI benchmarks, experimental generation results, test suite execution data, parity matrices, and performance analysis."
  ));
  elements.push(p(
    "Chapter 5 concludes the thesis with a summary of major engineering contributions, project advantages, current limitations, and an ambitious roadmap for future enhancements, followed by formal References."
  ));

  return elements;
}

module.exports = { createChapter1 };
