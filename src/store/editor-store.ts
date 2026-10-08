import { create } from "zustand";
import { EditorState, EditorTool, ThemeHistoryEntry } from "@/types/editor";
import {
  DocumentSpec,
  ContentElement,
  createEmptyDocument,
  PageSpec,
  LayoutArchetype,
} from "@/types/document-spec";
import { generateId } from "@/lib/utils";
import { analyzeQuality, repairAndAnalyze } from "@/lib/quality/quality-engine";
import {
  generatePromptThemedBackground,
  applyVisualDirectionToDocument,
} from "@/lib/ai/visual-direction-engine";

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

  themeHistory: [],
  themeHistoryIndex: -1,
  canUndoTheme: false,
  canRedoTheme: false,

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
    const initialThemeEntry: ThemeHistoryEntry = {
      theme: project.current_spec.theme,
      visualDirection: project.current_spec.visualDirection,
      pageBackgrounds: project.current_spec.pages.map((p) => ({
        pageId: p.id,
        backgroundSpec: p.backgroundSpec,
        backgroundOverride: p.backgroundOverride,
      })),
    };

    set({
      document: project.current_spec,
      projectId: project.id,
      designSystem: project.design_system || project.current_spec.designSystem || null,
      activePageIndex: 0,
      selectedElementId: null,
      history: [project.current_spec],
      historyIndex: 0,
      themeHistory: [initialThemeEntry],
      themeHistoryIndex: 0,
      canUndoTheme: false,
      canRedoTheme: false,
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

  bringElementForward: (elementId) => {
    const { document, activePageIndex, setDocument } = get();
    const pages = [...document.pages];
    const page = pages[activePageIndex];
    if (!page) return;

    const idx = page.elements.findIndex((el) => el.id === elementId);
    if (idx === -1 || idx >= page.elements.length - 1) return;

    const updated = [...page.elements];
    const [item] = updated.splice(idx, 1);
    updated.push(item);

    pages[activePageIndex] = { ...page, elements: updated };
    setDocument({ ...document, pages });
  },

  sendElementBackward: (elementId) => {
    const { document, activePageIndex, setDocument } = get();
    const pages = [...document.pages];
    const page = pages[activePageIndex];
    if (!page) return;

    const idx = page.elements.findIndex((el) => el.id === elementId);
    if (idx <= 0) return;

    const updated = [...page.elements];
    const [item] = updated.splice(idx, 1);
    updated.unshift(item);

    pages[activePageIndex] = { ...page, elements: updated };
    setDocument({ ...document, pages });
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

  randomizeThemeBackground: (promptText?: string) => {
    const { document, setDocument, themeHistory, themeHistoryIndex } = get();
    const topic = promptText || document.meta?.title || document.meta?.description || "Presentation";

    // Snapshot current theme state into history if history is empty
    const currentEntry: ThemeHistoryEntry = {
      theme: document.theme,
      visualDirection: document.visualDirection,
      pageBackgrounds: document.pages.map((p) => ({
        pageId: p.id,
        backgroundSpec: p.backgroundSpec,
        backgroundOverride: p.backgroundOverride,
      })),
    };

    const baseHistory =
      themeHistory.length > 0 && themeHistoryIndex >= 0
        ? themeHistory.slice(0, themeHistoryIndex + 1)
        : [currentEntry];

    // Generate fresh randomized prompt-congruent VisualDirection
    const newVd = generatePromptThemedBackground(topic);

    // Apply to document with slide-level contextual backgrounds
    const updatedDoc = applyVisualDirectionToDocument(document, newVd);

    // Record new entry in theme history
    const newEntry: ThemeHistoryEntry = {
      theme: updatedDoc.theme,
      visualDirection: updatedDoc.visualDirection,
      pageBackgrounds: updatedDoc.pages.map((p) => ({
        pageId: p.id,
        backgroundSpec: p.backgroundSpec,
        backgroundOverride: p.backgroundOverride,
      })),
    };

    const newThemeHistory = [...baseHistory, newEntry];
    if (newThemeHistory.length > 25) newThemeHistory.shift();
    const newIdx = newThemeHistory.length - 1;

    set({
      themeHistory: newThemeHistory,
      themeHistoryIndex: newIdx,
      canUndoTheme: newIdx > 0,
      canRedoTheme: false,
    });

    setDocument(updatedDoc);
  },

  previousThemeBackground: () => {
    const { document, setDocument, themeHistory, themeHistoryIndex } = get();
    if (themeHistoryIndex > 0) {
      const prevIdx = themeHistoryIndex - 1;
      const prevEntry = themeHistory[prevIdx];

      const bgMap = new Map(prevEntry.pageBackgrounds.map((b) => [b.pageId, b]));
      const updatedPages = document.pages.map((page) => {
        const bgInfo = bgMap.get(page.id);
        if (bgInfo) {
          return {
            ...page,
            backgroundSpec: bgInfo.backgroundSpec,
            backgroundOverride: bgInfo.backgroundOverride,
          };
        }
        return page;
      });

      const updatedDoc: DocumentSpec = {
        ...document,
        theme: prevEntry.theme,
        visualDirection: prevEntry.visualDirection,
        pages: updatedPages,
      };

      set({
        themeHistoryIndex: prevIdx,
        canUndoTheme: prevIdx > 0,
        canRedoTheme: true,
      });

      setDocument(updatedDoc);
    }
  },

  nextThemeBackground: () => {
    const { document, setDocument, themeHistory, themeHistoryIndex } = get();
    if (themeHistoryIndex < themeHistory.length - 1) {
      const nextIdx = themeHistoryIndex + 1;
      const nextEntry = themeHistory[nextIdx];

      const bgMap = new Map(nextEntry.pageBackgrounds.map((b) => [b.pageId, b]));
      const updatedPages = document.pages.map((page) => {
        const bgInfo = bgMap.get(page.id);
        if (bgInfo) {
          return {
            ...page,
            backgroundSpec: bgInfo.backgroundSpec,
            backgroundOverride: bgInfo.backgroundOverride,
          };
        }
        return page;
      });

      const updatedDoc: DocumentSpec = {
        ...document,
        theme: nextEntry.theme,
        visualDirection: nextEntry.visualDirection,
        pages: updatedPages,
      };

      set({
        themeHistoryIndex: nextIdx,
        canUndoTheme: true,
        canRedoTheme: nextIdx < themeHistory.length - 1,
      });

      setDocument(updatedDoc);
    }
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
