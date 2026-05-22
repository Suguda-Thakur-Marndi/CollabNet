import { WebcamStream } from "@/components/webcam-stream"
import useResponsive from "@/hooks/useResponsive"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { LuX } from "react-icons/lu"

interface CallsViewProps {
    onClose?: () => void
}

function CallsView({ onClose }: CallsViewProps) {
    const { viewHeight } = useResponsive()
    const { isMobile } = useWindowDimensions()

    return (
        <div
            className="flex h-full min-h-0 flex-col gap-3 p-4"
            style={isMobile ? { height: viewHeight } : undefined}
        >
            <div className="flex shrink-0 items-start justify-between gap-2">
                <div className="min-w-0">
                    <h1 className="view-title mb-0 border-0 pb-0">
                        Video & Voice
                    </h1>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                        Start your camera or microphone to connect with others
                        in this room.
                    </p>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost shrink-0 p-2 md:hidden"
                        title="Close"
                        aria-label="Close call panel"
                    >
                        <LuX size={20} />
                    </button>
                )}
            </div>
            <div className="call-panel__stream min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-dark">
                <WebcamStream />
            </div>
        </div>
    )
}

export default CallsView
