/* ============================================================
   EVENTOS — Bingo Interactivo de Conferencias Gaming
   Version: 20260525j
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
  var _prevWasFull   = false;

  /* Líneas ganadoras — grid 4×5, solo horizontales y verticales
     Celdas:  0  1  2  3
              4  5  6  7
              8  9 10 11
             12 13 14 15
             16 17 18 19  */
  var LINES = [
    [0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],[16,17,18,19], /* 5 horizontales */
    [0,4,8,12,16],[1,5,9,13,17],[2,6,10,14,18],[3,7,11,15,19]    /* 4 verticales   */
  ];
  var TOTAL_CELLS = 20;

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
      return (c.eventoId === ev.id || (!c.eventoId && idx === 0)) && c.jugador === _player;
    });
  }

  function playerHasCardForEvent(idx) {
    return getCardsForEvent(idx).length > 0;
  }

  function updateNewBingoBtn() {
    var btn = document.getElementById('btnNewBingo');
    if (!btn) return;
    var has = playerHasCardForEvent(_currentEvtIdx);
    btn.disabled = has;
    btn.title = has ? 'Ya tienes un bingo para este evento' : '';
    btn.style.opacity = has ? '0.4' : '';
    btn.style.cursor  = has ? 'not-allowed' : '';
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

    /* Sync _player with active player from localStorage */
    var _ap = window.GT && window.GT.getActivePlayer ? window.GT.getActivePlayer() : null;
    if (_ap) _player = _ap;

    document.querySelectorAll('input[name="bingoPlayer"]').forEach(function (r) {
      if (r.value === _player) r.checked = true;
      r.addEventListener('change', function () {
        _player = this.value;
        _activeCardId = null;
        renderBingoSection();
        updateNewBingoBtn();
      });
    });

    /* Top 5 */
    document.getElementById('btnEditTop5').addEventListener('click', openTop5Modal);
    document.getElementById('evtTop5Close').addEventListener('click', closeTop5Modal);
    document.getElementById('evtTop5Cancel').addEventListener('click', closeTop5Modal);
    document.getElementById('evtTop5Save').addEventListener('click', saveTop5);
    document.getElementById('evtTop5ModalOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeTop5Modal();
    });
  }

  function waitForDb(cb) {
    if (window.GT && window.GT.db) return cb(window.GT.db);
    setTimeout(function () { waitForDb(cb); }, 60);
  }

  /* ── DECORACIÓN SHOW: focos + confeti solo el día del evento ── */
  function updateShowDecorations() {
    var today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    var hasEventToday = _events.some(function (ev) {
      return ev.isoDate && ev.isoDate.slice(0, 10) === today;
    });
    var spots    = document.getElementById('evtSpotlights');
    var confetti = document.getElementById('evtConfetti');
    var none = hasEventToday ? '' : 'none';
    if (spots)    spots.style.display    = none;
    if (confetti) confetti.style.display = none;
  }

  /* ── MARQUESINA: nombres reales de los eventos ─────────────── */
  function updateMarquee() {
    var wrap  = document.getElementById('evtMarqueeWrap');
    var track = document.getElementById('evtMarqueeTrack');
    if (!wrap || !track || !_events.length) return;

    // Construir un span por evento con su accentColor
    var sep = '<span style="color:rgba(255,255,255,0.22);padding:0 0.6rem">·</span>';
    var items = _events.map(function (ev) {
      var color = ev.accentColor || '#4facfe';
      var emoji = (ev.tag || '').split(' ')[0] || '🎮';
      return '<span class="evt-marquee-inner" style="color:' + color + '">'
        + emoji + ' ' + ev.nombre + '</span>';
    }).join(sep);
    var content = items + sep; // trailing separator before the duplicate
    // Duplicate for infinite scroll
    track.innerHTML = content + content;
    wrap.style.display = '';
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
        renderTop5(_currentEvtIdx);
        updateShowDecorations();
        updateMarquee();

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
    /* Comprobamos si ya se hizo el seed en Firestore para no
       sobreescribir ediciones previas (imágenes, etc.) */
    db.collection('settings').doc('eventsSeed').get().then(function (doc) {
      if (doc.exists) return; /* Ya se hizo seed en alguna sesión previa */
      var batch = db.batch();
      DEFAULT_EVENTS.forEach(function (ev) {
        var ref = db.collection('events').doc(ev.id);
        /* merge:true: no sobreescribe campos ya guardados (ej. img editadas) */
        batch.set(ref, ev, { merge: true });
      });
      batch.set(db.collection('settings').doc('eventsSeed'), { done: true });
      batch.commit();
    });
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
    renderTop5(idx);
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
        renderRanking();
      });
  }

  /* ── SECCIÓN BINGO ──────────────────────────────────────────── */
  function renderBingoSection() {
    if (!_events.length) return;
    var ev      = _events[_currentEvtIdx];
    var evCards = getCardsForEvent(_currentEvtIdx);

    var sub = document.getElementById('bingoEventSub');
    if (sub) sub.textContent = ev.nombre;

    updateNewBingoBtn();
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
    _activeCardId  = cardId;
    _prevWinCount  = 0;
    _prevWasFull   = false;
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

    var letters    = ['B','I','N','G'];
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
        : (cell.imageUrl
            ? '<div class="bingo-cell__img-wrap"><img class="bingo-cell__img" src="' + escHtml(cell.imageUrl) + '" alt="" loading="lazy" onerror="this.closest(\'.bingo-cell__img-wrap\').classList.add(\'bingo-cell__img-wrap--err\')"></div>' +
              (cell.texto ? '<div class="bingo-cell__text bingo-cell__text--caption">' + escHtml(cell.texto) + '</div>' : '')
            : '<div class="bingo-cell__text">' + escHtml(cell.texto || '') + '</div>') +
          (marked ? '<div class="bingo-cell__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" width="28" height="28"><polyline points="20 6 9 17 4 12"/></svg></div>' : '') +
          who;

      var click = libre ? '' : ' onclick="window.GT_Bingo.toggleCell(\'' + escId(card.id) + '\',' + i + ')"';
      return '<div class="' + cls + '"' + click + '>' + inner + '</div>';
    }).join('');

    var marked      = cells.filter(function (c) { return c.marcada && !c.libre; }).length;
    var total       = cells.filter(function (c) { return !c.libre; }).length;
    var prevWins    = _prevWinCount;
    _prevWinCount   = winLines.length;
    var isFullBingo = (total > 0 && marked === total);
    var prevFull    = _prevWasFull;
    _prevWasFull    = isFullBingo;

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

    if (isFullBingo && !prevFull) {
      showBingoCelebration();              /* 🎉 BINGO!! — todo completo */
    } else if (winLines.length > prevWins) {
      showLineaCelebration(winLines.length); /* ✅ LINEA!! */
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
    var pct   = total > 0 ? Math.round(marked / total * 100) : 0;
    var n     = winLines.length;
    var score = calcScore(marked, n, marked === total && total > 0);
    document.getElementById('bingoStats').innerHTML =
      '<div class="bingo-stats">' +
        '<div class="bingo-stat"><span class="bingo-stat__val">' + marked + '<span style="font-size:0.9rem;opacity:.55">/' + total + '</span></span><span class="bingo-stat__lbl">Casillas</span></div>' +
        '<div class="bingo-stat"><span class="bingo-stat__val' + (n > 0 ? ' bingo-stat__val--win' : '') + '">' + n + '</span><span class="bingo-stat__lbl">Líneas</span></div>' +
        '<div class="bingo-stat"><span class="bingo-stat__val" style="color:#f5c842;text-shadow:0 0 18px rgba(245,200,66,0.5)">' + score + '</span><span class="bingo-stat__lbl">Puntos</span></div>' +
      '</div>';
  }

  /* ── PUNTUACIÓN ─────────────────────────────────────────────── */
  function calcScore(marked, lines, isFull) {
    return marked * 1 + lines * 3 + (isFull ? 20 : 0);
  }

  function calcCardScore(card) {
    var cells   = card.cells || [];
    var marked  = cells.filter(function (c) { return c.marcada && !c.libre; }).length;
    var total   = cells.filter(function (c) { return !c.libre; }).length;
    var lines   = getWinLines(cells).length;
    var isFull  = total > 0 && marked === total;
    return { score: calcScore(marked, lines, isFull), marked: marked, total: total, lines: lines, isFull: isFull };
  }

  /* ── RANKING GLOBAL ─────────────────────────────────────────── */
  function renderRanking() {
    var el = document.getElementById('bingoRanking');
    if (!el) return;

    if (_cards.length === 0) {
      el.innerHTML = '<div class="empty-state" style="padding:2rem 0"><div class="empty-state__icon">🏆</div><div class="empty-state__title">Aún no hay bingos</div></div>';
      return;
    }

    var ranked = _cards.map(function (card) {
      var res = calcCardScore(card);
      var ev  = _events.find(function (e) { return e.id === card.eventoId; });
      return Object.assign({ id: card.id, titulo: card.titulo, eventoNombre: ev ? ev.nombre : '—' }, res);
    }).sort(function (a, b) { return b.score - a.score; });

    var medals = ['🥇','🥈','🥉'];
    var posCls = ['--1','--2','--3'];
    var itemCls= ['--gold','--silver','--bronze'];

    el.innerHTML = ranked.map(function (r, i) {
      var pos    = i < 3 ? medals[i] : (i + 1);
      var pCls   = 'bingo-rank-pos bingo-rank-pos' + (i < 3 ? posCls[i] : '--n');
      var iCls   = 'bingo-rank-item' + (i < 3 ? ' bingo-rank-item' + itemCls[i] : '');
      var pct    = r.total > 0 ? Math.round(r.marked / r.total * 100) : 0;

      var badges = '<span class="bingo-rank-badge">📦 ' + r.marked + '/' + r.total + '</span>';
      if (r.lines > 0)  badges += '<span class="bingo-rank-badge bingo-rank-badge--line">🟢 ' + r.lines + ' línea' + (r.lines !== 1 ? 's' : '') + '</span>';
      if (r.isFull)     badges += '<span class="bingo-rank-badge bingo-rank-badge--full">⭐ BINGO 100%</span>';

      return '<div class="' + iCls + '">' +
        '<div class="' + pCls + '">' + pos + '</div>' +
        '<div class="bingo-rank-info">' +
          '<div class="bingo-rank-title">' + escHtml(r.titulo) + '</div>' +
          '<div class="bingo-rank-event">' + escHtml(r.eventoNombre) + '</div>' +
          '<div class="bingo-rank-detail">' + badges + '</div>' +
          '<div class="bingo-rank-bar"><div class="bingo-rank-bar__fill" style="width:' + pct + '%"></div></div>' +
        '</div>' +
        '<div class="bingo-rank-score">' + r.score + '<span>pts</span></div>' +
      '</div>';
    }).join('');
  }

  /* ── CELEBRACIÓN LINEA!! (toast) ───────────────────────────── */
  function showLineaCelebration(lineCount) {
    var existing = document.getElementById('bingoLineaToast');
    if (existing) existing.parentNode.removeChild(existing);

    var toast = document.createElement('div');
    toast.id  = 'bingoLineaToast';
    toast.className = 'bingo-linea-toast';
    toast.innerHTML =
      '<span class="bingo-linea-toast__text">✅ LÍNEA!!</span>' +
      '<span class="bingo-linea-toast__count">' + lineCount + ' línea' + (lineCount !== 1 ? 's' : '') + ' completada' + (lineCount !== 1 ? 's' : '') + '</span>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('bingo-linea-toast--show'); });
    playLineaSound();

    setTimeout(function () {
      toast.classList.remove('bingo-linea-toast--show');
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, 2500);
  }

  /* ── CELEBRACIÓN BINGO!! (pantalla completa) ─────────────────── */
  function showBingoCelebration() {
    var letters  = '¡BINGO!!'.split('');
    var wordHtml = letters.map(function (l, i) { return '<span style="--bi:' + i + '">' + l + '</span>'; }).join('');
    var overlay  = document.createElement('div');
    overlay.id   = 'bingoCelebOverlay';
    overlay.innerHTML =
      '<canvas id="bingoCelebCanvas" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"></canvas>' +
      '<div class="bingo-win-banner">' +
        '<div class="bingo-win__word">' + wordHtml + '</div>' +
        '<div class="bingo-win__sub">¡¡Bingo completo!! 20/20 casillas 🔥</div>' +
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

  function playLineaSound() {
    try {
      var ctx = new (window.AudioContext||window.webkitAudioContext)();
      [{f:659,t:0,d:.12},{f:880,t:.1,d:.2}].forEach(function(n){
        var o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.value=n.f;
        g.gain.setValueAtTime(0,ctx.currentTime+n.t);
        g.gain.linearRampToValueAtTime(.18,ctx.currentTime+n.t+.02);
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
    for (var i = 0; i < TOTAL_CELLS; i++) {
      var cell = existingCells ? existingCells[i] : null;
      var wrap = document.createElement('div');
      wrap.className = 'bingo-modal-cell';
      wrap.dataset.idx = i;

      var inp = document.createElement('input');
      inp.type = 'text'; inp.maxLength = 60;
      inp.className = 'bingo-modal-input bingo-modal-input--text';
      inp.dataset.idx = i;
      inp.value = cell ? (cell.texto || '') : '';
      inp.placeholder = 'Texto…';

      var imgInp = document.createElement('input');
      imgInp.type = 'url';
      imgInp.className = 'bingo-modal-input bingo-modal-input--img';
      imgInp.dataset.idx = i;
      imgInp.value = cell ? (cell.imageUrl || '') : '';
      imgInp.placeholder = '🖼 URL imagen…';

      wrap.appendChild(inp);
      wrap.appendChild(imgInp);
      container.appendChild(wrap);
    }
  }

  function saveCardModal() {
    var nombre = document.getElementById('bingoModalName').value.trim();
    if (!nombre) { document.getElementById('bingoModalName').focus(); return; }
    var wraps = document.querySelectorAll('#bingoModalGrid .bingo-modal-cell');
    var cells = Array.from(wraps).map(function (wrap) {
      var txt = (wrap.querySelector('.bingo-modal-input--text').value || '').trim();
      var img = (wrap.querySelector('.bingo-modal-input--img').value || '').trim();
      return { texto: txt, imageUrl: img || null, marcada: false, libre: false, marcadoPor: null, marcadaAt: null };
    });
    if (_editingCardId) {
      db.collection('bingo_cards').doc(_editingCardId).update({ titulo: nombre, cells: cells }).then(closeCardModal);
    } else {
      var ev = _events[_currentEvtIdx] || {};
      db.collection('bingo_cards').add({
        titulo: nombre, eventoId: ev.id, jugador: _player, cells: cells,
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

  /* ── TOP 5 DEL EVENTO ──────────────────────────────────────── */
  var TOP5_MEDALS = ['#ffd700','#c0c0c0','#cd7f32','rgba(255,255,255,0.42)','rgba(255,255,255,0.32)'];
  var TOP5_LABELS = ['🥇 Mejor del evento','🥈 Segundo favorito','🥉 Tercer favorito','4º puesto','5º puesto'];

  function getLibGames() {
    if (window.GT && window.GT._cache && Array.isArray(window.GT._cache.biblioteca)) {
      return window.GT._cache.biblioteca.slice();
    }
    return [];
  }

  function renderTop5(evtIdx) {
    var section = document.getElementById('evtTop5Section');
    if (!section) return;
    var ev = _events[evtIdx];
    if (!ev) { section.style.display = 'none'; return; }

    /* Esperar a que la biblioteca esté cargada */
    if (!window.GT || !window.GT._cache || !Array.isArray(window.GT._cache.biblioteca)) {
      setTimeout(function() { renderTop5(evtIdx); }, 200);
      return;
    }

    section.style.display = '';
    var sub = document.getElementById('evtTop5Sub');
    if (sub) sub.textContent = ev.nombre + (ev.fechaLabel ? ' · ' + ev.fechaLabel : '');

    var top5Ids = (ev.top5 || []).slice(0, 5);
    while (top5Ids.length < 5) top5Ids.push(null);

    var games   = getLibGames();
    var gameMap = {};
    games.forEach(function(g) { gameMap[g.id] = g; });

    var accent = ev.accentColor || '#4facfe';
    var html = '';
    for (var i = 0; i < 5; i++) {
      var gid  = top5Ids[i] || null;
      var game = gid ? (gameMap[gid] || null) : null;
      html += renderTop5Card(i, game, accent);
    }
    var grid = document.getElementById('evtTop5Grid');
    if (grid) grid.innerHTML = html;
  }

  function renderTop5Card(rank, game, accent) {
    var medal = TOP5_MEDALS[rank] || 'rgba(255,255,255,0.3)';
    var isFirst = rank === 0;
    var cardCls = 'evt-top5-card' + (isFirst ? ' evt-top5-card--rank1' : '');

    if (!game) {
      return '<div class="' + cardCls + ' evt-top5-card--empty">' +
        '<div class="evt-top5-card__cover">' +
          '<div class="evt-top5-card__empty-ph">' +
            '<span class="evt-top5-empty-num">' + (rank + 1) + '</span>' +
            '<span class="evt-top5-empty-plus">+</span>' +
          '</div>' +
        '</div>' +
        '<div class="evt-top5-card__meta evt-top5-card__meta--empty">Sin juego</div>' +
      '</div>';
    }

    var portada = game.portada || '';
    var titulo  = game.titulo  || '';

    return '<div class="' + cardCls + '">' +
      '<div class="evt-top5-card__cover">' +
        (portada
          ? '<img class="evt-top5-card__img" src="' + escHtml(portada) + '" alt="' + escHtml(titulo) + '" loading="lazy" onerror="this.style.display=\'none\'">'
          : '<div class="evt-top5-card__noimg"><span>🎮</span></div>') +
        '<div class="evt-top5-rank-badge" style="background:' + medal + '">' + (rank + 1) + '</div>' +
      '</div>' +
      '<div class="evt-top5-card__meta">' + escHtml(titulo) + '</div>' +
    '</div>';
  }

  function openTop5Modal() {
    var ev = _events[_currentEvtIdx];
    if (!ev) return;
    var titleEl = document.getElementById('evtTop5ModalTitle');
    if (titleEl) titleEl.textContent = '⭐ Top 5 · ' + ev.nombre;
    var top5Ids = (ev.top5 || []).slice(0, 5);
    while (top5Ids.length < 5) top5Ids.push('');
    buildTop5ModalSlots(top5Ids);
    document.getElementById('evtTop5ModalOverlay').classList.add('open');
  }

  function buildTop5ModalSlots(top5Ids) {
    var games = getLibGames().slice().sort(function(a, b) {
      return (a.titulo || '').localeCompare(b.titulo || '', 'es', { sensitivity: 'base' });
    });
    var container = document.getElementById('evtTop5SlotsList');
    if (!container) return;

    var html = '';
    for (var i = 0; i < 5; i++) {
      var medal     = TOP5_MEDALS[i];
      var label     = TOP5_LABELS[i];
      var currentId = top5Ids[i] || '';

      var optHtml = '<option value="">— Sin seleccionar —</option>';
      var curName = '';
      games.forEach(function(g) {
        optHtml += '<option value="' + escHtml(g.id) + '"' + (g.id === currentId ? ' selected' : '') + '>'
          + escHtml(g.titulo || g.id) + '</option>';
        if (g.id === currentId) curName = g.titulo || '';
      });

      html += '<div class="evt-top5-slot">' +
        '<div class="evt-top5-slot__badge" style="background:' + medal + '">' + (i + 1) + '</div>' +
        '<div class="evt-top5-slot__fields">' +
          '<div class="evt-top5-slot__label">' + escHtml(label) + '</div>' +
          '<input type="text" class="form-input" id="top5Search' + i + '" placeholder="Buscar juego..." value="' + escHtml(curName) + '" autocomplete="off" style="font-size:0.82rem;padding:0.4rem 0.65rem;margin-bottom:0.35rem">' +
          '<select class="form-select" id="top5Select' + i + '" style="font-size:0.82rem">' + optHtml + '</select>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = html;

    /* Conectar búsqueda y selects */
    for (var j = 0; j < 5; j++) {
      (function(idx) {
        var searchEl = document.getElementById('top5Search' + idx);
        var selectEl = document.getElementById('top5Select' + idx);
        if (!searchEl || !selectEl) return;

        searchEl.addEventListener('input', function() {
          var q = this.value.toLowerCase().trim();
          Array.from(selectEl.options).forEach(function(opt) {
            if (!opt.value) return;
            opt.hidden = q !== '' && opt.textContent.toLowerCase().indexOf(q) === -1;
          });
          var visible = Array.from(selectEl.options).filter(function(o) { return o.value && !o.hidden; });
          if (visible.length === 1) visible[0].selected = true;
        });

        selectEl.addEventListener('change', function() {
          var opt = this.options[this.selectedIndex];
          searchEl.value = (opt && opt.value) ? opt.textContent : '';
          /* Mostrar todos de nuevo */
          Array.from(selectEl.options).forEach(function(o) { o.hidden = false; });
        });
      })(j);
    }
  }

  function closeTop5Modal() {
    document.getElementById('evtTop5ModalOverlay').classList.remove('open');
  }

  function saveTop5() {
    var ev = _events[_currentEvtIdx];
    if (!ev || !db) return;
    var ids = [];
    for (var i = 0; i < 5; i++) {
      var sel = document.getElementById('top5Select' + i);
      ids.push((sel && sel.value) ? sel.value : null);
    }
    var btn = document.getElementById('evtTop5Save');
    btn.disabled = true; btn.textContent = '💾 Guardando...';
    db.collection('events').doc(ev.id).update({ top5: ids })
      .then(function() {
        btn.disabled = false; btn.textContent = '💾 Guardar';
        _events[_currentEvtIdx].top5 = ids;
        closeTop5Modal();
        renderTop5(_currentEvtIdx);
        if (window.GT && window.GT.Toast) window.GT.Toast.show('Top 5 guardado ✓');
      })
      .catch(function() {
        btn.disabled = false; btn.textContent = '💾 Guardar';
        if (window.GT && window.GT.Toast) window.GT.Toast.show('Error al guardar', 'error');
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
    saveEditEventModal : saveEditEventModal,
    openTop5Modal    : openTop5Modal,
    closeTop5Modal   : closeTop5Modal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
