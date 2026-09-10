import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"

// In-memory user store — replace with PostgreSQL in production
interface AuthUser {
  id: string
  googleSubjectId: string
  email: string
  displayName: string
  avatarUrl: string
  createdAt: Date
  lastLoginAt: Date
}

const userStore = new Map<string, AuthUser>()

const GOOGLE_CONFIGURED =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET

if (GOOGLE_CONFIGURED) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleSubjectId = profile.id
          const email = profile.emails?.[0]?.value ?? ""
          const displayName = profile.displayName ?? email.split("@")[0]
          const avatarUrl = profile.photos?.[0]?.value ?? ""

          let user = [...userStore.values()].find(
            (u) => u.googleSubjectId === googleSubjectId
          )

          if (user) {
            user.lastLoginAt = new Date()
            user.avatarUrl = avatarUrl
            userStore.set(user.id, user)
          } else {
            const { v4: uuidv4 } = await import("uuid")
            user = {
              id: uuidv4(),
              googleSubjectId,
              email,
              displayName,
              avatarUrl,
              createdAt: new Date(),
              lastLoginAt: new Date(),
            }
            userStore.set(user.id, user)
            console.log(`[Auth] New user registered: ${displayName} (${email})`)
          }

          return done(null, user)
        } catch (err) {
          return done(err as Error)
        }
      }
    )
  )
} else {
  console.warn(
    "[Auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google OAuth disabled. Set credentials in .env to enable."
  )
}

// Store only the user id in the session cookie
passport.serializeUser((user: Express.User, done) => {
  const authUser = user as AuthUser
  done(null, authUser.id)
})

// Restore full user from session id
passport.deserializeUser((id: string, done) => {
  const user = userStore.get(id)
  if (user) {
    done(null, user)
  } else {
    done(new Error("User not found in session store"), null)
  }
})

export { passport, userStore }
export type { AuthUser }
