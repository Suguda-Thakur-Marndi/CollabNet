import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"
import { VM } from "vm2"

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

app.post('/execute', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({
            success: false,
            error: "No code provided"
        });
    }

    try {
        const vm = new VM({
            timeout: 3000,
            sandbox: {
                console: {
                    log: (...args) => {
                        return args.map(arg => 
                            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                        ).join(' ');
                    }
                }
            }
        });

    
        let output = '';
        const originalLog = console.log;
        console.log = (...args) => {
            output += args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ') + '\n';
        };

        const result = vm.run(code);
        
        console.log = originalLog;

        res.status(200).json({
            success: true,
            run: {
                stdout: output || String(result || ''),
                stderr: ''
            }
        });
    } catch (error) {
        res.status(200).json({
            success: true,
            run: {
                stdout: '',
                stderr: error.message
            }
        });
    }
})

httpServer.listen(3000, () => {
    console.log("Server running on port 3000")
})