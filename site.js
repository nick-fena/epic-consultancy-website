/* The page logic was designed on a design canvas as a component; DCLogic is a
   minimal stand-in for that runtime, and the runner at the bottom wires the
   data-ref and data-on-* attributes in the HTML to the component. */
class DCLogic { constructor(){ this.props={}; this.state={}; } setState(s){ Object.assign(this.state,s); window.__apply && window.__apply(); } }

class Component extends DCLogic {
  canvasEl = null;
  ctx = null;
  parts = null;
  raf = 0;
  t0 = 0;
  burstT = -100;
  pointer = null;
  visible = true;
  drawnStill = false;
  moved = false;
  seededFor = 0;
  w = 0;
  h = 0;
  cx = 0;
  cy = 0;
  R = 1;

  PAL = ['#5EEAD4', '#6FD3E6', '#7FB6F3', '#818CF8', '#A58AF9', '#C985F9', '#E879F9', '#F3F5FB', '#C7CCF5'];
  ALPHA = [0.95, 0.92, 0.9, 0.92, 0.9, 0.9, 0.92, 0.85, 0.45];

  setCanvas = (el) => { this.canvasEl = el; };

  motionOn() {
    const p = this.props || {};
    if (p.motion === false) return false;
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    } catch (err) { /* ignore */ }
    return true;
  }

  rootMove = (e) => {
    const el = e.currentTarget;
    if (!el) return;
    el.style.setProperty('--cx', e.clientX + 'px');
    el.style.setProperty('--cy', e.clientY + 'px');
    if (!this.moved) {
      this.moved = true;
      this.setState({ spMoved: true });
    }
  };

  heroMove = (e) => {
    const c = this.canvasEl;
    if (!c) return;
    const r = c.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.pointer = { x: (e.clientX - r.left) * (this.w / r.width), y: (e.clientY - r.top) * (this.h / r.height) };
  };

  heroLeave = () => { this.pointer = null; };

  burst = () => {
    if (!this.parts || !this.motionOn()) return;
    this.burstT = (performance.now() - this.t0) / 1000;
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      const a = Math.random() * Math.PI * 2;
      const s = 7 + Math.random() * 17;
      p.vx += Math.cos(a) * s;
      p.vy += Math.sin(a) * s;
    }
  };

  mag = (e) => {
    const el = e.currentTarget;
    if (!el || !this.motionOn()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1) + 'px');
    el.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * 0.38).toFixed(1) + 'px');
  };

  magLeave = (e) => {
    const el = e.currentTarget;
    if (!el) return;
    el.style.setProperty('--tx', '0px');
    el.style.setProperty('--ty', '0px');
  };

  spot = (e) => {
    const el = e.currentTarget;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', Math.round(e.clientX - r.left) + 'px');
    el.style.setProperty('--gy', Math.round(e.clientY - r.top) + 'px');
  };

  talkMove = (e) => {
    const box = e.currentTarget;
    if (!box || !this.motionOn()) return;
    const letters = box.querySelectorAll('.sp-pl');
    for (let i = 0; i < letters.length; i++) {
      const l = letters[i];
      const r = l.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      const f = Math.max(0, 1 - d / 320);
      l.style.setProperty('--wg', String(Math.round(800 - f * 580)));
      l.style.setProperty('--wd', String(Math.round(100 - f * 25)));
    }
  };

  talkLeave = (e) => {
    const box = e.currentTarget;
    if (!box) return;
    const letters = box.querySelectorAll('.sp-pl');
    for (let i = 0; i < letters.length; i++) {
      letters[i].style.removeProperty('--wg');
      letters[i].style.removeProperty('--wd');
    }
  };

  componentDidMount() {
    let scrolly = false;
    try { scrolly = document.documentElement.scrollHeight > window.innerHeight + 600; } catch (err) { scrolly = false; }
    this.setState({ spLive: true, spScrolly: scrolly });
    this.clock = setInterval(() => { this.setState({ spTick: Date.now() }); }, 15000);
    this.initSwarm();
  }

  componentDidUpdate() {
    const p = this.props || {};
    const n = this.count();
    if (this.parts && n !== this.seededFor) this.seed();
    this.drawnStill = false;
    if (p.motion !== false) this.drawnStill = false;
  }

  componentWillUnmount() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.clock) clearInterval(this.clock);
    if (this.onResize) window.removeEventListener('resize', this.onResize);
    if (this.ro) this.ro.disconnect();
    if (this.io) this.io.disconnect();
    this.ctx = null;
  }

  count() {
    const p = this.props || {};
    const n = Number(p.density);
    return Math.max(600, Math.min(4000, isFinite(n) && n > 0 ? Math.round(n) : 2200));
  }

  initSwarm() {
    const c = this.canvasEl;
    if (!c || !c.getContext) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.fit();
    this.seed();
    this.onResize = () => { this.fit(); if (this.parts) this.seed(); };
    window.addEventListener('resize', this.onResize);
    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(this.onResize);
      this.ro.observe(c);
    }
    if (window.IntersectionObserver) {
      this.io = new IntersectionObserver((list) => { list.forEach((en) => { this.visible = en.isIntersecting; }); });
      this.io.observe(c);
    }
    this.t0 = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  fit() {
    const c = this.canvasEl;
    const ctx = this.ctx;
    if (!c || !ctx) return;
    const w = Math.max(1, c.offsetWidth);
    const h = Math.max(1, c.offsetHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w;
    this.h = h;
    if (w >= 900) {
      this.cx = w * 0.73;
      this.cy = h * 0.47;
      this.R = Math.min(w * 0.175, h * 0.3, 320);
    } else {
      this.cx = w * 0.5;
      this.cy = Math.min(h * 0.24, 230);
      this.R = Math.min(w * 0.38, 175);
    }
    this.drawnStill = false;
  }

  // The epic. wordmark as a cloud of points. The letters are sampled from the
  // outlined logo (drawn once into an off-screen canvas); the square full stop
  // is sampled directly. Units: half the wordmark's width is 1.15.
  EPIC = 'M287 14Q212 14 161.5 -7.5Q111 -29 80.0 -66.5Q49 -104 35.5 -152.0Q22 -200 22 -253Q22 -310 36.5 -362.0Q51 -414 81.5 -454.5Q112 -495 160.5 -518.5Q209 -542 277 -542Q345 -542 393.5 -518.5Q442 -495 471.0 -453.0Q500 -411 508.5 -356.0Q517 -301 506 -237L123 -231V-319L382 -324L361 -273Q367 -319 359.5 -350.5Q352 -382 332.0 -398.5Q312 -415 277 -415Q240 -415 218.0 -396.0Q196 -377 187.0 -342.5Q178 -308 178 -261Q178 -180 205.0 -143.0Q232 -106 288 -106Q312 -106 328.0 -112.0Q344 -118 354.0 -129.5Q364 -141 368.0 -157.5Q372 -174 371 -195L519 -187Q522 -154 512.5 -119.0Q503 -84 477.0 -54.0Q451 -24 404.5 -5.0Q358 14 287 14ZM518 148V-340V-528H660V-365H667Q678 -424 700.0 -463.5Q722 -503 756.5 -522.5Q791 -542 840 -542Q902 -542 945.5 -510.5Q989 -479 1011.5 -417.5Q1034 -356 1034 -266Q1034 -169 1008.5 -107.0Q983 -45 939.0 -15.5Q895 14 839 14Q794 14 759.5 -5.0Q725 -24 702.5 -63.5Q680 -103 671 -163H662Q667 -134 671.0 -102.5Q675 -71 677.5 -40.5Q680 -10 680 18V148ZM778 -119Q810 -119 830.5 -139.0Q851 -159 860.5 -191.5Q870 -224 870 -260Q870 -300 859.5 -332.5Q849 -365 828.5 -384.5Q808 -404 778 -404Q759 -404 741.0 -395.5Q723 -387 709.0 -369.5Q695 -352 686.5 -325.0Q678 -298 678 -260V-254Q678 -224 684.0 -202.0Q690 -180 700.0 -164.0Q710 -148 723.0 -138.0Q736 -128 750.0 -123.5Q764 -119 778 -119ZM1037 0V-528H1199V0ZM1117 -566Q1071 -566 1046.5 -585.5Q1022 -605 1022 -642Q1022 -680 1046.5 -699.5Q1071 -719 1117 -719Q1164 -719 1188.5 -699.0Q1213 -679 1213 -642Q1213 -606 1188.5 -586.0Q1164 -566 1117 -566ZM1469 14Q1398 14 1347.0 -7.5Q1296 -29 1264.0 -67.0Q1232 -105 1217.0 -154.0Q1202 -203 1202 -258Q1202 -314 1217.0 -364.5Q1232 -415 1263.5 -455.5Q1295 -496 1345.5 -519.0Q1396 -542 1467 -542Q1551 -542 1602.5 -510.5Q1654 -479 1674.5 -429.0Q1695 -379 1686 -321L1546 -310Q1548 -346 1538.5 -369.5Q1529 -393 1510.0 -404.5Q1491 -416 1464 -416Q1440 -416 1421.5 -407.0Q1403 -398 1390.5 -379.5Q1378 -361 1371.5 -333.0Q1365 -305 1365 -266Q1365 -216 1376.5 -180.0Q1388 -144 1411.5 -125.0Q1435 -106 1471 -106Q1508 -106 1527.0 -124.0Q1546 -142 1552.0 -169.5Q1558 -197 1554 -224L1703 -217Q1709 -173 1699.0 -131.5Q1689 -90 1660.5 -57.0Q1632 -24 1584.5 -5.0Q1537 14 1469 14Z';

  samplePoints() {
    if (this.cachedPts) return this.cachedPts;
    const k = 0.22;
    const W = Math.ceil(1960 * k);
    const H = Math.ceil(900 * k);
    const word = [];
    const dot = [];
    try {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const g = c.getContext('2d');
      g.setTransform(k, 0, 0, k, 0, 740 * k);
      g.fillStyle = '#fff';
      g.fill(new Path2D(this.EPIC));
      this.mask = { px: g.getImageData(0, 0, W, H).data, W: W, H: H, k: k };
    } catch (err) { /* no canvas: the static fallback stays */ }
    this.cachedPts = { word: word, dot: dot };
    return this.cachedPts;
  }

  // A regular lattice over the letter mask, its pitch chosen so the block
  // count lands near the density setting: crisp letters, built from blocks.
  lattice(n) {
    const m = this.mask;
    const word = [];
    const dot = [];
    if (!m) return { word: word, dot: dot, pitch: 30 };
    let filled = 0;
    for (let i = 3; i < m.px.length; i += 16) if (m.px[i] > 128) filled++;
    const area = filled * 4 / (m.k * m.k);
    const pitch = Math.max(14, Math.sqrt((area + 40000) / n));
    for (let y = -740 + pitch / 2; y < 160; y += pitch) {
      for (let x = pitch / 2; x < 1960; x += pitch) {
        const X = Math.round(x * m.k);
        const Y = Math.round((y + 740) * m.k);
        if (X >= m.W || Y >= m.H) continue;
        if (m.px[(Y * m.W + X) * 4 + 3] > 128) word.push([x, y]);
        else if (x >= 1734 && x <= 1934 && y >= -200 && y <= 0) dot.push([x, y]);
      }
    }
    return { word: word, dot: dot, pitch: pitch };
  }

  seed() {
    const n = this.count();
    this.seededFor = n;
    this.samplePoints();
    const pts = this.lattice(n);
    if (!pts.word.length) { this.parts = null; return; }
    const cell = pts.pitch / 956 * 1.15 * this.R;
    const list = [];
    const W = this.w || 1200;
    const H = this.h || 900;
    // Chaos starts as a tight, restless cloud around the formation rather than
    // points strewn over the whole hero, which read as a starfield.
    const make = (fx, fy, ci) => {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 6;
      const ux = (fx - 978) / 956 * 1.15;
      const uy = (fy + 285) / 956 * 1.15;
      const x0 = this.cx + (Math.random() - 0.5) * this.R * 4.4;
      const y0 = this.cy + (Math.random() - 0.5) * this.R * 3.2;
      list.push({
        ux: ux, uy: uy, uz: (Math.random() - 0.5) * 0.08,
        x: Math.max(0, Math.min(W, x0)), y: Math.max(0, Math.min(H, y0)),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        s: Math.max(2, Math.min(6, cell * 0.72)),
        ci: ci, d: Math.random() * 0.6, ph: Math.random() * 6.283, pr: 1
      });
    };
    pts.word.forEach((p) => {
      const t = Math.max(0, Math.min(1, (p[0] - 22) / 1683));
      make(p[0], p[1], Math.round(t * 5));
    });
    pts.dot.forEach((p) => { make(p[0], p[1], 6); });
    list.sort((p, q) => p.ci - q.ci);
    this.parts = list;
    this.drawnStill = false;
  }

  draw() {
    const ctx = this.ctx;
    const ps = this.parts;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = 'lighter';
    let cur = -1;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      if (p.ci !== cur) {
        cur = p.ci;
        ctx.fillStyle = this.PAL[cur];
        ctx.globalAlpha = this.ALPHA[cur];
      }
      const s = p.s * p.pr;
      const ax = p.vx < 0 ? -p.vx : p.vx;
      const ay = p.vy < 0 ? -p.vy : p.vy;
      const sp = ax > ay ? ax : ay;
      if (sp > 1.4) {
        // Fast blocks smear into short horizontal or vertical bars: a glitchy,
        // digital chaos that settles into crisp squares.
        const len = Math.min(18, s + sp * 1.7);
        if (ax > ay) ctx.fillRect(p.x - len / 2, p.y - s / 2, len, s);
        else ctx.fillRect(p.x - s / 2, p.y - len / 2, s, len);
      } else {
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  drawStill() {
    const ps = this.parts;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      const pr = 3.4 / (3.4 + p.uz);
      p.pr = pr;
      p.x = this.cx + p.ux * this.R * pr;
      p.y = this.cy + p.uy * this.R * pr;
      p.vx = 0;
      p.vy = 0;
    }
    this.draw();
  }

  tick = (now) => {
    this.raf = requestAnimationFrame(this.tick);
    if (!this.ctx || !this.parts) return;
    if (!this.motionOn()) {
      if (!this.drawnStill) { this.drawStill(); this.drawnStill = true; }
      return;
    }
    this.drawnStill = false;
    if (!this.visible) return;
    const t = (now - this.t0) / 1000;
    const ry = Math.sin(t * 0.32) * 0.3;
    const rx = Math.sin(t * 0.23) * 0.09;
    const cY = Math.cos(ry), sY = Math.sin(ry), cX = Math.cos(rx), sX = Math.sin(rx);
    const release = Math.min(t - 0.25, t - this.burstT - 0.25);
    const R = this.R, CX = this.cx, CY = this.cy;
    const pt = this.pointer;
    const ps = this.parts;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      let e = (release - p.d) / 1.1;
      e = e < 0 ? 0 : (e > 1 ? 1 : e);
      const ee = 1 - (1 - e) * (1 - e) * (1 - e);
      const x1 = p.ux * cY + p.uz * sY;
      const z1 = -p.ux * sY + p.uz * cY;
      const y1 = p.uy * cX - z1 * sX;
      const z2 = p.uy * sX + z1 * cX;
      const pr = 3.4 / (3.4 + z2);
      const tx = CX + x1 * R * pr + Math.sin(t * 1.4 + p.ph) * 1.1;
      const ty = CY + y1 * R * pr + Math.cos(t * 1.2 + p.ph) * 1.1;
      let ax = (tx - p.x) * 0.075 * ee;
      let ay = (ty - p.y) * 0.075 * ee;
      if (ee < 1) {
        const sw = (1 - ee) * 0.38;
        ax += Math.cos(p.ph + t * 1.7 + p.y * 0.012) * sw;
        ay += Math.sin(p.ph + t * 1.3 + p.x * 0.012) * sw;
      }
      if (pt) {
        const dx = p.x - pt.x;
        const dy = p.y - pt.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 24000 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (1 - d / 155) * 3.4;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }
      const damp = 0.8 + (1 - ee) * 0.17;
      p.vx = (p.vx + ax) * damp;
      p.vy = (p.vy + ay) * damp;
      p.x += p.vx;
      p.y += p.vy;
      p.pr = pr;
    }
    this.draw();
  };

  renderVals() {
    const p = this.props || {};
    const st = this.state || {};
    let cls = 'sp';
    if (p.motion === false) cls += ' sp-still';
    if (st.spLive) cls += ' sp-live';
    if (st.spScrolly) cls += ' sp-scrolly';
    if (st.spMoved) cls += ' sp-moved';
    let time = '';
    try {
      time = new Intl.DateTimeFormat(document.documentElement.lang === 'nl' ? 'nl-NL' : 'en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' }).format(new Date());
    } catch (err) { time = ''; }
    return {
      rootClass: cls,
      time: time,
      setCanvas: this.setCanvas,
      rootMove: this.rootMove,
      heroMove: this.heroMove,
      heroLeave: this.heroLeave,
      burst: this.burst,
      mag: this.mag,
      magLeave: this.magLeave,
      spot: this.spot,
      talkMove: this.talkMove,
      talkLeave: this.talkLeave
    };
  }
}

const comp = new Component(); comp.props = {motion:true, density:2200}; comp.state = {};
const root = document.querySelector('.sp');
window.__apply = () => { const v = comp.renderVals(); root.className = v.rootClass; document.querySelectorAll('[data-time]').forEach((el) => { el.textContent = v.time; }); };
document.querySelectorAll('[data-ref]').forEach((el) => comp[el.dataset.ref](el));
document.querySelectorAll('*').forEach((el) => { for (const a of el.getAttributeNames()) { if (a.startsWith('data-on-')) { el.addEventListener(a.slice(8), comp[el.getAttribute(a)]); } } });
__apply(); comp.componentDidMount();

/* === WORK: concept b === "Pixels". Each client panel is a living mosaic of small
   squares in that client's colours, one canvas per panel. Opening a panel cascades
   the squares outward from where the cursor entered (or from the focused dot), so
   they assemble its gradient surface; the vertical name dissolves into squares and
   the logo resolves from a coarse mosaic to crisp before the text rises in.
   Self-contained and vanilla. Reads only #work; touches nothing else on the page. */
(() => {
  'use strict';
  const wrap = document.querySelector('#work .wb-panels');
  if (!wrap || !window.requestAnimationFrame || !window.Float32Array) return;
  const els = Array.prototype.slice.call(wrap.querySelectorAll('.wb-panel'));
  const N = els.length;
  if (!N || els.some((el) => !el.querySelector('.wb-cv'))) return;
  const probe = document.createElement('canvas');
  if (!probe.getContext || !probe.getContext('2d')) return;

  const root = document.querySelector('.sp');
  const mq = (q) => { try { return window.matchMedia(q); } catch (err) { return null; } };
  const mqCalm = mq('(prefers-reduced-motion: reduce)');
  const mqStack = mq('(max-width: 900px)');
  const isCalm = () => !!(mqCalm && mqCalm.matches) || !!(root && root.classList.contains('sp-still'));
  const isStack = () => !!(mqStack && mqStack.matches);

  const GROW = 3.4;          // flex-grow of the open panel, mirrors the CSS
  const PITCH = 8;           // mosaic grid pitch, CSS px
  const INSET = 6;           // squares keep clear of the panel edge
  const V_OPEN = 1.15;       // speed of the assembling front, px per ms
  const V_CLOSE = 2.4;
  const D_OPEN = 460, D_CLOSE = 300, D_CALM = 420;
  const NB = 12;             // colour steps between --p1 and --p2
  const NAME_Q = 2;          // size of the squares the name dissolves into
  const LOGO_PAD = 10;
  const LOGO_STEPS = [16, 11, 8, 6, 4, 3, 2];
  const LOGO_MS = [95, 80, 68, 60, 52, 46, 40];
  const INK = '#F3F5FB';

  let dpr = 1;
  let stacked = isStack();
  let small = false;
  let inView = false;
  let raf = 0;
  let last = 0;
  let introDone = false;
  let fontsReady = false;
  let lastW = -1;
  let FX = new Float32Array(1), FY = FX, FZ = FX, FA = FX;

  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const easeOut = (x) => { const y = 1 - x; return 1 - y * y * y; };
  const easeBack = (x) => { const y = x - 1; return 1 + 2.3 * y * y * y + 1.3 * y * y; };
  const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const gauss = (dx, dy, s) => Math.exp(-(dx * dx + dy * dy) / (2 * s * s));
  const hex = (s, d) => {
    s = String(s || '').trim().replace('#', '');
    if (s.length === 3) s = s.replace(/./g, '$&$&');
    const n = parseInt(s, 16);
    return s.length === 6 && isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : d;
  };
  const mixRGB = (a, b, t) => 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';

  const P = els.map((el, i) => {
    const lcv = el.querySelector('.wb-lcv');
    return {
      el: el, i: i,
      c1: hex(el.style.getPropertyValue('--p1'), [94, 234, 212]),
      c2: hex(el.style.getPropertyValue('--p2'), [129, 140, 248]),
      cv: el.querySelector('.wb-cv'), ctx: null,
      body: el.querySelector('.wb-body'),
      logoWrap: el.querySelector('.wb-logo'), img: el.querySelector('.wb-logo img'),
      lcv: lcv, lctx: lcv && lcv.getContext ? lcv.getContext('2d') : null,
      name: ((el.querySelector('.wb-vert') || {}).textContent || '').trim(),
      seed: i * 2.1,
      open: false, dir: 0, t0: 0, moving: false, k: 0,
      ox: 0, oy: 0, glow: 0, glowG: null, front: 0,
      torch: 0, torchOn: false, tx: 0, ty: 0,
      txt: null, nDir: 0, nT0: 0, nMoving: false,
      logo: null, logoState: 0, logoT0: 0,
      auto: false, n: 0
    };
  });

  /* ---------- Geometry ---------- */

  function layout() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    stacked = isStack();
    const cs = getComputedStyle(wrap);
    const cw = wrap.clientWidth;
    lastW = cw;
    if (!stacked) {
      const gap = parseFloat(cs.columnGap) || 12;
      const H = Math.max(1, wrap.clientHeight - 2);
      const free = Math.max(0, cw - gap * (N - 1) - 2 * N);
      const closedW = free / (N - 1 + GROW);
      const openW = closedW * GROW;
      wrap.style.setProperty('--wb-cx', (closedW / 2).toFixed(2) + 'px');
      wrap.style.setProperty('--wb-bw', Math.round(Math.min(400, openW - 64)) + 'px');
      P.forEach((p) => {
        p.el.style.removeProperty('--wb-oh');
        p.W = Math.ceil(openW + 2); p.H = H; p.restW = closedW; p.restH = H; p.radius = 25;
      });
    } else {
      wrap.style.removeProperty('--wb-cx');
      wrap.style.removeProperty('--wb-bw');
      const ch = (parseFloat(cs.getPropertyValue('--wb-ch')) || 88) - 2;
      small = ch < 80;
      P.forEach((p) => {
        const W = Math.max(1, p.el.clientWidth);
        const bodyH = p.body ? p.body.offsetTop + p.body.offsetHeight : 240;
        const openH = Math.ceil(bodyH + (small ? 24 : 28));
        p.el.style.setProperty('--wb-oh', (openH + 2) + 'px');
        p.W = W; p.H = Math.max(ch, openH); p.restW = W; p.restH = ch; p.radius = small ? 19 : 21;
      });
    }
    let maxN = 1;
    P.forEach((p) => {
      const num = p.el.querySelector('.wb-num');
      p.numW = num ? num.offsetWidth : 0;
      p.numX = num ? num.offsetLeft : -99;
      p.numY = num ? num.offsetTop + num.offsetHeight / 2 : -99;
    });
    P.forEach((p) => { buildGrid(p); buildName(p); p.logo = null; if (p.n > maxN) maxN = p.n; });
    FX = new Float32Array(maxN); FY = new Float32Array(maxN); FZ = new Float32Array(maxN); FA = new Float32Array(maxN);
    P.forEach(snap);
  }

  // The mosaic: one square per grid cell, with a resting and an assembled alpha.
  function buildGrid(p) {
    const W = p.W, H = p.H;
    p.cv.width = Math.max(1, Math.round(W * dpr));
    p.cv.height = Math.max(1, Math.round(H * dpr));
    p.cv.style.width = W + 'px';
    p.cv.style.height = H + 'px';
    p.ctx = p.cv.getContext('2d');
    p.glowG = null;
    // Offsets centre the grid inside the closed panel, so its margins are even at rest.
    const ox = INSET + ((p.restW - 2 * INSET) % PITCH) / 2;
    const oy = INSET + ((p.restH - 2 * INSET) % PITCH) / 2;
    const cols = Math.max(0, Math.floor((W - INSET - ox) / PITCH + 1e-6));
    const rows = Math.max(0, Math.floor((H - INSET - oy) / PITCH + 1e-6));
    const n = cols * rows;
    const cx = new Float32Array(n), cy = new Float32Array(n), A = new Float32Array(n), B = new Float32Array(n);
    const aC = new Float32Array(n), aO = new Float32Array(n), sR = new Float32Array(n), sO = new Float32Array(n), jit = new Float32Array(n);
    const bk = new Uint8Array(n), counts = new Array(NB).fill(0);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i++) {
        const x = ox + c * PITCH + PITCH / 2, y = oy + r * PITCH + PITCH / 2;
        cx[i] = x; cy[i] = y;
        const u = x / W, v = y / H, uc = x / p.restW, vc = y / p.restH;
        const b = Math.round(clamp01(0.5 + (u - v) * 0.8) * (NB - 1));
        bk[i] = b; counts[b]++;
        A[i] = x * 0.021 + y * 0.012 + p.seed;
        B[i] = y * 0.027 - x * 0.009 - p.seed * 0.6;
        jit[i] = Math.random();
        // A square halftone: size and alpha both follow a soft field. Small and quiet
        // at rest; full tiles only where the assembled surface is brightest, fading to
        // fine grain behind the text.
        let fr, fo;
        if (!stacked) {
          fr = 0.08 + 0.92 * Math.pow(clamp01(1 - vc), 1.35);
          const f2 = gauss(u - 0.86, v - 0.12, 0.3), f1 = gauss(u - 0.14, v - 0.42, 0.26);
          fo = Math.max(f2, 0.82 * f1);
          fo *= 1 - 0.7 * smooth(0.42, 0.95, v) * clamp01(1.45 - u);
        } else {
          fr = 0.08 + 0.92 * Math.pow(clamp01(uc), 1.35);
          const f2 = gauss(u - 0.96, v - 0.16, 0.34), f1 = gauss(u - 0.72, v - 0.98, 0.3);
          fo = Math.max(f2, 0.78 * f1);
          fo *= 1 - 0.8 * clamp01(1.2 - u * 1.25);
        }
        sR[i] = 1.4 + 2.2 * fr; aC[i] = 0.18 + 0.36 * fr;
        sO[i] = 1.5 + 5 * fo; aO[i] = 0.22 + 0.52 * fo;
        // Breathing room in the mosaic around the square full stop and the counter.
        const hx = stacked ? (small ? 27 : 33) : p.restW / 2, hy = stacked ? p.restH / 2 : 37;
        if (Math.abs(x - hx) < 15 && Math.abs(y - hy) < 15) aC[i] = -0.2;
        if (x > p.numX - 8 && x < p.numX + p.numW + 8 && Math.abs(y - p.numY) < 15) { aO[i] = -0.2; if (stacked) aC[i] = -0.2; }
      }
    }
    const order = counts.map((k) => new Uint32Array(k));
    const fill = new Array(NB).fill(0);
    for (let j = 0; j < n; j++) { const b = bk[j]; order[b][fill[b]++] = j; }
    p.colors = [];
    for (let b = 0; b < NB; b++) p.colors.push(mixRGB(p.c1, p.c2, b / (NB - 1)));
    p.n = n; p.cx = cx; p.cy = cy; p.A = A; p.B = B; p.aC = aC; p.aO = aO; p.sR = sR; p.sO = sO; p.jit = jit; p.order = order;
    p.prog = new Float32Array(n); p.gate = new Float32Array(n);
  }

  // The vertical name, drawn on the canvas so it can break into squares in place.
  function buildName(p) {
    p.txt = null;
    if (!fontsReady || !p.name) return;
    const fs = stacked ? (small ? 21 : 24) : 22;
    const font = '700 ' + fs + 'px "Bricolage Grotesque", system-ui, sans-serif';
    const c = document.createElement('canvas');
    let g = c.getContext('2d');
    const setFont = () => { g.font = font; if ('letterSpacing' in g) g.letterSpacing = (-0.01 * fs).toFixed(2) + 'px'; };
    setFont();
    const m = g.measureText(p.name);
    const asc = m.actualBoundingBoxAscent || fs * 0.72, des = m.actualBoundingBoxDescent || fs * 0.2;
    const tw = m.width, pad = 4;
    let bw, bh, bx, by;
    if (!stacked) {
      bw = Math.ceil(asc + des + pad * 2); bh = Math.ceil(tw + pad * 2);
      bx = Math.round(p.restW / 2 - bw / 2); by = Math.round(p.H - 32 - tw - pad);
    } else {
      bw = Math.ceil(tw + pad * 2); bh = Math.ceil(asc + des + pad * 2);
      bx = (small ? 42 : 50) - pad; by = Math.round(p.restH / 2 - bh / 2);
    }
    c.width = Math.ceil(bw * dpr); c.height = Math.ceil(bh * dpr);
    g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    setFont();
    g.fillStyle = INK;
    g.textBaseline = 'alphabetic';
    if (!stacked) { g.translate(bw / 2, bh - pad); g.rotate(-Math.PI / 2); g.fillText(p.name, 0, (asc - des) / 2); }
    else g.fillText(p.name, pad, pad + asc);
    let data;
    try { data = g.getImageData(0, 0, c.width, c.height).data; } catch (err) { return; }
    const q = Math.max(1, Math.round(NAME_Q * dpr)), W = c.width, H = c.height, pts = [];
    for (let y = 0; y < H; y += q) {
      for (let x = 0; x < W; x += q) {
        let sum = 0, cnt = 0;
        for (let y2 = y; y2 < Math.min(H, y + q); y2++) for (let x2 = x; x2 < Math.min(W, x + q); x2++) { sum += data[(y2 * W + x2) * 4 + 3]; cnt++; }
        const av = sum / (cnt * 255);
        if (av > 0.28) pts.push(x, y, Math.min(1, av * 1.2));
      }
    }
    const n = pts.length / 3;
    const T = {
      cv: c, dx: bx * dpr, dy: by * dpr, q: q, n: n,
      x0: new Float32Array(n), y0: new Float32Array(n), al: new Float32Array(n),
      cx: new Float32Array(n), cy: new Float32Array(n),
      vx: new Float32Array(n), vy: new Float32Array(n),
      gate: new Float32Array(n), prog: new Float32Array(n), minGate: 0
    };
    for (let j = 0; j < n; j++) {
      T.x0[j] = bx * dpr + pts[j * 3]; T.y0[j] = by * dpr + pts[j * 3 + 1]; T.al[j] = pts[j * 3 + 2];
      T.cx[j] = (T.x0[j] + q / 2) / dpr; T.cy[j] = (T.y0[j] + q / 2) / dpr;
    }
    p.txt = T;
  }

  // The logo as a set of mosaics, coarse to fine, from its alpha channel.
  function buildLogo(p) {
    const img = p.img;
    if (!img || !p.lctx || !img.complete || !img.naturalWidth) return null;
    const w = parseFloat(img.style.width) || img.width, h = parseFloat(img.style.height) || img.height;
    const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    let d;
    try { g.drawImage(img, 0, 0, W, H); d = g.getImageData(0, 0, W, H).data; } catch (err) { return null; }
    const S = new Float64Array((W + 1) * (H + 1));
    for (let y = 1; y <= H; y++) {
      let row = 0;
      for (let x = 1; x <= W; x++) { row += d[((y - 1) * W + (x - 1)) * 4 + 3]; S[y * (W + 1) + x] = S[(y - 1) * (W + 1) + x] + row; }
    }
    const area = (x0, y0, x1, y1) => S[y1 * (W + 1) + x1] - S[y0 * (W + 1) + x1] - S[y1 * (W + 1) + x0] + S[y0 * (W + 1) + x0];
    const pad = Math.round(LOGO_PAD * dpr);
    p.lcv.width = W + pad * 2; p.lcv.height = H + pad * 2;
    p.lcv.style.width = (W + pad * 2) / dpr + 'px'; p.lcv.style.height = (H + pad * 2) / dpr + 'px';
    const levels = LOGO_STEPS.map((step) => {
      const cs = step * dpr, cols = Math.ceil(W / cs), rows = Math.ceil(H / cs);
      const gx = (W - cols * cs) / 2, gy = (H - rows * cs) / 2, out = [];
      for (let r = 0; r < rows; r++) {
        for (let k = 0; k < cols; k++) {
          const x0 = gx + k * cs, y0 = gy + r * cs;
          const ix0 = Math.max(0, Math.round(x0)), ix1 = Math.min(W, Math.round(x0 + cs));
          const iy0 = Math.max(0, Math.round(y0)), iy1 = Math.min(H, Math.round(y0 + cs));
          if (ix1 <= ix0 || iy1 <= iy0) continue;
          const cov = area(ix0, iy0, ix1, iy1) / (cs * cs * 255);
          if (cov < 0.04) continue;
          const s = cs * (step >= 4 ? 0.8 : 0.92);
          out.push(Math.round(pad + x0 + (cs - s) / 2), Math.round(pad + y0 + (cs - s) / 2), Math.max(1, Math.round(s)), Math.min(1, Math.pow(cov, 0.85) * 1.15));
        }
      }
      return Float32Array.from(out);
    });
    return { levels: levels, W: p.lcv.width, H: p.lcv.height };
  }

  // Jump a panel to the end of its transition (after a resize or a font swap).
  function snap(p) {
    const k = p.open ? 1 : 0;
    p.moving = false; p.k = k; p.glow = k; p.dir = 0;
    if (p.prog) p.prog.fill(k);
    if (p.txt) p.txt.prog.fill(k);
    p.nMoving = false; p.nDir = p.open ? 1 : 0;
    if (p.logoWrap) p.logoWrap.classList.toggle('is-crisp', p.open);
    p.logoState = p.open ? 2 : 0;
    if (p.lctx) p.lctx.clearRect(0, 0, p.lcv.width, p.lcv.height);
  }

  /* ---------- Drawing ---------- */

  function drawGlow(p, ctx, cw, ch, calm) {
    if (!p.glowG) {
      const W = p.W * dpr, H = p.H * dpr, R = Math.max(W, H);
      const g2 = ctx.createRadialGradient(W * 0.86, H * 0.14, 0, W * 0.86, H * 0.14, R * 0.62);
      g2.addColorStop(0, rgba(p.c2, 0.3)); g2.addColorStop(1, rgba(p.c2, 0));
      const g1 = ctx.createRadialGradient(W * 0.16, H * 0.56, 0, W * 0.16, H * 0.56, R * 0.55);
      g1.addColorStop(0, rgba(p.c1, 0.22)); g1.addColorStop(1, rgba(p.c1, 0));
      p.glowG = [g1, g2];
    }
    ctx.globalAlpha = p.glow;
    ctx.fillStyle = p.glowG[0]; ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = p.glowG[1]; ctx.fillRect(0, 0, cw, ch);
    if (!calm && p.open && p.moving) {
      // The soft colour arrives with the assembling front, never ahead of it.
      const r = p.front * dpr, X = p.ox * dpr, Y = p.oy * dpr, soft = 150 * dpr;
      const m = ctx.createRadialGradient(X, Y, Math.max(0, r - soft), X, Y, Math.max(1, r));
      m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-in';
      ctx.globalAlpha = 1; ctx.fillStyle = m; ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
  }

  function still(ctx, x, y, size, a) {
    if (a < 0.01) return;
    const s = size * dpr, Z = Math.max(1, Math.round(s));
    ctx.globalAlpha = a > 1 ? 1 : a;
    ctx.fillRect(Math.round(x * dpr - s / 2), Math.round(y * dpr - s / 2), Z, Z);
  }

  function drawPanel(p, now, t, dt, calm) {
    const ctx = p.ctx;
    if (!ctx || !p.n) return false;
    const vw = p.el.clientWidth, vh = p.el.clientHeight;
    let busy = false;

    if (p.moving) {
      const goal = p.dir > 0 ? 1 : 0;
      if (calm) {
        p.k = clamp01(p.k + p.dir * dt / D_CALM);
        if (p.k === goal) { p.moving = false; p.prog.fill(goal); }
      } else {
        const el = now - p.t0, inc = p.dir * dt / (p.dir > 0 ? D_OPEN : D_CLOSE), pr = p.prog, g = p.gate;
        let left = 0;
        for (let i = 0; i < p.n; i++) {
          let v = pr[i];
          if (v !== goal) {
            if (el >= g[i]) { v += inc; v = v < 0 ? 0 : v > 1 ? 1 : v; pr[i] = v; }
            if (v !== goal) left++;
          }
        }
        p.front = el * V_OPEN;
        if (!left) { p.moving = false; p.k = goal; }
      }
      busy = true;
    }
    const gGoal = calm ? p.k : (p.open ? 1 : 0);
    if (p.glow !== gGoal) {
      const sp = dt / (p.open ? 520 : 420);
      p.glow = p.glow < gGoal ? Math.min(gGoal, p.glow + sp) : Math.max(gGoal, p.glow - sp);
      busy = true;
    }
    const tGoal = p.torchOn && p.open && !calm ? 1 : 0;
    if (p.torch !== tGoal) {
      p.torch += (tGoal - p.torch) * Math.min(1, dt / 180);
      if (Math.abs(p.torch - tGoal) < 0.01) p.torch = tGoal;
      busy = true;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const cw = Math.min(p.cv.width, Math.ceil(vw * dpr) + 2), ch = Math.min(p.cv.height, Math.ceil(vh * dpr) + 2);
    ctx.clearRect(0, 0, cw, ch);
    if (p.glow > 0.003) drawGlow(p, ctx, cw, ch, calm);

    const half = PITCH / 2, R = p.radius, lim = R - 2;
    const xMax = vw - INSET + 0.01, yMax = vh - INSET + 0.01;
    const torch = p.torch > 0.01, TR = 120, tx = p.tx, ty = p.ty, tk = p.torch * 0.16;
    const opening = !calm && p.moving && p.dir > 0;
    const shim = calm ? 0 : 1;
    const cx = p.cx, cy = p.cy, prog = p.prog, aC = p.aC, aO = p.aO, sR = p.sR, sO = p.sO, A = p.A, Bv = p.B, k = p.k;
    let nf = 0;
    for (let b = 0; b < NB; b++) {
      const idx = p.order[b];
      if (!idx.length) continue;
      ctx.fillStyle = p.colors[b];
      for (let j = 0; j < idx.length; j++) {
        const i = idx[j];
        const x = cx[i], y = cy[i];
        if (x + half > xMax || y + half > yMax) continue;
        if ((x < R || x > vw - R) && (y < R || y > vh - R)) {
          const dx = x - (x < R ? R : vw - R), dy = y - (y < R ? R : vh - R);
          if (Math.sqrt(dx * dx + dy * dy) + half * 1.1 > lim) continue;
        }
        if (calm) {
          // Still mosaic: the two states simply cross-fade.
          if (k < 1) still(ctx, x, y, sR[i], aC[i] * (1 - k));
          if (k > 0) still(ctx, x, y, sO[i], aO[i] * k);
          continue;
        }
        const pr = prog[i], e = easeOut(pr);
        let a = aC[i] + (aO[i] - aC[i]) * e;
        if (shim) a += Math.sin(A[i] + t * 0.55) * Math.sin(Bv[i] - t * 0.42) * (0.07 - 0.03 * e);
        if (torch) {
          const dx = x - tx, dy = y - ty, d2 = dx * dx + dy * dy;
          if (d2 < TR * TR) { const f = 1 - Math.sqrt(d2) / TR; a += tk * f * f; }
        }
        if (a < 0.01) continue;
        if (a > 1) a = 1;
        const s = (sR[i] + (sO[i] - sR[i]) * easeBack(pr)) * dpr;
        const X = Math.round(x * dpr - s / 2), Y = Math.round(y * dpr - s / 2), Z = Math.max(1, Math.round(s));
        ctx.globalAlpha = a;
        ctx.fillRect(X, Y, Z, Z);
        if (opening && pr > 0 && pr < 1) { FX[nf] = X; FY[nf] = Y; FZ[nf] = Z; FA[nf] = Math.sin(Math.PI * pr); nf++; }
      }
    }
    if (nf) {
      // A faint light rides the assembling front.
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = '#ffffff';
      for (let q = 0; q < nf; q++) { ctx.globalAlpha = FA[q] * 0.2; ctx.fillRect(FX[q], FY[q], FZ[q], FZ[q]); }
      ctx.globalCompositeOperation = 'source-over';
    }
    if (drawName(p, ctx, now, dt, calm)) busy = true;
    ctx.globalAlpha = 1;
    return busy;
  }

  function drawName(p, ctx, now, dt, calm) {
    const T = p.txt;
    if (!T) return false;
    if (calm) {
      const a = 1 - p.k;
      if (a > 0.005) { ctx.globalAlpha = a; ctx.drawImage(T.cv, T.dx, T.dy); }
      return false;
    }
    let busy = false;
    const el = now - p.nT0;
    if (p.nMoving) {
      const goal = p.nDir > 0 ? 1 : 0, inc = p.nDir * dt / (p.nDir > 0 ? 560 : 440), pr = T.prog, g = T.gate;
      let left = 0;
      for (let j = 0; j < T.n; j++) {
        let v = pr[j];
        if (v !== goal) {
          if (el >= g[j]) { v += inc; v = v < 0 ? 0 : v > 1 ? 1 : v; pr[j] = v; }
          if (v !== goal) left++;
        }
      }
      p.nMoving = left > 0;
      busy = true;
    }
    // Whole until the front reaches it; whole again once every square is home.
    const whole = p.nDir > 0 ? (p.nMoving && el < T.minGate) : !p.nMoving;
    if (whole) { ctx.globalAlpha = 1; ctx.drawImage(T.cv, T.dx, T.dy); return busy; }
    ctx.fillStyle = INK;
    const q = T.q;
    for (let j = 0; j < T.n; j++) {
      const v = T.prog[j];
      if (v >= 1) continue;
      const a = T.al[j] * Math.pow(1 - v, 1.5);
      if (a < 0.01) continue;
      const e = easeOut(v), s = q * (1 - 0.45 * v);
      ctx.globalAlpha = a;
      if (v === 0) ctx.fillRect(T.x0[j], T.y0[j], q, q);
      else ctx.fillRect(T.x0[j] + T.vx[j] * e * dpr + (q - s) / 2, T.y0[j] + T.vy[j] * e * dpr + (q - s) / 2, s, s);
    }
    return busy;
  }

  function drawLogo(p, now) {
    if (p.logoState !== 1 && p.logoState !== 3) return false;
    const L = p.logo, ctx = p.lctx;
    if (!L || !ctx) { p.logoState = p.open ? 2 : 0; if (p.logoWrap) p.logoWrap.classList.toggle('is-crisp', p.open); return false; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, L.W, L.H);
    const el = Math.max(0, now - p.logoT0);
    let k, a = 1;
    if (p.logoState === 1) {
      if (now < p.logoT0) return true;
      let acc = 0;
      k = 0;
      while (k < LOGO_STEPS.length && el >= acc + LOGO_MS[k]) { acc += LOGO_MS[k]; k++; }
      if (k >= LOGO_STEPS.length) {
        // In focus: hand over to the real image and let the last mosaic fade under it.
        if (!p.logoWrap.classList.contains('is-crisp')) p.logoWrap.classList.add('is-crisp');
        const f = (el - acc) / 220;
        if (f >= 1) { p.logoState = 2; return false; }
        k = LOGO_STEPS.length - 1; a = 1 - f;
      } else if (k === 0) a = clamp01(el / 80);
    } else {
      const step = 40;
      k = LOGO_STEPS.length - 1 - Math.floor(el / step);
      if (k < 0) { p.logoState = 0; return false; }
      a = clamp01(1 - el / (step * LOGO_STEPS.length));
    }
    const arr = L.levels[k];
    ctx.fillStyle = '#ffffff';
    for (let j = 0; j < arr.length; j += 4) { ctx.globalAlpha = arr[j + 3] * a; ctx.fillRect(arr[j], arr[j + 1], arr[j + 2], arr[j + 2]); }
    ctx.globalAlpha = 1;
    return true;
  }

  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(50, now - last) : 16;
    last = now;
    const calm = isCalm();
    const t = calm ? 0 : now / 1000;
    let busy = false;
    try {
      for (let i = 0; i < N; i++) {
        if (drawPanel(P[i], now, t, dt, calm)) busy = true;
        if (drawLogo(P[i], now)) busy = true;
      }
    } finally {
      if ((inView && !calm) || busy) raf = requestAnimationFrame(frame);
      else last = 0;
    }
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  /* ---------- State ---------- */

  function begin(p, dir, ox, oy, now, calm) {
    p.dir = dir; p.t0 = now; p.moving = true; p.ox = ox; p.oy = oy; p.front = 0;
    if (!calm && p.n) {
      const g = p.gate, cx = p.cx, cy = p.cy, jit = p.jit;
      if (dir > 0) {
        for (let i = 0; i < p.n; i++) g[i] = Math.hypot(cx[i] - ox, cy[i] - oy) / V_OPEN + jit[i] * 90;
      } else {
        const vw = p.el.clientWidth, vh = p.el.clientHeight;
        const far = Math.max(Math.hypot(ox, oy), Math.hypot(vw - ox, oy), Math.hypot(ox, vh - oy), Math.hypot(vw - ox, vh - oy));
        for (let i = 0; i < p.n; i++) g[i] = Math.max(0, far - Math.hypot(cx[i] - ox, cy[i] - oy)) / V_CLOSE + jit[i] * 50;
      }
    }
    const T = p.txt;
    p.nDir = dir;
    if (T && !calm) {
      p.nT0 = now; p.nMoving = true;
      let dmin = Infinity, dmax = 0;
      const ds = new Float32Array(T.n);
      for (let j = 0; j < T.n; j++) {
        const d = Math.hypot(T.cx[j] - ox, T.cy[j] - oy);
        ds[j] = d; if (d < dmin) dmin = d; if (d > dmax) dmax = d;
      }
      if (dir > 0) {
        const start = dmin / V_OPEN;
        T.minGate = start;
        for (let j = 0; j < T.n; j++) {
          T.gate[j] = start + (ds[j] - dmin) / 1.5 + Math.random() * 90;
          const d = ds[j] || 1, ang = Math.atan2(T.cy[j] - oy, T.cx[j] - ox) + (Math.random() - 0.5) * 1.1;
          const m = 14 + Math.random() * 30;
          T.vx[j] = Math.cos(ang) * m * Math.min(1, d / 40 + 0.4);
          T.vy[j] = Math.sin(ang) * m - 6 - Math.random() * 12;
        }
      } else {
        for (let j = 0; j < T.n; j++) T.gate[j] = 200 + (dmax - ds[j]) / 1.6 + Math.random() * 80;
      }
    }
    if (p.logoWrap) {
      if (dir > 0) {
        if (!p.logo && !calm) p.logo = buildLogo(p);
        p.logoWrap.classList.remove('is-crisp');
        if (calm || !p.logo) { p.logoState = 2; p.logoWrap.classList.add('is-crisp'); }
        else { p.logoState = 1; p.logoT0 = now + 130; }
      } else {
        const shown = p.logoState !== 0;
        p.logoWrap.classList.remove('is-crisp');
        p.logoState = !calm && p.logo && shown ? 3 : 0;
        p.logoT0 = now;
        if (!p.logoState && p.lctx) p.lctx.clearRect(0, 0, p.lcv.width, p.lcv.height);
      }
    }
    kick();
  }

  function openPanel(p, ox, oy) {
    if (p.open) return;
    p.open = true;
    p.el.classList.remove('wb-hold');
    p.el.classList.add('is-open');
    begin(p, 1, ox, oy, performance.now(), isCalm());
  }
  function closePanel(p, ox, oy) {
    if (!p.open) return;
    p.open = false;
    p.el.classList.remove('is-open');
    begin(p, -1, ox, oy, performance.now(), isCalm());
  }

  // Desktop: one panel open at a time. The panel being left collapses toward the one being opened.
  function activate(p, ox, oy) {
    introDone = true;
    if (p.open) return;
    P.forEach((q) => {
      if (q === p) return;
      q.el.classList.remove('wb-hold');
      if (q.open) closePanel(q, q.i < p.i ? q.el.clientWidth : 0, oy);
    });
    openPanel(p, ox, oy);
  }
  function toggle(p, ox, oy) {
    introDone = true;
    if (p.open) closePanel(p, ox, oy); else openPanel(p, ox, oy);
  }
  const home = (p) => (stacked ? [(small ? 22 : 28) + 5, p.restH / 2] : [p.restW / 2, 37]);
  const local = (p, e) => { const r = p.el.getBoundingClientRect(); return [e.clientX - r.left - 1, e.clientY - r.top - 1]; };

  function intro() {
    introDone = true;
    const p = P.find((q) => q.el.classList.contains('wb-hold')) || P[0];
    if (p.open || P.some((q) => q.open)) return;
    const h = home(p);
    openPanel(p, h[0], h[1]);
  }

  /* ---------- Events ---------- */

  P.forEach((p) => {
    const el = p.el;
    el.addEventListener('pointerenter', (e) => {
      if (stacked || e.pointerType === 'touch') return;
      const o = local(p, e);
      activate(p, o[0], o[1]);
    });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const o = local(p, e);
      p.tx = o[0]; p.ty = o[1]; p.torchOn = true;
    });
    el.addEventListener('pointerleave', () => { p.torchOn = false; });
    el.addEventListener('click', (e) => {
      const o = local(p, e);
      if (stacked) { p.auto = true; toggle(p, o[0], o[1]); }
      else activate(p, o[0], o[1]);
    });
    el.addEventListener('focus', () => {
      let kb = true;
      try { kb = el.matches(':focus-visible'); } catch (err) { kb = true; }
      if (!kb) return;
      const h = home(p);
      if (stacked) { p.auto = true; openPanel(p, h[0], h[1]); }
      else activate(p, h[0], h[1]);
    });
    el.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowUp') {
        const j = p.i + (k === 'ArrowRight' || k === 'ArrowDown' ? 1 : -1);
        if (j >= 0 && j < N) { e.preventDefault(); P[j].el.focus(); }
      } else if (stacked && (k === 'Enter' || k === ' ')) {
        e.preventDefault();
        const h = home(p);
        toggle(p, h[0], h[1]);
      }
    });
  });

  function onResize() {
    const s = isStack();
    const d = Math.min(2, window.devicePixelRatio || 1);
    if (s === stacked && wrap.clientWidth === lastW && d === dpr) return;
    if (s !== stacked) {
      P.forEach((p) => p.el.classList.remove('wb-hold'));
      if (!s) {
        // Back to a row: exactly one panel stays open.
        const keep = P.find((p) => p.open) || P[0];
        P.forEach((p) => { p.open = p === keep; p.el.classList.toggle('is-open', p.open); });
      }
      introDone = true;
    }
    layout();
    kick();
  }
  let rq = 0;
  const schedule = () => { if (!rq) rq = requestAnimationFrame(() => { rq = 0; onResize(); }); };
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(wrap);
  window.addEventListener('resize', schedule);

  /* ---------- Start ---------- */

  wrap.classList.add('wb-live');
  P.forEach((p) => {
    if (p.el.classList.contains('is-open')) {
      p.el.classList.remove('is-open');
      if (!stacked) p.el.classList.add('wb-hold');
    }
  });
  layout();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((ents) => {
      const en = ents[ents.length - 1];
      inView = en.isIntersecting;
      if (inView) kick();
      if (!introDone && !stacked && en.intersectionRatio >= 0.35) intro();
    }, { threshold: [0, 0.35, 0.6] }).observe(wrap);
    // Phone and tablet: a panel unfolds by itself the first time it reaches the middle of the screen.
    const mid = new IntersectionObserver((ents) => {
      if (!stacked) return;
      const hit = ents.filter((en) => en.isIntersecting).map((en) => P[els.indexOf(en.target)]).filter((p) => p && !p.auto);
      if (!hit.length) return;
      hit.sort((a, b) => a.i - b.i);
      const p = hit[0];
      p.auto = true;
      introDone = true;
      const h = home(p);
      openPanel(p, h[0], h[1]);
    }, { rootMargin: '-40% 0px -40% 0px' });
    els.forEach((el) => mid.observe(el));
  } else {
    inView = true;
    if (!stacked) intro();
  }

  const fontsDone = () => {
    if (fontsReady) return;
    fontsReady = true;
    layout();
    wrap.classList.add('wb-txt');
    kick();
  };
  try {
    const f = document.fonts;
    Promise.race([
      f.ready.then(() => f.load('700 22px "Bricolage Grotesque"')),
      new Promise((res) => setTimeout(res, 2500))
    ]).then(fontsDone, fontsDone);
  } catch (err) { fontsDone(); }
  kick();
})();
