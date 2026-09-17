"use client";

export const dynamic = "force-dynamic";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { StudioTopNav } from "@/components/editor/StudioTopNav";
import { StudioStatusBar } from "@/components/editor/StudioStatusBar";
import { Canvas } from "@/components/editor/Canvas";
import { VersionHistoryModal } from "@/components/editor/VersionHistoryModal";
import { RegenerateModal } from "@/components/editor/RegenerateModal";
import { PresenterModal } from "@/components/editor/PresenterModal";
import { QualityReportModal } from "@/components/editor/QualityReportModal";
import { FloatingEditBar } from "@/components/editor/FloatingEditBar";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  X,
  Loader2,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { PRESET_BRAND_KITS } from "@/types/brand-kit";

function EditorContent() {
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const urlProjectId = (routeParams?.projectId as string) || searchParams.get("projectId");

  const {
    document,
    setDocument,
    updateDocument,
    projectId,
    setProjectId,
    initProject,
    saveStatus,
    setSaveStatus,
    setLastSavedAt,
  } = useEditorStore();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBrandKitModal, setShowBrandKitModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // 1. Initial Load: Fetch project if projectId exists in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__editorStore = useEditorStore;
    }
    if (!urlProjectId) return;

    let isMounted = true;

    projectService.getProject(urlProjectId).then((proj) => {
      if (isMounted && proj && proj.current_spec) {
        initProject(proj);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [urlProjectId, initProject]);

  // 2. Debounced Auto-Save
  useEffect(() => {
    // Avoid auto-saving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        let currentTargetId = projectId;

        if (!currentTargetId) {
          // Project doesn't exist yet, auto-create
          const newProj = await projectService.createProject({
            name: document.meta.title || "Untitled Project",
            projectType: document.documentType,
            currentSpec: document,
          });
          currentTargetId = newProj.id;
          setProjectId(currentTargetId);
          setSaveStatus("saved");
          setLastSavedAt(new Date());
        } else {
          // Save existing project
          const result = await projectService.saveProject(currentTargetId, {
            name: document.meta.title,
            current_spec: document,
          });
          setSaveStatus(result.source === "cloud" ? "saved" : "offline");
          setLastSavedAt(new Date());
        }
      } catch (err) {
        console.error("Auto-save error:", err);
        setSaveStatus("error");
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [document, projectId, setProjectId, setSaveStatus, setLastSavedAt]);

  // 3. Global Keyboard Undo / Redo Shortcuts (Ctrl+Z, Cmd+Z, Ctrl+Y, Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("[contenteditable='true']"))
      ) {
        return;
      }

      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (!isCmdOrCtrl) return;

      const key = e.key.toLowerCase();

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().undo();
      }
      // Redo: Ctrl+Y, or Cmd+Shift+Z, or Ctrl+Shift+Z
      else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle File Upload and Ingestion
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadStatus(`Ingesting ${file.name}...`);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to extract content from file");

      const { extractedContent, fileType } = await res.json();
      setUploadStatus("Synthesizing visual content from document...");

      const genRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a presentation summarizing this uploaded ${fileType} document: ${extractedContent}`,
          documentType: "presentation",
          aspectRatio: document.canvas.aspectRatio,
          pageCount: 5,
        }),
      });

      if (!genRes.ok) throw new Error("Failed to generate presentation from document");

      const { document: generatedDoc } = await genRes.json();
      if (generatedDoc) {
        setDocument(generatedDoc);
        setShowUploadModal(false);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Ingestion notice: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const applyBrandKit = (kit: (typeof PRESET_BRAND_KITS)[0]) => {
    updateDocument((doc) => ({
      ...doc,
      theme: {
        ...doc.theme,
        colors: kit.colorPalette,
        typography: kit.typography,
        styleTokens: kit.styleTokens,
      },
    }));
    setShowBrandKitModal(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Top Animated Studio Navigation & Dropdown Trays */}
      <StudioTopNav />

      {/* Main Studio Body (Full-Width Canvas Workspace) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center Canvas Viewport */}
        <Canvas />

        {/* Floating Natural Language AI Assistant Bar */}
        <FloatingEditBar />
      </div>

      {/* Bottom Floating Status Bar */}
      <StudioStatusBar />

      {/* Design Quality Inspection Modal */}
      <QualityReportModal />

      {/* Fullscreen Presenter Mode */}
      <PresenterModal />

      {/* Version History Modal */}
      <VersionHistoryModal />

      {/* AI Regenerator Modal */}
      <RegenerateModal />

      {/* Document Ingestion Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Upload Source Content</h3>
                <p className="text-xs text-muted-foreground">
                  Transform raw files into structured visual presentations
                </p>
              </div>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 hover:bg-primary/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all mb-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.csv,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-xs font-semibold text-foreground">{uploadStatus}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-muted-foreground mb-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-xs font-semibold text-foreground mb-1">
                    Click to browse or drop your document here
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Supports PDF, Word (.docx), CSV spreadsheets, Markdown, and TXT notes
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Brand Kit Modal */}
      {showBrandKitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowBrandKitModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Brand Kits & Palettes</h3>
                <p className="text-xs text-muted-foreground">
                  Apply cohesive styles across all slides
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_BRAND_KITS.map((kit, idx) => (
                <div
                  key={idx}
                  onClick={() => applyBrandKit(kit)}
                  className="p-4 rounded-xl border border-border hover:border-primary cursor-pointer transition-all hover:shadow-md bg-background flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{kit.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {kit.typography.headingFont}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 h-6 w-full rounded-lg overflow-hidden border border-border/50">
                    <div
                      className="flex-1 h-full"
                      style={{ backgroundColor: kit.colorPalette.primary }}
                    />
                    <div
                      className="flex-1 h-full"
                      style={{ backgroundColor: kit.colorPalette.secondary }}
                    />
                    <div
                      className="flex-1 h-full"
                      style={{ backgroundColor: kit.colorPalette.accent }}
                    />
                    <div
                      className="flex-1 h-full"
                      style={{ backgroundColor: kit.colorPalette.surface }}
                    />
                  </div>

                  <button className="w-full text-[11px] font-semibold py-1.5 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Apply Brand Kit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditorStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
