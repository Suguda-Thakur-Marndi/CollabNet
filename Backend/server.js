import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"
import { exec } from "child_process"


const app = express()
app.use(express.static("public"))


const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: [ "GET", "POST" ]
    }
})


const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()

// Terminal socket event handlers
io.on('connection', (socket) => {
    console.log('Terminal client connected:', socket.id)
    
    socket.on('terminal:command', (command) => {
        console.log('Executing command:', command)
        
        if (!command.trim()) {
            socket.emit('terminal:output', '$ ')
            return
        }
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                socket.emit('terminal:output', `${error.message}\r\n$ `)
            } else if (stderr) {
                socket.emit('terminal:output', `${stderr}$ `)
            } else {
                socket.emit('terminal:output', `${stdout}$ `)
            }
        })
    })
    
    socket.on('editor:run', (code) => {
        console.log('Running editor code:', code.substring(0, 50) + '...')
        
        try {
            // Create a new context with console output capture
            let output = ''
            const customConsole = {
                log: (...args) => {
                    output += args.join(' ') + '\r\n'
                    console.log('Console log:', args)
                },
                error: (...args) => {
                    output += 'Error: ' + args.join(' ') + '\r\n'
                    console.log('Console error:', args)
                },
                warn: (...args) => {
                    output += 'Warning: ' + args.join(' ') + '\r\n'
                    console.log('Console warn:', args)
                }
            }
            
            // Execute code with timeout
            const timeoutId = setTimeout(() => {
                throw new Error('Code execution timeout (5s)')
            }, 5000)
            
            // Execute the code
            const fn = new Function('console', code)
            fn(customConsole)
            
            clearTimeout(timeoutId)
            
            const result = output ? output + '$ ' : 'Code executed successfully\r\n$ '
            console.log('Sending output:', result)
            socket.emit('terminal:output', result)
        } catch (error) {
            const errorMsg = `Error: ${error.message}\r\n$ `
            console.log('Error caught:', error.message)
            socket.emit('terminal:output', errorMsg)
        }
    })
    
    socket.on('disconnect', () => {
        console.log('Terminal client disconnected:', socket.id)
    })
})


app.get('/health', (req, res) => {
    res.status(200).json({
        message: "ok",
        success: true
    })
})


httpServer.listen(3000, () => {
    console.log("Server is running on port 3000")
})