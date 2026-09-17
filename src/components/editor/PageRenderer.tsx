"use client";

import React from "react";
import { PageSpec, ThemeSpec, ContentElement, AspectRatio, DocumentType } from "@/types/document-spec";
import { TextBlock } from "./Elements/TextBlock";
import { MetricCard } from "./Elements/MetricCard";
import { ChartBlock } from "./Elements/ChartBlock";
import { DiagramBlock } from "./Elements/DiagramBlock";
import { TableBlock } from "./Elements/TableBlock";
import { ListBlock } from "./Elements/ListBlock";
import { QRCodeBlock } from "./Elements/QRCodeBlock";
import { EventDetailsBlock } from "./Elements/EventDetailsBlock";
import { SpeakerCardBlock } from "./Elements/SpeakerCardBlock";
import { OrganizerInfoBlock } from "./Elements/OrganizerInfoBlock";
import { CtaBadgeBlock } from "./Elements/CtaBadgeBlock";
import { SponsorGridBlock } from "./Elements/SponsorGridBlock";
import { InfographicWorkflowBlock } from "./Elements/InfographicWorkflowBlock";
import { SocialGraphicOverlayBlock } from "./Elements/SocialGraphicOverlayBlock";
import { ResumeProfileBlock } from "./Elements/ResumeProfileBlock";
import { LetterDocumentBlock } from "./Elements/LetterDocumentBlock";
import { MediaBlock } from "./Elements/MediaBlock";
import { SlideBackgroundLayer } from "./SlideBackgroundLayer";
import { VisualDirection } from "@/types/visual-direction";
import { visualDirectionTracer } from "@/lib/ai/visual-direction-tracer";
import { cn, sanitizeBadge } from "@/lib/utils";


interface PageRendererProps {
  page: PageSpec;
  theme: ThemeSpec;
  totalSlides?: number;
  selectedElementId?: string | null;
  onSelectElement?: (id: string) => void;
  onUpdateText?: (id: string, text: string) => void;
  onUpdateTitle?: (title: string) => void;
  onUpdateSubtitle?: (subtitle: string) => void;
  onUpdateBadge?: (badge: string) => void;
  onUpdateElement?: (id: string, patch: Partial<ContentElement>) => void;
  scale?: number;
  className?: string;
  visualDirection?: VisualDirection;
  aspectRatio?: AspectRatio;
  documentType?: DocumentType;
  projectId?: string;
  documentId?: string;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  page,
  theme,
  totalSlides,
  selectedElementId,
  onSelectElement,
  onUpdateText,
  onUpdateTitle,
  onUpdateSubtitle,
  onUpdateBadge,
  onUpdateElement,
  scale = 1,
  className,
  visualDirection,
  aspectRatio = "16:9",
  documentType = "presentation",
  projectId,
  documentId,
}) => {
  const bg = page.backgroundOverride || theme.colors.background;
  const displayBadge = sanitizeBadge(page.badge, page.pageNumber === 1 ? "EXECUTIVE BRIEFING" : undefined);

  // Record PAGE_RENDERED runtime trace if context is available
  React.useEffect(() => {
    const vd = visualDirection;
    if (vd && projectId && documentId) {
      visualDirectionTracer.recordTrace({
        projectId,
        documentId,
        visualDirectionId: vd.id,
        variationSeed: vd.variationSeed,
        styleFamily: vd.styleFamily,
        stage: "PAGE_RENDERED",
        generatedAtStage: "PageRenderer",
        consumedBy: `Slide-${page.pageNumber}`,
        metadata: {
          pageNumber: page.pageNumber,
          archetype: page.archetype,
        },
      });
    }
  }, [visualDirection, projectId, documentId, page.pageNumber, page.archetype]);

  // Derived orientation helpers from aspect ratio
  const isLandscape =
    aspectRatio === "16:9" ||
    aspectRatio === "4:3" ||
    aspectRatio === "A4_landscape" ||
    aspectRatio === "A3_landscape";
  const isPortrait =
    aspectRatio === "9:16" ||
    aspectRatio === "4:5" ||
    aspectRatio === "A4_portrait" ||
    aspectRatio === "A3_portrait" ||
    aspectRatio === "A2_portrait" ||
    aspectRatio === "A1_portrait" ||
    aspectRatio === "US_letter";
  const isSquare = aspectRatio === "1:1";

  // Render individual element dispatcher
  const renderElement = (element: ContentElement) => {
    const isSelected = selectedElementId === element.id;

    switch (element.type) {
      case "text":
        return (
          <TextBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
            onUpdate={(val) => onUpdateText?.(element.id, val)}
          />
        );
      case "metric":
        return (
          <MetricCard
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
            onUpdate={(patch) => onUpdateElement?.(element.id, patch)}
          />
        );
      case "list":
        return (
          <ListBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
            onUpdate={(patch) => onUpdateElement?.(element.id, patch)}
          />
        );
      case "chart":
        return (
          <ChartBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "diagram":
        return (
          <DiagramBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "table":
        return (
          <TableBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "list":
        return (
          <ListBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "shape":
        return (
          <div
            key={element.id}
            className="w-full h-2 rounded-full my-4"
            style={{ backgroundColor: theme.colors.border }}
          />
        );
      case "qrcode":
        return (
          <QRCodeBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "event_details":
        return (
          <EventDetailsBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "speaker_card":
        return (
          <SpeakerCardBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "organizer_info":
        return (
          <OrganizerInfoBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "cta_badge":
        return (
          <CtaBadgeBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "sponsor_grid":
        return (
          <SponsorGridBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "infographic_workflow":
        return (
          <InfographicWorkflowBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
            isLandscape={isLandscape}
          />
        );
      case "social_overlay":
        return (
          <SocialGraphicOverlayBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "resume_block":
        return (
          <ResumeProfileBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "letter_block":
        return (
          <LetterDocumentBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
          />
        );
      case "media":
        return (
          <MediaBlock
            key={element.id}
            element={element}
            theme={theme}
            isSelected={isSelected}
            onSelect={() => onSelectElement?.(element.id)}
            slideId={page.id}
          />
        );
      default:
        return null;
    }
  };

  // Header banner for non-hero slides with inline editing
  const renderHeader = () => (
    <div className={cn("flex flex-col group", isLandscape ? "gap-1 mb-2 sm:mb-3" : "gap-1.5 mb-4 md:mb-6")}>
      {displayBadge && (
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateBadge?.(e.currentTarget.textContent || "")}
          className={cn(
            "font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full w-fit outline-none focus:ring-1 focus:ring-primary/40 cursor-text",
            isLandscape ? "text-[9px] sm:text-[10px]" : "text-[10px] md:text-xs"
          )}
          style={{
            backgroundColor: `${theme.colors.secondary}15`,
            color: theme.colors.secondary,
            fontFamily: theme.typography.bodyFont,
          }}
        >
          {displayBadge}
        </span>
      )}
      <h2
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdateTitle?.(e.currentTarget.textContent || page.title)}
        className={cn(
          "font-extrabold tracking-tight outline-none focus:bg-primary/5 rounded px-1 -mx-1 cursor-text",
          isLandscape ? "text-xl sm:text-2xl" : "text-2xl md:text-3xl"
        )}
        style={{
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.headingFont,
        }}
      >
        {page.title}
      </h2>
      {(page.subtitle || onUpdateSubtitle) && (
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateSubtitle?.(e.currentTarget.textContent || "")}
          className={cn(
            "leading-snug opacity-90 outline-none focus:bg-primary/5 rounded px-1 -mx-1 cursor-text",
            isLandscape ? "text-xs sm:text-sm line-clamp-2" : "text-sm md:text-base"
          )}
          style={{
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.bodyFont,
          }}
        >
          {page.subtitle || "Add subtitle..."}
        </p>
      )}
    </div>
  );

  const isPoster = page.archetype.includes("poster");
  const isResume = page.archetype.startsWith("resume");
  const isLetter = page.archetype.startsWith("letter");
  const isSocial = page.archetype.startsWith("social");
  const isInfographic = page.archetype.startsWith("infographic");
  const isDiagram = page.archetype.startsWith("diagram");
  const isChart = page.archetype.startsWith("chart");
  const isPresentation =
    !isPoster && !isResume && !isLetter && !isSocial && !isInfographic && !isDiagram && !isChart;

  // Poster element groupings
  const eventDetailsElement = page.elements.find((e) => e.type === "event_details");
  const metricElements = page.elements.filter((e) => e.type === "metric");
  const speakerElements = page.elements.filter((e) => e.type === "speaker_card");
  const ctaElement = page.elements.find((e) => e.type === "cta_badge");
  const qrElement = page.elements.find((e) => e.type === "qrcode");
  const sponsorElement = page.elements.find((e) => e.type === "sponsor_grid");
  const organizerElement = page.elements.find((e) => e.type === "organizer_info");

  const otherElements = page.elements.filter(
    (e) =>
      e.id !== "poster-title" &&
      e.id !== "poster-subtitle" &&
      e.type !== "event_details" &&
      e.type !== "metric" &&
      e.type !== "speaker_card" &&
      e.type !== "cta_badge" &&
      e.type !== "qrcode" &&
      e.type !== "sponsor_grid" &&
      e.type !== "organizer_info"
  );

  // Presentation & Common element groupings
  const mediaElement = page.elements.find((e) => e.type === "media");
  const chartElement = page.elements.find((e) => e.type === "chart");
  const listElement = page.elements.find((e) => e.type === "list");
  const quoteElement = page.elements.find(
    (e): e is Extract<ContentElement, { type: "text" }> =>
      e.type === "text" && (e as any).variant === "quote"
  );

  const nonHeaderElements = page.elements.filter(
    (e) => e.id !== "poster-title" && e.id !== "poster-subtitle"
  );
  const third = Math.max(1, Math.ceil(nonHeaderElements.length / 3));
  const col1Elements = nonHeaderElements.slice(0, third);
  const col2Elements = nonHeaderElements.slice(third, third * 2);
  const col3Elements = nonHeaderElements.slice(third * 2);

  // Auto-fit containment: detect if content scrollHeight exceeds available height, scale cleanly
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentScale, setContentScale] = React.useState<number>(1);

  React.useLayoutEffect(() => {
    const cont = containerRef.current;
    const content = contentRef.current;
    if (!cont || !content) return;

    const computeFit = () => {
      const availH = cont.clientHeight;
      const availW = cont.clientWidth;
      if (availH <= 0 || availW <= 0) return;

      const naturalH = content.scrollHeight;
      const naturalW = content.scrollWidth;

      if (naturalH > availH || naturalW > availW) {
        const scaleH = availH / naturalH;
        const scaleW = availW / naturalW;
        const factor = Math.min(scaleH, scaleW);
        if (factor < 0.999) {
          const nextScale = Math.max(0.6, Number((factor * 0.97).toFixed(2)));
          if (Math.abs(nextScale - contentScale) > 0.01) {
            setContentScale(nextScale);
          }
          return;
        }
      }
      if (contentScale !== 1) {
        setContentScale(1);
      }
    };

    computeFit();
    const ro = new ResizeObserver(() => computeFit());
    ro.observe(cont);
    ro.observe(content);
    return () => ro.disconnect();
  }, [page, theme, aspectRatio, visualDirection, contentScale]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full flex flex-col select-none overflow-hidden transition-colors shadow-2xl",
        isPoster
          ? isLandscape
            ? "p-3 sm:p-4 md:p-5"
            : isPortrait
            ? "p-2.5 sm:p-3.5"
            : "p-3.5 sm:p-4"
          : isResume
          ? isLandscape
            ? "p-3 sm:p-4"
            : "p-4 sm:p-6"
          : isSocial
          ? isLandscape
            ? "p-3 sm:p-4"
            : "p-4 sm:p-5"
          : isLandscape
          ? "p-4 sm:p-6 lg:p-7"
          : "p-5 sm:p-7 md:p-8",
        className
      )}
      style={{
        backgroundColor: bg,
        borderRadius: `${(theme.styleTokens?.borderRadiusPx ?? 12) * 1.5}px`,
      }}
    >
      {/* Dynamic Background Layer (Gradient, Ambient Glow, Patterns, Shapes, Image) */}
      <SlideBackgroundLayer
        backgroundSpec={
          page.backgroundSpec ||
          (page.background
            ? {
                type: page.background.type === "gradient" ? "gradient" : "solid",
                color: page.background.value,
                glow: page.background.glow as any,
                decorativeShapes: page.background.decorativeShapes as any,
              }
            : undefined)
        }
        visualDirection={visualDirection}
        theme={theme}
        bgOverride={page.backgroundOverride || (page.background?.type === "solid" ? page.background.value : undefined)}
      />

      {/* Auto-Fit Scaled Content Frame */}
      <div
        ref={contentRef}
        className="relative z-10 w-full h-full flex-1 flex flex-col min-h-0"
        style={
          contentScale < 1
            ? {
                transform: `scale(${contentScale})`,
                transformOrigin: "center center",
              }
            : undefined
        }
      >

      {/* 1. Poster: Research Poster (3-Column Academic) */}
      {isPoster && page.archetype === "research_poster" && (
        <div className="flex-1 flex flex-col justify-between gap-4 overflow-y-auto">
          {/* Research Poster Header */}
          <div className="border-b-2 pb-3 flex flex-col gap-1.5" style={{ borderColor: theme.colors.border }}>
            {displayBadge && (
              <span
                className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded w-fit"
                style={{ backgroundColor: `${theme.colors.secondary}18`, color: theme.colors.secondary }}
              >
                {displayBadge}
              </span>
            )}
            <h1
              className="text-2xl md:text-4xl font-black tracking-tight"
              style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
            >
              {page.title}
            </h1>
            {page.subtitle && (
              <p
                className="text-sm md:text-base font-medium opacity-80"
                style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}
              >
                {page.subtitle}
              </p>
            )}
          </div>

          {/* 3-Column Academic Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-start">
            <div className="flex flex-col gap-3">{col1Elements.map(renderElement)}</div>
            <div className="flex flex-col gap-3">{col2Elements.map(renderElement)}</div>
            <div className="flex flex-col gap-3">{col3Elements.map(renderElement)}</div>
          </div>
        </div>
      )}

      {/* 2. Poster: Creative / Event Poster Layout (3-Tier Anti-Overflow Hybrid Grid) */}
      {isPoster && page.archetype !== "research_poster" && (
        <div className="flex-1 flex flex-col justify-between gap-2 sm:gap-2.5 w-full h-full z-10 min-h-0">
          {/* Tier 1: Top Hero Section */}
          <div className={cn(
            "flex flex-col items-center text-center max-w-3xl mx-auto w-full shrink-0",
            isLandscape ? "gap-1 pt-0.5" : "gap-1.5 pt-1"
          )}>
            {displayBadge && (
              <span
                className={cn(
                  "font-black uppercase tracking-widest rounded-full shadow-sm",
                  isLandscape ? "text-[9px] px-2.5 py-0.5" : "text-[10px] px-3 py-1"
                )}
                style={{
                  backgroundColor: `${theme.colors.secondary}15`,
                  color: theme.colors.secondary,
                  fontFamily: theme.typography.headingFont,
                }}
              >
                {displayBadge}
              </span>
            )}
            <h1
              className={cn(
                "font-black tracking-tight leading-tight",
                isLandscape ? "text-xl sm:text-2xl lg:text-3xl" : "text-2xl sm:text-3xl lg:text-4xl"
              )}
              style={{
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.headingFont,
              }}
            >
              {page.title}
            </h1>
            {page.subtitle && (
              <p
                className={cn(
                  "font-medium opacity-90 line-clamp-2",
                  isLandscape ? "text-xs max-w-lg" : "text-xs sm:text-sm max-w-xl"
                )}
                style={{
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.bodyFont,
                }}
              >
                {page.subtitle}
              </p>
            )}
          </div>

          {/* Tier 2: 2-Column Responsive Body Grid */}
          <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 min-h-0 items-start py-0.5 sm:py-1">
            {/* Left Column: Event details & other items */}
            <div className="flex flex-col gap-2 min-h-0">
              {eventDetailsElement && renderElement(eventDetailsElement)}
              {speakerElements.length === 0 && metricElements.length > 0 && (
                <div className={cn(
                  "grid gap-2",
                  isLandscape ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"
                )}>
                  {metricElements.map(renderElement)}
                </div>
              )}
              {otherElements.map(renderElement)}
            </div>

            {/* Right Column: Speakers or Highlights & Sponsors */}
            <div className="flex flex-col gap-2 min-h-0">
              {speakerElements.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                    Featured Speakers
                  </span>
                  <div className={cn(
                    "grid gap-2",
                    isLandscape && speakerElements.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  )}>
                    {speakerElements.map(renderElement)}
                  </div>
                </div>
              )}

              {/* Metrics in Right Column when speakers exist */}
              {speakerElements.length > 0 && metricElements.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                    Highlights
                  </span>
                  <div className={cn(
                    "grid gap-2",
                    isLandscape
                      ? metricElements.length >= 3 ? "grid-cols-3" : "grid-cols-2"
                      : "grid-cols-2"
                  )}>
                    {metricElements.slice(0, isLandscape ? 3 : 2).map(renderElement)}
                  </div>
                </div>
              )}

              {speakerElements.length === 0 && metricElements.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                    Event Highlights & Metrics
                  </span>
                  <div className={cn(
                    "grid gap-2",
                    isLandscape
                      ? metricElements.length >= 3 ? "grid-cols-3" : "grid-cols-2"
                      : "grid-cols-1"
                  )}>
                    {metricElements.map(renderElement)}
                  </div>
                </div>
              )}
              {sponsorElement && renderElement(sponsorElement)}
            </div>
          </div>

          {/* Tier 3: Bottom Action & Footer Row */}
          <div
            className={cn(
              "w-full flex items-center justify-between gap-2 rounded-xl border bg-background/60 shrink-0",
              isLandscape ? "p-1.5 px-3" : "p-2 sm:p-2.5"
            )}
            style={{ borderColor: theme.colors.border }}
          >
            <div className="flex-1 min-w-[120px] flex items-center gap-2 overflow-hidden">
              {ctaElement && renderElement(ctaElement)}
              {organizerElement && renderElement(organizerElement)}
            </div>
            {qrElement && (
              <div className="shrink-0">
                {renderElement(qrElement)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Resume Document Layout */}
      {isResume && (
        <div className="flex-1 flex flex-col gap-3 overflow-hidden w-full max-w-4xl mx-auto py-1 min-h-0">
          {page.elements.map(renderElement)}
        </div>
      )}

      {/* 4. Formal Letter Document Layout */}
      {isLetter && (
        <div className="flex-1 flex flex-col gap-2 overflow-hidden w-full max-w-3xl mx-auto py-2 bg-white/70 backdrop-blur p-6 md:p-8 rounded-xl border shadow-sm min-h-0">
          {page.elements.map(renderElement)}
        </div>
      )}

      {/* 5. Social Media Graphic Layout */}
      {isSocial && (
        <div className="flex-1 flex flex-col justify-center items-center w-full h-full my-auto overflow-hidden min-h-0">
          {page.elements.map(renderElement)}
        </div>
      )}

      {/* 6. Infographic Narrative Layout */}
      {isInfographic && (
        <div className={cn(
          "flex-1 flex flex-col w-full max-w-5xl mx-auto overflow-hidden min-h-0",
          isLandscape ? "gap-2 py-0.5" : "gap-4 sm:gap-6 py-2"
        )}>
          {renderHeader()}
          <div className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
            {page.elements.map(renderElement)}
          </div>
        </div>
      )}

      {/* 7. Diagram Canvas Layout */}
      {isDiagram && (
        <div className="flex-1 flex flex-col justify-between w-full h-full">
          {renderHeader()}
          <div className="my-auto w-full flex items-center justify-center">
            {page.elements.map(renderElement)}
          </div>
        </div>
      )}

      {/* 8. Chart Report Layout */}
      {isChart && (
        <div className="flex-1 flex flex-col justify-between w-full h-full">
          {renderHeader()}
          <div className="my-auto w-full flex items-center justify-center">
            {page.elements.map(renderElement)}
          </div>
        </div>
      )}

      {/* 9. Presentation: Hero Title Layout (60/40 Asymmetric Split when Media is present) */}
      {isPresentation && page.archetype === "hero_title" && (
        <div className="flex-1 flex flex-col justify-center my-auto w-full z-10">
          {mediaElement ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
              {/* Left 60% Content Rail */}
              <div className="lg:col-span-7 flex flex-col gap-4 text-left">
                {displayBadge && (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateBadge?.(e.currentTarget.textContent || "")}
                    className="text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full outline-none focus:ring-1 focus:ring-primary/40 cursor-text w-fit border shadow-sm"
                    style={{
                      backgroundColor: `${theme.colors.secondary}15`,
                      borderColor: `${theme.colors.secondary}30`,
                      color: theme.colors.secondary,
                    }}
                  >
                    {displayBadge}
                  </span>
                )}
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateTitle?.(e.currentTarget.textContent || page.title)}
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] outline-none focus:bg-primary/5 rounded px-1 -mx-1 cursor-text"
                  style={{
                    color: theme.colors.textPrimary,
                    fontFamily: theme.typography.headingFont,
                  }}
                >
                  {page.title}
                </h1>
                {(page.subtitle || onUpdateSubtitle) && (
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateSubtitle?.(e.currentTarget.textContent || "")}
                    className="text-base sm:text-lg font-normal leading-relaxed opacity-90 max-w-xl outline-none focus:bg-primary/5 rounded px-1 -mx-1 cursor-text"
                    style={{
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.bodyFont,
                    }}
                  >
                    {page.subtitle || "Add presentation subtitle..."}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  {page.elements.filter((e) => e.id !== mediaElement.id).map(renderElement)}
                </div>
              </div>

              {/* Right 40% Visual Asset Container */}
              <div
                className="lg:col-span-5 h-[300px] lg:h-[380px] w-full rounded-2xl overflow-hidden border shadow-2xl relative flex items-center justify-center"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                {renderElement(mediaElement)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-6 max-w-4xl mx-auto my-auto group">
              {displayBadge && (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateBadge?.(e.currentTarget.textContent || "")}
                  className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full outline-none focus:ring-1 focus:ring-primary/40 cursor-text border shadow-sm"
                  style={{
                    backgroundColor: `${theme.colors.secondary}18`,
                    borderColor: `${theme.colors.secondary}30`,
                    color: theme.colors.secondary,
                  }}
                >
                  {displayBadge}
                </span>
              )}
              <h1
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdateTitle?.(e.currentTarget.textContent || page.title)}
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] outline-none focus:bg-primary/5 rounded px-2 -mx-2 cursor-text"
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.headingFont,
                }}
              >
                {page.title}
              </h1>
              {(page.subtitle || onUpdateSubtitle) && (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateSubtitle?.(e.currentTarget.textContent || "")}
                  className="text-lg md:text-xl font-normal leading-relaxed opacity-90 max-w-2xl outline-none focus:bg-primary/5 rounded px-2 -mx-2 cursor-text"
                  style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  {page.subtitle || "Add presentation subtitle..."}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 w-full justify-center">
                {page.elements.map(renderElement)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 10. Presentation: Four Metric Dashboard Layout */}
      {isPresentation &&
        (page.archetype === "four_metric_dashboard" || page.archetype === "big_statistic") && (
          <div className="flex-1 flex flex-col justify-between z-10">
            {renderHeader()}
            <div className="my-auto w-full flex flex-col gap-6">
              <div
                className={cn(
                  "grid gap-4 md:gap-6 w-full",
                  page.elements.filter((e) => e.type === "metric").length === 3
                    ? "grid-cols-1 md:grid-cols-3"
                    : page.elements.filter((e) => e.type === "metric").length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : page.elements.filter((e) => e.type === "metric").length === 1
                    ? "grid-cols-1 max-w-lg mx-auto"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                )}
              >
                {page.elements.filter((e) => e.type === "metric").map(renderElement)}
              </div>
              {page.elements.filter((e) => e.type !== "metric").length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {page.elements.filter((e) => e.type !== "metric").map(renderElement)}
                </div>
              )}
            </div>
          </div>
        )}

      {/* 11. Presentation: Three Card Grid Layout */}
      {isPresentation &&
        (page.archetype === "three_card_grid" || page.archetype === "three_column") && (() => {
          const listElem = page.elements.find((e) => e.type === "list") as any;
          const cardItems = (listElem && listElem.items && listElem.items.length > 0)
            ? listElem.items.slice(0, 3).map((it: any, idx: number) => {
                let title = `Pillar 0${idx + 1}`;
                let subtext = "";
                if (typeof it === "string") {
                  if (it.includes(":")) {
                    const parts = it.split(/:\s*(.*)/s);
                    title = parts[0].trim();
                    subtext = (parts[1] || "").trim();
                  } else if (it.includes(" — ")) {
                    const parts = it.split(/ — \s*(.*)/s);
                    title = parts[0].trim();
                    subtext = (parts[1] || "").trim();
                  } else {
                    title = it;
                  }
                } else if (it) {
                  if (it.subtext) {
                    title = it.text || title;
                    subtext = it.subtext;
                  } else if (it.text && it.text.includes(":")) {
                    const parts = it.text.split(/:\s*(.*)/s);
                    title = parts[0].trim();
                    subtext = (parts[1] || "").trim();
                  } else if (it.text && it.text.includes(" — ")) {
                    const parts = it.text.split(/ — \s*(.*)/s);
                    title = parts[0].trim();
                    subtext = (parts[1] || "").trim();
                  } else {
                    title = it.text || title;
                    subtext = it.subtext || "";
                  }
                }
                return { id: it?.id || `card-${idx}`, title, subtext };
              })
            : page.elements.slice(0, 3).map((elem: any, idx: number) => ({
                id: elem.id,
                title: elem.title || elem.content || `Pillar 0${idx + 1}`,
                subtext: elem.subtext || elem.label || "",
              }));

          return (
            <div className="flex-1 flex flex-col justify-between z-10">
              {renderHeader()}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-auto items-stretch">
                {cardItems.map((card: any, idx: number) => (
                  <div
                    key={card.id}
                    className="flex flex-col justify-between p-6 md:p-7 rounded-2xl border transition-all hover:border-primary/40 shadow-sm"
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-xs font-black px-2.5 py-1 rounded-lg"
                        style={{
                          backgroundColor: `${theme.colors.secondary}18`,
                          color: theme.colors.secondary,
                        }}
                      >
                        0{idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-start gap-2">
                      <h3
                        className="text-lg font-bold tracking-tight leading-snug"
                        style={{
                          color: theme.colors.textPrimary,
                          fontFamily: theme.typography.headingFont,
                        }}
                      >
                        {card.title}
                      </h3>
                      {card.subtext && (
                        <p
                          className="text-sm opacity-85 leading-relaxed"
                          style={{
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.bodyFont,
                          }}
                        >
                          {card.subtext}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      {/* 12. Presentation: Data Chart Focus Layout */}
      {isPresentation && (page.archetype === "data_chart_focus" || page.archetype === "chart") && (
        <div className="flex-1 flex flex-col justify-between z-10">
          {renderHeader()}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center">
            <div
              className="lg:col-span-8 h-[340px] lg:h-[380px] flex items-center justify-center p-4 rounded-2xl border"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              {page.elements.filter((e) => e.type === "chart").map(renderElement)}
            </div>
            <div className="lg:col-span-4 flex flex-col gap-4">
              {page.elements.filter((e) => e.type !== "chart").map(renderElement)}
            </div>
          </div>
        </div>
      )}

      {/* 13. Presentation: Two Column Split Layout (Qualitative Left + Data/Visual Right) */}
      {isPresentation &&
        (page.archetype === "two_column_split" || page.archetype === "two_column") && (
          <div className="flex-1 flex flex-col justify-between z-10">
            {renderHeader()}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center">
              {/* Left Column (Qualitative narrative or list) */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                {page.elements.filter(
                  (e) => e.type === "list" || (e.type === "text" && (e as any).variant !== "quote")
                ).length > 0
                  ? page.elements
                      .filter(
                        (e) => e.type === "list" || (e.type === "text" && (e as any).variant !== "quote")
                      )
                      .map(renderElement)
                  : page.elements.slice(0, Math.ceil(page.elements.length / 2)).map(renderElement)}
              </div>

              {/* Right Column (Data Card, Metric or Media) */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                {page.elements.filter(
                  (e) =>
                    e.type === "metric" ||
                    e.type === "chart" ||
                    e.type === "media" ||
                    (e.type === "text" && (e as any).variant === "quote")
                ).length > 0
                  ? page.elements
                      .filter(
                        (e) =>
                          e.type === "metric" ||
                          e.type === "chart" ||
                          e.type === "media" ||
                          (e.type === "text" && (e as any).variant === "quote")
                      )
                      .map(renderElement)
                  : page.elements.slice(Math.ceil(page.elements.length / 2)).map(renderElement)}
              </div>
            </div>
          </div>
        )}

      {/* 14. Presentation: Comparison Table / Matrix Layout */}
      {isPresentation &&
        (page.archetype === "comparison_table" ||
          page.archetype === "comparison" ||
          page.archetype === "table") && (
          <div className="flex-1 flex flex-col justify-between z-10">
            {renderHeader()}
            <div className="my-auto w-full">{page.elements.map(renderElement)}</div>
          </div>
        )}

      {/* 15. Presentation: Process Flowchart & Horizontal Timeline Layout */}
      {isPresentation &&
        (page.archetype === "process_flowchart" ||
          page.archetype === "horizontal_timeline" ||
          page.archetype === "timeline" ||
          page.archetype === "process_flow") && (
          <div className="flex-1 flex flex-col justify-between z-10">
            {renderHeader()}
            <div className="my-auto w-full relative">
              {/* Horizontal Timeline Connector Rail */}
              <div
                className="hidden lg:block absolute top-9 left-12 right-12 h-0.5 z-0 pointer-events-none opacity-40"
                style={{
                  background: `linear-gradient(to right, ${theme.colors.secondary}, ${theme.colors.primary}, ${theme.colors.secondary})`,
                }}
              />
              {listElement && listElement.type === "list" && listElement.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full relative z-10">
                  {listElement.items.slice(0, 5).map((item, idx) => {
                    let title = item.text;
                    let desc = item.subtext || "";
                    if (!desc && item.text) {
                      if (item.text.includes(":")) {
                        const parts = item.text.split(/:\s*(.*)/s);
                        title = parts[0].trim();
                        desc = (parts[1] || "").trim();
                      } else if (item.text.includes(" — ")) {
                        const parts = item.text.split(/ — \s*(.*)/s);
                        title = parts[0].trim();
                        desc = (parts[1] || "").trim();
                      }
                    }
                    return (
                      <div
                        key={item.id || idx}
                        className="flex flex-col gap-3 p-5 rounded-2xl border shadow-sm relative overflow-hidden transition-all hover:border-primary/40"
                        style={{
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-black px-2.5 py-1 rounded-lg"
                            style={{
                              backgroundColor: `${theme.colors.secondary}18`,
                              color: theme.colors.secondary,
                            }}
                          >
                            0{idx + 1}
                          </span>
                          <div
                            className="w-2.5 h-2.5 rounded-full ring-4 shadow-sm"
                            style={{
                              backgroundColor: theme.colors.secondary,
                              boxShadow: `0 0 8px ${theme.colors.secondary}60`,
                            }}
                          />
                        </div>
                        <h4
                          className="text-sm font-bold tracking-tight"
                          style={{
                            color: theme.colors.textPrimary,
                            fontFamily: theme.typography.headingFont,
                          }}
                        >
                          {title}
                        </h4>
                        {desc && (
                          <p
                            className="text-xs leading-relaxed"
                            style={{
                              color: theme.colors.textSecondary,
                              fontFamily: theme.typography.bodyFont,
                            }}
                          >
                            {desc}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full relative z-10">
                  {page.elements.map(renderElement)}
                </div>
              )}
            </div>
          </div>
        )}

      {/* 16. Presentation: Detailed Information Layout */}
      {isPresentation && page.archetype === "detailed_information" && (
        <div className="flex-1 flex flex-col justify-between z-10">
          {renderHeader()}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-stretch">
            <div
              className="lg:col-span-6 flex flex-col gap-4 p-6 rounded-2xl border shadow-sm"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              {page.elements
                .filter((e) => e.type === "text" && (e as any).variant === "body")
                .map(renderElement)}
            </div>
            <div
              className="lg:col-span-6 flex flex-col gap-4 p-6 rounded-2xl border shadow-sm"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              {page.elements
                .filter((e) => e.type !== "text" || (e as any).variant !== "body")
                .map(renderElement)}
            </div>
          </div>
        </div>
      )}

      {/* 17. Presentation: Case Study Card Layout */}
      {isPresentation && page.archetype === "case_study_card" && (
        <div className="flex-1 flex flex-col justify-between z-10">
          {renderHeader()}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center">
            <div
              className="lg:col-span-7 flex flex-col gap-4 p-6 rounded-2xl border shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              {page.elements.filter((e) => e.type === "text").map(renderElement)}
            </div>
            <div className="lg:col-span-5 flex flex-col gap-4">
              {page.elements.filter((e) => e.type !== "text").map(renderElement)}
            </div>
          </div>
        </div>
      )}

      {/* 18. Presentation: Quote Editorial Layout */}
      {isPresentation &&
        (page.archetype === "quote_editorial" || page.archetype === "quote") && (
          <div className="flex-1 flex flex-col justify-between z-10">
            {renderHeader()}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center">
              {page.elements.filter((e) => !(e.type === "text" && (e as any).variant === "quote"))
                .length > 0 && (
                <div className="lg:col-span-5 flex flex-col justify-center">
                  {page.elements
                    .filter((e) => !(e.type === "text" && (e as any).variant === "quote"))
                    .map(renderElement)}
                </div>
              )}
              <div
                className={cn(
                  "p-8 md:p-10 rounded-2xl border relative overflow-hidden flex flex-col justify-between shadow-xl",
                  page.elements.filter((e) => !(e.type === "text" && (e as any).variant === "quote"))
                    .length > 0
                    ? "lg:col-span-7"
                    : "col-span-12 max-w-3xl mx-auto"
                )}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: `${theme.colors.secondary}30`,
                }}
              >
                <div
                  className="text-5xl lg:text-6xl font-serif leading-none select-none opacity-40"
                  style={{ color: theme.colors.secondary }}
                >
                  “
                </div>
                <blockquote
                  className="text-lg md:text-xl lg:text-2xl font-serif italic leading-relaxed my-3"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {(quoteElement?.content || page.subtitle || page.title).replace(/^[“"']+|[”"']+$/g, "").trim()}
                </blockquote>
                {page.subtitle && quoteElement && (
                  <div className="flex items-center gap-3 pt-2">
                    <div
                      className="w-8 h-0.5 rounded-full"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <span
                      className="text-sm font-semibold tracking-wide"
                      style={{ color: theme.colors.secondary }}
                    >
                      {page.subtitle}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* 19. Presentation: Closing Slide Layout */}
      {isPresentation && page.archetype === "closing_slide" && (
        <div className="flex-1 flex flex-col justify-between z-10">
          {renderHeader()}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center w-full">
            <div className="lg:col-span-8 flex flex-col justify-center">
              {page.elements.map(renderElement)}
            </div>
            <div
              className="lg:col-span-4 rounded-2xl border flex flex-col items-center justify-center p-8 shadow-xl text-center gap-4"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: `${theme.colors.secondary}40`,
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner"
                style={{
                  backgroundColor: `${theme.colors.secondary}20`,
                  color: theme.colors.secondary,
                }}
              >
                SC
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold tracking-wider text-white">
                  SLIDECRAFT STUDIO
                </span>
                <span
                  className="text-xs font-mono tracking-wider opacity-75"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {page.subtitle || page.title || "Executive Briefing"}
                </span>
              </div>
              <div
                className="text-[11px] font-mono px-3 py-1 rounded-full border mt-2"
                style={{
                  borderColor: `${theme.colors.secondary}30`,
                  color: theme.colors.secondary,
                }}
              >
                Confidential & Proprietary
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 20. Presentation: Default fallback layout */}
      {isPresentation &&
        page.archetype !== "hero_title" &&
        page.archetype !== "four_metric_dashboard" &&
        page.archetype !== "big_statistic" &&
        page.archetype !== "three_card_grid" &&
        page.archetype !== "three_column" &&
        page.archetype !== "data_chart_focus" &&
        page.archetype !== "chart" &&
        page.archetype !== "two_column_split" &&
        page.archetype !== "two_column" &&
        page.archetype !== "comparison_table" &&
        page.archetype !== "comparison" &&
        page.archetype !== "table" &&
        page.archetype !== "process_flowchart" &&
        page.archetype !== "process_flow" &&
        page.archetype !== "horizontal_timeline" &&
        page.archetype !== "timeline" &&
        page.archetype !== "detailed_information" &&
        page.archetype !== "case_study_card" &&
        page.archetype !== "quote_editorial" &&
        page.archetype !== "quote" &&
        page.archetype !== "closing_slide" && (
          <div className="flex-1 flex flex-col justify-between z-10">
            {renderHeader()}
            <div className="flex flex-col gap-4 my-auto">{page.elements.map(renderElement)}</div>
          </div>
        )}

      {/* Slide Index Footer indicator (Presentations only) */}
      {isPresentation && (
        <div
          className="flex items-center justify-between pt-4 mt-auto border-t text-[11px] font-mono tracking-wider z-10"
          style={{
            borderColor: `${theme.colors.border}60`,
            color: theme.colors.textSecondary,
          }}
        >
          <span className="font-semibold uppercase tracking-widest opacity-75">SlideCraft Studio</span>
          <div className="flex items-center gap-1.5 font-bold">
            <span>{String(page.pageNumber).padStart(2, "0")}</span>
            <span className="opacity-40">/</span>
            <span className="opacity-60">{String(totalSlides || page.pageNumber).padStart(2, "0")}</span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
