/**
 * ===================================================================
 * GOBIND PATEL — BESPOKE CINEMATIC AMBIENT AUDIO CONTROLLER
 * Track: Velario — Ambient Cinematic (Production Master)
 * Luxury Glassmorphic Ambient Controller • Web Audio & HTML5 Audio
 * Zero Dependencies • Accessible • Mobile Responsive • User-Controlled
 * Default: ALWAYS PAUSED. Plays only upon explicit user action.
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
    VOLUME: 'portfolio_audio_volume'
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

  // Read saved volume preference (default to 6%)
  let savedVolume = storage.get(STORAGE_KEYS.VOLUME);
  let targetVolume = savedVolume !== null ? parseFloat(savedVolume) : DEFAULT_VOLUME;
  if (isNaN(targetVolume) || targetVolume < 0.01 || targetVolume > 1) targetVolume = DEFAULT_VOLUME;

  let isMuted = false;
  let preMuteVolume = targetVolume > 0 ? targetVolume : DEFAULT_VOLUME;

  // Audio state: STRICTLY defaults to paused on every load/refresh
  let currentState = 'paused';
  let isPlaying = false;
  let activeFadeRaf = null;

  // Single shared HTML5 Audio instance
  const audio = new Audio();
  audio.src = AUDIO_SRC;
  audio.loop = true;
  audio.preload = 'metadata';
  audio.autoplay = false;
  audio.volume = targetVolume;

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
  // 3. PLAYBACK ENGINE — USER-CONTROLLED ONLY
  // -------------------------------------------------------------
  function play(userInitiated) {
    isMuted = false;
    audio.muted = false;

    const goalVol = targetVolume > 0 ? targetVolume : DEFAULT_VOLUME;

    // Start with volume 0 and fade smoothly into the goal volume
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          isPlaying = true;
          setState('playing');
          fadeVolume(0, goalVol, 1000);

          if (userInitiated && typeof window.showToast === 'function') {
            window.showToast('Ambient Soundtrack Playing');
          }
        })
        .catch((err) => {
          console.warn('[AmbientAudio] Playback prevented:', err.message);
          isPlaying = false;
          setState('paused');
        });
    }
    return Promise.resolve();
  }

  function pause(userInitiated) {
    cancelActiveFade();
    audio.pause();
    isPlaying = false;
    setState('paused');

    if (userInitiated && typeof window.showToast === 'function') {
      window.showToast('Ambient Soundtrack Paused');
    }
  }

  function togglePlay() {
    if (isPlaying && !audio.paused) {
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
    } else if (isMuted) {
      isMuted = false;
    }

    cancelActiveFade();
    // Only adjust actual audio element volume if currently playing
    audio.volume = newVol;

    if (isPlaying) {
      setState(isMuted ? 'muted' : 'playing');
    } else {
      setState('paused');
    }

    updateVolumeUI();
  }

  function toggleMute() {
    if (!isMuted) {
      // Mute
      preMuteVolume = targetVolume > 0 ? targetVolume : DEFAULT_VOLUME;
      isMuted = true;
      cancelActiveFade();
      audio.muted = true;
      if (isPlaying) {
        audio.volume = 0;
        setState('muted');
      }
      updateVolumeUI();

      if (typeof window.showToast === 'function') {
        window.showToast('Ambient Soundtrack Muted');
      }
    } else {
      // Unmute
      isMuted = false;
      audio.muted = false;
      const restoreVol = preMuteVolume > 0 ? preMuteVolume : DEFAULT_VOLUME;
      targetVolume = restoreVol;
      audio.volume = restoreVol;

      if (isPlaying) {
        setState('playing');
      } else {
        setState('paused');
      }
      updateVolumeUI();

      if (typeof window.showToast === 'function') {
        window.showToast('Ambient Soundtrack Unmuted');
      }
    }
  }

  // -------------------------------------------------------------
  // 4. HTML5 AUDIO EVENT SYNCHRONIZATION
  // -------------------------------------------------------------
  audio.addEventListener('play', () => {
    isPlaying = true;
    setState('playing');
  });

  audio.addEventListener('pause', () => {
    isPlaying = false;
    setState('paused');
  });

  audio.addEventListener('ended', () => {
    if (!audio.loop) {
      isPlaying = false;
      setState('paused');
    }
  });

  audio.addEventListener('error', (err) => {
    console.warn('[AmbientAudio] HTML5 Audio error:', err);
    isPlaying = false;
    setState('paused');
  });

  // -------------------------------------------------------------
  // 5. SVG ICONS & UI RENDERING
  // -------------------------------------------------------------
  const ICONS = {
    play: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>`,
    pause: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>`,
    volumeHigh: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
    volumeMute: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
  };

  function setState(state) {
    currentState = state;
    if (!dom.dock) return;

    dom.dock.setAttribute('data-state', state);

    const isPlay = state === 'playing';
    const isMute = state === 'muted';

    // Update Pill Action Button Icon & Label
    if (dom.actionIcon) {
      if (isPlay) {
        dom.actionIcon.innerHTML = ICONS.pause;
        dom.actionBtn.setAttribute('aria-label', 'Pause Ambient Music');
      } else if (isMute) {
        dom.actionIcon.innerHTML = ICONS.volumeMute;
        dom.actionBtn.setAttribute('aria-label', 'Unmute Ambient Music');
      } else {
        // Paused state: ALWAYS show PLAY icon
        dom.actionIcon.innerHTML = ICONS.play;
        dom.actionBtn.setAttribute('aria-label', 'Play Ambient Music');
      }
    }

    if (dom.pillLabel) {
      dom.pillLabel.textContent = 'Velario • Ambient';
    }

    if (dom.pillSubtext) {
      const pct = Math.round(targetVolume * 100);
      if (isMute) {
        dom.pillSubtext.textContent = 'Muted';
      } else {
        dom.pillSubtext.textContent = `${pct}% Volume`;
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

    // Synchronize body active sound state class
    document.body.classList.toggle('sound-active', isPlay);
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
    if (dom.pillSubtext && !isMuted) {
      dom.pillSubtext.textContent = `${pct}% Volume`;
    }
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
    dom.slider = dom.dock.querySelector('#music-volume-slider') || dom.dock.querySelector('.music-control-card .ambient-volume-slider') || dom.dock.querySelector('.ambient-volume-slider');
    dom.volumeReadout = dom.dock.querySelector('#music-volume-readout') || dom.dock.querySelector('.music-control-card .audio-volume-readout') || dom.dock.querySelector('.audio-volume-readout');

    // 1. Action Button: Play / Pause toggle
    if (dom.actionBtn) {
      dom.actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    // 2. Pill Click: Toggle popover panel (or play if clicking play button)
    if (dom.pill) {
      dom.pill.addEventListener('click', (e) => {
        if (dom.expandBtn && (e.target === dom.expandBtn || dom.expandBtn.contains(e.target))) {
          e.stopPropagation();
          togglePopover();
          return;
        }
        if (dom.actionBtn && (e.target === dom.actionBtn || dom.actionBtn.contains(e.target))) {
          return;
        }
        togglePopover();
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

    // 3. Popover Action Buttons
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

    // 4. Volume Slider live adjustment
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

    // 5. Close Popover on Outside Click or Escape key
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

    // Initial UI state setup: strictly paused
    updateVolumeUI();
    setState('paused');
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
  // 7. INITIALIZATION — ALWAYS STARTS PAUSED
  // -------------------------------------------------------------
  function init() {
    setupDOM();
    setState('paused');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // -------------------------------------------------------------
  // 8. PUBLIC API (Exported as window.AmbientAudio and window.PortfolioAmbientAudio)
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
    getState: () => currentState,
    getAudioElement: () => audio
  };
  window.PortfolioAmbientAudio = window.AmbientAudio;

})();
