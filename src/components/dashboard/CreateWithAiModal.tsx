"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  Upload,
  Presentation,
  Globe,
  ArrowRight,
  X,
  Check,
  ChevronDown,
  Layers,
  HelpCircle,
  FileSpreadsheet,
  Link2,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateWithAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "generate" | "paste" | "import";
}

const FORMATS = [
  { id: "presentation", label: "Presentation", icon: Presentation, defaultCards: 10, ratio: "16:9" },
  { id: "document", label: "Document", icon: FileText, defaultCards: 6, ratio: "A4" },
  { id: "webpage", label: "Webpage", icon: Globe, defaultCards: 5, ratio: "Fluid" },
];

const SUGGESTED_PROMPTS = [
  "Series A Pitch Deck for an autonomous AI robotics startup",
  "Company All-Hands Q3 OKRs and Financial Momentum",
  "Healthcare AI Clinical Diagnostics Strategy 2026",
  "Modern Architecture Microservices & Event Bus DAG",
  "Product Launch Go-To-Market Plan for B2B SaaS",
  "Employee Onboarding & Team Operating Principles",
];

export const CreateWithAiModal: React.FC<CreateWithAiModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "generate",
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"generate" | "paste" | "import">(defaultTab);
  const [format, setFormat] = useState("presentation");
  const [prompt, setPrompt] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [cardCount, setCardCount] = useState(10);
  const [textAmount, setTextAmount] = useState<"brief" | "medium" | "detailed">("medium");
  const [language, setLanguage] = useState("English (US)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsSubmitting(true);

    if (format === "presentation") {
      const params = new URLSearchParams({
        prompt: prompt.trim(),
        slideCount: String(cardCount),
        depth: textAmount === "brief" ? "concise" : textAmount === "detailed" ? "in_depth" : "standard",
      });
      router.push(`/planner?${params.toString()}`);
    } else {
      const params = new URLSearchParams({
        prompt: prompt.trim(),
        format,
        pageCount: String(cardCount),
      });
      router.push(`/create?${params.toString()}`);
    }
  };

  const handlePasteContinue = () => {
    if (!pasteText.trim()) return;
    setIsSubmitting(true);

    const firstLine = pasteText.trim().split("\n")[0].slice(0, 80);
    const params = new URLSearchParams({
      prompt: firstLine,
      uploadedSource: pasteText.trim(),
      slideCount: String(cardCount),
      format,
    });
    router.push(`/planner?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gamma-gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Create with AI
                </h2>
                <p className="text-xs text-muted-foreground">
                  Transform any idea, rough notes, or file into a beautiful deck in seconds
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Gamma Mode Tabs */}
          <div className="flex border-b border-border/70 px-6 bg-muted/20">
            {[
              { id: "generate", label: "Generate", icon: Sparkles, desc: "From a one-line prompt" },
              { id: "paste", label: "Paste in text", icon: FileText, desc: "From notes or outline" },
              { id: "import", label: "Import file or URL", icon: Upload, desc: "PPTX, Word, PDF" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 py-3 px-3 text-left relative flex items-center gap-2.5 text-xs font-semibold transition-colors border-b-2",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div>
                    <div>{tab.label}</div>
                    <div className="text-[10px] font-normal opacity-60 hidden sm:block">
                      {tab.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Format Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                What would you like to create?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {FORMATS.map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = format === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => {
                        setFormat(fmt.id);
                        setCardCount(fmt.defaultCards);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 text-foreground shadow-xs ring-1 ring-primary"
                          : "border-border hover:border-border/80 bg-card hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 mb-1.5",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="text-xs font-semibold">{fmt.label}</span>
                      <span className="text-[10px] opacity-60 mt-0.5">{fmt.ratio}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: GENERATE */}
            {activeTab === "generate" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Topic or prompt
                  </label>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. A comprehensive investor pitch deck for our AI-driven supply chain platform, including market opportunity, product demo, unit economics, and 2026 milestones..."
                    className="w-full text-sm bg-muted/30 border border-border/80 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/60 transition-all resize-none"
                  />
                </div>

                {/* Quick Inspiration Chips */}
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                    Ideas to get started:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_PROMPTS.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(s)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted border border-border/60 text-muted-foreground hover:text-foreground transition-colors text-left truncate max-w-full"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Settings Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/60">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Cards / Slides
                    </label>
                    <select
                      value={cardCount}
                      onChange={(e) => setCardCount(Number(e.target.value))}
                      className="w-full text-xs bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {[5, 8, 10, 12, 15].map((n) => (
                        <option key={n} value={n}>
                          {n} Cards
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Amount of text
                    </label>
                    <select
                      value={textAmount}
                      onChange={(e) => setTextAmount(e.target.value as any)}
                      className="w-full text-xs bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="brief">Brief & Scannable</option>
                      <option value="medium">Balanced (Standard)</option>
                      <option value="detailed">Detailed & In-Depth</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full text-xs bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="English (US)">English (US)</option>
                      <option value="English (UK)">English (UK)</option>
                      <option value="Spanish">Español</option>
                      <option value="French">Français</option>
                      <option value="German">Deutsch</option>
                      <option value="Japanese">日本語</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PASTE IN TEXT */}
            {activeTab === "paste" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Paste notes, markdown, or rough transcript
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {pasteText.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste an executive summary, meeting notes, bullet points, or document draft here. Gamma's AI will parse the structure, design cards, and extract key metrics..."
                    className="w-full text-sm bg-muted/30 border border-border/80 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/60 transition-all font-mono text-xs leading-relaxed resize-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/60">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>Auto-split into ~{Math.max(5, Math.min(15, Math.ceil(pasteText.split("\n\n").length)))} cards based on headings</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: IMPORT */}
            {activeTab === "import" && (
              <div className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    // Handle dropped file
                  }}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer",
                    dragActive
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/30"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Drag and drop your file here
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Supports PowerPoint (.pptx), Word (.docx), PDF (.pdf), or Markdown (.md)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold text-foreground shadow-xs hover:bg-muted transition-colors"
                  >
                    Browse Files
                  </button>
                </div>

                {/* URL Import */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Or import from a Web URL
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        placeholder="https://example.com/article-or-report"
                        className="w-full text-xs bg-muted/30 border border-border rounded-xl pl-9 pr-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!importUrl.trim()}
                      className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground disabled:opacity-40 transition-colors"
                    >
                      Import URL
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-border/70 flex items-center justify-between bg-muted/10">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>

            {activeTab === "generate" ? (
              <button
                type="button"
                disabled={!prompt.trim() || isSubmitting}
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gamma-btn-primary font-bold text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? "Blueprinting..." : "Continue to Outline"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : activeTab === "paste" ? (
              <button
                type="button"
                disabled={!pasteText.trim() || isSubmitting}
                onClick={handlePasteContinue}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gamma-btn-primary font-bold text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{isSubmitting ? "Converting..." : "Transform into Cards"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!importUrl.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gamma-btn-primary font-bold text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Import & Enhance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
