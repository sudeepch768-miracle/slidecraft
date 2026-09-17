"use client";

import React, { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { ProjectVersion } from "@/types/database";
import {
  History,
  X,
  RotateCcw,
  Clock,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";

export const VersionHistoryModal: React.FC = () => {
  const {
    projectId,
    document,
    setDocument,
    isVersionHistoryOpen,
    setVersionHistoryOpen,
    setSaveStatus,
  } = useEditorStore();

  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState<number | null>(null);

  useEffect(() => {
    if (isVersionHistoryOpen && projectId) {
      setIsLoading(true);
      projectService
        .getProjectVersions(projectId)
        .then((verList) => {
          setVersions(verList);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isVersionHistoryOpen, projectId]);

  if (!isVersionHistoryOpen) return null;

  const handleRestore = async (versionNumber: number) => {
    if (!projectId) return;
    if (
      !confirm(
        `Are you sure you want to restore Version ${versionNumber}? Your current canvas will be updated to this snapshot.`
      )
    ) {
      return;
    }

    try {
      setIsRestoring(versionNumber);
      const restored = await projectService.restoreVersion(projectId, versionNumber);
      if (restored && restored.current_spec) {
        setDocument(restored.current_spec);
        setSaveStatus("saved");
        setVersionHistoryOpen(false);
      }
    } catch (err) {
      console.error("Restore error:", err);
      alert("Failed to restore version.");
    } finally {
      setIsRestoring(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Version History</h3>
              <p className="text-[11px] text-muted-foreground">
                Snapshot timeline saved to Supabase (Zero data loss guarantee)
              </p>
            </div>
          </div>

          <button
            onClick={() => setVersionHistoryOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">Fetching version snapshots...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No previous version snapshots available yet. Changes will appear here as you edit.
            </div>
          ) : (
            <div className="space-y-2.5">
              {versions.map((ver, idx) => {
                const isCurrent = idx === 0;
                const pageCount = ver.design_spec?.pages?.length || 1;

                return (
                  <div
                    key={ver.id || idx}
                    className="p-3.5 rounded-xl border border-border bg-background hover:bg-muted/30 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          Version {ver.version_number}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Current Active
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {ver.change_prompt || "Document snapshot"}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ver.created_at).toLocaleString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {pageCount} {pageCount === 1 ? "page" : "pages"}
                        </span>
                      </div>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => handleRestore(ver.version_number)}
                        disabled={isRestoring === ver.version_number}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs font-semibold text-foreground transition-all flex-shrink-0 disabled:opacity-50"
                      >
                        {isRestoring === ver.version_number ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-end">
          <button
            onClick={() => setVersionHistoryOpen(false)}
            className="px-4 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
