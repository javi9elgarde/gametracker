/* ============================================================
   MEDIA TRACKER — Biblioteca
   Version: 20260522a
   ============================================================ */
(function () {
  'use strict';

  var _items      = [];
  var _unsub      = null;
  var _editingId  = null;
  var _selGeneros = [];
  var _selPlats   = [];
  var _filterPlayer = 'All';
  var _filterGenre  = '';
  var _filterStatus = '';
  var _filterYear   = '';
  var _searchQuery  = '';

  /* ── ESPERAR MT.init ────────────────────────────────────── */
  function waitForMT(cb) {
    if (window.MT && window.MT.getDb && window.MT.getDb()) return cb();
    setTimeout(function () { waitForMT(cb); }, 60);
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    waitForMT(function () {
      loadItems();
      buildFilters();
      updatePageMeta();
    });

    /* Modales */
    document.getElementById('btnAdd').addEventListener('click', openAddModal);
    document.getElementById('fabAdd').addEventListener('click', openAddModal);
    document.getElementById('editModalClose').addEventListener('click', closeEditModal);
    document.getElementById('btnCancel').addEventListener('click', closeEditModal);
    document.getElementById('btnSave').addEventListener('click', saveItem);
    document.getElementById('btnDelete').addEventListener('click', deleteItem);
    document.getElementById('detailClose').addEventListener('click', closeDetailModal);
    document.getElementById('detailEdit').addEventListener('click', function () {
      closeDetailModal();
      openEditModal(_editingId);
    });
    document.getElementById('editModal').addEventListener('click', function (e) {
      if (e.target === this) closeEditModal();
    });
    document.getElementById('detailModal').addEventListener('click', function (e) {
      if (e.target === this) closeDetailModal();
    });

    /* Filtros */
    document.getElementById('searchInput').addEventListener('input', function () {
      _searchQuery = this.value.toLowerCase();
      renderGrid();
    });
    document.getElementById('genreFilter').addEventListener('change', function () {
      _filterGenre = this.value; renderGrid();
    });
    document.getElementById('statusFilter').addEventListener('change', function () {
      _filterStatus = this.value; renderGrid();
    });
    document.getElementById('yearFilter').addEventListener('change', function () {
      _filterYear = this.value; renderGrid();
    });
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    document.querySelectorAll('input[name="mtPlayer"]').forEach(function (r) {
      r.addEventListener('change', function () {
        _filterPlayer = this.value; renderGrid();
      });
    });

    /* Escuchar cambios de categoría */
    window.addEventListener('mt:catChange', function (e) {
      if (_unsub) _unsub();
      loadItems();
      buildFilters();
      updatePageMeta();
      closeEditModal();
      closeDetailModal();
    });
  }

  /* ── CARGAR ITEMS ───────────────────────────────────────── */
  function loadItems() {
    var db  = window.MT.getDb();
    var cat = window.MT.getCat();
    if (_unsub) _unsub();
    _unsub = db.collection('mt_items')
      .where('tipo', '==', cat)
      .orderBy('titulo')
      .onSnapshot(function (snap) {
        _items = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        renderGrid();
        buildYearFilter();
        window.MT.hideLoading();
      }, function (err) {
        console.error('MT items error:', err);
        window.MT.hideLoading();
      });
  }

  /* ── METADATA DE PÁGINA ─────────────────────────────────── */
  function updatePageMeta() {
    var cat    = window.MT.getCat();
    var U      = window.MT.Utils;
    var titles = { peliculas: '🎬 Películas', series: '📺 Series', anime: '🌸 Anime' };
    var subs   = { peliculas: 'Cine y documentales', series: 'Series y miniseries', anime: 'Anime y manga' };
    document.getElementById('pageTitle').textContent   = titles[cat] || '🎬';
    document.getElementById('editModalTitle').textContent = 'Añadir ' + (cat === 'peliculas' ? 'Película' : cat === 'series' ? 'Serie' : 'Anime');
    document.title = 'Refugio 111 — ' + (titles[cat] || 'Media');

    /* Campos específicos por categoría */
    var isFilm = cat === 'peliculas';
    document.getElementById('labelDirector').textContent = isFilm ? 'Director' : 'Estudio';
    document.getElementById('labelDuracion').textContent = isFilm ? 'Duración (min)' : 'Temporadas';
    document.getElementById('groupEpisodios').style.display = isFilm ? 'none' : '';
    document.getElementById('fDirector').placeholder = isFilm ? 'Ej: Denis Villeneuve' : 'Ej: MAPPA, Toei';
  }

  /* ── RENDER GRID ────────────────────────────────────────── */
  function renderGrid() {
    var grid  = document.getElementById('mtGrid');
    var items = filterItems();
    var count = document.getElementById('pageCount');

    count.textContent = items.length + ' título' + (items.length !== 1 ? 's' : '');

    if (items.length === 0) {
      grid.innerHTML =
        '<div class="mt-empty">' +
          '<div class="mt-empty__icon">' + window.MT.Utils.catEmoji(window.MT.getCat()) + '</div>' +
          '<div class="mt-empty__title">No se encontraron títulos</div>' +
          '<p>Prueba a cambiar los filtros o añade el primero.</p>' +
        '</div>';
      return;
    }

    grid.innerHTML = items.map(renderCard).join('');

    /* Actualizar filtro de años */
    buildYearFilter();
  }

  /* ── FILTROS ─────────────────────────────────────────────── */
  function filterItems() {
    return _items.filter(function (item) {
      /* Jugador */
      if (_filterPlayer && _filterPlayer !== 'All') {
        var jInfo = item.jugadores && item.jugadores[_filterPlayer];
        if (!jInfo || !jInfo.estado) return false;
      }
      /* Estado */
      if (_filterStatus) {
        var hasStatus = false;
        if (item.jugadores) {
          Object.values(item.jugadores).forEach(function (j) {
            if (j && j.estado) {
              var sc = MT.Utils.statusClass(j.estado);
              if (sc.indexOf(_filterStatus) >= 0 || _filterStatus.indexOf(sc) >= 0) hasStatus = true;
            }
          });
        }
        if (!hasStatus) return false;
      }
      /* Género */
      if (_filterGenre && !(item.generos || []).includes(_filterGenre)) return false;
      /* Año */
      if (_filterYear && String(item.anio || item.año || '') !== _filterYear) return false;
      /* Búsqueda */
      if (_searchQuery) {
        var hay = [item.titulo, item.director, item.estudio].join(' ').toLowerCase();
        if ((item.generos || []).length) hay += ' ' + item.generos.join(' ').toLowerCase();
        if (hay.indexOf(_searchQuery) < 0) return false;
      }
      return true;
    });
  }

  function clearFilters() {
    _filterGenre = ''; _filterStatus = ''; _filterYear = ''; _searchQuery = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('genreFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('yearFilter').value = '';
    renderGrid();
  }

  /* ── RENDER CARD ─────────────────────────────────────────── */
  function renderCard(item) {
    var U     = window.MT.Utils;
    var nota  = U.calcNotaMedia(item.jugadores);
    var color = nota !== null ? U.notaColor(nota) : null;
    var id    = item.id;

    var scoreBadge = nota !== null
      ? '<div class="mt-card__score" style="color:' + color + '">' + U.formatNota(nota) + '</div>'
      : '';

    var cover = item.portadaUrl
      ? '<img src="' + U.escHtml(item.portadaUrl) + '" loading="lazy" onerror="this.style.display=\'none\'">'
      : '<div class="mt-card__cover-ph">' + U.catEmoji(item.tipo) + '</div>';

    /* Player status dots */
    var dots = ['David', 'Javi', 'Mery'].map(function (p) {
      var est = item.jugadores && item.jugadores[p] && item.jugadores[p].estado;
      return '<div class="mt-card__dot ' + U.playerDotClass(est) + '" title="' + p + ': ' + (est || 'sin estado') + '"></div>';
    }).join('');

    var genre = item.generos && item.generos[0] ? '<span class="mt-card__genre">' + U.escHtml(item.generos[0]) + '</span>' : '';

    return '<div class="mt-card" onclick="window.MT_Bib.openDetail(\'' + id.replace(/'/g, "\\'") + '\')">' +
      '<div class="mt-card__cover">' +
        cover + scoreBadge +
        '<div class="mt-card__players">' + dots + '</div>' +
      '</div>' +
      '<div class="mt-card__body">' +
        '<div class="mt-card__title">' + U.escHtml(item.titulo) + '</div>' +
        '<div class="mt-card__meta">' +
          (item.anio || item.año ? '<span class="mt-card__year">' + (item.anio || item.año) + '</span>' : '') +
          genre +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── BUILD FILTERS ───────────────────────────────────────── */
  function buildFilters() {
    var cat    = window.MT.getCat();
    var genres = window.MT.GENEROS[cat] || [];
    var sel    = document.getElementById('genreFilter');
    sel.innerHTML = '<option value="">🏷 Géneros</option>' +
      genres.map(function (g) { return '<option value="' + g + '">' + g + '</option>'; }).join('');
  }

  function buildYearFilter() {
    var years = [...new Set(_items.map(function (i) { return i.anio || i.año; }).filter(Boolean))].sort().reverse();
    var sel   = document.getElementById('yearFilter');
    var cur   = sel.value;
    sel.innerHTML = '<option value="">📅 Año</option>' +
      years.map(function (y) { return '<option value="' + y + '"' + (String(y) === cur ? ' selected' : '') + '>' + y + '</option>'; }).join('');
  }

  /* ── DETALLE ─────────────────────────────────────────────── */
  function openDetail(id) {
    var item = _items.find(function (i) { return i.id === id; });
    if (!item) return;
    _editingId = id;

    var U     = window.MT.Utils;
    var nota  = U.calcNotaMedia(item.jugadores);
    var color = nota !== null ? U.notaColor(nota) : null;

    document.getElementById('detailTitle').textContent = item.titulo;

    /* Cover */
    var coverHtml = item.portadaUrl
      ? '<img src="' + U.escHtml(item.portadaUrl) + '" onerror="this.style.display=\'none\'">'
      : '<div class="mt-detail-cover__ph">' + U.catEmoji(item.tipo) + '</div>';

    var scoreBadge = nota !== null
      ? '<div class="mt-detail-score" style="--sc:' + color + '">' +
          '<div class="mt-detail-score__val" style="color:' + color + '">' + U.formatNota(nota) + '</div>' +
          '<div class="mt-detail-score__lbl">NOTA MEDIA</div>' +
        '</div>'
      : '';

    /* Badges */
    var badges = (item.generos || []).map(function (g) {
      return '<span class="mt-badge mt-badge--genre">' + U.escHtml(g) + '</span>';
    }).join('');
    if (item.anio || item.año) badges += '<span class="mt-badge mt-badge--year">📅 ' + (item.anio || item.año) + '</span>';

    /* Stats */
    var stats = '';
    if (item.director)  stats += '<div class="mt-detail-stat"><div class="mt-detail-stat__lbl">DIRECTOR</div><div class="mt-detail-stat__val">' + U.escHtml(item.director) + '</div></div>';
    if (item.estudio)   stats += '<div class="mt-detail-stat"><div class="mt-detail-stat__lbl">ESTUDIO</div><div class="mt-detail-stat__val">' + U.escHtml(item.estudio) + '</div></div>';
    if (item.duracion)  stats += '<div class="mt-detail-stat"><div class="mt-detail-stat__lbl">' + (item.tipo === 'peliculas' ? 'DURACIÓN' : 'TEMPORADAS') + '</div><div class="mt-detail-stat__val">' + item.duracion + (item.tipo === 'peliculas' ? ' min' : '') + '</div></div>';
    if (item.episodios) stats += '<div class="mt-detail-stat"><div class="mt-detail-stat__lbl">EPISODIOS</div><div class="mt-detail-stat__val">' + item.episodios + '</div></div>';
    if (item.plataforma) stats += '<div class="mt-detail-stat"><div class="mt-detail-stat__lbl">PLATAFORMA</div><div class="mt-detail-stat__val">' + U.escHtml(item.plataforma) + '</div></div>';

    /* Player rows */
    var playersHtml = ['David', 'Javi', 'Mery'].map(function (p) {
      var jInfo  = item.jugadores && item.jugadores[p];
      var estado = jInfo && jInfo.estado ? jInfo.estado : 'Sin estado';
      var sc     = U.statusClass(estado);
      var notaP  = jInfo && jInfo.nota !== null && jInfo.nota !== undefined && jInfo.nota !== '' ? jInfo.nota : null;
      var ep     = jInfo && jInfo.episodio ? ' · Ep. ' + jInfo.episodio : '';
      var notaColor = notaP !== null ? U.notaColor(notaP) : 'var(--txt3)';
      return '<div class="mt-detail-player">' +
        '<div class="mt-detail-player__avatar mt-detail-player__avatar--' + p.toLowerCase() + '">' + p.charAt(0) + '</div>' +
        '<div class="mt-detail-player__name">' + p + '</div>' +
        '<span class="mt-detail-player__status mt-status--' + sc + '">' + U.escHtml(estado) + (ep ? ep : '') + '</span>' +
        (notaP !== null ? '<div class="mt-detail-player__nota" style="color:' + notaColor + '">' + U.formatNota(notaP) + '</div>' : '') +
      '</div>';
    }).join('');

    document.getElementById('detailBody').innerHTML =
      '<div class="mt-detail-cover">' + coverHtml + scoreBadge + '</div>' +
      (badges ? '<div class="mt-detail-badges">' + badges + '</div>' : '') +
      (stats ? '<div class="mt-detail-stats">' + stats + '</div>' : '') +
      '<div class="mt-detail-players">' + playersHtml + '</div>';

    document.getElementById('detailModal').classList.add('open');
  }

  function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('open');
  }

  /* ── MODAL ADD / EDIT ────────────────────────────────────── */
  function openAddModal() {
    _editingId = null;
    var cat = window.MT.getCat();
    document.getElementById('editModalTitle').textContent =
      'Añadir ' + (cat === 'peliculas' ? 'Película' : cat === 'series' ? 'Serie' : 'Anime');
    document.getElementById('fId').value      = '';
    document.getElementById('fTitulo').value  = '';
    document.getElementById('fPortada').value = '';
    document.getElementById('fDirector').value= '';
    document.getElementById('fAnio').value    = '';
    document.getElementById('fDuracion').value= '';
    document.getElementById('fEpisodios').value = '';
    _selGeneros = []; _selPlats = [];
    document.getElementById('btnDelete').style.display = 'none';
    buildChips();
    buildPlayerRows(null);
    document.getElementById('editModal').classList.add('open');
    document.getElementById('fTitulo').focus();
  }

  function openEditModal(id) {
    var item = _items.find(function (i) { return i.id === id; });
    if (!item) { openAddModal(); return; }
    _editingId = id;
    var cat    = window.MT.getCat();
    document.getElementById('editModalTitle').textContent =
      'Editar ' + (cat === 'peliculas' ? 'Película' : cat === 'series' ? 'Serie' : 'Anime');
    document.getElementById('fId').value      = id;
    document.getElementById('fTitulo').value  = item.titulo  || '';
    document.getElementById('fPortada').value = item.portadaUrl || '';
    document.getElementById('fDirector').value= item.director || item.estudio || '';
    document.getElementById('fAnio').value    = item.anio || item.año || '';
    document.getElementById('fDuracion').value= item.duracion || '';
    document.getElementById('fEpisodios').value= item.episodios || '';
    _selGeneros = (item.generos   || []).slice();
    _selPlats   = item.plataforma ? [item.plataforma] : [];
    document.getElementById('btnDelete').style.display = 'inline-flex';
    buildChips();
    buildPlayerRows(item.jugadores || null);
    document.getElementById('editModal').classList.add('open');
  }

  function closeEditModal() {
    document.getElementById('editModal').classList.remove('open');
    _editingId = null;
  }

  /* ── CHIPS GÉNEROS/PLATAFORMAS ───────────────────────────── */
  function buildChips() {
    var cat    = window.MT.getCat();
    var genres = window.MT.GENEROS[cat]     || [];
    var plats  = window.MT.PLATAFORMAS[cat] || [];

    var gEl = document.getElementById('generoChips');
    gEl.innerHTML = genres.map(function (g) {
      var active = _selGeneros.indexOf(g) >= 0 ? ' active' : '';
      return '<div class="mt-chip' + active + '" onclick="window.MT_Bib._toggleChip(\'g\',this,\'' + escHtml(g) + '\')">' + escHtml(g) + '</div>';
    }).join('');

    var pEl = document.getElementById('plataformaChips');
    pEl.innerHTML = plats.map(function (p) {
      var active = _selPlats.indexOf(p) >= 0 ? ' active' : '';
      return '<div class="mt-chip' + active + '" onclick="window.MT_Bib._toggleChip(\'p\',this,\'' + escHtml(p) + '\')">' + escHtml(p) + '</div>';
    }).join('');
  }

  function _toggleChip(type, el, val) {
    el.classList.toggle('active');
    var arr = type === 'g' ? _selGeneros : _selPlats;
    var idx = arr.indexOf(val);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
    /* Plataforma: solo una */
    if (type === 'p' && _selPlats.length > 1) {
      _selPlats = [val];
      document.querySelectorAll('#plataformaChips .mt-chip').forEach(function (c) {
        c.classList.toggle('active', c.textContent === val);
      });
    }
  }

  /* ── FILAS DE JUGADORES ──────────────────────────────────── */
  function buildPlayerRows(existingJugadores) {
    var cat     = window.MT.getCat();
    var estados = window.MT.ESTADOS[cat] || ['Visto', 'Viendo', 'Pendiente', 'Abandonado'];
    var container = document.getElementById('playerRows');
    container.innerHTML = ['David', 'Javi', 'Mery'].map(function (p) {
      var info   = existingJugadores && existingJugadores[p] ? existingJugadores[p] : {};
      var estado = info.estado || '';
      var nota   = info.nota !== undefined && info.nota !== null ? info.nota : '';
      var ep     = info.episodio || '';
      var opts   = '<option value="">— Sin estado</option>' +
        estados.map(function (e) {
          return '<option value="' + e + '"' + (e === estado ? ' selected' : '') + '>' + e + '</option>';
        }).join('');
      var isFilm = cat === 'peliculas';
      return '<div class="mt-player-row" id="prow-' + p.toLowerCase() + '">' +
        '<div class="mt-player-row__avatar mt-player-row__avatar--' + p.toLowerCase() + '">' + p.charAt(0) + '</div>' +
        '<select class="mt-form-select" id="fEstado' + p + '">' + opts + '</select>' +
        '<input type="number" class="mt-form-input" id="fNota' + p + '" value="' + nota + '" placeholder="Nota" min="0" max="10" step="0.5">' +
        (!isFilm ? '<input type="number" class="mt-form-input" id="fEp' + p + '" value="' + ep + '" placeholder="Ep." min="0">' : '') +
      '</div>';
    }).join('');
  }

  /* ── GUARDAR ITEM ────────────────────────────────────────── */
  function saveItem() {
    var titulo = document.getElementById('fTitulo').value.trim();
    if (!titulo) { document.getElementById('fTitulo').focus(); return; }

    var cat   = window.MT.getCat();
    var isFilm = cat === 'peliculas';
    var dirKey = isFilm ? 'director' : 'estudio';

    var jugadores = {};
    ['David', 'Javi', 'Mery'].forEach(function (p) {
      var estadoEl = document.getElementById('fEstado' + p);
      var notaEl   = document.getElementById('fNota' + p);
      var epEl     = document.getElementById('fEp' + p);
      var estado   = estadoEl ? estadoEl.value : '';
      var nota     = notaEl && notaEl.value !== '' ? parseFloat(notaEl.value) : null;
      var ep       = epEl && epEl.value !== '' ? parseInt(epEl.value) : null;
      jugadores[p] = { estado: estado, nota: nota };
      if (!isFilm) jugadores[p].episodio = ep;
    });

    var data = {
      tipo      : cat,
      titulo    : titulo,
      portadaUrl: document.getElementById('fPortada').value.trim() || null,
      anio      : parseInt(document.getElementById('fAnio').value) || null,
      duracion  : parseFloat(document.getElementById('fDuracion').value) || null,
      generos   : _selGeneros.slice(),
      plataforma: _selPlats[0] || null,
      jugadores : jugadores
    };
    data[dirKey] = document.getElementById('fDirector').value.trim() || null;
    if (!isFilm) {
      data.episodios = parseInt(document.getElementById('fEpisodios').value) || null;
    }

    var db = window.MT.getDb();
    if (_editingId) {
      db.collection('mt_items').doc(_editingId).update(data).then(closeEditModal);
    } else {
      data.createdAt = window.firebase.firestore.FieldValue.serverTimestamp();
      db.collection('mt_items').add(data).then(closeEditModal);
    }
  }

  /* ── ELIMINAR ITEM ───────────────────────────────────────── */
  function deleteItem() {
    if (!_editingId) return;
    if (!confirm('¿Eliminar este título?')) return;
    window.MT.getDb().collection('mt_items').doc(_editingId).delete().then(closeEditModal);
  }

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ── EXPOSE ──────────────────────────────────────────────── */
  window.MT_Bib = {
    openDetail : openDetail,
    openEditModal: openEditModal,
    _toggleChip: _toggleChip
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
