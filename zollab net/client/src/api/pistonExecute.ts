import axios, { AxiosInstance } from "axios"
import { PISTON_PUBLIC_API } from "./pistonApi"

const LOCAL_PISTON = "http://localhost:2000/api/v2"

const configuredUrl =
    import.meta.env.VITE_PISTON_API_URL || PISTON_PUBLIC_API

const primary: AxiosInstance = axios.create({
    baseURL: configuredUrl,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
})

const localFallback: AxiosInstance = axios.create({
    baseURL: LOCAL_PISTON,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
})

function isWhitelistOrBlocked(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false
    const msg = String(error.response?.data?.message ?? "").toLowerCase()
    return (
        error.response?.status === 403 ||
        msg.includes("whitelist") ||
        msg.includes("hosting your own")
    )
}

export type ExecutePayload = {
    language: string
    version: string
    files: { name: string; content: string }[]
    stdin: string
}

export async function executePistonCode(payload: ExecutePayload) {
    try {
        return await primary.post("/execute", payload)
    } catch (error) {
        const alreadyLocal = configuredUrl.includes("localhost")
        if (!alreadyLocal && isWhitelistOrBlocked(error)) {
            try {
                return await localFallback.post("/execute", payload)
            } catch {
                throw new Error(
                    "Public code runner cannot execute programs anymore. Start a local runner: run `docker compose up -d` in the zollab net folder, then refresh this page.",
                )
            }
        }
        throw error
    }
}
