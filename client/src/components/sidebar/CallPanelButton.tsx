import { useAppContext } from "@/context/AppContext"
import { useViews } from "@/context/ViewContext"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { useState } from "react"
import { LuVideo } from "react-icons/lu"
import { Tooltip } from "react-tooltip"
import { buttonStyles, tooltipStyles } from "./tooltipStyles"

function CallPanelButton() {
    const { callPanelOpen, toggleCallPanel } = useAppContext()
    const { setIsSidebarOpen } = useViews()
    const { isMobile } = useWindowDimensions()
    const [showTooltip, setShowTooltip] = useState(true)

    const handleClick = () => {
        if (isMobile && !callPanelOpen) {
            setIsSidebarOpen(false)
        }
        toggleCallPanel()
    }

    return (
        <div className="relative flex flex-col items-center">
            <button
                type="button"
                onClick={handleClick}
                onMouseEnter={() => setShowTooltip(true)}
                className={`${buttonStyles.base} ${buttonStyles.hover} ${
                    callPanelOpen ? "bg-darkHover text-primary" : ""
                }`}
                {...(showTooltip && {
                    "data-tooltip-id": "tooltip-call",
                    "data-tooltip-content": "Video & Voice",
                })}
                aria-label="Video and voice call"
                aria-pressed={callPanelOpen}
            >
                <LuVideo size={28} />
            </button>
            {showTooltip && (
                <Tooltip
                    id="tooltip-call"
                    place="right"
                    offset={25}
                    className="!z-50"
                    style={tooltipStyles}
                    noArrow={false}
                    positionStrategy="fixed"
                    float={true}
                />
            )}
        </div>
    )
}

export default CallPanelButton
