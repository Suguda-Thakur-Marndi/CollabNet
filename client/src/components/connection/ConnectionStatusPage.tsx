import { useNavigate } from "react-router-dom"
import { LuRefreshCw, LuWifiOff, LuArrowLeft } from "react-icons/lu"
import { useState } from "react"

function ConnectionStatusPage() {
    const navigate = useNavigate()
    const [isRetrying, setIsRetrying] = useState(false)

    const handleRetry = () => {
        setIsRetrying(true)
        setTimeout(() => {
            window.location.reload()
        }, 300)
    }

    return (
        <div className="home-gradient flex min-h-screen flex-col items-center justify-center p-4 select-none">
            <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-border bg-surface p-6 shadow-2xl text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                    <LuWifiOff size={28} />
                </div>

                <div className="space-y-1.5">
                    <h1 className="text-lg font-bold text-white tracking-tight">
                        Connection Disconnected
                    </h1>
                    <p className="text-xs text-muted leading-relaxed">
                        Unable to connect to the CollabNet collaboration server. Verify that the backend server is active on port 3000.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-2 pt-2">
                    <button
                        type="button"
                        className={`btn-primary flex items-center justify-center gap-2 py-2 text-xs ${
                            isRetrying ? "loading" : ""
                        }`}
                        onClick={handleRetry}
                        disabled={isRetrying}
                        aria-busy={isRetrying}
                    >
                        {isRetrying ? (
                            <span>Reconnecting...</span>
                        ) : (
                            <>
                                <LuRefreshCw size={14} />
                                <span>Retry Connection</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn-secondary flex items-center justify-center gap-2 py-2 text-xs"
                        onClick={() => navigate("/")}
                    >
                        <LuArrowLeft size={14} />
                        <span>Return to Workspace Dashboard</span>
                    </button>
                </div>

                <div className="rounded bg-darkHover/60 px-3 py-2 text-[11px] font-mono text-slate-400 border border-border/60 w-full text-left">
                    <p className="text-slate-500 text-[10px] uppercase font-semibold">Diagnostics</p>
                    <p className="mt-0.5">Socket Target: <span className="text-slate-300">localhost:3000</span></p>
                    <p>Transport: <span className="text-slate-300">WebSocket / Polling fallback</span></p>
                </div>
            </div>
        </div>
    )
}

export default ConnectionStatusPage
