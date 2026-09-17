"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { compileDocumentToPptx } from "@/lib/compiler/pptx/pptx-builder";
import { compileDocumentToDocxBlob } from "@/lib/compiler/docx/docx-builder";
import { AspectRatio, CANVAS_PRESETS, DARK_THEME, DEFAULT_THEME } from "@/types/document-spec";
import { toPng, toJpeg } from "html-to-image";
import {
  Download,
  Play,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Sun,
  Moon,
  FileCode,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Loader2,
  Cloud,
  CheckCircle2,
  AlertCircle,
  History,
  RefreshCw,
  PanelLeft,
  PanelRight,
  Printer,
  RotateCcw,
  Image as ImageIcon,
  ShieldCheck,
  Table,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QualityReportModal } from "./QualityReportModal";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export const Toolbar: React.FC = () => {
  const {
    document,
    updateDocument,
    zoomLevel,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    setPresenterMode,
    projectId,
    setProjectId,
    saveStatus,
    setSaveStatus,
    setLastSavedAt,
    isLeftPanelOpen,
    setLeftPanelOpen,
    isInspectorOpen,
    setInspectorOpen,
    setVersionHistoryOpen,
    setRegenerateOpen,
    qualityReport,
    setQualityModalOpen,
  } = useEditorStore();

  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Manual retry if save failed
  const handleRetrySave = async () => {
    try {
      setSaveStatus("saving");
      let targetId = projectId;
      if (!targetId) {
        const newProj = await projectService.createProject({
          name: document.meta.title || "Untitled Project",
          projectType: document.documentType,
          currentSpec: document,
        });
        targetId = newProj.id;
        setProjectId(targetId);
      } else {
        const res = await projectService.saveProject(targetId, {
          name: document.meta.title,
          current_spec: document,
        });
        setSaveStatus(res.source === "cloud" ? "saved" : "offline");
        setLastSavedAt(new Date());
        return;
      }
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch (err) {
      console.error("Retry save error:", err);
      setSaveStatus("error");
    }
  };

  // Handle PPTX compilation and client download
  const handleExportPptx = async () => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);

      const safeTitle = (document.meta.title || "presentation")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, "_");

      try {
        // Attempt cloud export via server endpoint (uploads to storage & tracks asset)
        const res = await fetch("/api/export/pptx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document, projectId }),
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await res.json();
            if (data.downloadUrl) {
              const link = window.document.createElement("a");
              link.href = data.downloadUrl;
              link.download = data.fileName || `${safeTitle}.pptx`;
              window.document.body.appendChild(link);
              link.click();
              window.document.body.removeChild(link);
              return;
            }
          } else {
            // Binary stream response
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement("a");
            link.href = url;
            link.download = `${safeTitle}.pptx`;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return;
          }
        }
      } catch (cloudErr) {
        console.warn("Cloud PPTX export fallback to client generation:", cloudErr);
      }

      // Fast local client compilation fallback
      const pptx = await compileDocumentToPptx(document, {
        projectId: projectId || (document as any).id || "doc-export",
        documentId: (document as any).id || "doc-export",
      });
      await pptx.writeFile({ fileName: `${safeTitle}.pptx` });
    } catch (error) {
      console.error("PPTX Export Error:", error);
      alert("Failed to export PPTX. Please check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export raw JSON AST
  const handleExportJson = () => {
    setShowExportMenu(false);
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(document, null, 2));
    const downloadAnchor = window.document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${document.meta.title || "slidecraft"}.json`);
    downloadAnchor.click();
  };

  // Quick Print / PDF export
  const handlePrintPdf = () => {
    setShowExportMenu(false);
    window.print();
  };

  // Export as PNG image (High-resolution 2x pixelRatio)
  const handleExportPng = async () => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      const node = window.document.getElementById("slidecraft-canvas-node");
      if (!node) {
        alert("Canvas element not found for export.");
        return;
      }
      const safeTitle = (document.meta.title || "slidecraft_design")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, "_");
      const dataUrl = await toPng(node, { quality: 0.98, pixelRatio: 2 });
      const link = window.document.createElement("a");
      link.download = `${safeTitle}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG Export Error:", err);
      alert("Failed to export PNG image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export as JPG image
  const handleExportJpg = async () => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      const node = window.document.getElementById("slidecraft-canvas-node");
      if (!node) {
        alert("Canvas element not found for export.");
        return;
      }
      const safeTitle = (document.meta.title || "slidecraft_design")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, "_");
      const dataUrl = await toJpeg(node, { quality: 0.95, pixelRatio: 2 });
      const link = window.document.createElement("a");
      link.download = `${safeTitle}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("JPG Export Error:", err);
      alert("Failed to export JPG image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export as Word Document (.docx)
  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);

      const safeTitle = (document.meta.title || "document")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, "_");

      try {
        const res = await fetch("/api/export/docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document, projectId }),
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = await res.json();
            if (data.downloadUrl) {
              const link = window.document.createElement("a");
              link.href = data.downloadUrl;
              link.download = data.fileName || `${safeTitle}.docx`;
              window.document.body.appendChild(link);
              link.click();
              window.document.body.removeChild(link);
              return;
            }
          } else {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement("a");
            link.href = url;
            link.download = `${safeTitle}.docx`;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return;
          }
        }
      } catch (cloudErr) {
        console.warn("Cloud DOCX export fallback to client generation:", cloudErr);
      }

      // Fast local client compilation fallback
      const blob = await compileDocumentToDocxBlob(document);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${safeTitle}.docx`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DOCX Export Error:", error);
      alert("Failed to export Word document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export Chart Data as CSV
  const handleExportCsv = () => {
    try {
      let csvContent = "Category,Metric,Value\n";
      let hasData = false;
      document.pages.forEach((page) => {
        page.elements.forEach((el) => {
          if (el.type === "chart" && (el as any).labels && (el as any).datasets) {
            hasData = true;
            (el as any).datasets.forEach((ds: any) => {
              (el as any).labels.forEach((label: string, idx: number) => {
                const val = ds.data?.[idx] ?? 0;
                csvContent += `"${label}","${ds.name || "Metric"}",${val}\n`;
              });
            });
          }
        });
      });
      if (!hasData) {
        csvContent = "Item,Metric,Value\nSample A,Revenue,100\nSample B,Revenue,150\n";
      }
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${(document.meta.title || "chart").replace(/[^a-z0-9]/gi, "_").toLowerCase()}_data.csv`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV Export error:", err);
    }
  };

  // Change Aspect Ratio
  const handleAspectRatioChange = (ar: AspectRatio) => {
    const preset = CANVAS_PRESETS[ar];
    updateDocument((doc) => ({
      ...doc,
      canvas: {
        ...doc.canvas,
        aspectRatio: ar,
        width: preset.width,
        height: preset.height,
      },
    }));
  };

  // Toggle Theme Mode
  const toggleThemeMode = () => {
    updateDocument((doc) => ({
      ...doc,
      theme: doc.theme.mode === "light" ? DARK_THEME : DEFAULT_THEME,
    }));
  };

  return (
    <header className="h-16 w-full border-b border-border/80 bg-background/95 backdrop-blur px-3 md:px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Branding, Panel Toggle, Title & Save Status */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Toggle Left Navigation */}
        <button
          onClick={() => setLeftPanelOpen(!isLeftPanelOpen)}
          className={cn(
            "p-1.5 rounded-lg border transition-colors",
            isLeftPanelOpen
              ? "bg-primary/10 border-primary/30 text-primary"
              : "border-border hover:bg-muted text-muted-foreground"
          )}
          title={isLeftPanelOpen ? "Hide Navigation" : "Show Navigation"}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 font-black text-lg tracking-tight text-primary">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm shadow-sm">
            S
          </div>
          <span className="hidden sm:inline">SlideCraft</span>
        </div>

        <div className="h-5 w-px bg-border/80 mx-1 hidden sm:block" />

        {/* Project Title Input (auto-persists) */}
        <input
          type="text"
          value={document.meta.title}
          onChange={(e) =>
            updateDocument((doc) => ({
              ...doc,
              meta: { ...doc.meta, title: e.target.value },
            }))
          }
          className="text-xs md:text-sm font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1.5 py-0.5 max-w-[140px] sm:max-w-[200px] md:max-w-[280px] truncate"
          title="Click to rename project"
        />

        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20 hidden lg:inline">
          {document.documentType}
        </span>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-1">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="hidden md:inline">Saving...</span>
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden md:inline">Saved</span>
            </span>
          )}
          {saveStatus === "offline" && (
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
              <Cloud className="w-3 h-3" />
              <span className="hidden md:inline">Saved locally</span>
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="hidden md:inline">Unsaved changes</span>
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Save failed</span>
              <button
                onClick={handleRetrySave}
                className="underline hover:text-foreground font-bold ml-0.5"
              >
                Retry
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Center: Canvas Controls & Undo/Redo */}
      <div className="hidden xl:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg hover:bg-background disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-foreground"
          title={canUndo ? "Undo (Ctrl+Z)" : "Undo (No history)"}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg hover:bg-background disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-foreground"
          title={canRedo ? "Redo (Ctrl+Y)" : "Redo (No forward history)"}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-border/80 mx-1" />

        <button
          onClick={() => setZoom(zoomLevel - 10)}
          className="p-1.5 rounded-lg hover:bg-background transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold px-1.5 min-w-[42px] text-center">
          {zoomLevel}%
        </span>
        <button
          onClick={() => setZoom(zoomLevel + 10)}
          className="p-1.5 rounded-lg hover:bg-background transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-border/80 mx-1" />

        {/* Aspect Ratio Selector */}
        <select
          value={document.canvas.aspectRatio}
          onChange={(e) => handleAspectRatioChange(e.target.value as AspectRatio)}
          className="text-xs font-medium bg-transparent border-none focus:outline-none cursor-pointer pr-2 pl-1 py-1"
        >
          {document.documentType === "social_media" ? (
            <>
              <option value="1:1">1:1 Square (Instagram/Feed)</option>
              <option value="9:16">9:16 Story / Reel / TikTok</option>
              <option value="4:5">4:5 Portrait Feed</option>
              <option value="16:9">16:9 Landscape Banner</option>
            </>
          ) : document.documentType === "poster" ? (
            <>
              <option value="A4_portrait">A4 Poster (Portrait)</option>
              <option value="A3_portrait">A3 Large Print</option>
              <option value="A4_landscape">A4 Landscape</option>
            </>
          ) : document.documentType === "infographic" ? (
            <>
              <option value="9:16">9:16 Vertical Infographic</option>
              <option value="4:5">4:5 Compact Infographic</option>
              <option value="16:9">16:9 Landscape Data Story</option>
            </>
          ) : document.documentType === "resume" || document.documentType === "letter" ? (
            <>
              <option value="A4_portrait">A4 Document</option>
              <option value="US_letter">US Letter (Executive)</option>
            </>
          ) : (
            <>
              <option value="16:9">16:9 Widescreen (Slides)</option>
              <option value="4:3">4:3 Standard (Slides)</option>
              <option value="1:1">1:1 Square</option>
              <option value="9:16">9:16 Portrait</option>
              <option value="A4_portrait">A4 Document</option>
              <option value="US_letter">US Letter</option>
            </>
          )}
        </select>
      </div>

      {/* Right: Actions (Regenerate, History, Present, Inspector, Export) */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Undo / Redo on smaller screens */}
        <div className="flex xl:hidden items-center gap-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-30 transition-colors"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Design Quality Badge Button */}
        <button
          onClick={() => setQualityModalOpen(true)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors",
            qualityReport && qualityReport.overallScore >= 85
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
              : qualityReport && qualityReport.overallScore >= 70
              ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
          )}
          title="Design Quality Inspector & Auto-Repair"
        >
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-bold">{qualityReport ? `${qualityReport.overallScore}%` : "Quality"}</span>
          <span className="hidden md:inline text-[11px] font-medium opacity-80">Quality</span>
        </button>

        {/* Regenerate Button */}
        <button
          onClick={() => setRegenerateOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border hover:bg-muted/80 text-xs font-semibold transition-colors"
          title="Regenerate with AI"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">Regenerate</span>
        </button>

        {/* Version History Button */}
        <button
          onClick={() => setVersionHistoryOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border hover:bg-muted/80 text-xs font-semibold transition-colors"
          title="View Version History & Restore"
        >
          <History className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden sm:inline">History</span>
        </button>

        {/* Toggle Theme Mode */}
        <button
          onClick={toggleThemeMode}
          className="p-2 rounded-xl border border-border hover:bg-muted/80 transition-colors hidden sm:inline-flex"
          title="Toggle Document Dark/Light Theme"
        >
          {document.theme.mode === "light" ? (
            <Moon className="w-3.5 h-3.5 text-slate-700" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          )}
        </button>

        {/* Global Studio App Theme Toggle */}
        <ThemeToggle />

        {/* Presenter / Preview Mode */}
        {document.documentType === "presentation" ? (
          <button
            onClick={() => setPresenterMode(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted/80 text-xs font-semibold transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current text-emerald-500" />
            <span>Present</span>
          </button>
        ) : (
          <button
            onClick={handlePrintPdf}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted/80 text-xs font-semibold transition-colors"
            title="Print Preview / Export PDF"
          >
            <Printer className="w-3.5 h-3.5 text-primary" />
            <span>Print View</span>
          </button>
        )}

        {/* Toggle Right Settings / Inspector Panel */}
        <button
          onClick={() => setInspectorOpen(!isInspectorOpen)}
          className={cn(
            "p-1.5 rounded-lg border transition-colors",
            isInspectorOpen
              ? "bg-primary/10 border-primary/30 text-primary"
              : "border-border hover:bg-muted text-muted-foreground"
          )}
          title={isInspectorOpen ? "Hide Settings Panel" : "Show Settings Panel"}
        >
          <PanelRight className="w-4 h-4" />
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* PowerPoint - Primary for Presentations */}
              {document.documentType === "presentation" && (
                <button
                  onClick={handleExportPptx}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted/80 transition-colors text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      <span>PowerPoint (.pptx)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 font-bold">Recommended</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      100% Native Vector & Charts
                    </div>
                  </div>
                </button>
              )}

              {/* Word (.docx) - Primary for Resume & Letter */}
              {(document.documentType === "resume" || document.documentType === "letter") && (
                <button
                  onClick={handleExportDocx}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted/80 transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      <span>Word Document (.docx)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 font-bold">ATS Friendly</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Editable Word Document
                    </div>
                  </div>
                </button>
              )}

              {/* High-Res PNG - Primary for Social, Poster, Infographic, Diagram, Chart */}
              {(document.documentType === "social_media" ||
                document.documentType === "poster" ||
                document.documentType === "infographic" ||
                document.documentType === "diagram" ||
                document.documentType === "chart") && (
                <button
                  onClick={handleExportPng}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted/80 transition-colors text-left"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      <span>PNG Image (.png)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 font-bold">High-Res</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Sharp 2x Pixel Resolution
                    </div>
                  </div>
                </button>
              )}

              {/* Print / Save as PDF - Universal Vector Layout */}
              <button
                onClick={handlePrintPdf}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted/80 transition-colors text-left"
              >
                <Printer className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1">
                    <span>Print / Save as PDF</span>
                    {document.documentType === "poster" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold">Print Ready</span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Vector Print Quality
                  </div>
                </div>
              </button>

              {/* CSV Export for Charts */}
              {document.documentType === "chart" && (
                <button
                  onClick={handleExportCsv}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted/80 transition-colors text-left"
                >
                  <Table className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      <span>Export Data (.csv)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold">Raw Data</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Spreadsheet Table Format
                    </div>
                  </div>
                </button>
              )}

              {/* PNG option for presentations, resumes, letters */}
              {(document.documentType === "presentation" ||
                document.documentType === "resume" ||
                document.documentType === "letter") && (
                <button
                  onClick={handleExportPng}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted/80 transition-colors text-left"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground">PNG Image (.png)</div>
                    <div className="text-[10px] text-muted-foreground">
                      High-Res 2x Rasterized
                    </div>
                  </div>
                </button>
              )}

              {/* JPG Compressed Web Option */}
              <button
                onClick={handleExportJpg}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted/80 transition-colors text-left"
              >
                <ImageIcon className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">JPG Image (.jpg)</div>
                  <div className="text-[10px] text-muted-foreground">
                    Web-Optimized Image
                  </div>
                </div>
              </button>

              {/* Word option for presentation */}
              {document.documentType === "presentation" && (
                <button
                  onClick={handleExportDocx}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted/80 transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground">Word Document (.docx)</div>
                    <div className="text-[10px] text-muted-foreground">
                      Native Editable Document
                    </div>
                  </div>
                </button>
              )}

              {/* JSON AST Spec */}
              <button
                onClick={handleExportJson}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted/80 transition-colors text-left"
              >
                <FileCode className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">SlideCraft JSON AST</div>
                  <div className="text-[10px] text-muted-foreground">
                    Deterministic IR Spec
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <QualityReportModal />
    </header>
  );
};
