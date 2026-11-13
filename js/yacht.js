// ヨットゲーム（世界のアソビ大全51 のルール）
// 12 ターン。1 ターンに 3 回まで振れる。サイコロを押すとキープ。
// ヨットが出ると異変が起きる（selberg.js）。
(function () {
  var box = document.getElementById('yacht-game');
  if (!box) return;

  function count(d, v) { return d.filter(function (x) { return x === v; }).length; }
  function sum(d) { return d.reduce(function (a, b) { return a + b; }, 0); }
  function counts(d) { var c = []; for (var v = 1; v <= 6; v++) { var k = count(d, v); if (k) c.push(k); } return c.sort(); }
  function has(d, seq) { return seq.every(function (v) { return d.indexOf(v) >= 0; }); }

  var CATS = [
    { k: 'ace', name: 'エース', upper: true, f: function (d) { return count(d, 1) * 1; } },
    { k: 'deuce', name: 'デュース', upper: true, f: function (d) { return count(d, 2) * 2; } },
    { k: 'tray', name: 'トレイ', upper: true, f: function (d) { return count(d, 3) * 3; } },
    { k: 'four', name: 'フォー', upper: true, f: function (d) { return count(d, 4) * 4; } },
    { k: 'five', name: 'ファイブ', upper: true, f: function (d) { return count(d, 5) * 5; } },
    { k: 'six', name: 'シックス', upper: true, f: function (d) { return count(d, 6) * 6; } },
    { k: 'choice', name: 'チョイス', f: sum },
    { k: 'fourdice', name: 'フォーダイス', f: function (d) { return Math.max.apply(null, counts(d)) >= 4 ? sum(d) : 0; } },
    { k: 'full', name: 'フルハウス', f: function (d) { var c = counts(d); return c.length === 2 && c[0] === 2 && c[1] === 3 ? sum(d) : 0; } },
    { k: 'ss', name: 'S.ストレート', f: function (d) { return [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]].some(function (s) { return has(d, s); }) ? 15 : 0; } },
    { k: 'bs', name: 'B.ストレート', f: function (d) { return [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]].some(function (s) { return has(d, s); }) ? 30 : 0; } },
    { k: 'yacht', name: 'ヨット', f: function (d) { return counts(d).length === 1 ? 50 : 0; } }
  ];

  var diceBox = box.querySelector('.dice');
  var rollBtn = box.querySelector('.roll');
  var status = box.querySelector('.status');
  var tbody = box.querySelector('tbody');

  var dice, held, rollsLeft, rolled, scores, turn, animating, yachtMsg = false;
  var els = [];
  for (var i = 0; i < 5; i++) {
    (function (i) {
      var el = Dice.make(1);
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      el.addEventListener('click', function () { toggle(i); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } });
      diceBox.appendChild(el);
      els.push(el);
    })(i);
  }

  function reset() {
    dice = [1, 1, 1, 1, 1]; held = [false, false, false, false, false];
    rollsLeft = 3; rolled = false; scores = {}; turn = 1; animating = false; yachtMsg = false;
    render();
  }

  function toggle(i) {
    if (!rolled || rollsLeft === 0 || animating || turn > 12) return;
    held[i] = !held[i];
    render();
  }

  function upperSum() {
    return CATS.filter(function (c) { return c.upper; }).reduce(function (a, c) { return a + (scores[c.k] || 0); }, 0);
  }
  function total() {
    var lower = CATS.filter(function (c) { return !c.upper; }).reduce(function (a, c) { return a + (scores[c.k] || 0); }, 0);
    var u = upperSum();
    return u + (u >= 63 ? 35 : 0) + lower;
  }

  function roll() {
    if (rollsLeft === 0 || animating || turn > 12) return;
    if (held.every(Boolean)) { status.textContent = '全部キープしてたら振れないよ'; return; }
    animating = true;
    rollsLeft--;
    var idx = [];
    for (var i = 0; i < 5; i++) if (!held[i]) { idx.push(i); els[i].classList.add('rolling'); }
    var spin = setInterval(function () { idx.forEach(function (i) { Dice.render(els[i], Dice.random()); }); }, 70);
    setTimeout(function () {
      clearInterval(spin);
      idx.forEach(function (i) { dice[i] = Dice.random(); els[i].classList.remove('rolling'); });
      rolled = true; animating = false;
      yachtMsg = CATS[11].f(dice) === 50;
      render();
      if (yachtMsg && window.Selberg) window.Selberg.trigger();
    }, 450);
    render();
  }

  function choose(k) {
    if (!rolled || animating || scores[k] !== undefined) return;
    var c = CATS.filter(function (c) { return c.k === k; })[0];
    scores[k] = c.f(dice);
    turn++;
    held = [false, false, false, false, false];
    rollsLeft = 3; rolled = false; yachtMsg = false;
    render();
  }

  function render() {
    els.forEach(function (el, i) {
      if (!el.classList.contains('rolling')) Dice.render(el, dice[i]);
      el.classList.toggle('held', held[i]);
      el.setAttribute('aria-pressed', held[i] ? 'true' : 'false');
    });
    var over = turn > 12;
    rollBtn.disabled = over || rollsLeft === 0 || animating;
    rollBtn.textContent = over ? 'おしまい' : '振る（残り ' + rollsLeft + ' 回）';
    if (yachtMsg) status.textContent = 'ヨット！！！……なにかがおかしい';
    else if (over) status.textContent = '合計 ' + total() + ' 点！';
    else if (!animating) status.textContent = turn + ' / 12 ターン目　' + (rolled ? 'サイコロを押すとキープ。役を選んで記録' : 'まずは振ろう');

    tbody.textContent = '';
    CATS.forEach(function (c, i) {
      var tr = document.createElement('tr');
      var th = document.createElement('th'); th.textContent = c.name; th.scope = 'row'; tr.appendChild(th);
      var td = document.createElement('td');
      if (scores[c.k] !== undefined) { td.textContent = scores[c.k]; td.className = 'used'; }
      else if (rolled && !animating && !over) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = c.f(dice);
        b.addEventListener('click', function () { choose(c.k); });
        td.appendChild(b);
      } else td.textContent = '—';
      tr.appendChild(td);
      tbody.appendChild(tr);
      if (i === 5) {
        var u = upperSum();
        var r1 = document.createElement('tr'); r1.className = 'sub';
        r1.innerHTML = '<th scope="row">小計</th><td>' + u + ' / 63</td>';
        var r2 = document.createElement('tr'); r2.className = 'sub';
        r2.innerHTML = '<th scope="row">ボーナス</th><td>' + (u >= 63 ? '+35' : '0') + '</td>';
        tbody.appendChild(r1); tbody.appendChild(r2);
      }
    });
    var rt = document.createElement('tr'); rt.className = 'total';
    rt.innerHTML = '<th scope="row">合計</th><td>' + total() + '</td>';
    tbody.appendChild(rt);
  }

  rollBtn.addEventListener('click', roll);
  box.querySelector('.again').addEventListener('click', reset);
  reset();
})();
