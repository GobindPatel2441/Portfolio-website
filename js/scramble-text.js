/**
 * SCRAMBLE TEXT ENGINE — Cyber Decryption Character Reveal
 * Ported from ex/unlumen-ui-docs-main/registry/primitives/scramble-text
 * Pure Vanilla JS, zero dependencies
 * 
 * Applies to all `.eyebrow-num` section headers on scroll-into-view.
 * Also re-triggers on hover for interactive feel.
 */
(function () {
  'use strict';

  const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
  const SCRAMBLE_SPEED = 30;       // ms per tick
  const SCRAMBLED_AHEAD = 3;       // chars of noise ahead of reveal cursor

  function scrambleElement(el) {
    const originalText = el.dataset.originalText || el.textContent;
    if (!el.dataset.originalText) el.dataset.originalText = originalText;

    // Skip if already animating
    if (el._scrambling) return;
    el._scrambling = true;

    const len = originalText.length;
    let revealed = 0;

    const tick = setInterval(() => {
      let result = '';
      for (let i = 0; i < len; i++) {
        if (i < revealed) {
          result += originalText[i];
        } else if (i < revealed + SCRAMBLED_AHEAD) {
          // Random glitch char
          result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        } else {
          result += originalText[i] === ' ' ? ' ' : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }
      el.textContent = result;
      revealed++;

      if (revealed > len + SCRAMBLED_AHEAD) {
        clearInterval(tick);
        el.textContent = originalText;
        el._scrambling = false;
      }
    }, SCRAMBLE_SPEED);
  }

  // IntersectionObserver: scramble on scroll into view
  function initScrollScramble() {
    const eyebrows = document.querySelectorAll('.eyebrow-num');
    if (eyebrows.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          scrambleElement(entry.target);
        }
      });
    }, { threshold: 0.5 });

    eyebrows.forEach(el => {
      // Store original text
      el.dataset.originalText = el.textContent;
      observer.observe(el);

      // Re-trigger on hover
      el.addEventListener('mouseenter', () => scrambleElement(el));
    });
  }

  // Also scramble nav dock labels on hover
  function initNavDockScramble() {
    const labels = document.querySelectorAll('.section-nav-label');
    labels.forEach(el => {
      el.dataset.originalText = el.textContent;
      el.addEventListener('mouseenter', () => scrambleElement(el));
    });
  }

  function initAll() {
    initScrollScramble();
    initNavDockScramble();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
