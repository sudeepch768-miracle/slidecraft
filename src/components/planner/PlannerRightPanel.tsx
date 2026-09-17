"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Bot,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Settings,
  HelpCircle,
} from "lucide-react";
import { PresentationPlan } from "@/types/planner";
import { Button } from "@/components/ui/button";

interface PlannerRightPanelProps {
  plan: PresentationPlan;
  onUpdatePlanMeta: (partial: Partial<PresentationPlan>) => void;
  onSendChatInstruction: (instruction: string) => Promise<void>;
  isExecutingInstruction?: boolean;
}

export const PlannerRightPanel: React.FC<PlannerRightPanelProps> = ({
  plan,
  onUpdatePlanMeta,
  onSendChatInstruction,
  isExecutingInstruction = false,
}) => {
  const [activeTab, setActiveTab] = useState<"settings" | "assistant">("settings");
  const [chatInput, setChatInput] = useState("");
  const [instructionLog, setInstructionLog] = useState<string[]>([]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isExecutingInstruction) return;
    const text = chatInput.trim();
    setChatInput("");
    setInstructionLog((prev) => [text, ...prev]);
    await onSendChatInstruction(text);
  };

  const handleChipClick = (text: string) => {
    setChatInput(text);
  };

  return (
    <aside className="w-84 border-l border-border/70 bg-card/70 flex flex-col h-[calc(100vh-4rem)] select-none shrink-0">
      {/* Panel Tab Navigation */}
      <div className="flex items-center border-b border-border/70 p-2 gap-1 bg-background/50">
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === "settings"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("assistant")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === "assistant"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-primary" />
          <span>AI Assistant</span>
        </button>
      </div>

      {/* Tab 1: Presentation Settings */}
      {activeTab === "settings" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Target Audience
            </label>
            <input
              type="text"
              value={plan.targetAudience}
              onChange={(e) => onUpdatePlanMeta({ targetAudience: e.target.value })}
              className="w-full p-2 rounded-lg bg-background border border-border/60 text-foreground text-xs"
              placeholder="e.g. College Students & Researchers"
            />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Tone & Visual Personality
            </label>
            <select
              value={plan.tone}
              onChange={(e) => onUpdatePlanMeta({ tone: e.target.value })}
              className="w-full p-2 rounded-lg bg-background border border-border/60 text-foreground text-xs"
            >
              <option value="Modern Editorial">Modern Editorial</option>
              <option value="Rigorous, empirical, and academic">Academic & Empirical Rigor</option>
              <option value="Corporate Professional">Corporate Executive</option>
              <option value="Minimal Elegant">Minimal & Typographic</option>
              <option value="Dark Futuristic Technology">Dark Technology & AI</option>
              <option value="Colorful Educational">Vibrant & Educational</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Content Density
            </label>
            <select
              value={plan.contentDepth}
              onChange={(e) => onUpdatePlanMeta({ contentDepth: e.target.value as any })}
              className="w-full p-2 rounded-lg bg-background border border-border/60 text-foreground text-xs"
            >
              <option value="concise">Concise (Key Highlights)</option>
              <option value="balanced">Balanced (Overview + Points)</option>
              <option value="detailed">Detailed (Full Sentences & Examples)</option>
              <option value="comprehensive">Comprehensive (Exhaustive Academic)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Citation Standard
            </label>
            <select
              value={plan.citationPreference || "academic_ieee"}
              onChange={(e) => onUpdatePlanMeta({ citationPreference: e.target.value as any })}
              className="w-full p-2 rounded-lg bg-background border border-border/60 text-foreground text-xs"
            >
              <option value="academic_ieee">IEEE Academic Citation Standard</option>
              <option value="apa">APA Academic Citation</option>
              <option value="footnote">Footnote References</option>
              <option value="none">No Citations</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Estimated Duration
            </label>
            <input
              type="text"
              value={plan.estimatedDuration}
              onChange={(e) => onUpdatePlanMeta({ estimatedDuration: e.target.value })}
              className="w-full p-2 rounded-lg bg-background border border-border/60 text-foreground text-xs"
              placeholder="e.g. 20-25 minutes"
            />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Template / Reference Strategy
            </label>
            <select
              value={plan.templateConfig?.mode || "new_design"}
              onChange={(e) =>
                onUpdatePlanMeta({
                  templateConfig: {
                    ...(plan.templateConfig || { mode: "new_design" }),
                    mode: e.target.value as any,
                  },
                })
              }
              className="w-full p-2 rounded-lg bg-background border border-border/60 text-foreground text-xs"
            >
              <option value="new_design">Generate Completely New Design</option>
              <option value="use_template">Use Uploaded PPT Template</option>
              <option value="follow_sample">Follow Sample PPT Style</option>
              <option value="combine">Combine Template & Reference Style</option>
            </select>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
            <span className="font-medium text-foreground">Include Speaker Notes</span>
            <input
              type="checkbox"
              checked={plan.includeSpeakerNotes}
              onChange={(e) => onUpdatePlanMeta({ includeSpeakerNotes: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Tab 2: AI Planner Assistant */}
      {activeTab === "assistant" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-foreground">
              <p className="font-semibold flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI Planner Assistant
              </p>
              <p className="text-muted-foreground text-[11px]">
                Tell me how to refine your presentation blueprint. I can rewrite slides, add clinical benchmarks, adjust academic tone, or restructure topics.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Prompts:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  "Make all slides more academic & rigorous",
                  "Add concrete clinical benchmarks & data",
                  "Add a case study on Mayo Clinic",
                  "Include 2024-2025 FDA AI regulatory status",
                  "Expand limitation & ethical risks section",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="text-[11px] p-1.5 rounded bg-muted hover:bg-muted/80 text-foreground border border-border/50 text-left transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction Activity Log */}
            {instructionLog.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-border/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Recent Instructions Applied:
                </span>
                {instructionLog.map((log, lIdx) => (
                  <div key={lIdx} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assistant Prompt Input */}
          <div className="pt-3 border-t border-border/70 mt-auto">
            <div className="flex items-center gap-1.5 bg-background border border-border/70 rounded-lg p-1.5 focus-within:ring-2 focus-within:ring-primary/40">
              <input
                type="text"
                value={chatInput}
                disabled={isExecutingInstruction}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Instruct assistant..."
                className="flex-1 bg-transparent text-xs text-foreground px-2 outline-none"
              />
              <Button
                size="icon"
                disabled={!chatInput.trim() || isExecutingInstruction}
                onClick={handleSendChat}
                className="h-7 w-7 bg-primary text-primary-foreground shrink-0 rounded-md"
              >
                {isExecutingInstruction ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
