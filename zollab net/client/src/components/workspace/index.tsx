import { useAppContext } from "@/context/AppContext"
import { ACTIVITY_STATE } from "@/types/app"
import EditorTopBar from "@/components/common/EditorTopBar"
import EditorComponent from "../editor/EditorComponent"
import DrawingEditor from "../drawing/DrawingEditor"

function WorkSpace() {
    const { activityState } = useAppContext()

    return (
        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-dark">
            <EditorTopBar />
            <div className="min-h-0 flex-1 overflow-hidden">
                {activityState === ACTIVITY_STATE.CODING ? (
                    <EditorComponent />
                ) : (
                    <DrawingEditor />
                )}
            </div>
        </div>
    )
}

export default WorkSpace
