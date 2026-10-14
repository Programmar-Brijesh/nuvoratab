/**
 * Premium Wallpaper Tab - Interactive Chrome New Tab Simulator
 * Pure Vanilla JS
 */

window.ShowcaseController = {
  currentWallpaper: null,
  is24Hour: false,
  clockInterval: null,
  currentEngine: 'Google',
  searchEngines: {
    Google: 'https://www.google.com/search?q=',
    DuckDuckGo: 'https://duckduckgo.com/?q=',
    Bing: 'https://www.bing.com/search?q='
  },

  init() {
    this.currentWallpaper = window.WallpaperData.wallpapers[0];
    this.bindEvents();
    this.startClock();
    this.setWallpaper(this.currentWallpaper);
  },

  setWallpaper(wallpaper) {
    if (!wallpaper) return;
    this.currentWallpaper = wallpaper;

    const bgImg = document.getElementById('simWallpaperBg');
    const titleEl = document.getElementById('simWallpaperTitle');
    const authorEl = document.getElementById('simWallpaperAuthor');
    const locationEl = document.getElementById('simLocationBadge');

    if (bgImg) {
      bgImg.style.opacity = '0';
      const tempImg = new Image();
      tempImg.src = wallpaper.fullUrl;
      tempImg.onload = () => {
        bgImg.src = wallpaper.fullUrl;
        bgImg.style.opacity = '1';
      };
    }

    if (titleEl) titleEl.textContent = wallpaper.title;
    if (authorEl) authorEl.textContent = wallpaper.author;
    if (locationEl) {
      locationEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${wallpaper.location}</span>
      `;
    }

    // Update active category pill inside simulator
    document.querySelectorAll('.sim-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-sim-cat') === wallpaper.category);
    });
  },

  nextWallpaper() {
    const list = window.WallpaperData.wallpapers;
    const currentIndex = list.findIndex(w => w.id === this.currentWallpaper.id);
    const nextIndex = (currentIndex + 1) % list.length;
    this.setWallpaper(list[nextIndex]);
    window.App.showToast(`Active: "${list[nextIndex].title}"`);
  },

  randomWallpaper() {
    const random = window.WallpaperData.getRandom(this.currentWallpaper.id);
    this.setWallpaper(random);
    window.App.showToast(`Discovered: "${random.title}"`);
  },

  startClock() {
    const timeDisplay = document.getElementById('simClockTime');
    const ampmDisplay = document.getElementById('simClockAmPm');
    const greetingDate = document.getElementById('simGreetingDate');

    const update = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      let greeting = 'Good evening';
      if (hours >= 5 && hours < 12) greeting = 'Good morning';
      else if (hours >= 12 && hours < 17) greeting = 'Good afternoon';

      let displayHours = hours;
      let ampm = '';

      if (!this.is24Hour) {
        ampm = hours >= 12 ? 'PM' : 'AM';
        displayHours = hours % 12 || 12;
      }

      if (timeDisplay) timeDisplay.textContent = `${displayHours}:${minutes}`;
      if (ampmDisplay) ampmDisplay.textContent = ampm ? ` ${ampm}` : `:${seconds}`;

      const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      const dateStr = now.toLocaleDateString('en-US', dateOptions);
      if (greetingDate) {
        greetingDate.textContent = `${greeting}, Explorer • ${dateStr}`;
      }
    };

    update();
    this.clockInterval = setInterval(update, 1000);
  },

  bindEvents() {
    // 12h / 24h toggle on clock click
    const clockEl = document.getElementById('simClockDisplay');
    if (clockEl) {
      clockEl.addEventListener('click', () => {
        this.is24Hour = !this.is24Hour;
        window.App.showToast(`Clock format: ${this.is24Hour ? '24-Hour' : '12-Hour'}`);
      });
    }

    // Next Wallpaper Button
    const nextBtn = document.getElementById('simNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextWallpaper());
    }

    // Random discovery button in simulator
    const randBtn = document.getElementById('simRandomBtn');
    if (randBtn) {
      randBtn.addEventListener('click', () => this.randomWallpaper());
    }

    // Category pills in Simulator
    document.querySelectorAll('.sim-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-sim-cat');
        const items = window.WallpaperData.getByCategory(cat);
        const randomItem = items[Math.floor(Math.random() * items.length)];
        this.setWallpaper(randomItem);
      });
    });

    // Settings Drawer Toggle
    const settingsBtn = document.getElementById('simSettingsBtn');
    const settingsDrawer = document.getElementById('simSettingsDrawer');
    const drawerClose = document.getElementById('simDrawerClose');

    if (settingsBtn && settingsDrawer) {
      settingsBtn.addEventListener('click', () => {
        settingsDrawer.classList.toggle('open');
      });
    }

    if (drawerClose && settingsDrawer) {
      drawerClose.addEventListener('click', () => {
        settingsDrawer.classList.remove('open');
      });
    }

    // Brightness / Dim Slider
    const dimSlider = document.getElementById('simDimSlider');
    const overlay = document.getElementById('simWallpaperOverlay');
    if (dimSlider && overlay) {
      dimSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        overlay.style.backgroundColor = `rgba(0, 0, 0, ${val / 100})`;
        const label = document.getElementById('dimSliderVal');
        if (label) label.textContent = `${val}%`;
      });
    }

    // Blur Slider
    const blurSlider = document.getElementById('simBlurSlider');
    const bgImg = document.getElementById('simWallpaperBg');
    if (blurSlider && bgImg) {
      blurSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        bgImg.style.filter = `blur(${val}px)`;
        const label = document.getElementById('blurSliderVal');
        if (label) label.textContent = `${val}px`;
      });
    }

    // Focus Mode Toggle
    const focusToggle = document.getElementById('simFocusToggle');
    const canvas = document.getElementById('browserTabCanvas');
    if (focusToggle && canvas) {
      focusToggle.addEventListener('change', (e) => {
        canvas.classList.toggle('focus-mode', e.target.checked);
        window.App.showToast(e.target.checked ? 'Zen Focus Mode activated' : 'Zen Focus Mode off');
      });
    }

    // Search Engine Switcher
    const engineBtn = document.getElementById('simEngineBtn');
    const engines = ['Google', 'DuckDuckGo', 'Bing'];
    let engineIndex = 0;
    if (engineBtn) {
      engineBtn.addEventListener('click', () => {
        engineIndex = (engineIndex + 1) % engines.length;
        this.currentEngine = engines[engineIndex];
        engineBtn.textContent = this.currentEngine;
        window.App.showToast(`Search engine set to ${this.currentEngine}`);
      });
    }

    // Search Input Submission
    const searchInput = document.getElementById('simSearchInput');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
          const query = encodeURIComponent(searchInput.value.trim());
          const targetUrl = this.searchEngines[this.currentEngine] + query;
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
      });
    }

    // Quick links speed dial clicks
    document.querySelectorAll('.sim-shortcut-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const url = pill.getAttribute('data-url');
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      });
    });
  }
};
