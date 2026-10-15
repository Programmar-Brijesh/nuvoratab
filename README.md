# NuvoraTab: HD Wallpapers & New Tab ⚡

A minimal, high-performance technology website for **NuvoraTab**, a distraction-free new-tab experience for Google Chrome. Discover new wallpapers regularly — our collection keeps growing with fresh Nature, Space and Technology wallpapers over time.

Designed with clean typography, precise spacing, thin borders, and a sophisticated dark theme inspired by premium developer tools. Built purely with **HTML5, CSS3, and vanilla JavaScript** without build steps or external frameworks.

---

## 📐 Architecture & Website Structure

1. **Minimal Navbar**: Clean brand identity, navigation links, and primary CTA.
2. **Hero Section**: Bold typography-focused headline, concise supporting copy, primary CTA, secondary text link, and pure CSS technical grid background.
3. **About the Product**: Editorial statement explaining the core philosophy of replacing browser clutter with clarity, complete with technical specifications (&lt;40ms latency, 0 KB telemetry).
4. **Core Features**: Compact 3x2 matrix featuring clean line icons, thin borders, and concise descriptions.
5. **How It Works**: 3-step connected timeline explaining installation, configuration, and daily focus.
6. **FAQ**: Accessible, minimal accordion with keyboard navigation.
7. **Final CTA**: Focused call-to-action section with zero clutter.
8. **Footer**: Clean brand identity, navigation anchors, configurable privacy and contact dialogs.

---

## 🛠️ Technology Stack

- **Markup**: Semantic HTML5 (SEO meta tags, OpenGraph tags, accessible ARIA attributes).
- **Styling**: Vanilla CSS3 (pure CSS technical background grid, hairline borders, responsive flexbox/grid).
- **Scripting**: Vanilla JavaScript (single lightweight script in `js/app.js` for sticky nav, mobile menu, accordion, and dialogs).
- **Hosting**: GitHub Pages compatible with strict relative paths (`./css/...`, `./js/...`, `./assets/...`).

---

## 📂 Repository Layout

```text
├── .github/
│   └── workflows/
│       └── deploy.yml        # Automated GitHub Pages static deployment
├── cloudflare-worker/        # Cloudflare Worker Support API Backend
│   ├── src/
│   │   └── index.js          # Worker entrypoint, validation, CORS & Discord webhook dispatcher
│   ├── .dev.vars.example     # Template for local secret configuration
│   ├── package.json          # Worker scripts (dev, deploy, secret:set)
│   ├── wrangler.jsonc        # Cloudflare Wrangler configuration
│   └── README.md             # Dedicated worker deployment guide
├── assets/
│   └── favicon.svg           # Minimalist geometric prism icon
├── css/
│   ├── base.css              # Reset, typography, CSS grid background
│   ├── components.css        # Minimal navbar, buttons, links, tech pills
│   ├── modals.css            # Setup guide, Privacy, Contact dialogs & Toasts
│   ├── responsive.css        # Mobile & tablet layout adjustments
│   ├── sections.css          # Hero, About, Features, Timeline, FAQ, CTA, Footer
│   ├── style.css             # Master aggregated stylesheet
│   ├── support.css           # Support and Help Center styles
│   └── variables.css         # Minimal dark-mode design tokens
├── js/
│   ├── app.js                # Navbar, mobile drawer, accordion & modal handlers
│   └── support.js            # Support ticket form, copy email, diagnostics, Worker API config
├── tests/
│   └── test-worker.mjs       # Automated test suite for Cloudflare Worker
├── index.html                # Minimal tech landing page
├── package.json              # Project scripts & metadata
├── support.html              # Dedicated Help & Support Center
└── README.md                 # Project documentation
```

---

## ⚡ Cloudflare Worker Backend Setup & Deployment

The support ticket dispatch is powered by a high-performance **Cloudflare Worker** located in `cloudflare-worker/`.

### 1. Configure the Discord Secret
Set your Discord channel webhook URL securely in Cloudflare (never commit this URL or expose it in code):
```bash
npm run worker:secret
# Or: npx wrangler secret put DISCORD_SUPPORT_WEBHOOK --cwd cloudflare-worker
```
When prompted, paste your Discord webhook URL.

### 2. Deploy the Worker
Deploy the worker directly to your Cloudflare account:
```bash
npm run worker:deploy
# Or: npx wrangler deploy --cwd cloudflare-worker
```
Wrangler will output your live URL (`https://nuvoratab-support-worker.brijeshverma8896.workers.dev`).

### 3. Connect Frontend to the Worker
In `js/support.js`, the configuration constant connects to your live Worker:
```javascript
const SUPPORT_API_ENDPOINT =
  window.NUVORATAB_SUPPORT_API_URL ||
  'https://nuvoratab-support-worker.brijeshverma8896.workers.dev/api/support';
```

---

## 🚀 Local Development

You can run the Cloudflare Worker locally for development:

```bash
npm run worker:dev
# Or: npx wrangler dev --cwd cloudflare-worker
```
Runs the worker locally at `http://localhost:8787`. You can open `index.html` or `support.html` in any browser or static server.

---

## 🧪 Automated Testing

The automated test suite (`tests/test-worker.mjs`) validates:
- Health check route (`/api/health`)
- CORS preflight and origin validation (`OPTIONS` and allowed origins)
- Input validation (empty names, invalid emails, length limits)
- Request size limit enforcement (<64 KB)
- Discord embed generation and delivery (with mocked Discord 204 response)
- Duplicate submission prevention (blocking identical requests within 2 minutes)
- In-isolate rate limiting protection (throttling rapid requests)
- Discord API failure handling (graceful 502 with zero secret token leakage)
- Missing environment variable handling (graceful 503 fallback)

Run the test suite with:
```bash
npm test
```

---

## 🔒 Security & Privacy Architecture

- **Encrypted Secret Storage**: The Discord Webhook URL is read strictly from the Cloudflare Worker secret `DISCORD_SUPPORT_WEBHOOK`. It is never exposed in client HTML, JavaScript, Git repositories, or GitHub Actions.
- **CORS Protection**: Restricted to your production domain (`https://brijesh-verma.github.io` and optional custom domains) and localhost during development.
- **Input Sanitization**: Control characters are stripped and string lengths strictly enforced before building Discord embeds.
- **Rate Limiting & Duplicate Guard**: Protection against rapid double-clicks, burst spam, and duplicate submissions.
- **User Privacy**: Environment diagnostics are strictly optional and only attached if the user keeps the diagnostics checkbox enabled.

---

## 📬 Support & Feedback

For technical support, reporting bugs, or suggesting new wallpapers:
- **Support Portal**: [`support.html`](./support.html)
- **Direct Email**: [brijeshverma8896@gmail.com](mailto:brijeshverma8896@gmail.com)
- **Discord Alerts**: Submitted tickets are automatically routed to our Discord channel.

---

## 📄 License
MIT License.
