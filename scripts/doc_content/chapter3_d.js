const {
  p,
  sectionHeading,
  createFigure
} = require("./helpers");

function getChapter3_D() {
  const elements = [];

  elements.push(sectionHeading("3.15 Procedural Background Generation"));
  elements.push(p(
    "The procedural background generator synthesizes dynamic CSS and SVG backdrops composed of base dark fills, subtle radial glow trails, mesh gradients, and floating orbs. When users click \"Regenerate Background\", the system re-computes background gradient stops and light vector coordinates while strictly preserving all existing slide titles, text cards, and layout elements. Figure 3.8 shows this process."
  ));

  const fig3_8_lines = [
    "[Trigger: Background Regenerate] ---> [Extract Active PageSpec & Document Theme]",
    "                                                      |",
    "                                                      v",
    "[Generate New Gradient Vectors & Orb Coordinates (Angle: 125deg, Glow Pos: [80%, 20%])]",
    "                                                      |",
    "                                                      v",
    "[Inject New backgroundOverride Object into PageSpec]",
    "  * Slide Title: PRESERVED (100% Intact)",
    "  * Text Content & Metrics: PRESERVED (100% Intact)",
    "  * Layout Archetype: PRESERVED (100% Intact)",
    "                                                      |",
    "                                                      v",
    "[Canvas Re-renders Visual Background Layer with Zero Content Disruption]"
  ];
  elements.push(...createFigure(fig3_8_lines, "Figure 3.8: Procedural Background Generation Process"));

  elements.push(sectionHeading("3.16 AI Image Generation"));
  elements.push(p(
    "For slides requiring visual media, SlideCraft AI integrates the NVIDIA FLUX API (deploying FLUX.2-klein-4b and FLUX.1-schnell models). Image prompts are synthesized based on slide topic semantics, visual role (e.g., hero illustration versus conceptual backdrop), and container aspect ratio. Figure 3.9 illustrates the image generation workflow."
  ));

  const fig3_9_lines = [
    "[Slide Content: 'Autonomous Robotic Surgery'] ---> [Image Prompt Generator]",
    "                                                             |",
    "     +-------------------------------------------------------+",
    "     |",
    "     v",
    "[Construct Detailed Diffusion Prompt]",
    "  * Positive Prompt: 'High-tech precision surgical robotic arm, clean modern hospital operating theatre, cinematic lighting, 8k resolution, octane render'",
    "  * Injected Negative Prompt: 'text, watermark, typography, letters, words, messy, blur, bad anatomy, frame'",
    "  * Target Aspect Ratio: 16:9 Landscape (1024x576) or 4:3 Column (1024x768)",
    "     |",
    "     v",
    "[NVIDIA FLUX API Invocation] ---> (Rectified Flow Inference via NVIDIA GPUs)",
    "     |",
    "     v",
    "[Signed Image Asset URL Returned] ---> [Injected into DocumentSpec Image Element]"
  ];
  elements.push(...createFigure(fig3_9_lines, "Figure 3.9: AI Image Generation Workflow"));

  elements.push(sectionHeading("3.17 Image Prompt Construction"));
  elements.push(p(
    "Image prompt construction implements strict heuristic guards: every prompt is automatically augmented with style descriptors harmonized with the active visual direction family (e.g., \"dark navy atmosphere, subtle electric blue rim lighting\"). Negative prompting is systematically enforced to ensure that diffusion models do not attempt to render pseudo-text, which would clash with native typography."
  ));

  elements.push(sectionHeading("3.18 Image Framing and Aspect Ratio Handling"));
  elements.push(p(
    "To prevent image distortion or letterboxing, the rendering engine enforces strict CSS object-fit: cover properties paired with predetermined container aspect ratios. In two_column_split layouts, images are bounded to 4:3 or 1:1 containers; in hero_title layouts, images are rendered as background ambient layers with subtle gradient opacity masks."
  ));

  elements.push(sectionHeading("3.19 Slide Rendering"));
  elements.push(p(
    "The Slide Rendering subsystem translates the abstract DocumentSpec AST into interactive, high-fidelity DOM representations. The rendering pipeline is anchored by the PageRenderer component, which computes responsive 16:9 aspect ratio bounding boxes, instantiates Tailwind CSS utility classes, binds Framer Motion transitions, and renders vector card containers. Figure 3.10 diagrams the rendering architecture."
  ));

  const fig3_10_lines = [
    "[PageSpec & Theme AST] ---> [PageRenderer Component]",
    "                                    |",
    "       +----------------------------+----------------------------+",
    "       |                                                         |",
    "       v                                                         v",
    "[Backdrop Layer]                                          [Foreground Grid Layer]",
    " - Base Dark SVG Canvas                                    - Dynamic 16:9 Coordinate Frame",
    " - Mesh Gradient Vectors                                   - Layout Archetype CSS Grid",
    " - Ambient Directional Glows                               - Glassmorphic Surface Cards",
    " - Procedural Atmospheric Orbs                             - Typography Hierarchy (H1, H2, Body)",
    "       |                                                         |",
    "       +----------------------------+----------------------------+",
    "                                    |",
    "                                    v",
    "                    [Interactive Web Slide Canvas]",
    "               (Responsive, Accessible, Fully Selectable)"
  ];
  elements.push(...createFigure(fig3_10_lines, "Figure 3.10: Slide Rendering Architecture"));

  elements.push(sectionHeading("3.20 Interactive Editor"));
  elements.push(p(
    "The Unified Visual Studio Editor provides a desktop-grade manipulation canvas. Users can directly select text elements for inline WYSIWYG editing, reorder slide thumbnails via drag-and-drop, toggle theme palettes, and inspect live previews. State management is coordinated via Zustand, ensuring sub-16ms frame render times during interaction. Figure 3.11 depicts the editor architecture."
  ));

  const fig3_11_lines = [
    "+-------------------------------------------------------------------------------+",
    "|                       UNIFIED STUDIO VISUAL EDITOR UI                         |",
    "|  +-----------------+  +---------------------------------+  +---------------+  |",
    "|  | Left Navigation |  | Center Canvas: 16:9 Slide Frame |  | Right Panel   |  |",
    "|  | - Slide Thumbs  |  | - PageRenderer Active Slide     |  | - Theme Select|  |",
    "|  | - Drag Reorder  |  | - Direct Inline Text Editing    |  | - Card Styles |  |",
    "|  | - Add / Delete  |  | - Element Hover & Selection Box |  | - Asset Tray  |  |",
    "|  +-----------------+  +---------------------------------+  +---------------+  |",
    "|                                       |                                       |",
    "|                                       v                                       |",
    "|  +-------------------------------------------------------------------------+  |",
    "|  | Bottom Floating AI Assistant Bar: [Scope: Slide | Deck] [✨ Ask AI]     |  |",
    "|  +-------------------------------------------------------------------------+  |",
    "+-------------------------------------------------------------------------------+"
  ];
  elements.push(...createFigure(fig3_11_lines, "Figure 3.11: Interactive Editor Architecture"));

  elements.push(sectionHeading("3.21 AI Assistant and Modification Workflow"));
  elements.push(p(
    "The AI Assistant enables conversational slide refinement without risking presentation corruption. As detailed in Section 2.10, traditional systems overwrite slide content upon receiving user instructions. SlideCraft AI routes requests through a Scope Resolver and executes changes via an Atomic Patch Engine. Figure 3.12 diagrams this modification workflow."
  ));

  const fig3_12_lines = [
    "[User Types: 'Make this slide more visual']",
    "                      |",
    "                      v",
    "[Scope Resolver] ---> Resolves Target: Active Slide (Index: 0), Preserves Full Context",
    "                      |",
    "                      v",
    "[AI Modifier Engine] ---> Detects Intent: Archetype Upgrade & Asset Enrichment",
    "                      |",
    "                      v",
    "[Generates Atomic Patches]:",
    "  * change_layout: 'two_column_split' (Title & Existing Points RETAINED)",
    "  * add_element: Curated Contextual Graphic Asset",
    "  * update_style: Subtle Glow Vector",
    "                      |",
    "                      v",
    "[Patch Engine Validates & Executes Patches] ---> (DocumentSpec Updated with ZERO Data Loss)"
  ];
  elements.push(...createFigure(fig3_12_lines, "Figure 3.12: AI Assistant Modification Workflow"));

  elements.push(sectionHeading("3.22 Apply-to-All Visual Changes"));
  elements.push(p(
    "When a user refines a visual element on a single slide—such as altering the border radius, font family, or card backdrop opacity—the AI Assistant provides an \"Apply to All Slides\" workflow. The patch engine extracts the style mutation delta and applies it across all PageSpec nodes in the document AST while leaving slide-specific text and layout structures untouched. Figure 3.13 illustrates this workflow."
  ));

  const fig3_13_lines = [
    "[User Modifies Slide 2 Card Style] ---> [User Clicks 'Apply to All Slides']",
    "                                                    |",
    "                                                    v",
    "[Patch Engine Extracts Style Delta (e.g., borderRadius: 16px, border: subtle cyan)]",
    "                                                    |",
    "     +----------------------------------------------+",
    "     |",
    "     v",
    "[Iterate Over DocumentSpec.pages[] Array]:",
    "  * Slide 1: Update card style tokens; KEEP Slide 1 content intact",
    "  * Slide 2: Update card style tokens; KEEP Slide 2 content intact",
    "  * Slide N: Update card style tokens; KEEP Slide N content intact",
    "                                                    |",
    "                                                    v",
    "[Global Theme Synchronization Complete Across All Canvas Slides]"
  ];
  elements.push(...createFigure(fig3_13_lines, "Figure 3.13: Apply-to-All Slides Workflow"));

  return elements;
}

module.exports = { getChapter3_D };
