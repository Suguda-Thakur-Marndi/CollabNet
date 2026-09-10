import axiosInstance from "@/api/pistonApi"
import { executePistonCode } from "@/api/pistonExecute"
import { PISTON_FALLBACK_LANGUAGES } from "@/constants/pistonFallbackLanguages"
import {
    Language,
    PistonSource,
    RunContext as RunContextType,
} from "@/types/run"
import { matchPistonLanguage } from "@/utils/matchPistonLanguage"
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react"
import toast from "react-hot-toast"
import { useFileSystem } from "./FileContext"
import { useSocket } from "./SocketContext"
import { useAppContext } from "./AppContext"
import { SocketEvent } from "@/types/socket"

const RunCodeContext = createContext<RunContextType | null>(null)

const EMPTY_LANGUAGE: Language = { language: "", version: "", aliases: [] }

export const useRunCode = () => {
    const context = useContext(RunCodeContext)
    if (context === null) {
        throw new Error(
            "useRunCode must be used within a RunCodeContextProvider",
        )
    }
    return context
}

const RunCodeContextProvider = ({ children }: { children: ReactNode }) => {
    const { activeFile } = useFileSystem()
    const { socket } = useSocket()
    const { setIsTerminalOpen } = useAppContext()
    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [languagesLoading, setLanguagesLoading] = useState(true)
    const [pistonSource, setPistonSource] = useState<PistonSource>("loading")
    const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([])
    const [selectedLanguage, setSelectedLanguage] =
        useState<Language>(EMPTY_LANGUAGE)

    const refreshLanguages = useCallback(async () => {
        setLanguagesLoading(true)
        setPistonSource("loading")
        try {
            const { data } = await axiosInstance.get<Language[]>("/runtimes")
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error("Empty runtimes list")
            }
            setSupportedLanguages(data)
            setPistonSource("online")
        } catch (error) {
            console.error("Piston runtimes fetch failed:", error)
            setSupportedLanguages(PISTON_FALLBACK_LANGUAGES)
            setPistonSource("fallback")
            toast.error(
                "Could not load full language list. Using common languages — run may fail until you are online.",
                { duration: 5000 },
            )
        } finally {
            setLanguagesLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshLanguages()
    }, [refreshLanguages])

    useEffect(() => {
        if (supportedLanguages.length === 0 || !activeFile?.name) return

        const matched = matchPistonLanguage(
            supportedLanguages,
            activeFile.name,
        )
        if (matched) {
            setSelectedLanguage(matched)
        }
    }, [activeFile?.name, supportedLanguages])

    const runCode = async () => {
        if (!activeFile) {
            toast.error("Open a file in the editor first")
            return
        }

        // 1. Immediately pop open the bottom terminal drawer
        setIsTerminalOpen(true)

        const toastId = toast.loading(`Running ${activeFile.name}...`)
        setIsRunning(true)
        setOutput("")

        // 2. Stream execution directly to the collaborative terminal (EC2 worker or local sandbox)
        if (socket.connected) {
            socket.emit(SocketEvent.CODE_EXECUTE, {
                fileName: activeFile.name,
                content: activeFile.content ?? "",
                language: selectedLanguage?.language || "javascript",
                stdin: input,
            })
        }

        // 3. Also execute via Piston fallback if available for Output tab
        try {
            if (selectedLanguage.language) {
                const response = await executePistonCode({
                    language: selectedLanguage.language,
                    version: selectedLanguage.version,
                    files: [
                        { name: activeFile.name, content: activeFile.content ?? "" },
                    ],
                    stdin: input,
                })

                const run = response.data?.run
                if (run?.stderr) {
                    setOutput(run.stderr)
                } else {
                    setOutput(run?.stdout ?? "(Execution output streamed to terminal)")
                }
            } else {
                setOutput(`Running ${activeFile.name} in interactive terminal...`)
            }
        } catch {
            setOutput(`Execution active in interactive terminal. See Terminal tab below.`)
        } finally {
            setIsRunning(false)
            toast.dismiss(toastId)
            toast.success(`Executed ${activeFile.name}`)
        }
    }

    return (
        <RunCodeContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                languagesLoading,
                pistonSource,
                supportedLanguages,
                selectedLanguage,
                setSelectedLanguage,
                runCode,
                refreshLanguages,
            }}
        >
            {children}
        </RunCodeContext.Provider>
    )
}

export { RunCodeContextProvider }
export default RunCodeContext
