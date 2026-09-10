enum USER_CONNECTION_STATUS {
	OFFLINE = "offline",
	ONLINE = "online",
}

interface User {
	username: string
	roomId: string
	status: USER_CONNECTION_STATUS
	cursorPosition: number
	typing: boolean
	currentFile: string | null
	socketId: string
	selectionStart?: number
	selectionEnd?: number
	avatarUrl?: string // Google OAuth avatar
}

export { USER_CONNECTION_STATUS }
export type { User }
