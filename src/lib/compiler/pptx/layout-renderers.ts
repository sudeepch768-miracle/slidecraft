import pptxgen from "pptxgenjs";
import { PageSpec, ContentElement } from "@/types/document-spec";
import { PptxDesignTokens } from "./design-tokens";
import {
  calculateTextFitting,
  clampToSlideBoundaries,
  ensureHighContrast,
} from "./quality-protector";
import { sanitizeBadge } from "@/lib/utils";

export interface RenderContext {
  slideW: number;
  slideH: number;
  tokens: PptxDesignTokens;
  pptx: pptxgen;
  totalSlides: number;
}

/**
 * Renders universal header for standard content slides.
 */
export function renderSlideHeader(
  slide: pptxgen.Slide,
  page: PageSpec,
  ctx: RenderContext
): { contentStartY: number } {
  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const headerY = tokens.style.headerYInches;

  // Category Badge Pill
  if (page.badge) {
    const badgeText = sanitizeBadge(page.badge);
    const badgeWidth = Math.min(3.0, badgeText.length * 0.12 + 0.4);

    slide.addShape("roundRect", {
      x: marginX,
      y: headerY - 0.35,
      w: badgeWidth,
      h: 0.28,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.secondary, width: 1 },
      rectRadius: 0.14,
    });

    slide.addText(badgeText, {
      x: marginX,
      y: headerY - 0.35,
      w: badgeWidth,
      h: 0.28,
      fontSize: 9,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
      valign: "middle",
      charSpacing: 1.5,
    });
  }

  // Slide Headline
  const fitTitle = calculateTextFitting(
    page.title,
    ctx.slideW - marginX * 2,
    0.8,
    tokens.typography.h1SizePt
  );

  slide.addText(fitTitle.cleanText, {
    x: marginX,
    y: headerY,
    w: ctx.slideW - marginX * 2,
    h: 0.7,
    fontSize: fitTitle.adjustedFontSizePt,
    fontFace: tokens.typography.headingFont,
    color: tokens.colors.textPrimary,
    bold: true,
    valign: "middle",
  });

  // Slide Subtitle
  let subtitleHeight = 0;
  if (page.subtitle) {
    const fitSub = calculateTextFitting(
      page.subtitle,
      ctx.slideW - marginX * 2,
      0.5,
      tokens.typography.bodySizePt
    );

    slide.addText(fitSub.cleanText, {
      x: marginX,
      y: headerY + 0.65,
      w: ctx.slideW - marginX * 2,
      h: 0.4,
      fontSize: fitSub.adjustedFontSizePt,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
      valign: "top",
    });
    subtitleHeight = 0.45;
  }

  // Subtle Header Divider Line
  slide.addShape("line", {
    x: marginX,
    y: headerY + 0.7 + subtitleHeight,
    w: ctx.slideW - marginX * 2,
    h: 0,
    line: { color: tokens.colors.border, width: 0.75 },
  });

  return { contentStartY: headerY + 0.85 + subtitleHeight };
}

/**
 * Renders universal footer (slide number & confidentiality tag).
 */
export function renderSlideFooter(
  slide: pptxgen.Slide,
  page: PageSpec,
  ctx: RenderContext
) {
  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const footerY = ctx.slideH - 0.45;

  // Left: Confidentiality / Attribution tag
  slide.addText("CONFIDENTIAL & PROPRIETARY", {
    x: marginX,
    y: footerY,
    w: 4.0,
    h: 0.3,
    fontSize: 8,
    fontFace: tokens.typography.bodyFont,
    color: tokens.colors.textSecondary,
  });

  // Right: Slide Number counter
  slide.addText(`${page.pageNumber} / ${ctx.totalSlides}`, {
    x: ctx.slideW - marginX - 2.0,
    y: footerY,
    w: 2.0,
    h: 0.3,
    fontSize: 8,
    fontFace: tokens.typography.bodyFont,
    color: tokens.colors.textSecondary,
    align: "right",
  });
}

// -------------------------------------------------------------
// 16 Native Layout Archetype Renderers
// -------------------------------------------------------------

/**
 * 1. Title Slide (Hero cover) - Supports 60/40 Asymmetric Split when Media is present
 */
export function renderTitleSlide(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const tokens = ctx.tokens;
  const mediaElem = page.elements.find((e) => e.type === "media");

  // Background accent decorative shape
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.35,
    h: ctx.slideH,
    fill: { color: tokens.colors.secondary },
  });

  if (mediaElem) {
    // 60/40 Asymmetric Split (Reference Slide 1)
    const leftMargin = 1.0;
    const leftW = (ctx.slideW - 2.0) * 0.58;
    const rightX = leftMargin + leftW + 0.4;
    const rightW = ctx.slideW - rightX - 0.8;
    const rightH = ctx.slideH * 0.72;
    const rightY = (ctx.slideH - rightH) / 2;

    // Category Badge Pill
    if (page.badge) {
      slide.addText(sanitizeBadge(page.badge, "EXECUTIVE BRIEFING"), {
        x: leftMargin,
        y: ctx.slideH * 0.2,
        w: leftW,
        h: 0.35,
        fontSize: 10,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.secondary,
        bold: true,
        charSpacing: 2.5,
      });
    }

    // Hero Headline
    const fitTitle = calculateTextFitting(
      page.title,
      leftW,
      2.2,
      tokens.typography.heroSizePt * 0.85
    );
    slide.addText(fitTitle.cleanText, {
      x: leftMargin,
      y: ctx.slideH * 0.27,
      w: leftW,
      h: 2.2,
      fontSize: fitTitle.adjustedFontSizePt,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
      valign: "middle",
    });

    // Subtitle
    if (page.subtitle) {
      const fitSub = calculateTextFitting(page.subtitle, leftW, 1.1, 15);
      slide.addText(fitSub.cleanText, {
        x: leftMargin,
        y: ctx.slideH * 0.57,
        w: leftW,
        h: 1.1,
        fontSize: fitSub.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
      });
    }

    // Presenter / Date tag at bottom
    slide.addText("SlideCraft AI Studio  •  Executive Presentation", {
      x: leftMargin,
      y: ctx.slideH - 0.9,
      w: leftW,
      h: 0.4,
      fontSize: 10,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
    });

    // Right Column: Visual Media Container (FLUX Textless Artwork)
    renderMediaElement(slide, mediaElem, rightX, rightY, rightW, rightH, ctx);
  } else {
    // Standard Centered/Left Title Slide
    if (page.badge) {
      slide.addText(page.badge.toUpperCase(), {
        x: 1.2,
        y: ctx.slideH * 0.28,
        w: ctx.slideW - 2.4,
        h: 0.4,
        fontSize: 11,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.secondary,
        bold: true,
        charSpacing: 3,
      });
    }

    const fitTitle = calculateTextFitting(
      page.title,
      ctx.slideW - 2.4,
      2.0,
      tokens.typography.heroSizePt
    );
    slide.addText(fitTitle.cleanText, {
      x: 1.2,
      y: ctx.slideH * 0.35,
      w: ctx.slideW - 2.4,
      h: 1.8,
      fontSize: fitTitle.adjustedFontSizePt,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
      valign: "middle",
    });

    if (page.subtitle) {
      const fitSub = calculateTextFitting(page.subtitle, ctx.slideW - 2.4, 1.0, 18);
      slide.addText(fitSub.cleanText, {
        x: 1.2,
        y: ctx.slideH * 0.58,
        w: ctx.slideW - 2.4,
        h: 0.9,
        fontSize: fitSub.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
      });
    }

    slide.addText("SlideCraft AI Studio  •  Executive Presentation", {
      x: 1.2,
      y: ctx.slideH - 1.0,
      w: 6.0,
      h: 0.4,
      fontSize: 11,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
    });
  }
}

/**
 * 2. Title and Content (Standard narrative and bullet points)
 */
export function renderTitleAndContent(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const contentW = ctx.slideW - marginX * 2;
  let curY = contentStartY;

  page.elements.forEach((elem) => {
    if (elem.type === "text") {
      slide.addText(elem.content, {
        x: marginX,
        y: curY,
        w: contentW,
        h: 0.8,
        fontSize: elem.variant === "h2" ? tokens.typography.h2SizePt : tokens.typography.bodySizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textPrimary,
      });
      curY += 0.85;
    } else if (elem.type === "list") {
      const listTexts = elem.items.map((item) => ({
        text: item.text + (item.subtext ? ` — ${item.subtext}` : ""),
        options: {
          bullet: true,
          fontSize: tokens.typography.bodySizePt,
          color: tokens.colors.textPrimary,
          fontFace: tokens.typography.bodyFont,
        },
      }));
      const blockH = Math.min(3.5, elem.items.length * 0.6);
      slide.addText(listTexts as any, {
        x: marginX,
        y: curY,
        w: contentW,
        h: blockH,
      });
      curY += blockH + 0.3;
    }
  });
}

/**
 * 3. Two-Column Split
 */
export function renderTwoColumn(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const gutter = tokens.spacing.gutterInches;
  const availableW = ctx.slideW - marginX * 2 - gutter;
  const leftColW = availableW * 0.55;
  const rightColW = availableW * 0.45;
  const colH = ctx.slideH - contentStartY - 0.7;

  // Left Column Card (Qualitative Narrative / List)
  slide.addShape("roundRect", {
    x: marginX,
    y: contentStartY,
    w: leftColW,
    h: colH,
    fill: { color: tokens.colors.surface },
    line: { color: tokens.colors.border, width: 1 },
    rectRadius: tokens.style.borderRadius,
  });

  // Right Column Card (Data Dashboard / Metrics / Media)
  slide.addShape("roundRect", {
    x: marginX + leftColW + gutter,
    y: contentStartY,
    w: rightColW,
    h: colH,
    fill: { color: tokens.colors.surface },
    line: { color: tokens.colors.border, width: 1 },
    rectRadius: tokens.style.borderRadius,
  });

  // Partition elements into qualitative (left) and quantitative/media (right)
  const leftElements = page.elements.filter(
    (e) => e.type === "list" || (e.type === "text" && (e as any).variant !== "quote")
  );
  const rightElements = page.elements.filter(
    (e) =>
      e.type === "metric" ||
      e.type === "chart" ||
      e.type === "media" ||
      (e.type === "text" && (e as any).variant === "quote")
  );

  // Left rendering
  const activeLeft = leftElements.length > 0 ? leftElements : [page.elements[0]];
  let leftY = contentStartY + 0.35;
  activeLeft.forEach((elem) => {
    if (!elem) return;
    if (elem.type === "list") {
      const listTexts = elem.items.map((item) => ({
        text: item.text + (item.subtext ? ` — ${item.subtext}` : ""),
        options: {
          bullet: true,
          fontSize: tokens.typography.bodySizePt,
          color: tokens.colors.textPrimary,
          fontFace: tokens.typography.bodyFont,
        },
      }));
      const blockH = Math.min(colH - 0.7, elem.items.length * 0.55);
      slide.addText(listTexts as any, {
        x: marginX + 0.3,
        y: leftY,
        w: leftColW - 0.6,
        h: blockH,
      });
      leftY += blockH + 0.2;
    } else if (elem.type === "text") {
      const fitText = calculateTextFitting(
        elem.content,
        leftColW - 0.6,
        1.2,
        elem.variant === "h2" ? tokens.typography.h2SizePt : tokens.typography.bodySizePt
      );
      slide.addText(fitText.cleanText, {
        x: marginX + 0.3,
        y: leftY,
        w: leftColW - 0.6,
        h: 1.0,
        fontSize: fitText.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textPrimary,
        bold: elem.variant === "h2",
      });
      leftY += 1.1;
    }
  });

  // Right rendering
  const rightX = marginX + leftColW + gutter;
  const activeRight =
    rightElements.length > 0
      ? rightElements
      : page.elements.slice(Math.ceil(page.elements.length / 2));

  const metricItem = activeRight.find((e) => e.type === "metric") as
    | Extract<ContentElement, { type: "metric" }>
    | undefined;
  const mediaItem = activeRight.find((e) => e.type === "media");
  const quoteItem = activeRight.find(
    (e): e is Extract<ContentElement, { type: "text" }> =>
      e.type === "text" && (e as any).variant === "quote"
  );

  if (mediaItem) {
    renderMediaElement(
      slide,
      mediaItem,
      rightX + 0.2,
      contentStartY + 0.2,
      rightColW - 0.4,
      colH - 0.4,
      ctx
    );
  } else if (metricItem) {
    slide.addText(metricItem.value, {
      x: rightX + 0.3,
      y: contentStartY + 0.8,
      w: rightColW - 0.6,
      h: 1.2,
      fontSize: 42,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
      valign: "middle",
    });

    slide.addText(metricItem.label, {
      x: rightX + 0.3,
      y: contentStartY + 2.1,
      w: rightColW - 0.6,
      h: 0.8,
      fontSize: tokens.typography.bodySizePt + 1,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
      align: "center",
    });

    if (metricItem.delta) {
      slide.addShape("roundRect", {
        x: rightX + (rightColW - 1.6) / 2,
        y: contentStartY + 3.0,
        w: 1.6,
        h: 0.35,
        fill: { color: metricItem.trend === "up" ? "DCFCE7" : tokens.colors.background },
        line: { color: metricItem.trend === "up" ? "16A34A" : tokens.colors.border, width: 1 },
        rectRadius: 0.1,
      });
      slide.addText(metricItem.delta, {
        x: rightX + (rightColW - 1.6) / 2,
        y: contentStartY + 3.0,
        w: 1.6,
        h: 0.35,
        fontSize: 11,
        fontFace: tokens.typography.bodyFont,
        color: metricItem.trend === "up" ? "15803D" : tokens.colors.textPrimary,
        bold: true,
        align: "center",
        valign: "middle",
      });
    }
  } else if (quoteItem && "content" in quoteItem) {
    slide.addText("“", {
      x: rightX + 0.3,
      y: contentStartY + 0.3,
      w: 1.0,
      h: 0.8,
      fontSize: 48,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
    });
    slide.addText(quoteItem.content || "", {
      x: rightX + 0.4,
      y: contentStartY + 1.0,
      w: rightColW - 0.8,
      h: colH - 1.5,
      fontSize: 14,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textPrimary,
      italic: true,
    });
  } else {
    let curRightY = contentStartY + 0.4;
    activeRight.forEach((elem) => {
      if (elem && elem.type === "text") {
        slide.addText(elem.content, {
          x: rightX + 0.3,
          y: curRightY,
          w: rightColW - 0.6,
          h: 1.0,
          fontSize: tokens.typography.bodySizePt,
          fontFace: tokens.typography.bodyFont,
          color: tokens.colors.textPrimary,
        });
        curRightY += 1.1;
      }
    });
  }
}

/**
 * 4. Three-Column (Three Card Grid)
 */
export function renderThreeColumn(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const gutter = tokens.spacing.gutterInches;
  const cardW = (ctx.slideW - marginX * 2 - gutter * 2) / 3;
  const cardH = ctx.slideH - contentStartY - 0.7;

  for (let i = 0; i < 3; i++) {
    const x = marginX + i * (cardW + gutter);
    const elem = page.elements[i];

    // Card background shape
    slide.addShape("roundRect", {
      x,
      y: contentStartY,
      w: cardW,
      h: cardH,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.border, width: 1 },
      rectRadius: tokens.style.borderRadius,
    });

    // Step / Pillar Index badge
    slide.addShape("ellipse", {
      x: x + 0.3,
      y: contentStartY + 0.35,
      w: 0.5,
      h: 0.5,
      fill: { color: tokens.colors.secondary },
    });
    slide.addText(`0${i + 1}`, {
      x: x + 0.3,
      y: contentStartY + 0.35,
      w: 0.5,
      h: 0.5,
      fontSize: 11,
      fontFace: tokens.typography.headingFont,
      color: "FFFFFF",
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Card Content
    const listElem = page.elements.find((e) => e.type === "list") as any;
    let cardContent = "";
    if (listElem && listElem.items && listElem.items[i]) {
      const it = listElem.items[i];
      cardContent = typeof it === "string" ? it : it.text || "";
    } else if (elem?.type === "metric") {
      cardContent = `${elem.value}\n${elem.label}`;
    } else if (elem?.type === "text") {
      cardContent = elem.content;
    } else {
      cardContent = `Key Focus Area 0${i + 1}`;
    }

    slide.addText(cardContent, {
      x: x + 0.3,
      y: contentStartY + 1.1,
      w: cardW - 0.6,
      h: cardH - 1.4,
      fontSize: tokens.typography.bodySizePt,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textPrimary,
    });
  }
}

/**
 * 5. Full-Bleed Visual Slide
 */
export function renderFullBleedVisual(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const tokens = ctx.tokens;

  // Darkened full bleed backdrop shape
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: ctx.slideW,
    h: ctx.slideH,
    fill: { color: tokens.colors.primary },
  });

  // Centered high-impact card overlay
  const cardW = ctx.slideW * 0.75;
  const cardH = 3.2;
  const cardX = (ctx.slideW - cardW) / 2;
  const cardY = (ctx.slideH - cardH) / 2;

  slide.addShape("roundRect", {
    x: cardX,
    y: cardY,
    w: cardW,
    h: cardH,
    fill: { color: tokens.colors.surface },
    line: { color: tokens.colors.secondary, width: 1.5 },
    rectRadius: 0.15,
  });

  slide.addText(page.title, {
    x: cardX + 0.5,
    y: cardY + 0.4,
    w: cardW - 1.0,
    h: 1.2,
    fontSize: tokens.typography.h1SizePt,
    fontFace: tokens.typography.headingFont,
    color: tokens.colors.textPrimary,
    bold: true,
    align: "center",
    valign: "middle",
  });

  if (page.subtitle) {
    slide.addText(page.subtitle, {
      x: cardX + 0.5,
      y: cardY + 1.7,
      w: cardW - 1.0,
      h: 0.9,
      fontSize: 14,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
      align: "center",
    });
  }
}

/**
 * 6. Big Statistic (Four Metric Dashboard)
 */
export function renderBigStatistic(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const metrics = page.elements.filter(
    (e): e is Extract<ContentElement, { type: "metric" }> => e.type === "metric"
  );
  const count = Math.min(Math.max(metrics.length, 1), 4);

  const marginX = tokens.spacing.marginXInches;
  const gutter = tokens.spacing.gutterInches;
  const availableW = ctx.slideW - marginX * 2;
  const cardW = (availableW - gutter * (count - 1)) / count;
  const cardH = ctx.slideH - contentStartY - 0.7;

  metrics.slice(0, 4).forEach((m, idx) => {
    const x = marginX + idx * (cardW + gutter);

    slide.addShape("roundRect", {
      x,
      y: contentStartY,
      w: cardW,
      h: cardH,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.border, width: 1 },
      rectRadius: tokens.style.borderRadius,
    });

    // Metric Value
    slide.addText(m.value, {
      x: x + 0.2,
      y: contentStartY + 0.5,
      w: cardW - 0.4,
      h: 1.1,
      fontSize: 34,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Metric Label
    slide.addText(m.label, {
      x: x + 0.2,
      y: contentStartY + 1.8,
      w: cardW - 0.4,
      h: 0.9,
      fontSize: tokens.typography.bodySizePt,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
      align: "center",
    });

    // Delta pill
    if (m.delta) {
      slide.addShape("roundRect", {
        x: x + (cardW - 1.4) / 2,
        y: contentStartY + cardH - 0.8,
        w: 1.4,
        h: 0.35,
        fill: { color: m.trend === "up" ? "DCFCE7" : tokens.colors.background },
        line: { color: m.trend === "up" ? "16A34A" : tokens.colors.border, width: 1 },
        rectRadius: 0.1,
      });

      slide.addText(m.delta, {
        x: x + (cardW - 1.4) / 2,
        y: contentStartY + cardH - 0.8,
        w: 1.4,
        h: 0.35,
        fontSize: 10,
        fontFace: tokens.typography.bodyFont,
        color: m.trend === "up" ? "15803D" : tokens.colors.textPrimary,
        bold: true,
        align: "center",
        valign: "middle",
      });
    }
  });
}

/**
 * 7. Comparison Table / Matrix
 */
export function renderComparison(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const tableElem = page.elements.find(
    (e): e is Extract<ContentElement, { type: "table" }> => e.type === "table"
  );

  const headers = tableElem ? tableElem.headers : ["Capability", "SlideCraft AI", "Legacy Tools"];
  const rows = tableElem
    ? tableElem.rows
    : [
        ["Generation Engine", "Deterministic Zod AST", "Static Code Hallucinations"],
        ["PPTX Export", "100% Native Vector Objects", "Flat Image Screenshots"],
        ["Layout Variety", "Content-Aware Dynamic Selection", "Fixed Monotonous Grids"],
      ];

  const rowsData: any[][] = [];

  // Header
  rowsData.push(
    headers.map((h) => ({
      text: h,
      options: {
        fill: { color: tokens.colors.primary },
        color: "FFFFFF",
        bold: true,
        fontSize: 12,
        fontFace: tokens.typography.headingFont,
        align: "center",
      },
    }))
  );

  // Rows
  rows.forEach((row, rIdx) => {
    rowsData.push(
      row.map((cell, cIdx) => ({
        text: cell,
        options: {
          fill: { color: rIdx % 2 === 0 ? tokens.colors.surface : tokens.colors.background },
          color: cIdx === 0 ? tokens.colors.primary : tokens.colors.textPrimary,
          bold: cIdx === 0,
          fontSize: 11,
          fontFace: tokens.typography.bodyFont,
          align: cIdx === 0 ? "left" : "center",
        },
      }))
    );
  });

  slide.addTable(rowsData, {
    x: tokens.spacing.marginXInches,
    y: contentStartY,
    w: ctx.slideW - tokens.spacing.marginXInches * 2,
    colW: (ctx.slideW - tokens.spacing.marginXInches * 2) / headers.length,
    border: { type: "solid", pt: 1, color: tokens.colors.border },
  });
}

/**
 * 8. Timeline Slide (Milestone sequence) - Dynamically extracts from page.elements
 */
export function renderTimeline(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const availableW = ctx.slideW - marginX * 2;

  const listElem = page.elements.find(
    (e): e is Extract<ContentElement, { type: "list" }> => e.type === "list"
  );
  const textElems = page.elements.filter(
    (e): e is Extract<ContentElement, { type: "text" }> => e.type === "text"
  );

  let milestones: { phase: string; title: string; desc: string }[] = [];

  if (listElem && listElem.items && listElem.items.length > 0) {
    milestones = listElem.items.slice(0, 5).map((it, idx) => ({
      phase: `0${idx + 1}`,
      title: it.text,
      desc: it.subtext || "",
    }));
  } else if (textElems.length >= 2) {
    milestones = textElems.slice(0, 5).map((t, idx) => {
      const parts = t.content.split(":");
      return {
        phase: `0${idx + 1}`,
        title: (parts[0] || `Phase 0${idx + 1}`).trim(),
        desc: (parts[1] || t.content).trim(),
      };
    });
  } else {
    milestones = [
      { phase: "01", title: "Discovery", desc: "Data collection and preprocessing" },
      { phase: "02", title: "Architecture", desc: "Model synthesis & parameter tuning" },
      { phase: "03", title: "Validation", desc: "Benchmark verification against baseline" },
      { phase: "04", title: "Deployment", desc: "Production rollout and monitoring" },
    ];
  }

  const count = milestones.length;
  const stepW = availableW / count;
  const lineY = contentStartY + 1.2;

  // Horizontal vector connector line
  slide.addShape("line", {
    x: marginX + stepW / 2,
    y: lineY,
    w: availableW - stepW,
    h: 0,
    line: { color: tokens.colors.secondary, width: 2.5 },
  });

  milestones.forEach((m, idx) => {
    const centerX = marginX + idx * stepW + stepW / 2;

    // Milestone Node Circle
    slide.addShape("ellipse", {
      x: centerX - 0.25,
      y: lineY - 0.25,
      w: 0.5,
      h: 0.5,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.secondary, width: 2.5 },
    });

    // Milestone Phase badge
    slide.addText(m.phase, {
      x: centerX - 1.0,
      y: lineY - 0.7,
      w: 2.0,
      h: 0.35,
      fontSize: 11,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
    });

    // Milestone Title & Desc
    slide.addText(m.title, {
      x: centerX - 1.0,
      y: lineY + 0.45,
      w: 2.0,
      h: 0.45,
      fontSize: 12,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
      align: "center",
    });

    if (m.desc) {
      slide.addText(m.desc, {
        x: centerX - 1.0,
        y: lineY + 0.95,
        w: 2.0,
        h: 0.9,
        fontSize: 10,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
        align: "center",
      });
    }
  });
}

/**
 * 9. Process Flow (Workflow nodes & arrows) - Dynamically extracts from page.elements
 */
export function renderProcessFlow(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const availableW = ctx.slideW - marginX * 2;

  const listElem = page.elements.find(
    (e): e is Extract<ContentElement, { type: "list" }> => e.type === "list"
  );
  const textElems = page.elements.filter(
    (e): e is Extract<ContentElement, { type: "text" }> => e.type === "text"
  );

  let steps: { title: string; desc: string }[] = [];

  if (listElem && listElem.items && listElem.items.length > 0) {
    steps = listElem.items.slice(0, 5).map((it) => ({
      title: it.text,
      desc: it.subtext || "",
    }));
  } else if (textElems.length >= 2) {
    steps = textElems.slice(0, 5).map((t) => {
      const parts = t.content.split(":");
      return {
        title: (parts[0] || t.content.slice(0, 25)).trim(),
        desc: (parts[1] || t.content.slice(25)).trim(),
      };
    });
  } else {
    steps = [
      { title: "Ingestion", desc: "Upload raw text or document" },
      { title: "Synthesis", desc: "LLM AST generation with Zod" },
      { title: "Quality Protection", desc: "Automated text fit & contrast check" },
      { title: "Export", desc: "Native editable PPTX file" },
    ];
  }

  const count = steps.length;
  const cardW = (availableW - 0.35 * (count - 1)) / count;
  const cardH = 2.9;

  steps.forEach((s, idx) => {
    const x = marginX + idx * (cardW + 0.35);

    slide.addShape("roundRect", {
      x,
      y: contentStartY + 0.4,
      w: cardW,
      h: cardH,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.border, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText(`Step 0${idx + 1}`, {
      x: x + 0.2,
      y: contentStartY + 0.65,
      w: cardW - 0.4,
      h: 0.3,
      fontSize: 10,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
    });

    slide.addText(s.title, {
      x: x + 0.2,
      y: contentStartY + 1.05,
      w: cardW - 0.4,
      h: 0.5,
      fontSize: 13,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
      align: "center",
    });

    if (s.desc) {
      slide.addText(s.desc, {
        x: x + 0.2,
        y: contentStartY + 1.6,
        w: cardW - 0.4,
        h: 1.1,
        fontSize: 10,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
        align: "center",
      });
    }
  });
}

/**
 * 10. Diagram (System Architecture / DAG)
 */
export function renderDiagram(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const diagramElem = page.elements.find(
    (e): e is Extract<ContentElement, { type: "diagram" }> => e.type === "diagram"
  );

  const nodes = diagramElem?.nodes || [
    { id: "n1", label: "Client Studio", description: "React / Canvas UI" },
    { id: "n2", label: "Compiler Engine", description: "Layout & Quality Protector" },
    { id: "n3", label: "PowerPoint Binary", description: "Native OpenXML Objects" },
  ];

  const marginX = tokens.spacing.marginXInches;
  const nodeW = 2.4;
  const nodeH = 1.6;
  const spacingX = (ctx.slideW - marginX * 2 - nodeW * nodes.length) / Math.max(1, nodes.length - 1);

  nodes.forEach((node, idx) => {
    const x = marginX + idx * (nodeW + spacingX);
    const y = contentStartY + 1.2;

    slide.addShape("roundRect", {
      x,
      y,
      w: nodeW,
      h: nodeH,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.secondary, width: 1.5 },
      rectRadius: 0.1,
    });

    slide.addText(node.label, {
      x: x + 0.15,
      y: y + 0.3,
      w: nodeW - 0.3,
      h: 0.4,
      fontSize: 13,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
      align: "center",
    });

    if (node.description) {
      slide.addText(node.description, {
        x: x + 0.15,
        y: y + 0.75,
        w: nodeW - 0.3,
        h: 0.6,
        fontSize: 10,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
        align: "center",
      });
    }

    // Connector arrow to next node
    if (idx < nodes.length - 1) {
      const nextX = x + nodeW;
      slide.addShape("line", {
        x: nextX + 0.1,
        y: y + nodeH / 2,
        w: spacingX - 0.2,
        h: 0,
        line: { color: tokens.colors.secondary, width: 2 },
      });
    }
  });
}

/**
 * 11. Chart (Native Excel-Backed Charts)
 */
export function renderChart(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const chartElem = page.elements.find(
    (e): e is Extract<ContentElement, { type: "chart" }> => e.type === "chart"
  );

  let pptxChartType = ctx.pptx.ChartType.bar;
  if (chartElem?.chartType === "line") pptxChartType = ctx.pptx.ChartType.line;
  else if (chartElem?.chartType === "pie") pptxChartType = ctx.pptx.ChartType.pie;
  else if (chartElem?.chartType === "doughnut") pptxChartType = ctx.pptx.ChartType.doughnut;

  const chartData = chartElem
    ? chartElem.datasets.map((ds) => ({
        name: ds.name,
        labels: chartElem.labels,
        values: ds.data,
      }))
    : [
        {
          name: "Projected ARR ($M)",
          labels: ["Q1", "Q2", "Q3", "Q4"],
          values: [12, 18, 25, 34],
        },
      ];

  const marginX = tokens.spacing.marginXInches;
  const chartW = (ctx.slideW - marginX * 2) * 0.65;
  const chartH = ctx.slideH - contentStartY - 0.7;

  // Native PowerPoint Chart
  slide.addChart(pptxChartType, chartData, {
    x: marginX,
    y: contentStartY,
    w: chartW,
    h: chartH,
    showLegend: true,
    chartColors: [tokens.colors.secondary, tokens.colors.accent, tokens.colors.primary],
  });

  // Takeaway container card
  const rightX = marginX + chartW + 0.35;
  const rightW = ctx.slideW - rightX - marginX;

  slide.addShape("roundRect", {
    x: rightX,
    y: contentStartY,
    w: rightW,
    h: chartH,
    fill: { color: tokens.colors.surface },
    line: { color: tokens.colors.border, width: 1 },
    rectRadius: tokens.style.borderRadius,
  });

  slide.addText("Key Takeaways", {
    x: rightX + 0.3,
    y: contentStartY + 0.35,
    w: rightW - 0.6,
    h: 0.4,
    fontSize: 15,
    fontFace: tokens.typography.headingFont,
    color: tokens.colors.textPrimary,
    bold: true,
  });

  slide.addText(
    "Data indicates 2.4x acceleration in vector content synthesis with deterministic IR over rigid static templates.",
    {
      x: rightX + 0.3,
      y: contentStartY + 0.85,
      w: rightW - 0.6,
      h: chartH - 1.2,
      fontSize: 12,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
    }
  );
}

/**
 * 12. Table (Full-Width Native Table)
 */
export function renderTable(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  renderComparison(slide, page, ctx);
}

/**
 * 13. Quote (High-Impact Editorial Pull Quote)
 */
export function renderQuote(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const quoteText =
    page.elements.find((e) => e.type === "text")?.content ||
    "Simplicity and speed in AI-driven visual communication are not luxuries; they are fundamental requirements for the modern enterprise.";

  // Decorative Oversized Quote Mark
  slide.addText("“", {
    x: 1.2,
    y: ctx.slideH * 0.2,
    w: 2.0,
    h: 1.5,
    fontSize: 96,
    fontFace: tokens.typography.headingFont,
    color: tokens.colors.secondary,
    bold: true,
  });

  // Pull Quote Text
  slide.addText(quoteText, {
    x: 1.8,
    y: ctx.slideH * 0.32,
    w: ctx.slideW - 3.6,
    h: 2.2,
    fontSize: 24,
    fontFace: tokens.typography.headingFont,
    color: tokens.colors.textPrimary,
    italic: true,
  });

  // Attribution Author Block
  slide.addText(`— ${page.subtitle || "Executive Leadership Vision"}`, {
    x: 1.8,
    y: ctx.slideH * 0.62,
    w: ctx.slideW - 3.6,
    h: 0.5,
    fontSize: 14,
    fontFace: tokens.typography.bodyFont,
    color: tokens.colors.secondary,
    bold: true,
  });
}

/**
 * 14. Section Divider (Chapter Break)
 */
export function renderSectionDivider(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const tokens = ctx.tokens;

  // Solid Brand Color Fill
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: ctx.slideW,
    h: ctx.slideH,
    fill: { color: tokens.colors.primary },
  });

  // Category Badge
  if (page.badge) {
    slide.addText(sanitizeBadge(page.badge), {
      x: 1.5,
      y: ctx.slideH * 0.32,
      w: ctx.slideW - 3.0,
      h: 0.4,
      fontSize: 12,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.secondary,
      bold: true,
      charSpacing: 3,
    });
  }

  // Section Title
  slide.addText(page.title, {
    x: 1.5,
    y: ctx.slideH * 0.4,
    w: ctx.slideW - 3.0,
    h: 1.5,
    fontSize: 38,
    fontFace: tokens.typography.headingFont,
    color: "FFFFFF",
    bold: true,
  });

  if (page.subtitle) {
    slide.addText(page.subtitle, {
      x: 1.5,
      y: ctx.slideH * 0.58,
      w: ctx.slideW - 3.0,
      h: 0.8,
      fontSize: 16,
      fontFace: tokens.typography.bodyFont,
      color: "E2E8F0",
    });
  }
}

/**
 * 15. Summary Slide (Executive Recap)
 */
export function renderSummary(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const availableW = ctx.slideW - marginX * 2;

  const listElem = page.elements.find(
    (e): e is Extract<ContentElement, { type: "list" }> => e.type === "list"
  );
  const textElems = page.elements.filter(
    (e): e is Extract<ContentElement, { type: "text" }> => e.type === "text"
  );

  let takeAways: { title: string; text: string }[] = [];
  if (listElem && listElem.items && listElem.items.length > 0) {
    takeAways = listElem.items.slice(0, 4).map((it) => ({
      title: it.text,
      text: it.subtext || "",
    }));
  } else if (textElems.length > 0) {
    takeAways = textElems.slice(0, 4).map((t) => {
      const parts = t.content.split(":");
      return {
        title: (parts[0] || t.content.slice(0, 30)).trim(),
        text: (parts[1] || t.content.slice(30)).trim(),
      };
    });
  } else {
    takeAways = [
      { title: "Scalable Architecture", text: "End-to-end distributed processing with sub-second latency." },
      { title: "High Precision", text: "99.4% accuracy across clinical validation benchmarks." },
      { title: "Production Ready", text: "Containerized deployment with continuous monitoring." },
    ];
  }

  takeAways.forEach((item, idx) => {
    const y = contentStartY + idx * 1.3;

    slide.addShape("roundRect", {
      x: marginX,
      y,
      w: availableW,
      h: 1.1,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.border, width: 1 },
      rectRadius: 0.1,
    });

    slide.addShape("ellipse", {
      x: marginX + 0.3,
      y: y + 0.3,
      w: 0.5,
      h: 0.5,
      fill: { color: tokens.colors.secondary },
    });
    slide.addText("✓", {
      x: marginX + 0.3,
      y: y + 0.3,
      w: 0.5,
      h: 0.5,
      fontSize: 16,
      color: "FFFFFF",
      align: "center",
      valign: "middle",
    });

    slide.addText(item.title, {
      x: marginX + 1.1,
      y: y + 0.2,
      w: availableW - 1.4,
      h: 0.35,
      fontSize: 14,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
    });

    if (item.text) {
      slide.addText(item.text, {
        x: marginX + 1.1,
        y: y + 0.55,
        w: availableW - 1.4,
        h: 0.4,
        fontSize: 11,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
      });
    }
  });
}

/**
 * 16. Closing Slide (Contact & Next Steps) — uses actual page content
 */
export function renderClosingSlide(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const tokens = ctx.tokens;

  // Clean surface background
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: ctx.slideW,
    h: ctx.slideH,
    fill: { color: tokens.colors.background },
  });

  // Left accent bar
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.35,
    h: ctx.slideH,
    fill: { color: tokens.colors.secondary },
  });

  // Category Badge Pill
  if (page.badge) {
    slide.addText(sanitizeBadge(page.badge), {
      x: 1.2,
      y: ctx.slideH * 0.22,
      w: ctx.slideW - 2.4,
      h: 0.35,
      fontSize: 10,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.secondary,
      bold: true,
      charSpacing: 2.5,
    });
  }

  // Hero Headline — use page title or "Thank You"
  const headline = page.title || "Thank You";
  const fitH = calculateTextFitting(headline, ctx.slideW - 2.4, 1.8, 44);
  slide.addText(fitH.cleanText, {
    x: 1.2,
    y: ctx.slideH * 0.28,
    w: ctx.slideW - 2.4,
    h: 1.5,
    fontSize: fitH.adjustedFontSizePt,
    fontFace: tokens.typography.headingFont,
    color: tokens.colors.textPrimary,
    bold: true,
  });

  // Subtitle / CTA
  if (page.subtitle) {
    const fitS = calculateTextFitting(page.subtitle, ctx.slideW - 2.4, 0.8, 16);
    slide.addText(fitS.cleanText, {
      x: 1.2,
      y: ctx.slideH * 0.48,
      w: ctx.slideW - 2.4,
      h: 0.7,
      fontSize: fitS.adjustedFontSizePt,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
    });
  }

  // Render list/text elements from page
  const textEls = page.elements.filter((e) => e.type === "text" || e.type === "list").slice(0, 3);
  let elY = ctx.slideH * 0.6;
  for (const el of textEls) {
    if (el.type === "text" && "content" in el) {
      const fit = calculateTextFitting(el.content, ctx.slideW - 2.4, 0.5, 13);
      slide.addText(fit.cleanText, {
        x: 1.2,
        y: elY,
        w: ctx.slideW - 2.4,
        h: 0.45,
        fontSize: fit.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
      });
      elY += 0.5;
    }
  }

  // Footer branding
  slide.addText("SlideCraft AI Studio  •  Thank you for your time", {
    x: 1.2,
    y: ctx.slideH - 0.8,
    w: 6.0,
    h: 0.35,
    fontSize: 10,
    fontFace: tokens.typography.bodyFont,
    color: tokens.colors.textSecondary,
  });
}

/**
 * Renders an image / media element into a PPTX slide.
 */
export function renderMediaElement(
  slide: pptxgen.Slide,
  elem: ContentElement,
  x: number,
  y: number,
  w: number,
  h: number,
  ctx: RenderContext
) {
  if (elem.type !== "media") return;
  const src = elem.src || elem.url;
  if (src && (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:image/"))) {
    try {
      if (src.startsWith("data:")) {
        slide.addImage({ data: src, x, y, w, h });
      } else {
        slide.addImage({ path: src, x, y, w, h });
      }
      return;
    } catch {
      // Fallback if image load fails
    }
  }

  // Draw styled media placeholder box
  slide.addShape("roundRect", {
    x, y, w, h,
    fill: { color: ctx.tokens.colors.surface },
    line: { color: ctx.tokens.colors.border, width: 1, dashType: "dash" },
    rectRadius: 0.1,
  });
  slide.addText(elem.alt || "Visual Asset", {
    x, y, w, h,
    fontSize: 11,
    fontFace: ctx.tokens.typography.bodyFont,
    color: ctx.tokens.colors.textSecondary,
    align: "center",
    valign: "middle",
  });
}


