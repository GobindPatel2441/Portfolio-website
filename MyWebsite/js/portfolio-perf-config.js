/**
 * ===================================================================
 * GOBIND PATEL — CENTRALIZED PERFORMANCE CONFIGURATION & ADAPTIVE PROFILES
 * Seamlessly manages Desktop Full Experience vs Mobile Optimized Experience
 * Zero Feature Regression • Battery & GPU Aware • Accessibility First
 * ===================================================================
 */

(function () {
  'use strict';

  // 1. Environmental & Capability Probing
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  
  // Hardware hints (where supported)
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = navigator.deviceMemory || 4;
  const isConstrainedDevice = hardwareConcurrency <= 4 || deviceMemory <= 3;

  function evaluateProfile() {
    const width = window.innerWidth;
    // Primary mobile threshold: viewport width < 768px or coarse pointer under 1024px
    const isMobile = width < 768 || (isCoarsePointer && width < 1024);
    return isMobile ? 'mobile' : 'desktop';
  }

  let currentProfile = evaluateProfile();

  // 2. Centralized Configuration Store
  const config = {
    get profile() {
      return currentProfile;
    },
    get isMobile() {
      return currentProfile === 'mobile';
    },
    get isDesktop() {
      return currentProfile === 'desktop';
    },
    prefersReducedMotion: prefersReduced,
    isFinePointer: isFinePointer,
    isConstrainedDevice: isConstrainedDevice,

    // Renderer Pixel Ratio Cap:
    // Mobile capped to 1.0 to avoid 3x retina fill-rate overhead and thermal throttling.
    // Desktop capped at 1.5 to maintain ultra-crisp display on 4K/retina without 2x-3x waste.
    get dpr() {
      if (currentProfile === 'mobile') return 1.0;
      return Math.min(window.devicePixelRatio || 1, 1.5);
    },

    // Global Particle Background (Three.js WebGL / Vanta.NET)
    vanta: {
      get enabled() {
        return currentProfile === 'desktop' && !prefersReduced;
      },
      points: 10.0,
      maxDistance: 22.0,
      spacing: 18.0,
      scale: 1.0,
      scaleMobile: 0.85
    },

    // Interactive Dot-Matrix & Constellation Canvas
    matrix: {
      get enabled() {
        return !prefersReduced;
      },
      get spacing() {
        const w = window.innerWidth;
        return currentProfile === 'mobile'
          ? Math.max(72, Math.floor(w / 12))
          : Math.max(55, Math.floor(w / 24));
      },
      get sparkCount() {
        const w = window.innerWidth;
        return currentProfile === 'mobile'
          ? Math.min(10, Math.floor(w / 45))
          : Math.min(28, Math.floor(w / 40));
      },
      get interactiveRadius() {
        return currentProfile === 'mobile' ? 120 : 180;
      }
    },

    // Atmospheric Drifting Cloud Shader
    cloudShader: {
      get enabled() {
        return !prefersReduced && (currentProfile === 'desktop' || !isConstrainedDevice);
      },
      get cloudCount() {
        return currentProfile === 'mobile' ? 3 : 7;
      },
      get opacity() {
        return currentProfile === 'mobile' ? '0.25' : '0.55';
      }
    },

    // Lenis Smooth Momentum Scrolling
    lenis: {
      // On mobile touchscreens, native 120Hz momentum scrolling is buttery smooth,
      // zero CPU overhead, and conforms perfectly to iOS/Android gesture physics.
      get enabled() {
        return currentProfile === 'desktop' && !prefersReduced && typeof window.Lenis !== 'undefined';
      },
      duration: 0.85,
      smoothWheel: true,
      syncTouch: false
    },

    // Signature Cursor & Desktop Tilt Effects
    cursor: {
      get enabled() {
        return currentProfile === 'desktop' && isFinePointer && !prefersReduced;
      }
    },
    tilt: {
      get enabled() {
        return currentProfile === 'desktop' && isFinePointer && !prefersReduced;
      }
    },

    // Audio Engine Coordination
    audio: {
      sfxEnabled: true,
      musicEnabled: true,
      // Touchscreens never trigger hover sounds on tap
      hoverTicksDesktopOnly: true
    },

    // Visibility State
    isTabVisible: !document.hidden
  };

  // 3. Tab Visibility Coordination
  document.addEventListener('visibilitychange', () => {
    config.isTabVisible = !document.hidden;
    window.dispatchEvent(new CustomEvent('portfolio:visibility-change', {
      detail: { isTabVisible: config.isTabVisible }
    }));
  });

  // 4. Safe Orientation & Viewport Resize Observer
  let resizeTimer = null;
  let lastProfile = currentProfile;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newProfile = evaluateProfile();
      if (newProfile !== lastProfile) {
        lastProfile = newProfile;
        currentProfile = newProfile;
        window.dispatchEvent(new CustomEvent('portfolio:profile-change', {
          detail: { profile: newProfile, isMobile: newProfile === 'mobile' }
        }));
      }
    }, 150);
  }, { passive: true });

  window.PortfolioPerfConfig = config;
})();
