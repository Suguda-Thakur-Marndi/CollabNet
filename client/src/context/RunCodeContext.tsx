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
        if (!selectedLanguage.language) {
            toast.error("Select a language to run your code")
            return
        }
        if (!activeFile) {
            toast.error("Open a file in the editor first")
            return
        }

        const toastId = toast.loading("Running code...")
        setIsRunning(true)
        setOutput("")

        try {
            const { language, version } = selectedLanguage
            const response = await executePistonCode({
                language,
                version,
                files: [
                    { name: activeFile.name, content: activeFile.content ?? "" },
                ],
                stdin: input,
            })

            const run = response.data?.run
            if (run?.stderr) {
                setOutput(run.stderr)
            } else {
                setOutput(run?.stdout ?? "(no output)")
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to run code. Check your language selection and try again."
            setOutput(message)
            toast.error(message, { duration: 6000 })
        } finally {
            setIsRunning(false)
            toast.dismiss(toastId)
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
