"use client";

import React, { useRef, useState, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { PageRenderer } from "./PageRenderer";
import { CANVAS_PRESETS } from "@/types/document-spec";
import { cn } from "@/lib/utils";

export const Canvas: React.FC = () => {
  const {
    document,
    activePageIndex,
    selectedElementId,
    setSelectedElement,
    updateElement,
    updateActivePageTitle,
    zoomLevel,
    projectId,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const activePage = document.pages[activePageIndex] || document.pages[0];
  const aspectRatio = document.canvas.aspectRatio;

  // Recalculate dimensions via ResizeObserver whenever container resizes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setContainerDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(container);
    window.addEventListener("resize", updateDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Numerical aspect ratio calculator
  const getNumericRatio = () => {
    switch (aspectRatio) {
      case "16:9":
        return 16 / 9;
      case "4:3":
        return 4 / 3;
      case "1:1":
        return 1;
      case "9:16":
        return 9 / 16;
      case "4:5":
        return 4 / 5;
      case "A4_portrait":
      case "A3_portrait":
      case "A2_portrait":
      case "A1_portrait":
        return 1 / 1.4142;
      case "US_letter":
        return 8.5 / 11;
      case "A4_landscape":
      case "A3_landscape":
        return 1.4142;
      default:
        return 16 / 9;
    }
  };

  // Compute exact bounded dimensions maintaining aspect ratio inside viewport container
  const ratio = getNumericRatio();
  const paddingX = 56;
  const paddingY = 56;
  const availW = Math.max(320, (containerDimensions.width || 1200) - paddingX);
  const availH = Math.max(240, (containerDimensions.height || 750) - paddingY);

  let baseWidth = availW;
  let baseHeight = baseWidth / ratio;

  if (baseHeight > availH) {
    baseHeight = availH;
    baseWidth = baseHeight * ratio;
  }

  // Cap max base width at 1280px for crisp, controlled presentation typography
  if (baseWidth > 1280) {
    baseWidth = 1280;
    baseHeight = baseWidth / ratio;
  }

  const scaledWidth = Math.round(baseWidth * (zoomLevel / 100));
  const scaledHeight = Math.round(baseHeight * (zoomLevel / 100));

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full overflow-auto bg-canvas-dots bg-muted/20 p-4 md:p-8 flex relative select-none"
      onClick={() => setSelectedElement(null)}
    >
      {/* Ambient radial glow centered behind active slide */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0">
        <div className="w-[800px] h-[500px] gamma-glow-subtle rounded-full opacity-60 dark:opacity-40 blur-3xl" />
      </div>

      {/* Centered Floating Canvas Viewport (Gamma Framing) */}
      <div
        className="m-auto flex items-center justify-center transition-all duration-200 ease-out z-10 py-4"
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
        }}
      >
        <div
          id="slidecraft-canvas-node"
          className="w-full h-full shadow-2xl rounded-3xl overflow-hidden border border-border/80 bg-background relative flex flex-col transition-shadow duration-300 hover:shadow-primary/5"
          onClick={(e) => e.stopPropagation()}
        >
          {activePage && (
            <PageRenderer
              page={activePage}
              theme={document.theme}
              totalSlides={document.pages.length}
              selectedElementId={selectedElementId}
              visualDirection={document.visualDirection}
              aspectRatio={document.canvas.aspectRatio}
              documentType={document.documentType}
              projectId={projectId || document.id}
              documentId={document.id}
              onSelectElement={(id) => setSelectedElement(id)}
              onUpdateText={(id, content) => updateElement(id, { content })}
              onUpdateTitle={(title) => updateActivePageTitle(title, activePage.subtitle)}
              onUpdateSubtitle={(subtitle) => updateActivePageTitle(activePage.title, subtitle)}
              onUpdateBadge={(badge) => {
                const { document: doc, setDocument } = useEditorStore.getState();
                const pages = [...doc.pages];
                if (pages[activePageIndex]) {
                  pages[activePageIndex] = { ...pages[activePageIndex], badge };
                  setDocument({ ...doc, pages });
                }
              }}
              onUpdateElement={(id, patch) => updateElement(id, patch)}
            />
          )}

          {/* Social Media Safe-Zone Guide */}
          {document.documentType === "social_media" && (
            <div
              className="absolute inset-[8%] border-2 border-dashed border-sky-400/40 pointer-events-none rounded-2xl flex flex-col justify-between p-3 z-10"
              title="Social Media Safe Zone"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/30">
                  Safe Zone Top
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/30">
                  Safe Zone Bottom
                </span>
              </div>
            </div>
          )}

          {/* Poster 3mm Print Bleed Guide */}
          {document.documentType === "poster" && (
            <div
              className="absolute inset-[3mm] border border-dashed border-rose-400/50 pointer-events-none flex items-start justify-between p-2 z-10"
              title="3mm Print Bleed"
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                3mm Print Bleed
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                Trim
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
