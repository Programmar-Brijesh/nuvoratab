/**
 * Premium Wallpaper Tab - Minimal Tech Application Script
 * Pure Vanilla JavaScript (Zero External Dependencies)
 */

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

  // 4. Modal System (Get Started, Privacy, Contact)
  const installModal = document.getElementById('installModal');
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
  document.querySelectorAll('.trigger-get-started').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(installModal);
    });
  });

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

  // 8. Subtle Scroll Reveal Observer
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

  // 9. Ambient Canvas Particles System (~25 gentle floating points)
  initAmbientParticles();

  // 10. Subtle Performant Background Parallax
  initBackgroundParallax();
});

/**
 * Ambient Particles Canvas
 * Lightweight floating points with gentle alpha oscillation
 */
function initAmbientParticles() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  const ctx = canvas.getContext('2d');
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
    }, 150);
  }, { passive: true });

  // Sparingly used particles (24 total particles for ultra-clean minimalism)
  const particleCount = 24;
  const particles = [];

  const colorPalette = [
    { r: 0, g: 229, b: 255 },    // Cyan
    { r: 147, g: 197, b: 253 },  // Soft Ice Blue
    { r: 167, g: 139, b: 250 },  // Soft Violet
    { r: 240, g: 246, b: 252 }   // Crisp Tech White
  ];

  for (let i = 0; i < particleCount; i++) {
    const color = colorPalette[i % colorPalette.length];
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.8,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(Math.random() * 0.22 + 0.12), // Gentle upward drift
      baseAlpha: Math.random() * 0.25 + 0.12,
      pulseSpeed: Math.random() * 0.025 + 0.015,
      pulsePhase: Math.random() * Math.PI * 2,
      color: color
    });
  }

  function render() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];

      // Update positions
      p.x += p.vx;
      p.y += p.vy;
      p.pulsePhase += p.pulseSpeed;

      // Wrap-around screen bounds
      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      // Smooth alpha pulsing
      const alpha = p.baseAlpha * (0.65 + 0.35 * Math.sin(p.pulsePhase));

      // Draw subtle glow point
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.8})`;
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
 * Gently offsets background image and ambient orbs based on mouse and scroll
 */
function initBackgroundParallax() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  // Disable on mobile or touch-primary devices to maintain peak performance
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
    // Normalized coordinates (-1 to 1)
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;

    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(updateParallax);
    }
  }, { passive: true });

  function updateParallax() {
    // Smooth lerp interpolation
    currentX += (mouseX - currentX) * 0.04;
    currentY += (mouseY - currentY) * 0.04;

    const maxImageShift = 8; // Max 8px shift for subtle sophistication
    const maxMeshShift = 14;

    if (bgImage) {
      bgImage.style.transform = `scale(1.02) translate3d(${currentX * -maxImageShift}px, ${currentY * -maxImageShift}px, 0)`;
    }

    if (bgMesh) {
      bgMesh.style.transform = `translate3d(${currentX * maxMeshShift}px, ${currentY * maxMeshShift}px, 0)`;
    }

    // Continue animation loop if still interpolating
    if (Math.abs(mouseX - currentX) > 0.001 || Math.abs(mouseY - currentY) > 0.001) {
      requestAnimationFrame(updateParallax);
    } else {
      isMoving = false;
    }
  }
}
