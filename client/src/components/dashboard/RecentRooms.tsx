import { useEffect, useState } from "react"
import { LuHistory, LuArrowRight, LuTrash2, LuUsers } from "react-icons/lu"

export interface RecentRoom {
    roomId: string
    username: string
    lastVisited: string
}

const STORAGE_KEY = "collabnet_recent_rooms"

export function getRecentRooms(): RecentRoom[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

export function saveRecentRoom(roomId: string, username: string) {
    try {
        const list = getRecentRooms().filter((r) => r.roomId !== roomId)
        const updated: RecentRoom[] = [
            {
                roomId,
                username,
                lastVisited: new Date().toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
            ...list,
        ].slice(0, 5) // keep up to 5 recent rooms
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
        // Ignore localStorage quota errors
    }
}

interface RecentRoomsProps {
    onSelectRoom: (roomId: string, username?: string) => void
}

export default function RecentRooms({ onSelectRoom }: RecentRoomsProps) {
    const [rooms, setRooms] = useState<RecentRoom[]>([])

    useEffect(() => {
        setRooms(getRecentRooms())
    }, [])

    const handleRemove = (e: React.MouseEvent, roomId: string) => {
        e.stopPropagation()
        const updated = rooms.filter((r) => r.roomId !== roomId)
        setRooms(updated)
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {
            // Ignore
        }
    }

    if (rooms.length === 0) return null

    return (
        <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-surface/60 p-4 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted font-mono">
                <div className="flex items-center gap-1.5 text-slate-300">
                    <LuHistory size={14} className="text-primary" />
                    <span>Recent Collaborative Rooms</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">Last visited</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
                {rooms.map((room) => (
                    <div
                        key={room.roomId}
                        onClick={() => onSelectRoom(room.roomId, room.username)}
                        className="group flex items-center justify-between rounded-lg border border-border/60 bg-surface-elevated/40 p-2.5 transition-all hover:border-primary/50 hover:bg-darkHover cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-dark text-slate-400 group-hover:text-primary transition-colors">
                                <LuUsers size={14} />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-mono font-medium text-slate-200 group-hover:text-white">
                                    {room.roomId}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    As <span className="text-primary font-medium">{room.username}</span> • {room.lastVisited}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={(e) => handleRemove(e, room.roomId)}
                                className="btn-ghost p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove from recent"
                                aria-label="Remove from recent list"
                            >
                                <LuTrash2 size={13} />
                            </button>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                                Rejoin <LuArrowRight size={12} />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
