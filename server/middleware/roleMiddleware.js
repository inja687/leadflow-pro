/**
 * Role-based authorization middleware.
 * Must be used AFTER the `protect` middleware (requires req.user).
 *
 * Usage: authorize("admin") or authorize("admin", "member")
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};
