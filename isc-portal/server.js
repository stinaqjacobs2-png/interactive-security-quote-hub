"use strict";
// server.js – Interactive Security Portal (production)
require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");

const { corsHeaders, securityHeaders, json } = require("./lib/middleware");
const { defaultLimiter, authLimiter } = require("./lib/rateLimit");
const routes = require("./api/routes");

const root = __dirname;
const port = Number(process.env.PORT || 3100);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".json": "application/json; charset=utf-8",
  ".ico":  "image/x-icon",
  ".svg":  "image/svg+xml",
};

// ── Static file handler ──────────────────────────────────────────

function serveStatic(req, res, urlPath) {
  let cleanPath = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
  // Rewrite hub paths to root
  if (cleanPath.startsWith("/hubs/quotation-hub/")) cleanPath = `/${cleanPath.slice("/hubs/quotation-hub/".length)}`;
  else if (cleanPath.startsWith("/hubs/")) cleanPath = `/${cleanPath.slice("/hubs/".length)}`;
  if (!cleanPath || cleanPath === "/") cleanPath = "/index.html";

  const filePath = path.normalize(path.join(root, cleanPath));
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    res.writeHead(403); res.end("Forbidden"); return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // SPA fallback: serve index.html for any unmatched route
    const indexPath = path.join(root, "index.html");
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { "Content-Type": MIME[".html"], "Cache-Control": "no-store" });
      res.end(fs.readFileSync(indexPath));
    } else {
      res.writeHead(404); res.end("Not found");
    }
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const cacheControl = [".html"].includes(ext) ? "no-store" : "public, max-age=3600";
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": cacheControl });
  res.end(fs.readFileSync(filePath));
}

// ── Router ───────────────────────────────────────────────────────

function next() { /* noop – used to satisfy rate limiter signature */ }

async function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  securityHeaders(res);
  if (corsHeaders(req, res)) return;

  // ── API routes ────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    // Auth routes get stricter rate limiting
    const limiter = pathname.startsWith("/api/auth/") ? authLimiter : defaultLimiter;
    let rateLimited = false;
    limiter(req, res, () => { rateLimited = false; });
    if (rateLimited || res.headersSent) return;

    // Route dispatch
    try {
      // Auth
      if (req.method === "POST" && pathname === "/api/auth/login")           return await routes.handleLogin(req, res);
      if (req.method === "POST" && pathname === "/api/auth/logout")          return routes.handleLogout(req, res);
      if (req.method === "POST" && pathname === "/api/auth/change-password") return await routes.handleChangePassword(req, res);
      if (req.method === "GET"  && pathname === "/api/auth/session")         return routes.handleSession(req, res);

      // SSO
      if (req.method === "POST" && pathname === "/api/sso/create-token")  return await routes.handleSsoCreateToken(req, res);
      if (req.method === "POST" && pathname === "/api/sso/consume-token") return await routes.handleSsoConsumeToken(req, res);

      // Members
      if (req.method === "GET"    && pathname === "/api/members")       return routes.handleGetMembers(req, res);
      if (req.method === "POST"   && pathname === "/api/members")       return await routes.handleSaveMember(req, res);
      if (req.method === "DELETE" && pathname === "/api/members")       return await routes.handleDeleteMember(req, res);
      if (req.method === "GET"    && pathname === "/api/members/search") return routes.handleGetMembers(req, res);

      // Sales reps
      if (req.method === "GET"    && pathname === "/api/sales-reps")   return routes.handleGetSalesReps(req, res);
      if (req.method === "POST"   && pathname === "/api/sales-reps")   return await routes.handleSaveSalesRep(req, res);
      if (req.method === "DELETE" && pathname === "/api/sales-reps")   return await routes.handleDeleteSalesRep(req, res);

      // Clients
      if (req.method === "GET"    && pathname === "/api/clients") return routes.handleGetClients(req, res);
      if (req.method === "POST"   && pathname === "/api/clients") return await routes.handleSaveClient(req, res);
      if (req.method === "DELETE" && pathname === "/api/clients") return await routes.handleDeleteClient(req, res);

      // Supplier prices
      if (req.method === "GET"    && pathname === "/api/supplier-prices") return routes.handleGetSupplierPrices(req, res);
      if (req.method === "POST"   && pathname === "/api/supplier-prices") return await routes.handleSaveSupplierPrice(req, res);
      if (req.method === "DELETE" && pathname === "/api/supplier-prices") return await routes.handleDeleteSupplierPrice(req, res);

      // Quotations
      if (req.method === "GET"   && pathname === "/api/quotations")            return routes.handleGetQuotations(req, res);
      if (req.method === "POST"  && pathname === "/api/quotations")            return await routes.handleSaveQuotation(req, res);
      if (req.method === "POST"  && pathname === "/api/quotations/decide")     return await routes.handleDecideQuotation(req, res);
      if (req.method === "PATCH" && pathname === "/api/quotations/outcome")    return await routes.handleUpdateQuotationOutcome(req, res);
      if (req.method === "GET"   && pathname === "/api/quotations/next-number") return routes.handleNextQuoteNumber(req, res);

      // PDFs
      if (req.method === "GET" && pathname === "/api/pdf/client")    return await routes.handleClientPdf(req, res);
      if (req.method === "GET" && pathname === "/api/pdf/processed") return await routes.handleProcessedPdf(req, res);

      // Files
      if (req.method === "POST"   && pathname === "/api/files")           return await routes.handleFileUpload(req, res);
      if (req.method === "GET"    && pathname === "/api/files")           return routes.handleGetFiles(req, res);
      if (req.method === "GET"    && pathname === "/api/files/download")  return await routes.handleFileDownload(req, res);
      if (req.method === "DELETE" && pathname === "/api/files")           return await routes.handleDeleteFileRecord(req, res);

      // Sales requests
      if (req.method === "GET"   && pathname === "/api/sales-requests")        return routes.handleGetSalesRequests(req, res);
      if (req.method === "POST"  && pathname === "/api/sales-requests")        return await routes.handleSaveSalesRequest(req, res);
      if (req.method === "PATCH" && pathname === "/api/sales-requests")        return await routes.handleUpdateSalesRequest(req, res);

      // Settings
      if (req.method === "GET"  && pathname === "/api/settings") return routes.handleGetSettings(req, res);
      if (req.method === "POST" && pathname === "/api/settings") return await routes.handleSaveSettings(req, res);

      // Audit
      if (req.method === "GET" && pathname === "/api/audit") return routes.handleGetAudit(req, res);

      return json(res, 404, { error: "API route not found" });

    } catch (err) {
      console.error("[API Error]", req.method, pathname, err);
      if (!res.headersSent) json(res, 500, { error: "Internal server error" });
    }
    return;
  }

  // ── SPA / hub routes → serve index.html ──────────────────────
  if (pathname === "/hubs/quotation-hub" || pathname === "/hubs/quotation-hub/sso-login") {
    res.writeHead(200, { "Content-Type": MIME[".html"], "Cache-Control": "no-store" });
    res.end(fs.readFileSync(path.join(root, "index.html")));
    return;
  }

  // ── Static assets ─────────────────────────────────────────────
  defaultLimiter(req, res, next);
  if (res.headersSent) return;
  serveStatic(req, res, pathname);
}

// ── Start ────────────────────────────────────────────────────────

http.createServer(router).listen(port, () => {
  console.log(`\n✓ Interactive Security Portal running at http://localhost:${port}`);
  console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`  Database:    ${process.env.DB_PATH || "./data/isc.db"}`);
  console.log(`  Storage:     ${process.env.USE_S3 === "true" ? "S3 / " + process.env.S3_BUCKET : "Local disk → " + (process.env.UPLOAD_DIR || "./data/uploads")}`);
  console.log(`  Email:       ${process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_CHANGE_ME" ? "Resend" : process.env.SMTP_HOST ? "SMTP" : "Console (dev mode)"}\n`);
});
