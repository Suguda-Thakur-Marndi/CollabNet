import { useAppContext } from "@/context/AppContext"
import { ACTIVITY_STATE } from "@/types/app"
import EditorTopBar from "@/components/common/EditorTopBar"
import { Suspense, lazy } from "react"

const EditorComponent = lazy(() => import("../editor/EditorComponent"))
const DrawingEditor = lazy(() => import("../drawing/DrawingEditor"))

function WorkSpace() {
    const { activityState } = useAppContext()

    return (
        <div className="workspace flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-dark">
            <EditorTopBar />
            <div className="min-h-0 flex-1 overflow-hidden">
                <Suspense fallback={<div className="flex flex-1 items-center justify-center bg-dark text-slate-500 animate-pulse">Loading editor…</div>}>
                    {activityState === ACTIVITY_STATE.CODING ? (
                        <EditorComponent />
                    ) : (
                        <DrawingEditor />
                    )}
                </Suspense>
            </div>
        </div>
    )
}

export default WorkSpace
