/**
 * 3D PARALLAX TILT CARD — Specular Light Reflection on Hover
 * Ported from ex/smoothui-main (glow-hover-card) + ex/unlumen-ui-docs-main (tilt-card)
 * Pure Vanilla JS, GPU-accelerated transforms
 */
(function () {
  'use strict';

  const TILT_MAX = 8;          // degrees
  const PERSPECTIVE = 800;     // px
  const GLOW_SIZE = 280;       // px diameter
  const RETURN_SPEED = 0.08;   // spring return factor
  const SPRING_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  function initTiltCards() {
    // Apply to bento skill cards, about pillar cards, timeline cards
    const selectors = '.bento-skill-card, .timeline-card.spotlight-card, .contact-card';
    const cards = document.querySelectorAll(selectors);

    // Only on pointer fine devices (desktop)
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    cards.forEach(card => {
      // Add perspective container style
      card.style.perspective = PERSPECTIVE + 'px';
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = `transform 0.6s ${SPRING_EASE}`;

      // Create the specular glow overlay
      const glow = document.createElement('div');
      glow.className = 'tilt-specular-glow';
      glow.style.cssText = `
        position: absolute; inset: 0; border-radius: inherit;
        pointer-events: none; z-index: 2; opacity: 0;
        transition: opacity 0.4s ease;
        background: radial-gradient(${GLOW_SIZE}px circle at 50% 50%,
          rgba(255,255,255,0.12) 0%,
          rgba(255,255,255,0.04) 40%,
          transparent 70%);
      `;
      // Card must be relative for absolute glow
      if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
      }
      card.style.overflow = 'hidden';
      card.appendChild(glow);

      let cardRect = null;

      card.addEventListener('mouseenter', () => {
        card.style.willChange = 'transform';
        cardRect = card.getBoundingClientRect();
      });

      card.addEventListener('mousemove', (e) => {
        if (!cardRect) cardRect = card.getBoundingClientRect();
        const x = e.clientX - cardRect.left;
        const y = e.clientY - cardRect.top;
        const cx = cardRect.width / 2;
        const cy = cardRect.height / 2;

        const rotateY = ((x - cx) / cx) * TILT_MAX;
        const rotateX = -((y - cy) / cy) * TILT_MAX;

        card.style.transition = 'none';
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        // Move specular glow
        glow.style.opacity = '1';
        glow.style.background = `radial-gradient(${GLOW_SIZE}px circle at ${x}px ${y}px,
          rgba(255,255,255,0.14) 0%,
          rgba(212,175,55,0.06) 40%,
          transparent 70%)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = `transform 0.6s ${SPRING_EASE}`;
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.willChange = 'auto';
        glow.style.opacity = '0';
        cardRect = null;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTiltCards);
  } else {
    initTiltCards();
  }
})();
