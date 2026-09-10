import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

/**
 * Fetches the current authenticated user from the backend.
 * Returns null if not authenticated (401).
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const { data } = await axios.get<AuthenticatedUser>(
      `${BACKEND_URL}/auth/current-user`,
      { withCredentials: true }
    )
    return data
  } catch {
    return null
  }
}

/**
 * Redirects the browser to the Google OAuth flow.
 */
export function loginWithGoogle(): void {
  window.location.href = `${BACKEND_URL}/auth/google`
}

/**
 * Logs out the current user by calling the server logout endpoint.
 */
export async function logout(): Promise<void> {
  await axios.post(
    `${BACKEND_URL}/auth/logout`,
    {},
    { withCredentials: true }
  )
}

export interface AuthenticatedUser {
  id: string
  displayName: string
  email: string
  avatarUrl: string
  createdAt: string
  lastLoginAt: string
}
