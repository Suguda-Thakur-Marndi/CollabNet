import { useFileSystem } from "@/context/FileContext"
import { useSettings } from "@/context/SettingContext"
import { LuCheck, LuChevronRight, LuCopy, LuFileCode2 } from "react-icons/lu"
import toast from "react-hot-toast"

export default function Breadcrumbs() {
    const { activeFile } = useFileSystem()
    const { language } = useSettings()

    if (!activeFile) return null

    const copyCode = async () => {
        if (!activeFile.content) {
            toast.error("No content to copy")
            return
        }
        try {
            await navigator.clipboard.writeText(activeFile.content)
            toast.success("File content copied")
        } catch {
            toast.error("Failed to copy content")
        }
    }

    return (
        <div className="flex h-8 w-full items-center justify-between border-b border-border/60 bg-surface/80 px-3 text-xs backdrop-blur-sm select-none">
            {/* Left: Breadcrumbs trail */}
            <div className="flex items-center gap-1.5 overflow-hidden text-muted font-mono">
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                    workspace
                </span>
                <LuChevronRight size={12} className="text-slate-600 shrink-0" />
                <div className="flex items-center gap-1.5 text-slate-200 truncate">
                    <LuFileCode2 size={13} className="text-primary shrink-0" />
                    <span className="font-medium truncate">{activeFile.name}</span>
                </div>
            </div>

            {/* Right: Language tag & Sync status */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <LuCheck size={12} />
                    <span className="hidden sm:inline">Synced</span>
                </div>

                <span className="rounded bg-darkHover px-1.5 py-0.5 font-mono text-[10px] text-slate-300 uppercase border border-border/70">
                    {language || "plain text"}
                </span>

                <button
                    type="button"
                    onClick={copyCode}
                    className="btn-ghost p-1 text-muted hover:text-white"
                    title="Copy full file content"
                    aria-label="Copy file content"
                >
                    <LuCopy size={13} />
                </button>
            </div>
        </div>
    )
}
