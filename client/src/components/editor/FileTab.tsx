import { useFileSystem } from "@/context/FileContext"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import { IoClose } from "react-icons/io5"
import cn from "classnames"
import { useEffect, useRef } from "react"
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

        const file = openFiles.find((file) => file.id === fileId)
        if (file) {
            setActiveFile(file)
        }
    }

    useEffect(() => {
        const fileTabNode = fileTabRef.current
        if (!fileTabNode) return

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
                fileTabNode.scrollLeft += 100
            } else {
                fileTabNode.scrollLeft -= 100
            }
        }

        fileTabNode.addEventListener("wheel", handleWheel)

        return () => {
            fileTabNode.removeEventListener("wheel", handleWheel)
        }
    }, [])

    useEffect(() => {
        if (!activeFile?.name) return
        setLanguage(languageIdFromFileName(activeFile.name))
    }, [activeFile?.name, setLanguage])

    return (
        <div
            className="flex h-[50px] w-full select-none gap-1.5 overflow-x-auto border-b border-border bg-surface p-2 pb-0"
            ref={fileTabRef}
            role="tablist"
            aria-label="Open files"
        >
            {openFiles.map((file) => (
                <span
                    key={file.id}
                    className={cn(
                        "flex w-fit items-center gap-2 rounded-t-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-darkHover/50",
                        { 
                            "bg-darkHover text-primary border-b-2 border-primary": file.id === activeFile?.id,
                            "text-slate-300 hover:text-slate-100": file.id !== activeFile?.id,
                        }
                    )}
                    onClick={() => changeActiveFile(file.id)}
                    role="tab"
                    aria-selected={file.id === activeFile?.id}
                    title={file.name}
                >
                    <Icon
                        icon={getIconClassName(file.name)}
                        fontSize={18}
                        className="shrink-0"
                    />
                    <p
                        className="flex-grow cursor-pointer overflow-hidden truncate"
                        title={file.name}
                    >
                        {file.name}
                    </p>
                    <button
                        className="ml-1 shrink-0 rounded-md p-1 transition-colors hover:bg-slate-700/30 hover:text-slate-100"
                        onClick={(e) => {
                            e.stopPropagation()
                            closeFile(file.id)
                        }}
                        aria-label={`Close ${file.name}`}
                        title={`Close ${file.name}`}
                    >
                        <IoClose size={16} />
                    </button>
                </span>
            ))}
        </div>
    )
}

export default FileTab
