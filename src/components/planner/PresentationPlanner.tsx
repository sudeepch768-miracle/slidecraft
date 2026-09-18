"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PresentationPlan,
  SlidePlan,
  SlideContentType,
  createDefaultSlidePlan,
} from "@/types/planner";
import { validatePresentationPlan } from "@/lib/ai/content-planner";
import { compilePlanToDocumentSpec } from "@/lib/ai/plan-to-slides";
import { generateVisualDirection, visualDirectionToThemeSpec } from "@/lib/ai/visual-direction-engine";
import { projectService } from "@/lib/projects/project-service";
import { useEditorStore } from "@/store/editor-store";
import { PlannerToolbar } from "./PlannerToolbar";
import { SlideOutlinePanel } from "./SlideOutlinePanel";
import { SlideContentEditor } from "./SlideContentEditor";
import { PlannerRightPanel } from "./PlannerRightPanel";
import { PlannerSummaryBar } from "./PlannerSummaryBar";
import { TemplateUploadModal } from "./TemplateUploadModal";
import { PlanPreviewModal } from "./PlanPreviewModal";
import { SlideBackgroundLayer } from "../editor/SlideBackgroundLayer";
import {
  FileText,
  Sparkles,
  Layers,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PresentationPlannerProps {
  initialPlan: PresentationPlan;
  onNewPresentation?: () => void;
}

const LOCAL_STORAGE_PLAN_KEY = "slidecraft_current_presentation_plan";

export const PresentationPlanner: React.FC<PresentationPlannerProps> = ({
  initialPlan,
  onNewPresentation,
}) => {
  const router = useRouter();

  // Normalize initial plan so every slide has a guaranteed immutable id and visualDirection
  const normalizedInitial = useMemo(() => {
    const vd =
      initialPlan.visualDirection ||
      generateVisualDirection(initialPlan.topic || initialPlan.title || "Presentation");
    return {
      ...initialPlan,
      visualDirection: vd,
      slidePlans: initialPlan.slidePlans.map((s, idx) => ({
        ...s,
        id: s.id || `slide-${idx + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        slideNumber: idx + 1,
      })),
    };
  }, [initialPlan]);

  // Primary Plan State
  const [plan, setPlan] = useState<PresentationPlan>(normalizedInitial);
  const [activeSlideId, setActiveSlideId] = useState<string>(
    normalizedInitial.slidePlans[0]?.id || `slide-1`
  );

  // 5-Step Guided Progress State (1: Input, 2: AI Understanding, 3: Outline, 4: Visual Direction, 5: Generate)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(3);

  // History for Undo / Redo
  const [history, setHistory] = useState<PresentationPlan[]>([normalizedInitial]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Synchronize state when initialPlan changes (or when remounted with new key)
  useEffect(() => {
    setPlan(normalizedInitial);
    setActiveSlideId(normalizedInitial.slidePlans[0]?.id || `slide-1`);
    setHistory([normalizedInitial]);
    setHistoryIndex(0);
  }, [normalizedInitial]);

  const handleStartNewPresentation = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_PLAN_KEY);
    } catch {
      // ignore
    }
    if (onNewPresentation) {
      onNewPresentation();
    } else {
      router.push("/create/presentation");
    }
  }, [onNewPresentation, router]);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isRegeneratingSlide, setIsRegeneratingSlide] = useState(false);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState(false);
  const [isExecutingInstruction, setIsExecutingInstruction] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Clean URL query parameters once loaded so that browser refreshes do not wipe out draft edits
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, window.document.title, window.location.pathname);
    }
  }, []);

  // Validation
  const validation = validatePresentationPlan(plan);

  // Active slide lookup
  const activeSlide =
    plan.slidePlans.find(
      (s, idx) => s.id === activeSlideId || `slide-${s.slideNumber}` === activeSlideId || String(idx) === activeSlideId
    ) || plan.slidePlans[0];

  // Helper to commit state updates to history & local storage
  const updatePlanWithHistory = useCallback((newPlan: PresentationPlan) => {
    const updated = {
      ...newPlan,
      updatedAt: new Date().toISOString(),
    };
    setPlan(updated);

    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, updated];
    });
    setHistoryIndex((prev) => prev + 1);

    // Save to local storage
    try {
      setIsSaving(true);
      localStorage.setItem(LOCAL_STORAGE_PLAN_KEY, JSON.stringify(updated));
      setTimeout(() => setIsSaving(false), 300);
    } catch {
      setIsSaving(false);
    }
  }, [historyIndex]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setPlan(history[prevIdx]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setPlan(history[nextIdx]);
    }
  }, [historyIndex, history]);

  // Keyboard shortcut listener for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Title Update
  const handleUpdateTitle = (title: string) => {
    updatePlanWithHistory({ ...plan, title });
  };

  // Metadata update (settings)
  const handleUpdatePlanMeta = (partial: Partial<PresentationPlan>) => {
    updatePlanWithHistory({ ...plan, ...partial });
  };

  // Slide Selection
  const handleSelectSlide = (id: string) => {
    setActiveSlideId(id);
  };

  // Add Slide
  const handleAddSlide = () => {
    const nextNum = plan.slidePlans.length + 1;
    const newSlide = createDefaultSlidePlan(
      nextNum,
      `Slide ${nextNum}: Strategic Analysis`,
      `Explain strategic application and empirical findings.`
    );
    const updatedSlides = [...plan.slidePlans, newSlide];
    updatePlanWithHistory({
      ...plan,
      slideCount: updatedSlides.length,
      slidePlans: updatedSlides,
    });
    setActiveSlideId(newSlide.id || `slide-${nextNum}`);
  };

  // Duplicate Slide
  const handleDuplicateSlide = (id: string) => {
    const targetIdx = plan.slidePlans.findIndex(
      (s, idx) => s.id === id || `slide-${s.slideNumber}` === id || String(idx) === id
    );
    if (targetIdx === -1) return;

    const target = plan.slidePlans[targetIdx];
    const clonedSlide: SlidePlan = JSON.parse(JSON.stringify(target));
    clonedSlide.id = `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    clonedSlide.title = `${clonedSlide.title} (Copy)`;

    const updatedSlides = [...plan.slidePlans];
    updatedSlides.splice(targetIdx + 1, 0, clonedSlide);

    // Renumber slides
    const renumbered = updatedSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));

    updatePlanWithHistory({
      ...plan,
      slideCount: renumbered.length,
      slidePlans: renumbered,
    });
    setActiveSlideId(clonedSlide.id);
  };

  // Delete Slide
  const handleDeleteSlide = (id: string) => {
    if (plan.slidePlans.length <= 1) return;

    const filtered = plan.slidePlans.filter(
      (s, idx) => s.id !== id && `slide-${s.slideNumber}` !== id && String(idx) !== id
    );
    const renumbered = filtered.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));

    updatePlanWithHistory({
      ...plan,
      slideCount: renumbered.length,
      slidePlans: renumbered,
    });

    if (activeSlideId === id) {
      setActiveSlideId(renumbered[0]?.id || `slide-1`);
    }
  };

  // Move Slide (Up / Down)
  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= plan.slidePlans.length) return;

    const updated = [...plan.slidePlans];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const renumbered = updated.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    updatePlanWithHistory({
      ...plan,
      slidePlans: renumbered,
    });
  };

  // Toggle Lock
  const handleToggleLock = (id: string) => {
    const updated = plan.slidePlans.map((s, idx) => {
      if (s.id === id || `slide-${s.slideNumber}` === id || String(idx) === id) {
        return { ...s, isLocked: !s.isLocked };
      }
      return s;
    });
    updatePlanWithHistory({ ...plan, slidePlans: updated });
  };

  // Update Slide Content
  const handleUpdateSlide = (updatedSlide: SlidePlan) => {
    const updated = plan.slidePlans.map((s, idx) => {
      if (s.id === updatedSlide.id || `slide-${s.slideNumber}` === updatedSlide.id || s.slideNumber === updatedSlide.slideNumber) {
        return updatedSlide;
      }
      return s;
    });
    updatePlanWithHistory({ ...plan, slidePlans: updated });
  };

  // Convert Slide Content Type
  const handleConvertType = async (targetType: SlideContentType) => {
    try {
      const res = await fetch("/api/ai/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "convert_type",
          plan,
          slideId: activeSlide.id || `slide-${activeSlide.slideNumber}`,
          targetType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          updatePlanWithHistory(data.plan);
        }
      }
    } catch {
      // Local fallback conversion
      const cloned: SlidePlan = JSON.parse(JSON.stringify(activeSlide));
      cloned.content.type = targetType;
      handleUpdateSlide(cloned);
    }
  };

  // Refine Slide via AI (Expand, Academic, Add Examples, Add Stats, etc.)
  const handleRefineSlide = async (
    action: "expand" | "shorten" | "academic" | "add_examples" | "add_case_study" | "add_statistics" | "rewrite"
  ) => {
    setIsRefining(true);
    try {
      const res = await fetch("/api/ai/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "refine_slide",
          plan,
          slideId: activeSlide.id || `slide-${activeSlide.slideNumber}`,
          refinementAction: action,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          updatePlanWithHistory(data.plan);
        }
      }
    } catch (err) {
      console.warn("Slide refinement error:", err);
    } finally {
      setIsRefining(false);
    }
  };

  // Regenerate single slide (strictly preserving locked slides)
  const handleRegenerateSlide = async (slideId: string) => {
    const target = plan.slidePlans.find(
      (s, idx) => (s.id && s.id === slideId) || `slide-${s.slideNumber}` === slideId || String(idx) === slideId
    );
    if (!target || target.isLocked) return;

    setIsRegeneratingSlide(true);
    try {
      const res = await fetch("/api/ai/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate_slide",
          plan,
          slideId: target.id || `slide-${target.slideNumber}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          updatePlanWithHistory(data.plan);
        }
      }
    } catch (err) {
      console.warn("Regenerate slide error:", err);
    } finally {
      setIsRegeneratingSlide(false);
    }
  };

  // Regenerate entire section (strictly preserving locked slides)
  const handleRegenerateSection = async (sectionName: string) => {
    setIsRegeneratingSection(true);
    try {
      const res = await fetch("/api/ai/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate_section",
          plan,
          sectionName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          updatePlanWithHistory(data.plan);
        }
      }
    } catch (err) {
      console.warn("Regenerate section error:", err);
    } finally {
      setIsRegeneratingSection(false);
    }
  };

  // Explicit Save Draft Handler
  const handleSaveDraft = useCallback(() => {
    setIsSaving(true);
    try {
      const updated = {
        ...plan,
        updatedAt: new Date().toISOString(),
      };
      setPlan(updated);
      localStorage.setItem(LOCAL_STORAGE_PLAN_KEY, JSON.stringify(updated));
      setTimeout(() => setIsSaving(false), 500);
    } catch {
      setIsSaving(false);
    }
  }, [plan]);

  // Chat Assistant Instruction
  const handleSendChatInstruction = async (instruction: string) => {
    setIsExecutingInstruction(true);
    try {
      const res = await fetch("/api/ai/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat_instruction",
          plan,
          instruction,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          updatePlanWithHistory(data.plan);
        }
      }
    } catch (err) {
      console.warn("Chat instruction error:", err);
    } finally {
      setIsExecutingInstruction(false);
    }
  };

  // Save Template Config
  const handleSaveTemplateConfig = (config: {
    mode: "new_design" | "use_template" | "follow_sample" | "combine";
    templateName?: string;
    sampleName?: string;
    extractedTheme?: any;
  }) => {
    updatePlanWithHistory({
      ...plan,
      templateConfig: config,
    });
  };

  // Re-roll Visual Style Direction
  const handleRerollVisualDirection = () => {
    const newVd = generateVisualDirection(plan.topic || plan.title || "Presentation", {
      seed: `planner-reroll-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });
    updatePlanWithHistory({
      ...plan,
      visualDirection: newVd,
    });
  };

  const effectiveTheme = plan.visualDirection
    ? visualDirectionToThemeSpec(plan.visualDirection)
    : {
      mode: "dark" as const,
      colors: {
        primary: "#38bdf8",
        secondary: "#818cf8",
        accent: "#f59e0b",
        background: "#0A0F1D",
        surface: "#131C31",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        border: "#1E2A44",
      },
      typography: {
        headingFont: "Plus Jakarta Sans",
        bodyFont: "Inter",
        monoFont: "JetBrains Mono",
        baseSizePx: 16,
      },
      styleTokens: {
        borderRadiusPx: 14,
        shadow: "lg" as const,
      },
    };

  // Primary Action: Approve Plan & Generate Presentation
  const handleApproveAndGenerate = async () => {
    setIsGenerating(true);
    try {
      // 1. Generate unique project and document ID
      const targetProjectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      // 2. Compile PresentationPlan blueprint into high-fidelity DocumentSpec with explicit project/document IDs
      const documentSpec = compilePlanToDocumentSpec(plan, {
        projectId: targetProjectId,
        documentId: targetProjectId,
      });

      // 3. Create an isolated new project (never overwriting existing projects)
      const newProject = await projectService.createProject({
        id: targetProjectId,
        name: plan.title,
        projectType: "presentation",
        originalPrompt: plan.topic,
        currentSpec: documentSpec,
      });

      // Synchronously prime the editor store in memory so /editor has it instantaneously
      try {
        useEditorStore.getState().initProject(newProject);
      } catch (storeErr) {
        console.warn("Could not pre-populate editor store in memory:", storeErr);
      }

      // Persist to sessionStorage and dedicated localStorage key for guaranteed tab recovery
      try {
        sessionStorage.setItem(`slidecraft_project_${newProject.id}`, JSON.stringify(newProject));
        localStorage.setItem(`slidecraft_project_${newProject.id}`, JSON.stringify(newProject));
      } catch (storageErr) {
        console.warn("Could not write project to sessionStorage/localStorage:", storageErr);
      }

      // 4. Clear active draft from local storage
      localStorage.removeItem(LOCAL_STORAGE_PLAN_KEY);

      // 5. Redirect directly into the editor for this new project
      router.push(`/editor?projectId=${newProject.id}`);
    } catch (err) {
      console.error("Failed to compile presentation and create project:", err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* 1. Top Toolbar */}
      <PlannerToolbar
        title={plan.title}
        onUpdateTitle={handleUpdateTitle}
        isSaving={isSaving}
        onSaveDraft={handleSaveDraft}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
        isRightPanelOpen={isRightPanelOpen}
        onApproveAndGenerate={handleApproveAndGenerate}
        isGenerating={isGenerating}
        onNewPresentation={handleStartNewPresentation}
      />

      {/* 2. 5-Step Guided Navigation Tab Bar */}
      <div className="bg-card/70 border-b border-border/70 px-4 py-2 flex items-center justify-between shrink-0 select-none overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 mx-auto max-w-4xl w-full justify-between">
          {[
            { step: 1, label: "Input Summary", icon: FileText },
            { step: 2, label: "AI Understanding", icon: Sparkles },
            { step: 3, label: "Slide Outline", icon: Layers },
            { step: 4, label: "Visual Style", icon: Palette },
            { step: 5, label: "Review & Generate", icon: CheckCircle2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            return (
              <button
                key={item.step}
                onClick={() => setCurrentStep(item.step as 1 | 2 | 3 | 4 | 5)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : isCompleted
                      ? "text-primary hover:bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                    isActive
                      ? "bg-primary-foreground text-primary"
                      : isCompleted
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? "✓" : item.step}
                </span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Step Views Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* STEP 1: Input Summary */}
        {currentStep === 1 && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Step 1: Input Summary</h2>
              <p className="text-sm text-muted-foreground">
                Review and fine-tune your core topic, intended audience, and strategic constraints before generating slides.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Topic & Subject Matter
                </label>
                <input
                  type="text"
                  value={plan.title}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. NeuroInsight: Neural Activity with Deep Learning"
                />
                <p className="text-xs text-muted-foreground">
                  The primary subject used by the AI to synthesize outline sections and visual themes.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={plan.targetAudience || "Executive Leadership & Technical Stakeholders"}
                  onChange={(e) => handleUpdatePlanMeta({ targetAudience: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. Researchers, Investors, Executive Committee"
                />
                <p className="text-xs text-muted-foreground">
                  Shapes the density, vocabulary, and analytical framing of generated slides.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tone & Narrative Delivery
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["professional", "academic", "visionary", "concise", "creative"].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => handleUpdatePlanMeta({ tone: tone as any })}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-medium capitalize border transition-all text-left",
                        plan.tone === tone
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Presentation Scope & Timing
                </label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Slide Count</span>
                    <span className="font-semibold">{plan.slidePlans.length} slides</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Est. Duration</span>
                    <span className="font-semibold">{plan.estimatedDuration || plan.slidePlans.length * 2} minutes</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Visual Style</span>
                    <span className="font-semibold text-primary">{plan.visualDirection?.styleFamily || "Dynamic"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Primary Thesis & Strategic Objective
              </label>
              <textarea
                value={plan.objective || plan.keyMessage || ""}
                onChange={(e) => handleUpdatePlanMeta({ objective: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                placeholder="What is the single most important message or objective the audience must take away from this presentation?"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <span>Continue to AI Understanding</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AI Understanding */}
        {currentStep === 2 && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Step 2: AI Understanding</h2>
              <p className="text-sm text-muted-foreground">
                SlideCraft AI analyzed your topic and synthesized this strategic architecture.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Executive Thesis & Communication Goal</span>
              </div>
              <p className="text-base text-foreground font-medium leading-relaxed">
                &quot;{plan.keyMessage || plan.objective || plan.title}&quot;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Target Audience Persona
                </h3>
                <p className="text-sm text-muted-foreground">
                  {plan.targetAudience || "Tailored for technical and decision-making professionals looking for clear empirical clarity."}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                    Tone: {plan.tone || "Professional"}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                    Depth: Strategic & Analytical
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Visual Direction Assignment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Assigned dynamic style family: <span className="font-semibold text-foreground">{plan.visualDirection?.styleFamily}</span>.
                </p>
                <p className="text-xs text-muted-foreground">
                  Style: {plan.visualDirection?.backgroundStyle || "solid_gradient"}, Density: {plan.visualDirection?.visualDensity || "balanced"}
                </p>
              </div>
            </div>

            {/* Slide Breakdown Chips */}
            <div className="p-5 rounded-xl border border-border bg-card space-y-3">
              <h3 className="text-sm font-semibold">Synthesized Slide Sequence ({plan.slidePlans.length} Slides)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.slidePlans.map((slide, idx) => (
                  <div key={slide.id || idx} className="p-3 rounded-lg border border-border/70 bg-background/50 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{slide.title}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{(slide.layoutSuggestion || slide.content?.type || "Standard").replace(/_/g, " ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Input</span>
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <span>Continue to Slide Outline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Slide Outline & Content Editor (Full Workspace) */}
        {currentStep === 3 && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel: Slide Outline & Reordering */}
              <SlideOutlinePanel
                slides={plan.slidePlans}
                activeSlideId={activeSlideId}
                onSelectSlide={handleSelectSlide}
                onAddSlide={handleAddSlide}
                onDuplicateSlide={handleDuplicateSlide}
                onDeleteSlide={handleDeleteSlide}
                onMoveSlide={handleMoveSlide}
                onToggleLock={handleToggleLock}
                onRegenerateSection={handleRegenerateSection}
                isRegeneratingSection={isRegeneratingSection}
              />

              {/* Center Panel: Content Editor */}
              {activeSlide ? (
                <SlideContentEditor
                  slide={activeSlide}
                  totalSlides={plan.slidePlans.length}
                  onUpdateSlide={handleUpdateSlide}
                  onConvertType={handleConvertType}
                  onRefineSlide={handleRefineSlide}
                  isRefining={isRefining}
                  onRegenerateSlide={() => handleRegenerateSlide(activeSlide.id || `slide-${activeSlide.slideNumber}`)}
                  isRegenerating={isRegeneratingSlide}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  Select a slide from the outline to edit its content blueprint.
                </div>
              )}

              {/* Right Panel: Settings & AI Assistant */}
              {isRightPanelOpen && (
                <PlannerRightPanel
                  plan={plan}
                  onUpdatePlanMeta={handleUpdatePlanMeta}
                  onSendChatInstruction={handleSendChatInstruction}
                  isExecutingInstruction={isExecutingInstruction}
                />
              )}
            </div>

            {/* Step Navigation Bar for Step 3 */}
            <div className="px-4 py-2 border-t border-border bg-card flex items-center justify-between shrink-0">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to AI Understanding</span>
              </button>
              <div className="text-xs text-muted-foreground hidden sm:block">
                Editing slide outline & structured blueprints
              </div>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:opacity-90 transition-opacity"
              >
                <span>Continue to Visual Style</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Live Visual Style Preview */}
        {currentStep === 4 && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Step 4: Live Visual Style Preview</h2>
                <p className="text-sm text-muted-foreground">
                  Experience the exact atmospheric colors, card glassmorphism, and framing generated for this deck.
                </p>
              </div>
              <button
                onClick={handleRerollVisualDirection}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-roll Visual Style Direction</span>
              </button>
            </div>

            {/* Visual Direction Specification Card */}
            <div className="p-5 rounded-xl border border-border bg-card grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Style Family</span>
                <span className="text-sm font-bold text-foreground capitalize">
                  {plan.visualDirection?.styleFamily?.replace(/_/g, " ") || "Dynamic"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Color Mode</span>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {plan.visualDirection?.mode || "Dark"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Background Style</span>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {plan.visualDirection?.backgroundStyle?.replace(/_/g, " ") || "Gradient"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Visual Density</span>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {plan.visualDirection?.visualDensity || "Balanced"}
                </span>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="p-4 rounded-xl border border-border bg-card flex flex-wrap items-center gap-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Palette:</span>
              {[
                { label: "Primary", color: plan.visualDirection?.colors.primary || "#38bdf8" },
                { label: "Secondary", color: plan.visualDirection?.colors.secondary || "#818cf8" },
                { label: "Accent", color: plan.visualDirection?.colors.accent || "#f59e0b" },
                { label: "Background", color: plan.visualDirection?.colors.background || "#0A0F1D" },
                { label: "Surface", color: plan.visualDirection?.colors.surface || "#131C31" },
              ].map((swatch) => (
                <div key={swatch.label} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border border-border shadow-inner"
                    style={{ backgroundColor: swatch.color }}
                  />
                  <div className="text-xs">
                    <span className="font-semibold block">{swatch.label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{swatch.color}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Realistic Canvas Preview */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Realistic Canvas Simulation (Slide 1 Preview)
              </label>
              <div
                className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-border shadow-2xl relative flex flex-col justify-between p-8 md:p-12 select-none"
                style={{
                  backgroundColor: plan.visualDirection?.colors.background || "#0A0F1D",
                  color: plan.visualDirection?.colors.textPrimary || "#F8FAFC",
                }}
              >
                {/* Background Layer with Glows & Gradients */}
                <SlideBackgroundLayer
                  visualDirection={plan.visualDirection}
                  theme={effectiveTheme}
                />

                {/* Simulated Slide Content */}
                <div className="relative z-10 space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-primary/40 bg-primary/10 text-primary backdrop-blur-sm">
                    {plan.slidePlans[0]?.section || "STRATEGIC PRESENTATION"}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
                    {plan.slidePlans[0]?.title || plan.title}
                  </h1>
                  <p className="text-xs md:text-base text-muted-foreground line-clamp-2">
                    {plan.slidePlans[0]?.purpose || plan.keyMessage || "Decoding complex neural paradigms through high-fidelity visual representations."}
                  </p>
                </div>

                {/* Simulated Glass Card Component */}
                <div className="relative z-10 grid grid-cols-3 gap-4 mt-6">
                  {[
                    { label: "Core Architecture", desc: "Multi-layered dynamic synthesis" },
                    { label: "Visual Cohesion", desc: "Uniform framing across 8 slides" },
                    { label: "PPTX Export Parity", desc: "Native vector shapes & gradients" },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border backdrop-blur-md transition-transform hover:-translate-y-1"
                      style={{
                        backgroundColor: plan.visualDirection?.colors.surface
                          ? `${plan.visualDirection.colors.surface}cc`
                          : "rgba(255,255,255,0.05)",
                        borderColor: plan.visualDirection?.colors.surfaceBorder || "rgba(255,255,255,0.1)",
                      }}
                    >
                      <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: plan.visualDirection?.colors.accent || "#38bdf8" }} />
                      <h4 className="text-xs md:text-sm font-bold">{card.label}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Outline</span>
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <span>Continue to Review & Generate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Generate */}
        {currentStep === 5 && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Step 5: Review & Generate</h2>
              <p className="text-sm text-muted-foreground">
                Your presentation blueprint is fully refined and ready for high-fidelity generation.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card text-center space-y-1">
                <span className="text-xs text-muted-foreground uppercase">Slides</span>
                <p className="text-2xl font-bold text-foreground">{plan.slidePlans.length}</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card text-center space-y-1">
                <span className="text-xs text-muted-foreground uppercase">Est. Time</span>
                <p className="text-2xl font-bold text-foreground">{plan.estimatedDuration || plan.slidePlans.length * 2}m</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card text-center space-y-1">
                <span className="text-xs text-muted-foreground uppercase">Style Family</span>
                <p className="text-xs font-bold text-primary truncate capitalize">
                  {plan.visualDirection?.styleFamily?.replace(/_/g, " ") || "Dynamic"}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card text-center space-y-1">
                <span className="text-xs text-muted-foreground uppercase">Readiness</span>
                <p className="text-2xl font-bold text-emerald-500">100%</p>
              </div>
            </div>

            {/* Slide Index Summary */}
            <div className="p-5 rounded-xl border border-border bg-card space-y-3">
              <h3 className="text-sm font-semibold">Deck Slide Sequence</h3>
              <div className="space-y-2">
                {plan.slidePlans.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="p-3 rounded-lg border border-border/70 bg-background/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-foreground">{slide.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize text-[10px]">
                        {(slide.layoutSuggestion || slide.content?.type || "Standard").replace(/_/g, " ")}
                      </span>
                      {slide.isLocked && (
                        <span className="text-amber-500 text-[10px] font-bold">LOCKED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Generation Call to Action */}
            <div className="p-8 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Ready to Build Presentation</h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  Clicking below will construct all {plan.slidePlans.length} slides with full layout composition, topic images, and open directly in the editor.
                </p>
              </div>

              <button
                onClick={handleApproveAndGenerate}
                disabled={isGenerating}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-bold text-base shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Compiling Presentation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Generate Presentation</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-start pt-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Visual Style</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Summary Bar (Rendered on Step 3 for quick slide validation) */}
      {currentStep === 3 && (
        <PlannerSummaryBar
          totalSlides={plan.slidePlans.length}
          estimatedDuration={plan.estimatedDuration}
          validation={validation}
          onOpenWarningsModal={() => setIsPreviewOpen(true)}
        />
      )}

      {/* 5. Modals */}
      <PlanPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        plan={plan}
        onApproveAndGenerate={handleApproveAndGenerate}
      />

      <TemplateUploadModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentMode={plan.templateConfig?.mode || "new_design"}
        templateName={plan.templateConfig?.templateName}
        sampleName={plan.templateConfig?.sampleName}
        onSaveTemplateConfig={handleSaveTemplateConfig}
      />
    </div>
  );
};
