import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization; // looks like "Bearer eyJhbGciOi..."
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = payload.adminId; // now any route using this middleware knows who's calling
    next(); // hand off to the actual route handler
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
