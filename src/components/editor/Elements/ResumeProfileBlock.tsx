"use client";

import React from "react";
import { ResumeBlockElement, ThemeSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, Briefcase, GraduationCap, FolderGit2 } from "lucide-react";

interface ResumeProfileBlockProps {
  element: ResumeBlockElement;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ResumeProfileBlock: React.FC<ResumeProfileBlockProps> = ({
  element,
  theme,
  isSelected,
  onSelect,
}) => {
  const { sectionType, contactInfo, summaryText, items } = element;

  // Header Section
  if (sectionType === "header" && contactInfo) {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "relative flex flex-col pb-4 mb-3 border-b transition-all cursor-pointer",
          isSelected && "ring-2 ring-primary ring-offset-2 rounded"
        )}
        style={{ borderColor: theme.colors.border }}
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
            >
              {contactInfo.name}
            </h1>
            {contactInfo.title && (
              <p
                className="text-sm font-semibold mt-0.5"
                style={{ color: theme.colors.secondary, fontFamily: theme.typography.bodyFont }}
              >
                {contactInfo.title}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: theme.colors.textSecondary }}>
            {contactInfo.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-muted-foreground" />
                {contactInfo.email}
              </span>
            )}
            {contactInfo.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-muted-foreground" />
                {contactInfo.phone}
              </span>
            )}
            {contactInfo.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                {contactInfo.location}
              </span>
            )}
            {contactInfo.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-3 h-3 text-muted-foreground" />
                {contactInfo.linkedin}
              </span>
            )}
            {contactInfo.github && (
              <span className="flex items-center gap-1">
                <Github className="w-3 h-3 text-muted-foreground" />
                {contactInfo.github}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Summary Section
  if (sectionType === "summary" && summaryText) {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "relative flex flex-col mb-4 transition-all cursor-pointer",
          isSelected && "ring-2 ring-primary ring-offset-2 rounded"
        )}
      >
        <h3
          className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b flex items-center gap-1.5"
          style={{ color: theme.colors.secondary, borderColor: theme.colors.border }}
        >
          Professional Summary
        </h3>
        <p
          className="text-xs sm:text-sm leading-relaxed"
          style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.bodyFont }}
        >
          {summaryText}
        </p>
      </div>
    );
  }

  // Skills Section
  if (sectionType === "skills") {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "relative flex flex-col mb-4 transition-all cursor-pointer",
          isSelected && "ring-2 ring-primary ring-offset-2 rounded"
        )}
      >
        <h3
          className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b flex items-center gap-1.5"
          style={{ color: theme.colors.secondary, borderColor: theme.colors.border }}
        >
          Skills & Competencies
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {(items || []).flatMap((it) => it.tags || []).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded border"
              style={{
                backgroundColor: `${theme.colors.secondary}10`,
                borderColor: `${theme.colors.secondary}30`,
                color: theme.colors.textPrimary,
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Multi-item Sections (Experience, Education, Projects, Certifications)
  const getSectionTitle = () => {
    switch (sectionType) {
      case "experience":
        return { label: "Work Experience", icon: Briefcase };
      case "education":
        return { label: "Education", icon: GraduationCap };
      case "projects":
        return { label: "Key Projects", icon: FolderGit2 };
      case "certifications":
        return { label: "Certifications", icon: Award };
      case "awards":
        return { label: "Honors & Achievements", icon: Award };
      default:
        return { label: sectionType.toUpperCase(), icon: Briefcase };
    }
  };

  const { label: sectionHeading, icon: IconComponent } = getSectionTitle();
  const safeItems = items || [];

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col mb-4 transition-all cursor-pointer",
        isSelected && "ring-2 ring-primary ring-offset-2 rounded"
      )}
    >
      <h3
        className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b flex items-center gap-1.5"
        style={{ color: theme.colors.secondary, borderColor: theme.colors.border }}
      >
        <IconComponent className="w-3.5 h-3.5" />
        {sectionHeading}
      </h3>

      <div className="space-y-3">
        {safeItems.map((item) => (
          <div key={item.id} className="group">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <span
                  className="font-bold text-xs sm:text-sm"
                  style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFont }}
                >
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="text-xs text-muted-foreground ml-1.5">
                    — {item.subtitle}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                {item.location && <span>{item.location}</span>}
                {item.dateRange && (
                  <span
                    className="px-1.5 py-0.5 rounded font-mono font-medium text-[10px]"
                    style={{ backgroundColor: `${theme.colors.secondary}15`, color: theme.colors.secondary }}
                  >
                    {item.dateRange}
                  </span>
                )}
              </div>
            </div>

            {item.bullets && item.bullets.length > 0 && (
              <ul className="mt-1 space-y-0.5 pl-4 list-disc text-xs leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                {item.bullets.map((b, bIdx) => (
                  <li key={bIdx}>{b}</li>
                ))}
              </ul>
            )}

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {item.tags.map((tg, tgIdx) => (
                  <span
                    key={tgIdx}
                    className="text-[10px] px-2 py-0.5 rounded font-medium bg-muted/70 text-muted-foreground border border-border/50"
                  >
                    {tg}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
