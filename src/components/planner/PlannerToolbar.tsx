"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Undo2,
  Redo2,
  Eye,
  Upload,
  SlidersHorizontal,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface PlannerToolbarProps {
  title: string;
  onUpdateTitle: (title: string) => void;
  isSaving?: boolean;
  onSaveDraft?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onOpenPreview: () => void;
  onOpenTemplateModal: () => void;
  onToggleRightPanel: () => void;
  isRightPanelOpen: boolean;
  onApproveAndGenerate: () => void;
  isGenerating?: boolean;
  onNewPresentation?: () => void;
}

export const PlannerToolbar: React.FC<PlannerToolbarProps> = ({
  title,
  onUpdateTitle,
  isSaving = false,
  onSaveDraft,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onOpenPreview,
  onOpenTemplateModal,
  onToggleRightPanel,
  isRightPanelOpen,
  onApproveAndGenerate,
  isGenerating = false,
  onNewPresentation,
}) => {
  return (
    <header className="h-14 border-b border-border/80 bg-card/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between gap-4 select-none z-30 sticky top-0 shadow-sm">
      {/* Left: Navigation & Presentation Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link
          href="/create"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors flex items-center gap-1 text-sm font-medium"
          title="Back to Studio Create"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        {onNewPresentation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewPresentation}
            className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5"
            title="Start a new presentation"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="hidden md:inline">New Presentation</span>
          </Button>
        )}

        <div className="h-4 w-px bg-border/80 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2 min-w-0 max-w-md">
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="font-bold text-sm md:text-base text-foreground bg-transparent border-transparent hover:border-border/60 focus:border-primary focus:bg-muted/30 px-2 py-1 rounded transition-colors truncate w-full outline-none"
            title="Click to rename presentation plan"
          />
          {isSaving ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="hidden md:inline">Saving</span>
            </span>
          ) : (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden md:inline">Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Middle: History & Utility Controls */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        <div className="h-4 w-px bg-border/80 mx-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="h-8 gap-1.5 text-xs font-medium"
          title="Save draft to local storage"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          ) : (
            <Save className="w-3.5 h-3.5 text-primary" />
          )}
          <span>Save Draft</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPreview}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview Blueprint</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenTemplateModal}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Template & Reference</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleRightPanel}
          className={`h-8 w-8 ${isRightPanelOpen ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          title="Toggle Assistant & Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>

        <ThemeToggle />
      </div>

      {/* Right: Primary Action Button */}
      <div className="shrink-0">
        <Button
          onClick={onApproveAndGenerate}
          disabled={isGenerating}
          className="h-9 gap-2 px-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Slides...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Approve & Generate Presentation</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};
