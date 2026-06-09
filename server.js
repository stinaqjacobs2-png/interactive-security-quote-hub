const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");
const https = require("https");
const { spawnSync } = require("child_process");
const bcrypt = require("./vendor/bcrypt");

const root = __dirname;
const dataDir = process.env.DATA_DIR || process.env.RENDER_PERSISTENT_DIR || path.join(root, "data");
const dbPath = path.join(dataDir, "app-db.json");
const port = Number(process.env.PORT || 3100);
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);
const MAX_FAILED_LOGINS = Number(process.env.MAX_FAILED_LOGINS || 5);
const LOCKOUT_MINUTES = Number(process.env.LOCKOUT_MINUTES || 30);
const SESSION_IDLE_MINUTES = Number(process.env.SESSION_IDLE_MINUTES || 30);
const SESSION_ABSOLUTE_HOURS = Number(process.env.SESSION_ABSOLUTE_HOURS || 8);
const PASSWORD_RESET_MINUTES = Number(process.env.PASSWORD_RESET_MINUTES || 30);
const PASSWORD_POLICY_MESSAGE = "Password must be at least 5 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";
const DEFAULT_PASSWORD_RESET_ADMIN_EMAIL = "christien@interactivesecurity.co.za";
const PASSWORD_RESET_OTP_MINUTES = Number(process.env.PASSWORD_RESET_OTP_MINUTES || 15);
const PASSWORD_RESET_OTP_MAX_ATTEMPTS = Number(process.env.PASSWORD_RESET_OTP_MAX_ATTEMPTS || 5);

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
  "finance_age_analysis",
  "administration_governance",
  "sales_quotation_requests",
];

const roleDefaults = {
  "Super Admin": permissionKeys,
  Admin: permissionKeys,
  "Quotation Builder": [
    "quotation_hub",
    "build_quotation",
    "build_guarding_quotation",
    "build_armed_response_quotation",
    "sales_quotation_requests",
    "quote_library",
    "project_timeline",
  ],
  "Sales Representative": ["quotation_hub", "sales_quotation_requests"],
  "Read Only": ["quotation_hub", "dashboard", "quote_library", "reports"],
};

function normalizeRole(role = "") {
  const value = String(role || "").trim();
  const aliases = {
    "Full Access Member": "Admin",
    "Quotation Builder Only": "Quotation Builder",
    Member: "Sales Representative",
  };
  return aliases[value] || (roleDefaults[value] ? value : "Read Only");
}

function defaultPermissionsForRole(role) {
  return roleDefaults[normalizeRole(role)] || [];
}

function sanitizePermissions(permissions = []) {
  return Array.from(new Set((Array.isArray(permissions) ? permissions : [])
    .filter((p) => permissionKeys.includes(p))));
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".json": "application/json; charset=utf-8",
};

// ── Database ─────────────────────────────────────────────────────────────────

function ensureDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({
      sessions: [],
      sso_tokens: [],
      members: [],
      user_permissions: [],
      sales_quotation_requests: [],
      sales_quotation_request_files: [],
      email_logs: [],
      audit_trail: [],
      password_reset_tokens: [],
      password_reset_requests: [],
      security_settings: {
        maxFailedLogins: MAX_FAILED_LOGINS,
        lockoutMinutes: LOCKOUT_MINUTES,
        sessionIdleMinutes: SESSION_IDLE_MINUTES,
        sessionAbsoluteHours: SESSION_ABSOLUTE_HOURS,
        passwordResetMinutes: PASSWORD_RESET_MINUTES,
        mfaEnabled: false,
      },
    }, null, 2));
    return;
  }
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  let changed = false;
  ["sessions", "sso_tokens", "members", "user_permissions", "sales_quotation_requests",
   "sales_quotation_request_files", "email_logs", "audit_trail", "password_reset_tokens", "password_reset_requests"].forEach((table) => {
    if (!Array.isArray(db[table])) { db[table] = []; changed = true; }
  });
  if (!db.security_settings) {
    db.security_settings = {
      maxFailedLogins: MAX_FAILED_LOGINS,
      lockoutMinutes: LOCKOUT_MINUTES,
      sessionIdleMinutes: SESSION_IDLE_MINUTES,
      sessionAbsoluteHours: SESSION_ABSOLUTE_HOURS,
      passwordResetMinutes: PASSWORD_RESET_MINUTES,
      mfaEnabled: false,
    };
    changed = true;
  }
  db.members = db.members.map((member) => {
    let updated = member;
    const normalizedRole = normalizeRole(updated.role || updated.access || "Read Only");
    const normalizedPermissions = sanitizePermissions(updated.permissions);
    if (updated.role !== normalizedRole || updated.access !== normalizedRole) {
      updated = {
        ...updated,
        role: normalizedRole,
        access: normalizedRole,
        permissions: normalizedPermissions.length ? normalizedPermissions : defaultPermissionsForRole(normalizedRole),
      };
      changed = true;
    }
    // Migrate legacy camelCase passwordHash to snake_case password_hash
    if (updated.passwordHash && !updated.legacyPasswordHash) {
      updated = {
        ...updated,
        legacyPasswordHash: updated.passwordHash,
        passwordHash: undefined,
        password_hash: updated.password_hash || "",
        passwordAlgorithm: updated.password_hash ? "bcrypt" : "legacy-sha256-reset-required",
        mustChangePassword: true,
      };
      changed = true;
    }
    return updated;
  });
  db.sales_quotation_requests = db.sales_quotation_requests.map((request) => {
    const normalized = String(request.status || "").trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    let status = "Accepted for Processing";
    if (normalized === "approved") status = "Approved";
    if (["submitted_for_approval", "pending_approval", "awaiting_approval", "completed"].includes(normalized)) {
      status = "Submitted for Approval";
    }
    if (request.status === status) return request;
    changed = true;
    return { ...request, legacy_status: request.legacy_status || request.status || "", status, updated_at: request.updated_at || new Date().toISOString() };
  });
  if (changed) fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function publicUser(member) {
  const role = normalizeRole(member.role || member.access || "Read Only");
  const hasExplicitPermissions = Boolean(member.permissionsExplicit) || (Array.isArray(member.permissions) && member.permissions.length > 0);
  const permissions = hasExplicitPermissions ? sanitizePermissions(member.permissions) : defaultPermissionsForRole(role);
  return {
    userId: member.id,
    email: member.email,
    name: member.name || member.email,
    role,
    permissions,
    permissionsExplicit: hasExplicitPermissions,
    inviteStatus: member.inviteStatus || "Active",
    mustChangePassword: Boolean(member.mustChangePassword),
    mfaEnabled: Boolean(member.mfaEnabled),
    mfaRequired: Boolean(member.mfaRequired),
  };
}

function publicMemberRecord(member) {
  const {
    password_hash,
    passwordHash,
    legacyPasswordHash,
    otp_hash,
    temporaryPassword,
    ...safe
  } = member || {};
  return {
    ...safe,
    userId: member?.id,
    role: normalizeRole(member?.role || member?.access || "Read Only"),
    access: normalizeRole(member?.access || member?.role || "Read Only"),
    permissions: persistentPermissionsForMember(member || {}).permissions,
  };
}

function persistentPermissionsForMember(member) {
  const role = normalizeRole(member.role || member.access || "Read Only");
  const explicit = Boolean(member.permissionsExplicit);
  const permissions = sanitizePermissions(member.permissions);
  return {
    role,
    permissions: explicit ? permissions : (permissions.length ? permissions : defaultPermissionsForRole(role)),
    permissionsExplicit: explicit || permissions.length > 0,
  };
}

function passwordPolicyErrors(password = "") {
  const errors = [];
  if (password.length < 5)             errors.push("at least 5 characters");
  if (!/[A-Z]/.test(password))         errors.push("at least 1 uppercase letter");
  if (!/[a-z]/.test(password))         errors.push("at least 1 lowercase letter");
  if (!/[0-9]/.test(password))         errors.push("at least 1 number");
  if (!/[^A-Za-z0-9]/.test(password))  errors.push("at least 1 special character");
  return errors;
}

function assertStrongPassword(password) {
  const errors = passwordPolicyErrors(password);
  if (errors.length) {
    const error = new Error(PASSWORD_POLICY_MESSAGE);
    error.code = "WEAK_PASSWORD";
    error.details = errors;
    throw error;
  }
}

function hashPassword(password) {
  assertStrongPassword(password);
  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
  // Paranoia: verify the hash we just created actually works before returning it
  if (!bcrypt.compareSync(password, hash)) {
    throw new Error("Password hash verification failed immediately after creation.");
  }
  return hash;
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash || typeof passwordHash !== "string") return false;
  if (!passwordHash.startsWith("$2")) return false;
  try {
    return bcrypt.compareSync(password, passwordHash);
  } catch (err) {
    console.error("[verifyPassword] bcrypt.compareSync threw:", err.message);
    return false;
  }
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashOtp(otp) {
  return bcrypt.hashSync(String(otp), BCRYPT_ROUNDS);
}

function verifyOtp(otp, otpHash) {
  if (!otpHash || typeof otpHash !== "string") return false;
  try {
    return bcrypt.compareSync(String(otp), otpHash);
  } catch (err) {
    console.error("[verifyOtp] bcrypt.compareSync threw:", err.message);
    return false;
  }
}

function generateSixDigitOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

function generateTemporaryPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*";
  const all = upper + lower + digits + special;
  const pick = (chars) => chars[crypto.randomInt(0, chars.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  while (chars.length < 10) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function requestMeta(req) {
  return {
    ip: String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim(),
    device: String(req.headers["user-agent"] || ""),
  };
}

function resetDebug(message, details = {}) {
  const safeDetails = { ...details };
  delete safeDetails.otp;
  delete safeDetails.password;
  delete safeDetails.newPassword;
  console.log(`[password-reset] ${message}`, safeDetails);
}

function securitySettings(db) {
  return {
    maxFailedLogins:      Number(db.security_settings?.maxFailedLogins      || MAX_FAILED_LOGINS),
    lockoutMinutes:       Number(db.security_settings?.lockoutMinutes        || LOCKOUT_MINUTES),
    sessionIdleMinutes:   Number(db.security_settings?.sessionIdleMinutes    || SESSION_IDLE_MINUTES),
    sessionAbsoluteHours: Number(db.security_settings?.sessionAbsoluteHours  || SESSION_ABSOLUTE_HOURS),
    passwordResetMinutes: Number(db.security_settings?.passwordResetMinutes  || PASSWORD_RESET_MINUTES),
    mfaEnabled:           Boolean(db.security_settings?.mfaEnabled),
  };
}

function writeAudit(db, action, user, module = "Authentication", reference = user?.email || "", notes = "") {
  if (!Array.isArray(db.audit_trail)) db.audit_trail = [];
  db.audit_trail.unshift({
    id: crypto.randomUUID(),
    action,
    detail: reference,
    module,
    reference,
    notes,
    user: user?.email || "system",
    userName: user?.name || user?.email || "System",
    timestamp: new Date().toISOString(),
  });
  db.audit_trail = db.audit_trail.slice(0, 5000);
}

function emailProviderDiagnostics() {
  const adminEmail = process.env.PASSWORD_RESET_ADMIN_EMAIL || process.env.ADMIN_EMAIL || DEFAULT_PASSWORD_RESET_ADMIN_EMAIL;
  const sender = process.env.EMAIL_FROM || process.env.RESEND_FROM || process.env.SENDGRID_FROM || process.env.SMTP_FROM || "";
  return {
    provider: process.env.RESEND_API_KEY ? "Resend" : process.env.SENDGRID_API_KEY ? "SendGrid" : process.env.SMTP_HOST ? "SMTP configured but unsupported without SMTP library" : "Not configured",
    adminEmail,
    sender,
    hasResend: Boolean(process.env.RESEND_API_KEY),
    hasSendGrid: Boolean(process.env.SENDGRID_API_KEY),
    hasSmtpHost: Boolean(process.env.SMTP_HOST),
    hasSmtpUser: Boolean(process.env.SMTP_USER),
    hasSmtpPassword: Boolean(process.env.SMTP_PASSWORD),
  };
}

function httpsJsonRequest(options, payload) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        const parsed = body ? (() => { try { return JSON.parse(body); } catch { return { raw: body }; } })() : {};
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
        else reject(new Error(`${res.statusCode}: ${body || res.statusMessage}`));
      });
    });
    req.on("error", reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function sendPlatformEmail(db, { to, subject, text, type = "system", reference = "" }) {
  const diagnostics = emailProviderDiagnostics();
  const log = {
    id: crypto.randomUUID(),
    type,
    to,
    from: diagnostics.sender,
    subject,
    provider: diagnostics.provider,
    status: "Failed",
    reference,
    error: "",
    created_at: new Date().toISOString(),
  };
  try {
    if (!to) throw new Error("Missing recipient email. Set PASSWORD_RESET_ADMIN_EMAIL or ADMIN_EMAIL on Render.");
    if (!diagnostics.sender) throw new Error("Missing sender email. Set EMAIL_FROM, RESEND_FROM, SENDGRID_FROM, or SMTP_FROM on Render.");
    if (process.env.RESEND_API_KEY) {
      const result = await httpsJsonRequest({
        hostname: "api.resend.com",
        path: "/emails",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
      }, { from: diagnostics.sender, to: [to], subject, text });
      log.status = "Sent";
      log.provider_message_id = result.id || "";
      db.email_logs.push(log);
      console.log(`[email] Sent via Resend to ${to}: ${subject}`);
      return { ok: true, provider: "Resend", log };
    }
    if (process.env.SENDGRID_API_KEY) {
      const result = await httpsJsonRequest({
        hostname: "api.sendgrid.com",
        path: "/v3/mail/send",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
      }, {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: diagnostics.sender },
        subject,
        content: [{ type: "text/plain", value: text }],
      });
      log.status = "Sent";
      log.provider_message_id = result.id || "";
      db.email_logs.push(log);
      console.log(`[email] Sent via SendGrid to ${to}: ${subject}`);
      return { ok: true, provider: "SendGrid", log };
    }
    throw new Error(diagnostics.hasSmtpHost
      ? "SMTP variables are present, but SMTP delivery needs an SMTP library. Configure RESEND_API_KEY or SENDGRID_API_KEY for this deployment."
      : "No email provider configured. Set RESEND_API_KEY or SENDGRID_API_KEY plus sender/admin email variables on Render.");
  } catch (error) {
    log.error = error.message;
    db.email_logs.push(log);
    console.error(`[email] Failed to send to ${to || "(missing recipient)"}: ${error.message}`);
    return { ok: false, provider: diagnostics.provider, error: error.message, log };
  }
}

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "").split(";").filter(Boolean).map((c) => {
      const i = c.indexOf("=");
      return [decodeURIComponent(c.slice(0, i).trim()), decodeURIComponent(c.slice(i + 1).trim())];
    })
  );
}

function setCookie(res, name, value, maxAgeSeconds = 60 * 60 * 8) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie",
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax; HttpOnly${secure}`);
}

function clearCookie(res, name) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie",
    `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${secure}`);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; if (body.length > 1024 * 1024) req.destroy(); });
    req.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

// ── Session management ────────────────────────────────────────────────────────
//
// getSession: reads session from cookie, validates expiry/idle, updates
//   lastActivityAt in the sessions array only (does NOT touch member records).
//
// saveSession: creates a new session. Does NOT rewrite the member's security
//   fields (password_hash, passwordAlgorithm, failedLoginAttempts, lockedUntil,
//   mustChangePassword). Only refreshes non-sensitive profile fields.
function readRawBody(req, maxBytes = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        req.destroy();
        reject(new Error("Uploaded file is too large."));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function bundledPythonPath() {
  const candidates = [
    process.env.PYTHON,
    path.join(os.homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "python.exe"),
    path.join(os.homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "bin", "python"),
    "python",
  ].filter(Boolean);
  return candidates.find((candidate) => candidate === "python" || fs.existsSync(candidate)) || "python";
}

function getSession(req) {
  const sid = parseCookies(req).interactive_security_session;
  if (!sid) return null;

  const db = readDb();
  const settings = securitySettings(db);
  const now = new Date();
  const sessionIndex = db.sessions.findIndex((s) => s.sid === sid);
  if (sessionIndex === -1) return null;

  const session = db.sessions[sessionIndex];
  const absoluteExpired = new Date(session.expiresAt) <= now;
  const lastActivity = session.lastActivityAt ? new Date(session.lastActivityAt) : new Date(session.createdAt || 0);
  const idleExpired = now.getTime() - lastActivity.getTime() > settings.sessionIdleMinutes * 60 * 1000;

  if (absoluteExpired || idleExpired) {
    db.sessions.splice(sessionIndex, 1);
    writeAudit(db, "Session expired", session, "Authentication", session.email,
      absoluteExpired ? "Absolute session expiry" : "Idle session expiry");
    writeDb(db);
    return null;
  }

  const member = db.members.find(
    (m) => m.id === session.userId || normalizeEmail(m.email) === normalizeEmail(session.email)
  );
  const accountStatus = String(member?.inviteStatus || member?.status || "").toLowerCase();
  if (!member || ["disabled", "archived", "deactivated"].includes(accountStatus)) {
    db.sessions.splice(sessionIndex, 1);
    writeAudit(db, "Session revoked", session, "Authentication", session.email, "Member missing, disabled, or archived");
    writeDb(db);
    return null;
  }
  const { role, permissions, permissionsExplicit } = persistentPermissionsForMember(member);

  db.sessions[sessionIndex] = {
    ...session,
    userId: member.id,
    email: member.email,
    name: member.name || member.email,
    role,
    permissions,
    permissionsExplicit,
    mustChangePassword: Boolean(member.mustChangePassword),
    lastActivityAt: now.toISOString(),
  };
  writeDb(db);

  return db.sessions[sessionIndex];
}

function saveSession(user) {
  const db = readDb();
  const settings = securitySettings(db);
  const sid = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const member = db.members.find(
    (m) => normalizeEmail(m.email) === normalizeEmail(user.email) || m.id === (user.userId || user.id)
  );
  const persisted = member
    ? persistentPermissionsForMember(member)
    : {
      role: normalizeRole(user.role || user.access || "Read Only"),
      permissions: sanitizePermissions(user.permissions).length ? sanitizePermissions(user.permissions) : defaultPermissionsForRole(user.role || user.access),
      permissionsExplicit: Boolean(user.permissionsExplicit) || sanitizePermissions(user.permissions).length > 0,
    };

  const session = {
    sid,
    userId: member?.id || user.userId || user.id || user.email,
    email: member?.email || user.email,
    name: member?.name || user.name || user.email,
    role: persisted.role,
    permissions: persisted.permissions,
    permissionsExplicit: persisted.permissionsExplicit,
    mfaEnabled: Boolean(member?.mfaEnabled ?? user.mfaEnabled),
    mfaRequired: Boolean(member?.mfaRequired ?? user.mfaRequired),
    mustChangePassword: Boolean(member?.mustChangePassword ?? user.mustChangePassword),
    createdAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + settings.sessionAbsoluteHours * 60 * 60 * 1000).toISOString(),
  };

  // Remove expired/duplicate sessions for this user
  db.sessions = db.sessions.filter(
    (s) => s.email !== session.email || new Date(s.expiresAt) > now
  );
  db.sessions.push(session);

  // Update ONLY non-security profile fields on the member record.
  // NEVER touch: password_hash, passwordAlgorithm, mustChangePassword,
  //              failedLoginAttempts, lockedUntil — those are managed
  //              by the auth/password endpoints exclusively.
  const memberIndex = db.members.findIndex((m) => m.id === session.userId || normalizeEmail(m.email) === normalizeEmail(session.email));
  if (memberIndex >= 0) {
    const existing = db.members[memberIndex];
    db.members[memberIndex] = {
      ...existing,
      name: session.name || existing.name,
      role: existing.role || session.role,
      access: existing.access || session.role,
      permissions: Array.isArray(existing.permissions) ? existing.permissions : session.permissions,
      permissionsExplicit: Boolean(existing.permissionsExplicit),
      mfaEnabled: Boolean(existing.mfaEnabled),
      mfaRequired: Boolean(existing.mfaRequired),
      inviteStatus: user.inviteStatus || existing.inviteStatus || "Active",
      updated_at: now.toISOString(),
      password_hash: existing.password_hash,
      passwordAlgorithm: existing.passwordAlgorithm,
      mustChangePassword: existing.mustChangePassword,
      failedLoginAttempts: existing.failedLoginAttempts,
      lockedUntil: existing.lockedUntil,
      passwordChangedAt: existing.passwordChangedAt,
    };
  } else {
    // New member record (SSO path or first-time). No password_hash here.
    db.members.push({
      id: session.userId,
      name: session.name,
      email: session.email,
      phone: user.phone || user.phoneNumber || "",
      branch: user.branch || "",
      department: user.department || "",
      inviteStatus: user.inviteStatus || "Active",
      role: session.role,
      access: session.role,
      permissions: session.permissions,
      permissionsExplicit: session.permissionsExplicit,
      mfaEnabled: Boolean(user.mfaEnabled),
      mfaRequired: Boolean(user.mfaRequired),
      password_hash: "",
      passwordAlgorithm: "",
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
  }

  writeDb(db);
  return session;
}

function canAccessHub(session, hubSlug) {
  if (!session) return false;
  if (session.mustChangePassword) return false;
  const hubPermissionMap = {
    "quotation-hub": "quotation_hub",
    "finance-age-analysis": "finance_age_analysis",
    "administration-governance": "administration_governance",
  };
  const permissionKey = hubPermissionMap[hubSlug];
  return permissionKey ? hasPermission(session, permissionKey) : ["Super Admin", "Admin"].includes(normalizeRole(session.role || session.access));
}

function hasPermission(session, permissionKey) {
  if (!session) return false;
  if (session.mustChangePassword) return false;
  const role = normalizeRole(session.role || session.access);
  if (["Super Admin", "Admin"].includes(role)) return true;
  const permissions = sanitizePermissions(session.permissions);
  const assigned = session.permissionsExplicit ? permissions : (permissions.length ? permissions : defaultPermissionsForRole(role));
  return assigned.includes(permissionKey);
}

// ── Static file serving ───────────────────────────────────────────────────────

function serveIndex(res) {
  const filePath = path.join(root, "index.html");
  res.writeHead(200, { "Content-Type": mimeTypes[".html"], "Cache-Control": "no-store" });
  res.end(fs.readFileSync(filePath));
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let cleanPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const hubAssetMatch = cleanPath.match(/^\/hubs\/[^/]+\/(.+)$/);
  if (hubAssetMatch) cleanPath = `/${hubAssetMatch[1]}`;
  const filePath = path.normalize(path.join(root, cleanPath));
  if (!filePath.startsWith(root)) { res.writeHead(403); res.end("Forbidden"); return; }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { res.writeHead(404); res.end("Not found"); return; }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream", "Cache-Control": "no-store" });
  res.end(fs.readFileSync(filePath));
}

// ── First-time setup page ─────────────────────────────────────────────────────
// Serves a browser form to create the first Super Admin.
// Permanently redirects to / once any user with a password_hash exists.

function serveSetup(res) {
  const db = readDb();
  const hasSuperAdmin = db.members && db.members.some((m) => m.password_hash && normalizeRole(m.role || m.access) === "Super Admin");
  if (hasSuperAdmin) { res.writeHead(302, { Location: "/" }); res.end(); return; }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>First-time Setup – Interactive Security Portal</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#f4f5f7;display:flex;
         align-items:center;justify-content:center;min-height:100vh;padding:1rem}
    .card{background:#fff;border-radius:10px;box-shadow:0 2px 16px rgba(0,0,0,.12);
          padding:2.5rem;width:100%;max-width:420px}
    h1{font-size:1.25rem;margin-bottom:.25rem}
    p.sub{color:#555;font-size:.9rem;margin-bottom:1.5rem}
    label{display:block;font-size:.85rem;font-weight:600;margin-bottom:.9rem}
    label span{display:block;margin-bottom:.3rem}
    input{width:100%;padding:.55rem .75rem;border:1px solid #ccc;border-radius:6px;font-size:.95rem}
    input:focus{outline:none;border-color:#2563eb}
    .hint{font-size:.78rem;color:#666;margin-top:.3rem}
    button{width:100%;margin-top:1.25rem;padding:.65rem;background:#1d4ed8;
           color:#fff;border:none;border-radius:6px;font-size:1rem;font-weight:600;cursor:pointer}
    button:hover{background:#1e40af}
    button:disabled{background:#93c5fd;cursor:not-allowed}
    .msg{margin-top:1rem;padding:.75rem;border-radius:6px;font-size:.9rem;display:none}
    .msg.error{background:#fee2e2;color:#b91c1c;display:block}
    .msg.success{background:#dcfce7;color:#15803d;display:block}
    .badge{display:inline-block;background:#fef9c3;color:#854d0e;border-radius:4px;
           padding:.15rem .5rem;font-size:.78rem;font-weight:600;margin-bottom:1.25rem}
  </style>
</head>
<body>
<div class="card">
  <span class="badge">First-time setup</span>
  <h1>Create Super Admin</h1>
  <p class="sub">This page is only accessible while no Super Admin exists in the database.
  It permanently disables itself as soon as the first Super Admin account is created.</p>
  <form id="form">
    <label><span>Full name</span>
      <input id="name" type="text" placeholder="Jane Smith" required autocomplete="name"/>
    </label>
    <label><span>Email address</span>
      <input id="email" type="email" placeholder="admin@yourcompany.com" required autocomplete="email"/>
    </label>
    <label><span>Password</span>
      <input id="password" type="password" required autocomplete="new-password"/>
      <div class="hint">Password must be at least 5 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.</div>
    </label>
    <label><span>Confirm password</span>
      <input id="confirm" type="password" required autocomplete="new-password"/>
    </label>
    <button type="submit" id="btn">Create Super Admin account</button>
  </form>
  <div class="msg" id="msg"></div>
</div>
<script>
document.getElementById('form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const msg = document.getElementById('msg');
  const btn = document.getElementById('btn');
  msg.className = 'msg'; msg.textContent = '';
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirm').value;
  if (password !== confirm) {
    msg.className = 'msg error'; msg.textContent = 'Passwords do not match.'; return;
  }
  btn.disabled = true; btn.textContent = 'Creating account…';
  try {
    const res = await fetch('/api/setup/create-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      msg.className = 'msg error';
      msg.textContent = data.error || 'Setup failed.';
      btn.disabled = false; btn.textContent = 'Create Super Admin account'; return;
    }
    msg.className = 'msg success';
    msg.textContent = 'Super Admin created! Redirecting to login…';
    document.getElementById('form').style.display = 'none';
    setTimeout(() => { window.location.href = '/'; }, 2000);
  } catch (err) {
    msg.className = 'msg error'; msg.textContent = 'Network error – please try again.';
    btn.disabled = false; btn.textContent = 'Create Super Admin account';
  }
});
</script>
</body>
</html>`;
  res.writeHead(200, { "Content-Type": mimeTypes[".html"], "Cache-Control": "no-store" });
  res.end(html);
}

// ── API handlers ──────────────────────────────────────────────────────────────

function parseBalanseWorkbook(filePath, session) {
  const script = `
import json, re, sys
from datetime import datetime
from openpyxl import load_workbook

path = sys.argv[1]
member_name = sys.argv[2]
year = int(sys.argv[3])
month_lookup = {
  "JANUARY": 1, "FEBRUARY": 2, "MARCH": 3, "APRIL": 4, "MAY": 5, "JUNE": 6,
  "JULY": 7, "AUGUST": 8, "SEPTEMBER": 9, "OCTOBER": 10, "NOVEMBER": 11, "DECEMBER": 12,
}
wb = load_workbook(path, data_only=True)
ws = wb["BALANSE"] if "BALANSE" in wb.sheetnames else wb[wb.sheetnames[0]]

def slug(value):
  return re.sub(r"(^-|-$)", "", re.sub(r"[^A-Z0-9]+", "-", str(value).upper())).strip("-")

def parse_date(value):
  if value is None:
    return ""
  if hasattr(value, "date"):
    return value.date().isoformat()
  text = str(value).strip().upper()
  parts = text.split()
  if len(parts) >= 2 and parts[0].isdigit():
    month = month_lookup.get(parts[1])
    if month:
      return datetime(year, month, int(parts[0])).date().isoformat()
  return ""

date_cols = []
for col in range(2, ws.max_column + 1):
  date_value = parse_date(ws.cell(1, col).value)
  if date_value:
    date_cols.append((col, date_value))

section_words = {"OPERATING COMPANIES", "PROPERTY COMPANIES", "LOAN COMPANIES", "BONDS", "NEDBANK PRIVATE", "DISCOVERY CURRENT", "FNB CURRENT", "ABSA BUSINESS", "ABSA PRIVATE", "ASCOGYSTIX"}
rows = []
now = datetime.utcnow().isoformat() + "Z"
for row_index in range(2, ws.max_row + 1):
  name = ws.cell(row_index, 1).value
  if name is None:
    continue
  name = str(name).strip()
  if not name:
    continue
  upper = name.upper()
  if upper == "NEDBANK":
    continue
  row_type = "account"
  if upper in section_words:
    row_type = "section"
  elif "GRAND TOTAL" in upper:
    row_type = "grand-total"
  elif "TOTAL" in upper or "SUB TOTAL" in upper:
    row_type = "total"
  for col, date_value in date_cols:
    balance = ws.cell(row_index, col).value
    available = ws.cell(row_index, col + 1).value if col + 1 <= ws.max_column else None
    if balance is None and available is None:
      continue
    rows.append({
      "id": f"finance-opening-import-{row_index}-{col}-{date_value}",
      "accountCode": "" if row_type != "account" else slug(name),
      "accountName": name,
      "partyName": name,
      "branch": "",
      "rowType": row_type,
      "rowOrder": row_index,
      "openingDate": date_value,
      "openingBalance": float(balance or 0),
      "availableBalance": float(available or 0),
      "source": "Excel - BALANSE",
      "importedBy": member_name,
      "importedAt": now,
    })

print(json.dumps({"rows": rows}))
`;
  const result = spawnSync(bundledPythonPath(), ["-", filePath, session.name || session.email || "Unknown", String(new Date().getFullYear())], {
    input: script,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || "BALANSE workbook parser failed.");
  }
  return JSON.parse(result.stdout || "{\"rows\":[]}");
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // ── Login ─────────────────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    if (!email || !password) return json(res, 400, { error: "Missing email or password" });

    const db = readDb();
    const settings = securitySettings(db);
    let member = db.members.find((m) => normalizeEmail(m.email) === email);
    const now = new Date();
    const hasPasswordUsers = db.members.some((m) => m.password_hash);

    // Dev-only bootstrap: auto-create Super Admin on first login when no users exist
    if (!member && !hasPasswordUsers && process.env.NODE_ENV !== "production") {
      try {
        member = {
          id: email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          name: body.name || "System Admin",
          email,
          role: "Super Admin",
          access: "Super Admin",
          permissions: permissionKeys,
          permissionsExplicit: true,
          inviteStatus: "Active",
          password_hash: hashPassword(password),
          passwordAlgorithm: "bcrypt",
          mustChangePassword: false,
          failedLoginAttempts: 0,
          lockedUntil: null,
          mfaEnabled: false,
          mfaRequired: false,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        };
        db.members.push(member);
        writeAudit(db, "Created bootstrap admin", member, "Authentication", email, "Development bootstrap only");
        writeDb(db);
      } catch (error) {
        return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
      }
    }

    if (!member) {
      console.log(`[login] FAIL – no member found for email: ${email}`);
      return json(res, 401, { error: "The email address or password is incorrect." });
    }
    const accountStatus = String(member.inviteStatus || member.status || "").toLowerCase();
    if (["disabled", "archived", "deactivated"].includes(accountStatus)) {
      console.log(`[login] FAIL – account disabled: ${email}`);
      return json(res, 401, { error: "The email address or password is incorrect." });
    }
    if (member.lockedUntil && new Date(member.lockedUntil) > now) {
      console.log(`[login] FAIL – account locked until ${member.lockedUntil}: ${email}`);
      return json(res, 423, { error: `Account locked until ${member.lockedUntil}`, code: "ACCOUNT_LOCKED", lockedUntil: member.lockedUntil });
    }
    if (!member.password_hash) {
      console.log(`[login] FAIL – no password_hash on member: ${email}`);
      return json(res, 403, { error: "Password reset required before this account can sign in.", code: "PASSWORD_RESET_REQUIRED" });
    }

    const passwordOk = verifyPassword(password, member.password_hash);
    if (!passwordOk) {
      member.failedLoginAttempts = Number(member.failedLoginAttempts || 0) + 1;
      member.lastFailedLoginAt = now.toISOString();
      const reason = `bcrypt mismatch – attempt ${member.failedLoginAttempts}/${settings.maxFailedLogins}`;
      console.log(`[login] FAIL – ${reason}: ${email}`);
      if (member.failedLoginAttempts >= settings.maxFailedLogins) {
        member.lockedUntil = new Date(now.getTime() + settings.lockoutMinutes * 60 * 1000).toISOString();
        writeAudit(db, "Account locked", member, "Authentication", email, `${member.failedLoginAttempts} failed login attempts`);
      } else {
        writeAudit(db, "Failed login", member, "Authentication", email, reason);
      }
      writeDb(db);
      return json(res, 401, {
        error: "The email address or password is incorrect.",
        remainingAttempts: Math.max(0, settings.maxFailedLogins - member.failedLoginAttempts),
      });
    }

    member.failedLoginAttempts = 0;
    member.lockedUntil = null;
    member.lastLoginAt = now.toISOString();
    member.updated_at = now.toISOString();
    writeAudit(db, "Signed in", member, "Authentication", email,
      member.mustChangePassword ? "Password change required" : "Successful login");
    writeDb(db);

    console.log(`[login] OK: ${email} role=${member.role}`);
    const session = saveSession(publicUser(member));
    setCookie(res, "interactive_security_session", session.sid);
    return json(res, 200, {
      user: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
        permissions: session.permissions,
        permissionsExplicit: session.permissionsExplicit,
        mustChangePassword: Boolean(member.mustChangePassword),
        mfaEnabled: Boolean(member.mfaEnabled),
        mfaRequired: Boolean(member.mfaRequired),
      },
    });
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    const sid = parseCookies(req).interactive_security_session;
    if (sid) {
      const db = readDb();
      const session = db.sessions.find((s) => s.sid === sid);
      if (session) {
        db.sessions = db.sessions.filter((s) => s.sid !== sid);
        writeAudit(db, "Signed out", session, "Authentication", session.email, "User initiated logout");
        writeDb(db);
        console.log(`[logout] OK: ${session.email}`);
      }
    }
    clearCookie(res, "interactive_security_session");
    return json(res, 200, { ok: true });
  }

  // ── Change password ───────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/auth/change-password") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });

    const body = await readBody(req);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!newPassword) return json(res, 400, { error: "New password is required." });

    // Always do a fresh DB read for security operations — never rely on in-memory state
    const db = readDb();

    // Look up member by userId first (most reliable), then fall back to email
    const member = db.members.find(
      (m) => m.id === session.userId || normalizeEmail(m.email) === normalizeEmail(session.email)
    );
    if (!member) {
      console.log(`[change-password] FAIL – member not found for session userId=${session.userId} email=${session.email}`);
      return json(res, 404, { error: "Member not found." });
    }

    // If a password_hash already exists, the current password must be verified
    if (member.password_hash) {
      if (!currentPassword) {
        return json(res, 400, { error: "Current password is required." });
      }
      if (!verifyPassword(currentPassword, member.password_hash)) {
        console.log(`[change-password] FAIL – current password incorrect for: ${member.email}`);
        writeAudit(db, "Failed password change", member, "Authentication", member.email, "Current password incorrect");
        writeDb(db);
        return json(res, 401, { error: "Current password is incorrect." });
      }
    }

    // Hash and verify the new password
    let newHash;
    try {
      newHash = hashPassword(newPassword); // also does paranoia self-verify inside hashPassword
    } catch (error) {
      console.log(`[change-password] FAIL – weak password for: ${member.email} – ${error.message}`);
      return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
    }

    // Write ONLY the password fields – do not touch any other member data
    const hadTemporaryPassword = Boolean(member.temporaryPasswordCreatedAt) && !member.temporaryPasswordUsed;
    member.password_hash = newHash;
    member.passwordAlgorithm = "bcrypt";
    member.mustChangePassword = false;
    member.temporaryPasswordUsed = hadTemporaryPassword ? true : Boolean(member.temporaryPasswordUsed);
    member.temporaryPasswordUsedAt = hadTemporaryPassword ? new Date().toISOString() : (member.temporaryPasswordUsedAt || "");
    member.inviteStatus = "Active";
    member.status = "Active";
    member.passwordChangedAt = new Date().toISOString();
    member.failedLoginAttempts = 0;
    member.lockedUntil = null;
    member.updated_at = new Date().toISOString();

    if (hadTemporaryPassword) {
      writeAudit(db, "Temporary password used", member, "Authentication", member.email, "User signed in with temporary password and changed it");
    }
    writeAudit(db, "Changed password", member, "Authentication", member.email, "Password changed successfully");
    db.sessions = (db.sessions || []).map((existingSession) => (
      existingSession.userId === member.id || normalizeEmail(existingSession.email) === normalizeEmail(member.email)
        ? { ...existingSession, mustChangePassword: false }
        : existingSession
    ));
    writeDb(db);
    console.log(`[change-password] OK: ${member.email}`);
    return json(res, 200, { ok: true });
  }

  // ── Request password reset ────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/auth/request-password-reset") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const db = readDb();
    const member = db.members.find((m) => normalizeEmail(m.email) === email);
    const accountStatus = String(member?.inviteStatus || member?.status || "").toLowerCase();
    const meta = requestMeta(req);
    resetDebug("request received", { email, ip: meta.ip, userFound: Boolean(member), accountStatus });
    if (member && !["disabled", "archived", "deactivated"].includes(accountStatus)) {
      const diagnostics = emailProviderDiagnostics();
      const permissions = persistentPermissionsForMember(member).permissions;
      const hubs = [
        permissions.includes("quotation_hub") ? "Quotation Hub" : "",
        permissions.includes("finance_age_analysis") ? "Finance Balances and Age Analysis" : "",
        permissions.includes("administration_governance") ? "Administration & Governance" : "",
      ].filter(Boolean);
      const requestRecord = {
        id: crypto.randomUUID(),
        user_id: member.id,
        user_name: member.name || member.email,
        user_email: member.email,
        requested_at: new Date().toISOString(),
        status: "Pending",
        approved_by: "",
        approved_at: "",
        rejected_by: "",
        rejected_at: "",
        completed_at: "",
        reset_token_id: "",
        otp_id: "",
        otp_generated_at: "",
        otp_expires_at: "",
        otp_used_at: "",
        otp_attempts: 0,
        requested_ip: meta.ip,
        requested_device: meta.device,
        hubs,
      };
      db.password_reset_requests.unshift(requestRecord);
      resetDebug("request saved", { requestId: requestRecord.id, userId: member.id, email: member.email });
      writeAudit(db, "Password reset requested", member, "Authentication", member.email, `Request ID: ${requestRecord.id}`);
      const adminEmail = diagnostics.adminEmail;
      const governanceQueueUrl = `${process.env.PUBLIC_BASE_URL || `http://localhost:${port}`}/hubs/administration-governance#security`;
      const emailResult = await sendPlatformEmail(db, {
        to: adminEmail,
        subject: `Password Reset Request – ${requestRecord.user_name}`,
        type: "password_reset_admin_notification",
        reference: requestRecord.id,
        text: [
          "Password reset request received.",
          "",
          `User name: ${requestRecord.user_name}`,
          `User email: ${requestRecord.user_email}`,
          `Date and time: ${new Date(requestRecord.requested_at).toLocaleString("en-ZA")}`,
          `Hub access: ${hubs.join(", ") || "No hub access assigned"}`,
          `Password reset request ID: ${requestRecord.id}`,
          `Administration & Governance queue: ${governanceQueueUrl}`,
          "",
          "Please open Administration & Governance > Login & Security Monitoring to approve or reject this request.",
        ].join("\n"),
      });
      requestRecord.admin_email_status = emailResult.ok ? "Sent" : "Failed";
      requestRecord.admin_email_error = emailResult.error || "";
      resetDebug(emailResult.ok ? "optional admin email sent" : "optional admin email failed", { requestId: requestRecord.id, to: adminEmail, error: emailResult.error || "" });
      writeAudit(db, emailResult.ok ? "Password reset admin email sent" : "Password reset admin email failed", member, "Authentication", requestRecord.id, emailResult.ok ? `Sent to ${adminEmail}` : emailResult.error);
      writeDb(db);
    } else {
      resetDebug("request not saved for inactive or unknown user", { email, userFound: Boolean(member), accountStatus });
      writeAudit(db, "Password reset requested", { email, name: email || "Unknown user" }, "Authentication", email || "unknown", "No active matching user found; generic confirmation returned");
      writeDb(db);
    }
    return json(res, 200, {
      ok: true,
      message: "Your password reset request has been submitted. Please contact your administrator for your OTP.",
    });
  }

  // ── Consume password reset token ──────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/auth/reset-password") {
    const body = await readBody(req);
    const resetToken = String(body.token || "");
    const email = normalizeEmail(body.email || "");
    const otp = String(body.otp || "").trim();
    const newPassword = String(body.newPassword || "");
    const db = readDb();
    if (email || otp) {
      resetDebug("otp verification attempted", { email, hasOtp: Boolean(otp) });
      const member = db.members.find((m) => normalizeEmail(m.email) === email);
      const meta = requestMeta(req);
      if (!member) {
        resetDebug("otp verification failed - user not found", { email });
        return json(res, 401, { error: "Email or OTP is incorrect." });
      }
      const accountStatus = String(member.inviteStatus || member.status || "").toLowerCase();
      if (["disabled", "archived", "deactivated"].includes(accountStatus)) {
        resetDebug("otp verification blocked - user deactivated", { email, accountStatus });
        writeAudit(db, "OTP failed attempt", { email, name: member.name || email }, "Authentication", email, "Deactivated user attempted password reset");
        writeDb(db);
        return json(res, 403, { error: "This account cannot reset its password. Please contact an administrator." });
      }
      const requests = (db.password_reset_requests || [])
        .filter((request) => request.user_id === member.id || normalizeEmail(request.user_email) === email)
        .sort((a, b) => new Date(b.otp_generated_at || b.requested_at || 0) - new Date(a.otp_generated_at || a.requested_at || 0));
      const requestRecord = requests.find((request) => request.otp_hash && !request.otp_used_at && !["Rejected", "Used", "Completed"].includes(request.status || ""));
      if (!requestRecord) {
        resetDebug("otp verification failed - no active otp", { email, requestCount: requests.length });
        writeAudit(db, "OTP failed attempt", member, "Authentication", email, "No active OTP request found");
        writeDb(db);
        return json(res, 401, { error: "Email or OTP is incorrect." });
      }
      if (new Date(requestRecord.otp_expires_at || 0) <= new Date()) {
        requestRecord.status = "Expired";
        resetDebug("otp verification failed - expired", { email, requestId: requestRecord.id, expiresAt: requestRecord.otp_expires_at });
        writeAudit(db, "OTP expired", member, "Authentication", email, `Request ID: ${requestRecord.id}`);
        writeDb(db);
        return json(res, 401, { error: "This OTP has expired. Please ask your administrator for a new OTP." });
      }
      if (Number(requestRecord.otp_attempts || 0) >= PASSWORD_RESET_OTP_MAX_ATTEMPTS) {
        resetDebug("otp verification failed - attempt limit", { email, requestId: requestRecord.id, attempts: requestRecord.otp_attempts });
        writeAudit(db, "OTP failed attempt", member, "Authentication", email, `Attempt limit reached for request ${requestRecord.id}`);
        writeDb(db);
        return json(res, 429, { error: "Too many incorrect OTP attempts. Please contact your administrator." });
      }
      if (!verifyOtp(otp, requestRecord.otp_hash)) {
        requestRecord.otp_attempts = Number(requestRecord.otp_attempts || 0) + 1;
        requestRecord.last_otp_attempt_at = new Date().toISOString();
        requestRecord.last_otp_attempt_ip = meta.ip;
        requestRecord.last_otp_attempt_device = meta.device;
        resetDebug("otp verification failed - invalid otp", { email, requestId: requestRecord.id, attempts: requestRecord.otp_attempts });
        writeAudit(db, "OTP failed attempt", member, "Authentication", email, `Request ID: ${requestRecord.id}; attempt ${requestRecord.otp_attempts}/${PASSWORD_RESET_OTP_MAX_ATTEMPTS}`);
        writeDb(db);
        return json(res, 401, { error: "Email or OTP is incorrect.", remainingAttempts: Math.max(0, PASSWORD_RESET_OTP_MAX_ATTEMPTS - requestRecord.otp_attempts) });
      }

      let newHash;
      try {
        newHash = hashPassword(newPassword);
      } catch (error) {
        return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
      }

      requestRecord.otp_used_at = new Date().toISOString();
      requestRecord.otp_status = "Used";
      requestRecord.status = "Completed";
      requestRecord.completed_at = requestRecord.otp_used_at;
      requestRecord.completed_ip = meta.ip;
      requestRecord.completed_device = meta.device;
      member.password_hash = newHash;
      member.passwordAlgorithm = "bcrypt";
      member.mustChangePassword = false;
      member.failedLoginAttempts = 0;
      member.lockedUntil = null;
      member.passwordChangedAt = new Date().toISOString();
      member.inviteStatus = "Active";
      member.status = "Active";
      member.updated_at = new Date().toISOString();
      resetDebug("otp valid - password hash updated", { email, requestId: requestRecord.id, userId: member.id });
      writeAudit(db, "OTP used successfully", member, "Authentication", email, `Request ID: ${requestRecord.id}`);
      writeAudit(db, "Password reset completed", member, "Authentication", email, `OTP request completed from ${meta.ip || "unknown IP"}`);
      writeDb(db);
      return json(res, 200, { ok: true });
    }
    const record = db.password_reset_tokens.find((r) => r.token_hash === tokenHash(resetToken));
    if (!record || record.used_at || new Date(record.expires_at) <= new Date()) {
      return json(res, 401, { error: "Password reset link is invalid or expired." });
    }
    const member = db.members.find(
      (m) => m.id === record.user_id || normalizeEmail(m.email) === normalizeEmail(record.email)
    );
    if (!member) return json(res, 404, { error: "Member not found." });

    let newHash;
    try {
      newHash = hashPassword(newPassword);
    } catch (error) {
      return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
    }

    record.used_at = new Date().toISOString();
    member.password_hash = newHash;
    member.passwordAlgorithm = "bcrypt";
    member.mustChangePassword = false;
    member.failedLoginAttempts = 0;
    member.lockedUntil = null;
    member.passwordChangedAt = new Date().toISOString();
    member.inviteStatus = "Active";
    member.updated_at = new Date().toISOString();
    const linkedRequest = (db.password_reset_requests || []).find((request) => request.id === record.request_id);
    if (linkedRequest) {
      linkedRequest.status = "Completed";
      linkedRequest.completed_at = new Date().toISOString();
    }

    writeAudit(db, "Password reset completed", member, "Authentication", member.email, "Reset token consumed");
    writeDb(db);
    console.log(`[reset-password] OK: ${member.email}`);
    return json(res, 200, { ok: true });
  }

  // ── Session check ─────────────────────────────────────────────────────────
  if (req.method === "GET" && url.pathname === "/api/auth/password-reset-requests") {
    const session = getSession(req);
    if (!hasPermission(session, "administration_governance")) return json(res, 403, { error: "Access denied" });
    const db = readDb();
    return json(res, 200, {
      requests: (db.password_reset_requests || []).map((request) => ({ ...request, reset_link: undefined, otp_hash: undefined })),
      emailDiagnostics: emailProviderDiagnostics(),
    });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/password-reset-requests/action") {
    const session = getSession(req);
    if (!hasPermission(session, "administration_governance")) return json(res, 403, { error: "Access denied" });
    const body = await readBody(req);
    const requestId = String(body.requestId || "");
    const action = String(body.action || "");
    const db = readDb();
    const settings = securitySettings(db);
    resetDebug("admin action received", { requestId, action, admin: session.email });
    const requestRecord = (db.password_reset_requests || []).find((request) => request.id === requestId);
    if (!requestRecord) return json(res, 404, { error: "Password reset request not found." });
    const member = db.members.find((m) => m.id === requestRecord.user_id || normalizeEmail(m.email) === normalizeEmail(requestRecord.user_email));
    if (!member) return json(res, 404, { error: "Member not found." });
    const accountStatus = String(member.inviteStatus || member.status || "").toLowerCase();
    if (["disabled", "archived", "deactivated"].includes(accountStatus)) {
      return json(res, 403, { error: "Deactivated users cannot receive password reset OTPs." });
    }
    if (action === "generate_otp") {
      const otp = generateSixDigitOtp();
      const now = new Date();
      (db.password_reset_requests || []).forEach((request) => {
        if ((request.user_id === member.id || normalizeEmail(request.user_email) === normalizeEmail(member.email)) && request.id !== requestRecord.id && request.otp_hash && !request.otp_used_at && !["Rejected", "Used", "Completed", "Expired"].includes(request.status || "")) {
          request.status = "Expired";
          request.expired_at = now.toISOString();
        }
      });
      requestRecord.status = "OTP Generated";
      requestRecord.approved_by = session.name || session.email;
      requestRecord.approved_at = requestRecord.approved_at || now.toISOString();
      requestRecord.otp_id = crypto.randomUUID();
      requestRecord.otp_hash = hashOtp(otp);
      requestRecord.otp_generated_at = now.toISOString();
      requestRecord.otp_expires_at = new Date(now.getTime() + PASSWORD_RESET_OTP_MINUTES * 60 * 1000).toISOString();
      requestRecord.otp_used_at = "";
      requestRecord.otp_attempts = 0;
      requestRecord.otp_generated_by = session.name || session.email;
      requestRecord.otp_status = "Active";
      resetDebug("otp generated and hash saved", { requestId, userId: member.id, email: member.email, expiresAt: requestRecord.otp_expires_at });
      writeAudit(db, "OTP generated by admin", session, "Administration & Governance", requestRecord.user_email, `Request ID: ${requestId}; expires ${requestRecord.otp_expires_at}`);
      writeDb(db);
      return json(res, 200, {
        ok: true,
        request: { ...requestRecord, otp_hash: undefined },
        otp,
        expiresAt: requestRecord.otp_expires_at,
      });
    }
    if (action === "reject") {
      requestRecord.status = "Rejected";
      requestRecord.rejected_by = session.name || session.email;
      requestRecord.rejected_at = new Date().toISOString();
      writeAudit(db, "Password reset rejected", session, "Administration & Governance", requestRecord.user_email, `Request ID: ${requestId}`);
      writeDb(db);
      return json(res, 200, { ok: true, request: requestRecord });
    }
    if (action === "mark_completed") {
      requestRecord.status = "Used";
      requestRecord.completed_at = requestRecord.completed_at || new Date().toISOString();
      requestRecord.completed_by = session.name || session.email;
      writeAudit(db, "Password reset marked completed", session, "Administration & Governance", requestRecord.user_email, `Request ID: ${requestId}`);
      writeDb(db);
      return json(res, 200, { ok: true, request: requestRecord });
    }
    if (action === "force_change") {
      member.mustChangePassword = true;
      member.passwordResetRequested = true;
      member.updated_at = new Date().toISOString();
      requestRecord.status = "Force Change Required";
      requestRecord.approved_by = session.name || session.email;
      requestRecord.approved_at = requestRecord.approved_at || new Date().toISOString();
      writeAudit(db, "Forced password change", session, "Administration & Governance", requestRecord.user_email, `Request ID: ${requestId}`);
      writeDb(db);
      return json(res, 200, { ok: true, request: requestRecord });
    }
    if (action === "approve") {
      requestRecord.status = "Approved";
      requestRecord.approved_by = session.name || session.email;
      requestRecord.approved_at = new Date().toISOString();
      writeAudit(db, "Password reset approved", session, "Administration & Governance", requestRecord.user_email, `Request ID: ${requestId}`);
      writeDb(db);
      return json(res, 200, { ok: true, request: requestRecord });
    }
    if (action === "send_link") {
      const resetToken = crypto.randomBytes(32).toString("base64url");
      const tokenRecord = {
        id: crypto.randomUUID(),
        token_hash: tokenHash(resetToken),
        user_id: member.id,
        email: member.email,
        request_id: requestRecord.id,
        expires_at: new Date(Date.now() + settings.passwordResetMinutes * 60 * 1000).toISOString(),
        used_at: null,
        created_at: new Date().toISOString(),
        created_by: session.email,
      };
      db.password_reset_tokens.push(tokenRecord);
      requestRecord.status = "Reset Link Sent";
      requestRecord.approved_by = requestRecord.approved_by || session.name || session.email;
      requestRecord.approved_at = requestRecord.approved_at || new Date().toISOString();
      requestRecord.reset_token_id = tokenRecord.id;
      const resetUrl = `${process.env.PUBLIC_BASE_URL || `http://localhost:${port}`}/?resetToken=${encodeURIComponent(resetToken)}`;
      const emailResult = await sendPlatformEmail(db, {
        to: member.email,
        subject: "Interactive Security password reset link",
        type: "password_reset_user_link",
        reference: requestRecord.id,
        text: [
          `Hello ${member.name || member.email},`,
          "",
          "Your password reset request has been approved.",
          `Reset link: ${resetUrl}`,
          `This link expires at: ${new Date(tokenRecord.expires_at).toLocaleString("en-ZA")}`,
          "",
          "If you did not request this reset, please contact an administrator immediately.",
        ].join("\n"),
      });
      requestRecord.user_email_status = emailResult.ok ? "Sent" : "Failed";
      requestRecord.user_email_error = emailResult.error || "";
      writeAudit(db, emailResult.ok ? "Password reset link sent" : "Password reset link email failed", session, "Administration & Governance", requestRecord.user_email, emailResult.ok ? "User reset link sent" : emailResult.error);
      writeDb(db);
      return json(res, 200, {
        ok: true,
        request: requestRecord,
        resetLink: process.env.NODE_ENV === "production" ? undefined : resetUrl,
      });
    }
    return json(res, 400, { error: "Unknown password reset action." });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/password-reset-requests/generate-otp") {
    const session = getSession(req);
    if (!hasPermission(session, "administration_governance")) return json(res, 403, { error: "Access denied" });
    const body = await readBody(req);
    const userId = String(body.userId || "");
    const db = readDb();
    const member = db.members.find((m) => m.id === userId || normalizeEmail(m.email) === normalizeEmail(body.email || ""));
    if (!member) return json(res, 404, { error: "Member not found." });
    resetDebug("direct admin otp requested", { userId, email: member.email, admin: session.email });
    const accountStatus = String(member.inviteStatus || member.status || "").toLowerCase();
    if (["disabled", "archived", "deactivated"].includes(accountStatus)) {
      return json(res, 403, { error: "Deactivated users cannot receive password reset OTPs." });
    }
    const permissions = persistentPermissionsForMember(member).permissions;
    const hubs = [
      permissions.includes("quotation_hub") ? "Quotation Hub" : "",
      permissions.includes("finance_age_analysis") ? "Finance Balances and Age Analysis" : "",
      permissions.includes("administration_governance") ? "Administration & Governance" : "",
    ].filter(Boolean);
    const otp = generateSixDigitOtp();
    const now = new Date();
    (db.password_reset_requests || []).forEach((request) => {
      if ((request.user_id === member.id || normalizeEmail(request.user_email) === normalizeEmail(member.email)) && request.otp_hash && !request.otp_used_at && !["Rejected", "Used", "Completed", "Expired"].includes(request.status || "")) {
        request.status = "Expired";
        request.expired_at = now.toISOString();
      }
    });
    const requestRecord = {
      id: crypto.randomUUID(),
      user_id: member.id,
      user_name: member.name || member.email,
      user_email: member.email,
      requested_at: now.toISOString(),
      status: "OTP Generated",
      approved_by: session.name || session.email,
      approved_at: now.toISOString(),
      rejected_by: "",
      rejected_at: "",
      completed_at: "",
      reset_token_id: "",
      otp_id: crypto.randomUUID(),
      otp_hash: hashOtp(otp),
      otp_generated_at: now.toISOString(),
      otp_expires_at: new Date(now.getTime() + PASSWORD_RESET_OTP_MINUTES * 60 * 1000).toISOString(),
      otp_used_at: "",
      otp_attempts: 0,
      otp_generated_by: session.name || session.email,
      otp_status: "Active",
      requested_ip: "",
      requested_device: "Admin generated from user profile",
      hubs,
    };
    db.password_reset_requests.unshift(requestRecord);
    member.passwordResetRequested = true;
    member.updated_at = now.toISOString();
    resetDebug("direct admin otp generated and hash saved", { requestId: requestRecord.id, userId: member.id, email: member.email, expiresAt: requestRecord.otp_expires_at });
    writeAudit(db, "OTP generated by admin", session, "Administration & Governance", member.email, `Direct user profile OTP; request ID: ${requestRecord.id}`);
    writeDb(db);
    return json(res, 200, {
      ok: true,
      request: { ...requestRecord, otp_hash: undefined },
      otp,
      expiresAt: requestRecord.otp_expires_at,
    });
  }

  if (req.method === "GET" && url.pathname === "/api/auth/session") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    return json(res, 200, { user: session });
  }

  // ── Member search ─────────────────────────────────────────────────────────
  if (req.method === "GET" && url.pathname === "/api/members/search") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!["sales_quotation_requests", "build_quotation", "approval", "setup"].some((p) => hasPermission(session, p))) {
      return json(res, 403, { error: "Access denied" });
    }
    const query = (url.searchParams.get("query") || "").trim().toLowerCase();
    const db = readDb();
    const activeMembers = db.members
      .filter((m) => (m.inviteStatus || "Active") !== "Disabled")
      .filter((m) => !query || [m.name, m.email, m.phone, m.branch, m.department].filter(Boolean).join(" ").toLowerCase().includes(query))
      .slice(0, 20)
      .map((m) => ({ id: m.id, name: m.name, email: m.email, phone: m.phone || "", branch: m.branch || "", department: m.department || "" }));
    return json(res, 200, { members: activeMembers });
  }

  // ── Save member ───────────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/members") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "member_access_management")) return json(res, 403, { error: "Access denied" });

    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const tempPassword = String(body.temporaryPassword || "");
    if (!email || !body.name) return json(res, 400, { error: "Member name and email are required." });

    const db = readDb();
    const existing = db.members.find((m) => normalizeEmail(m.email) === email && m.id !== body.id);
    if (existing) return json(res, 409, { error: "A member with this email address already exists." });

    let password_hash = "";
    if (tempPassword) {
      try { password_hash = hashPassword(tempPassword); }
      catch (error) { return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] }); }
    }

    const now = new Date().toISOString();
    const id = body.id || email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const index = db.members.findIndex((m) => m.id === id || normalizeEmail(m.email) === email);
    const previous = index >= 0 ? db.members[index] : {};
    const role = normalizeRole(body.role || body.access || previous.role || "Sales Representative");
    const permissions = sanitizePermissions(Array.isArray(body.permissions) ? body.permissions : (previous.permissions || defaultPermissionsForRole(role)));

    const member = {
      ...previous,
      id,
      name: String(body.name || previous.name || email),
      email,
      phone: body.phone !== undefined ? body.phone : (previous.phone || ""),
      branch: body.branch !== undefined ? body.branch : (previous.branch || ""),
      department: body.department !== undefined ? body.department : (previous.department || ""),
      role,
      access: role,
      permissions,
      permissionsExplicit: true,
      inviteStatus: body.inviteStatus || body.status || previous.inviteStatus || previous.status || "Invite Sent",
      status: body.status || body.inviteStatus || previous.status || previous.inviteStatus || "Invite Sent",
      mustChangePassword: password_hash ? true : Boolean(previous.mustChangePassword),
      // Only update password_hash if a new one was provided; preserve existing otherwise
      password_hash: password_hash || previous.password_hash || "",
      passwordAlgorithm: password_hash ? "bcrypt" : (previous.passwordAlgorithm || ""),
      failedLoginAttempts: previous.failedLoginAttempts || 0,
      lockedUntil: previous.lockedUntil || null,
      mfaEnabled: Boolean(previous.mfaEnabled),
      mfaRequired: Boolean(previous.mfaRequired),
      created_at: previous.created_at || now,
      updated_at: now,
    };

    if (index >= 0) db.members[index] = member;
    else db.members.push(member);

    const previousSummary = previous.email
      ? `${normalizeRole(previous.role || previous.access)}: ${(previous.permissions || []).join(", ") || "role defaults"}`
      : "new member";
    const newSummary = `${role}: ${permissions.join(", ") || "no modules selected"}`;
    writeAudit(db, index >= 0 ? "Updated member access" : "Member invite sent", session, "Setup - Member access", email, `${previousSummary} -> ${newSummary}`);
    writeDb(db);
    return json(res, 200, { member: publicUser(member) });
  }

  // ── SSO create token ──────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/members/remove") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "member_access_management")) return json(res, 403, { error: "Access denied" });
    const body = await readBody(req);
    const memberId = String(body.memberId || "");
    const db = readDb();
    const member = db.members.find((m) => m.id === memberId || normalizeEmail(m.email) === normalizeEmail(body.email || ""));
    if (!member) return json(res, 404, { error: "Member not found." });
    if (normalizeRole(member.role || member.access) === "Super Admin" && normalizeRole(session.role) !== "Super Admin") {
      return json(res, 403, { error: "Only Super Admin users may remove Super Admin accounts." });
    }
    const oldStatus = member.inviteStatus || member.status || "Active";
    const now = new Date().toISOString();
    member.inviteStatus = "Archived";
    member.status = "Archived";
    member.archivedAt = now;
    member.archivedBy = session.name || session.email;
    member.deactivatedAt = member.deactivatedAt || now;
    member.deactivatedBy = member.deactivatedBy || session.name || session.email;
    member.removedAt = now;
    member.removedBy = session.name || session.email;
    member.loginRevokedAt = now;
    member.updated_at = now;
    db.sessions = (db.sessions || []).filter((s) => s.userId !== member.id && normalizeEmail(s.email) !== normalizeEmail(member.email));
    writeAudit(db, "Member removed", session, "Administration & Governance", member.email, `${oldStatus} -> Archived`);
    writeDb(db);
    return json(res, 200, { ok: true, member: publicMemberRecord(member) });
  }

  if (req.method === "POST" && url.pathname === "/api/members/readd") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "member_access_management")) return json(res, 403, { error: "Access denied" });
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const name = String(body.name || "").trim();
    if (!email || !name) return json(res, 400, { error: "Member name and email are required." });
    const db = readDb();
    const now = new Date().toISOString();
    const role = normalizeRole(body.role || body.access || "Read Only");
    const permissions = sanitizePermissions(Array.isArray(body.permissions) ? body.permissions : defaultPermissionsForRole(role));
    const index = db.members.findIndex((m) => normalizeEmail(m.email) === email || m.id === body.id);
    const previous = index >= 0 ? db.members[index] : {};
    const tempPassword = generateTemporaryPassword();
    let password_hash;
    try { password_hash = hashPassword(tempPassword); }
    catch (error) { return json(res, 500, { error: "Temporary password could not be generated." }); }
    const id = previous.id || body.id || email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const oldStatus = previous.inviteStatus || previous.status || "New";
    const member = {
      ...previous,
      id,
      name,
      email,
      position: body.position !== undefined ? String(body.position || "") : (previous.position || ""),
      department: body.department !== undefined ? String(body.department || "") : (previous.department || ""),
      phone: body.phone !== undefined ? String(body.phone || "") : (previous.phone || ""),
      branch: body.branch !== undefined ? String(body.branch || "") : (previous.branch || ""),
      role,
      access: role,
      permissions,
      permissionsExplicit: true,
      inviteStatus: "Active",
      status: "Active",
      password_hash,
      passwordAlgorithm: "bcrypt",
      mustChangePassword: true,
      temporaryPasswordCreatedAt: now,
      temporaryPasswordCreatedBy: session.name || session.email,
      temporaryPasswordUsed: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      readdedAt: now,
      readdedBy: session.name || session.email,
      removedAt: "",
      removedBy: "",
      archivedAt: "",
      archivedBy: "",
      deactivatedAt: "",
      deactivatedBy: "",
      created_at: previous.created_at || now,
      updated_at: now,
    };
    if (index >= 0) db.members[index] = member;
    else db.members.push(member);
    writeAudit(db, index >= 0 ? "Member re-added" : "Member added", session, "Administration & Governance", email, `${oldStatus} -> Active`);
    writeAudit(db, "Temporary password generated", session, "Administration & Governance", email, "One-time password generated and hashed");
    writeAudit(db, "Hub permissions assigned", session, "Administration & Governance", email, permissions.join(", ") || "No permissions selected");
    const loginUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${port}`;
    const emailResult = await sendPlatformEmail(db, {
      to: email,
      subject: "Your Interactive Security Hub temporary password",
      type: "member_temporary_password",
      reference: email,
      text: [
        `Hello ${name},`,
        "",
        "Your Interactive Security Hub account has been created.",
        `Login URL: ${loginUrl}`,
        `Temporary one-time password: ${tempPassword}`,
        "",
        "You must change this password immediately after login.",
        "This temporary password can only be used for the first login and will not be shown again.",
      ].join("\n"),
    });
    member.temporaryPasswordEmailStatus = emailResult.ok ? "Sent" : "Failed";
    member.temporaryPasswordEmailError = emailResult.error || "";
    writeAudit(db, emailResult.ok ? "Temporary password email sent" : "Temporary password email failed", session, "Administration & Governance", email, emailResult.ok ? "Temporary password sent to user email" : emailResult.error);
    writeDb(db);
    return json(res, 200, {
      ok: true,
      member: publicMemberRecord(member),
      emailStatus: member.temporaryPasswordEmailStatus,
      emailError: member.temporaryPasswordEmailError,
      temporaryPassword: emailResult.ok ? undefined : tempPassword,
    });
  }

  if (req.method === "POST" && url.pathname === "/api/sso/create-token") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    const body = await readBody(req);
    const hubSlug = body.hubSlug;
    console.log("[sso] create-token requested", { userId: session.userId, hubSlug });
    if (!canAccessHub(session, hubSlug)) return json(res, 403, { error: "Access denied" });
    const db = readDb();
    const token = crypto.randomBytes(48).toString("base64url");
    const record = {
      id: crypto.randomUUID(),
      token,
      user_id: session.userId,
      user: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
        permissions: session.permissions,
        permissionsExplicit: session.permissionsExplicit,
      },
      hub_slug: hubSlug,
      expires_at: new Date(Date.now() + 60 * 1000).toISOString(),
      used_at: null,
      created_at: new Date().toISOString(),
    };
    db.sso_tokens.push(record);
    writeDb(db);
    const redirectUrl = `${url.origin}/hubs/${hubSlug}/sso-login?token=${encodeURIComponent(token)}`;
    console.log("[sso] token created", { userId: session.userId, hubSlug });
    return json(res, 200, { redirectUrl });
  }

  // ── SSO consume token ─────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/sso/consume-token") {
    const body = await readBody(req);
    const token = body.token;
    const hubSlug = body.hubSlug;
    const db = readDb();
    const record = db.sso_tokens.find((r) => r.token === token);
    console.log("[sso] consume-token", { hubSlug });
    if (!record)                                         return json(res, 401, { error: "Token not found." });
    if (record.hub_slug !== hubSlug)                     return json(res, 401, { error: "Hub mismatch." });
    if (record.used_at)                                  return json(res, 401, { error: "Token already used." });
    if (new Date(record.expires_at) <= new Date())       return json(res, 401, { error: "Token expired." });
    record.used_at = new Date().toISOString();
    writeDb(db);
    const session = saveSession(record.user);
    setCookie(res, "interactive_security_session", session.sid);
    console.log("[sso] session created", { userId: session.userId, hubSlug });
    return json(res, 200, {
      user: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
        permissions: session.permissions,
        permissionsExplicit: session.permissionsExplicit,
      },
    });
  }

  // ── Permissions (get) ─────────────────────────────────────────────────────
  if (req.method === "GET" && url.pathname === "/api/permissions") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (session.mustChangePassword) return json(res, 403, { error: "Password change required before accessing platform permissions.", code: "PASSWORD_CHANGE_REQUIRED" });
    return json(res, 200, {
      userId: session.userId,
      role: session.role,
      permissions: session.permissions || [],
      permissionsExplicit: Boolean(session.permissionsExplicit),
    });
  }

  // ── Permissions (set) ─────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/permissions") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "member_access_management")) return json(res, 403, { error: "Access denied" });
    const body = await readBody(req);
    const db = readDb();
    const now = new Date().toISOString();
    const previous = db.user_permissions
      .filter((p) => p.user_id === body.userId && p.can_access)
      .map((p) => p.permission_key);
    const requestedPermissions = sanitizePermissions(body.permissions || []);
    db.user_permissions = db.user_permissions.filter((p) => p.user_id !== body.userId);
    requestedPermissions.forEach((permissionKey) => {
      db.user_permissions.push({ id: crypto.randomUUID(), user_id: body.userId, permission_key: permissionKey, can_access: true, created_at: now, updated_at: now });
    });
    const member = db.members.find(
      (m) => m.id === body.userId || normalizeEmail(m.email) === normalizeEmail(body.userEmail || "")
    );
    if (member) { member.permissions = requestedPermissions; member.permissionsExplicit = true; }
    writeAudit(db, "Changed member permissions", session, "Setup - Member access",
      body.userId || body.userEmail || "",
      `Previous: ${previous.join(", ") || "none"} | New: ${requestedPermissions.join(", ") || "none"}`);
    writeDb(db);
    return json(res, 200, { ok: true });
  }

  // ── First-time setup routes ───────────────────────────────────────────────
  // Permanently disabled once any member with a password_hash exists.

  if (req.method === "GET" && url.pathname === "/api/setup/status") {
    const db = readDb();
    const hasSuperAdmin = db.members && db.members.some((m) => m.password_hash && normalizeRole(m.role || m.access) === "Super Admin");
    return json(res, 200, { setupRequired: !hasSuperAdmin });
  }

  if (req.method === "POST" && url.pathname === "/api/setup/create-admin") {
    const db = readDb();
    const hasSuperAdmin = db.members && db.members.some((m) => m.password_hash && normalizeRole(m.role || m.access) === "Super Admin");
    if (hasSuperAdmin) return json(res, 403, { error: "Setup has already been completed." });

    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const name  = String(body.name || "").trim();
    const password = String(body.password || "");
    if (!email || !name || !password) return json(res, 400, { error: "Name, email and password are required." });

    let password_hash;
    try { password_hash = hashPassword(password); }
    catch (error) { return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] }); }

    const now = new Date().toISOString();
    const id  = email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const member = {
      id, name, email,
      role: "Super Admin", access: "Super Admin",
      permissions: permissionKeys, permissionsExplicit: true,
      inviteStatus: "Active",
      password_hash, passwordAlgorithm: "bcrypt",
      mustChangePassword: false, failedLoginAttempts: 0, lockedUntil: null,
      mfaEnabled: false, mfaRequired: false,
      created_at: now, updated_at: now,
    };
    db.members.push(member);
    writeAudit(db, "Created first Super Admin via setup route", member, "Authentication", email, "One-time production setup");
    writeDb(db);
    console.log(`[setup] Super Admin created: ${email}`);
    return json(res, 200, { ok: true, email });
  }

  if (req.method === "POST" && url.pathname === "/api/finance/import-opening-balances") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "finance_age_analysis")) return json(res, 403, { error: "Access denied" });
    const fileName = path.basename(url.searchParams.get("fileName") || "BALANSE.xlsx");
    if (!/\.(xlsx|xls)$/i.test(fileName)) return json(res, 400, { error: "Please upload the BALANSE Excel workbook." });
    const uploadsDir = path.join(dataDir, "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const tempPath = path.join(uploadsDir, `${crypto.randomUUID()}-${fileName}`);
    try {
      const buffer = await readRawBody(req);
      fs.writeFileSync(tempPath, buffer);
      const parsed = parseBalanseWorkbook(tempPath, session);
      const db = readDb();
      writeAudit(db, "Balance imported", session, "Finance Balances and Age Analysis", fileName, `${parsed.rows.length} BALANSE rows parsed`);
      writeDb(db);
      return json(res, 200, parsed);
    } catch (error) {
      return json(res, 500, { error: error.message || "BALANSE workbook could not be imported." });
    } finally {
      try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch {}
    }
  }

  return json(res, 404, { error: "API route not found" });
}

// ── HTTP server ───────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res);
    if (url.pathname.startsWith("/hubs/")) return serveIndex(res);
    if (url.pathname === "/reset-password") return serveIndex(res);
    if (url.pathname === "/setup") return serveSetup(res);
    return serveStatic(req, res);
  } catch (error) {
    console.error("[server error]", error);
    json(res, 500, { error: "Server error" });
  }
});

server.listen(port, () => {
  ensureDb();
  console.log(`\n✓ Interactive Security Hub running at http://localhost:${port}`);
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || "development"}`);
});
