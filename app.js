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

  // ----- Active nav highlight via IntersectionObserver -----
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const linkById = new Map(navLinks.map((l) => [l.getAttribute('href').slice(1), l]));
  const sections = navLinks
    .map((l) => document.getElementById(l.getAttribute('href').slice(1)))
    .filter(Boolean);

  let lastActive = null;
  const setActive = (id) => {
    if (lastActive === id) return;
    lastActive = id;
    navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  };

  if ('IntersectionObserver' in window && sections.length) {
    const visible = new Map();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        });
        if (visible.size) {
          // pick the section whose top is highest (i.e., first visible)
          let best = null;
          let bestTop = Infinity;
          visible.forEach((_, id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const top = el.getBoundingClientRect().top;
            if (top < bestTop && top < 240) {
              bestTop = top;
              best = id;
            }
          });
          if (best) setActive(best);
        }
      },
      { rootMargin: '-80px 0px -55% 0px', threshold: [0, 0.1, 0.3, 0.6] }
    );
    sections.forEach((s) => obs.observe(s));
  }

  // ----- Back-to-top button -----
  const toTop = document.querySelector('.to-top');
  if (toTop) {
    const tick = () => toTop.classList.toggle('show', window.scrollY > 600);
    document.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  // ----- Search: filter cards / weeks / fundamentals by text -----
  const search = document.getElementById('search');
  const searchableSelectors = [
    '.fund-card',
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
  ];
  const searchTargets = Array.from(document.querySelectorAll(searchableSelectors.join(',')));

  // Each target gets a normalized search string built once
  searchTargets.forEach((el) => {
    el.dataset.searchText = (el.textContent || '').toLowerCase();
  });

  // Section visibility: hide a section if all its items are hidden
  const allSections = Array.from(document.querySelectorAll('section.section'));

  const debounce = (fn, ms) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), ms);
    };
  };

  const applyFilter = (q) => {
    q = q.trim().toLowerCase();
    if (!q) {
      // reset
      searchTargets.forEach((el) => el.classList.remove('search-hidden'));
      allSections.forEach((s) => s.classList.remove('search-hidden'));
      // also restore week-card open states if we changed them
      document.querySelectorAll('.week-card[data-was-closed]').forEach((d) => {
        d.removeAttribute('open');
        d.removeAttribute('data-was-closed');
      });
      return;
    }
    const tokens = q.split(/\s+/).filter(Boolean);

    // Per-target match
    searchTargets.forEach((el) => {
      const txt = el.dataset.searchText;
      const matches = tokens.every((t) => txt.includes(t));
      el.classList.toggle('search-hidden', !matches);
      // Auto-open week cards that match
      if (matches && el.matches('.week-card') && !el.hasAttribute('open')) {
        el.setAttribute('open', '');
        el.setAttribute('data-was-closed', 'true');
      }
    });

    // For sections: if section text has nothing matching, hide whole section
    allSections.forEach((sec) => {
      const txt = sec.textContent.toLowerCase();
      const sectionMatches = tokens.every((t) => txt.includes(t));
      sec.classList.toggle('search-hidden', !sectionMatches);
    });
  };

  if (search) {
    search.addEventListener('input', debounce((e) => applyFilter(e.target.value), 120));
    // keyboard shortcut "/"
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

  // ----- Smooth-scroll active feedback (visual nudge) -----
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        // briefly emphasise
        target.style.transition = 'box-shadow 0.6s ease';
        target.style.scrollMarginTop = '80px';
      }
    });
  });
})();
