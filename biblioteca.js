/* ============================================================
   GAMETRACKER — Biblioteca Page
   ============================================================ */
(function () {
  'use strict';

  var Utils      = window.GT.Utils;
  var Biblioteca = window.GT.Biblioteca;
  var Registro   = window.GT.Registro;
  var Toast      = window.GT.Toast;

  var GENRES_PRESET = ['Acción','Acción Aventura','Aventura','Aventura Gráfica','Carreras',
    'Estrategia','FPS','Gacha','Gestión','Hack and Slash','Indie','Metroidvania',
    'Plataformas','Puzzle','RPG','Roguelike/Roguelite','Sandbox','Shooter','Sigilo',
    'Simulación','Soulslike','Supervivencia','Terror'];

  var PLATFORMS = ['PC','PS5','PS4','PS3','Xbox Series X','Xbox One','Xbox 360',
    'Nintendo Switch 2','Nintendo Switch','PS2'];

  var state = { search:'', genero:'', plataforma:'', editId: null, detailId: null };
  var selectedGeneros    = [];
  var selectedPlataformas = [];
  var coverPreview = null;

  function safe(fn, name) {
    try { fn(); } catch(e) { console.warn('biblioteca.js ' + name + ':', e); }
  }

  /* ── RENDER GRID ────────────────────────────────────────── */
  function renderGrid() {
    var filters = {};
    if (state.genero)     filters.genero     = state.genero;
    if (state.plataforma) filters.plataforma = state.plataforma;
    var games = Biblioteca.search(state.search, filters);

    var grid    = document.getElementById('gameGrid');
    var empty   = document.getElementById('emptyState');
    var countEl = document.getElementById('libCount');

    countEl.textContent = games.length + ' juego' + (games.length !== 1 ? 's' : '') + ' en la biblioteca';

    if (!games.length) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    grid.innerHTML = games.map(function(game) {
      var notaMedia = Registro.getNotaMedia(game.id);
      var sc = Utils.scoreColor(notaMedia);
      var objPos = Utils.escapeHtml(game.portadaPos || 'center top');
      var coverContent = game.portadaUrl
        ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="' + Utils.escapeHtml(game.titulo) + '" loading="lazy" style="object-position:' + objPos + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<div class="game-card__ph" style="display:none"><span class="game-card__ph-letter">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</span><span class="game-card__ph-name">' + Utils.escapeHtml(game.titulo) + '</span></div>'
        : '<div class="game-card__ph"><span class="game-card__ph-letter">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</span><span class="game-card__ph-name">' + Utils.escapeHtml(game.titulo) + '</span></div>';

      var scoreHtml = notaMedia !== null
        ? '<div class="score-wrap"><div class="score-bar"><div class="score-bar__fill" style="width:' + Utils.scoreWidth(notaMedia) + ';background:' + sc + '"></div></div><span class="score-num" style="color:' + sc + '">' + Utils.formatScore(notaMedia) + '</span></div>'
        : '<div style="font-size:0.72rem;color:var(--txt3)">Sin nota</div>';

      var pendPor = game.pendientePor || (game.pendiente ? ['?'] : []);
      var pendBadge = pendPor.length ? pendPor.map(function(p){
        var cls = p==='David'?'badge-david':p==='Javi'?'badge-javi':p==='Mery'?'badge-mery':'';
        return '<span class="badge ' + cls + '" style="font-size:0.65rem">⏳ ' + Utils.escapeHtml(p) + '</span>';
      }).join('') : '';
      var tipoMap = { remake:'🔄 Remake', remaster:'✨ Remaster', relanzamiento:'📦 Relanzamiento' };
      var tipoBadge = game.tipoLanzamiento && tipoMap[game.tipoLanzamiento]
        ? '<span class="badge" style="background:rgba(168,85,247,.15);color:#a855f7;border:1px solid rgba(168,85,247,.3)">' + tipoMap[game.tipoLanzamiento] + '</span>'
        : '';

      return '<div class="game-card card card--glow fade-up" data-id="' + game.id + '">' +
        '<div class="game-card__cover">' + coverContent +
          '<div class="game-card__overlay">' +
            '<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();window.GT_Bib.openDetail(\'' + game.id + '\')">Ver</button>' +
            '<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();window.GT_Bib.openEdit(\'' + game.id + '\')">✏️</button>' +
          '</div>' +
        '</div>' +
        '<div class="game-card__body">' +
          '<div class="game-card__title">' + Utils.escapeHtml(game.titulo) + '</div>' +
          (game.desarrollador ? '<div class="game-card__dev">' + Utils.escapeHtml(game.desarrollador) + '</div>' : '') +
          '<div class="game-card__platforms">' + Utils.platformBadgesHtml(game.plataformas) + '</div>' +
          '<div class="game-card__genres">' + Utils.genreBadgesHtml(game.generos) + pendBadge + tipoBadge + '</div>' +
          '<div class="game-card__score-wrap">' + scoreHtml + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // Click to detail
    document.querySelectorAll('.game-card').forEach(function(card){
      card.addEventListener('click', function(){
        window.GT_Bib.openDetail(this.dataset.id);
      });
    });
  }

  /* ── FILTER CHIPS ────────────────────────────────────────── */
  function renderFilterChips() {
    var genres = Biblioteca.getAllGenres();
    var gc = document.getElementById('genreChips');
    gc.innerHTML = genres.map(function(g){
      return '<span class="badge badge-genre' + (state.genero===g?' active':'') + '" data-genre="' + Utils.escapeHtml(g) + '">' + Utils.escapeHtml(g) + '</span>';
    }).join('');
    gc.querySelectorAll('[data-genre]').forEach(function(el){
      el.addEventListener('click', function(){
        state.genero = state.genero === this.dataset.genre ? '' : this.dataset.genre;
        renderFilterChips();
        renderGrid();
      });
    });

    var plats = Biblioteca.getAllPlatforms();
    var pc = document.getElementById('platChips');
    pc.innerHTML = plats.map(function(p){
      return '<span class="badge badge-genre' + (state.plataforma===p?' active':'') + '" data-plat="' + Utils.escapeHtml(p) + '">' + Utils.escapeHtml(p) + '</span>';
    }).join('');
    pc.querySelectorAll('[data-plat]').forEach(function(el){
      el.addEventListener('click', function(){
        state.plataforma = state.plataforma === this.dataset.plat ? '' : this.dataset.plat;
        renderFilterChips();
        renderGrid();
      });
    });
  }

  /* ── MODAL FORM CHIPS ────────────────────────────────────── */
  function renderGeneroChips() {
    var container = document.getElementById('generoChips');
    var all = GENRES_PRESET.concat(
      selectedGeneros.filter(function(g){ return !GENRES_PRESET.includes(g); })
    );
    container.innerHTML = all.map(function(g){
      var active = selectedGeneros.includes(g);
      return '<span class="badge badge-genre' + (active?' active':'') + '" data-g="' + Utils.escapeHtml(g) + '">' + Utils.escapeHtml(g) + '</span>';
    }).join('');
    container.querySelectorAll('[data-g]').forEach(function(el){
      el.addEventListener('click', function(){
        var g = this.dataset.g;
        var idx = selectedGeneros.indexOf(g);
        if (idx === -1) selectedGeneros.push(g); else selectedGeneros.splice(idx, 1);
        renderGeneroChips();
      });
    });
  }

  function renderPlataformaChips() {
    var container = document.getElementById('plataformaChips');
    container.innerHTML = PLATFORMS.map(function(p){
      var active = selectedPlataformas.includes(p);
      return '<span class="badge badge-genre' + (active?' active':'') + '" data-p="' + Utils.escapeHtml(p) + '">' + Utils.escapeHtml(p) + '</span>';
    }).join('');
    container.querySelectorAll('[data-p]').forEach(function(el){
      el.addEventListener('click', function(){
        var p = this.dataset.p;
        var idx = selectedPlataformas.indexOf(p);
        if (idx === -1) selectedPlataformas.push(p); else selectedPlataformas.splice(idx, 1);
        renderPlataformaChips();
      });
    });
  }

  /* ── COVER PREVIEW & DRAG ───────────────────────────────── */
  function initCoverPreview() {
    var wrap     = document.getElementById('coverPreviewWrap');
    var img      = document.getElementById('coverPreviewImg');
    var ph       = document.getElementById('coverPreviewPh');
    var hint     = document.getElementById('coverDragHint');
    var posInput = document.getElementById('fPortadaPos');

    function applyPos(val) {
      posInput.value = val;
      img.style.objectPosition = val;
    }

    function showImg(url, pos) {
      if (url) {
        img.src = url;
        img.style.display = '';
        img.style.objectPosition = pos || 'center top';
        ph.style.display = 'none';
        hint.style.display = '';
      } else {
        img.src = '';
        img.style.display = 'none';
        ph.style.display = '';
        hint.style.display = 'none';
      }
    }

    // Preset buttons
    document.querySelectorAll('.cover-pos-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { applyPos(this.dataset.pos); });
    });

    // Sync when URL field changes
    document.getElementById('fPortada').addEventListener('input', function() {
      showImg(this.value.trim(), posInput.value || 'center top');
    });
    document.getElementById('fPortada').addEventListener('change', function() {
      showImg(this.value.trim(), posInput.value || 'center top');
    });

    // ── Drag to reposition ─────────────────────────────────
    var isDragging = false, startX, startY, startXPct, startYPct;

    function parsePos(val) {
      var parts = (val || 'center top').trim().split(/\s+/);
      function toNum(s, isY) {
        if (!s) return isY ? 0 : 50;
        s = s.toLowerCase();
        if (s === 'center') return 50;
        if (s === 'left' || s === 'top') return 0;
        if (s === 'right' || s === 'bottom') return 100;
        return parseFloat(s) || 50;
      }
      return { x: toNum(parts[0], false), y: toNum(parts[1], true) };
    }

    function getDragFactors() {
      if (!img.naturalWidth || !img.naturalHeight) return { x: 0.5, y: 0.5 };
      var rect = wrap.getBoundingClientRect();
      var scale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
      var scaledW = img.naturalWidth  * scale;
      var scaledH = img.naturalHeight * scale;
      // overflow = how many pixels the image extends beyond the container
      // 100% position change = moving by 'overflow' pixels → factor = 100/overflow
      var overflowX = Math.max(1, scaledW - rect.width);
      var overflowY = Math.max(1, scaledH - rect.height);
      return { x: 100 / overflowX, y: 100 / overflowY };
    }

    function startDrag(clientX, clientY) {
      if (img.style.display === 'none') return false;
      isDragging = true;
      startX = clientX; startY = clientY;
      var pct = parsePos(posInput.value);
      startXPct = pct.x; startYPct = pct.y;
      wrap.style.cursor = 'grabbing';
      return true;
    }

    function moveDrag(clientX, clientY) {
      if (!isDragging) return;
      var f  = getDragFactors();
      var dx = clientX - startX;
      var dy = clientY - startY;
      var newX = Math.round(Math.max(0, Math.min(100, startXPct - dx * f.x)));
      var newY = Math.round(Math.max(0, Math.min(100, startYPct - dy * f.y)));
      applyPos(newX + '% ' + newY + '%');
    }

    function endDrag() {
      if (isDragging) { isDragging = false; wrap.style.cursor = 'grab'; }
    }

    // Mouse events
    wrap.addEventListener('mousedown', function(e) {
      if (startDrag(e.clientX, e.clientY)) e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) { moveDrag(e.clientX, e.clientY); });
    document.addEventListener('mouseup', endDrag);

    // Touch events
    wrap.addEventListener('touchstart', function(e) {
      var t = e.touches[0]; startDrag(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      var t = e.touches[0]; moveDrag(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchend', endDrag);

    return {
      update: function(url, pos) {
        posInput.value = pos || '';
        showImg(url, pos || 'center top');
      }
    };
  }

  /* ── MODAL OPEN ─────────────────────────────────────────── */
  function openAdd() {
    state.editId = null;
    selectedGeneros    = [];
    selectedPlataformas = [];
    document.getElementById('modalTitle').textContent = 'Añadir Juego';
    document.getElementById('editId').value = '';
    document.getElementById('fTitulo').value = '';
    document.getElementById('fPortada').value = '';
    document.getElementById('fDesarrollador').value = '';
    document.getElementById('fFecha').value = '';
    document.getElementById('fDuracion').value = '';
    document.getElementById('fPendDavid').checked = false;
    document.getElementById('fPendJavi').checked  = false;
    document.getElementById('fPendMery').checked  = false;
    document.getElementById('fTipoLanzamiento').value = '';
    document.getElementById('fDescripcion').value = '';
    document.getElementById('btnDelete').style.display = 'none';
    if (coverPreview) coverPreview.update('', '');
    renderGeneroChips();
    renderPlataformaChips();
    document.getElementById('gameModal').classList.add('open');
    document.getElementById('fTitulo').focus();
  }

  function openEdit(id) {
    var game = Biblioteca.getById(id);
    if (!game) return;
    state.editId = id;
    selectedGeneros    = (game.generos || []).slice();
    selectedPlataformas = (game.plataformas || []).slice();
    document.getElementById('modalTitle').textContent = 'Editar Juego';
    document.getElementById('editId').value = id;
    document.getElementById('fTitulo').value = game.titulo || '';
    document.getElementById('fPortada').value = game.portadaUrl || '';
    document.getElementById('fDesarrollador').value = game.desarrollador || '';
    if (coverPreview) coverPreview.update(game.portadaUrl || '', game.portadaPos || '');
    document.getElementById('fFecha').value = game.fechaLanzamiento || '';
    document.getElementById('fDuracion').value = game.duracion || '';
    var pPor = game.pendientePor || (game.pendiente ? [] : []);
    document.getElementById('fPendDavid').checked = pPor.includes('David');
    document.getElementById('fPendJavi').checked  = pPor.includes('Javi');
    document.getElementById('fPendMery').checked  = pPor.includes('Mery');
    document.getElementById('fTipoLanzamiento').value = game.tipoLanzamiento || '';
    document.getElementById('fDescripcion').value = game.descripcion || '';
    document.getElementById('btnDelete').style.display = 'inline-flex';
    renderGeneroChips();
    renderPlataformaChips();
    document.getElementById('gameModal').classList.add('open');
    document.getElementById('detailModal').classList.remove('open');
  }

  function closeModal() {
    document.getElementById('gameModal').classList.remove('open');
  }

  /* ── DETAIL MODAL ───────────────────────────────────────── */
  function openDetail(id) {
    var game = Biblioteca.getById(id);
    if (!game) return;
    state.detailId = id;
    document.getElementById('detailTitle').textContent = game.titulo;

    var notaMedia = Registro.getNotaMedia(game.id);
    var entries   = Registro.filter({ juegoId: id });
    var sc = Utils.scoreColor(notaMedia);

    var html = '<div style="display:grid;grid-template-columns:140px 1fr;gap:1.5rem;align-items:start">' +
      '<div style="aspect-ratio:2/3;background:linear-gradient(135deg,#1a1a2e,#0f3460);border-radius:10px;overflow:hidden;position:relative">' +
        (game.portadaUrl
          ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" style="width:100%;height:100%;object-fit:cover;object-position:' + Utils.escapeHtml(game.portadaPos || 'center top') + '" onerror="this.style.display=\'none\'">'
          : '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:Orbitron,sans-serif;font-size:2.5rem;font-weight:900;color:rgba(79,172,254,0.4)">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</div>') +
      '</div>' +
      '<div>' +
        '<div style="margin-bottom:0.75rem">' + Utils.platformBadgesHtml(game.plataformas) + '</div>' +
        '<div style="margin-bottom:0.75rem">' + Utils.genreBadgesHtml(game.generos) + '</div>' +
        (game.desarrollador ? '<div style="font-size:0.85rem;color:var(--txt2);margin-bottom:0.5rem">🏢 ' + Utils.escapeHtml(game.desarrollador) + '</div>' : '') +
        (game.fechaLanzamiento ? '<div style="font-size:0.85rem;color:var(--txt2);margin-bottom:0.5rem">📅 ' + Utils.escapeHtml(game.fechaLanzamiento) + '</div>' : '') +
        (game.duracion ? '<div style="font-size:0.85rem;color:var(--txt2);margin-bottom:0.5rem">⏱ ~' + game.duracion + 'h</div>' : '') +
        (game.tipoLanzamiento ? '<div style="margin-bottom:0.5rem"><span style="background:rgba(168,85,247,.15);color:#a855f7;border:1px solid rgba(168,85,247,.3);padding:0.2rem 0.6rem;border-radius:6px;font-size:0.75rem;font-weight:600">' + ({remake:'🔄 Remake',remaster:'✨ Remaster',relanzamiento:'📦 Relanzamiento / Port'}[game.tipoLanzamiento]||'') + ' · No computa en rankings</span></div>' : '') +
        (notaMedia !== null
          ? '<div class="score-wrap" style="margin-top:1rem"><div class="score-bar"><div class="score-bar__fill" style="width:' + Utils.scoreWidth(notaMedia) + ';background:' + sc + '"></div></div><span class="score-num" style="color:' + sc + '">' + Utils.formatScore(notaMedia) + '</span></div>'
          : '<div style="color:var(--txt3);font-size:0.85rem;margin-top:1rem">Sin nota aún</div>') +
        (game.descripcion ? '<p style="margin-top:1rem;font-size:0.85rem;color:var(--txt2);line-height:1.6">' + Utils.escapeHtml(game.descripcion) + '</p>' : '') +
      '</div>' +
    '</div>';

    if (entries.length) {
      html += '<div style="margin-top:1.5rem"><h3 style="font-family:Rajdhani,sans-serif;font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--txt3);margin-bottom:0.75rem">Entradas en el Registro</h3>' +
        '<div style="display:flex;flex-direction:column;gap:0.4rem">' +
        entries.map(function(r){
          var rSc = Utils.scoreColor(r.nota);
          return '<div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.75rem;background:rgba(255,255,255,0.03);border-radius:8px;flex-wrap:wrap">' +
            '<span class="badge ' + Utils.playerBadge(r.jugador) + '">' + Utils.escapeHtml(r.jugador) + '</span>' +
            '<span style="font-size:0.8rem;color:var(--txt3)">' + Utils.monthName(r.mes) + ' ' + r.año + '</span>' +
            '<span class="badge ' + Utils.statusBadge(r.estado) + '">' + Utils.escapeHtml(r.estado) + '</span>' +
            (r.nota !== null && r.nota !== '' && r.nota !== undefined
              ? '<span style="font-family:Orbitron,sans-serif;font-size:0.8rem;font-weight:700;color:' + rSc + '">' + Utils.formatScore(r.nota) + '</span>'
              : '') +
            (r.horas ? '<span style="font-size:0.8rem;color:var(--txt3)">' + r.horas + 'h</span>' : '') +
          '</div>';
        }).join('') +
        '</div></div>';
    }

    document.getElementById('detailBody').innerHTML = html;
    document.getElementById('detailModal').classList.add('open');
    document.getElementById('detailEdit').onclick = function(){ openEdit(id); };
  }

  function closeDetail() {
    document.getElementById('detailModal').classList.remove('open');
  }

  /* ── SAVE ───────────────────────────────────────────────── */
  function saveGame() {
    var titulo = document.getElementById('fTitulo').value.trim();
    if (!titulo) { Toast.show('El título es obligatorio', 'error'); return; }

    var data = {
      titulo:           titulo,
      portadaUrl:       document.getElementById('fPortada').value.trim(),
      portadaPos:       document.getElementById('fPortadaPos').value.trim() || null,
      desarrollador:    document.getElementById('fDesarrollador').value.trim(),
      fechaLanzamiento: document.getElementById('fFecha').value.trim(),
      duracion:         parseFloat(document.getElementById('fDuracion').value) || null,
      pendientePor:     ['David','Javi','Mery'].filter(function(p){
                          return document.getElementById('fPend'+p).checked;
                        }),
      pendiente:        document.getElementById('fPendDavid').checked ||
                        document.getElementById('fPendJavi').checked  ||
                        document.getElementById('fPendMery').checked,
      tipoLanzamiento:  document.getElementById('fTipoLanzamiento').value,
      descripcion:      document.getElementById('fDescripcion').value.trim(),
      generos:          selectedGeneros.slice(),
      plataformas:      selectedPlataformas.slice()
    };

    if (state.editId) {
      Biblioteca.update(state.editId, data);
      Toast.show('Juego actualizado ✓');
    } else {
      Biblioteca.add(data);
      Toast.show('Juego añadido ✓');
    }

    closeModal();
    renderGrid();
    renderFilterChips();
  }

  function deleteGame() {
    if (!state.editId) return;
    var game = Biblioteca.getById(state.editId);
    if (!confirm('¿Eliminar "' + (game ? game.titulo : '') + '"? Esto también eliminará sus entradas de registro.')) return;
    Registro.filter({ juegoId: state.editId }).forEach(function(r){ Registro.remove(r.id); });
    Biblioteca.remove(state.editId);
    Toast.show('Juego eliminado');
    closeModal();
    renderGrid();
    renderFilterChips();
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    document.getElementById('navYear').textContent = new Date().getFullYear();

    coverPreview = initCoverPreview();

    // Search
    document.getElementById('searchInput').addEventListener('input', function(){
      state.search = this.value;
      renderGrid();
    });

    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', function(){
      state.search = ''; state.genero = ''; state.plataforma = '';
      document.getElementById('searchInput').value = '';
      renderFilterChips();
      renderGrid();
    });

    // Add buttons
    document.getElementById('btnAddGame').addEventListener('click', openAdd);
    document.getElementById('fabAdd').addEventListener('click', openAdd);

    // Modal controls
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('btnCancel').addEventListener('click', closeModal);
    document.getElementById('btnSave').addEventListener('click', saveGame);
    document.getElementById('btnDelete').addEventListener('click', deleteGame);
    document.getElementById('detailClose').addEventListener('click', closeDetail);

    // Close on backdrop
    document.getElementById('gameModal').addEventListener('click', function(e){ if(e.target===this) closeModal(); });
    document.getElementById('detailModal').addEventListener('click', function(e){ if(e.target===this) closeDetail(); });

    // Custom genre input
    document.getElementById('fGeneroCustom').addEventListener('keydown', function(e){
      if (e.key === 'Enter') {
        e.preventDefault();
        var val = this.value.trim();
        if (val && !selectedGeneros.includes(val)) {
          selectedGeneros.push(val);
          renderGeneroChips();
        }
        this.value = '';
      }
    });

    renderFilterChips();
    renderGrid();
  }

  // Expose for inline onclick
  window.GT_Bib = { openDetail: openDetail, openEdit: openEdit };

  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      safe(init, 'init');
      window.GT.onDataChange(function () {
        safe(renderGrid,        'renderGrid');
        safe(renderFilterChips, 'renderFilterChips');
      });
    });
  });
})();
