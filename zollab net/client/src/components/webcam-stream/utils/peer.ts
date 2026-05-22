import { getSocket } from "@/lib/socket"
import { parseError } from "@/lib/utils"
import { SocketEvent } from "@/types/socket"
import type { Dispatch, RefObject, SetStateAction } from "react"
import Peer from "simple-peer"
import toast from "react-hot-toast"

export const createPeer = (
    userID: string,
    initiator: boolean,
    streamRef: RefObject<MediaStream | null>,
    peersRef: RefObject<Record<string, Peer.Instance>>,
    setRemoteStreams: Dispatch<
        SetStateAction<Record<string, MediaStream | null>>
    >,
    pendingSignalsRef: RefObject<Record<string, Peer.SignalData[]>>,
) => {
    const socket = getSocket()
    try {
        cleanupPeer(userID, peersRef, setRemoteStreams)

        // Smaller socket id initiates to avoid both sides sending offers (glare).
        const shouldInitiate = Boolean(
            initiator && socket.id && userID > socket.id,
        )

        const peer = new Peer({
            initiator: shouldInitiate,
            stream: streamRef.current?.getTracks().length
                ? streamRef.current
                : undefined,
        })

        peer.on("signal", (signal) => {
            socket.emit(SocketEvent.WEBRTC_SIGNAL, {
                signal,
                targetUserID: userID,
            })
        })

        peer.on("stream", (stream) => {
            setRemoteStreams((prev) => ({
                ...prev,
                [userID]: stream,
            }))
        })

        peer.on("error", (err) => {
            console.warn(`Peer connection error:\n${parseError(err)}`)
            cleanupPeer(userID, peersRef, setRemoteStreams)
        })

        peersRef.current[userID] = peer

        const pendingSignals = pendingSignalsRef.current[userID] || []
        for (const signal of pendingSignals) {
            try {
                peer.signal(signal)
            } catch (error) {
                console.warn(
                    `Error processing pending signal for ${userID}:\n${error}`,
                )
            }
        }
        delete pendingSignalsRef.current[userID]

        return peer
    } catch (error) {
        toast.error(`Error creating peer connection: ${parseError(error)}`)
        return null
    }
}

export const handleSignal = (
    signal: Peer.SignalData,
    userID: string,
    streamRef: RefObject<MediaStream | null>,
    peersRef: RefObject<Record<string, Peer.Instance>>,
    setRemoteStreams: Dispatch<
        SetStateAction<Record<string, MediaStream | null>>
    >,
    pendingSignalsRef: RefObject<Record<string, Peer.SignalData[]>>,
) => {
    try {
        const existingPeer = peersRef.current[userID]

        if (
            existingPeer &&
            !existingPeer.destroyed &&
            (signal as { type?: string }).type === "offer"
        ) {
            cleanupPeer(userID, peersRef, setRemoteStreams)
        }

        const peer = peersRef.current[userID]

        if (!peer || peer.destroyed) {
            if (!pendingSignalsRef.current[userID]) {
                pendingSignalsRef.current[userID] = []
            }
            pendingSignalsRef.current[userID].push(signal)

            createPeer(
                userID,
                false,
                streamRef,
                peersRef,
                setRemoteStreams,
                pendingSignalsRef,
            )
            return
        }

        peer.signal(signal)
    } catch (error) {
        console.error(`Error handling peer signal:\n${parseError(error)}`)
    }
}

export const cleanupPeer = (
    userID: string,
    peersRef: RefObject<Record<string, Peer.Instance>>,
    setRemoteStreams: Dispatch<SetStateAction<Record<string, MediaStream | null>>>,
) => {
    const peer = peersRef.current[userID]
    if (peer) {
        if (!peer.destroyed) {
            try {
                peer.destroy()
            } catch (error) {
                console.warn(
                    `Error destroying peer connection for ${userID}.\n${error}`,
                )
            }
        }
        delete peersRef.current[userID]
    }

    setRemoteStreams((prev) => {
        const newStreams = { ...prev }
        delete newStreams[userID]
        return newStreams
    })
}
