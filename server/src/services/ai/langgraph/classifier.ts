import type { CopilotIntent } from "./types.js"

interface IntentMatcher {
  intent: CopilotIntent
  patterns: RegExp[]
  weight: number
}

const INTENT_MATCHERS: IntentMatcher[] = [
  {
    intent: "debugging",
    weight: 1.2,
    patterns: [
      /\b(debug|fix|bug|broken|error|err|exception|crash|failing|failed|issue|problem|syntaxerror|typeerror|referenceerror|traceback|stacktrace)\b/i,
      /\b(why is this (failing|broken|crashing|not working))\b/i,
      /\b(solve|resolve) (the )?(error|bug|issue)\b/i,
    ],
  },
  {
    intent: "testing",
    weight: 1.2,
    patterns: [
      /\b(test|tests|testing|unit\s?test|spec|specs|mock|stub|assert|assertion|coverage|e2e|integration\s?test)\b/i,
      /\b(jest|vitest|mocha|cypress|playwright)\b/i,
      /\bwrite (unit )?tests?\b/i,
    ],
  },
  {
    intent: "refactoring",
    weight: 1.1,
    patterns: [
      /\b(refactor|refactoring|clean\s?up|optimize|optimization|improve|simplify|restructure|modernize|decouple|extract|dry|reorganize)\b/i,
      /\bmake (this|it) faster\b/i,
      /\bbetter performance\b/i,
      /\breduce complexity\b/i,
    ],
  },
  {
    intent: "explanation",
    weight: 1.0,
    patterns: [
      /\b(explain|explanation|how does (this|it) work|what does (this|it) do|walk\s?through|clarify|document|documentation|meaning of|overview)\b/i,
      /\b(understand|comprehend)\b/i,
      /\bwhat is the purpose of\b/i,
    ],
  },
  {
    intent: "code_generation",
    weight: 0.9,
    patterns: [
      /\b(create|write|implement|build|generate|add|scaffold|code for|component|function|class|endpoint)\b/i,
      /\bhow to (create|make|build|implement|write)\b/i,
    ],
  },
]

/**
 * Classifies a sanitized user prompt into a structured CopilotIntent.
 * Uses weighted pattern scoring with a reliable fallback to code_generation.
 */
export function classifyPromptIntent(prompt: string): CopilotIntent {
  if (!prompt || typeof prompt !== "string") {
    return "code_generation"
  }

  const normalized = prompt.trim().toLowerCase()
  let bestIntent: CopilotIntent = "code_generation"
  let highestScore = 0

  for (const matcher of INTENT_MATCHERS) {
    let score = 0
    for (const pattern of matcher.patterns) {
      if (pattern.test(normalized)) {
        score += matcher.weight
      }
    }

    if (score > highestScore) {
      highestScore = score
      bestIntent = matcher.intent
    }
  }

  return bestIntent
}
