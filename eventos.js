/* ============================================================
   EVENTOS — Bingo Interactivo de Conferencias Gaming
   Version: 20260525f
   ============================================================ */
(function () {
  'use strict';

  /* ── LISTA DE EVENTOS ──────────────────────────────────────── */
  var EVENTS = [
    /* ── 1. State of Play ─────────────────────────────────────── */
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
      linkBg     : 'linear-gradient(135deg,#0070f3,#0050cc)',
      linkBorder : '#0070f3',
      brand      : 'PLAYSTATION',
      brandColor : '#0070f3',
      cdColor    : '#4facfe',
      cdBg       : 'rgba(79,172,254,0.07)',
      cdBorder   : 'rgba(79,172,254,0.2)'
    },
    /* ── 2. Latin American Games Showcase ─────────────────────── */
    {
      id         : 'latin-american-games-showcase-2026',
      nombre     : 'Latin American Games Showcase',
      tag        : '🌎 Indie Latinoamérica',
      isoDate    : '2026-06-04T23:00:00+02:00',
      fechaLabel : 'Jueves, 4 de junio de 2026',
      hora       : '23:00 h · hora peninsular España',
      donde      : 'YouTube · Twitch',
      duracion   : 'Aproximadamente 1 hora',
      desc       : 'El showcase de los videojuegos independientes de América Latina. 9 estrenos mundiales y 15 anuncios de fechas de lanzamiento de los estudios indie más prometedores de la región.',
      img        : '',
      link       : 'https://www.youtube.com/@LatinAmericanGamesShowcase',
      linkLabel  : '▶ Ver en directo — YouTube LAGS',
      linkBg     : 'linear-gradient(135deg,#e63946,#9b1c24)',
      linkBorder : '#e63946',
      brand      : 'LATIN AMERICAN GAMES',
      brandColor : '#e63946',
      cdColor    : '#f87171',
      cdBg       : 'rgba(230,57,70,0.07)',
      cdBorder   : 'rgba(230,57,70,0.25)'
    },
    /* ── 3. Summer Game Fest ───────────────────────────────────── */
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
      linkBg     : 'linear-gradient(135deg,#f5c842,#b38a00)',
      linkBorder : '#f5c842',
      brand      : 'SUMMER GAME FEST',
      brandColor : '#f5c842',
      cdColor    : '#f5c842',
      cdBg       : 'rgba(245,200,66,0.07)',
      cdBorder   : 'rgba(245,200,66,0.25)'
    },
    /* ── 4. Day of the Devs ────────────────────────────────────── */
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
      linkBg     : 'linear-gradient(135deg,#a855f7,#7c22c4)',
      linkBorder : '#a855f7',
      brand      : 'DAY OF THE DEVS',
      brandColor : '#c084fc',
      cdColor    : '#c084fc',
      cdBg       : 'rgba(168,85,247,0.07)',
      cdBorder   : 'rgba(168,85,247,0.25)'
    },
    /* ── 5. Future Games Show ──────────────────────────────────── */
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
      linkBg     : 'linear-gradient(135deg,#ef4444,#b91c1c)',
      linkBorder : '#ef4444',
      brand      : 'FUTURE GAMES SHOW',
      brandColor : '#f87171',
      cdColor    : '#f87171',
      cdBg       : 'rgba(239,68,68,0.07)',
      cdBorder   : 'rgba(239,68,68,0.25)'
    },
    /* ── 6. Ñ3 ────────────────────────────────────────────────── */
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
      linkBg     : 'linear-gradient(135deg,#fb923c,#c2410c)',
      linkBorder : '#fb923c',
      brand      : 'Ñ3',
      brandColor : '#fb923c',
      cdColor    : '#fb923c',
      cdBg       : 'rgba(251,146,60,0.07)',
      cdBorder   : 'rgba(251,146,60,0.25)'
    },
    /* ── 7. Xbox Games Showcase ────────────────────────────────── */
    {
      id         : 'xbox-games-showcase-2026',
      nombre     : 'Xbox Games Showcase',
      tag        : '🎮 Xbox & Bethesda',
      isoDate    : '2026-06-07T19:00:00+02:00',
      fechaLabel : 'Domingo, 7 de junio de 2026',
      hora       : '19:00 h · hora peninsular España',
      donde      : 'YouTube · Twitch · Xbox.com',
      duracion   : 'Aproximadamente 1 hora + Gears of War Direct',
      desc       : 'Presentación de novedades de <strong style="color:var(--txt)">Xbox Game Studios, Bethesda Softworks y Activision Blizzard</strong>. Seguido del Gears of War: E-Day Direct con todo el detalle del esperado regreso de la saga.',
      img        : '',
      link       : 'https://www.youtube.com/@Xbox',
      linkLabel  : '▶ Ver en directo — YouTube Xbox',
      linkBg     : 'linear-gradient(135deg,#107c10,#0a5a0a)',
      linkBorder : '#107c10',
      brand      : 'XBOX',
      brandColor : '#4ade80',
      cdColor    : '#4ade80',
      cdBg       : 'rgba(74,222,128,0.07)',
      cdBorder   : 'rgba(74,222,128,0.25)'
    },
    /* ── 8. PC Gaming Show ─────────────────────────────────────── */
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
      linkBg     : 'linear-gradient(135deg,#00d4ff,#0088aa)',
      linkBorder : '#00d4ff',
      brand      : 'PC GAMING SHOW',
      brandColor : '#00d4ff',
      cdColor    : '#00d4ff',
      cdBg       : 'rgba(0,212,255,0.07)',
      cdBorder   : 'rgba(0,212,255,0.25)'
    }
  ];

  var ARCHIVE_DAYS = 7;   /* días tras el evento para pasarlo a histórico */

  /* ── ESTADO ─────────────────────────────────────────────────── */
  var db            = null;
  var _cards        = [];
  var _activeCardId = null;
  var _player       = 'Javi';
  var _unsubCard    = null;
  var _editingCardId= null;
  var _prevWinCount = 0;
  var _currentEvtIdx= 0;
  var _cdInterval   = null;

  /* Todas las líneas ganadoras: 5 filas + 5 columnas + 2 diagonales */
  var LINES = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20]
  ];

  /* ── HELPERS EVENTOS ────────────────────────────────────────── */
  function isHistoric(ev) {
    return Date.now() > new Date(ev.isoDate).getTime() + ARCHIVE_DAYS * 86400000;
  }

  function getCardsForEvent(idx) {
    var ev = EVENTS[idx];
    return _cards.filter(function (c) {
      /* Tarjetas sin eventoId (legacy) → van con el primer evento */
      return c.eventoId === ev.id || (!c.eventoId && idx === 0);
    });
  }

  /* ── INIT ───────────────────────────────────────────────────── */
  function init() {
    waitForDb(function (firedb) {
      db = firedb;
      loadCards();
    });

    /* Índice inicial: el primer evento no archivado (o el último si todos archivados) */
    var firstActive = 0;
    for (var i = 0; i < EVENTS.length; i++) {
      if (!isHistoric(EVENTS[i])) { firstActive = i; break; }
      firstActive = i;
    }
    _currentEvtIdx = firstActive;

    renderFeaturedEvent(_currentEvtIdx);
    renderCarouselDots();
    updateCarouselNav();

    document.getElementById('evtPrev').addEventListener('click', function () { goToEvent(_currentEvtIdx - 1); });
    document.getElementById('evtNext').addEventListener('click', function () { goToEvent(_currentEvtIdx + 1); });

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

  /* ── CARRUSEL ───────────────────────────────────────────────── */
  function goToEvent(idx) {
    if (idx < 0 || idx >= EVENTS.length) return;
    _currentEvtIdx = idx;
    _activeCardId  = null;   /* reset para buscar la primera tarjeta del nuevo evento */
    renderFeaturedEvent(idx);
    renderCarouselDots();
    updateCarouselNav();
    renderBingoSection();
  }

  function renderFeaturedEvent(idx) {
    var ev     = EVENTS[idx];
    var target = new Date(ev.isoDate).getTime();
    var diff   = target - Date.now();
    var isLive = diff <= 0;
    var badgeText = isLive ? '🔴 EN DIRECTO' : (diff < 86400000 ? '¡HOY!' : 'PRÓXIMAMENTE');
    var badgeCls  = isLive ? 'evt-badge evt-badge--live' : 'evt-badge';

    var visualHtml = ev.img
      ? '<div class="evt-featured__img-wrap"><img src="' + escHtml(ev.img) + '" class="evt-featured__img" alt="' + escHtml(ev.nombre) + '" loading="eager"></div>'
      : '<div class="evt-featured__img-wrap evt-featured__placeholder"><div class="evt-featured__placeholder-icon">🎮</div><div class="evt-featured__placeholder-lbl">' + escHtml(ev.nombre) + '</div></div>';

    var cdUnit = function (id) {
      return '<div class="evt-cd-unit" style="background:' + ev.cdBg + ';border-color:' + ev.cdBorder + '">' +
        '<span class="evt-cd-val" id="' + id + '" style="color:' + ev.cdColor + ';text-shadow:0 0 12px ' + ev.cdColor + '80">--</span>' +
        '<span class="evt-cd-lbl">' + { evtCdDays:'días', evtCdHours:'horas', evtCdMins:'min', evtCdSecs:'seg' }[id] + '</span>' +
      '</div>';
    };
    var cdSep = '<span class="evt-cd-sep" style="color:' + ev.cdColor + '40">:</span>';

    var container = document.getElementById('evtFeaturedCard');
    container.innerHTML =
      '<div class="evt-featured__visual">' +
        visualHtml +
        '<div class="' + badgeCls + '" id="evtBadge">' + badgeText + '</div>' +
        '<div style="position:absolute;bottom:0.7rem;right:0.7rem;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);border-radius:6px;padding:0.3rem 0.55rem;border:1px solid rgba(255,255,255,0.1)">' +
          '<span style="font-family:\'Orbitron\',sans-serif;font-size:0.6rem;font-weight:700;color:' + ev.brandColor + ';letter-spacing:0.1em">' + escHtml(ev.brand) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="evt-featured__info">' +
        '<div class="evt-featured__header">' +
          '<div class="evt-featured__tag">' + escHtml(ev.tag) + '</div>' +
          '<h2 class="evt-featured__name">' + escHtml(ev.nombre) + '</h2>' +
          '<p class="evt-featured__desc">' + ev.desc + '</p>' +
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
            cdUnit('evtCdDays') + cdSep + cdUnit('evtCdHours') + cdSep + cdUnit('evtCdMins') + cdSep + cdUnit('evtCdSecs') +
          '</div>' +
        '</div>' +
        '<a href="' + escHtml(ev.link) + '" class="btn btn-primary evt-featured__link" target="_blank" style="display:inline-flex;gap:0.45rem;align-items:center;background:' + ev.linkBg + ';border-color:' + ev.linkBorder + '">' +
          escHtml(ev.linkLabel) +
        '</a>' +
      '</div>';

    startCountdown(ev);
  }

  function startCountdown(ev) {
    if (_cdInterval) clearInterval(_cdInterval);
    var target = new Date(ev.isoDate).getTime();

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      var dDays  = document.getElementById('evtCdDays');
      if (!dDays) { clearInterval(_cdInterval); return; }   /* DOM reemplazado */
      var dHours = document.getElementById('evtCdHours');
      var dMins  = document.getElementById('evtCdMins');
      var dSecs  = document.getElementById('evtCdSecs');
      var badge  = document.getElementById('evtBadge');
      var diff   = target - Date.now();

      if (diff <= 0) {
        dDays.textContent = dHours.textContent = dMins.textContent = dSecs.textContent = '00';
        if (badge && !badge.classList.contains('evt-badge--live')) {
          badge.textContent = '🔴 EN DIRECTO';
          badge.classList.add('evt-badge--live');
        }
        return;
      }

      dDays.textContent  = pad(Math.floor(diff / 86400000));
      dHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
      dMins.textContent  = pad(Math.floor((diff % 3600000) / 60000));
      dSecs.textContent  = pad(Math.floor((diff % 60000) / 1000));

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
    if (EVENTS.length <= 1) { dots.innerHTML = ''; return; }
    dots.innerHTML = EVENTS.map(function (ev, i) {
      var cls = 'evt-dot' + (i === _currentEvtIdx ? ' evt-dot--active' : '');
      return '<button class="' + cls + '" onclick="window.GT_Bingo.goToEvent(' + i + ')" title="' + escHtml(ev.nombre) + '" aria-label="' + escHtml(ev.nombre) + '"></button>';
    }).join('');
  }

  function updateCarouselNav() {
    var prev = document.getElementById('evtPrev');
    var next = document.getElementById('evtNext');
    if (prev) prev.disabled = (_currentEvtIdx === 0);
    if (next) next.disabled = (_currentEvtIdx === EVENTS.length - 1);
  }

  /* ── HISTÓRICO ──────────────────────────────────────────────── */
  function renderHistorico() {
    var el = document.getElementById('evtHistorico');
    if (!el) return;
    var historic = EVENTS.filter(isHistoric);
    if (historic.length === 0) { el.style.display = 'none'; return; }
    el.style.display = '';

    var grid = document.getElementById('evtHistoricoGrid');
    if (!grid) return;
    grid.innerHTML = historic.map(function (ev, hi) {
      var evIdx    = EVENTS.indexOf(ev);
      var evCards  = getCardsForEvent(evIdx);
      var imgHtml  = ev.img
        ? '<img src="' + escHtml(ev.img) + '" class="evt-hist-card__img" alt="' + escHtml(ev.nombre) + '">'
        : '<div class="evt-hist-card__noimg">🎮</div>';
      var bingoBadge = evCards.length > 0
        ? '<div class="evt-hist-card__bingos">🎰 ' + evCards.length + ' bingo' + (evCards.length !== 1 ? 's' : '') + ' archivado' + (evCards.length !== 1 ? 's' : '') + '</div>'
        : '';
      return '<div class="evt-hist-card">' +
        '<div class="evt-hist-card__thumb">' + imgHtml + '</div>' +
        '<div class="evt-hist-card__body">' +
          '<div class="evt-hist-card__tag">' + escHtml(ev.tag) + '</div>' +
          '<div class="evt-hist-card__name">' + escHtml(ev.nombre) + '</div>' +
          '<div class="evt-hist-card__date">' + escHtml(ev.fechaLabel) + '</div>' +
          bingoBadge +
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

  /* ── SECCIÓN BINGO (filtrada por evento actual) ─────────────── */
  function renderBingoSection() {
    var ev      = EVENTS[_currentEvtIdx];
    var evCards = getCardsForEvent(_currentEvtIdx);

    /* Actualizar subtítulo */
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

    var letters     = ['B','I','N','G','O'];
    var headerHtml  = letters.map(function (l) {
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
          (marked
            ? '<div class="bingo-cell__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" width="28" height="28"><polyline points="20 6 9 17 4 12"/></svg></div>'
            : '') +
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
      var cell  = cells[cellIndex];
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
        var osc  = ctx.createOscillator();
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
    var ev = EVENTS[_currentEvtIdx];
    document.getElementById('bingoModalHeading').textContent = 'Nuevo Bingo — ' + ev.nombre;
    document.getElementById('bingoModalName').value = ev.nombre;
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
      var text    = cell ? (isLibre ? '' : (cell.texto || '')) : '';
      var inp = document.createElement('input');
      inp.type = 'text'; inp.maxLength = 60;
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
    var cells  = Array.from(inputs).map(function (inp) {
      var libre = inp.classList.contains('bingo-modal-input--free');
      return {
        texto     : libre ? 'LIBRE' : inp.value.trim(),
        marcada   : libre,
        libre     : libre,
        marcadoPor: null,
        marcadaAt : null
      };
    });

    if (_editingCardId) {
      db.collection('bingo_cards').doc(_editingCardId)
        .update({ titulo: nombre, cells: cells })
        .then(closeCardModal);
    } else {
      var ev = EVENTS[_currentEvtIdx];
      db.collection('bingo_cards').add({
        titulo    : nombre,
        eventoId  : ev.id,           /* ← vincula al evento actual */
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
    goToEvent      : goToEvent,
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
