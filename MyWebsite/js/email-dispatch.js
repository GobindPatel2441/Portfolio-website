/**
 * ===================================================================
 * GOBIND PATEL — EMAIL DISPATCH CONTROLLER
 * Real-time EmailJS integration for the "TRANSMIT DISPATCH" contact form
 * Features:
 * - RFC Email & Field Validation
 * - Honeypot & Cooldown Spam Protection
 * - Accessible Live Status Alerts (WCAG 2.2 AA)
 * - Anti-Duplicate Submission Lock
 * - Preserves User Input on Error
 * - Form Reset ONLY on Confirmed Delivery
 * ===================================================================
 */

(function () {
  'use strict';

  // Cooldown duration between dispatches (seconds)
  const COOLDOWN_SECONDS = 30;
  const MIN_FILL_TIME_MS = 2000; // Minimum time between page load & submit (bot barrier)
  const pageLoadedAt = Date.now();

  let emailJsPromise = null;
  function loadEmailJsSdk() {
    if (window.emailjs) return Promise.resolve(window.emailjs);
    if (emailJsPromise) return emailJsPromise;
    emailJsPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      s.defer = true;
      s.onload = () => resolve(window.emailjs);
      s.onerror = () => reject(new Error('EmailJS SDK failed to load. Please verify your internet connection.'));
      document.head.appendChild(s);
    });
    return emailJsPromise;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Preload SDK as soon as user focuses any contact field or scrolls near #contact
    form.addEventListener('focusin', loadEmailJsSdk, { once: true, passive: true });
    const contactSec = document.getElementById('contact');
    if (contactSec && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadEmailJsSdk();
          observer.disconnect();
        }
      }, { rootMargin: '600px 0px' });
      observer.observe(contactSec);
    }

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const botCheckInput = document.getElementById('contact-bot-check');
    const submitBtn = document.getElementById('contact-submit-btn') || form.querySelector('button[type="submit"]');
    const statusBanner = document.getElementById('contact-status-banner');

    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') || submitBtn.querySelector('span') : null;
    const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;
    const defaultBtnHTML = btnText ? btnText.innerHTML : 'TRANSMIT DISPATCH ↗';

    let isSubmitting = false;

    // -------------------------------------------------------------
    // 1. SECURITY: HTML SANITIZATION & INPUT VALIDATION
    // -------------------------------------------------------------
    function escapeHTML(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    const fields = [
      { el: nameInput, errorId: 'name-error', validate: v => v.trim().length >= 2 && v.trim().length <= 100, msg: 'Please provide your full name (2–100 characters).' },
      { el: emailInput, errorId: 'email-error', validate: v => isValidEmail(v) && v.trim().length <= 254, msg: 'Please provide a valid email address (up to 254 characters).' },
      { el: subjectInput, errorId: 'subject-error', validate: v => v.trim().length >= 3 && v.trim().length <= 150, msg: 'Please enter an objective or subject (3–150 characters).' },
      { el: messageInput, errorId: 'message-error', validate: v => v.trim().length >= 10 && v.trim().length <= 3000, msg: 'Please detail your dispatch scope (10–3000 characters).' }
    ];

    function isValidEmail(email) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      return emailRegex.test(email.trim());
    }

    // Clear individual field errors on keystroke
    fields.forEach(({ el, errorId }) => {
      if (!el) return;
      el.addEventListener('input', () => {
        el.classList.remove('is-invalid');
        const errEl = document.getElementById(errorId);
        if (errEl) {
          errEl.textContent = '';
          errEl.classList.remove('visible');
        }
        hideStatusBanner();
      });
    });

    function validateAllFields() {
      let isValid = true;
      let firstInvalidEl = null;

      fields.forEach(({ el, errorId, validate, msg }) => {
        if (!el) return;
        const valid = validate(el.value);
        const errEl = document.getElementById(errorId);

        if (!valid) {
          isValid = false;
          el.classList.add('is-invalid');
          if (errEl) {
            errEl.textContent = msg;
            errEl.classList.add('visible');
          }
          if (!firstInvalidEl) firstInvalidEl = el;
        } else {
          el.classList.remove('is-invalid');
          if (errEl) {
            errEl.textContent = '';
            errEl.classList.remove('visible');
          }
        }
      });

      if (firstInvalidEl) {
        firstInvalidEl.focus();
      }

      return isValid;
    }

    // -------------------------------------------------------------
    // 2. STATUS BANNER HELPERS
    // -------------------------------------------------------------
    function showStatusBanner(type, htmlContent) {
      if (!statusBanner) return;
      statusBanner.className = `dispatch-status-banner ${type}`;
      statusBanner.innerHTML = htmlContent;
      statusBanner.style.display = 'flex';
      statusBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideStatusBanner() {
      if (!statusBanner) return;
      statusBanner.style.display = 'none';
      statusBanner.innerHTML = '';
      statusBanner.className = 'dispatch-status-banner';
    }

    // -------------------------------------------------------------
    // 3. SPAM & COOLDOWN PROTECTION
    // -------------------------------------------------------------
    function checkSpamAndRateLimit() {
      // A. Honeypot check
      if (botCheckInput && botCheckInput.value.trim() !== '') {
        console.warn('[Dispatch] Honeypot trap triggered. Dropping automated submission.');
        return { allowed: false, reason: 'bot' };
      }

      // B. Human timing check (filled too quickly)
      if (Date.now() - pageLoadedAt < MIN_FILL_TIME_MS) {
        console.warn('[Dispatch] Submitted suspiciously fast.');
        return { allowed: false, reason: 'fast' };
      }

      // C. Cooldown check via sessionStorage
      const lastSubmit = sessionStorage.getItem('last_dispatch_timestamp');
      if (lastSubmit) {
        const elapsedSeconds = Math.floor((Date.now() - parseInt(lastSubmit, 10)) / 1000);
        if (elapsedSeconds < COOLDOWN_SECONDS) {
          const remaining = COOLDOWN_SECONDS - elapsedSeconds;
          return { allowed: false, reason: 'cooldown', remaining };
        }
      }

      return { allowed: true };
    }

    // -------------------------------------------------------------
    // 4. SUBMISSION ORCHESTRATION
    // -------------------------------------------------------------
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (isSubmitting) return; // Prevent duplicate concurrent clicks

      hideStatusBanner();

      // Step A: Validate fields
      if (!validateAllFields()) {
        showStatusBanner('error', `
          <div class="banner-icon">⚠</div>
          <div class="banner-text">
            <strong>Incomplete Dispatch:</strong> Please review and correct the highlighted fields above.
          </div>
        `);
        return;
      }

      // Step B: Spam & Cooldown check
      const spamCheck = checkSpamAndRateLimit();
      if (!spamCheck.allowed) {
        if (spamCheck.reason === 'cooldown') {
          showStatusBanner('info', `
            <div class="banner-icon">⏳</div>
            <div class="banner-text">
              <strong>Cooldown Active:</strong> A dispatch was recently transmitted. Please wait <strong>${spamCheck.remaining}s</strong> before dispatching another message.
            </div>
          `);
        } else {
          // Silent bot drop
          showStatusBanner('info', `
            <div class="banner-icon">✓</div>
            <div class="banner-text">
              <strong>Dispatch Received.</strong>
            </div>
          `);
        }
        return;
      }

      // Step C: Enter loading state
      isSubmitting = true;
      setButtonLoading(true);

      // Sanitize inputs and strip control characters / newlines from header fields
      const sanitizedName = nameInput.value.trim().slice(0, 100);
      const sanitizedEmail = emailInput.value.trim().slice(0, 254);
      const sanitizedSubject = subjectInput.value.trim().replace(/[\r\n]+/g, ' ').slice(0, 150);
      const sanitizedMessage = messageInput.value.trim().slice(0, 3000);

      const formData = {
        from_name: sanitizedName,
        name: sanitizedName,
        reply_to: sanitizedEmail,
        email: sanitizedEmail,
        subject: sanitizedSubject,
        title: sanitizedSubject,
        message: sanitizedMessage,
        to_email: (window.EMAILJS_CONFIG && window.EMAILJS_CONFIG.RECIPIENT_EMAIL) || 'gobindpatel2005@gmail.com'
      };

      // Step D: Verify EmailJS availability
      const config = window.EMAILJS_CONFIG || {};
      const isConfigured = config.PUBLIC_KEY &&
                           config.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
                           config.SERVICE_ID &&
                           config.SERVICE_ID !== 'service_portfolio';

      if (!isConfigured) {
        // Developer setup guidance mode
        setTimeout(() => {
          setButtonLoading(false);
          isSubmitting = false;

          showStatusBanner('info', `
            <div class="banner-icon">⚙️</div>
            <div class="banner-text">
              <strong>EmailJS Setup Pending:</strong> Validation passed! To receive live messages in your inbox (<code>${escapeHTML(formData.to_email)}</code>), add your EmailJS keys in <code>js/email-config.js</code> or <code>.env</code>.
              <div style="margin-top: 0.4rem; font-size: 0.78rem; opacity: 0.85;">
                Sender: <strong>${escapeHTML(formData.from_name)}</strong> (${escapeHTML(formData.reply_to)}) • Subject: <strong>${escapeHTML(formData.subject)}</strong>
              </div>
            </div>
          `);

          console.info(
            '%c[EmailJS Setup]%c To enable live delivery:\n1. Sign up at https://www.emailjs.com/\n2. Add an Email Service & Template\n3. Set SERVICE_ID, TEMPLATE_ID, and PUBLIC_KEY in js/email-config.js',
            'background: #D4AF37; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
            'color: #F7E7C4; font-family: monospace;'
          );
        }, 800);
        return;
      }

      // Step E: Real EmailJS delivery
      try {
        await loadEmailJsSdk();
        if (typeof window.emailjs === 'undefined') {
          throw new Error('EmailJS SDK failed to load. Please verify your internet connection.');
        }

        // Initialize with public key
        window.emailjs.init({ publicKey: config.PUBLIC_KEY });

        const response = await window.emailjs.send(
          config.SERVICE_ID,
          config.TEMPLATE_ID,
          formData
        );

        if (response.status === 200 || response.text === 'OK') {
          // Success confirmed!
          sessionStorage.setItem('last_dispatch_timestamp', Date.now().toString());

          // Clear form ONLY on confirmed delivery
          form.reset();

          showStatusBanner('success', `
            <div class="banner-icon">✓</div>
            <div class="banner-text">
              <strong>DISPATCH TRANSMITTED:</strong> Your message has been routed to Gobind's terminal. Expect a response shortly.
            </div>
          `);

          if (typeof window.showToast === 'function') {
            window.showToast('Dispatch delivered to Gobind Patel!');
          }

          if (window.PortfolioAudio) {
            if (typeof window.PortfolioAudio.playSuccess === 'function') {
              window.PortfolioAudio.playSuccess();
            } else if (typeof window.PortfolioAudio.playBlip === 'function') {
              window.PortfolioAudio.playBlip();
            }
          }

          setButtonSuccess();
        } else {
          throw new Error(`EmailJS responded with status: ${response.status}`);
        }
      } catch (error) {
        console.error('[Dispatch Error]', error);

        if (window.PortfolioAudio && typeof window.PortfolioAudio.playError === 'function') {
          window.PortfolioAudio.playError();
        }

        // Form fields are preserved so the user doesn't lose their message
        showStatusBanner('error', `
          <div class="banner-icon">⚠</div>
          <div class="banner-text">
            <strong>TRANSMISSION FAILED:</strong> ${escapeHTML(error.text || error.message || 'Unable to route dispatch.')}
            <div style="margin-top: 0.4rem; font-size: 0.78rem;">
              You can also reach out directly via <a href="mailto:${escapeHTML(formData.to_email)}" style="color: var(--accent-primary); text-decoration: underline;">${escapeHTML(formData.to_email)}</a>.
            </div>
          </div>
        `);

        if (typeof window.showToast === 'function') {
          window.showToast('Transmission failed. Please retry.');
        }
      } finally {
        isSubmitting = false;
        setButtonLoading(false);
      }
    });

    // -------------------------------------------------------------
    // 5. BUTTON STATE MANAGERS
    // -------------------------------------------------------------
    function setButtonLoading(loading) {
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      submitBtn.classList.toggle('is-loading', loading);

      if (btnSpinner) {
        btnSpinner.style.display = loading ? 'inline-block' : 'none';
      }

      if (btnText) {
        btnText.innerHTML = loading ? 'TRANSMITTING DISPATCH...' : defaultBtnHTML;
      }
    }

    function setButtonSuccess() {
      if (!submitBtn || !btnText) return;
      submitBtn.disabled = true;
      submitBtn.style.background = 'var(--accent-primary)';
      submitBtn.style.color = '#000';
      btnText.innerHTML = 'DISPATCH TRANSMITTED ✓';

      setTimeout(() => {
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.disabled = false;
        btnText.innerHTML = defaultBtnHTML;
      }, 4000);
    }
  });
})();
