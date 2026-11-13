// オープニング：サイコロがコロコロ揃って「5572320」がバンと完成する
// 7 は 5 と 2 のサイコロをつないで表す。0 は特製の 0 の目。
(function () {
  var intro = document.getElementById('intro');
  if (!intro) return;
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SPEC = [5, 5, [5, 2], 2, 3, 2, 0];
  var LABEL = ['5', '5', '7', '2', '3', '2', '0'];
  var row = intro.querySelector('.dice-row');
  var num = intro.querySelector('.num');
  var groups = [];

  SPEC.forEach(function (s, i) {
    var g = document.createElement('div');
    g.className = 'dgroup';
    var holder = g;
    var dice = [];
    if (Array.isArray(s)) {
      holder = document.createElement('div');
      holder.className = 'pair';
      g.appendChild(holder);
      var a = Dice.make(Dice.random()), link = document.createElement('span'), b = Dice.make(Dice.random());
      link.className = 'link';
      holder.appendChild(a); holder.appendChild(link); holder.appendChild(b);
      dice = [[a, s[0]], [b, s[1]]];
    } else {
      var d = Dice.make(Dice.random());
      holder.appendChild(d);
      dice = [[d, s]];
    }
    var lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = LABEL[i];
    g.appendChild(lbl);
    row.appendChild(g);
    groups.push({ el: g, pair: Array.isArray(s) ? holder : null, dice: dice });
  });

  var rolling = [];
  groups.forEach(function (g) { g.dice.forEach(function (d) { d[0].classList.add('rolling'); rolling.push(d[0]); }); });
  var spin = setInterval(function () {
    rolling.forEach(function (el) { if (el.classList.contains('rolling')) Dice.render(el, Dice.random()); });
  }, 80);

  var finished = false;
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function settle(g) {
    g.dice.forEach(function (d) {
      d[0].classList.remove('rolling');
      Dice.render(d[0], d[1]);
      d[0].classList.add('settle');
    });
    if (g.pair) g.pair.classList.add('linked');
    g.el.classList.add('done');
  }

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    clearInterval(spin);
    intro.classList.add('fade');
    root.classList.remove('intro-lock');
    setTimeout(function () { intro.remove(); }, 650);
  }

  var T0 = reduce ? 100 : 700, GAP = reduce ? 40 : 260;
  groups.forEach(function (g, i) { later(function () { settle(g); }, T0 + i * GAP); });
  var tEnd = T0 + (groups.length - 1) * GAP + 300;
  later(function () {
    num.classList.add('bang');
    if (!reduce) intro.classList.add('shake');
  }, tEnd);
  later(finish, tEnd + (reduce ? 600 : 1300));

  intro.addEventListener('click', finish);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter') finish(); });
})();
