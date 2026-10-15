// ============================================================================
// DEVELOPER INQUIRY API BACKEND CONFIGURATION
// ============================================================================
const INQUIRY_API_ENDPOINT =
  window.NUVORATAB_SUPPORT_API_URL ||
  'https://nuvoratab-support-worker.brijeshverma8896.workers.dev/api/support';

document.addEventListener('DOMContentLoaded', () => {
  const DEVELOPER_EMAIL = 'brijeshverma8896@gmail.com';

  // 1. Sticky Navbar
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // 2. Mobile Navigation Drawer
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

  // 3. One-Click Copy Email
  const copyBtn = document.getElementById('copyEmailBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(DEVELOPER_EMAIL);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = DEVELOPER_EMAIL;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        showToast('Copied brijeshverma8896@gmail.com to clipboard!');
      } catch (err) {
        showToast('Email: brijeshverma8896@gmail.com');
      }
    });
  }

  // 4. Project Inquiry Alert Helpers
  const formAlert = document.getElementById('inquiryFormAlert');
  const alertIcon = document.getElementById('inquiryAlertIcon');
  const alertTitle = document.getElementById('inquiryAlertTitle');
  const alertBody = document.getElementById('inquiryAlertBody');
  const submitBtn = document.getElementById('sendInquiryBtn');

  function showAlert(type, title, messageHtml) {
    if (!formAlert) return;
    formAlert.className = `form-alert visible ${type}`;
    if (alertTitle) alertTitle.textContent = title;
    if (alertBody) alertBody.innerHTML = messageHtml;

    if (alertIcon) {
      if (type === 'success') {
        alertIcon.innerHTML = `
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#10b981" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        `;
      } else {
        alertIcon.innerHTML = `
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ef4444" stroke-width="2">
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

  // 5. Project Inquiry Composer & Cloudflare Worker Integration
  const inquiryForm = document.getElementById('projectInquiryForm');
  const copyBriefBtn = document.getElementById('copyBriefBtn');

  function buildInquiryData() {
    const name = document.getElementById('inquiryName')?.value.trim() || 'Client';
    const email = document.getElementById('inquiryEmail')?.value.trim() || 'Not specified';
    const company = document.getElementById('inquiryCompany')?.value.trim() || 'Individual';
    const service = document.getElementById('inquiryService')?.value || 'Web Application';
    const budget = document.getElementById('inquiryBudget')?.value || 'Flexible';
    const details = document.getElementById('inquiryDetails')?.value.trim() || '';

    const subject = `[Project Inquiry] ${service} - ${name} (${company})`;
    const body = 
`Hello Brijesh,

I would like to discuss a potential project with you. Here are the details:

- Name: ${name}
- Email: ${email}
- Organization / Company: ${company}
- Service Required: ${service}
- Estimated Budget Range: ${budget}

Project Brief & Goals:
${details}

Looking forward to hearing from you.

Best regards,
${name}`;

    return { name, email, company, service, budget, details, subject, body };
  }

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const name = document.getElementById('inquiryName')?.value.trim() || '';
      const email = document.getElementById('inquiryEmail')?.value.trim() || '';
      const company = document.getElementById('inquiryCompany')?.value.trim() || '';
      const service = document.getElementById('inquiryService')?.value || 'Custom Business Website';
      const budget = document.getElementById('inquiryBudget')?.value || 'Flexible';
      const details = document.getElementById('inquiryDetails')?.value.trim() || '';

      // Validation
      if (!name) {
        showAlert('error', 'Missing Name', 'Please provide your name or business identity.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showAlert('error', 'Invalid Email', 'Please enter a valid email address so I can follow up on your proposal.');
        return;
      }

      if (!details || details.length < 5) {
        showAlert('error', 'Brief Too Short', 'Please provide at least a few sentences describing your project goals.');
        return;
      }

      // UI Loading state
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
          <span>Dispatching Brief...</span>
        `;
      }

      try {
        const response = await fetch(INQUIRY_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            source: 'portfolio',
            type: 'portfolio_inquiry',
            name,
            email,
            company,
            service,
            subject: service,
            budget,
            message: details
          })
        });

        const result = await response.json().catch(() => null);

        if (response.ok && result && result.success) {
          const ticketId = result.ticketId || 'NVT-DEV';
          showAlert(
            'success',
            `Proposal #${ticketId} Dispatched!`,
            `Thank you, <strong>${name}</strong>! Your project brief has been delivered directly to my private Discord notification channel. I will review the specifications and reply to <strong>${email}</strong> promptly.<br><span style="margin-top: 8px; display: inline-block;">Reference ID: <code>${ticketId}</code></span>`
          );
          inquiryForm.reset();
          showToast(`Project enquiry #${ticketId} dispatched successfully!`);
        } else {
          const errMsg = (result && result.error) ? result.error : 'Unable to dispatch project enquiry to the server.';
          showAlert(
            'error',
            'Submission Failed',
            `${errMsg}<br><span style="margin-top: 8px; display: inline-block;">You can also copy your brief using the <strong>Copy Brief</strong> button below and email it directly to <strong>${DEVELOPER_EMAIL}</strong>.</span>`
          );
        }
      } catch (err) {
        showAlert(
          'error',
          'Network Error',
          `Could not connect to the enquiry service. Please check your internet connection or email directly to <strong>${DEVELOPER_EMAIL}</strong>.`
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

  if (copyBriefBtn) {
    copyBriefBtn.addEventListener('click', async () => {
      const { body } = buildInquiryData();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(body);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = body;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        showToast('Project brief copied to clipboard! You can paste it in your email.');
      } catch {
        showToast('Please copy your brief from the form.');
      }
    });
  }

  // 5. Toast Notification Utility
  function showToast(message, duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  window.showToast = showToast;
});
