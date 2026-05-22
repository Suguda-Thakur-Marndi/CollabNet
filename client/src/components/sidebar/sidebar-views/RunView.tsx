import { useRunCode } from "@/context/RunCodeContext"
import useResponsive from "@/hooks/useResponsive"
import { Language } from "@/types/run"
import { ChangeEvent } from "react"
import toast from "react-hot-toast"
import { LuCopy, LuPlay, LuRefreshCw } from "react-icons/lu"

function RunView() {
    const { viewHeight } = useResponsive()
    const {
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
    } = useRunCode()

    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        if (!value) return
        setSelectedLanguage(JSON.parse(value) as Language)
    }

    const copyOutput = async () => {
        if (!output) return
        try {
            await navigator.clipboard.writeText(output)
            toast.success("Output copied")
        } catch {
            toast.error("Could not copy output")
        }
    }

    const sortedLanguages = [...supportedLanguages].sort((a, b) =>
        a.language.localeCompare(b.language),
    )

    return (
        <div
            className="flex flex-col gap-3 p-4"
            style={{ height: viewHeight }}
        >
            <div className="flex items-center justify-between gap-2">
                <h1 className="view-title mb-0 border-0 pb-0">Run Code</h1>
                <button
                    type="button"
                    onClick={() => refreshLanguages()}
                    disabled={languagesLoading}
                    className="btn-ghost shrink-0 p-2"
                    title="Refresh languages"
                >
                    <LuRefreshCw
                        size={18}
                        className={languagesLoading ? "animate-spin" : ""}
                    />
                </button>
            </div>

            {pistonSource === "online" && (
                <p className="text-xs text-emerald-400/90">
                    Languages loaded. To execute code, use local Docker (
                    <code className="text-[11px]">docker compose up -d</code>
                    ) or set <code className="text-[11px]">VITE_PISTON_API_URL</code>.
                </p>
            )}
            {pistonSource === "fallback" && (
                <p className="text-xs text-amber-400/90">
                    Limited language list — connect to the internet and refresh
                    for all runtimes.
                </p>
            )}

            <div className="flex min-h-0 flex-1 flex-col gap-3">
                <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                    Language
                    <select
                        className="input-field w-full pr-10"
                        value={
                            selectedLanguage.language
                                ? JSON.stringify(selectedLanguage)
                                : ""
                        }
                        onChange={handleLanguageChange}
                        disabled={languagesLoading || sortedLanguages.length === 0}
                    >
                        {languagesLoading ? (
                            <option value="">Loading languages…</option>
                        ) : (
                            <>
                                {!selectedLanguage.language && (
                                    <option value="">
                                        Select a language
                                    </option>
                                )}
                                {sortedLanguages.map((lang) => (
                                    <option
                                        key={`${lang.language}-${lang.version}`}
                                        value={JSON.stringify(lang)}
                                    >
                                        {lang.language}
                                        {lang.version ? ` (${lang.version})` : ""}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </label>

                <label className="flex min-h-[80px] flex-col gap-1.5 text-sm text-slate-300">
                    Program input (stdin)
                    <textarea
                        className="input-field min-h-[80px] resize-y"
                        placeholder="Optional input for your program…"
                        onChange={(e) => setInput(e.target.value)}
                    />
                </label>

                <button
                    type="button"
                    className="btn-primary flex w-full items-center justify-center gap-2"
                    onClick={runCode}
                    disabled={isRunning || languagesLoading}
                >
                    <LuPlay size={18} />
                    {isRunning ? "Running…" : "Run"}
                </button>

                <div className="flex min-h-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>Output</span>
                        <button
                            type="button"
                            onClick={copyOutput}
                            disabled={!output}
                            className="btn-ghost p-1.5 disabled:opacity-40"
                            title="Copy output"
                        >
                            <LuCopy size={16} />
                        </button>
                    </div>
                    <div className="output-panel min-h-[120px] flex-1 overflow-y-auto">
                        <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-200">
                            {output ||
                                (isRunning
                                    ? "Running…"
                                    : "Output will appear here after you run code.")}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RunView
