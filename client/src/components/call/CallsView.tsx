import { WebcamStream } from "@/components/webcam-stream"
import useResponsive from "@/hooks/useResponsive"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { LuVideo, LuX } from "react-icons/lu"

interface CallsViewProps {
    onClose?: () => void
}

function CallsView({ onClose }: CallsViewProps) {
    const { viewHeight } = useResponsive()
    const { isMobile } = useWindowDimensions()

    return (
        <div
            className="flex h-full min-h-0 flex-col gap-2.5 p-3 select-none"
            style={isMobile ? { height: viewHeight } : undefined}
        >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/80 pb-2">
                <div className="flex items-center gap-2">
                    <LuVideo size={16} className="text-primary" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono">
                        Video & Voice Call
                    </span>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost p-1 text-muted hover:text-white"
                        title="Close Call Panel"
                        aria-label="Close call panel"
                    >
                        <LuX size={16} />
                    </button>
                )}
            </div>

            {/* Video stream viewport */}
            <div className="call-panel__stream min-h-0 flex-1 overflow-hidden rounded-md border border-border bg-[#070a0f]">
                <WebcamStream />
            </div>
        </div>
    )
}

export default CallsView
