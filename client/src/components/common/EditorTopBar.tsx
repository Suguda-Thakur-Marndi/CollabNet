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
            toast.success("Room link copied")
        } catch {
            toast.error("Could not copy link")
        }
    }

    const connected = status === USER_STATUS.JOINED && socket.connected

    return (
        <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-3 md:px-4">
            <div className="flex min-w-0 items-center gap-2">
                <span
                    className={`h-2 w-2 shrink-0 rounded-full ${connected ? "bg-primary ring-2 ring-primary/30" : "bg-danger"}`}
                    title={connected ? "Connected" : "Disconnected"}
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
                    className="btn-ghost shrink-0 p-1.5"
                    title="Copy room link"
                >
                    <LuCopy size={16} />
                </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
                <button
                    type="button"
                    onClick={handleCallToggle}
                    className={`btn-ghost flex shrink-0 items-center gap-1.5 p-1.5 ${
                        callPanelOpen ? "text-primary" : ""
                    }`}
                    title={
                        callPanelOpen
                            ? "Hide video & voice"
                            : "Open video & voice"
                    }
                    aria-label="Toggle video and voice call"
                    aria-pressed={callPanelOpen}
                >
                    <LuVideo size={18} />
                    <span className="hidden sm:inline">Call</span>
                </button>
                <LuUsers size={16} className="shrink-0" />
                <span>
                    {users.length} {users.length === 1 ? "user" : "users"}
                </span>
                <span className="hidden text-slate-500 md:inline">·</span>
                <span className="hidden max-w-[120px] truncate md:inline">
                    {currentUser.username}
                </span>
            </div>
        </header>
    )
}

export default EditorTopBar
