(function () {
  const layout = document.querySelector('.layout');
  if (!layout) return;

  const navLinks = document.querySelectorAll('.sidebar__nav-btn');
  const backBtn = document.getElementById('backBtn');

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function pathToView() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';
    const base = last.replace(/\.html$/, '');
    if (base === '' || base === 'index') return 'home';
    const valid = ['about', 'interests', 'portfolio'];
    if (valid.includes(base)) return base;
    return 'home';
  }

  function syncNav() {
    const viewId = pathToView();
    navLinks.forEach((link) => {
      const linkView = link.getAttribute('data-view');
      const active = linkView === viewId;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function initLayout() {
    if (!isMobile()) layout.classList.add('main-open');
    syncNav();
    const scrollMain = document.querySelector('.app-main');
    if (scrollMain) scrollMain.scrollTop = 0;
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      layout.classList.remove('main-open');
    });
  }

  window.addEventListener('resize', () => {
    if (!isMobile()) layout.classList.add('main-open');
  });

  document.addEventListener('DOMContentLoaded', initLayout);
})();
