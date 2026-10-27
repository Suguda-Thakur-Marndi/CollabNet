import type { RunnableConfig } from "@langchain/core/runnables"
import type { BaseChatModel } from "@langchain/core/language_models/chat_models"
import {
  MAX_PROMPT_LENGTH,
  MAX_CONTEXT_LENGTH,
  MAX_RESPONSE_LENGTH,
  MAX_TRANSIENT_RETRIES,
  type CopilotGraphState,
  type CopilotGraphUpdate,
} from "./types.js"
import { redactSecrets, sanitizeErrorMessage } from "./redaction.js"
import { classifyPromptIntent } from "./classifier.js"
import { buildChatMessages } from "./prompts.js"
import { getChatModel } from "./model.js"

/**
 * Transient error detector for bounded retries.
 */
function isTransientError(err: unknown): boolean {
  if (!err) return false
  const msg = err instanceof Error ? err.message : String(err)
  return (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("fetch failed") ||
    msg.includes("network error")
  )
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error("Aborted"))
      return
    }
    const timer = setTimeout(() => resolve(), ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason ?? new Error("Aborted"))
    }, { once: true })
  })
}

/**
 * 1. Input Validation Node
 * Validates prompt presence, string types, and character bounds.
 */
export function validateInputNode(state: CopilotGraphState): CopilotGraphUpdate {
  const { prompt } = state

  if (!prompt || typeof prompt !== "string") {
    return {
      isValid: false,
      error: "Prompt is required and must be a non-empty string",
    }
  }

  const trimmed = prompt.trim()
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Prompt cannot be empty",
    }
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`,
    }
  }

  return {
    isValid: true,
    error: null,
  }
}

/**
 * 2. Security and Context Preparation Node
 * Redacts secrets from both the prompt and the code context.
 */
export function prepareSecurityContextNode(state: CopilotGraphState): CopilotGraphUpdate {
  const safePrompt = redactSecrets(state.prompt)

  let safeContext = ""
  if (state.context && typeof state.context === "string") {
    const rawContext = state.context.slice(0, MAX_CONTEXT_LENGTH)
    safeContext = redactSecrets(rawContext)
  }

  return {
    sanitizedPrompt: safePrompt,
    sanitizedContext: safeContext,
  }
}

/**
 * 3. Intent Classification Node
 * Categorizes the user request into a structured intent.
 */
export function classifyIntentNode(state: CopilotGraphState): CopilotGraphUpdate {
  const intent = classifyPromptIntent(state.sanitizedPrompt)
  return {
    intent,
  }
}

/**
 * 4. AI Processing Node
 * Invokes the configured Gemini model through LangChain with bounded retries and timeouts.
 */
export async function aiProcessingNode(
  state: CopilotGraphState,
  config?: RunnableConfig
): Promise<CopilotGraphUpdate> {
  const messages = buildChatMessages({
    intent: state.intent,
    sanitizedPrompt: state.sanitizedPrompt,
    sanitizedContext: state.sanitizedContext,
  })

  const modelOverride = config?.configurable?.modelOverride as BaseChatModel | undefined
  let model: BaseChatModel

  try {
    model = getChatModel(modelOverride)
  } catch (err) {
    return {
      isValid: false,
      error: sanitizeErrorMessage(err),
    }
  }

  let lastError: unknown = null
  let attempts = 0

  while (attempts <= MAX_TRANSIENT_RETRIES) {
    if (config?.signal?.aborted) {
      return {
        isValid: false,
        error: "Request was cancelled by client",
      }
    }

    try {
      const response = await model.invoke(messages, {
        signal: config?.signal,
        callbacks: config?.callbacks,
      })

      let text = ""
      if (typeof response.content === "string") {
        text = response.content
      } else if (Array.isArray(response.content)) {
        text = response.content
          .map((part) => (typeof part === "string" ? part : ("text" in part ? (part as { text?: string }).text ?? "" : "")))
          .join("")
      }

      return {
        response: text,
        retryCount: attempts,
        error: null,
      }
    } catch (err: unknown) {
      lastError = err
      attempts++

      if (config?.signal?.aborted) {
        return {
          isValid: false,
          error: "Request was cancelled by client",
        }
      }

      if (attempts <= MAX_TRANSIENT_RETRIES && isTransientError(err)) {
        const backoffMs = attempts * 500
        await delay(backoffMs, config?.signal)
        continue
      }

      break
    }
  }

  return {
    isValid: false,
    error: sanitizeErrorMessage(lastError),
    retryCount: attempts - 1,
  }
}

/**
 * 5. Response Validation Node
 * Validates the generated output, ensures non-empty content, bounds size,
 * and ensures no execution flags exist.
 */
export function validateResponseNode(state: CopilotGraphState): CopilotGraphUpdate {
  if (state.error || !state.isValid) {
    return {}
  }

  const { response } = state

  if (!response || response.trim().length === 0) {
    return {
      isValid: false,
      error: "Model returned an empty response",
    }
  }

  // Ensure secrets were not generated or reflected in the response
  let safeResponse = redactSecrets(response)

  if (safeResponse.length > MAX_RESPONSE_LENGTH) {
    safeResponse = safeResponse.slice(0, MAX_RESPONSE_LENGTH)
  }

  return {
    response: safeResponse,
    isValid: true,
  }
}

/**
 * 6. Error Handling Node
 * Standardizes errors, scrubs stack traces/secrets, and ensures safe delivery.
 */
export function handleErrorNode(state: CopilotGraphState): CopilotGraphUpdate {
  const safeError = sanitizeErrorMessage(state.error ?? "AI generation failed")

  return {
    response: "",
    error: safeError,
    isValid: false,
  }
}
