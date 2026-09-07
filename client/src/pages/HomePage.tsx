import { useState } from "react"
import FormComponent from "@/components/forms/FormComponent"
import RecentRooms from "@/components/dashboard/RecentRooms"
import logo from "@/assets/logo.png"
import {
    LuCode,
    LuTerminal,
    LuPenTool,
    LuActivity,
    LuGithub,
    LuSparkles,
} from "react-icons/lu"
import { v4 as uuidv4 } from "uuid"

function HomePage() {
    const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>()
    const [selectedUsername, setSelectedUsername] = useState<string | undefined>()

    const handleSelectRecent = (roomId: string, username?: string) => {
        setSelectedRoomId(roomId)
        setSelectedUsername(username)
    }

    const handleQuickAction = (mode: "code" | "draw") => {
        const id = `${mode}-${uuidv4().slice(0, 6)}`
        setSelectedRoomId(id)
    }

    return (
        <div className="home-gradient min-h-screen flex flex-col justify-between text-slate-200 select-none">
            {/* Top Navigation Bar */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-surface/70 px-4 md:px-8 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="CollabNet" className="h-7 w-auto" />
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-primary border border-primary/30">
                        v2.0 IDE
                    </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted">
                    <div className="hidden sm:flex items-center gap-1.5 text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
                        <span className="font-mono text-[11px]">System Online</span>
                    </div>

                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted hover:text-white"
                    >
                        <LuGithub size={14} />
                        <span className="hidden md:inline">GitHub</span>
                    </a>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 px-4 py-8 md:px-8 lg:py-12 flex items-center justify-center">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left Column: Command Center & Workspace Overview */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {/* Hero Header */}
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono text-primary font-medium mb-3">
                                <LuSparkles size={12} />
                                <span>Real-Time Developer Workspace</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                                Code, debug, and design with teammates in real time.
                            </h1>
                            <p className="mt-2.5 text-sm text-muted leading-relaxed max-w-xl">
                                Zero setup, multi-user coding with collaborative Monaco/CodeMirror editor, integrated xterm.js terminal, shared whiteboard, and video calls.
                            </p>
                        </div>

                        {/* Quick Start Action Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => handleQuickAction("code")}
                                className="group flex flex-col items-start p-3.5 rounded-xl border border-border/80 bg-surface/60 hover:bg-surface-elevated hover:border-primary/50 transition-all text-left cursor-pointer"
                            >
                                <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                                    <LuCode size={18} />
                                </div>
                                <span className="text-xs font-semibold text-white">Instant Room</span>
                                <span className="text-[11px] text-muted mt-0.5">Quick team editor</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickAction("draw")}
                                className="group flex flex-col items-start p-3.5 rounded-xl border border-border/80 bg-surface/60 hover:bg-surface-elevated hover:border-amber-400/50 transition-all text-left cursor-pointer"
                            >
                                <div className="h-8 w-8 rounded-lg bg-amber-400/15 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                                    <LuPenTool size={18} />
                                </div>
                                <span className="text-xs font-semibold text-white">Whiteboard</span>
                                <span className="text-[11px] text-muted mt-0.5">Infinite tldraw canvas</span>
                            </button>

                            <div className="flex flex-col items-start p-3.5 rounded-xl border border-border/80 bg-surface/60 text-left">
                                <div className="h-8 w-8 rounded-lg bg-emerald-400/15 text-emerald-400 flex items-center justify-center mb-2.5">
                                    <LuTerminal size={18} />
                                </div>
                                <span className="text-xs font-semibold text-white">PTY Terminal</span>
                                <span className="text-[11px] text-muted mt-0.5">Shared xterm shell</span>
                            </div>
                        </div>

                        {/* Recent collaborative rooms list */}
                        <RecentRooms onSelectRoom={handleSelectRecent} />

                        {/* Workspace Features Matrix */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>Multi-user cursors</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                <span>80+ Piston languages</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                <span>WebRTC video/voice</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                                <span>AI Copilot assistant</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interactive Join / Create Card */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center">
                        <FormComponent
                            externalRoomId={selectedRoomId}
                            externalUsername={selectedUsername}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="flex h-10 shrink-0 items-center justify-between border-t border-border/60 bg-surface/40 px-4 md:px-8 text-[11px] font-mono text-muted">
                <span>CollabNet IDE &copy; 2026</span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-400">
                        <LuActivity size={12} className="text-emerald-400" />
                        Latency &lt; 25ms
                    </span>
                    <span>Dark OLED Theme</span>
                </div>
            </footer>
        </div>
    )
}

export default HomePage
