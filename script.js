(function () {
  document.documentElement.classList.add('js');

  var revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    var i = 0;
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var index = i++;
        setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) { observer.observe(el); });
})();

// Active-section nav highlight — progressive enhancement, independent of the
// reveal observer above: no IntersectionObserver support means no highlight,
// nothing else breaks.
(function () {
  if (!('IntersectionObserver' in window)) return;

  var navIds = ['expertise', 'approach', 'work', 'contact'];
  var sections = navIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if (!sections.length) return;

  var navLinks = {};
  navIds.forEach(function (id) {
    var link = document.querySelector('.nav-links a[href="#' + id + '"]');
    if (link) navLinks[id] = link;
  });

  var setActive = function (id) {
    Object.keys(navLinks).forEach(function (key) {
      navLinks[key].classList.toggle('active', key === id);
    });
  };

  var lastIntersecting = null;

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        lastIntersecting = entry.target.id;
      }
    });
    if (lastIntersecting) setActive(lastIntersecting);
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(function (section) { sectionObserver.observe(section); });

  // The percentage-band rootMargin above sits higher in the viewport than the
  // short contact section can ever reach at maximum scroll, so it can never
  // win the observer race. Special-case page bottom: force "contact" active
  // there, but only there — everywhere else, the last observer-set value
  // stands untouched.
  if (navLinks.contact) {
    window.addEventListener('scroll', function () {
      var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (atBottom) setActive('contact');
    }, { passive: true });
  }
})();

// Mobile nav disclosure — progressive enhancement; no-op if the toggle
// button is absent.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var header = document.querySelector('header.nav');
  var navLinksEl = document.querySelector('.nav-links');
  if (!toggle || !header) return;

  toggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  if (navLinksEl) {
    navLinksEl.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();

// Theme toggle — progressive enhancement; no-op if the button is absent.
// The stored/system theme is applied by a tiny inline snippet in <head> so
// there is no flash before first paint; this only handles the click.
(function () {
  var toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  var root = document.documentElement;

  toggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();
