// サイコロの目を描く（オープニングとヨットゲームで共用）
// 目の位置は 3×3 のマス（0〜8）で指定する。0 の目は特製（赤い輪っか）。
(function () {
  var FACES = {
    0: [4],
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  function render(el, face) {
    el.textContent = '';
    el.dataset.face = face;
    el.setAttribute('aria-label', face + ' の目');
    for (var i = 0; i < 9; i++) {
      var c = document.createElement('i');
      if (FACES[face].indexOf(i) >= 0) {
        c.className = face === 0 ? 'z' : (face === 1 ? 'p one' : 'p');
      }
      el.appendChild(c);
    }
  }

  function make(face) {
    var el = document.createElement('div');
    el.className = 'die';
    el.setAttribute('role', 'img');
    render(el, face);
    return el;
  }

  function random() { return 1 + Math.floor(Math.random() * 6); }

  window.Dice = { render: render, make: make, random: random };
})();
