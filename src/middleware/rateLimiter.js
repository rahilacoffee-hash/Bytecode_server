const requestStore = new Map();

const CLEANUP_INTERVAL = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();

  for (const [key, entry] of requestStore.entries()) {
    if (entry.resetAt <= now) {
      requestStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL).unref();

function getClientIp(req) {
  return (
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

export function rateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests. Please try again later.",
  code = "RATE_LIMIT_EXCEEDED",
} = {}) {
  return (req, res, next) => {
    const ip = getClientIp(req);

    const key = `${req.method}:${req.baseUrl}:${req.path}:${ip}`;

    const now = Date.now();

    let entry = requestStore.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = {
        count: 0,
        resetAt: now + windowMs,
      };
    }

    entry.count += 1;

    requestStore.set(key, entry);

    const remaining = Math.max(0, max - entry.count);

    const retryAfter = Math.ceil(
      (entry.resetAt - now) / 1000
    );

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil(entry.resetAt / 1000)
    );

    if (entry.count > max) {
      res.setHeader("Retry-After", retryAfter);

      return res.status(429).json({
        success: false,
        message,
        code,
        retryAfter,
      });
    }

    next();
  };
}

export const generalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message:
    "Too many requests. Please slow down and try again later.",
  code: "GENERAL_RATE_LIMIT_EXCEEDED",
});

export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many authentication attempts. Please try again later.",
  code: "AUTH_RATE_LIMIT_EXCEEDED",
});

export const otpRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Too many OTP requests. Please wait before requesting another code.",
  code: "OTP_RATE_LIMIT_EXCEEDED",
});