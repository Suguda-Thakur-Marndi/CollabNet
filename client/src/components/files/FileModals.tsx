import { FormEvent, useEffect, useRef, useState } from "react"
import Modal from "../common/Modal"
import { LuFilePlus, LuFolderPlus, LuTrash2 } from "react-icons/lu"

interface CreateItemModalProps {
    isOpen: boolean
    onClose: () => void
    type: "file" | "directory"
    onCreate: (name: string) => void
}

export function CreateItemModal({
    isOpen,
    onClose,
    type,
    onCreate,
}: CreateItemModalProps) {
    const [name, setName] = useState("")
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setName("")
            setError(null)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) {
            setError(`Please enter a ${type === "file" ? "file" : "folder"} name`)
            return
        }
        if (/[<>:"/\\|?*]/.test(trimmed)) {
            setError("Name contains invalid characters")
            return
        }
        onCreate(trimmed)
        onClose()
    }

    const title = type === "file" ? "New File" : "New Folder"
    const icon = type === "file" ? <LuFilePlus size={18} className="text-primary" /> : <LuFolderPlus size={18} className="text-amber-400" />

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={`Create a new ${type === "file" ? "file" : "directory"} in the selected path.`}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary py-1.5 px-3 text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn-primary py-1.5 px-3 text-xs"
                    >
                        Create {type === "file" ? "File" : "Folder"}
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted mb-1">
                    {icon}
                    <span>Enter name:</span>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                        if (error) setError(null)
                    }}
                    placeholder={type === "file" ? "e.g. index.ts, style.css" : "e.g. src, components"}
                    className={`input-field text-sm ${error ? "error" : ""}`}
                />
                {error && <p className="text-xs text-danger">{error}</p>}
            </form>
        </Modal>
    )
}

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    itemName: string
    itemType: "file" | "directory"
    onConfirm: () => void
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    itemName,
    itemType,
    onConfirm,
}: DeleteConfirmModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Delete ${itemType === "file" ? "File" : "Directory"}`}
            description="This action cannot be undone."
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary py-1.5 px-3 text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className="btn-danger py-1.5 px-3 text-xs flex items-center gap-1.5"
                    >
                        <LuTrash2 size={14} />
                        Delete
                    </button>
                </>
            }
        >
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                    <LuTrash2 size={18} />
                </div>
                <div className="text-sm text-slate-300">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-white font-mono bg-darkHover px-1.5 py-0.5 rounded border border-border">
                        {itemName}
                    </span>
                    ? {itemType === "directory" && "All files and nested folders will be permanently deleted."}
                </div>
            </div>
        </Modal>
    )
}
