import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { useSocket } from "@/context/SocketContext"
import type { ChatMessage } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import { formatDate } from "@/utils/formateDate"
import type { FormEvent } from "react"
import { useRef, useState } from "react"
import { LuSendHorizontal } from "react-icons/lu"
import { v4 as uuidV4 } from "uuid"

function ChatInput() {
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const { setMessages } = useChatRoom()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [isSending, setIsSending] = useState(false)

    const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const inputVal = inputRef.current?.value.trim()

        if (inputVal && inputVal.length > 0 && !isSending) {
            setIsSending(true)
            try {
                const message: ChatMessage = {
                    id: uuidV4(),
                    message: inputVal,
                    username: currentUser.username,
                    timestamp: formatDate(new Date().toISOString()),
                }
                socket.emit(SocketEvent.SEND_MESSAGE, { message })
                setMessages((messages: ChatMessage[]) => [...messages, message])

                if (inputRef.current) inputRef.current.value = ""
            } finally {
                setIsSending(false)
                inputRef.current?.focus()
            }
        }
    }

    return (
        <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 rounded-md border border-border bg-surface-elevated transition-all duration-200 focus-within:border-primary focus-within:shadow-lg"
        >
            <input
                type="text"
                className="w-full grow border-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder-slate-500 transition-colors"
                placeholder="Type a message..."
                ref={inputRef}
                disabled={isSending}
                maxLength={500}
                aria-label="Chat message input"
            />
            <button
                className={`btn-primary m-1 flex shrink-0 items-center justify-center gap-2 rounded px-3 py-2 transition-all duration-200 ${isSending ? "opacity-75" : ""}`}
                type="submit"
                disabled={isSending}
                aria-label={isSending ? "Sending message" : "Send message"}
                title={isSending ? "Sending..." : "Send message (Ctrl+Enter)"}
            >
                {isSending ? (
                    <div className="spinner-small" />
                ) : (
                    <LuSendHorizontal size={18} />
                )}
            </button>
        </form>
    )
}

export default ChatInput
