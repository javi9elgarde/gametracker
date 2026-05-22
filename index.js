/* ============================================================
   GAMETRACKER — Dashboard / Index Page
   ============================================================ */
(function () {
  'use strict';

  var Utils = window.GT.Utils;
  var Biblioteca = window.GT.Biblioteca;
  var Registro = window.GT.Registro;

  var calState = { year: 0, month: 0 };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn('index.js ' + name + ':', e); }
  }

  /* ── HERO CANVAS — pixel-art particles ──────────────────── */
  function initHeroCanvas() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H, netPts, floatPts;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Red de partículas (cuadrados pixel-art)
    netPts = Array.from({ length: 55 }, function() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        sz: Math.random() < 0.5 ? 2 : 3,
        cyan: Math.random() > 0.4
      };
    });

    // Partículas flotantes (ascienden y desaparecen)
    function makeFloat(random) {
      return {
        x:       Math.random() * (W || 1200),
        y:       random ? Math.random() * (H || 800) : (H || 800) + 8,
        vy:      -(Math.random() * 0.45 + 0.15),
        sz:      Math.random() < 0.55 ? 2 : 4,
        alpha:   0,
        maxA:    Math.random() * 0.55 + 0.2,
        fadeIn:  true,
        pink:    Math.random() > 0.7
      };
    }
    floatPts = Array.from({ length: 38 }, function() { return makeFloat(true); });

    function frame() {
      ctx.clearRect(0, 0, W, H);

      // Líneas de red
      for (var i = 0; i < netPts.length; i++) {
        for (var j = i + 1; j < netPts.length; j++) {
          var dx = netPts[i].x - netPts[j].x, dy = netPts[i].y - netPts[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(79,172,254,' + (1 - d / 130) * 0.14 + ')';
            ctx.lineWidth = 1;
            ctx.moveTo(netPts[i].x, netPts[i].y);
            ctx.lineTo(netPts[j].x, netPts[j].y);
            ctx.stroke();
          }
        }
      }

      // Píxeles de red (cuadrados)
      netPts.forEach(function(p) {
        ctx.fillStyle = p.cyan ? 'rgba(79,172,254,0.8)' : 'rgba(168,85,247,0.8)';
        ctx.fillRect(Math.round(p.x - p.sz / 2), Math.round(p.y - p.sz / 2), p.sz, p.sz);
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      });

      // Partículas flotantes tipo brasa
      floatPts.forEach(function(p, idx) {
        if (p.fadeIn) {
          p.alpha += 0.012;
          if (p.alpha >= p.maxA) { p.alpha = p.maxA; p.fadeIn = false; }
        } else {
          p.alpha -= 0.007;
          if (p.alpha <= 0) { floatPts[idx] = makeFloat(false); return; }
        }
        ctx.fillStyle = p.pink
          ? 'rgba(236,72,153,' + p.alpha.toFixed(3) + ')'
          : 'rgba(79,172,254,' + p.alpha.toFixed(3) + ')';
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.sz, p.sz);
        p.y += p.vy;
      });

      requestAnimationFrame(frame);
    }
    frame();
  }

  /* ── HERO PARALLAX + KEN BURNS (JS) ─────────────────────── */
  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    var bg   = document.querySelector('.hero__bg');
    if (!hero || !bg) return;

    // JS toma el control — desactiva animación CSS residual
    bg.style.animation = 'none';

    var mouseX = 0.5, mouseY = 0.5;
    var curX   = 0.5, curY   = 0.5;
    var kbTime = 0;

    hero.addEventListener('mousemove', function(e) {
      var r = hero.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width;
      mouseY = (e.clientY - r.top)  / r.height;
    });
    hero.addEventListener('mouseleave', function() { mouseX = 0.5; mouseY = 0.5; });

    function tick() {
      // Suavizado
      curX += (mouseX - curX) * 0.04;
      curY += (mouseY - curY) * 0.04;

      // Ken Burns: escala oscila entre 1.04 y 1.10
      kbTime += 0.00025;
      var scale = 1.07 + Math.sin(kbTime) * 0.03;

      // Parallax: ±3% según posición del ratón (invertido = imagen sigue suavemente)
      var px = 50 + (curX - 0.5) * (-6);
      var py = 50 + (curY - 0.5) * (-4);

      bg.style.backgroundSize     = (scale * 100).toFixed(2) + '%';
      bg.style.backgroundPosition = px.toFixed(2) + '% ' + py.toFixed(2) + '%';

      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── HERO PLAYER CARDS ───────────────────────────────────── */
  function initHeroPlayerStats() {
    var year = new Date().getFullYear();
    ['David', 'Javi', 'Mery'].forEach(function(player) {
      var entries = Registro.filter({ jugador: player, año: year });
      var games = new Set(entries.map(function(r) { return r.juegoId; })).size;
      var hours = Math.round(entries.reduce(function(acc, r) { return acc + (parseFloat(r.horas) || 0); }, 0));
      var scored = entries.filter(function(r) { return r.nota !== null && r.nota !== undefined && r.nota !== ''; });
      var avg = scored.length ? (scored.reduce(function(a, r) { return a + parseFloat(r.nota); }, 0) / scored.length) : null;
      var el = document.getElementById('heroStats' + player);
      if (el) el.textContent = games + ' juegos · ' + hours + 'h' + (avg ? ' · ★ ' + avg.toFixed(1).replace('.', ',') : '');
    });
  }

  /* ── QUICK STATS ─────────────────────────────────────────── */
  function initStats() {
    var year = new Date().getFullYear();
    var stats = Registro.getStats(year);
    var libCount = Biblioteca.getAll().length;

    document.getElementById('statGames').textContent = stats.totalJuegos;
    document.getElementById('statHours').textContent = stats.totalHoras + 'h';
    document.getElementById('statScore').textContent = stats.avgScore ? stats.avgScore.toFixed(2).replace('.',',') : '—';
    document.getElementById('statLibrary').textContent = libCount;
    var navY = document.getElementById('navYear'); if (navY) navY.textContent = year;
    var footY = document.getElementById('footerYear'); if (footY) footY.textContent = year;
  }

  /* ── CALENDAR ────────────────────────────────────────────── */
  var DAY_NAMES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  var MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  function renderCalendar() {
    var y = calState.year, m = calState.month;
    document.getElementById('calTitle').textContent = MONTH_NAMES[m] + ' ' + y;

    var headers = document.getElementById('calHeaders');
    headers.innerHTML = DAY_NAMES.map(function(d){
      return '<div class="cal-day-header">' + d + '</div>';
    }).join('');

    // Get ALL games with a release date in this month (historical calendar)
    var byDay = {};
    Biblioteca.getAll().forEach(function(g) {
      var d = g.fechaLanzamiento;
      if (!d || d.includes('xx')) return;
      var parts = d.split('-');
      if (parseInt(parts[0]) !== y || parseInt(parts[1]) !== (m+1)) return;
      var day = parseInt(parts[2]);
      if (isNaN(day)) return;
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(g);
    });

    var today = new Date();
    var firstDay = new Date(y, m, 1);
    var lastDay  = new Date(y, m+1, 0);
    // Monday-based: 0=Mon … 6=Sun
    var startDow = (firstDay.getDay() + 6) % 7;

    var grid = document.getElementById('calGrid');
    grid.innerHTML = '';

    // Blank cells
    for (var i = 0; i < startDow; i++) {
      var blank = document.createElement('div');
      blank.className = 'cal-day other-month';
      grid.appendChild(blank);
    }

    for (var d = 1; d <= lastDay.getDate(); d++) {
      var cell = document.createElement('div');
      var games = byDay[d] || [];
      var isToday = today.getFullYear()===y && today.getMonth()===m && today.getDate()===d;
      cell.className = 'cal-day' + (games.length ? ' has-game' : '') + (isToday ? ' today' : '');
      var html = '<div class="cal-day__num">' + d + '</div>';
      games.slice(0,3).forEach(function(g){
        html += '<div class="cal-game" title="' + Utils.escapeHtml(g.titulo) + '">' + Utils.escapeHtml(g.titulo) + '</div>';
      });
      if (games.length > 3) html += '<div class="cal-game" style="opacity:0.5">+' + (games.length-3) + ' más</div>';
      cell.innerHTML = html;
      grid.appendChild(cell);
    }

    renderUpcomingList();
  }

  function renderUpcomingList() { /* replaced by renderUpcomingCards */ }

  function renderUpcomingCards() {
    var el = document.getElementById('upcomingCardsGrid');
    if (!el) return;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var limit = new Date(today);
    limit.setDate(limit.getDate() + 30);

    var games = Biblioteca.getUpcoming().filter(function(g) {
      if (!g.fechaLanzamiento) return false;
      var parts = g.fechaLanzamiento.split('-');
      if (!parts[2] || parts[2] === 'xx') return false;
      var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d >= today && d <= limit;
    });

    if (!games.length) {
      el.innerHTML = '<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:2rem">No hay estrenos en los próximos 30 días</p>';
      return;
    }

    el.innerHTML = games.map(function(g) {
      var parts = g.fechaLanzamiento.split('-');
      var day   = parseInt(parts[2]);
      var month = MONTH_NAMES[parseInt(parts[1]) - 1];
      var dateStr = day + ' ' + month;
      var objPos = Utils.escapeHtml(g.portadaPos || 'center top');

      return '<div class="upcoming-card" onclick="window.GT.GameDetailModal.open(\'' + g.id + '\')" style="cursor:pointer">' +
        '<div class="upcoming-card__cover">' +
          (g.portadaUrl
            ? '<img src="' + Utils.escapeHtml(g.portadaUrl) + '" alt="' + Utils.escapeHtml(g.titulo) + '" loading="lazy" style="object-position:' + objPos + '" onerror="this.style.display=\'none\'">'
            : '<div class="upcoming-card__ph">' + Utils.escapeHtml(g.titulo.charAt(0)) + '</div>') +
          '<div class="upcoming-card__date">' + Utils.escapeHtml(dateStr) + '</div>' +
        '</div>' +
        '<div class="upcoming-card__body">' +
          '<div class="upcoming-card__title">' + Utils.escapeHtml(g.titulo) + '</div>' +
          '<div>' + Utils.platformBadgesHtml(g.plataformas) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function initCalendar() {
    var now = new Date();
    calState.year  = now.getFullYear();
    calState.month = now.getMonth();
    renderCalendar();

    document.getElementById('calPrev').addEventListener('click', function(){
      calState.month--;
      if (calState.month < 0) { calState.month = 11; calState.year--; }
      renderCalendar();
    });
    document.getElementById('calNext').addEventListener('click', function(){
      calState.month++;
      if (calState.month > 11) { calState.month = 0; calState.year++; }
      renderCalendar();
    });
  }

  /* ── RANKING ─────────────────────────────────────────────── */
  function buildYearOptions() {
    var sel = document.getElementById('rankingYear');
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var y = currentYear; y >= 2020; y--) years.push(y);
    sel.innerHTML = years.map(function(y){
      return '<option value="' + y + '"' + (y===currentYear?' selected':'') + '>' + y + '</option>';
    }).join('');
    sel.addEventListener('change', function(){ renderRanking(parseInt(this.value)); });
  }

  var HOF_MEDALS = [
    { emoji: '🥇', label: '1º · GOTY', cls: 'hof-gold'   },
    { emoji: '🥈', label: '2º',         cls: 'hof-silver' },
    { emoji: '🥉', label: '3º',         cls: 'hof-bronze' }
  ];

  function hofCardHtml(item, rankIdx, year) {
    var game = Biblioteca.getById(item.juegoId);
    if (!game) return '';
    var med    = HOF_MEDALS[rankIdx];
    var sc     = Utils.scoreColor(item.notaMedia);
    var objPos = Utils.escapeHtml(game.portadaPos || 'center top');
    return '<div class="hof-card ' + med.cls + '" onclick="window.GT.GameDetailModal.open(\'' + game.id + '\')" title="Ver ficha">' +
      '<div class="hof-card__cover">' +
        (game.portadaUrl
          ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="" loading="lazy" style="object-position:' + objPos + '" onerror="this.style.display=\'none\'">'
          : '<div class="hof-card__ph">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</div>') +
        (rankIdx === 0 ? '<div class="hof-champion-badge">👑 CAMPEÓN ' + year + '</div>' : '') +
      '</div>' +
      '<div class="hof-card__body">' +
        '<div class="hof-card__body-inner">' +
          '<div class="hof-card__title">' + Utils.escapeHtml(game.titulo) + '</div>' +
          '<span class="hof-card__score" style="color:' + sc + '">' + Utils.formatScore(item.notaMedia) + '</span>' +
        '</div>' +
        '<div class="hof-card__medal">' + med.emoji + ' ' + med.label + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderRanking(year) {
    document.getElementById('gotyYear').textContent = year;
    var ranking  = Registro.getRanking(year);
    var podiumEl = document.getElementById('hofPodium');
    var lowerEl  = document.getElementById('hofLower');
    var bodyEl   = document.getElementById('rankingBody');

    if (!ranking.length) {
      podiumEl.innerHTML = '<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:2rem">Sin datos para ' + year + '. Añade entradas en el Registro.</p>';
      lowerEl.innerHTML  = '';
      bodyEl.innerHTML   = '<p class="text-muted" style="text-align:center;padding:2rem">Sin datos</p>';
      return;
    }

    // Podium visual order: 2nd | 1st | 3rd (gold en el centro, el más grande)
    var podiumIdxs = [1, 0, 2].filter(function(i) { return i < ranking.length; });
    podiumEl.innerHTML = podiumIdxs.map(function(i) {
      return hofCardHtml(ranking[i], i, year);
    }).join('');

    // 4th and 5th
    lowerEl.innerHTML = ranking.slice(3, 5).map(function(item, j) {
      var game = Biblioteca.getById(item.juegoId);
      if (!game) return '';
      var sc     = Utils.scoreColor(item.notaMedia);
      var objPos = Utils.escapeHtml(game.portadaPos || 'center top');
      return '<div class="hof-card hof-lower-card" onclick="window.GT.GameDetailModal.open(\'' + game.id + '\')" title="Ver ficha">' +
        '<div class="hof-card__cover">' +
          (game.portadaUrl
            ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="" loading="lazy" style="object-position:' + objPos + '" onerror="this.style.display=\'none\'">'
            : '<div class="hof-card__ph">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</div>') +
        '</div>' +
        '<div class="hof-card__body">' +
          '<div class="hof-card__body-inner">' +
            '<div class="hof-card__title">' + Utils.escapeHtml(game.titulo) + '</div>' +
            '<span class="hof-card__score" style="color:' + sc + '">' + Utils.formatScore(item.notaMedia) + '</span>' +
          '</div>' +
          '<div class="hof-card__medal">' + (j + 4) + 'º</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // Full ranking — no covers, just pos + title + score + votes
    bodyEl.innerHTML = ranking.map(function(item, i) {
      var game = Biblioteca.getById(item.juegoId);
      if (!game) return '';
      var sc = Utils.scoreColor(item.notaMedia);
      var rowCls = i === 0 ? 'rank-list-gold' : i === 1 ? 'rank-list-silver' : i === 2 ? 'rank-list-bronze' : '';
      return '<div class="rank-list-row ' + rowCls + '" onclick="window.GT.GameDetailModal.open(\'' + game.id + '\')" title="Ver ficha">' +
        '<div class="rank-list-pos">' + (i + 1) + '</div>' +
        '<div class="rank-list-info">' +
          '<div class="rank-list-title">' + Utils.escapeHtml(game.titulo) + '</div>' +
          (game.desarrollador ? '<div class="rank-list-dev">' + Utils.escapeHtml(game.desarrollador) + '</div>' : '') +
        '</div>' +
        '<div class="rank-list-score-wrap">' +
          '<div class="score-bar"><div class="score-bar__fill" style="width:' + Utils.scoreWidth(item.notaMedia) + ';background:' + sc + '"></div></div>' +
          '<span class="score-num" style="color:' + sc + '">' + Utils.formatScore(item.notaMedia) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function initRanking() {
    buildYearOptions();
    renderRanking(new Date().getFullYear());
  }

  /* ── BOOT ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      safe(initHeroCanvas,        'initHeroCanvas');
      safe(initHeroParallax,      'initHeroParallax');
      safe(initHeroPlayerStats,   'initHeroPlayerStats');
      safe(initStats,             'initStats');
      safe(initCalendar,          'initCalendar');
      safe(initRanking,           'initRanking');
      safe(renderUpcomingCards,   'renderUpcomingCards');
      // Re-render when another user changes data in real time
      window.GT.onDataChange(function () {
        safe(initStats,             'initStats');
        safe(initHeroPlayerStats,   'initHeroPlayerStats');
        safe(renderUpcomingCards,   'renderUpcomingCards');
        var sel = document.getElementById('rankingYear');
        if (sel) safe(function(){ renderRanking(parseInt(sel.value)); }, 'renderRanking');
      });
    });
  });
})();
