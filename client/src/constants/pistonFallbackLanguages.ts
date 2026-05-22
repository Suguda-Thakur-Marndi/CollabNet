import { Language } from "@/types/run"


export const PISTON_FALLBACK_LANGUAGES: Language[] = [
    {
        language: "javascript",
        version: "18.15.0",
        aliases: ["js", "node-js", "javascript"],
    },
    {
        language: "typescript",
        version: "5.0.3",
        aliases: ["ts", "typescript"],
    },
    {
        language: "python",
        version: "3.10.0",
        aliases: ["py", "py3", "python3"],
    },
    {
        language: "java",
        version: "15.0.2",
        aliases: ["java"],
    },
    {
        language: "cpp",
        version: "10.2.0",
        aliases: ["cpp", "c++"],
    },
    {
        language: "c",
        version: "10.2.0",
        aliases: ["c"],
    },
    {
        language: "go",
        version: "1.16.2",
        aliases: ["go"],
    },
    {
        language: "rust",
        version: "1.68.2",
        aliases: ["rs", "rust"],
    },
    {
        language: "ruby",
        version: "3.0.1",
        aliases: ["rb", "ruby"],
    },
    {
        language: "php",
        version: "8.2.3",
        aliases: ["php"],
    },
]
