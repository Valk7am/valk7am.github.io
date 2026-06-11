/* =========================================================
   Site-wide JS (replaces old SPA-style js.js + animation.js)
   ========================================================= */
(function () {
  'use strict';

  // ---------- Dynamic copyright year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Banner dismiss ----------
  const banner = document.querySelector('[data-banner]');
  if (banner) {
    const dismissed = sessionStorage.getItem('banner-dismissed');
    if (dismissed) banner.remove();
    const closeBtn = banner && banner.querySelector('[data-banner-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sessionStorage.setItem('banner-dismissed', '1');
        banner.remove();
      });
    }
  }

  // ---------- Under construction stamp ----------
  document.querySelectorAll('.underConstriction').forEach((el) => {
    if (el.querySelector('.underConstriction-msg')) return;
    const stamp = document.createElement('div');
    stamp.className = 'underConstriction-msg';
    stamp.innerHTML =
      '<span><svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" viewBox="0 0 576 512" aria-hidden="true"><path d="M413.5 237.5c-28.2 4.8-58.2-3.6-80-25.4l-38.1-38.1C280.4 159 272 138.8 272 117.6l0-12.1L192.3 62c-5.3-2.9-8.6-8.6-8.3-14.7s3.9-11.5 9.5-14l47.2-21C259.1 4.2 279 0 299.2 0l18.1 0c36.7 0 72 14 98.7 39.1l44.6 42c24.2 22.8 33.2 55.7 26.6 86L503 183l8-8c9.4-9.4 24.6-9.4 33.9 0l24 24c9.4 9.4 9.4 24.6 0 33.9l-88 88c-9.4 9.4-24.6-9.4-33.9 0l-24-24c-9.4-9.4-9.4-24.6 0-33.9l8-8-17.5-17.5zM27.4 377.1L260.9 182.6c3.5 4.9 7.5 9.6 11.8 14l38.1 38.1c6 6 12.4 11.2 19.2 15.7L134.9 484.6c-14.5 17.4-36 27.4-58.6 27.4C34.1 512 0 477.8 0 435.7c0-22.6 10.1-44.1 27.4-58.6z"/></svg> Under Construction</span>';
    el.appendChild(stamp);
  });

  // ---------- Mobile nav: close on outside click / Esc / link click ----------
  const mobileNav = document.getElementById('navbarViews');
  const mobileToggler = document.querySelector('[data-bs-target="#navbarViews"]');
  if (mobileNav && mobileToggler && window.bootstrap && window.bootstrap.Collapse) {
    const getInstance = () =>
      window.bootstrap.Collapse.getOrCreateInstance(mobileNav, { toggle: false });

    // Close when clicking anywhere outside the header
    document.addEventListener('click', (e) => {
      if (!mobileNav.classList.contains('show')) return;
      const headerEl = mobileNav.closest('header');
      if (headerEl && headerEl.contains(e.target)) return;
      getInstance().hide();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('show')) {
        getInstance().hide();
        mobileToggler.focus();
      }
    });

    // Close after tapping a nav link (so SPA-style in-page anchors collapse too)
    mobileNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        if (mobileNav.classList.contains('show')) getInstance().hide();
      });
    });
  }

  // ---------- Starfield (debounced, respects reduced motion) ----------
  const starsRoot = document.querySelector('.stars');
  if (starsRoot && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let resizeTimer;
    const STAR_COUNT = 200;

    function createStar() {
      const left = Math.random() * window.innerWidth;
      const top = Math.random() * window.innerHeight;
      if (top > 0.8 * window.innerHeight) return;
      const size = Math.random() * 2;
      const dur = 1 + Math.random() * 0.5;
      const alpha = 0.5 + Math.random() * 0.5;
      const star = document.createElement('div');
      star.className = 'star';
      star.style.cssText =
        'left:' + left + 'px;top:' + top + 'px;' +
        'width:' + size + 'px;height:' + size + 'px;' +
        'background:rgba(255,255,255,' + alpha + ');' +
        'animation-duration:' + dur + 's;';
      starsRoot.appendChild(star);
    }

    function loadStars() {
      starsRoot.innerHTML = '';
      for (let i = 0; i < STAR_COUNT; i++) createStar();
    }

    loadStars();
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(loadStars, 200);
    });
  }
})();
