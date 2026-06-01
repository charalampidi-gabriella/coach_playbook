// =====================================================
// Rippner Coach Resources - interactivity
// =====================================================

(() => {
  // ----- Mobile menu -----
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    sidebar.addEventListener('click', (e) => {
      if (e.target.matches('a.nav-link')) sidebar.classList.remove('open');
    });
    document.addEventListener('click', (e) => {
      if (
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        e.target !== menuBtn &&
        !menuBtn.contains(e.target)
      ) {
        sidebar.classList.remove('open');
      }
    });
  }

  // ----- Build the ordered page list from the sidebar nav -----
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const PAGES = navLinks
    .map((l) => ({
      id: l.getAttribute('href').slice(1),
      title: l.textContent.trim(),
    }))
    .filter((p) => document.getElementById(p.id));

  const PAGE_BY_ID = new Map(PAGES.map((p) => [p.id, p]));
  const DEFAULT_PAGE = 'home';
  const ALL_SECTIONS = Array.from(document.querySelectorAll('section.section, section.hero'));

  // ----- Active sidebar link -----
  const setActive = (id) => {
    navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  };

  // ----- Build / refresh the prev-next footer on a section -----
  const buildPageNav = (sectionEl, currentId) => {
    let nav = sectionEl.querySelector(':scope > .page-nav');
    if (!nav) {
      nav = document.createElement('div');
      nav.className = 'page-nav';
      sectionEl.appendChild(nav);
    }
    const idx = PAGES.findIndex((p) => p.id === currentId);
    const prev = idx > 0 ? PAGES[idx - 1] : null;
    const next = idx >= 0 && idx < PAGES.length - 1 ? PAGES[idx + 1] : null;
    const prevHtml = prev
      ? `<a href="#${prev.id}" class="page-nav-prev"><div class="page-nav-label">&larr; Previous</div><div class="page-nav-title">${prev.title}</div></a>`
      : `<span class="page-nav-spacer"></span>`;
    const nextHtml = next
      ? `<a href="#${next.id}" class="page-nav-next"><div class="page-nav-label">Next &rarr;</div><div class="page-nav-title">${next.title}</div></a>`
      : `<span class="page-nav-spacer"></span>`;
    nav.innerHTML = prevHtml + nextHtml;
  };

  // ----- Show a single page -----
  const showPage = (rawId) => {
    let id = rawId || DEFAULT_PAGE;
    if (!PAGE_BY_ID.has(id)) id = DEFAULT_PAGE;

    ALL_SECTIONS.forEach((s) => s.classList.toggle('active', s.id === id));
    setActive(id);
    const target = document.getElementById(id);
    if (target) buildPageNav(target, id);
    document.title = id === DEFAULT_PAGE
      ? 'Rippner Coach Resources'
      : `${PAGE_BY_ID.get(id).title} · Rippner Coach Resources`;
    // Scroll top instantly so each "page" feels like a fresh view
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  // Initial render
  showPage(window.location.hash.slice(1));

  // Listen for hash changes (nav-link clicks, manual URL edits, back/forward)
  window.addEventListener('hashchange', () => {
    if (document.body.classList.contains('search-mode')) {
      // Clicking a result while in search mode should leave search and go to that page
      const search = document.getElementById('search');
      if (search) search.value = '';
      exitSearch();
    }
    showPage(window.location.hash.slice(1));
  });

  // ----- Back-to-top button -----
  const toTop = document.querySelector('.to-top');
  if (toTop) {
    const tick = () => toTop.classList.toggle('show', window.scrollY > 600);
    document.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  // ----- Search across pages -----
  const search = document.getElementById('search');
  const searchableSelectors = [
    '.fund-item',
    '.rot-card',
    '.ee-card',
    '.quick-card',
    '.week-card',
    '.plan-card li',
    '.notes-card li',
    '.t-block',
    '.rainy-card',
    '.lvl-card',
    '.station',
    '.spec-item',
    '.day-card',
    '.drill-card',
  ];
  const searchTargets = Array.from(document.querySelectorAll(searchableSelectors.join(',')));
  searchTargets.forEach((el) => {
    el.dataset.searchText = (el.textContent || '').toLowerCase();
  });

  const debounce = (fn, ms) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), ms);
    };
  };

  const exitSearch = () => {
    document.body.classList.remove('search-mode');
    searchTargets.forEach((el) => el.classList.remove('search-hidden'));
    ALL_SECTIONS.forEach((s) => s.classList.remove('search-hidden'));
    document.querySelectorAll('.week-card[data-was-closed]').forEach((d) => {
      d.removeAttribute('open');
      d.removeAttribute('data-was-closed');
    });
  };

  const applyFilter = (q) => {
    q = q.trim().toLowerCase();
    if (!q) {
      exitSearch();
      showPage(window.location.hash.slice(1));
      return;
    }
    document.body.classList.add('search-mode');
    const tokens = q.split(/\s+/).filter(Boolean);

    searchTargets.forEach((el) => {
      const txt = el.dataset.searchText;
      const matches = tokens.every((t) => txt.includes(t));
      el.classList.toggle('search-hidden', !matches);
      if (matches && el.matches('.week-card') && !el.hasAttribute('open')) {
        el.setAttribute('open', '');
        el.setAttribute('data-was-closed', 'true');
      }
    });

    ALL_SECTIONS.forEach((sec) => {
      const txt = sec.textContent.toLowerCase();
      const sectionMatches = tokens.every((t) => txt.includes(t));
      sec.classList.toggle('search-hidden', !sectionMatches);
    });
  };

  // ----- Feature request form -----
  const featureForm = document.getElementById('featureForm');
  const featureText = document.getElementById('featureText');
  const featureStatus = document.getElementById('featureStatus');
  if (featureForm && featureText && featureStatus) {
    featureForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const body = featureText.value.trim();
      featureStatus.classList.remove('fr-error');
      if (!body) {
        featureStatus.textContent = 'Please type a quick description first.';
        featureStatus.classList.add('fr-error');
        featureText.focus();
        return;
      }
      const subject = 'Coach Playbook — feature request';
      const mailto = `mailto:manager@rippnertennis.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      featureStatus.textContent = 'Opening your email…';
      // Clear after a short delay so the next visitor starts fresh
      setTimeout(() => {
        featureText.value = '';
        featureStatus.textContent = 'Thanks! Send the email to submit.';
      }, 400);
    });
  }

  if (search) {
    search.addEventListener('input', debounce((e) => applyFilter(e.target.value), 120));
    document.addEventListener('keydown', (e) => {
      if (
        e.key === '/' &&
        document.activeElement !== search &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        search.focus();
        search.select();
      }
      if (e.key === 'Escape' && document.activeElement === search) {
        search.value = '';
        applyFilter('');
        search.blur();
      }
    });
  }
})();
