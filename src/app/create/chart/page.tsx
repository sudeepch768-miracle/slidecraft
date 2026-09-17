"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  LineChart,
  ArrowLeft,
  Sparkles,
  Table,
  Upload,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Database,
  BarChart,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/lib/projects/project-service";
import { buildChartDocumentSpec } from "@/lib/generators/chart/chart-builder";
import {
  CHART_TYPES_META,
  ChartTypeKind,
  ChartArchetypeCategory,
} from "@/lib/generators/chart/chart-types";
import { FormatLivePreview } from "@/components/preview/FormatLivePreview";

export default function ChartCreatePage() {
  const router = useRouter();
  const { setDocument, setProjectId } = useEditorStore();

  const [chartKind, setChartKind] = useState<ChartTypeKind>("column");
  const [archetype, setArchetype] = useState<ChartArchetypeCategory>("kpi_dashboard");
  const [title, setTitle] = useState("Enterprise Cloud Infrastructure ROI Benchmark");
  const [subtitle, setSubtitle] = useState("Quarterly comparative analysis of operational expenditure and cloud latency across 2025-2026");

  // Editable Table Data
  const [labels, setLabels] = useState<string[]>(["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026"]);
  const [dataset1Name, setDataset1Name] = useState("Legacy Monolith (\$K)");
  const [dataset1Values, setDataset1Values] = useState<number[]>([140, 155, 170, 185, 210, 230]);

  const [dataset2Name, setDataset2Name] = useState("Autonomous Agentic Stack (\$K)");
  const [dataset2Values, setDataset2Values] = useState<number[]>([140, 115, 95, 80, 72, 65]);

  // Executive KPI Cards
  const [kpi1Val, setKpi1Val] = useState("-65%");
  const [kpi1Label, setKpi1Label] = useState("OpEx Cost Reduction");
  const [kpi2Val, setKpi2Val] = useState("99.98%");
  const [kpi2Label, setKpi2Label] = useState("Service Availability");
  const [kpi3Val, setKpi3Val] = useState("3.4x");
  const [kpi3Label, setKpi3Label] = useState("Throughput Velocity");

  const [csvInput, setCsvInput] = useState("");
  const [showCsvBox, setShowCsvBox] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Parse CSV function
  const handleParseCsv = () => {
    if (!csvInput.trim()) return;
    try {
      const rows = csvInput.trim().split("\n").map((r) => r.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
      if (rows.length < 2) {
        alert("CSV requires at least a header row and 1 data row.");
        return;
      }

      const header = rows[0];
      const parsedLabels: string[] = [];
      const d1Vals: number[] = [];
      const d2Vals: number[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0]) {
          parsedLabels.push(row[0]);
          d1Vals.push(parseFloat(row[1]) || 0);
          if (row.length > 2) {
            d2Vals.push(parseFloat(row[2]) || 0);
          }
        }
      }

      if (parsedLabels.length > 0) {
        setLabels(parsedLabels);
        if (header.length > 1) setDataset1Name(header[1]);
        setDataset1Values(d1Vals);
        if (header.length > 2 && d2Vals.length > 0) {
          setDataset2Name(header[2]);
          setDataset2Values(d2Vals);
        }
        setShowCsvBox(false);
      }
    } catch (err: any) {
      alert("Failed to parse CSV: " + err.message);
    }
  };

  const handleAddRow = () => {
    setLabels([...labels, `Category ${labels.length + 1}`]);
    setDataset1Values([...dataset1Values, 100]);
    setDataset2Values([...dataset2Values, 80]);
  };

  const handleRemoveRow = (idx: number) => {
    if (labels.length <= 2) {
      alert("At least 2 data points are required.");
      return;
    }
    setLabels(labels.filter((_, i) => i !== idx));
    setDataset1Values(dataset1Values.filter((_, i) => i !== idx));
    setDataset2Values(dataset2Values.filter((_, i) => i !== idx));
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert("Please provide a chart title.");
      return;
    }

    try {
      setIsGenerating(true);

      const datasets = [
        {
          name: dataset1Name,
          data: dataset1Values,
          color: "#2563EB",
        },
      ];

      if (dataset2Values.length === dataset1Values.length && dataset2Name) {
        datasets.push({
          name: dataset2Name,
          data: dataset2Values,
          color: "#10B981",
        });
      }

      const kpis = [
        { label: kpi1Label, value: kpi1Val, delta: "+4.2%", trend: "up" as const },
        { label: kpi2Label, value: kpi2Val, delta: "+0.12%", trend: "up" as const },
        { label: kpi3Label, value: kpi3Val, delta: "+340%", trend: "up" as const },
      ];

      const chartDoc = buildChartDocumentSpec({
        chartType: chartKind,
        archetype,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        labels,
        datasets,
        kpis,
        aspectRatio: "16:9",
      });

      // Strict Project Isolation
      const newProject = await projectService.createProject({
        name: title.slice(0, 45),
        projectType: "chart",
        originalPrompt: `Chart: ${title} (${chartKind})`,
        currentSpec: chartDoc,
      });

      setDocument(chartDoc);
      setProjectId(newProject.id);

      router.push(`/editor?projectId=${newProject.id}`);
    } catch (err: any) {
      console.error("Chart generation error:", err);
      alert("Failed to build chart: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell title="Chart Report Studio" subtitle="Generate quantitative dashboards, data visualizations, and CSV reports">
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
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            Chart Studio
          </span>
        </div>

        {/* Title Header */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Chart Report & Data Visualization Studio</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter numbers directly, import CSV datasets, assign executive KPI cards, and export native interactive vector charts.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Config Form on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Chart Type & Archetype */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                  1
                </span>
                <h2 className="text-sm font-bold text-foreground">Visualization Type & Layout</h2>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setArchetype("kpi_dashboard")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors",
                    archetype === "kpi_dashboard" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  KPI Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setArchetype("deep_dive")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors",
                    archetype === "deep_dive" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Deep Dive
                </button>
                <button
                  type="button"
                  onClick={() => setArchetype("comparison_view")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-colors",
                    archetype === "comparison_view" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Comparison
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(CHART_TYPES_META).map((c) => {
                const isSelected = chartKind === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChartKind(c.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left flex flex-col justify-between transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground"
                        : "border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div>
                      <span className="text-xs font-bold block mb-1">{c.label}</span>
                      <p className="text-[10px] opacity-75 line-clamp-2">{c.bestFor}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3] mt-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Title & Narrative */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                2
              </span>
              <h2 className="text-sm font-bold text-foreground">Chart Report Title & Takeaway</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Report Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Enterprise Cloud Infrastructure ROI Benchmark"
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Executive Subtitle / Context</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Quarterly comparative analysis across multi-cloud regions..."
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>

          {/* 3. Executive KPI Cards */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                3
              </span>
              <h2 className="text-sm font-bold text-foreground">Executive Metric Callout Cards (3 KPIs)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">KPI Card 1</span>
                <input
                  type="text"
                  value={kpi1Val}
                  onChange={(e) => setKpi1Val(e.target.value)}
                  placeholder="e.g. -65%"
                  className="w-full text-sm font-black p-1.5 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="text"
                  value={kpi1Label}
                  onChange={(e) => setKpi1Label(e.target.value)}
                  placeholder="Metric Label"
                  className="w-full text-xs p-1 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">KPI Card 2</span>
                <input
                  type="text"
                  value={kpi2Val}
                  onChange={(e) => setKpi2Val(e.target.value)}
                  placeholder="e.g. 99.98%"
                  className="w-full text-sm font-black p-1.5 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="text"
                  value={kpi2Label}
                  onChange={(e) => setKpi2Label(e.target.value)}
                  placeholder="Metric Label"
                  className="w-full text-xs p-1 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">KPI Card 3</span>
                <input
                  type="text"
                  value={kpi3Val}
                  onChange={(e) => setKpi3Val(e.target.value)}
                  placeholder="e.g. 3.4x"
                  className="w-full text-sm font-black p-1.5 rounded-lg border border-border bg-background text-foreground"
                />
                <input
                  type="text"
                  value={kpi3Label}
                  onChange={(e) => setKpi3Label(e.target.value)}
                  placeholder="Metric Label"
                  className="w-full text-xs p-1 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* 4. Interactive Data Table & CSV Import */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold">
                  4
                </span>
                <h2 className="text-sm font-bold text-foreground">Dataset Table ({labels.length} points)</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCsvBox(!showCsvBox)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>CSV Paste / Import</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Data Point</span>
                </button>
              </div>
            </div>

            {/* CSV Box Modal/Accordion */}
            {showCsvBox && (
              <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                <label className="text-xs font-bold text-foreground block">Paste CSV Data (Comma-separated)</label>
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder={"Period,Series 1,Series 2\nQ1,100,80\nQ2,120,95\nQ3,150,110"}
                  rows={4}
                  className="w-full text-xs font-mono p-2 rounded-lg border border-border bg-background text-foreground resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCsvBox(false)}
                    className="px-3 py-1 rounded-md text-xs text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleParseCsv}
                    className="px-3 py-1 rounded-md text-xs font-bold bg-primary text-primary-foreground shadow-sm"
                  >
                    Apply CSV Data
                  </button>
                </div>
              </div>
            )}

            {/* Editable Grid */}
            <div className="border border-border rounded-xl overflow-hidden bg-background">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-2.5 font-bold text-muted-foreground w-1/3">Category / X-Axis</th>
                    <th className="p-2.5 font-bold text-blue-500">
                      <input
                        type="text"
                        value={dataset1Name}
                        onChange={(e) => setDataset1Name(e.target.value)}
                        className="font-bold bg-transparent border-b border-transparent hover:border-blue-500 focus:outline-none w-full"
                        title="Rename Series 1"
                      />
                    </th>
                    <th className="p-2.5 font-bold text-emerald-500">
                      <input
                        type="text"
                        value={dataset2Name}
                        onChange={(e) => setDataset2Name(e.target.value)}
                        className="font-bold bg-transparent border-b border-transparent hover:border-emerald-500 focus:outline-none w-full"
                        title="Rename Series 2"
                      />
                    </th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {labels.map((label, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="p-2">
                        <input
                          type="text"
                          value={label}
                          onChange={(e) => {
                            const updated = [...labels];
                            updated[idx] = e.target.value;
                            setLabels(updated);
                          }}
                          className="w-full p-1 text-xs rounded bg-transparent border border-transparent hover:border-border focus:border-primary focus:bg-background outline-none text-foreground font-medium"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={dataset1Values[idx] ?? 0}
                          onChange={(e) => {
                            const updated = [...dataset1Values];
                            updated[idx] = parseFloat(e.target.value) || 0;
                            setDataset1Values(updated);
                          }}
                          className="w-full p-1 text-xs rounded bg-transparent border border-transparent hover:border-border focus:border-primary focus:bg-background outline-none text-foreground font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={dataset2Values[idx] ?? 0}
                          onChange={(e) => {
                            const updated = [...dataset2Values];
                            updated[idx] = parseFloat(e.target.value) || 0;
                            setDataset2Values(updated);
                          }}
                          className="w-full p-1 text-xs rounded bg-transparent border border-transparent hover:border-border focus:border-primary focus:bg-background outline-none text-foreground font-mono"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Remove Point"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Generate Button */}
          <div className="flex items-center justify-between p-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Ready to render your chart report?</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generates an isolated quantitative chart project with interactive tooltips, live CSV export, and high-res vector rendering.
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
                  <span>Synthesizing Chart Report...</span>
                </>
              ) : (
                <>
                  <LineChart className="w-4 h-4 text-cyan-300" />
                  <span>Generate Chart Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Sticky Live Preview Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
            <FormatLivePreview
              documentType="chart"
              title={title || "Untitled Chart"}
              subtitle={subtitle}
              aspectRatio="16:9"
              moodOrCategory={chartKind}
              details={{
                badge: chartKind.toUpperCase(),
                cta: "EXPORT CSV",
                metrics: [
                  { label: kpi1Label, value: kpi1Val },
                  { label: kpi2Label, value: kpi2Val },
                  { label: kpi3Label, value: kpi3Val },
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
