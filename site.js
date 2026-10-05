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
