/**
 * Credential and secret redaction engine for CollabNet.
 * Ensures private keys, session tokens, cloud credentials, and database URLs
 * are never forwarded to external AI models or exposed in error streams.
 */

export const SECRET_PATTERNS: readonly RegExp[] = [
  /DATABASE_URL/gi,
  /REDIS_URL/gi,
  /GOOGLE_CLIENT_SECRET/gi,
  /SESSION_SECRET/gi,
  /EXECUTION_WORKER_SECRET/gi,
  /AWS_SECRET/gi,
  /AWS_ACCESS_KEY/gi,
  /GEMINI_API_KEY/gi,
  /TURN_PASSWORD/gi,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----[\s\S]*?-----END (RSA |EC )?PRIVATE KEY-----/gi,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/gi,
  /AIzaSy[A-Za-z0-9_-]{33}/g, // Google API key pattern
  /AQ\.Ab[A-Za-z0-9_-]{30,}/g, // Google AI Studio key pattern
  /(bearer\s+)[a-zA-Z0-9_\-\.]{20,}/gi, // Bearer tokens
  /(api[_-]?key\s*[:=]\s*['"]?)[a-zA-Z0-9_\-]{16,}['"]?/gi, // Generic API key assignments
  /(password\s*[:=]\s*['"]?)[^'"\s]{8,}['"]?/gi, // Generic password assignments
]

/**
 * Masks any sensitive tokens, API keys, or credentials found within the text.
 */
export function redactSecrets(text: string): string {
  if (!text || typeof text !== "string") {
    return ""
  }

  let sanitized = text
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]")
  }
  return sanitized
}

/**
 * Sanitizes an error message so that no internal credentials, stack traces,
 * or server paths are exposed to the user or SSE stream.
 */
export function sanitizeErrorMessage(err: unknown): string {
  let message = "AI processing error"

  if (err instanceof Error) {
    message = err.message
  } else if (typeof err === "string") {
    message = err
  }

  // Strip secrets
  message = redactSecrets(message)

  // Strip file system paths (e.g. C:\... or /home/...)
  message = message.replace(/(?:[a-zA-Z]:|\/)[^\s:;"']+/g, "[PATH]")

  // Truncate overly long error messages
  if (message.length > 300) {
    message = message.slice(0, 300) + "..."
  }

  return message
}
