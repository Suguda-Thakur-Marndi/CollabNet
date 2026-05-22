import CallsView from "@/components/call/CallsView"
import { useAppContext } from "@/context/AppContext"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import cn from "classnames"

function CallPanel() {
    const { callPanelOpen, setCallPanelOpen } = useAppContext()
    const { isMobile } = useWindowDimensions()

    if (!callPanelOpen) return null

    const close = () => setCallPanelOpen(false)

    return (
        <>
            {isMobile && (
                <button
                    type="button"
                    className="call-panel-backdrop"
                    aria-label="Close call panel"
                    onClick={close}
                />
            )}
            <aside
                className={cn("call-panel", {
                    "call-panel--mobile": isMobile,
                    "call-panel--desktop": !isMobile,
                })}
                aria-label="Video and voice call"
            >
                <CallsView onClose={isMobile ? close : undefined} />
            </aside>
        </>
    )
}

export default CallPanel
