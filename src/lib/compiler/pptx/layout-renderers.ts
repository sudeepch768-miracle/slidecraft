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
  const mediaElem = page.elements.find((e) => e.type === "media" && (!e.position || typeof (e.position as any).x !== "number"));

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
    let curY = ctx.slideH * 0.16;
    if (page.badge) {
      slide.addText(sanitizeBadge(page.badge, "EXECUTIVE BRIEFING"), {
        x: leftMargin,
        y: curY,
        w: leftW,
        h: 0.35,
        fontSize: 10,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.secondary,
        bold: true,
        charSpacing: 2.5,
      });
      curY += 0.45;
    }

    // Hero Headline
    const fitTitle = calculateTextFitting(
      page.title,
      leftW,
      1.8,
      tokens.typography.heroSizePt * 0.8
    );
    const titleH = Math.min(1.8, Math.max(0.9, fitTitle.cleanText.length > 50 ? 1.5 : 1.0));
    slide.addText(fitTitle.cleanText, {
      x: leftMargin,
      y: curY,
      w: leftW,
      h: titleH,
      fontSize: fitTitle.adjustedFontSizePt,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
      valign: "top",
    });
    curY += titleH + 0.2;

    // Subtitle
    if (page.subtitle) {
      const fitSub = calculateTextFitting(page.subtitle, leftW, 1.2, 13);
      const subH = Math.min(1.3, Math.max(0.6, fitSub.cleanText.length > 80 ? 1.1 : 0.6));
      slide.addText(fitSub.cleanText, {
        x: leftMargin,
        y: curY,
        w: leftW,
        h: subH,
        fontSize: fitSub.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
        valign: "top",
      });
      curY += subH + 0.2;
    }

    // Non-media elements under subtitle (only if not duplicate and space permits)
    const nonMedia = page.elements.filter((e) => e.id !== mediaElem.id);
    for (const elem of nonMedia) {
      if (curY > ctx.slideH - 1.4) break;
      if (elem.type === "text" && "content" in elem) {
        const isDuplicate =
          (page.subtitle && (elem.content.includes(page.subtitle.slice(0, 25)) || page.subtitle.includes(elem.content.slice(0, 25)))) ||
          (page.title && (elem.content.includes(page.title.slice(0, 25)) || page.title.includes(elem.content.slice(0, 25))));
        if (isDuplicate) continue;

        const fit = calculateTextFitting(elem.content, leftW, 0.7, 11);
        slide.addText(fit.cleanText, {
          x: leftMargin,
          y: curY,
          w: leftW,
          h: 0.65,
          fontSize: fit.adjustedFontSizePt,
          fontFace: tokens.typography.bodyFont,
          color: tokens.colors.textSecondary,
        });
        curY += 0.7;
      }
    }

    // Presenter / Attribution tag at bottom
    slide.addText("SlideCraft AI Studio  •  Executive Presentation", {
      x: leftMargin,
      y: ctx.slideH - 0.75,
      w: leftW,
      h: 0.35,
      fontSize: 9.5,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
    });

    // Right Column: Visual Media Container with Card Frame
    slide.addShape("roundRect", {
      x: rightX,
      y: rightY,
      w: rightW,
      h: rightH,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.border, width: 1 },
      rectRadius: tokens.style.borderRadius,
    });
    renderMediaElement(slide, mediaElem, rightX + 0.15, rightY + 0.15, rightW - 0.3, rightH - 0.3, ctx);
  } else {
    // Standard Centered/Left Title Slide
    if (page.badge) {
      slide.addText(page.badge.toUpperCase(), {
        x: 1.2,
        y: ctx.slideH * 0.25,
        w: ctx.slideW - 2.4,
        h: 0.4,
        fontSize: 11,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.secondary,
        bold: true,
        charSpacing: 3,
        align: "center",
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
      y: ctx.slideH * 0.32,
      w: ctx.slideW - 2.4,
      h: 1.8,
      fontSize: fitTitle.adjustedFontSizePt,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
      valign: "middle",
      align: "center",
    });

    if (page.subtitle) {
      const fitSub = calculateTextFitting(page.subtitle, ctx.slideW - 2.4, 1.0, 18);
      slide.addText(fitSub.cleanText, {
        x: 1.2,
        y: ctx.slideH * 0.54,
        w: ctx.slideW - 2.4,
        h: 0.9,
        fontSize: fitSub.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
        align: "center",
      });
    }

    // Render any non-empty elements centered
    let elemY = ctx.slideH * 0.68;
    page.elements.slice(0, 2).forEach((elem) => {
      if (elem.type === "text" && "content" in elem) {
        slide.addText(elem.content, {
          x: 1.2,
          y: elemY,
          w: ctx.slideW - 2.4,
          h: 0.45,
          fontSize: 11,
          fontFace: tokens.typography.bodyFont,
          color: tokens.colors.textSecondary,
          align: "center",
        });
        elemY += 0.45;
      }
    });

    slide.addText("SlideCraft AI Studio  •  Executive Presentation", {
      x: 1.2,
      y: ctx.slideH - 0.75,
      w: ctx.slideW - 2.4,
      h: 0.35,
      fontSize: 10,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
      align: "center",
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
    } else if (elem.type === "metric") {
      slide.addText(`${elem.value}: ${elem.label}`, {
        x: marginX,
        y: curY,
        w: contentW,
        h: 0.6,
        fontSize: tokens.typography.h2SizePt,
        fontFace: tokens.typography.headingFont,
        color: tokens.colors.secondary,
        bold: true,
      });
      curY += 0.7;
    } else if (elem.type === "media" && (!elem.position || typeof (elem.position as any).x !== "number")) {
      renderMediaElement(slide, elem, marginX, curY, Math.min(contentW, 6.0), 3.0, ctx);
      curY += 3.2;
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
  const mediaItem = activeRight.find((e) => e.type === "media" && (!e.position || typeof (e.position as any).x !== "number"));
  const quoteItem = activeRight.find(
    (e): e is Extract<ContentElement, { type: "text" }> =>
      e.type === "text" && (e as any).variant === "quote"
  );

  if (mediaItem && metricItem) {
    // Both media AND metric exist! Render media on top (52% height) and metric card on bottom (44% height)
    const mediaH = Math.max(1.8, colH * 0.52);
    renderMediaElement(
      slide,
      mediaItem,
      rightX + 0.2,
      contentStartY + 0.2,
      rightColW - 0.4,
      mediaH - 0.2,
      ctx
    );

    const metricY = contentStartY + mediaH + 0.15;
    const metricH = colH - mediaH - 0.25;

    slide.addShape("roundRect", {
      x: rightX + 0.2,
      y: metricY,
      w: rightColW - 0.4,
      h: metricH,
      fill: { color: tokens.colors.background },
      line: { color: tokens.colors.secondary, width: 1 },
      rectRadius: tokens.style.borderRadius,
    });

    slide.addText(metricItem.value, {
      x: rightX + 0.3,
      y: metricY + 0.15,
      w: rightColW - 0.6,
      h: metricH * 0.48,
      fontSize: 26,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
      valign: "middle",
    });

    slide.addText(metricItem.label, {
      x: rightX + 0.3,
      y: metricY + metricH * 0.55,
      w: rightColW - 0.6,
      h: metricH * 0.38,
      fontSize: 11,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
      align: "center",
    });
  } else if (mediaItem) {
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

  const listElem = page.elements.find((e) => e.type === "list") as any;
  const cardItems =
    listElem && listElem.items && listElem.items.length > 0
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
          title: elem.title || elem.content || elem.value || `Pillar 0${idx + 1}`,
          subtext: elem.subtext || elem.label || (elem.value && elem.label ? `${elem.label}` : "") || "",
        }));

  for (let i = 0; i < 3; i++) {
    const x = marginX + i * (cardW + gutter);
    const item = cardItems[i] || {
      id: `card-${i}`,
      title: `Pillar 0${i + 1}`,
      subtext: "",
    };

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

    // Step / Pillar Index badge pill
    slide.addShape("roundRect", {
      x: x + 0.35,
      y: contentStartY + 0.35,
      w: 0.65,
      h: 0.3,
      fill: { color: tokens.colors.background },
      line: { color: tokens.colors.secondary, width: 1 },
      rectRadius: 0.08,
    });
    slide.addText(`0${i + 1}`, {
      x: x + 0.35,
      y: contentStartY + 0.35,
      w: 0.65,
      h: 0.3,
      fontSize: 10,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Card Title
    const fitTitle = calculateTextFitting(item.title, cardW - 0.7, 1.6, 14);
    const titleH = Math.min(1.8, Math.max(0.7, fitTitle.cleanText.length > 80 ? 1.5 : fitTitle.cleanText.length > 40 ? 1.1 : 0.7));
    slide.addText(fitTitle.cleanText, {
      x: x + 0.35,
      y: contentStartY + 0.85,
      w: cardW - 0.7,
      h: titleH,
      fontSize: fitTitle.adjustedFontSizePt,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
      valign: "top",
    });

    // Card Subtext / Description
    if (item.subtext) {
      const subY = contentStartY + 0.85 + titleH + 0.15;
      const subAvailH = Math.max(0.6, cardH - (subY - contentStartY) - 0.3);
      const fitSub = calculateTextFitting(item.subtext, cardW - 0.7, subAvailH, 10.5);
      slide.addText(fitSub.cleanText, {
        x: x + 0.35,
        y: subY,
        w: cardW - 0.7,
        h: subAvailH,
        fontSize: fitSub.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
        valign: "top",
      });
    }
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

  // Check if there are non-metric elements (notes, takeaways, explanations)
  const nonMetrics = page.elements.filter(
    (e) => e.type !== "metric" && e.id !== "poster-title" && e.id !== "poster-subtitle"
  );
  const hasBottomContent = nonMetrics.length > 0;
  const cardH = hasBottomContent ? 2.5 : ctx.slideH - contentStartY - 0.7;

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
      y: contentStartY + (hasBottomContent ? 0.35 : 0.6),
      w: cardW - 0.4,
      h: hasBottomContent ? 0.9 : 1.1,
      fontSize: hasBottomContent ? 30 : 36,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Metric Label
    slide.addText(m.label, {
      x: x + 0.2,
      y: contentStartY + (hasBottomContent ? 1.3 : 1.8),
      w: cardW - 0.4,
      h: hasBottomContent ? 0.6 : 0.9,
      fontSize: tokens.typography.bodySizePt,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
      align: "center",
    });

    // Delta pill / context tag
    if (m.delta) {
      const isShort = m.delta.length <= 8;
      const pillW = isShort ? 1.4 : Math.min(cardW - 0.4, Math.max(1.8, m.delta.length * 0.08 + 0.5));
      const pillH = isShort ? 0.35 : 0.45;
      const pillY = contentStartY + (hasBottomContent ? 1.95 : cardH - 0.85);
      const pillX = x + (cardW - pillW) / 2;

      slide.addShape("roundRect", {
        x: pillX,
        y: pillY,
        w: pillW,
        h: pillH,
        fill: { color: m.trend === "up" ? "DCFCE7" : tokens.colors.background },
        line: { color: m.trend === "up" ? "16A34A" : tokens.colors.border, width: 1 },
        rectRadius: 0.1,
      });

      const fitD = calculateTextFitting(m.delta, pillW - 0.2, pillH, isShort ? 10 : 8.5);
      slide.addText(fitD.cleanText, {
        x: pillX + 0.1,
        y: pillY,
        w: pillW - 0.2,
        h: pillH,
        fontSize: fitD.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: m.trend === "up" ? "15803D" : tokens.colors.textPrimary,
        bold: true,
        align: "center",
        valign: "middle",
      });
    }
  });

  // Render bottom non-metric container card if non-metric elements exist
  if (hasBottomContent) {
    const bottomY = contentStartY + cardH + 0.3;
    const bottomH = Math.max(0.8, ctx.slideH - bottomY - 0.7);

    slide.addShape("roundRect", {
      x: marginX,
      y: bottomY,
      w: availableW,
      h: bottomH,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.border, width: 1 },
      rectRadius: tokens.style.borderRadius,
    });

    let textY = bottomY + 0.2;
    for (const elem of nonMetrics.slice(0, 3)) {
      if (textY > bottomY + bottomH - 0.3) break;
      if (elem.type === "text" && "content" in elem) {
        const fit = calculateTextFitting(elem.content, availableW - 0.6, 0.5, 12);
        slide.addText(fit.cleanText, {
          x: marginX + 0.3,
          y: textY,
          w: availableW - 0.6,
          h: 0.45,
          fontSize: fit.adjustedFontSizePt,
          fontFace: tokens.typography.bodyFont,
          color: tokens.colors.textSecondary,
        });
        textY += 0.5;
      } else if (elem.type === "list" && "items" in elem) {
        elem.items.slice(0, 2).forEach((it) => {
          if (textY > bottomY + bottomH - 0.3) return;
          const fit = calculateTextFitting(it.text, availableW - 0.6, 0.45, 11);
          slide.addText(`•  ${fit.cleanText}`, {
            x: marginX + 0.3,
            y: textY,
            w: availableW - 0.6,
            h: 0.4,
            fontSize: fit.adjustedFontSizePt,
            fontFace: tokens.typography.bodyFont,
            color: tokens.colors.textSecondary,
          });
          textY += 0.45;
        });
      }
    }
  }
}

/**
 * 7. Comparison Table / Matrix
 */
export function renderComparison(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const availableW = ctx.slideW - marginX * 2;
  const gutter = tokens.spacing.gutterInches;

  const tableElem = page.elements.find(
    (e): e is Extract<ContentElement, { type: "table" }> => e.type === "table"
  );

  if (tableElem && tableElem.headers && tableElem.headers.length > 0) {
    const headers = tableElem.headers;
    const rows = tableElem.rows || [];
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
      x: marginX,
      y: contentStartY,
      w: availableW,
      colW: availableW / headers.length,
      border: { type: "solid", pt: 1, color: tokens.colors.border },
    });
    return;
  }

  // Multi-column comparison cards (as generated by plan-to-slides / PageRenderer)
  interface ComparisonColumn {
    title: string;
    points: string[];
    isHighlighted?: boolean;
  }

  const columns: ComparisonColumn[] = [];

  // Check for comp-0-title, comp-1-title pattern or h3 text headings
  const titleEls = page.elements.filter(
    (e): e is Extract<ContentElement, { type: "text" }> =>
      e.type === "text" && (e.id.includes("comp-") || (e as any).variant === "h3")
  );

  if (titleEls.length >= 2) {
    titleEls.forEach((tEl, idx) => {
      const matchingList = page.elements.find(
        (e): e is Extract<ContentElement, { type: "list" }> =>
          e.type === "list" && (e.id.includes(`comp-${idx}`) || e.id.includes(`comp-${idx}-pts`))
      ) || page.elements.filter((e): e is Extract<ContentElement, { type: "list" }> => e.type === "list")[idx];

      const points = matchingList?.items?.map((it) => it.text) || [];
      columns.push({
        title: tEl.content,
        points,
        isHighlighted: idx === 1,
      });
    });
  } else {
    const listEls = page.elements.filter(
      (e): e is Extract<ContentElement, { type: "list" }> => e.type === "list"
    );
    if (listEls.length >= 2) {
      listEls.forEach((lEl, idx) => {
        columns.push({
          title: `Option 0${idx + 1}`,
          points: lEl.items.map((it) => it.text),
          isHighlighted: idx === 1,
        });
      });
    } else if (listEls.length === 1 && listEls[0].items.length >= 2) {
      const half = Math.ceil(listEls[0].items.length / 2);
      columns.push({
        title: "Baseline Considerations",
        points: listEls[0].items.slice(0, half).map((it) => it.text),
        isHighlighted: false,
      });
      columns.push({
        title: "Proposed Strategic Focus",
        points: listEls[0].items.slice(half).map((it) => it.text),
        isHighlighted: true,
      });
    } else {
      columns.push({
        title: "Current Baseline",
        points: ["Conventional heuristic workflows", "Fragmented status tracking", "Manual operational overhead"],
        isHighlighted: false,
      });
      columns.push({
        title: "Optimized Target State",
        points: ["Automated continuous evaluation", "Unified real-time visibility", "Standardized quality guardrails"],
        isHighlighted: true,
      });
    }
  }

  const colCount = Math.min(Math.max(columns.length, 1), 3);
  const cardW = (availableW - gutter * (colCount - 1)) / colCount;
  const cardH = ctx.slideH - contentStartY - 0.7;

  columns.slice(0, 3).forEach((col, idx) => {
    const x = marginX + idx * (cardW + gutter);

    // Column Card Container
    slide.addShape("roundRect", {
      x,
      y: contentStartY,
      w: cardW,
      h: cardH,
      fill: { color: tokens.colors.surface },
      line: {
        color: col.isHighlighted ? tokens.colors.secondary : tokens.colors.border,
        width: col.isHighlighted ? 2 : 1,
      },
      rectRadius: tokens.style.borderRadius,
    });

    // Header badge / index pill
    slide.addShape("roundRect", {
      x: x + 0.3,
      y: contentStartY + 0.35,
      w: 0.7,
      h: 0.3,
      fill: { color: col.isHighlighted ? tokens.colors.secondary : tokens.colors.background },
      line: { color: col.isHighlighted ? tokens.colors.secondary : tokens.colors.border, width: 1 },
      rectRadius: 0.08,
    });

    slide.addText(`0${idx + 1}`, {
      x: x + 0.3,
      y: contentStartY + 0.35,
      w: 0.7,
      h: 0.3,
      fontSize: 10,
      fontFace: tokens.typography.headingFont,
      color: col.isHighlighted ? "FFFFFF" : tokens.colors.textSecondary,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Column Title
    slide.addText(col.title, {
      x: x + 0.3,
      y: contentStartY + 0.8,
      w: cardW - 0.6,
      h: 0.7,
      fontSize: 16,
      fontFace: tokens.typography.headingFont,
      color: col.isHighlighted ? tokens.colors.secondary : tokens.colors.textPrimary,
      bold: true,
    });

    // Divider line
    slide.addShape("line", {
      x: x + 0.3,
      y: contentStartY + 1.55,
      w: cardW - 0.6,
      h: 0,
      line: { color: tokens.colors.border, width: 1 },
    });

    // Points
    let pY = contentStartY + 1.75;
    col.points.forEach((pt) => {
      if (pY > contentStartY + cardH - 0.5) return;
      const fit = calculateTextFitting(pt, cardW - 0.9, 0.6, 11);
      slide.addText(`•  ${fit.cleanText}`, {
        x: x + 0.3,
        y: pY,
        w: cardW - 0.6,
        h: 0.5,
        fontSize: fit.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
      });
      pY += 0.55;
    });
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
  const gutter = tokens.spacing.gutterInches;

  const listElem = page.elements.find(
    (e): e is Extract<ContentElement, { type: "list" }> => e.type === "list"
  );
  const textElems = page.elements.filter(
    (e): e is Extract<ContentElement, { type: "text" }> => e.type === "text"
  );

  let milestones: { phase: string; title: string; desc: string }[] = [];

  if (listElem && listElem.items && listElem.items.length > 0) {
    milestones = listElem.items.slice(0, 5).map((it, idx) => {
      let title = it.text;
      let desc = it.subtext || "";
      if (!desc && it.text) {
        if (it.text.includes(":")) {
          const parts = it.text.split(/:\s*(.*)/s);
          title = parts[0].trim();
          desc = (parts[1] || "").trim();
        } else if (it.text.includes(" — ")) {
          const parts = it.text.split(/ — \s*(.*)/s);
          title = parts[0].trim();
          desc = (parts[1] || "").trim();
        }
      }
      return {
        phase: `0${idx + 1}`,
        title,
        desc,
      };
    });
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
      { phase: "01", title: "Initiation", desc: `Strategic scope and baseline planning for ${page.title}` },
      { phase: "02", title: "Execution", desc: "Core implementation and workflow orchestration" },
      { phase: "03", title: "Validation", desc: "Rigorous testing and benchmark verification" },
      { phase: "04", title: "Deployment", desc: "Production rollout and operational governance" },
    ];
  }

  const count = Math.min(milestones.length, 5);
  const cardW = (availableW - gutter * (count - 1)) / count;
  const cardH = 2.8;
  const cardY = contentStartY + 0.6;

  // Horizontal connector line connecting across the cards
  slide.addShape("line", {
    x: marginX + cardW * 0.3,
    y: cardY - 0.25,
    w: availableW - cardW * 0.6,
    h: 0,
    line: { color: tokens.colors.secondary, width: 2 },
  });

  milestones.slice(0, 5).forEach((m, idx) => {
    const x = marginX + idx * (cardW + gutter);

    // Connector node circle above card
    slide.addShape("ellipse", {
      x: x + cardW / 2 - 0.15,
      y: cardY - 0.4,
      w: 0.3,
      h: 0.3,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.secondary, width: 2 },
    });

    // Milestone Card Container
    slide.addShape("roundRect", {
      x,
      y: cardY,
      w: cardW,
      h: cardH,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.border, width: 1 },
      rectRadius: tokens.style.borderRadius,
    });

    // Phase Pill
    slide.addShape("roundRect", {
      x: x + 0.25,
      y: cardY + 0.25,
      w: 0.65,
      h: 0.3,
      fill: { color: tokens.colors.secondary, transparency: 85 },
      line: { color: tokens.colors.secondary, width: 1 },
      rectRadius: 0.08,
    });

    slide.addText(m.phase, {
      x: x + 0.25,
      y: cardY + 0.25,
      w: 0.65,
      h: 0.3,
      fontSize: 10,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Milestone Title
    const fitT = calculateTextFitting(m.title, cardW - 0.5, 0.6, 12);
    slide.addText(fitT.cleanText, {
      x: x + 0.25,
      y: cardY + 0.7,
      w: cardW - 0.5,
      h: 0.6,
      fontSize: fitT.adjustedFontSizePt,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
    });

    // Milestone Description
    if (m.desc) {
      const fitD = calculateTextFitting(m.desc, cardW - 0.5, cardH - 1.5, 10);
      slide.addText(fitD.cleanText, {
        x: x + 0.25,
        y: cardY + 1.35,
        w: cardW - 0.5,
        h: cardH - 1.5,
        fontSize: fitD.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
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
  const gutter = 0.35;

  const listElem = page.elements.find(
    (e): e is Extract<ContentElement, { type: "list" }> => e.type === "list"
  );
  const textElems = page.elements.filter(
    (e): e is Extract<ContentElement, { type: "text" }> => e.type === "text"
  );

  let steps: { title: string; desc: string }[] = [];

  if (listElem && listElem.items && listElem.items.length > 0) {
    steps = listElem.items.slice(0, 5).map((it) => {
      let title = it.text;
      let desc = it.subtext || "";
      if (!desc && it.text) {
        if (it.text.includes(":")) {
          const parts = it.text.split(/:\s*(.*)/s);
          title = parts[0].trim();
          desc = (parts[1] || "").trim();
        } else if (it.text.includes(" — ")) {
          const parts = it.text.split(/ — \s*(.*)/s);
          title = parts[0].trim();
          desc = (parts[1] || "").trim();
        }
      }
      return { title, desc };
    });
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
      { title: "Initiation", desc: `Scope and discovery for ${page.title}` },
      { title: "Execution", desc: "Core implementation and workflow coordination" },
      { title: "Quality Review", desc: "Automated verification and validation standards" },
      { title: "Deployment", desc: "Production rollout and operational handover" },
    ];
  }

  const count = Math.min(steps.length, 5);
  const cardW = (availableW - gutter * (count - 1)) / count;
  const cardH = 2.9;

  steps.slice(0, 5).forEach((s, idx) => {
    const x = marginX + idx * (cardW + gutter);

    slide.addShape("roundRect", {
      x,
      y: contentStartY + 0.4,
      w: cardW,
      h: cardH,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.border, width: 1 },
      rectRadius: tokens.style.borderRadius,
    });

    slide.addShape("roundRect", {
      x: x + 0.2,
      y: contentStartY + 0.65,
      w: 0.8,
      h: 0.3,
      fill: { color: tokens.colors.secondary, transparency: 85 },
      line: { color: tokens.colors.secondary, width: 1 },
      rectRadius: 0.08,
    });

    slide.addText(`Step 0${idx + 1}`, {
      x: x + 0.2,
      y: contentStartY + 0.65,
      w: 0.8,
      h: 0.3,
      fontSize: 10,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
      valign: "middle",
    });

    const fitT = calculateTextFitting(s.title, cardW - 0.4, 0.5, 13);
    slide.addText(fitT.cleanText, {
      x: x + 0.2,
      y: contentStartY + 1.1,
      w: cardW - 0.4,
      h: 0.5,
      fontSize: fitT.adjustedFontSizePt,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
    });

    if (s.desc) {
      const fitD = calculateTextFitting(s.desc, cardW - 0.4, cardH - 1.8, 10);
      slide.addText(fitD.cleanText, {
        x: x + 0.2,
        y: contentStartY + 1.65,
        w: cardW - 0.4,
        h: cardH - 1.8,
        fontSize: fitD.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
      });
    }

    // Connector arrow line between cards
    if (idx < count - 1) {
      const arrowX = x + cardW;
      slide.addShape("line", {
        x: arrowX + 0.05,
        y: contentStartY + 0.4 + cardH / 2,
        w: gutter - 0.1,
        h: 0,
        line: { color: tokens.colors.secondary, width: 1.5 },
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

  // Render actual non-chart elements from page.elements
  const nonChartElems = page.elements.filter((e) => e.type !== "chart");
  let curY = contentStartY + 0.85;
  if (nonChartElems.length > 0) {
    for (const elem of nonChartElems) {
      if (curY > contentStartY + chartH - 0.4) break;
      if (elem.type === "text" && "content" in elem) {
        const fit = calculateTextFitting(elem.content, rightW - 0.6, 0.8, 11);
        slide.addText(fit.cleanText, {
          x: rightX + 0.3,
          y: curY,
          w: rightW - 0.6,
          h: 0.8,
          fontSize: fit.adjustedFontSizePt,
          fontFace: tokens.typography.bodyFont,
          color: tokens.colors.textSecondary,
        });
        curY += 0.9;
      } else if (elem.type === "list" && "items" in elem) {
        elem.items.slice(0, 4).forEach((it) => {
          if (curY > contentStartY + chartH - 0.4) return;
          const fit = calculateTextFitting(it.text, rightW - 0.6, 0.4, 10.5);
          slide.addText(`•  ${fit.cleanText}`, {
            x: rightX + 0.3,
            y: curY,
            w: rightW - 0.6,
            h: 0.4,
            fontSize: fit.adjustedFontSizePt,
            fontFace: tokens.typography.bodyFont,
            color: tokens.colors.textSecondary,
          });
          curY += 0.45;
        });
      } else if (elem.type === "metric") {
        slide.addText(`${elem.value}  ${elem.label}`, {
          x: rightX + 0.3,
          y: curY,
          w: rightW - 0.6,
          h: 0.5,
          fontSize: 14,
          fontFace: tokens.typography.headingFont,
          bold: true,
          color: tokens.colors.secondary,
        });
        curY += 0.6;
      }
    }
  } else {
    slide.addText(page.subtitle || `Key observations and metric trends for ${page.title}.`, {
      x: rightX + 0.3,
      y: curY,
      w: rightW - 0.6,
      h: chartH - 1.2,
      fontSize: 11.5,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
    });
  }
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
 * 16. Closing Slide (Contact & Next Steps) — matches PageRenderer 63/33 Studio Layout
 */
export function renderClosingSlide(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const { contentStartY } = renderSlideHeader(slide, page, ctx);
  renderSlideFooter(slide, page, ctx);

  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const availableW = ctx.slideW - marginX * 2;

  // Left 63% rail: All page elements (heading, bullet lists, notes)
  const leftW = availableW * 0.63;
  const leftX = marginX;

  const leftElements = page.elements;
  let elemY = contentStartY + 0.2;

  leftElements.forEach((elem) => {
    if (elemY > ctx.slideH - 1.2) return;

    if (elem.type === "text" && "content" in elem) {
      const isHeading = (elem as any).variant === "h3" || (elem as any).variant === "h2";
      const fontSize = isHeading ? 16 : 11;
      const fit = calculateTextFitting(elem.content, leftW, isHeading ? 0.6 : 0.8, fontSize);

      slide.addText(fit.cleanText, {
        x: leftX,
        y: elemY,
        w: leftW,
        h: isHeading ? 0.5 : 0.7,
        fontSize: fit.adjustedFontSizePt,
        fontFace: isHeading ? tokens.typography.headingFont : tokens.typography.bodyFont,
        color: isHeading ? tokens.colors.secondary : tokens.colors.textPrimary,
        bold: isHeading,
      });
      elemY += isHeading ? 0.6 : 0.75;
    } else if (elem.type === "list" && "items" in elem) {
      elem.items.slice(0, 5).forEach((it) => {
        if (elemY > ctx.slideH - 1.2) return;
        const textStr = it.subtext ? `${it.text}: ${it.subtext}` : it.text;
        const fit = calculateTextFitting(textStr, leftW - 0.3, 0.6, 11);

        slide.addText(`•  ${fit.cleanText}`, {
          x: leftX + 0.1,
          y: elemY,
          w: leftW - 0.1,
          h: 0.5,
          fontSize: fit.adjustedFontSizePt,
          fontFace: tokens.typography.bodyFont,
          color: tokens.colors.textSecondary,
        });
        elemY += 0.55;
      });
    }
  });

  // Right 33% Studio Closing Card (matching PageRenderer)
  const rightW = availableW * 0.33;
  const rightX = marginX + leftW + availableW * 0.04;
  const cardH = ctx.slideH - contentStartY - 0.7;

  slide.addShape("roundRect", {
    x: rightX,
    y: contentStartY,
    w: rightW,
    h: cardH,
    fill: { color: tokens.colors.surface },
    line: { color: tokens.colors.border, width: 1 },
    rectRadius: tokens.style.borderRadius,
  });

  // Studio Logo Icon
  const iconSize = 0.8;
  const iconX = rightX + (rightW - iconSize) / 2;
  const iconY = contentStartY + 0.8;

  slide.addShape("roundRect", {
    x: iconX,
    y: iconY,
    w: iconSize,
    h: iconSize,
    fill: { color: tokens.colors.secondary, transparency: 85 },
    line: { color: tokens.colors.secondary, width: 1 },
    rectRadius: 0.15,
  });

  slide.addText("SC", {
    x: iconX,
    y: iconY,
    w: iconSize,
    h: iconSize,
    fontSize: 16,
    fontFace: tokens.typography.headingFont,
    color: tokens.colors.secondary,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Studio Name & Brand
  slide.addText("SLIDECRAFT STUDIO", {
    x: rightX + 0.2,
    y: iconY + iconSize + 0.3,
    w: rightW - 0.4,
    h: 0.35,
    fontSize: 12,
    fontFace: tokens.typography.headingFont,
    color: tokens.colors.textPrimary,
    bold: true,
    align: "center",
  });

  slide.addText(page.subtitle || page.title || "Executive Briefing", {
    x: rightX + 0.2,
    y: iconY + iconSize + 0.7,
    w: rightW - 0.4,
    h: 0.6,
    fontSize: 10,
    fontFace: tokens.typography.bodyFont,
    color: tokens.colors.textSecondary,
    align: "center",
  });

  // Confidential Pill
  const pillW = 2.2;
  const pillX = rightX + (rightW - pillW) / 2;
  const pillY = contentStartY + cardH - 0.8;

  slide.addShape("roundRect", {
    x: pillX,
    y: pillY,
    w: pillW,
    h: 0.35,
    fill: { color: tokens.colors.surface },
    line: { color: tokens.colors.secondary, width: 1 },
    rectRadius: 0.15,
  });

  slide.addText("Confidential & Proprietary", {
    x: pillX,
    y: pillY,
    w: pillW,
    h: 0.35,
    fontSize: 9,
    fontFace: tokens.typography.bodyFont,
    color: tokens.colors.secondary,
    align: "center",
    valign: "middle",
  });
}

/**
 * 17. Poster Slide (Event & Research Posters) - Matches PageRenderer Tiered Layout
 */
export function renderPosterSlide(slide: pptxgen.Slide, page: PageSpec, ctx: RenderContext) {
  const tokens = ctx.tokens;
  const marginX = tokens.spacing.marginXInches;
  const availableW = ctx.slideW - marginX * 2;

  // Tier 1: Top Hero Section
  let curY = 0.5;
  if (page.badge) {
    const cleanBadge = sanitizeBadge(page.badge);
    slide.addText(cleanBadge, {
      x: marginX,
      y: curY,
      w: availableW,
      h: 0.35,
      fontSize: 10,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
      bold: true,
      align: "center",
    });
    curY += 0.4;
  }

  const fitTitle = calculateTextFitting(page.title, availableW, 1.0, 28);
  slide.addText(fitTitle.cleanText, {
    x: marginX,
    y: curY,
    w: availableW,
    h: 0.9,
    fontSize: fitTitle.adjustedFontSizePt,
    fontFace: tokens.typography.headingFont,
    color: tokens.colors.textPrimary,
    bold: true,
    align: "center",
  });
  curY += 0.95;

  if (page.subtitle) {
    const fitSub = calculateTextFitting(page.subtitle, availableW - 1.0, 0.5, 12);
    slide.addText(fitSub.cleanText, {
      x: marginX + 0.5,
      y: curY,
      w: availableW - 1.0,
      h: 0.5,
      fontSize: fitSub.adjustedFontSizePt,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
      align: "center",
    });
    curY += 0.55;
  }

  // Tier 2: 2-Column Responsive Body Grid
  const gutter = 0.35;
  const colW = (availableW - gutter) / 2;
  const bodyY = curY + 0.2;
  const footerH = 0.8;
  const bodyH = Math.max(2.0, ctx.slideH - bodyY - footerH - 0.4);

  // Left column: Event details & general text elements
  const leftX = marginX;
  const eventDetails = page.elements.find((e) => e.type === "event_details") as any;
  const otherTexts = page.elements.filter(
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

  let leftY = bodyY;
  if (eventDetails) {
    slide.addShape("roundRect", {
      x: leftX,
      y: leftY,
      w: colW,
      h: 1.8,
      fill: { color: tokens.colors.surface },
      line: { color: tokens.colors.border, width: 1 },
      rectRadius: tokens.style.borderRadius,
    });

    slide.addText("DATE & TIME", {
      x: leftX + 0.2,
      y: leftY + 0.15,
      w: colW - 0.4,
      h: 0.25,
      fontSize: 9,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
      bold: true,
    });
    slide.addText(`${eventDetails.date || ""} ${eventDetails.time ? "• " + eventDetails.time : ""}`.trim() || "Event Schedule", {
      x: leftX + 0.2,
      y: leftY + 0.4,
      w: colW - 0.4,
      h: 0.35,
      fontSize: 12,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.textPrimary,
      bold: true,
    });

    if (eventDetails.location) {
      slide.addText("LOCATION", {
        x: leftX + 0.2,
        y: leftY + 0.85,
        w: colW - 0.4,
        h: 0.25,
        fontSize: 9,
        fontFace: tokens.typography.headingFont,
        color: tokens.colors.secondary,
        bold: true,
      });
      slide.addText(eventDetails.location, {
        x: leftX + 0.2,
        y: leftY + 1.1,
        w: colW - 0.4,
        h: 0.5,
        fontSize: 11,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textPrimary,
      });
    }
    leftY += 2.0;
  }

  for (const ot of otherTexts.slice(0, 2)) {
    if (leftY > bodyY + bodyH - 0.5) break;
    if (ot.type === "text" && "content" in ot) {
      slide.addShape("roundRect", {
        x: leftX,
        y: leftY,
        w: colW,
        h: 1.1,
        fill: { color: tokens.colors.surface },
        line: { color: tokens.colors.border, width: 1 },
        rectRadius: tokens.style.borderRadius,
      });
      const fit = calculateTextFitting(ot.content, colW - 0.4, 0.8, 11);
      slide.addText(fit.cleanText, {
        x: leftX + 0.2,
        y: leftY + 0.15,
        w: colW - 0.4,
        h: 0.8,
        fontSize: fit.adjustedFontSizePt,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
      });
      leftY += 1.25;
    }
  }

  // Right column: Speaker cards & Metrics & Sponsors
  const rightX = marginX + colW + gutter;
  const speakers = page.elements.filter((e) => e.type === "speaker_card") as any[];
  const metrics = page.elements.filter((e) => e.type === "metric") as any[];
  let rightY = bodyY;

  if (speakers.length > 0) {
    slide.addText("FEATURED SPEAKERS", {
      x: rightX,
      y: rightY,
      w: colW,
      h: 0.3,
      fontSize: 9,
      fontFace: tokens.typography.headingFont,
      color: tokens.colors.secondary,
      bold: true,
    });
    rightY += 0.35;

    speakers.slice(0, 2).forEach((sp) => {
      slide.addShape("roundRect", {
        x: rightX,
        y: rightY,
        w: colW,
        h: 0.95,
        fill: { color: tokens.colors.surface },
        line: { color: tokens.colors.border, width: 1 },
        rectRadius: tokens.style.borderRadius,
      });
      slide.addText(sp.name || "Distinguished Speaker", {
        x: rightX + 0.2,
        y: rightY + 0.15,
        w: colW - 0.4,
        h: 0.35,
        fontSize: 12,
        fontFace: tokens.typography.headingFont,
        color: tokens.colors.textPrimary,
        bold: true,
      });
      slide.addText(`${sp.title || ""}${sp.company ? " • " + sp.company : ""}`.trim() || sp.role || "", {
        x: rightX + 0.2,
        y: rightY + 0.5,
        w: colW - 0.4,
        h: 0.35,
        fontSize: 10,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
      });
      rightY += 1.1;
    });
  }

  if (metrics.length > 0 && rightY < bodyY + bodyH - 0.6) {
    const metricW = (colW - 0.2 * (Math.min(metrics.length, 2) - 1)) / Math.min(metrics.length, 2);
    metrics.slice(0, 2).forEach((m, idx) => {
      const mx = rightX + idx * (metricW + 0.2);
      slide.addShape("roundRect", {
        x: mx,
        y: rightY,
        w: metricW,
        h: 1.1,
        fill: { color: tokens.colors.surface },
        line: { color: tokens.colors.border, width: 1 },
        rectRadius: tokens.style.borderRadius,
      });
      slide.addText(m.value, {
        x: mx + 0.1,
        y: rightY + 0.15,
        w: metricW - 0.2,
        h: 0.45,
        fontSize: 20,
        fontFace: tokens.typography.headingFont,
        color: tokens.colors.secondary,
        bold: true,
        align: "center",
      });
      slide.addText(m.label, {
        x: mx + 0.1,
        y: rightY + 0.6,
        w: metricW - 0.2,
        h: 0.4,
        fontSize: 9,
        fontFace: tokens.typography.bodyFont,
        color: tokens.colors.textSecondary,
        align: "center",
      });
    });
  }

  // Tier 3: Bottom Action Row
  const footerY = ctx.slideH - footerH - 0.3;
  slide.addShape("roundRect", {
    x: marginX,
    y: footerY,
    w: availableW,
    h: footerH,
    fill: { color: tokens.colors.surface },
    line: { color: tokens.colors.border, width: 1 },
    rectRadius: tokens.style.borderRadius,
  });

  const cta = page.elements.find((e) => e.type === "cta_badge") as any;
  const organizer = page.elements.find((e) => e.type === "organizer_info") as any;

  if (cta) {
    slide.addShape("roundRect", {
      x: marginX + 0.3,
      y: footerY + 0.2,
      w: 2.2,
      h: 0.4,
      fill: { color: tokens.colors.secondary },
      rectRadius: 0.1,
    });
    slide.addText(cta.text || cta.label || "Register Now", {
      x: marginX + 0.3,
      y: footerY + 0.2,
      w: 2.2,
      h: 0.4,
      fontSize: 11,
      fontFace: tokens.typography.headingFont,
      color: "FFFFFF",
      bold: true,
      align: "center",
      valign: "middle",
    });
  }

  if (organizer) {
    slide.addText(`Organized by: ${organizer.name || "Host Organization"}`, {
      x: marginX + 2.8,
      y: footerY + 0.2,
      w: availableW - 3.2,
      h: 0.4,
      fontSize: 10,
      fontFace: tokens.typography.bodyFont,
      color: tokens.colors.textSecondary,
      valign: "middle",
    });
  }
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

  if (src) {
    try {
      if (src.startsWith("data:image/svg+xml;utf8,") || src.startsWith("data:image/svg+xml;charset=utf-8,")) {
        const rawSvg = decodeURIComponent(src.replace(/^data:image\/svg\+xml;[^,]+,/, ""));
        const b64 =
          typeof Buffer !== "undefined"
            ? Buffer.from(rawSvg).toString("base64")
            : btoa(unescape(encodeURIComponent(rawSvg)));
        slide.addImage({ data: `image/svg+xml;base64,${b64}`, x, y, w, h });
        return;
      } else if (src.startsWith("data:image/svg+xml;base64,") || src.startsWith("image/svg+xml;base64,")) {
        const cleanData = src.startsWith("data:") ? src.replace(/^data:/, "") : src;
        slide.addImage({ data: cleanData, x, y, w, h });
        return;
      } else if (src.startsWith("data:image/")) {
        const cleanData = src.startsWith("data:") ? src.replace(/^data:/, "") : src;
        slide.addImage({ data: cleanData, x, y, w, h });
        return;
      } else if (src.startsWith("<svg")) {
        const b64 =
          typeof Buffer !== "undefined"
            ? Buffer.from(src).toString("base64")
            : btoa(unescape(encodeURIComponent(src)));
        slide.addImage({ data: `image/svg+xml;base64,${b64}`, x, y, w, h });
        return;
      } else if (src.startsWith("http://") || src.startsWith("https://")) {
        slide.addImage({ path: src, x, y, w, h });
        return;
      }
    } catch (imgErr) {
      console.warn("[renderMediaElement] image add failed, falling back to vector card container:", imgErr);
    }
  }

  // Draw styled media placeholder box matching PageRenderer surface card
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: ctx.tokens.colors.surface },
    line: { color: ctx.tokens.colors.border, width: 1 },
    rectRadius: ctx.tokens.style.borderRadius,
  });

  const minDim = Math.min(w, h);
  slide.addShape("ellipse", {
    x: x + (w - minDim * 0.45) / 2,
    y: y + (h - minDim * 0.45) / 2,
    w: minDim * 0.45,
    h: minDim * 0.45,
    fill: { color: ctx.tokens.colors.background },
    line: { color: ctx.tokens.colors.secondary, width: 1.5 },
  });

  slide.addText(elem.alt || "Visual Asset", {
    x: x + 0.2,
    y: y + h - 0.7,
    w: w - 0.4,
    h: 0.5,
    fontSize: 10,
    fontFace: ctx.tokens.typography.bodyFont,
    color: ctx.tokens.colors.textSecondary,
    align: "center",
    valign: "middle",
  });
}


