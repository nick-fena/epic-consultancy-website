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
9. **Footer** — © 2026 Epic Consultancy B.V.

Copy drafted during brainstorming is the working copy; Nick sanity-checks claims
before/after launch. No invented numbers or stats — a stats strip may be added
later only with real figures.

**Copy voice rule (added 2026-08-20):** Epic Consultancy is one person — Nick
Smans. All site copy uses first-person singular ("I", "my") or names the company
as the subject; never "we"/"our"/"the team", and nothing may imply additional
staff. The wireframe drafts predate this rule — rewrite their "we" copy during
implementation.

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

## Out of scope for V1 (future ideas)

- Custom domain
- Per-project descriptions / case studies
- Stats strip (needs real numbers)
- Client logos (needs logo files + permission)
- Analytics
