"use client";

import React from "react";
import { DiagramElement as DiagramElementType, ThemeSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Cloud,
  Layers,
  Key,
  HelpCircle,
  GitCommit,
  Share2,
} from "lucide-react";

interface DiagramBlockProps {
  element: DiagramElementType;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const DiagramBlock: React.FC<DiagramBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
}) => {
  const { nodes, connections, diagramType } = element;

  const renderNodeShape = (node: (typeof nodes)[0], idx: number) => {
    const shape = node.shape || "rectangle";

    // 1. Class Box Shape (UML)
    if (shape === "class_box" || (node.fields && node.fields.length > 0 && shape !== "database")) {
      return (
        <div
          className="flex flex-col rounded-xl border overflow-hidden min-w-[200px] max-w-[280px] shadow-sm"
          style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
        >
          <div
            className="px-3 py-2 border-b font-bold text-xs text-white"
            style={{ backgroundColor: theme.colors.secondary }}
          >
            {node.label}
          </div>
          {node.fields && (
            <div className="p-2.5 text-xs font-mono space-y-1" style={{ color: theme.colors.textPrimary }}>
              {node.fields.map((f, fIdx) => (
                <div key={fIdx} className="flex items-center justify-between text-[11px]">
                  <span className={f.isKey ? "font-bold text-amber-500" : ""}>{f.name}</span>
                  <span className="text-muted-foreground">{f.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 2. Database Schema Table
    if (shape === "database") {
      return (
        <div
          className="flex flex-col rounded-xl border overflow-hidden min-w-[200px] max-w-[280px] shadow-sm"
          style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
        >
          <div
            className="px-3 py-2 border-b font-bold text-xs flex items-center gap-1.5 text-white"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{node.label}</span>
          </div>
          {node.fields && (
            <div className="p-2 text-xs font-mono space-y-1" style={{ color: theme.colors.textPrimary }}>
              {node.fields.map((f, fIdx) => (
                <div key={fIdx} className="flex items-center justify-between text-[11px] py-0.5 border-b border-border/40 last:border-0">
                  <span className="flex items-center gap-1">
                    {f.isKey && <Key className="w-3 h-3 text-amber-500" />}
                    <span className={f.isKey ? "font-bold" : ""}>{f.name}</span>
                  </span>
                  <span className="text-muted-foreground text-[10px]">{f.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 3. Decision Diamond Shape
    if (shape === "diamond") {
      return (
        <div
          className="relative flex flex-col items-center justify-center p-6 text-center border shadow-sm transition-transform hover:-translate-y-1 min-w-[150px] min-h-[120px]"
          style={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.secondary,
            borderRadius: "16px",
          }}
        >
          <HelpCircle className="w-5 h-5 mb-1.5" style={{ color: theme.colors.secondary }} />
          <h5
            className="text-xs font-bold"
            style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
          >
            {node.label}
          </h5>
        </div>
      );
    }

    // 4. Cloud Shape
    if (shape === "cloud") {
      return (
        <div
          className="flex flex-col items-center text-center p-4 rounded-3xl border flex-1 min-w-[170px] max-w-[240px] shadow-sm"
          style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.accent }}
        >
          <Cloud className="w-6 h-6 mb-2" style={{ color: theme.colors.accent }} />
          <h5 className="text-sm font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
            {node.label}
          </h5>
          {node.description && (
            <p className="text-[11px] text-muted-foreground">{node.description}</p>
          )}
        </div>
      );
    }

    // 5. Pill / Terminator Shape
    if (shape === "pill") {
      return (
        <div
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm"
          style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: theme.colors.secondary }}
          />
          <span className="text-xs font-bold" style={{ color: theme.colors.textPrimary }}>
            {node.label}
          </span>
        </div>
      );
    }

    // Default Card Rectangle
    return (
      <div
        className="flex flex-col items-center text-center p-4 rounded-xl border flex-1 min-w-[160px] max-w-[240px] shadow-sm transition-transform hover:-translate-y-1"
        style={{
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2.5 shadow-sm"
          style={{
            backgroundColor: theme.colors.secondary,
            color: "#FFFFFF",
          }}
        >
          {node.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
        </div>

        <h5
          className="text-sm font-semibold mb-1"
          style={{
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.headingFont,
          }}
        >
          {node.label}
        </h5>

        {node.description && (
          <p
            className="text-[11px] leading-relaxed"
            style={{
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.bodyFont,
            }}
          >
            {node.description}
          </p>
        )}
      </div>
    );
  };

  const renderConnector = (conn?: (typeof connections)[0]) => {
    if (!conn) return null;
    const isInheritance = conn.connectionType === "inheritance";
    const isComposition = conn.connectionType === "composition";
    const isOneToMany = conn.connectionType === "one_to_many";

    return (
      <div className="flex flex-col items-center justify-center px-1 text-muted-foreground shrink-0">
        {conn.label && (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground mb-1">
            {conn.label}
          </span>
        )}
        <div className="flex items-center gap-1">
          {isComposition && (
            <div className="w-2.5 h-2.5 rotate-45" style={{ backgroundColor: theme.colors.accent }} />
          )}
          <ArrowRight className="w-5 h-5 stroke-[2.5]" style={{ color: theme.colors.accent }} />
          {isOneToMany && <span className="text-[10px] font-mono font-bold">1:N</span>}
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col p-6 rounded-2xl border transition-all cursor-pointer shadow-sm w-full",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: `${theme.styleTokens?.borderRadiusPx ?? 12}px`,
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-3 py-2 w-full">
        {nodes.map((node, idx) => {
          const isLast = idx === nodes.length - 1;
          const matchingConn = connections.find((c) => c.fromId === node.id);

          return (
            <div key={node.id} className="flex items-center gap-2.5 my-1">
              {renderNodeShape(node, idx)}
              {!isLast && renderConnector(matchingConn)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
