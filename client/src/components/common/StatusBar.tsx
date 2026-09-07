import { useAppContext } from "@/context/AppContext"
import { useSettings } from "@/context/SettingContext"
import { useSocket } from "@/context/SocketContext"
import { USER_STATUS } from "@/types/user"
import { LuTerminal, LuUsers, LuRadio } from "react-icons/lu"

interface StatusBarProps {
    isTerminalOpen?: boolean
    onToggleTerminal?: () => void
}

export default function StatusBar({
    isTerminalOpen,
    onToggleTerminal,
}: StatusBarProps) {
    const { users, status } = useAppContext()
    const { language } = useSettings()
    const { socket } = useSocket()

    const isConnected = status === USER_STATUS.JOINED && socket.connected

    return (
        <footer className="flex h-6 w-full select-none items-center justify-between border-t border-border bg-surface px-3 text-[11px] font-mono text-muted">
            {/* Left side */}
            <div className="flex items-center gap-3">
                <div
                    className="flex items-center gap-1.5 cursor-default"
                    title={isConnected ? "Server connected" : "Disconnected"}
                >
                    <span
                        className={`h-2 w-2 rounded-full ${
                            isConnected ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-red-500 ring-2 ring-red-500/20"
                        }`}
                    />
                    <span className="hidden sm:inline">
                        {isConnected ? "Connected" : "Offline"}
                    </span>
                </div>

                {onToggleTerminal && (
                    <button
                        type="button"
                        onClick={onToggleTerminal}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                            isTerminalOpen
                                ? "bg-darkHover text-white font-medium"
                                : "hover:bg-darkHover hover:text-white"
                        }`}
                        title="Toggle Terminal panel"
                        aria-pressed={isTerminalOpen}
                    >
                        <LuTerminal size={12} />
                        <span>Terminal</span>
                    </button>
                )}

                <div className="flex items-center gap-1 text-slate-400">
                    <LuUsers size={12} />
                    <span>{users.length} active</span>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                <span className="hidden md:inline">Spaces: 4</span>
                <span className="hidden sm:inline">UTF-8</span>
                <span className="text-slate-300 uppercase">
                    {language || "PLAIN TEXT"}
                </span>
                <div className="hidden lg:flex items-center gap-1 text-emerald-400">
                    <LuRadio size={11} />
                    <span>Live</span>
                </div>
            </div>
        </footer>
    )
}
