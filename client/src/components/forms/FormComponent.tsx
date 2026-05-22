import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { LuCopy, LuSparkles } from "react-icons/lu"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import logo from "@/assets/logo.svg"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()
    const isJoining = status === USER_STATUS.ATTEMPTING_JOIN

    const createNewRoomId = () => {
        const roomId = uuidv4()
        setCurrentUser({ ...currentUser, roomId })
        toast.success("New room created — share the Room ID with your team")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCurrentUser((prev) => ({ ...prev, [name]: value }))
    }

    const copyRoomId = async () => {
        if (!currentUser.roomId) {
            toast.error("Generate or enter a Room ID first")
            return
        }
        try {
            await navigator.clipboard.writeText(currentUser.roomId)
            toast.success("Room ID copied")
        } catch {
            toast.error("Could not copy Room ID")
        }
    }

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username")
            return false
        }
        if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a room ID")
            return false
        }
        if (currentUser.roomId.trim().length < 5) {
            toast.error("Room ID must be at least 5 characters")
            return false
        }
        if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isJoining) return
        if (!validateForm()) return
        toast.loading("Joining room…")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser((prev) => ({
                ...prev,
                roomId: location.state.roomId,
            }))
            if (currentUser.username.length === 0) {
                toast.success("Room ID filled in — enter your username")
            }
        }
    }, [currentUser.username, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }

        const isRedirect = sessionStorage.getItem("redirect") === "true"

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            const roomId = currentUser.roomId
            if (username && roomId) {
                sessionStorage.setItem("redirect", "true")
                navigate(`/editor/${roomId}`, {
                    state: { username },
                })
            }
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser.username, currentUser.roomId, navigate, setStatus, socket, status])

    return (
        <div className="flex w-full max-w-[440px] flex-col gap-6 rounded-2xl border border-border bg-surface/80 p-6 shadow-xl backdrop-blur-sm sm:p-8">
            <div className="text-center">
                <img src={logo} alt="Zollab Net" className="mx-auto w-full max-w-[280px]" />
                <p className="mt-3 text-sm text-muted">
                    Real-time collaborative coding — join a room and build together.
                </p>
            </div>

            <form onSubmit={joinRoom} className="flex w-full flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                    Room ID
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="roomId"
                            placeholder="e.g. my-team-room"
                            className="input-field flex-1"
                            onChange={handleInputChanges}
                            value={currentUser.roomId}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={copyRoomId}
                            className="btn-secondary shrink-0 px-3"
                            title="Copy Room ID"
                        >
                            <LuCopy size={18} />
                        </button>
                    </div>
                </label>

                <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                    Username
                    <input
                        type="text"
                        name="username"
                        placeholder="How others see you"
                        className="input-field"
                        onChange={handleInputChanges}
                        value={currentUser.username}
                        ref={usernameRef}
                        autoComplete="username"
                    />
                </label>

                <button
                    type="submit"
                    className="btn-primary mt-1 w-full py-3 text-base"
                    disabled={isJoining}
                >
                    {isJoining ? "Joining…" : "Join room"}
                </button>
            </form>

            <button
                type="button"
                className="btn-secondary flex w-full items-center justify-center gap-2"
                onClick={createNewRoomId}
            >
                <LuSparkles size={18} />
                Generate new Room ID
            </button>
        </div>
    )
}

export default FormComponent
