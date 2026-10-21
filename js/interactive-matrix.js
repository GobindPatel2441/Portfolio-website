/**
 * INTERACTIVE CONSTELLATION & MATRIX CANVAS
 * Inspired by ThreeUI (dot-matrix, constellation-field)
 * High-performance, tactile mouse gravity, connecting neural threads,
 * and dynamic adaptation to the selected background theme.
 */

(function () {
  const canvas = document.getElementById('interactive-matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 180, isHovered: false };
  let particles = [];
  let sparks = [];

  // Theme Color Presets
  const themeColors = {
    gold: {
      dot: 'rgba(212, 175, 55, 0.28)',
      dotActive: 'rgba(247, 231, 196, 0.9)',
      line: 'rgba(212, 175, 55, 0.16)',
      spark: 'rgba(243, 219, 179, 0.85)',
      radial: 'rgba(212, 175, 55, 0.05)'
    },
    obsidian: {
      dot: 'rgba(255, 255, 255, 0.22)',
      dotActive: 'rgba(255, 255, 255, 0.95)',
      line: 'rgba(255, 255, 255, 0.12)',
      spark: 'rgba(255, 255, 255, 0.85)',
      radial: 'rgba(255, 255, 255, 0.03)'
    },
    emerald: {
      dot: 'rgba(16, 185, 129, 0.28)',
      dotActive: 'rgba(110, 231, 183, 0.95)',
      line: 'rgba(16, 185, 129, 0.16)',
      spark: 'rgba(110, 231, 183, 0.85)',
      radial: 'rgba(16, 185, 129, 0.05)'
    },
    cyber: {
      dot: 'rgba(56, 189, 248, 0.28)',
      dotActive: 'rgba(186, 230, 253, 0.95)',
      line: 'rgba(56, 189, 248, 0.16)',
      spark: 'rgba(186, 230, 253, 0.85)',
      radial: 'rgba(56, 189, 248, 0.05)'
    }
  };

  function getCurrentThemeKey() {
    return document.documentElement.getAttribute('data-theme') || 'gold';
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    initParticles();
  }

  function initParticles() {
    particles = [];
    sparks = [];

    // Structured Grid Points (Dot Matrix)
    const spacing = Math.max(55, Math.floor(width / 24));
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // Base coordinate with subtle organic jitter
        const baseX = c * spacing;
        const baseY = r * spacing;
        particles.push({
          baseX: baseX,
          baseY: baseY,
          x: baseX,
          y: baseY,
          vx: 0,
          vy: 0,
          size: (c % 2 === 0 && r % 2 === 0) ? 1.6 : 1.1,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    // Drifting Spark Embers
    const sparkCount = Math.min(35, Math.floor(width / 40));
    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.2 - Math.random() * 0.45,
        size: 0.8 + Math.random() * 1.6,
        alpha: Math.random() * 0.7,
        pulseSpeed: 0.015 + Math.random() * 0.02
      });
    }
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isHovered = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.targetX = -1000;
    mouse.targetY = -1000;
    mouse.isHovered = false;
  });

  let time = 0;
  let isRunning = true;

  document.addEventListener('visibilitychange', () => {
    isRunning = !document.hidden;
    if (isRunning) requestAnimationFrame(render);
  });

  function render() {
    if (!isRunning) return;

    time += 0.015;

    // Smooth cursor lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.15;
    mouse.y += (mouse.targetY - mouse.y) * 0.15;

    ctx.clearRect(0, 0, width, height);

    const themeKey = getCurrentThemeKey();
    const colors = themeColors[themeKey] || themeColors.gold;

    // 1. Draw Subtle Radial Torch Around Mouse
    if (mouse.x > 0 && mouse.y > 0) {
      const radialGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, 10,
        mouse.x, mouse.y, mouse.radius
      );
      radialGrad.addColorStop(0, colors.radial);
      radialGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Update and Draw Matrix Nodes
    const activeNodes = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Subtle ambient respiration
      const wave = Math.sin(time + p.phase) * 0.8;
      const targetX = p.baseX;
      const targetY = p.baseY + wave;

      // Mouse interactive displacement & gravity
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius) * 14;
        const angle = Math.atan2(dy, dx);
        p.vx -= Math.cos(angle) * force * 0.08;
        p.vy -= Math.sin(angle) * force * 0.08;
        activeNodes.push({ p, dist });
      }

      // Spring back to base position
      p.vx += (targetX - p.x) * 0.06;
      p.vy += (targetY - p.y) * 0.06;
      p.vx *= 0.82;
      p.vy *= 0.82;

      p.x += p.vx;
      p.y += p.vy;

      // Draw dot
      const isNear = dist < mouse.radius;
      ctx.beginPath();
      ctx.arc(p.x, p.y, isNear ? p.size * 1.5 : p.size, 0, Math.PI * 2);
      ctx.fillStyle = isNear ? colors.dotActive : colors.dot;
      ctx.fill();
    }

    // 3. Draw Connecting Geometric Threads between Active Nodes
    for (let i = 0; i < activeNodes.length; i++) {
      for (let j = i + 1; j < activeNodes.length; j++) {
        const p1 = activeNodes[i].p;
        const p2 = activeNodes[j].p;
        const dxx = p1.x - p2.x;
        const dyy = p1.y - p2.y;
        const dBetween = Math.sqrt(dxx * dxx + dyy * dyy);

        if (dBetween < 75) {
          const alphaFactor = (1 - dBetween / 75) * (1 - (activeNodes[i].dist + activeNodes[j].dist) / (mouse.radius * 2));
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = colors.line;
          ctx.lineWidth = 0.85;
          ctx.globalAlpha = Math.max(0, Math.min(1, alphaFactor * 1.4));
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }
    }

    // 4. Update and Draw Drifting Spark Embers (Coupled with Scroll Velocity)
    const velocity = (window.scrollVelocity || 0) * 0.8;

    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy - velocity;
      s.alpha += Math.sin(time * 3 + i) * s.pulseSpeed;

      if (s.y < -20) {
        s.y = height + 20;
        s.x = Math.random() * width;
      }
      if (s.y > height + 20) {
        s.y = -20;
        s.x = Math.random() * width;
      }
      if (s.x < -10) s.x = width + 10;
      if (s.x > width + 10) s.x = -10;

      const sparkAlpha = Math.max(0.15, Math.min(0.95, s.alpha));
      ctx.fillStyle = colors.spark;
      ctx.globalAlpha = sparkAlpha;

      if (Math.abs(velocity) > 2) {
        // Draw kinetic speed streak
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + velocity * 1.8);
        ctx.strokeStyle = colors.spark;
        ctx.lineWidth = s.size * 0.8;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    requestAnimationFrame(render);
  }

  resize();
  requestAnimationFrame(render);
})();
