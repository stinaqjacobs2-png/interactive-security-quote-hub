"use strict";
// db/migrate.js – run once: node db/migrate.js
// Re-running is safe (CREATE TABLE IF NOT EXISTS).

require("dotenv").config();
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = process.env.DB_PATH || "./data/isc.db";
fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  -- ── Members / auth ────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS members (
    id                TEXT PRIMARY KEY,
    name              TEXT NOT NULL,
    email             TEXT NOT NULL UNIQUE,
    password_hash     TEXT,
    must_change_pw    INTEGER NOT NULL DEFAULT 1,
    has_logged_in     INTEGER NOT NULL DEFAULT 0,
    role              TEXT NOT NULL DEFAULT 'Quotation Builder Only',
    invite_status     TEXT NOT NULL DEFAULT 'Pending',
    invite_sent_at    TEXT,
    activated_at      TEXT,
    branch            TEXT,
    department        TEXT,
    phone             TEXT,
    created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS member_permissions (
    id             TEXT PRIMARY KEY,
    member_id      TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    permission_key TEXT NOT NULL,
    can_access     INTEGER NOT NULL DEFAULT 1,
    created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    UNIQUE(member_id, permission_key)
  );

  -- ── Sessions / SSO ─────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS sessions (
    sid         TEXT PRIMARY KEY,
    member_id   TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    expires_at  TEXT NOT NULL,
    ip          TEXT,
    user_agent  TEXT,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS sso_tokens (
    id          TEXT PRIMARY KEY,
    token       TEXT NOT NULL UNIQUE,
    member_id   TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    hub_slug    TEXT NOT NULL,
    expires_at  TEXT NOT NULL,
    used_at     TEXT,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- ── Sales reps ─────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS sales_reps (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    phone      TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- ── Clients ────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS clients (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    address    TEXT,
    contact    TEXT,
    email      TEXT,
    phone      TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- ── Supplier prices ────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS supplier_prices (
    id            TEXT PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    stock_code    TEXT NOT NULL,
    description   TEXT NOT NULL,
    category      TEXT,
    cost          REAL NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    UNIQUE(supplier_name, stock_code)
  );

  -- ── Quotations ─────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS quotations (
    id                   TEXT PRIMARY KEY,
    quote_number         TEXT NOT NULL UNIQUE,
    selected_company     TEXT NOT NULL,
    client_name          TEXT,
    client_address       TEXT,
    contact_person       TEXT,
    contact_email        TEXT,
    contact_number       TEXT,
    sales_rep_id         TEXT REFERENCES sales_reps(id),
    quote_date           TEXT,
    validity_days        INTEGER DEFAULT 30,
    valid_until          TEXT,
    project_summary      TEXT,
    additional_scope     TEXT,
    ai_instruction       TEXT,
    terms_text           TEXT,
    markup_percent       REAL DEFAULT 20,
    status               TEXT NOT NULL DEFAULT 'Submitted for Approval',
    items_json           TEXT NOT NULL DEFAULT '[]',
    costing_json         TEXT NOT NULL DEFAULT '{}',
    revision_number      INTEGER DEFAULT 0,
    revision_source_id   TEXT,
    revision_history_json TEXT DEFAULT '[]',
    rejection_reason     TEXT,
    rejection_source     TEXT,
    client_outcome       TEXT,
    client_rejection_reason TEXT,
    deposit_received     INTEGER DEFAULT 0,
    paid_in_full         INTEGER DEFAULT 0,
    documents_json       TEXT DEFAULT '{}',
    supplier_quotes_json TEXT DEFAULT '[]',
    sales_request_id     TEXT,
    decided_at           TEXT,
    decided_by           TEXT REFERENCES members(id),
    approved_by          TEXT REFERENCES members(id),
    approved_date        TEXT,
    rejected_by          TEXT REFERENCES members(id),
    sent_to_client_at    TEXT,
    submitted_by         TEXT REFERENCES members(id),
    created_by           TEXT REFERENCES members(id),
    submitted_at         TEXT,
    created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- ── Uploaded files ─────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS files (
    id            TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    mime_type     TEXT,
    size_bytes    INTEGER,
    storage_key   TEXT NOT NULL,   -- local path or S3 key
    storage_type  TEXT NOT NULL DEFAULT 'local',
    linked_to     TEXT,            -- quotation id or request id
    linked_type   TEXT,            -- 'quotation_supplier' | 'quotation_doc' | 'request'
    doc_category  TEXT,            -- 'supplierPop' | 'clientInvoice' | 'jobCards' | etc.
    uploaded_by   TEXT REFERENCES members(id),
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- ── Sales quotation requests ────────────────────────────────────
  CREATE TABLE IF NOT EXISTS sales_requests (
    id                    TEXT PRIMARY KEY,
    request_number        TEXT NOT NULL UNIQUE,
    client_name           TEXT NOT NULL,
    client_contact_person TEXT,
    client_email          TEXT,
    client_phone          TEXT,
    site_project_name     TEXT,
    site_address          TEXT,
    sales_rep_id          TEXT REFERENCES sales_reps(id),
    sales_rep_name        TEXT,
    sales_rep_email       TEXT,
    sales_rep_phone       TEXT,
    required_due_date     TEXT,
    description_of_work   TEXT,
    notes_for_builder     TEXT,
    status                TEXT NOT NULL DEFAULT 'Accepted for Processing',
    accepted_by           TEXT REFERENCES members(id),
    accepted_at           TEXT,
    linked_quotation_id   TEXT REFERENCES quotations(id),
    submitted_by          TEXT REFERENCES members(id),
    created_at            TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at            TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- ── Audit trail ────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS audit_trail (
    id         TEXT PRIMARY KEY,
    action     TEXT NOT NULL,
    detail     TEXT,
    module     TEXT,
    reference  TEXT,
    notes      TEXT,
    member_id  TEXT REFERENCES members(id),
    member_name TEXT,
    ip         TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- ── Email logs ─────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS email_logs (
    id           TEXT PRIMARY KEY,
    to_address   TEXT NOT NULL,
    subject      TEXT,
    template     TEXT,
    status       TEXT NOT NULL DEFAULT 'pending',
    provider_id  TEXT,
    error        TEXT,
    linked_to    TEXT,
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- ── Quotation settings ─────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES
    ('profit_deduction_percent', '16.08'),
    ('commission_percent', '4'),
    ('quote_sequence_2025', '0'),
    ('quote_sequence_2026', '0'),
    ('request_sequence_2025', '0'),
    ('request_sequence_2026', '0');

  -- ── Indexes ────────────────────────────────────────────────────
  CREATE INDEX IF NOT EXISTS idx_quotations_status      ON quotations(status);
  CREATE INDEX IF NOT EXISTS idx_quotations_quote_number ON quotations(quote_number);
  CREATE INDEX IF NOT EXISTS idx_quotations_created_at  ON quotations(created_at);
  CREATE INDEX IF NOT EXISTS idx_audit_member           ON audit_trail(member_id);
  CREATE INDEX IF NOT EXISTS idx_audit_created_at       ON audit_trail(created_at);
  CREATE INDEX IF NOT EXISTS idx_sessions_member        ON sessions(member_id);
  CREATE INDEX IF NOT EXISTS idx_files_linked           ON files(linked_to, linked_type);
  CREATE INDEX IF NOT EXISTS idx_requests_status        ON sales_requests(status);
`);

console.log("✓ Migration complete:", dbPath);
db.close();
