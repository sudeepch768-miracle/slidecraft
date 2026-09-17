"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { LayoutArchetype, ThemeSpec } from "@/types/document-spec";
import { PRESET_BRAND_KITS } from "@/types/brand-kit";
import {
  Sliders,
  Sparkles,
  ChevronRight,
  Palette,
  LayoutGrid,
  Send,
  Loader2,
  Wand2,
  Type,
  TrendingUp,
  BarChart2,
  Check,
  Target,
  HelpCircle,
  CheckCircle2,
  Undo2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  XCircle,
  Info,
  ArrowRight,
  Trash2,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRESENTATION_ARCHETYPES: Array<{ id: LayoutArchetype; label: string; desc: string }> = [
  { id: "hero_title", label: "Hero Title", desc: "Large headline, badge & subtitle" },
  { id: "four_metric_dashboard", label: "4 Metrics", desc: "Key KPI statistics with delta trends" },
  { id: "three_card_grid", label: "3-Card Grid", desc: "Structured pillars and value cards" },
  { id: "two_column_split", label: "2-Column Split", desc: "Side-by-side comparison or bio" },
  { id: "comparison_table", label: "Comparison Table", desc: "Feature vs competitor matrix" },
  { id: "process_flowchart", label: "Process Flow", desc: "Sequential workflow DAG nodes" },
  { id: "data_chart_focus", label: "Data Chart Focus", desc: "Prominent visual chart visualization" },
];

const POSTER_ARCHETYPES: Array<{ id: LayoutArchetype; label: string; desc: string }> = [
  { id: "college_event_poster", label: "College Event & Fest", desc: "Campus fests, summits, concerts" },
  { id: "workshop_poster", label: "Workshop & Lab", desc: "Hands-on tech bootcamps & training" },
  { id: "seminar_poster", label: "Academic Seminar", desc: "Distinguished speakers & symposiums" },
  { id: "hackathon_poster", label: "Hackathon & Sprint", desc: "Prize pool, tracks & code tournament" },
  { id: "research_poster", label: "Research Poster", desc: "3-column academic scientific paper" },
  { id: "project_exhibition_poster", label: "Project Exhibition", desc: "Student & enterprise prototype showcase" },
  { id: "product_promotion_poster", label: "Product Promotion", desc: "Commercial launch & feature spotlights" },
  { id: "awareness_campaign_poster", label: "Awareness Campaign", desc: "Public health, social & advocacy" },
  { id: "social_announcement_poster", label: "Social Announcement", desc: "Compact Instagram/LinkedIn bulletins" },
];

const INFOGRAPHIC_ARCHETYPES: Array<{ id: LayoutArchetype; label: string; desc: string }> = [
  { id: "infographic_process", label: "Linear Process", desc: "Sequential workflow with milestones" },
  { id: "infographic_timeline", label: "Vertical Timeline", desc: "Chronological roadmap progression" },
  { id: "infographic_comparison", label: "Side-by-Side Comparison", desc: "Direct pros vs cons matrix" },
  { id: "infographic_statistics", label: "Statistical Dashboard", desc: "High-impact percentage & metric cards" },
  { id: "infographic_hierarchy", label: "Organizational Hierarchy", desc: "Top-down structure & tiers" },
  { id: "infographic_cause_effect", label: "Cause & Effect", desc: "Drivers, impacts & root-causes" },
  { id: "infographic_step_by_step", label: "Step-by-Step Guide", desc: "Numbered instructional cards" },
  { id: "infographic_circular_workflow", label: "Circular Lifecycle", desc: "Continuous feedback & agile loop" },
];

const SOCIAL_ARCHETYPES: Array<{ id: LayoutArchetype; label: string; desc: string }> = [
  { id: "social_instagram_post", label: "Instagram Post (1:1)", desc: "Square feed announcement card" },
  { id: "social_instagram_story", label: "Instagram Story (9:16)", desc: "Full-screen vertical story with safe zones" },
  { id: "social_linkedin_post", label: "LinkedIn Graphic", desc: "Thought leadership & corporate update" },
  { id: "social_youtube_thumbnail", label: "YouTube Thumbnail", desc: "High-contrast bold video cover" },
  { id: "social_twitter_graphic", label: "X / Twitter Graphic", desc: "Optimized timeline stream card" },
  { id: "social_whatsapp_status", label: "WhatsApp Status (9:16)", desc: "Vertical broadcast bulletin" },
];

const RESUME_ARCHETYPES: Array<{ id: LayoutArchetype; label: string; desc: string }> = [
  { id: "resume_ats_friendly", label: "ATS-Optimized Resume", desc: "Clean single-column hierarchical layout" },
  { id: "resume_academic_cv", label: "Academic & Research CV", desc: "Scholarly publications & grants" },
  { id: "resume_internship", label: "Student & Internship", desc: "Coursework, academic projects & skills" },
  { id: "resume_creative", label: "Creative Two-Column", desc: "Modern split layout with sidebar badges" },
  { id: "resume_portfolio_profile", label: "Portfolio Profile", desc: "Executive career accomplishments" },
];

const LETTER_ARCHETYPES: Array<{ id: LayoutArchetype; label: string; desc: string }> = [
  { id: "letter_business", label: "B2B Commercial Letter", desc: "Corporate notices & proposals" },
  { id: "letter_job_application", label: "Job Application", desc: "Employment candidacy letter" },
  { id: "letter_cover", label: "Professional Cover Letter", desc: "Compelling career narrative" },
  { id: "letter_leave", label: "Leave Application", desc: "Medical or personal leave request" },
  { id: "letter_permission", label: "Permission Request", desc: "Venue or equipment clearance" },
  { id: "letter_internship_application", label: "Internship Pitch", desc: "Student internship application" },
  { id: "letter_resignation", label: "Formal Resignation", desc: "Respectful notice of departure" },
  { id: "letter_invitation", label: "Dignitary Invitation", desc: "Keynote & speaker invitation" },
  { id: "letter_college_correspondence", label: "College Dean Memo", desc: "Academic correspondence" },
  { id: "letter_complaint", label: "Formal Complaint", desc: "Official escalation of issue" },
];

const DIAGRAM_ARCHETYPES: Array<{ id: LayoutArchetype; label: string; desc: string }> = [
  { id: "diagram_system_architecture", label: "System Architecture", desc: "Multi-tier cloud microservices DAG" },
  { id: "diagram_flowchart", label: "Flowchart & Decision", desc: "Logic branches with decision diamonds" },
  { id: "diagram_uml", label: "UML Class Diagram", desc: "Entity classes, attributes & inheritance" },
  { id: "diagram_er", label: "Entity-Relationship (ER)", desc: "Database tables with primary keys" },
  { id: "diagram_mindmap", label: "Radiating Mind Map", desc: "Central concept with branching nodes" },
  { id: "diagram_decision_tree", label: "Decision Tree", desc: "Probabilistic outcomes & choices" },
  { id: "diagram_process_workflow", label: "Process Workflow", desc: "Lifecycle state transitions" },
];

const CHART_ARCHETYPES: Array<{ id: LayoutArchetype; label: string; desc: string }> = [
  { id: "chart_deep_dive", label: "Analytical Deep Dive", desc: "Dominant primary chart with takeaways" },
  { id: "chart_kpi_dashboard", label: "KPI Metric Board", desc: "Multi-metric cards with trends" },
  { id: "chart_comparison_view", label: "Comparative View", desc: "Cross-categorical benchmarks" },
];

function getArchetypesForDocumentType(type: string) {
  switch (type) {
    case "poster":
      return POSTER_ARCHETYPES;
    case "infographic":
      return INFOGRAPHIC_ARCHETYPES;
    case "social_media":
      return SOCIAL_ARCHETYPES;
    case "resume":
      return RESUME_ARCHETYPES;
    case "letter":
      return LETTER_ARCHETYPES;
    case "diagram":
      return DIAGRAM_ARCHETYPES;
    case "chart":
      return CHART_ARCHETYPES;
    case "presentation":
    default:
      return PRESENTATION_ARCHETYPES;
  }
}

export const SettingsPanel: React.FC = () => {
  const {
    document,
    activePageIndex,
    selectedElementId,
    updateActivePageArchetype,
    updateActivePageTitle,
    updateElement,
    updateDocument,
    isInspectorOpen,
    setInspectorOpen,
    rightPanelTab,
    setRightPanelTab,
    setDocument,
    editScope,
    setEditScope,
    alternatives,
    setAlternatives,
    clarification,
    setClarification,
    undo,
    canUndo,
    qualityReport,
    runQualityAutoRepair,
    setQualityModalOpen,
    addElementToActivePage,
    deleteElementFromActivePage,
  } = useEditorStore();

  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [lastApplied, setLastApplied] = useState<string[] | null>(null);
  const [appliedScope, setAppliedScope] = useState<string | null>(null);

  if (!isInspectorOpen) return null;

  const activePage = document.pages[activePageIndex];
  const selectedElement = activePage?.elements?.find((el) => el.id === selectedElementId);

  // Handle AI natural language modification
  const handleApplyAiEdit = async (customInstruction?: string) => {
    const textToRun = customInstruction || aiPrompt;
    if (!textToRun.trim() || !activePage) return;

    try {
      setIsAiLoading(true);
      setClarification(null);

      const res = await fetch("/api/ai/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentDocument: document,
          pageIndex: activePageIndex,
          instruction: textToRun,
          selectedElementId: selectedElementId || undefined,
          explicitScope: editScope,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to apply AI modification");
      }

      const data = await res.json();

      // If ambiguous, handle clarification
      if (data.clarification && data.clarification.needsClarification) {
        setClarification(data.clarification);
        return;
      }

      // If alternatives requested
      if (data.alternatives && data.alternatives.length > 0) {
        setAlternatives(data.alternatives);
        setLastApplied(["Generated 2 alternative design variations"]);
        setAppliedScope("Alternatives");
        return;
      }

      if (data.updatedDocument) {
        setDocument(data.updatedDocument);
        setAiPrompt("");
        setLastApplied(data.appliedOperations || ["Applied modification"]);
        setAppliedScope(data.scope?.targetName || `Slide ${activePageIndex + 1}`);
      }
    } catch (err: any) {
      console.error("AI Modify error:", err);
      alert(`AI Modification Notice: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyBrandKit = (kit: (typeof PRESET_BRAND_KITS)[0]) => {
    updateDocument((doc) => ({
      ...doc,
      theme: {
        ...doc.theme,
        colors: kit.colorPalette,
        typography: kit.typography,
        styleTokens: kit.styleTokens,
      },
    }));
  };

  const updateThemeColor = (key: keyof ThemeSpec["colors"], color: string) => {
    updateDocument((doc) => ({
      ...doc,
      theme: {
        ...doc.theme,
        colors: {
          ...doc.theme.colors,
          [key]: color,
        },
      },
    }));
  };

  const updateThemeFont = (key: "headingFont" | "bodyFont", font: string) => {
    updateDocument((doc) => ({
      ...doc,
      theme: {
        ...doc.theme,
        typography: {
          ...doc.theme.typography,
          [key]: font,
        },
      },
    }));
  };

  const updateBorderRadius = (radiusPx: number) => {
    updateDocument((doc) => ({
      ...doc,
      theme: {
        ...doc.theme,
        styleTokens: {
          ...doc.theme.styleTokens,
          borderRadiusPx: radiusPx,
        },
      },
    }));
  };

  return (
    <aside className="w-80 h-full border-l border-border/80 bg-card flex flex-col z-20 select-none shadow-sm animate-in slide-in-from-right-2 duration-200">
      {/* Top Tabs */}
      <div className="p-3 border-b border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50 text-xs font-semibold">
          <button
            onClick={() => setRightPanelTab("settings")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs",
              rightPanelTab === "settings"
                ? "bg-background text-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>

          <button
            onClick={() => setRightPanelTab("ai")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs",
              rightPanelTab === "ai"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Studio</span>
          </button>

          <button
            onClick={() => setRightPanelTab("quality")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs",
              rightPanelTab === "quality"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quality</span>
          </button>
        </div>

        <button
          onClick={() => setInspectorOpen(false)}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {rightPanelTab === "settings" ? (
          /* Settings / Inspector Tab */
          <>
            {/* Active Slide Titles */}
            {activePage && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Page Content
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={activePage.title || ""}
                      onChange={(e) => updateActivePageTitle(e.target.value, activePage.subtitle)}
                      className="w-full text-xs px-3 py-2 bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={activePage.subtitle || ""}
                      onChange={(e) => updateActivePageTitle(activePage.title, e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Layout Archetype Selector */}
            {activePage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Layout Archetype
                  </h4>
                  <span className="text-[10px] text-primary font-bold capitalize">
                    {activePage.archetype.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto pr-1">
                  {getArchetypesForDocumentType(document.documentType).map((arch) => {
                    const isSelected = activePage.archetype === arch.id;
                    return (
                      <button
                        key={arch.id}
                        onClick={() => updateActivePageArchetype(arch.id)}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all flex items-center justify-between",
                          isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary/20 shadow-sm"
                            : "border-border/70 bg-background hover:bg-muted/50"
                        )}
                      >
                        <div>
                          <div className="text-xs font-bold text-foreground">{arch.label}</div>
                          <div className="text-[10px] text-muted-foreground">{arch.desc}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Add Element to Slide */}
            {activePage && (
              <div className="space-y-2 p-2.5 rounded-xl border border-border bg-background">
                <div className="text-[11px] font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    <span>Insert Element</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">Slide {activePageIndex + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      addElementToActivePage({
                        type: "text",
                        id: `text-${Date.now()}`,
                        variant: "body",
                        content: "New narrative point or strategic finding.",
                        align: "left",
                      })
                    }
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted text-[11px] font-medium text-foreground transition-colors"
                  >
                    <Type className="w-3 h-3 text-primary" />
                    <span>+ Text Box</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      addElementToActivePage({
                        type: "metric",
                        id: `metric-${Date.now()}`,
                        value: "99.9%",
                        label: "Performance Multiple",
                        trend: "up",
                      })
                    }
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted text-[11px] font-medium text-foreground transition-colors"
                  >
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span>+ KPI Metric</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      addElementToActivePage({
                        type: "media",
                        id: `media-${Date.now()}`,
                        mediaType: "image",
                        src: "",
                        alt: "Visual illustration",
                        fit: "cover",
                        borderRadius: 8,
                      })
                    }
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted text-[11px] font-medium text-foreground transition-colors"
                  >
                    <ImageIcon className="w-3 h-3 text-blue-500" />
                    <span>+ Image Box</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      addElementToActivePage({
                        type: "list",
                        id: `list-${Date.now()}`,
                        listType: "checklist",
                        items: [
                          { id: "it-1", text: "Primary milestone objective" },
                          { id: "it-2", text: "Secondary execution phase" },
                        ],
                      })
                    }
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted text-[11px] font-medium text-foreground transition-colors"
                  >
                    <Check className="w-3 h-3 text-amber-500" />
                    <span>+ Checklist</span>
                  </button>
                </div>
              </div>
            )}

            {/* Selected Element Inspector */}
            {selectedElement && (
              <div className="space-y-3 p-3 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Type className="w-3.5 h-3.5 text-primary" />
                  <span>Selected: {selectedElement.type.toUpperCase()}</span>
                </div>

                {selectedElement.type === "text" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      Text Content
                    </label>
                    <textarea
                      value={(selectedElement as any).content || ""}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      rows={3}
                      className="w-full text-xs px-2.5 py-1.5 bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                {selectedElement.type === "metric" && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Metric Value
                      </label>
                      <input
                        type="text"
                        value={(selectedElement as any).value || ""}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { value: e.target.value } as any)
                        }
                        className="w-full text-xs px-2.5 py-1.5 bg-background rounded-lg border border-border"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={(selectedElement as any).label || ""}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { label: e.target.value } as any)
                        }
                        className="w-full text-xs px-2.5 py-1.5 bg-background rounded-lg border border-border"
                      />
                    </div>
                  </div>
                )}

                {selectedElement.type === "media" && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Image Source URL
                      </label>
                      <input
                        type="text"
                        value={(selectedElement as any).src || (selectedElement as any).url || ""}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { src: e.target.value, url: e.target.value } as any)
                        }
                        placeholder="https://... or data:image/..."
                        className="w-full text-xs px-2.5 py-1.5 bg-background rounded-lg border border-border"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Fit Mode
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(["cover", "contain", "fill"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => updateElement(selectedElement.id, { fit: mode } as any)}
                            className={cn(
                              "py-1 text-[11px] font-medium rounded-md border capitalize transition-colors",
                              ((selectedElement as any).fit || "cover") === mode
                                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                            )}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                        <span>Border Radius</span>
                        <span className="font-mono text-[10px]">{(selectedElement as any).borderRadius || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        step="2"
                        value={(selectedElement as any).borderRadius || 0}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) } as any)
                        }
                        className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={(selectedElement as any).alt || ""}
                        onChange={(e) => updateElement(selectedElement.id, { alt: e.target.value } as any)}
                        placeholder="Visual description"
                        className="w-full text-xs px-2.5 py-1.5 bg-background rounded-lg border border-border"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Caption
                      </label>
                      <input
                        type="text"
                        value={(selectedElement as any).caption || ""}
                        onChange={(e) => updateElement(selectedElement.id, { caption: e.target.value } as any)}
                        placeholder="Overlay caption"
                        className="w-full text-xs px-2.5 py-1.5 bg-background rounded-lg border border-border"
                      />
                    </div>
                  </div>
                )}

                {/* Delete Element Action */}
                <button
                  type="button"
                  onClick={() => deleteElementFromActivePage(selectedElement.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected Element</span>
                </button>
              </div>
            )}

            {/* Brand Kits & Themes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>Brand Style Tokens</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {PRESET_BRAND_KITS.map((kit, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyBrandKit(kit)}
                    className="p-2.5 rounded-xl border border-border bg-background hover:border-primary transition-all text-left space-y-2 group"
                  >
                    <div className="text-[11px] font-bold text-foreground group-hover:text-primary truncate">
                      {kit.name}
                    </div>
                    <div className="flex h-3 rounded-md overflow-hidden border border-border/50">
                      <div className="flex-1" style={{ backgroundColor: kit.colorPalette.primary }} />
                      <div
                        className="flex-1"
                        style={{ backgroundColor: kit.colorPalette.secondary }}
                      />
                      <div className="flex-1" style={{ backgroundColor: kit.colorPalette.accent }} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Color Controls */}
              <div className="space-y-2 pt-2 border-t border-border/70">
                <div className="text-[11px] font-bold text-foreground">Custom Palette Colors</div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { key: "primary", label: "Primary" },
                      { key: "secondary", label: "Secondary" },
                      { key: "accent", label: "Accent" },
                      { key: "background", label: "Background" },
                      { key: "surface", label: "Surface" },
                    ] as const
                  ).map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg border border-border bg-background">
                      <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={document.theme.colors[key] || "#000000"}
                          onChange={(e) => updateThemeColor(key, e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span className="text-[9px] font-mono text-muted-foreground">
                          {document.theme.colors[key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography Controls */}
              <div className="space-y-2 pt-2 border-t border-border/70">
                <div className="text-[11px] font-bold text-foreground">Typography</div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                      Heading Font
                    </label>
                    <select
                      value={document.theme.typography.headingFont}
                      onChange={(e) => updateThemeFont("headingFont", e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-background rounded-lg border border-border text-foreground"
                    >
                      {["Plus Jakarta Sans", "Inter", "Playfair Display", "Merriweather", "Segoe UI", "Montserrat", "Nunito", "Raleway", "IBM Plex Sans"].map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                      Body Font
                    </label>
                    <select
                      value={document.theme.typography.bodyFont}
                      onChange={(e) => updateThemeFont("bodyFont", e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-background rounded-lg border border-border text-foreground"
                    >
                      {["Inter", "Source Sans Pro", "Lato", "Segoe UI", "Nunito", "Open Sans", "Poppins", "IBM Plex Sans"].map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Corner Radius */}
              <div className="space-y-2 pt-2 border-t border-border/70">
                <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                  <span>Card Corner Radius</span>
                  <span className="text-primary font-mono text-[10px]">{document.theme.styleTokens.borderRadiusPx}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="2"
                  value={document.theme.styleTokens.borderRadiusPx}
                  onChange={(e) => updateBorderRadius(parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </>
        ) : rightPanelTab === "ai" ? (
          /* AI Studio Prompt Tab */
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI Slide & Design Director</span>
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Enter any natural language modification request. The engine applies surgical patches without full project regeneration.
              </p>
            </div>

            {/* Scope Target Selector */}
            <div className="p-2.5 rounded-xl border border-border bg-muted/30 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  <span>Target Scope</span>
                </span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                  {editScope}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditScope("auto")}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-left truncate",
                    editScope === "auto"
                      ? "border-primary bg-background text-primary shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  ⚡ Smart Auto
                </button>
                <button
                  type="button"
                  onClick={() => setEditScope("page")}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-left truncate",
                    editScope === "page"
                      ? "border-primary bg-background text-primary shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  📄 Slide {activePageIndex + 1}
                </button>
                <button
                  type="button"
                  onClick={() => setEditScope("element")}
                  disabled={!selectedElementId}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-left truncate disabled:opacity-40",
                    editScope === "element"
                      ? "border-primary bg-background text-primary shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  🔤 {selectedElement ? selectedElement.type : "Element"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditScope("document")}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-left truncate",
                    editScope === "document"
                      ? "border-primary bg-background text-primary shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  🌐 Entire Deck
                </button>
              </div>
            </div>

            {/* Clarification Alert Box */}
            {clarification && (
              <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <HelpCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Clarification Needed</span>
                </div>
                <p className="text-[11px] text-foreground font-medium leading-snug">
                  {clarification.question}
                </p>
                <div className="space-y-1 pt-1">
                  {clarification.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyAiEdit(opt)}
                      className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-background border border-amber-500/30 hover:border-amber-500 text-foreground transition-all hover:shadow-sm"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives Selector Box */}
            {alternatives && alternatives.length > 0 && (
              <div className="p-3 rounded-xl border border-primary/40 bg-primary/5 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>2 Alternative Variations</span>
                  </span>
                  <button
                    onClick={() => setAlternatives(null)}
                    className="text-[10px] text-muted-foreground hover:text-foreground underline"
                  >
                    Dismiss
                  </button>
                </div>

                <div className="space-y-2">
                  {alternatives.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-2.5 rounded-xl border border-border bg-background space-y-1.5 shadow-sm"
                    >
                      <div className="text-xs font-bold text-foreground">{alt.title}</div>
                      <p className="text-[10px] text-muted-foreground">{alt.description}</p>
                      <button
                        onClick={() => {
                          setDocument(alt.document);
                          setAlternatives(null);
                          setLastApplied([`Applied ${alt.title}`]);
                        }}
                        className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-[11px] hover:bg-primary/90 transition-colors"
                      >
                        Apply This Variant
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Applied Success Banner */}
            {lastApplied && (
              <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate text-[11px] font-medium">
                    {appliedScope ? `${appliedScope}: ` : ""}
                    {lastApplied[0]}
                  </span>
                </div>
                {canUndo && (
                  <button
                    onClick={undo}
                    className="flex items-center gap-1 text-[11px] font-bold text-foreground hover:text-primary underline flex-shrink-0"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                )}
              </div>
            )}

            {/* Input Form */}
            <div className="relative">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. 'Convert this slide into a timeline', 'Reduce the text on slide 4', 'Change background to dark blue'..."
                rows={3}
                className="w-full text-xs p-3 bg-background rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
              />
              <button
                onClick={() => handleApplyAiEdit()}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/95 transition-all disabled:opacity-50"
              >
                {isAiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isAiLoading ? "Executing patch..." : "Apply Modification"}</span>
              </button>
            </div>

            {/* Quick Action Presets (All User Example Scenarios) */}
            <div className="space-y-2 pt-3 border-t border-border/60">
              <span className="text-[11px] font-bold text-muted-foreground">Quick Action Presets</span>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {[
                  "Make this more professional",
                  "Reduce the text on slide 4",
                  "Convert this slide into a timeline",
                  "Make the poster more colorful",
                  "Use a Microsoft-inspired design",
                  "Increase the title size",
                  "Improve spacing and alignment",
                  "Change the background to dark blue",
                  "Replace irrelevant icons",
                  "Make the layout more minimal",
                  "Add a comparison table",
                  "Turn this paragraph into three visual steps",
                  "Make all diagrams editable",
                  "Create two alternative versions",
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleApplyAiEdit(action)}
                    disabled={isAiLoading}
                    className="w-full text-left text-[11px] p-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate pr-1 group-hover:text-primary transition-colors">{action}</span>
                    <Wand2 className="w-3 h-3 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Design Quality Tab */
          <div className="space-y-5">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Design Quality Scorecard</span>
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Automated 14-point visual analysis covering readability, spacing, contrast, density, and layout balance.
              </p>
            </div>

            {/* Score Summary Card */}
            {qualityReport && (
              <div className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center font-black text-lg",
                        qualityReport.overallScore >= 85
                          ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                          : qualityReport.overallScore >= 70
                          ? "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                          : "text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10"
                      )}
                    >
                      {qualityReport.overallScore}%
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {qualityReport.overallScore >= 85
                          ? "Production Ready"
                          : qualityReport.overallScore >= 70
                          ? "Good Quality"
                          : "Needs Optimization"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {qualityReport.issues.length} active issue(s)
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setQualityModalOpen(true)}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Expand Quality Inspector"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => runQualityAutoRepair()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/95 transition-all"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Auto-Repair All Issues</span>
                </button>
              </div>
            )}

            {/* 8 Categories Breakdown */}
            {qualityReport && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  8 Dimension Scores
                </span>
                <div className="space-y-1.5">
                  {Object.values(qualityReport.categories).map((cat) => (
                    <div
                      key={cat.category}
                      className="p-2 rounded-xl border border-border/70 bg-background flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-foreground">{cat.label}</span>
                          <span className="font-bold">{cat.score}%</span>
                        </div>
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-300",
                              cat.status === "good"
                                ? "bg-emerald-500"
                                : cat.status === "warning"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            )}
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Auto-Repairs Applied */}
            {qualityReport && qualityReport.repairs.length > 0 && (
              <div className="space-y-2 p-3 rounded-xl border border-primary/20 bg-primary/5">
                <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Repairs Made ({qualityReport.repairs.length})</span>
                </span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {qualityReport.repairs.map((r, rIdx) => (
                    <div key={rIdx} className="text-[11px] text-foreground leading-tight p-1.5 rounded-lg bg-background/80 border border-border/50">
                      {r.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Full Inspector Button */}
            <button
              onClick={() => setQualityModalOpen(true)}
              className="w-full py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Open Full Quality Inspector Modal
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
