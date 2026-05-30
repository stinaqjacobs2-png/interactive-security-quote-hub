# Interactive Security Portal – Production Deployment Guide

## What changed from the prototype

| Area | Before | After |
|---|---|---|
| Data storage | `localStorage` (browser-only) | SQLite via `better-sqlite3` (server-side, persistent) |
| Auth | Plain email sign-in, hash stored in localStorage | bcrypt password hashing, server-side sessions, HttpOnly cookies |
| Email | `mailto:` links | Real email delivery via Resend API (or SMTP fallback) |
| PDFs | Browser print dialog | Server-side Puppeteer rendering, proper PDF download |
| Files | IndexedDB (browser-only) | Local disk or S3/R2/Backblaze (configurable) |
| Rate limiting | None | Sliding-window per-IP rate limiting on all routes |
| Input validation | None | Zod schemas on every API endpoint |
| Security headers | None | X-Content-Type-Options, X-Frame-Options, HSTS, etc. |

---

## Quick start (local)

```bash
# 1. Clone / copy files into your project folder
cd isc-portal

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env
# Edit .env – at minimum set JWT_SECRET and SESSION_SECRET

# 4. Run the database migration (creates data/isc.db)
node db/migrate.js

# 5. Start the server
npm start
# → http://localhost:3100
```

---

## Environment variables

See `.env.example` for all options. The critical ones:

### Required before go-live

```
JWT_SECRET=<64-byte hex>        # node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=<64-byte hex>    # same command again
NODE_ENV=production
BASE_URL=https://your-domain.co.za
```

### Email (pick one)

**Resend** (recommended – generous free tier, SA-friendly):
```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.co.za
```

**SMTP** (any provider – SendGrid, Mailgun, etc.):
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxx
```

### File storage

**Local disk** (default – fine for a single server):
```
UPLOAD_DIR=./data/uploads
USE_S3=false
```

**S3 / Cloudflare R2 / Backblaze B2** (for multi-server or cloud):
```
USE_S3=true
S3_BUCKET=isc-uploads
S3_REGION=af-south-1
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
# For R2/Backblaze, also set:
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

---

## Deployment options

### Option A – VPS (Ubuntu/Debian) with PM2 + Nginx

```bash
# On the server
npm install -g pm2
npm install
node db/migrate.js

# Start with PM2
pm2 start server.js --name isc-portal
pm2 save
pm2 startup

# Nginx config (reverse proxy)
```

```nginx
server {
    listen 80;
    server_name portal.interactivesecurity.co.za;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portal.interactivesecurity.co.za;

    ssl_certificate     /etc/letsencrypt/live/portal.interactivesecurity.co.za/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.interactivesecurity.co.za/privkey.pem;

    client_max_body_size 30M;

    location / {
        proxy_pass         http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d portal.interactivesecurity.co.za
```

### Option B – Railway

1. Push code to GitHub
2. New project → Deploy from GitHub repo
3. Add all environment variables in Railway dashboard
4. Railway auto-detects `npm start`
5. Set `DB_PATH=/data/isc.db` and add a Volume at `/data`

### Option C – Render

1. New Web Service → connect GitHub repo
2. Build command: `npm install && node db/migrate.js`
3. Start command: `npm start`
4. Add environment variables
5. Add a Disk at `/data` for SQLite persistence

### Option D – Docker

```dockerfile
FROM node:20-slim

# Install Chrome for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN node db/migrate.js

EXPOSE 3100
CMD ["node", "server.js"]
```

```bash
docker build -t isc-portal .
docker run -d \
  -p 3100:3100 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  isc-portal
```

---

## Creating the first Super Admin

After running `node db/migrate.js`, use this one-time script to bootstrap the admin account:

```bash
node -e "
const bcrypt = require('bcryptjs');
const { run } = require('./db');
const { v4: uuidv4 } = require('uuid');
const hash = bcrypt.hashSync('CHANGE_THIS_PASSWORD', 12);
const id = uuidv4();
run('INSERT INTO members (id, name, email, password_hash, role, invite_status, must_change_pw, has_logged_in) VALUES (?,?,?,?,?,?,0,1)',
  [id, 'Admin', 'admin@interactivesecurity.co.za', hash, 'Super Admin', 'Active']);
run('INSERT INTO member_permissions (id, member_id, permission_key, can_access) SELECT ?, ?, key, 1 FROM (VALUES (\"dashboard\"),(\"build_quotation\"),(\"quote_library\"),(\"approval\"),(\"reports\"),(\"audit_trail\"),(\"setup\"),(\"supplier_prices\"),(\"member_access_management\"),(\"quotation_hub\"),(\"sales_quotation_requests\")) AS t(key)', [uuidv4()+'-p', id]);
console.log('Admin created: admin@interactivesecurity.co.za');
"
```

Then sign in and change the password immediately via the portal.

---

## Migrating existing localStorage data

If staff have existing quotes in their browsers, run this script in the browser console to export, then use the API to import:

```javascript
// Run in browser on the old app to get a JSON export
const data = {
  quotations: JSON.parse(localStorage.getItem('quotePilotApprovalQueue') || '[]'),
  members: JSON.parse(localStorage.getItem('quotePilotMembers') || '[]'),
  salesReps: JSON.parse(localStorage.getItem('quotePilotSalesReps') || '[]'),
  clients: JSON.parse(localStorage.getItem('quotePilotClients') || '[]'),
  supplierPrices: JSON.parse(localStorage.getItem('quotePilotSupplierPrices') || '[]'),
};
console.log(JSON.stringify(data, null, 2));
```

Then use the `/api/quotations`, `/api/members`, `/api/sales-reps`, `/api/clients`, and `/api/supplier-prices` POST endpoints to re-import.

---

## Backups

For SQLite on a VPS, add a cron job:

```bash
# /etc/cron.d/isc-backup
0 2 * * * root cp /path/to/data/isc.db /path/to/backups/isc-$(date +\%Y\%m\%d).db
# Keep last 30 days
find /path/to/backups -name "isc-*.db" -mtime +30 -delete
```

For cloud deployments (Railway/Render), use their built-in backup features or integrate [Litestream](https://litestream.io) for continuous S3 replication.

---

## Security checklist before go-live

- [ ] `JWT_SECRET` and `SESSION_SECRET` set to 64-byte random hex
- [ ] `NODE_ENV=production`
- [ ] HTTPS enabled (SSL certificate installed)
- [ ] `ALLOWED_ORIGINS` set to your production domain only
- [ ] First admin password changed after bootstrap
- [ ] Email delivery tested (send a test invite)
- [ ] File upload path (`UPLOAD_DIR`) is outside the web root
- [ ] Puppeteer Chrome path configured if using system Chrome
- [ ] Regular database backups scheduled
- [ ] Firewall: only ports 80 and 443 open externally
