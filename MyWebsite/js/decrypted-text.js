/**
 * CIPHER DECRYPTED TEXT ENGINE
 * Inspired by and adapted from React Bits (DecryptedText.jsx)
 * Provides cinematic matrix/cryptographic text decryption with zero layout shift
 */
(function () {
  'use strict';

  const CIPHER_GLYPHS = '0123456789ABCDEF!@#$%&*<>{}[]~/\\_+=?:;';
  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class TextDecryptor {
    constructor(element, options = {}) {
      this.el = element;
      this.originalText = element.getAttribute('data-original-text') || element.textContent.trim();
      this.el.setAttribute('data-original-text', this.originalText);
      this.speed = options.speed || 35; // ms per frame
      this.maxIterations = options.maxIterations || 15;
      this.characters = options.characters || CIPHER_GLYPHS;
      this.isDecrypting = false;
      this.hasDecrypted = false;
    }

    start() {
      if (this.isDecrypting || (this.hasDecrypted && !this.el.hasAttribute('data-repeat-decrypt'))) return;
      if (prefersReducedMotion()) {
        this.el.textContent = this.originalText;
        this.hasDecrypted = true;
        return;
      }

      this.isDecrypting = true;
      let iteration = 0;
      const original = this.originalText;
      const chars = this.characters;
      const len = original.length;

      // Lock element dimensions to prevent any layout shifts
      const initialWidth = this.el.offsetWidth;
      if (initialWidth > 0 && !this.el.style.minWidth) {
        this.el.style.minWidth = `${initialWidth}px`;
      }

      const interval = setInterval(() => {
        let output = '';
        const progress = iteration / this.maxIterations;
        const settledIndex = Math.floor(progress * len);

        for (let i = 0; i < len; i++) {
          const char = original[i];
          if (char === ' ' || char === '\n') {
            output += char;
            continue;
          }

          if (i <= settledIndex) {
            output += char;
          } else {
            output += chars[Math.floor(Math.random() * chars.length)];
          }
        }

        this.el.textContent = output;
        iteration++;

        if (iteration > this.maxIterations) {
          clearInterval(interval);
          this.el.textContent = original;
          this.isDecrypting = false;
          this.hasDecrypted = true;
          this.el.classList.add('decrypted-settled');
        }
      }, this.speed);
    }
  }

  function initDecryptors() {
    const targets = document.querySelectorAll('[data-decrypt], .section-eyebrow .eyebrow-num, .nav-brand span');
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const decryptor = entry.target._decryptor || new TextDecryptor(entry.target);
            entry.target._decryptor = decryptor;
            decryptor.start();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25, rootMargin: '0px 0px -50px 0px' });

      targets.forEach(el => observer.observe(el));
    } else {
      targets.forEach(el => {
        const d = new TextDecryptor(el);
        d.start();
      });
    }
  }

  window.TextDecryptor = TextDecryptor;
  window.initTextDecryptors = initDecryptors;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDecryptors);
  } else {
    initDecryptors();
  }
})();
