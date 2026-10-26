/**
 * GLOBAL PERSISTENT CINEMATIC PARTICLE & NETWORK BACKGROUND
 * Vanta.NET (Three.js WebGL Engine)
 * 
 * Features:
 * - Persistent across the entire document
 * - Adaptive performance profiles: Desktop Full 3D vs Mobile Lightweight Fallback
 * - Dynamic theme coordination with the portfolio atmosphere switcher
 * - Tab visibility and viewport suspension to save battery and GPU
 * - Full prefers-reduced-motion compliance
 * - Non-blocking pointer events
 */
(function () {
  'use strict';

  const THEME_COLORS = {
    gold: 0xd4af37,      // Pure cinematic gold
    obsidian: 0xc8c8c8,  // Minimalist platinum
    emerald: 0x10b981,   // Jade emerald
    cyber: 0x38bdf8      // Celestial cobalt
  };

  const BG_COLOR = 0x08080a; // Obsidian surface

  let vantaEffect = null;
  let isLoadingScripts = false;
  let resizeTimer = null;

  function getConfig() {
    return window.PortfolioPerfConfig || {
      isMobile: window.innerWidth < 768,
      vanta: { enabled: window.innerWidth >= 768 },
      prefersReducedMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  }

  function getCurrentThemeColor() {
    const themeKey = document.documentElement.getAttribute('data-theme') || 'gold';
    return THEME_COLORS[themeKey] || THEME_COLORS.gold;
  }

  function getOrCreateContainer() {
    let container = document.getElementById('global-particle-background');
    if (!container) {
      container = document.createElement('div');
      container.id = 'global-particle-background';
      container.className = 'global-particle-background';
      container.setAttribute('aria-hidden', 'true');
      document.body.prepend(container);
    }
    return container;
  }

  // Asynchronous lazy loader for Three.js & Vanta.NET on desktop
  function ensureVantaDependencies(callback) {
    if (typeof window.VANTA !== 'undefined' && typeof window.VANTA.NET === 'function' && typeof window.THREE !== 'undefined') {
      return callback();
    }
    if (isLoadingScripts) return;
    isLoadingScripts = true;

    function loadScript(src, cb) {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = cb;
      s.onerror = () => {
        isLoadingScripts = false;
        console.warn('Failed to load WebGL background script:', src);
      };
      document.head.appendChild(s);
    }

    if (typeof window.THREE === 'undefined') {
      loadScript('js/three.min.js', () => {
        if (typeof window.VANTA === 'undefined' || typeof window.VANTA.NET !== 'function') {
          loadScript('js/vanta.net.min.js', () => {
            isLoadingScripts = false;
            callback();
          });
        } else {
          isLoadingScripts = false;
          callback();
        }
      });
    } else if (typeof window.VANTA === 'undefined' || typeof window.VANTA.NET !== 'function') {
      loadScript('js/vanta.net.min.js', () => {
        isLoadingScripts = false;
        callback();
      });
    }
  }

  function initGlobalBackground() {
    const cfg = getConfig();
    if (cfg.prefersReducedMotion) return;

    // Mobile profile optimization:
    // Skip heavy WebGL Three.js on narrow mobile devices;
    // The interactive-matrix canvas handles the particle aesthetic with zero GPU strain.
    if (!cfg.vanta || !cfg.vanta.enabled) {
      if (vantaEffect && typeof vantaEffect.destroy === 'function') {
        vantaEffect.destroy();
        vantaEffect = null;
      }
      return;
    }

    ensureVantaDependencies(() => {
      const container = getOrCreateContainer();
      const color = getCurrentThemeColor();
      const vantaCfg = (cfg.vanta) || {
        points: 10.0,
        maxDistance: 22.0,
        spacing: 18.0,
        scale: 1.0,
        scaleMobile: 0.85
      };

      try {
        if (vantaEffect && typeof vantaEffect.destroy === 'function') {
          vantaEffect.destroy();
        }

        vantaEffect = window.VANTA.NET({
          el: container,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: vantaCfg.scale || 1.0,
          scaleMobile: vantaCfg.scaleMobile || 0.85,
          color: color,
          backgroundColor: BG_COLOR,
          points: vantaCfg.points || 10.0,
          maxDistance: vantaCfg.maxDistance || 22.0,
          spacing: vantaCfg.spacing || 18.0,
          showDots: true,
          forceAnimate: false
        });

        window.GlobalParticleBackground = {
          instance: vantaEffect,
          updateTheme: updateThemeColor,
          pause: () => vantaEffect && vantaEffect.pause && vantaEffect.pause(),
          play: () => vantaEffect && vantaEffect.play && vantaEffect.play(),
          destroy: () => {
            if (vantaEffect && vantaEffect.destroy) vantaEffect.destroy();
            vantaEffect = null;
          }
        };
      } catch (err) {
        console.warn('Global particle background WebGL init fallback:', err);
      }
    });
  }

  function updateThemeColor() {
    if (!vantaEffect || typeof vantaEffect.setOptions !== 'function') return;
    const color = getCurrentThemeColor();
    vantaEffect.setOptions({ color: color });
  }

  // 1. Observer for theme dock changes on <html>
  if ('MutationObserver' in window) {
    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          updateThemeColor();
        }
      });
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // 2. Tab visibility throttling to save battery and GPU when inactive
  document.addEventListener('visibilitychange', () => {
    if (!vantaEffect) return;
    if (document.hidden) {
      if (typeof vantaEffect.pause === 'function') vantaEffect.pause();
    } else {
      if (typeof vantaEffect.play === 'function') vantaEffect.play();
    }
  });

  // 3. Profile change listener (Desktop <-> Mobile transitions)
  window.addEventListener('portfolio:profile-change', (e) => {
    const isMobile = e.detail && e.detail.isMobile;
    if (isMobile) {
      if (vantaEffect && typeof vantaEffect.destroy === 'function') {
        vantaEffect.destroy();
        vantaEffect = null;
      }
    } else {
      initGlobalBackground();
    }
  });

  // 4. Debounced window resize
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!vantaEffect) {
        const cfg = getConfig();
        if (cfg.vanta && cfg.vanta.enabled) {
          initGlobalBackground();
        }
        return;
      }
      if (typeof vantaEffect.resize === 'function') {
        vantaEffect.resize();
      }
    }, 250);
  }, { passive: true });

  // 5. Reduced-motion preference change listener
  if (window.matchMedia) {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', (e) => {
        if (e.matches) {
          if (vantaEffect && vantaEffect.destroy) vantaEffect.destroy();
          vantaEffect = null;
        } else {
          initGlobalBackground();
        }
      });
    }
  }

  // 6. Cleanup on unload
  window.addEventListener('beforeunload', () => {
    if (vantaEffect && typeof vantaEffect.destroy === 'function') {
      vantaEffect.destroy();
      vantaEffect = null;
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalBackground);
  } else {
    initGlobalBackground();
  }
})();
