/**
 * Premium Wallpaper Tab - Interactive Wallpaper Gallery
 * Pure Vanilla JS
 */

window.GalleryController = {
  activeCategory: 'all',
  searchQuery: '',
  favorites: new Set(),

  init() {
    this.loadFavorites();
    this.bindEvents();
    this.render();
  },

  loadFavorites() {
    try {
      const stored = localStorage.getItem('pwt_favorites');
      if (stored) {
        this.favorites = new Set(JSON.parse(stored));
      }
    } catch (e) {
      this.favorites = new Set();
    }
  },

  saveFavorites() {
    try {
      localStorage.setItem('pwt_favorites', JSON.stringify([...this.favorites]));
    } catch (e) {}
  },

  toggleFavorite(id, e) {
    if (e) e.stopPropagation();
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
      window.App.showToast('Removed from favorites');
    } else {
      this.favorites.add(id);
      window.App.showToast('Saved to your favorites!');
    }
    this.saveFavorites();
    this.updateFavButton(id);
  },

  updateFavButton(id) {
    const btn = document.querySelector(`.card-fav-btn[data-fav-id="${id}"]`);
    if (btn) {
      const isFav = this.favorites.has(id);
      btn.classList.toggle('favorited', isFav);
      btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
      btn.innerHTML = isFav 
        ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
        : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    }
  },

  bindEvents() {
    // Category Tabs
    const tabs = document.querySelectorAll('.gallery-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeCategory = tab.getAttribute('data-category');
        this.render();
      });
    });

    // Search Input
    const searchInput = document.getElementById('gallerySearchInput');
    const clearBtn = document.getElementById('gallerySearchClear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (clearBtn) {
          clearBtn.classList.toggle('visible', this.searchQuery.length > 0);
        }
        this.render();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.searchQuery = '';
        clearBtn.classList.remove('visible');
        this.render();
      });
    }
  },

  filterWallpapers() {
    return window.WallpaperData.wallpapers.filter(w => {
      // Category match
      const catMatch = this.activeCategory === 'all' || w.category === this.activeCategory;
      if (!catMatch) return false;

      // Search match
      if (!this.searchQuery) return true;
      const q = this.searchQuery;
      return (
        w.title.toLowerCase().includes(q) ||
        w.author.toLowerCase().includes(q) ||
        w.location.toLowerCase().includes(q) ||
        w.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  },

  render() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const items = this.filterWallpapers();

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="gallery-empty-state">
          <div class="gallery-empty-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <h3 class="gallery-empty-title">No matching wallpapers found</h3>
          <p class="gallery-empty-desc">We couldn't find any wallpapers matching "${this.searchQuery}". Try a keyword like "aurora", "dune", or "nebula".</p>
          <button class="btn btn-secondary btn-sm" id="resetGalleryFilterBtn">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetGalleryFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.activeCategory = 'all';
          const searchInput = document.getElementById('gallerySearchInput');
          if (searchInput) searchInput.value = '';
          const clearBtn = document.getElementById('gallerySearchClear');
          if (clearBtn) clearBtn.classList.remove('visible');
          document.querySelectorAll('.gallery-tab-btn').forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-category') === 'all');
          });
          this.render();
        });
      }
      return;
    }

    grid.innerHTML = items.map(w => {
      const isFav = this.favorites.has(w.id);
      return `
        <div class="wallpaper-card" data-id="${w.id}">
          <div class="wallpaper-image-wrap">
            <img 
              class="wallpaper-thumb image-loading" 
              src="${w.previewUrl}" 
              alt="${w.title} - ${w.resolution}"
              loading="lazy"
              onload="this.classList.remove('image-loading'); this.classList.add('image-loaded');"
              onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'image-error-fallback\\'><span>Artwork Ready</span></div>';"
            />
          </div>

          <!-- Top Meta Bar -->
          <div class="card-top-bar">
            <span class="card-badge">${w.categoryName} • ${w.resolution.split(' ')[0]}</span>
            <button class="card-fav-btn ${isFav ? 'favorited' : ''}" data-fav-id="${w.id}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              ${isFav 
                ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
                : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`}
            </button>
          </div>

          <!-- Bottom Card Overlay -->
          <div class="card-overlay">
            <h4 class="card-title">${w.title}</h4>
            <div class="card-meta-line">
              <span class="card-author">${w.author}</span>
              <span class="card-location">${w.location}</span>
            </div>
            
            <div class="card-actions-row">
              <button class="card-action-btn primary-action apply-sim-btn" data-id="${w.id}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Set Active
              </button>
              <button class="card-action-btn open-lightbox-btn" data-id="${w.id}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                View 4K
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach card event listeners
    grid.querySelectorAll('.wallpaper-card').forEach(card => {
      const id = card.getAttribute('data-id');

      // Click card to open lightbox
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-fav-btn') || e.target.closest('.apply-sim-btn')) return;
        window.LightboxController.open(id);
      });

      // Favorite toggle
      const favBtn = card.querySelector('.card-fav-btn');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          this.toggleFavorite(id, e);
        });
      }

      // Apply to simulator button
      const simBtn = card.querySelector('.apply-sim-btn');
      if (simBtn) {
        simBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const wallpaper = window.WallpaperData.getById(id);
          window.ShowcaseController.setWallpaper(wallpaper);
          window.App.showToast(`Set "${wallpaper.title}" as active!`);
          const showcaseEl = document.getElementById('showcase');
          if (showcaseEl) {
            showcaseEl.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    });
  }
};
