/* ============================================================
   REFUGIO 111 — Backlog / Juegos Pendientes
   Selector de jugador · portadas 16:9 · check → celebración
   ============================================================ */
(function () {
  'use strict';

  var Utils      = window.GT.Utils;
  var Biblioteca = window.GT.Biblioteca;
  var Toast      = window.GT.Toast;

  var PLAYERS = [
    { key: 'David', name: 'David Garde',   initial: 'D', color: 'var(--player-david)', hex: '#3b82f6' },
    { key: 'Javi',  name: 'Javier Garde',  initial: 'J', color: 'var(--player-javi)',  hex: '#9b1742' },
    { key: 'Mery',  name: 'Mariam Moreno', initial: 'M', color: 'var(--player-mery)',  hex: '#9b59ff' }
  ];

  var SORT_STATES = [
    { key: 'alpha',    label: '⏱ A–Z',         title: 'Ordenar: A–Z' },
    { key: 'dur-asc',  label: '⏱ ↑ Duración',  title: 'Ordenar: menor duración primero' },
    { key: 'dur-desc', label: '⏱ ↓ Duración',  title: 'Ordenar: mayor duración primero' }
  ];

  var state = { player: 'David', sort: 'alpha' };
  var _doneModal = { gameId: null, playerKey: null };

  function safe(fn, name) {
    try { fn(); } catch(e) { console.warn('backlog.js ' + name + ':', e); }
  }

  /* ── DONE MODAL ─────────────────────────────────────────────── */
  function injectDoneModal() {
    if (document.getElementById('pendDoneOverlay')) return;
    var el = document.createElement('div');
    el.id = 'pendDoneOverlay';
    el.innerHTML =
      '<div class="pend-done-box" id="pendDoneBox">' +
        '<div class="pend-done-icon">🎮</div>' +
        '<div class="pend-done-game-title" id="pendDoneGameTitle">—</div>' +
        '<p class="pend-done-question">¿Qué quieres hacer con este juego?</p>' +
        '<button class="pend-done-finish" id="pendDoneFinish">' +
          '<span class="pend-done-finish__icon">🏆</span>' +
          '<span>¡¡JUEGO FINALIZADO!!</span>' +
        '</button>' +
        '<button class="pend-done-discard" id="pendDoneDiscard">🗑 Descartar pendiente</button>' +
        '<button class="pend-done-cancel" id="pendDoneCancel">✕ Cancelar</button>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function(e) { if (e.target === el) closeDoneModal(); });
    document.getElementById('pendDoneCancel').addEventListener('click', closeDoneModal);
    document.getElementById('pendDoneFinish').addEventListener('click', function() {
      var gId = _doneModal.gameId; var pk = _doneModal.playerKey;
      closeDoneModal(); markFinished(gId, pk);
    });
    document.getElementById('pendDoneDiscard').addEventListener('click', function() {
      var gId = _doneModal.gameId; var pk = _doneModal.playerKey;
      closeDoneModal(); markDiscarded(gId, pk);
    });
  }

  function openDoneModal(gameId, playerKey) {
    var game = Biblioteca.getById(gameId);
    if (!game) return;
    _doneModal.gameId    = gameId;
    _doneModal.playerKey = playerKey;
    document.getElementById('pendDoneGameTitle').textContent = game.titulo;
    document.getElementById('pendDoneOverlay').classList.add('open');
  }

  function closeDoneModal() {
    var overlay = document.getElementById('pendDoneOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  /* ── ACTIONS ─────────────────────────────────────────────────── */
  function markDiscarded(gameId, playerKey) {
    var game = Biblioteca.getById(gameId);
    if (!game) return;
    var por = (game.pendientePor || []).filter(function(p) { return p !== playerKey; });
    Biblioteca.update(gameId, { pendientePor: por, pendiente: por.length > 0 });
    Toast.show('"' + game.titulo + '" eliminado de pendientes');
    render();
  }

  function markFinished(gameId, playerKey) {
    var game = Biblioteca.getById(gameId);
    if (!game) return;
    var por = (game.pendientePor || []).filter(function(p) { return p !== playerKey; });
    Biblioteca.update(gameId, { pendientePor: por, pendiente: por.length > 0 });
    showCelebration(game.titulo, playerKey);
    render();
  }

  /* ── RENDER ──────────────────────────────────────────────────── */
  function render() {
    var playerData = PLAYERS.find(function(p) { return p.key === state.player; });
    if (!playerData) return;

    var key   = playerData.key;
    var color = playerData.color;
    var hex   = playerData.hex;

    var pendingGames = Biblioteca.getAll().filter(function(g) {
      return (g.pendientePor || []).indexOf(key) !== -1;
    }).sort(function(a, b) {
      if (state.sort === 'dur-asc') {
        var da = (a.duracion === 999 ? Infinity : (parseFloat(a.duracion) || 0));
        var db = (b.duracion === 999 ? Infinity : (parseFloat(b.duracion) || 0));
        return da !== db ? da - db : a.titulo.localeCompare(b.titulo, 'es');
      }
      if (state.sort === 'dur-desc') {
        var da2 = (a.duracion === 999 ? Infinity : (parseFloat(a.duracion) || 0));
        var db2 = (b.duracion === 999 ? Infinity : (parseFloat(b.duracion) || 0));
        return da2 !== db2 ? db2 - da2 : a.titulo.localeCompare(b.titulo, 'es');
      }
      return a.titulo.localeCompare(b.titulo, 'es');
    });

    /* ── Player bar ── */
    var bar = document.getElementById('blgPlayerBar');
    if (bar) {
      bar.style.display = 'flex';
      bar.style.setProperty('--pc', color);
      bar.innerHTML =
        '<div class="blg-player-bar__av" style="background:' + hex + ';box-shadow:0 2px 20px -4px ' + hex + '">' +
          playerData.initial +
        '</div>' +
        '<div>' +
          '<div class="blg-player-bar__name">' + Utils.escapeHtml(playerData.name) + '</div>' +
          '<div class="blg-player-bar__count">' +
            pendingGames.length + ' juego' + (pendingGames.length !== 1 ? 's' : '') +
            ' pendiente' + (pendingGames.length !== 1 ? 's' : '') +
          '</div>' +
        '</div>';
    }

    /* ── Game grid ── */
    var grid = document.getElementById('backlogGrid');
    if (!grid) return;

    if (!pendingGames.length) {
      grid.innerHTML =
        '<div class="blg-empty">' +
          '<div class="blg-empty__icon">✅</div>' +
          '<div class="blg-empty__title">¡Sin pendientes!</div>' +
          '<a href="biblioteca.html" class="blg-empty__link" style="color:' + hex + '">Añadir juegos en Biblioteca →</a>' +
        '</div>';
      return;
    }

    grid.innerHTML = pendingGames.map(function(game) {
      var safeId  = game.id.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      var safeKey = key.replace(/'/g, "\\'");
      var dur     = game.duracion && game.duracion !== 999
        ? '⏱ ~' + game.duracion + 'h'
        : (game.duracion === 999 ? '⏱ ∞' : '');

      var imgHtml = game.portadaUrl
        ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" ' +
            'class="blg-game-card__img" ' +
            'style="object-position:' + Utils.escapeHtml(game.portadaPos || 'center center') + '" ' +
            'loading="lazy" onerror="this.style.display=\'none\'">'
        : '<div class="blg-game-card__ph">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</div>';

      return '<div class="blg-game-card" style="--pc:' + color + ';cursor:pointer" ' +
          'onclick="window.GT.GameDetailModal.open(\'' + safeId + '\')">' +
        '<div class="blg-game-card__img-wrap">' +
          imgHtml +
          '<div class="blg-game-card__overlay">' +
            '<div class="blg-game-card__title">' + Utils.escapeHtml(game.titulo) + '</div>' +
            (dur ? '<div class="blg-game-card__meta">' + dur + '</div>' : '') +
          '</div>' +
          '<button class="blg-game-card__check-btn" title="Marcar como jugado" ' +
            'onclick="event.stopPropagation();window.GT_Backlog.openDoneModal(\'' + safeId + '\',\'' + safeKey + '\')">' +
            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">' +
              '<polyline points="4,10 8,14 16,6"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ── SORT BUTTON ─────────────────────────────────────────────── */
  function updateSortBtn() {
    var btn = document.getElementById('blgSortBtn');
    if (!btn) return;
    var cur = SORT_STATES.find(function(s) { return s.key === state.sort; }) || SORT_STATES[0];
    btn.textContent = cur.label;
    btn.title       = cur.title;
    btn.classList.toggle('btn-primary',   state.sort !== 'alpha');
    btn.classList.toggle('btn-secondary', state.sort === 'alpha');
  }

  function initSortBtn() {
    var btn = document.getElementById('blgSortBtn');
    if (!btn) return;
    updateSortBtn();
    btn.addEventListener('click', function() {
      var idx = SORT_STATES.findIndex(function(s) { return s.key === state.sort; });
      state.sort = SORT_STATES[(idx + 1) % SORT_STATES.length].key;
      updateSortBtn();
      render();
    });
  }

  /* ── PLAYER TABS ─────────────────────────────────────────────── */
  function initPlayerTabs() {
    var cards = document.getElementById('blgPlayerCards');
    if (!cards) return;
    cards.querySelectorAll('input[type="radio"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        if (this.checked) { state.player = this.value; render(); }
      });
    });
  }

  /* ── CELEBRATION ─────────────────────────────────────────────── */
  function showCelebration(gameTitle, playerKey) {
    safe(playVictorySound, 'sound');
    var playerColor = playerKey === 'David' ? '#3b82f6' :
                      playerKey === 'Javi'  ? '#9b1742' : '#9b59ff';

    var overlay = document.createElement('div');
    overlay.id = 'celebrationOverlay';
    overlay.innerHTML =
      '<canvas id="celebFireworks"></canvas>' +
      '<div class="celeb-text">' +
        '<div class="celeb-trophy">🏆</div>' +
        '<div class="celeb-badge">¡¡JUEGO FINALIZADO!!</div>' +
        '<div class="celeb-game">' + Utils.escapeHtml(gameTitle) + '</div>' +
        '<div class="celeb-player" style="color:' + playerColor + '">— ' + Utils.escapeHtml(playerKey) + ' —</div>' +
        '<div class="celeb-hint">Toca en cualquier lugar para cerrar</div>' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function() { overlay.classList.add('show'); });

    var stopFW = launchFireworks(document.getElementById('celebFireworks'));
    function closeIt() {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.5s';
      if (stopFW) stopFW();
      setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 520);
    }
    overlay.addEventListener('click', closeIt);
    setTimeout(closeIt, 6000);
  }

  function playVictorySound() {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    var ctx = new AudioCtx();
    var melody = [
      { freq: 523.25, t: 0,    dur: 0.18 },
      { freq: 659.25, t: 0.16, dur: 0.18 },
      { freq: 783.99, t: 0.32, dur: 0.18 },
      { freq: 1046.5, t: 0.50, dur: 0.55 }
    ];
    function playNote(freq, startT, dur) {
      var osc = ctx.createOscillator(); var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0, startT);
      gain.gain.linearRampToValueAtTime(0.35, startT + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);
      osc.start(startT); osc.stop(startT + dur + 0.05);
    }
    var now = ctx.currentTime;
    melody.forEach(function(n) { playNote(n.freq, now + n.t, n.dur); });
  }

  function launchFireworks(canvas) {
    var W = canvas.width = window.innerWidth;
    var H = canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    var parts = []; var rafId = null; var stopped = false;
    var COLORS = ['#ff6b6b','#ffd700','#4facfe','#00f2fe','#f093fb','#43e97b','#fa709a','#fff4b2','#a8edea'];

    function burst(x, y) {
      var color = COLORS[Math.floor(Math.random() * COLORS.length)];
      var count = 70 + Math.floor(Math.random() * 40);
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.3;
        var speed = 2.5 + Math.random() * 5.5;
        parts.push({ x: x, y: y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - 1,
          life: 1, decay: 0.012 + Math.random()*0.012, size: 2.5 + Math.random()*2.5, color: color });
      }
    }
    var burstCount = 0; var maxBursts = 14;
    function scheduleBurst() {
      if (stopped || burstCount >= maxBursts) return;
      burstCount++;
      burst(W*0.15 + Math.random()*W*0.7, H*0.08 + Math.random()*H*0.55);
      if (burstCount < maxBursts) setTimeout(scheduleBurst, 250 + Math.random()*350);
    }
    scheduleBurst(); setTimeout(scheduleBurst, 100); setTimeout(scheduleBurst, 220);

    function tick() {
      ctx.fillStyle = 'rgba(7,7,15,0.18)'; ctx.fillRect(0, 0, W, H);
      parts = parts.filter(function(p) {
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

  /* ── INIT ────────────────────────────────────────────────────── */
  function init() {
    var _ny = document.getElementById('navYear'); if (_ny) _ny.textContent = new Date().getFullYear();
    var _fy = document.getElementById('footerYear'); if (_fy) _fy.textContent = new Date().getFullYear();

    /* Pre-select active player */
    var ap = window.GT && window.GT.getActivePlayer ? window.GT.getActivePlayer() : null;
    if (ap && ap !== 'All') { state.player = ap; }

    var radio = document.querySelector('#blgPlayerCards input[value="' + state.player + '"]');
    if (radio) radio.checked = true;

    injectDoneModal();
    initPlayerTabs();
    initSortBtn();
    render();
  }

  window.GT_Backlog = { openDoneModal: openDoneModal };

  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      safe(init, 'init');
      window.GT.onDataChange(function () { safe(render, 'render'); });
    });
  });
})();
