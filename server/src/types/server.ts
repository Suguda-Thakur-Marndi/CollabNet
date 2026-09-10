import express from "express"
import type { Response, Request } from "express"
import dotenv from "dotenv"
import http from "http"
import cors from "cors"
import session from "express-session"
import helmet from "helmet"
import { SocketEvent, type SocketId } from "./socket.js"
import { USER_CONNECTION_STATUS, type User } from "./user.js"
import { terminalManager } from "./terminalManager.js"
import { Server, Socket } from "socket.io"
import path from "path"
import { fileURLToPath } from "url"

// ── Auth & Routes ──────────────────────────────────────────────────────────────
import { passport } from "../auth/passport.js"
import { authRouter } from "../auth/routes.js"
import { aiRouter } from "../routes/ai.routes.js"
import { authRateLimit, apiRateLimit } from "../middleware/rateLimit.js"
import type { AuthUser } from "../auth/passport.js"
import { executeCode } from "../services/execution/runner.service.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const PORT = process.env.PORT || 3000
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"
const SESSION_SECRET = process.env.SESSION_SECRET || "INSECURE_FALLBACK_CHANGE_ME"
const NODE_ENV = process.env.NODE_ENV || "development"

if (NODE_ENV === "production" && SESSION_SECRET === "INSECURE_FALLBACK_CHANGE_ME") {
  console.error("FATAL: SESSION_SECRET must be set in production")
  process.exit(1)
}

// ── Express App ──────────────────────────────────────────────────────────────
const app = express()

// Security headers (must be first)
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow WebSocket + CodeMirror + tldraw
    crossOriginEmbedderPolicy: false,
  })
)

// CORS — only allow the configured client origin
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // Required for session cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
)

app.use(express.json({ limit: "2mb" }))
app.use(express.urlencoded({ extended: true, limit: "2mb" }))

// ── Session ──────────────────────────────────────────────────────────────────
const sessionMiddleware = session({
  name: "collabnet.sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
})

app.use(sessionMiddleware)

// ── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize())
app.use(passport.session())

// ── Static files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "..", "public")))

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/auth", authRateLimit, authRouter)
app.use("/api/ai", apiRateLimit, aiRouter)

// Health check endpoints for ALB / container orchestration
app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() })
})

app.get("/readyz", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ready", timestamp: new Date().toISOString() })
})

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

// ── HTTP + Socket.IO Server ───────────────────────────────────────────────────
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
  maxHttpBufferSize: 5e6, // 5MB max per message (was 100MB — reduced)
  pingTimeout: 60000,
})

// Share express-session with Socket.IO so sockets can read session data
io.engine.use(sessionMiddleware)
io.engine.use(passport.initialize())
io.engine.use(passport.session())

// ── In-Memory Room State ─────────────────────────────────────────────────────
let userSocketMap: User[] = []
const streamReadySockets = new Set<SocketId>()

function getUsersInRoom(roomId: string): User[] {
  return userSocketMap.filter((user) => user.roomId === roomId)
}

function getRoomId(socketId: SocketId): string | null {
  return userSocketMap.find((user) => user.socketId === socketId)?.roomId ?? null
}

function getUserBySocketId(socketId: SocketId): User | null {
  return userSocketMap.find((user) => user.socketId === socketId) ?? null
}

/** Verify that a given socketId belongs to the same room as the current socket */
function isInSameRoom(socketId: string, roomId: string): boolean {
  return getUsersInRoom(roomId).some((u) => u.socketId === socketId)
}

// ── Input Validation Helpers ──────────────────────────────────────────────────
const MAX_ROOM_ID_LENGTH = 128
const MAX_USERNAME_LENGTH = 64
const MAX_MESSAGE_LENGTH = 2000
const MAX_FILE_CONTENT_LENGTH = 512 * 1024 // 512 KB per update

function isValidString(value: unknown, maxLen: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLen
}

// ── Socket.IO Connection Handler ──────────────────────────────────────────────
io.on("connection", (socket: Socket) => {
  // Optionally extract Google identity from session for future auth enforcement
  const req = socket.request as Request & { user?: AuthUser }
  const sessionUser = req.user

  if (sessionUser) {
    // Store verified identity on socket for use in event handlers
    ;(socket.data as { verifiedUser?: AuthUser }).verifiedUser = sessionUser
  }

  // ── JOIN ──────────────────────────────────────────────────────────────────
  socket.on(
    SocketEvent.JOIN_REQUEST,
    ({ roomId, username }: { roomId: unknown; username: unknown }) => {
      // Validate inputs — never trust client
      if (!isValidString(roomId, MAX_ROOM_ID_LENGTH) || !isValidString(username, MAX_USERNAME_LENGTH)) {
        socket.emit(SocketEvent.USERNAME_EXISTS)
        return
      }

      // Prefer verified Google display name if available
      const displayName = sessionUser?.displayName ?? username

      const existingUser = userSocketMap.find(
        (u) => u.roomId === roomId && u.username === displayName
      )

      if (existingUser) {
        userSocketMap = userSocketMap.filter((u) => u.socketId !== existingUser.socketId)
        const user = {
          ...existingUser,
          status: USER_CONNECTION_STATUS.ONLINE,
          socketId: socket.id,
        }
        userSocketMap.push(user)
        socket.join(roomId)
        socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user })
        const users = getUsersInRoom(roomId)
        io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users })
        return
      }

      const user: User = {
        username: displayName,
        roomId,
        status: USER_CONNECTION_STATUS.ONLINE,
        cursorPosition: 0,
        typing: false,
        socketId: socket.id,
        currentFile: null,
        // Attach Google avatar if available
        avatarUrl: sessionUser?.avatarUrl,
      }
      userSocketMap.push(user)
      socket.join(roomId)
      socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user })
      const users = getUsersInRoom(roomId)
      io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users })
    }
  )

  // ── DISCONNECT ────────────────────────────────────────────────────────────
  socket.on("disconnecting", () => {
    streamReadySockets.delete(socket.id)
    const user = getUserBySocketId(socket.id)
    if (!user) return
    const roomId = user.roomId
    socket.broadcast.to(roomId).emit(SocketEvent.USER_DISCONNECTED, { user })
    userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id)

    // Clean up terminal if last user in room
    const remainingUsers = getUsersInRoom(roomId).filter((u) => u.socketId !== socket.id)
    if (remainingUsers.length === 0) {
      terminalManager.closeSession(roomId)
    }

    socket.leave(roomId)
  })

  // ── FILE STRUCTURE SYNC ───────────────────────────────────────────────────
  // Security fix: only send to sockets that are verified members of the same room
  socket.on(
    SocketEvent.SYNC_FILE_STRUCTURE,
    ({ fileStructure, openFiles, activeFile, socketId }: {
      fileStructure: unknown
      openFiles: unknown
      activeFile: unknown
      socketId: unknown
    }) => {
      if (typeof socketId !== "string") return

      const roomId = getRoomId(socket.id)
      if (!roomId) return

      // Verify the target socket is in the same room — prevents cross-room data leak
      if (!isInSameRoom(socketId, roomId)) {
        console.warn(`[Security] SYNC_FILE_STRUCTURE: socket ${socket.id} tried to send to ${socketId} in a different room`)
        return
      }

      io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
        fileStructure,
        openFiles,
        activeFile,
      })
    }
  )

  // ── DIRECTORY EVENTS ──────────────────────────────────────────────────────
  socket.on(
    SocketEvent.DIRECTORY_CREATED,
    ({ parentDirId, newDirectory }: { parentDirId: unknown; newDirectory: unknown }) => {
      const roomId = getRoomId(socket.id)
      if (!roomId) return
      socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, { parentDirId, newDirectory })
    }
  )

  socket.on(SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }: { dirId: unknown; children: unknown }) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_UPDATED, { dirId, children })
  })

  socket.on(SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }: { dirId: unknown; newName: unknown }) => {
    if (!isValidString(newName, 255)) return
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_RENAMED, { dirId, newName })
  })

  socket.on(SocketEvent.DIRECTORY_DELETED, ({ dirId }: { dirId: unknown }) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_DELETED, { dirId })
  })

  // ── FILE EVENTS ───────────────────────────────────────────────────────────
  socket.on(SocketEvent.FILE_CREATED, ({ parentDirId, newFile }: { parentDirId: unknown; newFile: unknown }) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_CREATED, { parentDirId, newFile })
  })

  socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }: { fileId: unknown; newContent: unknown }) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    // Validate file content size — prevent huge payloads
    if (typeof newContent === "string" && newContent.length > MAX_FILE_CONTENT_LENGTH) {
      console.warn(`[Security] FILE_UPDATED: content too large (${newContent.length} bytes) from ${socket.id}`)
      return
    }
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, { fileId, newContent })
  })

  socket.on(SocketEvent.FILE_RENAMED, ({ fileId, newName }: { fileId: unknown; newName: unknown }) => {
    if (!isValidString(newName, 255)) return
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_RENAMED, { fileId, newName })
  })

  socket.on(SocketEvent.FILE_DELETED, ({ fileId }: { fileId: unknown }) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId })
  })

  // ── PRESENCE ──────────────────────────────────────────────────────────────
  // Security fix: always use socket.id, never trust client-supplied socketId
  socket.on(SocketEvent.USER_OFFLINE, () => {
    const user = getUserBySocketId(socket.id)
    if (!user) return
    userSocketMap = userSocketMap.map((u) =>
      u.socketId === socket.id ? { ...u, status: USER_CONNECTION_STATUS.OFFLINE } : u
    )
    socket.broadcast.to(user.roomId).emit(SocketEvent.USER_OFFLINE, { socketId: socket.id })
  })

  socket.on(SocketEvent.USER_ONLINE, () => {
    const user = getUserBySocketId(socket.id)
    if (!user) return
    userSocketMap = userSocketMap.map((u) =>
      u.socketId === socket.id ? { ...u, status: USER_CONNECTION_STATUS.ONLINE } : u
    )
    socket.broadcast.to(user.roomId).emit(SocketEvent.USER_ONLINE, { socketId: socket.id })
  })

  // ── CHAT ──────────────────────────────────────────────────────────────────
  socket.on(SocketEvent.SEND_MESSAGE, ({ message }: { message: unknown }) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return

    if (!message || typeof message !== "object") return

    // Validate message content length
    const msg = message as Record<string, unknown>
    if (typeof msg.content === "string" && msg.content.length > MAX_MESSAGE_LENGTH) {
      return
    }

    socket.broadcast.to(roomId).emit(SocketEvent.RECEIVE_MESSAGE, { message })
  })

  // ── CURSOR & TYPING ───────────────────────────────────────────────────────
  socket.on(
    SocketEvent.TYPING_START,
    ({ cursorPosition, selectionStart, selectionEnd }: {
      cursorPosition: number
      selectionStart: number
      selectionEnd: number
    }) => {
      userSocketMap = userSocketMap.map((user) =>
        user.socketId === socket.id
          ? { ...user, typing: true, cursorPosition, selectionStart, selectionEnd }
          : user
      )
      const user = getUserBySocketId(socket.id)
      if (!user) return
      socket.broadcast.to(user.roomId).emit(SocketEvent.TYPING_START, { user })
    }
  )

  socket.on(SocketEvent.TYPING_PAUSE, () => {
    userSocketMap = userSocketMap.map((user) =>
      user.socketId === socket.id ? { ...user, typing: false } : user
    )
    const user = getUserBySocketId(socket.id)
    if (!user) return
    socket.broadcast.to(user.roomId).emit(SocketEvent.TYPING_PAUSE, { user })
  })

  socket.on(
    SocketEvent.CURSOR_MOVE,
    ({ cursorPosition, selectionStart, selectionEnd }: {
      cursorPosition: number
      selectionStart: number
      selectionEnd: number
    }) => {
      userSocketMap = userSocketMap.map((user) =>
        user.socketId === socket.id
          ? { ...user, cursorPosition, selectionStart, selectionEnd }
          : user
      )
      const user = getUserBySocketId(socket.id)
      if (!user) return
      socket.broadcast.to(user.roomId).emit(SocketEvent.CURSOR_MOVE, { user })
    }
  )

  // ── WHITEBOARD ────────────────────────────────────────────────────────────
  socket.on(SocketEvent.REQUEST_DRAWING, () => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.broadcast.to(roomId).emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id })
  })

  socket.on(SocketEvent.SYNC_DRAWING, ({ drawingData, socketId }: { drawingData: unknown; socketId: unknown }) => {
    if (typeof socketId !== "string") return

    // Security fix: only sync drawing to sockets in same room
    const roomId = getRoomId(socket.id)
    if (!roomId || !isInSameRoom(socketId, roomId)) return

    socket.to(socketId).emit(SocketEvent.SYNC_DRAWING, { drawingData })
  })

  socket.on(SocketEvent.DRAWING_UPDATE, ({ snapshot }: { snapshot: unknown }) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, { snapshot })
  })

  // ── WEBRTC ────────────────────────────────────────────────────────────────
  socket.on(SocketEvent.STREAM_READY, () => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return

    streamReadySockets.add(socket.id)
    socket.to(roomId).emit(SocketEvent.USER_READY, socket.id)

    for (const peer of getUsersInRoom(roomId)) {
      if (peer.socketId !== socket.id && streamReadySockets.has(peer.socketId)) {
        io.to(socket.id).emit(SocketEvent.USER_READY, peer.socketId)
      }
    }
  })

  socket.on(
    SocketEvent.WEBRTC_SIGNAL,
    ({ signal, targetUserID }: { signal: unknown; targetUserID: unknown }) => {
      if (typeof targetUserID !== "string") return

      // Security fix: verify both parties are in the same room
      const senderRoomId = getRoomId(socket.id)
      const targetRoomId = getRoomId(targetUserID)

      if (!senderRoomId || !targetRoomId || senderRoomId !== targetRoomId) {
        console.warn(`[Security] WEBRTC_SIGNAL: cross-room signal attempt from ${socket.id} to ${targetUserID}`)
        return
      }

      io.to(targetUserID).emit(SocketEvent.WEBRTC_SIGNAL, {
        userID: socket.id,
        signal,
      })
    }
  )

  socket.on(SocketEvent.MIC_STATE, (micOn: unknown) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.to(roomId).emit(SocketEvent.MIC_STATE, { userID: socket.id, micOn })
  })

  socket.on(SocketEvent.SPEAKER_STATE, (speakersOn: unknown) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.to(roomId).emit(SocketEvent.SPEAKER_STATE, { userID: socket.id, speakersOn })
  })

  socket.on(SocketEvent.CAMERA_OFF, () => {
    streamReadySockets.delete(socket.id)
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    socket.to(roomId).emit(SocketEvent.CAMERA_OFF, socket.id)
  })

  // ── TERMINAL ──────────────────────────────────────────────────────────────
  // NOTE: Terminal runs on main server in dev. In production, proxy to EC2 worker.
  socket.on(SocketEvent.TERMINAL_INIT, ({ cols = 80, rows = 24 }: { cols?: unknown; rows?: unknown } = {}) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return

    const safeCols = typeof cols === "number" && cols > 0 && cols <= 500 ? cols : 80
    const safeRows = typeof rows === "number" && rows > 0 && rows <= 200 ? rows : 24

    terminalManager.getOrCreateSession(
      roomId,
      (data) => {
        io.to(roomId).emit(SocketEvent.TERMINAL_DATA, { data })
      },
      () => {
        io.to(roomId).emit(SocketEvent.TERMINAL_DATA, {
          data: "\r\n\x1b[33m[Process exited]\x1b[0m\r\n",
        })
      },
      safeCols,
      safeRows
    )
  })

  socket.on(SocketEvent.TERMINAL_DATA, ({ data }: { data: unknown }) => {
    const roomId = getRoomId(socket.id)
    if (!roomId || typeof data !== "string") return

    // Limit single keystroke/paste size
    if (data.length > 65536) return

    const session = terminalManager.getSession(roomId)
    if (session) {
      session.write(data)
    }
  })

  socket.on(SocketEvent.TERMINAL_RESIZE, ({ cols, rows }: { cols: unknown; rows: unknown }) => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    const safeCols = typeof cols === "number" && cols > 0 && cols <= 500 ? cols : 80
    const safeRows = typeof rows === "number" && rows > 0 && rows <= 200 ? rows : 24
    const session = terminalManager.getSession(roomId)
    if (session) {
      session.resize(safeCols, safeRows)
    }
  })

  socket.on(SocketEvent.TERMINAL_KILL, () => {
    const roomId = getRoomId(socket.id)
    if (!roomId) return
    terminalManager.closeSession(roomId)
    io.to(roomId).emit(SocketEvent.TERMINAL_DATA, {
      data: "\r\n\x1b[31m[Terminal session restarted]\x1b[0m\r\n",
    })
  })

  // ── CODE EXECUTION (via EC2 Worker or Local Sandbox) ─────────────────────
  socket.on(
    SocketEvent.CODE_EXECUTE,
    async ({
      fileName,
      content,
      language,
      stdin,
    }: {
      fileName: unknown
      content: unknown
      language?: unknown
      stdin?: unknown
    }) => {
      const roomId = getRoomId(socket.id)
      if (!roomId) return

      const safeFileName = typeof fileName === "string" && fileName.trim().length > 0 ? fileName : "index.js"
      const safeContent = typeof content === "string" ? content : ""
      const safeLanguage = typeof language === "string" ? language : "javascript"
      const safeStdin = typeof stdin === "string" ? stdin : ""

      await executeCode({
        roomId,
        fileName: safeFileName,
        content: safeContent,
        language: safeLanguage,
        stdin: safeStdin,
        io,
      })
    }
  )
})

// ── Server Listen ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`)
  console.log(`[Server] CORS origin: ${CLIENT_URL}`)
  console.log(`[Server] Auth: ${process.env.GOOGLE_CLIENT_ID ? "Google OAuth configured" : "Google OAuth NOT configured (set GOOGLE_CLIENT_ID)"}`)
  console.log(`[Server] Gemini AI: ${process.env.GEMINI_API_KEY ? "configured" : "NOT configured (set GEMINI_API_KEY)"}`)
})

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = (signal: string) => {
  console.log(`[Server] ${signal} received — shutting down gracefully`)
  io.close(() => {
    console.log("[Server] Socket.IO closed")
    server.close(() => {
      console.log("[Server] HTTP server closed")
      process.exit(0)
    })
  })
  // Force-kill after 10 seconds if connections don't drain
  setTimeout(() => {
    console.error("[Server] Forcefully terminating after 10s timeout")
    process.exit(1)
  }, 10000).unref()
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

// ── Augment Express Session type ──────────────────────────────────────────────
declare module "express-session" {
  interface SessionData {
    oauthState?: string
  }
}
