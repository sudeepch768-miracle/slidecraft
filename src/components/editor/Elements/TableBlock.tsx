"use client";

import React from "react";
import { TableElement as TableElementType, ThemeSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";

interface TableBlockProps {
  element: TableElementType;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({ element, theme, isSelected, onSelect }) => {
  const { title, headers, rows, highlightFirstColumn } = element;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col p-6 rounded-2xl border transition-all cursor-pointer shadow-sm w-full overflow-hidden",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: `${theme.styleTokens?.borderRadiusPx ?? 12}px`,
      }}
    >
      {title && (
        <h4
          className="text-base font-semibold mb-4"
          style={{
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.headingFont,
          }}
        >
          {title}
        </h4>
      )}

      <div
        className="w-full overflow-x-auto rounded-lg border"
        style={{ borderColor: theme.colors.border }}
      >
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr style={{ backgroundColor: theme.colors.primary }}>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 font-semibold text-white tracking-wide"
                  style={{ fontFamily: theme.typography.headingFont }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: theme.colors.border }}>
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="transition-colors hover:bg-muted/40"
                style={{
                  backgroundColor: rIdx % 2 === 0 ? "transparent" : `${theme.colors.background}`,
                }}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={cn(
                      "px-4 py-3 font-normal",
                      cIdx === 0 && highlightFirstColumn && "font-semibold"
                    )}
                    style={{
                      color:
                        cIdx === 0 && highlightFirstColumn
                          ? theme.colors.primary
                          : theme.colors.textPrimary,
                      fontFamily: theme.typography.bodyFont,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
