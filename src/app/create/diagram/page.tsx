"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  GitBranch,
  ArrowLeft,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Database,
  Cloud,
  Network,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { buildDiagramDocumentSpec } from "@/lib/generators/diagram/diagram-builder";
import {
  DIAGRAM_CATEGORIES,
  DiagramCategory,
  DiagramNodeItem,
  DiagramConnectionItem,
} from "@/lib/generators/diagram/diagram-types";
import { FormatLivePreview } from "@/components/preview/FormatLivePreview";

export default function DiagramCreatePage() {
  const router = useRouter();
  const { setDocument, setProjectId } = useEditorStore();

  const [category, setCategory] = useState<DiagramCategory>("system_architecture");
  const [title, setTitle] = useState("Distributed Agentic Vector Compiler Pipeline");
  const [subtitle, setSubtitle] = useState("Microservice topology connecting Groq LPU, AST parser, and Office OpenXML serializer");
  const [badge, setBadge] = useState("SYSTEM ARCHITECTURE");
  const [flowDirection, setFlowDirection] = useState<"LR" | "TB">("LR");

  // Initial nodes
  const [nodes, setNodes] = useState<DiagramNodeItem[]>([
    { id: "node-client", label: "Client Studio UI", shape: "pill", status: "completed" },
    { id: "node-api", label: "Edge API Gateway", shape: "cloud", status: "completed" },
    { id: "node-lpu", label: "Groq LPU Inference", shape: "rectangle", status: "active" },
    { id: "node-zod", label: "Zod Schema Validator", shape: "diamond", status: "pending" },
    { id: "node-pptx", label: "Office Vector Engine", shape: "database", status: "pending" },
  ]);

  // Initial connections
  const [connections, setConnections] = useState<DiagramConnectionItem[]>([
    { fromId: "node-client", toId: "node-api", label: "POST /generate", connectionType: "directed" },
    { fromId: "node-api", toId: "node-lpu", label: "Streaming Prompt", connectionType: "directed" },
    { fromId: "node-lpu", toId: "node-zod", label: "JSON AST Stream", connectionType: "directed" },
    { fromId: "node-zod", toId: "node-pptx", label: "Validated Spec", connectionType: "directed" },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddNode = () => {
    const id = `node-${Date.now()}`;
    setNodes([
      ...nodes,
      {
        id,
        label: `Service Node ${nodes.length + 1}`,
        shape: "rectangle",
        status: "pending",
      },
    ]);
  };

  const handleRemoveNode = (idx: number) => {
    if (nodes.length <= 2) {
      alert("A diagram requires at least 2 nodes.");
      return;
    }
    const removedId = nodes[idx].id;
    setNodes(nodes.filter((_, i) => i !== idx));
    setConnections(connections.filter((c) => c.fromId !== removedId && c.toId !== removedId));
  };

  const handleUpdateNode = (idx: number, field: keyof DiagramNodeItem, val: any) => {
    const updated = [...nodes];
    updated[idx] = { ...updated[idx], [field]: val };
    setNodes(updated);
  };

  const handleAddConnection = () => {
    if (nodes.length < 2) return;
    setConnections([
      ...connections,
      {
        fromId: nodes[0].id,
        toId: nodes[1].id,
        label: "Connects to",
        connectionType: "directed",
      },
    ]);
  };

  const handleRemoveConnection = (idx: number) => {
    setConnections(connections.filter((_, i) => i !== idx));
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert("Please provide a title for your workflow diagram.");
      return;
    }

    try {
      setIsGenerating(true);

      const diagramDoc = buildDiagramDocumentSpec({
        diagramCategory: category,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        badge: badge.trim() || undefined,
        nodes,
        connections,
        aspectRatio: "16:9",
      });

      // Strict Project Isolation
      const newProject = await projectService.createProject({
        name: title.slice(0, 45),
        projectType: "diagram",
        originalPrompt: `Diagram: ${title} (${category})`,
        currentSpec: diagramDoc,
      });

      setDocument(diagramDoc);
      setProjectId(newProject.id);

      router.push(`/editor?projectId=${newProject.id}`);
    } catch (err: any) {
      console.error("Diagram generation error:", err);
      alert("Failed to build diagram: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell title="Workflow Diagram Studio" subtitle="Generate system architecture DAGs, flowcharts, and technical topologies">
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio Hub</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/20">
            Diagram Studio
          </span>
        </div>

        {/* Title Header */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Workflow Diagram & Architecture Studio</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Construct high-fidelity node-and-connector DAG diagrams with microservice shapes, decision diamonds, and vector connector routing.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Config Form on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Diagram Archetype */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                1
              </span>
              <h2 className="text-sm font-bold text-foreground">Diagram Archetype</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {Object.values(DIAGRAM_CATEGORIES).map((diag) => {
                const isSelected = category === diag.id;
                return (
                  <button
                    key={diag.id}
                    type="button"
                    onClick={() => {
                      setCategory(diag.id);
                      setBadge(diag.label.toUpperCase());
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-left flex flex-col justify-between transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground"
                        : "border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div>
                      <span className="text-xs font-bold block mb-1">{diag.label}</span>
                      <p className="text-[10px] opacity-75 line-clamp-2">{diag.description}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3] mt-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Diagram Title & Direction */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                2
              </span>
              <h2 className="text-sm font-bold text-foreground">Title & Layout Flow Direction</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-foreground">Diagram Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Microservice System Architecture"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Flow Direction</label>
                <select
                  value={flowDirection}
                  onChange={(e) => setFlowDirection(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="LR">Left to Right (Horizontal DAG)</option>
                  <option value="TB">Top to Bottom (Vertical Flow)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Subtitle / Architecture Description</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. End-to-end request processing flow..."
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          {/* 3. Node Builder */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                  3
                </span>
                <h2 className="text-sm font-bold text-foreground">Diagram Nodes ({nodes.length})</h2>
              </div>
              <button
                type="button"
                onClick={handleAddNode}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Node</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {nodes.map((node, idx) => (
                <div
                  key={node.id}
                  className="p-3 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <span className="text-[10px] font-bold text-muted-foreground w-6 shrink-0">
                    #{idx + 1}
                  </span>

                  <input
                    type="text"
                    value={node.label}
                    onChange={(e) => handleUpdateNode(idx, "label", e.target.value)}
                    placeholder="Node Label"
                    className="flex-1 text-xs font-semibold p-1.5 rounded-lg border border-border bg-background text-foreground"
                  />

                  <select
                    value={node.shape || "rectangle"}
                    onChange={(e) => handleUpdateNode(idx, "shape", e.target.value)}
                    className="text-xs p-1.5 rounded-lg border border-border bg-background text-foreground shrink-0 sm:w-32"
                  >
                    <option value="rectangle">Rectangle (Service)</option>
                    <option value="pill">Pill (Trigger/Terminator)</option>
                    <option value="circle">Circle (State)</option>
                    <option value="diamond">Diamond (Decision)</option>
                    <option value="database">Database (Storage)</option>
                    <option value="cloud">Cloud (Network Gateway)</option>
                  </select>

                  <select
                    value={node.status || "active"}
                    onChange={(e) => handleUpdateNode(idx, "status", e.target.value)}
                    className="text-xs p-1.5 rounded-lg border border-border bg-background text-foreground shrink-0 sm:w-28"
                  >
                    <option value="completed">Completed (Green)</option>
                    <option value="active">Active (Blue)</option>
                    <option value="pending">Pending (Gray)</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveNode(idx)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Remove Node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Connectors & Edges */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                  4
                </span>
                <h2 className="text-sm font-bold text-foreground">Connectors & Links ({connections.length})</h2>
              </div>
              <button
                type="button"
                onClick={handleAddConnection}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-2">
              {connections.map((conn, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                >
                  <select
                    value={conn.fromId}
                    onChange={(e) => {
                      const updated = [...connections];
                      updated[idx].fromId = e.target.value;
                      setConnections(updated);
                    }}
                    className="text-xs p-1.5 rounded-lg border border-border bg-background text-foreground flex-1"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        From: {n.label}
                      </option>
                    ))}
                  </select>

                  <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto shrink-0 hidden sm:block" />

                  <select
                    value={conn.toId}
                    onChange={(e) => {
                      const updated = [...connections];
                      updated[idx].toId = e.target.value;
                      setConnections(updated);
                    }}
                    className="text-xs p-1.5 rounded-lg border border-border bg-background text-foreground flex-1"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        To: {n.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={conn.label || ""}
                    onChange={(e) => {
                      const updated = [...connections];
                      updated[idx].label = e.target.value;
                      setConnections(updated);
                    }}
                    placeholder="Link Label (e.g. JWT Token)"
                    className="text-xs p-1.5 rounded-lg border border-border bg-background text-foreground flex-1"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveConnection(idx)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Remove Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Generate Button */}
          <div className="flex items-center justify-between p-6 rounded-2xl border border-teal-500/20 bg-teal-500/5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Ready to render your workflow diagram?</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generates a clean vector DAG canvas with editable nodes, auto-routed connections, and SVG export.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/95 transition-all shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Routing Diagram DAG...</span>
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4 text-teal-300" />
                  <span>Generate Workflow Diagram</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Sticky Live Preview Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
            <FormatLivePreview
              documentType="diagram"
              title={title || "Untitled Diagram"}
              subtitle={subtitle}
              aspectRatio="16:9"
              moodOrCategory={category}
              details={{
                badge: badge,
                cta: "INSPECT ARCHITECTURE",
                metrics: [
                  { label: "Nodes", value: `${nodes.length}` },
                  { label: "Flow", value: flowDirection === "LR" ? "Left ➔ Right" : "Top ➔ Bottom" },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </AppShell>
  );
}
