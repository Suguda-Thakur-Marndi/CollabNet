import { useState } from "react"
import FileStructureView from "@/components/files/FileStructureView"
import { useFileSystem } from "@/context/FileContext"
import useResponsive from "@/hooks/useResponsive"
import { FileSystemItem } from "@/types/file"
import cn from "classnames"
import { LuFolderUp, LuDownload } from "react-icons/lu"
import { v4 as uuidV4 } from "uuid"
import { toast } from "react-hot-toast"

function FilesView() {
    const { downloadFilesAndFolders, updateDirectory } = useFileSystem()
    const { viewHeight } = useResponsive()
    const { minHeightReached } = useResponsive()
    const [isLoading, setIsLoading] = useState(false)

    const handleOpenDirectory = async () => {
        try {
            setIsLoading(true)

            if ("showDirectoryPicker" in window) {
                const directoryHandle = await (window as any).showDirectoryPicker()
                await processDirectoryHandle(directoryHandle)
                return
            }

            if ("webkitdirectory" in HTMLInputElement.prototype) {
                const fileInput = document.createElement("input")
                fileInput.type = "file"
                fileInput.webkitdirectory = true

                fileInput.onchange = async (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files) {
                        const structure = await readFileList(files)
                        updateDirectory("", structure)
                    }
                }

                fileInput.click()
                return
            }

            toast.error("Your browser does not support directory selection.")
        } catch (error) {
            console.error("Error opening directory:", error)
            toast.error("Failed to open directory")
        } finally {
            setIsLoading(false)
        }
    }

    const processDirectoryHandle = async (
        directoryHandle: any
    ) => {
        try {
            toast.loading("Getting files and folders...")
            const structure = await readDirectory(directoryHandle)
            updateDirectory("", structure)
            toast.dismiss()
            toast.success("Directory loaded successfully")
        } catch (error) {
            console.error("Error processing directory:", error)
            toast.error("Failed to process directory")
        }
    }

    const readDirectory = async (
        directoryHandle: any
    ): Promise<FileSystemItem[]> => {
        const children: FileSystemItem[] = []
        const blackList = ["node_modules", ".git", ".vscode", ".next"]

        for await (const entry of directoryHandle.values()) {
            if (entry.kind === "file") {
                const file = await entry.getFile()
                const newFile: FileSystemItem = {
                    id: uuidV4(),
                    name: entry.name,
                    type: "file",
                    content: await readFileContent(file),
                }
                children.push(newFile)
            } else if (entry.kind === "directory") {
                if (blackList.includes(entry.name)) continue

                const newDirectory: FileSystemItem = {
                    id: uuidV4(),
                    name: entry.name,
                    type: "directory",
                    children: await readDirectory(entry),
                    isOpen: false,
                }
                children.push(newDirectory)
            }
        }
        return children
    }

    const readFileList = async (files: FileList): Promise<FileSystemItem[]> => {
        const children: FileSystemItem[] = []
        const blackList = ["node_modules", ".git", ".vscode", ".next"]

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const pathParts = file.webkitRelativePath.split("/")

            if (pathParts.some((part) => blackList.includes(part))) continue

            if (pathParts.length > 1) {
                const directoryPath = pathParts.slice(0, -1).join("/")
                const directoryIndex = children.findIndex(
                    (item) =>
                        item.name === directoryPath && item.type === "directory"
                )

                if (directoryIndex === -1) {
                    const newDirectory: FileSystemItem = {
                        id: uuidV4(),
                        name: directoryPath,
                        type: "directory",
                        children: [],
                        isOpen: false,
                    }
                    children.push(newDirectory)
                }

                const newFile: FileSystemItem = {
                    id: uuidV4(),
                    name: file.name,
                    type: "file",
                    content: await readFileContent(file),
                }

                const targetDirectory = children.find(
                    (item) =>
                        item.name === directoryPath && item.type === "directory"
                )
                if (targetDirectory && targetDirectory.children) {
                    targetDirectory.children.push(newFile)
                }
            } else {
                const newFile: FileSystemItem = {
                    id: uuidV4(),
                    name: file.name,
                    type: "file",
                    content: await readFileContent(file),
                }
                children.push(newFile)
            }
        }
        return children
    }

    const readFileContent = async (file: File): Promise<string> => {
        const MAX_FILE_SIZE = 1024 * 1024

        if (file.size > MAX_FILE_SIZE) {
            return `File too large: ${file.name} (${Math.round(
                file.size / 1024
            )}KB)`
        }

        try {
            return await file.text()
        } catch (error) {
            console.error(`Error reading file ${file.name}:`, error)
            return `Error reading file: ${file.name}`
        }
    }

    return (
        <div
            className="flex h-full select-none flex-col justify-between overflow-hidden p-3"
            style={{ height: viewHeight }}
        >
            <FileStructureView />

            <div
                className={cn(`flex flex-col gap-1.5 border-t border-border/80 pt-3`, {
                    hidden: minHeightReached,
                })}
            >
                <button
                    type="button"
                    className="btn-secondary flex w-full items-center justify-start gap-2 py-2 px-3 text-xs"
                    onClick={handleOpenDirectory}
                    disabled={isLoading}
                >
                    <LuFolderUp size={16} className="text-primary" />
                    <span>{isLoading ? "Loading..." : "Open Local Directory"}</span>
                </button>
                <button
                    type="button"
                    className="btn-ghost flex w-full items-center justify-start gap-2 py-2 px-3 text-xs text-muted hover:text-white"
                    onClick={downloadFilesAndFolders}
                >
                    <LuDownload size={16} />
                    <span>Download Project (.zip)</span>
                </button>
            </div>
        </div>
    )
}

export default FilesView
