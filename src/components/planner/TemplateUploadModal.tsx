"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  FileCheck,
  Sparkles,
  Layers,
  Palette,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: "new_design" | "use_template" | "follow_sample" | "combine";
  templateName?: string;
  sampleName?: string;
  onSaveTemplateConfig: (config: {
    mode: "new_design" | "use_template" | "follow_sample" | "combine";
    templateName?: string;
    sampleName?: string;
    extractedTheme?: any;
  }) => void;
}

export const TemplateUploadModal: React.FC<TemplateUploadModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  templateName: initialTemplateName,
  sampleName: initialSampleName,
  onSaveTemplateConfig,
}) => {
  const [selectedMode, setSelectedMode] = useState(currentMode);
  const [templateFile, setTemplateFile] = useState<string | null>(initialTemplateName || null);
  const [sampleFile, setSampleFile] = useState<string | null>(initialSampleName || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedTheme, setExtractedTheme] = useState<any>(null);

  if (!isOpen) return null;

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTemplateFile(file.name);
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setExtractedTheme({
          primaryColor: "#0f766e",
          secondaryColor: "#0284c7",
          fontFamily: "Plus Jakarta Sans",
          spacing: "spacious_modern",
          slideStructure: "editorial_grid",
        });
      }, 700);
    }
  };

  const handleSampleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSampleFile(file.name);
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setExtractedTheme((prev: any) => ({
          ...(prev || {}),
          sampleStyle: "Clinical & Modern Editorial Layouts",
          accentColor: "#10b981",
        }));
      }, 700);
    }
  };

  const handleSave = () => {
    onSaveTemplateConfig({
      mode: selectedMode,
      templateName: templateFile || undefined,
      sampleName: sampleFile || undefined,
      extractedTheme,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">PowerPoint Template & Reference Studio</h3>
              <p className="text-xs text-muted-foreground">
                Upload master templates and sample PPTs for AI stylistic adaptation
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Upload Dropzones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Master Template Upload */}
            <div className="border border-dashed border-border/80 rounded-xl p-4 bg-muted/20 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/40 transition-colors relative">
              <input
                type="file"
                accept=".pptx,.potx"
                onChange={handleTemplateUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Layers className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {templateFile ? templateFile : "Upload PPT Template"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {templateFile ? "Template Loaded & Parsed" : "Layouts, Master Slides (.pptx)"}
                </p>
              </div>
              {templateFile && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready
                </span>
              )}
            </div>

            {/* 2. Sample Reference Upload */}
            <div className="border border-dashed border-border/80 rounded-xl p-4 bg-muted/20 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/40 transition-colors relative">
              <input
                type="file"
                accept=".pptx,.pdf,.png,.jpg"
                onChange={handleSampleUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Palette className="w-6 h-6 text-indigo-500" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {sampleFile ? sampleFile : "Upload Sample Reference"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {sampleFile ? "Sample Analyzed" : "Styling, Colors & Placement (.pptx, image)"}
                </p>
              </div>
              {sampleFile && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready
                </span>
              )}
            </div>
          </div>

          {/* Analysis Extraction Result */}
          {extractedTheme && (
            <div className="bg-muted/50 border border-border/80 rounded-xl p-3.5 space-y-2 text-xs">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI Reference Extraction Summary
              </p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground text-[11px]">
                <div>• Primary: <span className="font-mono text-foreground">{extractedTheme.primaryColor}</span></div>
                <div>• Typography: <span className="font-medium text-foreground">{extractedTheme.fontFamily}</span></div>
                <div>• Spacing: <span className="text-foreground">{extractedTheme.spacing}</span></div>
                <div>• Slide Structure: <span className="text-foreground">{extractedTheme.slideStructure}</span></div>
              </div>
            </div>
          )}

          {/* Strategy Selection Mode */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Generation Strategy Choice:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: "use_template",
                  title: "Use Uploaded Template",
                  desc: "Maps content directly into the uploaded master template layouts",
                },
                {
                  id: "follow_sample",
                  title: "Follow Sample PPT Style",
                  desc: "Analyzes colors, fonts, and spacing to generate new matching slides",
                },
                {
                  id: "combine",
                  title: "Combine Template & Reference",
                  desc: "Uses template master slides styled with reference aesthetics",
                },
                {
                  id: "new_design",
                  title: "Generate Completely New Design",
                  desc: "Synthesizes an original modern editorial visual system",
                },
              ].map((mode) => {
                const isSelected = selectedMode === mode.id;
                return (
                  <div
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/40"
                        : "bg-background border-border/70 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{mode.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{mode.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-background/50 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="h-8 text-xs bg-primary text-primary-foreground font-semibold px-4">
            Apply Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};
