/**
 * Premium Wallpaper Tab - Fullscreen Lightbox Controller
 * Pure Vanilla JS
 */

window.LightboxController = {
  isOpen: false,
  currentIndex: 0,
  currentList: [],
  modal: null,

  init() {
    this.modal = document.getElementById('lightboxModal');
    if (!this.modal) return;

    // Close button
    const closeBtn = document.getElementById('lightboxClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Nav buttons
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Apply to Simulator Button
    const applyBtn = document.getElementById('lightboxApplySim');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const item = this.getCurrent();
        if (item) {
          window.ShowcaseController.setWallpaper(item);
          window.App.showToast(`Applied "${item.title}" to Tab Simulator!`);
          this.close();
          const showcaseEl = document.getElementById('showcase');
          if (showcaseEl) showcaseEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Copy Link Button
    const copyBtn = document.getElementById('lightboxCopyLink');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const item = this.getCurrent();
        if (item) {
          navigator.clipboard.writeText(item.fullUrl).then(() => {
            window.App.showToast('Wallpaper 4K image link copied!');
          }).catch(() => {
            window.App.showToast('Link copied to clipboard');
          });
        }
      });
    }
  },

  open(wallpaperId) {
    this.currentList = window.GalleryController ? window.GalleryController.filterWallpapers() : window.WallpaperData.wallpapers;
    if (this.currentList.length === 0) {
      this.currentList = window.WallpaperData.wallpapers;
    }
    const idx = this.currentList.findIndex(w => w.id === wallpaperId);
    this.currentIndex = idx >= 0 ? idx : 0;

    this.isOpen = true;
    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.render();
  },

  close() {
    this.isOpen = false;
    this.modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.currentList.length;
    this.render();
  },

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.currentList.length) % this.currentList.length;
    this.render();
  },

  getCurrent() {
    return this.currentList[this.currentIndex];
  },

  render() {
    const item = this.getCurrent();
    if (!item) return;

    const img = document.getElementById('lightboxImage');
    const title = document.getElementById('lightboxTitle');
    const desc = document.getElementById('lightboxDesc');
    const author = document.getElementById('lightboxAuthor');
    const location = document.getElementById('lightboxLocation');
    const resolution = document.getElementById('lightboxResolution');
    const category = document.getElementById('lightboxCategory');
    const download = document.getElementById('lightboxDownload');
    const swatches = document.getElementById('lightboxSwatches');

    if (img) {
      img.src = item.fullUrl;
      img.alt = `${item.title} - ${item.author}`;
    }
    if (title) title.textContent = item.title;
    if (desc) desc.textContent = item.description;
    if (author) {
      author.textContent = item.author;
      author.href = item.authorUrl;
    }
    if (location) location.textContent = item.location;
    if (resolution) resolution.textContent = item.resolution;
    if (category) category.textContent = item.categoryName;
    if (download) {
      download.href = item.downloadUrl;
      download.setAttribute('download', `${item.title.toLowerCase().replace(/\s+/g, '-')}-4k.jpg`);
    }

    if (swatches && item.palette) {
      swatches.innerHTML = item.palette.map(color => `
        <span class="lightbox-color-dot" style="background-color: ${color}" title="${color}"></span>
      `).join('');
    }
  }
};
