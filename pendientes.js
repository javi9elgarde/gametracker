/* ============================================================
   GAMETRACKER — Jugadores / Perfiles Page
   Version: 20260518e
   ============================================================ */
(function () {
  'use strict';

  var Utils      = window.GT.Utils;
  var Biblioteca = window.GT.Biblioteca;
  var Registro   = window.GT.Registro;
  var Toast      = window.GT.Toast;

  var PLAYERS = [
    { key: 'David', name: 'David Garde',   initial: 'D', color: 'var(--player-david)' },
    { key: 'Javi',  name: 'Javier Garde',  initial: 'J', color: 'var(--player-javi)'  },
    { key: 'Mery',  name: 'Mariam Moreno', initial: 'M', color: 'var(--player-mery)'  }
  ];

  /* ── State ─────────────────────────────────────────────────── */
  var _favs     = { David: [], Javi: [], Mery: [] };
  var _favModal = { playerKey: null, slotIdx: null };
  var _doneModal = { gameId: null, playerKey: null };

  function safe(fn, name) {
    try { fn(); } catch(e) { console.warn('pendientes.js ' + name + ':', e); }
  }

  /* ══════════════════════════════════════════════════════════════
     FAVORITES — Firebase I/O
  ══════════════════════════════════════════════════════════════ */
  function loadFavoritos(cb) {
    window.GT.db.collection('jugadores').get().then(function(snap) {
      snap.forEach(function(doc) {
        if (_favs.hasOwnProperty(doc.id)) {
          _favs[doc.id] = doc.data().favoritos || [];
        }
      });
      if (cb) cb();
    }).catch(function(e) {
      console.warn('loadFavoritos:', e);
      if (cb) cb();
    });
  }

  function saveFavoritos(playerKey) {
    // Compact nulls from ends, keep internal nulls (preserve slot positions)
    window.GT.db.collection('jugadores').doc(playerKey)
      .set({ favoritos: _favs[playerKey] }, { merge: true })
      .catch(function(e) { console.warn('saveFavoritos:', e); });
  }

  /* ── OPEN / CLOSE PICKER ────────────────────────────────────── */
  function openFavPicker(playerKey, slotIdx) {
    _favModal.playerKey = playerKey;
    _favModal.slotIdx   = slotIdx;
    var player = PLAYERS.find(function(p) { return p.key === playerKey; });
    document.getElementById('favPickerTitle').textContent =
      'Favorito #' + (slotIdx + 1) + '  ·  ' + (player ? player.name : playerKey);
    var search = document.getElementById('favPickerSearch');
    search.value = '';
    renderPickerList('');
    document.getElementById('favPickerOverlay').classList.add('open');
    search.focus();
  }

  function closeFavPicker() {
    var el = document.getElementById('favPickerOverlay');
    if (el) el.classList.remove('open');
    _favModal.playerKey = null;
    _favModal.slotIdx   = null;
  }

  function renderPickerList(query) {
    var pk      = _favModal.playerKey;
    var already = (_favs[pk] || []).filter(Boolean);
    var games   = Biblioteca.getAll()
      .filter(function(g) {
        var free  = !already.includes(g.id);
        var match = !query || g.titulo.toLowerCase().includes(query.toLowerCase());
        return free && match;
      })
      .sort(function(a, b) { return a.titulo.localeCompare(b.titulo, 'es'); });

    var listEl = document.getElementById('favPickerList');
    if (!games.length) {
      listEl.innerHTML = '<div class="fav-picker-empty">No se encontraron juegos</div>';
      return;
    }
    listEl.innerHTML = games.map(function(g) {
      var safeId = g.id.replace(/'/g, "\\'");
      return '<div class="fav-picker-item" onclick="window.GT_Pend.pickFav(\'' + safeId + '\')">' +
        '<span>' + Utils.escapeHtml(g.titulo) + '</span>' +
        (g.fechaLanzamiento ? '<span class="fav-picker-year">' + g.fechaLanzamiento.slice(0,4) + '</span>' : '') +
      '</div>';
    }).join('');
  }

  function pickFav(gameId) {
    var pk = _favModal.playerKey;
    var si = _favModal.slotIdx;
    if (pk === null || si === null) return;
    var favs = (_favs[pk] || []).slice();
    while (favs.length < 10) favs.push(null);
    favs[si] = gameId;
    _favs[pk] = favs;
    saveFavoritos(pk);
    closeFavPicker();
    render();
  }

  function removeFav(playerKey, slotIdx) {
    var favs = (_favs[playerKey] || []).slice();
    while (favs.length < 10) favs.push(null);
    favs[slotIdx] = null;
    _favs[playerKey] = favs;
    saveFavoritos(playerKey);
    render();
  }

  /* ── INJECT PICKER MODAL (once) ─────────────────────────────── */
  function injectFavPicker() {
    if (document.getElementById('favPickerOverlay')) return;
    var el = document.createElement('div');
    el.id = 'favPickerOverlay';
    el.innerHTML =
      '<div class="fav-picker-box">' +
        '<div class="fav-picker-header">' +
          '<span id="favPickerTitle" class="fav-picker-title">Elige favorito</span>' +
          '<button class="modal__close" onclick="window.GT_Pend.closeFavPicker()">✕</button>' +
        '</div>' +
        '<input type="text" id="favPickerSearch" class="form-input" placeholder="🔍 Buscar juego..." ' +
          'oninput="window.GT_Pend.renderPickerList(this.value)" ' +
          'style="margin-bottom:0.6rem;width:100%;box-sizing:border-box">' +
        '<div id="favPickerList" class="fav-picker-list"></div>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function(e) { if (e.target === el) closeFavPicker(); });
  }

  /* ══════════════════════════════════════════════════════════════
     PLATINUM TROPHY SVG
  ══════════════════════════════════════════════════════════════ */
  /* PlayStation Platinum Trophy — imagen PNG oficial */
  var PLAT_SVG = '<img src="platinum-trophy.png" alt="Trofeo Platino PlayStation" ' +
    'style="width:88px;height:auto;filter:drop-shadow(0 0 14px rgba(80,150,255,0.6));display:block">';

  /* ══════════════════════════════════════════════════════════════
     RENDER PLAYER PROFILE
  ══════════════════════════════════════════════════════════════ */
  function renderPlayer(player) {
    var key   = player.key;
    var color = player.color;

    /* --- Pending games ---------------------------------------- */
    var pendingGames = Biblioteca.getAll().filter(function(g) {
      return (g.pendientePor || []).includes(key);
    }).sort(function(a, b) { return a.titulo.localeCompare(b.titulo, 'es'); });

    /* --- Registro data ---------------------------------------- */
    var entries     = Registro.filter({ jugador: key });
    var totalJuegos = new Set(entries.map(function(r) { return r.juegoId; })).size;
    var totalHoras  = Math.round(entries.reduce(function(acc, r) { return acc + (parseFloat(r.horas) || 0); }, 0));
    var scored      = entries.filter(function(r) { return r.nota !== null && r.nota !== undefined && r.nota !== ''; });
    var avgScore    = scored.length
      ? Math.round((scored.reduce(function(a, r) { return a + parseFloat(r.nota); }, 0) / scored.length) * 100) / 100
      : null;

    /* --- Platinos --------------------------------------------- */
    var platSeen = {};
    var platCount = 0;
    entries.forEach(function(r) {
      if (r.estado === 'Platinado' && !platSeen[r.juegoId]) {
        platSeen[r.juegoId] = true;
        platCount++;
      }
    });

    /* ── HEADER ──────────────────────────────────────────────── */
    var statsStr = totalJuegos + ' jugados · ' + totalHoras + 'h' +
      (avgScore ? ' · ★ ' + avgScore.toFixed(2).replace('.', ',') : '');

    /* Player headshot icons */
    var playerIcons = { David: 'icondavidneutral.png', Javi: 'iconjavineutral.png', Mery: 'iconmeryneutral.png' };
    var iconSrc = playerIcons[key] || null;

    var headerHtml =
      '<div class="pp-header' + (iconSrc ? ' pp-header--icon' : '') + '">' +
        (iconSrc
          ? '<img src="' + iconSrc + '" class="pp-icon" alt="' + Utils.escapeHtml(player.name) + '" draggable="false">'
          : '') +
        '<div class="pp-avatar" style="background:' + color + '">' + player.initial + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="pp-name">' + Utils.escapeHtml(player.name) + '</div>' +
          '<div class="pp-stats">' + pendingGames.length + ' pendientes · ' + statsStr + '</div>' +
        '</div>' +
        '<a href="registro.html" class="btn btn-ghost btn-sm" style="font-size:0.75rem;flex-shrink:0">📋 Registro</a>' +
      '</div>';

    /* ── PENDING LIST (scrollable) ──────────────────────────── */
    var pendListHtml;
    if (pendingGames.length) {
      pendListHtml = pendingGames.map(function(game) {
        var dur    = game.duracion ? '⏱ ' + game.duracion + 'h' : '';
        var safeId = game.id.replace(/'/g, "\\'");
        var safeKey = key.replace(/'/g, "\\'");

        return '<div class="pp-pend-item">' +
          '<div class="pp-pend-cover">' +
            (game.portadaUrl
              ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="" ' +
                'style="object-position:' + Utils.escapeHtml(game.portadaPos || 'center top') + '" ' +
                'onerror="this.style.display=\'none\'">'
              : '') +
            '<span class="pp-pend-cover__ph">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</span>' +
          '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div class="pp-pend-title">' + Utils.escapeHtml(game.titulo) + '</div>' +
            (dur ? '<div class="pp-pend-dur">' + dur + '</div>' : '') +
          '</div>' +
          '<button class="pp-done-btn" title="Marcar como jugado" ' +
            'onclick="window.GT_Pend.openDoneModal(\'' + safeId + '\',\'' + safeKey + '\')">' +
            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16"><polyline points="4,10 8,14 16,6"/></svg>' +
          '</button>' +
        '</div>';
      }).join('');
    } else {
      pendListHtml = '<p style="font-size:0.8rem;color:var(--txt3);font-style:italic;padding:0.5rem 0">Sin juegos pendientes asignados.<br>' +
        '<a href="biblioteca.html" style="color:' + color + '">Márcarlos en la Biblioteca →</a></p>';
    }

    /* ── FAVORITES SECTION ──────────────────────────────────── */
    var favIds = _favs[key] || [];
    var safeKey2 = key.replace(/'/g, "\\'");
    var favsHtml = '<div class="pp-fav-list">';
    for (var i = 0; i < 10; i++) {
      var gameId = favIds[i] || null;
      if (gameId) {
        var g = Biblioteca.getById(gameId);
        favsHtml += '<div class="pp-fav-slot pp-fav-slot--filled">' +
          '<span class="pp-fav-num" style="color:' + color + '">' + (i + 1) + '</span>' +
          '<span class="pp-fav-name">' + Utils.escapeHtml(g ? g.titulo : '(juego eliminado)') + '</span>' +
          '<button class="pp-fav-remove" title="Quitar" ' +
            'onclick="window.GT_Pend.removeFav(\'' + safeKey2 + '\',' + i + ')">×</button>' +
        '</div>';
      } else {
        favsHtml += '<div class="pp-fav-slot pp-fav-slot--empty" ' +
          'onclick="window.GT_Pend.openFavPicker(\'' + safeKey2 + '\',' + i + ')">' +
          '<span class="pp-fav-num pp-fav-num--empty">' + (i + 1) + '</span>' +
          '<span class="pp-fav-add">＋ Añadir</span>' +
        '</div>';
      }
    }
    favsHtml += '</div>';

    /* ── PLATINOS SECTION ───────────────────────────────────── */
    var platHtml =
      '<div class="pp-plat-box">' +
        '<div class="pp-plat-icon">' + PLAT_SVG + '</div>' +
        '<div class="pp-plat-count" style="color:' + color + '">' + platCount + '</div>' +
        '<div class="pp-plat-label">Platino' + (platCount !== 1 ? 's' : '') + '</div>' +
      '</div>';

    /* ── COMPOSE SECTION ────────────────────────────────────── */
    return '<div class="player-profile" id="player-' + key.toLowerCase() + '" style="--pp-color:' + color + ';scroll-margin-top:5rem">' +
      headerHtml +
      '<div class="pp-body">' +
        '<div class="pp-sub">' +
          '<div class="pp-sub-title">⏳ Pendientes (' + pendingGames.length + ')</div>' +
          '<div class="pp-pend-list">' + pendListHtml + '</div>' +
        '</div>' +
        '<div class="pp-sub">' +
          '<div class="pp-sub-title">❤️ Top 10 Favoritos</div>' +
          favsHtml +
        '</div>' +
        '<div class="pp-sub pp-sub--plat">' +
          '<div class="pp-sub-title">🎮 Platinos</div>' +
          platHtml +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── RENDER ALL ─────────────────────────────────────────────── */
  function render() {
    var container = document.getElementById('playerProfiles');
    if (!container) return;

    /* Reorder: active player first */
    var ap = window.GT && window.GT.getActivePlayer ? window.GT.getActivePlayer() : null;
    var ordered = PLAYERS.slice();
    if (ap) {
      ordered.sort(function(a, b) {
        if (a.key === ap) return -1;
        if (b.key === ap) return  1;
        return 0;
      });
    }
    container.innerHTML = ordered.map(function(p) { return renderPlayer(p); }).join('');

    // Scroll to player anchor (hash > active player > nothing)
    try {
      var hash = window.location.hash;
      var target = null;
      if (hash) {
        target = document.querySelector(hash);
      } else {
        var ap = window.GT && window.GT.getActivePlayer ? window.GT.getActivePlayer() : null;
        if (ap) target = document.getElementById('player-' + ap.toLowerCase());
      }
      if (target) {
        setTimeout(function() {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } catch(e) {}
  }

  /* ══════════════════════════════════════════════════════════════
     DONE MODAL
  ══════════════════════════════════════════════════════════════ */
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

  /* ══════════════════════════════════════════════════════════════
     CELEBRATION
  ══════════════════════════════════════════════════════════════ */
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
    var chord = [
      { freq: 523.25, t: 0.50, dur: 0.55 },
      { freq: 659.25, t: 0.50, dur: 0.55 }
    ];
    function playNote(freq, startT, dur, vol) {
      var osc = ctx.createOscillator(); var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0, startT);
      gain.gain.linearRampToValueAtTime(vol, startT + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);
      osc.start(startT); osc.stop(startT + dur + 0.05);
    }
    var now = ctx.currentTime;
    melody.forEach(function(n) { playNote(n.freq, now + n.t, n.dur, 0.35); });
    chord.forEach(function(n)  { playNote(n.freq, now + n.t, n.dur, 0.18); });
    (function() {
      var buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      var src = ctx.createBufferSource(); var gain = ctx.createGain();
      src.buffer = buf; src.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      src.start(now); src.stop(now + 0.12);
    })();
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
          life: 1, decay: 0.012 + Math.random()*0.012, size: 2.5 + Math.random()*2.5,
          color: color, trail: Math.random() > 0.5 });
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
        if (p.trail) { ctx.fillRect(p.x, p.y, p.size*p.life, p.size*p.life*0.4); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size*p.life, 0, Math.PI*2); ctx.fill(); }
        ctx.restore(); return true;
      });
      if (!stopped && (parts.length > 0 || burstCount < maxBursts)) rafId = requestAnimationFrame(tick);
    }
    tick();
    return function stop() { stopped = true; if (rafId) cancelAnimationFrame(rafId); };
  }

  /* ══════════════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════════════ */
  function init() {
    var _ny = document.getElementById('navYear'); if (_ny) _ny.textContent = new Date().getFullYear();
    var _fy = document.getElementById('footerYear'); if (_fy) _fy.textContent = new Date().getFullYear();
    injectDoneModal();
    injectFavPicker();
    render();
  }

  window.GT_Pend = {
    openDoneModal:    openDoneModal,
    openFavPicker:    openFavPicker,
    closeFavPicker:   closeFavPicker,
    renderPickerList: renderPickerList,
    pickFav:          pickFav,
    removeFav:        removeFav
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      loadFavoritos(function() {
        safe(init, 'init');
        window.GT.onDataChange(function () { safe(render, 'render'); });
      });
    });
  });
})();
