import { useAppContext } from "@/context/AppContext"
import { RemoteUser, USER_CONNECTION_STATUS } from "@/types/user"
import Avatar from "react-avatar"
import { LuCircle, LuPenTool } from "react-icons/lu"

function Users() {
    const { users, currentUser } = useAppContext()

    return (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1 min-h-0">
            {/* Current user card */}
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-2.5">
                <div className="relative">
                    <Avatar
                        name={currentUser.username || "You"}
                        size="36"
                        round="8px"
                        color="#1e293b"
                        fgColor="#60a5fa"
                        className="ring-1 ring-primary/40"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-surface" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-semibold text-white">
                            {currentUser.username}
                        </p>
                        <span className="rounded bg-primary/20 px-1 py-0.2 text-[9px] font-bold text-primary">
                            YOU
                        </span>
                    </div>
                    <p className="text-[11px] text-emerald-400">Host / Active</p>
                </div>
            </div>

            {/* Other collaborators */}
            {users
                .filter((u) => u.username !== currentUser.username)
                .map((user) => (
                    <UserRow key={user.socketId} user={user} />
                ))}

            {users.filter((u) => u.username !== currentUser.username).length === 0 && (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted">
                    <LuCircle size={20} className="text-slate-600 mb-1" />
                    <p className="text-xs">No other collaborators yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                        Share the room link to invite teammates.
                    </p>
                </div>
            )}
        </div>
    )
}

const UserRow = ({ user }: { user: RemoteUser }) => {
    const { username, status, typing } = user
    const isOnline = status === USER_CONNECTION_STATUS.ONLINE

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface-elevated/40 p-2.5 transition-colors hover:bg-darkHover">
            <div className="relative">
                <Avatar
                    name={username}
                    size="36"
                    round="8px"
                    color="#1e293b"
                    fgColor="#cbd5e1"
                    className="ring-1 ring-border"
                />
                <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-surface ${
                        isOnline ? "bg-emerald-500" : "bg-slate-500"
                    }`}
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-slate-200" title={username}>
                    {username}
                </p>
                {typing ? (
                    <div className="flex items-center gap-1 text-[11px] text-primary animate-pulse">
                        <LuPenTool size={10} />
                        <span>Typing...</span>
                    </div>
                ) : (
                    <p className="text-[11px] text-slate-400">
                        {isOnline ? "Online" : "Offline"}
                    </p>
                )}
            </div>
        </div>
    )
}

export default Users
