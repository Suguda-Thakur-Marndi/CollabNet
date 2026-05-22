import { useAppContext } from "@/context/AppContext"
import { getSocket } from "@/lib/socket"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { useEffect, useRef } from "react"
import type Peer from "simple-peer"

import { cleanupPeer, createPeer, handleSignal } from "../utils/peer"

interface UseSocketEventsProps {
    peersRef: React.RefObject<Record<string, Peer.Instance>>
    pendingSignalsRef: React.RefObject<Record<string, Peer.SignalData[]>>
    setRemoteMicStates: React.Dispatch<
        React.SetStateAction<Record<string, boolean>>
    >
    setRemoteSpeakerStates: React.Dispatch<
        React.SetStateAction<Record<string, boolean>>
    >
    setRemoteStreams: React.Dispatch<
        React.SetStateAction<Record<string, MediaStream | null>>
    >
    speakerOn: boolean
    streamRef: React.RefObject<MediaStream | null>
}

export const useSocketEvents = ({
    speakerOn,
    streamRef,
    peersRef,
    pendingSignalsRef,
    setRemoteStreams,
    setRemoteMicStates,
    setRemoteSpeakerStates,
}: UseSocketEventsProps) => {
    const socket = getSocket()
    const { status } = useAppContext()
    const speakerOnRef = useRef(speakerOn)
    speakerOnRef.current = speakerOn

    const announceStreamReady = () => {
        if (status !== USER_STATUS.JOINED || !socket.connected) return
        socket.emit(SocketEvent.STREAM_READY)
        socket.emit(SocketEvent.SPEAKER_STATE, speakerOnRef.current)
    }

    useEffect(() => {
        if (status !== USER_STATUS.JOINED) return

        announceStreamReady()

        const onUserReady = (userID: string) => {
            if (!userID || userID === socket.id) return
            createPeer(
                userID,
                true,
                streamRef,
                peersRef,
                setRemoteStreams,
                pendingSignalsRef,
            )
            socket.emit(SocketEvent.SPEAKER_STATE, speakerOnRef.current)
        }

        socket.on(SocketEvent.USER_READY, onUserReady)

        socket.on(
            SocketEvent.WEBRTC_SIGNAL,
            ({
                userID,
                signal,
            }: {
                userID: string
                signal: Peer.SignalData
            }) => {
                handleSignal(
                    signal,
                    userID,
                    streamRef,
                    peersRef,
                    setRemoteStreams,
                    pendingSignalsRef,
                )
            },
        )

        socket.on(
            SocketEvent.MIC_STATE,
            ({ userID, micOn }: { userID: string; micOn: boolean }) => {
                setRemoteMicStates((prev) => ({ ...prev, [userID]: micOn }))
            },
        )

        socket.on(
            SocketEvent.SPEAKER_STATE,
            ({
                userID,
                speakersOn,
            }: {
                userID: string
                speakersOn: boolean
            }) => {
                setRemoteSpeakerStates((prev) => ({
                    ...prev,
                    [userID]: speakersOn,
                }))
            },
        )

        socket.on(SocketEvent.CAMERA_OFF, (userID: string) => {
            if (userID !== socket.id) {
                setRemoteStreams((prev) => {
                    const newStreams = { ...prev }
                    delete newStreams[userID]
                    return newStreams
                })
            }
        })

        socket.on(SocketEvent.USER_JOINED, () => {
            // Tell the new joiner we are already in the call (if panel is open)
            announceStreamReady()
        })

        socket.on(
            SocketEvent.USER_DISCONNECTED,
            ({ user }: { user: { socketId: string } }) => {
                cleanupPeer(user.socketId, peersRef, setRemoteStreams)
                setRemoteMicStates((prev) => {
                    const newStates = { ...prev }
                    delete newStates[user.socketId]
                    return newStates
                })
                setRemoteSpeakerStates((prev) => {
                    const newStates = { ...prev }
                    delete newStates[user.socketId]
                    return newStates
                })
            },
        )

        const onReconnect = () => {
            announceStreamReady()
        }
        socket.io.on("reconnect", onReconnect)

        return () => {
            if (streamRef.current) {
                for (const track of streamRef.current.getTracks()) {
                    track.stop()
                }
            }

            for (const userID of Object.keys(peersRef.current)) {
                cleanupPeer(userID, peersRef, setRemoteStreams)
            }

            socket.emit(SocketEvent.CAMERA_OFF)

            socket.off(SocketEvent.USER_READY, onUserReady)
            socket.off(SocketEvent.WEBRTC_SIGNAL)
            socket.off(SocketEvent.MIC_STATE)
            socket.off(SocketEvent.SPEAKER_STATE)
            socket.off(SocketEvent.CAMERA_OFF)
            socket.off(SocketEvent.USER_JOINED)
            socket.off(SocketEvent.USER_DISCONNECTED)
            socket.io.off("reconnect", onReconnect)
        }
    }, [status])

    useEffect(() => {
        if (status !== USER_STATUS.JOINED) return
        socket.emit(SocketEvent.SPEAKER_STATE, speakerOn)
    }, [speakerOn, socket, status])
}
