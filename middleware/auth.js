/**
 * Authentication Middleware
 * Protects routes by checking if user is logged in
 */

/**
 * Require authentication for a route
 * Checks if req.session.userId exists
 * If not, returns 401 Unauthorized
 */
export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: "Authentication required",
      message: "You must be logged in to access this resource" 
    });
  }
  next();
}

/**
 * Optional authentication
 * Adds user info to req if logged in, but doesn't block the request
 */
export function optionalAuth(req, res, next) {
  // Just pass through - session will be available if it exists
  next();
}