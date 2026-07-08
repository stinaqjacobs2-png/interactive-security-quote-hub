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

const hubPermissionKeys = {
  "quotation-hub": "quotation_hub",
  "cost-hub": "cost_hub",
  "finance-age-analysis": "finance_age_analysis",
  "administration-governance": "administration_governance",
  fleet: "fleet_hub",
  "living-resources": "living_resources",
  "accounts-sales": "accounts_sales",
  hr: "hr_hub",
  "technical-maintenance": "technical_maintenance",
  payroll: "payroll_hub",
  overtime: "overtime_hub",
  "control-room-it": "control_room_it",
  "uniforms-stores": "uniforms_stores",
  "employee-files": "employee_files",
};

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
    return;
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

function backupUsers(db, reason = "user-cleanup") {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(dataDir, `${reason}-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({
    created_at: new Date().toISOString(),
    reason,
    members: db.members || [],
    user_permissions: db.user_permissions || [],
    sessions: db.sessions || [],
    password_reset_tokens: db.password_reset_tokens || [],
  }, null, 2));
  return backupPath;
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

function hasConfiguredSuperAdmin(db) {
  return db.members.some((member) => (
    normalizeRole(member.role || member.access) === "Super Admin"
    && (member.inviteStatus || "Active") !== "Disabled"
    && Boolean(member.password_hash)
  ));
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

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function generateTemporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const required = ["A", "a", "7", "!"];
  return [...required, ...Array.from({ length: 10 }, () => alphabet[crypto.randomInt(0, alphabet.length)])]
    .sort(() => crypto.randomInt(-1, 2))
    .join("");
}

function publicMemberRecord(member) {
  return {
    ...publicUser(member),
    id: member.id,
    access: normalizeRole(member.access || member.role || "Read Only"),
    status: member.status || member.inviteStatus || "Active",
    inviteStatus: member.inviteStatus || member.status || "Active",
    phone: member.phone || "",
    branch: member.branch || "",
    department: member.department || "",
    position: member.position || "",
    updated_at: member.updated_at || "",
  };
}

function requireAdminSession(req, res) {
  const session = getSession(req);
  if (!session) {
    json(res, 401, { error: "Not signed in" });
    return null;
  }
  if (!hasPermission(session, "member_access_management")) {
    json(res, 403, { error: "Access denied" });
    return null;
  }
  return session;
}

function resetRequestResponse(record, member) {
  return {
    id: record.id,
    user_id: record.user_id,
    user_name: member?.name || record.email || "",
    user_email: member?.email || record.email || "",
    requested_at: record.created_at,
    status: record.status || (record.used_at ? "Completed" : "Pending"),
    approved_by: record.approved_by || "",
    requested_ip: record.requested_ip || "",
    requested_device: record.requested_device || "",
    completed_at: record.used_at || record.completed_at || "",
    otp_status: record.otp_status || "",
    otp_expires_at: record.otp_expires_at || "",
    otp_attempts: record.otp_attempts || 0,
    admin_email_status: record.admin_email_status || "",
    admin_email_error: record.admin_email_error || "",
  };
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
  db.sessions = db.sessions.filter((item) => normalizeEmail(item.email) !== normalizeEmail(session.email) || new Date(item.expiresAt) > new Date());
  db.sessions.push(session);
  // FIX: find existing member BEFORE building memberRecord so we can use their
  // stored contact fields as fallback — prevents SSO login from wiping phone/branch/department.
  const memberIndex = db.members.findIndex((member) => normalizeEmail(member.email) === normalizeEmail(session.email) || member.id === session.userId);
  const existingMember = memberIndex >= 0 ? db.members[memberIndex] : {};
  const memberRecord = {
    id: session.userId,
    name: session.name,
    email: session.email,
    phone: user.phone || user.phoneNumber || existingMember.phone || "",
    branch: user.branch || existingMember.branch || "",
    department: user.department || existingMember.department || "",
    inviteStatus: user.inviteStatus || existingMember.inviteStatus || "Active",
    role: session.role,
    permissions: session.permissions,
    mfaEnabled: session.mfaEnabled,
    mfaRequired: session.mfaRequired,
    updated_at: new Date().toISOString(),
  };
  if (memberIndex >= 0) db.members[memberIndex] = { ...existingMember, ...memberRecord };
  else db.members.push({ ...memberRecord, created_at: new Date().toISOString() });
  writeDb(db);
  return session;
}

function canAccessHub(session, hubSlug) {
  if (!session) return false;
  const role = normalizeRole(session.role || session.access);
  if (["Super Admin", "Admin"].includes(role)) return Boolean(hubPermissionKeys[hubSlug]);
  const permissionKey = hubPermissionKeys[hubSlug];
  return Boolean(permissionKey) && hasPermission(session, permissionKey);
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

  if (req.method === "GET" && url.pathname === "/api/setup/status") {
    const db = readDb();
    return json(res, 200, { setupRequired: !hasConfiguredSuperAdmin(db) });
  }

  if (req.method === "POST" && url.pathname === "/api/setup/create-admin") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const name = String(body.name || "").trim() || email;
    const password = String(body.password || "");
    if (!email || !password) return json(res, 400, { error: "Name, email, and password are required." });

    const db = readDb();
    if (hasConfiguredSuperAdmin(db)) {
      return json(res, 409, { error: "Setup is already complete. Please sign in or use Forgot password." });
    }

    let passwordHash = "";
    try {
      passwordHash = hashPassword(password);
    } catch (error) {
      return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
    }

    const now = new Date().toISOString();
    const id = email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || crypto.randomUUID();
    const memberIndex = db.members.findIndex((member) => normalizeEmail(member.email) === email || member.id === id);
    const previous = memberIndex >= 0 ? db.members[memberIndex] : {};
    const member = {
      ...previous,
      id: previous.id || id,
      name,
      email,
      role: "Super Admin",
      access: "Super Admin",
      permissions: permissionKeys,
      permissionsExplicit: false,
      inviteStatus: "Active",
      password_hash: passwordHash,
      passwordAlgorithm: "bcrypt",
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      mfaEnabled: Boolean(previous.mfaEnabled),
      mfaRequired: Boolean(previous.mfaRequired),
      created_at: previous.created_at || now,
      updated_at: now,
      passwordChangedAt: now,
    };
    if (memberIndex >= 0) db.members[memberIndex] = member;
    else db.members.push(member);
    writeAudit(db, "Completed first Super Admin setup", member, "Authentication", email, "Initial setup password created");
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
        mustChangePassword: false,
        mfaEnabled: Boolean(session.mfaEnabled),
        mfaRequired: Boolean(session.mfaRequired),
      },
    });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    if (!email || !password) return json(res, 400, { error: "Missing email or password" });
    const db = readDb();
    const settings = securitySettings(db);
    let member = db.members.find((item) => normalizeEmail(item.email) === email);
    const now = new Date();
    const hasPasswordUsers = db.members.some((item) => item.password_hash);
    if (!member && !hasPasswordUsers && process.env.NODE_ENV !== "production") {
      try {
        member = {
          id: email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          name: body.name || "System Admin",
          email,
          role: "Super Admin",
          permissions: permissionKeys,
          inviteStatus: "Active",
          password_hash: hashPassword(password),
          passwordAlgorithm: "bcrypt",
          mustChangePassword: false,
          failedLoginAttempts: 0,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          mfaEnabled: false,
        };
        db.members.push(member);
        writeAudit(db, "Created bootstrap admin", member, "Authentication", email, "Development bootstrap only");
        writeDb(db);
      } catch (error) {
        return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
      }
    }
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
        status: "Pending",
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
      resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken,
    });
  }

  if (req.method === "GET" && url.pathname === "/api/auth/password-reset-requests") {
    const session = requireAdminSession(req, res);
    if (!session) return;
    const db = readDb();
    const requests = db.password_reset_tokens
      .slice()
      .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
      .map((record) => resetRequestResponse(record, db.members.find((member) => member.id === record.user_id || normalizeEmail(member.email) === normalizeEmail(record.email))));
    return json(res, 200, {
      requests,
      emailDiagnostics: {
        provider: "Manual OTP",
        adminEmail: process.env.PASSWORD_RESET_ADMIN_EMAIL || "",
        sender: process.env.EMAIL_FROM || "",
      },
    });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/password-reset-requests/action") {
    const session = requireAdminSession(req, res);
    if (!session) return;
    const body = await readBody(req);
    const db = readDb();
    const record = db.password_reset_tokens.find((item) => item.id === body.requestId);
    if (!record) return json(res, 404, { error: "Password reset request not found." });
    const member = db.members.find((item) => item.id === record.user_id || normalizeEmail(item.email) === normalizeEmail(record.email));
    if (!member) return json(res, 404, { error: "Member not found." });
    let otp = "";
    if (body.action === "generate_otp") {
      otp = generateOtp();
      record.otp_hash = tokenHash(otp);
      record.otp_status = "Generated";
      record.otp_expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      record.status = "OTP Generated";
      record.approved_by = session.email;
    } else if (body.action === "mark_completed") {
      record.status = "Completed";
      record.completed_at = new Date().toISOString();
    } else if (body.action === "force_change") {
      member.mustChangePassword = true;
      record.status = "Force Change Required";
      record.approved_by = session.email;
    } else if (body.action === "reject") {
      record.status = "Rejected";
      record.used_at = new Date().toISOString();
      record.approved_by = session.email;
    } else {
      return json(res, 400, { error: "Unknown password reset action." });
    }
    writeAudit(db, "Updated password reset request", session, "Authentication", member.email, body.action);
    writeDb(db);
    return json(res, 200, { ok: true, otp, request: resetRequestResponse(record, member) });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/password-reset-requests/generate-otp") {
    const session = requireAdminSession(req, res);
    if (!session) return;
    const body = await readBody(req);
    const db = readDb();
    const member = db.members.find((item) => item.id === body.userId || normalizeEmail(item.email) === normalizeEmail(body.email || ""));
    if (!member) return json(res, 404, { error: "Member not found." });
    const otp = generateOtp();
    const now = new Date().toISOString();
    const record = {
      id: crypto.randomUUID(),
      token_hash: "",
      otp_hash: tokenHash(otp),
      otp_status: "Generated",
      otp_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      user_id: member.id,
      email: member.email,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      used_at: null,
      status: "OTP Generated",
      approved_by: session.email,
      created_at: now,
    };
    db.password_reset_tokens.push(record);
    writeAudit(db, "Generated password reset OTP", session, "Authentication", member.email, "OTP generated by administrator");
    writeDb(db);
    return json(res, 200, { ok: true, otp, request: resetRequestResponse(record, member) });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/reset-password") {
    const body = await readBody(req);
    const resetToken = String(body.token || "");
    const email = normalizeEmail(body.email);
    const otp = String(body.otp || "").trim();
    const newPassword = String(body.newPassword || "");
    const db = readDb();
    const record = otp
      ? db.password_reset_tokens.find((item) => normalizeEmail(item.email) === email && item.otp_hash === tokenHash(otp))
      : db.password_reset_tokens.find((item) => item.token_hash === tokenHash(resetToken));
    if (!record || record.used_at || new Date(record.expires_at) <= new Date()) {
      return json(res, 401, { error: "Password reset link is invalid or expired." });
    }
    if (otp && record.otp_expires_at && new Date(record.otp_expires_at) <= new Date()) {
      return json(res, 401, { error: "Password reset OTP is invalid or expired." });
    }
    const member = db.members.find((item) => item.id === record.user_id || normalizeEmail(item.email) === normalizeEmail(record.email));
    if (!member) return json(res, 404, { error: "Member not found" });
    try {
      member.password_hash = hashPassword(newPassword);
    } catch (error) {
      return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
    }
    record.used_at = new Date().toISOString();
    record.status = "Completed";
    if (otp) record.otp_status = "Used";
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

  if (req.method === "GET" && url.pathname === "/api/auth/session") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    return json(res, 200, { user: session });
  }

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

  if (req.method === "POST" && url.pathname === "/api/finance/import-opening-balances") {
    return json(res, 501, { error: "Excel workbook import is not enabled on this server yet. Please save the workbook as CSV and import the CSV file." });
  }

  if (req.method === "POST" && url.pathname === "/api/cost/import-entity-balances") {
    return json(res, 501, { error: "Excel workbook import is not enabled on this server yet. Please save the workbook as CSV and import the CSV file." });
  }

  if (req.method === "POST" && ["/api/users", "/api/members"].includes(url.pathname)) {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (!hasPermission(session, "member_access_management")) return json(res, 403, { error: "Access denied" });
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    if (!email || !body.name) return json(res, 400, { error: "Member name and email are required." });
    const db = readDb();
    const existing = db.members.find((item) => normalizeEmail(item.email) === email && item.id !== body.id);
    if (existing) return json(res, 409, { error: "A member with this email address already exists." });
    const now = new Date().toISOString();
    const id = body.id || email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const index = db.members.findIndex((item) => item.id === id || normalizeEmail(item.email) === email);
    const previous = index >= 0 ? db.members[index] : {};
    let tempPassword = String(body.temporaryPassword || "");
    let generatedTemporaryPassword = false;
    if (!previous.email && !tempPassword) {
      tempPassword = generateTemporaryPassword();
      generatedTemporaryPassword = true;
    }
    let password_hash = "";
    if (tempPassword) {
      try {
        password_hash = hashPassword(tempPassword);
      } catch (error) {
        return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
      }
    }
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
      password_hash: password_hash || previous.password_hash || "",
      passwordAlgorithm: password_hash ? "bcrypt" : previous.passwordAlgorithm || "",
      // FIX: preserve existing lockout state; only reset on login or explicit admin unlock action
      failedLoginAttempts: previous.failedLoginAttempts || 0,
      lockedUntil: previous.lockedUntil || null,
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
    return json(res, 200, {
      ok: true,
      member: publicUser(member),
      temporaryPassword: generatedTemporaryPassword ? tempPassword : undefined,
      emailStatus: generatedTemporaryPassword ? "Manual delivery required" : undefined,
    });
  }

  if (req.method === "POST" && url.pathname === "/api/members/remove") {
    const session = requireAdminSession(req, res);
    if (!session) return;
    const body = await readBody(req);
    const db = readDb();
    const member = db.members.find((item) => item.id === body.memberId || normalizeEmail(item.email) === normalizeEmail(body.email || ""));
    if (!member) return json(res, 404, { error: "Member not found." });
    if (normalizeEmail(member.email) === normalizeEmail(session.email)) return json(res, 400, { error: "You cannot remove your own account." });
    member.inviteStatus = "Disabled";
    member.status = "Disabled";
    member.archivedAt = new Date().toISOString();
    member.archivedBy = session.email;
    member.updated_at = new Date().toISOString();
    writeAudit(db, "Removed member", session, "Setup - Member access", member.email, "Member disabled by administrator");
    writeDb(db);
    return json(res, 200, { ok: true, member: publicMemberRecord(member) });
  }

  if (req.method === "POST" && url.pathname === "/api/members/readd") {
    const session = requireAdminSession(req, res);
    if (!session) return;
    const body = await readBody(req);
    const db = readDb();
    const existing = db.members.find((item) => item.id === body.memberId || item.id === body.id || normalizeEmail(item.email) === normalizeEmail(body.email || ""));
    const email = normalizeEmail(body.email || existing?.email || "");
    if (!email) return json(res, 400, { error: "Member email is required." });
    const temporaryPassword = generateTemporaryPassword();
    const role = normalizeRole(body.role || body.access || existing?.role || "Sales Representative");
    const now = new Date().toISOString();
    const member = {
      ...(existing || {}),
      id: existing?.id || body.id || email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name: body.name || existing?.name || email,
      email,
      role,
      access: role,
      permissions: sanitizePermissions(Array.isArray(body.permissions) ? body.permissions : (existing?.permissions || defaultPermissionsForRole(role))),
      permissionsExplicit: Boolean(body.permissionsExplicit ?? existing?.permissionsExplicit),
      inviteStatus: "Active",
      status: "Active",
      password_hash: hashPassword(temporaryPassword),
      passwordAlgorithm: "bcrypt",
      mustChangePassword: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      reactivatedAt: now,
      reactivatedBy: session.email,
      updated_at: now,
      created_at: existing?.created_at || now,
    };
    const index = db.members.findIndex((item) => item.id === member.id || normalizeEmail(item.email) === email);
    if (index >= 0) db.members[index] = member;
    else db.members.push(member);
    writeAudit(db, "Re-added member", session, "Setup - Member access", member.email, "Member reactivated by administrator");
    writeDb(db);
    return json(res, 200, { ok: true, member: publicMemberRecord(member), temporaryPassword, emailStatus: "Manual delivery required" });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/reset-members") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    if (normalizeRole(session.role || session.access) !== "Super Admin") return json(res, 403, { error: "Only Super Admin users may reset members." });
    const db = readDb();
    const christienEmail = "christien@interactivesecurity.co.za";
    const christien = db.members.find((member) => normalizeEmail(member.email) === christienEmail);
    if (!christien) return json(res, 404, { error: "Christien Jacobs was not found in the member database. Create or restore Christien before running the cleanup." });
    const backupPath = backupUsers(db, "user-cleanup-before-christien-reset");
    const membersRemoved = db.members.filter((member) => normalizeEmail(member.email) !== christienEmail).length;
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
    writeAudit(db, "One-time Christien user cleanup", session, "Administration & Governance", christienEmail, `Backed up users to ${path.basename(backupPath)}. Removed ${membersRemoved} member(s).`);
    writeDb(db);
    return json(res, 200, { ok: true, membersRemoved, backupFile: path.basename(backupPath), member: publicMemberRecord(christien), members: [publicMemberRecord(christien)] });
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

  if (req.method === "GET" && url.pathname === "/api/permissions") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    // FIX: read live permissions from the member record rather than the session
    // object, so admin permission changes take effect without requiring re-login.
    const db = readDb();
    const member = db.members.find(
      (m) => m.id === session.userId || normalizeEmail(m.email) === normalizeEmail(session.email)
    );
    const role = normalizeRole(member?.role || session.role);
    const permissions = member
      ? sanitizePermissions(member.permissions)
      : sanitizePermissions(session.permissions);
    const permissionsExplicit = Boolean(member?.permissionsExplicit ?? session.permissionsExplicit);
    return json(res, 200, {
      userId: session.userId,
      role,
      permissions,
      permissionsExplicit,
    });
  }

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
    if (member) member.permissions = requestedPermissions;
    if (member) member.permissionsExplicit = true;
    writeAudit(db, "Changed member permissions", session, "Setup - Member access", body.userId || body.userEmail || "", `Previous: ${previous.join(", ") || "none"} | New: ${requestedPermissions.join(", ") || "none"}`);
    writeDb(db);
    return json(res, 200, { ok: true });
  }

  return json(res, 404, { error: "API route not found" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res);
    if (url.pathname.startsWith("/hubs/")) return serveIndex(res);
    if (["/setup", "/reset-password"].includes(url.pathname)) return serveIndex(res);
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
