/**
 * Premium Wallpaper Tab - Main Application Orchestrator
 * Pure Vanilla JavaScript
 */

window.App = {
  toastTimeout: null,

  init() {
    this.initNavbar();
    this.initModals();
    this.initSoundscape();
    this.initBackToTop();

    // Initialize Submodules
    if (window.HeroController) window.HeroController.init();
    if (window.ShowcaseController) window.ShowcaseController.init();
    if (window.GalleryController) window.GalleryController.init();
    if (window.LightboxController) window.LightboxController.init();
    if (window.FaqController) window.FaqController.init();
  },

  initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileNavToggle');
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    // Sticky nav blur on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile nav toggle
    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        mobileDrawer.classList.toggle('open');
        const isOpen = mobileDrawer.classList.contains('open');
        mobileToggle.setAttribute('aria-expanded', isOpen);
      });

      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
        });
      });
    }
  },

  initModals() {
    // Open Get Started Modal
    const getStartedBtns = document.querySelectorAll('.trigger-get-started');
    const installModal = document.getElementById('installModal');
    const privacyModal = document.getElementById('privacyModal');
    const contactModal = document.getElementById('contactModal');

    getStartedBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal(installModal);
      });
    });

    // Open Privacy Modal
    const privacyLinks = document.querySelectorAll('.trigger-privacy-modal');
    privacyLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal(privacyModal);
      });
    });

    // Open Contact Modal
    const contactLinks = document.querySelectorAll('.trigger-contact-modal');
    contactLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal(contactModal);
      });
    });

    // Generic Modal Close listeners
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      const closeBtn = modal.querySelector('.modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal(modal));
      }

      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
    });

    // Contact Form Submission (client-side interactive feedback)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.showToast('Thank you! Your message has been sent.');
        contactForm.reset();
        this.closeModal(contactModal);
      });
    }

    // Modal Escape Key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(m => this.closeModal(m));
      }
    });
  },

  openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  initSoundscape() {
    const soundToggle = document.getElementById('soundToggleBtn');
    if (!soundToggle || !window.SoundscapeManager) return;

    soundToggle.addEventListener('click', () => {
      const activeCat = window.HeroController ? window.HeroController.currentWallpaper.category : 'nature';
      const isNowPlaying = window.SoundscapeManager.toggle(activeCat);
      soundToggle.classList.toggle('active', isNowPlaying);
      this.showToast(isNowPlaying ? 'Ambient soundscape enabled' : 'Ambient soundscape muted');
    });
  },

  initBackToTop() {
    const backBtn = document.getElementById('backToTopBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  },

  showToast(message, duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }
};

// Auto-run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
