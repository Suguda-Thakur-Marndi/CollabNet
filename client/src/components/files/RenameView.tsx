import { useFileSystem } from "@/context/FileContext"
import { FormEvent, useCallback, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"

interface RenameViewProps {
    id: string
    preName: string
    type: "file" | "directory"
    setEditing: (isEditing: boolean) => void
}

function RenameView({ id, preName, setEditing, type }: RenameViewProps) {
    const [name, setName] = useState<string>(preName || "")
    const { renameFile, openFile, renameDirectory } = useFileSystem()
    const formRef = useRef<HTMLFormElement>(null)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()

        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
        const trimmed = name.trim()

        if (trimmed === "") {
            toast.error(`${capitalizedType} name cannot be empty`)
        } else if (trimmed.length > 50) {
            toast.error(`${capitalizedType} name cannot be longer than 50 characters`)
        } else if (trimmed === preName) {
            setEditing(false)
        } else {
            const isRenamed =
                type === "directory"
                    ? renameDirectory(id, trimmed)
                    : renameFile(id, trimmed)

            if (isRenamed && type === "file") {
                openFile(id)
            }
            if (!isRenamed) {
                toast.error(`${capitalizedType} with same name already exists`)
            } else {
                setEditing(false)
            }
        }
    }

    const handleFormKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                formRef.current?.requestSubmit()
            } else if (e.key === "Escape") {
                setEditing(false)
            }
        },
        [setEditing],
    )

    const handleDocumentEvent = useCallback(
        (e: KeyboardEvent | MouseEvent) => {
            const formNode = formRef.current
            if (formNode && !formNode.contains(e.target as Node)) {
                setEditing(false)
            }
        },
        [setEditing],
    )

    useEffect(() => {
        const formNode = formRef.current
        if (!formNode) return

        formNode.focus()
        formNode.addEventListener("keydown", handleFormKeyDown)
        document.addEventListener("keydown", handleDocumentEvent)
        document.addEventListener("click", handleDocumentEvent)

        return () => {
            formNode.removeEventListener("keydown", handleFormKeyDown)
            document.removeEventListener("keydown", handleDocumentEvent)
            document.removeEventListener("click", handleDocumentEvent)
        }
    }, [handleDocumentEvent, handleFormKeyDown, setEditing])

    return (
        <form
            onSubmit={handleSubmit}
            ref={formRef}
            className="flex w-full items-center"
        >
            <input
                type="text"
                className="w-full rounded bg-dark border border-primary px-1.5 py-0.5 text-xs font-mono text-white outline-none shadow-xs"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
            />
        </form>
    )
}

export default RenameView
