/**
 * SIGNATURE PRECISION CURSOR SYSTEM
 * Spring-Damped Precision Dot + Translucent Expanding Interactive Ring
 * Pure Vanilla JS, zero dependencies, GPU-accelerated
 * Non-intrusive: Never covers text, provides clean tactile feedback
 */
(function () {
  'use strict';

  // Only on fine-pointer desktop devices without reduced motion
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Build Cursor DOM
  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  dot.className = 'cursor-dot';

  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  ring.className = 'cursor-ring';

  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('has-signature-cursor');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isDown = false;

  const LERP = 0.22; // smooth spring lag

  let isRafRunning = false;

  function wakeRaf() {
    if (!isRafRunning) {
      isRafRunning = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Instant dot movement for crisp responsiveness
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) ${isDown ? 'scale(0.7)' : 'scale(1)'}`;
    wakeRaf();
  }, { passive: true });

  window.addEventListener('mousedown', () => {
    isDown = true;
    ring.classList.add('cursor-down');
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(0.7)`;
    wakeRaf();
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
    ring.classList.remove('cursor-down');
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(1)`;
    wakeRaf();
  });

  // RAF loop for trailing ring with idle sleep
  function render() {
    const dx = mouseX - ringX;
    const dy = mouseY - ringY;

    if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15) {
      ringX = mouseX;
      ringY = mouseY;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      isRafRunning = false;
      return;
    }

    ringX += dx * LERP;
    ringY += dy * LERP;

    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  }
  wakeRaf();

  // Clean, non-intrusive interactive hover handlers across all clickable elements
  function bindHoverTargets() {
    const interactiveSelectors = [
      'a',
      'button',
      'input',
      'textarea',
      '.theme-btn',
      '.mode-btn',
      '.term-tab',
      '.sim-btn',
      '.cmd-trigger-btn',
      '.project-clip-reveal',
      '.spotlight-card',
      '[data-project-target]',
      '[data-copy]'
    ].join(', ');

    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('active-interactive');
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('active-interactive');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindHoverTargets);
  } else {
    bindHoverTargets();
  }
})();
