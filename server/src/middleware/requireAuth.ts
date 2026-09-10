import { type Request, type Response, type NextFunction } from "express"

/**
 * Express middleware that rejects unauthenticated requests with 401.
 * Use on any route that requires a valid Google OAuth session.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    next()
    return
  }
  res.status(401).json({
    error: "AUTH_REQUIRED",
    message: "You must be signed in to access this resource",
  })
}
