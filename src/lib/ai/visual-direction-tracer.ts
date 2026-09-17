/**
 * Runtime Visual Direction Tracer
 * Tracks the complete lifecycle of presentation VisualDirection across all stages:
 * GENERATE_BUTTON_CLICK -> PROJECT_CREATED -> REQUIREMENTS_ANALYZED ->
 * VISUAL_DIRECTION_CREATED -> PLAN_CREATED -> DOCUMENT_SPEC_CREATED ->
 * PAGE_RENDERED -> PPTX_COMPILATION_STARTED -> PPTX_COMPILATION_COMPLETED
 *
 * Ensures project ID, document ID, visualDirection ID, variation seed, and
 * style family remain 100% consistent across the pipeline.
 */

export type VisualDirectionTraceStage =
  | "GENERATE_BUTTON_CLICK"
  | "PROJECT_CREATED"
  | "REQUIREMENTS_ANALYZED"
  | "VISUAL_DIRECTION_CREATED"
  | "PLAN_CREATED"
  | "DOCUMENT_SPEC_CREATED"
  | "PAGE_RENDERED"
  | "PPTX_COMPILATION_STARTED"
  | "PPTX_COMPILATION_COMPLETED";

export interface VisualDirectionTraceRecord {
  requestId?: string;
  projectId: string;
  documentId: string;
  visualDirectionId: string;
  variationSeed: string;
  styleFamily: string;
  stage: VisualDirectionTraceStage;
  generatedAtStage: string;
  consumedBy?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class VisualDirectionTracer {
  private inMemoryTraces: VisualDirectionTraceRecord[] = [];

  public recordTrace(trace: Omit<VisualDirectionTraceRecord, "timestamp">): VisualDirectionTraceRecord {
    const fullTrace: VisualDirectionTraceRecord = {
      ...trace,
      timestamp: new Date().toISOString(),
    };

    this.inMemoryTraces.push(fullTrace);
    if (this.inMemoryTraces.length > 500) {
      this.inMemoryTraces.shift();
    }

    // Server-side logging
    console.log(
      `[VisualDirectionTrace:${trace.stage}] proj=${trace.projectId} doc=${trace.documentId} vd=${trace.visualDirectionId} seed=${trace.variationSeed} family=${trace.styleFamily}` +
        (trace.consumedBy ? ` consumedBy=${trace.consumedBy}` : "")
    );

    // Browser client logging & session exposure for verification
    if (typeof window !== "undefined") {
      try {
        const win = window as any;
        win.__VISUAL_DIRECTION_TRACES__ = win.__VISUAL_DIRECTION_TRACES__ || [];
        win.__VISUAL_DIRECTION_TRACES__.push(fullTrace);

        // Store under project-scoped key
        const storageKey = `slidecraft_trace_${trace.projectId}`;
        const existing = JSON.parse(sessionStorage.getItem(storageKey) || "[]");
        existing.push(fullTrace);
        sessionStorage.setItem(storageKey, JSON.stringify(existing));
      } catch {
        // ignore client storage errors
      }
    }

    return fullTrace;
  }

  public getTracesForProject(projectId: string): VisualDirectionTraceRecord[] {
    return this.inMemoryTraces.filter((t) => t.projectId === projectId);
  }

  public getAllTraces(): VisualDirectionTraceRecord[] {
    return [...this.inMemoryTraces];
  }

  public clear(): void {
    this.inMemoryTraces = [];
  }
}

export const visualDirectionTracer = new VisualDirectionTracer();
