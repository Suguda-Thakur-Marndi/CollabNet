import fs from "fs"
import path from "path"
import os from "os"
import { spawn } from "child_process"
import { Server } from "socket.io"
import { SocketEvent } from "../../types/socket.js"

export interface ExecuteOptions {
  roomId: string
  fileName: string
  content: string
  language?: string
  stdin?: string
  io: Server
}

/**
 * Executes user code either via remote EC2 worker (if configured)
 * or via local sandboxed runner, streaming live ANSI output to the room's xterm terminal.
 */
export async function executeCode({
  roomId,
  fileName,
  content,
  language = "javascript",
  stdin = "",
  io,
}: ExecuteOptions): Promise<void> {
  const executionWorkerUrl = process.env.EXECUTION_WORKER_URL
  const isEc2Configured = !!executionWorkerUrl

  // Header banner in terminal
  const runnerTag = isEc2Configured
    ? "\x1b[1;35m[AWS EC2 Execution Worker]\x1b[0m"
    : "\x1b[1;36m[CollabNet Sandbox Runner]\x1b[0m"

  io.to(roomId).emit(SocketEvent.TERMINAL_DATA, {
    data: `\r\n${runnerTag} \x1b[1;32m▶ Running ${fileName}...\x1b[0m\r\n\x1b[90m========================================================\x1b[0m\r\n`,
  })

  // ── 1. If EC2 Worker URL configured, send to EC2 ──────────────────────────
  if (isEc2Configured) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const targetUrl = `${executionWorkerUrl.replace(/\/$/, "")}/api/execute`
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (process.env.EXECUTION_WORKER_SECRET) {
        headers["Authorization"] = `Bearer ${process.env.EXECUTION_WORKER_SECRET}`
      }

      const res = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fileName,
          content,
          language,
          stdin,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`Worker returned HTTP ${res.status}: ${res.statusText}`)
      }

      const data = (await res.json()) as {
        stdout?: string
        stderr?: string
        exitCode?: number
      }

      if (data.stdout) {
        io.to(roomId).emit(SocketEvent.TERMINAL_DATA, {
          data: data.stdout.replace(/\r?\n/g, "\r\n"),
        })
      }
      if (data.stderr) {
        io.to(roomId).emit(SocketEvent.TERMINAL_DATA, {
          data: `\x1b[31m${data.stderr.replace(/\r?\n/g, "\r\n")}\x1b[0m`,
        })
      }

      const exitCode = data.exitCode ?? 0
      const statusColor = exitCode === 0 ? "\x1b[1;32m" : "\x1b[1;31m"
      io.to(roomId).emit(SocketEvent.TERMINAL_DATA, {
        data: `\r\n\x1b[90m========================================================\x1b[0m\r\n${statusColor}✔ [EC2 Worker] Finished with exit code: ${exitCode}\x1b[0m\r\n\r\n`,
      })
      return
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      io.to(roomId).emit(SocketEvent.TERMINAL_DATA, {
        data: `\x1b[33m[EC2 Notice] Worker at ${executionWorkerUrl} unreachable (${errMsg}).\x1b[0m\r\n\x1b[90mFalling back to local execution sandbox...\x1b[0m\r\n\r\n`,
      })
    }
  }

  // ── 2. Local Sandboxed Execution Fallback ──────────────────────────────────
  await runLocally(roomId, fileName, content, language, stdin, io)
}

/**
 * Executes code locally inside an isolated workspace sandbox folder
 */
async function runLocally(
  roomId: string,
  fileName: string,
  content: string,
  language: string,
  stdin: string,
  io: Server
): Promise<void> {
  const sandboxBase = path.join(os.tmpdir(), "collabnet-sandbox", roomId)
  fs.mkdirSync(sandboxBase, { recursive: true })

  const filePath = path.join(sandboxBase, fileName)
  fs.writeFileSync(filePath, content, "utf-8")

  const isWindows = os.platform() === "win32"
  let cmd = "node"
  let args: string[] = [filePath]

  const ext = path.extname(fileName).toLowerCase()

  if (ext === ".py" || language.includes("python")) {
    cmd = isWindows ? "python" : "python3"
    args = [filePath]
  } else if (ext === ".ts" || language.includes("typescript")) {
    cmd = "node"
    args = ["--loader", "tsx", filePath]
  } else if (ext === ".sh" || language.includes("bash")) {
    cmd = isWindows ? "bash" : "/bin/bash"
    args = [filePath]
  } else if (ext === ".ps1") {
    cmd = "powershell.exe"
    args = ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", filePath]
  } else {
    // Default JS / Node
    cmd = "node"
    args = [filePath]
  }

  try {
    const proc = spawn(cmd, args, {
      cwd: sandboxBase,
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
    })

    if (stdin && proc.stdin.writable) {
      proc.stdin.write(stdin)
      proc.stdin.end()
    }

    proc.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf-8").replace(/\r?\n/g, "\r\n")
      io.to(roomId).emit(SocketEvent.TERMINAL_DATA, { data: text })
    })

    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf-8").replace(/\r?\n/g, "\r\n")
      io.to(roomId).emit(SocketEvent.TERMINAL_DATA, { data: `\x1b[31m${text}\x1b[0m` })
    })

    proc.on("error", (err) => {
      io.to(roomId).emit(SocketEvent.TERMINAL_DATA, {
        data: `\x1b[31mFailed to launch '${cmd}': ${err.message}\x1b[0m\r\n`,
      })
    })

    proc.on("close", (exitCode) => {
      const code = exitCode ?? 0
      const statusColor = code === 0 ? "\x1b[1;32m" : "\x1b[1;31m"
      io.to(roomId).emit(SocketEvent.TERMINAL_DATA, {
        data: `\r\n\x1b[90m========================================================\x1b[0m\r\n${statusColor}✔ [Process Finished - Exit Code: ${code}]\x1b[0m\r\n\r\n`,
      })
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    io.to(roomId).emit(SocketEvent.TERMINAL_DATA, {
      data: `\x1b[31m[Sandbox Execution Error]: ${message}\x1b[0m\r\n\r\n`,
    })
  }
}
