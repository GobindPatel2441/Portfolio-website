/**
 * LIQUID GLASS & 3D TILT ENGINE
 * Inspired by Apple Vision Pro & liquid-glass-js
 * Real-time tilt physics, specular glare reflection, and refraction mode presets.
 */

document.addEventListener('DOMContentLoaded', () => {
  const glassCard = document.querySelector('.liquid-glass-card');
  const specular = document.querySelector('.glass-specular');

  if (glassCard) {
    let bounds;

    function updateBounds() {
      bounds = glassCard.getBoundingClientRect();
    }
    updateBounds();
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds, { passive: true });

    glassCard.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };

      // Subtle 3D tilt max 12 deg
      const rotateX = (-center.y / (bounds.height / 2)) * 10;
      const rotateY = (center.x / (bounds.width / 2)) * 10;

      glassCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      // Specular glare positioning
      if (specular) {
        const specX = (leftX / bounds.width) * 100;
        const specY = (topY / bounds.height) * 100;
        specular.style.background = `radial-gradient(circle at ${specX}% ${specY}%, rgba(255, 255, 255, 0.45) 0%, rgba(0, 242, 254, 0.15) 35%, transparent 65%)`;
        specular.style.opacity = '0.9';
      }
    });

    glassCard.addEventListener('mouseleave', () => {
      glassCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (specular) {
        specular.style.background = 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.35), transparent 60%)';
        specular.style.opacity = '0.6';
      }
    });

    // Glass Mode Buttons
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.dataset.mode;
        if (mode === 'crystal') {
          glassCard.style.backdropFilter = 'blur(28px) saturate(200%)';
          glassCard.style.background = 'rgba(18, 24, 38, 0.45)';
          glassCard.style.borderColor = 'rgba(255, 255, 255, 0.18)';
        } else if (mode === 'frosted') {
          glassCard.style.backdropFilter = 'blur(45px) saturate(140%)';
          glassCard.style.background = 'rgba(15, 20, 32, 0.75)';
          glassCard.style.borderColor = 'rgba(255, 255, 255, 0.25)';
        } else if (mode === 'holo') {
          glassCard.style.backdropFilter = 'blur(24px) saturate(250%)';
          glassCard.style.background = 'linear-gradient(135deg, rgba(0,242,254,0.12), rgba(138,43,226,0.12))';
          glassCard.style.borderColor = 'rgba(0, 242, 254, 0.5)';
        }

        // Trigger subtle audio if sound enabled
        if (window.PortfolioAudio) window.PortfolioAudio.playClick();
      });
    });
  }

  // Tilt on Project Visual Wrappers
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = (-y / (rect.height / 2)) * 3;
      const rotY = (x / (rect.width / 2)) * 3;
      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
});
