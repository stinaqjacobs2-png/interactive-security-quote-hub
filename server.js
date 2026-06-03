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
  db.sessions = db.sessions.filter((item) => item.email !== session.email || new Date(item.expiresAt) > new Date());
  db.sessions.push(session);
  const memberIndex = db.members.findIndex((member) => member.email === session.email || member.id === session.userId);
  const memberRecord = {
    id: session.userId,
    name: session.name,
    email: session.email,
    phone: user.phone || user.phoneNumber || "",
    branch: user.branch || "",
    department: user.department || "",
    inviteStatus: user.inviteStatus || "Active",
    role: session.role,
    permissions: session.permissions,
    mfaEnabled: session.mfaEnabled,
    mfaRequired: session.mfaRequired,
    updated_at: new Date().toISOString(),
  };
  if (memberIndex >= 0) db.members[memberIndex] = { ...db.members[memberIndex], ...memberRecord };
  else db.members.push({ ...memberRecord, created_at: new Date().toISOString() });
  writeDb(db);
  return session;
}

function canAccessHub(session, hubSlug) {
  if (!session || hubSlug !== "quotation-hub") return false;
  return hasPermission(session, "quotation_hub");
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

// ── First-time setup page ────────────────────────────────────────────────────
// Serves a browser form to create the first Super Admin.
// Automatically redirects to / once any user with a password exists.

function serveSetup(res) {
  const db = readDb();
  const hasUsers = db.members && db.members.some((m) => m.password_hash);
  if (hasUsers) {
    res.writeHead(302, { Location: "/" });
    res.end();
    return;
  }
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
  <p class="sub">This page is only accessible while no users exist in the database.
  It permanently disables itself as soon as the first account is created.</p>
  <form id="form">
    <label><span>Full name</span>
      <input id="name" type="text" placeholder="Jane Smith" required autocomplete="name"/>
    </label>
    <label><span>Email address</span>
      <input id="email" type="email" placeholder="admin@yourcompany.com" required autocomplete="email"/>
    </label>
    <label><span>Password</span>
      <input id="password" type="password" required autocomplete="new-password"/>
      <div class="hint">Min 12 chars &middot; uppercase &middot; lowercase &middot; number &middot; special character</div>
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
    msg.className = 'msg error';
    msg.textContent = 'Passwords do not match.';
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Creating account…';
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
      btn.disabled = false;
      btn.textContent = 'Create Super Admin account';
      return;
    }
    msg.className = 'msg success';
    msg.textContent = 'Super Admin created! Redirecting to login…';
    document.getElementById('form').style.display = 'none';
    setTimeout(() => { window.location.href = '/'; }, 2000);
  } catch (err) {
    msg.className = 'msg error';
    msg.textContent = 'Network error – please try again.';
    btn.disabled = false;
    btn.textContent = 'Create Super Admin account';
  }
});
</script>
</body>
</html>`;
  res.writeHead(200, { "Content-Type": mimeTypes[".html"], "Cache-Control": "no-store" });
  res.end(html);
}

// ── API handlers ─────────────────────────────────────────────────────────────

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

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
    return json(res, 200, { member: publicUser(member) });
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
    return json(res, 200, {
      userId: session.userId,
      role: session.role,
      permissions: session.permissions || [],
      permissionsExplicit: Boolean(session.permissionsExplicit),
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

  // ── First-time setup routes ───────────────────────────────────────────────
  // These routes are permanently disabled once any user with a password exists.

  if (req.method === "GET" && url.pathname === "/api/setup/status") {
    const db = readDb();
    const hasUsers = db.members && db.members.some((m) => m.password_hash);
    return json(res, 200, { setupRequired: !hasUsers });
  }

  if (req.method === "POST" && url.pathname === "/api/setup/create-admin") {
    const db = readDb();
    const hasUsers = db.members && db.members.some((m) => m.password_hash);
    if (hasUsers) {
      return json(res, 403, { error: "Setup has already been completed." });
    }
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const name  = String(body.name || "").trim();
    const password = String(body.password || "");
    if (!email || !name || !password) {
      return json(res, 400, { error: "Name, email and password are required." });
    }
    let password_hash;
    try {
      password_hash = hashPassword(password);
    } catch (error) {
      return json(res, 400, { error: error.message, code: error.code || "WEAK_PASSWORD", details: error.details || [] });
    }
    const now = new Date().toISOString();
    const id  = email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const member = {
      id,
      name,
      email,
      role: "Super Admin",
      access: "Super Admin",
      permissions: permissionKeys,
      permissionsExplicit: true,
      inviteStatus: "Active",
      password_hash,
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
    writeAudit(db, "Created first Super Admin via setup route", member, "Authentication", email, "One-time production setup");
    writeDb(db);
    return json(res, 200, { ok: true, email });
  }

  return json(res, 404, { error: "API route not found" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res);
    if (url.pathname.startsWith("/hubs/")) return serveIndex(res);
    if (url.pathname === "/setup") return serveSetup(res);
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
