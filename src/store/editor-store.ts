import { create } from "zustand";
import { EditorState, EditorTool } from "@/types/editor";
import {
  DocumentSpec,
  ContentElement,
  createEmptyDocument,
  PageSpec,
  LayoutArchetype,
} from "@/types/document-spec";
import { generateId } from "@/lib/utils";
import { analyzeQuality, repairAndAnalyze } from "@/lib/quality/quality-engine";

const MAX_HISTORY = 30;

export const useEditorStore = create<EditorState>((set, get) => ({
  document: createEmptyDocument("Untitled Presentation"),
  activePageIndex: 0,
  selectedElementId: null,
  activeTool: "select",

  zoomLevel: 100,
  isPresenterMode: false,
  isAIChatOpen: true,
  isInspectorOpen: true,
  isLeftPanelOpen: true,
  leftPanelTab: "pages",
  rightPanelTab: "settings",
  isVersionHistoryOpen: false,
  isRegenerateOpen: false,
  isQualityModalOpen: false,
  isGenerating: false,
  generationProgress: "",

  qualityReport: analyzeQuality(createEmptyDocument("Untitled Presentation")),

  editScope: "auto",
  alternatives: null,
  clarification: null,

  history: [createEmptyDocument("Untitled Presentation")],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,

  projectId: null,
  designSystem: null,
  saveStatus: "saved",
  lastSavedAt: null,

  initProject: (project) => {
    let report = null;
    try {
      report = analyzeQuality(project.current_spec);
    } catch {
      // ignore
    }
    set({
      document: project.current_spec,
      projectId: project.id,
      designSystem: project.design_system || project.current_spec.designSystem || null,
      activePageIndex: 0,
      selectedElementId: null,
      history: [project.current_spec],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
      saveStatus: "saved",
      qualityReport: report,
    });
  },
  setDesignSystem: (ds) => set({ designSystem: ds }),
  setEditScope: (scope) => set({ editScope: scope }),
  setAlternatives: (alts) => set({ alternatives: alts }),
  setClarification: (clarification) => set({ clarification }),
  setProjectId: (id) => set({ projectId: id }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
  setQualityModalOpen: (open) => set({ isQualityModalOpen: open }),
  setQualityReport: (report) => set({ qualityReport: report }),

  runQualityAutoRepair: () => {
    const { document, setDocument } = get();
    try {
      const cloned = JSON.parse(JSON.stringify(document));
      const { repairedDocument, report } = repairAndAnalyze(cloned);
      set({ qualityReport: report });
      setDocument(repairedDocument);
    } catch (err) {
      console.warn("Auto repair error:", err);
    }
  },

  setDocument: (newDoc: DocumentSpec) => {
    // Automatically re-evaluate quality on document update
    let report = get().qualityReport;
    try {
      report = analyzeQuality(newDoc);
    } catch {
      // ignore
    }

    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newDoc);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();

      const newIndex = newHistory.length - 1;
      return {
        document: newDoc,
        qualityReport: report,
        activePageIndex: Math.min(state.activePageIndex, newDoc.pages.length - 1),
        selectedElementId: null,
        history: newHistory,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
        saveStatus: "unsaved",
      };
    });
  },

  updateDocument: (fn) => {
    const current = get().document;
    const updated = fn(current);
    get().setDocument(updated);
  },

  setActivePage: (index) => {
    const pages = get().document.pages;
    if (index >= 0 && index < pages.length) {
      set({ activePageIndex: index, selectedElementId: null });
    }
  },

  setSelectedElement: (id) => set({ selectedElementId: id }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoomLevel: Math.max(30, Math.min(200, zoom)) }),
  setPresenterMode: (val) => set({ isPresenterMode: val }),
  setAIChatOpen: (val) => set({ isAIChatOpen: val }),
  setInspectorOpen: (val) => set({ isInspectorOpen: val }),
  setLeftPanelOpen: (val) => set({ isLeftPanelOpen: val }),
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setVersionHistoryOpen: (val) => set({ isVersionHistoryOpen: val }),
  setRegenerateOpen: (val) => set({ isRegenerateOpen: val }),
  setGenerating: (generating, progress = "") =>
    set({ isGenerating: generating, generationProgress: progress }),

  updatePageBackground: (pageIndex, bgPatch, syncTheme = false) => {
    const { document, setDocument } = get();
    const pages = [...document.pages];
    if (pages[pageIndex]) {
      const existingBg = pages[pageIndex].background || {
        type: "solid" as const,
        value: pages[pageIndex].backgroundOverride || document.theme.colors.background,
      };

      const newBg = {
        ...existingBg,
        ...bgPatch,
      };

      pages[pageIndex] = {
        ...pages[pageIndex],
        background: newBg,
        ...(newBg.type === "solid" && newBg.value ? { backgroundOverride: newBg.value } : {}),
      };

      let updatedTheme = document.theme;
      if (syncTheme && newBg.value && newBg.type === "solid") {
        updatedTheme = {
          ...document.theme,
          colors: {
            ...document.theme.colors,
            background: newBg.value,
          },
        };
      }

      setDocument({ ...document, pages, theme: updatedTheme });
    }
  },

  updateActivePageArchetype: (archetype) => {
    const { document, activePageIndex, setDocument } = get();
    const pages = [...document.pages];
    if (pages[activePageIndex]) {
      pages[activePageIndex] = {
        ...pages[activePageIndex],
        archetype: archetype as LayoutArchetype,
      };
      setDocument({ ...document, pages });
    }
  },

  updateActivePageTitle: (title, subtitle) => {
    const { document, activePageIndex, setDocument } = get();
    const pages = [...document.pages];
    if (pages[activePageIndex]) {
      pages[activePageIndex] = {
        ...pages[activePageIndex],
        title,
        ...(subtitle !== undefined ? { subtitle } : {}),
      };
      setDocument({ ...document, pages });
    }
  },

  updateElement: (elementId, patch) => {
    const { document, activePageIndex, setDocument } = get();
    const pages = [...document.pages];
    const page = pages[activePageIndex];
    if (!page) return;

    const updatedElements = page.elements.map((el) => {
      if (el.id === elementId) {
        return { ...el, ...patch } as ContentElement;
      }
      return el;
    });

    pages[activePageIndex] = { ...page, elements: updatedElements };
    setDocument({ ...document, pages });
  },

  addElementToActivePage: (element) => {
    const { document, activePageIndex, setDocument } = get();
    const pages = [...document.pages];
    const page = pages[activePageIndex];
    if (!page) return;

    pages[activePageIndex] = {
      ...page,
      elements: [...page.elements, element],
    };
    setDocument({ ...document, pages });
    set({ selectedElementId: element.id });
  },

  deleteElementFromActivePage: (elementId) => {
    const { document, activePageIndex, setDocument } = get();
    const pages = [...document.pages];
    const page = pages[activePageIndex];
    if (!page) return;

    pages[activePageIndex] = {
      ...page,
      elements: page.elements.filter((el) => el.id !== elementId),
    };
    setDocument({ ...document, pages });
    set({ selectedElementId: null });
  },

  addPage: (archetype = "two_column_split") => {
    const { document, setDocument } = get();
    const newPageNum = document.pages.length + 1;
    const newPage: PageSpec = {
      id: generateId("page"),
      pageNumber: newPageNum,
      archetype: archetype as LayoutArchetype,
      title: `Slide ${newPageNum}`,
      subtitle: "Add compelling insights here",
      elements: [
        {
          type: "text",
          id: generateId("text"),
          variant: "body",
          content: "Describe your key ideas, points, or strategies.",
          align: "left",
        },
      ],
    };

    const updatedDoc = {
      ...document,
      pages: [...document.pages, newPage],
    };
    setDocument(updatedDoc);
    set({ activePageIndex: updatedDoc.pages.length - 1 });
  },

  deletePage: (index) => {
    const { document, setDocument, activePageIndex } = get();
    if (document.pages.length <= 1) return; // Keep at least 1 page

    const updatedPages = document.pages
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, pageNumber: i + 1 }));

    const nextActiveIndex = Math.min(activePageIndex, updatedPages.length - 1);
    setDocument({ ...document, pages: updatedPages });
    set({ activePageIndex: nextActiveIndex, selectedElementId: null });
  },

  reorderPages: (fromIndex, toIndex) => {
    const { document, setDocument } = get();
    const pages = [...document.pages];
    const [moved] = pages.splice(fromIndex, 1);
    pages.splice(toIndex, 0, moved);

    const renumbered = pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setDocument({ ...document, pages: renumbered });
    set({ activePageIndex: toIndex });
  },

  undo: () => {
    const { history, historyIndex, activePageIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevDoc = history[prevIndex];
      set({
        document: prevDoc,
        historyIndex: prevIndex,
        canUndo: prevIndex > 0,
        canRedo: true,
        activePageIndex: Math.min(activePageIndex, prevDoc.pages.length - 1),
        selectedElementId: null,
      });
    }
  },

  redo: () => {
    const { history, historyIndex, activePageIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextDoc = history[nextIndex];
      set({
        document: nextDoc,
        historyIndex: nextIndex,
        canUndo: true,
        canRedo: nextIndex < history.length - 1,
        activePageIndex: Math.min(activePageIndex, nextDoc.pages.length - 1),
        selectedElementId: null,
      });
    }
  },
}));
