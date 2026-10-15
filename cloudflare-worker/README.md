# NuvoraTab Cloudflare Worker Backend ⚡

This directory contains the serverless Cloudflare Worker for **NuvoraTab Support Desk**. It processes support tickets submitted from the static website, performs input validation and anti-abuse checks, and delivers formatted embeds to your designated Discord channel via a secure Discord Webhook.

---

## 🏗️ Architecture & Security Highlights

1. **Zero Client Secret Exposure**:
   - The Discord Webhook URL is stored **exclusively** as an encrypted Cloudflare Worker secret named `DISCORD_SUPPORT_WEBHOOK`.
   - Never exposed in frontend JavaScript, public files, or committed repositories.

2. **CORS Enforcement**:
   - Preflight `OPTIONS` and standard requests are restricted to allowed origins:
     - Production: `https://programmar-brijesh.github.io` (and any custom origins in `ALLOWED_ORIGINS`)
     - Local development: `http://localhost:3000`, `http://localhost:8080`, `http://localhost:5500`, `http://localhost:8787`, `http://127.0.0.1:3000`, etc.
     - Chrome extensions: `chrome-extension://*`

3. **Request Protection & Validation**:
   - Strict payload size limit (<64 KB).
   - Control-character stripping and length validation for all fields.
   - Enforced HTTP methods (POST for tickets, GET for `/api/health`).

4. **Anti-Abuse Protections**:
   - **Duplicate-submission prevention**: Identical submissions from the same IP are blocked for 2 minutes (returns HTTP 409).
   - **In-isolate rate limiting**: Maximum 5 submissions per 10 minutes per IP (returns HTTP 429).
   - *Note on Distributed Rate Limiting*: Cloudflare Workers execute across 300+ global edge locations. In-memory maps protect the active edge isolate against rapid bursts and double-clicks. For globally synchronized rate limiting across all worldwide points of presence, a Cloudflare KV namespace binding or Cloudflare Rate Limiting Rules can be attached.

5. **Discord Delivery Guarantee**:
   - The worker only returns `{ success: true, ticketId }` when Discord responds with HTTP 200 or 204.
   - If Discord returns an error (4xx/5xx) or encounters network timeouts, a safe HTTP 502 Bad Gateway response is returned to the user without leaking tokens or internal URLs.

---

## 🚀 Step-by-Step Deployment Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Cloudflare Account](https://dash.cloudflare.com/) (free tier is fully sufficient)
- A Discord Webhook URL from your Discord server channel (Settings > Integrations > Webhooks)

---

### Step 1: Login to Cloudflare via Wrangler

In your terminal, authenticate Wrangler with your Cloudflare account:

```bash
npx wrangler login
```
*A browser window will open asking you to authorize Wrangler.*

---

### Step 2: Configure Secrets (`DISCORD_SUPPORT_WEBHOOK` & `PORTFOLIO_DISCORD_WEBHOOK_URL`)

Set the encrypted secrets directly in Cloudflare. You will be prompted to paste your webhook URLs securely:

#### A. NuvoraTab Extension Support Webhook:
```bash
# From the project root:
npm run worker:secret

# Or inside the cloudflare-worker/ directory:
npx wrangler secret put DISCORD_SUPPORT_WEBHOOK
```

#### B. Developer Portfolio Inquiries Dedicated Webhook:
```bash
# From the project root:
npm run worker:secret:portfolio

# Or inside the cloudflare-worker/ directory:
npx wrangler secret put PORTFOLIO_DISCORD_WEBHOOK_URL
```

When prompted, paste your dedicated portfolio Discord webhook URL:
`https://discord.com/api/webhooks/1560178379855237230/BQkaDjIYjT7q0H9Pp5LGHzFJ4gxbwWkUbBDvFJ6kdw4FoGi6yd0qFV8X1NtzuJC7XfMa`

*(Optional)* If you host your static site on a custom domain (e.g., `https://nuvoratab.com`), you can set or adjust `ALLOWED_ORIGINS` in `wrangler.jsonc` or as an environment variable:
```jsonc
"vars": {
  "ALLOWED_ORIGINS": "https://programmar-brijesh.github.io,https://nuvoratab.com"
}
```

---

### Step 3: Test Locally (Optional)

To test the worker locally with Wrangler:

1. Create `.dev.vars` inside `cloudflare-worker/` (this file is gitignored):
   ```bash
   cp .dev.vars.example .dev.vars
   ```
2. Open `.dev.vars` and add your Discord Webhook URL.
3. Start the local worker dev server:
   ```bash
   npm run worker:dev
   # Or inside cloudflare-worker/:
   npx wrangler dev
   ```
   *The local worker runs at `http://localhost:8787`.*

---

### Step 4: Deploy the Worker to Cloudflare

Run the deployment command:

```bash
# From the project root:
npm run worker:deploy

# Or inside the cloudflare-worker/ directory:
npx wrangler deploy
```

Upon successful deployment, Wrangler will output your live Worker URL:
```text
Uploaded nuvoratab-support-worker (X.XX sec)
Deployed nuvoratab-support-worker triggers
  https://nuvoratab-support-worker.<your-subdomain>.workers.dev
```

---

### Step 5: Update the Frontend Endpoint

Open `js/support.js` in your website root. Update the single configuration constant at the top of the file:

```javascript
const SUPPORT_API_ENDPOINT =
  window.NUVORATAB_SUPPORT_API_URL ||
  'https://nuvoratab-support-worker.<your-subdomain>.workers.dev/api/support';
```

Replace `<your-subdomain>` with your actual Cloudflare Worker subdomain from Step 4.

---

### Step 6: Verify Live Integration

1. Verify Health check:
   ```bash
   curl https://nuvoratab-support-worker.<your-subdomain>.workers.dev/api/health
   # Expected output: {"status":"healthy",...}
   ```
2. Open `support.html` in your browser.
3. Fill out the support form and submit a ticket.
4. Check your Discord channel — the rich embed with your ticket ID and formatted diagnostics will appear immediately!

---

## 🧪 Automated Testing

Run the automated test suite anytime (validates validation, rate limiting, duplicate prevention, Discord failure handling, and embed formatting):

```bash
npm test
```
