import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useViews } from "@/context/ViewContext"
import { useContextMenu } from "@/hooks/useContextMenu"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { FileSystemItem, Id } from "@/types/file"
import { sortFileSystemItem } from "@/utils/file"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import cn from "classnames"
import { MouseEvent, useEffect, useRef, useState } from "react"
import {
    LuChevronDown,
    LuChevronRight,
    LuChevronsDownUp,
    LuFilePlus,
    LuFolder,
    LuFolderOpen,
    LuFolderPlus,
    LuPencil,
    LuTrash2,
} from "react-icons/lu"
import RenameView from "./RenameView"
import { CreateItemModal, DeleteConfirmModal } from "./FileModals"

function FileStructureView() {
    const { fileStructure, createFile, createDirectory, collapseDirectories } =
        useFileSystem()
    const explorerRef = useRef<HTMLDivElement | null>(null)
    const [selectedDirId, setSelectedDirId] = useState<Id | null>(null)

    // Modals state
    const [createModalState, setCreateModalState] = useState<{
        isOpen: boolean
        type: "file" | "directory"
    }>({ isOpen: false, type: "file" })

    const [deleteModalState, setDeleteModalState] = useState<{
        isOpen: boolean
        id: Id
        name: string
        type: "file" | "directory"
    }>({ isOpen: false, id: "", name: "", type: "file" })

    const handleClickOutside = (e: MouseEvent) => {
        if (
            explorerRef.current &&
            !explorerRef.current.contains(e.target as Node)
        ) {
            setSelectedDirId(fileStructure.id)
        }
    }

    const openCreateModal = (type: "file" | "directory") => {
        setCreateModalState({ isOpen: true, type })
    }

    const handleCreateItem = (name: string) => {
        const parentDirId: Id = selectedDirId || fileStructure.id
        if (createModalState.type === "file") {
            createFile(parentDirId, name)
        } else {
            createDirectory(parentDirId, name)
        }
    }

    const openDeleteModal = (id: Id, name: string, type: "file" | "directory") => {
        setDeleteModalState({ isOpen: true, id, name, type })
    }

    const { deleteFile, deleteDirectory } = useFileSystem()
    const handleConfirmDelete = () => {
        if (deleteModalState.type === "file") {
            deleteFile(deleteModalState.id)
        } else {
            deleteDirectory(deleteModalState.id)
        }
    }

    const sortedFileStructure = sortFileSystemItem(fileStructure)
    const hasFiles = sortedFileStructure.children && sortedFileStructure.children.length > 0

    return (
        <div
            onClick={handleClickOutside}
            className="flex flex-1 flex-col overflow-hidden select-none"
        >
            {/* Header / Actions toolbar */}
            <div className="flex h-8 shrink-0 items-center justify-between border-b border-border/80 px-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono">
                    Explorer
                </span>
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        className="btn-ghost p-1 text-muted hover:text-white"
                        onClick={() => openCreateModal("file")}
                        title="New File"
                        aria-label="Create file"
                    >
                        <LuFilePlus size={15} />
                    </button>
                    <button
                        type="button"
                        className="btn-ghost p-1 text-muted hover:text-white"
                        onClick={() => openCreateModal("directory")}
                        title="New Folder"
                        aria-label="Create directory"
                    >
                        <LuFolderPlus size={15} />
                    </button>
                    <button
                        type="button"
                        className="btn-ghost p-1 text-muted hover:text-white"
                        onClick={collapseDirectories}
                        title="Collapse All"
                        aria-label="Collapse all directories"
                    >
                        <LuChevronsDownUp size={15} />
                    </button>
                </div>
            </div>

            {/* Tree Area */}
            <div
                className="flex-1 overflow-y-auto overflow-x-hidden p-1.5 font-mono text-xs"
                ref={explorerRef}
            >
                {hasFiles ? (
                    sortedFileStructure.children!.map((item) => (
                        <Directory
                            key={item.id}
                            item={item}
                            setSelectedDirId={setSelectedDirId}
                            openDeleteModal={openDeleteModal}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted">
                        <LuFolderPlus size={28} className="text-slate-600 mb-2" />
                        <p className="text-xs">No files in project</p>
                        <button
                            type="button"
                            onClick={() => openCreateModal("file")}
                            className="mt-3 text-xs text-primary hover:underline"
                        >
                            + Create first file
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateItemModal
                isOpen={createModalState.isOpen}
                onClose={() => setCreateModalState((prev) => ({ ...prev, isOpen: false }))}
                type={createModalState.type}
                onCreate={handleCreateItem}
            />

            <DeleteConfirmModal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
                itemName={deleteModalState.name}
                itemType={deleteModalState.type}
                onConfirm={handleConfirmDelete}
            />
        </div>
    )
}

function Directory({
    item,
    setSelectedDirId,
    openDeleteModal,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
    openDeleteModal: (id: Id, name: string, type: "file" | "directory") => void
}) {
    const [isEditing, setEditing] = useState<boolean>(false)
    const dirRef = useRef<HTMLDivElement | null>(null)
    const { coords, menuOpen, setMenuOpen } = useContextMenu({
        ref: dirRef,
    })
    const { toggleDirectory } = useFileSystem()

    const handleDirClick = (dirId: string) => {
        setSelectedDirId(dirId)
        toggleDirectory(dirId)
    }

    const handleRenameDirectory = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        setEditing(true)
    }

    const handleDeleteDirectory = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        openDeleteModal(item.id, item.name, "directory")
    }

    useEffect(() => {
        const dirNode = dirRef.current
        if (!dirNode) return

        dirNode.tabIndex = 0
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F2") {
                e.stopPropagation()
                setEditing(true)
            } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleDirClick(item.id)
            }
        }

        dirNode.addEventListener("keydown", handleKeyDown)
        return () => dirNode.removeEventListener("keydown", handleKeyDown)
    }, [item.id])

    if (item.type === "file") {
        return (
            <File
                item={item}
                setSelectedDirId={setSelectedDirId}
                openDeleteModal={openDeleteModal}
            />
        )
    }

    return (
        <div className="w-full">
            <div
                className="group flex w-full cursor-pointer items-center rounded px-1.5 py-1 text-slate-300 hover:bg-darkHover hover:text-white transition-colors"
                onClick={() => handleDirClick(item.id)}
                ref={dirRef}
            >
                {/* Chevron */}
                <span className="mr-1 text-slate-500">
                    {item.isOpen ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />}
                </span>

                {/* Folder icon */}
                {item.isOpen ? (
                    <LuFolderOpen size={15} className="mr-1.5 shrink-0 text-amber-400" />
                ) : (
                    <LuFolder size={15} className="mr-1.5 shrink-0 text-amber-400/80" />
                )}

                {isEditing ? (
                    <RenameView
                        id={item.id}
                        preName={item.name}
                        type="directory"
                        setEditing={setEditing}
                    />
                ) : (
                    <span
                        className="flex-grow truncate text-xs font-medium"
                        title={item.name}
                    >
                        {item.name}
                    </span>
                )}
            </div>

            {/* Nested children */}
            <div
                className={cn(
                    "border-l border-border/40 ml-3 pl-1.5",
                    { hidden: !item.isOpen, block: item.isOpen }
                )}
            >
                {item.children &&
                    item.children.map((child) => (
                        <Directory
                            key={child.id}
                            item={child}
                            setSelectedDirId={setSelectedDirId}
                            openDeleteModal={openDeleteModal}
                        />
                    ))}
            </div>

            {menuOpen && (
                <ContextMenu
                    top={coords.y}
                    left={coords.x}
                    onRename={handleRenameDirectory}
                    onDelete={handleDeleteDirectory}
                />
            )}
        </div>
    )
}

function File({
    item,
    setSelectedDirId,
    openDeleteModal,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
    openDeleteModal: (id: Id, name: string, type: "file" | "directory") => void
}) {
    const { openFile, activeFile } = useFileSystem()
    const [isEditing, setEditing] = useState<boolean>(false)
    const { setIsSidebarOpen } = useViews()
    const { isMobile } = useWindowDimensions()
    const { activityState, setActivityState } = useAppContext()
    const fileRef = useRef<HTMLDivElement | null>(null)
    const { menuOpen, coords, setMenuOpen } = useContextMenu({
        ref: fileRef,
    })

    const isActive = activeFile?.id === item.id

    const handleFileClick = (fileId: string) => {
        if (isEditing) return
        setSelectedDirId(fileId)
        openFile(fileId)
        if (isMobile) {
            setIsSidebarOpen(false)
        }
        if (activityState === ACTIVITY_STATE.DRAWING) {
            setActivityState(ACTIVITY_STATE.CODING)
        }
    }

    const handleRenameFile = (e: MouseEvent) => {
        e.stopPropagation()
        setEditing(true)
        setMenuOpen(false)
    }

    const handleDeleteFile = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        openDeleteModal(item.id, item.name, "file")
    }

    useEffect(() => {
        const fileNode = fileRef.current
        if (!fileNode) return

        fileNode.tabIndex = 0
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F2") {
                e.stopPropagation()
                setEditing(true)
            } else if (e.key === "Enter") {
                handleFileClick(item.id)
            }
        }

        fileNode.addEventListener("keydown", handleKeyDown)
        return () => fileNode.removeEventListener("keydown", handleKeyDown)
    }, [item.id])

    return (
        <div className="w-full">
            <div
                className={cn(
                    "group flex w-full cursor-pointer items-center rounded px-1.5 py-1 transition-colors",
                    {
                        "bg-darkHover text-white font-medium ring-1 ring-primary/40": isActive,
                        "text-slate-300 hover:bg-darkHover/60 hover:text-white": !isActive,
                    }
                )}
                onClick={() => handleFileClick(item.id)}
                ref={fileRef}
            >
                <span className="mr-1 w-3" />
                <Icon
                    icon={getIconClassName(item.name)}
                    fontSize={16}
                    className="mr-1.5 shrink-0"
                />

                {isEditing ? (
                    <RenameView
                        id={item.id}
                        preName={item.name}
                        type="file"
                        setEditing={setEditing}
                    />
                ) : (
                    <span
                        className="flex-grow truncate text-xs"
                        title={item.name}
                    >
                        {item.name}
                    </span>
                )}
            </div>

            {menuOpen && (
                <ContextMenu
                    top={coords.y}
                    left={coords.x}
                    onRename={handleRenameFile}
                    onDelete={handleDeleteFile}
                />
            )}
        </div>
    )
}

function ContextMenu({
    top,
    left,
    onRename,
    onDelete,
}: {
    top: number
    left: number
    onRename: (e: MouseEvent) => void
    onDelete: (e: MouseEvent) => void
}) {
    // Clamping to avoid rendering offscreen
    const adjustedTop = Math.min(top, window.innerHeight - 90)
    const adjustedLeft = Math.min(left, window.innerWidth - 170)

    return (
        <div
            className="context-menu"
            style={{
                top: `${adjustedTop}px`,
                left: `${adjustedLeft}px`,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                type="button"
                onClick={onRename}
                className="context-menu-item"
            >
                <LuPencil size={13} className="text-muted" />
                <span>Rename (F2)</span>
            </button>
            <button
                type="button"
                onClick={onDelete}
                className="context-menu-item danger"
            >
                <LuTrash2 size={13} />
                <span>Delete</span>
            </button>
        </div>
    )
}

export default FileStructureView
