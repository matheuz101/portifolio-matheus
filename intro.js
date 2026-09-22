// Independent of the portfolio scripts: an error elsewhere cannot trap the intro.
(() => {
  'use strict';

  const root = document.documentElement;
  let screen;
  let name;
  let main;
  let motion;
  let initialized = false;
  let revealing = false;
  let finished = false;
  let revealTimer;
  let protectedContent = [];

  // Release the page if parsing or initialization is interrupted.
  const bootTimer = window.setTimeout(() => {
    if (!initialized) finish(false);
  }, 10000);

  function finish(moveFocus = true) {
    if (finished) return;
    finished = true;
    revealing = false;
    window.clearTimeout(bootTimer);
    window.clearTimeout(revealTimer);

    const active = document.activeElement;
    const focusIsOnIntro = active === screen || screen?.contains(active) ||
      active === document.body || active === root;

    try {
      if (screen) {
        screen.hidden = true;
        screen.classList.remove('is-revealing');
        screen.removeEventListener('click', reveal);
      }
      name?.removeEventListener('animationend', onAnimationEnd);
      motion?.removeEventListener?.('change', onMotionChange);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('pagehide', onPageHide);
    } finally {
      root.classList.remove('intro-pending', 'intro-revealing');
      protectedContent.forEach(({ element, inert }) => { element.inert = inert; });
    }

    if (moveFocus && focusIsOnIntro && main && !main.inert) {
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      // Keep deep links and the browser's restored scroll position intact.
      main.focus({ preventScroll: true });
    }
  }

  function onAnimationEnd(event) {
    if (revealing && event.target === name && event.animationName === 'intro-name-zoom') finish();
  }

  function onMotionChange(event) {
    if (revealing && event.matches) finish();
  }

  function onPageShow(event) {
    if (event.persisted && revealing) finish(false);
  }

  function onPageHide() {
    if (revealing) finish(false);
  }

  function reveal() {
    if (revealing || finished) return;
    revealing = true;

    try {
      if (motion?.matches) {
        finish();
        return;
      }

      root.classList.add('intro-revealing');
      screen.classList.add('is-revealing');
      // CSS animation events can be lost when switching tabs or stylesheets.
      revealTimer = window.setTimeout(finish, 1500);
    } catch {
      finish(false);
    }
  }

  function initialize() {
    if (finished) return;

    try {
      screen = document.getElementById('intro-screen');
      name = document.getElementById('intro-name');
      main = document.getElementById('main-content');
      const footer = document.querySelector('.site-footer');

      if (!screen || !name || !main || !footer) {
        finish(false);
        return;
      }

      protectedContent = [main, footer].map(element => ({ element, inert: element.inert }));
      protectedContent.forEach(({ element }) => { element.inert = true; });
      motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      motion?.addEventListener?.('change', onMotionChange);
      name.addEventListener('animationend', onAnimationEnd);
      screen.addEventListener('click', reveal);
      window.addEventListener('pageshow', onPageShow);
      window.addEventListener('pagehide', onPageHide);
      screen.hidden = false;
      screen.focus({ preventScroll: true });
      initialized = true;
      window.clearTimeout(bootTimer);
    } catch {
      finish(false);
    }
  }

  try {
    root.classList.add('intro-pending');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
      initialize();
    }
  } catch {
    finish(false);
  }
})();
