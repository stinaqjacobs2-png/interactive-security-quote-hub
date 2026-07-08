"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "app-db.json");
const christienEmail = "christien@interactivesecurity.co.za";

const permissionKeys = [
  "dashboard",
  "build_quotation",
  "build_guarding_quotation",
  "build_armed_response_quotation",
  "quote_library",
  "project_timeline",
  "approval",
  "reports",
  "audit_trail",
  "setup",
  "supplier_prices",
  "member_access_management",
  "quotation_hub",
  "cost_hub",
  "finance_age_analysis",
  "administration_governance",
  "fleet_hub",
  "living_resources",
  "accounts_sales",
  "hr_hub",
  "technical_maintenance",
  "payroll_hub",
  "overtime_hub",
  "control_room_it",
  "uniforms_stores",
  "employee_files",
  "sales_quotation_requests",
];

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function readDb() {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file not found: ${dbPath}`);
  }
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function backupUsers(db) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(dataDir, `user-cleanup-before-christien-reset-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({
    created_at: new Date().toISOString(),
    reason: "one-time Christien user cleanup",
    members: db.members || [],
    user_permissions: db.user_permissions || [],
    sessions: db.sessions || [],
    password_reset_tokens: db.password_reset_tokens || [],
  }, null, 2));
  return backupPath;
}

const db = readDb();
if (!Array.isArray(db.members)) db.members = [];

const christien = db.members.find((member) => normalizeEmail(member.email) === christienEmail);
if (!christien) {
  throw new Error("Christien Jacobs was not found in the member database. Create or restore christien@interactivesecurity.co.za before running this cleanup.");
}

const backupPath = backupUsers(db);
const removed = db.members.filter((member) => normalizeEmail(member.email) !== christienEmail).length;
const now = new Date().toISOString();

christien.id = christien.id || "christien-interactivesecurity-co-za";
christien.name = "Christien Jacobs";
christien.email = christienEmail;
christien.role = "Super Admin";
christien.access = "Super Admin";
christien.permissions = permissionKeys;
christien.permissionsExplicit = true;
christien.inviteStatus = "Active";
christien.status = "Active";
christien.mustChangePassword = Boolean(christien.mustChangePassword && !christien.password_hash);
christien.failedLoginAttempts = 0;
christien.lockedUntil = null;
christien.updated_at = now;

db.members = [christien];
db.user_permissions = [];
db.password_reset_tokens = [];
db.sso_tokens = [];
db.sessions = (db.sessions || []).filter((item) => item.userId === christien.id || normalizeEmail(item.email) === christienEmail);
db.sessions.forEach((item) => {
  item.userId = christien.id;
  item.email = christien.email;
  item.name = christien.name;
  item.role = christien.role;
  item.permissions = permissionKeys;
  item.permissionsExplicit = true;
});

if (Array.isArray(db.audit_trail)) {
  db.audit_trail.unshift({
    id: `cleanup-${Date.now()}`,
    action: "One-time Christien user cleanup",
    detail: christienEmail,
    module: "Administration & Governance",
    reference: christienEmail,
    notes: `Backed up users to ${path.basename(backupPath)}. Removed ${removed} member(s).`,
    user: "system",
    userName: "System",
    timestamp: now,
  });
}

writeDb(db);

console.log(JSON.stringify({
  ok: true,
  removed,
  backupFile: backupPath,
  remainingUser: {
    id: christien.id,
    name: christien.name,
    email: christien.email,
    role: christien.role,
    inviteStatus: christien.inviteStatus,
    permissions: christien.permissions.length,
  },
}, null, 2));
