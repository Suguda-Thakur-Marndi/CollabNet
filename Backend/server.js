import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"
import { VM } from "vm2"
import { Socket } from "dgram"

const app = express()
const httpServer = createServer(app)

app.use(express.json())

  const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})

const ySocketIO=new YSocketIO(io)
ySocketIO.initialize()

const emailtosocketmapping=new Map();


io.on("connection",(Socket)=>{
    Socket.on("join-room",(data)=>{
        const{roomid,name}=data;
        emailtosocketmapping.set(roomid,Socket.id)
        Socket.join(roomid);
        Socket.broadcast.to(roomid).emit("user-joined",{roomid});
    })
})

app.get('/',(req,res)=>{

    res.status(200).json({
        message:"hello world",
        success:true
    })
})


app.get('/health',(req,res)=>{
    res.status(200).json({
        message:"hello world",
        success:true
    })
})



httpServer.listen(3000, () => {
    console.log("Server running on port 3000")
})