/* ============================================================
   MEDIA TRACKER — Capa de datos y utilidades compartidas
   Version: 20260522a
   ============================================================ */
window.MT = window.MT || {};

(function () {
  'use strict';

  /* ── COLECCIÓN FIREBASE ─────────────────────────────────── */
  var COLLECTION = 'mt_items';

  /* ── GÉNEROS POR CATEGORÍA ──────────────────────────────── */
  var GENEROS = {
    peliculas: [
      'Acción', 'Aventura', 'Animación', 'Ciencia ficción', 'Comedia',
      'Drama', 'Fantásía', 'Horror', 'Musical', 'Misterio',
      'Romance', 'Suspense', 'Terror', 'Thriller', 'Western',
      'Documental', 'Biográfico', 'Histórico', 'Superhéroes', 'Deportes'
    ],
    series: [
      'Acción', 'Aventura', 'Comedia', 'Crimen', 'Ciencia ficción',
      'Drama', 'Fantasía', 'Horror', 'Misterio', 'Romance',
      'Suspense', 'Thriller', 'Documental', 'Reality', 'Superhéroes',
      'Histórico', 'Procedural', 'Mini-serie', 'Telenovela', 'Animación'
    ],
    anime: [
      'Shonen', 'Shojo', 'Seinen', 'Josei', 'Kodomomuke',
      'Isekai', 'Mecha', 'Slice of Life', 'Deportes', 'Comedia',
      'Romance', 'Drama', 'Acción', 'Aventura', 'Fantasía',
      'Ciencia ficción', 'Horror', 'Misterio', 'Sobrenatural', 'Psicológico'
    ]
  };

  /* ── PLATAFORMAS ─────────────────────────────────────────── */
  var PLATAFORMAS = {
    peliculas: ['Netflix', 'HBO Max', 'Disney+', 'Prime Video', 'Movistar+', 'Apple TV+', 'Filmin', 'Mubi', 'Cine', 'Blu-ray / DVD'],
    series:    ['Netflix', 'HBO Max', 'Disney+', 'Prime Video', 'Movistar+', 'Apple TV+', 'Filmin', 'Atresplayer', 'RTVE Play', 'Peacock'],
    anime:     ['Crunchyroll', 'Netflix', 'Funimation', 'Prime Video', 'Disney+', 'HBO Max', 'HIDIVE', 'ADN']
  };

  /* ── ESTADOS ─────────────────────────────────────────────── */
  var ESTADOS = {
    peliculas: ['Visto', 'Viendo', 'Pendiente', 'Abandonado'],
    series:    ['Terminada', 'Viendo', 'Pendiente', 'Pausada', 'Abandonada'],
    anime:     ['Terminado', 'Viendo', 'Pendiente', 'Pausado', 'Abandonado']
  };

  /* ── ESTADO ACTUAL ───────────────────────────────────────── */
  var _player = 'Javi';
  var _cat    = 'peliculas';
  var _db     = null;

  function getPlayer() { return _player; }
  function getCat()    { return _cat; }
  function getDb()     { return _db; }

  /* ── INICIALIZAR DESDE LOCALSTORAGE + URL ─────────────────── */
  function init() {
    try {
      _player = localStorage.getItem('MT_player') || 'Javi';
      var urlCat = new URLSearchParams(window.location.search).get('cat');
      _cat = urlCat || localStorage.getItem('MT_cat') || 'peliculas';
    } catch (e) {}

    /* Aplicar tema visual */
    applyTheme(_cat);

    /* Esperar Firebase y configurar db */
    waitForFirebase(function (db) {
      _db = db;
      window.MT.db = db;
    });
  }

  function waitForFirebase(cb) {
    if (window.firebase && window.firebase.firestore) {
      cb(window.firebase.firestore());
      return;
    }
    setTimeout(function () { waitForFirebase(cb); }, 60);
  }

  /* ── TEMA VISUAL ─────────────────────────────────────────── */
  function applyTheme(cat) {
    document.documentElement.setAttribute('data-mt-cat', cat || 'peliculas');
    /* Actualizar color de meta theme-color */
    var accent = cat === 'series' ? '#4361ee' : cat === 'anime' ? '#b5179e' : '#e63946';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = accent;
    /* Actualizar title tag según categoría */
    updateCatUI(cat);
  }

  function updateCatUI(cat) {
    /* Tabs */
    document.querySelectorAll('.mt-cat-tab').forEach(function (tab) {
      tab.classList.toggle('mt-cat-tab--active', tab.dataset.cat === cat);
    });
    /* Player pill */
    updatePlayerPill();
  }

  function updatePlayerPill() {
    var pill = document.getElementById('mtPlayerPill');
    if (!pill) return;
    pill.querySelector('.mt-nav__player-avatar').className =
      'mt-nav__player-avatar mt-nav__player-avatar--' + _player.toLowerCase();
    pill.querySelector('.mt-nav__player-avatar').textContent = _player.charAt(0);
    var nameEl = pill.querySelector('.mt-player-pill-name');
    if (nameEl) nameEl.textContent = _player;
  }

  /* ── UTILS ───────────────────────────────────────────────── */
  function escHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatNota(nota) {
    if (nota === null || nota === undefined || nota === '') return '—';
    return parseFloat(nota).toFixed(1).replace('.', ',');
  }

  function notaColor(nota) {
    if (!nota && nota !== 0) return '#6b7280';
    var n = Math.max(0, Math.min(10, parseFloat(nota)));
    var hue = Math.round(n * 12);
    return 'hsl(' + hue + ',80%,52%)';
  }

  function statusClass(estado) {
    if (!estado) return 'pendiente';
    return estado.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')  /* quitar tildes */
      .replace(/[^a-z]/g, '');
  }

  function calcNotaMedia(jugadores) {
    if (!jugadores) return null;
    var vals = Object.values(jugadores)
      .map(function (j) { return j && j.nota !== null && j.nota !== undefined && j.nota !== '' ? parseFloat(j.nota) : null; })
      .filter(function (v) { return v !== null && !isNaN(v); });
    if (vals.length === 0) return null;
    return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
  }

  function playerDotClass(estado) {
    if (!estado) return 'mt-card__dot--none';
    var e = estado.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
    if (e === 'visto' || e === 'terminado' || e === 'terminada') return 'mt-card__dot--visto';
    if (e === 'viendo') return 'mt-card__dot--viendo';
    if (e === 'abandonado' || e === 'abandonada') return 'mt-card__dot--abandonado';
    if (e === 'pausado' || e === 'pausada') return 'mt-card__dot--abandonado';
    return 'mt-card__dot--pendiente';
  }

  function catLabel(cat) {
    return { peliculas: '🎬 Películas', series: '📺 Series', anime: '🌸 Anime' }[cat] || cat;
  }

  function catEmoji(cat) {
    return { peliculas: '🎬', series: '📺', anime: '🌸' }[cat] || '🎬';
  }

  /* ── HIDE LOADING ────────────────────────────────────────── */
  function hideLoading() {
    var el = document.getElementById('mtLoading');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(function () { el.style.display = 'none'; }, 420);
  }

  /* ── CAMBIO DE CATEGORÍA (desde tabs nav) ─────────────────── */
  function switchCat(newCat) {
    if (newCat === _cat) return;
    _cat = newCat;
    try { localStorage.setItem('MT_cat', newCat); } catch (e) {}
    applyTheme(newCat);
    /* Re-cargar la página con nuevo param */
    var url = new URL(window.location.href);
    url.searchParams.set('cat', newCat);
    window.history.pushState({}, '', url.toString());
    /* Notificar a la página que recargue datos */
    window.dispatchEvent(new CustomEvent('mt:catChange', { detail: { cat: newCat } }));
  }

  /* ── NAV: click en tabs ──────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.mt-cat-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchCat(this.dataset.cat);
      });
    });
    updatePlayerPill();
  });

  /* ── EXPOSE ──────────────────────────────────────────────── */
  window.MT = {
    init        : init,
    getPlayer   : getPlayer,
    getCat      : getCat,
    getDb       : function () { return _db; },
    applyTheme  : applyTheme,
    switchCat   : switchCat,
    hideLoading : hideLoading,
    GENEROS     : GENEROS,
    PLATAFORMAS : PLATAFORMAS,
    ESTADOS     : ESTADOS,
    Utils: {
      escHtml      : escHtml,
      formatNota   : formatNota,
      notaColor    : notaColor,
      statusClass  : statusClass,
      calcNotaMedia: calcNotaMedia,
      playerDotClass: playerDotClass,
      catLabel     : catLabel,
      catEmoji     : catEmoji
    }
  };

  /* Auto-init cuando el DOM esté listo */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
