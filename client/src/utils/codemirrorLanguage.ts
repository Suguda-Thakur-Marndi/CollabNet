import {
    LanguageName,
    loadLanguage,
} from "@uiw/codemirror-extensions-langs"
import langMap from "lang-map"
import customMapping from "@/utils/customMapping"


const LANGUAGE_ALIASES: Record<string, string> = {
    javascript: "js",
    node: "js",
    js: "js",
    typescript: "ts",
    ts: "ts",
    python: "py",
    py: "py",
    python3: "py",
    csharp: "cs",
    "c#": "cs",
    cs: "cs",
    cpp: "cpp",
    "c++": "cpp",
    cxx: "cpp",
    ruby: "rb",
    rb: "rb",
    rust: "rs",
    rs: "rs",
    golang: "go",
    go: "go",
    shell: "sh",
    bash: "sh",
    zsh: "sh",
    markdown: "md",
    md: "md",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    html: "html",
    css: "css",
    sql: "sql",
    java: "java",
    kotlin: "kt",
    kt: "kt",
    swift: "swift",
    scala: "scala",
    php: "php",
    vue: "vue",
    svelte: "svelte",
    xml: "xml",
}

const EXTENSION_TO_CM: Record<string, string> = {
    js: "js",
    mjs: "js",
    cjs: "js",
    jsx: "jsx",
    ts: "ts",
    tsx: "tsx",
    py: "py",
    java: "java",
    c: "c",
    h: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    hpp: "cpp",
    cs: "cs",
    go: "go",
    rs: "rs",
    php: "php",
    rb: "rb",
    html: "html",
    htm: "html",
    css: "css",
    scss: "css",
    less: "css",
    json: "json",
    md: "md",
    markdown: "md",
    sql: "sql",
    sh: "sh",
    bash: "sh",
    zsh: "sh",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    swift: "swift",
    kt: "kt",
    kts: "kt",
    scala: "scala",
    vue: "vue",
    svelte: "svelte",
}

function normalizeId(candidate: string): string {
    const key = candidate.toLowerCase().trim()
    return LANGUAGE_ALIASES[key] ?? key
}

function tryResolveId(candidate: string): LanguageName | null {
    const mapped = normalizeId(candidate)
    if (loadLanguage(mapped as LanguageName)) {
        return mapped as LanguageName
    }
    if (mapped !== candidate && loadLanguage(candidate as LanguageName)) {
        return candidate as LanguageName
    }
    return null
}


export function resolveCodeMirrorLanguageId(
    fileName?: string,
    languageHint?: string,
): LanguageName {
    if (fileName) {
        const ext = fileName.split(".").pop()?.toLowerCase()
        if (ext) {
            if (customMapping[ext]) {
                const fromCustom = tryResolveId(customMapping[ext])
                if (fromCustom) return fromCustom
            }
            if (EXTENSION_TO_CM[ext]) {
                const fromExt = tryResolveId(EXTENSION_TO_CM[ext])
                if (fromExt) return fromExt
            }
            const names = langMap.languages(ext) ?? []
            for (const name of names) {
                const resolved = tryResolveId(name)
                if (resolved) return resolved
            }
        }
    }

    if (languageHint) {
        const fromHint = tryResolveId(languageHint)
        if (fromHint) return fromHint
    }

    return "js"
}

export function loadCodeMirrorLanguageExtension(
    fileName?: string,
    languageHint?: string,
) {
    const id = resolveCodeMirrorLanguageId(fileName, languageHint)
    return loadLanguage(id)
}


export function languageIdFromFileName(fileName: string): LanguageName {
    return resolveCodeMirrorLanguageId(fileName)
}
