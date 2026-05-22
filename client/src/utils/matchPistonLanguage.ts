import { Language } from "@/types/run"
import customMapping from "@/utils/customMapping"
import langMap from "lang-map"

export function matchPistonLanguage(
    languages: Language[],
    fileName: string,
): Language | null {
    const extension = fileName.split(".").pop()?.toLowerCase()
    if (!extension) return null

    const mapped = customMapping[extension]
    const langNames = (langMap.languages(extension) || []).map((n: string) =>
        n.toLowerCase(),
    )

    const matches = languages.filter((lang) => {
        const id = lang.language.toLowerCase()
        if (mapped && id === mapped.toLowerCase()) return true
        if (
            lang.aliases?.some(
                (a) => a.toLowerCase() === extension || a.toLowerCase() === mapped,
            )
        ) {
            return true
        }
        return langNames.some(
            (name) => id === name || id.includes(name) || name.includes(id),
        )
    })

    if (matches.length === 0) return null

    const preferNode = matches.find(
        (m) =>
            m.language === "javascript" &&
            (m.aliases?.includes("js") || m.version.startsWith("18")),
    )
    return preferNode ?? matches[0]
}
