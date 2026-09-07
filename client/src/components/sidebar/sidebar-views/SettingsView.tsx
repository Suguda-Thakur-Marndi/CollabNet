import Select from "@/components/common/Select"
import { useSettings } from "@/context/SettingContext"
import useResponsive from "@/hooks/useResponsive"
import { editorFonts } from "@/resources/Fonts"
import { editorThemes } from "@/resources/Themes"
import { langNames } from "@uiw/codemirror-extensions-langs"
import { ChangeEvent, useEffect } from "react"
import { LuRotateCcw, LuSettings } from "react-icons/lu"

function SettingsView() {
    const {
        theme,
        setTheme,
        language,
        setLanguage,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        resetSettings,
    } = useSettings()
    const { viewHeight } = useResponsive()

    const handleFontFamilyChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontFamily(e.target.value)
    const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setTheme(e.target.value)
    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setLanguage(e.target.value)
    const handleFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontSize(parseInt(e.target.value))

    useEffect(() => {
        const editor = document.querySelector(
            ".cm-editor > .cm-scroller",
        ) as HTMLElement
        if (editor !== null) {
            editor.style.fontFamily = `${fontFamily}, monospace`
        }
    }, [fontFamily])

    return (
        <div
            className="flex h-full flex-col justify-between p-3 select-none overflow-y-auto"
            style={{ height: viewHeight }}
        >
            <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono flex items-center gap-1.5">
                        <LuSettings size={13} className="text-primary" />
                        Editor Preferences
                    </span>
                </div>

                {/* Font family & Font size */}
                <div className="flex w-full items-end gap-2">
                    <div className="flex-1">
                        <Select
                            onChange={handleFontFamilyChange}
                            value={fontFamily}
                            options={editorFonts}
                            title="Font Family"
                        />
                    </div>

                    <div className="w-20">
                        <label className="mb-1.5 block text-xs font-medium text-slate-400">
                            Size (px)
                        </label>
                        <select
                            value={fontSize}
                            onChange={handleFontSizeChange}
                            className="input-field py-1.5 px-2 text-xs font-mono"
                            title="Font Size"
                        >
                            {[...Array(13).keys()].map((size) => {
                                const s = size + 12
                                return (
                                    <option key={s} value={s}>
                                        {s}px
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                </div>

                {/* Theme Selector */}
                <Select
                    onChange={handleThemeChange}
                    value={theme}
                    options={Object.keys(editorThemes)}
                    title="Editor Theme"
                />

                {/* Language Mode */}
                <Select
                    onChange={handleLanguageChange}
                    value={language}
                    options={langNames}
                    title="Default Language"
                />
            </div>

            {/* Reset button */}
            <div className="border-t border-border/80 pt-3 mt-4">
                <button
                    type="button"
                    className="btn-secondary w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted hover:text-white"
                    onClick={resetSettings}
                >
                    <LuRotateCcw size={13} />
                    <span>Reset to Default</span>
                </button>
            </div>
        </div>
    )
}

export default SettingsView
