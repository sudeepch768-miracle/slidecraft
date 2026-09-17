"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  List,
  AlignLeft,
  Columns2,
  GitCommit,
  Briefcase,
  BarChart3,
  Quote,
  Layers,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { SlidePlan, SlideContentType } from "@/types/planner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlideOutlinePanelProps {
  slides: SlidePlan[];
  activeSlideId: string;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onMoveSlide: (index: number, direction: "up" | "down") => void;
  onToggleLock: (id: string) => void;
  onRegenerateSection?: (sectionName: string) => void;
  isRegeneratingSection?: boolean;
}

export const getContentTypeIcon = (type: SlideContentType) => {
  switch (type) {
    case "bullets":
      return <List className="w-3.5 h-3.5 text-blue-500" />;
    case "paragraph":
      return <AlignLeft className="w-3.5 h-3.5 text-teal-500" />;
    case "comparison":
      return <Columns2 className="w-3.5 h-3.5 text-purple-500" />;
    case "timeline":
      return <GitCommit className="w-3.5 h-3.5 text-amber-500" />;
    case "case-study":
      return <Briefcase className="w-3.5 h-3.5 text-emerald-500" />;
    case "data":
      return <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />;
    case "quote":
      return <Quote className="w-3.5 h-3.5 text-rose-500" />;
    case "mixed":
    default:
      return <Layers className="w-3.5 h-3.5 text-primary" />;
  }
};

export const SlideOutlinePanel: React.FC<SlideOutlinePanelProps> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  onToggleLock,
  onRegenerateSection,
  isRegeneratingSection = false,
}) => {
  return (
    <aside className="w-80 border-r border-border/70 bg-card/60 flex flex-col h-[calc(100vh-3.5rem)] select-none shrink-0 backdrop-blur-md">
      {/* Panel Header */}
      <div className="p-4 border-b border-border/70 flex items-center justify-between bg-card/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Slide Structure</h3>
        </div>
        <span className="text-xs bg-muted text-muted-foreground font-mono font-bold px-2.5 py-0.5 rounded-full border border-border/60">
          {slides.length} {slides.length === 1 ? "card" : "cards"}
        </span>
      </div>

      {/* Slide Item List with Fluid Layout Reordering */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence initial={false}>
          {slides.map((slide, index) => {
            const slideId = slide.id || `slide-${slide.slideNumber}`;
            const isActive = activeSlideId === slideId;
            const prevSlide = index > 0 ? slides[index - 1] : null;
            const showSectionHeader =
              slide.section &&
              (!prevSlide || prevSlide.section !== slide.section);

            return (
              <React.Fragment key={slideId}>
                {showSectionHeader && (
                  <div className="flex items-center justify-between pt-2.5 pb-1 px-1 border-b border-border/40 mt-3 first:mt-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground truncate max-w-[150px]">
                      {slide.section}
                    </span>
                    {onRegenerateSection && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRegenerateSection(slide.section!);
                        }}
                        disabled={isRegeneratingSection}
                        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors py-0.5 px-1.5 rounded-lg hover:bg-muted/80 disabled:opacity-40"
                        title={`Regenerate unlocked slides in section "${slide.section}"`}
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isRegeneratingSection ? "animate-spin text-primary" : ""}`} />
                        <span>Regen Section</span>
                      </button>
                    )}
                  </div>
                )}

                <motion.div
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileHover={{ y: -1 }}
                  onClick={() => onSelectSlide(slideId)}
                  className={cn(
                    "group relative flex flex-col gap-1.5 p-3 rounded-xl border transition-all cursor-pointer gamma-card-hover",
                    isActive
                      ? "bg-primary/10 border-primary/70 shadow-sm ring-1 ring-primary/30"
                      : "bg-background/80 border-border/60 hover:bg-muted/60 hover:border-border"
                  )}
                >
                  {/* Top Row: Index Badge, Type, Title, and Lock */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "text-xs font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="shrink-0 p-1 rounded-md bg-muted/40" title={`Type: ${slide.content.type}`}>
                        {getContentTypeIcon(slide.content.type)}
                      </div>
                      <h4 className="font-semibold text-xs text-foreground truncate max-w-[135px]">
                        {slide.title || "Untitled Slide"}
                      </h4>
                    </div>

                    {/* Quick Slide Lock */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(slideId);
                        }}
                        className={cn(
                          "p-1 rounded-lg transition-colors",
                          slide.isLocked
                            ? "text-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        title={slide.isLocked ? "Slide locked from AI edits" : "Lock slide"}
                      >
                        {slide.isLocked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Takeaway Snippet */}
                  <p className="text-[11px] text-muted-foreground line-clamp-1 pl-7">
                    {slide.keyMessage || "No key takeaway set"}
                  </p>

                  {/* Action Buttons on Hover */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onMoveSlide(index, "up");
                        }}
                        className="h-5 w-5 text-muted-foreground hover:text-foreground disabled:opacity-20 rounded-md"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={index === slides.length - 1}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onMoveSlide(index, "down");
                        }}
                        className="h-5 w-5 text-muted-foreground hover:text-foreground disabled:opacity-20 rounded-md"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onDuplicateSlide(slideId);
                        }}
                        className="h-5 w-5 text-muted-foreground hover:text-foreground rounded-md"
                        title="Duplicate Slide"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={slides.length <= 1}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onDeleteSlide(slideId);
                        }}
                        className="h-5 w-5 text-muted-foreground hover:text-rose-500 disabled:opacity-20 rounded-md"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Panel Actions */}
      <div className="p-3 border-t border-border/70 bg-card/80 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddSlide}
          className="w-full gap-2 text-xs font-semibold h-8 rounded-xl border-border hover:border-primary/50 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          Add Slide
        </Button>
      </div>
    </aside>
  );
};
