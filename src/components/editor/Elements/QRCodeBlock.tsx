"use client";

import React from "react";
import { QRCodeElement, ThemeSpec } from "@/types/document-spec";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRCodeBlockProps {
  element: QRCodeElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const QRCodeBlock: React.FC<QRCodeBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={cn(
        "px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 border transition-all cursor-pointer shadow-sm shrink-0",
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/40 border-border"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      {/* Visual QR Pattern Representation */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white p-1 rounded-lg border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden shadow-inner shrink-0">
        {/* Render a clean vector-based QR matrix simulation */}
        <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-0.5 p-0.5 bg-white">
          {/* Top-left locator */}
          <div className="col-span-2 row-span-2 border-2 border-slate-900 flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-slate-900" />
          </div>
          <div className="bg-slate-900" />
          {/* Top-right locator */}
          <div className="col-span-2 row-span-2 border-2 border-slate-900 flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-slate-900" />
          </div>
          <div className="bg-slate-900" />
          <div className="bg-slate-900" />
          <div className="bg-slate-900" />
          {/* Bottom-left locator */}
          <div className="col-span-2 row-span-2 border-2 border-slate-900 flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-slate-900" />
          </div>
          <div className="bg-slate-900" />
          <div className="bg-slate-900 col-span-2" />
        </div>
      </div>

      <div className="text-left min-w-0 max-w-[130px]">
        <span
          className="text-[11px] font-bold block truncate"
          style={{
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.headingFont,
          }}
        >
          {element.label || "Scan to Register"}
        </span>
        <span
          className="text-[9px] text-muted-foreground block truncate"
          style={{ color: theme.colors.textSecondary }}
        >
          {element.scanHint || element.url}
        </span>
      </div>
    </div>
  );
};
