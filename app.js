// Sample gallery: samples.json holds {file, class, pid, recorded_at}. One tile per pid, filters per class,
// and a views panel with every crop of the selected pid.
const pad = (pid) => String(pid).padStart(6, '0');
const fileName = (path) => path.split('/').pop();
// "2023-08-02T12:57:00.12+02:00" -> "2023-08-02 12:57:00" (camera clock, CEST)
const stamp = (t) => (t ? t.slice(0, 19).replace('T', ' ') : '');

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

async function initGallery() {
  const filters = document.querySelector('.filters');
  const tiles = document.querySelector('.tiles');
  const views = document.querySelector('.views');

  let samples;
  try {
    const res = await fetch('samples.json');
    if (!res.ok) throw new Error(res.status);
    samples = await res.json();
  } catch {
    views.replaceChildren(el('p', { className: 'error', textContent:
      'The samples did not load. Open the page through a web server (for example "python3 -m http.server"), then reload.' }));
    return;
  }

  const byPid = new Map();
  for (const s of samples) {
    if (!byPid.has(s.pid)) byPid.set(s.pid, []);
    byPid.get(s.pid).push(s);
  }
  const classes = [...new Set(samples.map((s) => s.class))];

  // The views panel plays one sequence: every view of every vessel of the selected class, vessel after vessel.
  // Autoplay and the arrows step through it; a tile jumps to the first view of its vessel.
  const STEP_MS = 2500; // keep equal to the .progress animation duration in styles.css
  const icon = (d) => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICON = { prev: icon('<path d="M15 5l-7 7 7 7"/>'), next: icon('<path d="M9 5l7 7-7 7"/>'),
    back: icon('<path d="M18 5l-7 7 7 7M6 5v14"/>'), skip: icon('<path d="M6 5l7 7-7 7M18 5v14"/>'),
    pause: icon('<path d="M9 5v14M15 5v14"/>'), play: icon('<path d="M8 5l11 7-11 7z"/>') };
  let seq = [], pids = [], pos = 0, timer = 0, onScreen = false;
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const title = el('h3');
  const sub = el('p', { className: 'sub' });
  const main = el('img', { alt: '' });
  const counter = el('p', { className: 'count' });
  const btn = (label, html, onclick) => Object.assign(el('button', { type: 'button', ariaLabel: label, title: label, onclick }), { innerHTML: html });
  const prev = btn('Previous view', ICON.prev, () => show(pos - 1));
  const next = btn('Next view', ICON.next, () => show(pos + 1));
  const toggle = btn('', '', () => { playing = !playing; sync(); });
  // skip: the first view of the previous or the next vessel
  const vessel = (d) => {
    const k = (pids.indexOf(seq[pos].pid) + d + pids.length) % pids.length;
    show(seq.findIndex((s) => s.pid === pids[k]));
  };
  const back = btn('Previous vessel', ICON.back, () => vessel(-1));
  const skip = btn('Next vessel', ICON.skip, () => vessel(1));
  const bar = el('span');
  const file = el('p', { className: 'file' });
  views.replaceChildren(title, sub, el('div', { className: 'main' }, main),
    el('div', { className: 'progress', ariaHidden: 'true' }, bar),
    el('div', { className: 'ctrl' }, counter, el('div', { className: 'btns' }, back, prev, toggle, next, skip)), file);

  function sync() {
    toggle.innerHTML = playing ? ICON.pause : ICON.play;
    toggle.ariaLabel = toggle.title = playing ? 'Pause slideshow' : 'Play slideshow';
    views.ariaLive = playing ? 'off' : 'polite'; // no announcement on every automatic step
    clearTimeout(timer);
    bar.classList.remove('run');
    if (playing && onScreen && !document.hidden && seq.length > 1) {
      timer = setTimeout(() => show(pos + 1), STEP_MS);
      void bar.offsetWidth; // restart the fill animation from zero
      bar.classList.add('run');
    }
  }

  function show(p) {
    pos = (p + seq.length) % seq.length;
    const { pid, i } = seq[pos];
    const list = byPid.get(pid);
    title.textContent = `pid ${pad(pid)}`;
    sub.textContent = `${list[0].class} · vessel ${pids.indexOf(pid) + 1} of ${pids.length}`;
    main.src = list[i].file;
    main.alt = `${list[0].class}, pid ${pad(pid)}, view ${i + 1} of ${list.length}`;
    counter.textContent = `View ${i + 1} of ${list.length}`;
    file.textContent = `${stamp(list[i].recorded_at)} CEST · ${fileName(list[i].file)}`;
    for (const t of tiles.querySelectorAll('.tile')) t.ariaPressed = String(Number(t.dataset.pid) === pid);
    const { pid: np, i: ni } = seq[(pos + 1) % seq.length];
    new Image().src = byPid.get(np)[ni].file; // preload, so the next step does not flash
    sync();
  }

  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }).observe(views);
  document.addEventListener('visibilitychange', sync);

  function render(cls) {
    pids = [...byPid.keys()].filter((pid) => !cls || byPid.get(pid)[0].class === cls);
    seq = pids.flatMap((pid) => byPid.get(pid).map((_, i) => ({ pid, i })));
    tiles.replaceChildren(...pids.map((pid) => {
      const list = byPid.get(pid);
      const cover = list[Math.floor(list.length / 2)];
      const btn = el('button', { type: 'button', className: 'tile', ariaPressed: 'false', onclick: () => {
        show(seq.findIndex((s) => s.pid === pid));
        if (window.matchMedia('(max-width: 960px)').matches) views.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } },
        el('span', { className: 'frame' }, el('img', { src: cover.file, alt: `${cover.class}, pid ${pad(pid)}`, loading: 'lazy' })),
        el('span', { className: 'cap' }, el('b', { textContent: cover.class }), el('span', { textContent: pad(pid) })));
      btn.dataset.pid = pid;
      return el('li', {}, btn);
    }));
    for (const b of filters.children) b.ariaPressed = String(b.dataset.cls === (cls || ''));
    show(0);
  }

  const count = (cls) => new Set(samples.filter((s) => !cls || s.class === cls).map((s) => s.pid)).size;
  filters.replaceChildren(...['', ...classes].map((cls) => {
    const b = el('button', { type: 'button', className: 'btn', onclick: () => render(cls) },
      cls || 'All', el('span', { textContent: count(cls) }));
    b.dataset.cls = cls;
    return b;
  }));
  render('motorboat');
}

function initCopy() {
  const btn = document.querySelector('[data-copy]');
  const box = (id) => { const el = document.getElementById(id); return el.closest('pre') || el; };
  const label = () => `Copy ${box(btn.dataset.copy).dataset.name}`;
  const styles = document.querySelector('.styles');
  styles.hidden = false; // without JS only the BibTeX block shows
  styles.addEventListener('click', (e) => {
    const pick = e.target.closest('[data-style]');
    if (!pick) return;
    for (const b of styles.children) {
      b.ariaPressed = String(b === pick);
      box(b.dataset.style).hidden = b !== pick;
    }
    btn.dataset.copy = pick.dataset.style;
    btn.textContent = label();
  });
  btn.addEventListener('click', async () => {
    const el = document.getElementById(btn.dataset.copy);
    try {
      // HTML keeps the italic title when the reference goes into a word processor
      await (window.ClipboardItem
        ? navigator.clipboard.write([new ClipboardItem({
          'text/plain': new Blob([el.textContent], { type: 'text/plain' }),
          'text/html': new Blob([el.innerHTML], { type: 'text/html' }) })])
        : navigator.clipboard.writeText(el.textContent));
      btn.textContent = 'Copied';
    } catch {
      btn.textContent = 'Select the text to copy';
    }
    setTimeout(() => { btn.textContent = label(); }, 2000);
  });
}

// On phones the map shows the eastern channel (the <picture> source): give the labels the same viewBox.
function initMapLabels() {
  const svg = document.querySelector('.labels');
  const wide = svg.getAttribute('viewBox');
  const mq = window.matchMedia('(max-width: 640px)');
  // preserveAspectRatio "slice" scales the viewBox by the larger ratio
  const scale = () => {
    const { width, height } = svg.viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    svg.style.setProperty('--s', Math.max(r.width / width, r.height / height));
  };
  const sync = () => { svg.setAttribute('viewBox', mq.matches ? svg.dataset.narrow : wide); scale(); };
  mq.addEventListener('change', sync);
  new ResizeObserver(scale).observe(svg);
  sync();
}

// 3D simplex noise (Gustavson). Time is the third input, so a field sampled over time never loops.
function makeNoise3() {
  const base = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  const p = Uint8Array.from({ length: 512 }, (_, i) => base[i & 255]);
  const G = [1,1,0, -1,1,0, 1,-1,0, -1,-1,0, 1,0,1, -1,0,1, 1,0,-1, -1,0,-1, 0,1,1, 0,-1,1, 0,1,-1, 0,-1,-1];
  const corner = (x, y, z, h) => {
    let t = 0.6 - x * x - y * y - z * z;
    if (t < 0) return 0;
    h = (h % 12) * 3;
    t *= t;
    return t * t * (G[h] * x + G[h + 1] * y + G[h + 2] * z);
  };
  return (x, y, z) => {
    const s = (x + y + z) / 3;
    const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
    const t = (i + j + k) / 6;
    const x0 = x - i + t, y0 = y - j + t, z0 = z - k + t;
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 1, 0];
      else if (x0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 0, 1];
      else [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 1, 0, 1];
    } else if (y0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 0, 1, 1];
    else if (x0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 0, 1, 1];
    else [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 1, 1, 0];
    const ii = i & 255, jj = j & 255, kk = k & 255;
    return 32 * (corner(x0, y0, z0, p[ii + p[jj + p[kk]]])
      + corner(x0 - i1 + 1 / 6, y0 - j1 + 1 / 6, z0 - k1 + 1 / 6, p[ii + i1 + p[jj + j1 + p[kk + k1]]])
      + corner(x0 - i2 + 1 / 3, y0 - j2 + 1 / 3, z0 - k2 + 1 / 3, p[ii + i2 + p[jj + j2 + p[kk + k2]]])
      + corner(x0 - 0.5, y0 - 0.5, z0 - 0.5, p[ii + 1 + p[jj + 1 + p[kk + 1]]]));
  };
}

// The hero sea: waves, vessels with wakes, and cars, on one canvas in the map's coordinate space
// (viewBox 0 0 1600 1328), mapped like the .labels SVG (its viewBox and preserveAspectRatio slice).
// Data from tools/map2svg.py: roads.json, water-mask.png (R = distance to land, G = distance from the open sea),
// and the hand-placed vessel routes in routes.json (checked by tools/check_routes.py).
async function initSea() {
  const canvas = document.querySelector('.sea');
  const labels = document.querySelector('.labels');
  const hero = document.querySelector('.hero');
  if (!canvas?.getContext) return;
  const ctx = canvas.getContext('2d');

  let roadData, routeData, maskImg;
  try {
    const json = (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(url); return r.json(); });
    maskImg = new Image();
    maskImg.src = 'assets/water-mask.png';
    [roadData, routeData] = await Promise.all([json('assets/roads.json'), json('assets/routes.json'), maskImg.decode()]);
  } catch {
    return; // the static map stays; the animation is decoration
  }

  // water mask lookups (1 mask px = 2 map units); off the map counts as land, so nothing draws there
  const MW = maskImg.naturalWidth, MH = maskImg.naturalHeight;
  const mc = Object.assign(document.createElement('canvas'), { width: MW, height: MH }).getContext('2d', { willReadFrequently: true });
  mc.drawImage(maskImg, 0, 0);
  const mask = mc.getImageData(0, 0, MW, MH).data;
  const px = (x, y) => {
    const ix = x >> 1, iy = y >> 1;
    return ix >= 0 && iy >= 0 && ix < MW && iy < MH ? (iy * MW + ix) * 4 : -1;
  };
  const coast = (x, y) => { const i = px(x, y); return i < 0 ? 0 : mask[i]; };
  const smooth01 = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  // 1 on the open sea, down to 0.42 in the inner bay, and lower near the coast
  const exposure = (x, y) => {
    const i = px(x, y);
    if (i < 0 || mask[i] < 3) return 0;
    return Math.min(1, Math.max(0.42, 1.2 - mask[i + 1] / 170)) * smooth01(4, 45, mask[i]);
  };

  // polylines with cumulative length; at() writes the point and the unit direction at distance s
  const path = (pts) => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, cum, len: cum[cum.length - 1] };
  };
  const at = (p, s, o) => {
    s = Math.min(p.len, Math.max(0, s));
    let lo = 0, hi = p.cum.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p.cum[m] <= s) lo = m; else hi = m; }
    const a = p.pts[lo], b = p.pts[hi], d = p.cum[hi] - p.cum[lo] || 1, t = (s - p.cum[lo]) / d;
    o.x = a[0] + (b[0] - a[0]) * t; o.y = a[1] + (b[1] - a[1]) * t;
    o.dx = (b[0] - a[0]) / d; o.dy = (b[1] - a[1]) / d;
    return o;
  };
  // three Chaikin passes round the route corners (tools/check_routes.py checks the same smoothed line)
  const smooth = (pts) => {
    for (let n = 0; n < 3; n++) {
      const out = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [a, b] = [pts[i], pts[i + 1]];
        out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
      }
      out.push(pts[pts.length - 1]);
      pts = out;
    }
    return pts;
  };
  const routes = {};
  for (const [name, legs] of Object.entries(routeData.routes)) {
    let pts = [];
    for (const leg of legs) {
      const p = routeData.legs[leg.replace('-', '')];
      pts = pts.concat((leg[0] === '-' ? [...p].reverse() : p).slice(pts.length ? 1 : 0));
    }
    const fwd = path(smooth(pts));
    routes[name] = [fwd, path([...fwd.pts].reverse())];
  }
  const onMap = (p) => p[0] >= 0 && p[0] <= 1600 && p[1] >= 0 && p[1] <= 1328;

  // vessels: length and beam in map units, speed in map units per second (the hero runs about 3x real time)
  const TYPES = {
    motorboat: { L: 9, B: 3.4, v: 13 }, sailboat: { L: 11, B: 3.8, v: 5 }, yacht: { L: 13, B: 4.4, v: 8 },
    trawler: { L: 13, B: 4.6, v: 5 }, fast: { L: 16, B: 5.6, v: 15 }, superyacht: { L: 20, B: 5.2, v: 8 }, ferry: { L: 24, B: 7, v: 7 },
  };
  // most traffic uses the channel to and from the Šibenik port
  const TRIPS = [
    [40, 'seaPort', { ferry: 3, fast: 3, yacht: 2, motorboat: 2, superyacht: 1, trawler: 2, sailboat: 1 }],
    [15, 'seaMarina', { yacht: 3, sailboat: 3, motorboat: 2, superyacht: 1 }],
    [12, 'seaNorth', { motorboat: 2, yacht: 2, sailboat: 2, trawler: 1, superyacht: 1 }],
    [10, 'portNorth', { ferry: 1, fast: 2, motorboat: 2, trawler: 1 }],
    [10, 'south', { sailboat: 3, trawler: 2, motorboat: 1, yacht: 1 }],
    [5, 'portMarina', { motorboat: 2, yacht: 1 }],
  ];
  const pick = (pairs) => {
    let r = Math.random() * pairs.reduce((a, [w]) => a + w, 0);
    for (const p of pairs) if ((r -= p[0]) < 0) return p;
    return pairs[pairs.length - 1];
  };
  const WIND = Math.atan2(-1, 1); // the swell and the wind come from the southwest, toward the northeast
  const SWELL = { x: Math.SQRT1_2, y: -Math.SQRT1_2 };
  const WAKE_S = 4;
  const moored = routeData.moored.map(([x, y, deg, type]) => ({ type, ...TYPES[type], x, y, h: deg * Math.PI / 180, alpha: 1 }));
  let vessels = [], nextId = 0;
  const q = { x: 0, y: 0, dx: 0, dy: 0 }, q2 = { x: 0, y: 0, dx: 0, dy: 0 };

  // Agents (vessels and cars) move along their lane, right of a path line, so opposite traffic keeps apart.
  // They never overlap. Each step, an agent predicts its own lane at its desired speed and the others at their
  // current speed, a few seconds ahead. It keeps a gap to the agent ahead in its lane. At any other predicted
  // contact, the younger agent waits, except when it already stands in the way of the other: then it drives on.
  const H = 0.5; // prediction step, s
  const here = [];
  const pose = (a, s, out = []) => {
    at(a.p, s - a.look, q); at(a.p, s + a.look, q2);
    const hx = q2.x - q.x, hy = q2.y - q.y, hl = Math.hypot(hx, hy) || 1;
    at(a.p, s, q);
    out[0] = q.x - (hy / hl) * a.lane; out[1] = q.y + (hx / hl) * a.lane; out[2] = hx / hl; out[3] = hy / hl;
    return out;
  };
  const predict = (a, n) => {
    a.n = n; a.des ||= []; a.now ||= [];
    for (let i = 0; i <= n; i++) {
      a.des[i] = pose(a, a.s + a.vDes * i * H, a.des[i]);
      a.now[i] = pose(a, a.s + a.cur * i * H, a.now[i]);
    }
  };
  // footprint: a row of circles along the hull or the car body
  const hit = (pa, a, pb, b, m) => {
    if (Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) > (a.l + b.l) / 2 + m) return false;
    const ra = a.w / 2, rb = b.w / 2, na = Math.ceil(a.l / a.w) + 1, nb = Math.ceil(b.l / b.w) + 1, d = (ra + rb + m) ** 2;
    for (let i = 0; i < na; i++) {
      const ta = -a.l / 2 + ra + (a.l - 2 * ra) * i / (na - 1), ax = pa[0] + pa[2] * ta, ay = pa[1] + pa[3] * ta;
      for (let j = 0; j < nb; j++) {
        const tb = -b.l / 2 + rb + (b.l - 2 * rb) * j / (nb - 1), bx = pb[0] + pb[2] * tb - ax, by = pb[1] + pb[3] * tb - ay;
        if (bx * bx + by * by < d) return true;
      }
    }
    return false;
  };
  const inWay = (m, st, mg) => { // does m, at its desired speed, run into st where st is now?
    for (let i = 1; i <= m.n; i++) if (hit(m.des[i], m, st.now[0], st, mg)) return true;
    return false;
  };
  const speedLimit = (a, list, margin) => {
    let lim = Infinity;
    const [ax, ay, ca, sa] = a.now[0], reach = a.l * 1.5 + a.cur * 2.5 + 6;
    const follow = (o, gap) => { lim = Math.min(lim, Math.max(0, o.cur + gap * 0.8)); };
    for (const o of list) {
      if (o === a || !o.alive) continue;
      const samePath = o.p === a.p;
      if (samePath && o.s < a.s) continue; // the agent behind keeps the gap
      if (!samePath && a.stuck > 10) continue; // gridlock: after 10 s stopped, only the same path counts
      const [ox, oy, co, so] = o.now[0], dx = ox - ax, dy = oy - ay;
      const far = a.l + o.l + (a.vDes + o.cur) * a.n * H + margin;
      if (Math.abs(dx) > far || Math.abs(dy) > far) continue;
      const c = ca * co + sa * so, along = dx * ca + dy * sa;
      let ahead = samePath;
      if (samePath) follow(o, o.s - a.s - (a.l + o.l) / 2 - margin);
      else if (c > 0.3 && along > 0) {
        // o is ahead in my lane when its turned box reaches my track; when two merge side by side, the older goes first
        const sn = Math.abs(ca * so - sa * co);
        const inLane = along < reach + o.l / 2 && Math.abs(dy * ca - dx * sa) < a.w / 2 + o.l / 2 * sn + o.w / 2 * c + 0.3;
        const back = -(dx * co + dy * so);
        const mutual = back > 0 && Math.abs(dx * so - dy * co) < o.w / 2 + a.l / 2 * sn + a.w / 2 * c + 0.3;
        if (inLane && (!mutual || a.id > o.id)) { follow(o, along - (a.l + o.l) / 2 - margin); ahead = true; }
      }
      let tc = 0;
      for (let i = 1; i <= a.n && !tc; i++) if (hit(a.des[i], a, o.now[i], o, margin)) tc = i;
      if (!tc) continue;
      if (!ahead) {
        if (inWay(o, a, margin)) continue; // I stand in its way: drive on and clear it
        if (o.id > a.id && !inWay(a, o, margin)) continue; // I am older
      }
      lim = Math.min(lim, a.vDes * Math.max(0, tc - 1.5) / a.n);
    }
    return lim;
  };
  const move = (a, target, accel, decel, dt) => {
    a.cur += Math.max(-decel * dt, Math.min(accel * dt, target - a.cur));
    a.stuck = a.cur < 0.3 ? a.stuck + dt : 0;
    a.s += a.cur * dt;
  };

  const spawn = (initial) => {
    const [, name, types] = pick(TRIPS);
    const type = pick(Object.entries(types).map(([k, w]) => [w, k]))[1];
    const p = routes[name][Math.random() < 0.5 ? 0 : 1];
    const t = TYPES[type];
    const v = {
      id: nextId++, type, ...t, p, v: t.v * (0.85 + Math.random() * 0.3), cur: 0, stuck: 0, alive: true,
      s: initial ? p.len * (0.1 + Math.random() * 0.8) : 0,
      laneX: 1.5 + Math.random() * (t.B > 5 ? 1 : 2), // lane: right of the route line, so opposite traffic keeps apart
      innerStart: onMap(p.pts[0]), innerEnd: onMap(p.pts[p.pts.length - 1]),
      age: initial ? 9 : 0, wake: [], wakeT: 0, x: 0, y: 0, h: 0, alpha: 1,
    };
    placeVessel(v);
    // keep clear of the other vessels
    if (vessels.some((o) => Math.hypot(o.x - v.x, o.y - v.y) < (o.l + v.l) * 1.2 + 10)) return;
    v.cur = initial ? v.v : 0.3 * v.v;
    vessels.push(v);
  };
  const placeVessel = (v) => {
    v.l = v.L * k; v.w = v.B * k; v.look = v.l * 0.4; v.lane = v.w / 2 + v.laneX;
    [v.x, v.y] = pose(v, v.s, here);
    v.h = Math.atan2(here[3], here[2]);
    const left = v.p.len - v.s;
    v.alpha = Math.min(v.innerStart ? v.age / 1.5 : 1, v.innerEnd ? left / 25 : 1, 1);
  };

  // cars: pregenerated paths through the road graph (tools/map2svg.py), driven both ways on the right lane
  const carPaths = roadData.paths.map((flat) => {
    const pts = [];
    for (let i = 0; i < flat.length; i += 2) pts.push([flat[i], flat[i + 1]]);
    const fwd = path(pts), inTown = pts.filter(([x, y]) => x > 1080 && y < 820).length / pts.length;
    return [fwd.len * (1 + 3 * inTown), fwd, path([...pts].reverse())];
  });
  // dark cars with a pale windscreen, light cars with a dark one: both read against the pale land and roads
  const CAR_COLORS = [['#0f2433', 0], ['#24445c', 0], ['#3d4a52', 0], ['#2f6670', 0], ['#1d5a87', 0], ['#56636b', 0],
    ['#ffffff', 1], ['#e3e9ec', 1]];
  const cars = [];
  const placeCar = (c) => {
    c.l = 6 * kc; c.w = 3 * kc; c.look = 2; c.lane = 1.8 * kc; // drive on the right
    [c.x, c.y] = pose(c, c.s, here);
    c.h = Math.atan2(here[3], here[2]);
    c.alpha = Math.min(1, c.s / 8, (c.p.len - c.s) / 8);
  };
  const enter = (c, initial) => {
    const [, fwd, rev] = pick(carPaths);
    c.p = Math.random() < 0.5 ? fwd : rev;
    c.s = initial ? Math.random() * c.p.len : 0;
    placeCar(c);
    // wait off the road while the entry is taken
    c.alive = !cars.some((o) => o !== c && o.alive && Math.hypot(o.x - c.x, o.y - c.y) < (o.l + c.l) * 0.8);
    c.cur = c.alive ? c.v * (initial ? 1 : 0.5) : 0;
    return c;
  };
  const newCars = () => {
    cars.length = 0;
    for (let i = 0; i < 90; i++) {
      const [color, light] = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
      cars.push(enter({ id: i, color, light, v: 9 + Math.random() * 3, cur: 0, stuck: 0, s: 0 }, true));
    }
  };

  // waves: short crest particles that drift with the swell; a swell band field decides where they appear
  const noise = makeNoise3();
  let waves = [];
  const view = { x0: 0, y0: 0, x1: 1600, y1: 1328 };
  const swellBand = (x, y, t) => {
    const ph = 2 * Math.PI * ((x * SWELL.x + y * SWELL.y) / 70 - t / 9) + 2.2 * noise(x * 0.004, y * 0.004, t * 0.05);
    return 0.25 + 0.75 * smooth01(0.3, 1, Math.sin(ph));
  };
  const seedWave = (w, t, randomAge) => {
    for (let n = 0; n < 30; n++) {
      const x = view.x0 + Math.random() * (view.x1 - view.x0), y = view.y0 + Math.random() * (view.y1 - view.y0);
      const e = exposure(x, y);
      if (e > 0 && Math.random() < e * swellBand(x, y, t)) {
        w.life = 2.5 + Math.random() * 3;
        return Object.assign(w, { x, y, e, age: randomAge ? Math.random() * w.life : 0 });
      }
    }
    return Object.assign(w, { age: 1, life: 0 }); // no water found: try again next frame
  };

  // layout: canvas pixels and the map-to-canvas transform, read from the labels SVG
  let s = 1, tx = 0, ty = 0, dpr = 1, u = 1, k = 1, kc = 1, kw = 1;
  const layout = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const vb = labels.viewBox.baseVal;
    const align = labels.preserveAspectRatio.baseVal.align; // SVG_PRESERVEASPECTRATIO_XMINYMIN (2) .. XMAXYMAX (10)
    s = Math.max(w / vb.width, h / vb.height);
    const ax = (align - 2) % 3 / 2, ay = Math.floor((align - 2) / 3) / 2; // 0 min, 0.5 mid, 1 max
    tx = (w - vb.width * s) * ax - vb.x * s; ty = (h - vb.height * s) * ay - vb.y * s;
    u = 1 / s; // map units per CSS pixel
    // drawing scale of vessels and cars: they stay readable on a small map (tools/check_routes.py assumes k <= 2)
    k = Math.min(2, Math.max(1.5, 1.1 / s));
    kc = Math.min(1.8, Math.max(1, 0.75 / s));
    kw = Math.min(2.4, Math.max(1, 0.9 / s));
    view.x0 = Math.max(0, -tx / s); view.y0 = Math.max(0, -ty / s);
    view.x1 = Math.min(1600, (w - tx) / s); view.y1 = Math.min(1328, (h - ty) / s);
    const n = Math.min(500, Math.round((w * h) / 3200));
    const t = performance.now() / 1000;
    waves = Array.from({ length: n }, (_, i) => seedWave(waves[i] || {}, t, true));
    for (const v of vessels) placeVessel(v);
    for (const c of cars) if (c.p) placeCar(c);
    if (!running) draw(t);
  };

  // drawing ------------------------------------------------------------------------------------------
  const INK = '#0f2433', FOAM = '#e9fbfa', DECK = '#e6ddc6', DECK_GREY = '#dce5e8';
  const hull = (L, B, bow) => {
    const h = L / 2, w = B / 2, m = h - L * bow;
    ctx.beginPath();
    ctx.moveTo(-h, -w * 0.82);
    ctx.lineTo(m, -w);
    ctx.quadraticCurveTo(h - L * bow * 0.2, -w, h, 0);
    ctx.quadraticCurveTo(h - L * bow * 0.2, w, m, w);
    ctx.lineTo(-h, w * 0.82);
    ctx.quadraticCurveTo(-h - w * 0.25, 0, -h, -w * 0.82);
    ctx.closePath();
  };
  const box = (x, y, w, h, r, fill) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
  };
  const SHAPES = {
    motorboat(L, B) {
      hull(L, B, 0.45); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      box(-L / 2 + 0.8, -B / 2 + 0.7, L * 0.42, B - 1.4, 0.6, DECK);
      ctx.beginPath(); ctx.moveTo(L * 0.05, -B * 0.32); ctx.quadraticCurveTo(L * 0.14, 0, L * 0.05, B * 0.32); ctx.stroke();
    },
    sailboat(L, B, v) {
      hull(L, B, 0.45); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      box(-L / 2 + 0.8, -B / 2 + 0.6, L * 0.5, B - 1.2, 0.8, DECK);
      box(-L * 0.12, -B * 0.24, L * 0.26, B * 0.48, 0.6, '#fff');
      // the boom swings to leeward: far out on a run, close in when the wind is ahead
      const a = WIND - v.h, side = Math.sin(a) >= 0 ? 1 : -1, out = 0.15 + 1.15 * (1 + Math.cos(a)) / 2;
      const mx = L * 0.14, bl = L * 0.55, bx = mx - Math.cos(out) * bl, by = side * Math.sin(out) * bl;
      let nx = -by / bl, ny = (bx - mx) / bl; // the sail belly bulges to leeward
      if (ny * side < 0) { nx = -nx; ny = -ny; }
      ctx.beginPath(); ctx.moveTo(mx, 0);
      ctx.quadraticCurveTo((mx + bx) / 2 + nx * L * 0.12, by / 2 + ny * L * 0.12, bx, by);
      ctx.lineTo(mx, 0);
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(L / 2 - 0.4, 0);
      ctx.quadraticCurveTo(L * 0.3, side * L * 0.16, mx + 0.6, side * L * 0.05);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(mx, 0, 0.55, 0, 7); ctx.fillStyle = INK; ctx.fill();
    },
    yacht(L, B) {
      hull(L, B, 0.4); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      hull(L * 0.86, B * 0.78, 0.38); ctx.fillStyle = DECK; ctx.fill();
      box(-L * 0.3, -B * 0.3, L * 0.48, B * 0.6, 1.2, '#fff');
      ctx.beginPath(); ctx.moveTo(L * 0.15, -B * 0.22); ctx.lineTo(L * 0.15, B * 0.22); ctx.stroke();
    },
    superyacht(L, B) {
      hull(L, B, 0.38); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      hull(L * 0.9, B * 0.8, 0.36); ctx.fillStyle = DECK; ctx.fill();
      box(-L * 0.34, -B * 0.34, L * 0.62, B * 0.68, 1.6, '#fff');
      box(-L * 0.2, -B * 0.24, L * 0.38, B * 0.48, 1.2, '#fff');
      ctx.beginPath(); ctx.moveTo(L * 0.16, -B * 0.2); ctx.quadraticCurveTo(L * 0.21, 0, L * 0.16, B * 0.2); ctx.stroke();
    },
    ferry(L, B) {
      hull(L, B, 0.24); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      box(-L * 0.46, -B * 0.36, L * 0.62, B * 0.72, 1, DECK_GREY);
      box(L * 0.08, -B * 0.4, L * 0.16, B * 0.8, 1.2, '#fff');
      ctx.beginPath();
      for (let i = 1; i < 4; i++) { ctx.moveTo(-L * 0.42, -B * 0.36 + i * B * 0.18); ctx.lineTo(L * 0.1, -B * 0.36 + i * B * 0.18); }
      ctx.globalAlpha *= 0.35; ctx.stroke(); ctx.globalAlpha /= 0.35;
    },
    fast(L, B) {
      hull(L, B, 0.3); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      box(-L * 0.46, -B * 0.32, L * 0.2, B * 0.64, 0.8, DECK_GREY);
      box(-L * 0.24, -B * 0.4, L * 0.52, B * 0.8, 2.2, '#fff');
      ctx.beginPath(); ctx.moveTo(L * 0.22, -B * 0.3); ctx.quadraticCurveTo(L * 0.29, 0, L * 0.22, B * 0.3);
      ctx.lineWidth *= 2.2; ctx.stroke(); ctx.lineWidth /= 2.2;
    },
    trawler(L, B) {
      // outrigger booms and the stern gantry under the hull
      ctx.beginPath();
      ctx.moveTo(L * 0.05, -B * 0.3); ctx.lineTo(-L * 0.12, -B * 1.3);
      ctx.moveTo(L * 0.05, B * 0.3); ctx.lineTo(-L * 0.12, B * 1.3);
      ctx.stroke();
      hull(L, B, 0.4); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      box(-L / 2 + 0.8, -B / 2 + 0.7, L * 0.5, B - 1.4, 0.4, DECK_GREY);
      box(L * 0.02, -B * 0.3, L * 0.22, B * 0.6, 0.6, '#fff');
      ctx.beginPath(); ctx.moveTo(-L / 2 + 1.2, -B * 0.5); ctx.lineTo(-L / 2 + 1.2, B * 0.5); ctx.stroke();
    },
  };
  const drawVessel = (v) => {
    ctx.save();
    ctx.translate(v.x, v.y); ctx.rotate(v.h); ctx.scale(k, k);
    ctx.globalAlpha = v.alpha;
    ctx.lineWidth = (0.7 * u) / k;
    ctx.strokeStyle = INK; ctx.lineJoin = 'round';
    SHAPES[v.type](v.L, v.B, v);
    ctx.restore();
  };

  const drawWake = (v, t) => {
    const n = v.wake.length;
    if (n < 2) return;
    ctx.strokeStyle = FOAM;
    for (const side of [1, -1, 0]) {
      for (let i = 1; i < n; i++) {
        const a = v.wake[i - 1], b = v.wake[i];
        const age = t - b.t;
        if (age > WAKE_S) continue;
        // Kelvin wake: the arms open at about 19.5 degrees (tan = 0.35) behind the stern
        const wa = side * (v.B * k * 0.5 + (t - a.t) * a.v * 0.35), wb = side * (v.B * k * 0.5 + age * b.v * 0.35);
        const ax = a.x - a.ny * wa, ay = a.y + a.nx * wa, bx = b.x - b.ny * wb, by = b.y + b.nx * wb;
        if (coast(ax, ay) < 2 || coast(bx, by) < 2) continue;
        const f = (1 - age / WAKE_S) ** 1.6 * Math.min(1, b.v / 6);
        ctx.globalAlpha = (side ? 0.5 : 0.28) * f * Math.min(a.alpha, b.alpha);
        ctx.lineWidth = side ? 0.9 * u : (v.B * k * 0.45) * (0.6 + 0.4 * f);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  };

  const drawWaves = (t) => {
    ctx.strokeStyle = FOAM; ctx.lineCap = 'round';
    ctx.lineWidth = 0.9 * u;
    for (const w of waves) {
      if (!w.life) continue;
      const f = Math.sin(Math.PI * (w.age / w.life)) ** 1.5;
      const n1 = noise(w.x * 0.01, w.y * 0.01, t * 0.15), n2 = noise(w.x * 0.013 + 40, w.y * 0.013, t * 0.11);
      const alpha = (0.12 + 0.3 * w.e) * f * (0.5 + 0.5 * n1);
      if (alpha < 0.01) continue;
      const len = (7 + 9 * (n2 + 1)) * (0.45 + 0.55 * w.e) * kw;
      const turn = 0.3 * n1; // crests lie across the swell, turned a little by the noise
      const cx = -SWELL.y * Math.cos(turn) - SWELL.x * Math.sin(turn), cy = SWELL.x * Math.cos(turn) - SWELL.y * Math.sin(turn);
      const hx = cx * len / 2, hy = cy * len / 2;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(w.x - hx, w.y - hy);
      ctx.quadraticCurveTo(w.x + SWELL.x * len * 0.14, w.y + SWELL.y * len * 0.14, w.x + hx, w.y + hy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const drawCars = () => {
    ctx.lineWidth = 0.6 * u / kc;
    ctx.strokeStyle = INK;
    for (const c of cars) {
      if (!c.alive) continue;
      ctx.save();
      ctx.translate(c.x, c.y); ctx.rotate(c.h); ctx.scale(kc, kc);
      ctx.globalAlpha = c.alpha;
      ctx.beginPath(); ctx.roundRect(-3, -1.5, 6, 3, 1.1);
      ctx.fillStyle = c.color; ctx.fill(); ctx.stroke();
      ctx.fillStyle = c.light ? 'rgb(15 36 51 / .6)' : 'rgb(233 251 250 / .7)';
      ctx.fillRect(0.7, -1.05, 1.1, 2.1);
      ctx.restore();
    }
  };

  function draw(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * tx, dpr * ty);
    drawWaves(t);
    for (const v of vessels) drawWake(v, t);
    for (const v of moored) drawVessel(v);
    for (const v of vessels) drawVessel(v);
    drawCars();
  }

  // simulation -----------------------------------------------------------------------------------------
  let nextSpawn = 0;
  const step = (dt, t) => {
    for (const w of waves) {
      w.age += dt;
      w.x += SWELL.x * 5 * w.e * dt; w.y += SWELL.y * 5 * w.e * dt;
      if (w.age >= w.life || coast(w.x, w.y) < 3) seedWave(w, t, false);
    }
    if ((nextSpawn -= dt) <= 0) {
      if (vessels.length < 14) spawn(false);
      nextSpawn = 1.5 - Math.log(1 - Math.random()) * 5; // random intervals, about one vessel each 6.5 s
    }
    for (const v of vessels) {
      v.age += dt;
      // slow down near a quay or the marina, speed up when leaving one
      const left = v.p.len - v.s;
      v.vDes = v.v * Math.min(v.innerEnd ? Math.max(0.25, left / 90) : 1, v.innerStart ? Math.max(0.3, v.s / 90) : 1);
      predict(v, 12);
    }
    for (const v of vessels) {
      move(v, Math.min(v.vDes, speedLimit(v, vessels, 3)), v.v * 0.3, v.v * 1.5, dt);
      placeVessel(v);
      if ((v.wakeT -= dt) <= 0) {
        v.wakeT = 0.12;
        v.wake.push({ x: v.x - Math.cos(v.h) * v.l * 0.5, y: v.y - Math.sin(v.h) * v.l * 0.5,
          nx: Math.cos(v.h), ny: Math.sin(v.h), v: v.cur, t, alpha: v.alpha });
      }
      while (v.wake.length && t - v.wake[0].t > WAKE_S) v.wake.shift();
    }
    vessels = vessels.filter((v) => v.s < v.p.len);
    for (const c of cars) {
      if (!c.alive) enter(c, false);
      if (c.alive) { c.vDes = c.v; predict(c, 6); }
    }
    for (const c of cars) {
      if (!c.alive) continue;
      move(c, Math.min(c.v, speedLimit(c, cars, 0.6)), 5, 30, dt);
      if (c.s >= c.p.len) { enter(c, false); if (c.alive) predict(c, 6); } // at the end of its path, the car enters again
      else placeCar(c);
    }
  };

  // run loop: only while the hero is on screen, the tab is visible, and motion is allowed
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  let running = false, raf = 0, last = 0, onScreen = true;
  const frame = (now) => {
    const t = now / 1000;
    step(Math.min(0.05, t - last), t);
    last = t;
    draw(t);
    raf = requestAnimationFrame(frame);
  };
  const sync = () => {
    const go = onScreen && !document.hidden && !still.matches;
    if (go && !running) { running = true; last = performance.now() / 1000; raf = requestAnimationFrame(frame); }
    if (!go && running) { running = false; cancelAnimationFrame(raf); }
    if (!running) draw(performance.now() / 1000);
  };

  layout();
  for (let i = 0; i < 8; i++) spawn(true);
  newCars();
  new ResizeObserver(layout).observe(canvas);
  window.matchMedia('(max-width: 640px)').addEventListener('change', layout);
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }).observe(hero);
  document.addEventListener('visibilitychange', sync);
  still.addEventListener('change', sync);
  sync();
}

initMapLabels();
initSea();
initGallery();
initCopy();
