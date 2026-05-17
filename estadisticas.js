/* ============================================================
   GAMETRACKER — Estadísticas Page
   ============================================================ */
(function () {
  'use strict';

  var Utils      = window.GT.Utils;
  var Biblioteca = window.GT.Biblioteca;
  var Registro   = window.GT.Registro;
  var Toast      = window.GT.Toast;

  var charts = { genres: null, platforms: null };
  var currentYear = new Date().getFullYear();

  function safe(fn, name) {
    try { fn(); } catch(e) { console.warn('estadisticas.js ' + name + ':', e); }
  }

  /* ── CHART DEFAULTS ─────────────────────────────────────── */
  var CHART_DEFAULTS = {
    color: 'rgba(232,232,248,0.7)',
    font: { family: "'Inter', sans-serif" }
  };

  /* ── STAT CARDS ─────────────────────────────────────────── */
  function renderStatCards(year) {
    var stats = Registro.getStats(year);
    var libCount = Biblioteca.getAll().length;

    document.getElementById('sc-juegos').textContent   = stats.totalJuegos;
    document.getElementById('sc-horas').textContent    = stats.totalHoras + 'h';
    document.getElementById('sc-nota').textContent     = stats.avgScore ? stats.avgScore.toFixed(2).replace('.',',') : '—';
    document.getElementById('sc-biblioteca').textContent = libCount;

    // Player stats
    ['David','Javi','Mery'].forEach(function(p) {
      var key = p.toLowerCase();
      var ps  = stats.porJugador[p];
      document.getElementById(key + '-juegos').textContent = ps.juegos;
      document.getElementById(key + '-horas').textContent  = ps.horas + 'h';
      document.getElementById(key + '-nota').textContent   = ps.avgScore ? ps.avgScore.toFixed(2).replace('.',',') : '—';
    });
  }

  /* ── CHARTS ─────────────────────────────────────────────── */
  function renderGenreChart(year) {
    var data = Registro.getGenreStats(year).slice(0, 10);
    var ctx  = document.getElementById('chartGenres').getContext('2d');

    if (charts.genres) { charts.genres.destroy(); charts.genres = null; }
    if (!data.length) return;

    charts.genres = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(function(d){ return d.genero; }),
        datasets: [{
          label: 'Partidas',
          data: data.map(function(d){ return d.count; }),
          backgroundColor: data.map(function(_, i){
            var colors = ['rgba(79,172,254,0.7)','rgba(155,89,255,0.7)','rgba(34,197,94,0.7)',
                          'rgba(236,72,153,0.7)','rgba(245,158,11,0.7)','rgba(6,182,212,0.7)',
                          'rgba(249,115,22,0.7)','rgba(132,204,22,0.7)','rgba(239,68,68,0.7)','rgba(168,85,247,0.7)'];
            return colors[i % colors.length];
          }),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx){ return ' ' + ctx.raw + ' partida' + (ctx.raw !== 1 ? 's' : ''); }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: 'rgba(232,232,248,0.5)', font: CHART_DEFAULTS.font },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          y: {
            ticks: { color: 'rgba(232,232,248,0.8)', font: CHART_DEFAULTS.font },
            grid: { display: false }
          }
        }
      }
    });
  }

  function renderPlatformChart(year) {
    var data = Registro.getPlatformStats(year).slice(0, 8);
    var ctx  = document.getElementById('chartPlatforms').getContext('2d');

    if (charts.platforms) { charts.platforms.destroy(); charts.platforms = null; }
    if (!data.length) return;

    var PLAT_COLORS = {
      'PC': '#2a475e', 'PS5': '#003087', 'PS4': '#003087', 'PS3': '#003087',
      'Xbox Series X': '#107c10', 'Xbox One': '#107c10', 'Xbox 360': '#107c10',
      'Nintendo Switch 2': '#c60012', 'Nintendo Switch': '#c60012'
    };

    charts.platforms = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(function(d){ return d.plataforma; }),
        datasets: [{
          data: data.map(function(d){ return d.count; }),
          backgroundColor: data.map(function(d){
            return PLAT_COLORS[d.plataforma] || 'rgba(79,172,254,0.5)';
          }),
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(232,232,248,0.7)',
              font: CHART_DEFAULTS.font,
              padding: 12,
              boxWidth: 14
            }
          },
          tooltip: {
            callbacks: {
              label: function(ctx){
                return ' ' + ctx.label + ': ' + ctx.raw + ' partida' + (ctx.raw !== 1 ? 's' : '');
              }
            }
          }
        }
      }
    });
  }

  /* ── GOTY RANKING ───────────────────────────────────────── */
  function renderGoty(year) {
    document.getElementById('gotyLabel').textContent = 'GOTY ' + year;
    var ranking = Registro.getRanking(year);
    var top5El  = document.getElementById('top5Grid');
    var bodyEl  = document.getElementById('gotyBody');

    if (!ranking.length) {
      top5El.innerHTML = '<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:2rem">Sin datos para ' + year + '. Añade entradas en el Registro.</p>';
      bodyEl.innerHTML = '<tr><td colspan="5" class="text-muted text-center" style="padding:2rem">Sin datos</td></tr>';
      return;
    }

    var top5 = ranking.slice(0, 5);
    top5El.innerHTML = top5.map(function(item, i) {
      var game = Biblioteca.getById(item.juegoId);
      if (!game) return '';
      var posLabel  = (i+1) + 'º';
      var posClass  = ['top5-pos-1','top5-pos-2','top5-pos-3','top5-pos-n','top5-pos-n'][i];
      var sc        = Utils.scoreColor(item.notaMedia);
      var coverContent = game.portadaUrl
        ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="' + Utils.escapeHtml(game.titulo) + '" loading="lazy" onerror="this.style.display=\'none\'">'
        : '<div class="top5-cover__ph">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</div>';
      return '<div class="top5-card" style="cursor:pointer" onclick="window.GT.GameDetailModal.open(\'' + game.id + '\')" title="Ver ficha">' +
        '<div class="top5-cover">' + coverContent +
          '<div class="top5-overlay">' +
            '<div class="top5-pos ' + posClass + '">' + posLabel + '</div>' +
            '<div class="top5-title">' + Utils.escapeHtml(game.titulo) + '</div>' +
            '<div class="top5-score" style="color:' + sc + '">' + Utils.formatScore(item.notaMedia) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

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
      '</tr>';
    }).join('');
  }

  /* ── RENDER ALL ─────────────────────────────────────────── */
  function renderAll(year) {
    renderStatCards(year);
    renderGenreChart(year);
    renderPlatformChart(year);
    renderGoty(year);
  }

  /* ── EXPORT / IMPORT ────────────────────────────────────── */
  function exportData() {
    var data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      biblioteca: Biblioteca.getAll(),
      registro: Registro.getAll()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = 'gametracker-backup-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    Toast.show('Datos exportados ✓');
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data.biblioteca || !data.registro) throw new Error('Formato inválido');
        var totalB = data.biblioteca.length, totalR = data.registro.length;
        if (!confirm('¿Importar ' + totalB + ' juegos y ' + totalR + ' entradas?\nEsto sobrescribirá los datos actuales en Firestore.')) return;

        Toast.show('Borrando datos actuales...');
        var db = window.GT.db;

        function deleteDocs(docs) {
          if (!docs.length) return Promise.resolve();
          var chunks = [];
          for (var i = 0; i < docs.length; i += 400) chunks.push(docs.slice(i, i + 400));
          return chunks.reduce(function(p, ch) {
            return p.then(function() {
              var b = db.batch();
              ch.forEach(function(d) { b.delete(d.ref); });
              return b.commit();
            });
          }, Promise.resolve());
        }

        function writeDocs(col, items) {
          var now = new Date().toISOString();
          var chunks = [];
          for (var i = 0; i < items.length; i += 400) chunks.push(items.slice(i, i + 400));
          return chunks.reduce(function(p, ch) {
            return p.then(function() {
              var b = db.batch();
              ch.forEach(function(item) {
                b.set(db.collection(col).doc(item.id), Object.assign({}, item, { importadoEn: now }));
              });
              return b.commit();
            });
          }, Promise.resolve());
        }

        Promise.all([db.collection('biblioteca').get(), db.collection('registro').get()])
          .then(function(res) { return deleteDocs(res[0].docs.concat(res[1].docs)); })
          .then(function() {
            Toast.show('Importando ' + totalB + ' juegos... ☕');
            return writeDocs('biblioteca', data.biblioteca);
          })
          .then(function() {
            Toast.show('Importando ' + totalR + ' entradas de registro...');
            return writeDocs('registro', data.registro);
          })
          .then(function() {
            Toast.show('¡' + totalB + ' juegos y ' + totalR + ' entradas importadas! ✓ Recargando...');
            setTimeout(function() { location.reload(); }, 2000);
          })
          .catch(function(err) {
            Toast.show('Error Firestore: ' + err.message, 'error');
            console.error(err);
          });

      } catch(err) {
        Toast.show('Error al leer fichero: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  /* ── YEAR OPTIONS ───────────────────────────────────────── */
  function buildYearOptions() {
    var sel = document.getElementById('statsYear');
    var years = [];
    for (var y = currentYear; y >= 2020; y--) years.push(y);
    sel.innerHTML = years.map(function(y){
      return '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
    }).join('');
    sel.addEventListener('change', function(){
      renderAll(parseInt(this.value));
    });
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    document.getElementById('navYear').textContent = currentYear;
    document.getElementById('footerYear').textContent = currentYear;

    buildYearOptions();

    document.getElementById('btnExport').addEventListener('click', exportData);
    document.getElementById('btnImport').addEventListener('click', function(){
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', function(){
      if (this.files[0]) importData(this.files[0]);
      this.value = '';
    });
    document.getElementById('btnReset').addEventListener('click', function(){
      if (!confirm('¿Restaurar los datos de demostración? Perderás los cambios actuales.')) return;
      window.GT.SampleData.reset();
      Toast.show('Datos de demo restaurados. Recargando...');
      setTimeout(function(){ location.reload(); }, 1000);
    });

    // Scroll to #goty if hash present
    if (window.location.hash === '#goty') {
      setTimeout(function(){
        var el = document.getElementById('goty');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }

    renderAll(currentYear);
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      safe(init, 'init');
      window.GT.onDataChange(function () {
        var sel = document.getElementById('statsYear');
        var yr  = sel ? parseInt(sel.value) : currentYear;
        safe(function(){ renderAll(yr); }, 'renderAll');
      });
    });
  });
})();
