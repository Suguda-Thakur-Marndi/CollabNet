import { useRunCode } from "@/context/RunCodeContext"
import useResponsive from "@/hooks/useResponsive"
import { Language } from "@/types/run"
import { ChangeEvent } from "react"
import toast from "react-hot-toast"
import { LuCopy, LuPlay, LuRefreshCw, LuTerminal } from "react-icons/lu"

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
            className="flex h-full flex-col gap-3 p-3 overflow-y-auto select-none"
            style={{ height: viewHeight }}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono">
                    Execute Code
                </span>
                <button
                    type="button"
                    onClick={() => refreshLanguages()}
                    disabled={languagesLoading}
                    className="btn-ghost p-1 text-muted hover:text-white"
                    title="Refresh runtimes"
                >
                    <LuRefreshCw
                        size={14}
                        className={languagesLoading ? "animate-spin" : ""}
                    />
                </button>
            </div>

            {/* Source indicator */}
            {pistonSource === "online" && (
                <div className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 text-[11px] text-emerald-400">
                    Piston runtimes loaded. Ready to execute code.
                </div>
            )}
            {pistonSource === "fallback" && (
                <div className="rounded bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-[11px] text-amber-300">
                    Offline fallback runtimes active.
                </div>
            )}

            {/* Language Selector */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-slate-400">
                    Runtime Language
                </label>
                <select
                    className="input-field py-1.5 px-2.5 text-xs font-mono"
                    value={
                        selectedLanguage.language
                            ? JSON.stringify(selectedLanguage)
                            : ""
                    }
                    onChange={handleLanguageChange}
                    disabled={languagesLoading || sortedLanguages.length === 0}
                >
                    {languagesLoading ? (
                        <option value="">Loading runtimes...</option>
                    ) : (
                        <>
                            {!selectedLanguage.language && (
                                <option value="">Select language runtime</option>
                            )}
                            {sortedLanguages.map((lang) => (
                                <option
                                    key={`${lang.language}-${lang.version}`}
                                    value={JSON.stringify(lang)}
                                >
                                    {lang.language} {lang.version ? `(${lang.version})` : ""}
                                </option>
                            ))}
                        </>
                    )}
                </select>
            </div>

            {/* Stdin input */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-slate-400">
                    Program Input (stdin)
                </label>
                <textarea
                    className="input-field min-h-[65px] resize-y py-1.5 px-2.5 font-mono text-xs text-slate-200"
                    placeholder="Optional stdin for your program..."
                    onChange={(e) => setInput(e.target.value)}
                />
            </div>

            {/* Run button */}
            <button
                type="button"
                className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-xs"
                onClick={runCode}
                disabled={isRunning || languagesLoading}
            >
                {isRunning ? (
                    <>
                        <div className="spinner-small" />
                        <span>Executing...</span>
                    </>
                ) : (
                    <>
                        <LuPlay size={14} />
                        <span>Run Code</span>
                    </>
                )}
            </button>

            {/* Output view */}
            <div className="flex min-h-[140px] flex-1 flex-col gap-1.5 overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                        <LuTerminal size={12} />
                        <span>Execution Output</span>
                    </div>
                    {output && (
                        <button
                            type="button"
                            onClick={copyOutput}
                            className="btn-ghost p-1 text-muted hover:text-white"
                            title="Copy output"
                        >
                            <LuCopy size={13} />
                        </button>
                    )}
                </div>
                <div className="output-panel flex-1 overflow-y-auto font-mono text-xs">
                    <pre className="whitespace-pre-wrap break-words text-slate-200 leading-relaxed">
                        {output || (isRunning ? "Executing program..." : "Output will appear here.")}
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default RunView
