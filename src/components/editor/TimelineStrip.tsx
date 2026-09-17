"use client";

import React from "react";
import { useEditorStore } from "@/store/editor-store";
import { Plus, Trash2, Copy, MoveLeft, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const TimelineStrip: React.FC = () => {
  const {
    document,
    activePageIndex,
    setActivePage,
    addPage,
    deletePage,
    updateDocument,
    reorderPages,
  } = useEditorStore();

  const handleDuplicate = (index: number) => {
    const pageToDup = document.pages[index];
    if (!pageToDup) return;

    const newPage = {
      ...pageToDup,
      id: `page-${Math.random().toString(36).substring(2, 9)}`,
      pageNumber: document.pages.length + 1,
      title: `${pageToDup.title} (Copy)`,
    };

    updateDocument((doc) => ({
      ...doc,
      pages: [...doc.pages, newPage],
    }));
    setActivePage(document.pages.length);
  };

  return (
    <div className="h-28 w-full border-t border-border/80 bg-background/90 backdrop-blur px-4 flex items-center gap-3 overflow-x-auto select-none z-20">
      {document.pages.map((page, idx) => {
        const isActive = idx === activePageIndex;

        return (
          <div
            key={page.id}
            onClick={() => setActivePage(idx)}
            className={cn(
              "group relative flex-shrink-0 w-36 h-20 rounded-xl border-2 transition-all cursor-pointer p-2 flex flex-col justify-between overflow-hidden shadow-sm",
              isActive
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-105"
                : "border-border/80 bg-card hover:border-primary/50"
            )}
          >
            {/* Slide Index Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {idx + 1}
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase truncate max-w-[80px]">
                {page.archetype.replace(/_/g, " ")}
              </span>
            </div>

            {/* Slide Title snippet */}
            <p className="text-[11px] font-bold text-foreground truncate mt-1">{page.title}</p>

            {/* Quick Actions Hover Overlay */}
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
              {idx > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderPages(idx, idx - 1);
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Move Left"
                >
                  <MoveLeft className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate(idx);
                }}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {document.pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePage(idx);
                  }}
                  className="p-1 rounded hover:bg-rose-100 text-rose-600 dark:hover:bg-rose-950"
                  title="Delete Slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {idx < document.pages.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderPages(idx, idx + 1);
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Move Right"
                >
                  <MoveRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Add New Slide Button */}
      <button
        onClick={() => addPage("three_card_grid")}
        className="flex-shrink-0 w-28 h-20 rounded-xl border-2 border-dashed border-border/80 hover:border-primary/60 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all"
      >
        <Plus className="w-5 h-5" />
        <span className="text-[11px] font-semibold">Add Slide</span>
      </button>
    </div>
  );
};
