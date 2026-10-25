/**
 * MAIN APP CONTROLLER (CINEMATIC LUXURY)
 * Atmosphere Theme Switcher, Audio Synthesizer, Custom Cursor, Stats Counter
 */

// 1. Audio Interface Bridge (Backed by Earshot SoundEffects Engine)
if (!window.PortfolioAudio) {
  window.PortfolioAudio = {
    playClick: function () {
      if (window.SoundEffects) window.SoundEffects.playClick();
    },
    playBlip: function () {
      if (window.SoundEffects) window.SoundEffects.playNav();
    },
    playPop: function () {
      if (window.SoundEffects) window.SoundEffects.playPopIn();
    },
    playSuccess: function () {
      if (window.SoundEffects) window.SoundEffects.playSuccess();
    },
    playError: function () {
      if (window.SoundEffects) window.SoundEffects.playError();
    },
    toggleMute: function () {
      if (window.SoundEffects) return window.SoundEffects.toggleEnabled();
      return false;
    },
    isMuted: function () {
      if (window.SoundEffects) return !window.SoundEffects.isEnabled();
      return true;
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. ATMOSPHERE THEME SWITCHER
  // -------------------------------------------------------------
  const themeBtns = document.querySelectorAll('.theme-btn');
  const savedTheme = localStorage.getItem('portfolio-theme') || 'gold';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    localStorage.setItem('portfolio-theme', theme);
  }

  applyTheme(savedTheme);

  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTheme = btn.dataset.theme;
      applyTheme(targetTheme);

      const themeLabels = {
        gold: '⚜️ Cinematic Gold Atmosphere',
        obsidian: '🌑 Obsidian Noir Atmosphere',
        emerald: '🌲 Emerald Horizon Atmosphere',
        cyber: '⚡ Celestial Cobalt Atmosphere'
      };

      showToast(themeLabels[targetTheme] || 'Atmosphere Updated');
      if (window.PortfolioAudio) window.PortfolioAudio.playClick();
    });
  });

  // -------------------------------------------------------------
  // 3. SIGNATURE CONTEXTUAL CURSOR: Handled by js/custom-cursor.js
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // 4. ACTIVE NAVIGATION LINK SPY
  // -------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 140;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // Mobile Menu Toggle & Drawer Controller
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  if (mobileToggle && navLinksContainer) {
    const hamburgerIcon = mobileToggle.querySelector('.hamburger-icon');
    const closeIcon = mobileToggle.querySelector('.close-icon');

    function openMobileMenu() {
      navLinksContainer.classList.add('mobile-open');
      document.body.classList.add('nav-drawer-open');
      mobileToggle.setAttribute('aria-expanded', 'true');
      if (hamburgerIcon) hamburgerIcon.style.display = 'none';
      if (closeIcon) closeIcon.style.display = 'block';
    }

    function closeMobileMenu() {
      navLinksContainer.classList.remove('mobile-open');
      document.body.classList.remove('nav-drawer-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      if (hamburgerIcon) hamburgerIcon.style.display = 'block';
      if (closeIcon) closeIcon.style.display = 'none';
    }

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinksContainer.classList.contains('mobile-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
      if (window.PortfolioAudio) window.PortfolioAudio.playClick();
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinksContainer.classList.contains('mobile-open')) {
        closeMobileMenu();
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (navLinksContainer.classList.contains('mobile-open') && !navLinksContainer.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  // -------------------------------------------------------------
  // 5. ANIMATED STATS COUNTER
  // -------------------------------------------------------------
  const statValues = document.querySelectorAll('.stat-value[data-target]');
  let counted = false;

  function countUp() {
    if (counted) return;
    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;

    const rect = heroStats.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      counted = true;
      statValues.forEach((el) => {
        const target = parseFloat(el.dataset.target);
        const isDecimal = el.dataset.decimal === 'true';
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = target / 35;

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = (isDecimal ? target.toFixed(2) : Math.floor(target)) + suffix;
            clearInterval(timer);
          } else {
            el.textContent = (isDecimal ? current.toFixed(2) : Math.floor(current)) + suffix;
          }
        }, 30);
      });
    }
  }

  window.addEventListener('scroll', countUp, { passive: true });
  countUp();

  // -------------------------------------------------------------
  // 6. CLIPBOARD COPY BUTTONS
  // -------------------------------------------------------------
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.dataset.copy;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied: ${textToCopy}`);
        if (window.PortfolioAudio) window.PortfolioAudio.playClick();
      }).catch(() => {
        showToast('Copied to clipboard');
      });
    });
  });

  // -------------------------------------------------------------
  // 7. CONTACT FORM SUBMISSION
  // -------------------------------------------------------------
  // Contact dispatch orchestration, real-time RFC validation, honeypot spam protection,
  // rate-limiting cooldown, and EmailJS delivery are managed in `js/email-dispatch.js`.

  // -------------------------------------------------------------
  // 8. TOAST NOTIFICATIONS
  // -------------------------------------------------------------
  window.showToast = function (msg) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = '';
    const iconSpan = document.createElement('span');
    iconSpan.style.color = 'var(--accent-primary)';
    iconSpan.textContent = '✦ ';
    toast.appendChild(iconSpan);
    toast.appendChild(document.createTextNode(String(msg || '')));
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  // -------------------------------------------------------------
  // 9. STALE SERVICE WORKER & CACHE PURGE
  // -------------------------------------------------------------
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister().then((unregistered) => {
          if (unregistered) console.log('[Portfolio] Unregistered stale service worker successfully.');
        });
      }
    }).catch(() => {});
  }
  if ('caches' in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
    }).catch(() => {});
  }

  // -------------------------------------------------------------
  // 10. RESILIENT DIRECT BROWSER DOWNLOAD CONTROLLER
  // -------------------------------------------------------------
  /**
   * Universal Portfolio File Downloader
   * Prefers direct browser streaming downloads for static assets (zero memory overhead,
   * no main-thread freezing, no Blob allocation loops). Supports programmatic invocation,
   * throttles rapid repeat clicks, prevents recursive event storms, and provides
   * elegant toast and audio feedback.
   *
   * @param {string} url - Target asset path or URL
   * @param {string} [preferredFilename] - Explicit filename with extension
   * @param {Event} [event] - Optional event object
   */
  const downloadThrottleMap = new Map();
  const THROTTLE_WINDOW_MS = 1500;

  function isThrottled(key) {
    const now = Date.now();
    const last = downloadThrottleMap.get(key) || 0;
    if (now - last < THROTTLE_WINDOW_MS) {
      return true;
    }
    downloadThrottleMap.set(key, now);
    return false;
  }

  function resolveDownloadFilename(url, preferredFilename) {
    if (preferredFilename && preferredFilename.trim()) {
      return preferredFilename.trim();
    }
    if (url) {
      const cleanUrl = url.split('#')[0].split('?')[0];
      const base = cleanUrl.split('/').pop();
      if (base) return base;
    }
    return 'Gobind_Patel_Document.pdf';
  }

  window.downloadPortfolioFile = function (url, preferredFilename, event) {
    if (!url) return false;

    const filename = resolveDownloadFilename(url, preferredFilename);

    // Throttle multi-clicks on the same target
    if (isThrottled(url)) {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      return false;
    }

    // Audio & UI Toast feedback
    if (typeof window.showToast === 'function') {
      window.showToast(`Downloading: ${filename}`);
    }
    if (window.PortfolioAudio && typeof window.PortfolioAudio.playSuccess === 'function') {
      try {
        window.PortfolioAudio.playSuccess();
      } catch (_) {}
    }

    // Direct browser download via lightweight, dedicated anchor
    // Marked with 'data-direct-download' to ensure event listeners never recursively intercept it
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', filename);
    tempLink.setAttribute('data-direct-download', 'true');
    tempLink.rel = 'noopener';
    tempLink.style.display = 'none';

    document.body.appendChild(tempLink);
    try {
      tempLink.click();
    } catch (err) {
      console.warn('[Portfolio Download] Native anchor click error:', err);
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      document.body.removeChild(tempLink);
    }

    return true;
  };

  // Delegated event listener for all download links/buttons across the portfolio
  document.addEventListener('click', (e) => {
    // 1. Never intercept internal programmatic download anchors (prevents recursive loops)
    if (e.target.closest('[data-direct-download]')) {
      return;
    }

    // 2. Identify target download element
    const downloadLink = e.target.closest('a[download], [data-download-file]');
    if (!downloadLink) return;

    // 3. Honor user modifier keys (e.g. Ctrl/Cmd+click to open in new tab)
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

    const url = downloadLink.getAttribute('data-download-file') || downloadLink.getAttribute('href');
    if (!url || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) return;

    const filename = resolveDownloadFilename(
      url,
      downloadLink.getAttribute('data-filename') || downloadLink.getAttribute('download')
    );

    // 4. Throttle rapid spam-clicks on the element
    if (isThrottled(url)) {
      e.preventDefault();
      return;
    }

    // 5. Audio and Toast feedback
    if (typeof window.showToast === 'function') {
      window.showToast(`Downloading: ${filename}`);
    }
    if (window.PortfolioAudio && typeof window.PortfolioAudio.playSuccess === 'function') {
      try {
        window.PortfolioAudio.playSuccess();
      } catch (_) {}
    }

    // 6. Execution:
    // If it's a native anchor element with href, do NOT preventDefault!
    // The browser natively streams the file with zero memory allocation and zero main-thread block.
    // If it's a custom button without href (using data-download-file), invoke downloadPortfolioFile.
    if (!downloadLink.hasAttribute('href') || downloadLink.tagName !== 'A') {
      e.preventDefault();
      window.downloadPortfolioFile(url, filename);
    }
  });
});

