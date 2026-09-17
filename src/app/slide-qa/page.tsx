"use client";

import React, { useEffect, useState } from "react";
import { DocumentSpec } from "@/types/document-spec";
import { PageRenderer } from "@/components/editor/PageRenderer";

export default function SlideQaPage() {
  const [doc, setDoc] = useState<DocumentSpec | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/qa-document")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setDoc(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load QA document:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white font-mono">
        Loading NeuroInsight document...
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-rose-400 font-mono">
        Error: NeuroInsight document not found. Run generation first.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 py-12 px-6 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">NeuroInsight Visual QA Suite</h1>
        <p className="text-sm text-neutral-400 font-mono">
          Evaluating 8 Slides at 1280x720 Native 16:9 Viewport
        </p>
      </header>

      <div className="flex flex-col gap-12 items-center w-full max-w-[1320px]">
        {doc.pages.map((page, idx) => (
          <div key={page.id || idx} className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-between w-[1280px] px-2 text-xs font-mono text-neutral-400">
              <span className="font-bold text-sky-400">SLIDE {idx + 1} OF {doc.pages.length}</span>
              <span>ARCHETYPE: <code className="text-teal-300">{page.archetype}</code></span>
            </div>
            <div
              id={`slide-${idx + 1}`}
              className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10"
              style={{ width: "1280px", height: "720px" }}
            >
              <PageRenderer
                page={page}
                theme={doc.theme}
                totalSlides={doc.pages.length}
                className="w-full h-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
