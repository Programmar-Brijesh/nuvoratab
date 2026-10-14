# Premium Wallpaper Tab ⚡

A minimal, high-performance technology website for **Premium Wallpaper Tab**, a distraction-free new-tab experience for Google Chrome.

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
│       └── deploy.yml        # Automated GitHub Pages deployment
├── assets/
│   └── favicon.svg           # Minimalist geometric prism icon
├── css/
│   ├── base.css              # Reset, typography, CSS grid background
│   ├── components.css        # Minimal navbar, buttons, links, tech pills
│   ├── modals.css            # Setup guide, Privacy, Contact dialogs & Toasts
│   ├── responsive.css        # Mobile & tablet layout adjustments
│   ├── sections.css          # Hero, About, Features, Timeline, FAQ, CTA, Footer
│   ├── style.css             # Master aggregated stylesheet
│   └── variables.css         # Minimal dark-mode design tokens
├── js/
│   └── app.js                # Navbar, mobile drawer, accordion & modal handlers
├── index.html                # Minimal tech landing page
└── README.md                 # Project documentation
```

---

## 🚀 Local Development

Open `index.html` directly in any web browser, or run a local static server:

Using Python:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

---

## 🌐 GitHub Pages Deployment

1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "feat: minimal premium tech website"
   git push origin main
   ```
2. In your repository on GitHub, go to **Settings** &rarr; **Pages** &rarr; **Source** and select **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` will automatically deploy your site to:
   ```text
   https://<your-username>.github.io/<your-repo-name>/
   ```

---

## 📄 License
MIT License.
