const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("./vendor/bcrypt");

const root = __dirname;
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "app-db.json");
const port = Number(process.env.PORT || 3100);
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);
const MAX_FAILED_LOGINS = Number(process.env.MAX_FAILED_LOGINS || 5);
const LOCKOUT_MINUTES = Number(process.env.LOCKOUT_MINUTES || 30);
const SESSION_IDLE_MINUTES = Number(process.env.SESSION_IDLE_MINUTES || 30);
const SESSION_ABSOLUTE_HOURS = Number(process.env.SESSION_ABSOLUTE_HOURS || 8);
const PASSWORD_RESET_MINUTES = Number(process.env.PASSWORD_RESET_MINUTES || 30);

// ── Env-var bootstrap admin (set on Render for first deploy) ──────────────────
// Set SUPER_ADMIN_EMAIL + SUPER_ADMIN_PASSWORD in Render env vars to seed
// the first Super Admin on a fresh deployment. Once the account exists these
// vars are ignored, so they are safe to leave in place.
const BOOTSTRAP_EMAIL = (process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase();
const BOOTSTRAP_PASSWORD = (process.env.SUPER_ADMIN_PASSWORD || "").trim();
const BOOTSTRAP_NAME = (process.env.SUPER_ADMIN_NAME || "Super Admin").trim();

const permissionKeys = [
  "projections",
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
    .filter((permission) => permissionKeys.includes(permission))));
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
};

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
      security_settings: {
        maxFailedLogins: MAX_FAILED_LOGINS,
        lockoutMinutes: LOCKOUT_MINUTES,
        sessionIdleMinutes: SESSION_IDLE_MINUTES,
        sessionAbsoluteHours: SESSION_ABSOLUTE_HOURS,
        passwordResetMinutes: PASSWORD_RESET_MINUTES,
        mfaEnabled: false,
      },
    }, null, 2));
  }

  // ── Env-var bootstrap: seed Super Admin if no members exist ─────────────────
  // Only runs when SUPER_ADMIN_EMAIL + SUPER_ADMIN_PASSWORD are set AND the
  // members table is empty. Safe to run every startup — it's a no-op after.
  if (BOOTSTRAP_EMAIL && BOOTSTRAP_PASSWORD) {
    const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    if (!Array.isArray(db.members)) db.members = [];
    const alreadyExists = db.members.some(
      (m) => (m.email || "").toLowerCase() === BOOTSTRAP_EMAIL
    );
    if (!alreadyExists) {
      try {
        const hash = bcrypt.hashSync(BOOTSTRAP_PASSWORD, BCRYPT_ROUNDS);
        const now = new Date().toISOString();
        const newAdmin = {
          id: BOOTSTRAP_EMAIL.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          name: BOOTSTRAP_NAME,
          email: BOOTSTRAP_EMAIL,
          role: "Super Admin",
          access: "Super Admin",
          permissions: permissionKeys,
          permissionsExplicit: true,
          inviteStatus: "Active",
          password_hash: hash,
          passwordAlgorithm: "bcrypt",
          mustChangePassword: false,
          failedLoginAttempts: 0,
          lockedUntil: null,
          mfaEnabled: false,
          mfaRequired: false,
          created_at: now,
          updated_at: now,
        };
        db.members.push(newAdmin);
        if (!Array.isArray(db.audit_trail)) db.audit_trail = [];
        db.audit_trail.unshift({
          id: crypto.randomUUID(),
          action: "Bootstrap Super Admin created",
          detail: BOOTSTRAP_EMAIL,
          module: "Authentication",
          reference: BOOTSTRAP_EMAIL,
          notes: "Created from SUPER_ADMIN_EMAIL env var",
          user: "system",
          userName: "System",
          timestamp: now,
        });
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        console.log(`Bootstrap Super Admin created: ${BOOTSTRAP_EMAIL}`);
      } catch (err) {
        console.error("Bootstrap admin creation failed:", err.message);
      }
    }
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  let changed = false;
  ["sessions", "sso_tokens", "members", "user_permissions", "sales_quotation_requests", "sales_quotation_request_files", "email_logs", "audit_trail", "password_reset_tokens"].forEach((table) => {
    if (!Array.isArray(db[table])) {
      db[table] = [];
      changed = true;
    }
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
    const normalized = String(request.status || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    let status = "Accepted for Processing";
    if (normalized === "approved") status = "Approved";
    if (["submitted_for_approval", "pending_approval", "awaiting_approval", "completed"].includes(normalized)) {
      status = "Submitted for Approval";
    }
    if (request.status === status) return request;
    changed = true;
    return {
      ...request,
      legacy_status: request.legacy_status || request.status || "",
      status,
      updated_at: request.updated_at || new Date().toISOString(),
    };
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

// Public member fields safe to send to the admin list (no hashes/tokens)
function publicMemberForList(member) {
  const role = normalizeRole(member.role || member.access || "Read Only");
  const hasExplicit = Boolean(member.permissionsExplicit) || (Array.isArray(member.permissions) && member.permissions.length > 0);
  return {
    id: member.id,
    email: member.email,
    name: member.name || member.email,
    phone: member.phone || "",
    branch: member.branch || "",
    department: member.department || "",
    role,
    access: role,
    permissions: hasExplicit ? sanitizePermissions(member.permissions) : defaultPermissionsForRole(role),
    permissionsExplicit: hasExplicit,
    inviteStatus: member.inviteStatus || "Active",
    mustChangePassword: Boolean(member.mustChangePassword),
    mfaEnabled: Boolean(member.mfaEnabled),
    mfaRequired: Boolean(member.mfaRequired),
    created_at: member.created_at || "",
    updated_at: member.updated_at || "",
  };
}

function passwordPolicyErrors(password = "") {
  const errors = [];
  if (password.length < 12) errors.push("at least 12 characters");
  if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("one number");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("one special character");
  return errors;
}

function assertStrongPassword(password) {
  const errors = passwordPolicyErrors(password);
  if (errors.length) {
    const error = new Error(`Password must contain ${errors.join(", ")}.`);
    error.code = "WEAK_PASSWORD";
    error.details = errors;
    throw error;
  }
}

function hashPassword(password) {
  assertStrongPassword(password);
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash || !passwordHash.startsWith("$2")) return false;
  return bcrypt.compareSync(password, passwordHash);
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function securitySettings(db) {
  return {
    maxFailedLogins: Number(db.security_settings?.maxFailedLogins || MAX_FAILED_LOGINS),
    lockoutMinutes: Number(db.security_settings?.lockoutMinutes || LOCKOUT_MINUTES),
    sessionIdleMinutes: Number(db.security_settings?.sessionIdleMinutes || SESSION_IDLE_MINUTES),
    sessionAbsoluteHours: Number(db.security_settings?.sessionAbsoluteHours || SESSION_ABSOLUTE_HOURS),
    passwordResetMinutes: Number(db.security_settings?.passwordResetMinutes || PASSWORD_RESET_MINUTES),
    mfaEnabled: Boolean(db.security_settings?.mfaEnabled),
  };
}

function writeAudit(db, action, user, module = "Authentication", reference = user?.email || "", notes = "") {
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

function json(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map((cookie) => {
    const index = cookie.indexOf("=");
    return [
      decodeURIComponent(cookie.slice(0, index).trim()),
      decodeURIComponent(cookie.slice(index + 1).trim()),
    ];
  }));
}

function setCookie(res, name, value, maxAgeSeconds = 60 * 60 * 8) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax; HttpOnly${secure}`);
}

// Expire a cookie immediately
function clearCookie(res, name) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${secure}`);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function getSession(req) {
  const sid = parseCookies(req).interactive_security_session;
  if (!sid) return null;
  const db = readDb();
  const settings = securitySettings(db);
  const now = new Date();
  const session = db.sessions.find((item) => item.sid === sid);
  if (!session) return null;

  const absoluteExpired = new Date(session.expiresAt) <= now;
  const lastActivity = session.lastActivityAt ? new Date(session.lastActivityAt) : new Date(session.createdAt || 0);
  const idleExpired = now.getTime() - lastActivity.getTime() > settings.sessionIdleMinutes * 60 * 1000;
  if (absoluteExpired || idleExpired) {
    db.sessions = db.sessions.filter((item) => item.sid !== sid);
    writeAudit(db, "Session expired", session, "Authentication", session.email, absoluteExpired ? "Absolute session expiry" : "Inactive session expiry");
    writeDb(db);
    return null;
  }

  // ── FIX: verify member is still active on every request ───────────────────
  const member = db.members.find((m) => normalizeEmail(m.email) === normalizeEmail(session.email));
  if (member && member.inviteStatus === "Disabled") {
    db.sessions = db.sessions.filter((item) => item.sid !== sid);
    writeAudit(db, "Session rejected — account disabled", session, "Authentication", session.email, "Member deactivated");
    writeDb(db);
    return null;
  }

  session.role = normalizeRole(session.role || session.access || "Read Only");
  const sanitizedSessionPermissions = sanitizePermissions(session.permissions);
  session.permissions = session.permissionsExplicit ? sanitizedSessionPermissions : (sanitizedSessionPermissions.length ? sanitizedSessionPermissions : defaultPermissionsForRole(session.role));
  session.lastActivityAt = now.toISOString();
  writeDb(db);
  return session;
}

function saveSession(user) {
  const db = readDb();
  const settings = securitySettings(db);
  const sid = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const role = normalizeRole(user.role || user.access || "Read Only");
  const userPermissions = sanitizePermissions(user.permissions);
  const hasExplicitPermissions = Boolean(user.permissionsExplicit) || userPermissions.length > 0;
  const session = {
    sid,
    userId: user.userId || user.id || user.email,
    email: user.email,
    name: user.name || user.email,
    role,
    permissions: hasExplicitPermissions ? userPermissions : defaultPermissionsForRole(role),
    permissionsExplicit: hasExplicitPermissions,
    mfaEnabled: Boolean(user.mfaEnabled),
    mfaRequired: Boolean(user.mfaRequired),
    createdAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + settings.sessionAbsoluteHours * 60 * 60 * 1000).toISOString(),
  };
  db.sessions = db.sessions.filter((item) => item.email !== session.email || new Date(item.expiresAt) > new Date());
  db.sessions.push(session);

  // ── FIX: only update non-sensitive fields; never overwrite password_hash ───
  const memberIndex = db.members.findIndex((m) => m.email === session.email || m.id === session.userId);
  const safeUpdate = {
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
    permissionsExplicit: hasExplicitPermissions,
    mfaEnabled: session.mfaEnabled,
    mfaRequired: session.mfaRequired,
    updated_at: new Date().toISOString(),
  };
  if (memberIndex >= 0) {
    // Preserve password_hash, failedLoginAttempts, lockedUntil, etc.
    db.members[memberIndex] = { ...db.members[memberIndex], ...safeUpdate };
  } else {
    db.members.push({ ...safeUpdate, created_at: new Date().toISOString() });
  }
  writeDb(db);
  return session;
}

function canAccessHub(session, hubSlug) {
  if (!session) return false;
  const hubPermissionMap = {
    "quotation-hub": "quotation_hub",
    "cost-hub": "cost_hub",
    "finance-age-analysis": "finance_age_analysis",
    "fleet": "fleet_hub",
    "living-resources": "living_resources",
    "accounts-sales": "accounts_sales",
    "hr": "hr_hub",
    "technical-maintenance": "technical_maintenance",
    "payroll": "payroll_hub",
    "overtime": "overtime_hub",
    "control-room-it": "control_room_it",
    "uniforms-stores": "uniforms_stores",
    "employee-files": "employee_files",
    "administration-governance": "administration_governance",
  };
  const permKey = hubPermissionMap[hubSlug];
  if (!permKey) return false;
  return hasPermission(session, permKey);
}

function hasPermission(session, permissionKey) {
  if (!session) return false;
  const role = normalizeRole(session.role || session.access);
  if (["Super Admin", "Admin"].includes(role)) return true;
  const permissions = sanitizePermissions(session.permissions);
  const assigned = session.permissionsExplicit ? permissions : (permissions.length ? permissions : defaultPermissionsForRole(role));
  return assigned.includes(permissionKey);
}

function serveIndex(res) {
  const filePath = path.join(root, "index.html");
  res.writeHead(200, { "Content-Type": mimeTypes[".html"], "Cache-Control": "no-store" });
  res.end(fs.readFileSync(filePath));
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let cleanPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const hubAssetMatch = cleanPath.match(/^\/hubs\/[^/]+\/(.+)$/);
  if (hubAssetMatch) {
    cleanPath = `/${hubAssetMatch[1]}`;
  }
  const filePath = path.normalize(path.join(root, cleanPath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(fs.readFileSync(filePath));
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // ── POST /api/auth/login ───────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    if (!email || !password) return json(res, 400, { error: "Missing email or password" });
    const db = readDb();
    const settings = securitySettings(db);
    let member = db.members.find((item) => normalizeEmail(item.email) === email);
    const now = new Date();

    if (!member || member.inviteStatus === "Disabled") return json(res, 401, { error: "The email address or password is incorrect." });
    if (member.lockedUntil && new Date(member.lockedUntil) > now) {
      return json(res, 423, { error: `Account locked until ${member.lockedUntil}`, code: "ACCOUNT_LOCKED", lockedUntil: member.lockedUntil });
    }
    if (!member.password_hash) {
      return json(res, 403, { error: "Password reset required before this account can sign in.", code: "PASSWORD_RESET_REQUIRED" });
    }
    if (!verifyPassword(password, member.password_hash)) {
      member.failedLoginAttempts = Number(member.failedLoginAttempts || 0) + 1;
      member.lastFailedLoginAt = now.toISOString();
      if (member.failedLoginAttempts >= settings.maxFailedLogins) {
        member.lockedUntil = new Date(now.getTime() + settings.lockoutMinutes * 60 * 1000).toISOString();
        writeAudit(db, "Account locked", member, "Authentication", email, `${member.failedLoginAttempts} failed login attempts`);
      } else {
        writeAudit(db, "Failed login", member, "Authentication", email, `${member.failedLoginAttempts} failed login attempts`);
      }
      writeDb(db);
      return json(res, 401, { error: "The email address or password is incorrect.", remainingAttempts: Math.max(0, settings.maxFailedLogins - member.failedLoginAttempts) });
    }
    member.failedLoginAttempts = 0;
    member.lockedUntil = null;
    member.lastLoginAt = now.toISOString();
    member.updated_at = now.toISOString();
    writeAudit(db, "Signed in", member, "Authentication", email, member.mustChangePassword ? "Password change required" : "Successful login");
    writeDb(db);
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

  // ── POST /api/auth/logout ─────────────────────────────────────────────────
  // FIX: server-side session invalidation so logout actually works
  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    const sid = parseCookies(req).interactive_security_session;
    if (sid) {
      const db = readDb();
      const session = db.sessions.find((item) => item.sid === sid);
      if (session) {
        writeAudit(db, "Signed out", session, "Authentication", session.email, "User-initiated logout");
        db.sessions = db.sessions.filter((item) => item.sid !== sid);
        writeDb(db);
      }
    }
    clearCookie(res, "interactive_security_session");
    return json(res, 200, { ok: true });
  }

  // ── POST /api/auth/change-password ────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/auth/change-password") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    const body = await readBody(req);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const db = readDb();
    const member = db.members.find((item) => normalizeEmail(item.email) === normalizeEmail(session.email));
    if (!member) return json(res, 404, { error: "Member not found" });
    if (member.password_hash && !verifyPassword(currentPassword, member.password_hash)) {
      writeAudit(db, "Failed password change", member, "Authentication", member.email, "Current password incorrect");
      writeDb(db);
      return json(res, 401, { error: "Current password is incorrect." });
    }
    try {
      member.password_hash = hashPassword(newPassword);
    } catch (error) {
      return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
    }
    member.passwordAlgorithm = "bcrypt";
    member.mustChangePassword = false;
    member.passwordChangedAt = new Date().toISOString();
    member.failedLoginAttempts = 0;
    member.lockedUntil = null;
    writeAudit(db, "Changed password", member, "Authentication", member.email, "Password changed successfully");
    writeDb(db);
    return json(res, 200, { ok: true });
  }

  // ── POST /api/auth/request-password-reset ────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/auth/request-password-reset") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const db = readDb();
    const settings = securitySettings(db);
    const member = db.members.find((item) => normalizeEmail(item.email) === email);
    let resetToken = "";
    if (member && member.inviteStatus !== "Disabled") {
      resetToken = crypto.randomBytes(32).toString("base64url");
      db.password_reset_tokens.push({
        id: crypto.randomUUID(),
        token_hash: tokenHash(resetToken),
        user_id: member.id,
        email: member.email,
        expires_at: new Date(Date.now() + settings.passwordResetMinutes * 60 * 1000).toISOString(),
        used_at: null,
        created_at: new Date().toISOString(),
      });
      db.email_logs.push({
        id: crypto.randomUUID(),
        type: "password_reset",
        to: member.email,
        subject: "Interactive Security password reset",
        status: process.env.NODE_ENV === "production" ? "Pending email provider" : "Development token generated",
        created_at: new Date().toISOString(),
      });
      writeAudit(db, "Password reset requested", member, "Authentication", member.email, "Reset token generated");
      writeDb(db);
    }
    return json(res, 200, {
      ok: true,
      message: "If the account exists, a password reset link will be sent.",
      // Only expose resetToken outside production for local dev/testing
      resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken,
    });
  }

  // ── POST /api/auth/reset-password ─────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/auth/reset-password") {
    const body = await readBody(req);
    const resetToken = String(body.token || "");
    const newPassword = String(body.newPassword || "");
    const db = readDb();
    const record = db.password_reset_tokens.find((item) => item.token_hash === tokenHash(resetToken));
    if (!record || record.used_at || new Date(record.expires_at) <= new Date()) {
      return json(res, 401, { error: "Password reset link is invalid or expired." });
    }
    const member = db.members.find((item) => item.id === record.user_id || normalizeEmail(item.email) === normalizeEmail(record.email));
    if (!member) return json(res, 404, { error: "Member not found" });
    try {
      member.password_hash = hashPassword(newPassword);
    } catch (error) {
      return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
    }
    record.used_at = new Date().toISOString();
    member.passwordAlgorithm = "bcrypt";
    member.mustChangePassword = false;
    member.failedLoginAttempts = 0;
    member.lockedUntil = null;
    member.passwordChangedAt = new Date().toISOString();
    member.inviteStatus = "Active";
    writeAudit(db, "Password reset completed", member, "Authentication", member.email, "Password reset token consumed");
    writeDb(db);
    return json(res, 200, { ok: true });
  }

  // ── GET /api/auth/session ──────────────────────────────────────────────────
  if (req.method === "GET" && url.pathname === "/api/auth/session") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    return json(res, 200, { user: session });
  }

  // ── GET /api/members ──────────────────────────────────────────────────────
  // FIX: expose member list to admin UI so it doesn't depend solely on localStorage
  if (req.method === "GET" && url.pathname === "/api/members") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "member_access_management") && !["Super Admin", "Admin"].includes(session.role)) {
      return json(res, 403, { error: "Access denied" });
    }
    const db = readDb();
    // Include disabled members (for audit display) but never expose password hashes
    const members = db.members.map(publicMemberForList);
    return json(res, 200, { members });
  }

  // ── GET /api/members/search ───────────────────────────────────────────────
  if (req.method === "GET" && url.pathname === "/api/members/search") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!["sales_quotation_requests", "build_quotation", "approval", "setup"].some((permission) => hasPermission(session, permission))) {
      return json(res, 403, { error: "Access denied" });
    }
    const query = (url.searchParams.get("query") || "").trim().toLowerCase();
    const db = readDb();
    const activeMembers = db.members
      .filter((member) => (member.inviteStatus || "Active") !== "Disabled")
      .filter((member) => !query || [member.name, member.email, member.phone, member.branch, member.department].filter(Boolean).join(" ").toLowerCase().includes(query))
      .slice(0, 20)
      .map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone || "",
        branch: member.branch || "",
        department: member.department || "",
      }));
    return json(res, 200, { members: activeMembers });
  }

  // ── POST /api/members ─────────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/members") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "member_access_management")) return json(res, 403, { error: "Access denied" });
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const tempPassword = String(body.temporaryPassword || "");
    if (!email || !body.name) return json(res, 400, { error: "Member name and email are required." });
    const db = readDb();
    const existing = db.members.find((item) => normalizeEmail(item.email) === email && item.id !== body.id);
    if (existing) return json(res, 409, { error: "A member with this email address already exists." });
    let password_hash = "";
    if (tempPassword) {
      try {
        password_hash = hashPassword(tempPassword);
      } catch (error) {
        return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
      }
    }
    const now = new Date().toISOString();
    const id = body.id || email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const index = db.members.findIndex((item) => item.id === id || normalizeEmail(item.email) === email);
    const previous = index >= 0 ? db.members[index] : {};
    const role = normalizeRole(body.role || body.access || previous.role || "Sales Representative");
    const permissions = sanitizePermissions(Array.isArray(body.permissions) ? body.permissions : (previous.permissions || defaultPermissionsForRole(role)));
    const member = {
      ...previous,
      id,
      name: String(body.name || previous.name || email),
      email,
      phone: body.phone || previous.phone || "",
      branch: body.branch || previous.branch || "",
      department: body.department || previous.department || "",
      role,
      access: role,
      permissions,
      permissionsExplicit: true,
      inviteStatus: body.inviteStatus || previous.inviteStatus || "Invite Sent",
      mustChangePassword: password_hash ? true : Boolean(previous.mustChangePassword),
      // FIX: only update password_hash if a new temp password was given
      password_hash: password_hash || previous.password_hash || "",
      passwordAlgorithm: password_hash ? "bcrypt" : previous.passwordAlgorithm || "",
      failedLoginAttempts: 0,
      lockedUntil: null,
      mfaEnabled: Boolean(previous.mfaEnabled),
      mfaRequired: Boolean(previous.mfaRequired),
      created_at: previous.created_at || now,
      updated_at: now,
    };
    if (index >= 0) db.members[index] = member;
    else db.members.push(member);
    const previousSummary = previous.email ? `${normalizeRole(previous.role || previous.access)}: ${(previous.permissions || []).join(", ") || "role defaults"}` : "new member";
    const newSummary = `${role}: ${permissions.join(", ") || "no modules selected"}`;
    writeAudit(db, index >= 0 ? "Updated member access" : "Member invite sent", session, "Setup - Member access", email, `${previousSummary} -> ${newSummary}`);
    writeDb(db);
    return json(res, 200, { member: publicMemberForList(member) });
  }

  // ── POST /api/sso/create-token ────────────────────────────────────────────
  // ── DELETE /api/members/:id ───────────────────────────────────────────────
  // Soft-delete: sets inviteStatus to "Disabled" and expires all sessions
  if (req.method === "DELETE" && url.pathname.startsWith("/api/members/")) {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "member_access_management")) return json(res, 403, { error: "Access denied" });
    const memberId = decodeURIComponent(url.pathname.replace("/api/members/", "").trim());
    if (!memberId) return json(res, 400, { error: "Member ID required" });
    const db = readDb();
    const index = db.members.findIndex((m) => m.id === memberId || normalizeEmail(m.email) === normalizeEmail(memberId));
    if (index < 0) return json(res, 404, { error: "Member not found" });
    const target = db.members[index];
    // Prevent removing yourself
    if (normalizeEmail(target.email) === normalizeEmail(session.email)) {
      return json(res, 400, { error: "You cannot remove your own account." });
    }
    db.members[index] = { ...target, inviteStatus: "Disabled", updated_at: new Date().toISOString() };
    // Expire all active sessions for the removed member
    db.sessions = db.sessions.filter((s) => normalizeEmail(s.email) !== normalizeEmail(target.email));
    writeAudit(db, "Member removed", session, "Setup - Member access", target.email, `Disabled by ${session.email}`);
    writeDb(db);
    return json(res, 200, { ok: true, member: publicMemberForList(db.members[index]) });
  }

  // ── PATCH /api/members/:id ────────────────────────────────────────────────
  // Update a single member field (e.g. re-enable, change role)
  if (req.method === "PATCH" && url.pathname.startsWith("/api/members/")) {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "member_access_management")) return json(res, 403, { error: "Access denied" });
    const memberId = decodeURIComponent(url.pathname.replace("/api/members/", "").trim());
    const body = await readBody(req);
    const db = readDb();
    const index = db.members.findIndex((m) => m.id === memberId || normalizeEmail(m.email) === normalizeEmail(memberId));
    if (index < 0) return json(res, 404, { error: "Member not found" });
    const previous = db.members[index];
    const role = body.role ? normalizeRole(body.role) : normalizeRole(previous.role || previous.access || "Read Only");
    const permissions = Array.isArray(body.permissions) ? sanitizePermissions(body.permissions) : previous.permissions;
    const updated = {
      ...previous,
      ...(body.name !== undefined && { name: String(body.name) }),
      ...(body.role !== undefined && { role, access: role }),
      ...(body.permissions !== undefined && { permissions, permissionsExplicit: true }),
      ...(body.inviteStatus !== undefined && { inviteStatus: body.inviteStatus }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.branch !== undefined && { branch: body.branch }),
      ...(body.department !== undefined && { department: body.department }),
      updated_at: new Date().toISOString(),
    };
    db.members[index] = updated;
    if (body.inviteStatus === "Disabled") {
      db.sessions = db.sessions.filter((s) => normalizeEmail(s.email) !== normalizeEmail(previous.email));
    }
    writeAudit(db, "Member updated", session, "Setup - Member access", previous.email, `Updated by ${session.email}`);
    writeDb(db);
    return json(res, 200, { member: publicMemberForList(updated) });
  }

  if (req.method === "POST" && url.pathname === "/api/sso/create-token") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    const body = await readBody(req);
    const hubSlug = body.hubSlug;
    console.log("SSO create-token requested", { userId: session.userId, hubSlug });
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
    console.log("SSO token created", { userId: session.userId, hubSlug, redirectUrl });
    return json(res, 200, { redirectUrl });
  }

  // ── POST /api/sso/consume-token ───────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/sso/consume-token") {
    const body = await readBody(req);
    const token = body.token;
    const hubSlug = body.hubSlug;
    const db = readDb();
    const record = db.sso_tokens.find((item) => item.token === token);
    console.log("SSO token received by hub", { hubSlug });
    if (!record) return json(res, 401, { error: "token not found" });
    if (record.hub_slug !== hubSlug) return json(res, 401, { error: "hub mismatch" });
    if (record.used_at) return json(res, 401, { error: "token used already" });
    if (new Date(record.expires_at) <= new Date()) return json(res, 401, { error: "token expired" });
    record.used_at = new Date().toISOString();
    writeDb(db);
    const session = saveSession(record.user);
    setCookie(res, "interactive_security_session", session.sid);
    console.log("SSO validation passed and hub session created", { userId: session.userId, hubSlug });
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

  // ── GET /api/permissions ──────────────────────────────────────────────────
  if (req.method === "GET" && url.pathname === "/api/permissions") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    return json(res, 200, {
      userId: session.userId,
      role: session.role,
      permissions: session.permissions || [],
      permissionsExplicit: Boolean(session.permissionsExplicit),
    });
  }

  // ── POST /api/permissions ─────────────────────────────────────────────────
  if (req.method === "POST" && url.pathname === "/api/permissions") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "member_access_management")) return json(res, 403, { error: "Access denied" });
    const body = await readBody(req);
    const db = readDb();
    const now = new Date().toISOString();
    const previous = db.user_permissions
      .filter((item) => item.user_id === body.userId && item.can_access)
      .map((item) => item.permission_key);
    const requestedPermissions = sanitizePermissions(body.permissions || []);
    db.user_permissions = db.user_permissions.filter((item) => item.user_id !== body.userId);
    requestedPermissions.forEach((permissionKey) => {
      db.user_permissions.push({
        id: crypto.randomUUID(),
        user_id: body.userId,
        permission_key: permissionKey,
        can_access: true,
        created_at: now,
        updated_at: now,
      });
    });
    const member = db.members.find((item) => item.id === body.userId || normalizeEmail(item.email) === normalizeEmail(body.userEmail || ""));
    if (member) {
      member.permissions = requestedPermissions;
      member.permissionsExplicit = true;
    }
    writeAudit(db, "Changed member permissions", session, "Setup - Member access", body.userId || body.userEmail || "", `Previous: ${previous.join(", ") || "none"} | New: ${requestedPermissions.join(", ") || "none"}`);
    writeDb(db);
    return json(res, 200, { ok: true });
  }

  console.log(`[404] Unhandled API route: ${req.method} ${url.pathname}`);
  return json(res, 404, { error: "API route not found" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res);
    if (url.pathname.startsWith("/hubs/")) return serveIndex(res);
    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    json(res, 500, { error: "Server error" });
  }
});

server.listen(port, () => {
  ensureDb();
  console.log(`Interactive Security Hub running at http://localhost:${port}`);
});
