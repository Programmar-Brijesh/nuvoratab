/**
 * NuvoraTab - Official Application Script
 * Pure Vanilla JavaScript (Zero External Dependencies)
 */

/**
 * Centralized Chrome Extension Installation URL
 *
 * NOTE: 'https://chromewebstore.google.com/' is currently a PLACEHOLDER.
 * Update this URL to your published Chrome Web Store listing URL before release.
 * Do not invent a fake extension ID or path.
 */
const EXTENSION_INSTALL_LINK = 'https://chromewebstore.google.com/';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar Scroll State
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Navigation
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. Functional FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isCurrentlyActive = item.classList.contains('active');

      // Close all other accordion items
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherTrigger = other.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle clicked item
      item.classList.toggle('active', !isCurrentlyActive);
      trigger.setAttribute('aria-expanded', !isCurrentlyActive ? 'true' : 'false');
    });
  });

  // 4. Centralized Extension Installation Link Binding
  document.querySelectorAll('.install-link').forEach(link => {
    link.href = EXTENSION_INSTALL_LINK;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  // Modal System (Privacy, Contact)
  const privacyModal = document.getElementById('privacyModal');
  const contactModal = document.getElementById('contactModal');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Triggers

  document.querySelectorAll('.trigger-privacy-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(privacyModal);
    });
  });

  document.querySelectorAll('.trigger-contact-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(contactModal);
    });
  });

  // Close handlers
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(closeModal);
    }
  });

  // 5. Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your feedback has been received.');
      contactForm.reset();
      closeModal(contactModal);
    });
  }

  // 6. Back to Top Button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 7. Toast Notification Utility
  window.showToast = function(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-dot"></span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  };

  // 8. Live HUD Console Clock & Realm Switcher
  const hudClock = document.getElementById('hudLiveClock');
  const hudDate = document.getElementById('hudLiveDate');
  if (hudClock && hudDate) {
    function updateHudTime() {
      const now = new Date();
      hudClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      hudDate.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    }
    updateHudTime();
    setInterval(updateHudTime, 1000);
  }

  const realmChips = document.querySelectorAll('.hud-realm-chip');
  realmChips.forEach(chip => {
    chip.addEventListener('click', () => {
      realmChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (window.showToast) window.showToast(`Previewing ${chip.textContent} realm`);
    });
  });

  // 9. Subtle Scroll Reveal Observer
  const reveals = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // 10. Ambient Canvas Particles System (~18 gentle floating points)
  initAmbientParticles();

  // 11. Subtle Performant Background Parallax
  initBackgroundParallax();
});

/**
 * Ambient Particles Canvas
 * Ultra-lightweight floating points (zero expensive shadowBlur for 60 FPS)
 */
function initAmbientParticles() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let animationFrameId = null;
  let isRunning = true;

  // Resize handler with debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 200);
  }, { passive: true });

  // 18 gentle particles for ultra-low CPU footprint
  const particleCount = 18;
  const particles = [];

  const colorPalette = [
    { r: 0, g: 229, b: 255 },    // Cyan
    { r: 147, g: 197, b: 253 },  // Soft Ice Blue
    { r: 167, g: 139, b: 250 },  // Soft Violet
    { r: 255, g: 255, b: 255 }   // Crisp Tech White
  ];

  for (let i = 0; i < particleCount; i++) {
    const color = colorPalette[i % colorPalette.length];
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.8,
      vx: (Math.random() - 0.5) * 0.1,
      vy: -(Math.random() * 0.2 + 0.1), // Gentle upward drift
      baseAlpha: Math.random() * 0.3 + 0.15,
      pulseSpeed: Math.random() * 0.02 + 0.012,
      pulsePhase: Math.random() * Math.PI * 2,
      color: color
    });
  }

  function render() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.pulsePhase += p.pulseSpeed;

      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const alpha = p.baseAlpha * (0.7 + 0.3 * Math.sin(p.pulsePhase));

      // Fast, lightweight circle drawing with zero shadowBlur
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
      ctx.fill();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  render();

  // Pause rendering when tab is inactive to preserve CPU / battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
      if (!isRunning) {
        isRunning = true;
        render();
      }
    }
  });
}

/**
 * Subtle Background Parallax
 * Hardware-accelerated translate3d transforms only (zero layout reflows)
 */
function initBackgroundParallax() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  // Disable on mobile or touch-primary devices
  if (window.innerWidth < 768 || window.matchMedia('(hover: none)').matches) return;

  const bgImage = document.getElementById('bgImageLayer');
  const bgMesh = document.getElementById('bgAnimatedMesh');
  if (!bgImage && !bgMesh) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;

    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(updateParallax);
    }
  }, { passive: true });

  function updateParallax() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    const maxImageShift = 8;
    const maxMeshShift = 12;

    if (bgImage) {
      bgImage.style.transform = `translate3d(${currentX * -maxImageShift}px, ${currentY * -maxImageShift}px, 0)`;
    }

    if (bgMesh) {
      bgMesh.style.transform = `translate3d(${currentX * maxMeshShift}px, ${currentY * maxMeshShift}px, 0)`;
    }

    if (Math.abs(mouseX - currentX) > 0.002 || Math.abs(mouseY - currentY) > 0.002) {
      requestAnimationFrame(updateParallax);
    } else {
      isMoving = false;
    }
  }
}
