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
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
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

  var navIds = ['what-i-do', 'how-i-work', 'projects', 'contact'];
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
})();

// Mobile nav disclosure — progressive enhancement; no-op if the toggle
// button is absent.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var header = document.querySelector('header.nav');
  if (!toggle || !header) return;

  toggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
})();
