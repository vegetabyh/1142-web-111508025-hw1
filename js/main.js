(function () {
  const layout = document.querySelector('.layout');
  if (!layout) return;

  const views = document.querySelectorAll('.view');
  const navLinks = document.querySelectorAll('.sidebar__nav-btn');
  const backBtn = document.getElementById('backBtn');
  const homeCards = document.querySelectorAll('[data-view-trigger]');

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function showView(viewId, options) {
    const forceOpenMain = options && options.forceOpenMain;

    views.forEach((el) => {
      el.classList.toggle('view--active', el.id === 'view-' + viewId);
    });
    navLinks.forEach((link) => {
      const active = link.getAttribute('data-view') === viewId;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    if (viewId && viewId !== 'home') {
      history.replaceState(null, '', '#' + viewId);
    } else {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    if (!isMobile()) {
      layout.classList.add('main-open');
    } else if (forceOpenMain) {
      layout.classList.add('main-open');
    }

    const scrollMain = document.querySelector('.app-main');
    if (scrollMain) scrollMain.scrollTop = 0;
  }

  function openFromHash() {
    const raw = (location.hash || '').replace(/^#/, '');
    const valid = ['home', 'about', 'interests', 'portfolio'];
    const id = valid.includes(raw) ? raw : 'home';
    const deepSection = valid.includes(raw) && raw !== 'home';
    showView(id, { forceOpenMain: !isMobile() || deepSection });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showView(link.getAttribute('data-view'), { forceOpenMain: true });
    });
  });

  homeCards.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showView(el.getAttribute('data-view'), { forceOpenMain: true });
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      layout.classList.remove('main-open');
    });
  }

  window.addEventListener('hashchange', openFromHash);

  window.addEventListener('resize', () => {
    if (!isMobile()) layout.classList.add('main-open');
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (!isMobile()) layout.classList.add('main-open');
    openFromHash();
  });
})();
