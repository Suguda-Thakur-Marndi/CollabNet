

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

/**
 * Sends a prompt to the backend Gemini AI endpoint.
 * Uses SSE streaming — calls onChunk for each streamed text chunk,
 * calls onDone when finished, calls onError on failure.
 */
export async function streamCopilot({
  prompt,
  context,
  onChunk,
  onDone,
  onError,
}: {
  prompt: string
  context?: string
  onChunk: (text: string) => void
  onDone: () => void
  onError: (message: string) => void
}): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/copilot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Send session cookie
      body: JSON.stringify({ prompt, context }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const msg = (data as { message?: string }).message ?? `Server error: ${response.status}`
      onError(msg)
      return
    }

    if (!response.body) {
      onError("No response body from server")
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? "" // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue
        const payload = line.slice("data: ".length).trim()

        if (payload === "[DONE]") {
          onDone()
          return
        }

        try {
          const parsed = JSON.parse(payload) as { text?: string; error?: string }
          if (parsed.error) {
            onError(parsed.error)
            return
          }
          if (parsed.text) {
            onChunk(parsed.text)
          }
        } catch {
          // Ignore malformed SSE lines
        }
      }
    }

    onDone()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to connect to AI service"
    onError(msg)
  }
}
