import { Router, type Request, type Response } from "express"
import { requireAuth } from "../middleware/requireAuth.js"
import { aiRateLimit } from "../middleware/rateLimit.js"
import { generateCodeStream } from "../services/ai/gemini.service.js"

const aiRouter = Router()

/**
 * POST /api/ai/copilot
 * 
 * Server-Side Events (SSE) streaming endpoint for the Gemini AI Copilot.
 * Requires authentication. Rate limited to 30 req/min.
 * 
 * Body: { prompt: string, context?: string }
 * Response: text/event-stream — data: { text: string }\n\n
 */
aiRouter.post(
  "/copilot",
  requireAuth,
  aiRateLimit,
  async (req: Request, res: Response): Promise<void> => {
    const { prompt, context } = req.body as { prompt?: string; context?: string }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "prompt is required and must be a non-empty string",
      })
      return
    }

    if (prompt.length > 8000) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "prompt exceeds maximum length of 8000 characters",
      })
      return
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error: "AI_SERVICE_UNAVAILABLE",
        message: "Gemini API key is not configured on this server",
      })
      return
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("X-Accel-Buffering", "no") // Disable Nginx buffering
    res.flushHeaders()

    try {
      const stream = generateCodeStream(prompt, context)

      for await (const chunk of stream) {
        // SSE format: "data: <json>\n\n"
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`)
      }

      res.write("data: [DONE]\n\n")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "AI generation failed"
      console.error("[AI] Gemini error:", message)

      // Send error as SSE event before closing
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`)
    } finally {
      res.end()
    }
  }
)

export { aiRouter }
