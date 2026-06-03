/**
 * seed-admin.js – one-time Super Admin bootstrap for production
 *
 * Usage (Render Shell or local terminal):
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=YourStr0ng!Pass node seed-admin.js
 *
 * Password requirements (enforced by server.js):
 *   - At least 12 characters
 *   - One uppercase letter
 *   - One lowercase letter
 *   - One number
 *   - One special character (e.g. ! @ # $ %)
 *
 * Run ONCE, then delete or ignore the script. It will refuse to run
 * if a Super Admin already exists.
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("./vendor/bcrypt");

// ── Config ────────────────────────────────────────────────────────────────────
const email    = process.env.ADMIN_EMAIL    || "";
const password = process.env.ADMIN_PASSWORD || "";
const name     = process.env.ADMIN_NAME     || "Super Admin";

if (!email || !password) {
  console.error("ERROR: Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
  console.error("  Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='Str0ng!Pass' node seed-admin.js");
  process.exit(1);
}

// ── Password policy (mirrors server.js) ──────────────────────────────────────
function passwordPolicyErrors(pw) {
  const errors = [];
  if (pw.length < 12)          errors.push("at least 12 characters");
  if (!/[A-Z]/.test(pw))       errors.push("one uppercase letter");
  if (!/[a-z]/.test(pw))       errors.push("one lowercase letter");
  if (!/[0-9]/.test(pw))       errors.push("one number");
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push("one special character");
  return errors;
}

const policyErrors = passwordPolicyErrors(password);
if (policyErrors.length) {
  console.error("ERROR: Password does not meet policy requirements:");
  policyErrors.forEach(e => console.error("  - " + e));
  process.exit(1);
}

// ── DB paths (must match server.js) ──────────────────────────────────────────
const root    = __dirname;
const dataDir = path.join(root, "data");
const dbPath  = path.join(dataDir, "app-db.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let db = { members: [], sessions: [], sso_tokens: [], user_permissions: [],
           sales_quotation_requests: [], sales_quotation_request_files: [],
           email_logs: [], audit_trail: [], password_reset_tokens: [],
           security_settings: {} };

if (fs.existsSync(dbPath)) {
  try { db = JSON.parse(fs.readFileSync(dbPath, "utf8")); }
  catch { console.error("ERROR: Could not parse", dbPath); process.exit(1); }
}

if (!Array.isArray(db.members)) db.members = [];

// ── Guard: refuse if a Super Admin already exists ────────────────────────────
const existingAdmin = db.members.find(m =>
  (m.role === "Super Admin" || m.role === "Admin") && m.password_hash
);
if (existingAdmin) {
  console.log("An admin account already exists (" + existingAdmin.email + "). Skipping.");
  process.exit(0);
}

// ── Create the Super Admin ────────────────────────────────────────────────────
const permissionKeys = [
  "dashboard","build_quotation","build_guarding_quotation",
  "build_armed_response_quotation","quote_library","project_timeline",
  "approval","reports","audit_trail","setup","supplier_prices",
  "member_access_management","quotation_hub","sales_quotation_requests",
];

const id = email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const now = new Date().toISOString();

const member = {
  id,
  name,
  email: email.trim().toLowerCase(),
  role: "Super Admin",
  access: "Super Admin",
  permissions: permissionKeys,
  permissionsExplicit: true,
  inviteStatus: "Active",
  password_hash: bcrypt.hashSync(password, 12),
  passwordAlgorithm: "bcrypt",
  mustChangePassword: false,
  failedLoginAttempts: 0,
  lockedUntil: null,
  mfaEnabled: false,
  mfaRequired: false,
  created_at: now,
  updated_at: now,
};

db.members.push(member);

if (!Array.isArray(db.audit_trail)) db.audit_trail = [];
db.audit_trail.unshift({
  id: crypto.randomUUID(),
  action: "Created bootstrap Super Admin",
  detail: email,
  module: "Authentication",
  reference: email,
  notes: "Created via seed-admin.js",
  user: "system",
  userName: "System",
  timestamp: now,
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log("✓ Super Admin created successfully.");
console.log("  Email:", member.email);
console.log("  Role: ", member.role);
console.log("  You can now log in at your Render URL.");
console.log("");
console.log("IMPORTANT: Delete or remove seed-admin.js from production after use.");
