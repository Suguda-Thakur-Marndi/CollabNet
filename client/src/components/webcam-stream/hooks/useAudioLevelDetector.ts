import { useEffect, useRef, useState } from "react"

interface AudioLevelDetectorProps {
    mediaStream: MediaStream | null
    userId: string
}

export const useAudioLevelDetector = ({
    mediaStream,
    userId,
}: AudioLevelDetectorProps) => {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const animationFrameRef = useRef<number | null>(null)

    useEffect(() => {
        if (!mediaStream) {
            setIsSpeaking(false)
            return
        }

        try {
            // Initialize audio context
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext ||
                    (window as any).webkitAudioContext)()
            }

            const audioContext = audioContextRef.current
            const audioTracks = mediaStream.getAudioTracks()

            if (audioTracks.length === 0) {
                setIsSpeaking(false)
                return
            }

            // Create source from media stream
            if (!sourceRef.current) {
                sourceRef.current = audioContext.createMediaStreamSource(
                    mediaStream,
                )
            }

            // Create analyser node
            if (!analyserRef.current) {
                analyserRef.current = audioContext.createAnalyser()
                analyserRef.current.fftSize = 256
                sourceRef.current.connect(analyserRef.current)
            }

            const analyser = analyserRef.current
            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)

            // Detect audio levels
            const detectAudio = () => {
                analyser.getByteFrequencyData(dataArray)

                // Calculate average volume
                const average = dataArray.reduce((a, b) => a + b) / bufferLength

                // Threshold for speaking detection (adjust as needed)
                const SPEAKING_THRESHOLD = 30
                setIsSpeaking(average > SPEAKING_THRESHOLD)

                animationFrameRef.current = requestAnimationFrame(detectAudio)
            }

            detectAudio()

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current)
                }
            }
        } catch (error) {
            console.error("Error setting up audio level detector:", error)
            setIsSpeaking(false)
        }
    }, [mediaStream, userId])

    return isSpeaking
}
