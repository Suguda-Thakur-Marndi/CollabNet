import { ReactNode, memo, useState } from "react"
import { useViews } from "@/context/ViewContext"
import { useChatRoom } from "@/context/ChatContext"
import { VIEWS } from "@/types/view"
import { Tooltip } from "react-tooltip"
import { buttonStyles, tooltipStyles, tooltipBorder } from "../tooltipStyles"

interface ViewButtonProps {
    viewName: VIEWS
    icon: ReactNode
}

const ViewButton = memo(({ viewName, icon }: ViewButtonProps) => {
    const { activeView, setActiveView, isSidebarOpen, setIsSidebarOpen } =
        useViews()
    const { isNewMessage } = useChatRoom()
    const [showTooltip, setShowTooltip] = useState(true)

    const handleViewClick = (name: VIEWS) => {
        if (name === activeView) {
            setIsSidebarOpen(!isSidebarOpen)
        } else {
            setIsSidebarOpen(true)
            setActiveView(name)
        }
    }

    const isActive = viewName === activeView && isSidebarOpen

    return (
        <div className="relative flex flex-col items-center">
            <button
                onClick={() => handleViewClick(viewName)}
                onMouseEnter={() => setShowTooltip(true)}
                className={`${buttonStyles.base} ${buttonStyles.hover} ${
                    isActive
                        ? "bg-darkHover text-primary md:before:absolute md:before:left-0 md:before:top-2 md:before:bottom-2 md:before:w-[3px] md:before:bg-primary md:before:rounded-r"
                        : "text-slate-400 hover:text-slate-100"
                }`}
                aria-label={`Open ${viewName} panel`}
                aria-pressed={isActive}
                title={viewName}
                tabIndex={0}
                {...(showTooltip && {
                    "data-tooltip-id": `tooltip-${viewName}`,
                    "data-tooltip-content": viewName,
                })}
            >
                <div className="flex items-center justify-center">{icon}</div>

                {viewName === VIEWS.CHATS && isNewMessage && (
                    <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-dark animate-pulse" />
                )}
            </button>

            {showTooltip && (
                <Tooltip
                    id={`tooltip-${viewName}`}
                    place="right"
                    offset={15}
                    className="!z-50"
                    style={tooltipStyles}
                    border={tooltipBorder}
                    noArrow={false}
                    positionStrategy="fixed"
                    float={true}
                />
            )}
        </div>
    )
})

export default ViewButton
