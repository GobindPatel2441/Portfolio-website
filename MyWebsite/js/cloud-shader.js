/**
 * ===================================================================
 * GOBIND PATEL — PROCEDURAL ATMOSPHERIC CLOUD SHADER
 * Inspired by Aceternity UI Cloud Shader (ui.aceternity.com/components/cloud-shader)
 * Volumetric Drifting Clouds • Multi-Octave Noise • Theme Palette Coupling
 * 60 FPS GPU-Accelerated Canvas Engine with Mobile Tiering & Visibility Throttle
 * ===================================================================
 */

(function () {
  'use strict';

  // Check prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  function initCloudShader() {
    if (!document.body) return;

    const isMobile = window.innerWidth < 768 || !window.matchMedia('(pointer: fine)').matches;

    const canvas = document.createElement('canvas');
    canvas.id = 'ambient-cloud-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.opacity = isMobile ? '0.35' : '0.55';
    canvas.style.mixBlendMode = 'screen';
    canvas.style.transition = 'opacity 0.8s ease';

    // Insert before the global particle background so the neural network hovers above the atmospheric clouds
    const bgTarget = document.getElementById('global-particle-background') || document.getElementById('interactive-matrix-canvas');
    if (bgTarget && bgTarget.parentNode) {
      bgTarget.parentNode.insertBefore(canvas, bgTarget);
    } else {
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

    // Theme palettes synchronized with data-theme
    const THEME_CLOUDS = {
      gold: {
        cloud1: 'rgba(212, 175, 55, 0.12)',   // Warm gold
        cloud2: 'rgba(140, 109, 79, 0.14)',   // Bronze
        cloud3: 'rgba(247, 231, 196, 0.08)',  // Cream highlights
        cloud4: 'rgba(40, 32, 20, 0.18)',     // Dark amber
      },
      obsidian: {
        cloud1: 'rgba(160, 160, 175, 0.10)',  // Cool silver
        cloud2: 'rgba(90, 95, 110, 0.12)',    // Slate
        cloud3: 'rgba(220, 225, 240, 0.07)',  // Moonlit white
        cloud4: 'rgba(25, 28, 38, 0.16)',     // Midnight
      },
      emerald: {
        cloud1: 'rgba(16, 185, 129, 0.12)',   // Pure emerald
        cloud2: 'rgba(5, 150, 105, 0.14)',    // Deep jade
        cloud3: 'rgba(110, 231, 183, 0.08)',  // Mint
        cloud4: 'rgba(6, 78, 59, 0.18)',      // Pine
      },
      cyber: {
        cloud1: 'rgba(56, 189, 248, 0.14)',   // Celestial cyan
        cloud2: 'rgba(30, 64, 175, 0.16)',    // Cobalt
        cloud3: 'rgba(192, 132, 252, 0.09)',  // Lavender neon
        cloud4: 'rgba(30, 27, 75, 0.12)',     // Deep navy
      }
    };

    function getCurrentTheme() {
      return document.documentElement.getAttribute('data-theme') || 'gold';
    }

    // Mobile adapts cloud count to preserve frame rate & battery
    const CLOUD_COUNT = isMobile ? 4 : 7;
    let clouds = [];

    function initClouds() {
      clouds = [];
      for (let i = 0; i < CLOUD_COUNT; i++) {
        clouds.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseRadius: Math.max(width, height) * (0.28 + Math.random() * 0.22),
          currentRadius: 0,
          vx: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.35),
          vy: (Math.random() - 0.5) * (isMobile ? 0.15 : 0.25),
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.0008 + Math.random() * 0.0012,
          layerIndex: i % 4,
        });
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initClouds();
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }, { passive: true });
    resize();

    // Mouse interaction only on desktop pointer devices
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    if (!isMobile) {
      window.addEventListener(
        'mousemove',
        (e) => {
          targetMouseX = e.clientX;
          targetMouseY = e.clientY;
        },
        { passive: true }
      );
    }

    let lastTime = performance.now();
    let isRunning = true;
    let rafId = null;

    function render(currentTime) {
      const dt = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      if (!isMobile) {
        mouseX += (targetMouseX - mouseX) * 0.04;
        mouseY += (targetMouseY - mouseY) * 0.04;
      }

      ctx.clearRect(0, 0, width, height);

      const themeKey = getCurrentTheme();
      const colors = THEME_CLOUDS[themeKey] || THEME_CLOUDS.gold;
      const colorArray = [colors.cloud1, colors.cloud2, colors.cloud3, colors.cloud4];

      ctx.globalCompositeOperation = 'lighter';

      for (let idx = 0; idx < clouds.length; idx++) {
        const c = clouds[idx];
        c.phase += c.pulseSpeed * dt;
        const pulse = Math.sin(c.phase) * 0.12;
        const radius = c.baseRadius * (1 + pulse);

        if (!isMobile) {
          const dxToMouse = c.x - mouseX;
          const dyToMouse = c.y - mouseY;
          const distToMouse = Math.hypot(dxToMouse, dyToMouse);

          if (distToMouse < radius * 1.2 && distToMouse > 0) {
            c.x += (dxToMouse / distToMouse) * 0.35;
            c.y += (dyToMouse / distToMouse) * 0.35;
          }
        }

        c.x += c.vx;
        c.y += c.vy;

        const margin = radius * 0.5;
        if (c.x < -margin) c.x = width + margin;
        if (c.x > width + margin) c.x = -margin;
        if (c.y < -margin) c.y = height + margin;
        if (c.y > height + margin) c.y = -margin;

        const gradient = ctx.createRadialGradient(
          c.x,
          c.y,
          0,
          c.x,
          c.y,
          radius
        );

        const color = colorArray[c.layerIndex];
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.45, color.replace(/[\d\.]+\)$/, '0.05)'));
        gradient.addColorStop(0.8, color.replace(/[\d\.]+\)$/, '0.015)'));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(now) {
      if (!isRunning) return;
      render(now);
      rafId = requestAnimationFrame(loop);
    }

    // Visibility-aware execution to preserve mobile GPU & battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isRunning = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else {
        if (!isRunning) {
          isRunning = true;
          lastTime = performance.now();
          rafId = requestAnimationFrame(loop);
        }
      }
    });

    rafId = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCloudShader);
  } else {
    initCloudShader();
  }
})();
