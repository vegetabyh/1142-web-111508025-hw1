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
    const valid = ['about', 'interests', 'portfolio', 'baking'];
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

  function initBackgroundMusic() {
    const STORAGE_ENABLED_KEY = 'bgm-enabled';
    const STORAGE_TIME_KEY = 'bgm-current-time';

    let toggleBtn = document.querySelector('[data-bgm-toggle]');
    if (!toggleBtn) {
      const topbar = document.querySelector('.main-topbar');
      if (topbar) {
        toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'btn btn--outline bgm-toggle bgm-toggle--topbar';
        toggleBtn.setAttribute('data-bgm-toggle', '');
        topbar.appendChild(toggleBtn);
      }
    }
    if (!toggleBtn) return;

    const audio = document.createElement('audio');
    audio.src = '/audio/kiiikiii.mp3';
    audio.preload = 'auto';
    audio.loop = true;

    const persistedEnabled = sessionStorage.getItem(STORAGE_ENABLED_KEY) === 'true';
    const persistedTime = parseFloat(sessionStorage.getItem(STORAGE_TIME_KEY) || '0');

    const updateLabel = () => {
      const playing = !audio.paused;
      toggleBtn.textContent = (playing ? '⏸' : '▶') + ' 背景音樂 🎵';
      toggleBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    };

    const persistState = () => {
      sessionStorage.setItem(STORAGE_ENABLED_KEY, String(!audio.paused));
      sessionStorage.setItem(STORAGE_TIME_KEY, String(audio.currentTime || 0));
    };

    audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(persistedTime) && persistedTime > 0) {
        audio.currentTime = Math.min(persistedTime, Math.max(audio.duration - 0.25, 0));
      }
    });

    toggleBtn.addEventListener('click', async () => {
      if (audio.paused) {
        try {
          await audio.play();
        } catch (err) {
          return;
        }
      } else {
        audio.pause();
      }
      persistState();
      updateLabel();
    });

    audio.addEventListener('timeupdate', persistState);
    audio.addEventListener('play', updateLabel);
    audio.addEventListener('pause', updateLabel);
    window.addEventListener('beforeunload', persistState);

    if (persistedEnabled) {
      audio.play().catch(() => {
        /* 某些瀏覽器在換頁後仍需要一次互動才允許有聲播放 */
      });
    }
    updateLabel();
  }

  function initLayout() {
    if (!isMobile()) {
      layout.classList.add('main-open');
    } else if (pathToView() !== 'home') {
      /* 手機版子頁需直接顯示主內容，首頁則先顯示左側選單 */
      layout.classList.add('main-open');
    }
    syncNav();
    const scrollMain = document.querySelector('.app-main');
    if (scrollMain) scrollMain.scrollTop = 0;

    const bakingStack = document.getElementById('bakingStack');
    if (bakingStack) {
      bakingStack.addEventListener('click', () => {
        const topCard = bakingStack.querySelector('.bake-card.is-top');
        if (!topCard || topCard.classList.contains('is-moving')) return;
        topCard.classList.add('is-moving');
        window.setTimeout(() => {
          topCard.classList.remove('is-moving');
          topCard.classList.remove('is-top');
          bakingStack.appendChild(topCard);
          const nextTop = bakingStack.querySelector('.bake-card');
          if (nextTop) nextTop.classList.add('is-top');
        }, 420);
      });
    }

    document.querySelectorAll('[data-portfolio-gallery]').forEach((gallery) => {
      const track = gallery.querySelector('[data-gallery-track]');
      const slides = track ? track.querySelectorAll('.portfolio-gallery__slide') : [];
      const prevBtn = gallery.querySelector('[data-gallery-prev]');
      const nextBtn = gallery.querySelector('[data-gallery-next]');
      const dotsRoot = gallery.querySelector('[data-gallery-dots]');
      const viewport = gallery.querySelector('.portfolio-gallery__viewport');
      if (!track || slides.length <= 1 || !prevBtn || !nextBtn || !dotsRoot || !viewport) return;

      dotsRoot.innerHTML = '';
      const dotButtons = [];
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'portfolio-gallery__dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('data-gallery-dot', String(i));
        dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 張');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dotsRoot.appendChild(dot);
        dotButtons.push(dot);
      });

      let index = 0;
      const update = () => {
        track.style.transform = 'translateX(' + -index * 100 + '%)';
        dotButtons.forEach((dot, i) => {
          const on = i === index;
          dot.classList.toggle('is-active', on);
          dot.setAttribute('aria-selected', on ? 'true' : 'false');
        });
      };

      const go = (nextIndex) => {
        index = ((nextIndex % slides.length) + slides.length) % slides.length;
        update();
      };

      prevBtn.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          go(index - 1);
        },
        { passive: false }
      );
      nextBtn.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          go(index + 1);
        },
        { passive: false }
      );

      dotButtons.forEach((dot) => {
        dot.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            const n = parseInt(dot.getAttribute('data-gallery-dot'), 10);
            if (!Number.isNaN(n)) go(n);
          },
          { passive: false }
        );
      });

      let touchStartX = null;
      viewport.addEventListener(
        'touchstart',
        (e) => {
          touchStartX = e.touches[0].clientX;
        },
        { passive: true }
      );
      viewport.addEventListener(
        'touchend',
        (e) => {
          if (touchStartX == null) return;
          const endX = e.changedTouches[0].clientX;
          const dx = endX - touchStartX;
          touchStartX = null;
          if (Math.abs(dx) < 48) return;
          if (dx < 0) go(index + 1);
          else go(index - 1);
        },
        { passive: true }
      );

      update();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      layout.classList.remove('main-open');
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const isHome = link.getAttribute('data-view') === 'home';
      if (!isMobile() || !isHome || pathToView() !== 'home') return;
      e.preventDefault();
      layout.classList.add('main-open');
    });
  });

  window.addEventListener('resize', () => {
    if (!isMobile()) layout.classList.add('main-open');
  });

  document.addEventListener('DOMContentLoaded', initLayout);
  document.addEventListener('DOMContentLoaded', initBackgroundMusic);
})();
