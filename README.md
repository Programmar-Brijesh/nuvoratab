# Premium Wallpaper Tab 🖼️✨

A cinematic, production-quality marketing website and interactive demonstration for **Premium Wallpaper Tab**, a high-definition new-tab experience for Chrome.

Built entirely with **HTML5, modern Vanilla CSS3, and Vanilla JavaScript**. Designed to deploy seamlessly to **GitHub Pages** without any build step, bundler, or backend dependencies.

---

## 🌟 Key Highlights & Features

### 1. Cinematic Full-Bleed Hero
- High-definition 4K ambient background with smooth hardware-accelerated crossfades.
- Real-time time & active curation status badge.
- Interactive live category preview pills (**Nature**, **Space**, **Technology**) right in the hero header.
- Animated scroll-down mouse indicator.

### 2. Interactive Wallpaper Gallery
- Filter across curated collections: **Nature & Landscapes**, **Space & Cosmos**, and **Technology & Cyber**.
- Live search input matching titles, locations, and tags with a clear button.
- Smooth card hover actions: **Preview in Tab Simulator**, **Enlarge Details**, **Copy Image Link**, and **Add to Favorites**.
- Persistent favorites stored in `localStorage`.
- Responsive lazy-loaded images with progressive blur-up and error fallbacks.
- Visually polished empty state if a search query yields no matches.

### 3. Fullscreen Lightbox Modal
- Deep-dive into raw 4K resolutions with keyboard shortcuts (<kbd>Esc</kbd> to close, <kbd>&larr;</kbd> and <kbd>&rarr;</kbd> to navigate).
- Detailed metadata panel: photographer attribution link, location, resolution, and dominant color palette swatches.
- Direct actions: "Preview in Tab Simulator", "Download 4K Image", "Copy Image Link".

### 4. Interactive Product Showcase (Chrome Simulator)
- Realistic Chrome browser window frame (`chrome://newtab`).
- Live ticking digital clock (synchronized to local hardware time).
- One-click toggle between **12-Hour (AM/PM)** and **24-Hour** digital clock formats.
- Dynamic time-of-day greeting ("Good morning / afternoon / evening, Explorer") and formatted local date.
- Minimalist search bar supporting **Google**, **DuckDuckGo**, and **Bing** search engine switching.
- Speed-dial quick links (GitHub, Figma, Dribbble, Unsplash, Reddit).
- Floating Settings Drawer:
  - Wallpaper Brightness / Dim slider.
  - Wallpaper Blur slider.
  - Zen Focus Mode toggle (hides shortcuts and search for pure visual meditation).
- Wallpaper switching controls: **Next Wallpaper** and **Discover Random**.

### 5. Ambient Soundscape (Pure Web Audio API)
- Built-in atmospheric sound synthesizer utilizing the standard Web Audio API.
- Generates gentle mountain breezes (pink noise sweep), deep cosmic drone (108Hz harmonic sinewave), or cyber pulse without requiring heavy external MP3/WAV files.
- Toggleable audio button in the top navigation.

### 6. Editorial Features & Storytelling
- Asymmetric split cards with high-contrast typography and media canvases.
- 3-step connected timeline explaining the user journey.
- Immersive visual storytelling break section.

### 7. Accessible FAQ Accordion
- Smooth accordion sliding with `aria-expanded` attributes and keyboard focus indicators.
- Answers key product questions clearly and truthfully.

### 8. Interactive Dialogs & Toasts
- **Get Started Modal**: 3-step installation walkthrough.
- **Privacy Policy Modal**: Details zero-tracking, 100% local storage principles.
- **Contact & Feedback Modal**: Interactive submission form.
- Non-intrusive toast notification system for feedback.

---

## 🛠️ Technology Stack

- **Markup**: Pure HTML5 (semantic, accessible, SEO meta tags, OpenGraph, Twitter Cards).
- **Styling**: Vanilla CSS3 (modular CSS tokens, glassmorphism, responsive grid & flexbox, `@media (prefers-reduced-motion)`).
- **Scripting**: Vanilla JavaScript (ES6+ modular controllers attached to `window`, zero external libraries or bundlers).
- **Deployment**: GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`).
- **Asset Paths**: Strict relative paths (`./css/...`, `./js/...`, `./assets/...`) to support subpaths on GitHub repository URLs.

---

## 📂 Project Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions Pages deployment workflow
├── assets/
│   └── favicon.svg           # Custom branded vector icon
├── css/
│   ├── base.css              # Reset, typography, scrollbar & containers
│   ├── components.css        # Buttons, navbar, mobile menu & sound toggle
│   ├── features.css          # Editorial layout & feature matrix
│   ├── gallery.css           # Filter tabs, search, card grid & empty states
│   ├── hero.css              # Full-viewport hero & ambient crossfade
│   ├── how-it-works.css      # 3-step connected timeline
│   ├── lightbox.css          # Fullscreen modal & metadata sidebar
│   ├── modals.css            # Dialogs (Get Started, Privacy, Contact) & Toasts
│   ├── responsive.css        # Tablet, mobile & reduced motion breakpoints
│   ├── showcase.css          # Chrome new tab simulator & settings drawer
│   ├── story-faq.css         # Visual storytelling & FAQ accordion
│   ├── style.css             # Master aggregated stylesheet
│   └── variables.css         # Design tokens, color palettes & shadows
├── js/
│   ├── app.js                # Main orchestrator, modals, toasts & navigation
│   ├── data.js               # Curated wallpaper data source (Nature, Space, Tech)
│   ├── faq.js                # Accessible accordion logic
│   ├── gallery.js            # Category filter, search, favorites & lazy load
│   ├── hero.js               # Hero category switcher & live time badge
│   ├── lightbox.js           # Lightbox navigation & keyboard handlers
│   ├── showcase.js           # Live clock, search engine & simulator controls
│   └── soundscape.js         # Web Audio API ambient sound generator
├── index.html                # Main semantic landing page
└── README.md                 # Documentation & deployment guide
```

---

## 🚀 Local Development & Preview

Because this project is built with standard web technologies and requires no build step:

### Option 1: Direct File Opening
Double-click `index.html` to open it directly in any modern browser (Google Chrome, Brave, Safari, Edge, Firefox).

### Option 2: Local HTTP Server (Recommended)
Running via an HTTP server enables full clipboard API and audio context support:

Using Python:
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000`.

Using Node / npx:
```bash
npx serve .
```

---

## 🌐 Deploying to GitHub Pages

This repository comes preconfigured with an automated GitHub Actions deployment workflow.

### Quick Setup Steps:
1. Push this repository to your GitHub account (branch: `main`):
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Premium Wallpaper Tab static website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. On GitHub, navigate to **Settings** &rarr; **Pages**.
3. Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically trigger and deploy your site.
5. Your live site will be accessible at:
   ```text
   https://<your-username>.github.io/<your-repo-name>/
   ```
   *(All CSS, JS, and image assets will resolve properly thanks to relative path formatting).*

---

## 📷 Wallpaper Credits

All wallpaper photography is provided through Unsplash's CDN under the Unsplash Open License:
- **Nature**: Luca Bravo, Shifaaz Shamheed, Kalen Emsley, Jonatan Pie, Jeremy Bishop, Robert Lukeman.
- **Space**: NASA / ESA / James Webb Space Telescope, Denis Degioanni, ActionVance / ISS, Planet Volumes, Bryan Goff.
- **Technology**: Milad Fakurian, Google DeepMind Labs, Aleksandar Pasaric, Conny Schneider, Joel Filipe.

---

## 📄 License
MIT License. Free to use, adapt, and build upon.
