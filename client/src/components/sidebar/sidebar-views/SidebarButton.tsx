
import { ReactNode, memo, useState } from "react"
import { useViews } from "@/context/ViewContext"
import { useChatRoom } from "@/context/ChatContext"
import { VIEWS } from "@/types/view"

interface ViewButtonProps {
    viewName: VIEWS
    icon: ReactNode
}

const ViewButton = memo(({ viewName, icon }: ViewButtonProps) => {
    const { activeView, setActiveView, isSidebarOpen, setIsSidebarOpen } =
        useViews()
    const { isNewMessage } = useChatRoom()
    const [showTooltip, setShowTooltip] = useState(true)

    const handleViewClick = (viewName: VIEWS) => {
        if (viewName === activeView) {
            setIsSidebarOpen(!isSidebarOpen)
        } else {
            setIsSidebarOpen(true)
            setActiveView(viewName)
        }
    }

    const isActive = viewName === activeView && isSidebarOpen

    return (
        <div className="relative flex flex-col items-center">
            <button
                onClick={() => handleViewClick(viewName)}
                onMouseEnter={() => setShowTooltip(true)}
                className={`${buttonStyles.base} ${buttonStyles.hover} transition-all duration-200 ${
                    isActive
                        ? "bg-darkHover text-primary ring-2 ring-primary/40"
                        : "text-slate-400 hover:text-slate-200"
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
                    <div className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></div>
                )}
            </button>
            
            {showTooltip && (
                <Tooltip
                    id={`tooltip-${viewName}`}
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
})

export default ViewButton
