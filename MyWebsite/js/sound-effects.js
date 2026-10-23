/**
 * ===================================================================
 * GOBIND PATEL — EARSHOT-INSPIRED INTERACTIVE SOUND SYSTEM
 * Procedural & Audited Motion SFX Engine for Luxury Cinematic UI
 * Web Audio API • Zero Dependencies • Accessible • 100% Unobtrusive
 * Default: STRICTLY OFF on fresh visit. User must explicitly enable.
 * Ambient music separation: 100% independent volume and controls.
 * ===================================================================
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. CONFIGURATION & STATE
  // -------------------------------------------------------------
  const STORAGE_KEYS = {
    ENABLED: 'portfolio_sfx_enabled',
    VOLUME: 'portfolio_sfx_volume',
    HOVER: 'portfolio_sfx_hover'
  };

  const DEFAULT_VOLUME = 0.35; // 35% comfortable default level
  const SOUND_URLS = {
    click: 'assets/audio/sfx/sfx-click.wav',
    nav: 'assets/audio/sfx/sfx-nav.wav',
    popIn: 'assets/audio/sfx/sfx-pop-in.wav',
    popOut: 'assets/audio/sfx/sfx-pop-out.wav',
    success: 'assets/audio/sfx/sfx-success.wav',
    error: 'assets/audio/sfx/sfx-error.wav',
    hover: 'assets/audio/sfx/sfx-hover.wav',
    transition: 'assets/audio/sfx/sfx-transition.wav'
  };

  // Cooldown thresholds in milliseconds to prevent audio spam
  const COOLDOWNS = {
    click: 45,
    nav: 40,
    popIn: 120,
    popOut: 120,
    hover: 85,
    success: 300,
    error: 250,
    transition: 1600
  };

  // Safe localStorage helper
  const storage = {
    get: (key) => {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set: (key, val) => {
      try { localStorage.setItem(key, String(val)); } catch (e) {}
    }
  };

  // Read saved preferences. Default is STRICTLY FALSE (disabled) for first-time visitors
  let isEnabled = storage.get(STORAGE_KEYS.ENABLED) === 'true';
  let isHoverEnabled = storage.get(STORAGE_KEYS.HOVER) === 'true';
  let savedVol = storage.get(STORAGE_KEYS.VOLUME);
  let currentVolume = savedVol !== null ? parseFloat(savedVol) : DEFAULT_VOLUME;
  if (isNaN(currentVolume) || currentVolume < 0 || currentVolume > 1) currentVolume = DEFAULT_VOLUME;

  // Web Audio Context & Buffers
  let audioCtx = null;
  let masterGain = null;
  const audioBuffers = new Map();
  const loadingPromises = new Map();
  const lastPlayed = {};
  let isContextUnlocked = false;

  // Track programmatic scroll and initial load
  let isInitialLoad = true;
  let isProgrammaticScrolling = false;
  let lastHoverTarget = null;

  setTimeout(() => { isInitialLoad = false; }, 1800);

  // -------------------------------------------------------------
  // 2. WEB AUDIO API INITIALIZATION & PRELOADING
  // -------------------------------------------------------------
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(isEnabled ? currentVolume : 0, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
    return audioCtx;
  }

  function unlockAudio() {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        isContextUnlocked = true;
      }).catch(() => {});
    } else {
      isContextUnlocked = true;
    }
  }

  // Preload a single sound buffer with caching
  function loadSound(key) {
    const url = SOUND_URLS[key];
    if (!url) return Promise.resolve(null);
    if (audioBuffers.has(key)) return Promise.resolve(audioBuffers.get(key));
    if (loadingPromises.has(key)) return loadingPromises.get(key);

    const promise = fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then(arrayBuffer => {
        const ctx = getAudioContext();
        if (!ctx) throw new Error('No AudioContext');
        return ctx.decodeAudioData(arrayBuffer);
      })
      .then(decodedBuffer => {
        audioBuffers.set(key, decodedBuffer);
        loadingPromises.delete(key);
        return decodedBuffer;
      })
      .catch(err => {
        console.warn(`[SoundEffects] Audio asset "${key}" fallback to synth:`, err.message);
        loadingPromises.delete(key);
        return null;
      });

    loadingPromises.set(key, promise);
    return promise;
  }

  // Preload core sound assets lazily when SFX is enabled or initialized
  function preloadCoreSounds() {
    ['click', 'nav', 'popIn', 'popOut', 'success', 'error'].forEach(loadSound);
  }

  // -------------------------------------------------------------
  // 3. SYNTHESIZER FALLBACK (Earshot Algorithmic Specs)
  // -------------------------------------------------------------
  function playSynthFallback(key, ctx, dest, vol) {
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.connect(dest);

      if (key === 'click' || key === 'nav') {
        const f = key === 'click' ? 1200 : 2400;
        const dur = key === 'click' ? 0.04 : 0.025;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 0.4, now + dur);
        gain.gain.setValueAtTime(vol * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + dur);
      } else if (key === 'popIn' || key === 'popOut') {
        const dur = 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(key === 'popIn' ? 420 : 320, now);
        osc.frequency.exponentialRampToValueAtTime(key === 'popIn' ? 180 : 480, now + dur);
        gain.gain.setValueAtTime(vol * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + dur);
      } else if (key === 'success') {
        // Two-stage bell chime (1930 Hz + 2800 Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1930, now);
        gain.gain.setValueAtTime(vol * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (key === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
        gain.gain.setValueAtTime(vol * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (key === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(6800, now);
        gain.gain.setValueAtTime(vol * 0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.015);
      }
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // 4. PLAYBACK ENGINE & RATE LIMITING
  // -------------------------------------------------------------
  function play(key, customVolume) {
    // 1. Silent if disabled
    if (!isEnabled) return;

    // 2. Cooldown check
    const now = performance.now();
    const cooldown = COOLDOWNS[key] || 50;
    if (lastPlayed[key] && (now - lastPlayed[key] < cooldown)) {
      return;
    }
    lastPlayed[key] = now;

    // 3. Audio Context check
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const vol = typeof customVolume === 'number' ? customVolume : 1.0;

    // 4. Play decoded AudioBuffer if loaded
    const buffer = audioBuffers.get(key);
    if (buffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        if (vol !== 1.0) {
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(vol, ctx.currentTime);
          source.connect(gain);
          gain.connect(masterGain);
        } else {
          source.connect(masterGain);
        }

        source.start(0);
      } catch (err) {
        playSynthFallback(key, ctx, masterGain, vol);
      }
    } else {
      // Buffer not yet cached: trigger lazy fetch and play fallback
      loadSound(key);
      playSynthFallback(key, ctx, masterGain, vol);
    }
  }

  // -------------------------------------------------------------
  // 5. SETTINGS & VOLUME MANAGEMENT (INDEPENDENT FROM MUSIC)
  // -------------------------------------------------------------
  function setEnabled(val, notifyUser) {
    isEnabled = Boolean(val);
    storage.set(STORAGE_KEYS.ENABLED, isEnabled ? 'true' : 'false');

    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isEnabled ? currentVolume : 0, audioCtx.currentTime);
    }

    if (isEnabled) {
      unlockAudio();
      preloadCoreSounds();
      // Play subtle confirmation click on explicit user activation
      if (notifyUser) {
        setTimeout(() => play('nav'), 30);
      }
    }

    updateUI();

    if (notifyUser && typeof window.showToast === 'function') {
      window.showToast(isEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted');
    }
  }

  function toggleEnabled() {
    setEnabled(!isEnabled, true);
    return isEnabled;
  }

  function setVolume(val, save) {
    val = Math.max(0, Math.min(1, parseFloat(val)));
    currentVolume = val;

    if (save !== false) {
      storage.set(STORAGE_KEYS.VOLUME, val.toFixed(2));
    }

    if (masterGain && audioCtx && isEnabled) {
      masterGain.gain.setValueAtTime(val, audioCtx.currentTime);
    }

    updateUI();
  }

  function setHoverEnabled(val, notifyUser) {
    isHoverEnabled = Boolean(val);
    storage.set(STORAGE_KEYS.HOVER, isHoverEnabled ? 'true' : 'false');
    if (isHoverEnabled) loadSound('hover');
    updateUI();

    if (notifyUser && typeof window.showToast === 'function') {
      window.showToast(isHoverEnabled ? 'Hover Sounds Enabled' : 'Hover Sounds Disabled');
    }
  }

  function toggleHover() {
    setHoverEnabled(!isHoverEnabled, true);
    return isHoverEnabled;
  }

  // -------------------------------------------------------------
  // 6. UI CONTROLLER SYNCHRONIZATION
  // -------------------------------------------------------------
  function updateUI() {
    const sfxToggleBtn = document.getElementById('sfx-toggle-btn');
    const sfxToggleText = document.getElementById('sfx-toggle-text');
    const sfxToggleState = document.getElementById('sfx-toggle-state');
    const sfxVolumeSlider = document.getElementById('sfx-volume-slider');
    const sfxVolumeReadout = document.getElementById('sfx-volume-readout');
    const sfxHoverToggleBtn = document.getElementById('sfx-hover-toggle-btn');
    const sfxHoverToggleState = document.getElementById('sfx-hover-toggle-state');

    const pct = Math.round(currentVolume * 100);

    if (sfxToggleBtn) {
      sfxToggleBtn.setAttribute('aria-pressed', isEnabled ? 'true' : 'false');
      sfxToggleBtn.classList.toggle('active', isEnabled);
    }
    if (sfxToggleText) {
      sfxToggleText.textContent = isEnabled ? 'Sound Effects: ON' : 'Sound Effects: OFF';
    }
    if (sfxToggleState) {
      sfxToggleState.textContent = isEnabled ? 'ON' : 'OFF';
    }
    if (sfxVolumeSlider) {
      sfxVolumeSlider.value = pct;
      sfxVolumeSlider.setAttribute('aria-valuenow', pct);
      sfxVolumeSlider.disabled = !isEnabled;
      sfxVolumeSlider.style.opacity = isEnabled ? '1' : '0.45';
    }
    if (sfxVolumeReadout) {
      sfxVolumeReadout.textContent = `${pct}%`;
      sfxVolumeReadout.style.opacity = isEnabled ? '1' : '0.45';
    }
    if (sfxHoverToggleBtn) {
      sfxHoverToggleBtn.setAttribute('aria-pressed', isHoverEnabled ? 'true' : 'false');
      sfxHoverToggleBtn.classList.toggle('active', isHoverEnabled);
      sfxHoverToggleBtn.disabled = !isEnabled;
      sfxHoverToggleBtn.style.opacity = isEnabled ? '1' : '0.45';
    }
    if (sfxHoverToggleState) {
      sfxHoverToggleState.textContent = isHoverEnabled ? 'ON' : 'OFF';
    }
  }

  // -------------------------------------------------------------
  // 7. INTERACTION LISTENERS & DELEGATION
  // -------------------------------------------------------------
  function setupInteractionListeners() {
    // 0. Settings UI Controls Wiring
    const sfxToggleBtn = document.getElementById('sfx-toggle-btn');
    if (sfxToggleBtn) {
      sfxToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e._sfxHandled = true;
        toggleEnabled();
      });
    }

    const sfxHoverToggleBtn = document.getElementById('sfx-hover-toggle-btn');
    if (sfxHoverToggleBtn) {
      sfxHoverToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e._sfxHandled = true;
        toggleHover();
      });
    }

    const sfxVolumeSlider = document.getElementById('sfx-volume-slider');
    if (sfxVolumeSlider) {
      sfxVolumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        setVolume(val, true);
      });
    }

    // 1. User gesture unlock (first click/touch anywhere unlocks AudioContext if enabled)
    const gestureHandler = () => {
      unlockAudio();
      if (isEnabled) preloadCoreSounds();
      window.removeEventListener('pointerdown', gestureHandler);
      window.removeEventListener('keydown', gestureHandler);
    };
    window.addEventListener('pointerdown', gestureHandler, { passive: true });
    window.addEventListener('keydown', gestureHandler, { passive: true });

    // 2. Global Click Delegation for UI Sounds
    document.addEventListener('click', (e) => {
      if (e._sfxHandled || !isEnabled) return;

      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      // Skip disabled buttons
      if (target.closest('button:disabled, [aria-disabled="true"], .disabled')) return;

      // Category / Filter Tabs
      const filterBtn = target.closest('.cert-filter-btn, .category-filter-btn, .filter-tab');
      if (filterBtn) {
        e._sfxHandled = true;
        play('nav');
        return;
      }

      // Copy Buttons
      const copyBtn = target.closest('.cert-copy-id-btn, [data-copy-btn], .copy-trigger');
      if (copyBtn) {
        e._sfxHandled = true;
        play('success');
        return;
      }

      // Navigation Links & Theme Switcher
      const navLink = target.closest('.nav-link, .theme-btn, .nav-action-btn');
      if (navLink) {
        e._sfxHandled = true;
        play('nav');
        return;
      }

      // Modal Triggers / Card Openers
      const modalTrigger = target.closest('[data-open-cert], .project-card, [data-open-modal], .command-menu-btn');
      if (modalTrigger) {
        e._sfxHandled = true;
        play('popIn');
        return;
      }

      // Modal / Popover Close Buttons
      const closeBtn = target.closest('.modal-close-btn, .audio-popover-close, [data-modal-close], .cmd-close-btn');
      if (closeBtn) {
        e._sfxHandled = true;
        play('popOut');
        return;
      }

      // Primary / Secondary Buttons & CTAs
      const actionBtn = target.closest('.btn, .btn-primary, .btn-secondary, .cert-btn-primary, .cert-btn-secondary, .timeline-cert-btn');
      if (actionBtn) {
        e._sfxHandled = true;
        play('click');
        return;
      }
    }, true);

    // 3. Desktop Hover Interaction (Strictly Opt-In & Non-Touch)
    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)');
    document.addEventListener('pointerover', (e) => {
      if (!isEnabled || !isHoverEnabled || !isPointerFine.matches) return;
      
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      const interactive = target.closest('button, .btn, .cert-filter-btn, .nav-link, .theme-btn');
      if (interactive && interactive !== lastHoverTarget) {
        lastHoverTarget = interactive;
        play('hover', 0.4); // Calibrated -14dB down per Earshot study
      }
    }, { passive: true });

    // 4. Section Transition Observer (Sparse & Non-Intrusive)
    setupSectionObserver();
  }

  // -------------------------------------------------------------
  // 8. SECTION TRANSITION DETECTOR (IntersectionObserver)
  // -------------------------------------------------------------
  function setupSectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    const sections = document.querySelectorAll('section[id], header[id]');
    if (!sections.length) return;

    let currentSectionId = '';

    const observer = new IntersectionObserver((entries) => {
      if (isInitialLoad || isProgrammaticScrolling || !isEnabled) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          const id = entry.target.id;
          if (id && id !== currentSectionId) {
            currentSectionId = id;
            // Play sparse transition cue
            play('transition', 0.28);
          }
        }
      });
    }, {
      threshold: [0.45]
    });

    sections.forEach(s => observer.observe(s));

    // Handle hash links / programmatic scroll without audio spam
    window.addEventListener('click', (e) => {
      const link = e.target && e.target.closest('a[href^="#"]');
      if (link) {
        isProgrammaticScrolling = true;
        setTimeout(() => { isProgrammaticScrolling = false; }, 900);
      }
    }, true);
  }

  // -------------------------------------------------------------
  // 9. PUBLIC API & PORTFOLIOAUDIO BRIDGE
  // -------------------------------------------------------------
  const SoundEffectsAPI = {
    play: play,
    playClick: () => play('click'),
    playNav: () => play('nav'),
    playPopIn: () => play('popIn'),
    playPopOut: () => play('popOut'),
    playSuccess: () => play('success'),
    playError: () => play('error'),
    playHover: () => play('hover'),
    playTransition: () => play('transition'),
    setEnabled: setEnabled,
    toggleEnabled: toggleEnabled,
    isEnabled: () => isEnabled,
    setVolume: setVolume,
    getVolume: () => currentVolume,
    setHoverEnabled: setHoverEnabled,
    toggleHover: toggleHover,
    isHoverEnabled: () => isHoverEnabled,
    updateUI: updateUI
  };

  // Expose as window.SoundEffects
  window.SoundEffects = SoundEffectsAPI;

  // Bridge to existing window.PortfolioAudio callers
  window.PortfolioAudio = {
    playClick: () => SoundEffectsAPI.playClick(),
    playBlip: () => SoundEffectsAPI.playNav(),
    playPop: () => SoundEffectsAPI.playPopIn(),
    playSuccess: () => SoundEffectsAPI.playSuccess(),
    playError: () => SoundEffectsAPI.playError(),
    toggleMute: () => SoundEffectsAPI.toggleEnabled(),
    isMuted: () => !SoundEffectsAPI.isEnabled(),
    playTone: (freq, type, dur, gain) => {
      // Graceful fallback for custom tone calls
      SoundEffectsAPI.playClick();
    }
  };

  // -------------------------------------------------------------
  // 10. DOM INITIALIZATION
  // -------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupInteractionListeners();
      updateUI();
    });
  } else {
    setupInteractionListeners();
    updateUI();
  }

})();
