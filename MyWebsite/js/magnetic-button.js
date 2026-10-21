/**
 * MAGNETIC BUTTON PULL — Physics-based cursor attraction
 * Ported from ex/unlumen-ui-docs-main/registry/primitives/magnetic-button
 * Pure Vanilla JS with spring physics (no Motion library)
 */
(function () {
  'use strict';

  const RADIUS = 80;          // activation radius in px
  const STRENGTH = 0.35;       // pull factor (0-1)
  const SPRING_K = 0.15;       // spring return stiffness
  const DAMPING = 0.8;         // damping factor

  function initMagneticButtons() {
    // Only on fine pointer devices
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Target primary CTA buttons and project action buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-terminal, .hero-ctas .btn, .project-actions .btn');

    buttons.forEach(btn => {
      let currentX = 0, currentY = 0;
      let targetX = 0, targetY = 0;
      let raf = null;

      btn.style.transition = 'transform 0.1s ease-out';
      btn.style.willChange = 'transform';

      function animate() {
        currentX += (targetX - currentX) * SPRING_K;
        currentY += (targetY - currentY) * SPRING_K;

        if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1 && targetX === 0 && targetY === 0) {
          currentX = 0;
          currentY = 0;
          btn.style.transform = 'translate(0, 0)';
          raf = null;
          return;
        }

        btn.style.transform = `translate(${currentX}px, ${currentY}px)`;
        raf = requestAnimationFrame(animate);
      }

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < RADIUS) {
          targetX = dx * STRENGTH;
          targetY = dy * STRENGTH;
          if (!raf) raf = requestAnimationFrame(animate);
        }
      });

      btn.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        if (!raf) raf = requestAnimationFrame(animate);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagneticButtons);
  } else {
    initMagneticButtons();
  }
})();
