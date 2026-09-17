import { DocumentType } from "@/types/document-spec";

export interface NormalizedContentBrief {
  coreTopic: string;
  targetAudience: string;
  purpose: string;
  hardConstraints: string[];
  keyThemes: Array<{
    title: string;
    keyPoints: string[];
    metrics: string[];
    suggestedArchetype?: string;
  }>;
  suggestedPageCount: number;
  extractedTerminology: Record<string, string>;
  // Enriched fields
  detectedTone: string;
  detectedDomain: string;
  detectedDensity: "light" | "balanced" | "dense";
  colorHints: string[];
  visualStyleHint: string;
  extractedNames: string[];
  extractedDates: string[];
  extractedUrls: string[];
  rawWordCount: number;
}

/**
 * Extracts hard quantitative and naming constraints from text.
 * These are preserved exactly in the generated content.
 */
function extractExplicitConstraints(text: string): string[] {
  const constraints: string[] = [];

  // Currency and financial metrics
  const currencyMatches = text.match(/[\$€£₹]\s?[\d\.,]+(?:\s?[kKmMbBtT]|(?:\s?million|\s?billion|\s?crore|\s?lakh))?/g);
  if (currencyMatches) {
    constraints.push(...currencyMatches.map((m) => `Financial: ${m.trim()}`));
  }

  // Percentages
  const percentMatches = text.match(/[+-]?\d+(?:\.\d+)?%/g);
  if (percentMatches) {
    constraints.push(...percentMatches.map((p) => `Metric: ${p.trim()}`));
  }

  // Explicit user instructions
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(must|always|ensure|include|require|do not|never|target:|important:|note:)/i.test(trimmed) && trimmed.length > 10) {
      constraints.push(`Rule: ${trimmed}`);
    }
  }

  // Large numbers (e.g. 10,000 users, 5 million downloads)
  const largeNumbers = text.match(/\b\d[\d,]*\s?(?:million|billion|thousand|users|customers|downloads|installs|transactions|requests)\b/gi);
  if (largeNumbers) {
    constraints.push(...largeNumbers.map((n) => `Quantity: ${n.trim()}`));
  }

  return Array.from(new Set(constraints));
}

/** Extract proper nouns, company names, product names */
function extractNames(text: string): string[] {
  // Match capitalized multi-word phrases that look like proper nouns
  const matches = text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+){0,3}\b/g) || [];
  const stopWords = new Set(["The", "This", "That", "With", "From", "When", "Then", "Also", "And", "But", "For", "Our", "Your", "Their", "We", "They"]);
  return Array.from(new Set(matches.filter(m => !stopWords.has(m.split(" ")[0]) && m.length > 3))).slice(0, 10);
}

/** Extract dates, quarters, years */
function extractDates(text: string): string[] {
  const matches: string[] = [];
  const datePatterns = [
    /\b(Q[1-4]\s*20\d\d)\b/gi,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?\b/gi,
    /\b(20\d\d)\b/g,
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
  ];
  for (const pat of datePatterns) {
    const found = text.match(pat) || [];
    matches.push(...found);
  }
  return Array.from(new Set(matches)).slice(0, 8);
}

/** Extract URLs */
function extractUrls(text: string): string[] {
  return Array.from(new Set(text.match(/https?:\/\/[^\s)>\]"]+/g) || []));
}

/** Extract explicit color preferences */
function extractColorHints(text: string): string[] {
  const hints: string[] = [];
  const lower = text.toLowerCase();

  const colors = ["red", "blue", "green", "purple", "orange", "yellow", "pink", "black", "white", "gray", "navy", "teal", "gold", "silver", "dark", "light", "bright", "pastel", "vibrant", "muted", "bold", "minimal"];
  for (const color of colors) {
    if (lower.includes(color)) hints.push(color);
  }

  // Hex codes mentioned explicitly
  const hexMatches = text.match(/#[0-9A-Fa-f]{6}\b/g) || [];
  hints.push(...hexMatches);

  return hints;
}

/** Infer visual style hint from prompt vocabulary */
function inferVisualStyleHint(text: string, domain: string): string {
  const lower = text.toLowerCase();
  if (/\b(minimal|clean|simple|whitespace|elegant)\b/.test(lower)) return "minimal";
  if (/\b(bold|impactful|vibrant|colorful|expressive)\b/.test(lower)) return "bold";
  if (/\b(dark|night|neon|glow|gradient)\b/.test(lower)) return "dark";
  if (/\b(corporate|professional|formal|executive|business)\b/.test(lower)) return "corporate";
  if (/\b(academic|research|scientific|scholarly)\b/.test(lower)) return "academic";
  if (/\b(creative|artistic|design|portfolio)\b/.test(lower)) return "creative";
  if (domain === "technology" || domain === "ai") return "tech";
  if (domain === "event") return "bold";
  if (domain === "education") return "academic";
  if (domain === "finance" || domain === "corporate") return "corporate";
  return "modern";
}

/** Detect domain from text */
function detectDomain(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(luxury|gold|black and gold|prestige|vip|wealth|bespoke|couture)\b/.test(lower)) return "luxury";
  if (/\b(children|kids|kindergarten|preschool|elementary|playful)\b/.test(lower)) return "children";
  if (/\b(magazine|editorial|journalism|article|curated|publication)\b/.test(lower)) return "magazine";
  if (/\b(neon|cyberpunk|synthwave|arcade|terminal|matrix|futuristic)\b/.test(lower)) return "cyberpunk";
  if (/\b(finance|banking|investment|revenue|profit|equity|fund|capital|fiscal|trading)\b/.test(lower)) return "finance";
  if (/\b(health|medical|patient|clinical|pharma|doctor|surgery|therapy|wellness|hospital)\b/.test(lower)) return "healthcare";
  if (/\b(university|college|student|academic|curriculum|thesis|professor|lecture|school|exam)\b/.test(lower)) return "education";
  if (/\b(design|creative|brand|marketing|campaign|photography|portfolio|agency|ux|ui|advertising)\b/.test(lower)) return "creative";
  if (/\b(saas|software|platform|cloud|api|devops|kubernetes|microservice|deployment|backend|frontend)\b/.test(lower)) return "technology";
  if (/\b(ai|artificial intelligence|neural|blockchain|robotics|autonomous|quantum|generative)\b/.test(lower)) return "ai";
  if (/\b(event|festival|conference|concert|hackathon|workshop|meetup|summit|expo|celebration|fest)\b/.test(lower)) return "event";
  if (/\b(environment|sustainability|green|climate|carbon|renewable|eco|conservation|ngo)\b/.test(lower)) return "environment";
  if (/\b(science|engineering|laboratory|experiment|hypothesis|physics|chemistry|algorithm|simulation)\b/.test(lower)) return "science";
  if (/\b(corporate|enterprise|strategy|operations|governance|compliance|procurement|executive|board)\b/.test(lower)) return "corporate";
  return "general";
}

/** Detect tone from text */
function detectTone(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(academic|research|scholarly|scientific|rigorous|systematic|peer|thesis|dissertation)\b/.test(lower)) return "academic";
  if (/\b(creative|artistic|expressive|vibrant|colorful|bold|unconventional)\b/.test(lower)) return "creative";
  if (/\b(technical|engineering|developer|code|system|architecture|infrastructure)\b/.test(lower)) return "tech";
  if (/\b(minimal|clean|simple|elegant|understated|whitespace)\b/.test(lower)) return "minimal";
  if (/\b(formal|official|professional|executive|authoritative|serious)\b/.test(lower)) return "formal";
  if (/\b(startup|pitch|investor|venture|seed|growth|scale|traction)\b/.test(lower)) return "modern";
  return "modern";
}

/** Detect content density preference */
function detectDensity(text: string): "light" | "balanced" | "dense" {
  const wordCount = text.split(/\s+/).length;
  const hasDetailKw = /\b(detailed|comprehensive|thorough|in-depth|complete|extensive|full|elaborate)\b/i.test(text);
  const hasSimpleKw = /\b(simple|brief|quick|overview|summary|high-level|short|concise)\b/i.test(text);
  if (hasSimpleKw || wordCount < 30) return "light";
  if (hasDetailKw || wordCount > 300) return "dense";
  return "balanced";
}

/**
 * Infer suggested page count from prompt signals.
 * This is the primary count used unless explicitly overridden.
 */
function inferPageCount(text: string, documentType?: DocumentType, requested?: number): number {
  if (requested) return Math.min(Math.max(requested, 1), 20);

  const lower = text.toLowerCase();

  // Explicit count mentioned
  const explicit = lower.match(/\b(\d+)\s*(?:slides?|pages?|sections?)\b/);
  if (explicit) {
    const n = parseInt(explicit[1]);
    if (n >= 1 && n <= 20) return n;
  }

  if (documentType === "poster" || documentType === "resume" || documentType === "letter" || documentType === "social_media") return 1;
  if (documentType === "infographic") return 1;
  if (documentType === "diagram" || documentType === "chart") return 1;

  const wordCount = text.split(/\s+/).length;
  if (wordCount < 20) return 4;
  if (wordCount < 80) return 5;
  if (wordCount < 200) return 7;
  return 8;
}

/**
 * Segments the prompt into thematic sections for individual slides.
 * Each returned section becomes one slide/page.
 */
function segmentIntoThemes(
  text: string,
  targetCount: number,
  constraints: string[]
): NormalizedContentBrief["keyThemes"] {
  const themes: NormalizedContentBrief["keyThemes"] = [];

  // Try to split by double newlines first (explicit sections)
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 15);

  if (paragraphs.length >= targetCount - 1) {
    // Use the first N paragraphs
    const usable = paragraphs.slice(0, targetCount - 1); // -1 for intro slide
    for (let i = 0; i < usable.length; i++) {
      const p = usable[i];
      const sentences = p.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 5);
      themes.push({
        title: sentences[0]?.slice(0, 70) || `Section ${i + 1}`,
        keyPoints: sentences.slice(1, 4),
        metrics: extractExplicitConstraints(p),
      });
    }
  }

  // Pad or replace with topic-derived themes if not enough paragraphs
  const lower = text.toLowerCase();
  const topicThemes = buildTopicThemes(lower, text, constraints);
  while (themes.length < targetCount - 1 && topicThemes.length > themes.length) {
    themes.push(topicThemes[themes.length]);
  }

  return themes;
}

/** Build topic-relevant slide themes from the prompt subject matter */
function buildTopicThemes(
  lower: string,
  originalText: string,
  constraints: string[]
): NormalizedContentBrief["keyThemes"] {
  // These are narrative archetypes matched to the prompt domain
  // They use actual words from the prompt, not generic filler

  const sentences = originalText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.length < 200);

  // Extract key noun phrases from the first sentence as the topic
  const topic = originalText.split(/[.\n]/)[0]?.trim() || "Topic";
  const midSentences = sentences.slice(1, 8);

  // Build themes from actual prompt content grouped by position
  const groupSize = Math.max(1, Math.ceil(midSentences.length / 4));
  const groups: string[][] = [];
  for (let i = 0; i < midSentences.length; i += groupSize) {
    groups.push(midSentences.slice(i, i + groupSize));
  }

  const themes: NormalizedContentBrief["keyThemes"] = [];

  // Pitch/startup deck narrative
  if (/\b(pitch|startup|investor|seed|series|venture)\b/.test(lower)) {
    themes.push(
      { title: "The Problem We Solve", keyPoints: groups[0] || ["Current market friction and unmet needs"], metrics: constraints.slice(0, 2) },
      { title: "Our Solution", keyPoints: groups[1] || ["Core product approach and differentiators"], metrics: [] },
      { title: "Market Opportunity", keyPoints: groups[2] || ["Total addressable market and growth trajectory"], metrics: constraints.slice(2, 4) },
      { title: "Traction & Milestones", keyPoints: groups[3] || ["Key metrics and growth indicators"], metrics: constraints },
    );
  }
  // Technical/architecture deck
  else if (/\b(architecture|system|infrastructure|microservice|kubernetes|cloud|aws|azure|gcp)\b/.test(lower)) {
    themes.push(
      { title: "System Overview", keyPoints: groups[0] || ["High-level architecture and design philosophy"], metrics: [] },
      { title: "Core Components", keyPoints: groups[1] || ["Service breakdown and technology stack"], metrics: [] },
      { title: "Data Flow & Integration", keyPoints: groups[2] || ["How components communicate and share data"], metrics: [] },
      { title: "Performance & Reliability", keyPoints: groups[3] || ["SLAs, monitoring, and fault tolerance"], metrics: constraints },
    );
  }
  // Research/academic
  else if (/\b(research|study|analysis|methodology|findings|conclusion|abstract)\b/.test(lower)) {
    themes.push(
      { title: "Research Background", keyPoints: groups[0] || ["Literature context and research gap"], metrics: [] },
      { title: "Methodology", keyPoints: groups[1] || ["Study design, sample, and analytical approach"], metrics: [] },
      { title: "Results & Findings", keyPoints: groups[2] || ["Key findings and quantitative outcomes"], metrics: constraints },
      { title: "Conclusions", keyPoints: groups[3] || ["Implications, limitations, and future work"], metrics: [] },
    );
  }
  // Business/strategy
  else {
    themes.push(
      { title: `${topic} — Overview`, keyPoints: groups[0] || ["Context and background"], metrics: constraints.slice(0, 2) },
      { title: "Key Insights & Analysis", keyPoints: groups[1] || ["Primary findings and supporting evidence"], metrics: [] },
      { title: "Strategy & Approach", keyPoints: groups[2] || ["Recommended actions and implementation plan"], metrics: [] },
      { title: "Outcomes & Next Steps", keyPoints: groups[3] || ["Expected results and action items"], metrics: constraints.slice(2) },
    );
  }

  return themes;
}

/**
 * Normalizes a prompt or uploaded source into a rich structured brief.
 * This is the primary input to the generation pipeline.
 */
export function normalizeContentInput(
  rawInput: string,
  options: {
    documentType?: DocumentType;
    requestedPageCount?: number;
  } = {}
): NormalizedContentBrief {
  const cleanInput = rawInput.trim();
  const constraints = extractExplicitConstraints(cleanInput);
  const lower = cleanInput.toLowerCase();

  // Core topic: first significant sentence or heading
  const firstLine = cleanInput.split(/[\n.]/)[0]?.trim() || "Untitled";
  const coreTopic = firstLine.length > 80 ? firstLine.slice(0, 78) + "…" : firstLine;

  // Enriched detections
  const detectedDomain = detectDomain(cleanInput);
  const detectedTone = detectTone(cleanInput);
  const detectedDensity = detectDensity(cleanInput);
  const colorHints = extractColorHints(cleanInput);
  const visualStyleHint = inferVisualStyleHint(cleanInput, detectedDomain);
  const extractedNames = extractNames(cleanInput);
  const extractedDates = extractDates(cleanInput);
  const extractedUrls = extractUrls(cleanInput);
  const rawWordCount = cleanInput.split(/\s+/).length;

  // Audience inference
  let targetAudience = "General Audience";
  if (/\b(investor|vc|venture capital|angel|seed|series)\b/.test(lower)) targetAudience = "Investors & Venture Capital";
  else if (/\b(customer|client|buyer|consumer|user|end user)\b/.test(lower)) targetAudience = "Customers & Clients";
  else if (/\b(executive|ceo|cto|board|leadership|c-suite|director)\b/.test(lower)) targetAudience = "Executive Leadership";
  else if (/\b(team|engineer|developer|employee|staff|internal|colleague)\b/.test(lower)) targetAudience = "Internal Teams";
  else if (/\b(student|learner|participant|attendee|delegate)\b/.test(lower)) targetAudience = "Students & Learners";
  else if (/\b(researcher|academic|professor|scientist|faculty|peer)\b/.test(lower)) targetAudience = "Academic Researchers";
  else if (/\b(public|community|society|citizen|voter|general)\b/.test(lower)) targetAudience = "General Public";

  // Purpose inference
  let purpose = "Inform and communicate key ideas";
  if (/\b(pitch|raise|funding|investment|seed)\b/.test(lower)) purpose = "Secure investment and demonstrate growth potential";
  else if (/\b(sell|proposal|demo|close|prospect)\b/.test(lower)) purpose = "Persuade and convert prospects";
  else if (/\b(report|update|status|review|quarterly|annual)\b/.test(lower)) purpose = "Report progress and communicate results";
  else if (/\b(train|teach|workshop|course|lesson|tutorial|educate)\b/.test(lower)) purpose = "Educate and build skills";
  else if (/\b(announce|launch|release|introduce|reveal)\b/.test(lower)) purpose = "Announce and build awareness";
  else if (/\b(research|study|analyze|investigate|explore|findings)\b/.test(lower)) purpose = "Present research findings and conclusions";

  // Page count
  const suggestedPageCount = inferPageCount(cleanInput, options.documentType, options.requestedPageCount);

  // Thematic segmentation
  const keyThemes = segmentIntoThemes(cleanInput, suggestedPageCount, constraints);

  return {
    coreTopic,
    targetAudience,
    purpose,
    hardConstraints: constraints,
    keyThemes,
    suggestedPageCount,
    extractedTerminology: {},
    detectedTone,
    detectedDomain,
    detectedDensity,
    colorHints,
    visualStyleHint,
    extractedNames,
    extractedDates,
    extractedUrls,
    rawWordCount,
  };
}
