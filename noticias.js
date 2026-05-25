/* ============================================================
   GAMETRACKER — Noticias Page
   RSS feed via rss2json.com + Firestore featured news
   ============================================================ */
(function () {
  'use strict';

  /* ── Fuentes RSS ─────────────────────────────────────────── */
  var SOURCES = {
    eurogamer: {
      label: 'Eurogamer España',
      rss:   'https://www.eurogamer.es/feed',
      color: '#00c7ff'
    },
    vandal: {
      label: 'Vandal',
      rss:   'https://vandal.elespanol.com/rss/feed.xml',
      color: '#f59e0b'
    },
    '3djuegos': {
      label: '3DJuegos',
      rss:   'https://www.3djuegos.com/noticias/rss.xml',
      color: '#22c55e'
    }
  };

  var RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json?count=24&rss_url=';

  /* ── Estado ──────────────────────────────────────────────── */
  var _news        = [];
  var _source      = 'eurogamer';
  var _featuredUrl = null;
  var _loading     = false;
  var _db          = null;

  /* ── Esperar Firestore ───────────────────────────────────── */
  function waitForDb(cb) {
    if (window.GT && window.GT.db) { _db = window.GT.db; return cb(); }
    setTimeout(function () { waitForDb(cb); }, 100);
  }

  /* ── Utilidades ──────────────────────────────────────────── */
  function escHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function stripHtml(html) {
    return (html || '').replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function formatDate(str) {
    try {
      var d = new Date(str);
      if (isNaN(d)) return '';
      return d.toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' });
    } catch (e) { return ''; }
  }

  function extractImg(item) {
    /* 1. thumbnail del feed */
    if (item.thumbnail && item.thumbnail.indexOf('http') === 0) return item.thumbnail;
    /* 2. enclosure */
    if (item.enclosure && item.enclosure.link && item.enclosure.link.indexOf('http') === 0) {
      var t = item.enclosure.type || '';
      if (t.indexOf('image') !== -1 || item.enclosure.link.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
        return item.enclosure.link;
      }
    }
    /* 3. primera imagen en description */
    var m = (item.description || '').match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m && m[1]) return m[1];
    return '';
  }

  /* ── Mostrar/ocultar spinner ─────────────────────────────── */
  function setStatus(text, hide) {
    var st = document.getElementById('newsStatus');
    var tx = document.getElementById('newsStatusText');
    if (!st) return;
    if (hide) { st.style.display = 'none'; return; }
    st.style.display = 'flex';
    if (tx) tx.textContent = text || 'Cargando...';
  }

  /* ── Fetch RSS via rss2json ──────────────────────────────── */
  function fetchNews(source) {
    if (_loading) return;
    _loading = true;
    _source  = source || _source;
    _news    = [];

    var src = SOURCES[_source];
    if (!src) { setStatus('Fuente no disponible', false); _loading = false; return; }

    setStatus('Cargando ' + src.label + '...', false);
    document.getElementById('newsGrid').innerHTML = '';

    var url = RSS2JSON_BASE + encodeURIComponent(src.rss);

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        _loading = false;
        if (data.status !== 'ok' || !data.items || !data.items.length) {
          throw new Error('Sin artículos en el feed');
        }
        _news = data.items;
        setStatus('', true);
        renderGrid();
      })
      .catch(function (err) {
        _loading = false;
        setStatus('', true);
        renderError(err.message);
      });
  }

  /* ── Error ───────────────────────────────────────────────── */
  function renderError(msg) {
    var grid = document.getElementById('newsGrid');
    if (!grid) return;
    grid.innerHTML =
      '<div class="news-error">' +
        '<div class="news-error__icon">📡</div>' +
        '<div class="news-error__title">No se pudieron cargar las noticias</div>' +
        '<div class="news-error__msg">' + escHtml(msg || 'Error de conexión') + '</div>' +
        '<div class="news-error__hint">Puede deberse a un límite del proxy RSS o a que la fuente no esté disponible en este momento.</div>' +
        '<button class="btn btn-secondary" onclick="window.GT_News.retry()">🔄 Reintentar</button>' +
      '</div>';
  }

  /* ── Render grid ─────────────────────────────────────────── */
  function renderGrid() {
    var grid = document.getElementById('newsGrid');
    if (!grid || !_news.length) return;

    grid.innerHTML = _news.map(function (item, idx) {
      return renderCard(item, idx);
    }).join('');

    /* Listeners de estrella */
    grid.querySelectorAll('.news-star-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var idx = parseInt(this.dataset.idx);
        if (!isNaN(idx) && _news[idx]) featureNews(_news[idx]);
      });
    });
  }

  /* ── Render una tarjeta ──────────────────────────────────── */
  function renderCard(item, idx) {
    var img       = extractImg(item);
    var isFeatured = _featuredUrl && item.link === _featuredUrl;
    var excerpt   = stripHtml(item.description || '').slice(0, 160);
    var date      = formatDate(item.pubDate);
    var src       = SOURCES[_source] || {};

    return '<div class="news-card' + (isFeatured ? ' news-card--featured' : '') + '">' +
      '<a href="' + escHtml(item.link) + '" target="_blank" rel="noopener noreferrer" class="news-card__img-wrap">' +
        (img
          ? '<img src="' + escHtml(img) + '" class="news-card__img" alt="" loading="lazy" onerror="this.parentElement.classList.add(\'news-card__img-wrap--ph\')">'
          : '') +
        '<div class="news-card__img-ph' + (img ? ' news-card__img-ph--hidden' : '') + '"><span>📰</span></div>' +
        '<div class="news-card__source-badge" style="--src-color:' + src.color + '">' + escHtml(src.label || '') + '</div>' +
      '</a>' +
      '<div class="news-card__body">' +
        (date ? '<div class="news-card__date">' + escHtml(date) + '</div>' : '') +
        '<a href="' + escHtml(item.link) + '" target="_blank" rel="noopener noreferrer" class="news-card__title-link">' +
          '<h3 class="news-card__title">' + escHtml(item.title || '') + '</h3>' +
        '</a>' +
        (excerpt ? '<p class="news-card__excerpt">' + escHtml(excerpt) + (excerpt.length >= 160 ? '…' : '') + '</p>' : '') +
        '<div class="news-card__footer">' +
          '<a href="' + escHtml(item.link) + '" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">Leer →</a>' +
          '<button class="news-star-btn' + (isFeatured ? ' news-star-btn--active' : '') + '" data-idx="' + idx + '" title="' + (isFeatured ? 'Noticia destacada en el inicio' : 'Destacar en el inicio') + '">' +
            (isFeatured ? '⭐' : '☆') +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── Destacar noticia en Firestore ───────────────────────── */
  function featureNews(item) {
    if (!_db) return;
    var img = extractImg(item);
    var data = {
      title:   item.title   || '',
      img:     img,
      url:     item.link    || '',
      source:  (SOURCES[_source] || {}).label || '',
      pubDate: item.pubDate || '',
      excerpt: stripHtml(item.description || '').slice(0, 220)
    };
    /* Si ya estaba destacada, la des-destaca */
    if (_featuredUrl === item.link) {
      _db.collection('settings').doc('featuredNews').delete()
        .then(function () {
          _featuredUrl = null;
          renderGrid();
          renderFeaturedBanner(null);
          if (window.GT && window.GT.Toast) window.GT.Toast.show('Noticia eliminada del inicio');
        });
      return;
    }
    _db.collection('settings').doc('featuredNews').set(data)
      .then(function () {
        _featuredUrl = item.link;
        renderGrid();
        renderFeaturedBanner(data);
        if (window.GT && window.GT.Toast) window.GT.Toast.show('⭐ Noticia destacada en el inicio');
      })
      .catch(function () {
        if (window.GT && window.GT.Toast) window.GT.Toast.show('Error al guardar', 'error');
      });
  }

  /* ── Banner de noticia destacada ─────────────────────────── */
  function renderFeaturedBanner(data) {
    var banner = document.getElementById('featuredNewsBanner');
    if (!banner) return;
    if (!data || !data.title) { banner.style.display = 'none'; return; }
    banner.style.display = '';
    banner.innerHTML =
      '<a href="' + escHtml(data.url) + '" target="_blank" rel="noopener noreferrer" class="news-featured-inner">' +
        (data.img
          ? '<div class="news-featured__img-wrap"><img src="' + escHtml(data.img) + '" class="news-featured__img" alt=""></div>'
          : '') +
        '<div class="news-featured__body">' +
          '<div class="news-featured__label">⭐ Noticia Destacada en Inicio</div>' +
          '<h2 class="news-featured__title">' + escHtml(data.title) + '</h2>' +
          (data.excerpt ? '<p class="news-featured__excerpt">' + escHtml(data.excerpt.slice(0, 180)) + '…</p>' : '') +
          '<div class="news-featured__meta">' +
            escHtml(data.source || '') +
            (data.pubDate ? ' · ' + formatDate(data.pubDate) : '') +
          '</div>' +
        '</div>' +
      '</a>';
  }

  /* ── Cargar featured desde Firestore ─────────────────────── */
  function loadFeatured() {
    if (!_db) return;
    _db.collection('settings').doc('featuredNews').onSnapshot(function (doc) {
      if (doc.exists) {
        var data = doc.data();
        _featuredUrl = data.url || null;
        renderFeaturedBanner(data);
      } else {
        _featuredUrl = null;
        renderFeaturedBanner(null);
      }
      /* Re-renderizar grid para actualizar el estado de las estrellas */
      if (_news.length) renderGrid();
    });
  }

  /* ── Tabs de fuente ──────────────────────────────────────── */
  function initTabs() {
    document.querySelectorAll('.news-source-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.news-source-tab').forEach(function (t) {
          t.classList.remove('news-source-tab--active');
        });
        this.classList.add('news-source-tab--active');
        fetchNews(this.dataset.source);
      });
    });
  }

  /* ── Init ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();

    var refreshBtn = document.getElementById('btnRefreshNews');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        _loading = false;
        fetchNews(_source);
      });
    }

    /* Ocultar el loading overlay de la página */
    var overlay = document.getElementById('gtLoading');
    if (overlay) {
      setTimeout(function () {
        overlay.style.transition = 'opacity 0.4s';
        overlay.style.opacity = '0';
        setTimeout(function () { overlay.style.display = 'none'; }, 420);
      }, 600);
    }

    /* Esperar a Firestore y arrancar */
    waitForDb(function () {
      loadFeatured();
      fetchNews('eurogamer');
    });
  });

  /* ── Exponer para botones inline ─────────────────────────── */
  window.GT_News = {
    retry: function () { _loading = false; fetchNews(_source); }
  };

})();
