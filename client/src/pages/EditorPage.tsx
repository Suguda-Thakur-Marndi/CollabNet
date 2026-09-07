import SplitterComponent from "@/components/SplitterComponent"
import { Suspense, lazy, useEffect } from "react"
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useFullScreen from "@/hooks/useFullScreen"
import useUserActivity from "@/hooks/useUserActivity"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS, User } from "@/types/user"
import { useLocation, useNavigate, useParams } from "react-router-dom"

const Sidebar = lazy(() => import("@/components/sidebar/Sidebar"))
const WorkSpace = lazy(() => import("@/components/workspace"))
const CallPanel = lazy(() => import("@/components/call/CallPanel"))

function EditorPage() {
    useUserActivity()
    useFullScreen()
    const navigate = useNavigate()
    const { roomId } = useParams()
    const { status, setCurrentUser, currentUser, callPanelOpen } =
        useAppContext()
    const { socket } = useSocket()
    const location = useLocation()

    useEffect(() => {
        const username = location.state?.username ?? currentUser.username
        if (!username) {
            navigate("/", {
                state: { roomId },
            })
            return
        }
        if (!roomId) return

        const user: User = { username, roomId }
        if (
            currentUser.username !== username ||
            currentUser.roomId !== roomId
        ) {
            setCurrentUser(user)
        }

        if (
            status !== USER_STATUS.JOINED &&
            status !== USER_STATUS.CONNECTION_FAILED
        ) {
            socket.emit(SocketEvent.JOIN_REQUEST, user)
        }
    }, [
        currentUser.roomId,
        currentUser.username,
        location.state?.username,
        navigate,
        roomId,
        setCurrentUser,
        socket,
        status,
    ])

    useEffect(() => {
        const rejoinRoom = () => {
            if (
                currentUser.username &&
                currentUser.roomId &&
                status === USER_STATUS.JOINED
            ) {
                socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
            }
        }

        socket.io.on("reconnect", rejoinRoom)
        return () => {
            socket.io.off("reconnect", rejoinRoom)
        }
    }, [currentUser, socket, status])

    if (status === USER_STATUS.CONNECTION_FAILED) {
        return <ConnectionStatusPage />
    }

    return (
        <SplitterComponent>
            <Suspense
                fallback={
                    <div className="h-full w-[48px] shrink-0 border-r border-border bg-surface" />
                }
            >
                <Sidebar />
            </Suspense>

            <div
                className="editor-layout flex min-h-0 min-w-0 flex-1 flex-col md:flex-row overflow-hidden"
                data-call-open={callPanelOpen ? "true" : "false"}
            >
                <Suspense
                    fallback={
                        <div className="flex flex-1 items-center justify-center bg-dark font-mono text-xs text-slate-500 animate-pulse">
                            Loading workspace...
                        </div>
                    }
                >
                    <WorkSpace />
                </Suspense>

                <Suspense fallback={null}>
                    <CallPanel />
                </Suspense>
            </div>
        </SplitterComponent>
    )
}

export default EditorPage
