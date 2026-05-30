"use strict";
// lib/middleware.js
require("dotenv").config();
const { getSidFromRequest, getSession } = require("./auth");

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// ── Response helpers ─────────────────────────────────────────────

function json(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

// ── CORS ─────────────────────────────────────────────────────────

function corsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== "production")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return true; // handled
  }
  return false;
}

// ── Security headers ─────────────────────────────────────────────

function securityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  }
}

// ── Body parser ──────────────────────────────────────────────────

function readBody(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) { req.destroy(); reject(new Error("Payload too large")); return; }
      body += chunk;
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

// ── Auth guards ──────────────────────────────────────────────────

const ROLE_DEFAULT_PERMISSIONS = {
  "Super Admin": ["dashboard", "build_quotation", "quote_library", "approval", "reports", "audit_trail", "setup", "supplier_prices", "member_access_management", "quotation_hub", "sales_quotation_requests"],
  "Admin": ["dashboard", "build_quotation", "quote_library", "approval", "reports", "audit_trail", "setup", "supplier_prices", "member_access_management", "quotation_hub", "sales_quotation_requests"],
  "Full Access Member": ["dashboard", "reports", "build_quotation", "quote_library", "approval", "quotation_hub", "sales_quotation_requests"],
  "Quotation Builder Only": ["build_quotation", "quotation_hub", "sales_quotation_requests"],
};

function hasPermission(session, permKey) {
  if (!session) return false;
  if (session.role === "Super Admin") return true;
  if (Array.isArray(session.permissions) && session.permissions.length) {
    return session.permissions.includes(permKey);
  }
  return (ROLE_DEFAULT_PERMISSIONS[session.role] || []).includes(permKey);
}

function requireAuth(req, res) {
  const sid = getSidFromRequest(req);
  const session = getSession(sid);
  if (!session) { json(res, 401, { error: "Not signed in" }); return null; }
  if (session.inviteStatus === "Disabled") { json(res, 403, { error: "Account disabled" }); return null; }
  return session;
}

function requirePermission(req, res, permKey) {
  const session = requireAuth(req, res);
  if (!session) return null;
  if (!hasPermission(session, permKey)) { json(res, 403, { error: "Access denied" }); return null; }
  return session;
}

module.exports = { json, corsHeaders, securityHeaders, readBody, requireAuth, requirePermission, hasPermission, ROLE_DEFAULT_PERMISSIONS };
