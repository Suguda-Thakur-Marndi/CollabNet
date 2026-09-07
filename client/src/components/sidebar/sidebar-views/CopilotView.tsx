import type { ReactNode } from "react"
import { useCopilot } from "@/context/CopilotContext"
import { useFileSystem } from "@/context/FileContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { SocketEvent } from "@/types/socket"
import toast from "react-hot-toast"
import { LuClipboardPaste, LuCopy, LuRepeat, LuSparkles } from "react-icons/lu"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"

function CopilotView() {
    const { socket } = useSocket()
    const { viewHeight } = useResponsive()
    const { generateCode, output, isRunning, setInput } = useCopilot()
    const { activeFile, updateFileContent, setActiveFile } = useFileSystem()

    const copyOutput = async () => {
        try {
            const content = output.replace(/```[\w]*\n?/g, "").trim()
            await navigator.clipboard.writeText(content)
            toast.success("Code copied to clipboard")
        } catch {
            toast.error("Unable to copy output")
        }
    }

    const pasteCodeInFile = () => {
        if (!activeFile) {
            toast.error("Open a file first")
            return
        }
        const fileContent = activeFile.content ? `${activeFile.content}\n` : ""
        const content = `${fileContent}${output.replace(/```[\w]*\n?/g, "").trim()}`
        updateFileContent(activeFile.id, content)
        setActiveFile({ ...activeFile, content })
        toast.success("Code appended to active file")

        socket.emit(SocketEvent.FILE_UPDATED, {
            fileId: activeFile.id,
            newContent: content,
        })
    }

    const replaceCodeInFile = () => {
        if (!activeFile) {
            toast.error("Open a file first")
            return
        }
        const content = output.replace(/```[\w]*\n?/g, "").trim()
        updateFileContent(activeFile.id, content)
        setActiveFile({ ...activeFile, content })
        toast.success("File content replaced")
        socket.emit(SocketEvent.FILE_UPDATED, {
            fileId: activeFile.id,
            newContent: content,
        })
    }

    return (
        <div
            className="flex h-full flex-col gap-3 p-3 overflow-hidden select-none"
            style={{ height: viewHeight }}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono flex items-center gap-1.5">
                    <LuSparkles size={13} className="text-primary" />
                    AI Assistant
                </span>
            </div>

            {/* Prompt input */}
            <div className="flex flex-col gap-1.5">
                <textarea
                    className="input-field min-h-[90px] resize-y py-2 px-2.5 text-xs text-slate-200"
                    placeholder="Describe what code to generate or explain..."
                    onChange={(e) => setInput(e.target.value)}
                />
            </div>

            {/* Generate button */}
            <button
                type="button"
                className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-xs"
                onClick={generateCode}
                disabled={isRunning}
            >
                {isRunning ? (
                    <>
                        <div className="spinner-small" />
                        <span>Thinking...</span>
                    </>
                ) : (
                    <>
                        <LuSparkles size={14} />
                        <span>Generate Code</span>
                    </>
                )}
            </button>

            {/* Output controls */}
            {output && (
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5 pt-1">
                    <span className="text-[11px] text-muted font-mono">Response</span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            className="btn-ghost p-1 text-muted hover:text-white"
                            title="Copy code"
                            onClick={copyOutput}
                        >
                            <LuCopy size={14} />
                        </button>
                        <button
                            type="button"
                            className="btn-ghost p-1 text-muted hover:text-white"
                            title="Replace active file"
                            onClick={replaceCodeInFile}
                        >
                            <LuRepeat size={14} />
                        </button>
                        <button
                            type="button"
                            className="btn-ghost p-1 text-muted hover:text-white"
                            title="Append to file"
                            onClick={pasteCodeInFile}
                        >
                            <LuClipboardPaste size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Code Output / Markdown view */}
            <div className="flex-1 overflow-y-auto rounded-md bg-[#070a0f] p-2 border border-border/70 text-xs min-h-0">
                {output ? (
                    <ReactMarkdown
                        components={{
                            code({
                                inline,
                                className,
                                children,
                                ...props
                            }: {
                                inline?: boolean
                                className?: string
                                children?: ReactNode
                            }) {
                                const match = /language-(\w+)/.exec(className || "")
                                const language = match ? match[1] : "javascript"

                                return !inline ? (
                                    <SyntaxHighlighter
                                        style={dracula}
                                        language={language}
                                        PreTag="div"
                                        className="!m-0 !rounded !bg-transparent !p-2 font-mono"
                                    >
                                        {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className="rounded bg-darkHover px-1 py-0.5 font-mono text-primary" {...props}>
                                        {children}
                                    </code>
                                )
                            },
                        }}
                    >
                        {output}
                    </ReactMarkdown>
                ) : (
                    <div className="flex h-full items-center justify-center text-center text-muted">
                        <p className="text-xs">Generated solutions will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CopilotView
