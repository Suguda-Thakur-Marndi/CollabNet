import { ICopilotContext } from "@/types/copilot"
import { createContext, ReactNode, useContext, useState, useCallback } from "react"
import toast from "react-hot-toast"
import { streamCopilot } from "../api/aiApi"

const CopilotContext = createContext<ICopilotContext | null>(null)

export const useCopilot = () => {
    const context = useContext(CopilotContext)
    if (context === null) {
        throw new Error("useCopilot must be used within a CopilotContextProvider")
    }
    return context
}

const CopilotContextProvider = ({ children }: { children: ReactNode }) => {
    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState<boolean>(false)

    const generateCode = useCallback(async () => {
        if (input.trim().length === 0) {
            toast.error("Please write a prompt")
            return
        }

        const toastId = toast.loading("Generating code with Gemini...")
        setIsRunning(true)
        setOutput("") // Clear previous output immediately

        let accumulated = ""

        await streamCopilot({
            prompt: input,
            onChunk: (text) => {
                accumulated += text
                setOutput(accumulated)
            },
            onDone: () => {
                setIsRunning(false)
                toast.dismiss(toastId)
                toast.success("Code generated successfully")
            },
            onError: (message) => {
                setIsRunning(false)
                toast.dismiss(toastId)
                console.error("[Copilot] Error:", message)

                if (message.includes("AUTH_REQUIRED") || message.includes("Not authenticated")) {
                    toast.error("Please sign in to use the AI Copilot")
                } else if (message.includes("RATE_LIMITED")) {
                    toast.error("Rate limit reached. Please wait a moment before trying again.")
                } else if (message.includes("GEMINI_API_KEY")) {
                    toast.error("AI service is not configured on this server")
                } else {
                    toast.error(`AI error: ${message}`)
                }
            },
        })
    }, [input])

    return (
        <CopilotContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                generateCode,
            }}
        >
            {children}
        </CopilotContext.Provider>
    )
}

export { CopilotContextProvider }
export default CopilotContext
