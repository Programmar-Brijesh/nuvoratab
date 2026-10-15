/**
 * NuvoraTab - Dedicated Extension Page Logic
 * Pure Vanilla JavaScript (Zero External Dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
  const EXTENSION_INSTALL_LINK = 'https://chromewebstore.google.com/';

  // 1. Sticky Navbar
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu
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

  // 3. Centralized Install Links
  document.querySelectorAll('.install-link').forEach(link => {
    link.href = EXTENSION_INSTALL_LINK;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
});
