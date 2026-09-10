import { useState, useEffect } from "react"
import {
    getCurrentUser,
    loginWithGoogle,
    logout as logoutApi,
    type AuthenticatedUser,
} from "../api/authApi"

interface UseAuthReturn {
    user: AuthenticatedUser | null
    loading: boolean
    login: () => void
    logout: () => Promise<void>
}

/**
 * Hook that fetches the current authenticated user from the backend.
 * Exposes login (redirects to Google OAuth) and logout functions.
 */
export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<AuthenticatedUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        getCurrentUser().then((u) => {
            if (!cancelled) {
                setUser(u)
                setLoading(false)
            }
        })

        return () => {
            cancelled = true
        }
    }, [])

    const login = () => {
        loginWithGoogle()
    }

    const logout = async () => {
        await logoutApi()
        setUser(null)
    }

    return { user, loading, login, logout }
}
