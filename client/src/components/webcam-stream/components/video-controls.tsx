import { cn } from "@/lib/utils"
import { FiMic, FiMicOff, FiVolume2, FiVolumeX } from "react-icons/fi"

interface VideoControlsProps {
    isLocal: boolean
    micOn: boolean
    remoteMicStates: Record<string, boolean>
    remoteSpeakerStates: Record<string, boolean>
    speakersOn: boolean
    userId: string
    isSpeaking?: boolean
}

export const VideoControls = ({
    isLocal,
    userId,
    micOn,
    speakersOn,
    remoteMicStates,
    remoteSpeakerStates,
    isSpeaking = false,
}: VideoControlsProps) => {
    const micState = isLocal ? micOn : remoteMicStates[userId]
    const speakerState = isLocal ? speakersOn : remoteSpeakerStates[userId]

    return (
        <div className="absolute top-2 right-2 flex gap-1">
            <div
                className={cn(
                    "rounded px-1.5 py-0.5 transition-all",
                    micState ? "bg-green-500/70" : "bg-red-500/70",
                    isSpeaking && "animate-speaking"
                )}
                title={micState ? "Microphone on" : "Microphone off"}
                role="status"
                aria-label={micState ? "Microphone on" : "Microphone off"}
            >
                {micState ? (
                    <FiMic className="size-4 text-white" />
                ) : (
                    <FiMicOff className="size-4 text-white" />
                )}
            </div>
            <div
                className={cn(
                    "rounded px-1.5 py-0.5 transition-all",
                    speakerState ? "bg-green-500/70" : "bg-red-500/70",
                )}
                title={speakerState ? "Speaker on" : "Speaker off"}
                role="status"
                aria-label={speakerState ? "Speaker on" : "Speaker off"}
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
