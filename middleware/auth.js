import jwt from "jsonwebtoken";

/* ===========================
   🔐 AUTHENTICATE USER
   =========================== */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded contains: { _id, role, name, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    // Token expired
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }

    // Invalid token
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }
};

/* ===========================
   🔒 AUTHORIZE ROLES
   =========================== */
// Usage: auth.authorize("seller"), auth.authorize("admin")
authenticate.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

export default authenticate;
