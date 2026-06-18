# QWE Community — Deployment Guide

## Prerequisites

- Node.js 20+ (Node.js 24 recommended)
- pnpm 10+ (`npm install -g pnpm`)
- PostgreSQL 14+ database
- Gmail account with App Password (for OTP emails)

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Long random string for JWT signing |
| `ADMIN_PASSWORD` | ✅ | Password for seed admin account |
| `SMTP_USER` | ✅ | Gmail address for sending OTP emails |
| `SMTP_PASS` | ✅ | Gmail App Password (16 chars) |
| `PORT` | Auto | API server port (set by platform) |
| `REPLIT_DOMAINS` | Optional | Public domain for OG image URL injection |

---

## 1. Local Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env with your values (see .env.example)

# 3. Push database schema
pnpm --filter @workspace/db run push

# 4. Seed admin account
pnpm --filter @workspace/scripts run seed-admin

# 5. Seed rewards (optional)
pnpm --filter @workspace/scripts run seed-rewards

# 6. Start API server (terminal 1) — port 8080
PORT=8080 pnpm --filter @workspace/api-server run dev

# 7. Start frontend (terminal 2) — port 3000
PORT=3000 pnpm --filter @workspace/qwe-community run dev
```

Open http://localhost:3000

> **Note:** The frontend dev server proxies `/api` requests automatically via Vite's shared proxy. In local dev, the API server must be running on port 8080.

---

## 2. Replit Deployment

1. Fork or import this repository to Replit
2. Replit auto-provisions PostgreSQL (sets `DATABASE_URL`)
3. In **Secrets** (Replit sidebar), add:
   - `SESSION_SECRET`
   - `ADMIN_PASSWORD`
   - `SMTP_USER`
   - `SMTP_PASS`
4. Click **Run** — workflows start automatically
5. In the Shell, run:
   ```bash
   pnpm --filter @workspace/db run push
   pnpm --filter @workspace/scripts run seed-admin
   pnpm --filter @workspace/scripts run seed-rewards
   ```
6. Click **Deploy** → **Autoscale** to publish

---

## 3. Railway Deployment

Railway runs the pnpm monorepo natively with zero config.

### Steps

1. Push repository to GitHub
2. Create a new project at [railway.app](https://railway.app)
3. Click **New Service** → **GitHub Repo** → select your repo
4. Add a **PostgreSQL** database service — Railway auto-injects `DATABASE_URL`
5. Add environment variables in Railway dashboard:
   ```
   SESSION_SECRET=...
   ADMIN_PASSWORD=...
   SMTP_USER=...
   SMTP_PASS=...
   REPLIT_DOMAINS=your-app.up.railway.app
   ```
6. Set the **Start Command**:
   ```
   pnpm --filter @workspace/api-server run start
   ```
7. Set the **Build Command**:
   ```
   pnpm install && pnpm run typecheck:libs && pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/qwe-community run build
   ```
8. In Railway Shell, run the seed scripts once:
   ```bash
   pnpm --filter @workspace/db run push
   pnpm --filter @workspace/scripts run seed-admin
   pnpm --filter @workspace/scripts run seed-rewards
   ```

### Serving frontend on Railway

The API server needs to serve the built frontend. After building, the static files are at `artifacts/qwe-community/dist/public/`. Add this to `artifacts/api-server/src/app.ts`:

```typescript
import { join } from "path";
import { fileURLToPath } from "url";

// After existing routes — serve frontend static files
if (process.env.NODE_ENV === "production") {
  const distPath = join(fileURLToPath(import.meta.url), "../../../qwe-community/dist/public");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(join(distPath, "index.html")));
}
```

---

## 4. Vercel Deployment

> **Important:** Vercel is a serverless platform and does **not** natively support:
> - WebSocket connections (world chat requires persistent connections)
> - pnpm monorepo with multiple packages out of the box
> - Long-running Express servers
>
> **Recommended alternative: Railway** (full Node.js support, WebSocket-compatible).
>
> If you still want Vercel, deploy the **frontend only** to Vercel and the **API server** to Railway.

### Frontend on Vercel + API on Railway

1. Deploy API to Railway (see section 3 above)
2. Create `vercel.json` in the repo root:
   ```json
   {
     "buildCommand": "pnpm --filter @workspace/qwe-community run build",
     "outputDirectory": "artifacts/qwe-community/dist/public",
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://your-api.railway.app/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
3. Set env var in Vercel dashboard: `REPLIT_DOMAINS=your-vercel-app.vercel.app`
4. Deploy the repo to Vercel

---

## 5. VPS Deployment (Ubuntu/Debian)

### Setup

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
sudo -u postgres createdb qwe_community
sudo -u postgres createuser qwe_user
sudo -u postgres psql -c "ALTER USER qwe_user WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE qwe_community TO qwe_user;"

# Clone and setup
git clone https://github.com/your-user/qwe-community.git
cd qwe-community
pnpm install

# Create .env from template
cp .env.example .env
nano .env   # Fill in all values

# Push DB schema and seed
pnpm --filter @workspace/db run push
pnpm --filter @workspace/scripts run seed-admin
pnpm --filter @workspace/scripts run seed-rewards

# Build everything
pnpm run typecheck:libs
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/qwe-community run build
```

### Run with PM2

```bash
npm install -g pm2

# Start API server
PORT=8080 pm2 start "node --enable-source-maps artifacts/api-server/dist/index.mjs" --name qwe-api

# Save and enable on boot
pm2 save
pm2 startup
```

### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # API + WebSocket
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend static files
    location / {
        root /path/to/qwe-community/artifacts/qwe-community/dist/public;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable HTTPS with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 6. Post-Deployment Checklist

- [ ] Database tables created (`pnpm --filter @workspace/db run push`)
- [ ] Admin account seeded (`pnpm --filter @workspace/scripts run seed-admin`)
- [ ] Rewards seeded (`pnpm --filter @workspace/scripts run seed-rewards`)
- [ ] OTP emails working (check `SMTP_USER` / `SMTP_PASS`)
- [ ] WebSocket world chat connecting (green WiFi icon on homepage)
- [ ] Admin panel accessible at `/admin` with `gameransh2434@gmail.com`
- [ ] HTTPS enabled (required for `wss://` WebSocket in production)

---

## Admin Account

After seeding, log in with:
- **Email:** `gameransh2434@gmail.com`
- **Password:** value of `ADMIN_PASSWORD` env var
- **Role:** admin (full access to `/admin` panel)

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `DATABASE_URL` not set | Provision a PostgreSQL DB and set the connection string |
| OTP emails not sending | Check `SMTP_USER`/`SMTP_PASS`; use Gmail App Password, not regular password |
| World chat not connecting | Ensure WebSocket upgrade passes through reverse proxy (see Nginx config above) |
| `PORT` not found error | Set `PORT` env var before starting the server |
| Admin panel not accessible | Ensure account has `role = "admin"` and `isVerified = true` in DB |
| `ws` package missing | Run `pnpm install` in the repo root |
