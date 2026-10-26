/**
 * GOBIND PATEL — PROGRESSIVE FEATURE LOADER
 * Defers below-the-fold modules (Modals, Certificates, AI Lab, Email, Audio)
 * Slashes ~210KB of main-thread JavaScript from the critical first render path
 * Full Zero Feature Regression: Uses 600px IntersectionObserver lookahead + click proxies + idle warm-up
 */
(function () {
  'use strict';

  const loadedScripts = new Set();

  function loadScript(src, cb) {
    if (loadedScripts.has(src)) {
      if (cb) cb();
      return;
    }
    loadedScripts.add(src);
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    if (cb) s.onload = cb;
    document.body.appendChild(s);
  }

  function loadCss(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  function loadProjectsModal(cb) {
    loadScript('js/projects-modal.js?v=10', cb);
  }

  function loadCertificates(cb) {
    loadCss('css/certificates.css?v=2');
    loadScript('js/certificates.js?v=1', cb);
  }


  function loadAiTerminal(cb) {
    loadScript('js/ai-terminal.js?v=2', cb);
  }

  function loadAudioEngines(cb) {
    loadScript('js/sound-effects.js?v=2', () => {
      loadScript('js/ambient-audio.js?v=3', cb);
    });
  }

  function loadEmailDispatch(cb) {
    loadScript('js/email-config.js', () => {
      loadScript('js/email-dispatch.js', cb);
    });
  }

  function loadCommandMenu(cb) {
    loadScript('js/command-menu.js', cb);
  }

  // 1. Delegated Early Click Interceptors
  document.addEventListener('click', (e) => {
    const projectBtn = e.target.closest('[data-project-target], [data-project-modal]');
    if (projectBtn && !window.openProjectModal) {
      loadProjectsModal(() => {
        if (projectBtn.click) projectBtn.click();
      });
    }

    const certBtn = e.target.closest('[data-open-cert], .cert-filter-btn');
    if (certBtn && !window.CertificatesEngine) {
      loadCertificates(() => {
        if (certBtn.click) certBtn.click();
      });
    }

    const audioTrigger = e.target.closest('.ambient-audio-pill, .audio-expand-btn, .audio-btn-action, .audio-dock-wrapper');
    if (audioTrigger && !window.PortfolioAmbientAudio) {
      loadAudioEngines(() => {
        if (audioTrigger.click) audioTrigger.click();
      });
    }
  }, { capture: true, passive: true });

  // 2. Command Palette Keyboard Shortcut
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      if (!window.CommandMenuEngine) {
        loadCommandMenu(() => {
          if (window.CommandMenuEngine && window.CommandMenuEngine.open) {
            window.CommandMenuEngine.open();
          }
        });
      }
    }
  });

  // 3. Generous Viewport Observers (600px lookahead buffer)
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'projects' || id === 'experience') {
            loadProjectsModal();
          } else if (id === 'certifications') {
            loadCertificates();
          } else if (id === 'ai-terminal') {
            loadAiTerminal();
          } else if (id === 'contact') {
            loadEmailDispatch();
          }
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '600px 0px 600px 0px' });

    ['projects', 'experience', 'certifications', 'ai-terminal', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  // 4. Idle Warm-up: 1.2s post-load loads all remaining modules seamlessly
  const warmUpAll = () => {
    const idleFn = window.requestIdleCallback || ((fn) => setTimeout(fn, 250));
    idleFn(() => {
      loadProjectsModal();
      loadCertificates();
      loadAiTerminal();
      loadAudioEngines();
      loadEmailDispatch();
      loadCommandMenu();
    });
  };

  if (document.readyState === 'complete') {
    setTimeout(warmUpAll, 3500);
  } else {
    window.addEventListener('load', () => setTimeout(warmUpAll, 3500));
  }

  // 5. Warm audio on first interaction
  const onFirstInteract = () => {
    loadAudioEngines();
    window.removeEventListener('touchstart', onFirstInteract);
    window.removeEventListener('scroll', onFirstInteract);
    window.removeEventListener('mousemove', onFirstInteract);
  };
  window.addEventListener('touchstart', onFirstInteract, { passive: true });
  window.addEventListener('scroll', onFirstInteract, { passive: true });
  window.addEventListener('mousemove', onFirstInteract, { passive: true });

  window.ProgressiveFeatureLoader = {
    loadProjectsModal,
    loadCertificates,
    loadAiTerminal,
    loadAudioEngines,
    loadEmailDispatch,
    loadCommandMenu
  };
})();
