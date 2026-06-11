/* =========================================================
   Spotlight-style search (Cmd/Ctrl+K)
   Pure vanilla — no jQuery. Keyboard-first.
   ========================================================= */
(function () {
  'use strict';

  const STATIC_INDEX = [
    // Pages
    { type: 'Page', title: 'Overview', subtitle: 'Home', url: 'index.html', tags: ['home', 'overview', 'start'], icon: 'home' },
    { type: 'Page', title: 'About me', subtitle: 'Background, experience, education', url: 'about.html', tags: ['about', 'bio', 'experience', 'education', 'resume'], icon: 'user' },
    { type: 'Page', title: 'Projects', subtitle: 'Selected work', url: 'projects.html', tags: ['projects', 'portfolio', 'work'], icon: 'folder' },
    { type: 'Page', title: 'Blogs', subtitle: 'Articles & TIL', url: 'blogs.html', tags: ['blog', 'blogs', 'posts', 'til', 'articles'], icon: 'doc' },
    { type: 'Page', title: 'Sitemap', subtitle: 'All pages, in one place', url: 'sitemap.html', tags: ['sitemap', 'index', 'all'], icon: 'doc' },

    // Quick actions
    { type: 'Action', title: 'Email Mahmoud', subtitle: 'mh97.abuhassanm@gmail.com', url: 'mailto:mh97.abuhassanm@gmail.com', tags: ['email', 'contact', 'hire'], icon: 'mail' },
    { type: 'Action', title: 'View Resume (PDF)', subtitle: 'Download CV', url: 'assets/files/Mahmoud-Abuhassan-Resume.pdf', tags: ['resume', 'cv', 'pdf'], icon: 'doc', external: true },
    { type: 'Action', title: 'RSS feed', subtitle: 'Subscribe via RSS reader', url: 'feed.xml', tags: ['rss', 'feed', 'subscribe', 'atom'], icon: 'doc' },

    // Social
    { type: 'Social', title: 'GitHub', subtitle: 'github.com/Valk7am', url: 'https://github.com/Valk7am', tags: ['github', 'code', 'repos'], icon: 'github', external: true },
    { type: 'Social', title: 'LinkedIn', subtitle: 'linkedin.com/in/mahmoud-abu-hassan', url: 'https://www.linkedin.com/in/mahmoud-abu-hassan-06111b235/', tags: ['linkedin', 'professional'], icon: 'linkedin', external: true },
    { type: 'Social', title: 'X (Twitter)', subtitle: '@mh_abuhassan', url: 'https://x.com/mh_abuhassan', tags: ['twitter', 'x'], icon: 'x', external: true },
    { type: 'Social', title: 'YouTube', subtitle: '@mh97-abuhassan', url: 'https://www.youtube.com/@mh97-abuhassan', tags: ['youtube', 'video'], icon: 'youtube', external: true },
    { type: 'Social', title: 'Twitch', subtitle: '7am7od', url: 'https://www.twitch.tv/7am7od', tags: ['twitch', 'stream', 'gaming'], icon: 'twitch', external: true },
    { type: 'Social', title: 'CodePen', subtitle: 'Mahmoud-Abu-Hassan', url: 'https://codepen.io/Mahmoud-Abu-Hassan', tags: ['codepen', 'demos'], icon: 'codepen', external: true },

    // Projects
    { type: 'Project', title: 'Multi-modal AI platform', subtitle: 'Flask · Metronic · Azure · OpenAI', url: 'projects.html#ai-platform', tags: ['ai', 'flask', 'azure', 'openai', 'llama'], icon: 'folder' },
    { type: 'Project', title: 'Not Numbers', subtitle: 'Gaza war storytelling site', url: 'projects.html#not-numbers', tags: ['gsap', 'storytelling', 'gaza', 'wordpress'], icon: 'folder' },
    { type: 'Project', title: 'TJC — Targeting Journalists is a Crime', subtitle: 'tjcproject.org', url: 'https://tjcproject.org', tags: ['journalism', 'wordpress', 'apache'], icon: 'folder', external: true },
    { type: 'Project', title: 'The Forum 16', subtitle: 'forum.aljazeera.net', url: 'https://forum.aljazeera.net', tags: ['forum', 'conference', 'al jazeera'], icon: 'folder', external: true },
    { type: 'Project', title: 'The Forum 15', subtitle: 'Archive', url: 'https://forum.aljazeera.net/forum-15/en/index.html', tags: ['forum', 'archive'], icon: 'folder', external: true },
  ];

  // Dynamic posts can be added by request.js
  window.__searchIndex = STATIC_INDEX.slice();
  window.spotlightAddItems = function (items) {
    if (!Array.isArray(items)) return;
    window.__searchIndex = window.__searchIndex.concat(items);
  };

  const ICONS = {
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"/></svg>',
    user: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8Z"/></svg>',
    folder: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M216,72H130.66L102.94,51.2A16,16,0,0,0,93.34,48H40A16,16,0,0,0,24,64V208a8,8,0,0,0,8,8H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72Z"/></svg>',
    doc: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM152,40l48,48H152Z"/></svg>',
    mail: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM128,134.13,52.7,64H203.3Z"/></svg>',
    github: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>',
    linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 448 512" aria-hidden="true"><path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z"/></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48z"/></svg>',
    youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 576 512" aria-hidden="true"><path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/></svg>',
    twitch: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true"><path d="M391.2 103.5H352.5v109.7h38.6zM285 103H246.4V212.8H285zM120.8 0 24.3 91.4V420.6H140.1V512l96.5-91.4h77.3L487.7 256V0zM449.1 237.8l-77.2 73.1H294.6l-67.6 64v-64H140.1V36.6H449.1z"/></svg>',
    codepen: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true"><path d="M502.3 159.7l-234-156c-8-4.9-16.5-5-24.6 0l-234 156C3.7 163.7 0 170.8 0 178v156c0 7.1 3.7 14.3 9.7 18.3l234 156c8 4.9 16.5 5 24.6 0l234-156c6-4 9.7-11.1 9.7-18.3V178c0-7.1-3.7-14.3-9.7-18.3z"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>'
  };

  function icon(name) {
    return ICONS[name] || ICONS.doc;
  }

  // Lightweight fuzzy/substring matcher with scoring
  function score(item, query) {
    if (!query) return 1;
    const q = query.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);
    const hay = (
      item.title + ' ' +
      (item.subtitle || '') + ' ' +
      (item.tags || []).join(' ') + ' ' +
      (item.type || '')
    ).toLowerCase();

    let s = 0;
    for (const t of tokens) {
      const idx = hay.indexOf(t);
      if (idx === -1) {
        // subsequence fallback
        let j = 0;
        for (let i = 0; i < hay.length && j < t.length; i++) {
          if (hay[i] === t[j]) j++;
        }
        if (j !== t.length) return 0;
        s += 1;
      } else {
        s += 5;
        if (item.title.toLowerCase().indexOf(t) !== -1) s += 6;
        if (item.title.toLowerCase().startsWith(t)) s += 4;
      }
    }
    return s;
  }

  function highlight(text, query) {
    if (!query) return escapeHTML(text);
    const q = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let out = escapeHTML(text);
    for (const t of q) {
      const re = new RegExp('(' + escapeReg(t) + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    }
    return out;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }
  function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Build DOM
  function buildModal() {
    if (document.getElementById('spotlight')) return;
    const overlay = document.createElement('div');
    overlay.id = 'spotlight';
    overlay.className = 'spotlight';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'spotlight-label');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="spotlight-panel" role="document">' +
        '<div class="spotlight-input-wrap">' +
          icon('search') +
          '<label id="spotlight-label" class="visually-hidden" for="spotlight-input" style="position:absolute;left:-9999px">Search the site</label>' +
          '<input id="spotlight-input" class="spotlight-input" type="search" autocomplete="off" spellcheck="false" placeholder="Search pages, projects, blogs…" aria-controls="spotlight-list" aria-autocomplete="list" />' +
          '<button type="button" class="spotlight-esc" data-spotlight-close aria-label="Close search">Esc</button>' +
        '</div>' +
        '<ul id="spotlight-list" class="spotlight-results" role="listbox" aria-label="Search results"></ul>' +
        '<div class="spotlight-footer">' +
          '<span><kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>↵</kbd> open <kbd>Esc</kbd> close</span>' +
          '<span>Spotlight</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector('[data-spotlight-close]').addEventListener('click', closeModal);

    const input = overlay.querySelector('#spotlight-input');
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', onKey);
  }

  let activeIndex = 0;
  let currentResults = [];

  function render(query) {
    const list = document.getElementById('spotlight-list');
    const idx = window.__searchIndex || [];

    let results;
    if (!query || !query.trim()) {
      // No query: show grouped quick links
      results = idx.slice(0, 12).map((it) => ({ item: it, score: 1 }));
    } else {
      results = idx
        .map((item) => ({ item, score: score(item, query) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    }

    currentResults = results.map((r) => r.item);
    activeIndex = 0;

    if (!results.length) {
      list.innerHTML = '<li class="spotlight-empty">No results for “' + escapeHTML(query) + '”</li>';
      return;
    }

    // Group by type when no query
    let html = '';
    if (!query || !query.trim()) {
      const groups = {};
      results.forEach((r) => {
        const k = r.item.type || 'Other';
        (groups[k] = groups[k] || []).push(r.item);
      });
      const order = ['Page', 'Project', 'Blog', 'Action', 'Social'];
      let i = 0;
      order.forEach((k) => {
        if (!groups[k]) return;
        html += '<li class="spotlight-group-label" role="presentation">' + k + 's</li>';
        groups[k].forEach((item) => {
          html += renderItem(item, i++, query);
        });
      });
      currentResults = order.flatMap((k) => groups[k] || []);
    } else {
      results.forEach((r, i) => {
        html += renderItem(r.item, i, query);
      });
    }

    list.innerHTML = html;
    setActive(0);

    list.querySelectorAll('[data-sr-index]').forEach((el) => {
      el.addEventListener('mouseenter', () => setActive(Number(el.dataset.srIndex)));
      el.addEventListener('click', (e) => {
        e.preventDefault();
        open(currentResults[Number(el.dataset.srIndex)]);
      });
    });
  }

  function renderItem(item, i, query) {
    return (
      '<li role="option" id="sr-' + i + '">' +
        '<a class="spotlight-result" data-sr-index="' + i + '" href="' + escapeHTML(item.url) + '"' +
          (item.external ? ' target="_blank" rel="noopener"' : '') + '>' +
          '<span class="sr-icon" aria-hidden="true">' + icon(item.icon) + '</span>' +
          '<span class="sr-text">' +
            '<span class="sr-title">' + highlight(item.title, query) + '</span>' +
            (item.subtitle ? '<span class="sr-subtitle">' + highlight(item.subtitle, query) + '</span>' : '') +
          '</span>' +
          '<span class="sr-tag">' + escapeHTML(item.type || '') + '</span>' +
        '</a>' +
      '</li>'
    );
  }

  function setActive(i) {
    const list = document.getElementById('spotlight-list');
    if (!list) return;
    const items = list.querySelectorAll('.spotlight-result');
    if (!items.length) return;
    activeIndex = (i + items.length) % items.length;
    items.forEach((el, idx) => {
      el.classList.toggle('is-active', idx === activeIndex);
      if (idx === activeIndex) {
        el.scrollIntoView({ block: 'nearest' });
        document.getElementById('spotlight-input').setAttribute('aria-activedescendant', 'sr-' + idx);
      }
    });
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const item = currentResults[activeIndex];
      if (item) open(item);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }
  }

  function open(item) {
    if (!item) return;
    closeModal();
    if (item.external) {
      window.open(item.url, '_blank', 'noopener');
    } else {
      window.location.href = item.url;
    }
  }

  let prevFocus = null;
  function openModal() {
    buildModal();
    const overlay = document.getElementById('spotlight');
    prevFocus = document.activeElement;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const input = overlay.querySelector('#spotlight-input');
    input.value = '';
    render('');
    setTimeout(() => input.focus(), 30);
  }

  function closeModal() {
    const overlay = document.getElementById('spotlight');
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  }

  // Global keyboard shortcut
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      const open = document.querySelector('#spotlight[aria-hidden="false"]');
      if (open) closeModal(); else openModal();
    }
    if (e.key === '/' && !/^(input|textarea|select)$/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      openModal();
    }
  });

  // Trigger buttons
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-spotlight-open]');
    if (trigger) {
      e.preventDefault();
      openModal();
    }
  });

  // Display the proper modifier key in trigger UI
  document.addEventListener('DOMContentLoaded', () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    document.querySelectorAll('[data-mod-key]').forEach((el) => {
      el.textContent = isMac ? '⌘K' : 'Ctrl+K';
    });
  });
})();
