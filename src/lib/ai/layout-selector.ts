import { LayoutArchetype } from "@/types/document-spec";

export type ContentCategory =
  | "title"
  | "subtitle"
  | "paragraph"
  | "bullet_list"
  | "statistic"
  | "comparison"
  | "timeline"
  | "process"
  | "quote"
  | "diagram"
  | "table"
  | "chart"
  | "image"
  | "call_to_action"
  | "contact_info"
  | "section_break"
  | "closing";

/**
 * Classify a block of text into semantic content categories.
 * Multiple categories can match simultaneously.
 */
export function classifyContent(text: string): ContentCategory[] {
  const categories: Set<ContentCategory> = new Set();
  const lower = text.toLowerCase();

  // Statistic / Quantitative metrics
  if (/[\$€£₹]\s?\d+|\d+%\s?|\d+\.\d+x|\b(arr|kpi|growth|revenue|retention|ltv|cac|mrr|arpu|ctr|roi|roas)\b/i.test(text)) {
    categories.add("statistic");
  }

  // Comparison / Matrix
  if (/\b(vs|versus|compared to|comparison|competitors|pros and cons|alternative|difference|better than|vs\.)\b/i.test(lower)) {
    categories.add("comparison");
  }

  // Timeline / Milestones
  if (/\b(phase \d|q[1-4]|milestone|roadmap|by 202\d|timeline|history|journey|evolution|past|future|year \d|since \d)\b/i.test(lower)) {
    categories.add("timeline");
  }

  // Process / Workflow / Steps
  if (/\b(step \d|workflow|pipeline|stage \d|first|then|next|finally|lifecycle|flow|process|procedure|approach|methodology|how it works|how to)\b/i.test(lower)) {
    categories.add("process");
  }

  // Quote / Testimonial
  if (/["""'].{20,}["""']|\b(said|stated|quoted|testimonial|according to|in the words|vision statement)\b/i.test(text)) {
    categories.add("quote");
  }

  // Chart / Quantitative distribution
  if (/\b(chart|graph|trend|distribution|breakdown|forecast|trajectory|volume|growth curve|bar|pie|line graph|analytics)\b/i.test(lower)) {
    categories.add("chart");
  }

  // Diagram / Architecture
  if (/\b(architecture|microservices|infrastructure|dag|components|modules|system design|service|api|layer|tier|flow diagram|network|topology)\b/i.test(lower)) {
    categories.add("diagram");
  }

  // Table / Feature matrix
  if (/\b(features|specs|matrix|pricing tiers|plan a|plan b|tiers|comparison table|grid|rows|columns)\b/i.test(lower)) {
    categories.add("table");
  }

  // Bullet list
  if (/(?:^|\n)\s*[-*•\d\.]\s+.+/m.test(text) || /\b(key points|highlights|benefits|advantages|features|list|includes)\b/i.test(lower)) {
    categories.add("bullet_list");
  }

  // Call to Action / Contact
  if (/\b(contact|call to action|get started|reach out|email|website|schedule demo|sign up|register|join|download|cta|next step)\b/i.test(lower)) {
    categories.add("call_to_action");
  }

  // Section break
  if (/\b(section|chapter|part \d|module|unit|topic \d)\b/i.test(lower) && text.split(/\s+/).length < 10) {
    categories.add("section_break");
  }

  // Closing / Conclusion
  if (/\b(conclusion|summary|in conclusion|to summarize|takeaway|closing|thank you|questions|recap|wrap up|key learnings)\b/i.test(lower)) {
    categories.add("closing");
  }

  // Default
  if (categories.size === 0) {
    categories.add("paragraph");
  }

  return Array.from(categories);
}

/**
 * Full presentation archetype sequence based on deck position and content type.
 * Uses ALL available archetypes, not just 6.
 */
const PPTX_ARCHETYPE_SEQUENCE: LayoutArchetype[] = [
  "hero_title",
  "title_and_content",
  "four_metric_dashboard",
  "two_column_split",
  "three_card_grid",
  "horizontal_timeline",
  "process_flowchart",
  "data_chart_focus",
  "comparison_table",
  "full_bleed_visual",
  "big_statistic",
  "editorial_asymmetrical",
  "three_column",
  "two_column",
  "infographic_radial",
  "comparison",
  "timeline",
  "process_flow",
  "diagram",
  "chart",
  "table",
  "quote",
  "section_divider",
  "summary",
  "closing_slide",
];

/**
 * Select the optimal layout archetype for a slide given its content categories,
 * its position in the deck, and previously assigned archetypes.
 * Prevents consecutive duplicates. Uses diverse archetypes based on content.
 */
export function selectLayoutArchetype(
  categories: ContentCategory[],
  pageIndex: number,
  previousArchetypes: LayoutArchetype[] = [],
  totalPages: number = 5,
  documentType?: string
): LayoutArchetype {
  const last = previousArchetypes[previousArchetypes.length - 1];
  const isLastSlide = pageIndex === totalPages - 1;
  const isFirstSlide = pageIndex === 0;

  // First slide: always hero
  if (isFirstSlide) return "hero_title";

  // Last slide: closing or summary
  if (isLastSlide && totalPages > 2) {
    return categories.includes("call_to_action") ? "closing_slide" : "summary";
  }

  // Second-to-last: editorial or big stat
  if (pageIndex === totalPages - 2 && totalPages > 3) {
    if (categories.includes("statistic")) return "big_statistic";
    if (categories.includes("quote")) return "editorial_asymmetrical";
  }

  // Section divider for "section_break" content
  if (categories.includes("section_break")) return "section_divider";

  // Build candidate list ordered by content match strength
  const candidates: LayoutArchetype[] = [];

  // Primary content-type matches
  if (categories.includes("statistic") && categories.includes("chart")) {
    candidates.push("four_metric_dashboard", "data_chart_focus", "big_statistic");
  } else if (categories.includes("statistic")) {
    candidates.push("four_metric_dashboard", "big_statistic", "two_column_split");
  }

  if (categories.includes("timeline")) {
    candidates.push("horizontal_timeline", "timeline", "process_flowchart");
  }

  if (categories.includes("process")) {
    candidates.push("process_flowchart", "process_flow", "three_card_grid");
  }

  if (categories.includes("comparison") && categories.includes("table")) {
    candidates.push("comparison_table", "comparison", "two_column_split");
  } else if (categories.includes("comparison")) {
    candidates.push("comparison", "two_column_split", "comparison_table");
  }

  if (categories.includes("chart")) {
    candidates.push("data_chart_focus", "chart", "two_column_split");
  }

  if (categories.includes("diagram")) {
    candidates.push("diagram", "process_flowchart", "infographic_radial");
  }

  if (categories.includes("table")) {
    candidates.push("table", "comparison_table");
  }

  if (categories.includes("quote")) {
    candidates.push("editorial_asymmetrical", "quote", "full_bleed_visual");
  }

  if (categories.includes("bullet_list") && pageIndex === 1) {
    candidates.push("three_card_grid", "title_and_content");
  } else if (categories.includes("bullet_list")) {
    candidates.push("three_card_grid", "two_column_split", "three_column", "title_and_content");
  }

  if (categories.includes("call_to_action")) {
    candidates.push("closing_slide", "editorial_asymmetrical", "hero_title");
  }

  if (categories.includes("image")) {
    candidates.push("full_bleed_visual", "two_column_split");
  }

  // Positional diversity pool — archetypes we haven't used yet
  const unused = PPTX_ARCHETYPE_SEQUENCE.filter(
    a => !previousArchetypes.includes(a) && a !== "hero_title" && a !== "closing_slide" && a !== "summary"
  );

  // Fallback diversity fillers
  candidates.push(
    ...unused.slice(0, 4),
    "two_column_split",
    "three_card_grid",
    "data_chart_focus",
    "four_metric_dashboard",
    "horizontal_timeline",
    "editorial_asymmetrical",
  );

  // Pick the first candidate that is NOT the immediate predecessor
  for (const arch of candidates) {
    if (arch !== last) return arch;
  }

  // Absolute fallback — cycle through sequence
  const idx = (pageIndex - 1) % (PPTX_ARCHETYPE_SEQUENCE.length - 3) + 1;
  return PPTX_ARCHETYPE_SEQUENCE[idx] !== last
    ? PPTX_ARCHETYPE_SEQUENCE[idx]
    : PPTX_ARCHETYPE_SEQUENCE[idx + 1] ?? "two_column_split";
}
