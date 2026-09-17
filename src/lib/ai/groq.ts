import { aiTaskRouter, AiTaskType } from "./routing/ai-task-router";

export const PRIMARY_GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
export const FAST_GROQ_MODEL = "llama-3.1-8b-instant";

export interface GroqCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  taskType?: AiTaskType;
  dedupKey?: string;
}

/**
 * High-reliability AI completion dispatcher.
 * Routes through the central Multi-Provider Task Router using Groq as primary
 * for text/content tasks with strict fallback to OpenRouter (free-only).
 */
export async function callGroqChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: GroqCompletionOptions = {}
): Promise<string> {
  const taskType: AiTaskType = options.taskType || (options.jsonMode ? "STRUCTURED_JSON" : "TEXT_CONTENT");
  
  const res = await aiTaskRouter.executeTask(
    taskType,
    messages,
    {
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      jsonMode: options.jsonMode,
    },
    options.dedupKey
  );

  return res.content;
}
