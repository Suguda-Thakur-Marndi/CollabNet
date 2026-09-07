import { useAppContext } from "@/context/AppContext"
import { ACTIVITY_STATE } from "@/types/app"
import EditorTopBar from "@/components/common/EditorTopBar"
import StatusBar from "@/components/common/StatusBar"
import TerminalPanel from "@/components/terminal/TerminalPanel"
import { Suspense, lazy, useState, useEffect } from "react"

const EditorComponent = lazy(() => import("../editor/EditorComponent"))
const DrawingEditor = lazy(() => import("../drawing/DrawingEditor"))

function WorkSpace() {
    const { activityState } = useAppContext()
    const [isTerminalOpen, setIsTerminalOpen] = useState(false)

    // Keyboard shortcut to toggle terminal: Ctrl+` (or Cmd+`)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "`") {
                e.preventDefault()
                setIsTerminalOpen((prev) => !prev)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    return (
        <div className="workspace flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-dark">
            <EditorTopBar />
            
            {/* Editor or Drawing Canvas Area */}
            <div className="min-h-0 flex-1 overflow-hidden relative">
                <Suspense
                    fallback={
                        <div className="flex h-full flex-1 items-center justify-center bg-dark text-slate-500 animate-pulse font-mono text-xs">
                            Loading workspace...
                        </div>
                    }
                >
                    {activityState === ACTIVITY_STATE.CODING ? (
                        <EditorComponent />
                    ) : (
                        <DrawingEditor />
                    )}
                </Suspense>
            </div>

            {/* Bottom Resizable Terminal Panel */}
            <TerminalPanel
                isOpen={isTerminalOpen}
                onClose={() => setIsTerminalOpen(false)}
            />

            {/* IDE Status Bar */}
            <StatusBar
                isTerminalOpen={isTerminalOpen}
                onToggleTerminal={() => setIsTerminalOpen((prev) => !prev)}
            />
        </div>
    )
}

export default WorkSpace
