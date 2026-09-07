import CallPanelButton from "@/components/sidebar/CallPanelButton"
import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { useViews } from "@/context/ViewContext"
import useResponsive from "@/hooks/useResponsive"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { SocketEvent } from "@/types/socket"
import { VIEWS } from "@/types/view"
import { LuCode, LuPenTool, LuX } from "react-icons/lu"
import cn from "classnames"
import { Tooltip } from "react-tooltip"
import { useState } from "react"
import { tooltipStyles, tooltipBorder } from "./tooltipStyles"

function Sidebar() {
    const {
        activeView,
        isSidebarOpen,
        viewComponents,
        viewIcons,
        setIsSidebarOpen,
    } = useViews()
    const { minHeightReached } = useResponsive()
    const { activityState, setActivityState, currentUser } = useAppContext()
    const { socket } = useSocket()
    const { isMobile } = useWindowDimensions()
    const [showTooltip, setShowTooltip] = useState(true)

    const changeState = () => {
        setShowTooltip(false)
        if (activityState === ACTIVITY_STATE.CODING) {
            setActivityState(ACTIVITY_STATE.DRAWING)
            socket.emit(SocketEvent.REQUEST_DRAWING)
        } else {
            setActivityState(ACTIVITY_STATE.CODING)
        }

        if (isMobile) {
            setIsSidebarOpen(false)
        }
    }

    return (
        <aside
            className="flex h-full max-h-full shrink-0 select-none"
            aria-label="Sidebar navigation"
        >
            {/* Primary Activity Bar (Icon Strip) */}
            <div
                className={cn(
                    "fixed bottom-0 left-0 z-50 flex h-[50px] w-full items-center justify-around border-t border-border bg-surface px-1 md:static md:h-full md:w-[48px] md:min-w-[48px] md:flex-col md:justify-between md:border-r md:border-t-0 md:px-0 md:py-3",
                    {
                        hidden: minHeightReached,
                    },
                )}
            >
                {/* Top Section / Main Navigation */}
                <div className="flex items-center gap-1 md:w-full md:flex-col md:gap-2">
                    <SidebarButton
                        viewName={VIEWS.FILES}
                        icon={viewIcons[VIEWS.FILES]}
                    />
                    <SidebarButton
                        viewName={VIEWS.CHATS}
                        icon={viewIcons[VIEWS.CHATS]}
                    />
                    <SidebarButton
                        viewName={VIEWS.COPILOT}
                        icon={viewIcons[VIEWS.COPILOT]}
                    />
                    <SidebarButton
                        viewName={VIEWS.RUN}
                        icon={viewIcons[VIEWS.RUN]}
                    />
                    <SidebarButton
                        viewName={VIEWS.CLIENTS}
                        icon={viewIcons[VIEWS.CLIENTS]}
                    />
                </div>

                {/* Bottom Section (Settings, Call, Whiteboard, User profile) */}
                <div className="flex items-center gap-1 md:w-full md:flex-col md:gap-2">
                    <SidebarButton
                        viewName={VIEWS.SETTINGS}
                        icon={viewIcons[VIEWS.SETTINGS]}
                    />
                    <CallPanelButton />

                    {/* Whiteboard / Code toggle */}
                    <div className="relative flex flex-col items-center">
                        <button
                            type="button"
                            className="relative flex items-center justify-center rounded-md p-2 text-slate-400 transition-colors duration-150 hover:bg-darkHover hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                            onClick={changeState}
                            onMouseEnter={() => setShowTooltip(true)}
                            data-tooltip-id="activity-state-tooltip"
                            data-tooltip-content={
                                activityState === ACTIVITY_STATE.CODING
                                    ? "Open Whiteboard"
                                    : "Open Code Editor"
                            }
                            aria-label={
                                activityState === ACTIVITY_STATE.CODING
                                    ? "Switch to Whiteboard mode"
                                    : "Switch to Code mode"
                            }
                        >
                            {activityState === ACTIVITY_STATE.CODING ? (
                                <LuPenTool size={20} className="text-amber-400" />
                            ) : (
                                <LuCode size={20} className="text-primary" />
                            )}
                        </button>
                        {showTooltip && (
                            <Tooltip
                                id="activity-state-tooltip"
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

                    {/* User Profile Initial Chip (Desktop only) */}
                    <div
                        className="hidden md:flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary ring-1 ring-primary/40 uppercase cursor-default"
                        title={`Signed in as ${currentUser.username || "User"}`}
                    >
                        {currentUser.username ? currentUser.username[0] : "U"}
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile drawer */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Secondary Panel View (Files, Chat, Run, etc.) */}
            <div
                className={cn(
                    "flex flex-col bg-surface border-r border-border transition-all duration-200",
                    {
                        "hidden": !isSidebarOpen,
                        "fixed left-0 top-0 bottom-[50px] z-45 w-[85vw] max-w-[320px] shadow-2xl": isMobile && isSidebarOpen,
                        "relative h-full w-[280px] lg:w-[300px] min-w-[260px]": !isMobile && isSidebarOpen,
                    }
                )}
            >
                {/* Mobile close header */}
                {isMobile && (
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            {activeView}
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            className="btn-ghost p-1 text-muted hover:text-white"
                            aria-label="Close sidebar"
                        >
                            <LuX size={18} />
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-hidden min-h-0">
                    {viewComponents[activeView]}
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
