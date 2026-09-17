"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import {
  Presentation,
  Image as ImageIcon,
  BarChart2,
  FileText,
  Globe,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
  Search,
  Loader2,
  Trash2,
  Copy,
  Edit2,
  Upload,
  MoreVertical,
  ExternalLink,
  Play,
  Check,
  FolderPlus,
  Layers,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { projectService } from "@/lib/projects/project-service";
import { Project } from "@/types/database";
import { CreateWithAiModal } from "@/components/dashboard/CreateWithAiModal";

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getFormatBadgeColor(type: string): string {
  switch (type) {
    case "presentation":
      return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    case "document":
      return "text-purple-500 bg-purple-500/10 border-purple-500/20";
    case "webpage":
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "poster":
      return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    case "infographic":
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<"generate" | "paste" | "import">("generate");

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);

  // Rename modal
  const [renamingProject, setRenamingProject] = useState<Project | null>(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setCreateModalOpen(true);
    }
  }, [searchParams]);

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

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuProjectId(null);
    if (confirm("Are you sure you want to delete this visual project?")) {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleDuplicateProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuProjectId(null);
    const dup = await projectService.duplicateProject(id);
    if (dup) {
      setProjects((prev) => [dup, ...prev]);
    }
  };

  const openRename = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuProjectId(null);
    setRenamingProject(project);
    setNewTitle(project.name);
  };

  const submitRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingProject || !newTitle.trim()) return;

    await projectService.renameProject(renamingProject.id, newTitle.trim());
    setProjects((prev) =>
      prev.map((p) => (p.id === renamingProject.id ? { ...p, name: newTitle.trim() } : p))
    );
    setRenamingProject(null);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || p.project_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell title="All gammas" subtitle="Workspace">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* ─── 1. Workspace Header & Actions Bar ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <span>All gammas</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/70">
                {projects.length}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create, organize, and present your decks, documents, and webpages
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gammas..."
                className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>

            {/* Primary Create Button */}
            <button
              type="button"
              onClick={() => {
                setCreateModalTab("generate");
                setCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gamma-btn-primary text-xs font-bold shadow-sm shadow-purple-500/25 transition-all cursor-pointer flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create with AI</span>
            </button>
          </div>
        </div>

        {/* ─── 2. Gamma Quick-Start Shelf ────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <button
            type="button"
            onClick={() => {
              setCreateModalTab("generate");
              setCreateModalOpen(true);
            }}
            className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 text-left transition-all gamma-card-hover flex items-center gap-3.5 group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl gamma-gradient-primary text-white flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors">
                Generate with AI
              </span>
              <span className="text-[11px] text-muted-foreground">Start from a single topic or prompt</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateModalTab("paste");
              setCreateModalOpen(true);
            }}
            className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 text-left transition-all gamma-card-hover flex items-center gap-3.5 group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors">
                Paste in text
              </span>
              <span className="text-[11px] text-muted-foreground">Transform raw notes or outlines</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateModalTab("import");
              setCreateModalOpen(true);
            }}
            className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 text-left transition-all gamma-card-hover flex items-center gap-3.5 group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors">
                Import file or URL
              </span>
              <span className="text-[11px] text-muted-foreground">PowerPoint, PDF, Word, or Web</span>
            </div>
          </button>
        </section>

        {/* ─── 3. Filter Navigation Tabs ───────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60">
          {[
            { id: "all", label: "All Formats" },
            { id: "presentation", label: "Presentations" },
            { id: "document", label: "Documents" },
            { id: "webpage", label: "Webpages" },
            { id: "poster", label: "Posters" },
            { id: "infographic", label: "Infographics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
                filterType === tab.id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── 4. Project Cards Grid ───────────────────────────────────────────── */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <span className="text-xs font-medium">Loading your gammas...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Presentation className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">No gammas found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery
                  ? "No projects match your filter. Try adjusting your search query."
                  : "Start by generating a presentation, document, or webpage with AI."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full gamma-btn-primary text-xs font-bold shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create with AI</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((proj) => {
              const isMenuOpen = activeMenuProjectId === proj.id;
              return (
                <div
                  key={proj.id}
                  className="group relative rounded-2xl border border-border bg-card hover:border-primary/50 transition-all overflow-hidden flex flex-col justify-between gamma-card-hover shadow-xs"
                >
                  {/* Visual Card Header / Preview Area */}
                  <Link
                    href={`/editor?projectId=${proj.id}`}
                    className="h-36 w-full bg-muted/30 border-b border-border/70 p-4 flex flex-col justify-between relative overflow-hidden group-hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between z-10">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                          getFormatBadgeColor(proj.project_type)
                        )}
                      >
                        {proj.project_type}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {formatRelativeTime(proj.updated_at)}
                      </span>
                    </div>

                    {/* Micro card mockup */}
                    <div className="w-full h-14 rounded-xl bg-background/90 border border-border/80 p-2.5 flex flex-col justify-between shadow-xs">
                      <div className="w-3/4 h-2 rounded-full bg-primary/40" />
                      <div className="flex gap-2">
                        <div className="w-1/3 h-1 rounded-full bg-muted-foreground/30" />
                        <div className="w-1/2 h-1 rounded-full bg-muted-foreground/20" />
                      </div>
                    </div>

                    {/* Hover Play Button (Present) */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-white/95 text-purple-700 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-4 h-4 fill-purple-700 ml-0.5" />
                      </div>
                    </div>
                  </Link>

                  {/* Card Meta & Actions Menu */}
                  <div className="p-4 flex items-center justify-between gap-2">
                    <Link
                      href={`/editor?projectId=${proj.id}`}
                      className="font-bold text-xs text-foreground hover:text-primary transition-colors truncate flex-1"
                      title={proj.name}
                    >
                      {proj.name || "Untitled Gamma"}
                    </Link>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuProjectId(isMenuOpen ? null : proj.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      <AnimatePresence>
                        {isMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.96 }}
                            transition={{ duration: 0.1 }}
                            onMouseLeave={() => setActiveMenuProjectId(null)}
                            className="absolute right-0 bottom-full mb-1.5 w-44 rounded-xl bg-card border border-border shadow-xl p-1 z-50 space-y-0.5"
                          >
                            <button
                              type="button"
                              onClick={(e) => openRename(proj, e)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted text-foreground text-left transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Rename</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDuplicateProject(proj.id, e)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted text-foreground text-left transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Duplicate</span>
                            </button>

                            <Link
                              href={`/editor?projectId=${proj.id}`}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted text-foreground text-left transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Open in Studio</span>
                            </Link>

                            <div className="h-px bg-border/60 my-0.5" />

                            <button
                              type="button"
                              onClick={(e) => handleDeleteProject(proj.id, e)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-destructive/10 text-destructive text-left transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Move to trash</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rename Modal */}
        <AnimatePresence>
          {renamingProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm rounded-2xl bg-card border border-border p-5 shadow-2xl space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">Rename Gamma</h3>
                  <p className="text-xs text-muted-foreground">Give your deck a clear, descriptive title</p>
                </div>
                <form onSubmit={submitRename} className="space-y-3">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRenamingProject(null)}
                      className="px-3 py-1.5 rounded-lg text-xs hover:bg-muted text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTitle.trim()}
                      className="px-4 py-1.5 rounded-lg gamma-btn-primary text-xs font-bold shadow-xs disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Create with AI Modal */}
        <CreateWithAiModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          defaultTab={createModalTab}
        />
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
