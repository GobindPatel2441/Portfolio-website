/**
 * ===================================================================
 * GOBIND PATEL — PROCEDURAL ATMOSPHERIC CLOUD SHADER
 * Volumetric Drifting Clouds • Multi-Octave Noise • Theme Palette Coupling
 * GPU-Accelerated Canvas Engine with Adaptive Mobile Profile & Visibility Throttle
 * ===================================================================
 */

(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  function getConfig() {
    return window.PortfolioPerfConfig || {
      isMobile: window.innerWidth < 768,
      dpr: window.innerWidth < 768 ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5),
      cloudShader: {
        enabled: true,
        cloudCount: window.innerWidth < 768 ? 3 : 7,
        opacity: window.innerWidth < 768 ? '0.25' : '0.55'
      }
    };
  }

  function initCloudShader() {
    if (!document.body) return;

    const cfg = getConfig();
    if (cfg.cloudShader && cfg.cloudShader.enabled === false) return;

    const isMobile = cfg.isMobile;

    const canvas = document.createElement('canvas');
    canvas.id = 'ambient-cloud-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.opacity = (cfg.cloudShader && cfg.cloudShader.opacity) ? cfg.cloudShader.opacity : (isMobile ? '0.25' : '0.55');
    canvas.style.mixBlendMode = 'screen';
    canvas.style.transition = 'opacity 0.8s ease';

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
    let dpr = cfg.dpr || 1;

    const THEME_CLOUDS = {
      gold: {
        cloud1: 'rgba(212, 175, 55, 0.12)',
        cloud2: 'rgba(140, 109, 79, 0.14)',
        cloud3: 'rgba(247, 231, 196, 0.08)',
        cloud4: 'rgba(40, 32, 20, 0.18)',
      },
      obsidian: {
        cloud1: 'rgba(160, 160, 175, 0.10)',
        cloud2: 'rgba(90, 95, 110, 0.12)',
        cloud3: 'rgba(220, 225, 240, 0.07)',
        cloud4: 'rgba(25, 28, 38, 0.16)',
      },
      emerald: {
        cloud1: 'rgba(16, 185, 129, 0.12)',
        cloud2: 'rgba(5, 150, 105, 0.14)',
        cloud3: 'rgba(110, 231, 183, 0.08)',
        cloud4: 'rgba(6, 78, 59, 0.18)',
      },
      cyber: {
        cloud1: 'rgba(56, 189, 248, 0.14)',
        cloud2: 'rgba(30, 64, 175, 0.16)',
        cloud3: 'rgba(192, 132, 252, 0.09)',
        cloud4: 'rgba(30, 27, 75, 0.12)',
      }
    };

    function getCurrentTheme() {
      return document.documentElement.getAttribute('data-theme') || 'gold';
    }

    let clouds = [];

    function initClouds() {
      const currentCfg = getConfig();
      const count = (currentCfg.cloudShader && currentCfg.cloudShader.cloudCount) ? currentCfg.cloudShader.cloudCount : (currentCfg.isMobile ? 3 : 7);
      clouds = [];
      for (let i = 0; i < count; i++) {
        clouds.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseRadius: Math.max(width, height) * (0.28 + Math.random() * 0.22),
          currentRadius: 0,
          vx: (Math.random() - 0.5) * (currentCfg.isMobile ? 0.15 : 0.35),
          vy: (Math.random() - 0.5) * (currentCfg.isMobile ? 0.12 : 0.25),
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.0008 + Math.random() * 0.0012,
          layerIndex: i % 4,
        });
      }
    }

    function resize() {
      const currentCfg = getConfig();
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = currentCfg.dpr || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      canvas.style.opacity = (currentCfg.cloudShader && currentCfg.cloudShader.opacity) ? currentCfg.cloudShader.opacity : (currentCfg.isMobile ? '0.25' : '0.55');
      initClouds();
    }

    resize();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    window.addEventListener('portfolio:profile-change', () => {
      resize();
    });

    let mouseX = -1000;
    let mouseY = -1000;
    if (!isMobile) {
      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });
    }

    let lastTime = performance.now();
    let isRunning = true;
    let rafId = null;
    let frameIndex = 0;

    function render(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      const themeKey = getCurrentTheme();
      const colors = THEME_CLOUDS[themeKey] || THEME_CLOUDS.gold;
      const colorArray = [colors.cloud1, colors.cloud2, colors.cloud3, colors.cloud4];

      ctx.globalCompositeOperation = 'lighter';

      const currentCfg = getConfig();

      for (let idx = 0; idx < clouds.length; idx++) {
        const c = clouds[idx];
        c.phase += c.pulseSpeed * dt * (currentCfg.isMobile ? 0.6 : 1.0);
        const pulse = Math.sin(c.phase) * 0.12;
        const radius = c.baseRadius * (1 + pulse);

        if (!currentCfg.isMobile) {
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
      const currentCfg = getConfig();
      frameIndex++;
      // On mobile, skip every other frame (30fps) for background cloud shader
      if (currentCfg.isMobile && frameIndex % 2 !== 0) {
        rafId = requestAnimationFrame(loop);
        return;
      }
      render(now);
      rafId = requestAnimationFrame(loop);
    }

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
