/**
 * Premium Wallpaper Tab - Hero Controller
 * Pure Vanilla JS
 */

window.HeroController = {
  currentWallpaper: null,
  bgImgA: null,
  bgImgB: null,
  activeLayer: 'A',
  clockInterval: null,

  init() {
    this.bgImgA = document.getElementById('heroBgA');
    this.bgImgB = document.getElementById('heroBgB');
    const switchBtns = document.querySelectorAll('.hero-switch-btn');
    const scrollIndicator = document.getElementById('heroScrollIndicator');

    // Default to the first featured wallpaper
    this.setWallpaper(window.WallpaperData.wallpapers[0]);

    // Realm Switcher pills in Hero
    switchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        switchBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-hero-category');
        const candidates = window.WallpaperData.getByCategory(cat);
        const randomItem = candidates[Math.floor(Math.random() * candidates.length)];
        this.setWallpaper(randomItem);

        // Also sync soundscape if active
        if (window.SoundscapeManager && window.SoundscapeManager.isPlaying) {
          window.SoundscapeManager.start(cat);
        }
      });
    });

    // Scroll Down Indicator Click
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', () => {
        const target = document.getElementById('gallery');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Dynamic Live Clock in Hero Pill
    this.startLivePillTime();
  },

  setWallpaper(wallpaper) {
    if (!wallpaper) return;
    this.currentWallpaper = wallpaper;

    // Crossfade between Layer A and B
    const incoming = this.activeLayer === 'A' ? this.bgImgB : this.bgImgA;
    const outgoing = this.activeLayer === 'A' ? this.bgImgA : this.bgImgB;

    if (incoming && outgoing) {
      incoming.src = wallpaper.fullUrl;
      incoming.alt = wallpaper.title;
      incoming.onload = () => {
        incoming.classList.remove('fading');
        incoming.classList.add('active');
        outgoing.classList.remove('active');
        outgoing.classList.add('fading');
        this.activeLayer = this.activeLayer === 'A' ? 'B' : 'A';
      };
    }
  },

  startLivePillTime() {
    const timeEl = document.getElementById('heroLiveTime');
    if (!timeEl) return;

    const update = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timeEl.textContent = `${timeStr} • Active Curations`;
    };
    update();
    this.clockInterval = setInterval(update, 10000);
  }
};
