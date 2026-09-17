"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import {
  Sparkles,
  Send,
  Wand2,
  RefreshCw,
  LayoutGrid,
  BarChart3,
  ListOrdered,
  X,
  Loader2,
  FileText,
  Sliders,
  PlusCircle,
  FolderPlus,
} from "lucide-react";
import { DocumentType } from "@/types/document-spec";
import { cn } from "@/lib/utils";
import { projectService } from "@/lib/projects/project-service";

export const AIChatPanel: React.FC = () => {
  const {
    document,
    activePageIndex,
    setActivePage,
    setDocument,
    isAIChatOpen,
    setAIChatOpen,
    updateActivePageArchetype,
    projectId,
    initProject,
  } = useEditorStore();

  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "generate">("edit");
  const [newDocType, setNewDocType] = useState<DocumentType>("presentation");
  const [pageCount, setPageCount] = useState(5);
  const [generationTarget, setGenerationTarget] = useState<"new_project" | "append_current">("new_project");

  const activePage = document.pages[activePageIndex];

  // Format-aware tab & label helpers
  const getEditTabLabel = () => {
    switch (document.documentType) {
      case "presentation":
        return `Edit Slide (${activePageIndex + 1})`;
      case "poster":
        return "Edit Poster";
      case "infographic":
        return `Edit Section (${activePageIndex + 1})`;
      case "social_media":
        return `Edit Post (${activePageIndex + 1})`;
      case "resume":
        return `Edit Section (${activePageIndex + 1})`;
      case "letter":
        return "Edit Letter";
      case "diagram":
        return "Edit Diagram";
      case "chart":
        return "Edit Chart";
      default:
        return `Edit Page (${activePageIndex + 1})`;
    }
  };

  const getPlaceholderText = () => {
    if (activeTab === "edit") {
      return `Instruct AI to modify this ${document.documentType} (e.g. 'Add key performance metrics' or 'Refine layout and tone')...`;
    }
    switch (newDocType) {
      case "presentation":
        return "Describe your deck topic, audience, and key goals...";
      case "poster":
        return "Describe the event, announcement, headline, and visual mood...";
      case "infographic":
        return "Describe the process, statistics, timeline, or comparison...";
      case "social_media":
        return "Describe the product, hook, campaign message, and platform...";
      case "resume":
        return "Describe your target job title, core accomplishments, and skills...";
      case "letter":
        return "Describe the purpose, recipient, key proposal, and formal tone...";
      case "diagram":
        return "Describe the system architecture, flowchart steps, or data flow...";
      case "chart":
        return "Describe the metrics, comparison categories, time periods, and takeaways...";
      default:
        return "Describe what you want to generate...";
    }
  };

  // Handle Natural Language Modification of Current Document Element/Slide
  const handleModifySlide = async (customPrompt?: string) => {
    const textToRun = customPrompt || prompt;
    if (!textToRun.trim() || !activePage) return;

    try {
      setIsLoading(true);

      const res = await fetch("/api/ai/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentDocument: document,
          pageIndex: activePageIndex,
          instruction: textToRun,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to apply modification");
      }

      const { updatedDocument } = await res.json();
      if (updatedDocument) {
        setDocument(updatedDocument);
        setPrompt("");
      }
    } catch (error: any) {
      console.error("AI Modify Error:", error);
      alert(`AI Edit Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Generating a Document (Isolated Project by default, or Explicit Append)
  const handleGenerateDocument = async () => {
    if (!prompt.trim()) return;

    try {
      setIsLoading(true);

      const canAppend =
        generationTarget === "append_current" &&
        (document.documentType === "presentation" || document.documentType === "infographic") &&
        newDocType === document.documentType &&
        Boolean(projectId);

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          documentType: newDocType,
          pageCount: canAppend ? Math.min(pageCount, 3) : pageCount,
          sourceProjectId: canAppend ? projectId : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate document");
      }

      const { document: generatedDoc, designSystem } = await res.json();
      if (generatedDoc) {
        if (canAppend) {
          // Explicit user choice: append newly generated pages to existing project
          const nextPages = [
            ...document.pages,
            ...generatedDoc.pages.map((p: any, i: number) => ({
              ...p,
              pageNumber: document.pages.length + i + 1,
            })),
          ];
          const mergedDoc = {
            ...document,
            pages: nextPages,
          };
          setDocument(mergedDoc);
          setActivePage(document.pages.length);
        } else {
          // Strict isolation: create brand new project artifact
          const newProj = await projectService.createProject({
            name: generatedDoc.meta.title || prompt.slice(0, 35),
            projectType: newDocType,
            originalPrompt: prompt,
            currentSpec: generatedDoc,
          });

          // Reset store with new project's clean state
          initProject({
            id: newProj.id,
            current_spec: generatedDoc,
            design_system: designSystem || generatedDoc.designSystem || null,
            project_type: newDocType,
          });

          // Update URL without full page reload
          if (typeof window !== "undefined") {
            window.history.pushState(null, "", `/editor?projectId=${newProj.id}`);
          }
        }

        setPrompt("");
        setActiveTab("edit");
      }
    } catch (error: any) {
      console.error("AI Generate Error:", error);
      alert(`Generation Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAIChatOpen) return null;

  return (
    <aside className="w-80 md:w-96 h-[calc(100vh-4rem)] border-l border-border/80 bg-card/95 backdrop-blur flex flex-col z-20 shadow-xl select-none">
      {/* Panel Header */}
      <div className="p-4 border-b border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold">AI Design Studio</h3>
            <p className="text-[11px] text-muted-foreground">Autonomous visual content studio</p>
          </div>
        </div>

        <button
          onClick={() => setAIChatOpen(false)}
          className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/80 text-xs font-semibold px-4 pt-2 gap-4">
        <button
          onClick={() => setActiveTab("edit")}
          className={cn(
            "pb-2 transition-colors border-b-2",
            activeTab === "edit"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {getEditTabLabel()}
        </button>
        <button
          onClick={() => setActiveTab("generate")}
          className={cn(
            "pb-2 transition-colors border-b-2",
            activeTab === "generate"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Generate New
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {activeTab === "edit" ? (
          <>
            {/* Quick Action Pills */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                One-Click Layout Archetypes
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateActivePageArchetype("four_metric_dashboard")}
                  className="flex items-center gap-2 p-2 rounded-xl border border-border bg-background hover:bg-muted/80 text-xs font-medium text-left transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <span>4 KPIs Grid</span>
                </button>

                <button
                  onClick={() => updateActivePageArchetype("three_card_grid")}
                  className="flex items-center gap-2 p-2 rounded-xl border border-border bg-background hover:bg-muted/80 text-xs font-medium text-left transition-colors"
                >
                  <LayoutGrid className="w-4 h-4 text-blue-500" />
                  <span>3 Feature Cards</span>
                </button>

                <button
                  onClick={() => updateActivePageArchetype("process_flowchart")}
                  className="flex items-center gap-2 p-2 rounded-xl border border-border bg-background hover:bg-muted/80 text-xs font-medium text-left transition-colors"
                >
                  <ListOrdered className="w-4 h-4 text-indigo-500" />
                  <span>Workflow Diagram</span>
                </button>

                <button
                  onClick={() => updateActivePageArchetype("data_chart_focus")}
                  className="flex items-center gap-2 p-2 rounded-xl border border-border bg-background hover:bg-muted/80 text-xs font-medium text-left transition-colors"
                >
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>Chart + Takeaways</span>
                </button>
              </div>
            </div>

            {/* Quick AI Prompts */}
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Suggested AI Prompts
              </span>
              {[
                "Add a quarterly growth bar chart with insights",
                "Summarize the content into 3 key takeaway cards",
                "Add 4 impressive KPI metrics with trend badges",
                "Convert the points into a 4-step process flowchart",
                "Make the tone more executive and authoritative",
              ].map((sug, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleModifySlide(sug)}
                  className="text-left text-xs p-2 rounded-lg bg-muted/50 hover:bg-muted hover:text-foreground transition-colors text-muted-foreground truncate border border-border/40"
                >
                  ✨ {sug}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Generate from Scratch Configuration */
          <div className="flex flex-col gap-4">
            {/* Target Mode: Independent Project vs Append to Current */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Generation Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGenerationTarget("new_project")}
                  className={cn(
                    "p-2.5 text-xs rounded-xl border font-semibold text-left transition-all flex flex-col gap-0.5",
                    generationTarget === "new_project"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background hover:bg-muted text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-1 font-bold">
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>New Project</span>
                  </div>
                  <div className="text-[10px] opacity-80 font-normal">Isolated new artifact</div>
                </button>

                <button
                  type="button"
                  disabled={document.documentType !== "presentation" && document.documentType !== "infographic"}
                  onClick={() => setGenerationTarget("append_current")}
                  className={cn(
                    "p-2.5 text-xs rounded-xl border font-semibold text-left transition-all flex flex-col gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed",
                    generationTarget === "append_current"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background hover:bg-muted text-muted-foreground"
                  )}
                  title={
                    document.documentType !== "presentation" && document.documentType !== "infographic"
                      ? "Appending only supported for presentations and infographics"
                      : "Add slides or sections to this existing document"
                  }
                >
                  <div className="flex items-center gap-1 font-bold">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add to Active</span>
                  </div>
                  <div className="text-[10px] opacity-80 font-normal">Append to current</div>
                </button>
              </div>
            </div>

            {/* Format Selector */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Visual Content Format
              </label>
              <select
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                className="w-full p-2 text-xs rounded-xl border border-border bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="presentation">PowerPoint Deck (16:9 Slides)</option>
                <option value="poster">Executive Poster (A4 / Display)</option>
                <option value="infographic">Visual Infographic (9:16 Vertical)</option>
                <option value="social_media">Social Media Graphic (1:1 / 9:16)</option>
                <option value="resume">Professional Resume & CV (A4 ATS)</option>
                <option value="letter">Executive Formal Letter (US Letter)</option>
                <option value="diagram">Architecture / Flowchart Diagram</option>
                <option value="chart">Data Visualization Report</option>
              </select>
            </div>

            {/* Slide / Page Count (relevant for multi-page formats) */}
            {(newDocType === "presentation" || newDocType === "infographic") && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span>{newDocType === "presentation" ? "Slide Count" : "Sections Count"}</span>
                  <span className="text-primary">{pageCount} {newDocType === "presentation" ? "slides" : "sections"}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={pageCount}
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Prompt Footer */}
      <div className="p-4 border-t border-border/80 bg-background/50">
        <div className="relative flex items-center">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                activeTab === "edit" ? handleModifySlide() : handleGenerateDocument();
              }
            }}
            placeholder={getPlaceholderText()}
            className="w-full text-xs p-3 pr-10 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground/70"
          />

          <button
            onClick={() => (activeTab === "edit" ? handleModifySlide() : handleGenerateDocument())}
            disabled={isLoading || !prompt.trim()}
            className="absolute right-2.5 bottom-2.5 p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Deterministic compilation + Autonomous dynamic design system.
        </p>
      </div>
    </aside>
  );
};
