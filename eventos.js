/* ============================================================
   EVENTOS — Bingo Interactivo de Conferencias Gaming
   Version: 20260525h
   ============================================================ */
(function () {
  'use strict';

  /* ── EVENTOS POR DEFECTO (semilla inicial de Firestore) ────── */
  var DEFAULT_EVENTS = [
    {
      id         : 'state-of-play-jun-2026',
      nombre     : 'State of Play',
      tag        : '🎮 PlayStation Showcase',
      isoDate    : '2026-06-02T23:00:00+02:00',
      fechaLabel : 'Martes, 2 de junio de 2026',
      hora       : '23:00 h · hora peninsular España',
      donde      : 'YouTube · Twitch · PlayStation.com',
      duracion   : 'Más de 1 hora',
      desc       : 'Presentación digital de PlayStation con los próximos juegos de PS5. Incluye un vistazo extendido a <strong style="color:var(--txt)">Marvel\'s Wolverine</strong> de Insomniac Games (lanzamiento 15 de septiembre de 2026) y anuncios de PlayStation Studios.',
      img        : 'https://blog.es.playstation.com/tachyon/sites/14/2026/05/4d07649023989d3599bc6d90588574e4487eaf50.jpg',
      link       : 'https://www.youtube.com/@PlayStation',
      linkLabel  : '🔴 Ver en directo — YouTube PlayStation',
      brand      : 'PLAYSTATION',
      accentColor: '#0070f3',
      order      : 0
    },
    {
      id         : 'summer-game-fest-jun-2026',
      nombre     : 'Summer Game Fest',
      tag        : '🎪 Gaming Showcase',
      isoDate    : '2026-06-05T23:00:00+02:00',
      fechaLabel : 'Viernes, 5 de junio de 2026',
      hora       : '23:00 h · hora peninsular España',
      donde      : 'YouTube · Twitch · summergamefest.com',
      duracion   : 'Aproximadamente 2 horas',
      desc       : 'El mayor evento de verano del gaming independiente. Geoff Keighley en el <strong style="color:var(--txt)">Dolby Theater de Los Ángeles</strong> con los anuncios AAA más importantes de la temporada. Incluye Day of the Devs al terminar.',
      img        : '',
      link       : 'https://www.youtube.com/@summergamefest',
      linkLabel  : '▶ Ver en directo — YouTube SGF',
      brand      : 'SUMMER GAME FEST',
      accentColor: '#f5c842',
      order      : 1
    },
    {
      id         : 'day-of-the-devs-2026',
      nombre     : 'Day of the Devs',
      tag        : '🕹️ Indie Showcase',
      isoDate    : '2026-06-06T01:00:00+02:00',
      fechaLabel : 'Sábado, 6 de junio de 2026 (madrugada)',
      hora       : '01:00 h · inmediatamente tras el SGF',
      donde      : 'YouTube · Twitch',
      duracion   : 'Aproximadamente 1 hora',
      desc       : 'El evento indie por excelencia, emitido justo al terminar el Summer Game Fest. Presenta los proyectos más creativos y originales del desarrollo independiente global.',
      img        : '',
      link       : 'https://www.youtube.com/@summergamefest',
      linkLabel  : '▶ Ver en directo — YouTube SGF',
      brand      : 'DAY OF THE DEVS',
      accentColor: '#a855f7',
      order      : 2
    },
    {
      id         : 'future-games-show-2026',
      nombre     : 'Future Games Show',
      tag        : '🖥️ PC & Consolas',
      isoDate    : '2026-06-06T21:00:00+02:00',
      fechaLabel : 'Sábado, 6 de junio de 2026',
      hora       : '21:00 h · hora peninsular España',
      donde      : 'YouTube · Twitch',
      duracion   : 'Aproximadamente 2 horas',
      desc       : 'Organizado por PC Gamer, el Future Games Show Summer Showcase presenta más de <strong style="color:var(--txt)">50 títulos</strong> entre juegos AAA, AA e independientes para PC y consolas.',
      img        : '',
      link       : 'https://www.youtube.com/@PCGamer',
      linkLabel  : '▶ Ver en directo — YouTube PC Gamer',
      brand      : 'FUTURE GAMES SHOW',
      accentColor: '#ef4444',
      order      : 3
    },
    {
      id         : 'n3-2026',
      nombre     : 'Ñ3',
      tag        : '🇪🇸 Indie España & LATAM',
      isoDate    : '2026-06-07T17:30:00+02:00',
      fechaLabel : 'Domingo, 7 de junio de 2026',
      hora       : '17:30 h · hora peninsular España',
      donde      : 'YouTube · Twitch',
      duracion   : 'Aproximadamente 45 minutos',
      desc       : 'El evento digital dedicado a los <strong style="color:var(--txt)">videojuegos independientes creados en España y América Latina</strong>. Una ventana a los estudios indie hispanohablantes más talentosos.',
      img        : '',
      link       : 'https://www.youtube.com',
      linkLabel  : '▶ Ver en directo — YouTube',
      brand      : 'Ñ3',
      accentColor: '#fb923c',
      order      : 4
    },
    {
      id         : 'xbox-games-showcase-2026',
      nombre     : 'Xbox Games Showcase',
      tag        : '🎮 Xbox & Bethesda',
      isoDate    : '2026-06-07T19:00:00+02:00',
      fechaLabel : 'Domingo, 7 de junio de 2026',
      hora       : '19:00 h · hora peninsular España',
      donde      : 'YouTube · Twitch · Xbox.com',
      duracion   : 'Aprox. 1 hora + Gears of War Direct',
      desc       : 'Presentación de novedades de <strong style="color:var(--txt)">Xbox Game Studios, Bethesda Softworks y Activision Blizzard</strong>. Seguido del Gears of War: E-Day Direct con todo el detalle del esperado regreso de la saga.',
      img        : '',
      link       : 'https://www.youtube.com/@Xbox',
      linkLabel  : '▶ Ver en directo — YouTube Xbox',
      brand      : 'XBOX',
      accentColor: '#4ade80',
      order      : 5
    },
    {
      id         : 'pc-gaming-show-2026',
      nombre     : 'PC Gaming Show',
      tag        : '🖱️ PC Gaming',
      isoDate    : '2026-06-07T21:00:00+02:00',
      fechaLabel : 'Domingo, 7 de junio de 2026',
      hora       : '21:00 h · hora peninsular España',
      donde      : 'YouTube · Twitch · Steam',
      duracion   : 'Aproximadamente 2 horas',
      desc       : 'El showcase definitivo para los jugadores de PC. Más de <strong style="color:var(--txt)">50 títulos</strong> presentados entre anuncios exclusivos, actualizaciones de juegos en desarrollo y sorpresas del ecosistema PC.',
      img        : '',
      link       : 'https://www.youtube.com/@PCGamingShow',
      linkLabel  : '▶ Ver en directo — YouTube PC Gaming Show',
      brand      : 'PC GAMING SHOW',
      accentColor: '#00d4ff',
      order      : 6
    }
  ];

  var ARCHIVE_DAYS = 7;

  /* ── ESTADO ─────────────────────────────────────────────────── */
  var db             = null;
  var _events        = [];          /* cargados desde Firestore */
  var _cards         = [];
  var _activeCardId  = null;
  var _player        = 'Javi';
  var _unsubCard     = null;
  var _editingCardId = null;
  var _prevWinCount  = 0;
  var _currentEvtIdx = 0;
  var _cdInterval    = null;
  var _seeded        = false;
  var _editingEvtId  = null;

  /* Líneas ganadoras */
  var LINES = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20]
  ];

  /* ── HELPERS DE COLOR ───────────────────────────────────────── */
  function hexToRgba(hex, alpha) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substring(0,2),16);
    var g = parseInt(hex.substring(2,4),16);
    var b = parseInt(hex.substring(4,6),16);
    return 'rgba('+r+','+g+','+b+','+alpha+')';
  }

  function darkenHex(hex, amount) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = Math.max(0, parseInt(hex.substring(0,2),16) - amount);
    var g = Math.max(0, parseInt(hex.substring(2,4),16) - amount);
    var b = Math.max(0, parseInt(hex.substring(4,6),16) - amount);
    return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
  }

  /* ── HELPERS EVENTOS ────────────────────────────────────────── */
  function isHistoric(ev) {
    return Date.now() > new Date(ev.isoDate).getTime() + ARCHIVE_DAYS * 86400000;
  }

  function getCardsForEvent(idx) {
    var ev = _events[idx];
    if (!ev) return [];
    return _cards.filter(function (c) {
      return c.eventoId === ev.id || (!c.eventoId && idx === 0);
    });
  }

  /* ── INIT ───────────────────────────────────────────────────── */
  function init() {
    waitForDb(function (firedb) {
      db = firedb;
      loadEvents();
    });

    document.getElementById('evtPrev').addEventListener('click', function () { goToEvent(_currentEvtIdx - 1); });
    document.getElementById('evtNext').addEventListener('click', function () { goToEvent(_currentEvtIdx + 1); });

    document.getElementById('btnNewBingo').addEventListener('click', openNewCardModal);
    document.getElementById('bingoModalSave').addEventListener('click', saveCardModal);
    document.getElementById('bingoModalCancel').addEventListener('click', closeCardModal);
    document.getElementById('bingoModalDelete').addEventListener('click', deleteCard);
    document.getElementById('bingoModalOverlay').addEventListener('click', function (e) {
      if (e.target === this) closeCardModal();
    });

    /* Modal editar evento */
    document.getElementById('evtEditSave').addEventListener('click', saveEditEventModal);
    document.getElementById('evtEditCancel').addEventListener('click', closeEditEventModal);
    document.getElementById('evtEditOverlay').addEventListener('click', function (e) {
      if (e.target === this) closeEditEventModal();
    });

    document.querySelectorAll('input[name="bingoPlayer"]').forEach(function (r) {
      r.addEventListener('change', function () { _player = this.value; });
    });
  }

  function waitForDb(cb) {
    if (window.GT && window.GT.db) return cb(window.GT.db);
    setTimeout(function () { waitForDb(cb); }, 60);
  }

  /* ── CARGAR EVENTOS DESDE FIRESTORE ────────────────────────── */
  function loadEvents() {
    db.collection('events').orderBy('order')
      .onSnapshot(function (snap) {
        if (snap.empty && !_seeded) {
          _seeded = true;
          seedEvents();
          return;
        }
        _events = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });

        /* Índice inicial: primer evento no archivado */
        var firstActive = _events.length - 1;
        for (var i = 0; i < _events.length; i++) {
          if (!isHistoric(_events[i])) { firstActive = i; break; }
        }
        /* Solo reposicionar si es la primera carga o el índice es inválido */
        if (_currentEvtIdx >= _events.length) _currentEvtIdx = firstActive;

        renderFeaturedEvent(_currentEvtIdx);
        renderCarouselDots();
        updateCarouselNav();

        /* Cargar bingos solo una vez que tengamos los eventos */
        if (!db._bingoLoaded) {
          db._bingoLoaded = true;
          loadCards();
        } else {
          renderBingoSection();
          renderHistorico();
        }
      });
  }

  function seedEvents() {
    var batch = db.batch();
    DEFAULT_EVENTS.forEach(function (ev) {
      var ref = db.collection('events').doc(ev.id);
      batch.set(ref, ev);
    });
    batch.commit();
  }

  /* ── CARRUSEL ───────────────────────────────────────────────── */
  function goToEvent(idx) {
    if (idx < 0 || idx >= _events.length) return;
    _currentEvtIdx = idx;
    _activeCardId  = null;
    renderFeaturedEvent(idx);
    renderCarouselDots();
    updateCarouselNav();
    renderBingoSection();
  }

  function renderFeaturedEvent(idx) {
    var ev     = _events[idx];
    if (!ev) return;
    var accent = ev.accentColor || '#4facfe';
    var cdBg     = hexToRgba(accent, 0.08);
    var cdBorder = hexToRgba(accent, 0.28);
    var linkBg   = 'linear-gradient(135deg,' + accent + ',' + darkenHex(accent, 55) + ')';

    var target = new Date(ev.isoDate).getTime();
    var diff   = target - Date.now();
    var isLive = diff <= 0;
    var badgeText = isLive ? '🔴 EN DIRECTO' : (diff < 86400000 ? '¡HOY!' : 'PRÓXIMAMENTE');
    var badgeCls  = isLive ? 'evt-badge evt-badge--live' : 'evt-badge';

    var visualHtml = ev.img
      ? '<div class="evt-featured__img-wrap"><img src="' + escHtml(ev.img) + '" class="evt-featured__img" alt="' + escHtml(ev.nombre) + '" loading="eager"></div>'
      : '<div class="evt-featured__img-wrap evt-featured__placeholder"><div class="evt-featured__placeholder-icon">🎮</div><div class="evt-featured__placeholder-lbl">' + escHtml(ev.nombre) + '</div></div>';

    var cdUnit = function (id, lbl) {
      return '<div class="evt-cd-unit" style="background:' + cdBg + ';border-color:' + cdBorder + '">' +
        '<span class="evt-cd-val" id="' + id + '" style="color:' + accent + ';text-shadow:0 0 12px ' + hexToRgba(accent, 0.5) + '">--</span>' +
        '<span class="evt-cd-lbl">' + lbl + '</span>' +
      '</div>';
    };
    var cdSep = '<span class="evt-cd-sep" style="color:' + hexToRgba(accent, 0.4) + '">:</span>';

    var container = document.getElementById('evtFeaturedCard');
    container.innerHTML =
      '<div class="evt-featured__visual">' +
        visualHtml +
        '<div class="' + badgeCls + '" id="evtBadge">' + badgeText + '</div>' +
        '<div style="position:absolute;bottom:0.7rem;right:0.7rem;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);border-radius:6px;padding:0.3rem 0.55rem;border:1px solid rgba(255,255,255,0.1)">' +
          '<span style="font-family:\'Orbitron\',sans-serif;font-size:0.6rem;font-weight:700;color:' + accent + ';letter-spacing:0.1em">' + escHtml(ev.brand || ev.nombre) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="evt-featured__info">' +
        '<div class="evt-featured__header">' +
          '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem">' +
            '<div>' +
              '<div class="evt-featured__tag">' + escHtml(ev.tag) + '</div>' +
              '<h2 class="evt-featured__name">' + escHtml(ev.nombre) + '</h2>' +
            '</div>' +
            '<button class="evt-edit-btn" onclick="window.GT_Bingo.openEditEventModal(\'' + escId(ev.id) + '\')" title="Editar evento">✏️</button>' +
          '</div>' +
          '<p class="evt-featured__desc">' + (ev.desc || '') + '</p>' +
        '</div>' +
        '<div class="evt-schedule">' +
          '<div class="evt-schedule__row"><span class="evt-schedule__icon">📅</span><div><div class="evt-schedule__label">Fecha</div><div class="evt-schedule__val">' + escHtml(ev.fechaLabel) + '</div></div></div>' +
          '<div class="evt-schedule__row"><span class="evt-schedule__icon">🕐</span><div><div class="evt-schedule__label">Hora</div><div class="evt-schedule__val">' + escHtml(ev.hora) + '</div></div></div>' +
          '<div class="evt-schedule__row"><span class="evt-schedule__icon">📺</span><div><div class="evt-schedule__label">Dónde verlo</div><div class="evt-schedule__val">' + escHtml(ev.donde) + '</div></div></div>' +
          '<div class="evt-schedule__row"><span class="evt-schedule__icon">⏱</span><div><div class="evt-schedule__label">Duración estimada</div><div class="evt-schedule__val">' + escHtml(ev.duracion) + '</div></div></div>' +
        '</div>' +
        '<div class="evt-countdown">' +
          '<div class="evt-countdown__label">Cuenta atrás</div>' +
          '<div class="evt-countdown__timer">' +
            cdUnit('evtCdDays','días') + cdSep + cdUnit('evtCdHours','horas') + cdSep + cdUnit('evtCdMins','min') + cdSep + cdUnit('evtCdSecs','seg') +
          '</div>' +
        '</div>' +
        '<a href="' + escHtml(ev.link) + '" class="btn btn-primary evt-featured__link" target="_blank" style="display:inline-flex;gap:0.45rem;align-items:center;background:' + linkBg + ';border-color:' + accent + '">' +
          escHtml(ev.linkLabel) +
        '</a>' +
      '</div>';

    startCountdown(ev);
  }

  function startCountdown(ev) {
    if (_cdInterval) clearInterval(_cdInterval);
    var target = new Date(ev.isoDate).getTime();

    function pad(n) { return String(n).padStart(2,'0'); }

    function tick() {
      var dDays = document.getElementById('evtCdDays');
      if (!dDays) { clearInterval(_cdInterval); return; }
      var diff  = target - Date.now();
      var badge = document.getElementById('evtBadge');

      if (diff <= 0) {
        ['evtCdDays','evtCdHours','evtCdMins','evtCdSecs'].forEach(function (id) {
          var el = document.getElementById(id); if (el) el.textContent = '00';
        });
        if (badge && !badge.classList.contains('evt-badge--live')) {
          badge.textContent = '🔴 EN DIRECTO';
          badge.classList.add('evt-badge--live');
        }
        return;
      }

      document.getElementById('evtCdDays').textContent  = pad(Math.floor(diff / 86400000));
      document.getElementById('evtCdHours').textContent = pad(Math.floor((diff % 86400000) / 3600000));
      document.getElementById('evtCdMins').textContent  = pad(Math.floor((diff % 3600000) / 60000));
      document.getElementById('evtCdSecs').textContent  = pad(Math.floor((diff % 60000) / 1000));

      if (badge && !badge.classList.contains('evt-badge--live')) {
        badge.textContent = diff < 86400000 ? '¡HOY!' : 'PRÓXIMAMENTE';
      }
    }
    tick();
    _cdInterval = setInterval(tick, 1000);
  }

  function renderCarouselDots() {
    var dots = document.getElementById('evtDots');
    if (!dots) return;
    if (_events.length <= 1) { dots.innerHTML = ''; return; }
    dots.innerHTML = _events.map(function (ev, i) {
      var cls = 'evt-dot' + (i === _currentEvtIdx ? ' evt-dot--active' : '');
      return '<button class="' + cls + '" onclick="window.GT_Bingo.goToEvent(' + i + ')" title="' + escHtml(ev.nombre) + '" aria-label="' + escHtml(ev.nombre) + '"></button>';
    }).join('');
  }

  function updateCarouselNav() {
    var prev = document.getElementById('evtPrev');
    var next = document.getElementById('evtNext');
    if (prev) prev.disabled = (_currentEvtIdx === 0);
    if (next) next.disabled = (_currentEvtIdx === _events.length - 1);
  }

  /* ── MODAL EDITAR EVENTO ────────────────────────────────────── */
  function openEditEventModal(evId) {
    var ev = _events.find(function (e) { return e.id === evId; });
    if (!ev) return;
    _editingEvtId = evId;

    /* Rellenar campos */
    document.getElementById('evtEditNombre').value    = ev.nombre    || '';
    document.getElementById('evtEditTag').value       = ev.tag       || '';
    document.getElementById('evtEditFechaLabel').value= ev.fechaLabel|| '';
    document.getElementById('evtEditHora').value      = ev.hora      || '';
    document.getElementById('evtEditDonde').value     = ev.donde     || '';
    document.getElementById('evtEditDuracion').value  = ev.duracion  || '';
    document.getElementById('evtEditDesc').value      = ev.desc ? ev.desc.replace(/<[^>]+>/g, '') : '';
    document.getElementById('evtEditImg').value       = ev.img       || '';
    document.getElementById('evtEditLink').value      = ev.link      || '';
    document.getElementById('evtEditLinkLabel').value = ev.linkLabel  || '';
    document.getElementById('evtEditBrand').value     = ev.brand     || '';
    document.getElementById('evtEditColor').value     = ev.accentColor || '#4facfe';

    /* Fecha/hora ISO → datetime-local (primeros 16 chars: YYYY-MM-DDTHH:MM) */
    var iso = ev.isoDate || '';
    document.getElementById('evtEditIsoDate').value = iso.substring(0, 16);

    document.getElementById('evtEditOverlay').classList.add('open');
    document.getElementById('evtEditNombre').focus();
  }

  function closeEditEventModal() {
    document.getElementById('evtEditOverlay').classList.remove('open');
    _editingEvtId = null;
  }

  function saveEditEventModal() {
    if (!_editingEvtId) return;
    var ev = _events.find(function (e) { return e.id === _editingEvtId; });
    if (!ev) return;

    var isoRaw = document.getElementById('evtEditIsoDate').value; /* YYYY-MM-DDTHH:MM */
    var isoDate = isoRaw ? isoRaw + ':00+02:00' : ev.isoDate;

    /* Descripción: texto plano, sin HTML */
    var descPlain = document.getElementById('evtEditDesc').value.trim();

    var updates = {
      nombre     : document.getElementById('evtEditNombre').value.trim()    || ev.nombre,
      tag        : document.getElementById('evtEditTag').value.trim()        || ev.tag,
      isoDate    : isoDate,
      fechaLabel : document.getElementById('evtEditFechaLabel').value.trim() || ev.fechaLabel,
      hora       : document.getElementById('evtEditHora').value.trim()       || ev.hora,
      donde      : document.getElementById('evtEditDonde').value.trim()      || ev.donde,
      duracion   : document.getElementById('evtEditDuracion').value.trim()   || ev.duracion,
      desc       : descPlain,
      img        : document.getElementById('evtEditImg').value.trim(),
      link       : document.getElementById('evtEditLink').value.trim()       || ev.link,
      linkLabel  : document.getElementById('evtEditLinkLabel').value.trim()  || ev.linkLabel,
      brand      : document.getElementById('evtEditBrand').value.trim()      || ev.brand,
      accentColor: document.getElementById('evtEditColor').value             || ev.accentColor
    };

    db.collection('events').doc(_editingEvtId).update(updates)
      .then(closeEditEventModal)
      .catch(function (err) { console.error('Error guardando evento:', err); });
  }

  /* ── HISTÓRICO ──────────────────────────────────────────────── */
  function renderHistorico() {
    var el = document.getElementById('evtHistorico');
    if (!el) return;
    var historic = _events.filter(function (ev) {
      if (!isHistoric(ev)) return false;
      var evIdx = _events.indexOf(ev);
      return getCardsForEvent(evIdx).length > 0;
    });
    if (historic.length === 0) { el.style.display = 'none'; return; }
    el.style.display = '';

    var grid = document.getElementById('evtHistoricoGrid');
    if (!grid) return;
    grid.innerHTML = historic.map(function (ev) {
      var evIdx   = _events.indexOf(ev);
      var evCards = getCardsForEvent(evIdx);
      var imgHtml = ev.img
        ? '<img src="' + escHtml(ev.img) + '" class="evt-hist-card__img" alt="' + escHtml(ev.nombre) + '">'
        : '<div class="evt-hist-card__noimg">🎮</div>';
      return '<div class="evt-hist-card">' +
        '<div class="evt-hist-card__thumb">' + imgHtml + '</div>' +
        '<div class="evt-hist-card__body">' +
          '<div class="evt-hist-card__tag">' + escHtml(ev.tag) + '</div>' +
          '<div class="evt-hist-card__name">' + escHtml(ev.nombre) + '</div>' +
          '<div class="evt-hist-card__date">' + escHtml(ev.fechaLabel) + '</div>' +
          (evCards.length > 0 ? '<div class="evt-hist-card__bingos">🎰 ' + evCards.length + ' bingo' + (evCards.length !== 1 ? 's' : '') + ' archivado' + (evCards.length !== 1 ? 's' : '') + '</div>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ── CARGAR TARJETAS ────────────────────────────────────────── */
  function loadCards() {
    db.collection('bingo_cards').orderBy('createdAt', 'desc')
      .onSnapshot(function (snap) {
        _cards = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        renderBingoSection();
        renderHistorico();
      });
  }

  /* ── SECCIÓN BINGO ──────────────────────────────────────────── */
  function renderBingoSection() {
    if (!_events.length) return;
    var ev      = _events[_currentEvtIdx];
    var evCards = getCardsForEvent(_currentEvtIdx);

    var sub = document.getElementById('bingoEventSub');
    if (sub) sub.textContent = ev.nombre;

    renderTabs(evCards);

    if (evCards.length > 0) {
      var hasActive = _activeCardId && evCards.some(function (c) { return c.id === _activeCardId; });
      setActiveCard(hasActive ? _activeCardId : evCards[0].id);
    } else {
      _activeCardId = null;
      document.getElementById('bingoBoardWrap').innerHTML =
        '<div class="empty-state" style="margin-top:3rem">' +
          '<div class="empty-state__icon">🎰</div>' +
          '<div class="empty-state__title">No hay bingos para ' + escHtml(ev.nombre) + '</div>' +
          '<p>Crea el primero con el botón de arriba.</p>' +
        '</div>';
      document.getElementById('bingoStats').innerHTML = '';
      hideLoading();
    }
  }

  function setActiveCard(cardId) {
    _activeCardId = cardId;
    _prevWinCount = 0;
    renderTabs(getCardsForEvent(_currentEvtIdx));
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
  function renderTabs(evCards) {
    var cards     = evCards || getCardsForEvent(_currentEvtIdx);
    var container = document.getElementById('bingoTabs');
    if (!container) return;
    if (cards.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = cards.map(function (c) {
      var active = c.id === _activeCardId ? ' bingo-tab--active' : '';
      return '<button class="bingo-tab' + active + '" onclick="window.GT_Bingo.setActiveCard(\'' + escId(c.id) + '\')">' +
        escHtml(c.titulo) + '</button>';
    }).join('');
  }

  /* ── RENDER TABLERO ─────────────────────────────────────────── */
  function renderBoard(card) {
    var cells    = card.cells || [];
    var winLines = getWinLines(cells);
    var winSet   = new Set();
    winLines.forEach(function (line) { line.forEach(function (i) { winSet.add(i); }); });

    var letters    = ['B','I','N','G','O'];
    var headerHtml = letters.map(function (l) {
      return '<div class="bingo-letter bingo-letter--' + l.toLowerCase() + '">' + l + '</div>';
    }).join('');

    var gridHtml = cells.map(function (cell, i) {
      var marked = !!cell.marcada;
      var libre  = !!cell.libre;
      var win    = winSet.has(i);
      var cls    = 'bingo-cell' +
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
          (marked ? '<div class="bingo-cell__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" width="28" height="28"><polyline points="20 6 9 17 4 12"/></svg></div>' : '') +
          who;

      var click = libre ? '' : ' onclick="window.GT_Bingo.toggleCell(\'' + escId(card.id) + '\',' + i + ')"';
      return '<div class="' + cls + '"' + click + '>' + inner + '</div>';
    }).join('');

    var marked    = cells.filter(function (c) { return c.marcada && !c.libre; }).length;
    var total     = cells.filter(function (c) { return !c.libre; }).length;
    var prevWins  = _prevWinCount;
    _prevWinCount = winLines.length;

    document.getElementById('bingoBoardWrap').innerHTML =
      '<div class="bingo-evento-title">' +
        escHtml(card.titulo) +
        '<button class="btn btn-ghost btn-sm bingo-edit-btn" onclick="window.GT_Bingo.openEditCard(\'' + escId(card.id) + '\')">✏️ Editar</button>' +
      '</div>' +
      '<div class="bingo-board">' +
        '<div class="bingo-header-row">' + headerHtml + '</div>' +
        '<div class="bingo-grid">' + gridHtml + '</div>' +
      '</div>';

    renderStats(winLines, marked, total);
    if (winLines.length > prevWins && winLines.length > 0) showBingoCelebration(winLines.length);
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
      var cell  = cells[cellIndex];
      if (!cell || cell.libre) return;
      cells[cellIndex] = cell.marcada
        ? Object.assign(cell, { marcada: false, marcadoPor: null, marcadaAt: null })
        : Object.assign(cell, { marcada: true, marcadoPor: _player, marcadaAt: new Date().toISOString() });
      db.collection('bingo_cards').doc(cardId).update({ cells: cells });
    });
  }

  /* ── STATS ──────────────────────────────────────────────────── */
  function renderStats(winLines, marked, total) {
    var pct = total > 0 ? Math.round(marked / total * 100) : 0;
    var n   = winLines.length;
    document.getElementById('bingoStats').innerHTML =
      '<div class="bingo-stats">' +
        '<div class="bingo-stat"><span class="bingo-stat__val">' + marked + '<span style="font-size:0.9rem;opacity:.55">/' + total + '</span></span><span class="bingo-stat__lbl">Marcadas</span></div>' +
        '<div class="bingo-stat"><span class="bingo-stat__val">' + pct + '<span style="font-size:0.9rem;opacity:.55">%</span></span><span class="bingo-stat__lbl">Completado</span></div>' +
        '<div class="bingo-stat"><span class="bingo-stat__val' + (n > 0 ? ' bingo-stat__val--win' : '') + '">' + n + '</span><span class="bingo-stat__lbl">BINGO' + (n !== 1 ? 's' : '') + '</span></div>' +
      '</div>';
  }

  /* ── CELEBRACIÓN ────────────────────────────────────────────── */
  function showBingoCelebration(count) {
    var letters  = '¡BINGO!'.split('');
    var wordHtml = letters.map(function (l, i) { return '<span style="--bi:' + i + '">' + l + '</span>'; }).join('');
    var overlay  = document.createElement('div');
    overlay.id   = 'bingoCelebOverlay';
    overlay.innerHTML =
      '<canvas id="bingoCelebCanvas" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"></canvas>' +
      '<div class="bingo-win-banner">' +
        '<div class="bingo-win__word">' + wordHtml + '</div>' +
        '<div class="bingo-win__sub">' + (count > 1 ? count + ' líneas completadas 🔥' : '¡Línea completada! 🎉') + '</div>' +
        '<div class="bingo-win__hint">Toca para cerrar</div>' +
      '</div>';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:8000;display:flex;align-items:center;justify-content:center;background:rgba(7,7,15,0.65);backdrop-filter:blur(3px);cursor:pointer;opacity:0;transition:opacity .4s';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.style.opacity = '1'; });
    var canvas = document.getElementById('bingoCelebCanvas');
    var stopFW = launchFireworks(canvas);
    function closeIt() {
      overlay.style.opacity = '0'; if (stopFW) stopFW();
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 450);
    }
    overlay.addEventListener('click', closeIt);
    setTimeout(closeIt, 5000);
    playBingoSound();
  }

  function launchFireworks(canvas) {
    var W = canvas.width = window.innerWidth, H = canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    var parts = [], rafId = null, stopped = false;
    var COLORS = ['#4facfe','#43e97b','#f5c842','#f472b6','#a855f7','#00f2fe','#fbbf24','#fb923c'];
    function burst(x,y) {
      var color = COLORS[Math.floor(Math.random()*COLORS.length)], count = 65+Math.floor(Math.random()*35);
      for (var i=0;i<count;i++) {
        var a=(Math.PI*2/count)*i+(Math.random()-.5)*.4, s=2.5+Math.random()*5.5;
        parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.2,life:1,decay:.011+Math.random()*.013,size:2.5+Math.random()*2.5,color});
      }
    }
    var bc=0,mb=16;
    function sb(){if(stopped||bc>=mb)return;bc++;burst(W*.1+Math.random()*W*.8,H*.05+Math.random()*H*.5);if(bc<mb)setTimeout(sb,220+Math.random()*320);}
    sb();setTimeout(sb,80);setTimeout(sb,200);
    function tick(){
      ctx.fillStyle='rgba(7,7,15,0.15)';ctx.fillRect(0,0,W,H);
      parts=parts.filter(function(p){
        p.x+=p.vx;p.y+=p.vy;p.vy+=.09;p.vx*=.985;p.life-=p.decay;if(p.life<=0)return false;
        ctx.save();ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);ctx.fill();ctx.restore();return true;
      });
      if(!stopped&&(parts.length>0||bc<mb))rafId=requestAnimationFrame(tick);
    }
    tick();
    return function(){stopped=true;if(rafId)cancelAnimationFrame(rafId);};
  }

  function playBingoSound() {
    try {
      var ctx = new (window.AudioContext||window.webkitAudioContext)();
      [{f:523,t:0,d:.18},{f:659,t:.15,d:.18},{f:784,t:.3,d:.18},{f:1047,t:.45,d:.35},{f:784,t:.65,d:.15},{f:1047,t:.75,d:.5}]
        .forEach(function(n){
          var o=ctx.createOscillator(),g=ctx.createGain();
          o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.value=n.f;
          g.gain.setValueAtTime(0,ctx.currentTime+n.t);
          g.gain.linearRampToValueAtTime(.22,ctx.currentTime+n.t+.02);
          g.gain.linearRampToValueAtTime(0,ctx.currentTime+n.t+n.d);
          o.start(ctx.currentTime+n.t);o.stop(ctx.currentTime+n.t+n.d+.05);
        });
    } catch(e){}
  }

  /* ── MODAL CREAR / EDITAR BINGO ─────────────────────────────── */
  function openNewCardModal() {
    _editingCardId = null;
    var ev = _events[_currentEvtIdx] || {};
    document.getElementById('bingoModalHeading').textContent = 'Nuevo Bingo — ' + (ev.nombre || '');
    document.getElementById('bingoModalName').value = ev.nombre || '';
    document.getElementById('bingoModalDelete').style.display = 'none';
    buildModalGrid(null);
    document.getElementById('bingoModalOverlay').classList.add('open');
    document.getElementById('bingoModalName').focus();
    document.getElementById('bingoModalName').select();
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
      var cell    = existingCells ? existingCells[i] : null;
      var isLibre = cell ? !!cell.libre : (i === 12);
      var inp = document.createElement('input');
      inp.type = 'text'; inp.maxLength = 60;
      inp.className = 'bingo-modal-input' + (isLibre ? ' bingo-modal-input--free' : '');
      inp.dataset.idx = i;
      inp.value    = isLibre ? '' : (cell ? (cell.texto || '') : '');
      inp.disabled = isLibre;
      inp.placeholder = isLibre ? '★ LIBRE' : 'Casilla ' + (i + 1);
      container.appendChild(inp);
    }
  }

  function saveCardModal() {
    var nombre = document.getElementById('bingoModalName').value.trim();
    if (!nombre) { document.getElementById('bingoModalName').focus(); return; }
    var inputs = document.querySelectorAll('#bingoModalGrid .bingo-modal-input');
    var cells  = Array.from(inputs).map(function (inp) {
      var libre = inp.classList.contains('bingo-modal-input--free');
      return { texto: libre ? 'LIBRE' : inp.value.trim(), marcada: libre, libre: libre, marcadoPor: null, marcadaAt: null };
    });
    if (_editingCardId) {
      db.collection('bingo_cards').doc(_editingCardId).update({ titulo: nombre, cells: cells }).then(closeCardModal);
    } else {
      var ev = _events[_currentEvtIdx] || {};
      db.collection('bingo_cards').add({
        titulo: nombre, eventoId: ev.id, cells: cells,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
      }).then(function (ref) { _activeCardId = ref.id; closeCardModal(); });
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
      _activeCardId = null; _prevWinCount = 0; closeCardModal();
    });
  }

  function resetMarks(cardId) {
    if (!confirm('¿Resetear todas las marcas? Las casillas quedarán vacías (el texto se mantiene).')) return;
    db.collection('bingo_cards').doc(cardId).get().then(function (doc) {
      if (!doc.exists) return;
      var cells = (doc.data().cells || []).map(function (c) {
        return Object.assign({}, c, c.libre ? {} : { marcada: false, marcadoPor: null, marcadaAt: null });
      });
      db.collection('bingo_cards').doc(cardId).update({ cells: cells });
    });
  }

  /* ── HELPERS ────────────────────────────────────────────────── */
  function escHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escId(s) { return String(s).replace(/'/g,"\\'"); }

  /* ── EXPOSE ─────────────────────────────────────────────────── */
  window.GT_Bingo = {
    goToEvent        : goToEvent,
    setActiveCard    : setActiveCard,
    toggleCell       : toggleCell,
    openEditCard     : openEditCard,
    openNewCardModal : openNewCardModal,
    saveCardModal    : saveCardModal,
    closeCardModal   : closeCardModal,
    deleteCard       : deleteCard,
    resetMarks       : resetMarks,
    openEditEventModal : openEditEventModal,
    closeEditEventModal: closeEditEventModal,
    saveEditEventModal : saveEditEventModal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
