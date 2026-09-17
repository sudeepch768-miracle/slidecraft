"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Sparkles,
  Bot,
  Brain,
  Code2,
  Image as ImageIcon,
  Check,
} from "lucide-react";

interface ProviderInfo {
  name: string;
  role: string;
  configuredModel: string;
  effectiveModel: string;
  status: string;
  lastError: string | null;
  isFreeOnly: boolean;
  keyPresent: boolean;
  isModelVerifiedFree?: boolean;
  concurrencyLimit?: number;
  circuitBreakerOpen?: boolean;
}

interface ProviderDiagnosticsResponse {
  architecture: string;
  activeTextProvider: string;
  activeImageProvider: string;
  activeReasoningProvider: string;
  activeImplementationProvider: string;
  providers: {
    groq: ProviderInfo;
    openrouter: ProviderInfo;
    nvidia: ProviderInfo;
    gemini: ProviderInfo;
  };
}

interface AiProviderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiProviderStatusModal: React.FC<AiProviderStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<ProviderDiagnosticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/ai/provider-status");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch provider status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderStatusBadge = (status: string, isFreeOnly = false) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Available</span>
          </span>
        );
      case "quota_exhausted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>No Credits</span>
          </span>
        );
      case "invalid_model":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            <span>Invalid Model</span>
          </span>
        );
      case "rate_limited":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Rate Limited</span>
          </span>
        );
      case "blocked_non_free":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3 h-3" />
            <span>Blocked (Paid)</span>
          </span>
        );
      case "not_configured":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
            <span>Not Configured</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                Multi-Provider AI Architecture
              </h3>
              <p className="text-xs text-muted-foreground">
                Workload Distribution: Groq • NVIDIA • OpenRouter • Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Provider List */}
        <div className="mt-4 space-y-3 overflow-y-auto pr-1">
          {/* Active Status Bar */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Text & Content:</span>
              <span className="font-mono font-bold text-primary text-xs">
                {data?.activeTextProvider || "Scanning..."}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Image & Visual:</span>
              <span className="font-mono font-bold text-pink-500 text-xs">
                {data?.activeImageProvider || "Scanning..."}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Reasoning & QA:</span>
              <span className="font-mono font-bold text-cyan-500 text-xs">
                {data?.activeReasoningProvider || "Scanning..."}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Code & Layout:</span>
              <span className="font-mono font-bold text-purple-500 text-xs">
                {data?.activeImplementationProvider || "Scanning..."}
              </span>
            </div>
          </div>

          {/* Provider 1: Groq (Text & Outlines) */}
          {data?.providers?.groq && (
            <div className="p-3.5 rounded-2xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-[10px] font-bold">
                    1
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">Groq</span>
                      <span className="text-[10px] font-semibold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                        Text & Content
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      Model: {data.providers.groq.effectiveModel}
                    </span>
                  </div>
                </div>
                {renderStatusBadge(data.providers.groq.status)}
              </div>

              {data.providers.groq.lastError && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{data.providers.groq.lastError}</span>
                </div>
              )}
            </div>
          )}

          {/* Provider 2: NVIDIA FLUX (Dedicated Image Generation) */}
          {data?.providers?.nvidia && (
            <div className="p-3.5 rounded-2xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-xl bg-pink-500/15 text-pink-500 flex items-center justify-center text-[10px] font-bold">
                    2
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">NVIDIA FLUX</span>
                      <span className="text-[10px] font-semibold text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded-full border border-pink-500/20">
                        Image Synth
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      Model: {data.providers.nvidia.effectiveModel}
                    </span>
                  </div>
                </div>
                {renderStatusBadge(data.providers.nvidia.status)}
              </div>

              {data.providers.nvidia.lastError && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{data.providers.nvidia.lastError}</span>
                </div>
              )}
            </div>
          )}

          {/* Provider 3: OpenRouter (Code & Implementation - Free Only) */}
          {data?.providers?.openrouter && (
            <div className="p-3.5 rounded-2xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-[10px] font-bold">
                    3
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">OpenRouter</span>
                      <span className="text-[10px] font-semibold text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20">
                        Code & Layout
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Free Only
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      Model: {data.providers.openrouter.effectiveModel}
                    </span>
                  </div>
                </div>
                {renderStatusBadge(data.providers.openrouter.status, true)}
              </div>

              {data.providers.openrouter.lastError && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{data.providers.openrouter.lastError}</span>
                </div>
              )}
            </div>
          )}

          {/* Provider 4: Google Gemini (Reasoning, Review & QA) */}
          {data?.providers?.gemini && (
            <div className="p-3.5 rounded-2xl border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center text-[10px] font-bold">
                    4
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">Google Gemini</span>
                      <span className="text-[10px] font-semibold text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded-full border border-cyan-500/20">
                        Reasoning & QA
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      Model: {data.providers.gemini.effectiveModel}
                    </span>
                  </div>
                </div>
                {renderStatusBadge(data.providers.gemini.status)}
              </div>

              {data.providers.gemini.lastError && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{data.providers.gemini.lastError}</span>
                </div>
              )}
            </div>
          )}

          {/* Task Responsibility Matrix Summary */}
          <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 text-xs space-y-2">
            <h4 className="font-bold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Provider Responsibility & Hard Isolation Rules</span>
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
              <div className="p-2 rounded-xl bg-background/50 border border-border/40">
                <strong className="text-foreground block">Groq</strong>
                <span>Titles, Subtitles, Narrative, Bullets, Notes, JSON Specs</span>
              </div>
              <div className="p-2 rounded-xl bg-background/50 border border-border/40">
                <strong className="text-foreground block">NVIDIA FLUX</strong>
                <span>Backgrounds, Artwork, Visual Assets exclusively</span>
              </div>
              <div className="p-2 rounded-xl bg-background/50 border border-border/40">
                <strong className="text-foreground block">OpenRouter (Free)</strong>
                <span>UI Layout, Component Placement, Code & Exports</span>
              </div>
              <div className="p-2 rounded-xl bg-background/50 border border-border/40">
                <strong className="text-foreground block">Gemini</strong>
                <span>Brief Extraction, Overflow QA, Final Validation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between shrink-0">
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Re-scan Providers</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
