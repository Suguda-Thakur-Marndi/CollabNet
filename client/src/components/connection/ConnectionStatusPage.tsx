import { useNavigate } from "react-router-dom"
import { LuRefreshCw, LuWifiOff } from "react-icons/lu"

function ConnectionStatusPage() {
    return (
        <div className="home-gradient flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
            <ConnectionError />
        </div>
    )
}

const ConnectionError = () => {
    const navigate = useNavigate()

    return (
        <div className="flex max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-8 shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-danger">
                <LuWifiOff size={28} />
            </div>
            <div className="space-y-2">
                <h1 className="text-xl font-semibold text-white">
                    Connection failed
                </h1>
                <p className="text-sm text-muted leading-relaxed">
                    Could not reach the collaboration server. Make sure the
                    backend is running on port 3000, then try again.
                </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                    type="button"
                    className="btn-primary flex items-center justify-center gap-2"
                    onClick={() => window.location.reload()}
                >
                    <LuRefreshCw size={18} />
                    Try again
                </button>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate("/")}
                >
                    Back to home
                </button>
            </div>
        </div>
    )
}

export default ConnectionStatusPage
