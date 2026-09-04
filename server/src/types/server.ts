import express from "express"
import type { Response, Request } from "express"
import dotenv from "dotenv"
import http from "http"
import cors from "cors"
import { SocketEvent, type SocketId } from "./socket"
import { USER_CONNECTION_STATUS, type User } from "./user"
import { terminalManager } from "./terminalManager"
import { Server, Socket } from "socket.io"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()

app.use(express.json())

app.use(cors())

app.use(express.static(path.join(__dirname, "public")))

const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: "*",
	},
	maxHttpBufferSize: 1e8,
	pingTimeout: 60000,
})

let userSocketMap: User[] = []
const streamReadySockets = new Set<SocketId>()

function getUsersInRoom(roomId: string): User[] {
	return userSocketMap.filter((user) => user.roomId === roomId)
}

function getRoomId(socketId: SocketId): string | null {
	const roomId = userSocketMap.find(
		(user) => user.socketId === socketId
	)?.roomId

	if (!roomId) {
		return null
	}
	return roomId
}

function getUserBySocketId(socketId: SocketId): User | null {
	return userSocketMap.find((user) => user.socketId === socketId) ?? null
}

io.on("connection", (socket: Socket) => {

	socket.on(SocketEvent.JOIN_REQUEST, ({ roomId, username }: { roomId: string; username: string }) => {
		// Validate input
		if (!roomId || typeof roomId !== 'string' || !username || typeof username !== 'string') {
			socket.emit(SocketEvent.USERNAME_EXISTS)
			return
		}

		const existingUser = userSocketMap.find(
			(u) => u.roomId === roomId && u.username === username
		)

		if (existingUser) {

			userSocketMap = userSocketMap.filter(
				(u) => u.socketId !== existingUser.socketId
			)
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

		const user = {
			username,
			roomId,
			status: USER_CONNECTION_STATUS.ONLINE,
			cursorPosition: 0,
			typing: false,
			socketId: socket.id,
			currentFile: null,
		}
		userSocketMap.push(user)
		socket.join(roomId)
		socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user })
		const users = getUsersInRoom(roomId)
		io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users })
	})

	socket.on("disconnecting", () => {
		streamReadySockets.delete(socket.id)
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.USER_DISCONNECTED, { user })
		userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id)
		socket.leave(roomId)
	})

	socket.on(
		SocketEvent.SYNC_FILE_STRUCTURE,
		({ fileStructure, openFiles, activeFile, socketId }: { fileStructure: any; openFiles: any; activeFile: any; socketId: string }) => {
			io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
				fileStructure,
				openFiles,
				activeFile,
			})
		}
	)

	socket.on(
		SocketEvent.DIRECTORY_CREATED,
		({ parentDirId, newDirectory }: { parentDirId: string; newDirectory: any }) => {
			const roomId = getRoomId(socket.id)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, {
				parentDirId,
				newDirectory,
			})
		}
	)

	socket.on(SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }: { dirId: string; children: any }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_UPDATED, {
			dirId,
			children,
		})
	})

	socket.on(SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }: { dirId: string; newName: string }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_RENAMED, {
			dirId,
			newName,
		})
	})

	socket.on(SocketEvent.DIRECTORY_DELETED, ({ dirId }: { dirId: string }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.DIRECTORY_DELETED, { dirId })
	})

	socket.on(SocketEvent.FILE_CREATED, ({ parentDirId, newFile }: { parentDirId: string; newFile: any }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.FILE_CREATED, { parentDirId, newFile })
	})

	socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }: { fileId: string; newContent: string }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, {
			fileId,
			newContent,
		})
	})

	socket.on(SocketEvent.FILE_RENAMED, ({ fileId, newName }: { fileId: string; newName: string }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.FILE_RENAMED, {
			fileId,
			newName,
		})
	})

	socket.on(SocketEvent.FILE_DELETED, ({ fileId }: { fileId: string }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId })
	})

	socket.on(SocketEvent.USER_OFFLINE, ({ socketId }: { socketId: string }) => {
		const targetId = socketId || socket.id
		const user = getUserBySocketId(targetId)
		if (!user) return

		userSocketMap = userSocketMap.map((u) => {
			if (u.socketId === targetId) {
				return { ...u, status: USER_CONNECTION_STATUS.OFFLINE }
			}
			return u
		})
		socket.broadcast.to(user.roomId).emit(SocketEvent.USER_OFFLINE, {
			socketId: targetId,
		})
	})

	socket.on(SocketEvent.USER_ONLINE, ({ socketId }: { socketId: string }) => {
		const targetId = socketId || socket.id
		const user = getUserBySocketId(targetId)
		if (!user) return

		userSocketMap = userSocketMap.map((u) => {
			if (u.socketId === targetId) {
				return { ...u, status: USER_CONNECTION_STATUS.ONLINE }
			}
			return u
		})
		socket.broadcast.to(user.roomId).emit(SocketEvent.USER_ONLINE, {
			socketId: targetId,
		})
	})

	socket.on(SocketEvent.SEND_MESSAGE, ({ message }: { message: any }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.RECEIVE_MESSAGE, { message })
	})

	socket.on(SocketEvent.TYPING_START, ({ cursorPosition, selectionStart, selectionEnd }: { cursorPosition: number; selectionStart: number; selectionEnd: number }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return {
					...user,
					typing: true,
					cursorPosition,
					selectionStart,
					selectionEnd
				}
			}
			return user
		})
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.TYPING_START, { user })
	})

	socket.on(SocketEvent.TYPING_PAUSE, () => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return { ...user, typing: false }
			}
			return user
		})
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.TYPING_PAUSE, { user })
	})

	socket.on(SocketEvent.CURSOR_MOVE, ({ cursorPosition, selectionStart, selectionEnd }: { cursorPosition: number; selectionStart: number; selectionEnd: number }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return {
					...user,
					cursorPosition,
					selectionStart,
					selectionEnd
				}
			}
			return user
		})
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.CURSOR_MOVE, { user })
	})

	socket.on(SocketEvent.REQUEST_DRAWING, () => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id })
	})

	socket.on(SocketEvent.SYNC_DRAWING, ({ drawingData, socketId }: { drawingData: any; socketId: string }) => {
		socket.broadcast
			.to(socketId)
			.emit(SocketEvent.SYNC_DRAWING, { drawingData })
	})

	socket.on(SocketEvent.DRAWING_UPDATE, ({ snapshot }: { snapshot: any }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, {
			snapshot,
		})
	})

	socket.on(SocketEvent.STREAM_READY, () => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return

		streamReadySockets.add(socket.id)

		socket.to(roomId).emit(SocketEvent.USER_READY, socket.id)

		for (const peer of getUsersInRoom(roomId)) {
			if (
				peer.socketId !== socket.id &&
				streamReadySockets.has(peer.socketId)
			) {
				io.to(socket.id).emit(SocketEvent.USER_READY, peer.socketId)
			}
		}
	})

	socket.on(
		SocketEvent.WEBRTC_SIGNAL,
		({
			signal,
			targetUserID,
		}: {
			signal: unknown
			targetUserID: string
		}) => {
			io.to(targetUserID).emit(SocketEvent.WEBRTC_SIGNAL, {
				userID: socket.id,
				signal,
			})
		}
	)

	socket.on(SocketEvent.MIC_STATE, (micOn: boolean) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.to(roomId).emit(SocketEvent.MIC_STATE, {
			userID: socket.id,
			micOn,
		})
	})

	socket.on(SocketEvent.SPEAKER_STATE, (speakersOn: boolean) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.to(roomId).emit(SocketEvent.SPEAKER_STATE, {
			userID: socket.id,
			speakersOn,
		})
	})

	socket.on(SocketEvent.CAMERA_OFF, () => {
		streamReadySockets.delete(socket.id)
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.to(roomId).emit(SocketEvent.CAMERA_OFF, socket.id)
	})

	socket.on(SocketEvent.TERMINAL_INIT, ({ cols = 80, rows = 24 }: { cols?: number; rows?: number } = {}) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return

		terminalManager.getOrCreateSession(
			roomId,
			(data) => {
				io.to(roomId).emit(SocketEvent.TERMINAL_DATA, { data })
			},
			() => {
				io.to(roomId).emit(SocketEvent.TERMINAL_DATA, { data: "\r\n\x1b[33m[Process exited]\x1b[0m\r\n" })
			},
			cols,
			rows
		)
	})

	socket.on(SocketEvent.TERMINAL_DATA, ({ data }: { data: string }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId || typeof data !== "string") return
		const session = terminalManager.getSession(roomId)
		if (session) {
			session.write(data)
		}
	})

	socket.on(SocketEvent.TERMINAL_RESIZE, ({ cols, rows }: { cols: number; rows: number }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		const session = terminalManager.getSession(roomId)
		if (session && typeof cols === "number" && typeof rows === "number") {
			session.resize(cols, rows)
		}
	})

	socket.on(SocketEvent.TERMINAL_KILL, () => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		terminalManager.closeSession(roomId)
		io.to(roomId).emit(SocketEvent.TERMINAL_DATA, { data: "\r\n\x1b[31m[Terminal session restarted]\x1b[0m\r\n" })
	})

	socket.on("disconnecting", () => {
		const roomId = getRoomId(socket.id)
		if (roomId) {
			const remainingUsers = getUsersInRoom(roomId).filter((u) => u.socketId !== socket.id)
			if (remainingUsers.length === 0) {
				terminalManager.closeSession(roomId)
			}
		}
	})
})

// Health check endpoints for ALB target group and container orchestration
app.get("/healthz", (_req: Request, res: Response) => {
	res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() })
})

app.get("/readyz", (_req: Request, res: Response) => {
	res.status(200).json({ status: "ready" })
})

app.get("/", (_req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})

const gracefulShutdown = (signal: string) => {
	console.log(`${signal} signal received: closing HTTP and Socket.IO server`)
	io.close(() => {
		console.log('Socket.IO server closed')
		server.close(() => {
			console.log('HTTP server closed')
			process.exit(0)
		})
	})
	// Force shutdown after 10s if connections fail to drain
	setTimeout(() => {
		console.error('Forcefully terminating process after timeout')
		process.exit(1)
	}, 10000).unref()
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

