"use client";

import React from "react";
import { LetterBlockElement, ThemeSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";

interface LetterDocumentBlockProps {
  element: LetterBlockElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const LetterDocumentBlock: React.FC<LetterDocumentBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
}) => {
  const { sectionType, sender, recipient, date, subject, salutation, content, closing, signer } =
    element;

  switch (sectionType) {
    case "sender_header":
      if (!sender) return null;
      return (
        <div
          onClick={onSelect}
          className={cn(
            "relative flex flex-col p-4 rounded-lg border transition-all cursor-pointer shadow-sm w-full mb-4",
            isSelected && "ring-2 ring-primary ring-offset-2"
          )}
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
        >
          <div className="flex flex-col border-b pb-3" style={{ borderColor: theme.colors.border }}>
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
            >
              {sender.name}
            </h2>
            {sender.title && <span className="text-xs font-semibold text-muted-foreground">{sender.title}</span>}
            {sender.organization && (
              <span className="text-xs font-medium" style={{ color: theme.colors.secondary }}>
                {sender.organization}
              </span>
            )}
            {sender.address && <span className="text-xs text-muted-foreground mt-1">{sender.address}</span>}
            {sender.email && <span className="text-xs text-muted-foreground">{sender.email}</span>}
          </div>
        </div>
      );

    case "date_line":
      return (
        <div
          onClick={onSelect}
          className={cn("p-2 text-xs font-semibold tracking-wide text-muted-foreground mb-4", isSelected && "ring-2 ring-primary")}
        >
          {date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      );

    case "recipient_header":
      if (!recipient) return null;
      return (
        <div
          onClick={onSelect}
          className={cn(
            "relative flex flex-col p-3 rounded-lg border transition-all cursor-pointer shadow-sm w-full mb-4",
            isSelected && "ring-2 ring-primary ring-offset-2"
          )}
          style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
        >
          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">TO:</span>
          <span className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
            {recipient.name}
          </span>
          {recipient.title && <span className="text-xs text-muted-foreground">{recipient.title}</span>}
          {recipient.organization && (
            <span className="text-xs font-medium text-muted-foreground">{recipient.organization}</span>
          )}
          {recipient.address && <span className="text-xs text-muted-foreground mt-0.5">{recipient.address}</span>}
        </div>
      );

    case "subject_line":
      return (
        <div
          onClick={onSelect}
          className={cn(
            "p-3 rounded-lg border bg-muted/30 font-semibold text-sm mb-4 flex items-center gap-2",
            isSelected && "ring-2 ring-primary"
          )}
          style={{ borderColor: theme.colors.border }}
        >
          <span className="font-bold uppercase tracking-wider text-xs" style={{ color: theme.colors.secondary }}>
            Subject:
          </span>
          <span className="underline decoration-secondary/50 font-bold" style={{ color: theme.colors.textPrimary }}>
            {subject}
          </span>
        </div>
      );

    case "salutation":
      return (
        <div
          onClick={onSelect}
          className={cn("p-2 text-sm font-semibold mb-2", isSelected && "ring-2 ring-primary")}
          style={{ color: theme.colors.textPrimary }}
        >
          {salutation || "Dear Sir/Madam,"}
        </div>
      );

    case "body_paragraph":
      return (
        <div
          onClick={onSelect}
          className={cn(
            "p-3 text-sm leading-relaxed mb-3 rounded hover:bg-muted/20 transition-colors",
            isSelected && "ring-2 ring-primary"
          )}
          style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.bodyFont }}
        >
          {content}
        </div>
      );

    case "complimentary_close":
      return (
        <div
          onClick={onSelect}
          className={cn("p-2 text-sm font-medium mt-4", isSelected && "ring-2 ring-primary")}
          style={{ color: theme.colors.textPrimary }}
        >
          {closing || "Sincerely,"}
        </div>
      );

    case "signature_block":
      if (!signer) return null;
      return (
        <div
          onClick={onSelect}
          className={cn(
            "p-4 rounded-lg border bg-muted/20 w-fit min-w-[220px] mt-2 mb-4",
            isSelected && "ring-2 ring-primary"
          )}
          style={{ borderColor: theme.colors.border }}
        >
          <div className="h-10 border-b border-dashed border-muted-foreground/40 mb-2 flex items-end">
            <span className="text-[10px] font-mono text-muted-foreground/60 italic pb-0.5">Authorized Signature</span>
          </div>
          <span className="font-bold text-sm block" style={{ color: theme.colors.textPrimary }}>
            {signer.name}
          </span>
          {(signer.title || signer.designation) && (
            <span className="text-xs text-muted-foreground block">
              {signer.title || signer.designation}
            </span>
          )}
          {signer.organization && (
            <span className="text-xs font-medium block" style={{ color: theme.colors.secondary }}>
              {signer.organization}
            </span>
          )}
        </div>
      );

    case "enclosures":
      return (
        <div
          onClick={onSelect}
          className={cn("p-2 text-xs italic text-muted-foreground mt-4", isSelected && "ring-2 ring-primary")}
        >
          {content}
        </div>
      );

    default:
      return null;
  }
};
