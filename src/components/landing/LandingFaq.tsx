"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How is SlideCraft AI different from traditional slide generators?",
    answer:
      "Traditional generators inject text into rigid, static PowerPoint templates. SlideCraft uses an intelligent Content Planner and a fluid responsive card model with 25+ dynamic archetypes. Every deck is compiled into true native vector OpenXML (.pptx) objects with real data charts and sub-second NVIDIA FLUX visuals.",
  },
  {
    question: "Can I edit the generated presentations in PowerPoint or Google Slides?",
    answer:
      "Yes, 100%. When you export to .pptx, all text boxes, shapes, metric cards, and charts remain native editable vector elements. Nothing is flattened into an uneditable image.",
  },
  {
    question: "What non-slide formats can I generate?",
    answer:
      "SlideCraft generates 8 distinct visual formats: 16:9 Pitch Decks, A4 Print-Ready Posters with 3mm bleed, 9:16 Vertical Infographics, Multi-Ratio Social Media Carousels, ATS-Friendly Resumes, Formal Executive Letters, System Architecture Flowcharts, and Excel-backed Data Reports.",
  },
  {
    question: "How does the animated theming engine work?",
    answer:
      "Our theming engine recalculates typography, surface contrasts, border radiuses, and color harmonizations across every card simultaneously. You can restyle a 20-slide presentation from Dark Obsidian to Warm Editorial in a single click with zero manual adjustments.",
  },
  {
    question: "Does SlideCraft support offline saving and privacy?",
    answer:
      "Yes. All projects are continuously synchronized with local encrypted browser storage with seamless offline capability, alongside optional cloud synchronization through Supabase.",
  },
];

export const LandingFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-16 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto w-full scroll-mt-20">
      <div className="text-center space-y-2 mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Got Questions?</span>
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Everything you need to know about formats, vector exports, theming, and AI generation.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card overflow-hidden transition-colors hover:border-primary/40 shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                aria-expanded={isOpen}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none transition-colors"
              >
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
