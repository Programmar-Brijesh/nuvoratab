/**
 * NuvoraTab - Support & Help Center Logic
 * Pure Vanilla JavaScript (Zero External Dependencies)
 */

const SUPPORT_EMAIL = 'brijeshverma8896@gmail.com';
const EXTENSION_INSTALL_LINK = 'https://chromewebstore.google.com/';

// ============================================================================
// NUVORATAB SUPPORT API BACKEND CONFIGURATION
// ============================================================================
// Configure your deployed Cloudflare Worker endpoint below.
// - Local development:
//     'http://localhost:8787/api/support' (Cloudflare Worker via `npx wrangler dev`)
// - Production:
//     'https://nuvoratab-support-worker.brijeshverma8896.workers.dev/api/support'
// - Dynamic override:
//     Can also be set on window.NUVORATAB_SUPPORT_API_URL before script loads.
// ============================================================================
const SUPPORT_API_ENDPOINT =
  window.NUVORATAB_SUPPORT_API_URL ||
  'https://nuvoratab-support-worker.brijeshverma8896.workers.dev/api/support';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
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

  // 4. One-Click Copy Email Feature
  const copyBtn = document.getElementById('copyEmailBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const copyIcon = document.getElementById('copyIcon');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(SUPPORT_EMAIL);
        } else {
          // Fallback for older environments
          const textArea = document.createElement('textarea');
          textArea.value = SUPPORT_EMAIL;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }

        showToast(`Copied ${SUPPORT_EMAIL} to clipboard!`);

        // Visual feedback on button
        if (copyBtnText) copyBtnText.textContent = 'Copied!';
        if (copyIcon) {
          copyIcon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
          copyIcon.setAttribute('stroke', '#10b981');
        }

        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Email';
          if (copyIcon) {
            copyIcon.innerHTML = `
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            `;
            copyIcon.setAttribute('stroke', 'currentColor');
          }
        }, 2200);
      } catch (err) {
        showToast(`Email: ${SUPPORT_EMAIL}`);
      }
    });
  }

  // 5. Diagnostics Auto-detection
  const diagPreview = document.getElementById('diagnosticsPreviewText');
  let diagnosticSummary = '';
  try {
    const screenRes = `${window.screen.width}x${window.screen.height} (Scale: ${window.devicePixelRatio || 1}x)`;
    const userAgent = navigator.userAgent;
    let browser = 'Chromium-based';
    if (userAgent.includes('Edg/')) browser = 'Microsoft Edge';
    else if (userAgent.includes('Brave/')) browser = 'Brave';
    else if (userAgent.includes('Chrome/')) browser = 'Google Chrome';
    else if (userAgent.includes('Firefox/')) browser = 'Mozilla Firefox';

    diagnosticSummary = `${browser} &bull; Screen: ${screenRes} &bull; Language: ${navigator.language || 'en'}`;
    if (diagPreview) {
      diagPreview.innerHTML = diagnosticSummary;
    }
  } catch (e) {
    if (diagPreview) diagPreview.textContent = 'System info ready';
  }

  // 6. Interactive Category Cards
  const categoryCards = document.querySelectorAll('.category-card');
  const categorySelect = document.getElementById('supportCategory');
  const subjectInput = document.getElementById('supportSubject');

  const categoryMap = {
    bug: { selectVal: 'Bug Report', placeholder: 'e.g. Wallpaper not loading on new tab' },
    wallpaper: { selectVal: 'Wallpaper Suggestion', placeholder: 'e.g. Suggesting 4K Space Nebula collection' },
    feature: { selectVal: 'Feature Suggestion', placeholder: 'e.g. Custom clock styling & font size' },
    privacy: { selectVal: 'Privacy Question', placeholder: 'e.g. Clarification on local storage execution' }
  };

  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      categoryCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const catKey = card.getAttribute('data-category');
      if (catKey && categoryMap[catKey] && categorySelect) {
        categorySelect.value = categoryMap[catKey].selectVal;
        if (subjectInput && !subjectInput.value) {
          subjectInput.placeholder = categoryMap[catKey].placeholder;
        }

        // Smooth scroll to form on mobile or small devices
        if (window.innerWidth < 900) {
          const formSec = document.getElementById('ticketFormSection');
          if (formSec) {
            formSec.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // 7. Support Ticket Form Submission (Backend API & Discord Webhook)
  const supportForm = document.getElementById('supportTicketForm');
  const submitBtn = document.getElementById('submitSupportBtn');
  const openMailClientBtn = document.getElementById('openMailClientBtn');
  const formAlert = document.getElementById('supportFormAlert');
  const alertIcon = document.getElementById('formAlertIcon');
  const alertTitle = document.getElementById('formAlertTitle');
  const alertBody = document.getElementById('formAlertBody');

  function showAlert(type, title, message) {
    if (!formAlert) return;
    formAlert.className = `form-alert visible ${type}`;
    if (alertTitle) alertTitle.textContent = title;
    if (alertBody) alertBody.innerHTML = message;

    if (alertIcon) {
      if (type === 'success') {
        alertIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="form-alert-icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        `;
      } else {
        alertIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="form-alert-icon">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        `;
      }
    }

    formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (!formAlert) return;
    formAlert.className = 'form-alert';
    if (alertBody) alertBody.innerHTML = '';
  }

  function getDiagnosticsString() {
    const includeDiag = document.getElementById('includeDiagnostics')?.checked;
    if (!includeDiag) return '';

    try {
      const screenRes = `${window.screen.width}x${window.screen.height} (Scale: ${window.devicePixelRatio || 1}x)`;
      const viewport = `${window.innerWidth}x${window.innerHeight}`;
      const lang = navigator.language || 'en';
      const userAgent = navigator.userAgent;

      return `Browser / OS: ${userAgent}\nScreen Resolution: ${screenRes}\nViewport: ${viewport}\nLanguage: ${lang}\nTimestamp: ${new Date().toISOString()}`;
    } catch {
      return 'Diagnostics collection failed';
    }
  }

  function buildMailtoUrl() {
    const name = (document.getElementById('supportName')?.value || '').trim();
    const email = (document.getElementById('supportEmail')?.value || '').trim();
    const category = document.getElementById('supportCategory')?.value || 'Support Request';
    const subject = (document.getElementById('supportSubject')?.value || 'NuvoraTab Support Request').trim();
    const message = (document.getElementById('supportMessage')?.value || '').trim();
    const diagnostics = getDiagnosticsString();

    let bodyText = `Hi NuvoraTab Team,\n\n`;
    bodyText += `Category: ${category}\n`;
    if (name) bodyText += `From: ${name}\n`;
    if (email) bodyText += `Reply-To: ${email}\n`;
    bodyText += `\n--- Message ---\n${message}\n\n`;

    if (diagnostics) {
      bodyText += `--- System Diagnostics ---\n${diagnostics}\n`;
    }

    const fullSubject = `[NuvoraTab Support] [${category}] ${subject}`;
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(bodyText)}`;
  }

  if (supportForm) {
    supportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const name = (document.getElementById('supportName')?.value || '').trim();
      const email = (document.getElementById('supportEmail')?.value || '').trim();
      const category = document.getElementById('supportCategory')?.value || 'General Question';
      const subject = (document.getElementById('supportSubject')?.value || '').trim();
      const message = (document.getElementById('supportMessage')?.value || '').trim();
      const diagnostics = getDiagnosticsString();

      // Basic client-side checks
      if (!name || !email || !subject || !message) {
        showAlert('error', 'Missing Information', 'Please complete all required fields.');
        return;
      }

      // UI Loading state
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spinner-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
          <span>Sending Ticket...</span>
        `;
      }

      try {
        const response = await fetch(SUPPORT_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            category,
            subject,
            message,
            diagnostics
          })
        });

        const result = await response.json().catch(() => null);

        if (response.ok && result && result.success) {
          const ticketId = result.ticketId || 'NVT-SUPPORT';
          showAlert(
            'success',
            `Ticket #${ticketId} Dispatched`,
            `Your support request was delivered to our Discord support channel. Our team has been notified and will follow up with you at <strong>${email}</strong>.<br><span style="margin-top: 6px; display: inline-block;">Keep your Ticket ID <code>${ticketId}</code> for reference.</span>`
          );
          showToast(`Ticket #${ticketId} dispatched successfully!`);

          // Reset form fields
          supportForm.reset();

          // Reset category card selections
          document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
        } else {
          const errorMsg = (result && result.error) || 'Could not deliver your support ticket. Please verify your connection or try again.';
          showAlert(
            'error',
            'Submission Failed',
            `${errorMsg}<br><br>Need immediate help? You can also email us directly at <a href="mailto:${SUPPORT_EMAIL}" style="color: #ffffff; text-decoration: underline;">${SUPPORT_EMAIL}</a>.`
          );
          showToast('Failed to dispatch ticket. Please see the error message.');
        }
      } catch (err) {
        showAlert(
          'error',
          'Network Error',
          `Unable to reach the support service. Please check your internet connection or email us directly at <a href="mailto:${SUPPORT_EMAIL}" style="color: #ffffff; text-decoration: underline;">${SUPPORT_EMAIL}</a>.`
        );
        showToast('Network error while dispatching ticket.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

  if (openMailClientBtn) {
    openMailClientBtn.addEventListener('click', () => {
      const mailtoUrl = buildMailtoUrl();
      window.location.href = mailtoUrl;
    });
  }

  // 8. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isCurrentlyActive = item.classList.contains('active');

      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherTrigger = other.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('active', !isCurrentlyActive);
      trigger.setAttribute('aria-expanded', !isCurrentlyActive ? 'true' : 'false');
    });
  });

  // 9. Back to Top Button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 10. Modals (Privacy, Contact)
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

  // 11. Toast Notifications
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
    }, 3500);
  };
});
