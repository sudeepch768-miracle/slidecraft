import { DocumentSpec, ContentElement } from "@/types/document-spec";
import { EditScopeType, ResolvedScope, ClarificationPayload } from "./editor-types";

export interface ScopeResolutionContext {
  doc: DocumentSpec;
  activePageIndex?: number;
  selectedElementId?: string | null;
  explicitScope?: EditScopeType;
}

/**
 * Resolves the intended scope of an edit instruction and tests for ambiguity.
 */
export function resolveEditScope(
  instruction: string,
  context: ScopeResolutionContext
): { scope: ResolvedScope; clarification?: ClarificationPayload } {
  const { doc, activePageIndex = 0, selectedElementId, explicitScope = "auto" } = context;
  const lower = instruction.toLowerCase().trim();

  // 1. Check for severe ambiguity first
  const words = lower.split(/\s+/).filter(Boolean);
  const isVaguePhrase =
    [
      "change",
      "fix",
      "update",
      "improve",
      "edit",
      "make better",
      "make it better",
      "redo",
      "delete",
      "move",
      "replace",
      "change it",
      "fix this",
      "do it",
    ].includes(lower) || (words.length <= 3 && (lower.startsWith("make it") || lower.startsWith("fix")));

  if (isVaguePhrase) {
    return {
      scope: {
        type: selectedElementId ? "element" : "page",
        targetName: selectedElementId ? "Selected Element" : `Slide ${activePageIndex + 1}`,
        confidence: 0.3,
      },
      clarification: {
        needsClarification: true,
        question: `What specific change would you like to make to ${selectedElementId ? "the selected item" : `slide ${activePageIndex + 1}`}?`,
        options: [
          "Improve typography & contrast",
          "Convert to a cleaner visual layout",
          "Shorten text into bullet points",
          "Apply executive color palette",
        ],
        suggestedScope: selectedElementId ? "element" : "page",
      },
    };
  }

  // 2. Explicit Scope Override (if user manually locked scope in UI)
  if (explicitScope !== "auto") {
    if (explicitScope === "document") {
      return {
        scope: {
          type: "document",
          targetName: `Entire ${(doc.documentType || "presentation").replace(/_/g, " ")} (${doc.meta.title || "Project"})`,
          confidence: 1.0,
        },
      };
    }
    if (explicitScope === "page") {
      return {
        scope: {
          type: "page",
          targetName: `Slide ${activePageIndex + 1}: ${doc.pages[activePageIndex]?.title || "Untitled"}`,
          pageIndex: activePageIndex,
          confidence: 1.0,
        },
      };
    }
    if (explicitScope === "element" && selectedElementId) {
      const el = doc.pages[activePageIndex]?.elements.find((e) => e.id === selectedElementId);
      return {
        scope: {
          type: "element",
          targetName: el ? `Element (${el.type})` : "Selected Element",
          pageIndex: activePageIndex,
          elementId: selectedElementId,
          confidence: 1.0,
        },
      };
    }
  }

  // 3. Document-Wide Semantic Heuristics
  const isWholeProject =
    lower.includes("entire") ||
    lower.includes("whole") ||
    lower.includes("all slides") ||
    lower.includes("all pages") ||
    lower.includes("all diagrams") ||
    lower.includes("across the deck") ||
    lower.includes("presentation") ||
    lower.includes("theme") ||
    lower.includes("palette") ||
    lower.includes("reorder slides") ||
    lower.includes("alternative versions") ||
    lower.includes("alternatives") ||
    lower.includes("poster") ||
    lower.includes("microsoft-inspired") ||
    lower.includes("more professional") ||
    lower.includes("brand kit") ||
    lower.includes("dark blue background") ||
    lower.includes("change the background to");

  if (isWholeProject && !lower.includes("on slide") && !lower.includes("this slide")) {
    return {
      scope: {
        type: "document",
        targetName: `Entire ${(doc.documentType || "presentation").replace(/_/g, " ")} (${doc.meta.title || "Document"})`,
        confidence: 0.9,
      },
    };
  }

  // 4. Specific Slide Reference Detection (e.g. "slide 4", "page 3", "last slide", "first slide")
  const slideNumMatch = lower.match(/(?:slide|page)\s+(\d+)/);
  if (slideNumMatch) {
    const num = parseInt(slideNumMatch[1], 10);
    const targetIdx = Math.max(0, Math.min(doc.pages.length - 1, num - 1));
    return {
      scope: {
        type: "page",
        targetName: `Slide ${targetIdx + 1}: ${doc.pages[targetIdx]?.title || "Page"}`,
        pageIndex: targetIdx,
        confidence: 0.95,
      },
    };
  }

  if (lower.includes("first slide") || lower.includes("cover slide") || lower.includes("title slide")) {
    return {
      scope: {
        type: "page",
        targetName: `Slide 1: ${doc.pages[0]?.title || "Cover"}`,
        pageIndex: 0,
        confidence: 0.9,
      },
    };
  }

  if (lower.includes("last slide") || lower.includes("closing slide") || lower.includes("final slide")) {
    const lastIdx = doc.pages.length - 1;
    return {
      scope: {
        type: "page",
        targetName: `Slide ${lastIdx + 1}: ${doc.pages[lastIdx]?.title || "Closing"}`,
        pageIndex: lastIdx,
        confidence: 0.9,
      },
    };
  }

  // 5. Element-Level Semantic Heuristics
  const activePage = doc.pages[activePageIndex];
  const isElementLevel =
    selectedElementId ||
    lower.includes("the title") ||
    lower.includes("title size") ||
    lower.includes("this headline") ||
    lower.includes("this icon") ||
    lower.includes("irrelevant icons") ||
    lower.includes("this paragraph") ||
    lower.includes("this bullet") ||
    lower.includes("this metric") ||
    lower.includes("this card");

  if (isElementLevel && activePage) {
    // If element is explicitly selected, target it
    if (selectedElementId) {
      const selectedEl = activePage.elements.find((e) => e.id === selectedElementId);
      return {
        scope: {
          type: "element",
          targetName: selectedEl ? `Element '${selectedEl.id}' (${selectedEl.type})` : "Selected Element",
          pageIndex: activePageIndex,
          elementId: selectedElementId,
          confidence: 0.85,
        },
      };
    }

    // Auto-identify target element on active page
    if (lower.includes("title") || lower.includes("headline")) {
      const titleEl = activePage.elements.find((e) => e.type === "text" && (e as any).variant === "h1");
      return {
        scope: {
          type: "element",
          targetName: `Title Text on Slide ${activePageIndex + 1}`,
          pageIndex: activePageIndex,
          elementId: titleEl?.id,
          confidence: 0.8,
        },
      };
    }

    if (lower.includes("icon") || lower.includes("icons")) {
      const iconEl = activePage.elements.find((e) => (e as any).icon !== undefined || (e as any).iconName !== undefined);
      return {
        scope: {
          type: "element",
          targetName: `Icon on Slide ${activePageIndex + 1}`,
          pageIndex: activePageIndex,
          elementId: iconEl?.id,
          confidence: 0.75,
        },
      };
    }
  }

  // 6. Default to Active Slide
  return {
    scope: {
      type: "page",
      targetName: `Slide ${activePageIndex + 1}: ${activePage?.title || "Active Page"}`,
      pageIndex: activePageIndex,
      confidence: 0.8,
    },
  };
}
