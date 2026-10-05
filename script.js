/* Epic Consultancy, V3 "Prism Night".
   Progressive enhancement only: the page is complete and readable without
   this file. Everything here either adds pointer-driven motion, wires up a
   button that is hidden until html.js is set, or delays an animation that
   would otherwise play out of sight. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function motionAllowed() { return !(reduceQuery && reduceQuery.matches); }

  // Theme toggle. The stored theme is applied by an inline snippet in <head>
  // before first paint; dark is the default, so only "light" is ever set.
  var themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var toLight = root.getAttribute('data-theme') !== 'light';
      if (toLight) {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme');
      }
      try { localStorage.setItem('theme', toLight ? 'light' : 'dark'); } catch (e) {}
    });
  }

  // Mobile menu disclosure. CSS only hides the links behind the button when
  // html.js is set, so without this script the links simply stay visible.
  var nav = document.querySelector('.nav');
  var menuToggle = document.querySelector('.menu-toggle');
  var navLinks = document.getElementById('nav-links');
  if (nav && menuToggle) {
    var setMenu = function (open) {
      nav.classList.toggle('nav-open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    menuToggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('nav-open'));
    });
    if (navLinks) {
      navLinks.addEventListener('click', function (event) {
        if (event.target.closest('a')) setMenu(false);
      });
    }
    nav.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('nav-open')) {
        setMenu(false);
        menuToggle.focus();
      }
    });
  }

  // Pointer-following light in the hero and contact mesh panels. Tracked on
  // the window rather than the panel itself, because the nav floats over the
  // hero and would otherwise read as the pointer leaving it.
  var panels = Array.prototype.slice.call(document.querySelectorAll('.mesh-panel'));
  var pointer = null;
  var meshFrame = 0;

  function updatePanels() {
    meshFrame = 0;
    var live = pointer && motionAllowed();
    panels.forEach(function (panel) {
      var r = panel.getBoundingClientRect();
      var inside = live &&
        pointer.x >= r.left && pointer.x <= r.right &&
        pointer.y >= r.top && pointer.y <= r.bottom;
      if (inside) {
        panel.style.setProperty('--px', (pointer.x - r.left).toFixed(1) + 'px');
        panel.style.setProperty('--py', (pointer.y - r.top).toFixed(1) + 'px');
        panel.tracking = true;
      } else if (panel.tracking) {
        panel.style.removeProperty('--px');
        panel.style.removeProperty('--py');
        panel.tracking = false;
      }
    });
  }

  function scheduleMesh() {
    if (!meshFrame) meshFrame = window.requestAnimationFrame(updatePanels);
  }

  if (panels.length) {
    window.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;
      pointer = { x: event.clientX, y: event.clientY };
      scheduleMesh();
    }, { passive: true });
    // Scrolling moves the panels under a still pointer.
    window.addEventListener('scroll', function () {
      if (pointer) scheduleMesh();
    }, { passive: true });
    // relatedTarget is null when the pointer leaves the window altogether.
    window.addEventListener('pointerout', function (event) {
      if (event.relatedTarget) return;
      pointer = null;
      scheduleMesh();
    });
    window.addEventListener('blur', function () {
      pointer = null;
      scheduleMesh();
    });
  }

  // Card and tile glow: the hover gradient is centred on the pointer.
  Array.prototype.forEach.call(document.querySelectorAll('.tile, .card'), function (el) {
    el.addEventListener('pointermove', function (event) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      el.style.setProperty('--gx', ((event.clientX - r.left) / r.width * 100).toFixed(2) + '%');
      el.style.setProperty('--gy', ((event.clientY - r.top) / r.height * 100).toFixed(2) + '%');
    }, { passive: true });
  });

  // Approach timeline: CSS holds its draw-in animation paused under html.js
  // until it scrolls into view, so the moment is not spent off screen.
  var timeline = document.querySelector('.timeline');
  if (timeline) {
    if (!('IntersectionObserver' in window)) {
      timeline.classList.add('is-in');
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            timeline.classList.add('is-in');
            observer.disconnect();
          }
        });
      }, { threshold: 0.25 });
      observer.observe(timeline);
    }
  }
})();
