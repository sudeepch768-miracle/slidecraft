"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  Search,
  Grid,
  List as ListIcon,
  Plus,
  ArrowRight,
  Clock,
  Trash2,
  Copy,
  Edit2,
  FolderOpen,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { projectService } from "@/lib/projects/project-service";
import { Project } from "@/types/database";

function getFormatGradient(type: string): string {
  switch (type) {
    case "presentation":
      return "from-blue-600 to-indigo-700";
    case "poster":
      return "from-rose-500 to-amber-600";
    case "infographic":
      return "from-emerald-600 to-teal-700";
    case "social_media":
      return "from-violet-600 to-purple-800";
    case "resume":
      return "from-amber-600 to-orange-700";
    case "letter":
      return "from-teal-600 to-slate-700";
    case "diagram":
      return "from-indigo-600 to-cyan-700";
    case "chart":
      return "from-cyan-600 to-blue-700";
    default:
      return "from-slate-700 to-slate-900";
  }
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`;
  return date.toLocaleDateString();
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Rename modal
  const [renamingProject, setRenamingProject] = useState<Project | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    let isMounted = true;
    projectService.fetchUserProjects().then(({ projects: fetched }) => {
      if (isMounted) {
        setProjects(fetched);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || p.project_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (confirm("Are you sure you want to delete this project?")) {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleDuplicate = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const dup = await projectService.duplicateProject(id);
    if (dup) {
      setProjects((prev) => [dup, ...prev]);
    }
  };

  const openRenameModal = (project: Project, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setRenamingProject(project);
    setNewTitle(project.name);
  };

  const submitRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingProject || !newTitle.trim()) return;

    try {
      setIsRenaming(true);
      await projectService.renameProject(renamingProject.id, newTitle.trim());
      setProjects((prev) =>
        prev.map((p) => (p.id === renamingProject.id ? { ...p, name: newTitle.trim() } : p))
      );
      setRenamingProject(null);
    } catch (err) {
      console.error("Rename error:", err);
      alert("Failed to rename project");
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <AppShell
      title="My Projects"
      subtitle="Organize, manage, and export your visual content assets"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* All 8 Type Filters */}
            <div className="hidden lg:flex items-center gap-1 text-xs font-semibold overflow-x-auto">
              {[
                { id: "all", label: "All" },
                { id: "presentation", label: "Decks" },
                { id: "poster", label: "Posters" },
                { id: "infographic", label: "Infographics" },
                { id: "social_media", label: "Social" },
                { id: "resume", label: "Resumes" },
                { id: "letter", label: "Letters" },
                { id: "diagram", label: "Diagrams" },
                { id: "chart", label: "Charts" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg capitalize transition-colors text-xs whitespace-nowrap",
                    typeFilter === t.id
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {isLoading && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Syncing...</span>
              </div>
            )}

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-lg bg-muted border border-border">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
                title="List View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <Link
              href="/create"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Link>
          </div>
        </div>

        {/* Content Display: Grid or List */}
        {!isLoading && filtered.length === 0 ? (
          <div className="p-12 rounded-2xl border-2 border-dashed border-border bg-card/40 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">No projects match criteria</h4>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search query or format filter, or create a brand new project.
            </p>
            <Link
              href="/create"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/95"
            >
              Create New
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => {
              const pageCount = project.current_spec?.pages?.length || 1;
              const gradient = getFormatGradient(project.project_type);

              return (
                <div
                  key={project.id}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/editor?projectId=${project.id}`}
                    className={cn(
                      "h-40 w-full bg-gradient-to-tr p-4 flex flex-col justify-between text-white relative",
                      gradient
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-black/30 backdrop-blur">
                        {project.project_type}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/30 backdrop-blur">
                        {pageCount} {pageCount === 1 ? "page" : "pages"}
                      </span>
                    </div>

                    <div className="text-xs font-semibold drop-shadow truncate">{project.name}</div>
                  </Link>

                  {/* Card Body */}
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <Link
                        href={`/editor?projectId=${project.id}`}
                        className="text-xs font-bold text-foreground hover:text-primary transition-colors truncate block"
                        title={project.name}
                      >
                        {project.name}
                      </Link>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatRelativeTime(project.updated_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => openRenameModal(project, e)}
                        title="Rename Project"
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDuplicate(project.id, e)}
                        title="Duplicate Project"
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        title="Delete Project"
                        className="p-1.5 rounded-lg border border-border hover:bg-rose-50 text-muted-foreground hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/editor?projectId=${project.id}`}
                        title="Open in Studio"
                        className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table / List View */
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3">Project Title</th>
                  <th className="px-5 py-3">Format</th>
                  <th className="px-5 py-3">Pages</th>
                  <th className="px-5 py-3">Last Modified</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((proj) => {
                  const pageCount = proj.current_spec?.pages?.length || 1;
                  return (
                    <tr key={proj.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-bold text-foreground">
                        <Link href={`/editor?projectId=${proj.id}`} className="hover:text-primary">
                          {proj.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 uppercase text-[10px] font-extrabold text-muted-foreground">
                        {proj.project_type}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {pageCount} {pageCount === 1 ? "page" : "pages"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatRelativeTime(proj.updated_at)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => openRenameModal(proj, e)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Rename"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDuplicate(proj.id, e)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(proj.id, e)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-muted-foreground hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/editor?projectId=${proj.id}`}
                            className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                            title="Open in Studio"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Rename Project */}
      {renamingProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setRenamingProject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-foreground mb-1">Rename Project</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Update the title for this visual document (persists to Supabase).
            </p>

            <form onSubmit={submitRename} className="space-y-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="w-full text-xs px-3.5 py-2.5 bg-background rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingProject(null)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenaming || !newTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {isRenaming ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Title</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
