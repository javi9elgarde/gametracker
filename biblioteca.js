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

  var state = { search:'', genero:'', plataforma:'', año:'', editId: null, detailId: null };
  var selectedGeneros    = [];
  var selectedPlataformas = [];
  var coverPreview = null;
  var _alphaObserver = null;
  var _activeAlpha   = '';

  var ALL_ALPHA = ['#','A','B','C','D','E','F','G','H','I','J','K','L','M',
                   'N','Ñ','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

  /* ── RAWG API ───────────────────────────────────────────── */
  var RAWG_KEY = 'c8cd3af7977b43b287e0a19389902880';
  var RAWG_BTN_INNER = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="9" cy="9" r="6"/><path d="m16 16-3.5-3.5"/></svg> Buscar en RAWG';

  function searchRawg() {
    var titulo = document.getElementById('fTitulo').value.trim();
    if (!titulo) { Toast.show('Escribe el título del juego primero', 'error'); return; }
    var btn       = document.getElementById('btnRawgSearch');
    var resultsEl = document.getElementById('rawgResults');
    btn.disabled     = true;
    btn.innerHTML    = '⏳ Buscando...';
    resultsEl.style.display = 'none';
    fetch('https://api.rawg.io/api/games?key=' + RAWG_KEY +
          '&search=' + encodeURIComponent(titulo) +
          '&page_size=8&ordering=-rating')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        btn.disabled  = false;
        btn.innerHTML = RAWG_BTN_INNER;
        var games = (data.results || []).filter(function(g) { return g.background_image; });
        if (!games.length) {
          Toast.show('Sin resultados con portada en RAWG', 'error');
          return;
        }
        resultsEl.innerHTML = '<div class="rawg-grid">' +
          games.map(function(g) {
            var year    = g.released ? g.released.slice(0, 4) : '';
            var safeUrl = (g.background_image || '').replace(/'/g, '%27');
            return '<div class="rawg-result" onclick="window.GT_Bib.pickRawgCover(\'' + safeUrl + '\')">' +
              '<div class="rawg-result__img"><img src="' + Utils.escapeHtml(g.background_image) + '" loading="lazy" alt=""></div>' +
              '<div class="rawg-result__name">' + Utils.escapeHtml(g.name) + '</div>' +
              (year ? '<div class="rawg-result__year">' + year + '</div>' : '') +
            '</div>';
          }).join('') +
        '</div>';
        resultsEl.style.display = '';
      })
      .catch(function() {
        btn.disabled  = false;
        btn.innerHTML = RAWG_BTN_INNER;
        Toast.show('Error al conectar con RAWG', 'error');
      });
  }

  function pickRawgCover(url) {
    document.getElementById('fPortada').value = url;
    document.getElementById('rawgResults').style.display = 'none';
    if (coverPreview) coverPreview.update(url, document.getElementById('fPortadaPos').value || 'center top');
    Toast.show('Portada aplicada ✓');
  }

  function safe(fn, name) {
    try { fn(); } catch(e) { console.warn('biblioteca.js ' + name + ':', e); }
  }

  /* ── RENDER CARD ────────────────────────────────────────── */
  function renderCard(game) {
    var notaMedia = Registro.getNotaMedia(game.id);
    var sc = Utils.scoreColor(notaMedia);
    var objPos = Utils.escapeHtml(game.portadaPos || 'center top');

    var coverContent = game.portadaUrl
      ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="" loading="lazy" style="object-position:' + objPos + '" onerror="this.style.display=\'none\';this.parentElement.querySelector(\'.game-card__ph\').style.display=\'flex\'">' +
        '<div class="game-card__ph" style="display:none"><span class="game-card__ph-letter">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</span></div>'
      : '<div class="game-card__ph"><span class="game-card__ph-letter">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</span></div>';

    var pendPor = game.pendientePor || (game.pendiente ? ['?'] : []);
    var pendDots = pendPor.length
      ? '<div class="game-card__pend-dot">' + pendPor.map(function(p) {
          var color = p === 'David' ? 'var(--player-david)' : p === 'Javi' ? 'var(--player-javi)' : p === 'Mery' ? 'var(--player-mery)' : '#888';
          return '<span style="background:' + color + '" title="⏳ ' + Utils.escapeHtml(p) + '"></span>';
        }).join('') + '</div>'
      : '';

    var durStr = game.duracion ? '⏱ ~' + game.duracion + 'h' : '';

    return '<div class="game-card" data-id="' + game.id + '">' +
      '<div class="game-card__cover">' +
        coverContent + pendDots +
        '<div class="game-card__overlay">' +
          '<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();window.GT_Bib.openDetail(\'' + game.id + '\')">👁 Ver</button>' +
          '<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();window.GT_Bib.openEdit(\'' + game.id + '\')">✏️ Editar</button>' +
        '</div>' +
      '</div>' +
      '<div class="game-card__body">' +
        '<div class="game-card__title">' + Utils.escapeHtml(game.titulo) + '</div>' +
        (game.desarrollador ? '<div class="game-card__dev">' + Utils.escapeHtml(game.desarrollador) + '</div>' : '') +
        '<div class="game-card__meta">' +
          (durStr ? '<span class="game-card__dur">' + durStr + '</span>' : '<span></span>') +
          (notaMedia !== null ? '<span class="game-card__score-inline" style="color:' + sc + '">' + Utils.formatScore(notaMedia) + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── RENDER GRID ────────────────────────────────────────── */
  function renderGrid() {
    var filters = {};
    if (state.genero)     filters.genero     = state.genero;
    if (state.plataforma) filters.plataforma = state.plataforma;
    if (state.año)        filters.año        = state.año;
    var games = Biblioteca.search(state.search, filters);

    var grid    = document.getElementById('gameGrid');
    var empty   = document.getElementById('emptyState');
    var countEl = document.getElementById('libCount');

    countEl.textContent = games.length + ' juego' + (games.length !== 1 ? 's' : '') + ' en la biblioteca';

    if (!games.length) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      updateAlphaAvailable([]);
      return;
    }
    empty.classList.add('hidden');

    // Sort alphabetically
    games.sort(function(a, b) {
      return a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' });
    });

    // Group by first letter (numbers → '#')
    var groups = {}, letters = [];
    games.forEach(function(game) {
      var ch = game.titulo.trim().charAt(0).toUpperCase();
      var letter = /^[A-ZÁÉÍÓÚÑÜ]/.test(ch) ? ch : '#';
      if (!groups[letter]) { groups[letter] = []; letters.push(letter); }
      groups[letter].push(game);
    });
    // '#' always last
    var sortedLetters = letters.filter(function(l) { return l !== '#'; }).sort(function(a, b) {
      return a.localeCompare(b, 'es');
    });
    if (groups['#']) sortedLetters.push('#');

    updateAlphaAvailable(sortedLetters);

    var html = '';
    sortedLetters.forEach(function(letter) {
      html += '<div class="letter-header" data-letter="' + letter + '">' + letter + '</div>';
      groups[letter].forEach(function(game) { html += renderCard(game); });
    });
    grid.innerHTML = html;

    // Re-observe letter headers for scroll tracking
    if (_alphaObserver) {
      grid.querySelectorAll('.letter-header[data-letter]').forEach(function(el) {
        _alphaObserver.observe(el);
      });
    }

    // Staggered appear animation
    requestAnimationFrame(function() {
      grid.querySelectorAll('.game-card').forEach(function(card, i) {
        card.style.animationDelay = Math.min(i * 0.025, 0.5) + 's';
        card.classList.add('card-appear');
      });
    });

    // Click → detail
    grid.querySelectorAll('.game-card').forEach(function(card) {
      card.addEventListener('click', function() {
        window.GT_Bib.openDetail(this.dataset.id);
      });
    });
  }

  /* ── FILTER DROPDOWNS ───────────────────────────────────── */
  function getAllYears() {
    var set = {};
    Biblioteca.getAll().forEach(function(g) {
      if (g.fechaLanzamiento) {
        var y = g.fechaLanzamiento.slice(0, 4);
        if (/^\d{4}$/.test(y)) set[y] = true;
      }
    });
    return Object.keys(set).sort(function(a, b) { return parseInt(b) - parseInt(a); });
  }

  function renderFilterDropdowns() {
    var genres = Biblioteca.getAllGenres();
    var genreSel = document.getElementById('genreFilter');
    var prevG = genreSel.value;
    genreSel.innerHTML = '<option value="">🎮 Géneros</option>' +
      genres.map(function(g) {
        return '<option value="' + Utils.escapeHtml(g) + '"' + (g === state.genero ? ' selected' : '') + '>' + Utils.escapeHtml(g) + '</option>';
      }).join('');
    if (!genres.includes(state.genero)) state.genero = '';

    var plats = Biblioteca.getAllPlatforms();
    var platSel = document.getElementById('platFilter');
    platSel.innerHTML = '<option value="">🖥 Plataformas</option>' +
      plats.map(function(p) {
        return '<option value="' + Utils.escapeHtml(p) + '"' + (p === state.plataforma ? ' selected' : '') + '>' + Utils.escapeHtml(p) + '</option>';
      }).join('');

    var years = getAllYears();
    var yearSel = document.getElementById('yearFilter');
    yearSel.innerHTML = '<option value="">📅 Año</option>' +
      years.map(function(y) {
        return '<option value="' + y + '"' + (y === state.año ? ' selected' : '') + '>' + y + '</option>';
      }).join('');
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

  /* ── ALPHA BAR (horizontal) ─────────────────────────────── */
  function initAlphaBar() {
    var bar = document.getElementById('alphaBar');
    if (!bar) return;

    bar.innerHTML = ALL_ALPHA.map(function(l) {
      return '<span class="alpha-bar__letter is-disabled" data-letter="' + l + '">' + l + '</span>';
    }).join('');

    var isDragging = false;

    function getLetterAt(clientX) {
      var items = bar.querySelectorAll('.alpha-bar__letter:not(.is-disabled)');
      var best = null, bestDist = Infinity;
      items.forEach(function(el) {
        var rect = el.getBoundingClientRect();
        var dist = Math.abs(clientX - (rect.left + rect.width / 2));
        if (dist < bestDist) { bestDist = dist; best = el; }
      });
      return best ? best.dataset.letter : null;
    }

    function applyLens(focusLetter) {
      var items = Array.from(bar.querySelectorAll('.alpha-bar__letter:not(.is-disabled)'));
      var fi = items.findIndex(function(el) { return el.dataset.letter === focusLetter; });
      items.forEach(function(el, i) {
        var d = fi >= 0 ? Math.abs(i - fi) : 99;
        var s, op;
        if      (d === 0) { s = 1.7;  op = 1;    el.style.color = 'var(--accent)'; el.style.fontWeight = '900'; }
        else if (d === 1) { s = 1.25; op = 0.78; el.style.color = ''; el.style.fontWeight = ''; }
        else if (d === 2) { s = 1.0;  op = 0.55; el.style.color = ''; el.style.fontWeight = ''; }
        else              { s = 0.85; op = 0.28; el.style.color = ''; el.style.fontWeight = ''; }
        el.style.transform = 'scaleY(' + s + ')';
        el.style.opacity   = op;
      });
    }

    function clearLens() {
      bar.querySelectorAll('.alpha-bar__letter:not(.is-disabled)').forEach(function(el) {
        el.style.transform  = '';
        el.style.opacity    = '';
        el.style.color      = el.classList.contains('is-active') ? 'var(--accent)' : '';
        el.style.fontWeight = el.classList.contains('is-active') ? '900' : '';
      });
    }

    function setActive(letter) {
      if (!letter || letter === _activeAlpha) return;
      _activeAlpha = letter;
      bar.querySelectorAll('.alpha-bar__letter').forEach(function(el) {
        el.classList.toggle('is-active', el.dataset.letter === letter);
      });
    }

    function goTo(letter) {
      var header = document.querySelector('.letter-header[data-letter="' + letter + '"]');
      if (header) header.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    bar.addEventListener('mousedown', function(e) {
      isDragging = true;
      var l = getLetterAt(e.clientX);
      if (l) { applyLens(l); goTo(l); }
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var l = getLetterAt(e.clientX);
      if (l) applyLens(l);
    });
    document.addEventListener('mouseup', function() {
      if (isDragging) { isDragging = false; clearLens(); }
    });
    bar.addEventListener('mouseover', function(e) {
      if (isDragging) return;
      var l = e.target && e.target.dataset && e.target.dataset.letter;
      if (l && !e.target.classList.contains('is-disabled')) applyLens(l);
    });
    bar.addEventListener('mouseleave', function() {
      if (!isDragging) clearLens();
    });
    bar.addEventListener('click', function(e) {
      var l = e.target && e.target.dataset && e.target.dataset.letter;
      if (l && !e.target.classList.contains('is-disabled')) goTo(l);
    });
    bar.addEventListener('touchstart', function(e) {
      var l = getLetterAt(e.touches[0].clientX);
      if (l) { applyLens(l); goTo(l); }
    }, { passive: true });
    bar.addEventListener('touchmove', function(e) {
      var l = getLetterAt(e.touches[0].clientX);
      if (l) { applyLens(l); goTo(l); }
    }, { passive: true });
    bar.addEventListener('touchend', function() { clearLens(); }, { passive: true });

    _alphaObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) setActive(entry.target.dataset.letter);
      });
    }, { rootMargin: '-8% 0px -82% 0px', threshold: 0 });
  }

  function updateAlphaAvailable(letters) {
    var bar = document.getElementById('alphaBar');
    if (!bar) return;
    bar.querySelectorAll('.alpha-bar__letter').forEach(function(el) {
      var has = letters.indexOf(el.dataset.letter) >= 0;
      el.classList.toggle('is-disabled', !has);
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

  /* ── DEV AUTOCOMPLETE ───────────────────────────────────── */
  function populateDevSuggestions() {
    var seen = {}, devs = [];
    Biblioteca.getAll().forEach(function(g) {
      if (g.desarrollador && !seen[g.desarrollador]) {
        seen[g.desarrollador] = true;
        devs.push(g.desarrollador);
      }
    });
    devs.sort(function(a, b) { return a.localeCompare(b, 'es'); });
    var dl = document.getElementById('devSuggestions');
    if (dl) dl.innerHTML = devs.map(function(d) {
      return '<option value="' + Utils.escapeHtml(d) + '">';
    }).join('');
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
    populateDevSuggestions();
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
    populateDevSuggestions();
    renderGeneroChips();
    renderPlataformaChips();
    document.getElementById('gameModal').classList.add('open');
    document.getElementById('detailModal').classList.remove('open');
  }

  function closeModal() {
    document.getElementById('gameModal').classList.remove('open');
  }

  /* ── SONIDO DE APERTURA DE FICHA ──────────────────────────── */
  function playDetailSound() {
    try {
      var ac  = new (window.AudioContext || window.webkitAudioContext)();
      var now = ac.currentTime;
      // Tres tonos suaves ascendentes — "card reveal"
      [[330, 0, 'sine'], [440, 0.07, 'sine'], [550, 0.13, 'triangle']].forEach(function (note) {
        var osc = ac.createOscillator();
        var g   = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = note[2]; osc.frequency.value = note[0];
        var t = now + note[1];
        g.gain.setValueAtTime(0.045, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.start(t); osc.stop(t + 0.3);
      });
    } catch (e) {}
  }

  /* ── HELPER: formatear fecha ──────────────────────────────── */
  function fmtDate(d) {
    if (!d) return '';
    var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    var p = d.split('-');
    if (p.length < 2) return d;
    var day = parseInt(p[2], 10);
    var mon = months[parseInt(p[1], 10) - 1] || '';
    return (day ? day + ' ' + mon + ' ' : mon + ' ') + p[0];
  }

  /* ── DETAIL MODAL ───────────────────────────────────────── */
  function openDetail(id) {
    var game = Biblioteca.getById(id);
    if (!game) return;
    state.detailId = id;

    playDetailSound();

    document.getElementById('detailTitle').textContent = game.titulo;

    var notaMedia = Registro.getNotaMedia(game.id);
    var entries   = Registro.filter({ juegoId: id });
    var sc        = Utils.scoreColor(notaMedia);

    /* ── Portada 16:9 + badge nota ─────────────────────────── */
    var coverInner = game.portadaUrl
      ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" style="object-position:' + Utils.escapeHtml(game.portadaPos || 'center top') + '" onerror="this.style.display=\'none\'">'
      : '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:Orbitron,sans-serif;font-size:3rem;font-weight:900;color:rgba(79,172,254,0.35)">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</div>';

    var scGlow = notaMedia !== null ? sc.replace('hsl(', 'hsla(').replace(')', ',0.35)') : 'transparent';

    var scoreBadge = notaMedia !== null
      ? '<div class="detail-score-badge" style="--sc:' + sc + ';--sc-glow:' + scGlow + '">' +
          '<div class="detail-score-badge__val">' + Utils.formatScore(notaMedia) + '</div>' +
          '<div class="detail-score-badge__lbl">NOTA MEDIA</div>' +
        '</div>'
      : '<div class="detail-score-badge detail-score-badge--empty">' +
          '<div class="detail-score-badge__val">SIN NOTA</div>' +
        '</div>';

    /* ── Stats ─────────────────────────────────────────────── */
    var stats = '';
    if (game.desarrollador)    stats += '<div class="detail-stat"><span class="detail-stat__icon">🏢</span><span>' + Utils.escapeHtml(game.desarrollador) + '</span></div>';
    if (game.fechaLanzamiento) stats += '<div class="detail-stat"><span class="detail-stat__icon">📅</span><span>' + fmtDate(game.fechaLanzamiento) + '</span></div>';
    if (game.duracion)         stats += '<div class="detail-stat"><span class="detail-stat__icon">⏱</span><span>~' + game.duracion + ' horas</span></div>';

    /* ── Tipo lanzamiento ──────────────────────────────────── */
    var tipoMap = { remake:'🔄 Remake', remaster:'✨ Remaster', relanzamiento:'📦 Relanzamiento / Port' };
    var tipoHtml = game.tipoLanzamiento
      ? '<div class="detail-tipo">' + (tipoMap[game.tipoLanzamiento] || '') + ' <span style="opacity:0.6">· no computa en rankings</span></div>'
      : '';

    /* ── HTML final ────────────────────────────────────────── */
    var html =
      '<div class="detail-cover">' +
        '<div class="detail-cover__wrap">' + coverInner + '</div>' +
        scoreBadge +
      '</div>' +

      '<div class="detail-info">' +
        '<div class="detail-badges-row">' +
          Utils.platformBadgesHtml(game.plataformas) +
          Utils.genreBadgesHtml(game.generos) +
        '</div>' +
        (stats ? '<div class="detail-stats-grid">' + stats + '</div>' : '') +
        tipoHtml +
        (game.descripcion ? '<p class="detail-desc">' + Utils.escapeHtml(game.descripcion) + '</p>' : '') +
      '</div>';

    /* ── Entradas del registro ─────────────────────────────── */
    if (entries.length) {
      html += '<div class="detail-entries-hdr">Entradas en el Registro</div>' +
        entries.map(function (r) {
          var rSc = Utils.scoreColor(r.nota);
          return '<div class="detail-entry">' +
            '<span class="badge ' + Utils.playerBadge(r.jugador) + '">' + Utils.escapeHtml(r.jugador) + '</span>' +
            '<span style="font-size:0.78rem;color:var(--txt3)">' + Utils.monthName(r.mes) + ' ' + r.año + '</span>' +
            '<span class="badge ' + Utils.statusBadge(r.estado) + '">' + Utils.escapeHtml(r.estado) + '</span>' +
            (r.nota !== null && r.nota !== '' && r.nota !== undefined
              ? '<span class="detail-entry__score" style="color:' + rSc + '">' + Utils.formatScore(r.nota) + '</span>'
              : '') +
            (r.horas ? '<span class="detail-entry__hours">' + r.horas + 'h</span>' : '') +
          '</div>';
        }).join('');
    }

    document.getElementById('detailBody').innerHTML = html;
    document.getElementById('detailModal').classList.add('open');
    document.getElementById('detailEdit').onclick = function () { openEdit(id); };
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

    safe(initAlphaBar, 'initAlphaBar');
    coverPreview = initCoverPreview();

    // Search
    document.getElementById('searchInput').addEventListener('input', function(){
      state.search = this.value;
      renderGrid();
    });

    // Filter dropdowns
    document.getElementById('genreFilter').addEventListener('change', function() {
      state.genero = this.value; renderGrid();
    });
    document.getElementById('platFilter').addEventListener('change', function() {
      state.plataforma = this.value; renderGrid();
    });
    document.getElementById('yearFilter').addEventListener('change', function() {
      state.año = this.value; renderGrid();
    });

    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', function(){
      state.search = ''; state.genero = ''; state.plataforma = ''; state.año = '';
      document.getElementById('searchInput').value = '';
      document.getElementById('genreFilter').value = '';
      document.getElementById('platFilter').value = '';
      document.getElementById('yearFilter').value = '';
      renderGrid();
    });

    // RAWG search
    document.getElementById('btnRawgSearch').addEventListener('click', searchRawg);

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

    renderFilterDropdowns();
    renderGrid();

    // Handle ?open=gameId (cross-page navigation)
    try {
      var params = new URLSearchParams(window.location.search);
      var openId = params.get('open');
      if (openId) {
        history.replaceState(null, '', window.location.pathname);
        setTimeout(function() {
          var card = document.querySelector('.game-card[data-id="' + openId + '"]');
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          openDetail(openId);
        }, 180);
      }
    } catch(e) {}
  }

  // Expose for inline onclick
  window.GT_Bib = { openDetail: openDetail, openEdit: openEdit, pickRawgCover: pickRawgCover };

  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      safe(init, 'init');
      window.GT.onDataChange(function () {
        safe(renderGrid,             'renderGrid');
        safe(renderFilterDropdowns, 'renderFilterDropdowns');
      });
    });
  });
})();
