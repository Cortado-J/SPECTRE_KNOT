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
        var A = p[4], B = p[5], na = inward(p[0]), nb = inward(p[1]), hook = p[2] === p[3], d;
        if (hook) {
          d = 'M' + F.x(A[0]) + ',' + F.y(A[1]) + 'C' + F.x(A[0] + na[0] * dep) + ',' + F.y(A[1] + na[1] * dep) + ' ' + F.x(B[0] + nb[0] * dep) + ',' + F.y(B[1] + nb[1] * dep) + ' ' + F.x(B[0]) + ',' + F.y(B[1]);
        } else {
          // as on the tile: each end leaves its port at 45 degrees, heading inwards and towards the corner it belongs to
          // (A's end towards corner p[2], B's towards p[3]); the two crossover pieces share the port on the edge between
          // the two corners, leave it in opposite directions, and so cross once
          var dirTo = function (X, c, nX) { var C = pts[c % n], ux = C[0] - X[0], uy = C[1] - X[1], ul = Math.hypot(ux, uy) || 1, vx = ux / ul + nX[0], vy = uy / ul + nX[1], vl = Math.hypot(vx, vy) || 1; return [vx / vl, vy / vl]; };
          var da = dirTo(A, p[2], na), db = dirTo(B, p[3], nb), a = Math.max(0.55, Math.hypot(B[0] - A[0], B[1] - A[1]) * 0.9);
          d = 'M' + F.x(A[0]) + ',' + F.y(A[1]) + 'C' + F.x(A[0] + da[0] * a) + ',' + F.y(A[1] + da[1] * a) + ' ' + F.x(B[0] + db[0] * a) + ',' + F.y(B[1] + db[1] * a) + ' ' + F.x(B[0]) + ',' + F.y(B[1]);
        }
        s.push('<path d="' + d + '" fill="none" stroke="' + (hook ? (p[2] % 2 ? '#56B4E9' : '#b3dcf5') : '#E69F00') + '" stroke-width="' + (hook ? w : w + 1) + '" stroke-linecap="round"/>');
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
    // ribbon starting in A beyond the first corner. It crosses the run at the port in the middle of each edge, at 45
    // degrees, and between two ports it hooks round the corner between them in one block: a quarter-circle arc
    function ribbon(startTop, col, dash) {
      var side = startTop ? -1 : 1, r = step / Math.SQRT2, px = function (j) { return m + (j + 0.5) * step; };
      var h0 = Math.min(34, step * 0.3), x0 = m - 26, b0 = Math.min(h0, (px(0) - x0) * 0.45);
      var d = 'M' + x0 + ',' + (mid + side * h0) + ' C' + (x0 + (px(0) - x0) * 0.45) + ',' + (mid + side * h0) + ' ' + (px(0) - b0) + ',' + (mid + side * b0) + ' ' + px(0) + ',' + mid;
      side = -side;
      for (var j = 1; j < n; j++) d += ' A' + r + ',' + r + ' 0 0 ' + (side < 0 ? 1 : 0) + ' ' + px(j) + ',' + mid, side = -side;
      var x1 = W - m + 26, b1 = Math.min(h0, (x1 - px(n - 1)) * 0.45);
      d += ' C' + (px(n - 1) + b1) + ',' + (mid + side * b1) + ' ' + (x1 - (x1 - px(n - 1)) * 0.45) + ',' + (mid + side * h0) + ' ' + x1 + ',' + (mid + side * h0);
      s.push('<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="5" stroke-linecap="round"' + (dash ? ' stroke-dasharray="10 7"' : '') + ' class="zz"/>');
      return side;
    }
    var endA = ribbon(true, '#E69F00', false); ribbon(false, '#56B4E9', true);
    s.push('</svg>');
    return { svg: s.join(''), same: endA < 0 };
  }

  /* blocks of the nest: N1 inside N2 inside N3 (real outlines) */
  function nest(o) {
    o = o || {}; var top = o.top || 3, b = SK.boxOf(top, 0.04).slice(), F;
    if (o.headroom) b[3] += (b[3] - b[1]) * o.headroom;
    F = frame(b, o.width || 520);
    var fills = ['#E69F00', '#56B4E9', '#7fd6b0', '#CC79A7', '#e8f1ec', '#8ab4ff'];
    var s = ['<svg viewBox="0 0 ' + F.W + ' ' + F.H + '" role="img" aria-label="Nested blocks: each is one piece of the next"><g transform="' + F.g + '">'];
    for (var k = top; k >= 0; k--) s.push('<path d="' + D.rims[k] + '" fill="' + fills[k] + '" fill-opacity="' + (k === top ? 0.08 : 0.16) + '" stroke="' + fills[k] + '" stroke-width="' + (1.8 / F.sc) + '" stroke-linejoin="round"/>');
    s.push('</g>');
    if (o.labels !== false) for (k = 0; k <= top; k++) { var bb = D.boxes[k]; s.push('<text x="' + F.x(bb[2]) + '" y="' + (F.y(bb[3]) - 4) + '" fill="' + fills[k] + '" font-size="14" font-weight="700" text-anchor="end">N' + k + ' · ' + SK.LV[k] + '</text>'); }
    s.push('</svg>'); return s.join('');
  }

  /* the small map repeats with period 2: levels 2 = 4 = 6 = 8 and 3 = 5 = 7 = 9 (two different maps) */
  function period(o) {
    o = o || {}; var W = o.width || 620, H = 150, n = 8, gx = (W - 40) / n, s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="The small map at levels 2 to 9: two shapes, alternating">'];
    for (var i = 0; i < n; i++) {
      var L = i + 2, x = 20 + i * gx + gx / 2, even = L % 2 === 0, c = even ? '#56B4E9' : '#CC79A7';
      s.push('<g transform="translate(' + x + ',62)' + (even ? '' : ' scale(-1,1)') + '"><path d="M-18,-20 L10,-24 L22,-2 L8,22 L-16,16 L-24,-4 Z" fill="' + c + '" fill-opacity=".22" stroke="' + c + '" stroke-width="2.5"/><circle cx="6" cy="-8" r="4" fill="' + c + '"/></g>');
      s.push('<text x="' + x + '" y="112" fill="#e8f1ec" font-size="14" font-weight="700" text-anchor="middle">' + L + '</text>');
      if (i >= 2) s.push('<path d="M' + (x - 2 * gx + 8) + ',28 Q' + (x - gx) + ',' + (2 + (i % 2) * 8) + ' ' + (x - 8) + ',28" fill="none" stroke="' + c + '" stroke-width="1.6" stroke-dasharray="4 3"/>');
    }
    s.push('<text x="20" y="138" fill="#a3b8ae" font-size="13">level of the supertile being built</text><text x="' + (W - 20) + '" y="138" fill="#a3b8ae" font-size="13" text-anchor="end">… and so on for ever</text></svg>');
    return s.join('');
  }

  /* what is covered: the nest tiling (no loops, one strand); other single-chain tilings and fault tilings (no loops; one strand not claimed) */
  function scope(o) {
    o = o || {}; var W = o.width || 640, H = 210, pw = W / 3, s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Three kinds of spectre tiling and what is covered">'];
    function blob(cx, cy, r, c, op) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + c + '" fill-opacity="' + op + '" stroke="' + c + '" stroke-width="1.5"/>'; }
    var y = 95;
    // 1: the nest, growing from a centre
    for (var i = 4; i >= 1; i--) s.push(blob(pw * 0.5, y, i * 17, '#7fd6b0', 0.08));
    s.push('<text x="' + pw * 0.5 + '" y="185" fill="#e8f1ec" font-size="14" font-weight="700" text-anchor="middle">✓ the nest tiling</text><text x="' + pw * 0.5 + '" y="203" fill="#a3b8ae" font-size="12" text-anchor="middle">no loops, one strand</text>');
    // 2: a different chain, growing off-centre
    for (i = 4; i >= 1; i--) s.push(blob(pw * 1.5 + (4 - i) * 9, y - (4 - i) * 6, i * 17, '#56B4E9', 0.08));
    s.push('<text x="' + pw * 1.5 + '" y="185" fill="#e8f1ec" font-size="14" font-weight="700" text-anchor="middle">~ another single chain</text><text x="' + pw * 1.5 + '" y="203" fill="#a3b8ae" font-size="12" text-anchor="middle">no loops; may have 3 strands</text>');
    // 3: two infinite chains meeting along a line
    s.push('<rect x="' + (pw * 2 + 20) + '" y="25" width="' + (pw / 2 - 20) + '" height="140" fill="#CC79A7" fill-opacity=".12" stroke="#CC79A7"/><rect x="' + (pw * 2.5) + '" y="25" width="' + (pw / 2 - 20) + '" height="140" fill="#E69F00" fill-opacity=".12" stroke="#E69F00"/>');
    s.push('<path d="M' + pw * 2.5 + ',18V172" stroke="#e8f1ec" stroke-width="2.5" stroke-dasharray="6 4"/>');
    s.push('<text x="' + pw * 2.5 + '" y="185" fill="#e8f1ec" font-size="14" font-weight="700" text-anchor="middle">~ a fault tiling</text><text x="' + pw * 2.5 + '" y="203" fill="#a3b8ae" font-size="12" text-anchor="middle">no loops; strands not counted</text></svg>');
    return s.join('');
  }

  /* the map of the proof: what rests on what. Each box links to its step. */
  var STAT = { computed: ['#56B4E9', 'computed'], cited: ['#E69F00', 'cited'], proved: ['#7fd6b0', 'argued'] };
  var PM_NODES = null;
  function proofMap(o) {
    /* shared groundwork at the top; below, two branches, each ending in one of the two theorems */
    o = o || {}; var W = 940, bw = 200, bh = 64, rowy = [16, 120, 224, 328, 470, 586], H = 668;
    var N = {   // [column, row, title, subtitle, support, step, label in the step (on the box, the step's chips and the rigorous notes),
    //  where it is in the write-up, goal]
      tile: [0, 0, 'The tile’s drawing', '12 hooks, 1 crossover', 'computed', 'p3', '3a', 'Lemma 4.4'],
      hier: [3, 0, 'Supertiles, for ever', 'same pattern at every level', 'cited', 'p1', '1a', 'Thm 2.1, Prop. 2.4'],
      L1: [0, 1, 'Black box', 'only rim ports matter', 'proved', 'p2', '2a', 'Lemmas 4.1, 4.2'],
      L2: [1, 1, 'Zigzag Lemma', 'a run: only even or odd', 'proved', 'p4', '4a', 'Lemma 5.1'],
      sig: [2, 1, 'Signature at level 1', 'every kind, no loop', 'computed', 'p3', '3b', 'Computation 7.2(a)'],
      sides: [3, 1, 'Side lengths', 'one matrix; parities fixed', 'computed', 'p5', '5b', 'Props 6.1, 6.2, Cor. 6.3'],
      L3: [0.5, 2, 'Small-map walk', 'equals the exact gluing', 'proved', 'p5', '5a', 'Prop. 5.4'],
      L5: [3, 2, 'Small map alternates', 'for ever', 'proved', 'p5', '5c', 'Lemma 7.1'],
      WALK: [0, 3, 'The 18 walks', 'nine kinds, two parities', 'computed', 'p5', '5e', 'Computation 7.2(b)'],
      T6: [1.5, 3, 'Signature Theorem', 'every supertile, every level', 'proved', 'p5', '5d', 'Thm 7.3'],
      LOC: [0, 4, 'Localisation Lemma', 'a loop needs ≤ 3 supertiles', 'proved', 'p6', '6a', 'Lemma 7.6'],
      TURN: [1, 4, 'Hairpin Lemma', 'loops turn only at crossovers', 'proved', 'p6', '6c', 'Lemma 7.8'],
      L8: [2, 4, 'Every block merges', 'one strand 3 or 4 levels up', 'computed', 'p7', '7a', 'Thm 8.5, Lemma 8.8'],
      L7: [3, 4, 'Grandparent Lemma', 'the nest covers the plane', 'proved', 'p7', '7b', 'Lemma 8.3'],
      ERT: [0, 5, 'Endless Strand Theorem', 'no loop, in any tiling', 'proved', 'p6', '6d', '§7.3', 'goal1'],
      FAR: [1, 5, 'Lonely Crossover Lemma', 'crossovers a side apart', 'proved', 'p6', '6b', 'Lemma 7.7'],
      AT: [2.5, 5, 'Ariadne Theorem', 'one strand, in the nest tiling', 'proved', 'p7', '7c', '§8.3', 'goal2']
    };
    PM_NODES = N;
    var E = [['tile', 'sig'], ['L1', 'L3'], ['L2', 'L3'], ['hier', 'sides'], ['sides', 'L5'], ['L3', 'T6'], ['sig', 'T6'], ['L5', 'T6'], ['hier', 'L7'],
      ['L3', 'WALK'], ['WALK', 'T6', 'right'],
      ['T6', 'LOC'], ['T6', 'TURN'], ['LOC', 'TURN', 'right'], ['T6', 'L8'], ['L5', 'L8'], ['LOC', 'ERT'], ['TURN', 'ERT'], ['FAR', 'ERT', 'side'], ['L8', 'AT'], ['L7', 'AT']];
    function pos(k) { var n = N[k], x = 20 + n[0] * 225; return { x: x, y: rowy[n[1]] }; }
    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="The map of the proof: shared groundwork, then one branch for each of the two theorems">',
      '<defs><marker id="pm-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#6f877c"/></marker></defs>'];
    // the two branches, each in its own band
    var yb = rowy[4] - 30, hb = H - yb - 4;
    s.push('<rect x="8" y="' + yb + '' + '" width="452" height="' + hb + '" rx="16" fill="#7fd6b0" fill-opacity=".05" stroke="#7fd6b0" stroke-opacity=".35"/>');
    s.push('<text x="22" y="' + (yb + 19) + '" fill="#7fd6b0" font-size="11.5" font-weight="700" letter-spacing="1.2">CLAIM 1</text>');
    s.push('<rect x="468" y="' + yb + '" width="444" height="' + hb + '" rx="16" fill="#E69F00" fill-opacity=".05" stroke="#E69F00" stroke-opacity=".35"/>');
    s.push('<text x="482" y="' + (yb + 19) + '" fill="#E69F00" font-size="11.5" font-weight="700" letter-spacing="1.2">CLAIM 2</text>');
    E.forEach(function (e) {
      var a = pos(e[0]), b = pos(e[1]), x0 = a.x + bw / 2, y0 = a.y + bh, x1 = b.x + bw / 2, y1 = b.y;
      if (e[2] === 'side') {   // from the left side of the source to the right side of the target, same row
        var yy = a.y + bh / 2;
        s.push('<path d="M' + a.x + ',' + yy + 'L' + (b.x + bw + 2) + ',' + yy + '" fill="none" stroke="#6f877c" stroke-width="1.6" marker-end="url(#pm-a)"/>');
        return;
      }
      if (e[2] === 'right') {   // from the right side of the source to the left side of the target, same row
        var yr = a.y + bh / 2;
        s.push('<path d="M' + (a.x + bw) + ',' + yr + 'L' + (b.x - 2) + ',' + yr + '" fill="none" stroke="#6f877c" stroke-width="1.6" marker-end="url(#pm-a)"/>');
        return;
      }
      if (e[0] === 'hier' && e[1] === 'L7') {   // round the right-hand side, clear of the boxes in between
        var xr = a.x + bw, xm = W - 12, ya = a.y + bh / 2, yb2 = b.y + bh / 2;
        s.push('<path d="M' + xr + ',' + ya + 'C' + xm + ',' + ya + ' ' + xm + ',' + ya + ' ' + xm + ',' + (ya + 20) + 'L' + xm + ',' + (yb2 - 20) + 'C' + xm + ',' + yb2 + ' ' + xm + ',' + yb2 + ' ' + (xr + 2) + ',' + yb2 + '" fill="none" stroke="#6f877c" stroke-width="1.6" marker-end="url(#pm-a)"/>');
        return;
      }
      s.push('<path d="M' + x0 + ',' + y0 + 'C' + x0 + ',' + (y0 + 34) + ' ' + x1 + ',' + (y1 - 34) + ' ' + x1 + ',' + (y1 - 2) + '" fill="none" stroke="#6f877c" stroke-width="1.6" marker-end="url(#pm-a)"/>');
    });
    Object.keys(N).forEach(function (k) {
      var n = N[k], p = pos(k), st = STAT[n[4]], goal = n[8], fid = 'f' + n[6];
      var fill = goal === 'goal1' ? '#10302a' : goal === 'goal2' ? '#2a2310' : '#12211c', edge = goal === 'goal1' ? '#7fd6b0' : goal === 'goal2' ? '#E69F00' : st[0];
      s.push('<a href="#' + n[5] + '" data-step="' + n[5] + '" data-fact="' + fid + '"><g class="pm-node"><rect x="' + p.x + '" y="' + p.y + '" width="' + bw + '" height="' + bh + '" rx="12" fill="' + fill + '" stroke="' + edge + '" stroke-width="' + (goal ? 3 : 2) + '"/>' +
        '<text x="' + (p.x + 12) + '" y="' + (p.y + 23) + '" fill="#e8f1ec" font-size="' + (goal ? 15.5 : 15) + '" font-weight="700">' + n[2] + '</text>' +
        '<text x="' + (p.x + 12) + '" y="' + (p.y + 41) + '" fill="#a3b8ae" font-size="12.5">' + n[3] + '</text>' +
        '<text x="' + (p.x + 12) + '" y="' + (p.y + 57) + '" fill="' + (goal ? edge : st[0]) + '" font-size="10.5" font-weight="700" letter-spacing="1">' + (goal ? 'THEOREM · ' + st[1].toUpperCase() : st[1].toUpperCase()) + '</text>' +
        '<rect x="' + (p.x + bw - 50) + '" y="' + (p.y - 11) + '" width="40" height="22" rx="11" fill="' + edge + '"/>' +
        '<text x="' + (p.x + bw - 30) + '" y="' + (p.y + 5) + '" fill="#0a1411" font-size="13" font-weight="800" text-anchor="middle">' + n[6] + '</text></g></a>');
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
        return gsvg('The crossover: two ribbons cross on the edge AB instead of hooking',
          '<path d="M30,150L70,50H170L210,150Z" fill="' + GB + '"/><path d="M30,150L70,50H170L210,150" fill="none" stroke="' + GI + '" stroke-width="2.5"/>' +
          grib('M28,72 L58,80 C95,95 130,90 146,50 L150,22', GA) + grib('M212,72 L182,80 C145,95 110,90 94,50 L90,22', GS, true) +
          gdot(70, 50, GI, 5) + gdot(170, 50, GI, 5) + gt(64, 40, 'A', GI, 'end') + gt(176, 40, 'B', GI) + gt(120, 140, 'the two ribbons cross', GM, 'middle'));
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
    }
    return '';
  }
  window.SKF = { tile: tile, places: places, curved: curved, tree: tree, periodic: periodic, signature: signature, ports: ports, zigzag: zigzag, nest: nest, period: period, scope: scope, proofMap: proofMap, proofNodes: function () { if (!PM_NODES) proofMap(); return PM_NODES; }, STAT: STAT, lengthBar: lengthBar, parityTable: parityTable, gloss: gloss };
})();
