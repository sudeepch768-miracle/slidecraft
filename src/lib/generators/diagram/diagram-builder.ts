import {
  AspectRatio,
  CANVAS_PRESETS,
  PageSpec,
  ContentElement,
} from "@/types/document-spec";
import { ProjectSpec } from "@/types/schemas/project-spec-schemas";
import { DiagramConfig, DIAGRAM_CATEGORIES, DiagramNodeItem, DiagramConnectionItem } from "./diagram-types";
import {
  resolveFormatPreset,
  presetToThemeSpec,
  presetToPageBackground,
  presetToVisualDirection,
} from "@/lib/generators/format-design-engine";

export function buildDiagramDocumentSpec(config: DiagramConfig): ProjectSpec {
  const meta = DIAGRAM_CATEGORIES[config.diagramCategory] || DIAGRAM_CATEGORIES.system_architecture;
  const aspectRatio: AspectRatio = config.aspectRatio || meta.suggestedAspectRatio || "16:9";
  const canvasPreset = CANVAS_PRESETS[aspectRatio] || CANVAS_PRESETS["16:9"];

  const formatPreset = resolveFormatPreset("diagram", config.diagramCategory);
  const theme = presetToThemeSpec(formatPreset);
  const background = presetToPageBackground(formatPreset);
  const visualDirection = presetToVisualDirection(formatPreset, config.title || "Architecture Diagram");

  let defaultNodes: DiagramNodeItem[] = [];
  let defaultConnections: DiagramConnectionItem[] = [];

  switch (config.diagramCategory) {
    case "flowchart":
      defaultNodes = [
        { id: "node-start", label: "Start Trigger", shape: "pill", status: "completed" },
        { id: "node-auth", label: "Verify Credentials", shape: "rectangle", status: "completed" },
        { id: "node-decision", label: "Valid Token?", shape: "diamond", status: "active" },
        { id: "node-allow", label: "Grant Workspace Access", shape: "rectangle", status: "pending" },
        { id: "node-reject", label: "Redirect to Login", shape: "rectangle", status: "pending" },
      ];
      defaultConnections = [
        { fromId: "node-start", toId: "node-auth", label: "HTTP Request", connectionType: "directed" },
        { fromId: "node-auth", toId: "node-decision", label: "Parse JWT", connectionType: "directed" },
        { fromId: "node-decision", toId: "node-allow", label: "Yes (200 OK)", connectionType: "directed" },
        { fromId: "node-decision", toId: "node-reject", label: "No (401 Unauthorized)", connectionType: "directed" },
      ];
      break;

    case "uml":
      defaultNodes = [
        {
          id: "class-user",
          label: "UserEntity",
          shape: "class_box",
          fields: [
            { name: "+id", type: "UUID", isKey: true },
            { name: "+email", type: "string" },
            { name: "+createProject()", type: "Project" },
          ],
        },
        {
          id: "class-project",
          label: "ProjectSpec",
          shape: "class_box",
          fields: [
            { name: "+id", type: "UUID", isKey: true },
            { name: "+documentType", type: "DocumentType" },
            { name: "+compileToPptx()", type: "Blob" },
          ],
        },
        {
          id: "class-page",
          label: "PageSpec",
          shape: "class_box",
          fields: [
            { name: "+pageNumber", type: "number" },
            { name: "+archetype", type: "LayoutArchetype" },
          ],
        },
      ];
      defaultConnections = [
        { fromId: "class-user", toId: "class-project", label: "1 to N", connectionType: "composition" },
        { fromId: "class-project", toId: "class-page", label: "Contains", connectionType: "aggregation" },
      ];
      break;

    case "er":
      defaultNodes = [
        {
          id: "table-users",
          label: "auth.users",
          shape: "database",
          fields: [
            { name: "id", type: "uuid", isKey: true },
            { name: "email", type: "varchar(255)" },
            { name: "created_at", type: "timestamptz" },
          ],
        },
        {
          id: "table-projects",
          label: "public.projects",
          shape: "database",
          fields: [
            { name: "id", type: "uuid", isKey: true },
            { name: "user_id", type: "uuid (FK)" },
            { name: "name", type: "text" },
            { name: "project_type", type: "text" },
            { name: "current_spec", type: "jsonb" },
          ],
        },
        {
          id: "table-versions",
          label: "public.project_versions",
          shape: "database",
          fields: [
            { name: "id", type: "uuid", isKey: true },
            { name: "project_id", type: "uuid (FK)" },
            { name: "version_number", type: "int" },
            { name: "spec_snapshot", type: "jsonb" },
          ],
        },
      ];
      defaultConnections = [
        { fromId: "table-users", toId: "table-projects", label: "1 : N (Foreign Key)", connectionType: "one_to_many" },
        { fromId: "table-projects", toId: "table-versions", label: "1 : N (Snapshots)", connectionType: "one_to_many" },
      ];
      break;

    case "system_architecture":
    default:
      defaultNodes = [
        { id: "client-edge", label: "Next.js Frontend Client", shape: "cloud", description: "Edge CDN & SSR" },
        { id: "api-gw", label: "API Gateway & Router", shape: "rectangle", description: "Route validation & rate limit" },
        { id: "groq-engine", label: "Groq LPU Inference Service", shape: "pill", description: "Sub-second JSON spec generation" },
        { id: "pptx-compiler", label: "PptxGenJS Native Engine", shape: "rectangle", description: "Vector shapes & editable decks" },
        { id: "supabase-db", label: "Supabase PostgreSQL & Storage", shape: "database", description: "RLS protected user telemetry" },
      ];
      defaultConnections = [
        { fromId: "client-edge", toId: "api-gw", label: "HTTPS / REST", connectionType: "directed" },
        { fromId: "api-gw", toId: "groq-engine", label: "OpenAI-compatible SDK", connectionType: "directed" },
        { fromId: "api-gw", toId: "pptx-compiler", label: "Deterministic AST compile", connectionType: "directed" },
        { fromId: "api-gw", toId: "supabase-db", label: "Postgres Realtime + Storage", connectionType: "bidirectional" },
      ];
      break;
  }

  const nodes = config.nodes && config.nodes.length > 0 ? config.nodes : defaultNodes;
  const connections =
    config.connections && config.connections.length > 0 ? config.connections : defaultConnections;

  const elements: ContentElement[] = [
    {
      type: "diagram",
      id: "diagram-element-main",
      diagramType: config.diagramCategory === "uml" ? "uml" : config.diagramCategory === "er" ? "er" : config.diagramCategory === "flowchart" ? "flowchart" : "system_architecture",
      nodes,
      connections,
    },
  ];

  const page: PageSpec = {
    id: "diagram-page-1",
    pageNumber: 1,
    archetype: meta.archetype,
    title: config.title || "Architecture & System DAG",
    subtitle: config.subtitle || meta.description,
    badge: config.badge || meta.label.toUpperCase(),
    background,
    backgroundOverride: background.type === "solid" ? background.value : undefined,
    backgroundSpec: {
      type: background.type === "gradient" ? "gradient" : "solid",
      color: background.value,
      glow: background.glow as any,
      decorativeShapes: background.decorativeShapes as any,
    },
    elements,
  };

  return {
    version: "1.0.0",
    documentType: "diagram",
    meta: {
      title: config.title || "Interactive Architecture Diagram",
      description: config.subtitle || meta.description,
      author: "SlideCraft AI",
      tags: ["diagram", config.diagramCategory, "system-architecture", "ast-graph"],
      purpose: meta.description,
    },
    canvas: {
      width: canvasPreset.width,
      height: canvasPreset.height,
      aspectRatio,
      unit: "px",
      dpi: 96,
    },
    theme,
    visualDirection,
    pages: [page],
  };
}
