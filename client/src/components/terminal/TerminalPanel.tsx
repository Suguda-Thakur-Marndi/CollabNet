import { useEffect, useRef, useState, useCallback } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { useRunCode } from "@/context/RunCodeContext"
import {
    LuTerminal,
    LuMaximize2,
    LuMinimize2,
    LuTrash2,
    LuX,
    LuFileText,
    LuPlus,
} from "react-icons/lu"

interface TerminalPanelProps {
    isOpen: boolean
    onClose: () => void
}

type TabType = "terminal" | "output"

export default function TerminalPanel({
    isOpen,
    onClose,
}: TerminalPanelProps) {
    const { socket } = useSocket()
    const { output } = useRunCode()
    const [activeTab, setActiveTab] = useState<TabType>("terminal")
    const [isMaximized, setIsMaximized] = useState(false)
    const [height, setHeight] = useState(240)
    const [isDragging, setIsDragging] = useState(false)
    const [terminalConnected, setTerminalConnected] = useState(false)

    const terminalContainerRef = useRef<HTMLDivElement>(null)
    const termRef = useRef<Terminal | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)

    // Fit terminal safely
    const fitTerminal = useCallback(() => {
        if (!fitAddonRef.current || !termRef.current) return
        try {
            fitAddonRef.current.fit()
            const { cols, rows } = termRef.current
            if (cols && rows && socket.connected) {
                socket.emit(SocketEvent.TERMINAL_RESIZE, { cols, rows })
            }
        } catch {
            // Ignore resize exceptions if hidden
        }
    }, [socket])

    // Initialize Terminal
    useEffect(() => {
        if (!isOpen || activeTab !== "terminal" || !terminalContainerRef.current) return

        // If terminal is already instantiated, just fit
        if (termRef.current) {
            setTimeout(fitTerminal, 50)
            return
        }

        const term = new Terminal({
            cursorBlink: true,
            cursorStyle: "bar",
            fontFamily: '"JetBrains Mono", "Space Mono", monospace',
            fontSize: 13,
            lineHeight: 1.25,
            convertEol: true,
            theme: {
                background: "#070a0f",
                foreground: "#f8fafc",
                cursor: "#3b82f6",
                cursorAccent: "#070a0f",
                selectionBackground: "rgba(59, 130, 246, 0.35)",
                black: "#111827",
                red: "#ef4444",
                green: "#22c55e",
                yellow: "#f59e0b",
                blue: "#3b82f6",
                magenta: "#ec4899",
                cyan: "#06b6d4",
                white: "#f8fafc",
                brightBlack: "#475569",
                brightRed: "#f87171",
                brightGreen: "#4ade80",
                brightYellow: "#fde047",
                brightBlue: "#60a5fa",
                brightMagenta: "#f472b6",
                brightCyan: "#22d3ee",
                brightWhite: "#ffffff",
            },
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(terminalContainerRef.current)

        termRef.current = term
        fitAddonRef.current = fitAddon

        // Initial welcome message
        term.writeln("\x1b[1;34m=== CollabNet Interactive Terminal ===\x1b[0m")
        term.writeln("\x1b[90mConnecting to project workspace shell...\x1b[0m\r\n")

        // Hook up user input to socket
        term.onData((data) => {
            if (socket.connected) {
                socket.emit(SocketEvent.TERMINAL_DATA, { data })
            }
        })

        // Socket incoming data listener
        const handleTerminalData = ({ data }: { data: string }) => {
            term.write(data)
            setTerminalConnected(true)
        }

        socket.on(SocketEvent.TERMINAL_DATA, handleTerminalData)

        // Initialize session on server
        setTimeout(() => {
            try {
                fitAddon.fit()
                const { cols, rows } = term
                socket.emit(SocketEvent.TERMINAL_INIT, { cols: cols || 80, rows: rows || 24 })
                setTerminalConnected(true)
            } catch {
                socket.emit(SocketEvent.TERMINAL_INIT, { cols: 80, rows: 24 })
            }
        }, 100)

        // Window resize listener
        window.addEventListener("resize", fitTerminal)

        return () => {
            window.removeEventListener("resize", fitTerminal)
            socket.off(SocketEvent.TERMINAL_DATA, handleTerminalData)
        }
    }, [isOpen, activeTab, socket, fitTerminal])

    // Refit whenever height or maximization changes
    useEffect(() => {
        if (isOpen && activeTab === "terminal") {
            const timer = setTimeout(fitTerminal, 50)
            return () => clearTimeout(timer)
        }
    }, [isOpen, height, isMaximized, activeTab, fitTerminal])

    // Mouse drag for height resize
    const startDragging = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)

        const startY = e.clientY
        const startHeight = height

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = startY - moveEvent.clientY
            const newHeight = Math.min(Math.max(startHeight + deltaY, 120), window.innerHeight * 0.75)
            setHeight(newHeight)
        }

        const onMouseUp = () => {
            setIsDragging(false)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }

        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
    }

    const clearTerminal = () => {
        if (termRef.current) {
            termRef.current.clear()
        }
    }

    const restartTerminal = () => {
        if (termRef.current && socket.connected) {
            termRef.current.clear()
            termRef.current.writeln("\x1b[33mRestarting terminal session...\x1b[0m\r\n")
            const { cols, rows } = termRef.current
            socket.emit(SocketEvent.TERMINAL_INIT, { cols: cols || 80, rows: rows || 24 })
        }
    }

    if (!isOpen) return null

    return (
        <section
            className={`flex w-full flex-col border-t border-border bg-[#070a0f] transition-[height] duration-75 ${
                isMaximized ? "fixed inset-0 z-50 h-full!" : "relative"
            }`}
            style={{ height: isMaximized ? "100vh" : `${height}px` }}
            aria-label="Integrated Terminal"
        >
            {/* Top Drag Handle (when not maximized) */}
            {!isMaximized && (
                <div
                    onMouseDown={startDragging}
                    className={`h-1.5 w-full cursor-row-resize bg-transparent hover:bg-primary/50 transition-colors ${
                        isDragging ? "bg-primary" : ""
                    }`}
                    title="Drag to resize terminal"
                />
            )}

            {/* Header / Tabs Bar */}
            <div className="flex h-9 shrink-0 select-none items-center justify-between border-b border-border bg-surface px-2">
                {/* Left: Tab selection */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("terminal")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                            activeTab === "terminal"
                                ? "bg-darkHover text-white font-medium border-b-2 border-primary"
                                : "text-muted hover:text-white"
                        }`}
                    >
                        <LuTerminal size={13} className="text-primary" />
                        <span>Terminal</span>
                        {terminalConnected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Active" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("output")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                            activeTab === "output"
                                ? "bg-darkHover text-white font-medium border-b-2 border-primary"
                                : "text-muted hover:text-white"
                        }`}
                    >
                        <LuFileText size={13} className="text-amber-400" />
                        <span>Output</span>
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                    {activeTab === "terminal" && (
                        <>
                            <button
                                type="button"
                                onClick={restartTerminal}
                                className="btn-ghost p-1 text-muted hover:text-white"
                                title="New session"
                                aria-label="Restart terminal"
                            >
                                <LuPlus size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={clearTerminal}
                                className="btn-ghost p-1 text-muted hover:text-white"
                                title="Clear terminal"
                                aria-label="Clear terminal"
                            >
                                <LuTrash2 size={14} />
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsMaximized((prev) => !prev)}
                        className="btn-ghost p-1 text-muted hover:text-white"
                        title={isMaximized ? "Restore size" : "Maximize terminal"}
                        aria-label={isMaximized ? "Restore" : "Maximize"}
                    >
                        {isMaximized ? <LuMinimize2 size={14} /> : <LuMaximize2 size={14} />}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost p-1 text-muted hover:text-white"
                        title="Close terminal"
                        aria-label="Close terminal panel"
                    >
                        <LuX size={15} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-0 flex-1 overflow-hidden bg-[#070a0f]">
                {/* Terminal Tab */}
                <div
                    ref={terminalContainerRef}
                    className={`h-full w-full ${activeTab === "terminal" ? "block" : "hidden"}`}
                />

                {/* Output Tab */}
                {activeTab === "output" && (
                    <div className="h-full w-full overflow-y-auto p-3 font-mono text-xs text-slate-300">
                        {output ? (
                            <pre className="whitespace-pre-wrap leading-relaxed">
                                {output}
                            </pre>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted">
                                No program output yet. Run code from the sidebar to view output here.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
