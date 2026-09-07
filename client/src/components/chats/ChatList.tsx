import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import type { ChatMessage } from "@/types/chat"
import { type SyntheticEvent, useEffect, useRef } from "react"
import { LuMessageSquare } from "react-icons/lu"

function ChatList() {
    const {
        messages,
        isNewMessage,
        setIsNewMessage,
        lastScrollHeight,
        setLastScrollHeight,
    } = useChatRoom()
    const { currentUser } = useAppContext()
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)

    const handleScroll = (e: SyntheticEvent) => {
        const container = e.target as HTMLDivElement
        setLastScrollHeight(container.scrollTop)
    }

    useEffect(() => {
        if (!messagesContainerRef.current) return
        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight
    }, [messages])

    useEffect(() => {
        if (isNewMessage) {
            setIsNewMessage(false)
        }
        if (messagesContainerRef.current)
            messagesContainerRef.current.scrollTop = lastScrollHeight
    }, [isNewMessage, setIsNewMessage, lastScrollHeight])

    return (
        <div
            className="flex-1 overflow-y-auto rounded-md bg-[#070a0f] p-3 border border-border/70 space-y-2.5 min-h-0"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted">
                    <LuMessageSquare size={24} className="mb-2 text-slate-600" />
                    <p className="text-xs">No messages yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Send a message to everyone in the room</p>
                </div>
            ) : (
                messages.map((message: ChatMessage, index: number) => {
                    const isMe = message.username === currentUser.username
                    return (
                        <div
                            key={index}
                            className={`flex flex-col max-w-[85%] ${
                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                            }`}
                        >
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                                <span
                                    className={`text-[11px] font-medium ${
                                        isMe ? "text-primary" : "text-emerald-400"
                                    }`}
                                >
                                    {isMe ? "You" : message.username}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {message.timestamp}
                                </span>
                            </div>
                            <div
                                className={`rounded-lg px-3 py-2 text-xs leading-relaxed break-words [overflow-wrap:anywhere] ${
                                    isMe
                                        ? "bg-primary/15 text-slate-100 border border-primary/30 rounded-tr-xs"
                                        : "bg-surface-elevated text-slate-200 border border-border rounded-tl-xs"
                                }`}
                            >
                                {message.message}
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}

export default ChatList
