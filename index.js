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

  /* ── HERO CANVAS ─────────────────────────────────────────── */
  function initHeroCanvas() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H, pts;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    pts = Array.from({ length: 65 }, function() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
        cyan: Math.random() > 0.4
      };
    });

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(79,172,254,' + (1 - d / 140) * 0.18 + ')';
            ctx.lineWidth = 0.8;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      pts.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan ? 'rgba(79,172,254,0.7)' : 'rgba(155,89,255,0.7)';
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      });
      requestAnimationFrame(frame);
    }
    frame();
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
    document.getElementById('navYear').textContent = year;
    document.getElementById('footerYear').textContent = year;
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

  function renderUpcomingList() {
    var upcoming = Biblioteca.getUpcoming().slice(0, 12);
    var ul = document.getElementById('upcomingList');
    if (!upcoming.length) { ul.innerHTML = ''; return; }
    ul.innerHTML = '<h3 class="section__title" style="font-size:1rem;margin-bottom:0.75rem">Próximos estrenos</h3>' +
      upcoming.map(function(g){
        var parts = g.fechaLanzamiento.split('-');
        var dateStr = parts[2] === 'xx'
          ? MONTH_NAMES[parseInt(parts[1])-1] + ' ' + parts[0]
          : parseInt(parts[2]) + ' ' + MONTH_NAMES[parseInt(parts[1])-1];
        return '<div class="card" style="padding:0.75rem 1rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap">' +
          '<span style="font-family:\'Orbitron\',sans-serif;font-size:0.75rem;color:var(--cyan);min-width:100px">' + Utils.escapeHtml(dateStr) + '</span>' +
          '<span style="font-weight:600;flex:1">' + Utils.escapeHtml(g.titulo) + '</span>' +
          '<span>' + Utils.platformBadgesHtml(g.plataformas) + '</span>' +
          '</div>';
      }).join('');
  }

  function renderNext5() {
    var el = document.getElementById('next5Strip');
    if (!el) return;
    var next5 = Biblioteca.getUpcoming().slice(0, 5);
    if (!next5.length) { el.innerHTML = ''; return; }
    el.innerHTML = next5.map(function(g) {
      var parts = g.fechaLanzamiento.split('-');
      var dateStr = parseInt(parts[2]) + ' ' + MONTH_NAMES[parseInt(parts[1])-1] + ' ' + parts[0];
      return '<div class="next5-card" onclick="window.GT.GameDetailModal.open(\'' + g.id + '\')" style="cursor:pointer">' +
        '<div class="next5-cover">' +
          (g.portadaUrl
            ? '<img src="' + Utils.escapeHtml(g.portadaUrl) + '" alt="' + Utils.escapeHtml(g.titulo) + '" loading="lazy" onerror="this.parentElement.querySelector(\'.next5-ph\').style.display=\'flex\';this.style.display=\'none\'">'
            : '') +
          '<div class="next5-ph" style="' + (g.portadaUrl ? 'display:none' : '') + '">' + Utils.escapeHtml(g.titulo.charAt(0)) + '</div>' +
        '</div>' +
        '<div class="next5-info">' +
          '<div class="next5-title">' + Utils.escapeHtml(g.titulo) + '</div>' +
          '<div class="next5-date">📅 ' + Utils.escapeHtml(dateStr) + '</div>' +
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

  function renderRanking(year) {
    document.getElementById('gotyYear').textContent = year;
    var ranking = Registro.getRanking(year);
    var top5El  = document.getElementById('top5Grid');
    var bodyEl  = document.getElementById('rankingBody');

    if (!ranking.length) {
      top5El.innerHTML  = '<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:2rem">Sin datos para ' + year + '. Añade entradas en el Registro.</p>';
      bodyEl.innerHTML  = '<tr><td colspan="6" class="text-muted text-center" style="padding:2rem">Sin datos</td></tr>';
      return;
    }

    // Top 5 gallery
    var top5 = ranking.slice(0, 5);
    top5El.innerHTML = top5.map(function(item, i) {
      var game = Biblioteca.getById(item.juegoId);
      if (!game) return '';
      var posClass = ['top5-pos-1','top5-pos-2','top5-pos-3','top5-pos-n','top5-pos-n'][i];
      var posLabel = (i+1) + 'º';
      var scoreColor = Utils.scoreColor(item.notaMedia);
      var coverContent = game.portadaUrl
        ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="' + Utils.escapeHtml(game.titulo) + '" loading="lazy" onerror="this.style.display=\'none\'">'
        : '<div class="top5-cover__ph">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</div>';
      var isChamp = (i === 0);
      return '<div class="top5-card' + (isChamp ? ' champion' : '') + '" style="cursor:pointer;position:relative" onclick="window.GT.GameDetailModal.open(\'' + game.id + '\')" title="Ver ficha">' +
        (isChamp ? '<div class="champion-crown">👑</div>' : '') +
        '<div class="top5-cover">' + coverContent +
        '<div class="top5-overlay">' +
          '<div class="top5-pos ' + posClass + '">' + posLabel + '</div>' +
          '<div class="top5-title">' + Utils.escapeHtml(game.titulo) + '</div>' +
          '<div class="top5-score" style="color:' + scoreColor + '">' + Utils.formatScore(item.notaMedia) + '</div>' +
        '</div></div>' +
      '</div>';
    }).join('');

    // Full table
    bodyEl.innerHTML = ranking.map(function(item, i) {
      var game = Biblioteca.getById(item.juegoId);
      if (!game) return '';
      var posClass = i < 3 ? 'rank-' + (i+1) : '';
      var sc = Utils.scoreColor(item.notaMedia);
      return '<tr class="ranking-row ' + posClass + '" style="cursor:pointer" onclick="window.GT.GameDetailModal.open(\'' + game.id + '\')" title="Ver ficha">' +
        '<td>' + (i+1) + 'º</td>' +
        '<td><div class="game-cell">' +
          '<div class="mini-cover">' +
            (game.portadaUrl ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="" onerror="this.style.display=\'none\'">' : '') +
            '<span class="mini-cover__letter">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</span>' +
          '</div>' +
          '<span style="font-weight:600">' + Utils.escapeHtml(game.titulo) + '</span>' +
        '</div></td>' +
        '<td><div class="score-wrap">' +
          '<div class="score-bar"><div class="score-bar__fill" style="width:' + Utils.scoreWidth(item.notaMedia) + ';background:' + sc + '"></div></div>' +
          '<span class="score-num" style="color:' + sc + '">' + Utils.formatScore(item.notaMedia) + '</span>' +
        '</div></td>' +
        '<td><span class="badge badge-genre">' + item.numVotos + ' voto' + (item.numVotos!==1?'s':'') + '</span></td>' +
        '<td>' + Utils.genreBadgesHtml(game.generos) + '</td>' +
        '<td>' + Utils.platformBadgesHtml(game.plataformas) + '</td>' +
      '</tr>';
    }).join('');
  }

  function initRanking() {
    buildYearOptions();
    renderRanking(new Date().getFullYear());
  }

  /* ── BOOT ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      safe(initHeroCanvas,      'initHeroCanvas');
      safe(initHeroPlayerStats, 'initHeroPlayerStats');
      safe(initStats,           'initStats');
      safe(initCalendar,        'initCalendar');
      safe(initRanking,         'initRanking');
      safe(renderNext5,         'renderNext5');
      // Re-render when another user changes data in real time
      window.GT.onDataChange(function () {
        safe(initStats,           'initStats');
        safe(initHeroPlayerStats, 'initHeroPlayerStats');
        safe(renderNext5,         'renderNext5');
        var sel = document.getElementById('rankingYear');
        if (sel) safe(function(){ renderRanking(parseInt(sel.value)); }, 'renderRanking');
      });
    });
  });
})();
