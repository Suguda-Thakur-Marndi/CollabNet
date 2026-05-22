import { ReactNode } from "react"

enum VIEWS {
    FILES = "FILES",
    CHATS = "CHATS",
    CLIENTS = "CLIENTS",
    RUN = "RUN",
    COPILOT = "COPILOT",
    SETTINGS = "SETTINGS",
}

interface ViewContext {
    activeView: VIEWS
    setActiveView: (activeView: VIEWS) => void
    isSidebarOpen: boolean
    setIsSidebarOpen: (isSidebarOpen: boolean) => void
    viewComponents: { [key in VIEWS]: ReactNode }
    viewIcons: { [key in VIEWS]: ReactNode }
}

export { ViewContext, VIEWS }
