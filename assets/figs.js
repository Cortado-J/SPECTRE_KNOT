/* Diagrams drawn from the data: the single tile, straight versus curved edges, the family tree of strands joining,
   and a schematic of why a repeating tiling cannot carry one strand. All return SVG strings. Maths coordinates (y up). */
(function () {
  'use strict';
  var T = window.SKTILE, D = window.SKDATA, COL = window.SK ? SK.COL : [];
  var PRINT = { tile: '#fff3c4', edge: '#141414', rib: '#a6dcc4', ribEdge: '#0b6b4e' };
  function frame(b, W) {
    var sc = W / (b[2] - b[0]), H = Math.round((b[3] - b[1]) * sc);
    return { sc: sc, H: H, W: W, g: 'matrix(' + sc + ',0,0,' + (-sc) + ',' + (-b[0] * sc) + ',' + (b[3] * sc) + ')', x: function (x) { return (x - b[0]) * sc; }, y: function (y) { return (b[3] - y) * sc; } };
  }
  function bbox(P, pad) { var xs = P.map(function (p) { return p[0]; }), ys = P.map(function (p) { return p[1]; }); return [Math.min.apply(0, xs) - pad, Math.min.apply(0, ys) - pad, Math.max.apply(0, xs) + pad, Math.max.apply(0, ys) + pad]; }
  function polyD(P) { return 'M' + P.map(function (p) { return p[0] + ',' + p[1]; }).join('L') + 'Z'; }
  var uid = 0;

  /* the tile with its 14 pieces; o.colours: colour each piece; o.ports, o.cross: mark them */
  function tile(o) {
    o = o || {}; var b = bbox(T.rim, o.pad || 0.45), F = frame(b, o.width || 460), id = 'tf' + (++uid), BW = 0.188, FW = 0.1;
    var pal = o.print ? PRINT : { tile: '#12211c', edge: '#7fd6b0', rib: '#7fd6b0', ribEdge: '#06100d' };
    var s = ['<svg viewBox="0 0 ' + F.W + ' ' + F.H + '" role="img" aria-label="' + (o.label || 'The tile and its ribbon') + '"><defs><clipPath id="' + id + '"><path d="' + polyD(T.rim) + '"/></clipPath></defs><g transform="' + F.g + '">',
      '<path d="' + polyD(T.rim) + '" fill="' + pal.tile + '"/>', '<g clip-path="url(#' + id + ')" fill="none" stroke-linecap="butt" stroke-linejoin="round">'];
    T.strands.forEach(function (st, i) { var c = o.colours ? COL[i % COL.length] : pal.rib; s.push('<path d="' + st.d + '" stroke="' + pal.ribEdge + '" stroke-width="' + BW + '"/><path d="' + st.d + '" stroke="' + c + '" stroke-width="' + FW + '"/>'); });
    T.strands.forEach(function (st, i) { var c = o.colours ? COL[i % COL.length] : pal.rib; st.ov.forEach(function (v) { s.push('<path d="' + v[0] + '" stroke="' + pal.ribEdge + '" stroke-width="' + BW + '"/><path d="' + v[1] + '" stroke="' + c + '" stroke-width="' + FW + '"/>'); }); });
    s.push('</g><path d="' + polyD(T.rim) + '" fill="none" stroke="' + pal.edge + '" stroke-width="0.035" stroke-linejoin="round"/></g>');
    if (o.ports) {
      var seen = {};
      T.passages.forEach(function (p) { p.ends.forEach(function (e) { var k = e[0].toFixed(2) + ',' + e[1].toFixed(2); if (seen[k]) return; seen[k] = 1; s.push('<circle cx="' + F.x(e[0]).toFixed(1) + '" cy="' + F.y(e[1]).toFixed(1) + '" r="5.5" fill="none" stroke="#E69F00" stroke-width="2"/>'); }); });
    }
    if (o.cross && T.cross.length) {
      var c = T.cross[0], cx = F.x(c[0]), cy = F.y(c[1]), r = 0.3 * F.sc;
      s.push('<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="none" stroke="#56B4E9" stroke-width="2.5" stroke-dasharray="5 4"/>');
      if (o.labels) s.push('<text x="' + cx.toFixed(1) + '" y="' + (cy + r + 20).toFixed(1) + '" fill="#56B4E9" font-size="15" font-weight="700" text-anchor="middle" paint-order="stroke" stroke="#0d1a16" stroke-width="4">the one crossing</text>');
    }
    if (o.labels && o.ports) s.push('<text x="8" y="' + (F.H - 10) + '" fill="#E69F00" font-size="14" font-weight="700">○ a port on each edge: two pieces cross there</text>');
    s.push('</svg>'); return s.join('');
  }

  /* straight-edged Tile(1,1) beside a curved-edge spectre (each edge replaced by the same S-curve) */
  /* the 14 places the crossing could go, one per edge (the crossover at corners v_j, v_{j+1} is next to edge j).
     Computed with viewer/research/places.js: edges 11, 12, 13, 0, 1, 2 give no loop in any supertile to level 6;
     the other eight give loops at level 2 or 3. The design drawn here has its crossing at edge 0. */
  var PLACE_OK = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1];
  function places(o) {
    o = o || {}; var R = T.rim, n = R.length, b = bbox(R, 0.3), F = frame(b, o.width || 460), id = 'tp' + (++uid);
    var s = ['<svg viewBox="0 0 ' + F.W + ' ' + (F.H + 16) + '" role="img" aria-label="' + (o.label || 'The fourteen places the crossing could go') + '"><defs><clipPath id="' + id + '"><path d="' + polyD(R) + '"/></clipPath></defs><g transform="' + F.g + '">',
      '<path d="' + polyD(R) + '" fill="#12211c"/>', '<g clip-path="url(#' + id + ')" fill="none" opacity=".45">'];
    T.strands.forEach(function (st) { s.push('<path d="' + st.d + '" stroke="#06100d" stroke-width="0.188"/><path d="' + st.d + '" stroke="#7fd6b0" stroke-width="0.1"/>'); });
    T.strands.forEach(function (st) { st.ov.forEach(function (v) { s.push('<path d="' + v[0] + '" stroke="#06100d" stroke-width="0.188"/><path d="' + v[1] + '" stroke="#7fd6b0" stroke-width="0.1"/>'); }); });
    s.push('</g>');
    for (var j = 0; j < n; j++) {
      var A = R[j], B = R[(j + 1) % n], ok = PLACE_OK[j], k = 0.07;
      var P = [A[0] + k * (B[0] - A[0]), A[1] + k * (B[1] - A[1])], Q = [B[0] - k * (B[0] - A[0]), B[1] - k * (B[1] - A[1])];
      s.push('<path d="M' + P + 'L' + Q + '" stroke="' + (ok ? '#56B4E9' : '#E69F00') + '" stroke-width="' + (j === 0 ? 0.14 : 0.09) + '" stroke-linecap="round"' + (ok ? '' : ' stroke-dasharray="0.12 0.1"') + '/>');
    }
    s.push('</g>');
    var c = T.cross[0], cx = F.x(c[0]), cy = F.y(c[1]), r = 0.3 * F.sc;
    s.push('<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="none" stroke="#e8f1ec" stroke-width="2" stroke-dasharray="5 4"/>');
    s.push('<text x="' + F.x((R[0][0] + R[1][0]) / 2).toFixed(1) + '" y="' + (F.y(R[0][1]) + 30).toFixed(1) + '" fill="#e8f1ec" font-size="19" font-weight="700" text-anchor="middle" paint-order="stroke" stroke="#0d1a16" stroke-width="5">the crossing drawn here</text>');
    s.push('</svg>'); return s.join('');
  }

  /* straight-edged Tile(1,1) beside a curved-edge spectre (each edge replaced by the same S-curve) */
  function curved(o) {
    o = o || {}; var R = T.rim, n = R.length, b = bbox(R, 0.45), w = b[2] - b[0], gap = 0.6;
    var B = [b[0], b[1], b[0] + 2 * w + gap, b[3]], F = frame(B, o.width || 640);
    var d = 'M' + R[0][0] + ',' + R[0][1];
    for (var i = 0; i < n; i++) {
      var A = R[i], C = R[(i + 1) % n], dx = C[0] - A[0], dy = C[1] - A[1], nx = -dy * 0.28, ny = dx * 0.28;
      d += 'C' + (A[0] + dx / 3 + nx) + ',' + (A[1] + dy / 3 + ny) + ' ' + (A[0] + 2 * dx / 3 - nx) + ',' + (A[1] + 2 * dy / 3 - ny) + ' ' + C[0] + ',' + C[1];
    }
    var sh = w + gap;
    return '<svg viewBox="0 0 ' + F.W + ' ' + (F.H + 30) + '" role="img" aria-label="The straight-edged tile beside the curved-edge spectre"><g transform="' + F.g + '">' +
      '<path d="' + polyD(R) + '" fill="#fff3c4" stroke="#141414" stroke-width="0.04" stroke-linejoin="round"/>' +
      '<g transform="translate(' + sh + ',0)"><path d="' + d + 'Z" fill="#fff3c4" stroke="#141414" stroke-width="0.04"/></g></g>' +
      '<text x="' + (F.W * 0.25) + '" y="' + (F.H + 22) + '" fill="#a3b8ae" font-size="15" text-anchor="middle">Tile(1,1): straight edges</text>' +
      '<text x="' + (F.W * 0.75) + '" y="' + (F.H + 22) + '" fill="#a3b8ae" font-size="15" text-anchor="middle">a spectre: every edge an S-curve</text></svg>';
  }

  /* the family tree of strands: dots are strands, a line joins a strand to the strand it becomes one block up */
  function tree(mode, o) {
    o = o || {}; var lv = D.tree[mode], lo = mode === 'b' ? 1 : 0, rows = lv.length, W = o.width || 640, gx = 150, H = rows * 58 + 16;
    var kids = []; lv.forEach(function (row) { kids.push({}); });
    for (var r = 0; r < rows - 1; r++) lv[r].forEach(function (nd) { (kids[r + 1][nd[1]] = kids[r + 1][nd[1]] || []).push(nd[0]); });
    var X = lv.map(function () { return {}; }), next = 0, leaves = lv[0].length, span = W - gx - 20;
    function place(r, c) {
      var ch = (kids[r] && kids[r][c]) || [];
      if (r === 0 || !ch.length) { X[r][c] = gx + (leaves > 1 ? next++ * span / (leaves - 1) : span / 2); return X[r][c]; }
      var xs = ch.map(function (cc) { return place(r - 1, cc); }); X[r][c] = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length; return X[r][c];
    }
    place(rows - 1, lv[rows - 1][0][0]);
    var y = function (r) { return 24 + r * 58; }, rad = leaves > 20 ? 4.5 : 8;
    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="How the strands join, one block size at a time">'];
    for (r = 0; r < rows; r++) {
      var n = lv[r].length, k = r + lo;
      s.push('<text x="0" y="' + (y(r) + 5) + '" fill="#a3b8ae" font-size="14">' + SK.NUM[k] + (k ? ' tiles' : ' tile') + '</text><text x="' + (gx - 16) + '" y="' + (y(r) + 5) + '" fill="' + (n === 1 ? '#E69F00' : '#e8f1ec') + '" font-size="14" font-weight="700" text-anchor="end">' + n + '</text>');
    }
    for (r = 0; r < rows - 1; r++) lv[r].forEach(function (nd) {
      var x0 = X[r][nd[0]], x1 = X[r + 1][nd[1]], y0 = y(r), y1 = y(r + 1);
      s.push('<path d="M' + x0 + ',' + y0 + 'C' + x0 + ',' + (y0 + 30) + ' ' + x1 + ',' + (y1 - 30) + ' ' + x1 + ',' + y1 + '" fill="none" stroke="' + COL[nd[0] % COL.length] + '" stroke-width="2" opacity="0.8"/>');
    });
    for (r = 0; r < rows; r++) lv[r].forEach(function (nd) { s.push('<circle cx="' + X[r][nd[0]] + '" cy="' + y(r) + '" r="' + (rows - 1 === r ? rad + 3 : rad) + '" fill="' + COL[nd[0] % COL.length] + '" stroke="#0a1411" stroke-width="2"/>'); });
    s.push('</svg>'); return s.join('');
  }

  /* a repeating pattern: shifting by a slides a strand along itself; shifting by b lands it on a different strand */
  function periodic(o) {
    o = o || {}; var W = o.width || 560, H = 300, s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="In a repeating pattern, the shift b moves a strand onto a different strand">'];
    s.push('<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#e8f1ec"/></marker></defs>');
    for (var i = 0; i <= 6; i++) s.push('<path d="M' + (20 + i * 80) + ',20L' + (60 + i * 80) + ',280" stroke="#243a32" stroke-width="1.5"/>');
    for (var j = 0; j <= 3; j++) s.push('<path d="M0,' + (20 + j * 86.7) + 'H' + W + '" stroke="#243a32" stroke-width="1.5"/>');
    for (j = 0; j < 3; j++) {
      var yy = 63 + j * 86.7, d = 'M0,' + yy;
      for (i = 0; i < 7; i++) d += 'c 20,-34 60,34 80,0';
      s.push('<path d="' + d + '" fill="none" stroke="' + (j === 1 ? '#E69F00' : '#2f6352') + '" stroke-width="' + (j === 1 ? 6 : 5) + '"/>');
    }
    s.push('<path d="M150,128 H292" stroke="#e8f1ec" stroke-width="2.5" marker-end="url(#ah)"/><text x="190" y="120" fill="#e8f1ec" font-size="16" font-weight="700">a</text>');
    s.push('<path d="M400,150 L412,70" stroke="#e8f1ec" stroke-width="2.5" marker-end="url(#ah)"/><text x="418" y="118" fill="#e8f1ec" font-size="16" font-weight="700">b</text>');
    s.push('</svg>'); return s.join('');
  }

  /* the signature of a block, read off the real ribbons: each piece joins two rim ports.
     Hooks (blue) join the two ports by one corner; the crossover (amber) is the one exception. */
  function signature(k, o) {
    // the real ribbon, each piece coloured by what it does at the rim: a hook round one corner (blue, two shades
    // alternating corner by corner so neighbouring hooks can be told apart) or one of the two crossover pieces (amber)
    o = o || {}; var S = D.sig[k], L = D.levels[k], b = SK.boxOf(k, 0.05), F = frame(b, o.width || 520);
    var rim = D.rims[k], pts = rim.slice(1, -1).split('L').map(function (p) { return p.split(',').map(Number); });
    var col = function (st) { var p = S[L.strands.indexOf(st)]; return p[2] !== p[3] ? '#E69F00' : (p[2] % 2 ? '#56B4E9' : '#b3dcf5'); };
    var s = ['<svg viewBox="0 0 ' + F.W + ' ' + F.H + '" role="img" aria-label="' + (o.label || 'The signature: every ribbon piece hooks round one corner, except two that cross') + '">'];
    s.push(SK.snapshot({ level: k, box: b, width: F.W, mode: null, colourOf: col, ribEdge: '#06100d', tileEdge: 'rgba(205,235,220,' + (k ? 0.12 : 0) + ')', rimColour: '#e8f1ec', rimW: 1.6 / F.sc }).replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>$/, '</g>'));
    if (k > 0) {
      // seen from outside: only the rim ports each piece joins. The real ribbon is faint; each hook is a small U-turn
      // just inside its corner, the two crossover pieces bulge inward and cross.
      s[1] = SK.snapshot({ level: k, box: b, width: F.W, mode: null, rib: '#1f3d33', ribEdge: '#0b1512', tileEdge: 'rgba(205,235,220,0.06)', rimColour: '#e8f1ec', rimW: 1.6 / F.sc }).replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>$/, '</g>');
      var area = 0; pts.forEach(function (p, i) { var q = pts[(i + 1) % pts.length]; area += p[0] * q[1] - q[0] * p[1]; });
      var sgn = area > 0 ? 1 : -1, n = pts.length;
      function inward(e) { var P = pts[e % n], Q = pts[(e + 1) % n], dx = Q[0] - P[0], dy = Q[1] - P[1], l = Math.hypot(dx, dy); return [-dy / l * sgn, dx / l * sgn]; }
      var dep = 0.42, w = k === 1 ? 3 : 1.8;
      S.forEach(function (p) {
        var A = p[4], B = p[5], na = inward(p[0]), nb = inward(p[1]), hook = p[2] === p[3];
        var d = hook ? dep : dep * 2.2;
        s.push('<path d="M' + F.x(A[0]) + ',' + F.y(A[1]) + 'C' + F.x(A[0] + na[0] * d) + ',' + F.y(A[1] + na[1] * d) + ' ' + F.x(B[0] + nb[0] * d) + ',' + F.y(B[1] + nb[1] * d) + ' ' + F.x(B[0]) + ',' + F.y(B[1]) + '" fill="none" stroke="' + (hook ? (p[2] % 2 ? '#56B4E9' : '#b3dcf5') : '#E69F00') + '" stroke-width="' + (hook ? w : w + 1) + '" stroke-linecap="round"/>');
      });
    }
    var cs = {}; S.forEach(function (p) { if (p[2] !== p[3]) { cs[p[2]] = 1; cs[p[3]] = 1; } });
    var r = k ? 9 : 13;
    Object.keys(cs).forEach(function (c) { var C = pts[c % pts.length]; s.push('<circle cx="' + F.x(C[0]) + '" cy="' + F.y(C[1]) + '" r="' + r + '" fill="none" stroke="#E69F00" stroke-width="3"/>'); });
    s.push('</svg>'); return s.join('');
  }

  /* the crossing rule at one edge: a ribbon near end T on one side leaves near end B on the other */
  function ports(o) {
    o = o || {}; var W = o.width || 440, H = 230;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="The crossing rule at an edge">' +
      '<path d="M' + W / 2 + ',20V' + (H - 20) + '" stroke="#e8f1ec" stroke-width="3"/>' +
      '<circle cx="' + W / 2 + '" cy="20" r="5" fill="#e8f1ec"/><circle cx="' + W / 2 + '" cy="' + (H - 20) + '" r="5" fill="#e8f1ec"/>' +
      '<text x="' + (W / 2 + 12) + '" y="26" fill="#a3b8ae" font-size="15">end T</text><text x="' + (W / 2 + 12) + '" y="' + (H - 14) + '" fill="#a3b8ae" font-size="15">end B</text>' +
      '<path d="M40,55 C120,55 170,80 ' + W / 2 + ',' + (H / 2 + 8) + ' S' + (W - 120) + ',' + (H - 55) + ' ' + (W - 40) + ',' + (H - 55) + '" fill="none" stroke="#E69F00" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M40,' + (H - 55) + ' C120,' + (H - 55) + ' 170,' + (H - 80) + ' ' + W / 2 + ',' + (H / 2 + 8) + ' S' + (W - 120) + ',55 ' + (W - 40) + ',55" fill="none" stroke="#56B4E9" stroke-width="7" stroke-linecap="round"/>' +
      '<text x="40" y="44" fill="#E69F00" font-size="14" font-weight="700">left, near T</text><text x="' + (W - 40) + '" y="' + (H - 66) + '" fill="#E69F00" font-size="14" font-weight="700" text-anchor="end">right, near B</text>' +
      '<text x="' + (W / 2) + '" y="' + (H / 2 + 34) + '" fill="#e8f1ec" font-size="13" text-anchor="middle">port</text></svg>';
  }

  /* the zigzag along a run of n edges shared by two hooked blocks; returns {svg, side} */
  function zigzag(n, o) {
    o = o || {}; var W = o.width || 600, m = 40, step = (W - 2 * m) / n, mid = 110, H = 220, top = [], s = [];
    s.push('<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Two ribbons zigzag along a run of ' + n + ' edges">');
    s.push('<rect x="0" y="0" width="' + W + '" height="' + mid + '" fill="#12211c"/><rect x="0" y="' + mid + '" width="' + W + '" height="' + (H - mid) + '" fill="#183029"/>');
    s.push('<text x="10" y="24" fill="#a3b8ae" font-size="13">block A</text><text x="10" y="' + (H - 10) + '" fill="#a3b8ae" font-size="13">block B</text>');
    s.push('<path d="M' + m + ',' + mid + 'H' + (W - m) + '" stroke="#e8f1ec" stroke-width="2.5"/>');
    for (var i = 0; i <= n; i++) s.push('<circle cx="' + (m + i * step) + '" cy="' + mid + '" r="' + (i === 0 || i === n ? 6 : 4) + '" fill="' + (i === 0 || i === n ? '#E69F00' : '#e8f1ec') + '"/>');
    // ribbon starting in A near the first corner; along each edge it crosses the run on a slant, and at each corner it
    // turns back round it in the other block: one smooth wave, horizontal at every turn, so the turns are round
    function ribbon(startTop, col, dash) {
      var side = startTop ? -1 : 1, y = function (sd) { return mid + sd * 40; };
      var d = 'M' + (m - 26) + ',' + y(side) + ' L' + m + ',' + y(side);
      for (var j = 0; j < n; j++) {
        var x0 = m + j * step, x1 = x0 + step;
        d += ' C' + (x0 + step * 0.5) + ',' + y(side) + ' ' + (x1 - step * 0.5) + ',' + y(-side) + ' ' + x1 + ',' + y(-side);
        side = -side;
      }
      d += ' L' + (W - m + 26) + ',' + y(side);
      s.push('<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="5" stroke-linecap="round"' + (dash ? ' stroke-dasharray="10 7"' : '') + ' class="zz"/>');
      return side;
    }
    var endA = ribbon(true, '#E69F00', false); ribbon(false, '#56B4E9', true);
    s.push('</svg>');
    return { svg: s.join(''), same: endA < 0 };
  }

  /* blocks of the nest: N1 inside N2 inside N3 (real outlines) */
  function nest(o) {
    o = o || {}; var top = o.top || 3, b = SK.boxOf(top, 0.04).slice(), F, k;
    if (o.headroom) b[3] += (b[3] - b[1]) * o.headroom;
    // blocks too small on screen for a label at their corner get one in a margin on the right, with a leader line
    var W0 = o.width || 520, sc0 = W0 / (b[2] - b[0]), small = [];
    for (k = 0; k <= top; k++) { var bk = D.boxes[k]; if ((bk[2] - bk[0]) * sc0 < 120) small.push(k); }
    if (small.length) b[2] += (b[2] - b[0]) * 0.32;
    F = frame(b, W0 * (small.length ? 1.32 : 1));
    var fills = ['#E69F00', '#56B4E9', '#7fd6b0', '#CC79A7', '#e8f1ec', '#8ab4ff'];
    var s = ['<svg viewBox="0 0 ' + F.W + ' ' + F.H + '" role="img" aria-label="Nested blocks: each is one piece of the next"><g transform="' + F.g + '">'];
    for (var k = top; k >= 0; k--) s.push('<path d="' + D.rims[k] + '" fill="' + fills[k] + '" fill-opacity="' + (k === top ? 0.08 : 0.16) + '" stroke="' + fills[k] + '" stroke-width="' + (1.8 / F.sc) + '" stroke-linejoin="round"/>');
    s.push('</g>');
    if (o.labels !== false) {
      var lab = function (k) { return 'N' + k + ' · ' + SK.LV[k]; };
      for (k = 0; k <= top; k++) if (small.indexOf(k) < 0) { var bb = D.boxes[k]; s.push('<text x="' + F.x(bb[2]) + '" y="' + (F.y(bb[3]) - 4) + '" fill="' + fills[k] + '" font-size="14" font-weight="700" text-anchor="end">' + lab(k) + '</text>'); }
      // the small ones: a column in the right margin, biggest at the top, centred on the blocks' height
      var cyc = F.y((D.boxes[0][1] + D.boxes[0][3]) / 2), xl = F.W - 12, gap = 22, y0 = cyc - gap * (small.length - 1) / 2;
      small.slice().reverse().forEach(function (k, i) {
        var bb = D.boxes[k], ax = F.x(bb[2]), ay = F.y((bb[1] + bb[3]) / 2), ty = y0 + i * gap;
        s.push('<path d="M' + ax + ',' + ay + 'L' + (xl - 112) + ',' + (ty - 4) + '" stroke="' + fills[k] + '" stroke-width="1.2" fill="none" stroke-opacity=".8"/>');
        s.push('<text x="' + xl + '" y="' + ty + '" fill="' + fills[k] + '" font-size="14" font-weight="700" text-anchor="end" paint-order="stroke" stroke="#0d1a16" stroke-width="3">' + lab(k) + '</text>');
      });
    }
    s.push('</svg>'); return s.join('');
  }

  /* what is covered: the nest tiling (one strand); other single-chain tilings (no loops, one strand not claimed); two chains meeting along a line (nothing) */
  function scope(o) {
    o = o || {}; var W = o.width || 640, H = 210, pw = W / 3, s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Three kinds of spectre tiling and what is covered">'];
    function blob(cx, cy, r, c, op) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + c + '" fill-opacity="' + op + '" stroke="' + c + '" stroke-width="1.5"/>'; }
    var y = 95;
    // 1: the nest, growing from a centre
    for (var i = 4; i >= 1; i--) s.push(blob(pw * 0.5, y, i * 17, '#7fd6b0', 0.08));
    s.push('<text x="' + pw * 0.5 + '" y="185" fill="#e8f1ec" font-size="14" font-weight="700" text-anchor="middle">✓ the nest tiling</text><text x="' + pw * 0.5 + '" y="203" fill="#a3b8ae" font-size="12" text-anchor="middle">covered: drawn on this site</text>');
    // 2: a different chain, growing off-centre
    for (i = 4; i >= 1; i--) s.push(blob(pw * 1.5 + (4 - i) * 9, y - (4 - i) * 6, i * 17, '#56B4E9', 0.08));
    s.push('<text x="' + pw * 1.5 + '" y="185" fill="#e8f1ec" font-size="14" font-weight="700" text-anchor="middle">~ another single chain</text><text x="' + pw * 1.5 + '" y="203" fill="#a3b8ae" font-size="12" text-anchor="middle">no loops; may have 3 strands</text>');
    // 3: two infinite chains meeting along a line
    s.push('<rect x="' + (pw * 2 + 20) + '" y="25" width="' + (pw / 2 - 20) + '" height="140" fill="#CC79A7" fill-opacity=".12" stroke="#CC79A7"/><rect x="' + (pw * 2.5) + '" y="25" width="' + (pw / 2 - 20) + '" height="140" fill="#E69F00" fill-opacity=".12" stroke="#E69F00"/>');
    s.push('<path d="M' + pw * 2.5 + ',18V172" stroke="#e8f1ec" stroke-width="2.5" stroke-dasharray="6 4"/>');
    s.push('<text x="' + pw * 2.5 + '" y="185" fill="#e8f1ec" font-size="14" font-weight="700" text-anchor="middle">✕ two chains, one line</text><text x="' + pw * 2.5 + '" y="203" fill="#a3b8ae" font-size="12" text-anchor="middle">not covered</text></svg>');
    return s.join('');
  }

  /* the map of the proof: what rests on what. Each box links to its step. */
  var STAT = { computed: ['#56B4E9', 'computed'], cited: ['#E69F00', 'cited'], proved: ['#7fd6b0', 'argued'] };
  function proofMap(o) {
    // laid out by hand so that no arrow crosses another or runs behind a box: x, y of each box's top left corner
    o = o || {}; var W = 920, bw = 200, bh = 64, H = 616, R = [16, 120, 224, 328, 432, 536];
    var N = {
      hier: [20, R[0], 'Supertiles, for ever', 'same pattern at every level', 'cited', 'p1'],
      L1: [245, R[0], 'Black box', 'only rim ports matter', 'proved', 'p2', 1],
      L2: [470, R[0], 'Zigzag', 'a run: only even or odd', 'proved', 'p4', 1],
      tile: [695, R[0], 'The tile’s drawing', '12 hooks, 1 crossover', 'proved', 'p3', 1],
      sides: [140, R[1], 'Side lengths', 'grow; parities fixed', 'proved', 'p5', 1],
      L3: [370, R[1], 'Two more edges', 'change nothing', 'proved', 'p5', 1],
      sig: [695, R[1], 'Level 1, computed', '18 assemblies, signature', 'computed', 'p5', 1],
      L5: [255, R[2], 'Every level', 'reached two edges at a time', 'proved', 'p5', 1],
      L7: [20, R[3], 'Nest covers the plane', 'every tile is in some block', 'proved', 'p6'],
      T6: [520, R[3], 'Every supertile', 'signature, no closed loop', 'proved', 'p5', 1],
      L8: [245, R[4], 'Every block merges', 'level 1 computed, then moves', 'proved', 'p6', 1],
      TA: [695, R[4], 'No closed loop', 'the Daedalus Theorem', 'proved', 'p7', 1],
      T9: [245, R[5], 'One endless strand', 'the Ariadne Theorem', 'proved', 'p6', 1]
    };
    // each arrow: from (box, x offset along its bottom) to (box, x offset along its top), or into a side ('L' or 'R')
    var E = [['hier', 100, 'sides', 100], ['hier', 14, 'L7', 14], ['L1', 100, 'L3', 75], ['L2', 100, 'L3', 125], ['tile', 100, 'sig', 100],
      ['sides', 100, 'L5', 75], ['L3', 100, 'L5', 125], ['sig', 100, 'T6', 140], ['L5', 125, 'T6', 60],
      ['L5', 75, 'L8', 75], ['T6', 60, 'L8', 135], ['T6', 160, 'TA', 100], ['L8', 100, 'T9', 100],
      ['L7', 100, 'T9', 'L'], ['T6', 100, 'T9', 'R']];
    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="The map of the proof: what each step rests on">',
      '<defs><marker id="pm-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#6f877c"/></marker></defs>'];
    E.forEach(function (e) {
      var a = N[e[0]], b = N[e[2]], x0 = a[0] + e[1], y0 = a[1] + bh, d;
      if (e[3] === 'L' || e[3] === 'R') {   // run down beside the boxes, then turn into the target's side
        var x1 = e[3] === 'L' ? b[0] - 2 : b[0] + bw + 2, y1 = b[1] + bh / 2;
        d = 'M' + x0 + ',' + y0 + ' L' + x0 + ',' + (y1 - 40) + ' C' + x0 + ',' + y1 + ' ' + x0 + ',' + y1 + ' ' + (x0 + (x1 > x0 ? 40 : -40)) + ',' + y1 + ' L' + x1 + ',' + y1;
      } else {
        var x1 = b[0] + e[3], y1 = b[1] - 2, k = (y1 - y0) / 2;
        d = 'M' + x0 + ',' + y0 + ' C' + x0 + ',' + (y0 + k) + ' ' + x1 + ',' + (y1 - k) + ' ' + x1 + ',' + y1;
      }
      s.push('<path d="' + d + '" fill="none" stroke="#6f877c" stroke-width="1.6" marker-end="url(#pm-a)"/>');
    });
    Object.keys(N).forEach(function (k) {
      var n = N[k], p = { x: n[0], y: n[1] }, st = STAT[n[4]], fin = k === 'T9' || k === 'TA';
      s.push('<a href="#' + n[5] + '" data-step="' + n[5] + '"><g class="pm-node"><rect x="' + p.x + '" y="' + p.y + '" width="' + bw + '" height="' + bh + '" rx="12" fill="' + (fin ? '#2a2310' : '#12211c') + '" stroke="' + (fin ? '#E69F00' : st[0]) + '" stroke-width="' + (fin ? 3 : 2) + '"' + '/>' +
        '<text x="' + (p.x + 12) + '" y="' + (p.y + 23) + '" fill="#e8f1ec" font-size="15" font-weight="700">' + n[2] + '</text>' +
        '<text x="' + (p.x + 12) + '" y="' + (p.y + 41) + '" fill="#a3b8ae" font-size="12.5">' + n[3] + '</text>' +
        '<text x="' + (p.x + 12) + '" y="' + (p.y + 57) + '" fill="' + st[0] + '" font-size="10.5" font-weight="700" letter-spacing="1">' + st[1].toUpperCase() + '</text>' +
        (n[6] ? '<text x="' + (p.x + bw - 12) + '" y="' + (p.y + 57) + '" fill="#F0E442" font-size="10.5" font-weight="700" letter-spacing="1" text-anchor="end">LEAN</text>' : '') +
        // the Prove step this fact belongs to
        '<circle cx="' + (p.x + bw - 17) + '" cy="' + (p.y + 18) + '" r="11" fill="#1d3a31" stroke="#7fd6b0" stroke-width="1.4"/><text x="' + (p.x + bw - 17) + '" y="' + (p.y + 22.5) + '" fill="#e8f1ec" font-size="12" font-weight="700" text-anchor="middle">' + n[5].slice(1) + '</text>' + '</g></a>');
    });
    s.push('</svg>'); return s.join('');
  }

  /* one parent side is a row of whole child sides: Delta's side 0 = Gamma5 + Pi4 + Phi2 + Phi3 + Phi4, at three levels */
  function lengthBar(o) {
    o = o || {}; var W = o.width || 760, rows = [1, 2, 3], parts = [['Gamma', 5, 'Γ side 5'], ['Pi', 4, 'Π side 4'], ['Phi', 2, 'Φ side 2'], ['Phi', 3, 'Φ side 3'], ['Phi', 4, 'Φ side 4']];
    var L = D.lens, rh = 74, H = rows.length * rh + 18, x0 = 150, bwid = W - x0 - 20;
    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="A side of a bigger supertile is a row of whole sides of its children">'];
    rows.forEach(function (m, i) {
      var vals = parts.map(function (p) { return L[String(m)][p[0]][p[1]]; }), tot = vals.reduce(function (a, b) { return a + b; }, 0), y = 14 + i * rh, x = x0;
      s.push('<text x="0" y="' + (y + 22) + '" fill="#e8f1ec" font-size="14" font-weight="700">Δ side 0, level ' + (m + 1) + '</text>');
      s.push('<text x="0" y="' + (y + 40) + '" fill="' + (tot % 2 ? '#E69F00' : '#7fd6b0') + '" font-size="13">= ' + tot.toLocaleString('en-GB') + ' edges (' + (tot % 2 ? 'odd' : 'even') + ')</text>');
      vals.forEach(function (v, j) {
        var w = v / tot * bwid, odd = v % 2;
        s.push('<rect x="' + x + '" y="' + y + '" width="' + Math.max(1, w - 3) + '" height="30" rx="6" fill="' + (odd ? 'rgba(230,159,0,0.22)' : 'rgba(127,214,176,0.2)') + '" stroke="' + (odd ? '#E69F00' : '#7fd6b0') + '" stroke-width="1.6"' + (odd ? ' stroke-dasharray="5 3"' : '') + '/>');
        if (w > 34) s.push('<text x="' + (x + w / 2 - 1.5) + '" y="' + (y + 20) + '" fill="#e8f1ec" font-size="13" font-weight="700" text-anchor="middle">' + v.toLocaleString('en-GB') + '</text>');
        if (i === 0) s.push('<text x="' + (x + w / 2 - 1.5) + '" y="' + (y + 48) + '" fill="#a3b8ae" font-size="11.5" text-anchor="middle">' + parts[j][2] + '</text>');
        x += w;
      });
    });
    s.push('</svg>'); return s.join('');
  }

  /* the six side lengths of one kind at every computed level, odd and even marked: read down a column */
  function parityTable(kind) {
    var L = D.lens, k = kind || 'Delta', sym = { Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ' }[k];
    var h = '<table class="nums par"><thead><tr><th>' + sym + ' supertile</th>' + [0, 1, 2, 3, 4, 5].map(function (j) { return '<th>side ' + j + '</th>'; }).join('') + '</tr></thead><tbody>';
    for (var m = 1; m <= 8; m++) {
      h += '<tr><td>level ' + m + '</td>' + L[String(m)][k].map(function (v) { return '<td class="' + (v % 2 ? 'odd' : 'even') + '">' + v.toLocaleString('en-GB') + '</td>'; }).join('') + '</tr>';
    }
    return h + '</tbody></table>';
  }

  /* glossary sketches: one small picture per term. Real data where it exists, a plain sketch for the abstract ideas.
     Colours: ink #e8f1ec, block fill #183029, ribbon mint, amber and sky for the two things being contrasted. */
  var GI = '#e8f1ec', GM = '#a3b8ae', GB = '#183029', GA = '#E69F00', GS = '#56B4E9', GP = '#CC79A7', GR = '#7fd6b0';
  function gsvg(label, body, W, H) { return '<svg viewBox="0 0 ' + (W || 240) + ' ' + (H || 160) + '" role="img" aria-label="' + label + '">' + body + '</svg>'; }
  function gt(x, y, t, c, a) { return '<text x="' + x + '" y="' + y + '" fill="' + (c || GM) + '" font-size="12" font-weight="600"' + (a ? ' text-anchor="' + a + '"' : '') + ' paint-order="stroke" stroke="#0d1a16" stroke-width="3">' + t + '</text>'; }
  function gdot(x, y, c, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 4) + '" fill="' + (c || GI) + '"/>'; }
  function gring(x, y, c) { return '<circle cx="' + x + '" cy="' + y + '" r="7" fill="none" stroke="' + c + '" stroke-width="2.2"/>'; }
  function grib(d, c, dash) { return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="5" stroke-linecap="round"' + (dash ? ' stroke-dasharray="7 5"' : '') + '/>'; }
  function gloss(name) {
    var K = { stroke: GI, sw: 2 };
    switch (name) {
      case 'spectre':
        var Fs = frame(bbox(T.rim, 0.3), 170);
        return '<svg viewBox="0 0 ' + Fs.W + ' ' + Fs.H + '" role="img" aria-label="The spectre: one tile, a polygon with 14 equal edges"><g transform="' + Fs.g + '">' +
          '<path d="' + polyD(T.rim) + '" fill="#fff3c4" stroke="' + GR + '" stroke-width="' + (2.5 / Fs.sc) + '" stroke-linejoin="round"/></g></svg>';
      case 'loop':
        return gsvg('A closed loop: a strand that comes back to its start. There are none.',
          '<ellipse cx="120" cy="74" rx="66" ry="42" fill="none" stroke="#06100d" stroke-width="13"/><ellipse cx="120" cy="74" rx="66" ry="42" fill="none" stroke="' + GR + '" stroke-width="8"/>' +
          '<path d="M44,136L196,14" stroke="' + GA + '" stroke-width="6" stroke-linecap="round"/>' + gt(120, 152, 'never happens', GA, 'middle'));
      case 'kind':
        var KL = ['Γ', 'Δ', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ', 'Φ', 'Ψ'], hx = function (cx, cy, r) { var q = []; for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; q.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); } return 'M' + q.join('L') + 'Z'; };
        return gsvg('The nine kinds of supertile, named by Greek letters', KL.map(function (k, i) {
          var cx = 50 + (i % 3) * 70, cy = 30 + Math.floor(i / 3) * 48, c = k === 'Δ' ? GA : GR;
          return '<path d="' + hx(cx, cy, 21) + '" fill="' + GB + '" stroke="' + c + '" stroke-width="2"/><text x="' + cx + '" y="' + (cy + 6) + '" fill="' + (k === 'Δ' ? GA : GI) + '" font-size="17" font-weight="700" text-anchor="middle">' + k + '</text>';
        }).join('') + gt(120, 158, 'the nest is all Δ', GA, 'middle'), 240, 166);
      case 'child':
        var r = 19, w = r * Math.sqrt(3), C = [[0, 0], [w, 0], [-w, 0], [w / 2, -1.5 * r], [-w / 2, -1.5 * r], [w / 2, 1.5 * r], [-w / 2, 1.5 * r], [1.5 * w, -1.5 * r]];
        var hx2 = function (cx, cy) { var q = []; for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; q.push((cx + (r - 1.5) * Math.cos(a)).toFixed(1) + ',' + (cy + (r - 1.5) * Math.sin(a)).toFixed(1)); } return 'M' + q.join('L') + 'Z'; };
        return gsvg('A parent supertile made of its children, one level down, each with a number',
          '<rect x="38" y="20" width="166" height="124" rx="16" fill="none" stroke="' + GM + '" stroke-width="1.6" stroke-dasharray="5 4"/>' + gt(46, 15, 'parent', GM) +
          C.map(function (c, i) { var x = 112 + c[0], y = 86 + c[1], on = i === 1; return '<path d="' + hx2(x, y) + '" fill="' + (on ? '#2a2310' : GB) + '" stroke="' + (on ? GA : GR) + '" stroke-width="1.8"/><text x="' + x + '" y="' + (y + 5) + '" fill="' + (on ? GA : GI) + '" font-size="13" font-weight="700" text-anchor="middle">' + i + '</text>'; }).join('') +
          gt(120, 158, 'children, numbered', GM, 'middle'), 240, 166);
      case 'mystic':
        var S3 = Math.sqrt(3), P8 = [3 - S3 / 2, 1.5], c30 = Math.cos(Math.PI / 6), s30 = Math.sin(Math.PI / 6);
        var t1 = T.rim, t2 = T.rim.map(function (p) { return [c30 * p[0] - s30 * p[1] + P8[0], s30 * p[0] + c30 * p[1] + P8[1]]; });
        var bb = bbox(t1.concat(t2), 0.35), Fm = frame(bb, 170);
        return '<svg viewBox="0 0 ' + Fm.W + ' ' + (Fm.H + 22) + '" role="img" aria-label="The Mystic: a pair of tiles that counts as one child"><g transform="' + Fm.g + '">' +
          '<path d="' + polyD(t1) + '" fill="#2a2310" stroke="' + GA + '" stroke-width="' + (2 / Fm.sc) + '" stroke-linejoin="round"/>' +
          '<path d="' + polyD(t2) + '" fill="#13283a" stroke="' + GS + '" stroke-width="' + (2 / Fm.sc) + '" stroke-linejoin="round"/></g>' +
          gt(Fm.W / 2, Fm.H + 16, 'two tiles, one child', GM, 'middle') + '</svg>';
      case 'box':
        var PC = [GA, GS, GR, GP], ports = [[90, 30, 0], [150, 30, 1], [190, 62, 2], [190, 102, 0], [150, 134, 3], [90, 134, 1], [50, 102, 3], [50, 62, 2]];
        return gsvg('A box: only which rim ends are joined inside matters, not how',
          '<path d="M70,30H170L190,50V114L170,134H70L50,114V50Z" fill="#0b1512" stroke="' + GM + '" stroke-width="2"/>' +
          '<text x="120" y="96" fill="' + GM + '" font-size="40" font-weight="700" text-anchor="middle">?</text>' +
          ports.map(function (p) { return gdot(p[0], p[1], PC[p[2]], 6); }).join('') + gt(120, 156, 'same colour: joined inside', GM, 'middle'), 240, 164);
      case 'zigzag':
        return zigzag(3, { width: 300 }).svg;
      case 'block':
        var fills = ['#E69F00', '#56B4E9', '#7fd6b0', '#CC79A7'], cw = 64, cells = [0, 1, 2, 3].map(function (k, i) {
          var b = D.boxes[k], sz = Math.max(b[2] - b[0], b[3] - b[1]), sc = (18 + k * 14) / sz, cx = 24 + i * cw, cy = 64, mx = (b[0] + b[2]) / 2, my = (b[1] + b[3]) / 2;
          return '<path d="' + D.rims[k] + '" transform="translate(' + cx + ',' + cy + ') scale(' + sc + ',' + (-sc) + ') translate(' + (-mx) + ',' + (-my) + ')" fill="' + fills[k] + '" fill-opacity=".18" stroke="' + fills[k] + '" stroke-width="1.8" vector-effect="non-scaling-stroke"/>' +
            gt(cx, 128, 'N' + k, fills[k], 'middle') + gt(cx, 146, ['1', '9', '71', '559'][k], GM, 'middle') + (i < 3 ? gt(cx + cw / 2 + 4, 76, '⊂', GM, 'middle') : '');
        }).join('');
        return gsvg('The blocks of the nest: N0, one tile, inside N1, inside N2, inside N3', cells + gt(124, 162, 'tiles in each block', GM, 'middle'), 252, 168);
      case 'thread':
      case 'labyrinth':
        var TH = window.SKTHREAD; if (!TH) return '';
        var all = []; TH.laby.forEach(function (q) { all = all.concat(q); });
        var Ft = frame(bbox(all, 0.5), 190), sw = 0.8 / Ft.sc, isT = name === 'thread';
        var body = '<g transform="' + Ft.g + '">' + TH.tiles.map(function (q) { return '<path d="' + polyD(q) + '" fill="#101c18" stroke="#3d5249" stroke-width="' + sw + '"/>'; }).join('') +
          (isT ? '' : TH.laby.map(function (q) { return '<path d="' + polyD(q) + '" fill="' + GA + '" fill-opacity=".32" stroke="' + GA + '" stroke-width="' + (1.2 * sw) + '"/>'; }).join('')) +
          '<path d="' + polyD(TH.start) + '" fill="' + (isT ? '#1d3a31' : 'none') + '" stroke="' + GR + '" stroke-width="' + (2.4 * sw) + '"/>' +
          (isT ? '<path d="' + TH.d + '" fill="none" stroke="#06100d" stroke-width="' + (5 * sw) + '" stroke-linecap="round" stroke-linejoin="round"/><path d="' + TH.d + '" fill="none" stroke="' + GA + '" stroke-width="' + (2.6 * sw) + '" stroke-linecap="round" stroke-linejoin="round"/>' : '') + '</g>';
        return '<svg viewBox="0 0 ' + Ft.W + ' ' + (Ft.H + 22) + '" role="img" aria-label="' + (isT ? 'The starting tile’s thread: ' + TH.pieces + ' pieces' : 'The starting tile’s labyrinth: ' + TH.labyN + ' tiles') + '">' + body +
          gt(Ft.W / 2, Ft.H + 16, isT ? 'thread: ' + TH.pieces + ' pieces' : 'labyrinth: ' + TH.labyN + ' tiles', isT ? GA : GA, 'middle') + '</svg>';
      case 'lean':
        var mono = ' font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11.5"';
        return gsvg('Lean: the statements of the two theorems, each checked by Lean',
          '<rect x="14" y="16" width="212" height="104" rx="10" fill="#0b1512" stroke="' + GM + '" stroke-width="1.4"/>' +
          '<text x="26" y="42"' + mono + ' fill="' + GS + '">theorem</text><text x="84" y="42"' + mono + ' fill="' + GI + '">theoremA_strand</text>' +
          '<text x="26" y="62"' + mono + ' fill="' + GM + '">  … := by …</text>' +
          '<text x="26" y="88"' + mono + ' fill="' + GS + '">theorem</text><text x="84" y="88"' + mono + ' fill="' + GI + '">theoremB_strand</text>' +
          '<text x="26" y="108"' + mono + ' fill="' + GM + '">  … := by …</text>' +
          '<path d="M60,140l8,8l16,-18" fill="none" stroke="#F0E442" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' + gt(92, 146, 'checked by Lean', '#F0E442'), 240, 160);
      case 'ribbon':
        return tile({ width: 260, pad: 0.3, label: 'The tile and its ribbon' });
      case 'piece':
        return tile({ colours: true, width: 260, pad: 0.3, label: 'The 14 pieces of one tile, each in its own colour' });
      case 'strand':
        return SK.snapshot({ level: 1, box: SK.boxOf(1, 0.05), width: 260, mode: 't', markTile: true, label: 'Nine tiles: the middle tile’s pieces lie on five strands, one colour each' });
      case 'arc':
        return SK.snapshot({ level: 1, box: SK.boxOf(1, 0.05), width: 260, mode: 'b', label: 'A block of nine tiles: each colour is one arc, running from its rim back to its rim' });
      case 'port':
        return tile({ ports: true, width: 260, pad: 0.3, label: 'The tile with a port on each of its 14 edges' });
      case 'supertile':
        return SK.snapshot({ level: 1, box: SK.boxOf(1, 0.04), width: 260, ribbons: false, tileFill: '#183029', tileEdge: GM, tileW: 0.05, rimColour: GA, rimW: 0.14, label: 'Nine tiles making one supertile' });
      case 'level':
        return nest({ top: 2, width: 260, headroom: 0.12 });
      case 'rim':
        return SK.snapshot({ level: 2, box: SK.boxOf(2, 0.03), width: 260, ribbons: false, tileFill: '#12211c', tileEdge: 'rgba(205,235,220,0.25)', tileW: 0.05, rimColour: GA, rimW: 0.4, label: 'The rim of a 71-tile supertile' });
      case 'hook':
        return gsvg('A hook: a ribbon turns back round one corner',
          '<path d="M20,50H170V150H20Z" fill="' + GB + '"/><path d="M20,50H170V150" fill="none" stroke="' + GI + '" stroke-width="2.5"/>' +
          grib('M136,12 L136,50 C136,92 170,82 210,82', GS) + gdot(170, 50, GI, 5) + gring(136, 50, GA) + gring(170, 82, GA) +
          gt(176, 44, 'corner') + gt(30, 140, 'inside the supertile') + gt(204, 100, 'out', GS, 'end') + gt(118, 26, 'in', GS, 'end'));
      case 'crossover':
        return gsvg('The crossover: at corners A and B the two ribbons do not hook; they cross inside the supertile',
          '<path d="M40,140V40H200V140Z" fill="' + GB + '"/><path d="M40,140V40H200V140" fill="none" stroke="' + GI + '" stroke-width="2.5"/>' +
          grib('M75,6 L75,40 C75,70 95,75 120,100 C145,125 180,70 200,70 L236,70', GS, true) +
          grib('M165,6 L165,40 C165,70 145,75 120,100 C95,125 60,70 40,70 L4,70', GA) +
          gdot(40, 40, GI, 5) + gdot(200, 40, GI, 5) + [[40, 70], [75, 40], [165, 40], [200, 70]].map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="3.2" fill="#0d1a16" stroke="' + GI + '" stroke-width="1.6"/>'; }).join('') +
          gt(32, 32, 'A', GI, 'end') + gt(208, 32, 'B', GI) + gt(120, 158, 'they cross inside', GM, 'middle'), 240, 166);
      case 'signature':
        return signature(1, { width: 260, label: 'The signature of a 9-tile supertile' });
      case 'run':
        return gsvg('A run: the stretch along which two neighbours touch',
          '<path d="M10,20H230V80L200,80L180,75H60L40,80H10Z" fill="' + GB + '"/><path d="M10,150H230V95L200,95L180,75H60L40,95H10Z" fill="#1f3d33"/>' +
          '<path d="M60,75H180" stroke="' + GA + '" stroke-width="5"/>' + [60, 84, 108, 132, 156, 180].map(function (x, i) { return gdot(x, 75, i % 5 ? GI : GA, i % 5 ? 3 : 5); }).join('') +
          gt(16, 40, 'block A', GI) + gt(16, 136, 'block B', GI) + gt(120, 62, 'run of 5 edges', GA, 'middle'));
      case 'parity':
        var row = function (n, y, c) { var s = '', st = 160 / n; for (var i = 0; i <= n; i++) s += gdot(40 + i * st, y, c, i === 0 || i === n ? 5 : 3); return '<path d="M40,' + y + 'H200" stroke="' + c + '" stroke-width="2.5"' + (n % 2 ? ' stroke-dasharray="6 4"' : '') + '/>' + s; };
        return gsvg('Even and odd runs', row(4, 50, GR) + gt(120, 34, '4 edges: even', GR, 'middle') + row(5, 120, GA) + gt(120, 104, '5 edges: odd', GA, 'middle') + gt(120, 150, 'only this difference matters', GM, 'middle'));
      case 'mark':
        var H6 = [[70, 30], [170, 30], [210, 80], [170, 130], [70, 130], [30, 80]];
        var seg = function (a, b, c, dash) { return '<path d="M' + H6[a] + 'L' + H6[b] + '" stroke="' + c + '" stroke-width="5"' + (dash ? ' stroke-dasharray="7 5"' : '') + '/>'; };
        return gsvg('Marks: where a child’s neighbour changes, and its crossover corner',
          '<path d="M' + H6.join('L') + 'Z" fill="' + GB + '"/>' + seg(0, 1, GS) + seg(1, 2, GS) + '<path d="M' + H6[2] + 'L' + H6[3] + 'L' + H6[4] + '" fill="none" stroke="' + GA + '" stroke-width="5" stroke-dasharray="7 5"/>' + seg(4, 5, GP) + seg(5, 0, GP) +
          gdot(70, 30, GI, 5.5) + gdot(210, 80, GI, 5.5) + gdot(70, 130, GI, 5.5) + gring(170, 30, GI) + gdot(170, 30, GI, 3) +
          gt(120, 20, 'neighbour A', GS, 'middle') + gt(150, 152, 'neighbour B', GA, 'middle') + gt(24, 62, 'C', GP, 'end') + gt(176, 46, 'crossover', GI) + gt(120, 85, 'child', GM, 'middle'));
      case 'nest':
        return nest({ top: 4, width: 260, labels: false });
      case 'move':
        var runRow = function (n, y, lab) {   // a shared run of n edges and the ribbon zigzagging across it
          // one smooth wave: round turns at the corners, crossing the run in the middle of each edge
          var x0 = 30, x1 = 210, st = (x1 - x0) / n, side = -1, d = 'M' + (x0 - 14) + ',' + (y + 12 * side) + ' L' + x0 + ',' + (y + 12 * side), out = '';
          for (var i = 0; i < n; i++) { var a = x0 + i * st, b = a + st; d += ' C' + (a + st / 2) + ',' + (y + 12 * side) + ' ' + (b - st / 2) + ',' + (y - 12 * side) + ' ' + b + ',' + (y - 12 * side); side = -side; }
          d += ' L' + (x1 + 14) + ',' + (y + 12 * side);
          for (i = 0; i <= n; i++) out += gdot(x0 + i * st, y, i === 0 || i === n ? GA : GI, i === 0 || i === n ? 4.5 : 3);
          return '<path d="M' + x0 + ',' + y + 'H' + x1 + '" stroke="' + GM + '" stroke-width="2"/>' + '<path d="' + d + '" fill="none" stroke="' + GS + '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>' + out + gt(120, y - 22, lab, GI, 'middle');
        };
        return gsvg('A move: a shared run made two edges longer; the ribbon leaves at the same end, on the same side',
          runRow(3, 50, '3 edges') + runRow(5, 122, '5 edges: two more') + gt(120, 154, 'same ends, same side', GM, 'middle'));
      case 'junction':
        var J = [[20, 120], [60, 70], [100, 60], [140, 40], [185, 55], [222, 100]], cols = [GS, GR, GS, GR, GS], dsh = [0, 1, 0, 1, 0];
        var body = '';
        for (var q = 0; q < J.length - 1; q++) body += '<path d="M' + J[q] + 'L' + J[q + 1] + '" stroke="' + cols[q] + '" stroke-width="4"' + (dsh[q] ? ' stroke-dasharray="7 4"' : '') + '/>';
        J.forEach(function (p, q) { body += gdot(p[0], p[1], GI, q === 2 ? 5.5 : 3.5); });
        body += grib('M76,38 C86,104 118,98 128,22', GA) + gring(100, 60, GA);
        return gsvg('Junctions: where one child’s side ends and the next begins on the outline; one carries a hook',
          '<path d="M' + J.join('L') + 'L222,150L20,150Z" fill="' + GB + '"/>' + body + gt(58, 96, 'junction', GA, 'middle') + gt(120, 140, 'inside the block', GM, 'middle') + gt(150, 20, 'hook here', GA));

    }
    return '';
  }
  window.SKF = { tile: tile, places: places, curved: curved, tree: tree, periodic: periodic, signature: signature, ports: ports, zigzag: zigzag, nest: nest, scope: scope, proofMap: proofMap, lengthBar: lengthBar, parityTable: parityTable, gloss: gloss };
})();
