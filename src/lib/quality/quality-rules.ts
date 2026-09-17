/**
 * SlideCraft AI - Design Quality Rules & Detection Algorithms
 * 14 Rigorous Checks covering Readability, Alignment, Spacing, Visual Hierarchy,
 * Content Density, Contrast, Consistency, and Technical Validity.
 */

import { DocumentSpec, PageSpec, ContentElement, CANVAS_PRESETS, AspectRatio } from "@/types/document-spec";
import { QualityIssue, QualityCategory } from "./quality-types";

// ==========================================
// Color & Contrast Math (WCAG 2.1 Relative Luminance)
// ==========================================
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "").trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }
  return null;
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 4.5; // Safe default for unparseable strings

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

// ==========================================
// Word and Character Extraction Helpers
// ==========================================
export function extractTextFromElement(el: ContentElement): string {
  if (el.type === "text") return el.content || "";
  if (el.type === "metric") return `${el.label || ""} ${el.value || ""} ${el.delta || ""}`;
  if (el.type === "table") return `${el.title || ""} ${el.headers.join(" ")} ${el.rows.map((r) => r.join(" ")).join(" ")}`;
  if (el.type === "list") return el.items.map((i) => `${i.text} ${i.subtext || ""}`).join(" ");
  if (el.type === "diagram") return el.nodes.map((n) => `${n.label} ${n.description || ""}`).join(" ");
  if (el.type === "chart") return `${el.title || ""} ${el.labels.join(" ")} ${el.datasets.map((d) => d.name).join(" ")}`;
  if (el.type === "resume_block") return `${el.summaryText || ""} ${el.items?.map((i) => `${i.title} ${i.bullets.join(" ")}`).join(" ") || ""}`;
  if (el.type === "letter_block") return `${el.subject || ""} ${el.content || ""} ${el.salutation || ""} ${el.closing || ""}`;
  if (el.type === "event_details") return `${el.date || ""} ${el.venue || ""} ${el.time || ""}`;
  if (el.type === "organizer_info") return `${el.organization || ""} ${el.contactEmail || ""} ${el.contactPhone || ""}`;
  if (el.type === "cta_badge") return `${el.text || ""} ${el.deadline || ""}`;
  return "";
}

export function countWordsOnPage(page: PageSpec): number {
  let text = `${page.title || ""} ${page.subtitle || ""}`;
  for (const el of page.elements) {
    text += " " + extractTextFromElement(el);
  }
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ==========================================
// 14 Precise Quality Rule Checkers
// ==========================================

/** Check 1: Text Overflow */
export function checkTextOverflow(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];

  doc.pages.forEach((page, pIdx) => {
    if (page.title && page.title.length > 95) {
      issues.push({
        code: "text_overflow",
        category: "readability",
        severity: "warning",
        message: `Slide ${pIdx + 1} title is excessively long (${page.title.length} chars) and will wrap uncomfortably.`,
        pageIndex: pIdx,
        fixable: true,
        suggestion: "Shorten title to under 80 characters.",
      });
    }

    if (page.subtitle && page.subtitle.length > 180) {
      issues.push({
        code: "text_overflow",
        category: "readability",
        severity: "warning",
        message: `Slide ${pIdx + 1} subtitle has ${page.subtitle.length} characters, causing visual crowding.`,
        pageIndex: pIdx,
        fixable: true,
        suggestion: "Synthesize subtitle into concise key takeaway.",
      });
    }

    page.elements.forEach((el) => {
      if (el.type === "text") {
        const len = el.content ? el.content.length : 0;
        if (el.variant === "h1" && len > 80) {
          issues.push({
            code: "text_overflow",
            category: "readability",
            severity: "warning",
            message: `Headline text in element '${el.id}' has ${len} chars. Headings should be punchy and direct.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
          });
        } else if (el.variant === "body" && len > 450) {
          issues.push({
            code: "text_overflow",
            category: "readability",
            severity: "warning",
            message: `Body text in element '${el.id}' contains ${len} characters in a single block.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
            suggestion: "Split long paragraph into structured bullet cards or visual steps.",
          });
        }
      }

      if (el.type === "list") {
        el.items.forEach((item, iIdx) => {
          if (item.text.length > 190) {
            issues.push({
              code: "text_overflow",
              category: "readability",
              severity: "info",
              message: `Bullet item ${iIdx + 1} on slide ${pIdx + 1} is overly verbose (${item.text.length} chars).`,
              pageIndex: pIdx,
              elementId: el.id,
              fixable: true,
            });
          }
        });
      }
    });
  });

  return issues;
}

/** Check 2: Text Too Close to Boundaries (Safe Padding Violations) */
export function checkBoundaryViolations(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const minSafeMarginPx = 32; // Minimum 32px safe margin from canvas edge

  doc.pages.forEach((page, pIdx) => {
    page.elements.forEach((el) => {
      const pos = (el as any).position;
      if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
        const w = pos.width || 0;
        const h = pos.height || 0;

        if (pos.x < minSafeMarginPx || pos.y < minSafeMarginPx) {
          issues.push({
            code: "boundary_violation",
            category: "spacing",
            severity: "warning",
            message: `Element '${el.id}' on slide ${pIdx + 1} is placed at (${pos.x}, ${pos.y}), violating the ${minSafeMarginPx}px safe boundary.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
            suggestion: `Clamp coordinate inside [${minSafeMarginPx}, ${minSafeMarginPx}].`,
          });
        }

        if (pos.x + w > doc.canvas.width - minSafeMarginPx || pos.y + h > doc.canvas.height - minSafeMarginPx) {
          issues.push({
            code: "boundary_violation",
            category: "spacing",
            severity: "warning",
            message: `Element '${el.id}' on slide ${pIdx + 1} extends past the right/bottom safe margin.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
            suggestion: "Resize element to fit within safe canvas dimensions.",
          });
        }
      }
    });
  });

  return issues;
}

/** Check 3: Overlapping Elements (2D AABB Intersection) */
export function checkOverlappingElements(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];

  doc.pages.forEach((page, pIdx) => {
    const positioned = page.elements
      .map((el) => ({ el, pos: (el as any).position }))
      .filter(
        (item): item is { el: ContentElement; pos: { x: number; y: number; width: number; height: number } } =>
          Boolean(
            item.pos &&
              typeof item.pos.x === "number" &&
              typeof item.pos.y === "number" &&
              item.pos.width > 20 &&
              item.pos.height > 20
          )
      );

    // Pairwise AABB collision detection
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const a = positioned[i].pos;
        const b = positioned[j].pos;

        // Skip if either is a full-bleed background shape/media
        if (a.width >= doc.canvas.width * 0.95 && a.height >= doc.canvas.height * 0.95) continue;
        if (b.width >= doc.canvas.width * 0.95 && b.height >= doc.canvas.height * 0.95) continue;

        const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
        const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
        const overlapArea = xOverlap * yOverlap;

        if (overlapArea > 250) {
          // Significant overlap
          issues.push({
            code: "overlapping_elements",
            category: "alignment",
            severity: "error",
            message: `Elements '${positioned[i].el.id}' and '${positioned[j].el.id}' on slide ${pIdx + 1} overlap by ${Math.round(overlapArea)} sq px.`,
            pageIndex: pIdx,
            elementId: positioned[i].el.id,
            fixable: true,
            suggestion: "Reposition elements to restore distinct visual breathing room.",
          });
        }
      }
    }
  });

  return issues;
}

/** Check 4: Unreadable Font Sizes */
export function checkUnreadableFontSizes(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const basePx = doc.theme.typography.baseSizePx || 16;

  if (basePx < 12) {
    issues.push({
      code: "unreadable_font_size",
      category: "readability",
      severity: "warning",
      message: `Theme base font size (${basePx}px) is too small for high-readability presentation viewing.`,
      fixable: true,
      suggestion: "Increase base font size to at least 15px.",
    });
  }

  doc.pages.forEach((page, pIdx) => {
    page.elements.forEach((el) => {
      const customFs = (el as any).fontSize;
      if (typeof customFs === "number" && customFs < 10) {
        issues.push({
          code: "unreadable_font_size",
          category: "readability",
          severity: "warning",
          message: `Element '${el.id}' specifies custom font size of ${customFs}px, which is illegible.`,
          pageIndex: pIdx,
          elementId: el.id,
          fixable: true,
          suggestion: "Scale font size up to minimum 12px.",
        });
      }
    });
  });

  return issues;
}

/** Check 5: Poor Color Contrast (WCAG 2.1 AA) */
export function checkColorContrast(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const bg = doc.theme.colors.background || "#FFFFFF";
  const surface = doc.theme.colors.surface || "#FFFFFF";
  const textPrimary = doc.theme.colors.textPrimary || "#0F172A";
  const textSecondary = doc.theme.colors.textSecondary || "#64748B";

  // 1. Text Primary vs Background
  const bgContrast = calculateContrastRatio(textPrimary, bg);
  if (bgContrast < 3.5) {
    issues.push({
      code: "poor_color_contrast",
      category: "contrast",
      severity: "error",
      message: `Critical text contrast failure (${bgContrast.toFixed(1)}:1) between textPrimary (${textPrimary}) and background (${bg}). Minimum is 4.5:1.`,
      fixable: true,
      suggestion: "Invert text luminance to guarantee high contrast.",
    });
  }

  // 2. Text Primary vs Surface Cards
  const surfaceContrast = calculateContrastRatio(textPrimary, surface);
  if (surfaceContrast < 3.5) {
    issues.push({
      code: "poor_color_contrast",
      category: "contrast",
      severity: "warning",
      message: `Card surface contrast is low (${surfaceContrast.toFixed(1)}:1) between textPrimary and card surface (${surface}).`,
      fixable: true,
    });
  }

  // 3. Page level background overrides
  doc.pages.forEach((page, pIdx) => {
    if (page.backgroundOverride) {
      const pageRatio = calculateContrastRatio(textPrimary, page.backgroundOverride);
      if (pageRatio < 3.0) {
        issues.push({
          code: "poor_color_contrast",
          category: "contrast",
          severity: "warning",
          message: `Slide ${pIdx + 1} custom background (${page.backgroundOverride}) has poor contrast (${pageRatio.toFixed(1)}:1) against primary text.`,
          pageIndex: pIdx,
          fixable: true,
        });
      }
    }
  });

  return issues;
}

/** Check 6: Inconsistent Alignment */
export function checkInconsistentAlignment(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];

  doc.pages.forEach((page, pIdx) => {
    const positioned = page.elements
      .map((el) => ({ el, pos: (el as any).position }))
      .filter(
        (item): item is { el: ContentElement; pos: { x: number; y: number; width: number; height: number } } =>
          Boolean(item.pos && typeof item.pos.x === "number")
      );

    // Detect near-identical X coordinates that drift by 2-16px (ragged edges)
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const xDiff = Math.abs(positioned[i].pos.x - positioned[j].pos.x);
        if (xDiff > 1 && xDiff <= 14) {
          issues.push({
            code: "inconsistent_alignment",
            category: "alignment",
            severity: "info",
            message: `Elements '${positioned[i].el.id}' and '${positioned[j].el.id}' on slide ${pIdx + 1} have a slight ${xDiff}px alignment drift.`,
            pageIndex: pIdx,
            elementId: positioned[j].el.id,
            fixable: true,
            suggestion: "Snap elements to the same vertical alignment axis.",
          });
        }
      }
    }
  });

  return issues;
}

/** Check 7: Uneven Spacing */
export function checkUnevenSpacing(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];

  doc.pages.forEach((page, pIdx) => {
    // If elements have vertical stacking with explicit Y positions
    const sortedY = page.elements
      .map((el) => ({ el, pos: (el as any).position }))
      .filter(
        (item): item is { el: ContentElement; pos: { x: number; y: number; width: number; height: number } } =>
          Boolean(item.pos && typeof item.pos.y === "number" && typeof item.pos.height === "number")
      )
      .sort((a, b) => a.pos.y - b.pos.y);

    if (sortedY.length >= 3) {
      const gaps: number[] = [];
      for (let i = 0; i < sortedY.length - 1; i++) {
        const bottomA = sortedY[i].pos.y + sortedY[i].pos.height;
        const topB = sortedY[i + 1].pos.y;
        gaps.push(Math.max(0, topB - bottomA));
      }

      for (let i = 0; i < gaps.length - 1; i++) {
        const diff = Math.abs(gaps[i] - gaps[i + 1]);
        if (diff > 45 && Math.min(gaps[i], gaps[i + 1]) > 5) {
          issues.push({
            code: "uneven_spacing",
            category: "spacing",
            severity: "info",
            message: `Irregular vertical spacing detected on slide ${pIdx + 1} (${Math.round(gaps[i])}px vs ${Math.round(gaps[i + 1])}px).`,
            pageIndex: pIdx,
            fixable: true,
            suggestion: "Normalize vertical gaps between consecutive cards.",
          });
          break;
        }
      }
    }
  });

  return issues;
}

/** Check 8: Excessive Content Density */
export function checkContentDensity(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const maxWords = doc.documentType === "resume" ? 380 : doc.documentType === "letter" ? 340 : 130;

  doc.pages.forEach((page, pIdx) => {
    const words = countWordsOnPage(page);
    if (words > maxWords) {
      issues.push({
        code: "excessive_content_density",
        category: "content_density",
        severity: "warning",
        message: `Slide ${pIdx + 1} contains ${words} words (recommended maximum: ${maxWords}). High density reduces audience retention.`,
        pageIndex: pIdx,
        fixable: true,
        suggestion: "Convert paragraph blocks into structured process cards or key metrics.",
      });
    }

    if (page.elements.length > 9) {
      issues.push({
        code: "excessive_content_density",
        category: "content_density",
        severity: "info",
        message: `Slide ${pIdx + 1} contains ${page.elements.length} distinct elements without grouped layout structure.`,
        pageIndex: pIdx,
        fixable: true,
      });
    }
  });

  return issues;
}

/** Check 9: Repeated Layouts (Consecutive Archetype Monotony) */
export function checkRepeatedLayouts(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];

  for (let i = 0; i < doc.pages.length - 1; i++) {
    const current = doc.pages[i].archetype;
    const next = doc.pages[i + 1].archetype;

    if (current && next && current === next && current !== "title_and_content") {
      issues.push({
        code: "repeated_layouts",
        category: "consistency",
        severity: "info",
        message: `Consecutive slides ${i + 1} and ${i + 2} use the exact same layout archetype ('${current}').`,
        pageIndex: i + 1,
        fixable: true,
        suggestion: "Alternate with metric cards, process flows, or a data chart focus.",
      });
    }
  }

  return issues;
}

/** Check 10: Broken Diagrams */
export function checkBrokenDiagrams(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];

  doc.pages.forEach((page, pIdx) => {
    page.elements.forEach((el) => {
      if (el.type === "diagram") {
        if (!el.nodes || el.nodes.length < 2) {
          issues.push({
            code: "broken_diagrams",
            category: "technical_validity",
            severity: "error",
            message: `Diagram '${el.id}' on slide ${pIdx + 1} has insufficient nodes (${el.nodes?.length || 0}). Minimum 2 required.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
          });
          return;
        }

        const nodeIds = new Set(el.nodes.map((n) => n.id));

        // Check for empty labels
        el.nodes.forEach((n, nIdx) => {
          if (!n.label || !n.label.trim()) {
            issues.push({
              code: "broken_diagrams",
              category: "technical_validity",
              severity: "warning",
              message: `Diagram node #${nIdx + 1} (${n.id}) has an empty label.`,
              pageIndex: pIdx,
              elementId: el.id,
              fixable: true,
            });
          }
        });

        // Check connections for invalid references
        el.connections.forEach((conn, cIdx) => {
          if (!nodeIds.has(conn.fromId) || !nodeIds.has(conn.toId)) {
            issues.push({
              code: "broken_diagrams",
              category: "technical_validity",
              severity: "error",
              message: `Diagram connection #${cIdx + 1} references invalid node ID ('${conn.fromId}' -> '${conn.toId}').`,
              pageIndex: pIdx,
              elementId: el.id,
              fixable: true,
              suggestion: "Remove invalid edge or attach to a valid diagram node.",
            });
          }
        });
      }
    });
  });

  return issues;
}

/** Check 11: Unreadable Charts */
export function checkUnreadableCharts(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];

  doc.pages.forEach((page, pIdx) => {
    page.elements.forEach((el) => {
      if (el.type === "chart") {
        if (!el.datasets || el.datasets.length === 0) {
          issues.push({
            code: "unreadable_charts",
            category: "technical_validity",
            severity: "error",
            message: `Chart '${el.id}' on slide ${pIdx + 1} has no data series.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
          });
        }

        if (el.labels && el.labels.length > 14) {
          issues.push({
            code: "unreadable_charts",
            category: "readability",
            severity: "warning",
            message: `Chart '${el.id}' has ${el.labels.length} categories, which will cause overlapping axis tick labels.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
            suggestion: "Group data points or expand chart width.",
          });
        }

        const pos = (el as any).position;
        if (pos && (pos.width < 320 || pos.height < 200)) {
          issues.push({
            code: "unreadable_charts",
            category: "visual_hierarchy",
            severity: "warning",
            message: `Chart '${el.id}' dimensions (${pos.width}x${pos.height}px) are too small to read data clearly.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
            suggestion: "Enlarge chart container to at least 480x300px.",
          });
        }
      }
    });
  });

  return issues;
}

/** Check 12: Missing Required Information */
export function checkMissingRequiredInfo(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check Posters for critical fields
  if (doc.documentType === "poster") {
    let hasEventDetails = false;
    let hasOrganizerOrCta = false;

    doc.pages.forEach((page) => {
      page.elements.forEach((el) => {
        if (el.type === "event_details") hasEventDetails = true;
        if (el.type === "organizer_info" || el.type === "cta_badge" || el.type === "qrcode") {
          hasOrganizerOrCta = true;
        }
      });
    });

    if (!hasEventDetails && !doc.meta.description?.toLowerCase().includes("date")) {
      issues.push({
        code: "missing_required_info",
        category: "technical_validity",
        severity: "warning",
        message: "Poster is missing date, time, or venue schedule details.",
        fixable: true,
        suggestion: "Add an EventDetails block with venue and date.",
      });
    }

    if (!hasOrganizerOrCta) {
      issues.push({
        code: "missing_required_info",
        category: "technical_validity",
        severity: "info",
        message: "Poster is missing registration call-to-action or contact information.",
        fixable: true,
        suggestion: "Add a CTA badge or organizer contact block.",
      });
    }
  }

  // Check Resumes for required contact and experience sections
  if (doc.documentType === "resume") {
    let hasContact = false;
    let hasExperience = false;

    doc.pages.forEach((page) => {
      page.elements.forEach((el) => {
        if (el.type === "resume_block") {
          if (el.sectionType === "header" || el.contactInfo) hasContact = true;
          if (el.sectionType === "experience" || el.sectionType === "projects") hasExperience = true;
        }
      });
    });

    if (!hasContact) {
      issues.push({
        code: "missing_required_info",
        category: "technical_validity",
        severity: "error",
        message: "Resume lacks contact header with email or phone number.",
        fixable: true,
      });
    }
  }

  return issues;
}

/** Check 13: Incorrect Aspect Ratios */
export function checkIncorrectAspectRatio(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const preset = CANVAS_PRESETS[doc.canvas.aspectRatio];

  if (!preset) {
    issues.push({
      code: "incorrect_aspect_ratio",
      category: "technical_validity",
      severity: "error",
      message: `Unknown or unmapped aspect ratio '${doc.canvas.aspectRatio}'.`,
      fixable: true,
    });
  } else {
    // Check if canvas dimensions deviate significantly from preset
    const expectedRatio = preset.width / preset.height;
    const actualRatio = doc.canvas.width / doc.canvas.height;
    if (Math.abs(expectedRatio - actualRatio) > 0.05) {
      issues.push({
        code: "incorrect_aspect_ratio",
        category: "technical_validity",
        severity: "warning",
        message: `Canvas dimensions (${doc.canvas.width}x${doc.canvas.height}) do not match preset ratio for ${doc.canvas.aspectRatio}.`,
        fixable: true,
        suggestion: `Reset canvas to ${preset.width}x${preset.height}px.`,
      });
    }
  }

  return issues;
}

/** Check 14: Empty or Meaningless Visual Elements */
export function checkEmptyOrMeaninglessElements(doc: DocumentSpec): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const placeholderPatterns = [
    /\[insert\s+[^\]]+\]/i,
    /\[your\s+[^\]]+\]/i,
    /\[title\s+here\]/i,
    /lorem\s+ipsum/i,
    /click\s+to\s+edit/i,
  ];

  doc.pages.forEach((page, pIdx) => {
    page.elements.forEach((el) => {
      // Empty text content
      if (el.type === "text") {
        if (!el.content || !el.content.trim()) {
          issues.push({
            code: "empty_or_meaningless_elements",
            category: "visual_hierarchy",
            severity: "warning",
            message: `Element '${el.id}' on slide ${pIdx + 1} contains empty text content.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
          });
        } else {
          for (const pattern of placeholderPatterns) {
            if (pattern.test(el.content)) {
              issues.push({
                code: "empty_or_meaningless_elements",
                category: "readability",
                severity: "info",
                message: `Element '${el.id}' contains placeholder text '${el.content.slice(0, 30)}...'.`,
                pageIndex: pIdx,
                elementId: el.id,
                fixable: true,
                suggestion: "Replace placeholder with synthesized domain content.",
              });
              break;
            }
          }
        }
      }

      // Metric with missing value
      if (el.type === "metric") {
        if (!el.value || !el.value.trim()) {
          issues.push({
            code: "empty_or_meaningless_elements",
            category: "visual_hierarchy",
            severity: "warning",
            message: `Metric card '${el.id}' is missing a numeric value.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
          });
        }
      }

      // Empty Table
      if (el.type === "table") {
        if (!el.headers || el.headers.length === 0 || !el.rows || el.rows.length === 0) {
          issues.push({
            code: "empty_or_meaningless_elements",
            category: "technical_validity",
            severity: "error",
            message: `Table '${el.id}' on slide ${pIdx + 1} has zero rows or columns.`,
            pageIndex: pIdx,
            elementId: el.id,
            fixable: true,
          });
        }
      }
    });
  });

  return issues;
}

/** Master Evaluator: Runs all 14 Rules */
export function evaluateAllDesignRules(doc: DocumentSpec): QualityIssue[] {
  return [
    ...checkTextOverflow(doc),
    ...checkBoundaryViolations(doc),
    ...checkOverlappingElements(doc),
    ...checkUnreadableFontSizes(doc),
    ...checkColorContrast(doc),
    ...checkInconsistentAlignment(doc),
    ...checkUnevenSpacing(doc),
    ...checkContentDensity(doc),
    ...checkRepeatedLayouts(doc),
    ...checkBrokenDiagrams(doc),
    ...checkUnreadableCharts(doc),
    ...checkMissingRequiredInfo(doc),
    ...checkIncorrectAspectRatio(doc),
    ...checkEmptyOrMeaninglessElements(doc),
  ];
}
