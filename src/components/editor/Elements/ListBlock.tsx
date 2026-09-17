"use client";

import React from "react";
import { ListElement as ListElementType, ThemeSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";
import { Check, CheckCircle2, ChevronRight } from "lucide-react";

interface ListBlockProps {
  element: ListElementType;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (patch: Partial<ListElementType>) => void;
}

export const ListBlock: React.FC<ListBlockProps> = ({ element, theme, isSelected, onSelect, onUpdate }) => {
  const { listType, items } = element;

  const handleItemTextChange = (itemId: string, newText: string) => {
    const updatedItems = items.map((it) => (it.id === itemId ? { ...it, text: newText } : it));
    onUpdate?.({ items: updatedItems });
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col justify-between gap-4 p-6 rounded-2xl border transition-all cursor-pointer shadow-sm w-full",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: `${theme.styleTokens?.borderRadiusPx ?? 12}px`,
      }}
    >
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-start gap-3 group">
          {/* List Marker */}
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
            style={{
              backgroundColor:
                listType === "checklist"
                  ? `${theme.colors.secondary}15`
                  : `${theme.colors.primary}10`,
              color: listType === "checklist" ? theme.colors.secondary : theme.colors.primary,
            }}
          >
            {listType === "checklist" ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : listType === "numbered" || listType === "steps" ? (
              idx + 1
            ) : (
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            )}
          </div>

          {/* Item Content */}
          <div className="flex flex-col flex-1">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleItemTextChange(item.id, e.currentTarget.textContent || item.text)}
              className="text-base font-medium leading-snug outline-none focus:bg-primary/5 rounded px-1 cursor-text"
              style={{
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.bodyFont,
              }}
            >
              {item.text}
            </span>
            {item.subtext && (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const updatedItems = items.map((it) =>
                    it.id === item.id ? { ...it, subtext: e.currentTarget.textContent || it.subtext } : it
                  );
                  onUpdate?.({ items: updatedItems });
                }}
                className="text-xs leading-relaxed mt-0.5 outline-none focus:bg-primary/5 rounded px-1 cursor-text"
                style={{
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.bodyFont,
                }}
              >
                {item.subtext}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
