import { useAppContext } from "@/context/AppContext"
import { RemoteUser, USER_CONNECTION_STATUS } from "@/types/user"
import Avatar from "react-avatar"

function Users() {
    const { users } = useAppContext()

    return (
        <div className="flex min-h-[200px] flex-grow justify-center overflow-y-auto p-4">
            <div className="flex h-full w-full flex-wrap items-start gap-4">
                {users.length === 0 ? (
                    <div className="flex w-full items-center justify-center text-sm text-slate-400">
                        No users connected
                    </div>
                ) : (
                    users.map((user) => {
                        return <User key={user.socketId} user={user} />
                    })
                )}
            </div>
        </div>
    )
}

const User = ({ user }: { user: RemoteUser }) => {
    const { username, status } = user
    const isOnline = status === USER_CONNECTION_STATUS.ONLINE
    const title = `${username} - ${isOnline ? "online" : "offline"}`

    return (
        <div
            className="group flex w-[100px] flex-col items-center gap-2 rounded-lg p-2 transition-all duration-200 hover:bg-darkHover/50"
            title={title}
            role="status"
            aria-label={`${username} is ${isOnline ? "online" : "offline"}`}
        >
            <div className="relative">
                <Avatar 
                    name={username} 
                    size="50" 
                    round={"12px"} 
                    title={title}
                    className="ring-2 ring-slate-600 group-hover:ring-primary/50 transition-all duration-200"
                />
                <div
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-surface transition-all duration-200 ${
                        isOnline
                            ? "bg-green-500 animate-pulse"
                            : "bg-slate-500"
                    }`}
                    title={isOnline ? "Online" : "Offline"}
                    aria-label={isOnline ? "Online" : "Offline"}
                />
            </div>
            <p className="line-clamp-2 max-w-full text-center text-xs font-medium text-slate-300">
                {username}
            </p>
        </div>
    )
}

export default Users
