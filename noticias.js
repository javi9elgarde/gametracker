/* ============================================================
   GAMETRACKER — Noticias Page
   RSS feed via rss2json.com + Firestore featured news
   ============================================================ */
(function () {
  'use strict';

  /* ── Fuentes RSS ─────────────────────────────────────────── */
  var SOURCES = {
    hobbyconsolas: {
      label: 'HobbyConsolas',
      rss:   'https://www.hobbyconsolas.com/rss/portada.xml',
      color: '#00c7ff'
    },
    vandal: {
      label: 'Vandal',
      rss:   'https://vandal.elespanol.com/feed/',
      color: '#f59e0b'
    },
    meristation: {
      label: 'Meristation',
      rss:   'https://as.com/meristation/feed.rss',
      color: '#22c55e'
    }
  };

  /* Proxies para evitar CORS. Se intenta el primero; si falla, el segundo */
  var PROXIES = [
    'https://api.rss2json.com/v1/api.json?count=24&rss_url=',
    null  /* fallback: allorigins + parse XML manual */
  ];
  var ALLORIGINS = 'https://api.allorigins.win/raw?url=';

  /* ── Estado ──────────────────────────────────────────────── */
  var _news        = [];
  var _source      = 'hobbyconsolas';
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

  /* ── Parse XML RSS manualmente (fallback) ───────────────── */
  function parseXmlItems(xmlText) {
    var parser = new DOMParser();
    var doc    = parser.parseFromString(xmlText, 'text/xml');
    var items  = Array.from(doc.querySelectorAll('item'));
    return items.slice(0, 24).map(function (it) {
      var title       = it.querySelector('title');
      var link        = it.querySelector('link');
      var pubDate     = it.querySelector('pubDate');
      var description = it.querySelector('description');
      var enclosure   = it.querySelector('enclosure');
      var mediaCont   = it.querySelector('content');  /* media:content */
      var imgUrl = '';
      if (mediaCont && mediaCont.getAttribute('url')) imgUrl = mediaCont.getAttribute('url');
      else if (enclosure && enclosure.getAttribute('url')) imgUrl = enclosure.getAttribute('url');
      return {
        title:       title       ? title.textContent.trim()       : '',
        link:        link        ? (link.textContent.trim() || link.getAttribute('href') || '') : '',
        pubDate:     pubDate     ? pubDate.textContent.trim()     : '',
        description: description ? description.textContent.trim() : '',
        thumbnail:   imgUrl
      };
    });
  }

  /* ── Fetch RSS vía rss2json, con fallback a allorigins ──── */
  function fetchNews(source) {
    if (_loading) return;
    _loading = true;
    _source  = source || _source;
    _news    = [];

    var src = SOURCES[_source];
    if (!src) { setStatus('Fuente no disponible', false); _loading = false; return; }

    setStatus('Cargando ' + src.label + '...', false);
    document.getElementById('newsGrid').innerHTML = '';

    /* Intento 1: rss2json */
    var rss2url = 'https://api.rss2json.com/v1/api.json?count=24&rss_url=' + encodeURIComponent(src.rss);

    fetch(rss2url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.status !== 'ok' || !data.items || !data.items.length) throw new Error('rss2json vacío');
        _loading = false;
        _news = data.items;
        setStatus('', true);
        renderGrid();
      })
      .catch(function () {
        /* Intento 2: allorigins + parse XML */
        var aoUrl = ALLORIGINS + encodeURIComponent(src.rss);
        fetch(aoUrl)
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
          })
          .then(function (xml) {
            var items = parseXmlItems(xml);
            if (!items.length) throw new Error('Feed vacío');
            _loading = false;
            _news = items;
            setStatus('', true);
            renderGrid();
          })
          .catch(function (err) {
            _loading = false;
            setStatus('', true);
            renderError(err.message);
          });
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
      fetchNews('hobbyconsolas');
    });
  });

  /* ── Exponer para botones inline ─────────────────────────── */
  window.GT_News = {
    retry: function () { _loading = false; fetchNews(_source); }
  };

})();
