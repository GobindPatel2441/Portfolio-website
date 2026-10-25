/**
 * ===================================================================
 * GOBIND PATEL — EARSHOT-INSPIRED INTERACTIVE SOUND SYSTEM
 * Procedural & Audited Motion SFX Engine for Luxury Cinematic UI
 * Web Audio API • Zero Dependencies • Accessible • 100% Unobtrusive
 * Defaults for New Visitors: Sound Effects ON, Hover Ticks ON, SFX Volume 65%
 * Persistent via versioned localStorage: 'portfolio-motion-sfx-v1'
 * Ambient music separation: 100% independent volume and controls.
 * ===================================================================
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. CONFIGURATION & VERSIONED PERSISTENCE
  // -------------------------------------------------------------
  const STORAGE_KEY = 'portfolio-motion-sfx-v1';

  const DEFAULT_PREFERENCES = {
    soundEffectsEnabled: true,
    hoverTicksEnabled: true,
    sfxVolume: 0.65
  };

  /**
   * Centralized Preference Loader
   * Distinguishes explicitly between:
   * 1. A new visitor who has never configured settings (returns defaults)
   * 2. A visitor who explicitly switched a setting OFF (restores false, never overrides)
   * 3. A visitor whose localStorage is blocked/corrupted (safe in-memory fallback)
   */
  function loadPreferences() {
    try {
      // Support test reset via URL query/hash without requiring DevTools access
      if (window.location.search.includes('reset-sfx=1') || window.location.hash === '#reset-sfx') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('portfolio_sfx_enabled');
        localStorage.removeItem('portfolio_sfx_hover');
        localStorage.removeItem('portfolio_sfx_volume');
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        // First-time visitor: clean up any legacy keys and return fresh defaults
        try {
          localStorage.removeItem('portfolio_sfx_enabled');
          localStorage.removeItem('portfolio_sfx_hover');
          localStorage.removeItem('portfolio_sfx_volume');
        } catch (e) {}
        return { ...DEFAULT_PREFERENCES };
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return { ...DEFAULT_PREFERENCES };
      }

      const soundEffectsEnabled = typeof parsed.soundEffectsEnabled === 'boolean'
        ? parsed.soundEffectsEnabled
        : DEFAULT_PREFERENCES.soundEffectsEnabled;

      const hoverTicksEnabled = typeof parsed.hoverTicksEnabled === 'boolean'
        ? parsed.hoverTicksEnabled
        : DEFAULT_PREFERENCES.hoverTicksEnabled;

      let sfxVolume = typeof parsed.sfxVolume === 'number' && !isNaN(parsed.sfxVolume)
        ? parsed.sfxVolume
        : DEFAULT_PREFERENCES.sfxVolume;
      sfxVolume = Math.max(0, Math.min(1, sfxVolume));

      return {
        soundEffectsEnabled,
        hoverTicksEnabled,
        sfxVolume
      };
    } catch (e) {
      return { ...DEFAULT_PREFERENCES };
    }
  }

  function savePreferences(prefs) {
    try {
      const payload = {
        soundEffectsEnabled: Boolean(prefs.soundEffectsEnabled),
        hoverTicksEnabled: Boolean(prefs.hoverTicksEnabled),
        sfxVolume: Math.max(0, Math.min(1, parseFloat(prefs.sfxVolume)))
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Graceful fallback if storage quota exceeded or disabled
    }
  }

  // Initialize from storage or default
  const initialPrefs = loadPreferences();
  let isEnabled = initialPrefs.soundEffectsEnabled;
  let isHoverEnabled = initialPrefs.hoverTicksEnabled;
  let currentVolume = initialPrefs.sfxVolume;

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
        // Fallback to synth if file fails to fetch or decode
        loadingPromises.delete(key);
        return null;
      });

    loadingPromises.set(key, promise);
    return promise;
  }

  // Preload core sound assets lazily when SFX is enabled or initialized
  function preloadCoreSounds() {
    ['click', 'nav', 'popIn', 'popOut', 'success', 'error', 'hover'].forEach(loadSound);
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
    // 1. Silent if Sound Effects is globally disabled
    if (!isEnabled) return;

    // 2. Suppress hover sounds if Hover Ticks is disabled
    if (key === 'hover' && !isHoverEnabled) return;

    // 3. Cooldown check
    const now = performance.now();
    const cooldown = COOLDOWNS[key] || 50;
    if (lastPlayed[key] && (now - lastPlayed[key] < cooldown)) {
      return;
    }
    lastPlayed[key] = now;

    // 4. Audio Context check
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const vol = typeof customVolume === 'number' ? customVolume : 1.0;

    // 5. Play decoded AudioBuffer if loaded
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
    savePreferences({
      soundEffectsEnabled: isEnabled,
      hoverTicksEnabled: isHoverEnabled,
      sfxVolume: currentVolume
    });

    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isEnabled ? currentVolume : 0, audioCtx.currentTime);
    }

    if (isEnabled) {
      unlockAudio();
      preloadCoreSounds();
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
      savePreferences({
        soundEffectsEnabled: isEnabled,
        hoverTicksEnabled: isHoverEnabled,
        sfxVolume: currentVolume
      });
    }

    if (masterGain && audioCtx && isEnabled) {
      masterGain.gain.setValueAtTime(val, audioCtx.currentTime);
    }

    updateUI();
  }

  function setHoverEnabled(val, notifyUser) {
    isHoverEnabled = Boolean(val);
    savePreferences({
      soundEffectsEnabled: isEnabled,
      hoverTicksEnabled: isHoverEnabled,
      sfxVolume: currentVolume
    });

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
      sfxHoverToggleBtn.style.opacity = isEnabled ? '1' : '0.55';
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

    // 3. Desktop Hover Interaction (Strictly Non-Touch & Fine-Pointer)
    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)');
    document.addEventListener('pointerover', (e) => {
      if (!isEnabled || !isHoverEnabled || !isPointerFine.matches) return;
      if (e.pointerType === 'touch') return;
      
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      const interactive = target.closest('button, .btn, .cert-filter-btn, .nav-link, .theme-btn');
      if (interactive && interactive !== lastHoverTarget) {
        lastHoverTarget = interactive;
        play('hover', 0.4); // Calibrated subtle volume for hover ticks
      }
    }, { passive: true });

    document.addEventListener('pointerout', (e) => {
      if (lastHoverTarget && (!e.relatedTarget || !lastHoverTarget.contains(e.relatedTarget))) {
        lastHoverTarget = null;
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

  window.SoundEffects = SoundEffectsAPI;

  // Bridge to existing window.PortfolioAudio callers across all components
  window.PortfolioAudio = {
    playClick: () => SoundEffectsAPI.playClick(),
    playBlip: () => SoundEffectsAPI.playNav(),
    playPop: () => SoundEffectsAPI.playPopIn(),
    playSuccess: () => SoundEffectsAPI.playSuccess(),
    playError: () => SoundEffectsAPI.playError(),
    toggleMute: () => SoundEffectsAPI.toggleEnabled(),
    isMuted: () => !SoundEffectsAPI.isEnabled(),
    playTone: () => {
      SoundEffectsAPI.playClick();
    }
  };

  // -------------------------------------------------------------
  // 10. DOM INITIALIZATION
  // -------------------------------------------------------------
  function initSoundSystem() {
    setupInteractionListeners();
    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSoundSystem);
  } else {
    initSoundSystem();
  }

})();
