/**
 * ===================================================================
 * GOBIND PATEL — BESPOKE CINEMATIC AMBIENT AUDIO CONTROLLER
 * Track: Velario — Ambient Cinematic (Production Master)
 * Luxury Glassmorphic Ambient Controller • Web Audio & HTML5 Audio
 * Zero Dependencies • Accessible • Mobile Responsive • Auto-Fade
 * ===================================================================
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. CONFIGURATION & STATE
  // -------------------------------------------------------------
  const AUDIO_SRC = 'assets/audio/velariomusic-ambient-cinematic-598430.mp3';
  const DEFAULT_VOLUME = 0.06; // Target initial volume ~6%
  const STORAGE_KEYS = {
    VOLUME: 'portfolio_audio_volume',
    MUTED: 'portfolio_audio_muted'
  };

  // Safe localStorage helper
  const storage = {
    get: (key) => {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set: (key, val) => {
      try { localStorage.setItem(key, String(val)); } catch (e) {}
    },
    remove: (key) => {
      try { localStorage.removeItem(key); } catch (e) {}
    }
  };

  // Clear any legacy disabled / muted flags so page refresh ALWAYS autoplays music
  storage.remove('portfolio_audio_explicit_disabled');
  storage.remove(STORAGE_KEYS.MUTED);

  // Read saved volume (ensure audible level >= 0.05)
  let savedVolume = storage.get(STORAGE_KEYS.VOLUME);
  let targetVolume = savedVolume !== null ? parseFloat(savedVolume) : DEFAULT_VOLUME;
  if (isNaN(targetVolume) || targetVolume < 0.05) targetVolume = DEFAULT_VOLUME;

  let isMuted = false;
  let preMuteVolume = targetVolume > 0 ? targetVolume : DEFAULT_VOLUME;
  let explicitDisabled = false; // In-memory only for current page session, resets on refresh

  // Audio state: 'attempting' | 'playing' | 'paused' | 'blocked' | 'muted' | 'error'
  let currentState = 'attempting';
  let isPlaying = false;
  let activeFadeRaf = null;

  // Single shared HTML5 Audio instance
  const audio = new Audio();
  audio.src = AUDIO_SRC;
  audio.loop = true;
  audio.preload = 'metadata';
  audio.volume = 0; // Starts at 0 for smooth volume fade-in

  // DOM Elements (cached after DOM ready)
  let dom = {
    dock: null,
    pill: null,
    actionBtn: null,
    actionIcon: null,
    pillLabel: null,
    pillSubtext: null,
    popover: null,
    expandBtn: null,
    closeBtn: null,
    popoverPlayBtn: null,
    popoverPlayIcon: null,
    popoverPlayText: null,
    popoverMuteBtn: null,
    popoverMuteIcon: null,
    popoverMuteText: null,
    slider: null,
    volumeReadout: null
  };

  // -------------------------------------------------------------
  // 2. SMOOTH VOLUME FADING ENGINE (requestAnimationFrame)
  // -------------------------------------------------------------
  function cancelActiveFade() {
    if (activeFadeRaf) {
      cancelAnimationFrame(activeFadeRaf);
      activeFadeRaf = null;
    }
  }

  function fadeVolume(fromVol, toVol, durationMs, onComplete) {
    cancelActiveFade();
    fromVol = Math.max(0, Math.min(1, fromVol));
    toVol = Math.max(0, Math.min(1, toVol));

    // Instant if duration 0 or already matched
    if (durationMs <= 0 || Math.abs(fromVol - toVol) < 0.001) {
      audio.volume = toVol;
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth ease-out curve: 1 - Math.pow(1 - progress, 2)
      const eased = 1 - Math.pow(1 - progress, 2);
      const current = fromVol + (toVol - fromVol) * eased;

      audio.volume = Math.max(0, Math.min(1, current));

      if (progress < 1) {
        activeFadeRaf = requestAnimationFrame(step);
      } else {
        audio.volume = toVol;
        activeFadeRaf = null;
        if (typeof onComplete === 'function') onComplete();
      }
    }

    activeFadeRaf = requestAnimationFrame(step);
  }

  // -------------------------------------------------------------
  // 3. PLAYBACK ENGINE
  // -------------------------------------------------------------
  function play(userInitiated) {
    if (userInitiated) {
      explicitDisabled = false;
    }

    // Always unmute when play is called
    isMuted = false;
    audio.muted = false;
    storage.set(STORAGE_KEYS.MUTED, 'false');

    const goalVol = targetVolume > 0 ? targetVolume : DEFAULT_VOLUME;

    // Start playback
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          isPlaying = true;
          setState('playing');

          // Smooth fade-in from current volume to goal volume over 1200ms
          fadeVolume(audio.volume, goalVol, 1200);

          if (userInitiated && typeof window.showToast === 'function') {
            window.showToast('Ambient Soundtrack Playing');
          }
        })
        .catch((err) => {
          if (err.name === 'NotAllowedError') {
            // Browser autoplay policy blocked audible playback without user gesture
            setState('blocked');
            setupFirstGestureListener();
          } else {
            console.warn('[AmbientAudio] Playback prevented:', err.message);
            setState('error');
            setupFirstGestureListener();
          }
        });
    }
    return Promise.resolve();
  }

  function pause(userInitiated) {
    if (userInitiated) {
      explicitDisabled = true; // In-memory only for this session; refreshes will re-autoplay
    }

    // Fade out smoothly over 380ms before actual pause
    fadeVolume(audio.volume, 0, 380, () => {
      audio.pause();
      isPlaying = false;
      setState('paused');
    });

    if (userInitiated && typeof window.showToast === 'function') {
      window.showToast('Ambient Soundtrack Paused');
    }
  }

  function togglePlay() {
    if (isPlaying) {
      pause(true);
    } else {
      play(true);
    }
  }

  function setVolume(newVol, save) {
    newVol = Math.max(0, Math.min(1, parseFloat(newVol)));
    targetVolume = newVol;

    if (save !== false) {
      storage.set(STORAGE_KEYS.VOLUME, newVol.toFixed(3));
    }

    if (newVol === 0) {
      isMuted = true;
      storage.set(STORAGE_KEYS.MUTED, 'true');
    } else if (isMuted) {
      isMuted = false;
      storage.set(STORAGE_KEYS.MUTED, 'false');
    }

    cancelActiveFade();
    audio.volume = newVol;

    if (isPlaying) {
      setState(isMuted ? 'muted' : 'playing');
    }

    updateVolumeUI();
  }

  function toggleMute() {
    if (!isMuted) {
      // Mute
      preMuteVolume = targetVolume > 0 ? targetVolume : DEFAULT_VOLUME;
      isMuted = true;
      storage.set(STORAGE_KEYS.MUTED, 'true');

      fadeVolume(audio.volume, 0, 250, () => {
        setState('muted');
        updateVolumeUI();
      });

      if (typeof window.showToast === 'function') {
        window.showToast('Ambient Soundtrack Muted');
      }
    } else {
      // Unmute
      isMuted = false;
      storage.set(STORAGE_KEYS.MUTED, 'false');
      const restoreVol = preMuteVolume > 0 ? preMuteVolume : DEFAULT_VOLUME;
      targetVolume = restoreVol;

      if (!isPlaying) {
        play(true);
      } else {
        fadeVolume(audio.volume, restoreVol, 350, () => {
          setState('playing');
          updateVolumeUI();
        });
      }

      if (typeof window.showToast === 'function') {
        window.showToast('Ambient Soundtrack Unmuted');
      }
    }
  }

  // -------------------------------------------------------------
  // 4. AUTOPLAY ARRIVAL ORCHESTRATION & FIRST-GESTURE LISTENER
  // -------------------------------------------------------------
  let gestureListenerAttached = false;
  // Valid user activation events according to W3C specification
  const GESTURE_EVENTS = ['pointerdown', 'mousedown', 'keydown', 'touchstart', 'touchend', 'click'];

  function setupFirstGestureListener() {
    if (gestureListenerAttached) return;
    gestureListenerAttached = true;

    function handleFirstGesture(e) {
      // Don't auto-start if the user explicitly paused during this session
      if (explicitDisabled) {
        removeGestureListener();
        return;
      }

      // If user clicked directly on audio controls, let button handler manage it
      if (dom.dock && dom.dock.contains(e.target)) return;

      // Ensure audio is unmuted and attempt play
      audio.muted = false;
      isMuted = false;
      storage.set(STORAGE_KEYS.MUTED, 'false');

      const goalVol = targetVolume > 0 ? targetVolume : DEFAULT_VOLUME;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            removeGestureListener();
            isPlaying = true;
            setState('playing');
            fadeVolume(audio.volume, goalVol, 1000);
          })
          .catch((err) => {
            // Keep listener active if event wasn't recognized as sufficient activation
          });
      }
    }

    function removeGestureListener() {
      GESTURE_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, handleFirstGesture, { passive: true, capture: true });
        document.removeEventListener(evt, handleFirstGesture, { passive: true, capture: true });
      });
      gestureListenerAttached = false;
    }

    GESTURE_EVENTS.forEach((evt) => {
      window.addEventListener(evt, handleFirstGesture, { passive: true, capture: true });
      document.addEventListener(evt, handleFirstGesture, { passive: true, capture: true });
    });
  }

  function attemptInitialAutoplay() {
    // Reset session disabled state on arrival / refresh
    explicitDisabled = false;
    setState('attempting');

    // Proactively attach gesture listener so any click immediately starts audio
    setupFirstGestureListener();

    // Attempt direct audible playback
    audio.muted = false;
    isMuted = false;
    const goalVol = targetVolume > 0 ? targetVolume : DEFAULT_VOLUME;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaying = true;
          setState('playing');
          fadeVolume(audio.volume, goalVol, 1200);
        })
        .catch((err) => {
          // Autoplay policy prevented immediate playback without user gesture
          setState('blocked');
        });
    }
  }

  // -------------------------------------------------------------
  // 5. SVG ICONS & UI RENDERING
  // -------------------------------------------------------------
  const ICONS = {
    play: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>`,
    pause: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>`,
    volumeHigh: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
    volumeMute: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`,
    blockedSparkle: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
  };

  function setState(state) {
    currentState = state;
    if (!dom.dock) return;

    dom.dock.setAttribute('data-state', state);

    const isPlay = state === 'playing';
    const isBlock = state === 'blocked';
    const isMute = state === 'muted';

    // Update Pill Action Button Icon & Label
    if (dom.actionIcon) {
      if (isPlay) {
        dom.actionIcon.innerHTML = ICONS.pause;
        dom.actionBtn.setAttribute('aria-label', 'Pause Ambient Music');
      } else if (isBlock) {
        dom.actionIcon.innerHTML = ICONS.play;
        dom.actionBtn.setAttribute('aria-label', 'Enable Ambient Music');
      } else if (isMute) {
        dom.actionIcon.innerHTML = ICONS.volumeMute;
        dom.actionBtn.setAttribute('aria-label', 'Unmute Ambient Music');
      } else {
        dom.actionIcon.innerHTML = ICONS.play;
        dom.actionBtn.setAttribute('aria-label', 'Play Ambient Music');
      }
    }

    if (dom.pillLabel) {
      if (isPlay) {
        dom.pillLabel.textContent = 'Velario • Ambient';
        if (dom.pillSubtext) dom.pillSubtext.textContent = `${Math.round(targetVolume * 100)}% Volume`;
      } else if (isBlock) {
        dom.pillLabel.textContent = '✦ Play Ambience';
        if (dom.pillSubtext) dom.pillSubtext.textContent = 'Click anywhere to play';
      } else if (isMute) {
        dom.pillLabel.textContent = 'Ambience Muted';
        if (dom.pillSubtext) dom.pillSubtext.textContent = 'Tap to Unmute';
      } else {
        dom.pillLabel.textContent = 'Ambience Paused';
        if (dom.pillSubtext) dom.pillSubtext.textContent = 'Tap to Resume';
      }
    }

    // Update Popover Buttons
    if (dom.popoverPlayText && dom.popoverPlayIcon) {
      dom.popoverPlayText.textContent = isPlay ? 'Pause' : 'Play';
      dom.popoverPlayIcon.innerHTML = isPlay ? ICONS.pause : ICONS.play;
      dom.popoverPlayBtn.setAttribute('aria-pressed', isPlay ? 'true' : 'false');
    }

    if (dom.popoverMuteText && dom.popoverMuteIcon) {
      dom.popoverMuteText.textContent = isMute ? 'Unmute' : 'Mute';
      dom.popoverMuteIcon.innerHTML = isMute ? ICONS.volumeHigh : ICONS.volumeMute;
      dom.popoverMuteBtn.setAttribute('aria-pressed', isMute ? 'true' : 'false');
    }

    // Synchronize Top Header Audio Button
    syncHeaderButton(state);
  }

  function updateVolumeUI() {
    const pct = Math.round(targetVolume * 100);
    if (dom.slider) {
      dom.slider.value = pct;
      dom.slider.setAttribute('aria-valuenow', pct);
    }
    if (dom.volumeReadout) {
      dom.volumeReadout.textContent = `${pct}%`;
    }
    if (dom.pillSubtext && isPlaying && !isMuted) {
      dom.pillSubtext.textContent = `${pct}% Volume`;
    }
  }

  function syncHeaderButton(state) {
    // Body sound state class for any ambient styling
    document.body.classList.toggle('sound-active', state === 'playing');
  }

  // -------------------------------------------------------------
  // 6. DOM SETUP & EVENT WIRING
  // -------------------------------------------------------------
  function setupDOM() {
    dom.dock = document.getElementById('floating-audio-controller');
    if (!dom.dock) return;

    dom.pill = dom.dock.querySelector('.ambient-audio-pill');
    dom.actionBtn = dom.dock.querySelector('.audio-btn-action');
    dom.actionIcon = dom.dock.querySelector('.audio-action-icon');
    dom.pillLabel = dom.dock.querySelector('.audio-pill-title');
    dom.pillSubtext = dom.dock.querySelector('.audio-pill-subtext');
    dom.popover = dom.dock.querySelector('.ambient-audio-popover');
    dom.expandBtn = dom.dock.querySelector('.audio-expand-btn');
    dom.closeBtn = dom.dock.querySelector('.audio-popover-close');
    dom.popoverPlayBtn = dom.dock.querySelector('#audio-popover-play');
    dom.popoverPlayIcon = dom.dock.querySelector('#audio-popover-play-icon');
    dom.popoverPlayText = dom.dock.querySelector('#audio-popover-play-text');
    dom.popoverMuteBtn = dom.dock.querySelector('#audio-popover-mute');
    dom.popoverMuteIcon = dom.dock.querySelector('#audio-popover-mute-icon');
    dom.popoverMuteText = dom.dock.querySelector('#audio-popover-mute-text');
    dom.slider = dom.dock.querySelector('.ambient-volume-slider');
    dom.volumeReadout = dom.dock.querySelector('.audio-volume-readout');

    // 1. Pill Click: Toggle Playback or Open popover on click
    if (dom.actionBtn) {
      dom.actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    if (dom.pill) {
      dom.pill.addEventListener('click', (e) => {
        // If clicking on expand chevron, toggle popover
        if (dom.expandBtn && (e.target === dom.expandBtn || dom.expandBtn.contains(e.target))) {
          e.stopPropagation();
          togglePopover();
          return;
        }
        // If autoplay blocked, clicking the pill triggers play!
        if (currentState === 'blocked' || currentState === 'paused') {
          play(true);
        } else {
          togglePopover();
        }
      });
    }

    if (dom.expandBtn) {
      dom.expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePopover();
      });
    }

    if (dom.closeBtn) {
      dom.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closePopover();
      });
    }

    // 2. Popover Action Buttons
    if (dom.popoverPlayBtn) {
      dom.popoverPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    if (dom.popoverMuteBtn) {
      dom.popoverMuteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMute();
      });
    }

    // 3. Volume Slider live adjustment
    if (dom.slider) {
      dom.slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        setVolume(val, true);
      });
    }

    // Volume icon click toggles mute
    const volIconBtn = dom.dock.querySelector('.audio-vol-icon-btn');
    if (volIconBtn) {
      volIconBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMute();
      });
    }

    // 4. Close Popover on Outside Click or Escape key
    document.addEventListener('click', (e) => {
      if (dom.dock && !dom.dock.contains(e.target)) {
        closePopover();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.dock && dom.dock.classList.contains('popover-open')) {
        closePopover();
      }
    });



    // Initial UI state setup
    updateVolumeUI();
    setState('attempting');
  }

  function togglePopover() {
    if (!dom.dock) return;
    const isOpen = dom.dock.classList.toggle('popover-open');
    if (dom.expandBtn) {
      dom.expandBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  }

  function closePopover() {
    if (!dom.dock) return;
    dom.dock.classList.remove('popover-open');
    if (dom.expandBtn) {
      dom.expandBtn.setAttribute('aria-expanded', 'false');
    }
  }

  // -------------------------------------------------------------
  // 7. INITIALIZATION
  // -------------------------------------------------------------
  function init() {
    setupDOM();
    // Attempt playback on arrival
    attemptInitialAutoplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // -------------------------------------------------------------
  // 8. PUBLIC API (Exported as window.AmbientAudio)
  // -------------------------------------------------------------
  window.AmbientAudio = {
    play: () => play(true),
    pause: () => pause(true),
    togglePlay: togglePlay,
    setVolume: setVolume,
    toggleMute: toggleMute,
    isPlaying: () => isPlaying,
    isMuted: () => isMuted,
    getVolume: () => targetVolume,
    getState: () => currentState
  };

})();
