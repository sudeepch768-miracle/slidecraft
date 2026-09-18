const {
  p,
  sectionHeading,
  createFigure,
  createAlgorithm
} = require("./helpers");

function getChapter3_F() {
  const elements = [];

  elements.push(sectionHeading("3.31 Quality Assurance Engine"));
  elements.push(p(
    "The platform incorporates an automated Pre-Export Quality Protector that audits the DocumentSpec AST prior to compilation. The QA engine inspects word counts per slide to prevent container overflow, verifies color contrast compliance, detects missing image asset URLs, and ensures that slide titles are non-empty."
  ));

  elements.push(sectionHeading("3.32 Error Handling"));
  elements.push(p(
    "Robust error handling is implemented across all system boundaries. If an AI provider experiences rate limiting or connection timeouts, the Chained Fallback Provider automatically transfers the request to secondary providers (e.g., from Groq to OpenRouter). Furthermore, if an LLM returns malformed JSON, the parser applies regex cleanup and JSON sanitization before parsing through Zod schemas."
  ));

  elements.push(sectionHeading("3.33 Security Considerations"));
  elements.push(p(
    "SlideCraft AI enforces rigorous security best practices: (1) All third-party API keys (Groq, NVIDIA, Gemini) are stored strictly in server-side environment variables and are never exposed to client browsers; (2) Edge Middleware validates authenticated session tokens before admitting traffic; (3) Content Security Policy (CSP) headers mitigate cross-site scripting (XSS); and (4) Optional Redis rate limiting prevents denial-of-service (DoS) abuse."
  ));

  elements.push(sectionHeading("3.34 Algorithms"));
  elements.push(p(
    "The computational logic of SlideCraft AI is governed by three primary algorithms formalizing multi-provider routing, non-destructive patch execution, and procedural visual direction synthesis."
  ));

  // Algorithm 3.1
  const algo1_steps = [
    "Input: TaskRequest T = { type, prompt, tokenBudget, contextSize }",
    "Output: AIResponse R = { content, latencyMs, providerUsed }",
    "1.  if T.type == 'IMAGE_DIFFUSION' then",
    "2.      p_augmented <- AppendStyleAndNegativePrompts(T.prompt)",
    "3.      return InvokeNvidiaFluxAPI(p_augmented, T.aspectRatio)",
    "4.  else if T.type == 'LARGE_DOCUMENT_ANALYSIS' or T.contextSize > 32000 then",
    "5.      return InvokeGoogleGeminiAPI(T.prompt, T.documentStream)",
    "6.  else // Standard slide text synthesis or patch modification",
    "7.      try:",
    "8.          return InvokeGroqLpuAPI(T.prompt, 'llama-3.3-70b-versatile')",
    "9.      catch ProviderTimeoutOrRateLimitException e:",
    "10.         LogWarning('Groq unavailable, failing over to secondary provider: ' + e.message)",
    "11.         return InvokeOpenRouterFallback(T.prompt, 'mistralai/mixtral-8x7b')",
    "12. end if"
  ];
  elements.push(...createAlgorithm("3.1", "Intelligent Multi-Provider Task Routing", algo1_steps));

  // Algorithm 3.2
  const algo2_steps = [
    "Input: DocumentSpec D, NaturalLanguageInstruction I, ActivePageIndex idx",
    "Output: Updated DocumentSpec D_prime with Preserved User Content",
    "1.  targetScope <- ResolveScope(I, idx) // resolves to 'page', 'element', or 'document'",
    "2.  targetPage <- D.pages[targetScope.pageIndex]",
    "3.  patches <- GenerateAtomicPatches(I, targetPage, D.theme)",
    "4.  for each patch in patches do:",
    "5.      if patch.op == 'change_layout' then",
    "6.          validArchetype <- NormalizeArchetype(patch.newArchetype, targetPage.archetype)",
    "7.          targetPage.archetype <- validArchetype",
    "8.          // Content Preservation Guard: Retain existing title and body if omitted",
    "9.          if patch.elements.omitsExistingTitle and targetPage.hasTitle then",
    "10.             patch.elements.prepend(targetPage.getTitleElement())",
    "11.         end if",
    "12.         targetPage.elements <- patch.elements",
    "13.     else if patch.op == 'update_text' and patch.elementId != null then",
    "14.         el <- targetPage.findElementById(patch.elementId)",
    "15.         el.content <- patch.newText",
    "16.     end if",
    "17. end for",
    "18. D_prime <- SanitizeAndValidateDocumentSpec(D)",
    "19. return D_prime"
  ];
  elements.push(...createAlgorithm("3.2", "Non-Destructive Atomic Slide Patch Execution", algo2_steps));

  // Algorithm 3.3
  const algo3_steps = [
    "Input: TopicString S, SeedValue V",
    "Output: VisualDirectionSpec VD = { styleFamily, palette, surfaceTokens, typography }",
    "1.  entropyHash <- SHA256(S + V.toString())",
    "2.  familyIndex <- (entropyHash[0..3].toInteger()) mod 10",
    "3.  selectedFamily <- STYLE_FAMILIES[familyIndex]",
    "4.  palette <- ComputeHarmoniousPalette(selectedFamily, entropyHash)",
    "5.  VerifyContrastRatio(palette.textPrimary, palette.baseBackground) >= 4.5:1",
    "6.  glowAngle <- (entropyHash[4..5].toInteger()) mod 360",
    "7.  surfaceTokens <- { fill: HexToRgba(palette.cardBase, 0.65), border: palette.accentBorder }",
    "8.  typography <- { displayFont: selectedFamily.fontHeader, bodyFont: selectedFamily.fontBody }",
    "9.  return { styleFamily: selectedFamily.name, palette, surfaceTokens, glowAngle, typography }"
  ];
  elements.push(...createAlgorithm("3.3", "Procedural Visual Direction Synthesis", algo3_steps));

  elements.push(sectionHeading("3.35 Flowcharts"));
  elements.push(p(
    "The procedural flowcharts governing user interactions, AI compilation, and client-side PPTX generation are detailed in Figures 3.2, 3.4, and 3.15. The system transitions strictly through deterministic state gates, guaranteeing zero data loss."
  ));

  elements.push(sectionHeading("3.36 Data Flow"));
  elements.push(p(
    "The end-to-end data lifecycle encompasses user credentials, source text streams, blueprint AST payloads, diffusion visual assets, and binary OpenXML presentation streams. Figure 3.17 illustrates the complete user journey and data transformations."
  ));

  const fig3_17_lines = [
    "[User Ingestion: Prompt / PDF / DOCX / CSV]",
    "                   |",
    "                   v",
    "[Next.js Server: Document Parsing & Text Normalization]",
    "                   |",
    "                   v",
    "[Google Gemini / Groq: Blueprint Outline Synthesis]",
    "                   |",
    "                   v",
    "[Interactive Planning Canvas: Outline Reordering & Slide Locking]",
    "                   |",
    "                   v",
    "[Multi-Provider Pipeline: Content Generation (Groq) & Image Diffusion (FLUX)]",
    "                   |",
    "                   v",
    "[DocumentSpec AST Construction: Theme & Layout Assembly with Zod Validation]",
    "                   |",
    "                   v",
    "[Unified Studio Canvas: Interactive Slide Preview & Non-Destructive Editing]",
    "                   |",
    "                   v",
    "[Client Browser: In-Memory pptxgenjs OpenXML Compilation]",
    "                   |",
    "                   v",
    "[Native Microsoft PowerPoint (.pptx) File Delivered to User Filesystem]"
  ];
  elements.push(...createFigure(fig3_17_lines, "Figure 3.17: Complete User Journey Data Flow"));

  elements.push(sectionHeading("3.37 Development Methodology"));
  elements.push(p(
    "SlideCraft AI was developed utilizing an Agile Scrum engineering methodology. Iterative two-week sprints focused on incremental deliverable milestones: Sprint 1 implemented the DocumentSpec AST and basic canvas rendering; Sprint 2 integrated Groq LLaMA-3.3 and Supabase persistence; Sprint 3 introduced the Content Blueprint Planner and NVIDIA FLUX image synthesis; Sprint 4 implemented native PPTX compilation via pptxgenjs; and Sprint 5 established the non-destructive atomic patch engine, Edge Middleware authentication guards, and comprehensive quality assurance testing."
  ));

  return elements;
}

module.exports = { getChapter3_F };
