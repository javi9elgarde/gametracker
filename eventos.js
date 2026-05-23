/* ============================================================
   EVENTOS — Bingo Interactivo de Conferencias Gaming
   Version: 20260522m
   ============================================================ */
(function () {
  'use strict';

  var db = null;
  var _cards = [];
  var _activeCardId = null;
  var _player = 'Javi';
  var _unsubCard = null;
  var _editingCardId = null;
  var _prevWinCount = 0;

  /* Todas las líneas ganadoras: 5 filas + 5 columnas + 2 diagonales */
  var LINES = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20]
  ];

  /* ── INIT ───────────────────────────────────────────────────── */
  function init() {
    waitForDb(function (firedb) {
      db = firedb;
      loadCards();
    });

    document.getElementById('btnNewBingo').addEventListener('click', openNewCardModal);
    document.getElementById('bingoModalSave').addEventListener('click', saveCardModal);
    document.getElementById('bingoModalCancel').addEventListener('click', closeCardModal);
    document.getElementById('bingoModalDelete').addEventListener('click', deleteCard);
    document.getElementById('bingoModalOverlay').addEventListener('click', function (e) {
      if (e.target === this) closeCardModal();
    });

    document.querySelectorAll('input[name="bingoPlayer"]').forEach(function (r) {
      r.addEventListener('change', function () { _player = this.value; });
    });
  }

  function waitForDb(cb) {
    if (window.GT && window.GT.db) return cb(window.GT.db);
    setTimeout(function () { waitForDb(cb); }, 60);
  }

  /* ── CARGAR TARJETAS ────────────────────────────────────────── */
  function loadCards() {
    db.collection('bingo_cards').orderBy('createdAt', 'desc')
      .onSnapshot(function (snap) {
        _cards = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        renderTabs();
        if (_cards.length > 0) {
          var hasActive = _activeCardId && _cards.some(function (c) { return c.id === _activeCardId; });
          setActiveCard(hasActive ? _activeCardId : _cards[0].id);
        } else {
          document.getElementById('bingoBoardWrap').innerHTML =
            '<div class="empty-state" style="margin-top:3rem">' +
              '<div class="empty-state__icon">🎰</div>' +
              '<div class="empty-state__title">No hay ningún bingo todavía</div>' +
              '<p>Crea el primero con el botón de arriba.</p>' +
            '</div>';
          document.getElementById('bingoStats').innerHTML = '';
          hideLoading();
        }
      });
  }

  function setActiveCard(cardId) {
    _activeCardId = cardId;
    _prevWinCount = 0;
    renderTabs();
    if (_unsubCard) _unsubCard();
    _unsubCard = db.collection('bingo_cards').doc(cardId)
      .onSnapshot(function (doc) {
        if (!doc.exists) return;
        renderBoard(Object.assign({ id: doc.id }, doc.data()));
        hideLoading();
      });
  }

  function hideLoading() {
    if (window.GT && window.GT.hideLoading) window.GT.hideLoading();
    else {
      var el = document.getElementById('gtLoading');
      if (el) { el.style.opacity = '0'; setTimeout(function () { el.style.display = 'none'; }, 400); }
    }
  }

  /* ── TABS ───────────────────────────────────────────────────── */
  function renderTabs() {
    var container = document.getElementById('bingoTabs');
    if (_cards.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = _cards.map(function (c) {
      var active = c.id === _activeCardId ? ' bingo-tab--active' : '';
      return '<button class="bingo-tab' + active + '" onclick="window.GT_Bingo.setActiveCard(\'' + escId(c.id) + '\')">' +
        escHtml(c.titulo) + '</button>';
    }).join('');
  }

  /* ── RENDER TABLERO ─────────────────────────────────────────── */
  function renderBoard(card) {
    var cells = card.cells || [];
    var winLines = getWinLines(cells);
    var winSet = new Set();
    winLines.forEach(function (line) { line.forEach(function (i) { winSet.add(i); }); });

    var letters = ['B','I','N','G','O'];
    var headerHtml = letters.map(function (l) {
      return '<div class="bingo-letter bingo-letter--' + l.toLowerCase() + '">' + l + '</div>';
    }).join('');

    var gridHtml = cells.map(function (cell, i) {
      var marked = !!cell.marcada;
      var libre  = !!cell.libre;
      var win    = winSet.has(i);
      var cls = 'bingo-cell' +
        (marked ? ' bingo-cell--marked' : '') +
        (win    ? ' bingo-cell--win'    : '') +
        (libre  ? ' bingo-cell--free'   : '');

      var who = '';
      if (marked && cell.marcadoPor && !libre) {
        who = '<div class="bingo-cell__who bingo-who--' + cell.marcadoPor.toLowerCase() + '">' +
          cell.marcadoPor.charAt(0) + '</div>';
      }

      var inner = libre
        ? '<div class="bingo-cell__free-icon">★</div><div class="bingo-cell__text">LIBRE</div>'
        : '<div class="bingo-cell__text">' + escHtml(cell.texto || '') + '</div>' +
          (marked
            ? '<div class="bingo-cell__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" width="28" height="28"><polyline points="20 6 9 17 4 12"/></svg></div>'
            : '') +
          who;

      var click = libre ? '' : ' onclick="window.GT_Bingo.toggleCell(\'' + escId(card.id) + '\',' + i + ')"';
      return '<div class="' + cls + '"' + click + '>' + inner + '</div>';
    }).join('');

    var marked = cells.filter(function (c) { return c.marcada && !c.libre; }).length;
    var total  = cells.filter(function (c) { return !c.libre; }).length;
    var prevWins = _prevWinCount;
    _prevWinCount = winLines.length;

    document.getElementById('bingoBoardWrap').innerHTML =
      '<div class="bingo-evento-title">' +
        escHtml(card.titulo) +
        '<button class="btn btn-ghost btn-sm bingo-edit-btn" ' +
          'onclick="window.GT_Bingo.openEditCard(\'' + escId(card.id) + '\')">✏️ Editar</button>' +
      '</div>' +
      '<div class="bingo-board">' +
        '<div class="bingo-header-row">' + headerHtml + '</div>' +
        '<div class="bingo-grid">' + gridHtml + '</div>' +
      '</div>';

    renderStats(winLines, marked, total);

    if (winLines.length > prevWins && winLines.length > 0) {
      showBingoCelebration(winLines.length);
    }
  }

  function getWinLines(cells) {
    return LINES.filter(function (line) {
      return line.every(function (i) { return cells[i] && cells[i].marcada; });
    });
  }

  /* ── MARCAR/DESMARCAR CELDA ─────────────────────────────────── */
  function toggleCell(cardId, cellIndex) {
    db.collection('bingo_cards').doc(cardId).get().then(function (doc) {
      if (!doc.exists) return;
      var cells = (doc.data().cells || []).map(function (c) { return Object.assign({}, c); });
      var cell = cells[cellIndex];
      if (!cell || cell.libre) return;
      if (cell.marcada) {
        cells[cellIndex] = Object.assign(cell, { marcada: false, marcadoPor: null, marcadaAt: null });
      } else {
        cells[cellIndex] = Object.assign(cell, {
          marcada: true, marcadoPor: _player, marcadaAt: new Date().toISOString()
        });
      }
      db.collection('bingo_cards').doc(cardId).update({ cells: cells });
    });
  }

  /* ── STATS ──────────────────────────────────────────────────── */
  function renderStats(winLines, marked, total) {
    var pct = total > 0 ? Math.round(marked / total * 100) : 0;
    var n   = winLines.length;
    document.getElementById('bingoStats').innerHTML =
      '<div class="bingo-stats">' +
        '<div class="bingo-stat">' +
          '<span class="bingo-stat__val">' + marked + '<span style="font-size:0.9rem;opacity:.55">/' + total + '</span></span>' +
          '<span class="bingo-stat__lbl">Marcadas</span>' +
        '</div>' +
        '<div class="bingo-stat">' +
          '<span class="bingo-stat__val">' + pct + '<span style="font-size:0.9rem;opacity:.55">%</span></span>' +
          '<span class="bingo-stat__lbl">Completado</span>' +
        '</div>' +
        '<div class="bingo-stat">' +
          '<span class="bingo-stat__val' + (n > 0 ? ' bingo-stat__val--win' : '') + '">' + n + '</span>' +
          '<span class="bingo-stat__lbl">BINGO' + (n !== 1 ? 's' : '') + '</span>' +
        '</div>' +
      '</div>';
  }

  /* ── CELEBRACIÓN ────────────────────────────────────────────── */
  function showBingoCelebration(count) {
    var letters = '¡BINGO!'.split('');
    var wordHtml = letters.map(function (l, i) {
      return '<span style="--bi:' + i + '">' + l + '</span>';
    }).join('');

    var overlay = document.createElement('div');
    overlay.id  = 'bingoCelebOverlay';
    overlay.innerHTML =
      '<canvas id="bingoCelebCanvas" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"></canvas>' +
      '<div class="bingo-win-banner">' +
        '<div class="bingo-win__word">' + wordHtml + '</div>' +
        '<div class="bingo-win__sub">' +
          (count > 1 ? count + ' líneas completadas 🔥' : '¡Línea completada! 🎉') +
        '</div>' +
        '<div class="bingo-win__hint">Toca para cerrar</div>' +
      '</div>';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:8000;display:flex;align-items:center;justify-content:center;background:rgba(7,7,15,0.65);backdrop-filter:blur(3px);cursor:pointer;opacity:0;transition:opacity .4s';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.style.opacity = '1'; });

    var canvas = document.getElementById('bingoCelebCanvas');
    var stopFW = launchFireworks(canvas);

    function closeIt() {
      overlay.style.opacity = '0';
      if (stopFW) stopFW();
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 450);
    }
    overlay.addEventListener('click', closeIt);
    setTimeout(closeIt, 5000);

    playBingoSound();
  }

  function launchFireworks(canvas) {
    var W = canvas.width  = window.innerWidth;
    var H = canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    var parts = []; var rafId = null; var stopped = false;
    var COLORS = ['#4facfe','#43e97b','#f5c842','#f472b6','#a855f7','#00f2fe','#fbbf24','#fb923c'];

    function burst(x, y) {
      var color = COLORS[Math.floor(Math.random() * COLORS.length)];
      var count = 65 + Math.floor(Math.random() * 35);
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
        var speed = 2.5 + Math.random() * 5.5;
        parts.push({ x: x, y: y,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.2,
          life: 1, decay: 0.011 + Math.random() * 0.013,
          size: 2.5 + Math.random() * 2.5, color: color });
      }
    }

    var burstCount = 0; var maxBursts = 16;
    function scheduleBurst() {
      if (stopped || burstCount >= maxBursts) return;
      burstCount++;
      burst(W * 0.1 + Math.random() * W * 0.8, H * 0.05 + Math.random() * H * 0.5);
      if (burstCount < maxBursts) setTimeout(scheduleBurst, 220 + Math.random() * 320);
    }
    scheduleBurst(); setTimeout(scheduleBurst, 80); setTimeout(scheduleBurst, 200);

    function tick() {
      ctx.fillStyle = 'rgba(7,7,15,0.15)'; ctx.fillRect(0, 0, W, H);
      parts = parts.filter(function (p) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.vx *= 0.985; p.life -= p.decay;
        if (p.life <= 0) return false;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
        ctx.restore(); return true;
      });
      if (!stopped && (parts.length > 0 || burstCount < maxBursts)) rafId = requestAnimationFrame(tick);
    }
    tick();
    return function stop() { stopped = true; if (rafId) cancelAnimationFrame(rafId); };
  }

  function playBingoSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var melody = [
        {f:523,t:0,d:0.18},{f:659,t:0.15,d:0.18},{f:784,t:0.3,d:0.18},
        {f:1047,t:0.45,d:0.35},{f:784,t:0.65,d:0.15},{f:1047,t:0.75,d:0.5}
      ];
      melody.forEach(function (n) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = n.f;
        gain.gain.setValueAtTime(0, ctx.currentTime + n.t);
        gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + n.t + 0.02);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + n.t + n.d);
        osc.start(ctx.currentTime + n.t);
        osc.stop(ctx.currentTime + n.t + n.d + 0.05);
      });
    } catch (e) {}
  }

  /* ── MODAL CREAR / EDITAR ───────────────────────────────────── */
  function openNewCardModal() {
    _editingCardId = null;
    document.getElementById('bingoModalHeading').textContent = 'Nuevo Bingo';
    document.getElementById('bingoModalName').value = '';
    document.getElementById('bingoModalDelete').style.display = 'none';
    buildModalGrid(null);
    document.getElementById('bingoModalOverlay').classList.add('open');
    document.getElementById('bingoModalName').focus();
  }

  function openEditCard(cardId) {
    db.collection('bingo_cards').doc(cardId).get().then(function (doc) {
      if (!doc.exists) return;
      var data = doc.data();
      _editingCardId = cardId;
      document.getElementById('bingoModalHeading').textContent = 'Editar Bingo';
      document.getElementById('bingoModalName').value = data.titulo || '';
      document.getElementById('bingoModalDelete').style.display = 'inline-flex';
      buildModalGrid(data.cells || null);
      document.getElementById('bingoModalOverlay').classList.add('open');
    });
  }

  function buildModalGrid(existingCells) {
    var container = document.getElementById('bingoModalGrid');
    container.innerHTML = '';
    for (var i = 0; i < 25; i++) {
      var cell   = existingCells ? existingCells[i] : null;
      var isLibre = cell ? !!cell.libre : (i === 12);
      var text   = cell ? (isLibre ? '' : (cell.texto || '')) : '';

      var inp = document.createElement('input');
      inp.type = 'text';
      inp.maxLength = 60;
      inp.className = 'bingo-modal-input' + (isLibre ? ' bingo-modal-input--free' : '');
      inp.dataset.idx = i;
      inp.value    = isLibre ? '' : text;
      inp.disabled = isLibre;
      inp.placeholder = isLibre ? '★ LIBRE' : 'Casilla ' + (i + 1);
      container.appendChild(inp);
    }
  }

  function saveCardModal() {
    var nombre = document.getElementById('bingoModalName').value.trim();
    if (!nombre) { document.getElementById('bingoModalName').focus(); return; }

    var inputs = document.querySelectorAll('#bingoModalGrid .bingo-modal-input');
    var cells  = Array.from(inputs).map(function (inp, i) {
      var libre = inp.classList.contains('bingo-modal-input--free');
      return {
        texto    : libre ? 'LIBRE' : inp.value.trim(),
        marcada  : libre,
        libre    : libre,
        marcadoPor: null,
        marcadaAt : null
      };
    });

    if (_editingCardId) {
      db.collection('bingo_cards').doc(_editingCardId)
        .update({ titulo: nombre, cells: cells })
        .then(closeCardModal);
    } else {
      db.collection('bingo_cards').add({
        titulo    : nombre,
        cells     : cells,
        createdAt : window.firebase.firestore.FieldValue.serverTimestamp()
      }).then(function (ref) {
        _activeCardId = ref.id;
        closeCardModal();
      });
    }
  }

  function closeCardModal() {
    document.getElementById('bingoModalOverlay').classList.remove('open');
    _editingCardId = null;
  }

  function deleteCard() {
    if (!_editingCardId) return;
    if (!confirm('¿Eliminar este bingo? Se perderán todas las marcas.')) return;
    db.collection('bingo_cards').doc(_editingCardId).delete().then(function () {
      _activeCardId  = null;
      _prevWinCount  = 0;
      closeCardModal();
    });
  }

  /* ── RESET MARCAS ───────────────────────────────────────────── */
  function resetMarks(cardId) {
    if (!confirm('¿Resetear todas las marcas? Las casillas quedarán vacías (el texto se mantiene).')) return;
    db.collection('bingo_cards').doc(cardId).get().then(function (doc) {
      if (!doc.exists) return;
      var cells = (doc.data().cells || []).map(function (c) {
        return Object.assign({}, c, c.libre
          ? {}
          : { marcada: false, marcadoPor: null, marcadaAt: null });
      });
      db.collection('bingo_cards').doc(cardId).update({ cells: cells });
    });
  }

  /* ── HELPERS ────────────────────────────────────────────────── */
  function escHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escId(s) { return String(s).replace(/'/g, "\\'"); }

  /* ── EXPOSE ─────────────────────────────────────────────────── */
  window.GT_Bingo = {
    setActiveCard  : setActiveCard,
    toggleCell     : toggleCell,
    openEditCard   : openEditCard,
    openNewCardModal: openNewCardModal,
    saveCardModal  : saveCardModal,
    closeCardModal : closeCardModal,
    deleteCard     : deleteCard,
    resetMarks     : resetMarks
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
