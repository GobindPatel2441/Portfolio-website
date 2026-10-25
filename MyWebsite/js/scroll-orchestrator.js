/**
 * ===================================================================
 * GOBIND PATEL — SCROLL ORCHESTRATOR & BIDIRECTIONAL FLUID TRANSITIONS
 * Ported from ex/cinematic-portfolio-main (ScrollStack, AboutSection,
 * ExperienceSection) with Two-Way (Down & Up) Reverse Animations
 * Powered by Lenis Smooth Momentum Scroll Engine
 * ===================================================================
 */

(function () {
  'use strict';

  // 1. Reduced Motion Preference Check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 2. Reading Progress Bar Element Reference
  let progressBar = null;

  // 3. Initialize Lenis Smooth Momentum Scroll Engine (Quick & Smooth)
  let lenis = null;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 768);
  if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: isTouchDevice ? 1.0 : 0.85, // Snappy & responsive momentum
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.0, // Natural 1:1 touch response on touchscreens
      syncTouch: false, // Preserve native 120Hz touch scrolling on mobile
      infinite: false,
    });

    window.lenis = lenis;

    // Harmonize Lenis with GSAP ScrollTrigger & Ticker if available
    if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
      window.gsap.registerPlugin(window.ScrollTrigger);
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      function lenisRaf(time) {
        lenis.raf(time);
        requestAnimationFrame(lenisRaf);
      }
      requestAnimationFrame(lenisRaf);
    }
  }

  // 4. Bidirectional IntersectionObserver for Smooth Entrance & Reverse Exit
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = entry.target;
        const rect = entry.boundingClientRect;

        if (entry.isIntersecting) {
          // Entering the active viewport
          target.classList.add('reveal-active');
          target.classList.remove('reveal-exit-down', 'reveal-exit-up');
        } else {
          // Leaving viewport: if center is below middle of screen, exit downwards; if above, exit upwards
          if (rect.top >= window.innerHeight / 2) {
            target.classList.remove('reveal-active');
            target.classList.add('reveal-exit-down');
          } else {
            target.classList.remove('reveal-active');
            target.classList.add('reveal-exit-up');
          }
        }
      });
    },
    {
      root: null,
      rootMargin: '15px 0px 15px 0px',
      threshold: 0.08,
    }
  );

  function initScrollOrchestrator() {
    // 0. Ensure Reading Progress Bar is mounted in body
    progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar && document.body) {
      progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress-bar';
      document.body.appendChild(progressBar);
    }

    // A. Register all reveal elements and immediately activate those in current viewport
    const revealElements = document.querySelectorAll('.reveal-init');
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('reveal-active');
      }
      revealObserver.observe(el);
    });

    // B. Setup Project Showcase Smooth Atmospheric Transitions & 3D Pointer Tilt
    const stackScroller = document.querySelector('.scroll-stack-scroller');
    const cards = Array.from(document.querySelectorAll('.scroll-stack-card'));

    // Project-Aware Atmosphere Shifting (Phase 9 Idea 8)
    const projectColorMap = {
      sentix: { orb1: 'rgba(212, 175, 55, 0.22)', orb2: 'rgba(201, 158, 93, 0.14)' },
      medical: { orb1: 'rgba(16, 185, 129, 0.22)', orb2: 'rgba(5, 150, 105, 0.14)' },
      chakravyuh: { orb1: 'rgba(56, 189, 248, 0.22)', orb2: 'rgba(30, 64, 175, 0.14)' }
    };

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    cards.forEach((card) => {
      card.style.transform = '';
      card.style.filter = '';
      card.style.marginBottom = '';
      card.style.zIndex = '';

      const targetEl = card.querySelector('[data-project-target]');
      const targetKey = card.dataset.projectId || (targetEl ? targetEl.dataset.projectTarget : null);
      if (targetKey && projectColorMap[targetKey]) {
        card.addEventListener('mouseenter', () => {
          document.documentElement.style.setProperty('--orb-1-color', projectColorMap[targetKey].orb1);
          document.documentElement.style.setProperty('--orb-2-color', projectColorMap[targetKey].orb2);
        });
        card.addEventListener('mouseleave', () => {
          document.documentElement.style.removeProperty('--orb-1-color');
          document.documentElement.style.removeProperty('--orb-2-color');
        });
      }

      // Restrained Desktop 3D Tilt & Specular Directional Lighting
      if (isFinePointer && !prefersReducedMotion) {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const px = (x / rect.width) * 100;
          const py = (y / rect.height) * 100;
          
          // Max tilt 2.5 degrees for subtle, luxurious depth
          const tiltY = ((x - rect.width / 2) / (rect.width / 2)) * 2.5;
          const tiltX = -((y - rect.height / 2) / (rect.height / 2)) * 2.5;

          card.style.setProperty('--card-tilt-x', `${tiltX.toFixed(2)}deg`);
          card.style.setProperty('--card-tilt-y', `${tiltY.toFixed(2)}deg`);
          card.style.setProperty('--img-tilt-x', `${(-tiltY * 1.5).toFixed(2)}px`);
          card.style.setProperty('--mouse-x', `${px.toFixed(1)}%`);
          card.style.setProperty('--mouse-y', `${py.toFixed(1)}%`);
        });

        card.addEventListener('mouseleave', () => {
          card.style.setProperty('--card-tilt-x', '0deg');
          card.style.setProperty('--card-tilt-y', '0deg');
          card.style.setProperty('--img-tilt-x', '0px');
          card.style.setProperty('--mouse-x', '50%');
          card.style.setProperty('--mouse-y', '20%');
        });
      }
    });

    // C. Timeline Dynamic Line Elements (ExperienceSection.tsx)
    const expSection = document.getElementById('experience');
    const timelineContainer = document.querySelector('.timeline-container');
    let timelineFill = null;
    let timelineNodes = [];

    if (timelineContainer) {
      let track = timelineContainer.querySelector('.timeline-progress-track');
      if (!track) {
        track = document.createElement('div');
        track.className = 'timeline-progress-track';
        timelineFill = document.createElement('div');
        timelineFill.className = 'timeline-progress-fill';
        track.appendChild(timelineFill);
        timelineContainer.prepend(track);
      } else {
        timelineFill = track.querySelector('.timeline-progress-fill');
      }
      timelineNodes = Array.from(timelineContainer.querySelectorAll('.timeline-node'));
    }

    // D. Interactive 3D Spotlight Cards (Only on Fine-Pointer Desktop Devices)
    if (window.matchMedia('(pointer: fine)').matches) {
      const spotlightCards = document.querySelectorAll('.spotlight-card');
      spotlightCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--mouse-x', `${x}%`);
          card.style.setProperty('--mouse-y', `${y}%`);

          const tiltX = (e.clientY - (rect.top + rect.height / 2)) * 0.035;
          const tiltY = (e.clientX - (rect.left + rect.width / 2)) * -0.035;
          card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
      });
    }

    // E. Vertical Section Navigation Dock Setup
    const navDockItems = document.querySelectorAll('.section-nav-item');
    const sections = Array.from(document.querySelectorAll('section[id]'));

    function updateNavDock(activeId) {
      navDockItems.forEach((item) => {
        const href = item.getAttribute('href');
        if (href === `#${activeId}`) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    // F. Smooth Anchor Scrolling with Lenis
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (window.PortfolioAudio && window.PortfolioAudio.playBlip) {
            window.PortfolioAudio.playBlip();
          }
          if (lenis) {
            lenis.scrollTo(targetEl, {
              duration: 0.9,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              offset: -20,
            });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // G. Core Scroll Update (Continuous in Both Directions: Down & Up)
    const heroTitle = document.querySelector('.hero-title-monumental');
    const heroPortrait = document.querySelector('.portrait-container');

    // Cached Layout Metrics (Updated only on resize or initial load)
    let cachedViewportHeight = window.innerHeight;
    let cachedCardMetrics = [];
    let cachedExpTop = 0;
    let cachedExpHeight = 0;
    let cachedTimelineThresholds = [];

    function updateLayoutMetrics() {
      cachedViewportHeight = window.innerHeight;

      // Cache Project Cards
      cachedCardMetrics = cards.map((card) => {
        const rect = card.getBoundingClientRect();
        return {
          top: rect.top + window.scrollY,
          height: rect.height
        };
      });

      // Cache Experience Timeline
      if (expSection && timelineContainer) {
        const expRect = expSection.getBoundingClientRect();
        cachedExpTop = expRect.top + window.scrollY;
        cachedExpHeight = expRect.height || expSection.offsetHeight;

        cachedTimelineThresholds = timelineNodes.map((node) => {
          const nodeRect = node.getBoundingClientRect();
          const nodeAbsTop = nodeRect.top + window.scrollY;
          return (nodeAbsTop - cachedExpTop) / (cachedExpHeight || 1);
        });
      }
    }

    updateLayoutMetrics();
    window.addEventListener('resize', () => {
      clearTimeout(window.__metricsTimer);
      window.__metricsTimer = setTimeout(updateLayoutMetrics, 150);
    }, { passive: true });

    // High-performance asynchronous section dock indicator via IntersectionObserver
    const navDockObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateNavDock(entry.target.getAttribute('id'));
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: 0.05
    });

    sections.forEach((sec) => navDockObserver.observe(sec));

    function onScrollUpdate(scrollTop, scrollVelocity, scrollProgress) {
      // 1. Reading Progress Bar (Shrinks/expands smoothly in reverse)
      if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, scrollProgress * 100))}%`;
      }

      // 2. Velocity for Matrix Canvas Embers
      window.scrollVelocity = scrollVelocity;

      // 3. Hero Parallax (Reverses seamlessly when scrolling back to top)
      if (heroTitle && scrollTop < cachedViewportHeight) {
        const heroRatio = Math.max(0, scrollTop / cachedViewportHeight);
        heroTitle.style.transform = `translate3d(0, ${heroRatio * -28}px, 0)`;
        if (heroPortrait) {
          heroPortrait.style.transform = `translate3d(0, ${heroRatio * 18}px, 0) scale(${1 - heroRatio * 0.035})`;
        }
      }

      // 4. Cinematic Scroll Zoom-Through Transition for Project Cards
      if (cards.length > 0 && cachedCardMetrics.length === cards.length) {
        const viewportCenter = cachedViewportHeight / 2;
        let activeProjectKey = null;
        let closestDist = Infinity;
        const isDesktop = window.innerWidth >= 900 && isFinePointer;

        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const metric = cachedCardMetrics[i];
          const cardTopInView = metric.top - scrollTop;
          const cardBottomInView = cardTopInView + metric.height;

          // Skip off-screen cards for maximum 60/120fps performance
          if (cardBottomInView < -120 || cardTopInView > cachedViewportHeight + 120) {
            continue;
          }

          if (prefersReducedMotion) {
            card.style.setProperty('--card-scroll-scale', '1');
            card.style.setProperty('--card-scroll-y', '0px');
            card.style.setProperty('--card-scroll-opacity', '1');
            card.style.setProperty('--card-sweep-opacity', '0');
            card.style.setProperty('--card-rim-opacity', '0.4');
            card.style.setProperty('--img-parallax-y', '0px');
            card.style.setProperty('--img-zoom-scale', '1');
            card.classList.add('in-focus');
            continue;
          }

          const cardCenter = cardTopInView + metric.height / 2;
          const dist = cardCenter - viewportCenter;
          const distToCenter = Math.abs(dist);
          const range = cachedViewportHeight * 0.72;
          const progress = Math.max(-1.5, Math.min(1.5, dist / range));

          // Cosine bell curve for smooth camera focal moment (1.0 at center, 0 at bounds)
          const focalFactor = Math.max(0, Math.cos(Math.min(Math.PI / 2, Math.abs(progress) * (Math.PI / 2))));
          const focalIntensity = Math.pow(focalFactor, 1.6);

          let scale, translateY, opacity;

          if (isDesktop) {
            if (progress > 0) {
              const entranceRatio = Math.max(0, Math.min(1, progress));
              scale = 0.95 + 0.05 * (1 - entranceRatio) + 0.035 * Math.pow(focalFactor, 1.4);
              translateY = entranceRatio * 40;
              opacity = 0.70 + 0.30 * (1 - entranceRatio);
            } else {
              const exitRatio = Math.max(0, Math.min(1, -progress));
              scale = 1.035 - (1.035 - 0.975) * exitRatio;
              translateY = -exitRatio * 16;
              opacity = 1.0 - 0.16 * exitRatio;
            }
          } else {
            if (progress > 0) {
              const entranceRatio = Math.max(0, Math.min(1, progress));
              scale = 0.98 + 0.02 * (1 - entranceRatio) + 0.016 * focalFactor;
              translateY = entranceRatio * 18;
              opacity = 0.78 + 0.22 * (1 - entranceRatio);
            } else {
              const exitRatio = Math.max(0, Math.min(1, -progress));
              scale = 0.996 - 0.018 * exitRatio;
              translateY = -exitRatio * 10;
              opacity = 1.0 - 0.12 * exitRatio;
            }
          }

          const imgParallaxY = isDesktop ? -progress * 22 : -progress * 8;
          const imgZoomScale = isDesktop ? 1.02 + 0.035 * focalFactor : 1.01;
          const rimOpacity = 0.3 + 0.7 * focalIntensity;
          const sweepOpacity = 0.08 + 0.92 * focalIntensity;

          card.style.setProperty('--card-scroll-scale', scale.toFixed(4));
          card.style.setProperty('--card-scroll-y', `${translateY.toFixed(2)}px`);
          card.style.setProperty('--card-scroll-opacity', opacity.toFixed(3));
          card.style.setProperty('--card-sweep-opacity', sweepOpacity.toFixed(3));
          card.style.setProperty('--card-rim-opacity', rimOpacity.toFixed(3));
          card.style.setProperty('--img-parallax-y', `${imgParallaxY.toFixed(2)}px`);
          card.style.setProperty('--img-zoom-scale', imgZoomScale.toFixed(3));

          const isInFocus = focalFactor >= 0.42;
          if (isInFocus) {
            card.classList.add('in-focus');
            if (distToCenter < closestDist) {
              closestDist = distToCenter;
              const targetEl = card.querySelector('[data-project-target]');
              activeProjectKey = card.dataset.projectId || (targetEl ? targetEl.dataset.projectTarget : null);
            }
          } else {
            card.classList.remove('in-focus');
          }
        }

        if (activeProjectKey && projectColorMap[activeProjectKey]) {
          document.documentElement.style.setProperty('--orb-1-color', projectColorMap[activeProjectKey].orb1);
          document.documentElement.style.setProperty('--orb-2-color', projectColorMap[activeProjectKey].orb2);
        }
      }

      // 5. Dynamic Timeline Progress Line (Grows Downwards, Shrinks Back Upwards)
      if (expSection && timelineContainer && timelineFill && cachedExpHeight > 0) {
        const expTopInView = cachedExpTop - scrollTop;
        const startY = cachedViewportHeight * 0.75;
        const currentProgress = (startY - expTopInView) / cachedExpHeight;
        const clampedProgress = Math.max(0, Math.min(1, currentProgress));

        timelineFill.style.height = `${clampedProgress * 100}%`;

        // Ignite/Un-ignite milestone nodes dynamically in both scroll directions using cached thresholds
        for (let i = 0; i < timelineNodes.length; i++) {
          const node = timelineNodes[i];
          const threshold = cachedTimelineThresholds[i] || 0;
          if (clampedProgress >= threshold) {
            node.classList.add('node-ignited');
          } else {
            node.classList.remove('node-ignited');
          }
        }
      }
    }

    // H. Connect Listeners (Lenis or Native Fallback)
    if (lenis) {
      lenis.on('scroll', (e) => {
        onScrollUpdate(e.scroll, e.velocity || 0, e.progress || 0);
      });
      onScrollUpdate(lenis.actualScroll, 0, lenis.progress || 0);
    } else {
      let lastScrollY = window.scrollY;
      let isTicking = false;

      window.addEventListener(
        'scroll',
        () => {
          if (!isTicking) {
            requestAnimationFrame(() => {
              const currentY = window.scrollY;
              const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
              const progress = maxScroll > 0 ? currentY / maxScroll : 0;
              const velocity = (currentY - lastScrollY) * 0.4;
              lastScrollY = currentY;

              onScrollUpdate(currentY, velocity, progress);
              isTicking = false;
            });
            isTicking = true;
          }
        },
        { passive: true }
      );

      onScrollUpdate(window.scrollY, 0, 0);
    }

    // I. GSAP Coordinated Entrance Timeline & ScrollTrigger Refresh
    if (typeof window.gsap !== 'undefined' && !prefersReducedMotion) {
      try {
        const heroTl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
        heroTl
          .from('.hero-status-pill', { opacity: 0, y: -16, duration: 0.65, delay: 0.15 })
          .from('.hero-title-monumental', { opacity: 0, y: 24, duration: 0.8 }, '-=0.45')
          .from('.hero-eyebrow-tech', { opacity: 0, y: 16, duration: 0.6 }, '-=0.5')
          .from('.hero-editorial-desc', { opacity: 0, y: 20, duration: 0.65 }, '-=0.5')
          .from('.hero-ctas', { opacity: 0, y: 18, duration: 0.6 }, '-=0.45')
          .from('.stat-item', { opacity: 0, y: 16, stagger: 0.08, duration: 0.5 }, '-=0.4');

        if (typeof window.ScrollTrigger !== 'undefined') {
          let resizeTimer = null;
          let lastW = window.innerWidth;
          window.addEventListener('resize', () => {
            // Only refresh if horizontal viewport changed to avoid mobile address-bar resize churn
            if (window.innerWidth !== lastW) {
              lastW = window.innerWidth;
              clearTimeout(resizeTimer);
              resizeTimer = setTimeout(() => {
                window.ScrollTrigger.refresh();
              }, 250);
            }
          }, { passive: true });
        }
      } catch (err) {
        console.warn('GSAP timeline init skipped:', err);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollOrchestrator);
  } else {
    initScrollOrchestrator();
  }
})();
