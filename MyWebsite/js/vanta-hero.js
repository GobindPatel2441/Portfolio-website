/**
 * RESTRAINED ATMOSPHERIC HERO BACKGROUND (VANTA.JS NET INTEGRATION)
 * Synaptic Neural Topology with Gold Interconnects
 * High-performance, GPU-conservative, pauses when out of view
 */
(function () {
  'use strict';

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let vantaEffect = null;

  function initVanta() {
    if (prefersReducedMotion() || typeof window.VANTA === 'undefined' || !window.VANTA.NET) {
      return;
    }

    const hero = document.getElementById('hero');
    if (!hero) return;

    // Create a dedicated background container inside hero
    let vantaContainer = document.getElementById('hero-vanta-layer');
    if (!vantaContainer) {
      vantaContainer = document.createElement('div');
      vantaContainer.id = 'hero-vanta-layer';
      vantaContainer.style.position = 'absolute';
      vantaContainer.style.inset = '0';
      vantaContainer.style.width = '100%';
      vantaContainer.style.height = '100%';
      vantaContainer.style.pointerEvents = 'none';
      vantaContainer.style.opacity = '0.28';
      vantaContainer.style.mixBlendMode = 'screen';
      vantaContainer.style.zIndex = '0';
      vantaContainer.style.overflow = 'hidden';
      hero.prepend(vantaContainer);
    }

    try {
      vantaEffect = window.VANTA.NET({
        el: '#hero-vanta-layer',
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 0.85,
        color: 0xd4af37,            // Pure cinematic gold
        backgroundColor: 0x08080a,  // Obsidian background
        points: 8.00,               // Conservative point count for 60fps performance
        maxDistance: 22.00,
        spacing: 19.00,
        showDots: true
      });

      // Pause when hero is off-screen to conserve GPU resources
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (vantaEffect && vantaEffect.renderer) {
              if (entry.isIntersecting) {
                // Resume loop
                if (typeof vantaEffect.play === 'function') vantaEffect.play();
              } else {
                // Pause loop when scrolled away
                if (typeof vantaEffect.pause === 'function') vantaEffect.pause();
              }
            }
          });
        }, { threshold: 0.05 });

        observer.observe(hero);
      }
    } catch (e) {
      console.warn('Vanta initialization skipped (WebGL context or browser limit):', e);
    }
  }

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    if (vantaEffect && typeof vantaEffect.destroy === 'function') {
      vantaEffect.destroy();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVanta);
  } else {
    initVanta();
  }
})();
