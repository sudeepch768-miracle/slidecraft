const {
  p,
  sectionHeading,
  createTable,
  createFigure
} = require("./helpers");

function getChapter3_C() {
  const elements = [];

  elements.push(sectionHeading("3.9 Multi-Provider AI Routing"));
  elements.push(p(
    "Rather than forcing all generative tasks through a single, expensive LLM, SlideCraft AI implements an intelligent Multi-Provider AI Routing Architecture. Generative sub-tasks exhibit vastly divergent computational profiles: generating slide bullet points demands ultra-high token throughput and low latency; parsing multi-page PDFs requires vast context windows; and synthesizing contextual illustrations necessitates specialized diffusion flow-matching models. Figure 3.3 and Table 3.4 depict this routing architecture."
  ));

  const fig3_3_lines = [
    "                        [Incoming Generative Task Request]",
    "                                       |",
    "                     +-----------------+-----------------+",
    "                     | AI Task Router & Classifier Matrix|",
    "                     +-----------------+-----------------+",
    "                                       |",
    "         +--------------------+--------+--------+--------------------+",
    "         |                    |                 |                    |",
    "         v                    v                 v                    v",
    "   [Fast Slide Text]   [Document Parsing] [Image Diffusion]   [Resilience Failover]",
    "         |                    |                 |                    |",
    "         v                    v                 v                    v",
    "    +----------+        +----------+      +-----------+       +---------------+",
    "    |   Groq   |        |  Google  |      |  NVIDIA   |       |  OpenRouter   |",
    "    | LLaMA-3.3|        |  Gemini  |      | FLUX API  |       |   Free-Tier   |",
    "    |   70B    |        |1.5 Flash |      |FLUX.2/1.1 |       |   Fallbacks   |",
    "    +----------+        +----------+      +-----------+       +---------------+",
    "   (<1.8s Latency)      (1M+ Context)     (4-sec Flow)        (Zero-Downtime)  "
  ];
  elements.push(...createFigure(fig3_3_lines, "Figure 3.3: Multi-Provider AI Routing Architecture"));

  const aiHeaders = ["Provider Name", "Underlying Model Family", "Specialized System Responsibility", "Latency Benchmark", "Status"];
  const aiRows = [
    ["Groq", "LLaMA-3.3-70B-Versatile", "Rapid slide text, element JSON, editor patches", "Sub-1.8 seconds", "IMPLEMENTED"],
    ["NVIDIA Build", "FLUX.2-klein-4b / FLUX.1-schnell", "Photorealistic slide visuals with negative prompts", "3.5 - 5.0 seconds", "IMPLEMENTED"],
    ["Google Gemini", "Gemini-1.5-Flash / Gemini-2.5", "Document ingestion, deep reasoning, outlines", "2.0 - 3.5 seconds", "IMPLEMENTED"],
    ["OpenRouter", "Mistral / LLaMA open models", "Automated resilience failover for rate limit recovery", "2.5 - 4.5 seconds", "IMPLEMENTED"],
  ];
  elements.push(...createTable("Table 3.4: AI Provider Responsibilities and Routing Matrix", aiHeaders, aiRows, [16, 26, 32, 14, 12]));

  elements.push(sectionHeading("3.10 Content Generation"));
  elements.push(p(
    "Content generation is governed by system prompts that enforce concise, presentation-grade copywriting principles: headline-lead assertions, three-to-four succinct bullet points per container, quantitative metrics highlighted with explicit units, and zero conversational filler. The output is structured strictly into typed JSON objects conforming to the DocumentSpec AST schema."
  ));

  elements.push(sectionHeading("3.11 Content Blueprint Planner"));
  elements.push(p(
    "The Content Blueprint Planner is an interactive pre-generation subsystem that eliminates the black-box opacity of conventional AI tools. The planner synthesizes a comprehensive presentation blueprint displayed as interactive cards prior to full presentation compilation. Figure 3.5 illustrates the planner workflow."
  ));

  const fig3_5_lines = [
    "[User Prompt Ingestion] ---> [LLM Analyzes Structure] ---> [Generates Initial Outline Cards]",
    "                                                                   |",
    "    +--------------------------------------------------------------+",
    "    |",
    "    v",
    "[Interactive Planning Board]",
    "    +---> Card Reordering (Drag-and-Drop sequence rearrangement)",
    "    +---> Slide Outline Editing (Direct inline text editing of slide titles & goals)",
    "    +---> Archetype Assignment (Manual or automatic selection of slide layout type)",
    "    +---> Slide Locking Toggle (Pins specific slide content against regeneration)",
    "    +---> Section Regrouping (Organizes presentation into logical thematic sections)",
    "    |",
    "    v",
    "[Content Health Engine] ---> (Evaluates Slide Balance, Text Density & Flow Cohesion)",
    "    |",
    "    v [User Clicks 'Compile Presentation']",
    "[Plan-to-Slides Compiler Pipeline] ---> (Dispatches to Multi-Provider Engine)"
  ];
  elements.push(...createFigure(fig3_5_lines, "Figure 3.5: Content Planner Workflow"));

  elements.push(sectionHeading("3.12 Slide Archetype Selection"));
  elements.push(p(
    "SlideCraft AI repudiates generic text-box layouts by employing structured Slide Layout Archetypes. Archetypes dictate container grids, negative space ratios, visual focal points, and element typography. Table 3.6 details the primary archetypes supported by the platform."
  ));

  const archHeaders = ["Layout Archetype", "Container Topology", "Optimal Semantic Content", "Visual Dominance", "Status"];
  const archRows = [
    ["hero_title", "Centered single-column with large display typography", "Title slide, executive keynote opening, closing slide", "Display typography & atmospheric background glow", "IMPLEMENTED"],
    ["two_column_split", "50/50 or 60/40 asymmetrical horizontal split", "Concept contrast, visual-to-text narrative, product showcase", "Balanced text card juxtaposed with contextual image", "IMPLEMENTED"],
    ["three_card_grid", "3 equal vertical cards across horizontal grid", "Core pillars, feature trios, value propositions", "Equal-weight surface cards with glowing border trims", "IMPLEMENTED"],
    ["four_metric_dashboard", "2x2 grid of metric cards with prominent numbers", "KPI reviews, financial stats, performance indicators", "Large colored numerical metrics with label subscripts", "IMPLEMENTED"],
    ["horizontal_timeline", "Sequential horizontal milestones with connecting axis", "Project roadmaps, historical milestones, step phases", "Chronological flow bar with milestone node cards", "IMPLEMENTED"],
    ["comparison_table", "Structured multi-row tabular layout", "Feature matrix, competitive analysis, pros vs cons", "High-density data rows with clear column dividers", "IMPLEMENTED"],
    ["process_flowchart", "Interconnected step cards with directional connectors", "Engineering workflows, software pipelines, customer journey", "Directed workflow cards with sequential indicators", "IMPLEMENTED"],
  ];
  elements.push(...createTable("Table 3.6: Slide Archetypes and Layout Characteristics", archHeaders, archRows, [20, 25, 25, 20, 10]));

  elements.push(sectionHeading("3.13 DocumentSpec Architecture"));
  elements.push(p(
    "The central architectural foundation of SlideCraft AI is the DocumentSpec Abstract Syntax Tree (AST). All system modules—the AI planners, visual direction engines, canvas renderers, patch modification services, and PPTX compilers—communicate exclusively through mutations of this strongly typed tree. Figure 3.6 outlines the AST schema hierarchy."
  ));

  const fig3_6_lines = [
    "                            +-----------------------------------------+",
    "                            |          DocumentSpec (Root AST)        |",
    "                            | - id: UUID                              |",
    "                            | - title: string                         |",
    "                            | - format: FormatType (presentation, etc)|",
    "                            | - visualDirection: VisualDirectionSpec  |",
    "                            | - theme: ThemeSpec                      |",
    "                            +-----------------------------------------+",
    "                                                 |",
    "                                                 v",
    "                            +-----------------------------------------+",
    "                            |          PageSpec[] (Slide Array)       |",
    "                            | - id: string                            |",
    "                            | - pageNumber: number                    |",
    "                            | - title: string                         |",
    "                            | - archetype: LayoutArchetype            |",
    "                            | - backgroundOverride?: BackgroundSpec   |",
    "                            +-----------------------------------------+",
    "                                                 |",
    "                                                 v",
    "                            +-----------------------------------------+",
    "                            |      ContentElement[] (Slide Elements)  |",
    "                            | - id: string                            |",
    "                            | - type: text | image | card | metric ...|",
    "                            | - variant: h1 | h2 | body | stat ...    |",
    "                            | - content / value: string               |",
    "                            | - style: ElementStyleSpec               |",
    "                            +-----------------------------------------+"
  ];
  elements.push(...createFigure(fig3_6_lines, "Figure 3.6: DocumentSpec / AST Architecture"));

  elements.push(sectionHeading("3.14 Dynamic Visual Direction Engine"));
  elements.push(p(
    "To eliminate the repetitive visual homogeneity characteristic of template-based tools, SlideCraft AI incorporates a Dynamic Visual Direction Engine. The engine algorithmically constructs presentation-level design systems using topic semantic entropy and cryptographic variation seeds. Rather than simply assigning random colors, the engine computes coordinated design tokens across ten distinct Style Families, guaranteeing WCAG contrast compliance and internal presentation consistency. Figure 3.7 and Table 3.7 summarize this engine."
  ));

  const fig3_7_lines = [
    "[Topic String: 'AI in Healthcare'] + [Variation Seed: 0x8F4A2C]",
    "                             |",
    "                             v",
    "[Hash Entropy Generator] ---> [Selects Style Family (e.g., Deep Navy & Electric Blue)]",
    "                             |",
    "     +-----------------------+-----------------------+",
    "     |                                               |",
    "     v                                               v",
    "[Compute 5-Stop Color Palette]             [Compute Surface & Lighting Tokens]",
    " - Base Background: #070A18                 - Surface Card Fill: rgba(15,23,42,0.65)",
    " - Ambient Navy:    #0B1026                 - Surface Border:    rgba(255,255,255,0.12)",
    " - Electric Blue:   #38BDF8                 - Directional Glow:  radial-gradient(ellipse)",
    " - Soft Violet:     #818CF8                 - Glow Position:     top-right (35deg angle)",
    " - Text Primary:    #FFFFFF                 - Border Radius:     12px, Shadow: md",
    "     |                                               |",
    "     +-----------------------+-----------------------+",
    "                             |",
    "                             v",
    "[Visual Direction Spec Injected into DocumentSpec AST (Applied Globally Across Slides)]"
  ];
  elements.push(...createFigure(fig3_7_lines, "Figure 3.7: Dynamic Visual Direction Pipeline"));

  const vdHeaders = ["Style Family Name", "Base Canvas Hex", "Primary Accent Hex", "Secondary Glow Hex", "Atmosphere & Mood", "Status"];
  const vdRows = [
    ["Deep Navy Electric Blue", "#070A18", "#38BDF8", "#818CF8", "Futuristic, executive AI, high-tech engineering", "IMPLEMENTED"],
    ["Indigo & Violet Gradient", "#0B0E23", "#A855F7", "#6366F1", "Creative studio, product keynote, modern SaaS", "IMPLEMENTED"],
    ["Teal & Emerald Tech", "#041619", "#14B8A6", "#10B981", "Biotechnology, sustainability, clean energy", "IMPLEMENTED"],
    ["Midnight Blue & Coral", "#091124", "#F43F5E", "#FB923C", "Venture capital, consumer pitch, vibrant impact", "IMPLEMENTED"],
    ["Charcoal & Amber Gold", "#121316", "#F59E0B", "#FBBF24", "Luxury, architectural review, premium corporate", "IMPLEMENTED"],
    ["Blue-Lavender Editorial", "#0D1329", "#C084FC", "#38BDF8", "Academic symposium, literary, research thesis", "IMPLEMENTED"],
    ["Dark Aurora Gradient", "#06101E", "#34D399", "#818CF8", "Atmospheric, cinematic presentation, natural science", "IMPLEMENTED"],
    ["Subtle Geometric Grid", "#090D1A", "#60A5FA", "#94A3B8", "Technical specifications, systems engineering", "IMPLEMENTED"],
    ["Soft Abstract Mesh", "#0F172A", "#E879F9", "#38BDF8", "Design portfolio, creative agency presentation", "IMPLEMENTED"],
    ["Clean Light-Blue Professional", "#F8FAFC", "#0284C7", "#64748B", "Formal enterprise document, healthcare clinic", "IMPLEMENTED"],
  ];
  elements.push(...createTable("Table 3.7: Dynamic Visual Direction Parameters and Ranges", vdHeaders, vdRows, [20, 14, 14, 14, 26, 12]));

  return elements;
}

module.exports = { getChapter3_C };
