import { getSocket } from "@/lib/socket"
import { parseError } from "@/lib/utils"
import { SocketEvent } from "@/types/socket"
import type { Dispatch, RefObject, SetStateAction } from "react"
import { isMobile } from "react-device-detect"
import type Peer from "simple-peer"
import toast from "react-hot-toast"

const removeTracksFromPeers = (
    stream: MediaStream,
    peersRef: RefObject<Record<string, Peer.Instance>>,
) => {
    const tracks = stream.getTracks()
    for (const peer of Object.values(peersRef.current)) {
        if (peer.destroyed) continue
        for (const track of tracks) {
            try {
                peer.removeTrack(track, stream)
            } catch {
                // track may not exist on this peer
            }
        }
    }
}

const stopLocalStream = (
    streamRef: RefObject<MediaStream | null>,
    videoRef: RefObject<HTMLVideoElement | null>,
) => {
    if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
            track.stop()
        }
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null
    }
    streamRef.current = null
}

export const toggleCamera = async (
    cameraOn: boolean,
    setCameraOn: Dispatch<SetStateAction<boolean>>,
    setMicOn: Dispatch<SetStateAction<boolean>>,
    streamRef: RefObject<MediaStream | null>,
    videoRef: RefObject<HTMLVideoElement | null>,
    peersRef: RefObject<Record<string, Peer.Instance>>,
    getMedia: () => Promise<boolean>,
) => {
    const socket = getSocket()

    try {
        if (cameraOn) {
            if (streamRef.current) {
                removeTracksFromPeers(streamRef.current, peersRef)
            }
            stopLocalStream(streamRef, videoRef)
            socket.emit(SocketEvent.CAMERA_OFF)
            setCameraOn(false)
            setMicOn(false)
        } else {
            const mediaStarted = await getMedia()
            if (mediaStarted) {
                setCameraOn(true)
            }
        }
    } catch (error) {
        toast.error(`Error toggling camera: ${parseError(error)}`)
    }
}

export const rotateCamera = async (
    cameraOn: boolean,
    cameraFacingMode: string,
    setCameraFacingMode: Dispatch<SetStateAction<"user" | "environment">>,
    streamRef: RefObject<MediaStream | null>,
    getMedia: () => Promise<boolean>,
) => {
    if (!isMobile) return

    const newFacingMode = cameraFacingMode === "user" ? "environment" : "user"
    setCameraFacingMode(newFacingMode)

    if (cameraOn) {
        if (streamRef.current) {
            for (const track of streamRef.current.getTracks()) {
                track.stop()
            }
        }
        await getMedia()
    }
}

export const toggleMic = (
    micOn: boolean,
    setMicOn: Dispatch<SetStateAction<boolean>>,
    streamRef: RefObject<MediaStream | null>,
) => {
    const socket = getSocket()

    try {
        if (!streamRef.current) {
            toast.error("No active media stream")
            return
        }

        const audioTracks = streamRef.current.getAudioTracks()
        if (audioTracks.length === 0) {
            toast.error("No audio track found")
            return
        }

        const newMicState = !micOn
        for (const track of audioTracks) {
            track.enabled = newMicState
        }

        setMicOn(newMicState)
        socket.emit(SocketEvent.MIC_STATE, newMicState)
    } catch (error) {
        toast.error(`Error toggling microphone: ${parseError(error)}`)
    }
}
