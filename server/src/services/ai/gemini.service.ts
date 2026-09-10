import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"

// Secrets that must never be forwarded to Gemini
const SECRET_PATTERNS = [
  /DATABASE_URL/gi,
  /REDIS_URL/gi,
  /GOOGLE_CLIENT_SECRET/gi,
  /SESSION_SECRET/gi,
  /EXECUTION_WORKER_SECRET/gi,
  /AWS_SECRET/gi,
  /AWS_ACCESS_KEY/gi,
  /GEMINI_API_KEY/gi,
  /TURN_PASSWORD/gi,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/gi,
  /AIzaSy[A-Za-z0-9_-]{33}/g, // Google API key pattern
  /AQ\.Ab[A-Za-z0-9_-]{30,}/g, // Google AI Studio key pattern
]

/**
 * Redact any secrets from the prompt before sending to Gemini.
 */
function redactSecrets(text: string): string {
  let redacted = text
  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, "[REDACTED]")
  }
  return redacted
}

/**
 * Validates and cleans a prompt.
 * Returns null if the prompt is invalid.
 */
function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || typeof prompt !== "string") {
    return { valid: false, error: "Prompt must be a non-empty string" }
  }
  if (prompt.trim().length === 0) {
    return { valid: false, error: "Prompt cannot be empty" }
  }
  if (prompt.length > 8000) {
    return { valid: false, error: "Prompt exceeds maximum length of 8000 characters" }
  }
  return { valid: true }
}

/**
 * Generate code using Google Gemini API.
 * Returns an async generator that yields text chunks (for SSE streaming).
 */
export async function* generateCodeStream(
  userPrompt: string,
  codeContext?: string
): AsyncGenerator<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server")
  }

  const validation = validatePrompt(userPrompt)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Redact secrets before sending anything to Gemini
  const safePrompt = redactSecrets(userPrompt)
  const safeContext = codeContext ? redactSecrets(codeContext.slice(0, 4000)) : ""

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    systemInstruction: `You are CollabNet AI Copilot, an expert pair-programmer assistant embedded inside a collaborative IDE.
Your role is to help users write, debug, and improve code.
Rules:
- Return only code or technical explanations — never discuss unrelated topics
- Format code in Markdown code blocks with the correct language identifier
- If you don't know something, say so — never hallucinate APIs or functions
- Keep responses concise and actionable`,
  })

  const parts = []

  if (safeContext) {
    parts.push({
      text: `Here is the current code context:\n\`\`\`\n${safeContext}\n\`\`\`\n\n`,
    })
  }

  parts.push({ text: `User request: ${safePrompt}` })

  const result = await model.generateContentStream({ contents: [{ role: "user", parts }] })

  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) {
      yield text
    }
  }
}
