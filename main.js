/* ============================================================
   GAMETRACKER — Data Layer & Shared Utilities (Firebase version)
   Version: 20260518b
   ============================================================ */

window.GT = window.GT || {};

/* ── UTILS ──────────────────────────────────────────────────── */
window.GT.Utils = (function () {
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  function scoreColor(score) {
    if (score === null || score === undefined || score === '') return '#6b7280';
    var s = Math.max(0, Math.min(10, parseFloat(score)));
    // Verde (120°) → Amarillo (60°) → Rojo (0°)
    var hue = Math.round(s * 12);
    return 'hsl(' + hue + ',90%,52%)';
  }
  function scoreWidth(score) {
    if (!score) return '0%';
    return (Math.min(parseFloat(score), 10) * 10) + '%';
  }
  function formatScore(score) {
    if (score === null || score === undefined || score === '') return '—';
    return parseFloat(score).toFixed(2).replace('.', ',');
  }
  var MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  function monthName(m) { return MONTHS[(m - 1)] || ''; }
  function platformClass(plat) {
    var map = {
      'PS5':'plat-ps5','PS4':'plat-ps4','PS3':'plat-ps3','PC':'plat-pc',
      'Xbox Series X':'plat-xbox-series-x','Xbox One':'plat-xbox-one','Xbox 360':'plat-xbox-360',
      'Nintendo Switch 2':'plat-nintendo-switch-2','Nintendo Switch':'plat-nintendo-switch'
    };
    return map[plat] || 'plat-pc';
  }
  function playerBadge(jugador) {
    var map = { 'David':'badge-david','Javi':'badge-javi','Mery':'badge-mery' };
    return map[jugador] || '';
  }
  function statusBadge(estado) {
    var map = {
      'Terminado':'badge-terminado','Jugando':'badge-jugando','Rejugado':'badge-rejugado',
      'Retomar':'badge-retomar','Abandonado':'badge-abandonado','Jugado':'badge-jugado'
    };
    return map[estado] || '';
  }
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function platformBadgesHtml(platforms) {
    if (!platforms || !platforms.length) return '';
    return platforms.map(function (p) {
      return '<span class="badge badge-plat ' + platformClass(p) + '">' + escapeHtml(p) + '</span>';
    }).join('');
  }
  function genreBadgesHtml(genres) {
    if (!genres || !genres.length) return '';
    return genres.map(function (g) {
      return '<span class="badge badge-genre">' + escapeHtml(g) + '</span>';
    }).join('');
  }
  function formatDuracion(d, short) {
    if (d === null || d === undefined || d === '') return '';
    var n = parseFloat(d);
    if (n >= 999) return short ? '∞' : '∞ Infinitas';
    return short ? '~' + n + 'h' : '~' + n + ' horas';
  }
  return { uuid, scoreColor, scoreWidth, formatScore, formatDuracion, monthName, platformClass,
           playerBadge, statusBadge, escapeHtml, platformBadgesHtml, genreBadgesHtml, MONTHS };
})();

/* ── FIRESTORE SYNC ─────────────────────────────────────────── */
window.GT.FirestoreSync = (function () {
  var bibReady = false;
  var regReady = false;

  function checkReady() {
    if (bibReady && regReady) window.GT._markReady();
  }

  function start() {
    var db = window.GT.db;
    if (!db) { console.error('Firestore no inicializado'); return; }

    db.collection('biblioteca').onSnapshot(function (snap) {
      window.GT._cache.biblioteca = snap.docs.map(function (d) {
        return Object.assign({ id: d.id }, d.data());
      });
      if (!bibReady) { bibReady = true; checkReady(); }
      else { window.GT._notifyChange(); }
    }, function (err) { console.error('Biblioteca listener:', err); });

    db.collection('registro').onSnapshot(function (snap) {
      window.GT._cache.registro = snap.docs.map(function (d) {
        return Object.assign({ id: d.id }, d.data());
      });
      if (!regReady) { regReady = true; checkReady(); }
      else { window.GT._notifyChange(); }
    }, function (err) { console.error('Registro listener:', err); });
  }

  return { start };
})();

/* ── BIBLIOTECA ─────────────────────────────────────────────── */
window.GT.Biblioteca = (function () {
  var Utils = window.GT.Utils;

  function getAll()   { return (window.GT._cache.biblioteca || []).slice(); }
  function getById(id){ return getAll().find(function(g){ return g.id === id; }) || null; }

  function add(data) {
    var id   = Utils.uuid();
    var game = Object.assign(
      { pendiente:false, portadaUrl:'', descripcion:'', duracion:null, creadoEn:new Date().toISOString() },
      data, { id:id }
    );
    window.GT.db.collection('biblioteca').doc(id).set(game)
      .catch(function(e){ console.error('Biblioteca.add:', e); });
    return game;
  }

  function update(id, data) {
    var cache = window.GT._cache.biblioteca;
    var idx   = cache.findIndex(function(g){ return g.id === id; });
    if (idx !== -1) cache[idx] = Object.assign({}, cache[idx], data);
    window.GT.db.collection('biblioteca').doc(id).update(data)
      .catch(function(e){ console.error('Biblioteca.update:', e); });
    return idx !== -1 ? cache[idx] : null;
  }

  function remove(id) {
    window.GT._cache.biblioteca = window.GT._cache.biblioteca.filter(function(g){ return g.id !== id; });
    window.GT.db.collection('biblioteca').doc(id).delete()
      .catch(function(e){ console.error('Biblioteca.remove:', e); });
  }

  function search(query, filters) {
    var all = getAll();
    if (query) {
      var q = query.toLowerCase();
      all = all.filter(function(g){
        return g.titulo.toLowerCase().includes(q) ||
               (g.desarrollador||'').toLowerCase().includes(q) ||
               (g.generos||[]).some(function(gen){ return gen.toLowerCase().includes(q); });
      });
    }
    if (filters) {
      if (filters.genero)     all = all.filter(function(g){ return (g.generos||[]).includes(filters.genero); });
      if (filters.plataforma) all = all.filter(function(g){ return (g.plataformas||[]).includes(filters.plataforma); });
      if (filters.año)        all = all.filter(function(g){ return g.fechaLanzamiento && g.fechaLanzamiento.startsWith(String(filters.año)); });
      if (filters.pendiente !== undefined) all = all.filter(function(g){ return !!g.pendiente === filters.pendiente; });
      if (filters.pendientePor) all = all.filter(function(g){ return (g.pendientePor||[]).includes(filters.pendientePor); });
    }
    return all.sort(function(a,b){ return a.titulo.localeCompare(b.titulo,'es'); });
  }

  function getUpcoming() {
    var today = new Date(); today.setHours(0,0,0,0);
    return getAll().filter(function(g){
      if (!g.fechaLanzamiento || g.fechaLanzamiento.includes('xx')) return false;
      return new Date(g.fechaLanzamiento + 'T00:00:00') >= today;
    }).sort(function(a,b){ return a.fechaLanzamiento.localeCompare(b.fechaLanzamiento); });
  }

  function getAllGenres() {
    var set = {};
    getAll().forEach(function(g){ (g.generos||[]).forEach(function(gen){ set[gen]=true; }); });
    return Object.keys(set).sort();
  }

  function getAllPlatforms() {
    var set = {};
    getAll().forEach(function(g){ (g.plataformas||[]).forEach(function(p){ set[p]=true; }); });
    return Object.keys(set).sort();
  }

  return { getAll, getById, add, update, remove, search, getUpcoming, getAllGenres, getAllPlatforms };
})();

/* ── REGISTRO ───────────────────────────────────────────────── */
window.GT.Registro = (function () {
  var Utils = window.GT.Utils;

  function getAll()    { return (window.GT._cache.registro || []).slice(); }
  function getById(id) { return getAll().find(function(r){ return r.id === id; }) || null; }

  function add(data) {
    var id    = Utils.uuid();
    var entry = Object.assign(
      { horas:null, comentario:'', plataformaJugada:'', fechaRegistro:new Date().toISOString() },
      data, { id:id }
    );
    window.GT.db.collection('registro').doc(id).set(entry)
      .catch(function(e){ console.error('Registro.add:', e); });
    return entry;
  }

  function update(id, data) {
    var cache = window.GT._cache.registro;
    var idx   = cache.findIndex(function(r){ return r.id === id; });
    if (idx !== -1) cache[idx] = Object.assign({}, cache[idx], data);
    window.GT.db.collection('registro').doc(id).update(data)
      .catch(function(e){ console.error('Registro.update:', e); });
    return idx !== -1 ? cache[idx] : null;
  }

  function remove(id) {
    window.GT._cache.registro = window.GT._cache.registro.filter(function(r){ return r.id !== id; });
    window.GT.db.collection('registro').doc(id).delete()
      .catch(function(e){ console.error('Registro.remove:', e); });
  }

  function filter(opts) {
    var all = getAll();
    if (opts.jugador && opts.jugador !== 'All') all = all.filter(function(r){ return r.jugador === opts.jugador; });
    if (opts.año)     all = all.filter(function(r){ return r.año    === parseInt(opts.año); });
    if (opts.mes)     all = all.filter(function(r){ return r.mes    === parseInt(opts.mes); });
    if (opts.estado)  all = all.filter(function(r){ return r.estado === opts.estado; });
    if (opts.juegoId) all = all.filter(function(r){ return r.juegoId === opts.juegoId; });
    return all;
  }

  function getNotaMedia(juegoId, año) {
    var entries = getAll().filter(function(r){
      return r.juegoId === juegoId &&
             (!año || r.año === parseInt(año)) &&
             r.nota !== null && r.nota !== undefined && r.nota !== '';
    });
    if (!entries.length) return null;
    var sum = entries.reduce(function(acc,r){ return acc + parseFloat(r.nota); }, 0);
    return Math.round((sum / entries.length) * 100) / 100;
  }

  function getRanking(año) {
    // Solo aparecen juegos LANZADOS en ese año (no Skyrim en ranking 2026)
    var yearStr = String(año);
    var bib = window.GT.Biblioteca ? window.GT.Biblioteca.getAll() : [];
    var gameIdsThisYear = {};
    bib.forEach(function(g) {
      if (g.tipoLanzamiento) return; // Remasters y relanzamientos excluidos del ranking
      if (g.fechaLanzamiento && g.fechaLanzamiento.startsWith(yearStr)) {
        gameIdsThisYear[g.id] = true;
      }
    });

    var registros = getAll().filter(function(r){
      return gameIdsThisYear[r.juegoId] &&
             r.nota !== null && r.nota !== undefined && r.nota !== '';
    });
    var byGame = {};
    registros.forEach(function(r){
      if (!byGame[r.juegoId]) byGame[r.juegoId] = [];
      byGame[r.juegoId].push(parseFloat(r.nota));
    });
    return Object.keys(byGame).map(function(juegoId){
      var notas = byGame[juegoId];
      return {
        juegoId:   juegoId,
        notaMedia: Math.round((notas.reduce(function(a,b){ return a+b; },0) / notas.length) * 100) / 100,
        numVotos:  notas.length
      };
    }).sort(function(a,b){ return b.notaMedia - a.notaMedia; });
  }

  function getStats(año) {
    var entries = getAll();
    if (año) entries = entries.filter(function(r){ return r.año === parseInt(año); });
    var totalJuegos = new Set(entries.map(function(r){ return r.juegoId; })).size;
    var totalHoras  = entries.reduce(function(acc,r){ return acc + (parseFloat(r.horas)||0); }, 0);
    var conNota     = entries.filter(function(r){ return r.nota !== null && r.nota !== '' && r.nota !== undefined; });
    var avgScore    = conNota.length ? conNota.reduce(function(acc,r){ return acc+parseFloat(r.nota); },0)/conNota.length : 0;
    var porJugador  = {};
    ['David','Javi','Mery'].forEach(function(p){
      var e = entries.filter(function(r){ return r.jugador === p; });
      var h = e.reduce(function(acc,r){ return acc+(parseFloat(r.horas)||0); },0);
      var n = e.filter(function(r){ return r.nota !== null && r.nota !== '' && r.nota !== undefined; });
      porJugador[p] = {
        juegos:   new Set(e.map(function(r){ return r.juegoId; })).size,
        horas:    Math.round(h),
        avgScore: n.length ? Math.round((n.reduce(function(acc,r){ return acc+parseFloat(r.nota); },0)/n.length)*100)/100 : 0,
        entries:  e.length
      };
    });
    return { totalJuegos, totalHoras:Math.round(totalHoras), avgScore:Math.round(avgScore*100)/100, porJugador };
  }

  function getGenreStats(año, jugador) {
    var entries = getAll();
    if (año) entries = entries.filter(function(r){ return r.año === parseInt(año); });
    if (jugador && jugador !== 'All') entries = entries.filter(function(r){ return r.jugador === jugador; });
    var counts = {};
    entries.forEach(function(r){
      var game = window.GT.Biblioteca.getById(r.juegoId);
      if (!game) return;
      (game.generos||[]).forEach(function(g){ counts[g] = (counts[g]||0)+1; });
    });
    return Object.keys(counts).map(function(g){ return { genero:g, count:counts[g] }; })
                              .sort(function(a,b){ return b.count - a.count; });
  }

  function getPlatformStats(año, jugador) {
    var entries = getAll();
    if (año) entries = entries.filter(function(r){ return r.año === parseInt(año); });
    if (jugador && jugador !== 'All') entries = entries.filter(function(r){ return r.jugador === jugador; });
    var counts = {};
    entries.forEach(function(r){
      var p = r.plataformaJugada || 'PC';
      counts[p] = (counts[p]||0)+1;
    });
    return Object.keys(counts).map(function(p){ return { plataforma:p, count:counts[p] }; })
                              .sort(function(a,b){ return b.count - a.count; });
  }

  return { getAll, getById, add, update, remove, filter, getNotaMedia, getRanking, getStats, getGenreStats, getPlatformStats };
})();

/* ── TOAST ──────────────────────────────────────────────────── */
window.GT.Toast = (function () {
  var container;
  function ensure() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }
  function show(msg, type) {
    ensure();
    var el = document.createElement('div');
    el.className = 'toast toast--' + (type||'success');
    el.innerHTML = '<span>' + (type==='error'?'✗':'✓') + '</span><span>' + window.GT.Utils.escapeHtml(msg) + '</span>';
    container.appendChild(el);
    setTimeout(function(){
      el.style.opacity = '0'; el.style.transition = 'opacity 0.3s';
      setTimeout(function(){ if(el.parentNode) container.removeChild(el); }, 300);
    }, 3000);
  }
  return { show };
})();

/* ── GAME DETAIL MODAL (universal, any page) ───────────────── */
window.GT.GameDetailModal = (function () {
  var overlay;

  function fmtDate(d) {
    if (!d) return '';
    var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    var p = d.split('-');
    if (p.length < 2) return d;
    var day = parseInt(p[2], 10);
    var mon = months[parseInt(p[1], 10) - 1] || '';
    return (day ? day + ' ' + mon + ' ' : mon + ' ') + p[0];
  }

  function ensure() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'gdModal';
    overlay.innerHTML =
      '<div class="modal" style="max-width:780px">' +
        '<div class="modal__header">' +
          '<h2 class="modal__title" id="gdTitle">—</h2>' +
          '<button class="modal__close" id="gdClose">✕</button>' +
        '</div>' +
        '<div class="modal__body" id="gdBody"></div>' +
        '<div class="modal__footer">' +
          '<a id="gdEditLink" href="biblioteca.html" class="btn btn-secondary">✏️ Editar</a>' +
          '<a id="gdLibLink"  href="biblioteca.html" class="btn btn-primary">📚 Ver en Biblioteca</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
    document.getElementById('gdClose').addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  }

  function open(gameId) {
    ensure();
    var game     = window.GT.Biblioteca.getById(gameId);
    if (!game) return;
    var Registro = window.GT.Registro;
    var Utils    = window.GT.Utils;

    var notaMedia = Registro.getNotaMedia(gameId);
    var entries   = Registro.filter({ juegoId: gameId });
    var sc        = Utils.scoreColor(notaMedia);
    var enc       = encodeURIComponent(gameId);

    document.getElementById('gdTitle').textContent = game.titulo;
    document.getElementById('gdLibLink').href  = 'biblioteca.html?open=' + enc;
    document.getElementById('gdEditLink').href = 'biblioteca.html?edit=' + enc;

    /* Portada */
    var coverInner = game.portadaUrl
      ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" style="object-position:' + Utils.escapeHtml(game.portadaPos || 'center top') + '" onerror="this.style.display=\'none\'">'
      : '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:Orbitron,sans-serif;font-size:3rem;font-weight:900;color:rgba(79,172,254,0.35)">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</div>';

    /* Bandas sobre la portada */
    var _todayBand  = new Date().toISOString().slice(0, 10);
    var _hasDurBand = game.duracion !== null && game.duracion !== undefined && game.duracion !== '' && parseFloat(game.duracion) > 0;
    var _isFutBand  = game.fechaLanzamiento && game.fechaLanzamiento > _todayBand;
    if (game.earlyAccess)               coverInner += '<div class="detail-cover__ea-band">⚡ EARLY ACCESS</div>';
    if (!_hasDurBand && _isFutBand)     coverInner += '<div class="detail-cover__prox-band">PRÓXIMAMENTE</div>';

    var scGlow = notaMedia !== null ? sc.replace('hsl(', 'hsla(').replace(')', ',0.35)') : 'transparent';
    var scoreBadge = notaMedia !== null
      ? '<div class="detail-score-badge" style="--sc:' + sc + ';--sc-glow:' + scGlow + '">' +
          '<div class="detail-score-badge__val">' + Utils.formatScore(notaMedia) + '</div>' +
          '<div class="detail-score-badge__lbl">NOTA MEDIA</div>' +
        '</div>'
      : '<div class="detail-score-badge detail-score-badge--empty">' +
          '<div class="detail-score-badge__val">SIN NOTA</div>' +
        '</div>';

    /* Stats */
    var stats = '';
    if (game.desarrollador)    stats += '<div class="detail-stat"><span class="detail-stat__icon">🏢</span><span>' + Utils.escapeHtml(game.desarrollador) + '</span></div>';
    if (game.fechaLanzamiento) stats += '<div class="detail-stat"><span class="detail-stat__icon">📅</span><span>' + fmtDate(game.fechaLanzamiento) + '</span></div>';
    if (game.duracion)         stats += '<div class="detail-stat"><span class="detail-stat__icon">⏱</span><span>' + Utils.formatDuracion(game.duracion, false) + '</span></div>';

    var tipoMap  = { remake:'🔄 Remake', remaster:'✨ Remaster', relanzamiento:'📦 Relanzamiento / Port' };
    var tipoHtml = game.tipoLanzamiento
      ? '<div class="detail-tipo">' + (tipoMap[game.tipoLanzamiento] || '') + ' <span style="opacity:0.6">· no computa en rankings</span></div>'
      : '';

    var html =
      '<div class="detail-cover">' +
        '<div class="detail-cover__wrap">' + coverInner + '</div>' +
        scoreBadge +
      '</div>' +
      '<div class="detail-info">' +
        '<div class="detail-badges-row">' +
          (game.earlyAccess ? '<span class="badge badge-ea">⚡ Early Access</span>' : '') +
          Utils.platformBadgesHtml(game.plataformas) +
          Utils.genreBadgesHtml(game.generos) +
        '</div>' +
        (stats ? '<div class="detail-stats-grid">' + stats + '</div>' : '') +
        tipoHtml +
        (game.descripcion ? '<p class="detail-desc">' + Utils.escapeHtml(game.descripcion) + '</p>' : '') +
      '</div>';

    if (entries.length) {
      html += '<div class="detail-entries-hdr">Entradas en el Registro</div>' +
        entries.map(function(r) {
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

    document.getElementById('gdBody').innerHTML = html;
    overlay.classList.add('open');
  }

  function close() { if (overlay) overlay.classList.remove('open'); }
  return { open, close };
})();

/* ── ACTIVE PLAYER ──────────────────────────────────────────── */
window.GT.getActivePlayer = function() {
  try { return localStorage.getItem('GT_player') || null; } catch(e) { return null; }
};
window.GT.setActivePlayer = function(p) {
  try {
    if (p) localStorage.setItem('GT_player', p);
    else localStorage.removeItem('GT_player');
    window.GT.activePlayer = p || null;
  } catch(e) {}
};
window.GT.activePlayer = window.GT.getActivePlayer();

/* ── NAV ────────────────────────────────────────────────────── */
window.GT.Nav = (function () {
  var PLAYER_COLORS   = { David: 'var(--player-david)', Javi: 'var(--player-javi)', Mery: 'var(--player-mery)' };
  var PLAYER_INITIALS = { David: 'D', Javi: 'J', Mery: 'M' };

  function init() {
    try {
      var current = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav__link').forEach(function(a){
        var href = a.getAttribute('href') || '';
        if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
      });
      var ham = document.getElementById('navHamburger');
      var mob = document.getElementById('navMobile');
      if (ham && mob) ham.addEventListener('click', function(){ mob.classList.toggle('open'); });
    } catch(e){}

    /* Active player indicator */
    try {
      var ap = window.GT.getActivePlayer();
      if (ap) {
        var indicator = document.createElement('a');
        indicator.href = 'hub.html';
        indicator.title = 'Jugando como ' + ap + ' · Pulsa para cambiar';
        indicator.className = 'nav__player-pill';
        indicator.innerHTML =
          '<div class="nav__player-av" style="background:' + (PLAYER_COLORS[ap] || '#666') + '">' +
            (PLAYER_INITIALS[ap] || ap[0]) +
          '</div>' +
          '<span class="nav__player-name">' + ap + '</span>';
        var nav = document.querySelector('.nav');
        var hamburger = document.getElementById('navHamburger');
        if (nav && hamburger) nav.insertBefore(indicator, hamburger);
        else if (nav) nav.appendChild(indicator);
      }
    } catch(e){}
  }
  return { init };
})();

/* ── SAMPLE DATA ────────────────────────────────────────────── */
window.GT.SampleData = (function () {

  var GAMES = [
    { id:'g001', titulo:'Dark Souls III', portadaUrl:'', generos:['Soulslike','RPG'], desarrollador:'From Software', plataformas:['PC','PS4','Xbox One'], fechaLanzamiento:'2016-03-24', duracion:40, pendiente:false, descripcion:'' },
    { id:'g002', titulo:'A Way Out', portadaUrl:'', generos:['Acción Aventura'], desarrollador:'Hazelight Studios', plataformas:['PS4','PC','Xbox One'], fechaLanzamiento:'2018-03-23', duracion:6, pendiente:false, descripcion:'' },
    { id:'g003', titulo:'Alan Wake II', portadaUrl:'', generos:['Survival Horror'], desarrollador:'Remedy', plataformas:['PS5','PC','Xbox Series X'], fechaLanzamiento:'2023-10-27', duracion:24, pendiente:false, descripcion:'' },
    { id:'g004', titulo:'Arknights: Endfield', portadaUrl:'', generos:['RPG','Gacha'], desarrollador:'Hypergryph', plataformas:['PC'], fechaLanzamiento:'2025-01-16', duracion:138, pendiente:false, descripcion:'' },
    { id:'g005', titulo:'Red Dead Redemption', portadaUrl:'', generos:['Sandbox','Acción Aventura'], desarrollador:'Rockstar Games', plataformas:['PS5','PC'], fechaLanzamiento:'2010-10-26', duracion:20, pendiente:false, descripcion:'' },
    { id:'g006', titulo:'Wolfenstein II: The New Colossus', portadaUrl:'', generos:['FPS','Acción Aventura'], desarrollador:'MachineGames', plataformas:['PC','PS4','Xbox One'], fechaLanzamiento:'2017-10-27', duracion:12, pendiente:false, descripcion:'' },
    { id:'g007', titulo:'Returnal', portadaUrl:'', generos:['Acción','Roguelike/Roguelite'], desarrollador:'Housemarque', plataformas:['PS5','PC'], fechaLanzamiento:'2021-04-30', duracion:9, pendiente:false, descripcion:'' },
    { id:'g008', titulo:'Fallout New Vegas', portadaUrl:'', generos:['RPG'], desarrollador:'Obsidian Entertainment', plataformas:['PC'], fechaLanzamiento:'2010-10-19', duracion:15, pendiente:false, descripcion:'' },
    { id:'g009', titulo:'Mafia: The Old Country', portadaUrl:'', generos:['Acción Aventura'], desarrollador:'Hangar 13', plataformas:['PS5','PC','Xbox Series X'], fechaLanzamiento:'2025-08-08', duracion:16, pendiente:false, descripcion:'' },
    { id:'g010', titulo:'Resident Evil 7', portadaUrl:'', generos:['Survival Horror'], desarrollador:'Capcom', plataformas:['PC','PS5','Xbox Series X'], fechaLanzamiento:'2017-01-24', duracion:8, pendiente:false, descripcion:'' },
    { id:'g011', titulo:'Resident Evil 9: Requiem', portadaUrl:'', generos:['Survival Horror'], desarrollador:'Capcom', plataformas:['PS5','PC','Xbox Series X'], fechaLanzamiento:'2026-09-12', duracion:null, pendiente:false, descripcion:'' },
    { id:'g012', titulo:'Pragmata', portadaUrl:'', generos:['Acción'], desarrollador:'Capcom', plataformas:['PS5','PC','Xbox Series X'], fechaLanzamiento:'2026-07-17', duracion:null, pendiente:false, descripcion:'' },
    { id:'g013', titulo:'Mixtape', portadaUrl:'', generos:['Aventura','Indie'], desarrollador:'Annapurna Interactive', plataformas:['PS5','PC','Xbox Series X'], fechaLanzamiento:'2026-05-07', duracion:null, pendiente:false, descripcion:'' },
    { id:'g014', titulo:'Saros', portadaUrl:'', generos:['Acción','Roguelike/Roguelite'], desarrollador:'Housemarque', plataformas:['PS5'], fechaLanzamiento:'2026-04-30', duracion:null, pendiente:false, descripcion:'' },
    { id:'g015', titulo:'Cairn', portadaUrl:'', generos:['Aventura'], desarrollador:'Schilder Games', plataformas:['PC'], fechaLanzamiento:'2026-06-15', duracion:null, pendiente:false, descripcion:'' },
    { id:'g016', titulo:'Aphelion', portadaUrl:'', generos:['Acción'], desarrollador:'Kinetic Games', plataformas:['PS5','PC','Xbox Series X'], fechaLanzamiento:'2026-04-28', duracion:null, pendiente:false, descripcion:'' },
    { id:'g017', titulo:'Neverness to Everness', portadaUrl:'', generos:['RPG','Open World'], desarrollador:'Infold Games', plataformas:['PS5','PC','Xbox Series X'], fechaLanzamiento:'2026-04-29', duracion:null, pendiente:false, descripcion:'' },
    { id:'g018', titulo:'Subnautica 2', portadaUrl:'', generos:['Supervivencia','Aventura'], desarrollador:'Unknown Worlds', plataformas:['PC','Xbox Series X'], fechaLanzamiento:'2026-05-14', duracion:null, pendiente:false, descripcion:'' },
    { id:'g019', titulo:'Forza Horizon 6', portadaUrl:'', generos:['Carreras'], desarrollador:'Playground Games', plataformas:['PC','Xbox Series X','PS5'], fechaLanzamiento:'2026-05-19', duracion:null, pendiente:false, descripcion:'' },
    { id:'g020', titulo:'007 First Light', portadaUrl:'', generos:['Acción Aventura'], desarrollador:'IO Interactive', plataformas:['PS5','PC','Xbox Series X'], fechaLanzamiento:'2026-05-27', duracion:null, pendiente:false, descripcion:'' },
    { id:'g021', titulo:'Gambonanza', portadaUrl:'', generos:['Indie'], desarrollador:'Stormind Games', plataformas:['PC'], fechaLanzamiento:'2026-05-01', duracion:null, pendiente:false, descripcion:'' },
    { id:'g022', titulo:'Wax Heads', portadaUrl:'', generos:['Indie','Simulación'], desarrollador:'Indie Dev', plataformas:['PC'], fechaLanzamiento:'2026-05-05', duracion:null, pendiente:false, descripcion:'' },
    { id:'g023', titulo:'REANIMAL', portadaUrl:'', generos:['Acción','Terror'], desarrollador:'Studio REANIMAL', plataformas:['PS5','PC','Xbox Series X'], fechaLanzamiento:'2026-08-15', duracion:null, pendiente:false, descripcion:'' },
    { id:'g024', titulo:'Gears of War 2', portadaUrl:'', generos:['Shooter'], desarrollador:'Epic Games', plataformas:['Xbox 360','Xbox Series X'], fechaLanzamiento:'2008-11-07', duracion:8, pendiente:false, descripcion:'' },
    { id:'g025', titulo:'The Simpsons Hit & Run', portadaUrl:'', generos:['Sandbox'], desarrollador:'Radical Entertainment', plataformas:['PC'], fechaLanzamiento:'2003-09-16', duracion:8, pendiente:false, descripcion:'' },
    { id:'g026', titulo:'A Plague Tale: Requiem', portadaUrl:'', generos:['Acción Aventura'], desarrollador:'Asobo Studio', plataformas:['PS5','PC','Xbox Series X'], fechaLanzamiento:'2022-10-17', duracion:19, pendiente:false, descripcion:'' },
    { id:'g027', titulo:'Replaced', portadaUrl:'', generos:['Acción','Plataformas'], desarrollador:'Sad Cat Studios', plataformas:['PC','Xbox Series X'], fechaLanzamiento:'2026-05-21', duracion:null, pendiente:false, descripcion:'' },
    { id:'g028', titulo:'Crisol: Theater of Idols', portadaUrl:'', generos:['Aventura Gráfica'], desarrollador:'Crisol Studio', plataformas:['PC','PS5'], fechaLanzamiento:'2026-03-15', duracion:null, pendiente:false, descripcion:'' },
    { id:'g029', titulo:'Crimson Desert', portadaUrl:'', generos:['RPG','Open World'], desarrollador:'Pearl Abyss', plataformas:['PC','PS5','Xbox Series X'], fechaLanzamiento:'2026-12-01', duracion:null, pendiente:false, descripcion:'' },
    { id:'g030', titulo:'God of War: Sons of Sparta', portadaUrl:'', generos:['Acción Aventura'], desarrollador:'Santa Monica Studio', plataformas:['PS5'], fechaLanzamiento:'2026-11-01', duracion:null, pendiente:false, descripcion:'' },
    { id:'g031', titulo:'Yoshi and the Mysterious Book', portadaUrl:'', generos:['Plataformas'], desarrollador:'Nintendo', plataformas:['Nintendo Switch 2'], fechaLanzamiento:'2026-05-21', duracion:null, pendiente:false, descripcion:'' },
    { id:'g032', titulo:'Lego Batman: Legacy of the Dark Knight', portadaUrl:'', generos:['Acción','Plataformas'], desarrollador:'TT Games', plataformas:['PS5','PC','Xbox Series X','Nintendo Switch 2'], fechaLanzamiento:'2026-05-22', duracion:null, pendiente:false, descripcion:'' },
    { id:'g033', titulo:'The Elder Scrolls V: Skyrim', portadaUrl:'', generos:['RPG'], desarrollador:'Bethesda Softworks', plataformas:['PC'], fechaLanzamiento:'2011-11-11', duracion:100, pendiente:false, descripcion:'' },
    { id:'g034', titulo:'Donkey Kong Bananza', portadaUrl:'', generos:['Plataformas'], desarrollador:'Nintendo', plataformas:['Nintendo Switch 2'], fechaLanzamiento:'2025-07-17', duracion:null, pendiente:false, descripcion:'' },
    { id:'g035', titulo:'Sly Cooper', portadaUrl:'', generos:['Plataformas','Sigilo'], desarrollador:'Sucker Punch', plataformas:['PC'], fechaLanzamiento:'2002-09-23', duracion:7, pendiente:false, descripcion:'' }
  ];

  var REGISTRO = [
    { id:'r001', juegoId:'g005', jugador:'David', año:2026, mes:1, nota:8.40, estado:'Rejugado',  horas:20,  plataformaJugada:'PS5',           comentario:'' },
    { id:'r002', juegoId:'g006', jugador:'David', año:2026, mes:1, nota:8.00, estado:'Terminado', horas:12,  plataformaJugada:'PC',            comentario:'' },
    { id:'r003', juegoId:'g007', jugador:'David', año:2026, mes:1, nota:8.30, estado:'Terminado', horas:9,   plataformaJugada:'PS5',           comentario:'' },
    { id:'r004', juegoId:'g008', jugador:'David', año:2026, mes:1, nota:8.60, estado:'Rejugado',  horas:15,  plataformaJugada:'PC',            comentario:'' },
    { id:'r005', juegoId:'g024', jugador:'David', año:2026, mes:1, nota:7.10, estado:'Terminado', horas:8,   plataformaJugada:'Xbox Series X', comentario:'' },
    { id:'r006', juegoId:'g024', jugador:'Javi',  año:2026, mes:1, nota:7.10, estado:'Terminado', horas:8,   plataformaJugada:'Xbox Series X', comentario:'' },
    { id:'r007', juegoId:'g009', jugador:'Javi',  año:2026, mes:1, nota:7.90, estado:'Terminado', horas:16,  plataformaJugada:'PS5',           comentario:'' },
    { id:'r008', juegoId:'g001', jugador:'Javi',  año:2026, mes:1, nota:9.70, estado:'Rejugado',  horas:20,  plataformaJugada:'PC',            comentario:'' },
    { id:'r009', juegoId:'g001', jugador:'David', año:2026, mes:1, nota:9.40, estado:'Terminado', horas:20,  plataformaJugada:'PC',            comentario:'' },
    { id:'r010', juegoId:'g033', jugador:'David', año:2026, mes:1, nota:null, estado:'Retomar',   horas:null,plataformaJugada:'PC',            comentario:'' },
    { id:'r011', juegoId:'g004', jugador:'Javi',  año:2026, mes:1, nota:8.50, estado:'Jugado',    horas:138, plataformaJugada:'PC',            comentario:'' },
    { id:'r012', juegoId:'g010', jugador:'Javi',  año:2026, mes:1, nota:8.60, estado:'Terminado', horas:8,   plataformaJugada:'PC',            comentario:'' },
    { id:'r013', juegoId:'g034', jugador:'Javi',  año:2026, mes:2, nota:null, estado:'Retomar',   horas:null,plataformaJugada:'Nintendo Switch 2', comentario:'' },
    { id:'r014', juegoId:'g035', jugador:'David', año:2026, mes:2, nota:8.50, estado:'Terminado', horas:7,   plataformaJugada:'PC',            comentario:'' },
    { id:'r015', juegoId:'g034', jugador:'Mery',  año:2026, mes:2, nota:7.30, estado:'Terminado', horas:26,  plataformaJugada:'Nintendo Switch 2', comentario:'' },
    { id:'r016', juegoId:'g025', jugador:'David', año:2026, mes:2, nota:7.00, estado:'Terminado', horas:8,   plataformaJugada:'PC',            comentario:'' },
    { id:'r017', juegoId:'g011', jugador:'David', año:2026, mes:3, nota:9.45, estado:'Terminado', horas:18,  plataformaJugada:'PS5',           comentario:'' },
    { id:'r018', juegoId:'g012', jugador:'Javi',  año:2026, mes:3, nota:9.15, estado:'Terminado', horas:20,  plataformaJugada:'PS5',           comentario:'' },
    { id:'r019', juegoId:'g013', jugador:'David', año:2026, mes:3, nota:9.10, estado:'Terminado', horas:5,   plataformaJugada:'PS5',           comentario:'' },
    { id:'r020', juegoId:'g014', jugador:'Javi',  año:2026, mes:3, nota:8.90, estado:'Terminado', horas:12,  plataformaJugada:'PS5',           comentario:'' },
    { id:'r021', juegoId:'g015', jugador:'David', año:2026, mes:3, nota:8.75, estado:'Terminado', horas:10,  plataformaJugada:'PC',            comentario:'' },
    { id:'r022', juegoId:'g023', jugador:'Mery',  año:2026, mes:3, nota:8.75, estado:'Terminado', horas:14,  plataformaJugada:'PC',            comentario:'' },
    { id:'r023', juegoId:'g004', jugador:'David', año:2026, mes:3, nota:8.50, estado:'Jugando',   horas:80,  plataformaJugada:'PC',            comentario:'' },
    { id:'r024', juegoId:'g027', jugador:'Javi',  año:2026, mes:4, nota:8.50, estado:'Terminado', horas:15,  plataformaJugada:'Xbox Series X', comentario:'' },
    { id:'r025', juegoId:'g028', jugador:'Mery',  año:2026, mes:4, nota:8.45, estado:'Terminado', horas:8,   plataformaJugada:'PC',            comentario:'' },
    { id:'r026', juegoId:'g029', jugador:'David', año:2026, mes:4, nota:7.50, estado:'Jugando',   horas:30,  plataformaJugada:'PC',            comentario:'' },
    { id:'r027', juegoId:'g030', jugador:'Javi',  año:2026, mes:4, nota:6.50, estado:'Terminado', horas:22,  plataformaJugada:'PS5',           comentario:'' },
    { id:'r028', juegoId:'g026', jugador:'Mery',  año:2025, mes:6, nota:9.20, estado:'Terminado', horas:19,  plataformaJugada:'PS5',           comentario:'' },
    { id:'r029', juegoId:'g003', jugador:'David', año:2025, mes:5, nota:9.00, estado:'Terminado', horas:24,  plataformaJugada:'PC',            comentario:'' },
    { id:'r030', juegoId:'g002', jugador:'Javi',  año:2025, mes:4, nota:9.17, estado:'Terminado', horas:6,   plataformaJugada:'PC',            comentario:'' }
  ];

  function initialize() {
    var db = window.GT.db;
    // Check if data already exists in Firestore
    db.collection('biblioteca').limit(1).get().then(function (snap) {
      if (!snap.empty) return; // Already has data, skip
      var now  = new Date().toISOString();
      var batch = db.batch();
      GAMES.forEach(function (g) {
        var doc = Object.assign({}, g, { creadoEn: now });
        batch.set(db.collection('biblioteca').doc(g.id), doc);
      });
      REGISTRO.forEach(function (r) {
        var doc = Object.assign({}, r, { fechaRegistro: now });
        batch.set(db.collection('registro').doc(r.id), doc);
      });
      return batch.commit();
    }).then(function () {
      // Data initialized (or already existed)
    }).catch(function (err) {
      console.error('SampleData.initialize:', err);
    });
  }

  function reset() {
    var db = window.GT.db;
    // Delete all existing data then re-initialize
    Promise.all([
      db.collection('biblioteca').get(),
      db.collection('registro').get()
    ]).then(function (results) {
      var batch = db.batch();
      results[0].docs.forEach(function(d){ batch.delete(d.ref); });
      results[1].docs.forEach(function(d){ batch.delete(d.ref); });
      return batch.commit();
    }).then(function () {
      initialize();
      window.GT.Toast.show('Datos de demo restaurados ✓');
      setTimeout(function(){ location.reload(); }, 1200);
    }).catch(function (err) {
      console.error('SampleData.reset:', err);
      window.GT.Toast.show('Error al restaurar datos', 'error');
    });
  }

  return { initialize, reset };
})();

/* ── BOOT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  try { window.GT.Nav.init(); }            catch(e){}
  try { window.GT.SampleData.initialize(); } catch(e){}
  try { window.GT.FirestoreSync.start(); } catch(e){}
});
