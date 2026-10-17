/* Understand, section 4 (understand-levels.html): why every level of supertiles behaves the same. Each figure is drawn
   the first time its question is opened. Data: window.SKLV from data/levels-*.js (site/make_levels.py, from the proof
   code's exact construction); "main" is loaded with the page, the larger ones when a figure needs them.
   Coordinates are maths-style (y up); colours are the .lv tokens in site.css. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const $ = id => document.getElementById(id);
  const GR = { Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ' };
  const LG = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ' };
  const OE = n => n % 2 ? 'odd' : 'even';
  const dot = c => c === 0 ? '<i class="cd b" role="img" aria-label="black"></i>' : '<i class="cd w" role="img" aria-label="white"></i>';
  const pressed = (b, on) => b.setAttribute('aria-pressed', on ? 'true' : 'false');
  const pick = (parent, id, txt, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pick'; b.id = id; b.textContent = txt; b.onclick = fn; parent.appendChild(b); return b; };
  const ODD = { stroke: 'var(--odd)' }, EVEN = { stroke: 'var(--even)' };
  const sideStyle = (odd, w, dash) => Object.assign({}, odd ? ODD : EVEN, { 'stroke-width': w, 'stroke-dasharray': odd ? dash : '' });

  const SRC = {};
  function need(name) {
    if (window.SKLV && window.SKLV[name]) return Promise.resolve(window.SKLV[name]);
    if (!SRC[name]) SRC[name] = new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = 'data/levels-' + name + '.js';
      s.onload = () => ok(window.SKLV[name]); s.onerror = fail; document.head.appendChild(s);
    });
    return SRC[name];
  }
  const M = window.SKLV.main, D = M.asm;
  const MAXM = 7;
  let m = 1;   // the level of the children, shared by the figures with a level stepper

  // ---- a real Δ's eight children, every side with its number of edges
  const asm = { };
  function initAsm() {
    const all = D.kids.flatMap(k => k.v), xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const pad = 2.2, x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    const S = 760 / (x1 - x0); asm.P = p => [(p[0] - x0) * S, (y1 - p[1]) * S];
    $('l-asm').setAttribute('viewBox', `0 0 760 ${((y1 - y0) * S).toFixed(0)}`);
    asm.sides = [];   // each side once: on the outline, or shared by two children
    D.kids.forEach((k, c) => { for (let j = 0; j < 6; j++) { const t = D.st[c][j]; if (t === 'R') asm.sides.push({ c, j, rim: true }); else if (c < +t.split('.')[0]) asm.sides.push({ c, j, rim: false }); } });
  }
  function drawAsm() {
    const svg = $('l-asm'), P = asm.P, L = D.len[String(m)]; svg.replaceChildren();
    D.kids.forEach(k => el('polygon', { points: k.v.map(P).map(p => p.join(',')).join(' '), fill: 'var(--fill)' }, svg));
    let flips = 0;
    for (const s of asm.sides) {
      const k = D.kids[s.c], a = P(k.v[s.j]), b = P(k.v[(s.j + 1) % 6]), len = L[k.kind][s.j], odd = len % 2 === 1;
      if (D.len['1'][k.kind][s.j] % 2 !== len % 2) flips++;
      el('line', Object.assign({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], 'stroke-linecap': 'round' }, sideStyle(odd, s.rim ? 2.5 : 6, s.rim ? '6 4' : '12 7')), svg);
      s.mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; s.len = len; s.odd = odd;
      const C = P([k.v.reduce((t, p) => t + p[0], 0) / 6, k.v.reduce((t, p) => t + p[1], 0) / 6]);
      const dx = s.mid[0] - C[0], dy = s.mid[1] - C[1], dl = Math.hypot(dx, dy) || 1;   // outline labels pushed outwards
      s.lab = s.rim ? [s.mid[0] + dx / dl * 18, s.mid[1] + dy / dl * 18] : s.mid;
    }
    D.kids.forEach(k => { const C = P([k.v.reduce((t, p) => t + p[0], 0) / 6, k.v.reduce((t, p) => t + p[1], 0) / 6]); el('text', { x: C[0], y: C[1] + 9, 'text-anchor': 'middle', 'font-size': 28, fill: 'var(--muted)' }, svg).textContent = GR[k.kind]; });
    for (const s of asm.sides) {
      const txt = String(s.len), w = 10 + txt.length * 8.4, c = s.odd ? 'var(--odd)' : 'var(--even)';
      el('rect', { x: s.lab[0] - w / 2, y: s.lab[1] - 10, width: w, height: 20, rx: 10, fill: 'var(--panel)', stroke: c, 'stroke-width': 1.5 }, svg);
      el('text', { x: s.lab[0], y: s.lab[1] + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: c }, svg).textContent = txt;
    }
    $('l-what').textContent = `building a level-${m + 1} Δ`;
    $('l-tally').innerHTML = m === 1 ? `Level 1: <b>${asm.sides.length}</b> sides. This assembly was computed outright, ribbon by ribbon.`
      : `Level ${m}: all <b>${asm.sides.length}</b> sides are longer than at level 1, and <b>${flips}</b> changed from odd to even or back. To the ribbons it looks like level 1.`;
  }

  // ---- the dominoes: one per level; with children at level m, levels 1 to m have fallen
  const doms = [];
  function initDominoes() {
    const svg = $('l-dom'), N = 9, gap = 86, bw = 34, bh = 120, base = 160, x00 = 60;
    for (let i = 0; i < N; i++) {
      const r = el('rect', { class: 'dom', x: x00 + i * gap, y: base - bh, width: bw, height: bh, rx: 4, fill: 'var(--fill)', stroke: 'var(--fg)', 'stroke-width': 1.5 }, svg);
      r.style.transformOrigin = (x00 + i * gap + bw) + 'px ' + base + 'px';
      el('text', { x: x00 + i * gap + bw / 2, y: base + 22, 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--muted)' }, svg).textContent = 'level ' + (i + 1);
      doms.push(r);
    }
    el('line', { x1: 20, y1: base, x2: 840, y2: base, stroke: 'var(--rule)', 'stroke-width': 2 }, svg);
    el('text', { x: x00 - 6, y: base - bh - 12, 'font-size': 13, 'font-weight': 700, fill: '#56B4E9' }, svg).textContent = 'computed';
    el('text', { x: 836, y: base - 40, 'text-anchor': 'end', 'font-size': 28, fill: 'var(--muted)' }, svg).textContent = '…';
  }
  function drawDominoes() {
    doms.forEach((r, i) => { r.style.transform = i < m ? 'rotate(25deg)' : 'rotate(0deg)'; r.setAttribute('fill', i <= m ? 'color-mix(in srgb, #56B4E9 24%, var(--fill))' : 'var(--fill)'); });
  }

  // ---- a level-2 Δ with every tile corner coloured; one side split into its children's sides
  const C2 = M.cols; let CJ = 0;
  function initCols() { C2.sides.forEach((sd, k) => pick($('l-colPick'), 'l-cs' + k, 'side ' + k + ' · ' + LG[sd.l], () => { CJ = k; drawCols(); })); }
  function drawCols() {
    C2.sides.forEach((_, k) => pressed($('l-cs' + k), k === CJ));
    const svg = $('l-cols'); svg.replaceChildren();
    const all = C2.tiles.flat(), xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const pad = 2.4, x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    const k = 760 / (x1 - x0), P = p => [((p[0] - x0) * k).toFixed(1), ((y1 - p[1]) * k).toFixed(1)];
    svg.setAttribute('viewBox', `0 0 760 ${((y1 - y0) * k).toFixed(0)}`);
    const pl = (pts, a) => el('polyline', Object.assign({ points: pts.map(p => P(p).join(',')).join(' '), fill: 'none' }, a), svg);
    C2.tiles.forEach(t => el('polygon', { points: t.map(p => P(p).join(',')).join(' '), fill: 'var(--fill)', stroke: 'var(--rule)', 'stroke-width': 1 }, svg));
    C2.outl.forEach(o => pl(o.concat([o[0]]), { stroke: 'var(--muted)', 'stroke-width': 1.4 }));
    const sd = C2.sides[CJ];
    sd.pieces.forEach(p => {
      pl(p.p, { stroke: 'var(--panel)', 'stroke-width': 10, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      pl(p.p, Object.assign({ 'stroke-linejoin': 'round' }, sideStyle(p.n % 2 === 1, 6, '10 5')));
    });
    C2.corners.forEach(([x, y, c]) => { const [cx, cy] = P([x, y]); el('circle', { cx, cy, r: 2.6, fill: c === 0 ? 'var(--cb)' : 'var(--cw)', stroke: 'var(--cs)', 'stroke-width': 0.8 }, svg); });
    const ends = [sd.pieces[0].p[0]].concat(sd.pieces.map(p => p.p[p.p.length - 1])), ecol = [sd.pieces[0].c0].concat(sd.pieces.map(p => p.c1));
    ends.forEach((e, i) => { const [cx, cy] = P(e), big = i === 0 || i === ends.length - 1; el('circle', { cx, cy, r: big ? 9 : 6.5, fill: ecol[i] === 0 ? 'var(--cb)' : 'var(--cw)', stroke: 'var(--cs)', 'stroke-width': 2.2 }, svg); });
    const flips = sd.pieces.filter(p => p.c0 !== p.c1).length;
    $('l-colSum').innerHTML = `Side ${CJ} (${LG[sd.l]}), <b class="${OE(sd.n)}">${sd.n}</b> edges, from ${dot(sd.c0)} to ${dot(sd.c1)}: ` +
      sd.pieces.map(p => `<b class="${OE(p.n)}">${LG[p.l]} ${p.n}</b> ${dot(p.c0)}→${dot(p.c1)}`).join(', ') +
      `. ${flips} change${flips === 1 ? '' : 's'} of colour, so the side is <b class="${OE(sd.n)}">${OE(sd.n)}</b>.`;
  }

  // ---- the zigzag along a run, with its corners coloured
  let ZN = 5;
  function drawZZ() {
    const svg = $('l-zz'), W = 760, mg = 60, step = (W - 2 * mg) / ZN, mid = 115, H = 230, amp = 42; svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    el('rect', { x: 0, y: 0, width: W, height: mid, fill: 'var(--surf)' }, svg);
    el('rect', { x: 0, y: mid, width: W, height: H - mid, fill: 'var(--fill)' }, svg);
    el('text', { x: 10, y: 22, 'font-size': 13, fill: 'var(--muted)' }, svg).textContent = 'supertile above';
    el('text', { x: 10, y: H - 10, 'font-size': 13, fill: 'var(--muted)' }, svg).textContent = 'supertile below';
    el('line', { x1: mg, y1: mid, x2: W - mg, y2: mid, stroke: 'var(--fg)', 'stroke-width': 2.5 }, svg);
    const rib = (startTop, col, dash) => {
      let side = startTop ? -1 : 1; const y = sd => mid + sd * amp;
      let d = `M${mg - 36},${y(side)} L${mg},${y(side)}`;
      for (let j = 0; j < ZN; j++) { const a = mg + j * step, b = a + step; d += ` C${a + step / 2},${y(side)} ${b - step / 2},${y(-side)} ${b},${y(-side)}`; side = -side; }
      el('path', { d: d + ` L${W - mg + 36},${y(side)}`, fill: 'none', stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': dash ? '10 7' : '' }, svg);
      return side;
    };
    const endB = rib(true, 'var(--long)', false); rib(false, 'var(--short)', true);
    for (let i = 0; i <= ZN; i++) el('circle', { cx: mg + i * step, cy: mid, r: 8, fill: i % 2 === 0 ? 'var(--cb)' : 'var(--cw)', stroke: 'var(--cs)', 'stroke-width': 2.2 }, svg);
    $('l-zzN').textContent = ZN;
    $('l-zzSum').innerHTML = `The run starts at ${dot(0)} and ends at ${dot(ZN % 2)}, so it is <b class="${OE(ZN)}">${OE(ZN)}</b>. The blue ribbon, which went in above, comes out <b>${endB < 0 ? 'above' : 'below'}</b>: above at a ${dot(0)} end, below at a ${dot(1)} end.`;
  }
  function initZZ() {
    $('l-zzUp').onclick = () => { if (ZN < 9) { ZN++; drawZZ(); } };
    $('l-zzDn').onclick = () => { if (ZN > 1) { ZN--; drawZZ(); } };
  }

  // ---- a tile, a level-1 and a level-2 supertile: the key corners' colours
  let LV = null, LK = 'Delta';
  function panel(svg, d, o) {
    svg.replaceChildren();
    const all = d.tiles.flat(), xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)), pad = span * 0.09;
    const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    const k = 400 / (x1 - x0), P = p => [(p[0] - x0) * k, (y1 - p[1]) * k], pts = Q => Q.map(p => P(p).map(v => v.toFixed(1)).join(',')).join(' ');
    svg.setAttribute('viewBox', `0 0 400 ${((y1 - y0) * k).toFixed(0)}`);
    d.tiles.forEach(t => el('polygon', { points: pts(t), fill: 'var(--fill)', stroke: 'var(--rule)', 'stroke-width': o.tw }, svg));
    (d.outl || []).forEach(q => el('polygon', { points: pts(q), fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.6 }, svg));
    d.corners.forEach(([x, y, c]) => { const [cx, cy] = P([x, y]); el('circle', { cx, cy, r: o.r, fill: c === 0 ? 'var(--cb)' : 'var(--cw)', stroke: 'var(--cs)', 'stroke-width': o.r > 3 ? 1.6 : 0.8 }, svg); });
    const cx0 = (Math.min(...xs) + Math.max(...xs)) / 2, cy0 = (Math.min(...ys) + Math.max(...ys)) / 2;
    const halo = { stroke: 'var(--panel)', 'stroke-width': 3.5, 'paint-order': 'stroke', 'stroke-linejoin': 'round' };
    (o.key || []).forEach(([x, y, c], i) => {
      const [cx, cy] = P([x, y]); el('circle', { cx, cy, r: 8, fill: c === 0 ? 'var(--cb)' : 'var(--cw)', stroke: 'var(--cs)', 'stroke-width': 2.4 }, svg);
      const dx = x - cx0, dy = y - cy0, dd = Math.hypot(dx, dy) || 1, [tx, ty] = P([x + dx / dd * span * 0.055, y + dy / dd * span * 0.055]);
      el('text', Object.assign({ x: tx, y: ty + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: 'var(--fg)' }, halo), svg).textContent = String(i);
    });
    [o.A, o.B].forEach(q => { if (!q) return; const [cx, cy] = P(q); el('circle', { cx, cy, r: 12, fill: 'none', stroke: 'var(--ring)', 'stroke-width': 2.4 }, svg); el('circle', { cx, cy, r: 6, fill: q[2] === 0 ? 'var(--cb)' : 'var(--cw)', stroke: 'var(--cs)', 'stroke-width': 2 }, svg); });
    if (o.A && o.B) {   // A and B labelled on the sides away from each other
      const [ax, ay] = P(o.A), [bx, by] = P(o.B), ux = ax - bx, uy = ay - by, ul = Math.hypot(ux, uy) || 1;
      [['A', ax + ux / ul * 22, ay + uy / ul * 22], ['B', bx - ux / ul * 22, by - uy / ul * 22]].forEach(([nm, x, y]) =>
        el('text', Object.assign({ x, y: y + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: 'var(--ring)' }, halo), svg).textContent = nm);
    }
  }
  function initLevels(data) { LV = data; Object.keys(LV.kinds).forEach(K => pick($('l-lvPick'), 'l-lk-' + K, GR[K], () => { LK = K; drawLevels(); })); }
  function drawLevels() {
    Object.keys(LV.kinds).forEach(K => pressed($('l-lk-' + K), K === LK));
    const tp = LV.tile.pts, tc = tp.map((p, i) => [p[0], p[1], i % 2]);
    panel($('l-lv0'), { tiles: [tp], corners: tc }, { tw: 2, r: 5, A: tc[0], B: tc[1] });
    $('l-lv0s').innerHTML = `corners ${tc.map(c => dot(c[2])).join('')}<br>A = v0 ${dot(0)}, B = v1 ${dot(1)}`;
    for (const k of ['1', '2']) {
      const d = LV.kinds[LK][k];
      panel($('l-lv' + k), d, { tw: k === '1' ? 1.4 : 0.7, r: k === '1' ? 3.2 : 1.7, key: d.key, A: d.A, B: d.B });
      $('l-lv' + k + 's').innerHTML = `${GR[LK]}, corners 0–5: <b>${d.key.map(c => dot(c[2])).join('')}</b><br>A ${dot(d.A[2])}, B ${dot(d.B[2])}`;
    }
  }

  // ---- following corners down: the four loops, and any corner's chain
  const CR = M.rule, nm = key => GR[key.replace(/\d$/, '')] + key.slice(-1);
  let CK = 'Delta1';
  function initFollow() {
    const svg = $('l-loops'), W = 800, H = 250; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const mk = el('marker', { id: 'l-ah', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, el('defs', {}, svg));
    el('path', { d: 'M0,0L10,5L0,10z', fill: 'var(--fg)' }, mk);
    const node = (x, y, key, sub) => {
      const c = CR.col[key];
      el('circle', { cx: x, cy: y, r: 24, fill: c === 0 ? 'var(--cb)' : 'var(--cw)', stroke: 'var(--cs)', 'stroke-width': 2.4 }, svg);
      el('text', { x, y: y + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: c === 0 ? 'var(--cw)' : 'var(--cb)' }, svg).textContent = nm(key);
      if (sub) el('text', { x, y: y + 44, 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--muted)' }, svg).textContent = sub;
    };
    const line = d => el('path', { d, fill: 'none', stroke: 'var(--fg)', 'stroke-width': 1.8, 'marker-end': 'url(#l-ah)' }, svg);
    const self = (x, y) => line(`M${x - 12},${y - 21} C${x - 30},${y - 70} ${x + 30},${y - 70} ${x + 12},${y - 21}`);
    const arc = (x1, y1, x2, y2, bend) => line(`M${x1},${y1} Q${(x1 + x2) / 2},${(y1 + y2) / 2 + bend} ${x2},${y2}`);
    const tl = k => 'tile v' + CR.tile0[k];
    node(70, 100, 'Gamma0', tl('Gamma0')); self(70, 100);
    node(200, 100, 'Phi3', tl('Phi3')); self(200, 100);
    node(330, 100, 'Psi2', tl('Psi2')); self(330, 100);
    node(540, 100, 'Pi4', tl('Pi4')); node(690, 100, 'Xi3', tl('Xi3'));
    arc(564, 92, 666, 92, -34); arc(666, 108, 564, 108, 34);
    node(375, 215, 'Pi2', null); arc(366, 194, 342, 122, 0);          // corners that lead into the loops
    node(450, 215, 'Theta3', null); arc(462, 195, 522, 121, 0);
    node(770, 215, 'Lambda4', null); arc(755, 197, 707, 120, 0);
    el('text', { x: 10, y: 22, 'font-size': 13, fill: 'var(--muted)' }, svg).textContent = 'an arrow: "is the same point as": a corner → the child corner it is';
    const grid = $('l-cgrid');
    grid.innerHTML = '<tr><th></th>' + [0, 1, 2, 3, 4, 5].map(j => `<th>${j}</th>`).join('') + '</tr>' + CR.kinds.map(K => `<tr><th>${GR[K]}</th>` +
      [0, 1, 2, 3, 4, 5].map(j => { const k = K + j, n = CR.next[k]; return `<td><button type="button" id="l-cg-${k}" aria-label="${GR[K]} corner ${j}">${dot(CR.col[k])} <span>→${GR[n[1]]}${n[2]}</span></button></td>`; }).join('') + '</tr>').join('');
    CR.kinds.forEach(K => [0, 1, 2, 3, 4, 5].forEach(j => { $('l-cg-' + K + j).onclick = () => { CK = K + j; drawChain(); }; }));
  }
  function drawChain() {
    $('l-cgrid').querySelectorAll('button').forEach(b => pressed(b, b.id === 'l-cg-' + CK));
    let key = CK; const parts = [];
    for (let L = 5; L >= 1; L--) { parts.push(`level ${L}: ${nm(key)}`); if (L > 1) { const n = CR.next[key]; key = n[1] + n[2]; } }
    const tc = CR.tile[key];
    $('l-chain').innerHTML = `${nm(CK)} at level 5 → ` + parts.slice(1).join(' → ') + ` → a tile&rsquo;s corner <b>v${tc}</b>: <b>${tc % 2 ? 'white' : 'black'}</b> ${dot(tc % 2)} at every level.`;
  }

  // ---- zoom into a loop's corner on the real tiles
  const ZNAMES = { Gamma0: 'Γ corner 0 (A)', Phi3: 'Φ corner 3', Psi2: 'Ψ corner 2', Pi4: 'Π corner 4 ⇄ Ξ corner 3', Delta1: 'Δ corner 1 (leads into the Π/Ξ loop)' };
  const ZW = 760, ZH = 520;
  let ZC = null, ZK = 'Psi2', ZU = 0, zTimer = null, zState = null;
  function initZoom(data) {
    ZC = data; $('l-zm').setAttribute('viewBox', `0 0 ${ZW} ${ZH}`);
    Object.keys(ZNAMES).forEach(k => pick($('l-zmPick'), 'l-zk-' + k, ZNAMES[k], () => { ZK = k; zStop(); zBuild(); }));
    $('l-zmU').oninput = e => { zStop(); ZU = e.target.value / 1000; zDraw(); };
    $('l-zmPlay').onclick = () => {
      if (zTimer) { zStop(); return; }
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { ZU = ZU < 1 ? 1 : 0; zDraw(); return; }
      if (ZU >= 1) ZU = 0;
      $('l-zmPlay').textContent = '❚❚ pause';
      let last = null;
      const tick = t => { if (last !== null) ZU = Math.min(1, ZU + (t - last) / 9000); last = t; zDraw(); if (ZU < 1) zTimer = requestAnimationFrame(tick); else zStop(); };
      zTimer = requestAnimationFrame(tick);
    };
  }
  function zBuild() {
    Object.keys(ZNAMES).forEach(k => pressed($('l-zk-' + k), k === ZK));
    const svg = $('l-zm'); svg.replaceChildren();
    const ch = ZC[ZK], p = ch.p, g = el('g', {}, svg), L = ch.levels;
    const dist = pts => Math.max(...pts.map(q => Math.hypot(q[0] - p[0], q[1] - p[1])));
    const poly = (pts, a) => el('polygon', Object.assign({ points: pts.map(q => q[0] + ',' + q[1]).join(' '), 'vector-effect': 'non-scaling-stroke' }, a), g);
    const ext = [dist(L[0].rim)], labs = [];
    poly(L[0].rim, { fill: 'color-mix(in srgb, var(--long) 7%, var(--panel))', stroke: 'var(--fg)', 'stroke-width': 2.4 });
    L.forEach((lv, i) => {
      const sw = [1.9, 1.4, 1.0, 0.7][i] || 0.7, tint = [14, 22, 31, 42][i] || 42;
      lv.kids.forEach((kd, c) => { if (c !== lv.hit) poly(kd.p, { fill: 'none', stroke: 'var(--muted)', 'stroke-width': sw }); });
      const hk = lv.kids[lv.hit]; ext.push(dist(hk.p));
      poly(hk.p, { fill: `color-mix(in srgb, var(--long) ${tint}%, var(--panel))`, stroke: 'var(--fg)', 'stroke-width': sw + 0.6 });
    });
    // each nested supertile's kind, where it reaches furthest from the corner, kept the same size on screen
    const dolls = [{ pts: L[0].rim, txt: GR[L[0].kind] + ' level 4' }].concat(L.map(lv => ({ pts: lv.kids[lv.hit].p, txt: lv.m > 1 ? GR[lv.next[0]] + ' level ' + (lv.m - 1) : 'tile' })));
    dolls.forEach(d => {
      const far = d.pts.reduce((a, q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > Math.hypot(a[0] - p[0], a[1] - p[1]) ? q : a, d.pts[0]);
      const at = [p[0] + (far[0] - p[0]) * 0.55, p[1] + (far[1] - p[1]) * 0.55];
      const t = el('text', { x: at[0], y: -at[1], 'text-anchor': 'middle', 'font-weight': 700, fill: 'var(--fg)', stroke: 'var(--panel)', 'paint-order': 'stroke', transform: 'scale(1,-1)' }, g);
      t.textContent = d.txt; labs.push(t);
    });
    let dx = 0, dy = 0;   // put the corner off centre, away from where the supertiles lie
    dolls.forEach(d => { const cx = d.pts.reduce((t, q) => t + q[0], 0) / d.pts.length - p[0], cy = d.pts.reduce((t, q) => t + q[1], 0) / d.pts.length - p[1], n = Math.hypot(cx, cy) || 1; dx += cx / n; dy += cy / n; });
    const dn = Math.hypot(dx, dy) || 1, sh = 0.3 * 0.46 * Math.min(ZW, ZH), off = [-dx / dn * sh, dy / dn * sh];
    const c0 = ch.tilecorner.slice(1) % 2;
    el('circle', { cx: ZW / 2 + off[0], cy: ZH / 2 + off[1], r: 9, fill: c0 === 0 ? 'var(--cb)' : 'var(--cw)', stroke: 'var(--cs)', 'stroke-width': 2.5 }, svg);
    el('circle', { cx: ZW / 2 + off[0], cy: ZH / 2 + off[1], r: 15, fill: 'none', stroke: 'var(--ring)', 'stroke-width': 2.5 }, svg);
    zState = { g, p, ext, labs, c0, off };
    zDraw();
  }
  function zDraw() {
    const { g, p, ext, labs, c0, off } = zState, R = 0.46 * Math.min(ZW, ZH) * 1.25;
    const s0 = R / ext[0], s1 = R / ext[ext.length - 1], sc = s0 * Math.pow(s1 / s0, ZU);
    g.setAttribute('transform', `translate(${ZW / 2 + off[0]},${ZH / 2 + off[1]}) scale(${sc},${-sc}) translate(${-p[0]},${-p[1]})`);
    labs.forEach((t, i) => { t.setAttribute('font-size', (15 / sc).toFixed(4)); t.setAttribute('stroke-width', (3.5 / sc).toFixed(4)); t.setAttribute('display', ext[i] * sc < 70 ? 'none' : 'inline'); });
    let cur = 0; ext.forEach((e, i) => { if (R / e <= sc * 1.0001) cur = i; });
    const L = ZC[ZK].levels, steps = [`${GR[L[0].kind]} corner ${L[0].corner}`].concat(L.map(lv => lv.m > 1 ? `${GR[lv.next[0]]} corner ${lv.next[1]}` : `tile corner ${lv.next[1]}`));
    $('l-zmCap').innerHTML = steps.map((t, i) => (i === cur ? `<b>${t}</b>` : t)).join(' = ') + ` &nbsp;·&nbsp; the same point, <b>${c0 === 0 ? 'black' : 'white'}</b> ${dot(c0)}, at every level.`;
    $('l-zmU').value = Math.round(ZU * 1000);
  }
  function zStop() { if (zTimer) { cancelAnimationFrame(zTimer); zTimer = null; } $('l-zmPlay').textContent = '▶ zoom in'; }

  // ---- the Fibonacci numbers, with each type of side hopping three places per level
  const F = [0, 1]; for (let i = 0; i < 40; i++) F.push(F[F.length - 1] + F[F.length - 2]);
  const FORM = { alpha: { k: 2, add: 2, mul: 1, txt: 'F(3m+2) + 2' }, beta: { k: 1, add: 2, mul: 1, txt: 'F(3m+1) + 2' }, gamma: { k: 2, add: 0, mul: 2, txt: '2 × F(3m+2)' },
    delta: { k: 2, add: 0, mul: 2, txt: '2 × F(3m+2)' }, epsilon: { k: 3, add: 0, mul: 1, txt: 'F(3m+3)' }, zeta: { k: 1, add: 0, mul: 2, txt: '2 × F(3m+1)' },
    eta: { k: 2, add: 0, mul: 2, txt: '2 × F(3m+2)' }, theta: { k: 4, add: -2, mul: 1, txt: 'F(3m+4) − 2' } };
  let LET = 'epsilon';
  function initFib() {
    D.order.forEach(x => pick($('l-letPick'), 'l-let-' + x, LG[x] + ' sides', () => { LET = x; drawFib(); }));
    for (const x of D.order) for (let mm = 1; mm <= 8; mm++) if (FORM[x].mul * F[3 * mm + FORM[x].k] + FORM[x].add !== D.L[String(mm)][D.order.indexOf(x)]) throw new Error('Fibonacci form of ' + x);
  }
  function drawFib() {
    D.order.forEach(x => pressed($('l-let-' + x), x === LET));
    const svg = $('l-fib'); svg.replaceChildren();
    const N = $('l-fib').parentNode.clientWidth < 640 ? 13 : 19, cw = 44, x0 = 14, W = x0 * 2 + N * cw, yb = 70, fm = FORM[LET], hops = [1, 2, 3, 4, 5].map(mm => 3 * mm + fm.k).filter(i => i <= N);
    svg.setAttribute('viewBox', `0 0 ${W} 190`);
    const mk = el('marker', { id: 'l-fah', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, el('defs', {}, svg));
    el('path', { d: 'M0,0L10,5L0,10z', fill: 'var(--fg)' }, mk);
    for (let i = 1; i <= N; i++) {
      const x = x0 + (i - 1) * cw, odd = F[i] % 2 === 1, on = hops.includes(i), c = odd ? 'var(--odd)' : 'var(--even)';
      if ((i - 1) % 6 < 3) el('rect', { x: x - 2, y: 20, width: cw, height: 120, fill: 'var(--surf)' }, svg);
      el('rect', { x: x + 2, y: yb - 16, width: cw - 8, height: 32, rx: 6, fill: 'var(--panel)', stroke: c, 'stroke-width': on ? 3.5 : 1.5, 'stroke-dasharray': odd ? '6 3' : '' }, svg);
      el('text', { x: x + cw / 2 - 2, y: yb + 5, 'text-anchor': 'middle', 'font-size': F[i] > 999 ? 10.5 : 12.5, 'font-weight': on ? 800 : 500, fill: c }, svg).textContent = F[i];
      el('text', { x: x + cw / 2 - 2, y: 38, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--muted)' }, svg).textContent = 'F' + i;
    }
    hops.forEach((i, n) => {
      const x = x0 + (i - 1) * cw + cw / 2 - 2;
      el('text', { x, y: yb + 42, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: 'var(--fg)' }, svg).textContent = 'level ' + (n + 1);
      if (n) { const xp = x - 3 * cw; el('path', { d: `M${xp},${yb + 52} Q${(xp + x) / 2},${yb + 92} ${x},${yb + 52}`, fill: 'none', stroke: 'var(--fg)', 'stroke-width': 1.5, 'marker-end': 'url(#l-fah)' }, svg); }
    });
    const lens = [1, 2, 3, 4, 5].map(mm => fm.mul * F[3 * mm + fm.k] + fm.add);
    $('l-fibSum').innerHTML = `<b>${LG[LET]}</b> sides have <b>${fm.txt}</b> edges at level m: ` + lens.map(n => `<b class="${OE(n)}">${n}</b>`).join(', ') + `, … always <b class="${OE(lens[0])}">${OE(lens[0])}</b>.`;
  }

  // ---- long and short bricks: L -> L S, S -> L; every third round is a level
  let rounds = 3; const RMAX = 6, UL = 8, US = 5;
  const words = [['L']]; for (let r = 0; r < RMAX; r++) words.push(words[r].flatMap(p => p === 'L' ? ['L', 'S'] : ['L']));
  const wlen = w => w.reduce((t, p) => t + (p === 'L' ? UL : US), 0);
  function initBricks() {
    $('l-fstep').onclick = () => { if (rounds < RMAX) { rounds++; drawBricks(); } };
    $('l-flev').onclick = () => { rounds = Math.min(RMAX, rounds + 3); drawBricks(); };
    $('l-freset').onclick = () => { rounds = 0; drawBricks(); };
  }
  function drawBricks() {
    const svg = $('l-rows'); svg.replaceChildren();
    const W = 760, left = 92, sc = (W - left - 70) / wlen(words[RMAX]), rh = 24, gap = 30, top = 18, H = top + (rounds + 1) * (rh + gap) + 50;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const Y = r => top + r * (rh + gap), ie = D.order.indexOf('epsilon');
    for (let r = 0; r <= rounds; r++) {
      const w = words[r], y = Y(r), lev = r % 3 === 0;
      if (lev) el('rect', { x: 2, y: y - 6, width: W - 4, height: rh + 12, rx: 6, fill: 'var(--surf)' }, svg);
      el('text', { x: 8, y: y + 16, 'font-size': 12.5, fill: 'var(--muted)' }, svg).textContent = 'round ' + r;
      if (lev) el('text', { x: 8, y: y + 31, 'font-size': 12, 'font-weight': 700, fill: 'var(--fg)' }, svg).textContent = 'level ' + (r / 3 + 1);
      let x = left;
      w.forEach((p, i) => {
        const pw = (p === 'L' ? UL : US) * sc, col = p === 'L' ? 'var(--long)' : 'var(--short)';
        el('rect', { x: x + 0.5, y, width: pw - 1, height: rh, rx: 3, fill: col }, svg);
        if (pw > 12) el('text', { x: x + pw / 2, y: y + 16.5, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#0a1411' }, svg).textContent = p;
        if (r < rounds) {   // what this brick becomes in the next row
          const before = words[r].slice(0, i).reduce((t, q) => t + (q === 'L' ? 2 : 1), 0), kids = p === 'L' ? 2 : 1;
          const nx0 = left + wlen(words[r + 1].slice(0, before)) * sc, nx1 = left + wlen(words[r + 1].slice(0, before + kids)) * sc;
          el('polygon', { points: `${x + 0.5},${y + rh} ${x + pw - 0.5},${y + rh} ${nx1 - 0.5},${Y(r + 1)} ${nx0 + 0.5},${Y(r + 1)}`, fill: col, opacity: 0.18 }, svg);
        }
        x += pw;
      });
      const len = wlen(w);
      el('text', { x: x + 8, y: y + 16.5, 'font-size': 13.5, 'font-weight': 700, fill: 'var(--fg)' }, svg).textContent = len + (lev && D.L[String(r / 3 + 1)][ie] === len ? ' ✓' : '');
    }
    if (rounds >= 2) {   // the newest row is the row above followed by the row above that
      const y = Y(rounds) + rh + 6, xa = left, xm = left + wlen(words[rounds - 1]) * sc, xb = left + wlen(words[rounds]) * sc;
      if (words[rounds].join('') !== words[rounds - 1].concat(words[rounds - 2]).join('')) throw new Error('not a Fibonacci row');
      const br = (a, b, txt, dy) => {
        el('path', { d: `M${a + 1},${y} v6 H${b - 1} v-6`, fill: 'none', stroke: 'var(--fg)', 'stroke-width': 1.4 }, svg);
        el('text', { x: dy ? a : (a + b) / 2, y: y + 22 + dy, 'text-anchor': dy ? 'start' : 'middle', 'font-size': 12, fill: 'var(--fg)' }, svg).textContent = txt;
      };
      const tight = (xb - xa) / 2 < 120;   // too short for the two labels side by side: the second one goes lower
      br(xa, xm, 'the row above', 0); br(xm, xb, 'the row above that', tight ? 16 : 0);
    }
    const w = words[rounds], nl = w.filter(p => p === 'L').length;
    $('l-rowsSum').innerHTML = `Round ${rounds}: ${w.length} brick${w.length === 1 ? '' : 's'} (${nl} long, ${w.length - nl} short), <b>${wlen(w)}</b> edges` +
      (rounds >= 2 ? ` = ${wlen(words[rounds - 1])} + ${wlen(words[rounds - 2])}` : '') + (rounds % 3 === 0 ? `: the ε side of a level-${rounds / 3 + 1} supertile.` : '.');
    drawGolden();
  }
  function drawGolden() {
    const svg = $('l-golden'); svg.replaceChildren();
    let x0 = 0, y0 = 0, x1 = UL, y1 = US; const sq = [], dirs = ['bottom', 'right', 'top', 'left'];
    for (let r = 1; r <= rounds; r++) {
      const w = x1 - x0, h = y1 - y0, d = dirs[(r - 1) % 4];
      if (d === 'bottom') { sq.push([x0, y0 - w, w]); y0 -= w; } else if (d === 'top') { sq.push([x0, y1, w]); y1 += w; }
      else if (d === 'right') { sq.push([x1, y0, h]); x1 += h; } else { sq.push([x0 - h, y0, h]); x0 -= h; }
    }
    const W = $('l-golden').parentNode.clientWidth < 640 ? 420 : 760, H = 350, pad = 12, k = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad - 26) / (y1 - y0));
    const ox = (W - (x1 - x0) * k) / 2, oy = (H - 26 - (y1 - y0) * k) / 2 + 26, P = (x, y) => [ox + (x - x0) * k, H - oy - (y - y0) * k];
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const box = (x, y, w, h, fill, sw, txt, ink) => {
      const [ax, ay] = P(x, y + h);
      el('rect', { x: ax, y: ay, width: w * k, height: h * k, fill, stroke: 'var(--fg)', 'stroke-width': sw }, svg);
      if (txt && Math.min(w, h) * k > 18) el('text', { x: ax + w * k / 2, y: ay + h * k / 2 + 5, 'text-anchor': 'middle', 'font-size': Math.min(15, Math.max(10, Math.min(w, h) * k / 4)), 'font-weight': 800, fill: ink || 'var(--fg)' }, svg).textContent = txt;
    };
    box(0, 0, UL, US, 'var(--short)', 1, '8×5', '#0a1411');
    sq.forEach(([x, y, s], i) => box(x, y, s, s, `color-mix(in srgb, var(--long) ${i === sq.length - 1 ? 38 : 14}%, var(--panel))`, i === sq.length - 1 ? 2.2 : 1, String(s)));
    const a = Math.max(x1 - x0, y1 - y0), b = Math.min(x1 - x0, y1 - y0);
    el('text', { x: W / 2, y: H - 6, 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--muted)' }, svg).textContent = `round ${rounds}: a ${a} × ${b} rectangle (ratio ${(a / b).toFixed(3)})`;
  }

  // ---- a level-3 Δ: a side split into its children's and grandchildren's sides
  let R3 = null, RJ = 2, RG = false;
  const pcol = l => l === 'epsilon' ? 'var(--long)' : l === 'eta' ? 'var(--short)' : 'var(--muted)';
  function initSides(data) {
    R3 = data;
    R3.sides.forEach((sd, k) => pick($('l-realPick'), 'l-rs' + k, 'side ' + k + ' · ' + LG[sd.l], () => { RJ = k; drawSides(); }));
    $('l-realC').onclick = () => { RG = false; drawSides(); };
    $('l-realG').onclick = () => { RG = true; drawSides(); };
  }
  function drawSides() {
    R3.sides.forEach((_, k) => pressed($('l-rs' + k), k === RJ)); pressed($('l-realC'), !RG); pressed($('l-realG'), RG);
    const svg = $('l-real'); svg.replaceChildren();
    const all = R3.tiles.flat(), xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const pad = 3, x0 = Math.min(...xs) - pad - 4, x1 = Math.max(...xs) + pad + 4, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    const k = 760 / (x1 - x0), P = p => [((p[0] - x0) * k).toFixed(1), ((y1 - p[1]) * k).toFixed(1)];
    svg.setAttribute('viewBox', `0 0 760 ${((y1 - y0) * k).toFixed(0)}`);
    const pl = (pts, a) => el('polyline', Object.assign({ points: pts.map(p => P(p).join(',')).join(' '), fill: 'none' }, a), svg);
    R3.tiles.forEach(t => el('polygon', { points: t.map(p => P(p).join(',')).join(' '), fill: 'var(--fill)', stroke: 'var(--rule)', 'stroke-width': 0.6 }, svg));
    R3.outl.forEach(o => pl(o.concat([o[0]]), { stroke: 'var(--muted)', 'stroke-width': 1.4 }));
    const sd = R3.sides[RJ], parts = RG ? sd.pieces.flatMap(p => p.sub) : sd.pieces, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    parts.forEach(p => {
      pl(p.p, { stroke: 'var(--panel)', 'stroke-width': RG ? 9 : 11, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      pl(p.p, { stroke: pcol(p.l), 'stroke-width': RG ? 5 : 7, 'stroke-linejoin': 'round' });
    });
    const ends = parts.map(p => p.p[0]).concat([parts[parts.length - 1].p[parts[parts.length - 1].p.length - 1]]);
    ends.forEach(e => { const [ex, ey] = P(e); el('circle', { cx: ex, cy: ey, r: RG ? 3 : 4.5, fill: 'var(--fg)' }, svg); });
    parts.forEach(p => {
      const q = p.p[Math.floor(p.p.length / 2)], dx = q[0] - cx, dy = q[1] - cy, d = Math.hypot(dx, dy) || 1, off = RG ? 2.2 : 3.2;
      const [tx, ty] = P([q[0] + dx / d * off, q[1] + dy / d * off]), anc = dx / d > 0.35 ? 'start' : dx / d < -0.35 ? 'end' : 'middle';
      el('text', { x: tx, y: +ty + 5, 'text-anchor': anc, 'font-size': RG ? 14 : 18, 'font-weight': 800, fill: pcol(p.l), stroke: 'var(--panel)', 'stroke-width': 4, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, svg).textContent = LG[p.l] + (RG ? '' : ' ' + p.n);
    });
    const cnt = ps => { const c = {}; ps.forEach(p => { c[p.l] = (c[p.l] || 0) + 1; }); return Object.entries(c).map(([l, n]) => n + ' ' + LG[l]).join(' + '); };
    $('l-realSum').innerHTML = `Side ${RJ} (${LG[sd.l]}) of the level-3 Δ, ${sd.n} edges = ` + (RG
      ? sd.pieces.map(p => `<b style="color:${pcol(p.l)}">${LG[p.l]}</b>(${p.sub.map(q => LG[q.l]).join(' ')})`).join(' ') + ` = ${cnt(parts)} grandchildren&rsquo;s sides`
      : sd.pieces.map(p => `<b style="color:${pcol(p.l)}">${LG[p.l]} ${p.n}</b>`).join(' + ') + ` = ${cnt(parts)} children&rsquo;s sides`);
  }

  // ---- a parent's side as a sum of its children's sides, and the eight recipes
  let J = 0;
  function initRecipes() { for (let k = 0; k < 6; k++) pick($('l-sidePick'), 'l-side' + k, 'side ' + k + ' · ' + LG[D.dlet[k]], () => { J = k; drawRecipes(); }); }
  function drawRecipes() {
    for (let k = 0; k < 6; k++) pressed($('l-side' + k), k === J);
    const Lm = D.len[String(m)], segs = D.pside[J].map(t => { const [c, j] = t.split('.').map(Number), kind = D.kids[c].kind; return { kind, j, n: Lm[kind][j] }; });
    const tot = segs.reduce((t, x) => t + x.n, 0), bar = $('l-bar'), sc = 740 / tot; let x = 10;
    bar.replaceChildren(); bar.setAttribute('viewBox', '0 0 760 86');
    for (const g of segs) {
      const w = g.n * sc, odd = g.n % 2 === 1, c = odd ? 'var(--odd)' : 'var(--even)';
      el('rect', { x: x + 1, y: 26, width: Math.max(w - 2, 2), height: 26, rx: 5, fill: 'var(--fill)', stroke: c, 'stroke-width': 2.5, 'stroke-dasharray': odd ? '7 4' : '' }, bar);
      el('text', { x: x + w / 2, y: 44, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: c }, bar).textContent = g.n;
      el('text', { x: x + w / 2, y: 70, 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--muted)' }, bar).textContent = GR[g.kind] + ' side ' + g.j;
      x += w;
    }
    el('text', { x: 10, y: 16, 'font-size': 13, fill: 'var(--muted)' }, bar).textContent = `side ${J} of the level-${m + 1} Δ, made of sides of its level-${m} children`;
    const nodd = segs.filter(g => g.n % 2).length;
    $('l-barSum').innerHTML = segs.map(g => `<b class="${OE(g.n)}">${g.n}</b>`).join(' + ') + ` = <b class="${OE(tot)}">${tot}</b> &nbsp;·&nbsp; ${nodd} odd part${nodd === 1 ? '' : 's'}, so the total is <b class="${OE(tot)}">${OE(tot)}</b>, as this side was at level 1 (${D.len['1'].Delta[J]}).`;
    const Lc = D.L[String(m)], Ln = D.L[String(m + 1)], idx = y => D.order.indexOf(y);
    $('l-recipes').innerHTML = D.order.map(xl => {
      const parts = Object.entries(D.rec[xl]).sort((a, b) => idx(a[0]) - idx(b[0])), res = Ln[idx(xl)];
      const chips = parts.map(([y, k]) => { const n = Lc[idx(y)]; return `<span class="chip ${OE(n)}">${k > 1 ? k + '×' : ''}<i>${LG[y]}</i>${n}</span>`; }).join(' + ');
      const odd = parts.reduce((t, [y, k]) => t + k * (Lc[idx(y)] % 2), 0);
      return `<div class="rrow"><span class="chip ${OE(res)}"><i>${LG[xl]}</i>${res}</span> = ${chips}<span class="par">${odd} odd part${odd === 1 ? '' : 's'} → ${OE(odd)} ✓</span></div>`;
    }).join('');
  }

  // ---- each figure drawn the first time its question opens; the level stepper redraws the ones that use it
  const FIGS = {
    assembly: { init: initAsm, draw: drawAsm, m: true }, dominoes: { init: initDominoes, draw: drawDominoes, m: true },
    corners: { init: initCols, draw: drawCols }, zigzag: { init: initZZ, draw: drawZZ }, levels: { data: 'corners', init: initLevels, draw: drawLevels },
    follow: { init: initFollow, draw: drawChain }, zoom: { data: 'zoom', init: initZoom, draw: zBuild }, fib: { init: initFib, draw: drawFib },
    bricks: { init: initBricks, draw: drawBricks }, sides: { data: 'sides', init: initSides, draw: drawSides }, recipes: { init: initRecipes, draw: drawRecipes, m: true }
  };
  function show(id) {
    const f = FIGS[id]; if (!f || f.state) return;
    f.state = 'loading';
    (f.data ? need(f.data) : Promise.resolve(null)).then(data => {
      f.init(data); f.draw(); f.state = 'ready';
      $(id).querySelectorAll('.wide').forEach(w => { w.scrollLeft = (w.scrollWidth - w.clientWidth) / 2; });   // a phone sees the middle first
    },
      () => { f.state = null; const t = $(id).querySelector('.tally'); if (t) t.textContent = 'The data for this picture did not load. Reload the page to try again.'; });
  }
  function redrawM() { document.querySelectorAll('.mVal').forEach(e => { e.textContent = m; }); Object.values(FIGS).forEach(f => { if (f.m && f.state === 'ready') f.draw(); }); }
  document.querySelectorAll('.mUp').forEach(b => { b.onclick = () => { if (m < MAXM) { m++; redrawM(); } }; });
  document.querySelectorAll('.mDn').forEach(b => { b.onclick = () => { if (m > 1) { m--; redrawM(); } }; });
  Object.keys(FIGS).forEach(id => { const d = $(id); d.addEventListener('toggle', () => { if (d.open) show(id); }); if (d.open) show(id); });
})();
