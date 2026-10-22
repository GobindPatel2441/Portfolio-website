/**
 * GLOBAL PERSISTENT CINEMATIC PARTICLE & NETWORK BACKGROUND
 * Vanta.NET (Three.js WebGL Engine)
 * 
 * Provides a continuous, persistent 3D floating gold particle and neural
 * network background across all portfolio sections (Hero, About, Projects,
 * AI Lab, Skills, Timeline, Contact, and Footer).
 * 
 * Features:
 * - Persistent across the entire document (never resets or flashes on scroll)
 * - Adaptive particle and connection density based on device performance budget
 * - Dynamic theme coordination with the portfolio atmosphere switcher
 * - Tab visibility throttling to save battery and GPU when inactive
 * - Full prefers-reduced-motion compliance
 * - Non-blocking pointer events (never interferes with cards, buttons, or inputs)
 */
(function () {
  'use strict';

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme-coordinated vertex colors
  const THEME_COLORS = {
    gold: 0xd4af37,      // Pure cinematic gold
    obsidian: 0xc8c8c8,  // Minimalist platinum
    emerald: 0x10b981,   // Jade emerald
    cyber: 0x38bdf8      // Celestial cobalt
  };

  const BG_COLOR = 0x08080a; // Obsidian surface

  let vantaEffect = null;
  let currentTier = null;
  let resizeTimer = null;

  function getCurrentThemeColor() {
    const themeKey = document.documentElement.getAttribute('data-theme') || 'gold';
    return THEME_COLORS[themeKey] || THEME_COLORS.gold;
  }

  function getDeviceTier() {
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    if (w < 1920) return 'desktop';
    return 'ultrawide';
  }

  function getTierConfig(tier) {
    switch (tier) {
      case 'mobile':
        return {
          points: 6.00,
          maxDistance: 18.00,
          spacing: 21.00,
          scale: 1.00,
          scaleMobile: 0.85
        };
      case 'tablet':
        return {
          points: 8.00,
          maxDistance: 20.00,
          spacing: 19.00,
          scale: 1.00,
          scaleMobile: 0.90
        };
      case 'desktop':
        return {
          points: 10.00,
          maxDistance: 22.00,
          spacing: 18.00,
          scale: 1.00,
          scaleMobile: 1.00
        };
      case 'ultrawide':
      default:
        return {
          points: 11.00,
          maxDistance: 24.00,
          spacing: 18.00,
          scale: 1.00,
          scaleMobile: 1.00
        };
    }
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

  function initGlobalBackground() {
    if (prefersReducedMotion()) return;
    if (typeof window.VANTA === 'undefined' || typeof window.VANTA.NET !== 'function') {
      console.warn('Vanta.NET library not loaded; skipping global background initialization.');
      return;
    }

    const container = getOrCreateContainer();
    const tier = getDeviceTier();
    currentTier = tier;
    const config = getTierConfig(tier);
    const color = getCurrentThemeColor();

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
        scale: config.scale,
        scaleMobile: config.scaleMobile,
        color: color,
        backgroundColor: BG_COLOR,
        points: config.points,
        maxDistance: config.maxDistance,
        spacing: config.spacing,
        showDots: true,
        forceAnimate: true
      });

      // Expose globally for testing and programmatic coordination
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

  // 2. Pause when tab/window is hidden to preserve battery and GPU
  document.addEventListener('visibilitychange', () => {
    if (!vantaEffect) return;
    if (document.hidden) {
      if (typeof vantaEffect.pause === 'function') vantaEffect.pause();
    } else {
      if (typeof vantaEffect.play === 'function') vantaEffect.play();
    }
  });

  // 3. Debounced window resize to adaptively rescale tiers
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!vantaEffect) return;
      const newTier = getDeviceTier();
      if (newTier !== currentTier) {
        // Re-initialize with tier-optimized density
        initGlobalBackground();
      } else if (vantaEffect.resize) {
        vantaEffect.resize();
      }
    }, 250);
  }, { passive: true });

  // 4. Reduced-motion preference change listener
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

  // 5. Cleanup on unload
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
