import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { setupWSConnection } from "y-socket.io/dist/server"

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    setupWSConnection(socket.conn.transport.socket, socket.request)
})

httpServer.listen(3000, () => {
    console.log("Server running on port 3000")
})