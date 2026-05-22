import type { Socket } from "socket.io-client"

let socketInstance: Socket | null = null

export const setSocket = (socket: Socket) => {
    socketInstance = socket
}

export const getSocket = (): Socket => {
    if (!socketInstance) {
        throw new Error("Socket not initialized")
    }
    return socketInstance
}
