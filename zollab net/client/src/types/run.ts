interface Language {
    language: string
    version: string
    aliases: string[]
}

type PistonSource = "online" | "fallback" | "loading"

interface RunContext {
    setInput: (input: string) => void
    output: string
    isRunning: boolean
    languagesLoading: boolean
    pistonSource: PistonSource
    supportedLanguages: Language[]
    selectedLanguage: Language
    setSelectedLanguage: (language: Language) => void
    runCode: () => void
    refreshLanguages: () => Promise<void>
}

export { Language, PistonSource, RunContext }
