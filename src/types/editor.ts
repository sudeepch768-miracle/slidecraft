import { DocumentSpec, ContentElement, GeneratedDesignSystem, PageBackground } from "./document-spec";
import { ComprehensiveQualityReport } from "@/lib/quality/quality-types";

export type EditorTool = "select" | "text" | "metric" | "chart" | "diagram" | "table" | "shape";

export interface EditorState {
  // Document state
  document: DocumentSpec;
  activePageIndex: number;
  selectedElementId: string | null;
  activeTool: EditorTool;

  // Viewport & Workspace UI state
  zoomLevel: number;
  isPresenterMode: boolean;
  isAIChatOpen: boolean;
  isInspectorOpen: boolean;
  isLeftPanelOpen: boolean;
  leftPanelTab: "pages" | "media" | "templates" | "projects";
  rightPanelTab: "settings" | "ai" | "quality";
  isVersionHistoryOpen: boolean;
  isRegenerateOpen: boolean;
  isQualityModalOpen: boolean;
  isGenerating: boolean;
  generationProgress: string;

  // Design Quality Report
  qualityReport: ComprehensiveQualityReport | null;

  // Natural Language Editing & Scoping
  editScope: "auto" | "document" | "page" | "element";
  alternatives: Array<{ id: string; title: string; description: string; document: DocumentSpec }> | null;
  clarification: { question: string; options: string[] } | null;

  // Undo / Redo history
  history: DocumentSpec[];
  historyIndex: number;

  // Project & Persistence state
  projectId: string | null;
  designSystem: GeneratedDesignSystem | null;
  saveStatus: "saved" | "saving" | "unsaved" | "error" | "offline";
  lastSavedAt: Date | null;

  // Actions
  initProject: (project: { id: string; current_spec: DocumentSpec; design_system?: GeneratedDesignSystem | null; project_type?: string }) => void;
  setDesignSystem: (ds: GeneratedDesignSystem | null) => void;
  setEditScope: (scope: "auto" | "document" | "page" | "element") => void;
  setAlternatives: (alts: Array<{ id: string; title: string; description: string; document: DocumentSpec }> | null) => void;
  setClarification: (clarification: { question: string; options: string[] } | null) => void;
  setProjectId: (id: string | null) => void;
  setSaveStatus: (status: "saved" | "saving" | "unsaved" | "error" | "offline") => void;
  setLastSavedAt: (date: Date | null) => void;
  setDocument: (doc: DocumentSpec) => void;
  updateDocument: (fn: (current: DocumentSpec) => DocumentSpec) => void;
  setActivePage: (index: number) => void;
  setSelectedElement: (id: string | null) => void;
  setActiveTool: (tool: EditorTool) => void;
  setZoom: (zoom: number) => void;
  setPresenterMode: (val: boolean) => void;
  setAIChatOpen: (val: boolean) => void;
  setInspectorOpen: (val: boolean) => void;
  setLeftPanelOpen: (val: boolean) => void;
  setLeftPanelTab: (tab: "pages" | "media" | "templates" | "projects") => void;
  setRightPanelTab: (tab: "settings" | "ai" | "quality") => void;
  setVersionHistoryOpen: (val: boolean) => void;
  setRegenerateOpen: (val: boolean) => void;
  setQualityModalOpen: (val: boolean) => void;
  setQualityReport: (report: ComprehensiveQualityReport | null) => void;
  runQualityAutoRepair: () => void;
  setGenerating: (generating: boolean, progress?: string) => void;

  // Mutation helpers
  updatePageBackground: (pageIndex: number, bg: Partial<PageBackground>, syncTheme?: boolean) => void;
  updateActivePageArchetype: (archetype: string) => void;
  updateActivePageTitle: (title: string, subtitle?: string) => void;
  updateElement: (elementId: string, patch: Partial<ContentElement>) => void;
  addElementToActivePage: (element: ContentElement) => void;
  deleteElementFromActivePage: (elementId: string) => void;
  addPage: (archetype?: string) => void;
  deletePage: (index: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
