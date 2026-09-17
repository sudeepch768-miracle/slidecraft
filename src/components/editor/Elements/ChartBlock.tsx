"use client";

import React from "react";
import { ChartElement as ChartElementType, ThemeSpec } from "@/types/document-spec";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, AlertTriangle, Info } from "lucide-react";

interface ChartBlockProps {
  element: ChartElementType;
  theme: ThemeSpec;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ChartBlock: React.FC<ChartBlockProps> = ({ element, theme, isSelected, onSelect }) => {
  const { chartType, title, labels, datasets, showLegend, scatterData, kpis, recommendationNote } =
    element;

  // Format data for Recharts
  const chartData = labels.map((label, idx) => {
    const entry: Record<string, any> = { label };
    datasets.forEach((ds) => {
      entry[ds.name] = ds.data[idx] ?? 0;
    });
    return entry;
  });

  const defaultPalette = [
    theme.colors.secondary,
    theme.colors.accent,
    theme.colors.primary,
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
  ];

  // Pie chart formatted data
  const pieData = labels.map((label, idx) => ({
    name: label,
    value: datasets[0]?.data[idx] ?? 0,
  }));

  // Scatter data fallback
  const scatterPoints =
    scatterData && scatterData.length > 0
      ? scatterData
      : labels.map((label, idx) => ({
          x: idx * 10,
          y: datasets[0]?.data[idx] ?? idx * 15,
          z: datasets[1]?.data[idx] ?? 100,
          name: label,
        }));

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col p-6 rounded-2xl border transition-all cursor-pointer shadow-sm w-full h-full min-h-[340px]",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: `${theme.styleTokens?.borderRadiusPx ?? 12}px`,
      }}
    >
      {/* Title & Recommendation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        {title && (
          <h4
            className="text-base font-semibold"
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.headingFont,
            }}
          >
            {title}
          </h4>
        )}

        {recommendationNote && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-xs">{recommendationNote}</span>
          </div>
        )}
      </div>

      {/* KPI Cards Header if present */}
      {kpis && kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border bg-muted/20 flex flex-col justify-between"
              style={{ borderColor: theme.colors.border }}
            >
              <span className="text-xs text-muted-foreground font-medium truncate">{kpi.label}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                  {kpi.value}
                </span>
                {kpi.delta && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {kpi.delta}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={theme.colors.textSecondary}
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke={theme.colors.textSecondary}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: "8px",
                }}
              />
              {showLegend && <Legend />}
              {datasets.map((ds, idx) => (
                <Line
                  key={ds.name}
                  type="monotone"
                  dataKey={ds.name}
                  stroke={ds.color || defaultPalette[idx % defaultPalette.length]}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          ) : chartType === "area" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={theme.colors.textSecondary}
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke={theme.colors.textSecondary}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              {showLegend && <Legend />}
              {datasets.map((ds, idx) => (
                <Area
                  key={ds.name}
                  type="monotone"
                  dataKey={ds.name}
                  stroke={ds.color || defaultPalette[idx % defaultPalette.length]}
                  fill={ds.color || defaultPalette[idx % defaultPalette.length]}
                  fillOpacity={0.2}
                />
              ))}
            </AreaChart>
          ) : chartType === "pie" || chartType === "doughnut" ? (
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={chartType === "doughnut" ? "55%" : 0}
                outerRadius="80%"
                paddingAngle={4}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={defaultPalette[index % defaultPalette.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          ) : chartType === "scatter" ? (
            <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis type="number" dataKey="x" name="X" stroke={theme.colors.textSecondary} />
              <YAxis type="number" dataKey="y" name="Y" stroke={theme.colors.textSecondary} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} name="Z" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              {showLegend && <Legend />}
              <Scatter
                name="Data Distribution"
                data={scatterPoints}
                fill={theme.colors.secondary}
              />
            </ScatterChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={theme.colors.textSecondary}
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke={theme.colors.textSecondary}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: "8px",
                }}
              />
              {showLegend && <Legend />}
              {datasets.map((ds, idx) => (
                <Bar
                  key={ds.name}
                  dataKey={ds.name}
                  fill={ds.color || defaultPalette[idx % defaultPalette.length]}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
