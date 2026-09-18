const {
  p,
  chapterHeading,
  sectionHeading,
  subsectionHeading,
  createTable
} = require("./helpers");

function createChapter2() {
  const elements = [];

  // CHAPTER 2 HEADING
  elements.push(...chapterHeading("CHAPTER 2\nLITERATURE REVIEW", true));

  // 2.1 GENERATIVE ARTIFICIAL INTELLIGENCE
  elements.push(sectionHeading("2.1 Generative Artificial Intelligence"));
  elements.push(p(
    "Generative Artificial Intelligence (GenAI) denotes a paradigm of deep learning methodologies where computational models synthesize novel, coherent digital artifacts—including natural language prose, source code, high-resolution imagery, and structural data representations—conditioned on statistical patterns inferred from massive training corpora. The foundational breakthrough underpinning modern GenAI was the introduction of the Transformer architecture by Vaswani et al. (2017), which discarded recurrent and convolutional neural topologies in favor of multi-head self-attention mechanisms. Self-attention permits the parallel computation of pairwise token dependencies across arbitrary sequence lengths, enabling models to capture long-range semantic relationships and syntactic hierarchies with unprecedented fidelity."
  ));
  elements.push(p(
    "Subsequent developments bifurcated the Transformer paradigm into autoregressive decoder-only models (pioneered by Radford et al. in the GPT series) and bidirectional encoder models (such as BERT by Devlin et al.). Autoregressive decoders model the joint probability distribution of sequence tokens through factorization into conditional token probabilities, generating output text token-by-token via causal masking. In the domain of visual media, generative modeling transitioned from Generative Adversarial Networks (Goodfellow et al., 2014) to Denoising Diffusion Probabilistic Models (Sohl-Dickstein et al., 2015; Ho et al., 2020) and Flow Matching models (Lipman et al., 2022), which iteratively transform Gaussian noise distributions into structured images conditioned on cross-attention text embeddings."
  ));

  // 2.2 LARGE LANGUAGE MODELS
  elements.push(sectionHeading("2.2 Large Language Models"));
  elements.push(p(
    "Large Language Models (LLMs) represent the scaling of autoregressive Transformer architectures across billions of parameters, trained over trillions of multilingual tokens. Seminal research by Brown et al. (2020) on GPT-3 demonstrated that sufficiently parameterized models exhibit emergent in-context learning capabilities, performing diverse natural language reasoning tasks without explicit gradient updates or fine-tuning. More recently, open-weights foundation models such as LLaMA (Touvron et al., 2023) and LLaMA-3 (Meta AI, 2024) have demonstrated performance comparable to proprietary models while offering low-latency inference on optimized hardware accelerators."
  ));
  elements.push(p(
    "Concurrently, instruction fine-tuning via Reinforcement Learning from Human Feedback (RLHF; Ouyang et al., 2022) and Direct Preference Optimization (Rafailov et al., 2023) has aligned model outputs with human intent, enabling models to adhere to strict formatting schemas, such as JavaScript Object Notation (JSON). In SlideCraft AI, advanced models including Meta's LLaMA-3.3-70B (executed via Groq's Language Processing Units) and Google's Gemini-1.5-Flash are leveraged to parse complex requirements, organize slide hierarchies, and output strongly typed DocumentSpec trees with deterministic adherence to schema constraints."
  ));

  // 2.3 PROMPT-BASED CONTENT GENERATION
  elements.push(sectionHeading("2.3 Prompt-Based Content Generation"));
  elements.push(p(
    "Prompt engineering has emerged as an essential discipline in harnessing LLMs for structured application development. Early prompting methodologies relied on zero-shot or few-shot exemplars embedded directly within user prompts. However, unconstrained natural language prompts frequently produce non-deterministic formatting, conversational chatter, and structural hallucinations that disrupt downstream application parsing. Recent software engineering practices have introduced constrained generation protocols, combining system-role framing, explicit schema definitions, and grammar-based decoding (Willard & Louf, 2023)."
  ));
  elements.push(p(
    "In slide generation workflows, prompts must enforce multi-layered constraints: semantic conciseness, structural symmetry, layout archetype compatibility, and strict JSON output formatting. By defining system prompts that restrict model outputs exclusively to serialized Abstract Syntax Trees and pairing them with client-side Zod runtime schema validators, modern generative pipelines prevent malformed tokens from propagating into the rendering canvas."
  ));

  // 2.4 AI-ASSISTED PRESENTATION SYSTEMS
  elements.push(sectionHeading("2.4 AI-Assisted Presentation Systems"));
  elements.push(p(
    "The integration of artificial intelligence into presentation authoring has evolved through three distinct technical generations. The first generation was characterized by heuristic layout engines, exemplified by Microsoft PowerPoint Designer (launched in 2015). Designer employed computer vision and rule-based layout heuristics to inspect user-inserted text and images, offering pre-configured layout templates. However, it lacked semantic comprehension of slide content, could not synthesize original text or imagery, and frequently forced user content into poorly suited template containers."
  ));
  elements.push(p(
    "The second generation introduced commercial AI web applications such as Beautiful.ai, Tome, and Gamma App. Beautiful.ai pioneered algorithmic layout adjustment, where slide elements automatically adjust spatial margins when new items are added, yet content creation remained manual. Tome and Gamma introduced generative prompt-to-deck workflows using cloud LLMs, producing visually modern web cards. Nonetheless, these platforms exhibit significant architectural limitations: they lock presentations within proprietary cloud viewers, restrict or degrade export to standard Microsoft PowerPoint format, and utilize monolithic model backends that incur high latency and recurrent subscription expenses."
  ));

  // 2.5 RETRIEVAL AND CONTEXT-AWARE GENERATION
  elements.push(sectionHeading("2.5 Retrieval and Context-Aware Generation"));
  elements.push(p(
    "Retrieval-Augmented Generation (RAG; Lewis et al., 2020) has gained widespread adoption as a technique for grounding LLM outputs in external factual knowledge, typically by chunking documents, calculating dense vector embeddings, and performing cosine-similarity search against vector databases. While RAG is well-suited for open-domain question answering across massive corporate wikis, academic research has highlighted its drawbacks in structural synthesis tasks. Chunking documents into disconnected fragments destroys document-level narrative flow, table relationships, and hierarchical section outlines."
  ));
  elements.push(p(
    "Recognizing these limitations, SlideCraft AI avoids vector database chunking for presentation authoring. Instead, the platform employs direct in-memory multi-format document ingestion and structural extraction. When users upload DOCX, PDF, CSV, or plain text files, the system parses the complete document structure within the server memory boundary, feeding the complete thematic context directly into high-context-window models (such as Google Gemini with 1M+ token context windows). This guarantees that the generated presentation blueprint preserves the global narrative arc, quantitative tables, and hierarchical relationships of the source literature without embedding fragmentation."
  ));

  // 2.6 TEXT-TO-IMAGE GENERATION
  elements.push(sectionHeading("2.6 Text-to-Image Generation"));
  elements.push(p(
    "Text-to-image synthesis has undergone a transformative revolution with the development of latent diffusion models and rectified flow matching architectures. Early generative models suffered from mode collapse, blurriness, and poor prompt adherence. The introduction of Stable Diffusion (Rombach et al., 2022) demonstrated that executing the diffusion process within a compressed latent space rather than pixel space dramatically improves computational efficiency and visual detail. Recent foundation models developed by Black Forest Labs—specifically the FLUX model family, including FLUX.1-schnell and FLUX.2-klein—employ advanced flow-matching transformers to achieve photorealistic image quality, exceptional prompt alignment, and sharp visual coherence."
  ));
  elements.push(p(
    "A persistent challenge in utilizing diffusion models for presentation design is their propensity to hallucinate illegible, pseudo-text glyphs inside generated images when prompted with enterprise or technical topics. To mitigate this issue, SlideCraft AI couples the NVIDIA FLUX API with an automated prompt synthesis layer that injects strict negative prompts—explicitly excluding terms such as \"text, watermark, signature, letters, typography, label, bad anatomy\"—and generates images tailored precisely to the container aspect ratio (such as 16:9 widescreen or 4:3 split-column) while keeping native editable slide typography completely separate in vector space."
  ));

  // 2.7 AUTOMATED GRAPHIC DESIGN
  elements.push(sectionHeading("2.7 Automated Graphic Design"));
  elements.push(p(
    "Automated graphic design represents the intersection of computational geometry, color theory, and human perceptual psychology. Seminal research in design automation (O'Donovan et al., 2014) established that visually appealing layouts adhere to strict mathematical relationships governing visual balance, typographic contrast, alignment grids, and white space distribution. The Web Content Accessibility Guidelines (WCAG 2.1) mathematically define minimum visual contrast ratios—such as 4.5:1 for normal body text and 3:1 for large display headers—to ensure legibility across diverse visual acuities and display environments."
  ));
  elements.push(p(
    "In automated presentation systems, visual direction cannot rely on unconstrained randomization, which often generates discordant color combinations and illegible text overlays. SlideCraft AI formalizes graphic design principles through a Dynamic Visual Direction Engine. The engine algorithmically constructs harmonious 5-stop color palettes, coordinates surface card translucency, establishes typography pairings with calibrated font size ratios (1.25 Major Third scale), and places subtle directional ambient glows based on deterministic entropy seeds, guaranteeing both aesthetic elegance and WCAG-compliant contrast."
  ));

  // 2.8 DOCUMENT PROCESSING AND MULTIMODAL AI
  elements.push(sectionHeading("2.8 Document Processing and Multimodal AI"));
  elements.push(p(
    "Modern knowledge workflows require the ingestion of diverse binary file formats. Document processing in academic and enterprise contexts involves parsing Microsoft Word (.docx) files via OpenXML DOM parsers, extracting textual streams and tabular data from Portable Document Format (.pdf) files, and reading structured Comma-Separated Values (.csv) records. Multimodal language models can analyze structured tables and text streams to infer data distributions, identify executive themes, and map tabular records into visual metrics and charts."
  ));
  elements.push(p(
    "SlideCraft AI leverages server-side extraction utilities (such as pdf-parse and docx parser modules) to convert uploaded files into structured textual intermediate representations. This pre-processing layer cleans formatting artifacts, strips non-printable characters, and normalizes tabular data into clean Markdown tables before dispatching the extracted content to the AI blueprint planner."
  ));

  // 2.9 AI-BASED LAYOUT GENERATION
  elements.push(sectionHeading("2.9 AI-Based Layout Generation"));
  elements.push(p(
    "Layout generation algorithms have transitioned from rigid template matching toward flexible archetype-based constraint solvers. Researchers (e.g., Zheng et al., 2019; Gupta et al., 2021) have explored generative models for graphic layout generation, demonstrating that spatial layouts can be formalized as discrete arrangements of semantic visual containers (e.g., headers, body paragraphs, images, metrics, and callout cards)."
  ));
  elements.push(p(
    "SlideCraft AI operationalizes this theoretical insight by establishing an expressive catalog of layout archetypes—such as hero_title, two_column_split, three_card_grid, four_metric_dashboard, and horizontal_timeline. Rather than attempting to predict continuous coordinate bounding boxes—which frequently causes overlapping text containers and broken responsive views—the system predicts high-level semantic archetypes and relies on a deterministic CSS Grid and Flexbox layout engine to render containers with mathematical precision across all screen resolutions."
  ));

  // 2.10 INTERACTIVE HUMAN-AI EDITING
  elements.push(sectionHeading("2.10 Interactive Human-AI Editing"));
  elements.push(p(
    "In Human-Computer Interaction (HCI), mixed-initiative systems (Horvitz, 1999) represent interfaces where human users and automated software agents collaborate interactively to achieve shared creative goals. In generative content systems, pure autonomous generation frequently fails to satisfy specific user preferences, creating a critical need for iterative refinement mechanisms. However, contemporary AI editors frequently exhibit destructive behavior: submitting a prompt such as \"Make this slide more visual\" often triggers a wholesale re-generation of the slide, replacing the user's carefully curated facts and headings with generic placeholder text."
  ));
  elements.push(p(
    "To overcome this flaw, SlideCraft AI implements an atomic patch-based editor architecture. Drawing upon operational transformation and JSON Patch standards (RFC 6902), the system decomposes user natural language modification requests into discrete, surgical patch operations (such as update_text, change_layout, add_element, and update_theme). Untouched elements, slides, and global metadata remain strictly preserved in memory, ensuring that user data is never corrupted during conversational refinement."
  ));

  // 2.11 CLOUD DATABASES AND AUTHENTICATION
  elements.push(sectionHeading("2.11 Cloud Databases and Authentication"));
  elements.push(p(
    "Cloud-native applications require robust data persistence, relational integrity, and secure multi-tenant isolation. Traditional monolithic database architectures have been largely supplanted by serverless PostgreSQL systems, such as Supabase, which provide relational schema enforcement, connection pooling, and Row-Level Security (RLS). Under RLS, database access policies are evaluated directly at the SQL engine level based on authenticated JSON Web Tokens (JWTs), ensuring that users cannot read or mutate data belonging to other tenants."
  ));
  elements.push(p(
    "Furthermore, modern web security standards require secure session management implemented at the network edge. By deploying Next.js Edge Middleware, session tokens can be inspected and validated before incoming HTTP requests reach application routes, immediately intercepting unauthenticated traffic and redirecting visitors to secure authentication portals."
  ));

  // 2.12 COMPARATIVE ANALYSIS OF EXISTING APPROACHES
  elements.push(sectionHeading("2.12 Comparative Analysis of Existing Approaches"));
  elements.push(p(
    "To contextualize the engineering contributions of SlideCraft AI, an exhaustive comparative evaluation was conducted against leading commercial and academic presentation systems: Microsoft PowerPoint with Microsoft 365 Copilot, Gamma App, Tome AI, and Beautiful.ai. The evaluation examines ten core dimensions: output format parity, AI task routing, dynamic procedural visual direction, editable vector PPTX export, non-destructive editing, blueprint planning, multi-format support, self-hosted data persistence, image text isolation, and open standards support."
  ));

  // Table 2.1: Comparison Matrix
  const compHeaders = ["Feature / Dimension", "PowerPoint + Copilot", "Gamma App", "Tome AI", "Beautiful.ai", "SlideCraft AI (Proposed)"];
  const compRows = [
    ["Output File Type", "Proprietary .pptx", "Web Canvas / PDF", "Web Canvas / PDF", "Web / Exported PPTX", "Native Vector .pptx & Web"],
    ["AI Task Routing", "Monolithic Azure OpenAI", "Monolithic LLM", "Monolithic LLM", "Proprietary Heuristic", "Multi-Provider (Groq, FLUX, Gemini)"],
    ["Editable PPTX Parity", "Native (Manual layout)", "Poor / Rasterized", "Degraded / Flattened", "Partial (Shapes only)", "Strict Parity (pptxgenjs OpenXML)"],
    ["Visual Direction", "Standard Master Themes", "Fixed Web Cards", "Fixed Dark Presets", "Algorithmic Rules", "Dynamic Procedural (10 Families)"],
    ["Content Blueprint Planner", "No (Direct generation)", "Partial Outline", "Outline Cards", "No (Manual input)", "Full Interactive Blueprint Planner"],
    ["Non-Destructive Editing", "Manual override", "Destructive regenerate", "Destructive regenerate", "Manual adjustment", "Surgical Atomic Patch Engine"],
    ["Multi-Format Hub", "Slides Only", "Docs, Web, Slides", "Stories, Slides", "Slides Only", "Decks, Posters, Infographics, etc."],
    ["Image Model Integration", "DALL-E 3 (Monolithic)", "Unsplash / SDXL", "DALL-E 2 / SDXL", "Stock Unsplash", "NVIDIA FLUX.2-klein & schnell"],
    ["User Isolation / Persistence", "Microsoft 365 Enterprise", "Cloud Proprietary", "Cloud Proprietary", "Cloud Proprietary", "Supabase PostgreSQL + Edge Auth"],
    ["Cost / Latency Profile", "High ($30/user/mo)", "Subscription / Moderate", "Subscription / Moderate", "Subscription / Moderate", "High-Throughput Sub-2s Inference"],
  ];
  elements.push(...createTable("Table 2.1: Comparative Analysis of Modern Presentation Systems", compHeaders, compRows, [16, 17, 17, 16, 17, 17]));

  // 2.13 RESEARCH / IMPLEMENTATION GAP
  elements.push(sectionHeading("2.13 Research / Implementation Gap"));
  elements.push(p(
    "The comparative analysis reveals substantial research and implementation gaps in prevailing presentation generation platforms. First, commercial tools predominantly prioritize proprietary web viewers over open-standard document compilation, forcing enterprise and academic users into subscription lock-in and severely compromising offline presentation workflows. Second, monolithic AI routing introduces high inference latency and homogenizes output style, lacking the agility to leverage specialized inference accelerators for text and diffusion models for visual assets."
  ));
  elements.push(p(
    "Third, existing conversational AI slide editors lack content preservation guarantees; users are forced to choose between manually editing slides or risking total content overwriting via unconstrained AI re-generation. SlideCraft AI bridges these critical gaps by uniting a typed DocumentSpec Abstract Syntax Tree, multi-provider AI orchestration, dynamic procedural styling, atomic patch editing, and client-side OpenXML PowerPoint compilation into a unified, open-standard engineering platform."
  ));

  return elements;
}

module.exports = { createChapter2 };
