/**
 * Role-Based Access Control Middleware
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by authMiddleware
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "User role not found. Access denied.",
      });
    }

    if (!allowedRoles.includes(req.user.role.toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

export default authorize;
