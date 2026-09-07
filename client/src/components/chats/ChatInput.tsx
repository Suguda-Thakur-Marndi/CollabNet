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
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated p-1 transition-all duration-150 focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/40"
        >
            <input
                type="text"
                className="w-full grow border-none bg-transparent px-2.5 py-1.5 text-xs text-white outline-none placeholder-slate-500"
                placeholder="Type a message..."
                ref={inputRef}
                disabled={isSending}
                maxLength={500}
                aria-label="Chat message input"
            />
            <button
                className="btn-primary shrink-0 p-2 py-1.5 text-xs rounded transition-all"
                type="submit"
                disabled={isSending}
                aria-label={isSending ? "Sending message" : "Send message"}
                title="Send (Enter)"
            >
                {isSending ? (
                    <div className="spinner-small" />
                ) : (
                    <LuSendHorizontal size={14} />
                )}
            </button>
        </form>
    )
}

export default ChatInput
