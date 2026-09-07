import Users from "@/components/common/Users"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { USER_STATUS } from "@/types/user"
import toast from "react-hot-toast"
import { LuCopy, LuLogOut, LuShare2 } from "react-icons/lu"
import { useNavigate } from "react-router-dom"

function UsersView() {
    const navigate = useNavigate()
    const { viewHeight } = useResponsive()
    const { setStatus, users } = useAppContext()
    const { socket } = useSocket()

    const copyURL = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success("Room URL copied to clipboard")
        } catch {
            toast.error("Unable to copy URL")
        }
    }

    const shareURL = async () => {
        const url = window.location.href
        try {
            if (navigator.share) {
                await navigator.share({ url, title: "Join CollabNet workspace" })
            } else {
                copyURL()
            }
        } catch {
            // User cancelled share dialog
        }
    }

    const leaveRoom = () => {
        socket.disconnect()
        setStatus(USER_STATUS.DISCONNECTED)
        navigate("/", { replace: true })
    }

    return (
        <div
            className="flex h-full flex-col justify-between p-3 select-none overflow-hidden"
            style={{ height: viewHeight }}
        >
            <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between border-b border-border/80 pb-2 mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono">
                        Collaborators ({users.length})
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                    </span>
                </div>

                <Users />
            </div>

            <div className="flex flex-col gap-2 border-t border-border/80 pt-3 mt-2">
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs"
                        onClick={copyURL}
                        title="Copy Room Link"
                    >
                        <LuCopy size={14} />
                        <span>Copy Link</span>
                    </button>
                    <button
                        type="button"
                        className="btn-secondary flex items-center justify-center p-2 text-xs"
                        onClick={shareURL}
                        title="Share Invite"
                        aria-label="Share room invite"
                    >
                        <LuShare2 size={14} />
                    </button>
                </div>

                <button
                    type="button"
                    className="btn-danger w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs"
                    onClick={leaveRoom}
                    title="Leave room and return home"
                >
                    <LuLogOut size={14} />
                    <span>Leave Room</span>
                </button>
            </div>
        </div>
    )
}

export default UsersView
