const {
  p,
  sectionHeading,
  createTable,
  createFigure
} = require("./helpers");

function getChapter3_E() {
  const elements = [];

  elements.push(sectionHeading("3.23 Theme and Background Regeneration"));
  elements.push(p(
    "Theme and background regeneration allows creators to explore visual variations without starting over. The theme generator produces alternate harmonious palettes that preserve WCAG AA contrast, updating typography colors, card borders, and ambient lighting in real time."
  ));

  elements.push(sectionHeading("3.24 Project Isolation and Persistence"));
  elements.push(p(
    "SlideCraft AI enforces enterprise-grade multi-tenant data isolation. Each user account operates within an isolated cryptographic boundary governed by Supabase Row-Level Security (RLS). Presentations, uploaded source files, and generated visual assets are partitioned by authenticated user UUIDs. Figure 3.14 illustrates the persistence model."
  ));

  const fig3_14_lines = [
    "[Authenticated User Client] ---> [Supabase Auth JWT (Contains user_id UUID)]",
    "                                                    |",
    "                                                    v",
    "[PostgreSQL Database Engine with Row-Level Security (RLS) Policies Active]",
    "                                                    |",
    "     +----------------------------------------------+",
    "     |",
    "     v",
    "[Projects Table Evaluation: 'auth.uid() = projects.user_id']",
    "  * User A can ONLY SELECT / INSERT / UPDATE / DELETE User A's presentations",
    "  * User B requests are strictly rejected at SQL level with 403 Forbidden",
    "  * DocumentSpec AST stored as JSONB column for rapid indexing & schema queries",
    "                                                    |",
    "                                                    v",
    "[Isolated User Presentation Saved Reliably in Cloud PostgreSQL]"
  ];
  elements.push(...createFigure(fig3_14_lines, "Figure 3.14: Supabase Persistence Architecture"));

  elements.push(sectionHeading("3.25 Supabase Database"));
  elements.push(p(
    "The persistence layer utilizes PostgreSQL hosted on Supabase. Table 3.8 defines the core relational database entities, attributes, constraints, and index mappings."
  ));

  const dbHeaders = ["Table Name", "Column Attribute", "Data Type", "Constraint / Relation", "Description & Purpose"];
  const dbRows = [
    ["users (auth)", "id", "UUID", "PRIMARY KEY", "Supabase authentication unique user identifier"],
    ["users (auth)", "email", "VARCHAR(255)", "UNIQUE, NOT NULL", "User login email address"],
    ["projects", "id", "UUID", "PRIMARY KEY, DEFAULT gen_random_uuid()", "Unique presentation project identifier"],
    ["projects", "user_id", "UUID", "FOREIGN KEY -> auth.users(id) ON DELETE CASCADE", "Owner identification for RLS partition"],
    ["projects", "title", "TEXT", "NOT NULL", "Human-readable presentation title"],
    ["projects", "format", "VARCHAR(50)", "DEFAULT 'presentation'", "Target visual format (deck, poster, etc.)"],
    ["projects", "document_spec", "JSONB", "NOT NULL", "Complete serialized DocumentSpec AST"],
    ["projects", "created_at", "TIMESTAMPTZ", "DEFAULT NOW()", "Timestamp of initial project creation"],
    ["projects", "updated_at", "TIMESTAMPTZ", "DEFAULT NOW()", "Timestamp of last modification"],
  ];
  elements.push(...createTable("Table 3.8: Database Schema Entities and Relations", dbHeaders, dbRows, [16, 18, 18, 22, 26]));

  elements.push(sectionHeading("3.26 Authentication"));
  elements.push(p(
    "Authentication is implemented using Supabase Auth integrated with Next.js Edge Middleware and an interactive dark lamp landing page. The application enforces a strict access policy: when an unauthenticated user opens the website root (/), Edge Middleware intercepts the request and instantly redirects the browser to /login in complete darkness. To sign in, the user interacts with an interactive ceiling pull-cord lamp that illuminates the room and reveals the authentication card. Upon successful credential validation, secure HTTP-only cookies are issued, granting access to the creation studio."
  ));

  elements.push(sectionHeading("3.27 Asset Storage"));
  elements.push(p(
    "Uploaded documents and generated diffusion images are persisted in Supabase Storage buckets configured with signed URLs and expiring access tokens, ensuring that media assets cannot be accessed without proper authorization."
  ));

  elements.push(sectionHeading("3.28 Chart and Data Visualization"));
  elements.push(p(
    "For quantitative data presentations, SlideCraft AI integrates Recharts. The DocumentSpec schema supports chart elements including BarChart, LineChart, PieChart, and AreaChart. The system automatically normalizes numerical data, configures responsive SVG viewboxes, and applies active theme accent colors to data series."
  ));

  elements.push(sectionHeading("3.29 PPTX Export"));
  elements.push(p(
    "A foundational architectural differentiator of SlideCraft AI is native, client-side Microsoft PowerPoint (.pptx) export via pptxgenjs. While competing tools render flat raster screenshots or emit degraded PDFs, SlideCraft AI compiles the DocumentSpec AST into genuine PowerPoint vector shapes, editable text frames, and high-resolution image objects. Figure 3.15 and Table 3.9 illustrate the export engine."
  ));

  const fig3_15_lines = [
    "[DocumentSpec AST (Complete Multi-Slide Presentation Tree)]",
    "                              |",
    "                              v",
    "[Client-Side PPTX Builder Engine (pptxgenjs OpenXML Compiler)]",
    "                              |",
    "     +------------------------+------------------------+",
    "     |                                                 |",
    "     v                                                 v",
    "[Slide Geometry & Tokens]                       [Element Translation Loop]",
    " - Layout: 16:9 Widescreen (13.33 x 7.5 in)     - H1 / H2: Native Text Frames",
    " - Base Background Fill & Gradient Stops        - Body Bullets: Paragraph Runs",
    " - Theme Palette Color Mappings                 - Surface Cards: Rounded Rectangles",
    " - Typographic Hierarchy Scale                 - Images: Preserved Aspect Containers",
    "     |                                                 |",
    "     +------------------------+------------------------+",
    "                              |",
    "                              v",
    "[Pre-Export Quality Protector & Coordinate Validator]",
    "                              |",
    "                              v",
    "[Browser Generates .pptx File Blob] ---> [Direct Download to User's Filesystem]"
  ];
  elements.push(...createFigure(fig3_15_lines, "Figure 3.15: PPTX Export Pipeline"));

  const pptxHeaders = ["AST Element Type", "Web DOM Equivalent", "PowerPoint Shape / Object", "OpenXML Translation Properties", "Status"];
  const pptxRows = [
    ["Page Canvas", "16:9 div container", "Slide Object (13.33 x 7.5 in)", "slide.background = { fill: hexColor }", "IMPLEMENTED"],
    ["Heading (h1/h2)", "<h1> / <h2> Tailwind text", "pptx.addText() text frame", "fontSize: 28-36pt, bold: true, color: hex", "IMPLEMENTED"],
    ["Body Bullet List", "<ul><li> paragraph runs", "pptx.addText() with bullet: true", "fontSize: 14-16pt, margin: 0.1in, wrap: true", "IMPLEMENTED"],
    ["Surface Card", "div with bg-slate-900/60", "pptx.addShape(RECTANGLE)", "fill: hex, line: { color, width }, round: true", "IMPLEMENTED"],
    ["Metric Display", "div stat number + label", "Composite Text Box Group", "large stat text (44pt) + subscript label", "IMPLEMENTED"],
    ["Contextual Image", "<img> with object-cover", "pptx.addImage()", "x, y, w, h inches, sizing: 'contain' / 'cover'", "IMPLEMENTED"],
  ];
  elements.push(...createTable("Table 3.9: PPTX Export Element Mapping Specifications", pptxHeaders, pptxRows, [16, 20, 22, 30, 12]));

  elements.push(sectionHeading("3.30 Preview and PPTX Parity"));
  elements.push(p(
    "To ensure that exported PowerPoint decks match the web canvas, SlideCraft AI enforces a Preview-to-PPTX Parity Architecture. The canvas coordinate system (1920x1080 pixels) maps mathematically to PowerPoint's 13.33 x 7.5 inch widescreen dimensions through strict proportional scaling factors (144 DPI scaling). Figure 3.16 diagrams this parity architecture."
  ));

  const fig3_16_lines = [
    "   [Web Canvas Coordinate Space]              [PowerPoint OpenXML Geometry Space]",
    "     * Width:  1920 px                          * Width:  13.33 inches",
    "     * Height: 1080 px                          * Height: 7.50 inches",
    "     * Aspect: 16:9 Widescreen                  * Aspect: 16:9 Widescreen",
    "                   \\                                  /",
    "                    \\                                /",
    "                     v                              v",
    "             +----------------------------------------------+",
    "             | Mathematical Coordinate Translation Engine   |",
    "             |  x_inches = (x_px / 1920) * 13.33            |",
    "             |  y_inches = (y_px / 1080) * 7.50             |",
    "             |  w_inches = (w_px / 1920) * 13.33            |",
    "             |  h_inches = (h_px / 1080) * 7.50             |",
    "             +----------------------------------------------+",
    "                                    |",
    "                                    v",
    "            [Result: 1:1 Visual Alignment & Typography Parity]"
  ];
  elements.push(...createFigure(fig3_16_lines, "Figure 3.16: Preview-to-PPTX Parity Architecture"));

  return elements;
}

module.exports = { getChapter3_E };
