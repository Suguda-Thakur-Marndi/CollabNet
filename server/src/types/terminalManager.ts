import os from "os"
import { spawn as ptySpawn, type IPty } from "node-pty"
import { spawn as childSpawn, type ChildProcessWithoutNullStreams } from "child_process"

export interface TerminalSession {
    roomId: string
    write: (data: string) => void
    resize: (cols: number, rows: number) => void
    kill: () => void
    getBuffer: () => string
}

class TerminalManager {
    private sessions = new Map<string, TerminalSession>()
    private sessionBuffers = new Map<string, string>()

    private getShellCommand(): { shell: string; args: string[] } {
        const isWindows = os.platform() === "win32"
        if (isWindows) {
            // Prefer powershell.exe on Windows, fallback to cmd.exe
            const powershellPath = process.env.COMSPEC ? "powershell.exe" : "cmd.exe"
            return { shell: powershellPath, args: [] }
        }
        const defaultShell = process.env.SHELL || "/bin/bash"
        return { shell: defaultShell, args: ["-l"] }
    }

    public getOrCreateSession(
        roomId: string,
        onData: (data: string) => void,
        onExit?: () => void,
        initialCols: number = 80,
        initialRows: number = 24
    ): TerminalSession {
        const existing = this.sessions.get(roomId)
        if (existing) {
            const buffered = this.sessionBuffers.get(roomId) || ""
            if (buffered) {
                onData(buffered)
            }
            return existing
        }

        let ptyProc: IPty | null = null
        let childProc: ChildProcessWithoutNullStreams | null = null
        this.sessionBuffers.set(roomId, "")

        const appendBuffer = (chunk: string) => {
            let buf = this.sessionBuffers.get(roomId) || ""
            buf += chunk
            // Keep maximum 50,000 characters in scrollback buffer
            if (buf.length > 50000) {
                buf = buf.slice(buf.length - 50000)
            }
            this.sessionBuffers.set(roomId, buf)
        }

        const { shell, args } = this.getShellCommand()

        try {
            // Attempt standard node-pty spawn
            ptyProc = ptySpawn(shell, args, {
                name: "xterm-256color",
                cols: initialCols,
                rows: initialRows,
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    TERM: "xterm-256color",
                    COLORTERM: "truecolor",
                },
            })

            ptyProc.onData((data: string) => {
                appendBuffer(data)
                onData(data)
            })

            ptyProc.onExit(() => {
                this.sessions.delete(roomId)
                this.sessionBuffers.delete(roomId)
                onExit?.()
            })
        } catch (err) {
            console.warn("node-pty spawn failed, falling back to child_process.spawn:", err)
            // Fallback to standard child_process.spawn
            childProc = childSpawn(shell, args, {
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    TERM: "xterm-256color",
                },
            })

            childProc.stdout.on("data", (chunk: Buffer) => {
                const str = chunk.toString("utf-8")
                appendBuffer(str)
                onData(str)
            })

            childProc.stderr.on("data", (chunk: Buffer) => {
                const str = chunk.toString("utf-8")
                appendBuffer(str)
                onData(str)
            })

            childProc.on("close", () => {
                this.sessions.delete(roomId)
                this.sessionBuffers.delete(roomId)
                onExit?.()
            })
        }

        const session: TerminalSession = {
            roomId,
            write: (data: string) => {
                if (ptyProc) {
                    ptyProc.write(data)
                } else if (childProc && childProc.stdin.writable) {
                    childProc.stdin.write(data)
                }
            },
            resize: (cols: number, rows: number) => {
                if (ptyProc) {
                    try {
                        ptyProc.resize(cols, rows)
                    } catch (e) {
                        console.error("Failed to resize PTY:", e)
                    }
                }
            },
            kill: () => {
                if (ptyProc) {
                    try {
                        ptyProc.kill()
                    } catch {
                        // ignore
                    }
                }
                if (childProc) {
                    try {
                        childProc.kill()
                    } catch {
                        // ignore
                    }
                }
                this.sessions.delete(roomId)
                this.sessionBuffers.delete(roomId)
            },
            getBuffer: () => this.sessionBuffers.get(roomId) || "",
        }

        this.sessions.set(roomId, session)
        return session
    }

    public getSession(roomId: string): TerminalSession | undefined {
        return this.sessions.get(roomId)
    }

    public closeSession(roomId: string) {
        const session = this.sessions.get(roomId)
        if (session) {
            session.kill()
        }
    }
}

export const terminalManager = new TerminalManager()
