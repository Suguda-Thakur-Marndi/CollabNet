import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSettings } from "@/context/SettingContext"
import { useSocket } from "@/context/SocketContext"
import usePageEvents from "@/hooks/usePageEvents"
import { editorThemes } from "@/resources/Themes"
import { FileSystemItem } from "@/types/file"
import { SocketEvent } from "@/types/socket"
import { color } from "@uiw/codemirror-extensions-color"
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link"
import { loadCodeMirrorLanguageExtension } from "@/utils/codemirrorLanguage"
import CodeMirror, {
    Extension,
    ViewUpdate,
    scrollPastEnd,
} from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view"
import { useEffect, useMemo, useState, useRef, useCallback } from "react"
import toast from "react-hot-toast"
import { collaborativeHighlighting, updateRemoteUsers } from "./collaborativeHighlighting"

function Editor() {
    const { users, currentUser } = useAppContext()
    const { activeFile, setActiveFile } = useFileSystem()
    const { theme, language, fontSize } = useSettings()
    const { socket } = useSocket()
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const filteredUsers = useMemo(
        () => users.filter((u) => u.username !== currentUser.username),
        [users, currentUser],
    )
    const [extensions, setExtensions] = useState<Extension[]>([])
    const editorRef = useRef<any>(null)
    const highlightWarnedRef = useRef<string | null>(null)
    const [lastCursorPosition, setLastCursorPosition] = useState<number>(0)
    const [lastSelection, setLastSelection] = useState<{start?: number, end?: number}>({})
    const cursorMoveTimeoutRef = useRef<any | null>(null)

    const onCodeChange = (code: string, view: ViewUpdate) => {
        if (!activeFile) return

        const file: FileSystemItem = { ...activeFile, content: code }
        setActiveFile(file)

        const selection = view.state?.selection?.main
        const cursorPosition = selection?.head || 0
        const selectionStart = selection?.from
        const selectionEnd = selection?.to

        socket.emit(SocketEvent.TYPING_START, {
            cursorPosition,
            selectionStart,
            selectionEnd
        })
        socket.emit(SocketEvent.FILE_UPDATED, {
            fileId: activeFile.id,
            newContent: code,
        })
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout(
            () => socket.emit(SocketEvent.TYPING_PAUSE),
            1000,
        )
    }

    const handleSelectionChange = useCallback((view: ViewUpdate) => {
        if (!view.selectionSet) return

        const selection = view.state?.selection?.main
        const cursorPosition = selection?.head || 0
        const selectionStart = selection?.from
        const selectionEnd = selection?.to

        const cursorChanged = cursorPosition !== lastCursorPosition
        const selectionChanged = selectionStart !== lastSelection.start || selectionEnd !== lastSelection.end

        if (cursorChanged || selectionChanged) {
            setLastCursorPosition(cursorPosition)
            setLastSelection({ start: selectionStart, end: selectionEnd })

            if (cursorMoveTimeoutRef.current) {
                clearTimeout(cursorMoveTimeoutRef.current)
            }

            cursorMoveTimeoutRef.current = setTimeout(() => {
                socket.emit(SocketEvent.CURSOR_MOVE, {
                    cursorPosition,
                    selectionStart,
                    selectionEnd
                })
            }, 100)
        }
    }, [lastCursorPosition, lastSelection, socket])

    usePageEvents()

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
            if (cursorMoveTimeoutRef.current) {
                clearTimeout(cursorMoveTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const extensions = [
            color,
            hyperLink,
            collaborativeHighlighting(),
            EditorView.updateListener.of(handleSelectionChange),
            scrollPastEnd(),
        ]
        const langExt = loadCodeMirrorLanguageExtension(
            activeFile?.name,
            language,
        )
        if (langExt) {
            extensions.push(langExt)
            highlightWarnedRef.current = null
        } else {
            const warnKey = `${activeFile?.name ?? ""}:${language}`
            if (highlightWarnedRef.current !== warnKey) {
                highlightWarnedRef.current = warnKey
                toast.error(
                    `Syntax highlighting is not available for "${language}". Try another language in Settings.`,
                    { duration: 4000 },
                )
            }
        }

        setExtensions(extensions)
    }, [
        activeFile?.name,
        filteredUsers,
        language,
        handleSelectionChange,
    ])

    useEffect(() => {
        if (editorRef.current?.view) {
            editorRef.current.view.dispatch({
                effects: updateRemoteUsers.of(filteredUsers)
            })
        }
    }, [filteredUsers])

    return (
        <CodeMirror
            ref={editorRef}
            theme={editorThemes[theme]}
            onChange={onCodeChange}
            value={activeFile?.content}
            extensions={extensions}
            minHeight="100%"
            height="100%"
            maxWidth="100%"
            className="h-full w-full"
            style={{
                fontSize: fontSize + "px",
                height: "100%",
                position: "relative",
            }}
        />
    )
}

export default Editor
