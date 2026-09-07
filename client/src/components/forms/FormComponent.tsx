import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { LuCopy, LuSparkles, LuCheck, LuArrowRight } from "react-icons/lu"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { saveRecentRoom } from "../dashboard/RecentRooms"

interface FormComponentProps {
    externalRoomId?: string
    externalUsername?: string
}

const FormComponent = ({ externalRoomId, externalUsername }: FormComponentProps) => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()
    const [errors, setErrors] = useState<{ username?: string; roomId?: string }>({})
    const [touched, setTouched] = useState<{ username?: boolean; roomId?: boolean }>({})

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()
    const isJoining = status === USER_STATUS.ATTEMPTING_JOIN

    // Sync external props if selected from recent rooms
    useEffect(() => {
        if (externalRoomId) {
            setCurrentUser((prev) => ({
                ...prev,
                roomId: externalRoomId,
                username: externalUsername || prev.username,
            }))
            if (!externalUsername && usernameRef.current) {
                usernameRef.current.focus()
            }
        }
    }, [externalRoomId, externalUsername, setCurrentUser])

    const createNewRoomId = () => {
        const roomId = uuidv4().slice(0, 8)
        setCurrentUser({ ...currentUser, roomId })
        toast.success("New room ID generated")
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
            if (value.trim().length < 4) {
                return "Room ID must be at least 4 characters"
            }
        }
        return undefined
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCurrentUser((prev) => ({ ...prev, [name]: value }))

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

        saveRecentRoom(currentUser.roomId, currentUser.username)
        toast.loading("Connecting to room...")
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
                toast.success("Room ID loaded — enter your username")
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
                saveRecentRoom(roomId, username)
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

    const roomIdValidated = touched.roomId && !errors.roomId && currentUser.roomId.length >= 4
    const usernameValidated = touched.username && !errors.username && currentUser.username.length >= 3

    return (
        <div className="flex w-full flex-col gap-5 rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div>
                <h2 className="text-base font-semibold text-white tracking-tight">
                    Join Collaborative Room
                </h2>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                    Enter a Room ID and handle to jump into real-time shared coding.
                </p>
            </div>

            <form onSubmit={joinRoom} className="flex w-full flex-col gap-4" noValidate>
                {/* Room ID Field */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="roomId" className="text-xs font-medium text-slate-300">
                        Room Identifier
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                id="roomId"
                                type="text"
                                name="roomId"
                                placeholder="e.g. frontend-team, 8a7f2e1d"
                                className={`input-field font-mono text-xs pr-8 ${errors.roomId ? "error" : ""}`}
                                onChange={handleInputChanges}
                                onBlur={() => handleFieldBlur("roomId")}
                                value={currentUser.roomId}
                                autoComplete="off"
                                aria-invalid={!!errors.roomId}
                                aria-describedby={errors.roomId ? "roomId-error" : undefined}
                            />
                            {roomIdValidated && (
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400">
                                    <LuCheck size={15} />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={copyRoomId}
                            className="btn-secondary shrink-0 px-2.5 py-1.5 text-xs"
                            title="Copy Room ID"
                            aria-label="Copy Room ID"
                        >
                            <LuCopy size={15} />
                        </button>
                    </div>
                    {errors.roomId && (
                        <p id="roomId-error" className="text-xs text-danger">
                            {errors.roomId}
                        </p>
                    )}
                </div>

                {/* Username Field */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="username" className="text-xs font-medium text-slate-300">
                        Collaborator Handle
                    </label>
                    <div className="relative">
                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="e.g. alex_dev"
                            className={`input-field text-xs pr-8 ${errors.username ? "error" : ""}`}
                            onChange={handleInputChanges}
                            onBlur={() => handleFieldBlur("username")}
                            value={currentUser.username}
                            ref={usernameRef}
                            autoComplete="username"
                            aria-invalid={!!errors.username}
                            aria-describedby={errors.username ? "username-error" : undefined}
                        />
                        {usernameValidated && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400">
                                <LuCheck size={15} />
                            </div>
                        )}
                    </div>
                    {errors.username && (
                        <p id="username-error" className="text-xs text-danger">
                            {errors.username}
                        </p>
                    )}
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    className={`btn-primary mt-2 w-full py-2.5 text-xs flex items-center justify-center gap-2 ${
                        isJoining ? "loading" : ""
                    }`}
                    disabled={isJoining}
                    aria-busy={isJoining}
                >
                    {isJoining ? (
                        <span>Connecting to Room...</span>
                    ) : (
                        <>
                            <span>Enter Workspace</span>
                            <LuArrowRight size={14} />
                        </>
                    )}
                </button>
            </form>

            <div className="relative flex items-center justify-center">
                <hr className="w-full border-border" />
                <span className="absolute bg-surface px-2 text-[10px] text-slate-500 uppercase">or</span>
            </div>

            <button
                type="button"
                className="btn-secondary flex w-full items-center justify-center gap-2 py-2 text-xs"
                onClick={createNewRoomId}
            >
                <LuSparkles size={14} className="text-primary" />
                <span>Generate Instant Room ID</span>
            </button>
        </div>
    )
}

export default FormComponent
