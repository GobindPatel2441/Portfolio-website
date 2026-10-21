/**
 * LIQUID BUTTON RIPPLE & TACTILE MORPH ENGINE
 * Ported from git/liquid-glass-js-main & ex/smoothui-main
 * Pure Vanilla JS, zero dependencies, GPU-accelerated
 */
(function () {
  'use strict';

  function initLiquidButtons() {
    const buttons = document.querySelectorAll('.btn, .theme-btn, .mode-btn');

    buttons.forEach((btn) => {
      // Ensure button can contain positioned ripples
      if (getComputedStyle(btn).position === 'static') {
        btn.style.position = 'relative';
      }
      btn.style.overflow = 'hidden';

      btn.addEventListener('click', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'liquid-ripple-drop';
        const size = Math.max(rect.width, rect.height) * 2.2;

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        btn.appendChild(ripple);

        // Remove after animation completes
        setTimeout(() => {
          ripple.remove();
        }, 650);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiquidButtons);
  } else {
    initLiquidButtons();
  }
})();
