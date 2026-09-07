import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { useViews } from "@/context/ViewContext"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { USER_STATUS } from "@/types/user"
import toast from "react-hot-toast"
import { LuCopy, LuUsers, LuVideo, LuMenu } from "react-icons/lu"

function EditorTopBar() {
    const { currentUser, users, status, callPanelOpen, toggleCallPanel } =
        useAppContext()
    const { setIsSidebarOpen, isSidebarOpen } = useViews()
    const { isMobile } = useWindowDimensions()
    const { socket } = useSocket()

    const handleCallToggle = () => {
        if (isMobile && !callPanelOpen) {
            setIsSidebarOpen(false)
        }
        toggleCallPanel()
    }

    const copyRoomLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            toast.success("Room link copied to clipboard")
        } catch {
            toast.error("Could not copy link")
        }
    }

    const connected = status === USER_STATUS.JOINED && socket.connected
    const statusLabel = connected ? "Connected" : "Disconnected"

    return (
        <header className="flex h-10 shrink-0 select-none items-center justify-between border-b border-border bg-surface px-3">
            {/* Left side: Mobile menu toggle + Brand & Room ID */}
            <div className="flex min-w-0 items-center gap-2.5">
                {isMobile && (
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="btn-ghost p-1 text-muted hover:text-white"
                        aria-label="Toggle sidebar menu"
                    >
                        <LuMenu size={18} />
                    </button>
                )}

                <div className="flex items-center gap-1.5 rounded-md border border-border/70 bg-surface-elevated/60 px-2 py-1">
                    <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                            connected
                                ? "bg-emerald-500 ring-2 ring-emerald-500/30"
                                : "bg-red-500 ring-2 ring-red-500/30"
                        }`}
                        title={statusLabel}
                        role="status"
                    />
                    <span className="text-[11px] font-medium text-slate-300">
                        Room:{" "}
                        <span className="font-mono text-primary font-semibold">
                            {currentUser.roomId || "—"}
                        </span>
                    </span>
                    <button
                        type="button"
                        onClick={copyRoomLink}
                        className="btn-ghost p-0.5 text-muted hover:text-primary transition-colors"
                        title="Copy room link"
                        aria-label="Copy room link"
                    >
                        <LuCopy size={12} />
                    </button>
                </div>
            </div>

            {/* Right side: Video call button + Collaborators pill */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleCallToggle}
                    className={`btn-ghost flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all ${
                        callPanelOpen
                            ? "bg-primary/20 text-primary border border-primary/40"
                            : "hover:bg-darkHover text-slate-300"
                    }`}
                    title={callPanelOpen ? "Close video call" : "Open video call"}
                    aria-pressed={callPanelOpen}
                >
                    <LuVideo size={15} />
                    <span className="hidden sm:inline">Call</span>
                </button>

                <div className="flex items-center gap-1.5 rounded-md border border-border/70 bg-surface-elevated/40 px-2 py-1 text-xs text-slate-300">
                    <LuUsers size={13} className="text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px]">
                        {users.length} {users.length === 1 ? "peer" : "peers"}
                    </span>
                </div>
            </div>
        </header>
    )
}

export default EditorTopBar
