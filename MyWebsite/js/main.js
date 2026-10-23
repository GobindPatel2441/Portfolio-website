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
});
