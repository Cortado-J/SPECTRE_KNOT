/* Shared behaviour: FAQ deep links, the level stepper and the strand counter used by Home and See. */
(function () {
  'use strict';
  // keep jump targets clear of the sticky header (and the Prove page's sticky depth bar): the header is 64px tall on
  // a wide screen but wraps to two rows on a phone, so measure it instead of guessing
  function pad() {
    var root = document.documentElement, h = document.querySelector('header.top');
    var y = h ? h.getBoundingClientRect().height : 0;
    root.style.setProperty('--hdr', y + 'px');
    if (h) y += parseFloat(getComputedStyle(h).top) || 0;   // the phone's safe-area inset, where there is one
    var d = document.querySelector('.depthbar');
    if (d && getComputedStyle(d).position === 'sticky') y += d.getBoundingClientRect().height - 2;
    root.style.scrollPaddingTop = Math.ceil(y + 12) + 'px';
  }
  document.addEventListener('DOMContentLoaded', pad);
  window.addEventListener('resize', pad);
  // open a <details> named in the URL hash, scroll to it and flash it, so a link never lands somewhere unclear
  function openHash() {
    var id = location.hash.slice(1); if (!id) return;
    var el = document.getElementById(id); if (!el) return;
    if (el.tagName === 'DETAILS') el.open = true;
    var d = el.closest && el.closest('details'); if (d) d.open = true;
    setTimeout(function () { el.scrollIntoView({ block: 'start' }); landed = scrollY; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }, 60);
  }
  // fonts and images can still move the target after that; if the reader hasn't scrolled since, land again
  var landed = null;
  window.addEventListener('load', function () {
    var el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && landed !== null && Math.abs(scrollY - landed) < 2) el.scrollIntoView({ block: 'start' });
  });
  window.addEventListener('hashchange', openHash);
  document.addEventListener('DOMContentLoaded', openHash);

  var TRAIL = { t: [14, 5, 2, 1, 1, 1], b: [null, 46, 10, 2, 2, 1] };
  function stepper(el, scene, onPick) {
    el.innerHTML = '';
    el.className = 'steps'; el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Block size');
    var fill = document.createElement('span'); fill.className = 'fill'; el.appendChild(fill);
    var btns = SK.NUM.map(function (n, k) {
      var b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<i></i><span>' + n + '<small>' + (k ? 'tiles' : 'tile') + '</small></span>';
      b.setAttribute('aria-label', 'Show a block of ' + SK.LV[k]);
      b.addEventListener('click', function () { if (onPick) onPick(k); scene.goTo(k); });
      el.appendChild(b); return b;
    });
    function update(k) {
      var mn = scene.minLevel();
      btns.forEach(function (b, i) { b.disabled = i < mn; if (i === k) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); b.classList.toggle('done', i < k && i >= mn); });
      fill.style.width = (k / 5 * 83.34) + '%';
    }
    update(Math.round(scene.L)); return { update: update };
  }
  function counter(el) {
    el.className = 'counter';
    el.innerHTML = '<div class="count" aria-live="polite"><b></b><span></span><em></em></div><div class="trail" aria-hidden="true"></div>';
    var b = el.querySelector('b'), u = el.querySelector('.count span'), em = el.querySelector('em'), tr = el.querySelector('.trail');
    function update(k, st, mode) {
      b.textContent = st.n; u.textContent = st.unit; em.textContent = 'in ' + (k ? 'a block of ' : '') + st.block;
      b.style.color = st.n === 1 ? 'var(--amber)' : 'var(--ink)';
      var T = TRAIL[mode || 't']; tr.innerHTML = '';
      T.forEach(function (n, i) {
        if (n == null) return; var s = document.createElement('span'); s.textContent = n; s.className = i === k ? 'on' : i < k ? 'past' : '';
        tr.appendChild(s);
        if (i < T.length - 1) { var a = document.createElement('i'); a.textContent = '→'; a.style.fontStyle = 'normal'; tr.appendChild(a); }
      });
    }
    return { update: update };
  }
  window.SKUI = { stepper: stepper, counter: counter };
})();
