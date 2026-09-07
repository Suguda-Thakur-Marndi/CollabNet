import { useFileSystem } from "@/context/FileContext"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import { LuX } from "react-icons/lu"
import cn from "classnames"
import { useEffect, useRef, MouseEvent } from "react"
import { languageIdFromFileName } from "@/utils/codemirrorLanguage"
import { useSettings } from "@/context/SettingContext"

function FileTab() {
    const {
        openFiles,
        closeFile,
        activeFile,
        updateFileContent,
        setActiveFile,
    } = useFileSystem()
    const fileTabRef = useRef<HTMLDivElement>(null)
    const { setLanguage } = useSettings()

    const changeActiveFile = (fileId: string) => {
        if (activeFile?.id === fileId) return

        updateFileContent(activeFile?.id || "", activeFile?.content || "")

        const file = openFiles.find((f) => f.id === fileId)
        if (file) {
            setActiveFile(file)
        }
    }

    const handleMouseDown = (e: MouseEvent, fileId: string) => {
        // Middle click closes tab
        if (e.button === 1) {
            e.preventDefault()
            closeFile(fileId)
        }
    }

    useEffect(() => {
        const fileTabNode = fileTabRef.current
        if (!fileTabNode) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            if (e.deltaY > 0) {
                fileTabNode.scrollLeft += 80
            } else {
                fileTabNode.scrollLeft -= 80
            }
        }

        fileTabNode.addEventListener("wheel", handleWheel, { passive: false })
        return () => fileTabNode.removeEventListener("wheel", handleWheel)
    }, [])

    useEffect(() => {
        if (!activeFile?.name) return
        setLanguage(languageIdFromFileName(activeFile.name))
    }, [activeFile?.name, setLanguage])

    return (
        <div
            className="flex h-9 w-full shrink-0 select-none items-stretch overflow-x-auto border-b border-border bg-[#0e1420]"
            ref={fileTabRef}
            role="tablist"
            aria-label="Open editor tabs"
        >
            {openFiles.map((file) => {
                const isActive = file.id === activeFile?.id

                return (
                    <div
                        key={file.id}
                        className={cn(
                            "group flex max-w-[200px] shrink-0 cursor-pointer items-center gap-2 border-r border-border/80 px-3 py-1.5 text-xs font-mono transition-colors",
                            {
                                "bg-[#0b0f17] text-white font-medium border-t-2 border-t-primary": isActive,
                                "bg-transparent text-muted hover:bg-surface-elevated hover:text-slate-200": !isActive,
                            }
                        )}
                        onClick={() => changeActiveFile(file.id)}
                        onMouseDown={(e) => handleMouseDown(e, file.id)}
                        role="tab"
                        aria-selected={isActive}
                        title={file.name}
                    >
                        <Icon
                            icon={getIconClassName(file.name)}
                            fontSize={15}
                            className="shrink-0"
                        />
                        <span className="truncate font-medium flex-1">
                            {file.name}
                        </span>
                        <button
                            type="button"
                            className="rounded p-0.5 text-muted opacity-60 hover:bg-darkHover hover:text-white hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation()
                                closeFile(file.id)
                            }}
                            aria-label={`Close ${file.name}`}
                            title={`Close ${file.name}`}
                        >
                            <LuX size={13} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default FileTab
