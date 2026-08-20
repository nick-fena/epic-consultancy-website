# Epic Consultancy Website — V1 Design

**Date:** 2026-08-20
**Status:** Approved by Nick (visual companion session, layout-v2)

## Purpose

Credibility anchor for Epic Consultancy — Nick's own business, separate from FENA
Digital. The site's job is to look sharp and confirm the business is real when
someone googles it. Clients come through network/referrals, so no lead-gen
machinery: no forms, no booking, just an email link.

**Positioning:** strategic consultancy for Web3/crypto projects (management,
operations, product strategy, community growth) plus mobile game design expertise
for game studios.

**Legal name:** Epic Consultancy B.V. (used in footer and anywhere the formal
company name appears; the nav wordmark stays "EPIC").

**Languages:** English and Dutch. English is the default at the site root
(clients in Web3/gaming are international); Dutch mirror lives at `/nl/`.
Nav carries an EN | NL toggle linking between the two versions. Each page sets
the correct `lang` attribute and `hreflang` alternate links. With no build
step, the two pages are maintained as parallel HTML files — acceptable for a
one-pager; shared `style.css`. Nick (native Dutch speaker) reviews the Dutch
copy before launch.

## Decisions

| Decision | Choice |
|---|---|
| Repo | `nick-fena/epic-consultancy-website` — personal account (NOT `fenadigital`) |
| Stack | Plain static HTML + CSS, no framework, no build step |
| Hosting | GitHub Pages, free URL (`nick-fena.github.io/<repo>`); custom domain later |
| Format | Single-page site (long-scroll one-pager) |
| Visual direction | "Midnight" — dark navy-black (`#0a0e1a`), teal→violet gradient accent (`#5eead4` → `#818cf8`), muted gray-blue body text (`#8b93a7`), hairline borders (`#161d33` / `#2a3350`), modern grotesk type |
| Contact | `epicconsultancy@hotmail.com`, styled as gradient button + nav link |
| Logo | "Network hex" mark (Option B from the logo canvas, https://claude.ai/code/artifact/a0fb10e6-a59b-42a3-b011-3f2b61bf42ce): hexagon outline in teal→violet gradient stroke, connected nodes (teal, violet, white) with white center node, spokes in `#2a3350`. Inline SVG in the nav next to the EPIC wordmark; simplified variant (hex + center dot) as favicon; darker gradient stops (`#0d9488`→`#6366f1`) on light backgrounds |
| Repo visibility | **Public** (approved by Nick 2026-08-20; required for free GitHub Pages) |

## Page structure (approved wireframe: layout-v2)

1. **Nav** — "EPIC" wordmark; anchor links: What we do · How we work · Projects · Contact
2. **Hero** — eyebrow label "STRATEGIC CONSULTANCY · WEB3 & GAMING"; headline
   "Strategy for teams building *what's next*." (gradient on last words); intro paragraph
3. **What we do** — six service cards in a 3-column grid (responsive to 1-col):
   - Web3: Management advisory · Operations & process · Product strategy
   - Community: Community & ecosystem growth
   - Gaming: Mobile game design · Engagement & retention
   Each card: category tag, title, 1–2 sentence description
4. **How we work** — four numbered steps: Understand → Diagnose → Build together → Make it stick; tagline "Embedded, not parachuted."
5. **Why Epic** — three differentiators: An operator, not an observer · Native to Web3 and gaming · Built to last
6. **About** — Nick Smans, founder and sole consultant. Photo
   (`assets/nick-smans.jpg`), name, short bio paragraph. Framing: Epic is
   deliberately a one-person consultancy — clients work directly with Nick, no
   juniors, no handoffs. This section must make solo status explicit.
7. **Projects we've worked with** — 2-column card grid with category tags:
   StarLaunch (WEB3), UNKJD Studios (GAMING), Hexagon Studios (GAMING),
   Bravo Ready (GAMING), Fena Digital (SOFTWARE). One-line per-project notes
   can be added later when Nick supplies them.
8. **Contact** — centered band: "Let's talk." + email as gradient button (mailto link)
9. **Footer** — © 2026 Epic Consultancy B.V. · KvK 86603019 (KvK number added
   2026-08-20 at Nick's request; supplied by Nick)

Copy drafted during brainstorming is the working copy; Nick sanity-checks claims
before/after launch. No invented numbers or stats — a stats strip may be added
later only with real figures.

**Copy voice rule (added 2026-08-20):** Epic Consultancy is one person — Nick
Smans. All site copy uses first-person singular ("I", "my") or names the company
as the subject; never "we"/"our"/"the team", and nothing may imply additional
staff. The wireframe drafts predate this rule — rewrite their "we" copy during
implementation.

## Motion & animation (added 2026-08-20)

Nick wants the site to feel alive and contemporary. Principles: ambient and
restrained, never carnival — motion supports the Midnight aesthetic.

- **Hero ambience:** slow-moving teal/violet radial glows ("aurora") behind the
  hero, pure CSS keyframes; subtle animated gradient shimmer on the gradient
  headline words.
- **Scroll reveals:** sections and cards fade-and-rise as they enter the
  viewport. One small vanilla-JS `IntersectionObserver` adds a class; content
  is fully visible without JS (progressive enhancement — no content hidden if
  JS fails).
- **Micro-interactions:** service/project cards lift slightly with a border
  color shift toward teal on hover; nav links and buttons get smooth
  transitions; the nav logo's nodes may pulse gently.
- **Accessibility:** every animation is disabled under
  `prefers-reduced-motion: reduce`. No autoplaying motion that loops
  aggressively; nothing flashes.
- This amends the earlier "minimal or no JS" note: one small dependency-free
  script for scroll reveals is in scope. Still no framework, no build step.

## Implementation notes

- Files: `index.html` (EN), `nl/index.html` (NL), shared `style.css`, minimal or
  no JS (smooth-scroll anchors work in CSS via `scroll-behavior`). Self-contained;
  system font stack or one self-hosted/Google font (grotesk, e.g. Inter or Space
  Grotesk). Asset paths in `nl/index.html` account for the subdirectory.
- Responsive: cards collapse 3→1 and 2→1 columns on mobile; test at 375px width.
- Accessibility: semantic landmarks, sufficient contrast on muted text over dark
  background (check `#8b93a7` on `#0a0e1a` — passes AA for body size), focus styles.
- Deployment: GitHub Pages from `main` branch root, repo created via `gh` CLI.
  Note: GitHub Pages on a free plan requires the repo to be **public** — confirm
  with Nick before creating it public (the site content is public anyway).
- `.superpowers/` is gitignored (brainstorm artifacts).

## V1.1 UX round (added 2026-08-20, all four areas picked by Nick)

Feedback on V1: too narrow, wordmark should read "EPIC CONSULTANCY", and the
site needed to be friendlier. Changes:

1. **Full-width layout** — container 1100→1440px fluid, clamp()-scaled type and
   section padding, larger aurora. Phone values unchanged (clamps floor at V1
   sizes). Wordmark: "EPIC CONSULTANCY" in the nav.
2. **Sticky nav + orientation** — nav sticks on scroll (translucent ink +
   backdrop blur), active section highlighted via a small IntersectionObserver
   extension in script.js (progressive enhancement: no JS → no highlight,
   nothing breaks). Sections get `scroll-margin-top` so anchor jumps clear the
   sticky bar.
3. **Readability & density** — body copy and card text up ~2px across the
   board, card padding up, subtle alternating section tint (`--bg-raised`) on
   how-i-work and projects for visual rhythm.
4. **Clearer CTA** — small gradient "Get in touch" / "Neem contact op" button
   in the nav plus a primary CTA button in the hero (with a ghost secondary
   "See what I do" / "Bekijk wat ik doe"); both target #contact / #what-i-do.
5. **Mobile** — below 768px the nav links collapse behind an accessible
   disclosure button (aria-expanded, in script.js); WITHOUT JS the links stay
   visible wrapped (the hiding is gated on `html.js`, same contract as the
   reveals). Touch targets ≥44px for nav links on mobile.

Voice rule, reveal gating, and reduced-motion coverage all still apply to every
new element.

## V2 "Maximal glow" redesign (added 2026-08-20, direction C picked by Nick)

Nick's V1.1 feedback: typography felt generic, grey text hard to read, first-person
"I" copy throughout felt amateurish, overall look outdated — wants more motion,
more gradients, futuristic. Direction C ("Maximal glow") chosen from three
animated mockups: type stays quiet, the motion IS the identity.

**Tokens v2:**
- Background `#05070f` (deeper), raised `#0a0e1c`, borders `#141b30` / `#232c4a`
- Body text `#c2cadc` (fixes readability; ~10:1 on bg), labels `#8f9ab5` (≥4.5:1)
- Gradient triad: teal `#5eead4` → violet `#818cf8` → magenta `#e879f9`
- Glow: `rgba(129,140,248,0.45)` box-shadows on primary CTAs
- Type: **Sora** 400/600/700 everywhere (replaces Space Grotesk), same scale

**Signature atmosphere (the one bold element — everything else stays disciplined):**
- Hero: drifting conic-gradient orb + violet blob (blurred), faint cyber-grid
  overlay (44px lines, teal at 6% alpha); contact band gets a soft orb + grid too
- Gradient text and primary buttons shimmer continuously (3-stop gradient,
  animated background-position); primary CTAs carry a glow shadow
- Hero eyebrow becomes a magenta-bordered pill badge: "WEB3 × GAMING STRATEGY"
- Cards: gradient border + soft teal glow on hover (background-clip technique)
- Logo node pulse and scroll reveals stay; ALL new motion disabled under
  `prefers-reduced-motion`; progressive-enhancement gating unchanged

**Copy voice v3 (supersedes first-person rule):** company-as-subject or neutral
active voice. Still NEVER "we/our/us" (nothing implies staff) — and now also no
standalone "I/me/my" anywhere EXCEPT the About section, which stays third-person
about Nick anyway ("Epic Consultancy is Nick Smans — founder and sole
consultant…"). Solo status stays explicit in About only. Dutch mirrors: no
"we/wij/ons/onze" and no "ik/mij/mijn". Voice greps extended accordingly.

**Renames (both languages):** nav links → Expertise / Approach / Work / Contact
(NL: Expertise / Aanpak / Werk / Contact); section ids `what-i-do`→`expertise`,
`how-i-work`→`approach`, `projects`→`work` (script.js navIds updated); section
labels → EXPERTISE / APPROACH / WHY EPIC / ABOUT / SELECTED WORK.

**Project cards v2 (requested 2026-08-20):** each of the five project cards gets
the project's logo and a one-line description (EN + NL). Descriptions state what
the project publicly IS — never invented claims about the engagement. Logos are
official brand assets fetched from each project's site/press kit into
`assets/logos/` (light-on-dark variants preferred); where no clean asset can be
verified, a styled text wordmark is the fallback rather than a guessed logo.
Fena Digital's logo comes from the canonical `fena-landingpage` repo.

## V2.1 copy and prominence round (added 2026-08-20, Nick's feedback in Dutch)

1. **Naming rule:** the company is always "Epic Consultancy" in text, never bare
   "Epic" (the uppercase nav wordmark EPIC CONSULTANCY already complies). Section
   label WHY EPIC → WHY EPIC CONSULTANCY, title "Why teams choose Epic
   Consultancy." (NL mirrors). Verified by counting: occurrences of Epic/EPIC
   must equal occurrences of "Epic Consultancy"/"EPIC CONSULTANCY" per file.
2. **No em dashes anywhere** (matches Nick's personal writing rule): every — in
   both HTML files is rewritten using a comma, colon, period or parentheses.
   Verified by grep for — and – (both must be absent from HTML).
3. **Voice: professional with a personal touch,** per the write-like-me style:
   contractions in English, friendly je/jullie in Dutch, direct sentences, no
   corporate filler. Dutch translations reviewed for naturalness (StarLaunch
   description called out as poor and rewritten).
4. **Selected work becomes prominent** (Nick: a super important part of the
   business): the section moves up to directly after Expertise; nav order
   Expertise / Work / Approach / Contact; a short section intro paragraph is
   added; cards grow (logo 36px, larger name and description text, more
   padding) and carry a subtle gradient border at rest (full gradient stays on
   hover). Each project gets a longer 2-sentence description in both languages,
   still strictly factual from the verified research (incl. Hexagon→acquired by
   Bravo Ready, UNKJD→LINEUP Games rebrand); engagement details wait for Nick.

## V2.2 visible motion + theme toggle (added 2026-08-20)

Nick's feedback: animations and gradient effects still not really visible; wants
a day/night toggle (dark stays the current default).

**Motion amplification (all disabled under prefers-reduced-motion):**
- Hero entrance: badge, headline, intro and buttons cascade in on page load via
  pure CSS keyframe animations with staggered delays (no JS dependency; safe
  without JS since CSS-off means static-visible).
- Conic orb rotates continuously (slow linear spin) on top of its drift; aurora
  blobs brighten (opacity ~0.5) and drift faster (14/18s) and further.
- A scanline: a soft teal horizontal beam sweeps down the hero grid on a loop.
- Primary CTAs get a breathing glow (pulsing box-shadow) in addition to shimmer.

**Theme system:**
- `data-theme` attribute on `<html>`; dark is the default. Light palette: bg
  `#f3f5fa`, raised `#e9edf6`, card surface `#ffffff`, borders `#d5dbe8` /
  `#c3cbde`, headings `#0b1020` (via the `--white` token), body `#3b4459`,
  labels `#5d6880`, gradient triad in deeper stops `#0d9488` → `#6366f1` →
  `#c026d3`, nav `rgba(243, 245, 250, 0.88)`, grid/aurora tuned down for light.
- **Project cards stay dark in BOTH themes** (dedicated `--work-surface` token):
  deliberate design and it keeps the white client logos legible everywhere.
- Nav logo's white SVG nodes switch via CSS variable fill so they stay visible
  on light.
- Toggle button in the nav (inline sun/moon SVG, localized aria-label; NL
  "Schakel thema"), JS in script.js: click toggles + persists to localStorage;
  a tiny inline head snippet applies stored theme (else system
  `prefers-color-scheme`) before first paint to avoid theme flash. Without JS
  the site is simply dark.
- All light-theme text pairs must be verified computationally ≥ 4.5:1.

## Out of scope for V1 (future ideas)

- `og:image` (needs a proper 1200×630 branded asset; flagged in code review 2026-08-20 — highest-leverage small addition before actively sharing links)
- Custom domain
- Per-project descriptions / case studies
- Stats strip (needs real numbers)
- Client logos (needs logo files + permission)
- Analytics
