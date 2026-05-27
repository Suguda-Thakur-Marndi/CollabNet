import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { isMobile } from "react-device-detect"
import { useMemo, useState } from "react"
import {
    FiMic,
    FiMicOff,
    FiRefreshCw,
    FiVideo,
    FiVideoOff,
    FiVolume2,
    FiVolumeX,
} from "react-icons/fi"
import { tooltipStyles } from "@/components/sidebar/tooltipStyles"
import { Tooltip } from "react-tooltip"

import { DeviceControls } from "./components/device-controls"
import { VideoGrid } from "./components/video-grid"
import { useMediaDevices } from "./hooks/useMediaDevices"
import { usePeerConnections } from "./hooks/usePeerConnections"
import { useSocketEvents } from "./hooks/useSocketEvents"
import { useWebcamStream } from "./hooks/useWebcamStream"
import type { StreamUser } from "./types"

const WebcamStream = () => {
    const { users } = useAppContext()
    const { socket } = useSocket()
    const [micOn, setMicOn] = useState(false)

    const streamUsers: StreamUser[] = useMemo(
        () =>
            users.map((u) => ({
                id: u.socketId,
                username: u.username,
            })),
        [users],
    )

    const socketId = socket.id ?? ""

    const allUsers: StreamUser[] = useMemo(() => {
        const self: StreamUser = {
            id: socketId,
            username:
                users.find((u) => u.socketId === socketId)?.username ?? "You",
        }
        const others = streamUsers.filter((u) => u.id !== socketId)
        return [self, ...others]
    }, [socketId, streamUsers, users])

    const {
        videoDevices,
        audioInputDevices,
        audioOutputDevices,
        selectedVideoDevice,
        selectedAudioInput,
        selectedAudioOutput,
        setSelectedVideoDevice,
        setSelectedAudioInput,
        handleDevicePermission,
        handleAudioOutputSelect,
    } = useMediaDevices()

    const {
        remoteStreams,
        remoteMicStates,
        remoteSpeakerStates,
        peersRef,
        pendingSignalsRef,
        setRemoteStreams,
        setRemoteMicStates,
        setRemoteSpeakerStates,
    } = usePeerConnections()

    const {
        cameraOn,
        speakerOn,
        videoRef,
        streamRef,
        handleToggleCamera,
        handleToggleMic,
        handleToggleSpeaker,
        handleRotateCamera,
        handleVideoDeviceSwitch,
        handleAudioDeviceSwitch,
    } = useWebcamStream({
        selectedVideoDevice,
        selectedAudioInput,
        selectedAudioOutput,
        micOn,
        setMicOn,
    })

    useSocketEvents({
        speakerOn,
        streamRef,
        peersRef,
        pendingSignalsRef,
        setRemoteStreams,
        setRemoteMicStates,
        setRemoteSpeakerStates,
    })

    return (
        <div className="webcam-stream">
            <VideoGrid
                cameraOn={cameraOn}
                micOn={micOn}
                remoteMicStates={remoteMicStates}
                remoteSpeakerStates={remoteSpeakerStates}
                remoteStreams={remoteStreams}
                speakerOn={speakerOn}
                users={allUsers}
                videoRef={videoRef}
                streamRef={streamRef}
            />

            <div className="webcam-stream__controls">
                <div className="flex items-center gap-2">
                    <DeviceControls
                        devices={videoDevices}
                        icon={cameraOn ? FiVideo : FiVideoOff}
                        isEnabled={cameraOn}
                        label="camera"
                        onDevicePermissionGranted={handleDevicePermission}
                        onDeviceSelect={(deviceId) =>
                            handleVideoDeviceSwitch(
                                deviceId,
                                peersRef,
                                setRemoteStreams,
                                pendingSignalsRef,
                                setSelectedVideoDevice,
                            )
                        }
                        onToggle={() =>
                            handleToggleCamera(
                                peersRef,
                                setRemoteStreams,
                                pendingSignalsRef,
                            )
                        }
                        selectedDevice={selectedVideoDevice}
                    />

                    {isMobile && cameraOn && (
                        <button
                            type="button"
                            aria-label="Rotate camera"
                            data-tooltip-id="rotate-camera"
                            data-tooltip-content="Rotate camera"
                            className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-slate-200 transition-colors hover:bg-white/20"
                            onClick={() =>
                                handleRotateCamera(
                                    peersRef,
                                    setRemoteStreams,
                                    pendingSignalsRef,
                                )
                            }
                        >
                            <FiRefreshCw className="size-5" />
                        </button>
                    )}
                </div>

                <DeviceControls
                    devices={audioInputDevices}
                    icon={micOn ? FiMic : FiMicOff}
                    isEnabled={micOn}
                    label="microphone"
                    onDevicePermissionGranted={handleDevicePermission}
                    onDeviceSelect={(deviceId) =>
                        handleAudioDeviceSwitch(
                            deviceId,
                            peersRef,
                            setRemoteStreams,
                            pendingSignalsRef,
                            setSelectedAudioInput,
                        )
                    }
                    onToggle={() =>
                        handleToggleMic(
                            peersRef,
                            setRemoteStreams,
                            pendingSignalsRef,
                        )
                    }
                    selectedDevice={selectedAudioInput}
                />

                <DeviceControls
                    devices={audioOutputDevices}
                    icon={speakerOn ? FiVolume2 : FiVolumeX}
                    isEnabled={speakerOn}
                    label="speaker"
                    onDevicePermissionGranted={handleDevicePermission}
                    onDeviceSelect={(deviceId) =>
                        handleAudioOutputSelect(deviceId, videoRef)
                    }
                    onToggle={() => handleToggleSpeaker(!speakerOn)}
                    selectedDevice={selectedAudioOutput}
                />
            </div>

            <Tooltip
                id="rotate-camera"
                place="top"
                className="!z-[100]"
                style={tooltipStyles}
            />
        </div>
    )
}

export { WebcamStream }
