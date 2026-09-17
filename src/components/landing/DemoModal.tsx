"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, Layers, Cpu, Download, CheckCircle2, Play } from "lucide-react";
import Link from "next/link";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop with Frosted Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.25,
            }}
            className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl overflow-hidden z-10 text-left"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl gamma-gradient-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    SlideCraft AI Studio Architecture
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Next-generation presentation compiler in 4 unified stages
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-border/80 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer active:scale-90"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Steps Workflow */}
            <div className="py-6 space-y-3.5">
              {[
                {
                  step: "01",
                  title: "Intelligent Semantic Content Planner",
                  desc: "Analyzes prompt depth, audience persona, and narrative arc before generating a single slide element.",
                  icon: Layers,
                  color: "text-purple-500 bg-purple-500/10",
                },
                {
                  step: "02",
                  title: "25+ Content-Aware Visual Archetypes",
                  desc: "Automatically selects Hero, 3-Card Split, 4-Metric KPI, or Timeline based on content density.",
                  icon: Cpu,
                  color: "text-indigo-500 bg-indigo-500/10",
                },
                {
                  step: "03",
                  title: "Sub-Second NVIDIA FLUX 4B Diffusion",
                  desc: "Renders zero-text, studio-grade photorealistic visual assets directly embedded inside your cards.",
                  icon: Sparkles,
                  color: "text-cyan-500 bg-cyan-500/10",
                },
                {
                  step: "04",
                  title: "100% Vector OpenXML PPTX Export",
                  desc: "Every card, shape, metric, and text block remains fully editable natively inside Microsoft PowerPoint.",
                  icon: Download,
                  color: "text-emerald-500 bg-emerald-500/10",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-muted/30 border border-border/70 hover:border-primary/40 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${item.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          {item.step}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>No credit card required · Free starter tier</span>
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full gamma-btn-primary text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <span>Launch Studio Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
