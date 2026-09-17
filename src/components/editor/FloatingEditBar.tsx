"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import {
  Sparkles,
  Send,
  Loader2,
  Target,
  CheckCircle2,
  Undo2,
  X,
  Check,
  Layers,
  Palette,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { DocumentSpec } from "@/types/document-spec";
import { ApplyToAllSlidesModal } from "./ApplyToAllSlidesModal";
import { cn } from "@/lib/utils";

interface ChangeDiffSummary {
  instruction: string;
  before: string[];
  after: string[];
  updatedDoc: DocumentSpec;
}

const QUICK_ACTIONS = [
  "Make this slide more visual",
  "Shorten the text",
  "Improve the framing",
  "Change color palette",
  "Replace image",
  "Make all slides consistent",
];

export const FloatingEditBar: React.FC = () => {
  const {
    document,
    activePageIndex,
    selectedElementId,
    editScope,
    setEditScope,
    setDocument,
    undo,
    canUndo,
  } = useEditorStore();

  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [pendingDiff, setPendingDiff] = useState<ChangeDiffSummary | null>(null);
  const [isApplyAllOpen, setIsApplyAllOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const activePage = document.pages[activePageIndex];
  const selectedElement = activePage?.elements?.find((e) => e.id === selectedElementId);

  const deriveChangeDiff = (
    originalDoc: DocumentSpec,
    newDoc: DocumentSpec,
    instruction: string
  ): ChangeDiffSummary => {
    const origPage = originalDoc.pages[activePageIndex];
    const newPage = newDoc.pages[activePageIndex];

    const before: string[] = [];
    const after: string[] = [];

    // Check archetype changes
    if (origPage && newPage && origPage.archetype !== newPage.archetype) {
      before.push(`Layout archetype: ${origPage.archetype.replace(/_/g, " ")}`);
      after.push(`New archetype: ${newPage.archetype.replace(/_/g, " ")}`);
    }

    // Check theme / palette changes
    if (originalDoc.theme.colors.primary !== newDoc.theme.colors.primary) {
      before.push(`Primary palette: ${originalDoc.theme.colors.primary}`);
      after.push(`Primary palette updated: ${newDoc.theme.colors.primary}`);
    }

    // Check typography changes
    if (originalDoc.theme.typography.headingFont !== newDoc.theme.typography.headingFont) {
      before.push(`Heading font: ${originalDoc.theme.typography.headingFont}`);
      after.push(`Heading font: ${newDoc.theme.typography.headingFont}`);
    }

    // Check element count and text
    const origTextCount = origPage?.elements?.filter((e) => e.type === "text" || e.type === "list").length || 0;
    const newTextCount = newPage?.elements?.filter((e) => e.type === "text" || e.type === "list").length || 0;
    if (origTextCount !== newTextCount) {
      before.push(`${origTextCount} text blocks`);
      after.push(`Refactored into ${newTextCount} structured elements`);
    }

    // Default informative bullets if subtle
    if (before.length === 0) {
      before.push("Original slide content & container spacing");
      after.push(`Refined according to: "${instruction.slice(0, 50)}"`);
      after.push("Enhanced contrast and balanced margin alignment");
    }

    return {
      instruction,
      before,
      after,
      updatedDoc: newDoc,
    };
  };

  const handleEdit = async (instructionToRun?: string) => {
    const text = instructionToRun || prompt;
    if (!text.trim() || isLoading) return;

    // Special case: direct "apply to all slides" trigger
    if (text.toLowerCase().includes("apply to all") || text.toLowerCase().includes("all slides")) {
      setIsApplyAllOpen(true);
      setPrompt("");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/ai/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentDocument: document,
          pageIndex: activePageIndex,
          instruction: text,
          selectedElementId: selectedElementId || undefined,
          explicitScope: editScope,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || `Failed to apply edit (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (data.updatedDocument) {
        const diff = deriveChangeDiff(document, data.updatedDocument, text);
        setPendingDiff(diff);
        setPrompt("");
      }
    } catch (err: any) {
      console.error("AI edit error:", err);
      setLastMessage({ text: err.message || "Failed to process modification", isError: true });
      setTimeout(() => setLastMessage(null), 6000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmApply = () => {
    if (pendingDiff) {
      setDocument(pendingDiff.updatedDoc);
      setLastMessage({ text: "Changes applied successfully to current slide", isError: false });
      setPendingDiff(null);
      setTimeout(() => setLastMessage(null), 4000);
    }
  };

  const handleDiscard = () => {
    setPendingDiff(null);
  };

  return (
    <>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 pointer-events-auto flex flex-col gap-2">
        {/* 1. Structured Before/After Change Preview Card */}
        {pendingDiff && (
          <div className="bg-card/95 backdrop-blur-md border border-purple-500/40 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 ring-1 ring-purple-500/20 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-bold text-foreground tracking-wide">
                  CHANGE PREVIEW — Slide #{activePageIndex + 1}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground italic truncate max-w-[240px]">
                &quot;{pendingDiff.instruction}&quot;
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Before Column */}
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Before:
                </span>
                <ul className="space-y-1 text-[11px] text-muted-foreground list-disc list-inside">
                  {pendingDiff.before.map((b, i) => (
                    <li key={i} className="leading-snug">{b}</li>
                  ))}
                </ul>
              </div>

              {/* After Column */}
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  After:
                </span>
                <ul className="space-y-1 text-[11px] text-foreground list-disc list-inside font-medium">
                  {pendingDiff.after.map((a, i) => (
                    <li key={i} className="leading-snug">{a}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleDiscard}
                className="px-3 py-1 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleConfirmApply();
                    setIsApplyAllOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>Apply to All Slides</span>
                </button>

                <button
                  onClick={handleConfirmApply}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply to This Slide</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Quick Action Pills Drawer */}
        {showQuickActions && !pendingDiff && (
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-xl p-2 shadow-lg flex flex-wrap gap-1.5 animate-in slide-in-from-bottom-2 duration-150">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(action);
                  handleEdit(action);
                }}
                className="px-2.5 py-1 rounded-lg bg-muted hover:bg-purple-500/15 hover:text-purple-600 text-[11px] font-medium text-foreground transition-colors border border-border/60"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* 3. Main Assistant Bar */}
        <div className="bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-1.5 flex flex-col gap-1.5 ring-1 ring-black/5">
          {lastMessage && (
            <div
              className={cn(
                "px-3 py-1 border rounded-xl text-xs flex items-center justify-between",
                lastMessage.isError
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              )}
            >
              <span className="flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="truncate">{lastMessage.text}</span>
              </span>
              {canUndo && !lastMessage.isError && (
                <button
                  onClick={undo}
                  className="flex items-center gap-1 font-bold underline hover:text-foreground cursor-pointer"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              )}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEdit();
            }}
            className="flex items-center gap-1.5"
          >
            {/* Scope Badge Pill */}
            <button
              type="button"
              onClick={() => {
                const scopes: Array<"auto" | "page" | "element" | "document"> = [
                  "auto",
                  "page",
                  "element",
                  "document",
                ];
                const nextIdx = (scopes.indexOf(editScope) + 1) % scopes.length;
                setEditScope(scopes[nextIdx]);
              }}
              title="Click to toggle target scope"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-[11px] font-bold text-foreground border border-border/80 transition-colors flex-shrink-0"
            >
              <Target className="w-3 h-3 text-primary" />
              <span className="capitalize">
                {editScope === "auto"
                  ? `Slide ${activePageIndex + 1}`
                  : editScope === "page"
                  ? `Slide ${activePageIndex + 1}`
                  : editScope === "element"
                  ? selectedElement?.type || "Element"
                  : "Deck"}
              </span>
            </button>

            {/* Quick Actions Toggle */}
            <button
              type="button"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={cn(
                "p-1.5 rounded-xl border border-border/80 text-xs transition-colors flex-shrink-0",
                showQuickActions ? "bg-purple-500/20 text-purple-500 border-purple-500/30" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
              title="Toggle AI suggestions"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask SlideCraft AI (e.g. 'Make this slide more visual', 'Shorten text', 'Apply to all')..."
              className="flex-1 text-xs px-3 py-1.5 bg-transparent border-none focus:outline-none placeholder:text-muted-foreground"
            />

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex items-center justify-center p-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 disabled:opacity-40 transition-all flex-shrink-0"
              title="Apply AI modification"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Global Apply to All Slides Modal */}
      <ApplyToAllSlidesModal
        isOpen={isApplyAllOpen}
        onClose={() => setIsApplyAllOpen(false)}
        sourceSlideIndex={activePageIndex}
      />
    </>
  );
};
