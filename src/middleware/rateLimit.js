// Minimal in-memory rate limiter — fine for a single-process app like this
// (would need a shared store like Redis if this ever ran across multiple
// server instances). Tracks attempt counts per IP in a sliding window.
export function createRateLimiter({ windowMs, max }) {
  const attempts = new Map() // ip -> { count, resetAt }

  return function rateLimit(req, res, next) {
    const ip = req.ip
    const now = Date.now()
    const entry = attempts.get(ip)

    if (!entry || now > entry.resetAt) {
      attempts.set(ip, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (entry.count >= max) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
      res.setHeader('Retry-After', retryAfterSeconds)
      return res.status(429).json({ error: 'Too many attempts. Try again later.' })
    }

    entry.count += 1
    next()
  }
}
