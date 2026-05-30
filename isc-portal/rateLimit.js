"use strict";
// lib/rateLimit.js – sliding-window in-memory rate limiter
// For multi-process deployments (cluster/PM2), swap the Map for Redis.
require("dotenv").config();

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const DEFAULT_MAX = Number(process.env.RATE_LIMIT_MAX || 100);
const AUTH_MAX = Number(process.env.RATE_LIMIT_AUTH_MAX || 10);

// key → array of timestamps
const store = new Map();

// Prune old entries every 5 minutes to keep memory bounded
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, timestamps] of store.entries()) {
    const fresh = timestamps.filter((t) => t > cutoff);
    if (fresh.length === 0) store.delete(key);
    else store.set(key, fresh);
  }
}, 5 * 60 * 1000).unref();

/**
 * Returns a middleware-style function that throws with status 429 when exceeded.
 * Usage: rateLimiter(max)(req, res, next)
 */
function rateLimiter(max = DEFAULT_MAX) {
  return function limit(req, res, next) {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
    const key = `${ip}:${req.url}`;
    const now = Date.now();
    const cutoff = now - WINDOW_MS;
    const hits = (store.get(key) || []).filter((t) => t > cutoff);
    hits.push(now);
    store.set(key, hits);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - hits.length));
    res.setHeader("X-RateLimit-Reset", Math.ceil((now + WINDOW_MS) / 1000));

    if (hits.length > max) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Too many requests – please slow down." }));
      return;
    }
    next();
  };
}

const defaultLimiter = rateLimiter(DEFAULT_MAX);
const authLimiter = rateLimiter(AUTH_MAX);

module.exports = { rateLimiter, defaultLimiter, authLimiter };
