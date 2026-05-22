import axios, { AxiosInstance } from "axios"

export const PISTON_PUBLIC_API =
    "https://emkc.org/api/v2/piston"

const pistonBaseUrl =
    import.meta.env.VITE_PISTON_API_URL || PISTON_PUBLIC_API

const instance: AxiosInstance = axios.create({
    baseURL: pistonBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
})

export default instance
