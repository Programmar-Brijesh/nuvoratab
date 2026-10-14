/**
 * Premium Wallpaper Tab - Accessible FAQ Accordion
 * Pure Vanilla JS
 */

window.FaqController = {
  init() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-question-btn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other items
        items.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current item
        item.classList.toggle('active', !isActive);
        btn.setAttribute('aria-expanded', !isActive ? 'true' : 'false');
      });
    });
  }
};
