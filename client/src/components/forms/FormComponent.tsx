import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { LuCopy, LuSparkles, LuCheck } from "react-icons/lu"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import logo from "@/assets/logo.png"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()
    const [errors, setErrors] = useState<{ username?: string; roomId?: string }>({})
    const [touched, setTouched] = useState<{ username?: boolean; roomId?: boolean }>({})

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()
    const isJoining = status === USER_STATUS.ATTEMPTING_JOIN

    const createNewRoomId = () => {
        const roomId = uuidv4()
        setCurrentUser({ ...currentUser, roomId })
        toast.success("New room created — share the Room ID with your team")
        usernameRef.current?.focus()
    }

    const validateField = (name: string, value: string): string | undefined => {
        if (name === "username") {
            if (value.trim().length === 0) {
                return "Username is required"
            }
            if (value.trim().length < 3) {
                return "Username must be at least 3 characters"
            }
        } else if (name === "roomId") {
            if (value.trim().length === 0) {
                return "Room ID is required"
            }
            if (value.trim().length < 5) {
                return "Room ID must be at least 5 characters"
            }
        }
        return undefined
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCurrentUser((prev) => ({ ...prev, [name]: value }))
        
        // Validate as user types (if field was touched)
        if (touched[name as keyof typeof touched]) {
            const error = validateField(name, value)
            setErrors((prev) => ({
                ...prev,
                [name]: error,
            }))
        }
    }

    const handleFieldBlur = (name: string) => {
        setTouched((prev) => ({ ...prev, [name]: true }))
        const error = validateField(name, currentUser[name as keyof typeof currentUser] || "")
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }))
    }

    const copyRoomId = async () => {
        if (!currentUser.roomId) {
            toast.error("Generate or enter a Room ID first")
            return
        }
        try {
            await navigator.clipboard.writeText(currentUser.roomId)
            toast.success("Room ID copied to clipboard")
        } catch {
            toast.error("Could not copy Room ID")
        }
    }

    const validateForm = (): boolean => {
        const newErrors: { username?: string; roomId?: string } = {}
        
        const roomIdError = validateField("roomId", currentUser.roomId)
        const usernameError = validateField("username", currentUser.username)
        
        if (roomIdError) newErrors.roomId = roomIdError
        if (usernameError) newErrors.username = usernameError

        setErrors(newErrors)
        setTouched({ username: true, roomId: true })

        return Object.keys(newErrors).length === 0
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isJoining) return
        if (!validateForm()) {
            toast.error("Please fix the errors above")
            return
        }
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

    const roomIdValidated = touched.roomId && !errors.roomId && currentUser.roomId.length >= 5
    const usernameValidated = touched.username && !errors.username && currentUser.username.length >= 3

    return (
        <div className="flex w-full max-w-[440px] flex-col gap-6 rounded-2xl border border-border bg-surface/80 p-6 shadow-xl backdrop-blur-sm sm:p-8">
            <div className="text-center">
                <img src={logo} alt="Collab Net" className="mx-auto w-full max-w-[280px]" />
                <p className="mt-3 text-sm text-muted">
                    Real-time collaborative coding — join a room and build together.
                </p>
            </div>

            <form onSubmit={joinRoom} className="flex w-full flex-col gap-4" noValidate>
                <div className="form-group">
                    <label htmlFor="roomId" className="form-label">
                        Room ID
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                id="roomId"
                                type="text"
                                name="roomId"
                                placeholder="e.g. my-team-room"
                                className={`input-field flex-1 ${errors.roomId ? "error" : ""}`}
                                onChange={handleInputChanges}
                                onBlur={() => handleFieldBlur("roomId")}
                                value={currentUser.roomId}
                                autoComplete="off"
                                aria-invalid={!!errors.roomId}
                                aria-describedby={errors.roomId ? "roomId-error" : undefined}
                            />
                            {roomIdValidated && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                    <LuCheck size={18} />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={copyRoomId}
                            className="btn-secondary shrink-0 px-3"
                            title="Copy Room ID"
                            aria-label="Copy Room ID to clipboard"
                        >
                            <LuCopy size={18} />
                        </button>
                    </div>
                    {errors.roomId && (
                        <div id="roomId-error" className="flex items-center gap-1 text-error">
                            <LuAlertTriangle size={16} />
                            <span>{errors.roomId}</span>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="username" className="form-label">
                        Username
                    </label>
                    <div className="relative">
                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="How others see you"
                            className={`input-field ${errors.username ? "error" : ""}`}
                            onChange={handleInputChanges}
                            onBlur={() => handleFieldBlur("username")}
                            value={currentUser.username}
                            ref={usernameRef}
                            autoComplete="username"
                            aria-invalid={!!errors.username}
                            aria-describedby={errors.username ? "username-error" : undefined}
                        />
                        {usernameValidated && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                <LuCheck size={18} />
                            </div>
                        )}
                    </div>
                    {errors.username && (
                        <div id="username-error" className="flex items-center gap-1 text-error">
                            <LuAlertTriangle size={16} />
                            <span>{errors.username}</span>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className={`btn-primary mt-1 w-full py-3 text-base ${isJoining ? "loading" : ""}`}
                    disabled={isJoining}
                    aria-busy={isJoining}
                >
                    {isJoining ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="spinner-small" />
                            Joining…
                        </span>
                    ) : (
                        "Join room"
                    )}
                </button>
            </form>

            <button
                type="button"
                className="btn-secondary flex w-full items-center justify-center gap-2"
                onClick={createNewRoomId}
                aria-label="Generate a new random room ID"
            >
                <LuSparkles size={18} />
                Generate new Room ID
            </button>
        </div>
    )
}

export default FormComponent
