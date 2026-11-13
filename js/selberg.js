// (1) 異変：ヨットが出るとセルバーグ仕様のホームページになる
// (2) セルバーグ跡公式への道：証明の進み具合に応じて増えていく紹介アニメーション
(function () {
  // ======================================================== 共通：KaTeX を必要なときだけ読み込む
  var katexPromise = null;
  function loadKatex() {
    if (window.katex) return Promise.resolve();
    if (katexPromise) return katexPromise;
    katexPromise = new Promise(function (res, rej) {
      var base = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/';
      var css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = base + 'katex.min.css';
      document.head.appendChild(css);
      var js = document.createElement('script');
      js.src = base + 'katex.min.js';
      js.onload = function () { res(); };
      js.onerror = function () { rej(); };
      document.head.appendChild(js);
    });
    return katexPromise;
  }
  function tex(el, s, display) {
    try { window.katex.render(s, el, { displayMode: !!display, throwOnError: false }); }
    catch (e) { el.textContent = s; }
  }

  // ======================================================== (1) 異変
  var FORMULAS = [
    '\\sum_j h(r_j)=\\frac{\\operatorname{Area}(F)}{4\\pi}\\int_{-\\infty}^{\\infty} r\\,h(r)\\tanh(\\pi r)\\,dr+\\sum_{\\{\\gamma\\}\\neq 1}\\frac{\\log N(\\gamma_0)}{N(\\gamma)^{1/2}-N(\\gamma)^{-1/2}}\\,g(\\log N(\\gamma))',
    '\\Delta=-y^2\\left(\\frac{\\partial^2}{\\partial x^2}+\\frac{\\partial^2}{\\partial y^2}\\right)',
    'ds^2=\\frac{dx^2+dy^2}{y^2}',
    'g\\cdot z=\\frac{az+b}{cz+d}',
    '\\Delta y^s=s(1-s)\\,y^s',
    '\\lambda=\\tfrac14+r^2',
    'h(r)=\\int_{-\\infty}^{\\infty} g(a)\\,e^{ira}\\,da',
    'Q(v)=\\int_v^{\\infty}\\frac{k(u)}{\\sqrt{u-v}}\\,du',
    'g(a)=2\\,Q\\!\\left(\\sinh^2\\tfrac a2\\right)',
    'G/K\\cong\\mathbb{H}',
    '\\Gamma\\backslash\\mathbb{H}',
    'u(z,w)=\\frac{|z-w|^2}{4\\operatorname{Im}z\\operatorname{Im}w}',
    'N(\\gamma)^{1/2}+N(\\gamma)^{-1/2}=|\\operatorname{tr}\\gamma|',
    'K=\\mathrm{SO}(2)',
    'k(0)=\\frac{1}{4\\pi}\\int_{-\\infty}^{\\infty} r\\,h(r)\\tanh(\\pi r)\\,dr',
    '\\mathrm{SL}(2,\\mathbb{R})/\\{\\pm I\\}\\cong\\mathrm{PSL}(2,\\mathbb{R})'
  ];
  var active = false, rainTimer = null, saved = {};

  function trigger() {
    if (active) return;
    active = true;
    var root = document.documentElement;
    root.classList.add('selberg');
    saved.title = document.title;
    document.title = 'セルバーグのぺーーーーージ';
    var h1 = document.querySelector('#home h1');
    if (h1) { saved.h1 = h1.textContent; h1.textContent = 'セルバーグ跡公式のぺーーーーージ'; }

    var banner = document.createElement('div');
    banner.id = 'selberg-banner';
    banner.innerHTML = '⚠ 異変発生：ヨット　→　このサイトはセルバーグ仕様になりました <button type="button">鎮める</button>';
    banner.querySelector('button').addEventListener('click', stop);
    document.body.appendChild(banner);

    var panel = document.createElement('div');
    panel.id = 'selberg-panel';
    panel.innerHTML = '<p class="nichanicha">セルバーグwwにちゃにちゃwどぅふw</p><div class="big"></div>';
    var main = document.querySelector('main');
    main.insertBefore(panel, main.firstChild);

    var rain = document.createElement('div');
    rain.id = 'rain';
    rain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(rain);

    loadKatex().then(function () {
      if (!active) return;
      tex(panel.querySelector('.big'), FORMULAS[0], true);
      startRain(rain, true);
    }, function () {
      if (!active) return;
      panel.querySelector('.big').textContent = 'Σ h(r_j) = (Area/4π) ∫ r h(r) tanh(πr) dr + Σ log N(γ₀) g(log N(γ)) / (N^{1/2} − N^{−1/2})';
      startRain(rain, false);
    });
  }

  function startRain(rain, useTex) {
    rainTimer = setInterval(function () {
      if (rain.childElementCount > 40) return;
      var f = document.createElement('div');
      f.className = 'f';
      var s = FORMULAS[Math.floor(Math.random() * FORMULAS.length)];
      if (useTex) tex(f, s, false); else f.textContent = s;
      f.style.left = (Math.random() * 90) + 'vw';
      f.style.fontSize = (0.8 + Math.random() * 1.2) + 'em';
      f.style.animationDuration = (6 + Math.random() * 7) + 's';
      f.style.setProperty('--rot', ((Math.random() - 0.5) * 60) + 'deg');
      f.addEventListener('animationend', function () { f.remove(); });
      rain.appendChild(f);
    }, 350);
  }

  function stop() {
    if (!active) return;
    active = false;
    clearInterval(rainTimer);
    document.documentElement.classList.remove('selberg');
    document.title = saved.title;
    var h1 = document.querySelector('#home h1');
    if (h1 && saved.h1) h1.textContent = saved.h1;
    ['selberg-banner', 'selberg-panel', 'rain'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  // 隠しコマンド：キーボードで s e l b e r g と打っても異変が起きる
  var typed = '';
  document.addEventListener('keydown', function (e) {
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-7);
    if (typed === 'selberg') trigger();
  });

  window.Selberg = { trigger: trigger, stop: stop };

  // ======================================================== (2) セルバーグ跡公式への道
  // 証明が進んだら，CARDS に項目を足す／locked を外す。
  var CARDS = [
    { sec: '§2.1', title: '上半平面 ℍ', desc: '舞台。y > 0 の世界。平行移動で流れていく点たち。', draw: drawH },
    { sec: '§2.1', title: '一次分数変換 g·z', desc: 'g·z = (az+b)/(cz+d)。双曲型の元で流すと，半円が半円に移る。', draw: drawMobius },
    { sec: '§2.1', title: '双曲計量 ds² = (dx²+dy²)/y²', desc: '同じ双曲半径の円。下に行くほど小さく見える。', draw: drawMetric },
    { sec: '§2.2', title: '測地線', desc: '2 点を結ぶ最短の道は，実軸上に中心をもつ半円（点線は普通の線分）。', draw: drawGeodesic },
    { sec: '§2.3', title: '固定部分群 K = SO(2)', desc: 'i を動かさない変換たち。i のまわりの「回転」。', draw: drawK },
    { sec: '§2.4', title: '双曲ラプラシアン Δ', desc: 'Δ yˢ = s(1−s) yˢ。s = 1/2 + ir の実部 √y cos(r log y) の縞模様。', draw: drawLaplacian },
    { sec: '§3.1', locked: true },
    { sec: '§3.4', locked: true },
    { sec: '§4', locked: true },
    { sec: '§5', locked: true }
  ];
  var LATEST = '§2.4';

  var grid = document.getElementById('sb-grid');
  if (!grid) return;
  var note = document.getElementById('sb-progress');
  if (note) note.textContent = '証明の進み具合に応じて増えていきます（現在：' + LATEST + ' まで）';

  var live = [];
  CARDS.forEach(function (c) {
    var card = document.createElement('div');
    card.className = 'sb-card' + (c.locked ? ' locked' : '');
    if (c.locked) {
      card.innerHTML = '<p class="q">？？？</p><p class="sec">' + c.sec + ' で解禁</p>';
    } else {
      var cv = document.createElement('canvas');
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', c.title);
      card.appendChild(cv);
      card.insertAdjacentHTML('beforeend', '<p class="sec">' + c.sec + '</p><h3></h3><p class="d"></p>');
      card.querySelector('h3').textContent = c.title;
      card.querySelector('.d').textContent = c.desc;
      live.push({ cv: cv, draw: c.draw });
    }
    grid.appendChild(card);
  });

  function fit() {
    var dpr = window.devicePixelRatio || 1;
    live.forEach(function (o) {
      var w = o.cv.clientWidth, h = o.cv.clientHeight;
      o.cv.width = Math.round(w * dpr); o.cv.height = Math.round(h * dpr);
      o.w = w; o.h = h; o.dpr = dpr;
    });
  }
  window.addEventListener('resize', fit);

  var section = document.getElementById('math');
  var fitted = false;
  (function loop(ts) {
    if (section && !section.hidden && !document.hidden) {
      if (!fitted || live.some(function (o) { return o.w !== o.cv.clientWidth; })) { fit(); fitted = true; }
      var cs = getComputedStyle(document.documentElement);
      var col = { fg: cs.getPropertyValue('--fg').trim() || '#213547', link: cs.getPropertyValue('--link').trim() || '#646cff' };
      var t = ts / 1000;
      live.forEach(function (o) {
        if (!o.w) return;
        var ctx = o.cv.getContext('2d');
        ctx.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
        ctx.clearRect(0, 0, o.w, o.h);
        o.draw(ctx, o.w, o.h, t, col);
      });
    }
    requestAnimationFrame(loop);
  })(0);

  // ---------- 複素数と座標
  var X0 = -3, X1 = 3, YMAX = 3.2;
  function P(w, h) { return function (x, y) { return [(x - X0) / (X1 - X0) * w, h - y / YMAX * h]; }; }
  function mob(m, z) {
    var nr = m[0] * z[0] + m[1], ni = m[0] * z[1], dr = m[2] * z[0] + m[3], di = m[2] * z[1];
    var d = dr * dr + di * di;
    return [(nr * dr + ni * di) / d, (ni * dr - nr * di) / d];
  }
  function axis(ctx, w, h, col) {
    ctx.strokeStyle = col.fg; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h - 0.5); ctx.lineTo(w, h - 0.5); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function poly(ctx, pts, p, w) {
    var prev = null;
    ctx.beginPath();
    pts.forEach(function (z) {
      var q = p(z[0], z[1]);
      if (!prev || Math.abs(q[0] - prev[0]) > w / 2 || Math.abs(q[1] - prev[1]) > w / 2) ctx.moveTo(q[0], q[1]);
      else ctx.lineTo(q[0], q[1]);
      prev = q;
    });
    ctx.stroke();
  }
  function semicircle(c, r, n) {
    var pts = [];
    for (var i = 1; i < n; i++) { var a = Math.PI * i / n; pts.push([c + r * Math.cos(a), r * Math.sin(a)]); }
    return pts;
  }
  function label(ctx, s, x, y, col) {
    ctx.fillStyle = col.fg; ctx.globalAlpha = 0.8; ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(s, x, y); ctx.globalAlpha = 1;
  }

  // ---------- 各カードの絵
  var SEED = [];
  for (var i = 0; i < 36; i++) SEED.push([Math.random() * 6 - 3, 0.1 + Math.random() * 3]);

  function drawH(ctx, w, h, t, col) {
    var p = P(w, h);
    ctx.fillStyle = col.link; ctx.globalAlpha = 0.07; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
    axis(ctx, w, h, col);
    SEED.forEach(function (s) {
      var x = ((s[0] + 3 + 0.4 * t) % 6 + 6) % 6 - 3;
      var q = p(x, s[1]);
      ctx.fillStyle = col.link;
      ctx.beginPath(); ctx.arc(q[0], q[1], 1.5 + s[1] * 1.3, 0, 2 * Math.PI); ctx.fill();
    });
    label(ctx, 'ℍ = { x + iy | y > 0 }', 8, 18, col);
    label(ctx, 'ℝ', w - 16, h - 6, col);
  }

  function drawMobius(ctx, w, h, t, col) {
    var p = P(w, h), s = 1.1 * Math.sin(t * 0.7);
    var m = [Math.cosh(s / 2), Math.sinh(s / 2), Math.sinh(s / 2), Math.cosh(s / 2)];
    axis(ctx, w, h, col);
    ctx.lineWidth = 1.5;
    var curves = [];
    [-2, -1, 0, 1, 2].forEach(function (c) { curves.push(semicircle(c, 0.5, 60)); });
    [-1.5, 0.5, 1.5].forEach(function (c) { curves.push(semicircle(c, 1, 80)); });
    [-2.5, -0.5].forEach(function (x) { var pts = []; for (var k = 0; k < 80; k++) pts.push([x, 0.02 * Math.pow(1.08, k)]); curves.push(pts); });
    curves.forEach(function (cv, j) {
      ctx.strokeStyle = j % 2 ? col.link : col.fg;
      ctx.globalAlpha = j % 2 ? 1 : 0.6;
      poly(ctx, cv.map(function (z) { return mob(m, z); }), p, w);
    });
    ctx.globalAlpha = 1;
    [-1, 1].forEach(function (x) { var q = p(x, 0); ctx.fillStyle = col.link; ctx.beginPath(); ctx.arc(q[0], q[1] - 1, 3.5, 0, 2 * Math.PI); ctx.fill(); });
    label(ctx, 'z ↦ (cosh·z + sinh)/(sinh·z + cosh)', 8, 18, col);
  }

  function drawMetric(ctx, w, h, t, col) {
    var p = P(w, h);
    axis(ctx, w, h, col);
    ctx.strokeStyle = col.fg; ctx.globalAlpha = 0.25; ctx.lineWidth = 1;
    for (var k = -6; k < 3; k++) {
      var y = Math.pow(2, k);
      var a = p(X0, y), b = p(X1, y);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      for (var x = X0; x <= X1; x += y) {
        var c = p(x, y), d = p(x, 2 * y);
        ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    var u = (1 + Math.sin(t * 0.6)) / 2;
    var y0 = Math.exp(Math.log(0.12) + u * (Math.log(1.5) - Math.log(0.12)));
    var r = 0.55, cx = Math.sin(t * 0.4) * 1.5;
    var cen = p(cx, y0 * Math.cosh(r));
    var rx = y0 * Math.sinh(r) / (X1 - X0) * w, ry = y0 * Math.sinh(r) / YMAX * h;
    ctx.fillStyle = col.link; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.ellipse(cen[0], cen[1], rx, ry, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = col.link; ctx.lineWidth = 2; ctx.stroke();
    label(ctx, '双曲半径 0.55 の円（どれも同じ大きさ）', 8, 18, col);
  }

  function drawGeodesic(ctx, w, h, t, col) {
    var p = P(w, h);
    axis(ctx, w, h, col);
    var z = [-1.6 + 0.5 * Math.sin(t * 0.8), 0.7 + 0.35 * Math.cos(t * 0.6)];
    var v = [1.3 + 0.5 * Math.cos(t * 0.7), 1.1 + 0.5 * Math.sin(t * 0.5)];
    var c = (v[0] * v[0] + v[1] * v[1] - z[0] * z[0] - z[1] * z[1]) / (2 * (v[0] - z[0]));
    var R = Math.hypot(z[0] - c, z[1]);
    ctx.strokeStyle = col.fg; ctx.globalAlpha = 0.3; ctx.lineWidth = 1;
    poly(ctx, semicircle(c, R, 120), p, w);
    ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.6;
    var a = p(z[0], z[1]), b = p(v[0], v[1]);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    var a1 = Math.atan2(z[1], z[0] - c), a2 = Math.atan2(v[1], v[0] - c), pts = [];
    for (var i = 0; i <= 80; i++) { var th = a1 + (a2 - a1) * i / 80; pts.push([c + R * Math.cos(th), R * Math.sin(th)]); }
    ctx.strokeStyle = col.link; ctx.lineWidth = 3;
    poly(ctx, pts, p, w);
    [a, b].forEach(function (q) { ctx.fillStyle = col.fg; ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, 2 * Math.PI); ctx.fill(); });
    var m = p(c, 0); ctx.fillStyle = col.link; ctx.beginPath(); ctx.arc(m[0], m[1] - 1, 3, 0, 2 * Math.PI); ctx.fill();
    label(ctx, 'z と w を結ぶ測地線', 8, 18, col);
  }

  function drawK(ctx, w, h, t, col) {
    var p = P(w, h);
    axis(ctx, w, h, col);
    [0.35, 0.7, 1.05].forEach(function (r, j) {
      var cen = p(0, Math.cosh(r)), rad = Math.sinh(r) / YMAX * h;
      ctx.strokeStyle = col.fg; ctx.globalAlpha = 0.3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cen[0], cen[1], Math.sinh(r) / (X1 - X0) * w, rad, 0, 0, 2 * Math.PI); ctx.stroke();
      ctx.globalAlpha = 1;
      for (var k = 0; k < 3; k++) {
        var th = t * (0.5 + 0.15 * j) + k * Math.PI / 3;
        var q = mob([Math.cos(th), Math.sin(th), -Math.sin(th), Math.cos(th)], [0, Math.exp(r)]);
        var s = p(q[0], q[1]);
        ctx.fillStyle = col.link; ctx.beginPath(); ctx.arc(s[0], s[1], 4, 0, 2 * Math.PI); ctx.fill();
      }
    });
    var i0 = p(0, 1);
    ctx.fillStyle = col.fg; ctx.beginPath(); ctx.arc(i0[0], i0[1], 3, 0, 2 * Math.PI); ctx.fill();
    label(ctx, 'i', i0[0] + 6, i0[1] + 4, col);
    label(ctx, 'k·z = (z cosθ + sinθ)/(−z sinθ + cosθ)', 8, 18, col);
  }

  function drawLaplacian(ctx, w, h, t, col) {
    var r = 4 + 2 * Math.sin(t * 0.5);
    ctx.fillStyle = col.link;
    for (var py = 0; py < h; py += 2) {
      var y = (h - py) / h * YMAX;
      if (y <= 0) continue;
      ctx.globalAlpha = 0.08 + 0.5 * (0.5 + 0.5 * Math.cos(r * Math.log(y))) * Math.min(1, Math.sqrt(y));
      ctx.fillRect(0, py, w, 2);
    }
    ctx.globalAlpha = 1;
    axis(ctx, w, h, col);
    label(ctx, 'Re yˢ（r = ' + r.toFixed(2) + '）', 8, 18, col);
  }
})();
