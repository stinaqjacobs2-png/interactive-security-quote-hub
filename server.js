const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "app-db.json");
const port = Number(process.env.PORT || 3100);

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
    }, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
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
  return db.sessions.find((session) => session.sid === sid && new Date(session.expiresAt) > new Date()) || null;
}

function saveSession(user) {
  const db = readDb();
  const sid = crypto.randomBytes(32).toString("hex");
  const session = {
    sid,
    userId: user.userId || user.id || user.email,
    email: user.email,
    name: user.name || user.email,
    role: user.role || user.access || "Admin",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  };
  db.sessions = db.sessions.filter((item) => item.email !== session.email || new Date(item.expiresAt) > new Date());
  db.sessions.push(session);
  writeDb(db);
  return session;
}

function canAccessHub(session, hubSlug) {
  if (!session || hubSlug !== "quotation-hub") return false;
  return ["Admin", "Full Access Member", "Quotation Builder Only"].includes(session.role);
}

function serveIndex(res) {
  const filePath = path.join(root, "index.html");
  res.writeHead(200, { "Content-Type": mimeTypes[".html"], "Cache-Control": "no-store" });
  res.end(fs.readFileSync(filePath));
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let cleanPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  if (cleanPath.startsWith("/hubs/quotation-hub/")) {
    cleanPath = `/${cleanPath.slice("/hubs/quotation-hub/".length)}`;
  } else if (cleanPath.startsWith("/hubs/")) {
    cleanPath = `/${cleanPath.slice("/hubs/".length)}`;
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

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readBody(req);
    if (!body.email) return json(res, 400, { error: "Missing user email" });
    const session = saveSession(body);
    setCookie(res, "interactive_security_session", session.sid);
    return json(res, 200, {
      user: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  }

  if (req.method === "GET" && url.pathname === "/api/auth/session") {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: "Not signed in" });
    return json(res, 200, { user: session });
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
      },
      hub_slug: hubSlug,
      expires_at: new Date(Date.now() + 60 * 1000).toISOString(),
      used_at: null,
      created_at: new Date().toISOString(),
    };
    db.sso_tokens.push(record);
    writeDb(db);
    const redirectUrl = `${url.origin}/hubs/${hubSlug}/sso-login?token=${encodeURIComponent(token)}`;
    console.log("SSO token created", { userId: session.userId, hubSlug, token, redirectUrl });
    return json(res, 200, { redirectUrl });
  }

  if (req.method === "POST" && url.pathname === "/api/sso/consume-token") {
    const body = await readBody(req);
    const token = body.token;
    const hubSlug = body.hubSlug;
    const db = readDb();
    const record = db.sso_tokens.find((item) => item.token === token);
    console.log("SSO token received by hub", { hubSlug, token });
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
      },
    });
  }

  return json(res, 404, { error: "API route not found" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res);
    if (url.pathname === "/hubs/quotation-hub" || url.pathname === "/hubs/quotation-hub/sso-login") return serveIndex(res);
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
