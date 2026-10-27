import { Annotation } from "@langchain/langgraph"

/**
 * Supported Copilot intents categorized by the intent classification node.
 */
export type CopilotIntent =
  | "code_generation"
  | "explanation"
  | "debugging"
  | "refactoring"
  | "testing"

/** Request and context size constraints */
export const MAX_PROMPT_LENGTH = 8000
export const MAX_CONTEXT_LENGTH = 4000
export const MAX_RESPONSE_LENGTH = 32000
export const MAX_TRANSIENT_RETRIES = 2
export const DEFAULT_REQUEST_TIMEOUT_MS = 60000

/**
 * Typed LangGraph state definition for the CollabNet Copilot graph.
 */
export const CopilotAnnotation = Annotation.Root({
  /** Raw user prompt input */
  prompt: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),

  /** Optional raw code context provided by editor */
  context: Annotation<string | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),

  /** Prompt after secret redaction and whitespace normalization */
  sanitizedPrompt: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),

  /** Context after secret redaction and size clipping */
  sanitizedContext: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),

  /** Categorized intent of the request */
  intent: Annotation<CopilotIntent>({
    reducer: (_, next) => next,
    default: () => "code_generation",
  }),

  /** Validation flag determining whether execution can proceed */
  isValid: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => true,
  }),

  /** Error message if any node encountered a terminal failure */
  error: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  /** Generated AI response text */
  response: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),

  /** Count of transient retry attempts */
  retryCount: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),

  /** Diagnostic and audit metadata (model name, tokens, timestamps) */
  metadata: Annotation<Record<string, unknown>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({}),
  }),
})

export type CopilotGraphState = typeof CopilotAnnotation.State
export type CopilotGraphUpdate = typeof CopilotAnnotation.Update

/**
 * Result structure emitted by the Copilot graph execution.
 */
export interface CopilotExecutionResult {
  success: boolean
  response: string
  intent: CopilotIntent
  error?: string
  metadata: Record<string, unknown>
}

/**
 * Event emitted during streaming execution.
 */
export type CopilotStreamChunk =
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; error: string }
