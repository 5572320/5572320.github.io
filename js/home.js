// ホームの小ネタ：2 倍速の時計／見られた回数／操作性の悪い背景スライダー／永遠に同じ写真のスライド
(function () {
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // ---------------------------------------------------------- 2 倍速の時計
  // 日付は本物，時刻は「今日の 0 時からの経過時間 × 2」。だから 1 日に同じ日付が 2 回来る。
  var clock = document.getElementById('clock');
  var WEEK = ['日', '月', '火', '水', '木', '金', '土'];
  function tick() {
    var now = new Date();
    var mid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var e = ((now.getTime() - mid) * 2) % 86400000;
    var h = Math.floor(e / 3600000), m = Math.floor(e % 3600000 / 60000), s = Math.floor(e % 60000 / 1000);
    clock.textContent = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日（' +
      WEEK[now.getDay()] + '）' + pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  if (clock) { tick(); setInterval(tick, 100); }

  // ---------------------------------------------------------- 見られた回数
  // Vercel の /api/views（Upstash Redis）で数える。使えないときは「？？？」。
  var views = document.getElementById('views');
  if (views) {
    fetch('/api/views', { method: 'POST', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (j) {
        if (typeof j.count !== 'number') throw new Error('bad');
        views.textContent = j.count.toLocaleString('ja-JP');
      })
      .catch(function () { views.textContent = '？？？'; });
  }

  // ---------------------------------------------------------- 背景スライダー（罠）
  // 見た目は 9 段階，実際は 3 段階。つまみはのろく，ふらつき，離すと少し滑る。
  // 一度さわると文字色は暗い色に固定され，黒にすると読みにくくなる。
  var sl = document.getElementById('bslider');
  if (sl) {
    var thumb = sl.querySelector('.thumb');
    var label = document.getElementById('bslider-label');
    var sw = sl.querySelector('.sw');
    for (var i = 0; i < 9; i++) {
      var c = Math.round(255 * (1 - i / 8));
      var span = document.createElement('span');
      span.style.background = 'rgb(' + c + ',' + c + ',' + c + ')';
      sw.appendChild(span);
    }
    var REAL = ['#ffffff', '#808080', '#000000'];
    var x = 0, target = 0, dragging = false, lastX = 0, touched = false, level = -1;

    function clamp(v) { return Math.max(0, Math.min(1, v)); }
    function touch() {
      if (touched) return;
      touched = true;
      document.documentElement.classList.add('bg-touched');
    }
    sl.addEventListener('pointerdown', function (e) {
      touch();
      dragging = true;
      lastX = e.clientX;
      sl.setPointerCapture(e.pointerId);
      sl.classList.add('dragging');
    });
    sl.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      target = clamp(target + dx / sl.clientWidth * 0.35 + (Math.random() - 0.5) * 0.012);
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      sl.classList.remove('dragging');
      target = clamp(target + (Math.random() < 0.5 ? -1 : 1) * 0.06);
    }
    sl.addEventListener('pointerup', release);
    sl.addEventListener('pointercancel', release);
    sl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { touch(); target = clamp(target + 0.02); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { touch(); target = clamp(target - 0.02); e.preventDefault(); }
    });

    (function loop(t) {
      x += (target - x) * 0.05;
      if (dragging) x += Math.sin(t / 90) * 0.003;
      x = clamp(x);
      thumb.style.left = (x * 100) + '%';
      var idx = Math.round(x * 8);
      sl.setAttribute('aria-valuenow', idx + 1);
      label.textContent = '背景の明るさ：' + (idx + 1) + ' / 9';
      var lv = idx <= 2 ? 0 : (idx <= 5 ? 1 : 2);
      if (touched && lv !== level) {
        level = lv;
        document.body.style.backgroundColor = REAL[lv];
      }
      requestAnimationFrame(loop);
    })(0);
  }

  // ---------------------------------------------------------- 写真のスライド
  // next を押すとスッと切り替わる演出は出るが，永遠に同じ画像。番号だけ進む。
  var frame = document.getElementById('slide-frame');
  if (frame) {
    var counter = document.getElementById('slide-count');
    var n = 1, TOTAL = 12, busy = false;
    function go(dir) {
      if (busy) return;
      busy = true;
      var cur = frame.querySelector('img');
      var nxt = cur.cloneNode(true);
      nxt.style.transition = 'none';
      nxt.style.transform = 'translateX(' + (dir * 100) + '%)';
      frame.appendChild(nxt);
      nxt.getBoundingClientRect();
      nxt.style.transition = '';
      cur.style.transform = 'translateX(' + (-dir * 100) + '%)';
      nxt.style.transform = 'translateX(0)';
      setTimeout(function () { cur.remove(); busy = false; }, 520);
      n = ((n - 1 + dir + TOTAL) % TOTAL) + 1;
      counter.textContent = n + ' / ' + TOTAL;
    }
    document.getElementById('slide-prev').addEventListener('click', function () { go(-1); });
    document.getElementById('slide-next').addEventListener('click', function () { go(1); });
  }
})();
