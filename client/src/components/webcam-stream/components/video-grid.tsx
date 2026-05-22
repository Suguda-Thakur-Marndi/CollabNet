import { getSocket } from "@/lib/socket"
import type { RefObject } from "react"
import Avatar from "react-avatar"

import type { StreamUser } from "../types"
import { VideoControls } from "./video-controls"

interface VideoGridProps {
    cameraOn: boolean
    micOn: boolean
    remoteMicStates: Record<string, boolean>
    remoteSpeakerStates: Record<string, boolean>
    remoteStreams: Record<string, MediaStream | null>
    speakerOn: boolean
    users: StreamUser[]
    videoRef: RefObject<HTMLVideoElement | null>
}

export const VideoGrid = ({
    users,
    cameraOn,
    micOn,
    speakerOn,
    videoRef,
    remoteStreams,
    remoteMicStates,
    remoteSpeakerStates,
}: VideoGridProps) => {
    const currentUserId = getSocket().id ?? ""
    const currentUsername =
        users.find((u) => u.id === currentUserId)?.username ?? "You"
    const remoteUsers = users.filter(
        (user) => user.id && user.id !== currentUserId,
    )

    return (
        <div
            className="webcam-stream__grid grid auto-rows-[1fr] gap-2"
            style={{
                gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            }}
        >
            <div className="relative">
                <div className="webcam-tile">
                    <video
                        autoPlay
                        className="size-full scale-x-[-1] object-cover"
                        muted
                        playsInline
                        ref={videoRef}
                    />
                    {!cameraOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Avatar
                                name={currentUsername}
                                size="72"
                                round="12px"
                            />
                        </div>
                    )}
                    <VideoControls
                        isLocal={true}
                        micOn={micOn}
                        remoteMicStates={remoteMicStates}
                        remoteSpeakerStates={remoteSpeakerStates}
                        speakersOn={speakerOn}
                        userId={currentUserId}
                    />
                    <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded bg-black/50 px-2 py-1 text-sm text-white">
                        {currentUsername} (you)
                    </div>
                </div>
            </div>

            {remoteUsers.length === 0 ? (
                <div className="webcam-empty-hint col-span-full min-h-[100px] rounded-lg border border-dashed border-border bg-darkHover/30">
                    <span>
                        No one else in the call yet.
                        <br />
                        Share the room link so others can join.
                    </span>
                </div>
            ) : (
                remoteUsers.map((user) => (
                    <div className="relative" key={user.id}>
                        <div className="webcam-tile">
                            {remoteStreams[user.id] ? (
                                <video
                                    autoPlay
                                    className="size-full scale-x-[-1] object-cover"
                                    muted={!speakerOn}
                                    playsInline
                                    ref={(element) => {
                                        if (element) {
                                            element.srcObject =
                                                remoteStreams[user.id]
                                        }
                                    }}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <Avatar
                                        name={user.username}
                                        size="72"
                                        round="12px"
                                    />
                                </div>
                            )}
                            <VideoControls
                                isLocal={false}
                                micOn={micOn}
                                remoteMicStates={remoteMicStates}
                                remoteSpeakerStates={remoteSpeakerStates}
                                speakersOn={speakerOn}
                                userId={user.id}
                            />
                            <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded bg-black/50 px-2 py-1 text-sm text-white">
                                {user.username}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
