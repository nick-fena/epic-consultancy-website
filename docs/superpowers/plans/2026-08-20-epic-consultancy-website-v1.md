# Epic Consultancy Website V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a credible, bilingual (English/Dutch) one-page static website for Epic Consultancy B.V. — Nick Smans' solo Web3/gaming strategy consultancy — hosted free on GitHub Pages, with restrained ambient motion (aurora glow, scroll reveals, micro-interactions) that respects `prefers-reduced-motion`.
**Architecture:** Two parallel static HTML documents (English at the repo root, Dutch at `/nl/`) share one stylesheet and one small vanilla-JS scroll-reveal script. In-page navigation uses anchor links with native CSS `scroll-behavior: smooth` — no framework, no build step. All motion is progressive enhancement: the page is fully visible and usable with CSS disabled or JS disabled; JS only ever *adds* a reveal state, never hides content by default.
**Tech Stack:** Plain HTML5 + CSS3 (keyframe animations, `IntersectionObserver` via one dependency-free script), Google Fonts (Space Grotesk 400/500/700, Helvetica/Arial fallback), deployed to GitHub Pages from `main` branch root.

---

## File structure

| File | Responsibility |
|---|---|
| `index.html` | English homepage (`lang="en"`), the canonical/default version at the site root |
| `nl/index.html` | Dutch homepage (`lang="nl"`), mirrors `index.html` with translated copy and `../`-prefixed asset paths |
| `style.css` | Single shared stylesheet: design tokens, layout, components, motion (aurora, shimmer, scroll-reveal gating, micro-interactions), responsive and reduced-motion media queries |
| `script.js` | One small dependency-free `IntersectionObserver` script: adds `js` to `<html>`, then reveals `.reveal` elements as they scroll into view (or immediately, under reduced motion) |
| `favicon.svg` | Simplified "hex + center dot" mark (no vertex nodes/spokes) used as the browser-tab icon by both pages |
| `.nojekyll` | Empty marker file so GitHub Pages serves the raw files without running them through Jekyll |
| `assets/nick-smans.jpg` | Existing headshot (already committed) used in the About section — not created or modified by this plan |

**Deployment note:** every asset reference (`style.css`, `script.js`, `favicon.svg`, `assets/nick-smans.jpg`, and the EN⇄NL nav links) uses a **relative path with no leading slash**, because the site is served from the subpath `/epic-consultancy-website/` on `nick-fena.github.io`. A leading `/` would resolve to the domain root and 404. The only *absolute* URLs in the markup are the SEO/`hreflang`/canonical/`og:url` meta values, which must be fully qualified by convention — a different rule from "don't hardcode the host" for navigable assets/links, not a contradiction of it.

**Progressive enhancement contract for motion:** every CSS rule that hides or offsets a `.reveal` element is scoped under the `html.js` ancestor selector (the class JS adds on load). There is no bare `.reveal { opacity: 0 }` rule anywhere in `style.css` — if JS never runs, `.reveal` elements simply render as normal, fully visible, static-positioned elements. Task 1 Step 8 verifies this by grepping for the absence of a bare `.reveal` selector.

---

### Task 1: Shared foundation — favicon, stylesheet, and scroll-reveal script

**Files:**
- Create: `/Users/nick/Claude/projects/epic-consultancy-website/.nojekyll`
- Create: `/Users/nick/Claude/projects/epic-consultancy-website/favicon.svg`
- Create: `/Users/nick/Claude/projects/epic-consultancy-website/style.css`
- Create: `/Users/nick/Claude/projects/epic-consultancy-website/script.js`

- [ ] **Step 1: Create `.nojekyll`**

  Empty file at repo root so GitHub Pages skips Jekyll processing entirely.

  ```bash
  touch /Users/nick/Claude/projects/epic-consultancy-website/.nojekyll
  ```

- [ ] **Step 2: Create `favicon.svg`**

  The simplified variant of the approved "Network hex" logo: hexagon outline in the teal→violet gradient stroke, plus a single white center dot. No vertex nodes, no spokes.

  ```html
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="favicon-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#5eead4"/>
        <stop offset="1" stop-color="#818cf8"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="16" fill="#0a0e1a"/>
    <path d="M48 12 L79 30 L79 66 L48 84 L17 66 L17 30 Z" fill="none" stroke="url(#favicon-gradient)" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="48" cy="48" r="11" fill="#ffffff"/>
  </svg>
  ```

- [ ] **Step 3: Verify `favicon.svg` is well-formed XML**

  ```bash
  python3 -c "import xml.dom.minidom as m; m.parse('/Users/nick/Claude/projects/epic-consultancy-website/favicon.svg'); print('valid')"
  ```

  Expected output: `valid`.

- [ ] **Step 4: Create `style.css`**

  Full shared stylesheet: midnight palette, layout/components, and the motion system (hero aurora, gradient shimmer, scroll-reveal gating, hover micro-interactions, logo pulse, reduced-motion overrides).

  ```css
  :root {
    --bg: #0a0e1a;
    --border: #161d33;
    --border-light: #2a3350;
    --text-muted: #8b93a7;
    --text-label: #5c6478;
    --white: #ffffff;
    --grad-start: #5eead4;
    --grad-end: #818cf8;
    --grad-start-dark: #0d9488;
    --grad-end-dark: #6366f1;
    --radius: 10px;
    --container-width: 1100px;
  }

  *, *::before, *::after { box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    margin: 0;
    background: var(--bg);
    color: var(--text-muted);
    font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  img { max-width: 100%; display: block; }

  a { color: var(--grad-start); text-decoration: none; transition: color 0.2s ease; }
  a:hover { color: var(--grad-end); }

  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--grad-start);
    outline-offset: 3px;
  }

  .container {
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 0 40px;
  }

  .gradient-text {
    background: linear-gradient(90deg, var(--grad-start), var(--grad-end), var(--grad-start));
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: gradient-shimmer 6s ease-in-out infinite;
  }

  @keyframes gradient-shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Nav */
  .nav { border-bottom: 1px solid var(--border); }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    padding: 20px 40px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--white);
    font-weight: 700;
    letter-spacing: 2px;
    font-size: 14px;
  }

  .logo:hover { color: var(--white); }
  .logo-svg { display: block; }

  .logo-node-pulse {
    animation: node-pulse 3s ease-in-out infinite;
    transform-origin: center;
  }

  @keyframes node-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }

  .nav-links { display: flex; gap: 24px; flex-wrap: wrap; }
  .nav-links a { color: var(--text-muted); font-size: 12px; letter-spacing: 0.5px; }
  .nav-links a:hover { color: var(--grad-start); }

  .lang-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    letter-spacing: 1px;
    color: var(--text-muted);
  }

  .lang-toggle a { color: var(--text-muted); }
  .lang-toggle a:hover { color: var(--grad-start); }
  .lang-toggle [aria-current="page"] { color: var(--white); font-weight: 700; }
  .lang-divider { color: var(--border-light); }

  /* Hero */
  .hero {
    position: relative;
    overflow: hidden;
    padding: 70px 40px 60px;
  }

  .hero .container { position: relative; z-index: 1; }

  .aurora {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .aurora-blob {
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.35;
  }

  .aurora-blob--teal {
    background: var(--grad-start);
    top: -120px;
    left: -80px;
    animation: aurora-drift-a 22s ease-in-out infinite alternate;
  }

  .aurora-blob--violet {
    background: var(--grad-end);
    bottom: -160px;
    right: -80px;
    animation: aurora-drift-b 26s ease-in-out infinite alternate;
  }

  @keyframes aurora-drift-a {
    from { transform: translate(0, 0) scale(1); }
    to { transform: translate(60px, 40px) scale(1.15); }
  }

  @keyframes aurora-drift-b {
    from { transform: translate(0, 0) scale(1); }
    to { transform: translate(-50px, -30px) scale(1.1); }
  }

  .eyebrow {
    color: var(--grad-start);
    font-size: 11px;
    letter-spacing: 3px;
    margin-bottom: 14px;
    font-weight: 500;
  }

  .hero-headline {
    color: var(--white);
    font-size: 38px;
    font-weight: 700;
    line-height: 1.15;
    margin: 0 0 18px;
    max-width: 620px;
  }

  .hero-intro {
    font-size: 15px;
    line-height: 1.7;
    max-width: 520px;
    margin: 0;
  }

  /* Section shared */
  .section { padding: 50px 40px; border-top: 1px solid var(--border); }

  .section-label {
    color: var(--text-label);
    font-size: 10px;
    letter-spacing: 3px;
    margin: 0 0 8px;
    font-weight: 500;
  }

  h2.section-label { font-size: 10px; } /* keep label-as-heading sections visually identical to label-as-div sections */

  .section-title {
    color: var(--white);
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 28px;
  }

  /* Scroll-reveal gating — progressive enhancement:
     without html.js (i.e. without JS running), .reveal elements
     have NO opacity/transform rule anywhere and render normally. */
  html.js .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  html.js .reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  html.js .reveal:nth-child(2) { transition-delay: 0.08s; }
  html.js .reveal:nth-child(3) { transition-delay: 0.16s; }
  html.js .reveal:nth-child(4) { transition-delay: 0.24s; }
  html.js .reveal:nth-child(5) { transition-delay: 0.32s; }
  html.js .reveal:nth-child(6) { transition-delay: 0.4s; }

  /* Services grid */
  .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

  .card {
    border: 1px solid var(--border-light);
    border-radius: var(--radius);
    padding: 22px;
    transition: transform 0.25s ease, border-color 0.25s ease;
  }

  .card:hover { transform: translateY(-4px); border-color: var(--grad-start); }

  .card-tag { font-size: 10px; letter-spacing: 2px; margin-bottom: 10px; font-weight: 500; }
  .card-tag--web3 { color: var(--grad-start); }
  .card-tag--community,
  .card-tag--gaming { color: var(--grad-end); }

  .card-title { color: var(--white); font-size: 14px; font-weight: 600; margin: 0 0 8px; }
  .card-desc { font-size: 12px; line-height: 1.6; margin: 0; }

  /* Steps grid */
  .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

  .step-number { color: var(--grad-start); font-size: 22px; font-weight: 700; margin-bottom: 10px; }
  .step-title { color: var(--white); font-size: 14px; font-weight: 600; margin: 0 0 8px; }
  .step-desc { font-size: 12px; line-height: 1.6; margin: 0; }

  /* Differentiators */
  .differentiators-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 20px; }

  .diff-title { color: var(--white); font-size: 15px; font-weight: 600; margin: 0 0 8px; }
  .diff-desc { font-size: 12px; line-height: 1.6; margin: 0; }

  /* About */
  .about-grid { display: grid; grid-template-columns: 200px 1fr; gap: 36px; align-items: start; }

  .about-photo {
    width: 100%;
    border-radius: var(--radius);
    border: 1px solid var(--border-light);
    object-fit: cover;
    aspect-ratio: 1 / 1;
  }

  .about-name { color: var(--white); font-size: 18px; font-weight: 700; margin: 0 0 4px; }
  .about-role { color: var(--text-label); font-size: 11px; letter-spacing: 1px; margin: 0 0 16px; }
  .about-bio { font-size: 13px; line-height: 1.7; margin: 0; max-width: 560px; }

  /* Projects */
  .projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px; }

  .project-card {
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.25s ease, border-color 0.25s ease;
  }

  .project-card:hover { transform: translateY(-4px); border-color: var(--grad-start); }

  .project-name { color: var(--white); font-size: 13px; font-weight: 600; }
  .project-tag { color: var(--text-label); font-size: 10px; letter-spacing: 1px; }

  /* Contact */
  .contact { text-align: center; padding: 70px 40px; }
  .contact-title { color: var(--white); font-size: 26px; font-weight: 700; margin: 0 0 12px; }
  .contact-sub { font-size: 13px; margin: 0 0 26px; }

  .contact-button {
    display: inline-block;
    background: linear-gradient(90deg, var(--grad-start), var(--grad-end));
    color: var(--bg);
    font-weight: 700;
    font-size: 13px;
    padding: 14px 30px;
    border-radius: 8px;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .contact-button:hover { color: var(--bg); opacity: 0.9; transform: translateY(-2px); }

  /* Footer */
  .footer { border-top: 1px solid var(--border); padding: 20px 40px; }
  .footer-copy { color: var(--text-label); font-size: 11px; text-align: center; margin: 0; }

  /* Responsive */
  @media (max-width: 900px) {
    .steps-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .services-grid { grid-template-columns: 1fr; }
    .differentiators-grid { grid-template-columns: 1fr; }
    .about-grid { grid-template-columns: 1fr; }
    .about-photo { width: 160px; }
    .hero-headline { font-size: 30px; }
  }

  @media (max-width: 640px) {
    .nav-inner { padding: 16px 20px; }
    .hero { padding: 50px 20px 40px; }
    .section { padding: 36px 20px; }
    .contact { padding: 50px 20px; }
    .footer { padding: 16px 20px; }
    .projects-grid { grid-template-columns: 1fr; }
    .steps-grid { grid-template-columns: 1fr; }
    .hero-headline { font-size: 26px; }
  }

  /* Motion: ambient and restrained, never carnival — and fully off on request */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    .aurora-blob { animation: none !important; opacity: 0.15; }
    .gradient-text { animation: none !important; background-position: 0% 50%; }
    .logo-node-pulse { animation: none !important; }
    html.js .reveal { opacity: 1 !important; transform: none !important; }
    .card:hover,
    .project-card:hover,
    .contact-button:hover { transform: none !important; }
  }
  ```

  Write this exact content to `/Users/nick/Claude/projects/epic-consultancy-website/style.css`.

- [ ] **Step 5: Create `script.js`**

  One small dependency-free script. It only ever *adds* the reveal state — if it fails to load or `IntersectionObserver` is unsupported, every `.reveal` element is marked visible immediately rather than staying hidden.

  ```javascript
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
  ```

  Write this exact content to `/Users/nick/Claude/projects/epic-consultancy-website/script.js`. It will be loaded with `<script defer src="script.js"></script>` (and `../script.js` from `/nl/`) in Tasks 2–3.

- [ ] **Step 6: Verify `style.css` has every selector the pages will depend on**

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  for sel in ".gradient-text" ".nav-inner" ".lang-toggle" ".hero-headline" ".aurora-blob--teal" ".aurora-blob--violet" "@keyframes aurora-drift-a" "@keyframes gradient-shimmer" ".logo-node-pulse" "html.js .reveal" ".services-grid" ".card-tag--web3" ".steps-grid" ".differentiators-grid" ".about-grid" ".about-photo" ".projects-grid" ".project-card" ".contact-button" ".footer-copy" "@media (max-width: 768px)" "@media (max-width: 640px)" "@media (prefers-reduced-motion: reduce)"; do
    grep -qF "$sel" style.css || echo "MISSING: $sel"
  done
  echo "check complete"
  ```

  Expected output: only `check complete`.

- [ ] **Step 7: Verify `script.js` syntax and required behavior**

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  if command -v node >/dev/null 2>&1; then
    node --check script.js && echo "syntax: ok"
  else
    echo "node not available — skipping syntax check, relying on content check below"
  fi
  grep -q "classList.add('js')" script.js && \
  grep -q "IntersectionObserver" script.js && \
  grep -q "prefers-reduced-motion" script.js && \
  grep -q "classList.add('is-visible')" script.js && \
  echo "content check: ok"
  ```

  Expected: `syntax: ok` (or the node-unavailable notice) followed by `content check: ok`. A syntax error or a missing token here means the reveal system will silently never activate — do not proceed until this passes.

- [ ] **Step 8: Verify the reveal system is gated behind `html.js` — never hidden by default**

  This is the progressive-enhancement proof: confirm there is no rule that hides `.reveal` elements outside the `html.js` scope.

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  grep -n "^\.reveal" style.css
  echo "---"
  grep -c "html.js .reveal" style.css
  ```

  Expected: the first command outputs **nothing** (no bare `.reveal` selector exists), and the second outputs a count of `7` or more (the base rule, the `is-visible` rule, and the five `nth-child` delay rules). If the first command prints any line, a bare `.reveal` rule was added by mistake and must be removed or re-scoped under `html.js` before committing.

- [ ] **Step 9: Commit**

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  git add .nojekyll favicon.svg style.css script.js
  git commit -m "$(cat <<'EOF'
  Add shared favicon, stylesheet, and scroll-reveal script

  Midnight palette, Space Grotesk type, responsive grid rules, and the
  motion system (hero aurora, gradient shimmer, scroll reveals gated
  behind html.js, hover micro-interactions) that both language versions
  will share. Reduced-motion media query disables all of it on request.

  Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 2: Build the English homepage (`index.html`)

Revised 2026-08-20 after code review (contrast token, skip link, heading outline, og:url, shorter description, font weight 600, mobile container padding) — the code block below predates those fixes; index.html in the repo is authoritative.

**Files:**
- Create: `/Users/nick/Claude/projects/epic-consultancy-website/index.html`

- [ ] **Step 1: Create `index.html`**

  All nine sections in order: nav, hero, what-i-do, how-i-work, why-epic, about, projects, contact, footer. Copy is written first-person singular throughout (Nick as the subject) per the spec's voice rule — the wireframe's "we" phrasing has been rewritten everywhere, including in section labels ("WHAT WE DO" → "WHAT I DO", "HOW WE WORK" → "HOW I WORK", "PROJECTS WE'VE WORKED WITH" → "PROJECTS I'VE WORKED WITH") and anchor ids (`what-i-do`, `how-i-work` — not `what-we-do`, since a hyphenated `-we-` token would itself trip the voice-check grep in Step 5 below).

  The hero carries the `.aurora` glow markup behind its content; the two colored logo nodes carry `.logo-node-pulse`; every card/step/differentiator/project-card/about-grid/contact element carries `.reveal` for the scroll-in animation; `script.js` is loaded with `defer`.

  ```html
  <!doctype html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Epic Consultancy — Strategic consultancy for Web3 and gaming</title>
  <meta name="description" content="Epic Consultancy helps Web3 and crypto projects sharpen management, operations and product strategy, and brings mobile game design expertise to studios building games players love.">
  <meta property="og:title" content="Epic Consultancy — Strategic consultancy for Web3 and gaming">
  <meta property="og:description" content="Epic Consultancy helps Web3 and crypto projects sharpen management, operations and product strategy, and brings mobile game design expertise to studios building games players love.">
  <meta property="og:type" content="website">
  <link rel="canonical" href="https://nick-fena.github.io/epic-consultancy-website/">
  <link rel="alternate" hreflang="en" href="https://nick-fena.github.io/epic-consultancy-website/">
  <link rel="alternate" hreflang="nl" href="https://nick-fena.github.io/epic-consultancy-website/nl/">
  <link rel="alternate" hreflang="x-default" href="https://nick-fena.github.io/epic-consultancy-website/">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script defer src="script.js"></script>
  </head>
  <body>
  <header class="nav" id="top">
    <div class="nav-inner container">
      <a href="#top" class="logo" aria-label="Epic Consultancy home">
        <svg class="logo-svg" width="32" height="32" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#5eead4"/>
              <stop offset="1" stop-color="#818cf8"/>
            </linearGradient>
          </defs>
          <path d="M48 12 L79 30 L79 66 L48 84 L17 66 L17 30 Z" fill="none" stroke="url(#logo-gradient)" stroke-width="5" stroke-linejoin="round"/>
          <line x1="48" y1="48" x2="48" y2="12" stroke="#2a3350" stroke-width="3"/>
          <line x1="48" y1="48" x2="79" y2="66" stroke="#2a3350" stroke-width="3"/>
          <line x1="48" y1="48" x2="17" y2="66" stroke="#2a3350" stroke-width="3"/>
          <circle cx="48" cy="12" r="7" fill="#5eead4" class="logo-node-pulse"/>
          <circle cx="79" cy="66" r="7" fill="#818cf8" class="logo-node-pulse"/>
          <circle cx="17" cy="66" r="7" fill="#ffffff"/>
          <circle cx="48" cy="48" r="6" fill="#ffffff"/>
        </svg>
        <span>EPIC</span>
      </a>
      <nav class="nav-links" aria-label="Primary">
        <a href="#what-i-do">What I do</a>
        <a href="#how-i-work">How I work</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
      <nav class="lang-toggle" aria-label="Language selector">
        <span aria-current="page">EN</span>
        <span class="lang-divider" aria-hidden="true">|</span>
        <a href="nl/index.html">NL</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="aurora" aria-hidden="true">
        <span class="aurora-blob aurora-blob--teal"></span>
        <span class="aurora-blob aurora-blob--violet"></span>
      </div>
      <div class="container">
        <div class="eyebrow">STRATEGIC CONSULTANCY · WEB3 &amp; GAMING</div>
        <h1 class="hero-headline">Strategy for teams building <span class="gradient-text">what's next.</span></h1>
        <p class="hero-intro">I help Web3 and crypto projects strengthen their management, operations and product strategy — and bring deep mobile game design expertise to studios building games players love.</p>
      </div>
    </section>

    <section id="what-i-do" class="section" aria-labelledby="what-i-do-title">
      <div class="container">
        <p class="section-label">WHAT I DO</p>
        <h2 id="what-i-do-title" class="section-title">Six areas, one goal: teams that ship.</h2>
        <div class="services-grid">
          <div class="card reveal">
            <div class="card-tag card-tag--web3">WEB3</div>
            <h3 class="card-title">Management advisory</h3>
            <p class="card-desc">Leadership structure, decision-making and accountability for fast-moving teams.</p>
          </div>
          <div class="card reveal">
            <div class="card-tag card-tag--web3">WEB3</div>
            <h3 class="card-title">Operations &amp; process</h3>
            <p class="card-desc">Internal processes that hold up under growth — from chaos to cadence.</p>
          </div>
          <div class="card reveal">
            <div class="card-tag card-tag--web3">WEB3</div>
            <h3 class="card-title">Product strategy</h3>
            <p class="card-desc">Roadmaps grounded in what users actually need, not what the market hypes.</p>
          </div>
          <div class="card reveal">
            <div class="card-tag card-tag--community">COMMUNITY</div>
            <h3 class="card-title">Community &amp; ecosystem growth</h3>
            <p class="card-desc">Engaged communities built on substance — sustainable, not mercenary.</p>
          </div>
          <div class="card reveal">
            <div class="card-tag card-tag--gaming">GAMING</div>
            <h3 class="card-title">Mobile game design</h3>
            <p class="card-desc">Core loops, progression and systems design for games with staying power.</p>
          </div>
          <div class="card reveal">
            <div class="card-tag card-tag--gaming">GAMING</div>
            <h3 class="card-title">Engagement &amp; retention</h3>
            <p class="card-desc">Turning first sessions into lasting habits — design that respects the player.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="how-i-work" class="section" aria-labelledby="how-i-work-title">
      <div class="container">
        <p class="section-label">HOW I WORK</p>
        <h2 id="how-i-work-title" class="section-title">Embedded, not parachuted.</h2>
        <div class="steps-grid">
          <div class="step reveal">
            <div class="step-number">01</div>
            <h3 class="step-title">Understand</h3>
            <p class="step-desc">I start inside your team — how you actually work, not how the org chart says you do.</p>
          </div>
          <div class="step reveal">
            <div class="step-number">02</div>
            <h3 class="step-title">Diagnose</h3>
            <p class="step-desc">Honest findings on what's holding you back — process, product or people.</p>
          </div>
          <div class="step reveal">
            <div class="step-number">03</div>
            <h3 class="step-title">Build together</h3>
            <p class="step-desc">I design the fixes with your team, so the changes are yours, not mine.</p>
          </div>
          <div class="step reveal">
            <div class="step-number">04</div>
            <h3 class="step-title">Make it stick</h3>
            <p class="step-desc">I stay until the new way of working survives without me.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="why-epic" class="section" aria-labelledby="why-epic-title">
      <div class="container">
        <h2 id="why-epic-title" class="section-label">WHY EPIC</h2>
        <div class="differentiators-grid">
          <div class="differentiator reveal">
            <h3 class="diff-title">An operator, not an observer</h3>
            <p class="diff-desc">Advice from someone who has run teams and shipped products in these industries.</p>
          </div>
          <div class="differentiator reveal">
            <h3 class="diff-title">Native to Web3 and gaming</h3>
            <p class="diff-desc">No translation layer. I know token communities and player psychology first-hand.</p>
          </div>
          <div class="differentiator reveal">
            <h3 class="diff-title">Built to last</h3>
            <p class="diff-desc">Sustainable scaling over quick wins. I optimise for where you'll be in two years.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="about" class="section" aria-labelledby="about-title">
      <div class="container">
        <p class="section-label">ABOUT</p>
        <h2 id="about-title" class="section-title">A one-person consultancy, by design.</h2>
        <div class="about-grid reveal">
          <img class="about-photo" src="assets/nick-smans.jpg" alt="Nick Smans, founder of Epic Consultancy" width="200" height="200">
          <div class="about-content">
            <p class="about-name">Nick Smans</p>
            <p class="about-role">FOUNDER &amp; SOLE CONSULTANT</p>
            <p class="about-bio">Epic Consultancy is Nick Smans — founder and sole consultant. Every engagement is worked directly with Nick: no juniors, no account managers, no handoffs between calls. That's a deliberate choice, not a limitation. Clients get the same person who did the diagnosis running the delivery, with context that never gets lost in translation.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="projects" class="section" aria-labelledby="projects-title">
      <div class="container">
        <h2 id="projects-title" class="section-label">PROJECTS I'VE WORKED WITH</h2>
        <div class="projects-grid">
          <div class="project-card reveal"><span class="project-name">StarLaunch</span><span class="project-tag">WEB3</span></div>
          <div class="project-card reveal"><span class="project-name">UNKJD Studios</span><span class="project-tag">GAMING</span></div>
          <div class="project-card reveal"><span class="project-name">Hexagon Studios</span><span class="project-tag">GAMING</span></div>
          <div class="project-card reveal"><span class="project-name">Bravo Ready</span><span class="project-tag">GAMING</span></div>
          <div class="project-card reveal"><span class="project-name">Fena Digital</span><span class="project-tag">SOFTWARE</span></div>
        </div>
      </div>
    </section>

    <section id="contact" class="section contact" aria-labelledby="contact-title">
      <div class="container">
        <h2 id="contact-title" class="contact-title reveal">Let's talk.</h2>
        <p class="contact-sub reveal">Working on something that needs sharper strategy? I answer every serious email.</p>
        <a class="contact-button reveal" href="mailto:epicconsultancy@hotmail.com">epicconsultancy@hotmail.com</a>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p class="footer-copy">&copy; 2026 Epic Consultancy B.V.</p>
    </div>
  </footer>
  </body>
  </html>
  ```

  Write this exact content to `/Users/nick/Claude/projects/epic-consultancy-website/index.html`.

- [ ] **Step 2: Verify all required landmark ids are present**

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  for id in top what-i-do how-i-work why-epic about projects contact; do
    grep -q "id=\"$id\"" index.html || echo "MISSING: $id"
  done
  echo "check complete"
  ```

  Expected output: only `check complete`.

- [ ] **Step 3: Verify section content counts and motion wiring**

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  echo "cards: $(grep -c 'class="card reveal"' index.html)"                  # expect 6
  echo "steps: $(grep -c 'class="step reveal"' index.html)"                  # expect 4
  echo "differentiators: $(grep -c 'class="differentiator reveal"' index.html)" # expect 3
  echo "projects: $(grep -c 'class="project-card reveal"' index.html)"       # expect 5
  echo "hreflang: $(grep -c 'hreflang=' index.html)"                         # expect 3
  echo "reveal total: $(grep -o 'class="[^"]*"' index.html | grep -c '\breveal\b')" # expect 22
  echo "aurora blobs: $(grep -c 'class="aurora-blob' index.html)"            # expect 2
  echo "logo pulses: $(grep -c 'class="logo-node-pulse"' index.html)"        # expect 2
  grep -q '<script defer src="script.js"></script>' index.html && echo "script tag: ok"
  ```

  Expected: `cards: 6`, `steps: 4`, `differentiators: 3`, `projects: 5`, `hreflang: 3`, `reveal total: 22`, `aurora blobs: 2`, `logo pulses: 2`, `script tag: ok`. Any other number means a section, a reveal class, or the motion wiring was dropped or duplicated — fix before continuing.

- [ ] **Step 4: Prove the voice-check regex actually catches violations**

  Run it against the wireframe first, which is full of "we" copy that the spec explicitly says must be rewritten — if this returns nothing, the regex itself is broken and Step 5's "empty" result would be meaningless.

  ```bash
  grep -niE '\b(we|our|us|ours)\b' /Users/nick/Claude/projects/epic-consultancy-website/.superpowers/brainstorm/21237-1787213904/content/layout-v2.html | head -5
  ```

  Expected: several matching lines, e.g. lines containing "We start inside your team", "We design the fixes with your team", "We stay until the new way of working survives without us.", "We answer every serious email." This confirms the pattern works.

- [ ] **Step 5: Run the voice-check regex against `index.html`**

  ```bash
  grep -niE '\b(we|our|us|ours)\b' /Users/nick/Claude/projects/epic-consultancy-website/index.html
  ```

  Expected output: **empty** (no matches, no output, exit code 1). If anything matches, rewrite that line to first-person singular or company-as-subject before committing — do not commit with any match present.

- [ ] **Step 6: Commit**

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  git add index.html
  git commit -m "$(cat <<'EOF'
  Add English homepage (index.html)

  Nine sections per the approved wireframe, copy rewritten to
  first-person singular throughout since Epic Consultancy is one
  person. Wires up the hero aurora, gradient shimmer, scroll-reveal
  script, and hover micro-interactions. Voice-check regex confirmed
  empty against this file.

  Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 3: Build the Dutch homepage and verify the full site

**Files:**
- Create: `/Users/nick/Claude/projects/epic-consultancy-website/nl/index.html`

- [ ] **Step 1: Create the `nl` directory**

  ```bash
  mkdir -p /Users/nick/Claude/projects/epic-consultancy-website/nl
  ```

- [ ] **Step 2: Create `nl/index.html`**

  Same structure, ids, and motion wiring as `index.html` (anchors are page-local, so reusing the same ids across the two independent documents is correct). Asset paths and the stylesheet/script/favicon links use `../` since this file lives one directory deeper. Dutch copy is natural business Dutch, first-person singular ("ik"), checked for stray "we/wij/ons/onze" the same way the English copy was checked for "we/our/us/ours" (see Step 5 below) — note the contact heading is "Ik hoor graag van je." rather than a literal translation of "Let's talk." ("Laten we praten"), specifically to avoid the word "we" that literal translation would introduce.

  ```html
  <!doctype html>
  <html lang="nl">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Epic Consultancy — Strategische consultancy voor Web3 en gaming</title>
  <meta name="description" content="Strategische consultancy voor Web3- en cryptoprojecten: management, operations en productstrategie, plus expertise in mobile game design.">
  <meta property="og:title" content="Epic Consultancy — Strategische consultancy voor Web3 en gaming">
  <meta property="og:description" content="Strategische consultancy voor Web3- en cryptoprojecten: management, operations en productstrategie, plus expertise in mobile game design.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://nick-fena.github.io/epic-consultancy-website/nl/">
  <link rel="canonical" href="https://nick-fena.github.io/epic-consultancy-website/nl/">
  <link rel="alternate" hreflang="en" href="https://nick-fena.github.io/epic-consultancy-website/">
  <link rel="alternate" hreflang="nl" href="https://nick-fena.github.io/epic-consultancy-website/nl/">
  <link rel="alternate" hreflang="x-default" href="https://nick-fena.github.io/epic-consultancy-website/">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
  <script defer src="../script.js"></script>
  </head>
  <body>
  <a class="skip-link" href="#main">Direct naar inhoud</a>
  <header class="nav" id="top">
    <div class="nav-inner container">
      <a href="#top" class="logo" aria-label="Epic Consultancy home">
        <svg class="logo-svg" width="32" height="32" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#5eead4"/>
              <stop offset="1" stop-color="#818cf8"/>
            </linearGradient>
          </defs>
          <path d="M48 12 L79 30 L79 66 L48 84 L17 66 L17 30 Z" fill="none" stroke="url(#logo-gradient)" stroke-width="5" stroke-linejoin="round"/>
          <line x1="48" y1="48" x2="48" y2="12" stroke="#2a3350" stroke-width="3"/>
          <line x1="48" y1="48" x2="79" y2="66" stroke="#2a3350" stroke-width="3"/>
          <line x1="48" y1="48" x2="17" y2="66" stroke="#2a3350" stroke-width="3"/>
          <circle cx="48" cy="12" r="7" fill="#5eead4" class="logo-node-pulse"/>
          <circle cx="79" cy="66" r="7" fill="#818cf8" class="logo-node-pulse"/>
          <circle cx="17" cy="66" r="7" fill="#ffffff"/>
          <circle cx="48" cy="48" r="6" fill="#ffffff"/>
        </svg>
        <span>EPIC</span>
      </a>
      <nav class="nav-links" aria-label="Primair">
        <a href="#what-i-do">Wat ik doe</a>
        <a href="#how-i-work">Hoe ik werk</a>
        <a href="#projects">Projecten</a>
        <a href="#contact">Contact</a>
      </nav>
      <nav class="lang-toggle" aria-label="Taalkeuze">
        <a href="../index.html">EN</a>
        <span class="lang-divider" aria-hidden="true">|</span>
        <span aria-current="page">NL</span>
      </nav>
    </div>
  </header>

  <main id="main">
    <section class="hero">
      <div class="aurora" aria-hidden="true">
        <span class="aurora-blob aurora-blob--teal"></span>
        <span class="aurora-blob aurora-blob--violet"></span>
      </div>
      <div class="container">
        <div class="eyebrow">STRATEGISCHE CONSULTANCY · WEB3 &amp; GAMING</div>
        <h1 class="hero-headline">Strategie voor teams die bouwen aan <span class="gradient-text">wat komt.</span></h1>
        <p class="hero-intro">Ik help Web3- en cryptoprojecten hun management, operations en productstrategie te versterken — en breng diepgaande expertise in mobile game design naar studio's die games bouwen waar spelers van houden.</p>
      </div>
    </section>

    <section id="what-i-do" class="section" aria-labelledby="what-i-do-title">
      <div class="container">
        <p class="section-label">WAT IK DOE</p>
        <h2 id="what-i-do-title" class="section-title">Zes gebieden, één doel: teams die shippen.</h2>
        <div class="services-grid">
          <div class="card reveal">
            <div class="card-tag card-tag--web3">WEB3</div>
            <h3 class="card-title">Managementadvies</h3>
            <p class="card-desc">Leiderschapsstructuur, besluitvorming en verantwoordelijkheid voor snel bewegende teams.</p>
          </div>
          <div class="card reveal">
            <div class="card-tag card-tag--web3">WEB3</div>
            <h3 class="card-title">Operations &amp; processen</h3>
            <p class="card-desc">Interne processen die groei aankunnen — van chaos naar ritme.</p>
          </div>
          <div class="card reveal">
            <div class="card-tag card-tag--web3">WEB3</div>
            <h3 class="card-title">Productstrategie</h3>
            <p class="card-desc">Roadmaps gebaseerd op wat gebruikers echt nodig hebben, niet op wat de markt hypet.</p>
          </div>
          <div class="card reveal">
            <div class="card-tag card-tag--community">COMMUNITY</div>
            <h3 class="card-title">Community- en ecosysteemgroei</h3>
            <p class="card-desc">Betrokken community's gebouwd op inhoud — duurzaam in plaats van vluchtig.</p>
          </div>
          <div class="card reveal">
            <div class="card-tag card-tag--gaming">GAMING</div>
            <h3 class="card-title">Mobile game design</h3>
            <p class="card-desc">Core loops, progressie en systemen voor games met blijvende aantrekkingskracht.</p>
          </div>
          <div class="card reveal">
            <div class="card-tag card-tag--gaming">GAMING</div>
            <h3 class="card-title">Engagement &amp; retentie</h3>
            <p class="card-desc">Van eerste sessie tot blijvende gewoonte — design met respect voor de speler.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="how-i-work" class="section" aria-labelledby="how-i-work-title">
      <div class="container">
        <p class="section-label">HOE IK WERK</p>
        <h2 id="how-i-work-title" class="section-title">Ingebed, niet even binnenvallen.</h2>
        <div class="steps-grid">
          <div class="step reveal">
            <div class="step-number">01</div>
            <h3 class="step-title">Begrijpen</h3>
            <p class="step-desc">Ik begin binnen in je team — hoe jullie echt werken, niet hoe het organogram het voorstelt.</p>
          </div>
          <div class="step reveal">
            <div class="step-number">02</div>
            <h3 class="step-title">Diagnosticeren</h3>
            <p class="step-desc">Eerlijke bevindingen over wat je tegenhoudt — proces, product of mensen.</p>
          </div>
          <div class="step reveal">
            <div class="step-number">03</div>
            <h3 class="step-title">Samen bouwen</h3>
            <p class="step-desc">Ik ontwerp de oplossingen samen met je team, zodat de verandering van jullie is, niet van mij.</p>
          </div>
          <div class="step reveal">
            <div class="step-number">04</div>
            <h3 class="step-title">Laten beklijven</h3>
            <p class="step-desc">Ik blijf tot de nieuwe manier van werken standhoudt zonder mij.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="why-epic" class="section" aria-labelledby="why-epic-title">
      <div class="container">
        <p class="section-label">WAAROM EPIC</p>
        <h2 id="why-epic-title" class="section-title">Waarom teams met mij werken.</h2>
        <div class="differentiators-grid">
          <div class="differentiator reveal">
            <h3 class="diff-title">Een operator, geen toeschouwer</h3>
            <p class="diff-desc">Advies van iemand die zelf teams heeft geleid en producten heeft gelanceerd in deze sectoren.</p>
          </div>
          <div class="differentiator reveal">
            <h3 class="diff-title">Thuis in Web3 en gaming</h3>
            <p class="diff-desc">Geen vertaalslag nodig. Ik ken tokencommunity's en spelerspsychologie uit eigen ervaring.</p>
          </div>
          <div class="differentiator reveal">
            <h3 class="diff-title">Gebouwd om te blijven</h3>
            <p class="diff-desc">Duurzame groei boven snelle winst. Ik stuur op waar je over twee jaar wilt staan.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="about" class="section" aria-labelledby="about-title">
      <div class="container">
        <p class="section-label">OVER</p>
        <h2 id="about-title" class="section-title">Een consultancy van één persoon, met opzet.</h2>
        <div class="about-grid reveal">
          <img class="about-photo" src="../assets/nick-smans.jpg" alt="Nick Smans, oprichter van Epic Consultancy" width="200" height="200">
          <div class="about-content">
            <p class="about-name">Nick Smans</p>
            <p class="about-role">OPRICHTER &amp; ENIGE CONSULTANT</p>
            <p class="about-bio">Epic Consultancy is Nick Smans — oprichter en enige consultant. Elke opdracht wordt rechtstreeks door Nick uitgevoerd: geen juniors, geen accountmanagers, geen overdracht tussen gesprekken. Dat is een bewuste keuze, geen beperking. Klanten werken met dezelfde persoon die de diagnose stelt én de uitvoering doet, zonder dat context verloren gaat.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="projects" class="section" aria-labelledby="projects-title">
      <div class="container">
        <p class="section-label">PROJECTEN WAARMEE IK HEB GEWERKT</p>
        <h2 id="projects-title" class="section-title">Een trackrecord in Web3 en gaming.</h2>
        <div class="projects-grid">
          <div class="project-card reveal"><span class="project-name">StarLaunch</span><span class="project-tag">WEB3</span></div>
          <div class="project-card reveal"><span class="project-name">UNKJD Studios</span><span class="project-tag">GAMING</span></div>
          <div class="project-card reveal"><span class="project-name">Hexagon Studios</span><span class="project-tag">GAMING</span></div>
          <div class="project-card reveal"><span class="project-name">Bravo Ready</span><span class="project-tag">GAMING</span></div>
          <div class="project-card reveal"><span class="project-name">Fena Digital</span><span class="project-tag">SOFTWARE</span></div>
        </div>
      </div>
    </section>

    <section id="contact" class="section contact" aria-labelledby="contact-title">
      <div class="container">
        <h2 id="contact-title" class="contact-title reveal">Ik hoor graag van je.</h2>
        <p class="contact-sub reveal">Werk je aan iets dat scherpere strategie nodig heeft? Ik beantwoord elke serieuze e-mail.</p>
        <a class="contact-button reveal" href="mailto:epicconsultancy@hotmail.com">epicconsultancy@hotmail.com</a>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p class="footer-copy">&copy; 2026 Epic Consultancy B.V.</p>
    </div>
  </footer>
  </body>
  </html>
  ```

  Write this exact content to `/Users/nick/Claude/projects/epic-consultancy-website/nl/index.html`.

- [ ] **Step 3: Verify `nl/index.html` uses `../`-prefixed relative asset paths**

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  grep -o '"\.\./[^"]*"' nl/index.html | sort -u
  ```

  Expected output (5 lines, order may vary):
  ```
  "../assets/nick-smans.jpg"
  "../favicon.svg"
  "../index.html"
  "../script.js"
  "../style.css"
  ```

- [ ] **Step 4: Verify landmark ids, section counts, motion wiring, and `lang` attribute**

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  for id in top what-i-do how-i-work why-epic about projects contact; do
    grep -q "id=\"$id\"" nl/index.html || echo "MISSING: $id"
  done
  echo "cards: $(grep -c 'class="card reveal"' nl/index.html)"                  # expect 6
  echo "steps: $(grep -c 'class="step reveal"' nl/index.html)"                  # expect 4
  echo "differentiators: $(grep -c 'class="differentiator reveal"' nl/index.html)" # expect 3
  echo "projects: $(grep -c 'class="project-card reveal"' nl/index.html)"       # expect 5
  echo "reveal total: $(grep -o 'class="[^"]*"' nl/index.html | grep -c '\breveal\b')" # expect 22
  grep -q '<html lang="nl">' nl/index.html && echo "lang: ok"
  grep -q '<script defer src="../script.js"></script>' nl/index.html && echo "script tag: ok"
  ```

  Expected: no `MISSING:` lines, `cards: 6`, `steps: 4`, `differentiators: 3`, `projects: 5`, `reveal total: 22`, `lang: ok`, `script tag: ok`.

- [ ] **Step 5: Check the Dutch copy for stray collaborative pronouns**

  Not the contractually-required check (that's Task 2 Step 5, English only) but the same discipline applied to the Dutch words for "we/our/us": `we`, `wij`, `ons`, `onze`.

  ```bash
  grep -niE '\b(we|wij|ons|onze)\b' /Users/nick/Claude/projects/epic-consultancy-website/nl/index.html
  ```

  Expected output: **empty**. (This is why the contact heading was written as "Ik hoor graag van je." instead of a literal "Laten we praten." — the literal translation would fail this check.)

- [ ] **Step 6: Serve the whole site locally and verify both language versions respond, including motion assets**

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  python3 -m http.server 8000 &
  SERVER_PID=$!
  sleep 1

  echo "EN status: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/)"
  curl -s http://localhost:8000/ | grep -q "Strategy for teams building" && echo "EN content: found"

  echo "NL status: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/nl/)"
  curl -s http://localhost:8000/nl/ | grep -q "Strategie voor teams die bouwen" && echo "NL content: found"

  echo "CSS status: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/style.css)"
  echo "script.js status: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/script.js)"
  echo "favicon status: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/favicon.svg)"
  echo "photo status: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/assets/nick-smans.jpg)"

  curl -s http://localhost:8000/style.css | grep -q "prefers-reduced-motion: reduce" && echo "reduced-motion CSS: found"
  curl -s http://localhost:8000/ | grep -o 'class="[^"]*"' | grep -c '\breveal\b'
  curl -s http://localhost:8000/nl/ | grep -o 'class="[^"]*"' | grep -c '\breveal\b'

  kill $SERVER_PID
  ```

  Expected output:
  ```
  EN status: 200
  EN content: found
  NL status: 200
  NL content: found
  CSS status: 200
  script.js status: 200
  favicon status: 200
  photo status: 200
  reduced-motion CSS: found
  22
  22
  ```

  Any non-200 status, a missing "found"/"reduced-motion CSS" line, or a reveal count other than `22` on either page means a path or a class got dropped — fix before committing.

- [ ] **Step 7: Commit**

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  git add nl/index.html
  git commit -m "$(cat <<'EOF'
  Add Dutch homepage (nl/index.html)

  Mirrors index.html with translated first-person copy, ../-prefixed
  asset paths, and the same motion wiring (aurora, reveals, logo
  pulse). Local http.server check confirms both language versions,
  script.js, and all shared assets return 200, with 22 reveal
  elements found on each page.

  Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 4: Deploy to GitHub Pages

**Files:** none (no new files — this task pushes the existing commits and configures hosting).

- [ ] **Step 1: Create the public GitHub repo and push existing commits**

  The local repo already has commits on `main` and no remote configured.

  ```bash
  cd /Users/nick/Claude/projects/epic-consultancy-website
  gh repo create nick-fena/epic-consultancy-website --public --source . --push
  ```

  Expected: output confirming the repo was created and `main` was pushed (e.g. `✓ Created repository nick-fena/epic-consultancy-website on GitHub` followed by push progress lines).

- [ ] **Step 2: Enable GitHub Pages from the `main` branch root**

  ```bash
  gh api repos/nick-fena/epic-consultancy-website/pages -X POST -f "source[branch]=main" -f "source[path]=/"
  ```

  Expected: a JSON response describing the new Pages site (`"status":"building"` or similar), with `"html_url":"https://nick-fena.github.io/epic-consultancy-website/"`.

  If this errors with something like `422 Pages already enabled for this repository`, Pages already exists (e.g. from a retry) — reconfigure it instead:

  ```bash
  gh api repos/nick-fena/epic-consultancy-website/pages -X PUT -f "source[branch]=main" -f "source[path]=/"
  ```

- [ ] **Step 3: Verify the English homepage is live**

  GitHub Pages can take a minute or two to build after first enabling. Retry on a non-200/404 rather than assuming failure immediately.

  ```bash
  curl -sI https://nick-fena.github.io/epic-consultancy-website/ | head -1
  ```

  Expected: `HTTP/2 200`. If it's `404` on the first try, wait ~30–60 seconds and re-run — first Pages builds are not instant. If it's still failing after several retries over 3–4 minutes, check build status with:

  ```bash
  gh api repos/nick-fena/epic-consultancy-website/pages/builds/latest
  ```

- [ ] **Step 4: Verify the Dutch subpath is live too**

  ```bash
  curl -sI https://nick-fena.github.io/epic-consultancy-website/nl/ | head -1
  ```

  Expected: `HTTP/2 200`.

- [ ] **Step 5: Verify page content and motion assets over the live URL (confirms relative paths resolved correctly under the subpath)**

  ```bash
  curl -s https://nick-fena.github.io/epic-consultancy-website/ | grep -q "Strategy for teams building" && echo "EN live content: found"
  curl -s https://nick-fena.github.io/epic-consultancy-website/nl/ | grep -q "Strategie voor teams die bouwen" && echo "NL live content: found"
  curl -sI https://nick-fena.github.io/epic-consultancy-website/style.css | head -1
  curl -sI https://nick-fena.github.io/epic-consultancy-website/script.js | head -1
  ```

  Expected: `EN live content: found`, `NL live content: found`, and `HTTP/2 200` for both `style.css` and `script.js`. A 404 on either here specifically would indicate a leading-slash path mistake slipped through despite Task 1–3 review — there shouldn't be one, since every reference was written relative, but this is the real end-to-end proof.

  No git commit for this task — nothing in the working tree changes; the deliverable is the live, verified site.
