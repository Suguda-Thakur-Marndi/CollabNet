import { useNavigate } from "react-router-dom"
import { LuRefreshCw, LuWifiOff } from "react-icons/lu"
import { useState } from "react"

function ConnectionStatusPage() {
    return (
        <div className="home-gradient flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12 text-center">
            <ConnectionError />
        </div>
    )
}

const ConnectionError = () => {
    const navigate = useNavigate()
    const [isRetrying, setIsRetrying] = useState(false)

    const handleRetry = () => {
        setIsRetrying(true)
        setTimeout(() => {
            window.location.reload()
        }, 300)
    }

    return (
        <div className="flex max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-8 shadow-xl animate-fadeIn">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-500 animate-pulse">
                <LuWifiOff size={32} />
            </div>
            <div className="space-y-3">
                <h1 className="text-2xl font-bold text-white">
                    Connection failed
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Could not reach the collaboration server. Make sure the
                    backend is running on port 3000, then try again.
                </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center pt-2">
                <button
                    type="button"
                    className={`btn-primary flex items-center justify-center gap-2 py-2.5 transition-all ${isRetrying ? "loading" : ""}`}
                    onClick={handleRetry}
                    disabled={isRetrying}
                    aria-busy={isRetrying}
                >
                    {isRetrying ? (
                        <>
                            <div className="spinner-small" />
                            Reconnecting…
                        </>
                    ) : (
                        <>
                            <LuRefreshCw size={18} />
                            Try again
                        </>
                    )}
                </button>
                <button
                    type="button"
                    className="btn-secondary py-2.5"
                    onClick={() => navigate("/")}
                >
                    Back to home
                </button>
            </div>
            <p className="text-xs text-slate-500 pt-2">
                Still having issues? Check that your server is accessible at{" "}
                <code className="text-slate-400">localhost:3000</code>
            </p>
        </div>
    )
}

export default ConnectionStatusPage
