import { Router, type Request, type Response } from "express"
import { passport, userStore, type AuthUser } from "./passport.js"

const authRouter = Router()

/**
 * Step 1: Redirect browser to Google OAuth consent screen
 * If Google credentials are not set, falls back to local developer session
 * GET /auth/google
 */
authRouter.get(
  "/google",
  (req, _res, next) => {
    // If credentials not configured, seamlessly fallback to dev login
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn("[Auth] Google OAuth credentials not set — falling back to Developer session")
      _res.redirect("/auth/dev-login")
      return
    }
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2)
    req.session.oauthState = state
    next()
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
)

/**
 * Developer session login for local development and verification
 * GET /auth/dev-login
 */
authRouter.get("/dev-login", (req: Request, res: Response) => {
  const devUser: AuthUser = {
    id: "dev-user-001",
    googleSubjectId: "dev-google-001",
    email: "developer@collabnet.local",
    displayName: "CollabNet Developer",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CollabNetDev",
    createdAt: new Date(),
    lastLoginAt: new Date(),
  }
  userStore.set(devUser.id, devUser)
  const getClientRedirectUrl = () => (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim()

  req.login(devUser, (err) => {
    if (err) {
      console.error("[Auth] Dev login error:", err)
      res.redirect(`${getClientRedirectUrl()}/?auth_error=true`)
      return
    }
    res.redirect(getClientRedirectUrl())
  })
})

/**
 * Step 2: Google redirects back here after user grants/denies consent
 * GET /auth/google/callback
 */
authRouter.get(
  "/google/callback",
  (req, res, next) => {
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim()
    passport.authenticate("google", {
      failureRedirect: `${clientUrl}/?auth_error=true`,
      session: true,
    })(req, res, next)
  },
  (_req: Request, res: Response) => {
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim()
    // On success, redirect to the client app
    res.redirect(clientUrl)
  }
)

/**
 * Returns the currently authenticated user's public profile.
 * GET /auth/current-user
 * Returns 401 if not authenticated.
 */
authRouter.get("/current-user", (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({ error: "AUTH_REQUIRED", message: "Not authenticated" })
    return
  }

  const user = req.user as AuthUser
  // Only expose safe, public fields — never the full internal object
  res.json({
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  })
})

/**
 * Destroy session and redirect to client home
 * POST /auth/logout
 */
authRouter.post("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error("[Auth] Logout error:", err)
      res.status(500).json({ error: "LOGOUT_FAILED" })
      return
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error("[Auth] Session destroy error:", sessionErr)
      }
      res.clearCookie("collabnet.sid")
      res.json({ success: true })
    })
  })
})

export { authRouter }
