"use client";

import React from "react";
import { CtaBadgeElement, ThemeSpec } from "@/types/document-spec";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CtaBadgeBlockProps {
  element: CtaBadgeElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const CtaBadgeBlock: React.FC<CtaBadgeBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
}) => {
  const getVariantStyles = () => {
    switch (element.variant) {
      case "secondary":
        return {
          backgroundColor: theme.colors.secondary,
          color: "#ffffff",
        };
      case "accent":
        return {
          backgroundColor: theme.colors.accent,
          color: "#ffffff",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      case "primary":
      default:
        return {
          backgroundColor: theme.colors.primary,
          color: "#ffffff",
        };
    }
  };

  const variantStyle = getVariantStyles();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={cn(
        "inline-flex flex-col sm:flex-row items-center gap-2 p-1 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] min-h-0 shrink-0",
        isSelected && "ring-2 ring-primary rounded-xl"
      )}
    >
      <div
        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md border shrink-0"
        style={{
          ...variantStyle,
          fontFamily: theme.typography.headingFont,
          borderColor: element.variant === "outline" ? theme.colors.primary : "transparent",
        }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{element.text}</span>
        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
      </div>

      {element.deadline && (
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full border"
          style={{
            color: theme.colors.textSecondary,
            borderColor: theme.colors.border,
            backgroundColor: `${theme.colors.surface}cc`,
          }}
        >
          {element.deadline}
        </span>
      )}
    </div>
  );
};
