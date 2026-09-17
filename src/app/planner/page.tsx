"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PresentationPlan } from "@/types/planner";
import { PresentationPlanner } from "@/components/planner/PresentationPlanner";
import { Sparkles, Loader2, BookOpen, Layers } from "lucide-react";

const LOCAL_STORAGE_PLAN_KEY = "slidecraft_current_presentation_plan";

function PlannerContent() {
  const searchParams = useSearchParams();
  const promptParam = searchParams.get("prompt");
  const countParam = searchParams.get("count") || searchParams.get("slideCount");
  const toneParam = searchParams.get("tone");
  const audienceParam = searchParams.get("audience");
  const depthParam = searchParams.get("depth");

  const [plan, setPlan] = useState<PresentationPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState("Analyzing presentation prompt & intent...");

  useEffect(() => {
    let isMounted = true;

    async function initializePlan() {
      // 1. If a prompt query parameter is supplied, request AI plan generation
      if (promptParam && promptParam.trim().length > 0) {
        setIsLoading(true);
        setLoadingStage("Synthesizing comprehensive curriculum & narrative arc...");

        try {
          const res = await fetch("/api/ai/planner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "generate_plan",
              prompt: promptParam.trim(),
              slideCount: countParam ? Number(countParam) : 10,
              tone: toneParam || "Modern Editorial",
              targetAudience: audienceParam || "College Students & Professionals",
              contentDepth: depthParam || "detailed",
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.plan && isMounted) {
              setPlan(data.plan);
              localStorage.setItem(LOCAL_STORAGE_PLAN_KEY, JSON.stringify(data.plan));
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Failed to generate plan from server, falling back to local synthesis:", err);
        }
      }

      // 2. Check local storage for active presentation plan draft
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_PLAN_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.slidePlans) && parsed.slidePlans.length > 0) {
            if (isMounted) {
              setPlan(parsed);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch {
        // Continue to fallback
      }

      // 3. Fallback: generate default 10-slide curriculum on Artificial Intelligence in Healthcare
      try {
        setLoadingStage("Loading comprehensive Artificial Intelligence in Healthcare curriculum...");
        const res = await fetch("/api/ai/planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate_plan",
            prompt: "Artificial Intelligence in Healthcare: Clinical Applications, Ethics & Future",
            slideCount: 10,
            tone: "Modern Editorial",
            targetAudience: "College Students & Academic Researchers",
            contentDepth: "detailed",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.plan && isMounted) {
            setPlan(data.plan);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Critical error loading presentation plan:", err);
      }

      setIsLoading(false);
    }

    initializePlan();

    return () => {
      isMounted = false;
    };
  }, [promptParam, countParam, toneParam, audienceParam, depthParam]);

  if (isLoading || !plan) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground gap-4 p-6 text-center select-none">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg font-bold">SlideCraft Presentation Content Planner</h2>
          <p className="text-xs text-muted-foreground">{loadingStage}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Generating informative paragraphs, real-world examples, and presenter notes...</span>
        </div>
      </div>
    );
  }

  return <PresentationPlanner initialPlan={plan} />;
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
