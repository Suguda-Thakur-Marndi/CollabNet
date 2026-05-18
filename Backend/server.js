import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"
import { exec } from "child_process"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.static("public"))
app.use(express.json())


const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: [ "GET", "POST" ]
    }
})


const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()


app.get('/health', (req, res) => {
    res.status(200).json({
        message: "ok",
        success: true
    })
})

app.post('/api/build', (req, res) => {
    const { username } = req.body
    
    // Build Frontend
    const frontendPath = path.join(__dirname, '../Frontend')
    
    // Start response immediately
    res.status(200).json({ output: `Build started by ${username}...\n` })
    
    // Run build command asynchronously and broadcast to all connected clients
    exec('npm run build', { cwd: frontendPath }, (error, stdout, stderr) => {
        const output = error 
            ? `Build failed:\n${stderr}` 
            : `Build successful!\n${stdout}`
        
        console.log(output)
        
        // Broadcast build output to all connected clients
        io.emit('build-output', { 
            output, 
            username,
            timestamp: new Date().toISOString()
        })
    })
})

app.post('/api/run', (req, res) => {
    const { code, username } = req.body
    
    if (!code) {
        return res.status(400).json({ error: "No code provided" })
    }
    
    // Create a temporary file for execution
    const tempDir = path.join(__dirname, '../temp')
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
    }
    
    const tempFile = path.join(tempDir, `script-${Date.now()}.js`)
    
    fs.writeFileSync(tempFile, code)
    
    // Start response immediately
    res.status(200).json({ output: `Running code by ${username}...\n` })
    
    // Execute the code
    exec(`node "${tempFile}"`, { timeout: 10000, cwd: __dirname }, (error, stdout, stderr) => {
        const output = error 
            ? `\x1B[31mExecution failed:\x1B[0m\n${stderr || error.message}` 
            : `\x1B[32mCode executed successfully:\x1B[0m\n${stdout}`
        
        console.log(output)
        
        // Clean up temp file
        fs.unlink(tempFile, (err) => {
            if (err) console.error('Failed to delete temp file:', err)
        })
        
        // Broadcast run output to all connected clients
        io.emit('build-output', { 
            output, 
            username,
            type: 'run',
            timestamp: new Date().toISOString()
        })
    })
})


httpServer.listen(3000, () => {
    console.log("Server is running on port 3000")
})