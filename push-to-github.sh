#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  Push ISC Portal production files to GitHub
#  Repo : https://github.com/stinaqjacobs2-png/interactive-security-quote-hub
#  Run  : bash push-to-github.sh
# ─────────────────────────────────────────────────────────────────
set -e

REPO_URL="https://github.com/stinaqjacobs2-png/interactive-security-quote-hub.git"
BRANCH="main"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ISC Portal – GitHub push script                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── 1. Locate or create a working directory ──────────────────────
if [ -d ".git" ]; then
  echo "✓ Already inside a git repo – using current directory."
  WORKDIR="."
else
  echo "► Cloning existing repo..."
  git clone "$REPO_URL" isc-portal-push
  WORKDIR="isc-portal-push"
  cd "$WORKDIR"
fi

# ── 2. Make sure we are on the right branch ──────────────────────
git fetch origin 2>/dev/null || true
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
  git pull origin "$BRANCH" --rebase 2>/dev/null || true
else
  git checkout -b "$BRANCH"
fi

# ── 3. Copy production files into the repo ───────────────────────
# Adjust SOURCE_DIR to wherever you saved the downloaded files.
# If you kept them next to this script, the default below is correct.
SOURCE_DIR="$(dirname "$0")/isc-platform"

if [ ! -d "$SOURCE_DIR" ]; then
  echo ""
  echo "ERROR: Cannot find source files at: $SOURCE_DIR"
  echo "Please edit SOURCE_DIR at the top of this script to point"
  echo "to the folder containing server.js, package.json, etc."
  echo ""
  exit 1
fi

echo "► Copying production files from: $SOURCE_DIR"

# Create subdirectories
mkdir -p api db lib

# Root-level files
cp "$SOURCE_DIR/server.js"      ./server.js
cp "$SOURCE_DIR/package.json"   ./package.json
cp "$SOURCE_DIR/DEPLOYMENT.md"  ./DEPLOYMENT.md

# Dotfiles (cp handles these fine; git will pick them up)
cp "$SOURCE_DIR/.env.example"   ./.env.example
cp "$SOURCE_DIR/.gitignore"     ./.gitignore

# Subdirectories
cp "$SOURCE_DIR/api/routes.js"         ./api/routes.js
cp "$SOURCE_DIR/db/index.js"           ./db/index.js
cp "$SOURCE_DIR/db/migrate.js"         ./db/migrate.js
cp "$SOURCE_DIR/lib/auth.js"           ./lib/auth.js
cp "$SOURCE_DIR/lib/email.js"          ./lib/email.js
cp "$SOURCE_DIR/lib/middleware.js"     ./lib/middleware.js
cp "$SOURCE_DIR/lib/pdf.js"            ./lib/pdf.js
cp "$SOURCE_DIR/lib/rateLimit.js"      ./lib/rateLimit.js
cp "$SOURCE_DIR/lib/storage.js"        ./lib/storage.js
cp "$SOURCE_DIR/lib/validation.js"     ./lib/validation.js

echo "✓ Files copied."

# ── 4. Stage and commit ──────────────────────────────────────────
git add \
  server.js \
  package.json \
  DEPLOYMENT.md \
  .env.example \
  .gitignore \
  api/routes.js \
  db/index.js \
  db/migrate.js \
  lib/auth.js \
  lib/email.js \
  lib/middleware.js \
  lib/pdf.js \
  lib/rateLimit.js \
  lib/storage.js \
  lib/validation.js

echo ""
echo "► Staged files:"
git diff --cached --name-only
echo ""

git commit -m "feat: production backend upgrade

- Replace prototype localStorage with SQLite (better-sqlite3, WAL mode)
- Add bcrypt password hashing + server-side sessions (HttpOnly cookies)
- Add Zod input validation on all API endpoints (30+ routes)
- Add sliding-window rate limiting (10 req/min auth, 100 req/min general)
- Add real email delivery via Resend API with Nodemailer SMTP fallback
- Add server-side PDF generation via Puppeteer (A4, page numbers)
- Add file storage abstraction: local disk or S3/R2/Backblaze
- Add security headers (CSP, HSTS, X-Frame-Options, nosniff)
- Add full database migration script with 12 tables + indexes
- Add comprehensive deployment guide (VPS/Nginx, Railway, Render, Docker)
- Add .env.example with all configuration options documented"

# ── 5. Push ──────────────────────────────────────────────────────
echo "► Pushing to GitHub..."
git push origin "$BRANCH"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✓ Done! View your changes at:                          ║"
echo "║  https://github.com/stinaqjacobs2-png/                  ║"
echo "║       interactive-security-quote-hub                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
