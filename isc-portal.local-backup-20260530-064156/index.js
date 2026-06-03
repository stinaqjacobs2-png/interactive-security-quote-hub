"use strict";
// db/index.js – single shared connection for the whole process
require("dotenv").config();
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = process.env.DB_PATH || "./data/isc.db";
fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

// ── Generic helpers ──────────────────────────────────────────────

/** Run a SELECT that returns zero or more rows */
function all(sql, params = []) {
  return db.prepare(sql).all(...(Array.isArray(params) ? params : [params]));
}

/** Run a SELECT that returns exactly one row (or undefined) */
function get(sql, params = []) {
  return db.prepare(sql).get(...(Array.isArray(params) ? params : [params]));
}

/** Run INSERT / UPDATE / DELETE; returns { changes, lastInsertRowid } */
function run(sql, params = []) {
  return db.prepare(sql).run(...(Array.isArray(params) ? params : [params]));
}

/** Wrap multiple operations in a transaction */
function transaction(fn) {
  return db.transaction(fn)();
}

// ── Setting helpers ──────────────────────────────────────────────

function getSetting(key, fallback = null) {
  const row = get("SELECT value FROM settings WHERE key = ?", [key]);
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  run(
    `INSERT INTO settings (key, value, updated_at)
     VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, String(value)]
  );
}

// ── Sequence helpers ─────────────────────────────────────────────

function nextQuoteNumber(year = new Date().getFullYear()) {
  const key = `quote_sequence_${year}`;
  const current = Number(getSetting(key, "0"));
  const next = current + 1;
  setSetting(key, String(next));
  return `Q-${year}-${String(next).padStart(4, "0")}`;
}

function nextRequestNumber(year = new Date().getFullYear()) {
  const key = `request_sequence_${year}`;
  const current = Number(getSetting(key, "0"));
  const next = current + 1;
  setSetting(key, String(next));
  return `SQR-${year}-${String(next).padStart(4, "0")}`;
}

module.exports = { db, all, get, run, transaction, getSetting, setSetting, nextQuoteNumber, nextRequestNumber };
