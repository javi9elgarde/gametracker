/* ============================================================
   GAMETRACKER — Registro Page
   ============================================================ */
(function () {
  'use strict';

  var Utils      = window.GT.Utils;
  var Biblioteca = window.GT.Biblioteca;
  var Registro   = window.GT.Registro;
  var Toast      = window.GT.Toast;

  var state = { player: 'All', year: 0, month: '', estado: '', editId: null, sortAsc: false };

  function safe(fn, name) {
    try { fn(); } catch(e) { console.warn('registro.js ' + name + ':', e); }
  }

  /* ── RENDER TABLE ───────────────────────────────────────── */
  function renderTable() {
    var opts = { jugador: state.player };
    if (state.year)   opts.año    = state.year;
    if (state.month)  opts.mes    = parseInt(state.month);
    if (state.estado) opts.estado = state.estado;

    var entries = Registro.filter(opts);

    // Sort by year+month, direction controlled by state.sortAsc
    entries.sort(function(a,b){
      var byYear = state.sortAsc ? (a.año - b.año) : (b.año - a.año);
      if (byYear !== 0) return byYear;
      return state.sortAsc ? (a.mes - b.mes) : (b.mes - a.mes);
    });

    var body  = document.getElementById('regBody');
    var empty = document.getElementById('regEmpty');
    var count = document.getElementById('regCount');

    count.textContent = entries.length + ' entrada' + (entries.length !== 1 ? 's' : '');

    if (!entries.length) {
      body.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    body.innerHTML = entries.map(function(r) {
      var game = Biblioteca.getById(r.juegoId);
      var titulo = game ? game.titulo : '(Juego eliminado)';
      var sc = Utils.scoreColor(r.nota);

      var coverHtml = '<div class="mini-cover">' +
        (game && game.portadaUrl
          ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="" onerror="this.style.display=\'none\'">'
          : '') +
        '<span class="mini-cover__letter">' + Utils.escapeHtml(titulo.charAt(0)) + '</span>' +
      '</div>';

      var scoreHtml = (r.nota !== null && r.nota !== undefined && r.nota !== '')
        ? '<div class="score-wrap" style="min-width:120px">' +
            '<div class="score-bar"><div class="score-bar__fill" style="width:' + Utils.scoreWidth(r.nota) + ';background:' + sc + '"></div></div>' +
            '<span class="score-num" style="color:' + sc + '">' + Utils.formatScore(r.nota) + '</span>' +
          '</div>'
        : '<span style="color:var(--txt3);font-size:0.8rem">—</span>';

      return '<tr>' +
        '<td><span style="font-size:0.8rem;color:var(--txt2)">' + Utils.monthName(r.mes) + ' ' + r.año + '</span></td>' +
        '<td><span class="badge ' + Utils.playerBadge(r.jugador) + '">' + Utils.escapeHtml(r.jugador) + '</span></td>' +
        '<td><div class="game-cell">' + coverHtml + '<span style="font-weight:600">' + Utils.escapeHtml(titulo) + '</span></div></td>' +
        '<td>' + scoreHtml + '</td>' +
        '<td><span class="badge ' + Utils.statusBadge(r.estado) + '">' + Utils.escapeHtml(r.estado) + '</span></td>' +
        '<td><span style="font-size:0.85rem;color:var(--txt2)">' + (r.horas ? r.horas + 'h' : '—') + '</span></td>' +
        '<td>' + (r.plataformaJugada ? '<span class="badge badge-plat ' + Utils.platformClass(r.plataformaJugada) + '">' + Utils.escapeHtml(r.plataformaJugada) + '</span>' : '—') + '</td>' +
        '<td><button class="btn btn-ghost btn-icon" onclick="window.GT_Reg.openEdit(\'' + r.id + '\')" title="Editar">✏️</button></td>' +
      '</tr>';
    }).join('');
  }

  /* ── YEAR OPTIONS ───────────────────────────────────────── */
  function buildYearOptions() {
    var sel = document.getElementById('filterYear');
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var y = currentYear; y >= 2020; y--) years.push(y);
    sel.innerHTML = '<option value="">Todos los años</option>' +
      years.map(function(y){
        return '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
      }).join('');
    state.year = currentYear;
    sel.addEventListener('change', function(){ state.year = this.value ? parseInt(this.value) : 0; renderTable(); });
  }

  /* ── POPULATE GAME SELECT ───────────────────────────────── */
  function populateGameSelect(selectedId) {
    var games = Biblioteca.getAll().sort(function(a,b){ return a.titulo.localeCompare(b.titulo,'es'); });
    var sel = document.getElementById('fJuego');
    sel.innerHTML = '<option value="">— Seleccionar juego —</option>' +
      games.map(function(g){
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

  /* ── PLAYER TABS ────────────────────────────────────────── */
  function initPlayerTabs() {
    document.getElementById('playerTabs').querySelectorAll('.player-tab').forEach(function(btn){
      btn.addEventListener('click', function(){
        state.player = this.dataset.player;
        document.querySelectorAll('.player-tab').forEach(function(b){ b.className = 'player-tab'; });
        var cls = state.player === 'All' ? 'active-all' : 'active-' + state.player.toLowerCase();
        this.className = 'player-tab ' + cls;
        renderTable();
      });
    });
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    document.getElementById('navYear').textContent = new Date().getFullYear();
    buildYearOptions();
    initPlayerTabs();

    document.getElementById('filterMonth').addEventListener('change', function(){ state.month = this.value; renderTable(); });
    document.getElementById('filterStatus').addEventListener('change', function(){ state.estado = this.value; renderTable(); });

    document.getElementById('btnSortOrder').addEventListener('click', function(){
      state.sortAsc = !state.sortAsc;
      this.textContent = state.sortAsc ? '↑ Enero → Dic' : '↓ Más reciente';
      renderTable();
    });

    document.getElementById('btnAddEntry').addEventListener('click', openAdd);
    document.getElementById('fabAdd').addEventListener('click', openAdd);

    document.getElementById('entryModalClose').addEventListener('click', closeModal);
    document.getElementById('entryBtnCancel').addEventListener('click', closeModal);
    document.getElementById('entryBtnSave').addEventListener('click', saveEntry);
    document.getElementById('entryBtnDelete').addEventListener('click', deleteEntry);
    document.getElementById('entryModal').addEventListener('click', function(e){ if(e.target===this) closeModal(); });

    renderTable();
  }

  window.GT_Reg = { openEdit: openEdit };
  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      safe(init, 'init');
      window.GT.onDataChange(function () { safe(renderTable, 'renderTable'); });
    });
  });
})();
