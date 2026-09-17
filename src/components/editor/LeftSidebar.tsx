"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { Project } from "@/types/database";
import {
  Layers,
  FolderOpen,
  ChevronLeft,
  Plus,
  Trash2,
  Copy,
  Search,
  Clock,
  LayoutTemplate,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DESIGN_DIRECTIONS, extractReferenceInspiration } from "@/lib/images/reference-extractor";
import { analyzePptxReference, analyzeImageReference, ExtractedReferenceTokens } from "@/lib/images/reference-parser";

export const LeftSidebar: React.FC = () => {
  const router = useRouter();
  const {
    document,
    activePageIndex,
    setActivePage,
    addPage,
    deletePage,
    updateDocument,
    addElementToActivePage,
    isLeftPanelOpen,
    setLeftPanelOpen,
    leftPanelTab,
    setLeftPanelTab,
    projectId,
  } = useEditorStore();

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Media & Image management state
  const [mediaSubTab, setMediaSubTab] = useState<"search" | "upload">("search");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [webSearchQuery, setWebSearchQuery] = useState("technology");
  const [webSearchResults, setWebSearchResults] = useState<any[]>([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [searchProvider, setSearchProvider] = useState("curated_library");

  // Reference inspiration state
  const [referenceNotes, setReferenceNotes] = useState("");
  const [appliedDirectionId, setAppliedDirectionId] = useState<string | null>(null);
  const [referenceFeedback, setReferenceFeedback] = useState<string | null>(null);
  const [extractedReference, setExtractedReference] = useState<ExtractedReferenceTokens | null>(null);
  const [isParsingReference, setIsParsingReference] = useState(false);

  // Format-aware sidebar helpers
  const getFormatPagesTabLabel = () => {
    switch (document.documentType) {
      case "presentation": return "Slides";
      case "poster": return "Pages";
      case "infographic": return "Sections";
      case "social_media": return "Posts";
      case "resume": return "Sections";
      case "letter": return "Pages";
      case "diagram": return "Diagrams";
      case "chart": return "Views";
      default: return "Pages";
    }
  };

  const getFormatPageTitleFallback = (idx: number) => {
    switch (document.documentType) {
      case "presentation": return `Slide ${idx + 1}`;
      case "poster": return `Page ${idx + 1}`;
      case "infographic": return `Section ${idx + 1}`;
      case "social_media": return `Post ${idx + 1}`;
      case "resume": return `Section ${idx + 1}`;
      case "letter": return `Page ${idx + 1}`;
      case "diagram": return `Diagram ${idx + 1}`;
      case "chart": return `Chart ${idx + 1}`;
      default: return `Page ${idx + 1}`;
    }
  };

  const getFormatAddButtonLabel = () => {
    switch (document.documentType) {
      case "presentation": return "Add New Slide";
      case "poster": return "Add Page";
      case "infographic": return "Add Section";
      case "social_media": return "Add Post Variant";
      case "resume": return "Add Section";
      case "letter": return "Add Page";
      case "diagram": return "Add Diagram View";
      case "chart": return "Add Chart View";
      default: return "Add Page";
    }
  };

  const handleSearchImages = async (q: string) => {
    try {
      setIsSearchingImages(true);
      const res = await fetch(`/api/images/search?query=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setWebSearchResults(data.results || []);
        setIsApiKeyConfigured(data.apiKeyConfigured || false);
        setSearchProvider(data.provider || "curated_library");
      }
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setIsSearchingImages(false);
    }
  };

  // Initial stock images load
  useEffect(() => {
    if (webSearchResults.length === 0) {
      handleSearchImages("technology");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load user projects when switching to projects tab
  useEffect(() => {
    if (leftPanelTab === "projects") {
      setIsLoadingProjects(true);
      projectService
        .fetchUserProjects()
        .then(({ projects }) => {
          setProjects(projects);
        })
        .finally(() => {
          setIsLoadingProjects(false);
        });
    }
  }, [leftPanelTab]);

  if (!isLeftPanelOpen) return null;

  const handleDuplicatePage = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const sourcePage = document.pages[idx];
    if (!sourcePage) return;

    const clonedPage = JSON.parse(JSON.stringify(sourcePage));
    clonedPage.id = `page-${Date.now()}`;
    clonedPage.pageNumber = document.pages.length + 1;
    clonedPage.title = `${sourcePage.title || "Page"} (Copy)`;

    updateDocument((doc) => {
      const newPages = [...doc.pages];
      newPages.splice(idx + 1, 0, clonedPage);
      return {
        ...doc,
        pages: newPages.map((p, i) => ({ ...p, pageNumber: i + 1 })),
      };
    });
    setActivePage(idx + 1);
  };

  const handleDeletePage = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.pages.length <= 1) {
      alert("A document must contain at least one page.");
      return;
    }
    deletePage(idx);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <aside className="w-72 h-full border-r border-border/80 bg-card flex flex-col z-20 select-none shadow-sm animate-in slide-in-from-left-2 duration-200">
      {/* Top Header & Tabs */}
      <div className="p-3 border-b border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50 text-xs font-semibold">
          <button
            onClick={() => setLeftPanelTab("pages")}
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-[11px]",
              leftPanelTab === "pages"
                ? "bg-background text-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Pages"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{getFormatPagesTabLabel()}</span>
          </button>

          <button
            onClick={() => setLeftPanelTab("media")}
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-[11px]",
              leftPanelTab === "media"
                ? "bg-background text-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Images & Assets"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Media</span>
          </button>

          <button
            onClick={() => setLeftPanelTab("templates")}
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-[11px]",
              leftPanelTab === "templates"
                ? "bg-background text-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Style Reference Inspiration"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Style</span>
          </button>

          <button
            onClick={() => setLeftPanelTab("projects")}
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-[11px]",
              leftPanelTab === "projects"
                ? "bg-background text-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Projects"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Files</span>
          </button>
        </div>

        <button
          onClick={() => setLeftPanelOpen(false)}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Collapse Navigator"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {leftPanelTab === "pages" ? (
          /* Pages / Slides Tab */
          <>
            <div className="space-y-2">
              {document.pages.map((page, idx) => {
                const isActive = idx === activePageIndex;
                return (
                  <div
                    key={page.id || idx}
                    onClick={() => setActivePage(idx)}
                    className={cn(
                      "group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2",
                      isActive
                        ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                        : "bg-background border-border/70 hover:border-border hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
                          )}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-foreground line-clamp-1 max-w-[130px]">
                          {page.title || getFormatPageTitleFallback(idx)}
                        </span>
                      </div>

                      {/* Hover Page Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDuplicatePage(idx, e)}
                          title="Duplicate Page"
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {document.pages.length > 1 && (
                          <button
                            onClick={(e) => handleDeletePage(idx, e)}
                            title="Delete Page"
                            className="p-1 rounded hover:bg-rose-50 hover:text-rose-600 text-muted-foreground"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Miniature Archetype Preview Tag */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1 capitalize truncate">
                        <LayoutTemplate className="w-3 h-3 text-muted-foreground" />
                        {page.archetype.replace(/_/g, " ")}
                      </span>
                      <span>{page.elements?.length || 0} items</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Page Button */}
            <button
              onClick={() => addPage("three_card_grid")}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 text-xs font-semibold text-muted-foreground hover:text-primary transition-all mt-4"
            >
              <Plus className="w-4 h-4" />
              <span>{getFormatAddButtonLabel()}</span>
            </button>
          </>
        ) : leftPanelTab === "media" ? (
          /* Media & Image Search/Uploads Tab */
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                <span>Media & Web Photos</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Search curated stock photography or upload local assets to insert into slides.
              </p>
            </div>

            {/* Sub-tab switcher */}
            <div className="flex rounded-lg border border-border p-0.5 bg-muted/30 text-xs">
              <button
                type="button"
                onClick={() => setMediaSubTab("search")}
                className={cn(
                  "flex-1 py-1 rounded-md font-semibold transition-all text-[11px]",
                  mediaSubTab === "search"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Web Search
              </button>
              <button
                type="button"
                onClick={() => setMediaSubTab("upload")}
                className={cn(
                  "flex-1 py-1 rounded-md font-semibold transition-all text-[11px]",
                  mediaSubTab === "upload"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                My Uploads ({uploadedImages.length})
              </button>
            </div>

            {mediaSubTab === "search" ? (
              <div className="space-y-3">
                {/* Search Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchImages(webSearchQuery);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={webSearchQuery}
                      onChange={(e) => setWebSearchQuery(e.target.value)}
                      placeholder="Search photos (tech, business, nature...)"
                      className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingImages}
                    className="px-2.5 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {isSearchingImages ? "..." : "Search"}
                  </button>
                </form>

                {/* API Status Badge */}
                <div className="p-2 rounded-lg border border-border bg-muted/20 text-[10px] text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3 text-primary" />
                    <span>Source: {searchProvider === "curated_library" ? "Curated Royalty-Free Library" : "Live Web API"}</span>
                  </span>
                  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold", isApiKeyConfigured ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}>
                    {isApiKeyConfigured ? "API Active" : "Curated Stock"}
                  </span>
                </div>

                {/* Results Grid */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-foreground">
                    Photo Results ({webSearchResults.length})
                  </div>
                  {webSearchResults.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                      No photos found for &quot;{webSearchQuery}&quot;
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {webSearchResults.map((img) => (
                        <div
                          key={img.id}
                          className="group relative rounded-lg border border-border overflow-hidden bg-background flex flex-col justify-between hover:border-primary transition-colors"
                        >
                          <img
                            src={img.thumbUrl}
                            alt={img.alt}
                            className="w-full h-20 object-cover"
                            loading="lazy"
                          />
                          <div className="p-1.5 space-y-1">
                            <div className="text-[10px] font-medium text-foreground line-clamp-1" title={img.alt}>
                              {img.alt}
                            </div>
                            <div className="text-[9px] text-muted-foreground truncate" title={img.attributionText}>
                              {img.author}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                addElementToActivePage({
                                  type: "media",
                                  id: `media-${Date.now()}`,
                                  mediaType: "image",
                                  src: img.url,
                                  alt: img.alt,
                                  caption: img.attributionText,
                                  fit: "cover",
                                  borderRadius: 8,
                                });
                              }}
                              className="w-full text-[10px] font-bold py-1 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
                            >
                              + Insert
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Local Upload Area */
              <div className="space-y-3">
                <label className="border-2 border-dashed border-border hover:border-primary/80 bg-muted/20 hover:bg-muted/40 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <div className="text-center">
                    <span className="text-xs font-semibold text-primary block">
                      {isUploadingImage ? "Processing image..." : "Click to upload image"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP, SVG up to 10MB</span>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    disabled={isUploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingImage(true);
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const result = evt.target?.result as string;
                        if (result) {
                          setUploadedImages((prev) => [result, ...prev]);
                        }
                        setIsUploadingImage(false);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {/* Uploaded Assets List */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-foreground">
                    Uploaded Assets ({uploadedImages.length})
                  </div>
                  {uploadedImages.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                      No images uploaded yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedImages.map((src, i) => (
                        <div key={i} className="group relative rounded-lg border border-border overflow-hidden bg-background">
                          <img src={src} alt="Uploaded" className="w-full h-20 object-cover" />
                          <div className="p-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                addElementToActivePage({
                                  type: "media",
                                  id: `media-${Date.now()}`,
                                  mediaType: "image",
                                  src,
                                  fit: "cover",
                                  borderRadius: 8,
                                });
                              }}
                              className="w-full text-[10px] font-bold py-1 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
                            >
                              + Insert
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : leftPanelTab === "templates" ? (
          /* Lawful Reference Inspiration & Template Tab */
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Reference Style Extraction</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Upload a reference PPTX or image to lawfully extract color harmony and typography tokens.
              </p>
            </div>

            {/* Reference File Dropzone */}
            <label className="border-2 border-dashed border-border hover:border-primary/80 bg-muted/20 hover:bg-muted/40 rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <div className="text-center">
                <span className="text-xs font-semibold text-primary block">
                  {isParsingReference ? "Extracting style..." : "Upload Reference PPTX or Image"}
                </span>
                <span className="text-[9px] text-muted-foreground">.pptx, .png, .jpg for palette & font extraction</span>
              </div>
              <input
                type="file"
                accept=".pptx,image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={isParsingReference}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsParsingReference(true);
                  try {
                    if (file.name.endsWith(".pptx")) {
                      const arrayBuffer = await file.arrayBuffer();
                      const tokens = analyzePptxReference(Buffer.from(arrayBuffer), file.name);
                      setExtractedReference(tokens);
                    } else {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const dataUri = evt.target?.result as string;
                        const tokens = analyzeImageReference(dataUri, file.name);
                        setExtractedReference(tokens);
                      };
                      reader.readAsDataURL(file);
                    }
                  } catch (err: any) {
                    console.error("Reference parsing error:", err);
                  } finally {
                    setIsParsingReference(false);
                  }
                }}
              />
            </label>

            {/* Extracted Reference Tokens Card */}
            {extractedReference && (
              <div className="p-3 rounded-xl border border-primary/40 bg-primary/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span>Extracted: {extractedReference.sourceName}</span>
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    {extractedReference.sourceType}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{extractedReference.summary}</p>
                
                {/* Palette chips */}
                <div className="flex h-3 rounded-md overflow-hidden border border-border">
                  <div className="flex-1" style={{ backgroundColor: extractedReference.theme.colors.primary }} />
                  <div className="flex-1" style={{ backgroundColor: extractedReference.theme.colors.secondary }} />
                  <div className="flex-1" style={{ backgroundColor: extractedReference.theme.colors.accent }} />
                  <div className="flex-1" style={{ backgroundColor: extractedReference.theme.colors.background }} />
                </div>

                <div className="text-[10px] text-muted-foreground">
                  Fonts: <strong className="text-foreground">{extractedReference.theme.typography.headingFont}</strong> / {extractedReference.theme.typography.bodyFont}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateDocument((doc) => ({
                      ...doc,
                      theme: extractedReference.theme,
                    }));
                    setReferenceFeedback(`Applied design tokens from ${extractedReference.sourceName}.`);
                    setTimeout(() => setReferenceFeedback(null), 3000);
                  }}
                  className="w-full py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Apply Reference Style to Project
                </button>
              </div>
            )}

            {/* Design Direction Presets */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-foreground">Design Directions</div>
              <div className="space-y-1.5">
                {DESIGN_DIRECTIONS.map((dir) => {
                  const isApplied = appliedDirectionId === dir.id;
                  return (
                    <button
                      key={dir.id}
                      type="button"
                      onClick={() => {
                        updateDocument((doc) => ({
                          ...doc,
                          theme: dir.theme,
                        }));
                        setAppliedDirectionId(dir.id);
                        setReferenceFeedback(`Applied '${dir.name}' design direction.`);
                        setTimeout(() => setReferenceFeedback(null), 3000);
                      }}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1.5",
                        isApplied
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-background hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{dir.name}</span>
                        {isApplied && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{dir.description}</p>
                      <div className="flex h-2 rounded-full overflow-hidden border border-border/50 mt-1">
                        <div className="flex-1" style={{ backgroundColor: dir.theme.colors.primary }} />
                        <div className="flex-1" style={{ backgroundColor: dir.theme.colors.secondary }} />
                        <div className="flex-1" style={{ backgroundColor: dir.theme.colors.accent }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Reference Notes Extraction */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="text-[11px] font-bold text-foreground">Reference Notes & Style</div>
              <textarea
                value={referenceNotes}
                onChange={(e) => setReferenceNotes(e.target.value)}
                placeholder="Paste reference style guidelines, colors, or mood notes..."
                rows={3}
                className="w-full text-xs p-2 bg-background rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => {
                  if (!referenceNotes.trim()) return;
                  const result = extractReferenceInspiration(referenceNotes);
                  updateDocument((doc) => ({
                    ...doc,
                    theme: result.directionPreset.theme,
                  }));
                  setAppliedDirectionId(result.directionPreset.id);
                  setReferenceFeedback(result.notes);
                  setTimeout(() => setReferenceFeedback(null), 4000);
                }}
                className="w-full py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Extract & Apply Inspiration
              </button>
              {referenceFeedback && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {referenceFeedback}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* My Projects Quick Switcher Tab */
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {isLoadingProjects ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Loading projects...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No matching projects
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredProjects.map((p) => {
                  const isCurrent = p.id === projectId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (!isCurrent) {
                          router.push(`/editor?projectId=${p.id}`);
                        }
                      }}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between",
                        isCurrent
                          ? "bg-primary/10 border-primary ring-1 ring-primary/20"
                          : "bg-background border-border/70 hover:border-border hover:bg-muted/40"
                      )}
                    >
                      <div className="overflow-hidden pr-2">
                        <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isCurrent && (
                            <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5 uppercase tracking-wider">
                          <span>{p.project_type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 normal-case">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(p.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-border/60">
              <Link
                href="/create"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>Create New Project</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
