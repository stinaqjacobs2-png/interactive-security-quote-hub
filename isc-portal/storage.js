"use strict";
// lib/storage.js – unified file storage: local disk or S3/R2
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const USE_S3 = process.env.USE_S3 === "true";
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./data/uploads");

if (!USE_S3) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Multer disk/memory config ────────────────────────────────────
const multer = require("multer");

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/png",
  "image/jpeg",
]);

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) cb(null, true);
  else cb(new Error(`Unsupported file type: ${file.mimetype}`));
}

// Local storage: keep files in a flat structure with UUID names
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || "";
    cb(null, `${uuidv4()}${ext}`);
  },
});

// S3/cloud storage: buffer in memory then stream to S3
const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: USE_S3 ? memoryStorage : diskStorage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

// ── S3 client (lazy) ─────────────────────────────────────────────

let s3Client = null;

function getS3Client() {
  if (s3Client) return s3Client;
  const { S3Client } = require("@aws-sdk/client-s3");
  s3Client = new S3Client({
    region: process.env.S3_REGION || "af-south-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {}),
  });
  return s3Client;
}

// ── Core storage operations ──────────────────────────────────────

/**
 * Save a multer file object.
 * Returns the storage_key (relative local path or S3 key).
 */
async function saveFile(multerFile) {
  if (!USE_S3) {
    // Disk storage already wrote the file; storage_key is the filename
    return multerFile.filename;
  }

  const { PutObjectCommand } = require("@aws-sdk/client-s3");
  const ext = path.extname(multerFile.originalname).toLowerCase() || "";
  const key = `uploads/${uuidv4()}${ext}`;
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: multerFile.buffer,
      ContentType: multerFile.mimetype,
      ContentDisposition: `inline; filename="${encodeURIComponent(multerFile.originalname)}"`,
    })
  );
  return key;
}

/**
 * Stream a stored file to the HTTP response.
 */
async function streamFile(storageKey, res, download = false, originalName = "") {
  if (!USE_S3) {
    const filePath = path.join(UPLOAD_DIR, storageKey);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end("File not found");
      return;
    }
    const disposition = download
      ? `attachment; filename="${encodeURIComponent(originalName || storageKey)}"`
      : "inline";
    res.setHeader("Content-Disposition", disposition);
    res.setHeader("Cache-Control", "private, max-age=3600");
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const { GetObjectCommand } = require("@aws-sdk/client-s3");
  const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
  const url = await getSignedUrl(
    getS3Client(),
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: storageKey }),
    { expiresIn: 300 }
  );
  res.writeHead(302, { Location: url });
  res.end();
}

/**
 * Delete a stored file.
 */
async function deleteFile(storageKey) {
  if (!USE_S3) {
    const filePath = path.join(UPLOAD_DIR, storageKey);
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }
    return;
  }
  const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
  await getS3Client().send(
    new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: storageKey })
  );
}

module.exports = { upload, saveFile, streamFile, deleteFile, ALLOWED_MIME_TYPES };
