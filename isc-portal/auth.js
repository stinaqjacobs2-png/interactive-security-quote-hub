"use strict";
// lib/auth.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { get, run, all } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE || 28800); // seconds

if (!JWT_SECRET || JWT_SECRET === "CHANGE_ME_64_BYTE_HEX") {
  console.warn("⚠️  WARNING: JWT_SECRET is not set. Set it in .env before going live.");
}

// ── Password helpers ─────────────────────────────────────────────

const SALT_ROUNDS = 12;

async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

async function verifyPassword(plaintext, hash) {
  if (!hash) return false;
  return bcrypt.compare(plaintext, hash);
}

function generateTempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.randomBytes(14);
  return Array.from(bytes).map((b) => alphabet[b % alphabet.length]).join("");
}

// ── Session helpers ──────────────────────────────────────────────

function createSession(member, ip = "", userAgent = "") {
  // Purge expired sessions for this member
  run("DELETE FROM sessions WHERE member_id = ? AND expires_at < strftime('%Y-%m-%dT%H:%M:%fZ','now')", [member.id]);

  const sid = crypto.randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  run(
    `INSERT INTO sessions (sid, member_id, expires_at, ip, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [sid, member.id, expiresAt, ip || "", userAgent || ""]
  );
  return { sid, expiresAt };
}

function getSession(sid) {
  if (!sid) return null;
  const row = get(
    `SELECT s.sid, s.expires_at, m.id, m.name, m.email, m.role, m.invite_status
     FROM sessions s
     JOIN members m ON m.id = s.member_id
     WHERE s.sid = ? AND s.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
    [sid]
  );
  if (!row) return null;

  const perms = all(
    "SELECT permission_key FROM member_permissions WHERE member_id = ? AND can_access = 1",
    [row.id]
  ).map((r) => r.permission_key);

  return {
    sid: row.sid,
    userId: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    inviteStatus: row.invite_status,
    permissions: perms,
    expiresAt: row.expires_at,
  };
}

function deleteSession(sid) {
  run("DELETE FROM sessions WHERE sid = ?", [sid]);
}

function deleteAllSessionsForMember(memberId) {
  run("DELETE FROM sessions WHERE member_id = ?", [memberId]);
}

// ── SSO token helpers ────────────────────────────────────────────

function createSsoToken(memberId, hubSlug) {
  const token = crypto.randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + 60 * 1000).toISOString(); // 60 seconds
  const id = uuidv4();
  run(
    `INSERT INTO sso_tokens (id, token, member_id, hub_slug, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, token, memberId, hubSlug, expiresAt]
  );
  return token;
}

function consumeSsoToken(token, hubSlug) {
  const row = get(
    `SELECT st.*, m.id as member_id, m.name, m.email, m.role
     FROM sso_tokens st
     JOIN members m ON m.id = st.member_id
     WHERE st.token = ?`,
    [token]
  );
  if (!row) return { error: "token not found" };
  if (row.hub_slug !== hubSlug) return { error: "hub mismatch" };
  if (row.used_at) return { error: "token already used" };
  if (new Date(row.expires_at) <= new Date()) return { error: "token expired" };

  run("UPDATE sso_tokens SET used_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?", [row.id]);

  const member = get("SELECT * FROM members WHERE id = ?", [row.member_id]);
  return { member };
}

// ── Cookie helpers ───────────────────────────────────────────────

function sessionCookieHeader(sid, maxAgeSeconds = SESSION_MAX_AGE) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `isc_session=${encodeURIComponent(sid)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax; HttpOnly${secure}`;
}

function clearCookieHeader() {
  return "isc_session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly";
}

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader.split(";").filter(Boolean).map((c) => {
      const i = c.indexOf("=");
      return [decodeURIComponent(c.slice(0, i).trim()), decodeURIComponent(c.slice(i + 1).trim())];
    })
  );
}

function getSidFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies.isc_session || null;
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateTempPassword,
  createSession,
  getSession,
  deleteSession,
  deleteAllSessionsForMember,
  createSsoToken,
  consumeSsoToken,
  sessionCookieHeader,
  clearCookieHeader,
  parseCookies,
  getSidFromRequest,
};
