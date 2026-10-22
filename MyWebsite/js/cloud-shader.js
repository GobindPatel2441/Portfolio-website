/**
 * ===================================================================
 * GOBIND PATEL — PROCEDURAL ATMOSPHERIC CLOUD SHADER
 * Inspired by Aceternity UI Cloud Shader (ui.aceternity.com/components/cloud-shader)
 * Volumetric Drifting Clouds • Multi-Octave Noise • Theme Palette Coupling
 * 60 FPS GPU-Accelerated Canvas Engine
 * ===================================================================
 */

(function () {
  'use strict';

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'ambient-cloud-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  canvas.style.opacity = '0.55';
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
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  // Theme palettes synchronized with data-theme
  const THEME_CLOUDS = {
    gold: {
      cloud1: 'rgba(212, 175, 55, 0.12)',   // Warm gold
      cloud2: 'rgba(140, 109, 79, 0.14)',   // Bronze
      cloud3: 'rgba(247, 231, 196, 0.08)',  // Champagne highlight
      cloud4: 'rgba(180, 130, 40, 0.06)',   // Deep amber
    },
    obsidian: {
      cloud1: 'rgba(160, 165, 180, 0.09)',  // Steel mist
      cloud2: 'rgba(90, 95, 110, 0.12)',    // Charcoal
      cloud3: 'rgba(220, 225, 235, 0.05)',  // White highlight
      cloud4: 'rgba(40, 45, 55, 0.15)',     // Shadow smoke
    },
    emerald: {
      cloud1: 'rgba(52, 211, 153, 0.12)',   // Mint emerald
      cloud2: 'rgba(16, 185, 129, 0.10)',   // Jade
      cloud3: 'rgba(167, 243, 208, 0.07)',  // Seafoam highlight
      cloud4: 'rgba(6, 95, 70, 0.09)',      // Deep forest
    },
    cyber: {
      cloud1: 'rgba(56, 189, 248, 0.12)',   // Celestial blue
      cloud2: 'rgba(99, 102, 241, 0.11)',   // Indigo cobalt
      cloud3: 'rgba(199, 210, 254, 0.07)',  // Light cyan highlight
      cloud4: 'rgba(30, 27, 75, 0.12)',     // Deep navy
    }
  };

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'gold';
  }

  // Cloud Nodes with harmonic drift vectors
  const CLOUD_COUNT = 7;
  let clouds = [];

  function initClouds() {
    clouds = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      clouds.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseRadius: Math.max(width, height) * (0.28 + Math.random() * 0.22),
        currentRadius: 0,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25,
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
    ctx.scale(dpr, dpr);
    initClouds();
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Mouse interaction for subtle cloud drift reaction
  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetMouseX = width / 2;
  let targetMouseY = height / 2;

  window.addEventListener(
    'mousemove',
    (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    },
    { passive: true }
  );

  let lastTime = performance.now();

  function render(currentTime) {
    const dt = Math.min(32, currentTime - lastTime);
    lastTime = currentTime;

    // Smooth cursor interpolation
    mouseX += (targetMouseX - mouseX) * 0.04;
    mouseY += (targetMouseY - mouseY) * 0.04;

    ctx.clearRect(0, 0, width, height);

    const themeKey = getCurrentTheme();
    const colors = THEME_CLOUDS[themeKey] || THEME_CLOUDS.gold;
    const colorArray = [colors.cloud1, colors.cloud2, colors.cloud3, colors.cloud4];

    // Soft global composite operation for volumetric glow
    ctx.globalCompositeOperation = 'lighter';

    clouds.forEach((c, idx) => {
      // Dynamic breathing and pulsation
      c.phase += c.pulseSpeed * dt;
      const pulse = Math.sin(c.phase) * 0.12;
      const radius = c.baseRadius * (1 + pulse);

      // Organic drift with subtle mouse influence
      const dxToMouse = c.x - mouseX;
      const dyToMouse = c.y - mouseY;
      const distToMouse = Math.hypot(dxToMouse, dyToMouse);

      if (distToMouse < radius * 1.2 && distToMouse > 0) {
        c.x += (dxToMouse / distToMouse) * 0.35;
        c.y += (dyToMouse / distToMouse) * 0.35;
      }

      c.x += c.vx;
      c.y += c.vy;

      // Wrap around bounds softly
      const margin = radius * 0.5;
      if (c.x < -margin) c.x = width + margin;
      if (c.x > width + margin) c.x = -margin;
      if (c.y < -margin) c.y = height + margin;
      if (c.y > height + margin) c.y = -margin;

      // Create multi-stop volumetric radial gradient
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
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
