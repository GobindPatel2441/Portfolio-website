/**
 * COMMAND MENU HUD — Spotlight-Style Instant Navigation
 * Ported from ex/unlumen-ui-docs-main/registry/primitives/command-menu
 * Pure Vanilla JS, zero dependencies
 */
(function () {
  'use strict';

  const COMMANDS = [
    // Sections
    { label: 'Go to Hero / Intro', section: '#hero', group: 'Navigation', keywords: ['home', 'top', 'intro', 'start'] },
    { label: 'Go to About Me', section: '#about', group: 'Navigation', keywords: ['about', 'bio', 'education', 'university'] },
    { label: 'Go to Projects / Work', section: '#projects', group: 'Navigation', keywords: ['work', 'projects', 'portfolio', 'sentix', 'medical'] },
    { label: 'Go to AI Lab (Interactive)', section: '#ai-terminal', group: 'Navigation', keywords: ['ai', 'lab', 'terminal', 'chat', 'interactive'] },
    { label: 'Go to Skills Matrix', section: '#skills', group: 'Navigation', keywords: ['skills', 'tech', 'matrix', 'bento', 'languages'] },
    { label: 'Go to Timeline & Honors', section: '#experience', group: 'Navigation', keywords: ['timeline', 'experience', 'honors', 'milestones', 'hackathon', 'chakravyuh'] },
    { label: 'Go to Contact', section: '#contact', group: 'Navigation', keywords: ['contact', 'email', 'phone', 'hire', 'message'] },

    // Projects (direct scroll)
    { label: 'Sentix — Emotion AI System', section: '#projects', group: 'Projects', keywords: ['sentix', 'emotion', 'deepface', 'multimodal', 'nllb', 'ollama'] },
    { label: 'Medical AI RAG Assistant', section: '#projects', group: 'Projects', keywords: ['medical', 'rag', 'clinical', 'faiss', 'groq', 'healthcare'] },
    { label: 'Decision Diary — Memory Continuity', section: '#projects', group: 'Projects', keywords: ['decision', 'diary', 'memory', 'continuity', 'chakravyuh', 'react', 'ollama'] },
    { label: 'Student Management System (Java)', section: '#projects', group: 'Projects', keywords: ['java', 'student', 'management', 'oop', 'jdbc'] },
    { label: 'Portfolio Website', section: '#projects', group: 'Projects', keywords: ['portfolio', 'website', 'html', 'css', 'javascript'] },

    // Themes
    { label: '⚜️ Switch to Cinematic Gold', action: () => applyThemeCmd('gold'), group: 'Themes', keywords: ['gold', 'cinematic', 'warm'] },
    { label: '🌑 Switch to Obsidian Noir', action: () => applyThemeCmd('obsidian'), group: 'Themes', keywords: ['obsidian', 'noir', 'dark', 'minimal'] },
    { label: '🌲 Switch to Emerald Horizon', action: () => applyThemeCmd('emerald'), group: 'Themes', keywords: ['emerald', 'green', 'jade', 'horizon'] },
    { label: '⚡ Switch to Celestial Cobalt', action: () => applyThemeCmd('cyber'), group: 'Themes', keywords: ['cobalt', 'blue', 'cyber', 'celestial'] },

    // Actions
    { label: '📄 Download Resume (PDF)', action: () => { const a = document.querySelector('a[download="Gobind_Patel_Resume.pdf"]'); if (a) a.click(); }, group: 'Actions', keywords: ['resume', 'cv', 'download', 'pdf'] },
    { label: '📧 Copy Email Address', action: () => { navigator.clipboard.writeText('gobindpatel2005@gmail.com'); showToast('Email copied to clipboard'); }, group: 'Actions', keywords: ['email', 'copy', 'clipboard'] },
    { label: '🔊 Toggle Audio Ambience', action: () => { if (window.AmbientAudio) window.AmbientAudio.togglePlay(); }, group: 'Actions', keywords: ['audio', 'sound', 'music', 'mute'] },
  ];

  function applyThemeCmd(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
    localStorage.setItem('portfolio-theme', theme);
    const labels = { gold: '⚜️ Cinematic Gold', obsidian: '🌑 Obsidian Noir', emerald: '🌲 Emerald Horizon', cyber: '⚡ Celestial Cobalt' };
    if (typeof showToast === 'function') showToast(labels[theme] + ' Atmosphere');
    if (window.PortfolioAudio) window.PortfolioAudio.playClick();
  }

  function showToast(msg) {
    if (typeof window.showToast === 'function') return window.showToast(msg);
    // Fallback inline toast
    let toast = document.getElementById('cmd-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cmd-toast';
      toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:rgba(20,20,25,0.92);color:#fff;padding:0.6rem 1.4rem;border-radius:8px;font-size:0.85rem;font-family:var(--font-mono);z-index:100000;pointer-events:none;opacity:0;transition:opacity 0.3s;border:1px solid var(--border-glass);backdrop-filter:blur(12px);';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
  }

  // Build DOM
  function buildCommandMenu() {
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'command-menu-overlay';
    overlay.className = 'cmd-overlay';

    // Dialog
    const dialog = document.createElement('div');
    dialog.className = 'cmd-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Command Menu');

    // Search input area
    const inputWrap = document.createElement('div');
    inputWrap.className = 'cmd-input-wrap';

    const searchIcon = document.createElement('span');
    searchIcon.className = 'cmd-search-icon';
    searchIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

    const input = document.createElement('input');
    input.className = 'cmd-input';
    input.type = 'text';
    input.placeholder = 'Search sections, projects, themes…';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');

    const kbdHint = document.createElement('span');
    kbdHint.className = 'cmd-kbd-hint';
    kbdHint.textContent = 'ESC';

    inputWrap.appendChild(searchIcon);
    inputWrap.appendChild(input);
    inputWrap.appendChild(kbdHint);

    // Results list
    const resultsList = document.createElement('div');
    resultsList.className = 'cmd-results';

    dialog.appendChild(inputWrap);
    dialog.appendChild(resultsList);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    return { overlay, dialog, input, resultsList };
  }

  let els = null;
  let isOpen = false;
  let activeIndex = 0;
  let filteredItems = [];

  function open() {
    if (!els) els = buildCommandMenu();
    isOpen = true;
    els.overlay.classList.add('active');
    els.input.value = '';
    renderResults('');
    requestAnimationFrame(() => els.input.focus());
    if (window.PortfolioAudio) window.PortfolioAudio.playBlip();
  }

  function close() {
    if (!els) return;
    isOpen = false;
    els.overlay.classList.remove('active');
    els.input.blur();
  }

  function renderResults(query) {
    if (!els) return;
    const q = query.toLowerCase().trim();

    // Filter
    filteredItems = COMMANDS.filter(cmd => {
      if (!q) return true;
      const haystack = (cmd.label + ' ' + (cmd.keywords || []).join(' ')).toLowerCase();
      return q.split(/\s+/).every(word => haystack.includes(word));
    });

    activeIndex = 0;
    els.resultsList.innerHTML = '';

    if (filteredItems.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'cmd-empty';
      empty.textContent = 'No results found.';
      els.resultsList.appendChild(empty);
      return;
    }

    // Group items
    const groups = {};
    filteredItems.forEach((item, i) => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push({ ...item, _idx: i });
    });

    Object.keys(groups).forEach(groupName => {
      const heading = document.createElement('div');
      heading.className = 'cmd-group-heading';
      heading.textContent = groupName;
      els.resultsList.appendChild(heading);

      groups[groupName].forEach(item => {
        const row = document.createElement('div');
        row.className = 'cmd-item';
        row.dataset.idx = item._idx;
        if (item._idx === activeIndex) row.classList.add('active');
        row.textContent = item.label;
        row.addEventListener('click', () => executeItem(item));
        row.addEventListener('mouseenter', () => {
          activeIndex = item._idx;
          highlightActive();
        });
        els.resultsList.appendChild(row);
      });
    });
  }

  function highlightActive() {
    if (!els) return;
    const items = els.resultsList.querySelectorAll('.cmd-item');
    items.forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.idx) === activeIndex);
    });
    // Scroll into view
    const active = els.resultsList.querySelector('.cmd-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function executeItem(item) {
    close();
    if (item.action) {
      item.action();
    } else if (item.section) {
      const target = document.querySelector(item.section);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    if (window.PortfolioAudio) window.PortfolioAudio.playClick();
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Cmd+K / Ctrl+K to open
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (isOpen) close(); else open();
      return;
    }

    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredItems.length > 0) {
        activeIndex = (activeIndex + 1) % filteredItems.length;
        highlightActive();
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredItems.length > 0) {
        activeIndex = (activeIndex - 1 + filteredItems.length) % filteredItems.length;
        highlightActive();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        executeItem(filteredItems[activeIndex]);
      }
      return;
    }
  });

  // Search input handler
  document.addEventListener('input', (e) => {
    if (els && e.target === els.input) {
      renderResults(e.target.value);
    }
  });

  // Click overlay to close
  document.addEventListener('click', (e) => {
    if (isOpen && els && e.target === els.overlay) {
      close();
    }
  });

  // Expose for navbar trigger
  window.CommandMenu = { open, close, toggle: () => isOpen ? close() : open() };
})();
