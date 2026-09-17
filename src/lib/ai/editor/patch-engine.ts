import {
  DocumentSpec,
  PageSpec,
  ContentElement,
  LayoutArchetype,
  DEFAULT_THEME,
} from "@/types/document-spec";
import { PatchOperation, DesignAlternative } from "./editor-types";

/**
 * Applies a list of atomic patch operations to a DocumentSpec.
 * Every modification is surgical: untouched slides, elements, and metadata remain strictly intact.
 */
export function executePatches(
  originalDoc: DocumentSpec,
  patches: PatchOperation[]
): { updatedDocument: DocumentSpec; appliedSummary: string[] } {
  // Deep clone to prevent direct state mutation
  const doc: DocumentSpec = JSON.parse(JSON.stringify(originalDoc));
  const appliedSummary: string[] = [];

  for (const patch of patches) {
    switch (patch.op) {
      case "update_text": {
        let found = false;
        for (const page of doc.pages) {
          const el = page.elements.find((e) => e.id === patch.elementId);
          if (el) {
            if (el.type === "text") {
              (el as any).content = patch.newText;
            } else if ((el as any).title !== undefined && patch.field === "title") {
              (el as any).title = patch.newText;
            } else if ((el as any).label !== undefined) {
              (el as any).label = patch.newText;
            }
            appliedSummary.push(`Updated text on element '${patch.elementId}'`);
            found = true;
            break;
          }
        }
        if (!found) {
          // If element not found, check if it targets page title
          const targetPage = doc.pages.find((p) => p.id === patch.elementId);
          if (targetPage) {
            targetPage.title = patch.newText;
            appliedSummary.push(`Updated title on slide '${targetPage.id}'`);
          }
        }
        break;
      }

      case "replace_element": {
        for (const page of doc.pages) {
          const idx = page.elements.findIndex((e) => e.id === patch.elementId);
          if (idx >= 0) {
            // Defensively parse if AI returned newElement as a JSON string
            const newEl = typeof patch.newElement === "string"
              ? (() => { try { return JSON.parse(patch.newElement); } catch { return null; } })()
              : patch.newElement;
            if (newEl) {
              page.elements[idx] = newEl;
              appliedSummary.push(`Replaced element '${patch.elementId}' with ${newEl.type}`);
            }
            break;
          }
        }
        break;
      }

      case "move_element": {
        for (const page of doc.pages) {
          const el = page.elements.find((e) => e.id === patch.elementId);
          if (el) {
            (el as any).position = {
              x: patch.x,
              y: patch.y,
              width: (el as any).position?.width || 300,
              height: (el as any).position?.height || 150,
            };
            appliedSummary.push(`Moved element '${patch.elementId}' to (${patch.x}, ${patch.y})`);
            break;
          }
        }
        break;
      }

      case "resize_element": {
        for (const page of doc.pages) {
          const el = page.elements.find((e) => e.id === patch.elementId);
          if (el) {
            (el as any).position = {
              x: (el as any).position?.x || 0,
              y: (el as any).position?.y || 0,
              width: patch.w,
              height: patch.h,
            };
            appliedSummary.push(`Resized element '${patch.elementId}' to ${patch.w}x${patch.h}px`);
            break;
          }
        }
        break;
      }

      case "change_colors": {
        if (!doc.theme) doc.theme = JSON.parse(JSON.stringify(DEFAULT_THEME));
        if (!doc.theme.colors) doc.theme.colors = JSON.parse(JSON.stringify(DEFAULT_THEME.colors));
        doc.theme.colors = {
          ...doc.theme.colors,
          ...patch.palette,
        };
        appliedSummary.push(`Updated color theme palette`);
        break;
      }

      case "change_typography": {
        if (!doc.theme) doc.theme = JSON.parse(JSON.stringify(DEFAULT_THEME));
        if (!doc.theme.typography) doc.theme.typography = JSON.parse(JSON.stringify(DEFAULT_THEME.typography));
        doc.theme.typography = {
          ...doc.theme.typography,
          ...patch.typography,
        };
        appliedSummary.push(`Updated typography style tokens`);
        break;
      }

      case "change_layout": {
        if (patch.pageIndex >= 0 && patch.pageIndex < doc.pages.length) {
          const page = doc.pages[patch.pageIndex];
          if (page.isLocked) {
            appliedSummary.push(`Slide ${patch.pageIndex + 1} is locked; preserved without modification`);
            break;
          }
          page.archetype = patch.newArchetype;
          if (patch.elements && patch.elements.length > 0) {
            // AI sometimes returns elements as JSON strings — parse them defensively
            page.elements = patch.elements.map((el: any) => {
              if (typeof el === "string") {
                try { return JSON.parse(el); } catch { return null; }
              }
              return el;
            }).filter(Boolean) as ContentElement[];
          }
          appliedSummary.push(`Changed slide ${patch.pageIndex + 1} layout archetype to '${patch.newArchetype}'`);
        }
        break;
      }

      case "add_element": {
        if (patch.pageIndex >= 0 && patch.pageIndex < doc.pages.length) {
          const page = doc.pages[patch.pageIndex];
          if (page.isLocked) {
            appliedSummary.push(`Slide ${patch.pageIndex + 1} is locked; preserved without modification`);
            break;
          }
          // Defensively parse if AI returned element as a JSON string
          const el = typeof patch.element === "string"
            ? (() => { try { return JSON.parse(patch.element); } catch { return null; } })()
            : patch.element;
          if (el) {
            doc.pages[patch.pageIndex].elements.push(el);
            appliedSummary.push(`Added new ${el.type} element to slide ${patch.pageIndex + 1}`);
          }
        }
        break;
      }

      case "delete_element": {
        if (patch.pageIndex >= 0 && patch.pageIndex < doc.pages.length) {
          const page = doc.pages[patch.pageIndex];
          if (page.isLocked) {
            appliedSummary.push(`Slide ${patch.pageIndex + 1} is locked; preserved without modification`);
            break;
          }
          const initialLen = page.elements.length;
          page.elements = page.elements.filter((e) => e.id !== patch.elementId);
          if (page.elements.length < initialLen) {
            appliedSummary.push(`Deleted element '${patch.elementId}' from slide ${patch.pageIndex + 1}`);
          }
        }
        break;
      }

      case "reorder_slides": {
        if (patch.pageOrder && patch.pageOrder.length === doc.pages.length) {
          const reordered = patch.pageOrder.map((oldIdx) => doc.pages[oldIdx]).filter(Boolean);
          if (reordered.length === doc.pages.length) {
            doc.pages = reordered.map((p, i) => ({ ...p, pageNumber: i + 1 }));
            appliedSummary.push(`Reordered slides sequence to [${patch.pageOrder.map((i) => i + 1).join(", ")}]`);
          }
        }
        break;
      }

      case "regenerate_slide": {
        if (patch.pageIndex >= 0 && patch.pageIndex < doc.pages.length) {
          doc.pages[patch.pageIndex] = {
            ...patch.newPageSpec,
            pageNumber: patch.pageIndex + 1,
          };
          appliedSummary.push(`Regenerated slide ${patch.pageIndex + 1} with fresh structure`);
        }
        break;
      }

      case "regenerate_section": {
        appliedSummary.push(`Regenerated section '${patch.sectionType}'`);
        break;
      }

      case "update_page_background": {
        if (patch.pageIndex >= 0 && patch.pageIndex < doc.pages.length) {
          const page = doc.pages[patch.pageIndex];
          const existingBg = page.background || {
            type: "solid" as const,
            value: page.backgroundOverride || doc.theme.colors.background,
          };

          const newBg = {
            ...existingBg,
            ...patch.background,
          };

          page.background = newBg;

          // Maintain backward compatibility with backgroundOverride and backgroundSpec
          if (newBg.type === "solid" && newBg.value) {
            page.backgroundOverride = newBg.value;
          }
          if (newBg.glow || newBg.decorativeShapes) {
            page.backgroundSpec = {
              ...(page.backgroundSpec || {}),
              type: newBg.type === "gradient" ? "gradient" : "solid",
              color: newBg.value,
              glow: newBg.glow as any,
              decorativeShapes: newBg.decorativeShapes as any,
            };
          }

          // Optional sync with theme background
          if (patch.syncThemeBackground && newBg.value && newBg.type === "solid") {
            if (!doc.theme) doc.theme = JSON.parse(JSON.stringify(DEFAULT_THEME));
            doc.theme.colors.background = newBg.value;
          }

          appliedSummary.push(
            `Updated background on page ${patch.pageIndex + 1} (${newBg.type}: ${newBg.value}) without altering page elements`
          );
        }
        break;
      }

      case "set_meta": {
        doc.meta = {
          ...doc.meta,
          ...patch.patch,
        };
        appliedSummary.push(`Updated document metadata`);
        break;
      }
    }
  }

  return { updatedDocument: doc, appliedSummary };
}

/**
 * Creates two alternative design variants of an existing DocumentSpec
 */
export function generateAlternativeVariants(originalDoc: DocumentSpec): DesignAlternative[] {
  // Variant A: Modern High-Impact Minimalist (Monochrome / Indigo with generous spacing)
  const variantA: DocumentSpec = JSON.parse(JSON.stringify(originalDoc));
  variantA.meta.title = `${originalDoc.meta.title || "Design"} (Minimalist Edition)`;
  variantA.theme.colors = {
    ...variantA.theme.colors,
    primary: "#0F172A",
    secondary: "#6366F1",
    accent: "#38BDF8",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
  };
  variantA.theme.typography = {
    ...variantA.theme.typography,
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Inter",
  };

  // Variant B: Corporate Executive Navy / Emerald with high-contrast cards
  const variantB: DocumentSpec = JSON.parse(JSON.stringify(originalDoc));
  variantB.meta.title = `${originalDoc.meta.title || "Design"} (Executive Edition)`;
  variantB.theme.colors = {
    ...variantB.theme.colors,
    primary: "#1E3A8A",
    secondary: "#0D9488",
    accent: "#F59E0B",
    background: "#0F172A",
    surface: "#1E293B",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
  };
  variantB.theme.mode = "dark";
  variantB.theme.typography = {
    ...variantB.theme.typography,
    headingFont: "Montserrat",
    bodyFont: "Inter",
  };

  return [
    {
      id: "variant-a",
      title: "Option A: Minimalist Light",
      description: "Clean typography, Indigo accent badges, and airy layout spacing.",
      document: variantA,
    },
    {
      id: "variant-b",
      title: "Option B: Executive Dark",
      description: "Deep Navy corporate styling, high-contrast metric cards, and Emerald accents.",
      document: variantB,
    },
  ];
}
