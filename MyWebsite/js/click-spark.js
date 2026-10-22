/**
 * CLICK SPARK MICRO-PARTICLE ENGINE
 * Adapted directly from React Bits (ClickSpark.jsx)
 * Emits subtle, cinematic golden star streaks and micro-sparks on user clicks/taps
 */
(function () {
  'use strict';

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GOLD_SPARK_COLORS = ['#D4AF37', '#F5D77F', '#E5C158', '#FFFFFF', '#C59A27'];
  const SPARK_COUNT = 8;
  const SPARK_RADIUS = 28;
  const SPARK_DURATION = 420; // ms

  let canvas = null;
  let ctx = null;
  let sparks = [];
  let isRunning = false;

  function initCanvas() {
    if (canvas || prefersReducedMotion()) return;

    canvas = document.createElement('canvas');
    canvas.id = 'click-spark-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99998';
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
    resize();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (ctx) ctx.scale(dpr, dpr);
  }

  function onPointerDown(e) {
    if (prefersReducedMotion()) return;
    // Don't spawn on right click
    if (e.button && e.button !== 0) return;

    const x = e.clientX;
    const y = e.clientY;
    const now = performance.now();

    for (let i = 0; i < SPARK_COUNT; i++) {
      const angle = (i / SPARK_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = SPARK_RADIUS * (0.65 + Math.random() * 0.7);
      const color = GOLD_SPARK_COLORS[Math.floor(Math.random() * GOLD_SPARK_COLORS.length)];
      const size = 1.5 + Math.random() * 2;

      sparks.push({
        x,
        y,
        angle,
        speed,
        size,
        color,
        startTime: now,
        duration: SPARK_DURATION * (0.8 + Math.random() * 0.4)
      });
    }

    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(render);
    }
  }

  function render(now) {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    sparks = sparks.filter(spark => {
      const elapsed = now - spark.startTime;
      if (elapsed >= spark.duration) return false;

      const progress = elapsed / spark.duration;
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const distance = spark.speed * ease;
      const opacity = 1 - progress;

      const px = spark.x + Math.cos(spark.angle) * distance;
      const py = spark.y + Math.sin(spark.angle) * distance;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = spark.color;
      ctx.shadowColor = spark.color;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      // Draw fine streak star shape
      const starRadius = spark.size * (1 - progress * 0.4);
      ctx.arc(px, py, starRadius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle streak line connecting from origin
      if (progress < 0.5) {
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = spark.size * 0.5 * (1 - progress * 2);
        ctx.beginPath();
        ctx.moveTo(spark.x + Math.cos(spark.angle) * (distance * 0.4), spark.y + Math.sin(spark.angle) * (distance * 0.4));
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      ctx.restore();
      return true;
    });

    if (sparks.length > 0) {
      requestAnimationFrame(render);
    } else {
      isRunning = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanvas);
  } else {
    initCanvas();
  }
})();
