import { SystemMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages"
import type { CopilotIntent } from "./types.js"

const BASE_SYSTEM_INSTRUCTION = `You are CollabNet AI Copilot, an expert pair-programmer assistant embedded inside a collaborative IDE.
Your role is to help users write, debug, and improve code in real time.
Rules:
- Return only code or technical explanations — never discuss unrelated topics
- Format code in Markdown code blocks with the correct language identifier
- If you don't know something, say so — never hallucinate APIs or functions
- Keep responses concise, clean, and directly actionable
- Never attempt to execute terminal commands or invoke external system tools`

const INTENT_DIRECTIVES: Record<CopilotIntent, string> = {
  code_generation: `Primary Objective: Generate production-ready, clean, and idiomatic code matching the user's requirements.
Provide code snippets in markdown code blocks with the proper language syntax. Include minimal, high-impact comments.`,

  explanation: `Primary Objective: Explain the architecture, logic, and mechanics of the specified code or concept clearly.
Break down complex mechanisms using concise bullet points and highlight potential subtleties or gotchas.`,

  debugging: `Primary Objective: Diagnose the root cause of the error or bug.
State what caused the failure, present the precise fixed code, and explain why the fix resolves the issue.`,

  refactoring: `Primary Objective: Improve code quality, maintainability, modularity, and readability while strictly preserving functional behavior.
Highlight what changes were made and the performance or structural advantages gained.`,

  testing: `Primary Objective: Author robust unit or integration tests for the code context or requested scenario.
Cover primary happy paths, edge cases, boundary conditions, and expected error handling using standard testing patterns.`,
}

/**
 * Builds the system message incorporating base rules and intent-specific directives.
 */
export function buildSystemPrompt(intent: CopilotIntent): string {
  const directive = INTENT_DIRECTIVES[intent] || INTENT_DIRECTIVES.code_generation
  return `${BASE_SYSTEM_INSTRUCTION}\n\nTask Directive (${intent}):\n${directive}`
}

/**
 * Constructs the message array to send to the LangChain chat model.
 */
export function buildChatMessages(params: {
  intent: CopilotIntent
  sanitizedPrompt: string
  sanitizedContext?: string
}): BaseMessage[] {
  const systemPrompt = buildSystemPrompt(params.intent)
  const systemMsg = new SystemMessage(systemPrompt)

  let userContent = ""

  if (params.sanitizedContext && params.sanitizedContext.trim().length > 0) {
    userContent += `Here is the current code context from the editor:\n\`\`\`\n${params.sanitizedContext.trim()}\n\`\`\`\n\n`
  }

  userContent += `User request: ${params.sanitizedPrompt.trim()}`

  const userMsg = new HumanMessage(userContent)

  return [systemMsg, userMsg]
}
