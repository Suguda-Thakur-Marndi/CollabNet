import { cn } from "@/lib/utils"
import { FiMic, FiMicOff, FiVolume2, FiVolumeX } from "react-icons/fi"

interface VideoControlsProps {
    isLocal: boolean
    micOn: boolean
    remoteMicStates: Record<string, boolean>
    remoteSpeakerStates: Record<string, boolean>
    speakersOn: boolean
    userId: string
}

export const VideoControls = ({
    isLocal,
    userId,
    micOn,
    speakersOn,
    remoteMicStates,
    remoteSpeakerStates,
}: VideoControlsProps) => {
    const micState = isLocal ? micOn : remoteMicStates[userId]
    const speakerState = isLocal ? speakersOn : remoteSpeakerStates[userId]

    return (
        <div className="absolute top-2 right-2 flex gap-1">
            <div
                className={cn(
                    "rounded px-1.5 py-0.5",
                    micState ? "bg-green-500/70" : "bg-red-500/70",
                )}
            >
                {micState ? (
                    <FiMic className="size-4 text-white" />
                ) : (
                    <FiMicOff className="size-4 text-white" />
                )}
            </div>
            <div
                className={cn(
                    "rounded px-1.5 py-0.5",
                    speakerState ? "bg-green-500/70" : "bg-red-500/70",
                )}
            >
                {speakerState ? (
                    <FiVolume2 className="size-4 text-white" />
                ) : (
                    <FiVolumeX className="size-4 text-white" />
                )}
            </div>
        </div>
    )
}
