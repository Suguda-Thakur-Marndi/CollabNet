import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import type { BaseChatModel } from "@langchain/core/language_models/chat_models"

let defaultModelOverride: BaseChatModel | null = null

/**
 * Configure or override the default ChatModel for tests or specialized environments.
 */
export function setModelOverride(model: BaseChatModel | null): void {
  defaultModelOverride = model
}

/**
 * Creates or retrieves the configured Gemini Chat model instance.
 */
export function getChatModel(override?: BaseChatModel): BaseChatModel {
  if (override) {
    return override
  }

  if (defaultModelOverride) {
    return defaultModelOverride
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server")
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash"

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: modelName,
    maxRetries: 0, // Retries are handled with bounded backoff inside the graph
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  })
}
