"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PresentationPlan } from "@/types/planner";
import { PresentationPlanner } from "@/components/planner/PresentationPlanner";
import { Sparkles, Loader2, BookOpen, AlertCircle, RefreshCw, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOCAL_STORAGE_PLAN_KEY = "slidecraft_current_presentation_plan";

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptParam = searchParams.get("prompt");
  const countParam = searchParams.get("count") || searchParams.get("slideCount");
  const toneParam = searchParams.get("tone");
  const audienceParam = searchParams.get("audience");
  const depthParam = searchParams.get("depth");

  const [plan, setPlan] = useState<PresentationPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState("Analyzing presentation prompt & intent...");
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function initializePlan() {
      setError(null);

      // 1. If a prompt query parameter is supplied, request fresh AI plan generation
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

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server returned HTTP ${res.status}`);
          }

          const data = await res.json();
          if (data.plan && isMounted) {
            setPlan(data.plan);
            try {
              localStorage.setItem(LOCAL_STORAGE_PLAN_KEY, JSON.stringify(data.plan));
            } catch {
              // Local storage quota exceeded or private mode
            }
            setIsLoading(false);
            return;
          } else {
            throw new Error("Invalid plan response received from AI generation engine.");
          }
        } catch (err: any) {
          console.error("[Planner Client Error]:", err);
          if (isMounted) {
            setError(err.message || "Failed to generate presentation plan from server.");
            setIsLoading(false);
          }
          return;
        }
      }

      // 2. If NO prompt param was passed, check local storage for an active presentation plan draft
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
        // Continue to empty state
      }

      // 3. No active draft and no prompt parameter: show clean empty state
      if (isMounted) {
        setIsLoading(false);
      }
    }

    initializePlan();

    return () => {
      isMounted = false;
    };
  }, [promptParam, countParam, toneParam, audienceParam, depthParam, retryTrigger]);

  const handleStartNewPresentation = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_PLAN_KEY);
    } catch {
      // ignore
    }
    setPlan(null);
    router.push("/create/presentation");
  };

  // Loading State
  if (isLoading) {
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

  // Error State (Never silently fall back to an unrelated cached presentation)
  if (error && !plan) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground gap-5 p-6 text-center select-none max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 text-destructive">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Plan Generation Notice</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {error}
          </p>
          {promptParam && (
            <div className="text-xs bg-muted/60 p-3 rounded-xl border border-border/70 text-muted-foreground font-mono text-left break-words">
              <span className="font-bold text-foreground">Requested Topic:</span> {promptParam}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => setRetryTrigger((prev) => prev + 1)}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Generation</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleStartNewPresentation}
            className="gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio</span>
          </Button>
        </div>
      </div>
    );
  }

  // Empty State: Direct visit to /planner with no active draft
  if (!plan) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground gap-6 p-6 text-center select-none max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-sm">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">No Active Presentation Plan</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            There is no active presentation draft loaded in your studio. Enter a topic to generate a structured, editable blueprint with AI.
          </p>
        </div>
        <Button
          onClick={handleStartNewPresentation}
          className="gap-2 text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Presentation</span>
        </Button>
      </div>
    );
  }

  // Active Presentation Planner: key={plan.id} guarantees full component re-initialization on new plans
  return (
    <PresentationPlanner
      key={plan.id}
      initialPlan={plan}
      onNewPresentation={handleStartNewPresentation}
    />
  );
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
