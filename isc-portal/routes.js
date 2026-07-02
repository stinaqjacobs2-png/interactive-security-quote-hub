"use strict";
// isc-portal/routes.js – all API handlers, called from server.js
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { all, get, run, transaction, nextQuoteNumber, nextRequestNumber, getSetting, setSetting } = require("../db");
const { hashPassword, verifyPassword, generateTempPassword, createSession, deleteSession, createSsoToken, consumeSsoToken, sessionCookieHeader, clearCookieHeader, getSidFromRequest } = require("../lib/auth");
const { json, readBody, requireAuth, requirePermission, hasPermission, ROLE_DEFAULT_PERMISSIONS } = require("../lib/middleware");
const { validate, LoginSchema, MemberSchema, SalesRepSchema, ClientSchema, SupplierPriceSchema, QuotationSchema, SalesRequestSchema, QuotationSettingsSchema, SsoCreateSchema, SsoConsumeSchema } = require("../lib/validation");
const { sendInvite, sendApprovalNotification, sendQuoteDecision, sendSalesRequest } = require("../lib/email");
const { upload, saveFile, streamFile, deleteFile } = require("../lib/storage");
const { streamPdf } = require("../lib/pdf");

// ── Audit helper ─────────────────────────────────────────────────

function writeAudit(session, action, detail, module_ = "", reference = "", notes = "", ip = "") {
  run(
    `INSERT INTO audit_trail (id, action, detail, module, reference, notes, member_id, member_name, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), action, detail || "", module_ || "", reference || "", notes || "", session?.userId || "", session?.name || "", ip || ""]
  );
}

// ── Member helper ────────────────────────────────────────────────

function getMemberWithPermissions(id) {
  const member = get("SELECT * FROM members WHERE id = ?", [id]);
  if (!member) return null;
  const perms = all(
    "SELECT permission_key FROM member_permissions WHERE member_id = ? AND can_access = 1",
    [id]
  ).map((r) => r.permission_key);
  return { ...member, permissions: perms };
}

// FIX: When both id and email are supplied, look them up separately and assert
// they resolve to the same member — prevents an OR-query from silently matching
// the wrong row if a crafted request supplies mismatched id/email values.
function getMemberByIdentity(identity = {}) {
  const id = String(identity.id || identity.userId || identity.memberId || "").trim();
  const email = String(identity.email || "").trim().toLowerCase();

  if (id && email) {
    const byId = get("SELECT * FROM members WHERE id = ?", [id]);
    const byEmail = get("SELECT * FROM members WHERE lower(email) = ?", [email]);
    // If both match but disagree on which row, treat as no match to avoid
    // returning the wrong member.
    if (byId && byEmail && byId.id !== byEmail.id) return null;
    return byId || byEmail;
  }
  if (id) return get("SELECT * FROM members WHERE id = ?", [id]);
  if (email) return get("SELECT * FROM members WHERE lower(email) = ?", [email]);
  return null;
}

function saveMemberPermissions(memberId, permKeys) {
  run("DELETE FROM member_permissions WHERE member_id = ?", [memberId]);
  permKeys.forEach((key) => {
    run(
      `INSERT OR REPLACE INTO member_permissions (id, member_id, permission_key, can_access)
       VALUES (?, ?, ?, 1)`,
      [uuidv4(), memberId, key]
    );
  });
}

// ── Password policy (mirrors server.js) ─────────────────────────

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
    const err = new Error(`Password must contain ${errors.join(", ")}.`);
    err.code = "WEAK_PASSWORD";
    err.details = errors;
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════

async function handleLogin(req, res) {
  const body = await readBody(req);
  const { data, error, issues } = validate(LoginSchema, body);
  if (error) return json(res, 400, { error, issues });

  const member = get("SELECT * FROM members WHERE email = ?", [data.email]);
  if (!member) return json(res, 401, { error: "Invalid email or password" });
  if (member.invite_status === "Disabled") return json(res, 403, { error: "Account disabled" });

  const valid = await verifyPassword(data.password, member.password_hash);
  if (!valid) return json(res, 401, { error: "Invalid email or password" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket?.remoteAddress || "";
  const { sid } = createSession(member, ip, req.headers["user-agent"]);

  if (!member.has_logged_in) {
    run("UPDATE members SET has_logged_in = 1, invite_status = 'Active', activated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?", [member.id]);
  }

  const fullMember = getMemberWithPermissions(member.id);
  writeAudit({ userId: member.id, name: member.name }, "Signed in", member.email, "Authentication", member.email, "", ip);

  res.setHeader("Set-Cookie", sessionCookieHeader(sid));
  return json(res, 200, {
    user: {
      userId: member.id,
      email: member.email,
      name: member.name,
      role: member.role,
      mustChangePassword: !!member.must_change_pw,
      permissions: fullMember.permissions,
    },
  });
}

async function handleChangePassword(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  const body = await readBody(req);
  const member = getMemberByIdentity(session);
  if (!member) return json(res, 404, { error: "Member not found" });

  if (member.password_hash) {
    const valid = await verifyPassword(body.currentPassword || "", member.password_hash);
    if (!valid) return json(res, 401, { error: "Current password is incorrect" });
  }

  // FIX: enforce the same 12-char + complexity policy used in server.js
  try {
    assertStrongPassword(body.newPassword || "");
  } catch (err) {
    return json(res, 400, { error: err.message, code: err.code || "WEAK_PASSWORD", details: err.details || [] });
  }

  const hash = await hashPassword(body.newPassword);
  run("UPDATE members SET password_hash = ?, must_change_pw = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?", [hash, member.id]);
  writeAudit(session, "Changed password", member.email, "Authentication");
  return json(res, 200, { ok: true });
}

function handleLogout(req, res) {
  const sid = getSidFromRequest(req);
  if (sid) deleteSession(sid);
  res.setHeader("Set-Cookie", clearCookieHeader());
  return json(res, 200, { ok: true });
}

function handleSession(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  return json(res, 200, { user: session });
}

// ═══════════════════════════════════════════════════════════════════
//  SSO ROUTES
// ═══════════════════════════════════════════════════════════════════

async function handleSsoCreateToken(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  const body = await readBody(req);
  const { data, error } = validate(SsoCreateSchema, body);
  if (error) return json(res, 400, { error });

  if (data.hubSlug === "quotation-hub" && !hasPermission(session, "quotation_hub")) {
    return json(res, 403, { error: "Access denied" });
  }

  const token = createSsoToken(session.userId, data.hubSlug);
  const origin = req.headers.origin || process.env.BASE_URL || `http://localhost:${process.env.PORT || 3100}`;
  const redirectUrl = `${origin}/hubs/${data.hubSlug}/sso-login?token=${encodeURIComponent(token)}`;
  return json(res, 200, { redirectUrl });
}

async function handleSsoConsumeToken(req, res) {
  const body = await readBody(req);
  const { data, error } = validate(SsoConsumeSchema, body);
  if (error) return json(res, 400, { error });

  const { member, error: tokenError } = consumeSsoToken(data.token, data.hubSlug);
  if (tokenError) return json(res, 401, { error: tokenError });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || "";
  const { sid } = createSession(member, ip, req.headers["user-agent"]);
  const fullMember = getMemberWithPermissions(member.id);

  res.setHeader("Set-Cookie", sessionCookieHeader(sid));
  return json(res, 200, {
    user: {
      userId: member.id,
      email: member.email,
      name: member.name,
      role: member.role,
      permissions: fullMember.permissions,
    },
  });
}

// ═══════════════════════════════════════════════════════════════════
//  MEMBERS
// ═══════════════════════════════════════════════════════════════════

function handleGetMembers(req, res) {
  const session = requirePermission(req, res, "member_access_management");
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const query = (url.searchParams.get("query") || "").trim().toLowerCase();
  let members = all("SELECT * FROM members ORDER BY name");
  if (query) {
    members = members.filter((m) =>
      [m.name, m.email, m.phone, m.branch, m.department].filter(Boolean).join(" ").toLowerCase().includes(query)
    );
  }
  const result = members.map((m) => {
    const perms = all("SELECT permission_key FROM member_permissions WHERE member_id = ? AND can_access = 1", [m.id]).map((r) => r.permission_key);
    return { ...m, permissions: perms };
  });
  return json(res, 200, { members: result });
}

async function handleSaveMember(req, res) {
  const session = requirePermission(req, res, "member_access_management");
  if (!session) return;
  const body = await readBody(req);
  const { data, error, issues } = validate(MemberSchema, body);
  if (error) return json(res, 400, { error, issues });

  const url = new URL(req.url, "http://localhost");
  const editId = url.searchParams.get("id") || body.id || body.userId || null;
  const existing = getMemberByIdentity({ id: editId, userId: body.userId, email: data.email });
  const id = existing?.id || editId || uuidv4();

  // Check email uniqueness
  const dup = get("SELECT id FROM members WHERE email = ? AND id != ?", [data.email, id]);
  if (dup) return json(res, 409, { error: "A member with this email already exists" });

  let passwordHash = existing?.password_hash || null;
  let mustChangePw = existing?.must_change_pw ?? 1;
  let tempPw = null;

  if (data.tempPassword) {
    passwordHash = await hashPassword(data.tempPassword);
    mustChangePw = 1;
    tempPw = data.tempPassword;
  }

  transaction(() => {
    if (existing) {
      run(
        `UPDATE members SET name=?, email=?, role=?, invite_status=?, password_hash=?, must_change_pw=?, phone=?, branch=?, department=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`,
        [data.name, data.email, data.role, data.inviteStatus, passwordHash, mustChangePw, data.phone || "", data.branch || "", data.department || "", id]
      );
    } else {
      run(
        `INSERT INTO members (id, name, email, role, invite_status, password_hash, must_change_pw, phone, branch, department)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.name, data.email, data.role, data.inviteStatus, passwordHash, mustChangePw, data.phone || "", data.branch || "", data.department || ""]
      );
    }
    saveMemberPermissions(id, data.permissions.length ? data.permissions : (ROLE_DEFAULT_PERMISSIONS[data.role] || []));
  });

  const savedMember = getMemberWithPermissions(id);

  if (tempPw) {
    await sendInvite(savedMember, tempPw, !!existing).catch((e) => console.error("Invite email failed:", e.message));
    run("UPDATE members SET invite_status='Invite Sent', invite_sent_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?", [id]);
    writeAudit(session, existing ? "Invite resent" : "Member invite sent", data.email, "Setup - Member access", data.email, `Role: ${data.role}`);
  }

  writeAudit(session, "Saved member", data.email, "Setup - Member access", data.email);
  return json(res, 200, { member: getMemberWithPermissions(id) });
}

async function handleDeleteMember(req, res) {
  const session = requirePermission(req, res, "member_access_management");
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  if (!id) return json(res, 400, { error: "Missing id" });
  run("DELETE FROM members WHERE id = ?", [id]);
  writeAudit(session, "Deleted member", id, "Setup - Member access", id);
  return json(res, 200, { ok: true });
}

// ═══════════════════════════════════════════════════════════════════
//  SALES REPS
// ═══════════════════════════════════════════════════════════════════

function handleGetSalesReps(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  return json(res, 200, { salesReps: all("SELECT * FROM sales_reps ORDER BY name") });
}

async function handleSaveSalesRep(req, res) {
  const session = requirePermission(req, res, "setup");
  if (!session) return;
  const body = await readBody(req);
  const { data, error, issues } = validate(SalesRepSchema, body);
  if (error) return json(res, 400, { error, issues });

  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id") || body.id || uuidv4();
  const existing = get("SELECT id FROM sales_reps WHERE id = ?", [id]);

  if (existing) {
    run("UPDATE sales_reps SET name=?, email=?, phone=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?", [data.name, data.email, data.phone || "", id]);
  } else {
    run("INSERT INTO sales_reps (id, name, email, phone) VALUES (?, ?, ?, ?)", [id, data.name, data.email, data.phone || ""]);
  }
  writeAudit(session, "Saved sales rep", data.name, "Setup - Sales reps");
  return json(res, 200, { salesRep: get("SELECT * FROM sales_reps WHERE id = ?", [id]) });
}

async function handleDeleteSalesRep(req, res) {
  const session = requirePermission(req, res, "setup");
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  if (!id) return json(res, 400, { error: "Missing id" });
  run("DELETE FROM sales_reps WHERE id = ?", [id]);
  writeAudit(session, "Deleted sales rep", id, "Setup - Sales reps");
  return json(res, 200, { ok: true });
}

// ═══════════════════════════════════════════════════════════════════
//  CLIENTS
// ═══════════════════════════════════════════════════════════════════

function handleGetClients(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  return json(res, 200, { clients: all("SELECT * FROM clients ORDER BY name") });
}

async function handleSaveClient(req, res) {
  const session = requirePermission(req, res, "setup");
  if (!session) return;
  const body = await readBody(req);
  const { data, error, issues } = validate(ClientSchema, body);
  if (error) return json(res, 400, { error, issues });
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id") || body.id || uuidv4();
  const existing = get("SELECT id FROM clients WHERE id = ?", [id]);
  if (existing) {
    run("UPDATE clients SET name=?, address=?, contact=?, email=?, phone=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?", [data.name, data.address || "", data.contact || "", data.email || "", data.phone || "", id]);
  } else {
    run("INSERT INTO clients (id, name, address, contact, email, phone) VALUES (?, ?, ?, ?, ?, ?)", [id, data.name, data.address || "", data.contact || "", data.email || "", data.phone || ""]);
  }
  writeAudit(session, "Saved client", data.name, "Setup - Client information");
  return json(res, 200, { client: get("SELECT * FROM clients WHERE id = ?", [id]) });
}

async function handleDeleteClient(req, res) {
  const session = requirePermission(req, res, "setup");
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  if (!id) return json(res, 400, { error: "Missing id" });
  run("DELETE FROM clients WHERE id = ?", [id]);
  writeAudit(session, "Deleted client", id, "Setup - Client information");
  return json(res, 200, { ok: true });
}

// ═══════════════════════════════════════════════════════════════════
//  SUPPLIER PRICES
// ═══════════════════════════════════════════════════════════════════

function handleGetSupplierPrices(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  return json(res, 200, { prices: all("SELECT * FROM supplier_prices ORDER BY supplier_name, stock_code") });
}

async function handleSaveSupplierPrice(req, res) {
  const session = requirePermission(req, res, "supplier_prices");
  if (!session) return;
  const body = await readBody(req);
  const { data, error, issues } = validate(SupplierPriceSchema, body);
  if (error) return json(res, 400, { error, issues });
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id") || body.id || uuidv4();
  const existing = get("SELECT id FROM supplier_prices WHERE id = ?", [id]);
  if (existing) {
    run("UPDATE supplier_prices SET supplier_name=?, stock_code=?, description=?, category=?, cost=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?", [data.supplierName, data.stockCode, data.description, data.category || "", data.cost, id]);
  } else {
    run("INSERT INTO supplier_prices (id, supplier_name, stock_code, description, category, cost) VALUES (?, ?, ?, ?, ?, ?)", [id, data.supplierName, data.stockCode, data.description, data.category || "", data.cost]);
  }
  writeAudit(session, "Saved supplier price", data.stockCode, "Setup - Supplier prices");
  return json(res, 200, { price: get("SELECT * FROM supplier_prices WHERE id = ?", [id]) });
}

async function handleDeleteSupplierPrice(req, res) {
  const session = requirePermission(req, res, "supplier_prices");
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  if (!id) return json(res, 400, { error: "Missing id" });
  run("DELETE FROM supplier_prices WHERE id = ?", [id]);
  writeAudit(session, "Deleted supplier price", id, "Setup - Supplier prices");
  return json(res, 200, { ok: true });
}

// ═══════════════════════════════════════════════════════════════════
//  QUOTATIONS
// ═══════════════════════════════════════════════════════════════════

function rowToQuote(row) {
  return {
    ...row,
    items: JSON.parse(row.items_json || "[]"),
    costing: JSON.parse(row.costing_json || "{}"),
    revisionHistory: JSON.parse(row.revision_history_json || "[]"),
    documents: JSON.parse(row.documents_json || "{}"),
    supplierQuotes: JSON.parse(row.supplier_quotes_json || "[]"),
  };
}

function handleGetQuotations(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const statusFilter = url.searchParams.get("status");
  let rows;
  if (statusFilter) {
    rows = all("SELECT * FROM quotations WHERE status = ? ORDER BY created_at DESC", [statusFilter]);
  } else {
    rows = all("SELECT * FROM quotations ORDER BY created_at DESC");
  }
  return json(res, 200, { quotations: rows.map(rowToQuote) });
}

async function handleSaveQuotation(req, res) {
  const session = requirePermission(req, res, "build_quotation");
  if (!session) return;
  const body = await readBody(req);
  const { data, error, issues } = validate(QuotationSchema, body);
  if (error) return json(res, 400, { error, issues });

  const quoteNumber = body.quoteNumber || nextQuoteNumber();
  const id = body.id || `${quoteNumber}-${Date.now()}`;

  const existing = get("SELECT * FROM quotations WHERE id = ?", [id]);

  const payload = [
    id, quoteNumber, data.selectedCompany,
    data.clientName, data.clientAddress, data.contactPerson, data.contactEmail, data.contactNumber,
    data.salesRep, data.quoteDate, data.validityDays, data.validUntil || "",
    data.projectSummary || "", data.additionalScope || "", data.aiInstruction || "", data.termsText || "",
    data.markupPercent,
    "Submitted for Approval",
    JSON.stringify(data.items),
    JSON.stringify(data.costing),
    data.revisionNumber, data.revisionSourceId || "",
    JSON.stringify(body.revisionHistory || []),
    JSON.stringify(data.supplierQuotes),
    data.salesRequestId || "",
    session.userId, session.userId,
    new Date().toISOString(),
  ];

  if (existing) {
    run(`UPDATE quotations SET
        selected_company=?, client_name=?, client_address=?, contact_person=?, contact_email=?, contact_number=?,
        sales_rep_id=?, quote_date=?, validity_days=?, valid_until=?,
        project_summary=?, additional_scope=?, ai_instruction=?, terms_text=?,
        markup_percent=?, status='Submitted for Approval',
        items_json=?, costing_json=?,
        revision_number=?, revision_source_id=?, revision_history_json=?,
        supplier_quotes_json=?, sales_request_id=?,
        submitted_by=?, submitted_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),
        updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id=?`,
      [data.selectedCompany, data.clientName, data.clientAddress, data.contactPerson, data.contactEmail, data.contactNumber,
       data.salesRep, data.quoteDate, data.validityDays, data.validUntil || "",
       data.projectSummary || "", data.additionalScope || "", data.aiInstruction || "", data.termsText || "",
       data.markupPercent, JSON.stringify(data.items), JSON.stringify(data.costing),
       data.revisionNumber, data.revisionSourceId || "", JSON.stringify(body.revisionHistory || []),
       JSON.stringify(data.supplierQuotes), data.salesRequestId || "",
       session.userId, id]
    );
  } else {
    run(`INSERT INTO quotations
        (id, quote_number, selected_company, client_name, client_address, contact_person, contact_email, contact_number,
         sales_rep_id, quote_date, validity_days, valid_until, project_summary, additional_scope, ai_instruction, terms_text,
         markup_percent, status, items_json, costing_json, revision_number, revision_source_id, revision_history_json,
         supplier_quotes_json, sales_request_id, created_by, submitted_by, submitted_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      payload
    );
  }

  if (data.salesRequestId) {
    run(`UPDATE sales_requests SET status='Submitted for Approval', linked_quotation_id=?,
        updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`,
      [id, data.salesRequestId]
    );
  }

  const quote = rowToQuote(get("SELECT * FROM quotations WHERE id = ?", [id]));
  const approvers = all("SELECT m.email, m.name FROM members m JOIN member_permissions mp ON mp.member_id = m.id WHERE mp.permission_key = 'approval' AND mp.can_access = 1 AND m.invite_status != 'Disabled'");
  approvers.forEach((a) => sendApprovalNotification({ ...quote, quoteNumber, submittedByName: session.name }, a.email, a.name).catch(() => {}));

  writeAudit(session, "Submitted quotation for approval", `${quoteNumber} for ${data.clientName}`, "Building Technical Quotation", quoteNumber);
  return json(res, 200, { quotation: quote });
}

async function handleDecideQuotation(req, res) {
  const session = requirePermission(req, res, "approval");
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  if (!id) return json(res, 400, { error: "Missing id" });
  const body = await readBody(req);
  const decision = body.decision;
  const reason = body.reason || "";

  if (!["approved", "rejected"].includes(decision)) return json(res, 400, { error: "Invalid decision" });

  const quote = get("SELECT * FROM quotations WHERE id = ?", [id]);
  if (!quote) return json(res, 404, { error: "Quotation not found" });

  if (decision === "approved") {
    run(`UPDATE quotations SET status='Approved', approval_status='Approved', decided_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'), decided_by=?, approved_by=?, approved_date=strftime('%Y-%m-%dT%H:%M:%fZ','now'), updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`,
      [session.userId, session.userId, id]);
  } else {
    run(`UPDATE quotations SET status='Rejected', approval_status='Rejected', rejection_reason=?, rejection_source='internal', decided_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'), decided_by=?, rejected_by=?, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`,
      [reason, session.userId, session.userId, id]);
  }

  const updatedQuote = rowToQuote(get("SELECT * FROM quotations WHERE id = ?", [id]));
  const submitter = get("SELECT email, name FROM members WHERE id = ?", [quote.submitted_by || ""]);
  if (submitter) {
    sendQuoteDecision({ ...updatedQuote, quoteNumber: quote.quote_number, clientName: quote.client_name, rejectionReason: reason }, submitter.email, decision).catch(() => {});
  }

  writeAudit(session, decision === "approved" ? "Approved quotation" : "Rejected quotation", quote.quote_number, "Approval", quote.quote_number, reason || `Decision by ${session.name}`);
  return json(res, 200, { quotation: updatedQuote });
}

async function handleUpdateQuotationOutcome(req, res) {
  const session = requirePermission(req, res, "quote_library");
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  if (!id) return json(res, 400, { error: "Missing id" });
  const body = await readBody(req);
  const allowed = ["status", "client_outcome", "client_rejection_reason", "deposit_received", "paid_in_full", "documents_json", "sent_to_client_at"];
  const updates = {};
  allowed.forEach((k) => { if (k in body) updates[k] = body[k]; });
  if (!Object.keys(updates).length) return json(res, 400, { error: "No valid fields to update" });
  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
  run(`UPDATE quotations SET ${setClauses}, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`, [...Object.values(updates), id]);
  writeAudit(session, "Updated quotation outcome", id, "Quote Library", id);
  return json(res, 200, { quotation: rowToQuote(get("SELECT * FROM quotations WHERE id = ?", [id])) });
}

// ═══════════════════════════════════════════════════════════════════
//  PDF ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

async function handleClientPdf(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  const quote = get("SELECT * FROM quotations WHERE id = ?", [id]);
  if (!quote) return json(res, 404, { error: "Not found" });
  const html = buildClientQuotationHtml(rowToQuote(quote));
  writeAudit(session, "Downloaded client PDF", quote.quote_number, "Quote Library", quote.quote_number);
  return streamPdf(html, res, `${quote.quote_number}-client.pdf`);
}

async function handleProcessedPdf(req, res) {
  const session = requirePermission(req, res, "approval");
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  const quote = get("SELECT * FROM quotations WHERE id = ?", [id]);
  if (!quote) return json(res, 404, { error: "Not found" });
  const html = buildProcessedQuotationHtml(rowToQuote(quote));
  writeAudit(session, "Downloaded processed PDF", quote.quote_number, "Approval", quote.quote_number);
  return streamPdf(html, res, `${quote.quote_number}-processed.pdf`);
}

// ── Minimal HTML builders ─────────────────────────────────────────

const COMPANIES = {
  "isc-sa": { name: "Interactive Security Consultants SA CC", registration: "1995/008708/23", vat: "4540148170", address: "24 Van Zyl Road, Steynsvlei, Muldersdrift", phone: "0861 070 007", email: "finance@interactivesecurity.co.za", website: "www.interactivesecurity.co.za", bankName: "Nedbank", accountType: "Current Account", accountNumber: "102 618 9853", branchCode: "198 765" },
  "isc-limpopo": { name: "Interactive Security Consultants Limpopo (Pty) Ltd", registration: "2012/066427/07", vat: "4020290708", address: "24 Van Zyl Road, Steynsvlei, Muldersdrift", phone: "0861 070 007", email: "christien@interactivesecurity.co.za", website: "www.interactivesecurity.co.za", bankName: "Nedbank", accountType: "Current Account", accountNumber: "1119215153", branchCode: "198 765" },
  "isc-24": { name: "Interactive Security Consultants 24 (Pty) Ltd", registration: "2020/667311/07", vat: "4030319513", address: "24 Van Zyl Road, Steynsvlei, Muldersdrift", phone: "0861 070 007", email: "christien@interactivesecurity.co.za", website: "www.interactivesecurity.co.za", bankName: "ABSA", accountType: "Current Account", accountNumber: "41 1448 0346", branchCode: "632 005" },
  "isc-converted": { name: "Interactive Security Consultants (Pty) Ltd", registration: "2012/031076/07", vat: "4430272155", address: "24 Van Zyl Road, Steynsvlei, Muldersdrift", phone: "0861 070 007", email: "angelique@interactivesecurity.co.za", website: "www.interactivesecurity.co.za", bankName: "Nedbank", accountType: "Current Account", accountNumber: "1119190142", branchCode: "198 765" },
};
const money = (v) => `R${Number(v || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function unitPrice(item, markupPercent) {
  const desc = String(item.description || "").toLowerCase();
  const noMarkup = desc.includes("consumables") || desc.includes("labour");
  const rate = noMarkup ? 0 : Number(markupPercent || 0);
  return Number(item.supplierCost || 0) * (1 + rate / 100);
}

function buildClientQuotationHtml(quote) {
  const co = COMPANIES[quote.selected_company] || {};
  const markup = Number(quote.markup_percent || 20);
  const rows = (quote.items || []).map((item) => {
    const up = unitPrice(item, markup);
    return `<tr><td>${esc(item.stockCode)}</td><td>${esc(item.description)}</td><td class="r">${money(up)}</td><td class="r">${item.quantity}</td><td class="r">${money(up * Number(item.quantity || 0))}</td></tr>`;
  });
  const subtotal = (quote.items || []).reduce((s, i) => s + unitPrice(i, markup) * Number(i.quantity || 0), 0);
  const vat = subtotal * 0.15;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#17212b;margin:22px}
    h1{font-size:18px;text-transform:uppercase;margin-bottom:4px}
    table{width:100%;border-collapse:collapse;margin:10px 0}
    th,td{border:1px solid #17212b;padding:7px}th{background:#17212b;color:#fff;text-align:left}
    .r{text-align:right}.totals{margin-left:auto;width:280px}
    .totals div{display:flex;justify-content:space-between;border:1px solid #17212b;border-top:0;padding:7px}
    .hl{background:#fff2a8;padding:2px 6px}
    @media print{button{display:none}}
  </style></head><body>
  <button onclick="window.print()">Print / Save PDF</button>
  <h1>Quotation</h1><h2>${esc(quote.quote_number)}</h2>
  <p><strong>${esc(co.name)}</strong><br><span class="hl">Reg: ${esc(co.registration)} | VAT: ${esc(co.vat)}</span></p>
  <table><thead><tr><th>Stock Code</th><th>Description</th><th>Cost Per Unit Excl. VAT</th><th>Qty</th><th>Total Excl. VAT</th></tr></thead>
  <tbody>${rows.join("")}</tbody></table>
  <div class="totals">
    <div><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
    <div><span>VAT 15%</span><strong>${money(vat)}</strong></div>
    <div><span>Total</span><strong>${money(subtotal + vat)}</strong></div>
  </div>
  <h3>Banking Details</h3>
  <p>Bank: ${esc(co.bankName)}<br>Account: ${esc(co.accountNumber)}<br>Branch: ${esc(co.branchCode)}<br>Ref: ${esc(quote.quote_number)}</p>
  </body></html>`;
}

function buildProcessedQuotationHtml(quote) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;color:#17212b;margin:24px}
    table{width:100%;border-collapse:collapse}th,td{border:1px solid #dce3ea;padding:8px}th{background:#17212b;color:#fff;text-align:left}
    @media print{button{display:none}}
  </style></head><body>
  <button onclick="window.print()">Print</button>
  <h1>Internal Processed Quotation: ${esc(quote.quote_number)}</h1>
  <p>Status: ${esc(quote.status)} | Client: ${esc(quote.client_name)}</p>
  ${buildClientQuotationHtml(quote).replace(/<button[^>]*>.*?<\/button>/i, "")}
  </body></html>`;
}

// ═══════════════════════════════════════════════════════════════════
//  FILE UPLOAD / DOWNLOAD
// ═══════════════════════════════════════════════════════════════════

async function handleFileUpload(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  const multerMiddleware = upload.array("files", 10);
  await new Promise((resolve, reject) => {
    multerMiddleware(req, res, (err) => { if (err) reject(err); else resolve(); });
  }).catch((err) => { json(res, 400, { error: err.message }); return null; });
  if (res.headersSent) return;
  const url = new URL(req.url, "http://localhost");
  const linkedTo = url.searchParams.get("linkedTo") || "";
  const linkedType = url.searchParams.get("linkedType") || "";
  const docCategory = url.searchParams.get("docCategory") || "";
  const savedFiles = [];
  for (const file of req.files || []) {
    const storageKey = await saveFile(file);
    const fileId = uuidv4();
    run(
      `INSERT INTO files (id, original_name, mime_type, size_bytes, storage_key, storage_type, linked_to, linked_type, doc_category, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fileId, file.originalname, file.mimetype, file.size, storageKey, process.env.USE_S3 === "true" ? "s3" : "local", linkedTo, linkedType, docCategory, session.userId]
    );
    savedFiles.push({ id: fileId, name: file.originalname, size: file.size, mimeType: file.mimetype });
  }
  writeAudit(session, "Uploaded files", `${savedFiles.length} file(s)`, linkedType || "Files", linkedTo);
  return json(res, 200, { files: savedFiles });
}

async function handleFileDownload(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  const mode = url.searchParams.get("mode") || "view";
  const file = get("SELECT * FROM files WHERE id = ?", [id]);
  if (!file) return json(res, 404, { error: "File not found" });
  return streamFile(file.storage_key, res, mode === "download", file.original_name);
}

async function handleDeleteFileRecord(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  const file = get("SELECT * FROM files WHERE id = ?", [id]);
  if (!file) return json(res, 404, { error: "File not found" });
  await deleteFile(file.storage_key).catch(() => {});
  run("DELETE FROM files WHERE id = ?", [id]);
  writeAudit(session, "Deleted file", file.original_name, "Files", id);
  return json(res, 200, { ok: true });
}

function handleGetFiles(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const linkedTo = url.searchParams.get("linkedTo");
  if (!linkedTo) return json(res, 400, { error: "Missing linkedTo" });
  const files = all("SELECT * FROM files WHERE linked_to = ? ORDER BY created_at", [linkedTo]);
  return json(res, 200, { files });
}

// ═══════════════════════════════════════════════════════════════════
//  SALES REQUESTS
// ═══════════════════════════════════════════════════════════════════

function handleGetSalesRequests(req, res) {
  const session = requirePermission(req, res, "sales_quotation_requests");
  if (!session) return;
  const rows = all("SELECT sr.*, m.name as accepted_by_name FROM sales_requests sr LEFT JOIN members m ON m.id = sr.accepted_by ORDER BY sr.created_at DESC");
  return json(res, 200, { requests: rows });
}

async function handleSaveSalesRequest(req, res) {
  const session = requirePermission(req, res, "sales_quotation_requests");
  if (!session) return;
  const body = await readBody(req);
  const { data, error, issues } = validate(SalesRequestSchema, body);
  if (error) return json(res, 400, { error, issues });
  const requestNumber = nextRequestNumber();
  const id = uuidv4();
  run(`INSERT INTO sales_requests (id, request_number, client_name, client_contact_person, client_email, client_phone,
      site_project_name, site_address, sales_rep_id, sales_rep_name, sales_rep_email, sales_rep_phone,
      required_due_date, description_of_work, notes_for_builder, status, submitted_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'Accepted for Processing',?)`,
    [id, requestNumber, data.clientName, data.clientContactPerson || "", data.clientEmail || "",
     data.clientPhone || "", data.siteProjectName || "", data.siteAddress || "",
     data.salesRepId || "", data.salesRepName, data.salesRepEmail || "", data.salesRepPhone || "",
     data.requiredDueDate || "", data.descriptionOfWork || "", data.notesForBuilder || "", session.userId]
  );
  writeAudit(session, "Request submitted", requestNumber, "Sales Quotation Requests", requestNumber, data.clientName);
  const request = get("SELECT * FROM sales_requests WHERE id = ?", [id]);
  return json(res, 200, { request });
}

async function handleUpdateSalesRequest(req, res) {
  const session = requirePermission(req, res, "sales_quotation_requests");
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const id = url.searchParams.get("id");
  if (!id) return json(res, 400, { error: "Missing id" });
  const body = await readBody(req);
  const allowed = ["status", "accepted_by", "accepted_at", "linked_quotation_id", "notes_for_builder"];
  const updates = {};
  allowed.forEach((k) => { if (k in body) updates[k] = body[k]; });
  if (body.status === "Accepted for Processing" && !get("SELECT accepted_by FROM sales_requests WHERE id=?", [id])?.accepted_by) {
    updates["accepted_by"] = session.userId;
    updates["accepted_at"] = new Date().toISOString();
  }
  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
  run(`UPDATE sales_requests SET ${setClauses}, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`, [...Object.values(updates), id]);
  writeAudit(session, "Updated sales request", id, "Sales Quotation Requests", id);
  return json(res, 200, { request: get("SELECT * FROM sales_requests WHERE id = ?", [id]) });
}

// ═══════════════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════════════

function handleGetSettings(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;
  return json(res, 200, {
    profitDeductionPercent: parseFloat(getSetting("profit_deduction_percent", "16.08")),
    commissionPercent: parseFloat(getSetting("commission_percent", "4")),
  });
}

async function handleSaveSettings(req, res) {
  const session = requirePermission(req, res, "setup");
  if (!session) return;
  const body = await readBody(req);
  const { data, error, issues } = validate(QuotationSettingsSchema, body);
  if (error) return json(res, 400, { error, issues });
  setSetting("profit_deduction_percent", String(data.profitDeductionPercent));
  setSetting("commission_percent", String(data.commissionPercent));
  writeAudit(session, "Updated quotation settings", "Profit percentages", "Setup");
  return json(res, 200, { ok: true });
}

// ═══════════════════════════════════════════════════════════════════
//  AUDIT TRAIL
// ═══════════════════════════════════════════════════════════════════

function handleGetAudit(req, res) {
  const session = requirePermission(req, res, "audit_trail");
  if (!session) return;
  const url = new URL(req.url, "http://localhost");
  const memberId = url.searchParams.get("memberId") || "";
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const singleDate = url.searchParams.get("date") || "";
  let sql = "SELECT * FROM audit_trail WHERE 1=1";
  const params = [];
  if (memberId) { sql += " AND member_id = ?"; params.push(memberId); }
  if (singleDate) { sql += " AND DATE(created_at) = ?"; params.push(singleDate); }
  else {
    if (from) { sql += " AND DATE(created_at) >= ?"; params.push(from); }
    if (to)   { sql += " AND DATE(created_at) <= ?"; params.push(to); }
  }
  sql += " ORDER BY created_at DESC LIMIT 2000";
  return json(res, 200, { audit: all(sql, params) });
}

// ═══════════════════════════════════════════════════════════════════
//  QUOTE NUMBER
// ═══════════════════════════════════════════════════════════════════

function handleNextQuoteNumber(req, res) {
  const session = requirePermission(req, res, "build_quotation");
  if (!session) return;
  return json(res, 200, { quoteNumber: nextQuoteNumber() });
}

module.exports = {
  handleLogin, handleChangePassword, handleLogout, handleSession,
  handleSsoCreateToken, handleSsoConsumeToken,
  handleGetMembers, handleSaveMember, handleDeleteMember,
  handleGetSalesReps, handleSaveSalesRep, handleDeleteSalesRep,
  handleGetClients, handleSaveClient, handleDeleteClient,
  handleGetSupplierPrices, handleSaveSupplierPrice, handleDeleteSupplierPrice,
  handleGetQuotations, handleSaveQuotation, handleDecideQuotation, handleUpdateQuotationOutcome,
  handleClientPdf, handleProcessedPdf,
  handleFileUpload, handleFileDownload, handleDeleteFileRecord, handleGetFiles,
  handleGetSalesRequests, handleSaveSalesRequest, handleUpdateSalesRequest,
  handleGetSettings, handleSaveSettings,
  handleGetAudit,
  handleNextQuoteNumber,
};
