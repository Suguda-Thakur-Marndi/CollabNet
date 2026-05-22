import { parseError } from "@/lib/utils"
import type { Dispatch, RefObject, SetStateAction } from "react"
import { isMobile } from "react-device-detect"
import type Peer from "simple-peer"
import toast from "react-hot-toast"

import { cleanupPeer, createPeer } from "./peer"

export const getAudioMedia = async (
    selectedAudioInput: string,
    streamRef: RefObject<MediaStream | null>,
    peersRef: RefObject<Record<string, Peer.Instance>>,
    setRemoteStreams: Dispatch<
        SetStateAction<Record<string, MediaStream | null>>
    >,
    pendingSignalsRef: RefObject<Record<string, Peer.SignalData[]>>,
) => {
    try {
        if (streamRef.current) {
            for (const track of streamRef.current.getTracks()) {
                track.stop()
            }
        }

        const audioConstraints: boolean | MediaTrackConstraints =
            selectedAudioInput
                ? { deviceId: { exact: selectedAudioInput } }
                : true

        const newStream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
        })

        streamRef.current = newStream

        const peerUserIDs = Object.keys(peersRef.current)
        for (const userID of peerUserIDs) {
            cleanupPeer(userID, peersRef, setRemoteStreams)
            createPeer(
                userID,
                true,
                streamRef,
                peersRef,
                setRemoteStreams,
                pendingSignalsRef,
            )
        }

        return true
    } catch (error) {
        toast.error(`Error accessing microphone: ${parseError(error)}`)
        return false
    }
}

export const getMedia = async (
    selectedVideoDevice: string,
    selectedAudioInput: string,
    selectedAudioOutput: string,
    cameraFacingMode: "user" | "environment",
    micOn: boolean,
    streamRef: RefObject<MediaStream | null>,
    videoRef: RefObject<HTMLVideoElement | null>,
    peersRef: RefObject<Record<string, Peer.Instance>>,
    setRemoteStreams: Dispatch<
        SetStateAction<Record<string, MediaStream | null>>
    >,
    pendingSignalsRef: RefObject<Record<string, Peer.SignalData[]>>,
) => {
    try {
        if (streamRef.current) {
            for (const track of streamRef.current.getTracks()) {
                track.stop()
            }
        }

        const videoConstraints: MediaTrackConstraints = isMobile
            ? {
                  facingMode: cameraFacingMode,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  aspectRatio: { ideal: 16 / 9 },
              }
            : {
                  deviceId: selectedVideoDevice
                      ? { exact: selectedVideoDevice }
                      : undefined,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  aspectRatio: { ideal: 16 / 9 },
              }

        const audioConstraints: boolean | MediaTrackConstraints =
            selectedAudioInput
                ? { deviceId: { exact: selectedAudioInput } }
                : true

        const newStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: audioConstraints,
        })

        for (const track of newStream.getAudioTracks()) {
            track.enabled = micOn
        }

        streamRef.current = newStream

        if (videoRef.current) {
            videoRef.current.srcObject = newStream
            if ("setSinkId" in videoRef.current && selectedAudioOutput) {
                try {
                    await (
                        videoRef.current as unknown as {
                            setSinkId: (id: string) => Promise<void>
                        }
                    ).setSinkId(selectedAudioOutput)
                } catch (error) {
                    console.warn("Error setting audio output device:", error)
                }
            }
        }

        const peerUserIDs = Object.keys(peersRef.current)
        for (const userID of peerUserIDs) {
            cleanupPeer(userID, peersRef, setRemoteStreams)
            createPeer(
                userID,
                true,
                streamRef,
                peersRef,
                setRemoteStreams,
                pendingSignalsRef,
            )
        }

        return true
    } catch (error) {
        toast.error(`Error accessing media devices: ${parseError(error)}`)
        return false
    }
}

export const switchVideoDevice = (
    deviceId: string,
    streamRef: RefObject<MediaStream | null>,
    videoRef: RefObject<HTMLVideoElement | null>,
    peersRef: RefObject<Record<string, Peer.Instance>>,
    setRemoteStreams: Dispatch<
        SetStateAction<Record<string, MediaStream | null>>
    >,
    pendingSignalsRef: RefObject<Record<string, Peer.SignalData[]>>,
    micOn: boolean,
    selectedAudioInput: string,
    selectedAudioOutput: string,
    cameraFacingMode: "user" | "environment",
) => {
    return getMedia(
        deviceId,
        selectedAudioInput,
        selectedAudioOutput,
        cameraFacingMode,
        micOn,
        streamRef,
        videoRef,
        peersRef,
        setRemoteStreams,
        pendingSignalsRef,
    )
}

export const switchAudioDevice = (
    deviceId: string,
    streamRef: RefObject<MediaStream | null>,
    videoRef: RefObject<HTMLVideoElement | null>,
    peersRef: RefObject<Record<string, Peer.Instance>>,
    setRemoteStreams: Dispatch<
        SetStateAction<Record<string, MediaStream | null>>
    >,
    pendingSignalsRef: RefObject<Record<string, Peer.SignalData[]>>,
    micOn: boolean,
    selectedVideoDevice: string,
    selectedAudioOutput: string,
    cameraFacingMode: "user" | "environment",
) => {
    return getMedia(
        selectedVideoDevice,
        deviceId,
        selectedAudioOutput,
        cameraFacingMode,
        micOn,
        streamRef,
        videoRef,
        peersRef,
        setRemoteStreams,
        pendingSignalsRef,
    )
}
