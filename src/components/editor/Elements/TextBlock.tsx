"use client";

import React from "react";
import { TextElement, ThemeSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";

interface TextBlockProps {
  element: TextElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (newContent: string) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
  onUpdate,
}) => {
  const { variant, content, align, colorOverride } = element;

  const color =
    colorOverride ||
    (variant === "caption" || variant === "subtitle"
      ? theme.colors.textSecondary
      : theme.colors.textPrimary);

  const getVariantStyles = () => {
    switch (variant) {
      case "h1":
        return "text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight";
      case "h2":
        return "text-xl sm:text-2xl font-bold tracking-tight leading-snug";
      case "h3":
        return "text-lg sm:text-xl font-semibold leading-snug";
      case "subtitle":
        return "text-sm sm:text-base font-normal leading-relaxed opacity-90";
      case "quote":
        return "text-base sm:text-lg italic font-serif border-l-4 pl-4 py-1 leading-relaxed";
      case "caption":
        return "text-[11px] sm:text-xs font-medium tracking-wide uppercase opacity-75";
      case "body":
      default:
        return "text-xs sm:text-sm font-normal leading-relaxed";
    }
  };

  const getAlignStyles = () => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      case "justify":
        return "text-justify";
      case "left":
      default:
        return "text-left";
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative rounded-md transition-all cursor-text select-text p-1.5 group",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      style={{
        fontFamily:
          variant === "h1" || variant === "h2" || variant === "h3"
            ? theme.typography.headingFont
            : theme.typography.bodyFont,
        color,
        borderColor: variant === "quote" ? theme.colors.secondary : undefined,
      }}
    >
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.(e.currentTarget.textContent || "")}
        className={cn(
          "outline-none whitespace-pre-wrap focus:bg-primary/5 rounded px-1",
          getVariantStyles(),
          getAlignStyles()
        )}
      >
        {content}
      </div>
    </div>
  );
};
