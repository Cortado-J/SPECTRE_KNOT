/* The Spectre Knot: the nest of blocks and their ribbons, drawn on a canvas (Scene), plus SVG snapshots for diagrams.
   Data: window.SKDATA from data/knot-data.js (made by site/make_data.py). Coordinates are maths-style (y up), so every
   drawing flips y; drawing y-down would show the mirror-image tile. */
(function () {
  'use strict';
  var D = window.SKDATA;
  var BW = 0.188, FW = 0.1;                      // ribbon border and fill widths, in tile-edge units (as on the handout)
  var C = {
    rib: '#2f6352', ribEdge: '#06100d', tile: '#10211b', tileEdge: 'rgba(205,235,220,0.16)', rim: 'rgba(205,235,220,0.28)',
    now: 'rgba(240,248,244,0.85)', mark: '#7fd6b0', hover: '#ffffff'
  };
  // strand colours: 0 is the one strand everything joins into; the first eight are colour-blind-friendly on a dark ground
  var COL = ['#E69F00', '#56B4E9', '#CC79A7', '#F0E442', '#8ab4ff', '#ff9f6b', '#e9e9e9', '#b9a6e6'];
  for (var i = 8; i < 64; i++) COL.push('hsl(' + Math.round((i * 137.5) % 360) + ',62%,' + (58 + (i % 3) * 7) + '%)');
  var LV = ['1 tile', '9 tiles', '71 tiles', '559 tiles', '4,401 tiles', '34,649 tiles'];
  var NUM = ['1', '9', '71', '559', '4,401', '34,649'];

  var P = null;
  function paths() {
    if (P) return P;
    P = { rims: D.rims.map(function (d) { return new Path2D(d); }), orig: new Path2D(D.orig), n1: new Path2D(D.n1), lv: [], runs: [] };
    D.levels.forEach(function (L) {
      P.lv.push({
        tiles: new Path2D(L.tiles),
        strands: L.strands.map(function (s) { return { p: new Path2D(s.d), ov: (s.ov || []).map(function (o) { return [new Path2D(o[0]), new Path2D(o[1])]; }), ct: s.ct, cb: s.cb, t: s.t, o: s.o, b: s.b }; })
      });
    });
    D.poly.forEach(function (pl) {
      var Q = pl.pts;
      P.runs.push(pl.runs.map(function (r) { var p = new Path2D(); p.moveTo(Q[2 * r[0]], Q[2 * r[0] + 1]); for (var j = r[0] + 1; j < r[1]; j++) p.lineTo(Q[2 * j], Q[2 * j + 1]); return { p: p, ct: r[4], cb: r[5], n: r[1] - r[0] }; }));
    });
    return P;
  }
  /* N4 and N5 have too many ribbons to draw live: a picture of every tile and ribbon (site/render45.py) sits under the
     highlighted strands. Loaded on first use; when it arrives, every scene that asked rebuilds that level's cached
     picture and redraws, and anything waiting for it (an animation about to start, see goTo) goes ahead. */
  var IMG = {}, waiting = [];
  function load45(k) {
    var I = D.img45 && D.img45[k]; if (!I) return null;
    if (!IMG[k]) {
      var im = new Image(); IMG[k] = { im: im, ok: false, done: false, then: [] };
      im.onload = im.onerror = function (e) {
        IMG[k].ok = e.type === 'load'; IMG[k].done = true;
        var w = waiting; waiting = [];
        w.forEach(function (sc) { if (sc.caches) delete sc.caches[k]; sc.draw(); });
        var t = IMG[k].then; IMG[k].then = []; t.forEach(function (fn) { fn(); });
      };
      im.src = I.src;
    }
    return IMG[k];
  }
  function img45(k, scene) {
    var G = load45(k); if (!G) return null;
    if (!G.ok && !G.done && waiting.indexOf(scene) < 0) waiting.push(scene);
    return G.ok ? { im: G.im, box: D.img45[k].box } : null;
  }
  /* run fn once the pictures for levels ks have arrived (or failed); at once if they already have */
  function after45(ks, fn) {
    var left = ks.map(load45).filter(function (G) { return G && !G.done; });
    if (!left.length) return fn();
    var n = left.length; left.forEach(function (G) { G.then.push(function () { if (--n === 0) fn(); }); });
  }
  function ease(f) { return f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2; }
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* the story told at each level, for both modes */
  function story(k, mode) {
    var st = D.stats[k];
    if (mode === 'b') {
      var nb = st.block;
      return {
        n: nb, unit: nb === 1 ? 'strand' : (k === 1 ? 'pieces' : 'strands'), block: LV[k],
        text: k === 1 ? 'The 9-tile block on its own: its ribbon is ' + nb + ' separate pieces.' :
          nb === 1 ? 'In a block of ' + LV[k] + ' the whole ribbon of the 9-tile block is one strand.' :
            'In a block of ' + LV[k] + ' the 9-tile block’s pieces lie on ' + nb + ' strands.'
      };
    }
    var n = st.tile;
    var txt = [
      'One tile. Its ribbon is 14 separate pieces, each in its own colour.',
      'Nine tiles fit together and the 14 pieces join up: now they lie on 5 strands.',
      'In 71 tiles they lie on 2 strands.',
      'In 559 tiles the tile’s whole ribbon is one strand.',
      'In 4,401 tiles it is still one strand, now passing through ' + st.tileTiles[0].toLocaleString('en-GB') + ' tiles.',
      'In 34,649 tiles the same single strand runs through ' + st.tileTiles[0].toLocaleString('en-GB') + ' tiles. Zoom out further and it stays one strand: joined pieces never come apart.'
    ][k];
    return { n: n, unit: k === 0 ? 'pieces' : (n === 1 ? 'strand' : 'strands'), block: LV[k], text: txt };
  }

  function Scene(canvas, opt) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.o = opt || {};
    this.mode = this.o.mode || 't'; this.L = this.o.level || 0; this.hov = null; this.pan = { x: 0, y: 0, z: 1 };
    this.anim = null; this.raf = 0; this.lastK = -1; this.playing = false; this.timer = 0;
    paths(); var self = this;
    this.resize(); if (!this.o.still) this.warm();
    if (typeof ResizeObserver !== 'undefined') { this.ro = new ResizeObserver(function () { self.resize(); }); this.ro.observe(canvas); }
    if (this.o.interactive) this.bind();
  }
  Scene.prototype.minLevel = function () { return this.mode === 'b' ? 1 : 0; };
  Scene.prototype.resize = function () {
    var r = this.cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    this.dpr = d; this.cv.width = Math.max(2, Math.round(r.width * d)); this.cv.height = Math.max(2, Math.round(r.height * d)); this.caches = {}; this.draw();
  };
  Scene.prototype.view = function (L) {
    L = Math.max(0, Math.min(5, L)); var W = this.cv.width, H = this.cv.height, asp = W / H, i = Math.min(4, Math.floor(L)), f = L - i;
    var pad = this.o.pad || 1.14;
    function ext(b) { return Math.max(b[2] - b[0], (b[3] - b[1]) * asp) * pad; }
    var b0 = D.boxes[i], b1 = D.boxes[i + 1];
    var w = Math.exp(Math.log(ext(b0)) * (1 - f) + Math.log(ext(b1)) * f);
    var cx = ((b0[0] + b0[2]) * (1 - f) + (b1[0] + b1[2]) * f) / 2, cy = ((b0[1] + b0[3]) * (1 - f) + (b1[1] + b1[3]) * f) / 2;
    return { w: w / this.pan.z, cx: cx + this.pan.x, cy: cy + this.pan.y };
  };
  Scene.prototype.xf = function () { var v = this.view(this.L), s = this.cv.width / v.w; return { s: s, tx: this.cv.width / 2 - v.cx * s, ty: this.cv.height / 2 + v.cy * s }; };
  Scene.prototype.colourOf = function (st) { return this.mode === 'b' ? st.cb : st.ct; };
  /* While moving, each level is drawn from a picture cached at its own resting view, scaled and crossfaded:
     cheap enough for every frame. At rest, everything is drawn as vectors, crisp at any zoom. */
  Scene.prototype.cache = function (k) {
    this.caches = this.caches || {}; var key = k + this.mode + this.cv.width + 'x' + this.cv.height;
    if (this.caches[k] && this.caches[k].key === key) return this.caches[k];
    var q = k <= 3 ? 1.5 : 1.25, cw = Math.round(this.cv.width * q), ch = Math.round(this.cv.height * q);
    var oc = document.createElement('canvas'); oc.width = cw; oc.height = ch;
    var pan = this.pan; this.pan = { x: 0, y: 0, z: 1 }; var v = this.view(k); this.pan = pan;
    var s = cw / v.w, keep = this.ctx, hov = this.hov, c2 = oc.getContext('2d');
    c2.setTransform(s, 0, 0, -s, cw / 2 - v.cx * s, ch / 2 + v.cy * s); c2.lineJoin = 'round';
    this.ctx = c2; this.hov = null;
    try { this.drawLevel(k, 1, this.dpr * q / s); } finally { this.ctx = keep; this.hov = hov; }
    this.caches[k] = { key: key, img: oc, v: v, s: s, w: cw, h: ch };
    return this.caches[k];
  };
  Scene.prototype.blit = function (k, a, X) {
    if (a < 0.01) return; var C = this.cache(k), c = this.ctx, f = X.s / C.s;
    c.globalAlpha = a;
    c.drawImage(C.img, X.tx + C.v.cx * X.s - C.w / 2 * f, X.ty - C.v.cy * X.s - C.h / 2 * f, C.w * f, C.h * f);
    c.globalAlpha = 1;
  };
  Scene.prototype.warm = function () {   // build the cached pictures a little at a time, after the page has drawn
    var self = this, k = this.minLevel();
    function idle(fn, ms) { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: ms + 500 }); else setTimeout(fn, ms); }
    function next() { if (k > 5) return; if (k >= 4) load45(k); self.cache(k++); idle(next, 30); }
    idle(next, 300);
  };
  Scene.prototype.draw = function () {
    var c = this.ctx, W = this.cv.width, H = this.cv.height, X = this.xf(), s = X.s, self = this;
    var fast = !!(this.anim || this.dragging);
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    c.setTransform(s, 0, 0, -s, X.tx, X.ty);
    var px = this.dpr / s;                                      // one CSS pixel, in tile units
    var lo = Math.max(this.minLevel(), Math.min(5, Math.floor(this.L))), f = Math.max(0, this.L - lo), sm = ease(Math.min(1, f));
    c.lineJoin = 'round'; c.lineCap = 'round';
    for (var i = 5; i >= 0; i--) { c.fillStyle = 'rgba(205,235,220,' + (0.022 + 0.012 * (5 - i)) + ')'; c.fill(P.rims[i]); }
    if (fast) {
      c.setTransform(1, 0, 0, 1, 0, 0);
      this.blit(lo, 1 - sm, X); if (lo < 5 && sm > 0.002) this.blit(lo + 1, sm, X);
      c.setTransform(s, 0, 0, -s, X.tx, X.ty);
    } else {
      this.drawLevel(lo, 1 - sm, px);
      if (lo < 5 && sm > 0.002) this.drawLevel(lo + 1, sm, px);
    }
    var near = Math.round(this.L);
    for (i = 0; i <= 5; i++) {
      c.globalAlpha = i === near ? 1 : 0.6; c.strokeStyle = i === near ? C.now : C.rim; c.lineWidth = (i === near ? 2 : 1) * px; c.stroke(P.rims[i]);
    }
    c.globalAlpha = 1; c.strokeStyle = C.mark; c.lineWidth = 2.2 * px;
    if (this.mode === 'b') { c.setLineDash([7 * px, 5 * px]); c.stroke(P.n1); c.setLineDash([]); } else c.stroke(P.orig);
    var k = Math.round(this.L); if (k !== this.lastK && Math.abs(this.L - k) < 0.5) { this.lastK = k; if (this.o.onLevel) this.o.onLevel(k, story(k, this.mode)); }
  };
  Scene.prototype.drawLevel = function (k, a, px) {
    if (a < 0.01) return;
    var c = this.ctx, self = this; c.save(); c.globalAlpha = a;
    if (k <= 3) {
      var L = P.lv[k], wf = Math.max(1, 1.3 * px / FW);
      c.clip(P.rims[k]); c.lineCap = 'butt';
      c.fillStyle = C.tile; c.fill(P.rims[k]);
      c.strokeStyle = C.tileEdge; c.lineWidth = Math.max(0.018, 0.8 * px); c.stroke(L.tiles);
      var hovK = this.hov && this.hov.k === k ? this.hov.i : -1, dim = hovK >= 0;
      var plain = [], hl = [];
      L.strands.forEach(function (st, j) { (self.colourOf(st) == null ? plain : hl).push(j); });
      c.globalAlpha = a * (dim ? 0.45 : 1);
      c.strokeStyle = C.ribEdge; c.lineWidth = BW * wf; plain.forEach(function (j) { c.stroke(L.strands[j].p); });
      c.strokeStyle = C.rib; c.lineWidth = FW * wf; plain.forEach(function (j) { c.stroke(L.strands[j].p); });
      hl.forEach(function (j) {
        var st = L.strands[j]; c.globalAlpha = a * (dim && j !== hovK ? 0.45 : 1);
        c.strokeStyle = C.ribEdge; c.lineWidth = BW * wf; c.stroke(st.p);
        c.strokeStyle = j === hovK ? C.hover : COL[self.colourOf(st) % COL.length]; c.lineWidth = FW * wf; c.stroke(st.p);
      });
      if (hovK >= 0 && this.colourOf(L.strands[hovK]) == null) {
        var hs = L.strands[hovK]; c.globalAlpha = a; c.strokeStyle = C.ribEdge; c.lineWidth = BW * wf; c.stroke(hs.p); c.strokeStyle = C.hover; c.lineWidth = FW * wf; c.stroke(hs.p);
      }
      if (k <= 2) L.strands.forEach(function (st, j) {
        if (!st.ov.length) return;
        var col = self.colourOf(st), fill = j === hovK ? C.hover : col == null ? C.rib : COL[col % COL.length];
        c.globalAlpha = a * (dim && j !== hovK ? 0.45 : 1);
        st.ov.forEach(function (o) { c.strokeStyle = C.ribEdge; c.lineWidth = BW * wf; c.stroke(o[0]); c.strokeStyle = fill; c.lineWidth = FW * wf; c.stroke(o[1]); });
      });
    } else {
      var G = img45(k, this);
      if (G) { c.save(); c.clip(P.rims[k]); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.translate(G.box[0], G.box[3]); c.scale((G.box[2] - G.box[0]) / G.im.width, -(G.box[3] - G.box[1]) / G.im.height); c.drawImage(G.im, 0, 0); c.restore(); }
      var R = P.runs[k - 4], w = k === 4 ? 2.2 : 1.7;
      R.forEach(function (r) {
        var col = self.mode === 'b' ? r.cb : r.ct; if (col == null) return;
        c.strokeStyle = C.ribEdge; c.lineWidth = (w * 1.9 + 0.6) * px; c.stroke(r.p);
        c.strokeStyle = COL[col % COL.length]; c.lineWidth = w * px; c.stroke(r.p);
      });
    }
    c.restore();
  };
  Scene.prototype.loop = function () {
    var self = this; if (this.raf) return;
    function tick(now) {
      self.raf = 0;
      if (self.anim) {
        var A = self.anim, f = Math.max(0, Math.min(1, (now - A.t0) / A.dur));
        self.L = A.from + (A.to - A.from) * ease(f);
        if (f >= 1) { self.L = A.to; self.anim = null; }
        self.draw();
        if (!self.anim && A.done && f >= 1) A.done();
      }
      if (self.anim) self.raf = requestAnimationFrame(tick);
    }
    this.raf = requestAnimationFrame(tick);
  };
  /* move to a level: duration grows with the distance travelled */
  Scene.prototype.goTo = function (k, done) {
    k = Math.max(this.minLevel(), Math.min(5, k)); this.hov = null;
    var from = this.L, dist = Math.abs(k - from);
    if (REDUCE || dist < 1e-3) { this.L = k; this.pan = { x: 0, y: 0, z: 1 }; this.draw(); if (done) done(); return; }
    // the animation blits every level it passes through: wait for the N4/N5 pictures it needs and build their cached
    // pictures before the clock starts, so the zoom never jumps ahead while a picture loads
    var self = this, seq = this.goSeq = (this.goSeq || 0) + 1, need = [];
    for (var n = Math.max(4, Math.floor(Math.min(from, k))); n <= Math.ceil(Math.max(from, k)); n++) need.push(n);
    after45(need, function () {
      if (seq !== self.goSeq) return;                          // superseded by a later move
      need.forEach(function (n) { self.cache(n); });
      self.pan = { x: 0, y: 0, z: 1 };
      self.anim = { from: from, to: k, t0: performance.now(), dur: 900 + 650 * Math.min(dist, 5), done: done };
      self.loop();
    });
  };
  Scene.prototype.setMode = function (m) { this.mode = m; this.hov = null; this.lastK = -1; if (this.L < this.minLevel()) this.L = this.minLevel(); this.draw(); };
  Scene.prototype.play = function () {
    var self = this; this.playing = true; if (this.o.onPlay) this.o.onPlay(true);
    function step() {
      if (!self.playing) return;
      var k = Math.round(self.L), nx = k >= 5 ? self.minLevel() : k + 1;
      self.goTo(nx, function () { if (self.playing) self.timer = setTimeout(step, nx === 5 ? 3600 : nx === self.minLevel() ? 2200 : 2000); });
    }
    this.timer = setTimeout(step, 1400);
  };
  Scene.prototype.pause = function () { this.playing = false; clearTimeout(this.timer); if (this.o.onPlay) this.o.onPlay(false); };
  Scene.prototype.hit = function (cx, cy) {
    var k = Math.round(this.L); if (Math.abs(this.L - k) > 0.02 || k > 3 || this.anim) return null;
    var c = this.ctx, X = this.xf(), px = this.dpr / X.s, wf = Math.max(1, 1.3 * px / FW), x = cx * this.dpr, y = cy * this.dpr, L = P.lv[k], self = this;
    c.save(); c.setTransform(X.s, 0, 0, -X.s, X.tx, X.ty); c.lineWidth = Math.max(BW * wf, 7 * px);
    if (!c.isPointInPath(P.rims[k], x, y)) { c.restore(); return null; }
    var order = [];
    L.strands.forEach(function (st, j) { if (self.colourOf(st) != null) order.push(j); });
    L.strands.forEach(function (st, j) { if (self.colourOf(st) == null) order.push(j); });
    for (var n = 0; n < order.length; n++) { if (c.isPointInStroke(L.strands[order[n]].p, x, y)) { c.restore(); var st = L.strands[order[n]]; return { k: k, i: order[n], tiles: st.t, col: this.colourOf(st), through: this.mode === 'b' ? st.b >= 0 : st.o >= 0 }; } }
    c.restore(); return null;
  };
  Scene.prototype.bind = function () {
    var self = this, cv = this.cv, pts = {}, start = null, moved = false;
    cv.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      if (pts[e.pointerId]) {
        pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        var ids = Object.keys(pts);
        if (ids.length === 1 && start) {
          var X = self.xf(), u = self.dpr / X.s, dx = e.clientX - start.x, dy = e.clientY - start.y;
          if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
          moved = true; self.hov = null; self.dragging = true; settle();
          self.pan.x -= dx * u; self.pan.y += dy * u; start = { x: e.clientX, y: e.clientY };
          self.draw(); return;
        }
        if (ids.length === 2) {
          var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (self.pinch) { self.dragging = true; settle(); self.zoomBy(d / self.pinch); } self.pinch = d; moved = true; return;
        }
      }
      if (e.pointerType === 'mouse') { var h = self.hit(e.clientX - r.left, e.clientY - r.top); self.setHover(h); }
    });
    cv.addEventListener('pointerdown', function (e) { pts[e.pointerId] = { x: e.clientX, y: e.clientY }; start = { x: e.clientX, y: e.clientY }; moved = false; self.pinch = 0; try { cv.setPointerCapture(e.pointerId); } catch (er) {} });
    function settle() { clearTimeout(self.st); self.st = setTimeout(function () { self.dragging = false; self.draw(); }, 140); }
    function up(e) {
      var wasTap = !moved && Object.keys(pts).length === 1;
      delete pts[e.pointerId]; self.pinch = 0; start = null;
      if (wasTap) { var r = cv.getBoundingClientRect(); self.setHover(self.hit(e.clientX - r.left, e.clientY - r.top)); }
    }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !pts[e.pointerId]) self.setHover(null); });
    cv.addEventListener('wheel', function (e) { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); self.zoomBy(e.deltaY > 0 ? 0.88 : 1.14); }, { passive: false });
  };
  Scene.prototype.zoomBy = function (f) { this.pan.z = Math.max(0.6, Math.min(40, this.pan.z * f)); this.hov = null; this.draw(); };
  Scene.prototype.resetView = function () { this.pan = { x: 0, y: 0, z: 1 }; this.draw(); };
  Scene.prototype.setHover = function (h) {
    var same = (h && this.hov && h.k === this.hov.k && h.i === this.hov.i) || (!h && !this.hov);
    if (same) return; this.hov = h; this.draw(); if (this.o.onHover) this.o.onHover(h);
  };

  /* an SVG drawing of one level (k <= 2) inside a window of the common frame, for diagrams */
  function snapshot(o) {
    var k = o.level, L = D.levels[k], b = o.box, w = b[2] - b[0], h = b[3] - b[1], sc = o.width / w;
    var mode = o.mode, colour = function (st) { return mode === 't' ? st.ct : mode === 'b' ? st.cb : null; };
    var id = 'sk' + Math.random().toString(36).slice(2, 8);
    var s = ['<svg viewBox="0 0 ' + o.width + ' ' + Math.round(h * sc) + '" role="img"' + (o.label ? ' aria-label="' + o.label + '"' : '') + '><defs><clipPath id="' + id + '"><path d="' + D.rims[k] + '"/></clipPath></defs>',
      '<g transform="matrix(' + sc + ',0,0,' + (-sc) + ',' + (-b[0] * sc) + ',' + (b[3] * sc) + ')">',
      '<g clip-path="url(#' + id + ')" fill="none" stroke-linecap="butt" stroke-linejoin="round">',
      '<path d="' + D.rims[k] + '" fill="' + (o.tileFill || C.tile) + '"/>',
      '<path d="' + L.tiles + '" stroke="' + (o.tileEdge || C.tileEdge) + '" stroke-width="' + (o.tileW || 0.03) + '"/>'];
    var plain = [], hl = [];
    L.strands.forEach(function (st) { (colour(st) == null ? plain : hl).push(st); });
    var rib = o.rib || C.rib, edge = o.ribEdge || C.ribEdge, pick = o.colourOf || function (st) { var c = colour(st); return c == null ? rib : COL[c % COL.length]; };
    function ribbon(list) { return list.map(function (st) { return '<path d="' + st.d + '" stroke="' + edge + '" stroke-width="' + BW + '"/><path d="' + st.d + '" stroke="' + pick(st) + '" stroke-width="' + FW + '"/>'; }).join(''); }
    if (o.ribbons !== false) { s.push(ribbon(plain)); s.push(ribbon(hl)); }
    if (k <= 2 && o.ribbons !== false) L.strands.forEach(function (st) { (st.ov || []).forEach(function (ov) { s.push('<path d="' + ov[0] + '" stroke="' + edge + '" stroke-width="' + BW + '"/><path d="' + ov[1] + '" stroke="' + pick(st) + '" stroke-width="' + FW + '"/>'); }); });
    s.push('</g>');
    if (o.rimStroke !== false) s.push('<path d="' + D.rims[k] + '" fill="none" stroke="' + (o.rimColour || C.rim) + '" stroke-width="' + (o.rimW || 0.05) + '"/>');
    if (o.markTile) s.push('<path d="' + D.orig + '" fill="none" stroke="' + C.mark + '" stroke-width="' + (o.markW || 0.06) + '"/>');
    if (o.extra) s.push(o.extra);
    s.push('</g></svg>');
    return s.join('');
  }
  function boxOf(k, pad) { var b = D.boxes[k], p = (pad || 0.06) * Math.max(b[2] - b[0], b[3] - b[1]); return [b[0] - p, b[1] - p, b[2] + p, b[3] + p]; }

  window.SK = { Scene: Scene, snapshot: snapshot, boxOf: boxOf, COL: COL, LV: LV, NUM: NUM, story: story, C: C, REDUCE: REDUCE };
})();
