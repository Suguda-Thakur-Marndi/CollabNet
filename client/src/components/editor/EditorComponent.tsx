import { useFileSystem } from "@/context/FileContext"
import Editor from "./Editor"
import FileTab from "./FileTab"
import Breadcrumbs from "../common/Breadcrumbs"
import { memo } from "react"
import { LuCode, LuFilePlus } from "react-icons/lu"

const EditorComponent = memo(function EditorComponent() {
    const { openFiles, fileStructure, createFile } = useFileSystem()

    const handleCreateInitialFile = () => {
        const name = `index.${fileStructure.children?.length ? "js" : "ts"}`
        createFile(fileStructure.id, name)
    }

    if (openFiles.length <= 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center select-none bg-dark">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated text-primary border border-border">
                    <LuCode size={24} />
                </div>
                <div className="max-w-xs space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                        No File Open
                    </p>
                    <p className="text-xs text-muted leading-relaxed">
                        Select a file from the explorer sidebar, or create a new file to collaborate in real time.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleCreateInitialFile}
                    className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs mt-1"
                >
                    <LuFilePlus size={14} className="text-primary" />
                    <span>Create New File</span>
                </button>
            </div>
        )
    }

    return (
        <main className="flex h-full w-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-dark">
            <FileTab />
            <Breadcrumbs />
            <div className="min-h-0 flex-1 overflow-hidden relative">
                <Editor />
            </div>
        </main>
    )
})

export default EditorComponent
