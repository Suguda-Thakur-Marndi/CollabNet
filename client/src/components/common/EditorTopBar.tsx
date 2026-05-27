import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { useViews } from "@/context/ViewContext"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { USER_STATUS } from "@/types/user"
import toast from "react-hot-toast"
import { LuCopy, LuUsers, LuVideo } from "react-icons/lu"

function EditorTopBar() {
    const { currentUser, users, status, callPanelOpen, toggleCallPanel } =
        useAppContext()
    const { setIsSidebarOpen } = useViews()
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
    const statusColor = connected ? "bg-green-500 ring-green-500/30" : "bg-red-500 ring-red-500/30"

    return (
        <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-3 md:px-4 transition-colors duration-200">
            <div className="flex min-w-0 items-center gap-2">
                <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 animation-pulse ${statusColor}`}
                    title={statusLabel}
                    aria-label={statusLabel}
                    role="status"
                />
                <span className="truncate text-sm font-medium text-slate-200">
                    Room:{" "}
                    <span className="font-mono text-primary">
                        {currentUser.roomId || "—"}
                    </span>
                </span>
                <button
                    type="button"
                    onClick={copyRoomLink}
                    className="btn-ghost shrink-0 p-1.5 hover:text-primary"
                    title="Copy room link"
                    aria-label="Copy room link to clipboard"
                >
                    <LuCopy size={16} />
                </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
                <button
                    type="button"
                    onClick={handleCallToggle}
                    className={`btn-ghost flex shrink-0 items-center gap-1.5 p-1.5 transition-colors ${
                        callPanelOpen ? "text-primary" : ""
                    }`}
                    title={
                        callPanelOpen
                            ? "Hide video & voice"
                            : "Open video & voice"
                    }
                    aria-label={callPanelOpen ? "Close video call panel" : "Open video call panel"}
                    aria-pressed={callPanelOpen}
                >
                    <LuVideo size={18} />
                    <span className="hidden sm:inline">Call</span>
                </button>
                <div className="flex items-center gap-1.5 text-slate-300">
                    <LuUsers size={16} className="shrink-0" />
                    <span aria-label={`${users.length} user${users.length !== 1 ? 's' : ''} connected`}>
                        {users.length} {users.length === 1 ? "user" : "users"}
                    </span>
                </div>
                <span className="hidden text-slate-500 md:inline">·</span>
                <span className="hidden max-w-[120px] truncate text-slate-400 md:inline" title={currentUser.username}>
                    {currentUser.username}
                </span>
            </div>
        </header>
    )
}

export default EditorTopBar
