import {
    ACTIVITY_STATE,
    AppContext as AppContextType,
    DrawingData,
} from "@/types/app"
import { RemoteUser, USER_STATUS, User } from "@/types/user"
import { ReactNode, createContext, useContext, useState } from "react"

const AppContext = createContext<AppContextType | null>(null)

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext)
    if (context === null) {
        throw new Error(
            "useAppContext must be used within a AppContextProvider",
        )
    }
    return context
}

function AppContextProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<RemoteUser[]>([])
    const [status, setStatus] = useState<USER_STATUS>(USER_STATUS.INITIAL)
    const [currentUser, setCurrentUserState] = useState<User>({
        username: "",
        roomId: "",
    })

    const setCurrentUser = (
        user: User | ((prev: User) => User),
    ) => {
        setCurrentUserState(user)
    }
    const [activityState, setActivityState] = useState<ACTIVITY_STATE>(
        ACTIVITY_STATE.CODING,
    )
    const [drawingData, setDrawingData] = useState<DrawingData>(null)

    return (
        <AppContext.Provider
            value={{
                users,
                setUsers,
                currentUser,
                setCurrentUser,
                status,
                setStatus,
                activityState,
                setActivityState,
                drawingData,
                setDrawingData,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export { AppContextProvider }
export default AppContext
