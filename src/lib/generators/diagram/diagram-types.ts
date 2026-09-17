import { AspectRatio, LayoutArchetype } from "@/types/document-spec";

export type DiagramCategory =
  | "flowchart"
  | "uml"
  | "er"
  | "system_architecture"
  | "mindmap"
  | "decision_tree"
  | "process_workflow";

export interface DiagramCategoryMeta {
  id: DiagramCategory;
  archetype: LayoutArchetype;
  label: string;
  description: string;
  suggestedAspectRatio: AspectRatio;
}

export const DIAGRAM_CATEGORIES: Record<DiagramCategory, DiagramCategoryMeta> = {
  flowchart: {
    id: "flowchart",
    archetype: "diagram_flowchart",
    label: "Flowchart & Decision Branch",
    description: "Algorithmic logic branches, decision diamonds, start/end terminators",
    suggestedAspectRatio: "16:9",
  },
  uml: {
    id: "uml",
    archetype: "diagram_uml",
    label: "UML Class & Sequence Diagram",
    description: "Object-oriented class structures, attributes, methods, and inheritance",
    suggestedAspectRatio: "16:9",
  },
  er: {
    id: "er",
    archetype: "diagram_er",
    label: "Entity-Relationship (ER) Schema",
    description: "Database entities, primary keys, foreign keys, and 1:N cardinalities",
    suggestedAspectRatio: "16:9",
  },
  system_architecture: {
    id: "system_architecture",
    archetype: "diagram_system_architecture",
    label: "Cloud System Architecture",
    description: "Multi-tier microservices, load balancers, caching layers, and databases",
    suggestedAspectRatio: "16:9",
  },
  mindmap: {
    id: "mindmap",
    archetype: "diagram_mindmap",
    label: "Radiating Mind Map",
    description: "Central topic node with radiating branches and categorized sub-nodes",
    suggestedAspectRatio: "16:9",
  },
  decision_tree: {
    id: "decision_tree",
    archetype: "diagram_decision_tree",
    label: "Probabilistic Decision Tree",
    description: "Root choices, weighted probabilities, conditional branches, and outcomes",
    suggestedAspectRatio: "16:9",
  },
  process_workflow: {
    id: "process_workflow",
    archetype: "diagram_process_workflow",
    label: "State Transition & Process Workflow",
    description: "Lifecycle states, trigger events, parallel pipelines, and final states",
    suggestedAspectRatio: "16:9",
  },
};

export interface DiagramNodeItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  status?: "completed" | "active" | "pending";
  shape?:
    | "rectangle"
    | "pill"
    | "circle"
    | "diamond"
    | "database"
    | "cloud"
    | "actor"
    | "class_box";
  fields?: Array<{ name: string; type: string; isKey?: boolean }>;
  parent?: string;
  x?: number;
  y?: number;
}

export interface DiagramConnectionItem {
  fromId: string;
  toId: string;
  label?: string;
  connectionType?:
    | "directed"
    | "bidirectional"
    | "dotted"
    | "inheritance"
    | "aggregation"
    | "composition"
    | "one_to_many"
    | "many_to_many";
}

export interface DiagramConfig {
  diagramCategory: DiagramCategory;
  title: string;
  subtitle?: string;
  badge?: string;
  nodes?: DiagramNodeItem[];
  connections?: DiagramConnectionItem[];
  aspectRatio?: AspectRatio;
}
