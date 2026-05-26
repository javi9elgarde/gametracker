/* ============================================================
   GAMETRACKER — Registro Page
   Version: 20260521b
   ============================================================ */
(function () {
  'use strict';

  var Utils      = window.GT.Utils;
  var Biblioteca = window.GT.Biblioteca;
  var Registro   = window.GT.Registro;
  var Toast      = window.GT.Toast;

  var state      = { player: 'All', year: 0, month: '', estado: '', editId: null, sortAsc: false };
  var _quickModal = { entryId: null };

  function safe(fn, name) {
    try { fn(); } catch(e) { console.warn('registro.js ' + name + ':', e); }
  }

  /* ── QUICK COMPLETE MODAL ───────────────────────────────────── */
  function injectQuickModal() {
    if (document.getElementById('regQuickOverlay')) return;
    var el = document.createElement('div');
    el.id = 'regQuickOverlay';
    el.className = 'reg-quick-overlay';
    el.innerHTML =
      '<div class="reg-quick-box">' +
        '<div class="reg-quick-icon">🎮</div>' +
        '<div class="reg-quick-title" id="regQuickTitle">—</div>' +
        '<div class="reg-quick-fields">' +
          '<div class="reg-quick-field">' +
            '<label class="reg-quick-label">Estado</label>' +
            '<select class="form-select" id="regQuickEstado">' +
              '<option value="Terminado">Terminado</option>' +
              '<option value="Platinado">Platinado</option>' +
              '<option value="Rejugado">Rejugado</option>' +
              '<option value="Jugando">Jugando</option>' +
              '<option value="Retomar">Retomar</option>' +
              '<option value="Abandonado">Abandonado</option>' +
              '<option value="Jugado">Jugado</option>' +
            '</select>' +
          '</div>' +
          '<div class="reg-quick-field">' +
            '<label class="reg-quick-label">Nota (0–10)</label>' +
            '<input type="number" class="form-input" id="regQuickNota" min="0" max="10" step="0.5" placeholder="Ej: 8.5">' +
          '</div>' +
          '<div class="reg-quick-field">' +
            '<label class="reg-quick-label">Horas jugadas</label>' +
            '<input type="number" class="form-input" id="regQuickHoras" min="0" step="0.5" placeholder="Ej: 25">' +
          '</div>' +
        '</div>' +
        '<div class="reg-quick-footer">' +
          '<button class="pend-done-cancel" id="regQuickCancel">✕ Cancelar</button>' +
          '<button class="reg-quick-save" id="regQuickSave">✓ Guardar</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function(e) { if (e.target === el) closeQuickModal(); });
    document.getElementById('regQuickCancel').addEventListener('click', closeQuickModal);
    document.getElementById('regQuickSave').addEventListener('click', saveQuickEntry);
  }

  function openQuickModal(entryId) {
    var r = Registro.getById(entryId);
    if (!r) return;
    var game = Biblioteca.getById(r.juegoId);
    _quickModal.entryId = entryId;
    document.getElementById('regQuickTitle').textContent = game ? game.titulo : 'Sin título';
    document.getElementById('regQuickEstado').value = r.estado || 'Terminado';
    document.getElementById('regQuickNota').value   = (r.nota !== null && r.nota !== undefined && r.nota !== '') ? r.nota : '';
    document.getElementById('regQuickHoras').value  = r.horas || '';
    document.getElementById('regQuickOverlay').classList.add('open');
  }

  function closeQuickModal() {
    var overlay = document.getElementById('regQuickOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  function saveQuickEntry() {
    var entryId = _quickModal.entryId;
    if (!entryId) return;
    var r = Registro.getById(entryId);
    if (!r) return;

    var notaRaw = document.getElementById('regQuickNota').value.trim();
    var nota    = notaRaw !== '' ? parseFloat(notaRaw) : null;
    if (nota !== null && (isNaN(nota) || nota < 0 || nota > 10)) {
      Toast.show('La nota debe estar entre 0 y 10', 'error'); return;
    }
    var horas  = parseFloat(document.getElementById('regQuickHoras').value) || null;
    var estado = document.getElementById('regQuickEstado').value;

    Registro.update(entryId, { estado: estado, nota: nota, horas: horas });
    Toast.show('Entrada actualizada ✓');
    closeQuickModal();
    renderTable();

    if (estado === 'Terminado' || estado === 'Platinado') {
      var game = Biblioteca.getById(r.juegoId);
      showCelebration(game ? game.titulo : '—', r.jugador);
    }
  }

  /* ── CELEBRATION (fuegos artificiales) ─────────────────────── */
  function showCelebration(gameTitle, playerKey) {
    safe(playCelebrationSound, 'sound');
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
      overlay.style.opacity = '0'; overlay.style.transition = 'opacity 0.5s';
      if (stopFW) stopFW();
      setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 520);
    }
    overlay.addEventListener('click', closeIt);
    setTimeout(closeIt, 6000);
  }

  function playCelebrationSound() {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    var ctx = new AudioCtx();
    var melody = [
      { freq: 523.25, t: 0,    dur: 0.18 },
      { freq: 659.25, t: 0.16, dur: 0.18 },
      { freq: 783.99, t: 0.32, dur: 0.18 },
      { freq: 1046.5, t: 0.50, dur: 0.55 }
    ];
    var now = ctx.currentTime;
    melody.forEach(function(n) {
      var osc = ctx.createOscillator(); var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(n.freq, now + n.t);
      gain.gain.setValueAtTime(0, now + n.t);
      gain.gain.linearRampToValueAtTime(0.35, now + n.t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.dur);
      osc.start(now + n.t); osc.stop(now + n.t + n.dur + 0.05);
    });
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
        parts.push({ x:x, y:y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed - 1,
          life:1, decay:0.012+Math.random()*0.012, size:2.5+Math.random()*2.5, color:color });
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
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2); ctx.fill();
        ctx.restore(); return true;
      });
      if (!stopped && (parts.length > 0 || burstCount < maxBursts)) rafId = requestAnimationFrame(tick);
    }
    tick();
    return function stop() { stopped = true; if (rafId) cancelAnimationFrame(rafId); };
  }

  /* ── RENDER ROW ─────────────────────────────────────────── */
  function renderRow(r) {
    var game   = Biblioteca.getById(r.juegoId);
    var titulo = game ? game.titulo : '(Juego eliminado)';
    var sc     = Utils.scoreColor(r.nota);

    var coverHtml =
      '<div class="mini-cover">' +
        (game && game.portadaUrl
          ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="" style="object-position:' + Utils.escapeHtml((game && game.portadaPos) || 'center top') + '" onerror="this.style.display=\'none\'">'
          : '') +
        '<span class="mini-cover__letter">' + Utils.escapeHtml(titulo.charAt(0)) + '</span>' +
      '</div>';

    var scoreHtml = (r.nota !== null && r.nota !== undefined && r.nota !== '')
      ? '<div class="score-wrap" style="min-width:90px">' +
          '<div class="score-bar"><div class="score-bar__fill" style="width:' + Utils.scoreWidth(r.nota) + ';background:' + sc + '"></div></div>' +
          '<span class="score-num" style="color:' + sc + '">' + Utils.formatScore(r.nota) + '</span>' +
        '</div>'
      : '<span style="color:var(--txt3);font-size:0.8rem">—</span>';

    var rowCls = r.jugador === 'David' ? 'reg-row-david' : r.jugador === 'Javi' ? 'reg-row-javi' : r.jugador === 'Mery' ? 'reg-row-mery' : '';

    return '<tr class="' + rowCls + '">' +
      '<td><span style="font-size:0.8rem;color:var(--txt2);line-height:1.3">' + Utils.monthName(r.mes) + '<br><span style="color:var(--txt3)">' + r.año + '</span></span></td>' +
      '<td><span class="badge ' + Utils.playerBadge(r.jugador) + '">' + Utils.escapeHtml(r.jugador) + '</span></td>' +
      '<td><div class="game-cell">' + coverHtml +
        (game
          ? '<a href="biblioteca.html?open=' + game.id + '" class="game-link" onclick="event.stopPropagation()">' + Utils.escapeHtml(titulo) + '</a>'
          : '<span style="font-weight:600;color:var(--txt3)">' + Utils.escapeHtml(titulo) + '</span>') +
      '</div></td>' +
      '<td>' + scoreHtml + '</td>' +
      '<td><span class="badge ' + Utils.statusBadge(r.estado) + '">' + Utils.escapeHtml(r.estado) + '</span></td>' +
      '<td><span style="font-size:0.85rem;color:var(--txt2)">' + (r.horas ? r.horas + 'h' : '—') + '</span></td>' +
      '<td>' + (game && game.generos && game.generos.length ? Utils.genreBadgesHtml(game.generos.slice(0,2)) : '—') + '</td>' +
      '<td>' + (r.plataformaJugada ? '<span class="badge badge-plat ' + Utils.platformClass(r.plataformaJugada) + '">' + Utils.escapeHtml(r.plataformaJugada) + '</span>' : '—') + '</td>' +
      '<td><span style="font-size:0.8rem;color:var(--txt3)">' + (game && game.fechaLanzamiento ? game.fechaLanzamiento.slice(0,4) : '—') + '</span></td>' +
      '<td style="white-space:nowrap">' +
        '<button class="btn btn-ghost btn-icon reg-tick-btn" onclick="window.GT_Reg.openQuickModal(\'' + r.id + '\')" title="Actualizar rápido">' +
          '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polyline points="4,10 8,14 16,6"/></svg>' +
        '</button>' +
        '<button class="btn btn-ghost btn-icon" onclick="window.GT_Reg.openEdit(\'' + r.id + '\')" title="Editar">✏️</button>' +
      '</td>' +
    '</tr>';
  }

  /* ── RENDER GROUP ───────────────────────────────────────── */
  function renderGroup(type, icon, title, entries) {
    var rows = entries.map(renderRow).join('');
    return '<div class="reg-group reg-group--' + type + '">' +
      '<div class="reg-group__hdr">' +
        '<span class="reg-group__title">' + icon + ' ' + title + '</span>' +
        '<span class="reg-group__count">' + entries.length + ' entrada' + (entries.length !== 1 ? 's' : '') + '</span>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="table">' +
          '<thead><tr>' +
            '<th>Mes</th><th>Jugador</th><th>Videojuego</th><th>Nota</th><th>Estado</th>' +
            '<th>Horas</th><th>Géneros</th><th>Plataforma</th><th>Año lanz.</th><th style="width:60px"></th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>';
  }

  /* ── RENDER TABLE ───────────────────────────────────────── */
  function renderTable() {
    var opts = { jugador: state.player };
    if (state.year)   opts.año    = state.year;
    if (state.month)  opts.mes    = parseInt(state.month);
    if (state.estado) opts.estado = state.estado;

    var entries = Registro.filter(opts);

    var container = document.getElementById('regContainer');
    var empty     = document.getElementById('regEmpty');
    var count     = document.getElementById('regCount');

    count.textContent = entries.length + ' entrada' + (entries.length !== 1 ? 's' : '');

    if (!entries.length) {
      container.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    // Split first, then sort each group independently
    var playing = entries.filter(function(r) { return r.estado === 'Jugando' || r.estado === 'Retomar'; });
    var history = entries.filter(function(r) { return r.estado !== 'Jugando' && r.estado !== 'Retomar'; });

    // En Curso: respeta el orden del botón (por defecto más reciente)
    playing.sort(function(a, b) {
      var byYear = state.sortAsc ? (a.año - b.año) : (b.año - a.año);
      if (byYear !== 0) return byYear;
      return state.sortAsc ? (a.mes - b.mes) : (b.mes - a.mes);
    });

    // Historial: siempre Enero→Diciembre (ascendente)
    history.sort(function(a, b) {
      var byYear = a.año - b.año;
      if (byYear !== 0) return byYear;
      return a.mes - b.mes;
    });

    var html = '';
    if (playing.length) {
      html += renderGroup('playing', '🎮', 'En Curso', playing);
    }
    if (history.length) {
      html += renderGroup('history', '📋', 'Historial', history);
    }
    container.innerHTML = html;
  }

  /* ── YEAR OPTIONS ───────────────────────────────────────── */
  function buildYearOptions() {
    var sel = document.getElementById('filterYear');
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var y = currentYear; y >= 2020; y--) years.push(y);
    sel.innerHTML = '<option value="">Todos</option>' +
      years.map(function(y) {
        return '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
      }).join('');
    state.year = currentYear;
    sel.addEventListener('change', function() { state.year = this.value ? parseInt(this.value) : 0; renderTable(); });
  }

  /* ── POPULATE GAME SELECT ───────────────────────────────── */
  function populateGameSelect(selectedId) {
    var games = Biblioteca.getAll().sort(function(a, b) { return a.titulo.localeCompare(b.titulo, 'es'); });
    var sel = document.getElementById('fJuego');
    sel.innerHTML = '<option value="">— Seleccionar juego —</option>' +
      games.map(function(g) {
        return '<option value="' + g.id + '"' + (g.id === selectedId ? ' selected' : '') + '>' + Utils.escapeHtml(g.titulo) + '</option>';
      }).join('');
  }

  /* ── MODAL OPEN ─────────────────────────────────────────── */
  function openAdd() {
    state.editId = null;
    var now = new Date();
    document.getElementById('entryModalTitle').textContent = 'Nueva Entrada';
    document.getElementById('entryEditId').value = '';
    populateGameSelect('');
    document.getElementById('fJugador').value = state.player !== 'All' ? state.player : 'David';
    document.getElementById('fEstado').value = 'Terminado';
    document.getElementById('fNota').value = '';
    document.getElementById('fHoras').value = '';
    document.getElementById('fMes').value = now.getMonth() + 1;
    document.getElementById('fAño').value = now.getFullYear();
    document.getElementById('fPlataformaJugada').value = '';
    document.getElementById('fComentario').value = '';
    document.getElementById('entryBtnDelete').style.display = 'none';
    document.getElementById('entryModal').classList.add('open');
    document.getElementById('fJuego').focus();
  }

  function openEdit(id) {
    var r = Registro.getById(id);
    if (!r) return;
    state.editId = id;
    document.getElementById('entryModalTitle').textContent = 'Editar Entrada';
    document.getElementById('entryEditId').value = id;
    populateGameSelect(r.juegoId);
    document.getElementById('fJugador').value = r.jugador;
    document.getElementById('fEstado').value = r.estado;
    document.getElementById('fNota').value = (r.nota !== null && r.nota !== undefined) ? r.nota : '';
    document.getElementById('fHoras').value = r.horas || '';
    document.getElementById('fMes').value = r.mes;
    document.getElementById('fAño').value = r.año;
    document.getElementById('fPlataformaJugada').value = r.plataformaJugada || '';
    document.getElementById('fComentario').value = r.comentario || '';
    document.getElementById('entryBtnDelete').style.display = 'inline-flex';
    document.getElementById('entryModal').classList.add('open');
  }

  function closeModal() {
    document.getElementById('entryModal').classList.remove('open');
  }

  /* ── SAVE / DELETE ──────────────────────────────────────── */
  function saveEntry() {
    var juegoId = document.getElementById('fJuego').value;
    if (!juegoId) { Toast.show('Selecciona un videojuego', 'error'); return; }

    var notaRaw = document.getElementById('fNota').value.trim();
    var nota = notaRaw !== '' ? parseFloat(notaRaw) : null;
    if (nota !== null && (isNaN(nota) || nota < 0 || nota > 10)) {
      Toast.show('La nota debe estar entre 0 y 10', 'error'); return;
    }

    var data = {
      juegoId:          juegoId,
      jugador:          document.getElementById('fJugador').value,
      estado:           document.getElementById('fEstado').value,
      nota:             nota,
      horas:            parseFloat(document.getElementById('fHoras').value) || null,
      mes:              parseInt(document.getElementById('fMes').value),
      año:              parseInt(document.getElementById('fAño').value),
      plataformaJugada: document.getElementById('fPlataformaJugada').value,
      comentario:       document.getElementById('fComentario').value.trim()
    };

    if (state.editId) {
      Registro.update(state.editId, data);
      Toast.show('Entrada actualizada ✓');
    } else {
      Registro.add(data);
      Toast.show('Entrada añadida ✓');
    }

    closeModal();
    renderTable();
  }

  function deleteEntry() {
    if (!state.editId) return;
    if (!confirm('¿Eliminar esta entrada del registro?')) return;
    Registro.remove(state.editId);
    Toast.show('Entrada eliminada');
    closeModal();
    renderTable();
  }

  /* ── PLAYER CARDS ───────────────────────────────────────── */
  function initPlayerCards() {
    document.getElementById('playerCards').querySelectorAll('input[type="radio"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        if (this.checked) {
          state.player = this.value;
          renderTable();
        }
      });
    });
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    var _ny = document.getElementById('navYear'); if (_ny) _ny.textContent = new Date().getFullYear();
    var fy = document.getElementById('footerYear'); if (fy) fy.textContent = new Date().getFullYear();

    /* Pre-select active player from localStorage */
    var ap = window.GT.getActivePlayer ? window.GT.getActivePlayer() : null;
    if (ap && ap !== 'All') {
      state.player = ap;
      var radio = document.querySelector('#playerCards input[value="' + ap + '"]');
      if (radio) radio.checked = true;
    }

    buildYearOptions();
    initPlayerCards();

    document.getElementById('filterMonth').addEventListener('change', function() { state.month = this.value; renderTable(); });
    document.getElementById('filterStatus').addEventListener('change', function() { state.estado = this.value; renderTable(); });

    document.getElementById('btnSortOrder').addEventListener('click', function() {
      state.sortAsc = !state.sortAsc;
      this.textContent = state.sortAsc ? '↑ Enero→Dic' : '↓ Más reciente';
      renderTable();
    });

    injectQuickModal();

    document.getElementById('btnAddEntry').addEventListener('click', openAdd);
    document.getElementById('fabAdd').addEventListener('click', openAdd);

    document.getElementById('entryModalClose').addEventListener('click', closeModal);
    document.getElementById('entryBtnCancel').addEventListener('click', closeModal);
    document.getElementById('entryBtnSave').addEventListener('click', saveEntry);
    document.getElementById('entryBtnDelete').addEventListener('click', deleteEntry);
    document.getElementById('entryModal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });

    renderTable();
  }

  window.GT_Reg = { openEdit: openEdit, openQuickModal: openQuickModal };
  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      safe(init, 'init');
      window.GT.onDataChange(function () { safe(renderTable, 'renderTable'); });
    });
  });
})();
