import SplitterComponent from "@/components/SplitterComponent"
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage"
import Sidebar from "@/components/sidebar/Sidebar"
import WorkSpace from "@/components/workspace"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useFullScreen from "@/hooks/useFullScreen"
import useUserActivity from "@/hooks/useUserActivity"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS, User } from "@/types/user"
import { useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

function EditorPage() {
    // Listen user online/offline status
    useUserActivity()
    // Enable fullscreen mode
    useFullScreen()
    const navigate = useNavigate()
    const { roomId } = useParams()
    const { status, setCurrentUser, currentUser } = useAppContext()
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
            <Sidebar />
            <WorkSpace/>
        </SplitterComponent>
    )
}

export default EditorPage
