/* ============================================================
   GAMETRACKER — Estadísticas Page
   ============================================================ */
(function () {
  'use strict';

  var Utils      = window.GT.Utils;
  var Biblioteca = window.GT.Biblioteca;
  var Registro   = window.GT.Registro;
  var Toast      = window.GT.Toast;

  var charts = { genres: null, platforms: null, history: null };
  var currentYear = new Date().getFullYear();
  var state = { year: currentYear, player: 'All' };

  function safe(fn, name) {
    try { fn(); } catch(e) { console.warn('estadisticas.js ' + name + ':', e); }
  }

  var CHART_FONT = { family: "'Inter', sans-serif" };
  var PLAYER_COLORS = {
    David: 'rgba(79,172,254,0.85)',
    Javi:  'rgba(155,23,66,0.85)',
    Mery:  'rgba(155,89,255,0.85)'
  };

  /* ── STAT CARDS ─────────────────────────────────────────── */
  function renderStatCards(year, player) {
    var stats    = Registro.getStats(year);
    var libCount = Biblioteca.getAll().length;

    if (player === 'All') {
      document.getElementById('sc-juegos').textContent = stats.totalJuegos;
      document.getElementById('sc-horas').textContent  = stats.totalHoras + 'h';
      document.getElementById('sc-nota').textContent   = stats.avgScore ? stats.avgScore.toFixed(2).replace('.', ',') : '—';
    } else {
      var ps = stats.porJugador[player] || { juegos: 0, horas: 0, avgScore: 0 };
      document.getElementById('sc-juegos').textContent = ps.juegos;
      document.getElementById('sc-horas').textContent  = ps.horas + 'h';
      document.getElementById('sc-nota').textContent   = ps.avgScore ? ps.avgScore.toFixed(2).replace('.', ',') : '—';
    }
    document.getElementById('sc-biblioteca').textContent = libCount;

    // Player comparison cards always show all 3 (year-filtered only)
    ['David', 'Javi', 'Mery'].forEach(function(p) {
      var key = p.toLowerCase();
      var ps  = stats.porJugador[p] || { juegos: 0, horas: 0, avgScore: 0 };
      document.getElementById(key + '-juegos').textContent = ps.juegos;
      document.getElementById(key + '-horas').textContent  = ps.horas + 'h';
      document.getElementById(key + '-nota').textContent   = ps.avgScore ? ps.avgScore.toFixed(2).replace('.', ',') : '—';
    });
  }

  /* ── GENRE CHART ─────────────────────────────────────────── */
  function renderGenreChart(year, player) {
    var data = Registro.getGenreStats(year, player).slice(0, 10);
    var ctx  = document.getElementById('chartGenres').getContext('2d');
    if (charts.genres) { charts.genres.destroy(); charts.genres = null; }
    if (!data.length) return;

    var COLORS = ['rgba(79,172,254,0.75)','rgba(155,89,255,0.75)','rgba(34,197,94,0.75)',
                  'rgba(236,72,153,0.75)','rgba(245,158,11,0.75)','rgba(6,182,212,0.75)',
                  'rgba(249,115,22,0.75)','rgba(132,204,22,0.75)','rgba(239,68,68,0.75)','rgba(168,85,247,0.75)'];

    charts.genres = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(function(d){ return d.genero; }),
        datasets: [{
          label: 'Partidas',
          data: data.map(function(d){ return d.count; }),
          backgroundColor: data.map(function(_, i){ return COLORS[i % COLORS.length]; }),
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
          tooltip: { callbacks: { label: function(c){ return ' ' + c.raw + ' partida' + (c.raw !== 1 ? 's' : ''); } } }
        },
        scales: {
          x: { ticks: { color: 'rgba(232,232,248,0.5)', font: CHART_FONT }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: 'rgba(232,232,248,0.8)', font: CHART_FONT }, grid: { display: false } }
        }
      }
    });
  }

  /* ── PLATFORM CHART ─────────────────────────────────────── */
  function renderPlatformChart(year, player) {
    var data = Registro.getPlatformStats(year, player).slice(0, 8);
    var ctx  = document.getElementById('chartPlatforms').getContext('2d');
    if (charts.platforms) { charts.platforms.destroy(); charts.platforms = null; }
    if (!data.length) return;

    var PLAT_COLORS = {
      'PC': '#2a7fff', 'PS5': '#003aba', 'PS4': '#0a52cc', 'PS3': '#1565c0',
      'Xbox Series X': '#107c10', 'Xbox One': '#1a9a1a', 'Xbox 360': '#2bb52b',
      'Nintendo Switch 2': '#e60012', 'Nintendo Switch': '#e83e3e'
    };

    charts.platforms = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(function(d){ return d.plataforma; }),
        datasets: [{
          data: data.map(function(d){ return d.count; }),
          backgroundColor: data.map(function(d){ return PLAT_COLORS[d.plataforma] || 'rgba(79,172,254,0.5)'; }),
          borderColor: 'rgba(255,255,255,0.07)',
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
            labels: { color: 'rgba(232,232,248,0.7)', font: CHART_FONT, padding: 12, boxWidth: 14 }
          },
          tooltip: {
            callbacks: {
              label: function(c){ return ' ' + c.label + ': ' + c.raw + ' partida' + (c.raw !== 1 ? 's' : ''); }
            }
          }
        }
      }
    });
  }

  /* ── HISTORY CHART (últimos 10 años) ────────────────────── */
  function renderHistoryChart(player) {
    var ctx = document.getElementById('chartHistory').getContext('2d');
    if (charts.history) { charts.history.destroy(); charts.history = null; }

    var years = [];
    for (var y = currentYear - 9; y <= currentYear; y++) years.push(y);

    var datasets;
    if (player === 'All') {
      datasets = ['David', 'Javi', 'Mery'].map(function(p) {
        return {
          label: p,
          data: years.map(function(yr) {
            var e = Registro.filter({ jugador: p, año: yr });
            return new Set(e.map(function(r){ return r.juegoId; })).size;
          }),
          backgroundColor: PLAYER_COLORS[p],
          borderColor: PLAYER_COLORS[p],
          borderRadius: 5,
          borderSkipped: false
        };
      });
    } else {
      var playerColor = PLAYER_COLORS[player] || 'rgba(79,172,254,0.8)';
      datasets = [{
        label: player,
        data: years.map(function(yr) {
          var e = Registro.filter({ jugador: player, año: yr });
          return new Set(e.map(function(r){ return r.juegoId; })).size;
        }),
        backgroundColor: playerColor,
        borderColor: playerColor,
        borderRadius: 5,
        borderSkipped: false
      }];
    }

    var hasData = datasets.some(function(ds){ return ds.data.some(function(v){ return v > 0; }); });
    if (!hasData) return;

    charts.history = new Chart(ctx, {
      type: 'bar',
      data: { labels: years, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: player === 'All',
            labels: { color: 'rgba(232,232,248,0.7)', font: CHART_FONT, padding: 14, boxWidth: 12 }
          },
          tooltip: {
            callbacks: {
              label: function(c){ return ' ' + c.dataset.label + ': ' + c.raw + ' juego' + (c.raw !== 1 ? 's' : ''); }
            }
          }
        },
        scales: {
          x: {
            stacked: player === 'All',
            ticks: { color: 'rgba(232,232,248,0.6)', font: Object.assign({}, CHART_FONT, { weight: '700' }) },
            grid: { color: 'rgba(255,255,255,0.04)' }
          },
          y: {
            stacked: player === 'All',
            beginAtZero: true,
            ticks: { color: 'rgba(232,232,248,0.5)', font: CHART_FONT, stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.06)' }
          }
        }
      }
    });
  }

  /* ── LOGROS ─────────────────────────────────────────────── */
  function playerColor(p) {
    return p === 'David' ? 'var(--player-david)' : p === 'Javi' ? 'var(--player-javi)' : p === 'Mery' ? 'var(--player-mery)' : 'var(--txt1)';
  }

  function computeLogros(year, player) {
    var allReg  = Registro.getAll();
    var entries = allReg.slice();
    if (year) entries = entries.filter(function(r){ return r.año === year; });
    if (player && player !== 'All') entries = entries.filter(function(r){ return r.jugador === player; });

    var logros = [];

    /* 1 — Rey del Maratón: registro individual con más horas */
    var conHoras = entries.filter(function(r){ return parseFloat(r.horas) > 0; })
                          .sort(function(a,b){ return (parseFloat(b.horas)||0) - (parseFloat(a.horas)||0); });
    if (conHoras.length) {
      var top1 = conHoras[0];
      var game1 = Biblioteca.getById(top1.juegoId);
      logros.push({
        badge: '🎮 REY DEL MARATÓN', desc: 'Más horas en un único juego',
        visual: { type: 'cover', src: game1 && game1.portadaUrl ? game1.portadaUrl : '',
                  pos: game1 && game1.portadaPos ? game1.portadaPos : 'center top',
                  bg: 'linear-gradient(160deg,#050d1f,#0b1c38)' },
        gameId: top1.juegoId,
        winner: top1.jugador, valColor: '#4facfe',
        detail: game1 ? game1.titulo : '—',
        value:  top1.horas + 'h'
      });
    } else {
      logros.push({ badge:'🎮 REY DEL MARATÓN', desc:'Más horas en un único juego',
        visual:{ type:'icon', icon:'🎮', bg:'linear-gradient(160deg,#050d1f,#0b1c38)' },
        winner:null, detail:'Sin datos', value:'' });
    }

    /* 2 — Maratonista: más horas totales en el período */
    var horasPJ = {};
    entries.forEach(function(r){ horasPJ[r.jugador] = (horasPJ[r.jugador]||0) + (parseFloat(r.horas)||0); });
    var topH = Object.keys(horasPJ).sort(function(a,b){ return horasPJ[b]-horasPJ[a]; })[0];
    if (topH) {
      logros.push({
        badge: '⏱ MARATONISTA', desc: 'Más horas totales en el período',
        visual: { type: 'bigtext', text: Math.round(horasPJ[topH]) + 'h',
                  bg: 'linear-gradient(135deg,#0d0522,#1c0d40)' },
        winner: topH, valColor: '#c084fc',
        detail: Math.round(horasPJ[topH]) + ' horas jugadas',
        value:  Math.round(horasPJ[topH]) + 'h'
      });
    } else {
      logros.push({ badge:'⏱ MARATONISTA', desc:'Más horas totales',
        visual:{ type:'icon', icon:'⏱', bg:'linear-gradient(135deg,#0d0522,#1c0d40)' },
        winner:null, detail:'Sin datos', value:'' });
    }

    /* 3 — Platinero: más platinos (siempre global) */
    var platPJ = {};
    allReg.filter(function(r){ return r.estado === 'Platinado'; }).forEach(function(r){
      if (!platPJ[r.jugador]) platPJ[r.jugador] = new Set();
      platPJ[r.jugador].add(r.juegoId);
    });
    var topP = Object.keys(platPJ).sort(function(a,b){ return platPJ[b].size - platPJ[a].size; })[0];
    logros.push({
      badge: '🏆 PLATINERO', desc: 'Más trofeos platino — ranking global',
      visual: { type: 'trophy', src: 'platinum-trophy.png', bg: 'linear-gradient(135deg,#020818,#060e2e)' },
      winner: topP || null, valColor: '#93c5fd',
      detail: topP ? platPJ[topP].size + ' platino' + (platPJ[topP].size !== 1 ? 's' : '') : 'Sin platinos aún',
      value:  topP ? platPJ[topP].size : ''
    });

    /* 4 — Completista: más juegos terminados o platinados */
    var termPJ = {};
    entries.filter(function(r){ return r.estado === 'Terminado' || r.estado === 'Platinado'; }).forEach(function(r){
      if (!termPJ[r.jugador]) termPJ[r.jugador] = new Set();
      termPJ[r.jugador].add(r.juegoId);
    });
    var topC = Object.keys(termPJ).sort(function(a,b){ return termPJ[b].size - termPJ[a].size; })[0];
    if (topC) {
      logros.push({
        badge: '✅ COMPLETISTA', desc: 'Más juegos completados o platinados',
        visual: { type: 'bigtext', text: termPJ[topC].size + '',
                  sub: termPJ[topC].size !== 1 ? 'juegos' : 'juego',
                  bg: 'linear-gradient(135deg,#041a0c,#082e14)' },
        winner: topC, valColor: '#4ade80',
        detail: termPJ[topC].size + ' juego' + (termPJ[topC].size !== 1 ? 's' : '') + ' completado' + (termPJ[topC].size !== 1 ? 's' : ''),
        value:  termPJ[topC].size
      });
    } else {
      logros.push({ badge:'✅ COMPLETISTA', desc:'Más juegos completados',
        visual:{ type:'icon', icon:'✅', bg:'linear-gradient(135deg,#041a0c,#082e14)' },
        winner:null, detail:'Sin datos', value:'' });
    }

    /* 5 — El Exigente: nota media más baja */
    var notasPJ = {};
    entries.filter(function(r){ return r.nota !== null && r.nota !== '' && r.nota !== undefined; }).forEach(function(r){
      if (!notasPJ[r.jugador]) notasPJ[r.jugador] = [];
      notasPJ[r.jugador].push(parseFloat(r.nota));
    });
    var jugConNotas = Object.keys(notasPJ).filter(function(p){ return notasPJ[p].length >= 2; });
    if (jugConNotas.length) {
      var avgFn = function(arr){ return arr.reduce(function(s,x){return s+x;},0)/arr.length; };
      var topE = jugConNotas.sort(function(a,b){ return avgFn(notasPJ[a]) - avgFn(notasPJ[b]); })[0];
      var avgE = avgFn(notasPJ[topE]).toFixed(1).replace('.', ',');
      logros.push({
        badge: '⭐ EL EXIGENTE', desc: 'Nota media más baja — el más crítico',
        visual: { type: 'bigtext', text: avgE, sub: '/ 10', bg: 'linear-gradient(135deg,#1a0505,#2e0808)' },
        winner: topE, valColor: '#f87171',
        detail: 'Media de ' + avgE + ' puntos sobre 10',
        value:  avgE + ' ★'
      });
    } else {
      logros.push({ badge:'⭐ EL EXIGENTE', desc:'Nota media más baja',
        visual:{ type:'icon', icon:'⭐', bg:'linear-gradient(135deg,#1a0505,#2e0808)' },
        winner:null, detail:'Necesita al menos 2 notas', value:'' });
    }

    /* 6 — El Optimista: nota media más alta */
    var playersWithNotas = Object.keys(notasPJ).filter(function(p){ return notasPJ[p].length >= 2; });
    if (playersWithNotas.length) {
      var avgFnO = function(arr){ return arr.reduce(function(s,x){return s+x;},0)/arr.length; };
      var topO = playersWithNotas.slice().sort(function(a,b){ return avgFnO(notasPJ[b]) - avgFnO(notasPJ[a]); })[0];
      var avgO = avgFnO(notasPJ[topO]).toFixed(1).replace('.', ',');
      logros.push({
        badge: '🌟 EL OPTIMISTA', desc: 'Nota media más alta — el más generoso',
        visual: { type: 'bigtext', text: avgO, sub: '/ 10', bg: 'linear-gradient(135deg,#1a1400,#2e2500)' },
        winner: topO, valColor: '#fbbf24',
        detail: 'Media de ' + avgO + ' puntos sobre 10',
        value:  avgO + ' ★'
      });
    } else {
      logros.push({ badge:'🌟 EL OPTIMISTA', desc:'Nota media más alta',
        visual:{ type:'icon', icon:'🌟', bg:'linear-gradient(135deg,#1a1400,#2e2500)' },
        winner:null, detail:'Necesita al menos 2 notas', value:'' });
    }

    /* 7 — Rejugador: más juegos con estado Rejugado */
    var rejPJ = {};
    entries.filter(function(r){ return r.estado === 'Rejugado'; }).forEach(function(r){
      if (!rejPJ[r.jugador]) rejPJ[r.jugador] = new Set();
      rejPJ[r.jugador].add(r.juegoId);
    });
    var topRej = Object.keys(rejPJ).sort(function(a,b){ return rejPJ[b].size - rejPJ[a].size; })[0];
    if (topRej) {
      logros.push({
        badge: '🔥 REJUGADOR', desc: 'Más juegos completados más de una vez',
        visual: { type: 'bigtext', text: rejPJ[topRej].size + '',
                  sub: rejPJ[topRej].size !== 1 ? 'juegos' : 'juego',
                  bg: 'linear-gradient(135deg,#1a0505,#2e0808)' },
        winner: topRej, valColor: '#fb923c',
        detail: rejPJ[topRej].size + ' juego' + (rejPJ[topRej].size !== 1 ? 's' : '') + ' rejugado' + (rejPJ[topRej].size !== 1 ? 's' : ''),
        value:  rejPJ[topRej].size
      });
    } else {
      logros.push({ badge:'🔥 REJUGADOR', desc:'Más juegos completados más de una vez',
        visual:{ type:'icon', icon:'🔥', bg:'linear-gradient(135deg,#1a0505,#2e0808)' },
        winner:null, detail:'Nadie ha rejugado aún', value:'' });
    }

    /* 9 — La nota más baja: registro individual con la puntuación más baja */
    var conNotaMin = entries.filter(function(r){ return r.nota !== null && r.nota !== '' && r.nota !== undefined; })
                            .sort(function(a,b){ return parseFloat(a.nota) - parseFloat(b.nota); });
    if (conNotaMin.length) {
      var minEntry = conNotaMin[0];
      var minGame  = Biblioteca.getById(minEntry.juegoId);
      var minNota  = parseFloat(minEntry.nota).toFixed(1).replace('.', ',');
      logros.push({
        badge: '💀 LA NOTA MÁS BAJA', desc: 'La puntuación individual más baja puesta',
        visual: minGame && minGame.portadaUrl
          ? { type: 'cover', src: minGame.portadaUrl, pos: minGame.portadaPos || 'center top', bg: 'linear-gradient(160deg,#1a0505,#2e0808)' }
          : { type: 'bigtext', text: minNota, sub: '/ 10', bg: 'linear-gradient(160deg,#1a0505,#2e0808)' },
        gameId: minGame ? minEntry.juegoId : null,
        winner: minEntry.jugador, valColor: '#f87171',
        detail: (minGame ? minGame.titulo : '—') + ' — ' + minNota + ' / 10',
        value:  minNota + ' / 10'
      });
    } else {
      logros.push({ badge:'💀 LA NOTA MÁS BAJA', desc:'La puntuación individual más baja puesta',
        visual:{ type:'icon', icon:'💀', bg:'linear-gradient(160deg,#1a0505,#2e0808)' },
        winner:null, detail:'Sin notas registradas', value:'' });
    }

    /* 10 — El Retro: jugador cuyo juego más antiguo tiene el año de lanzamiento más bajo */
    var retroPJ = {}; /* jugador → { año, titulo } */
    entries.forEach(function(r) {
      var g = Biblioteca.getById(r.juegoId);
      if (!g || !g.fechaLanzamiento) return;
      var yr = parseInt((g.fechaLanzamiento + '').substring(0, 4));
      if (!yr || isNaN(yr)) return;
      if (!retroPJ[r.jugador] || yr < retroPJ[r.jugador].año) {
        retroPJ[r.jugador] = { año: yr, titulo: g.titulo, portadaUrl: g.portadaUrl || '', portadaPos: g.portadaPos || 'center top', juegoId: r.juegoId };
      }
    });
    var retroPlayers = Object.keys(retroPJ);
    if (retroPlayers.length) {
      var topRetro = retroPlayers.sort(function(a,b){ return retroPJ[a].año - retroPJ[b].año; })[0];
      var retroGame = retroPJ[topRetro];
      logros.push({
        badge: '🕹️ EL RETRO', desc: 'Juego más antiguo jugado — viaje al pasado',
        visual: retroGame.portadaUrl
          ? { type: 'cover', src: retroGame.portadaUrl, pos: retroGame.portadaPos, bg: 'linear-gradient(160deg,#12080a,#251018)' }
          : { type: 'bigtext', text: retroGame.año + '', sub: 'año', bg: 'linear-gradient(160deg,#12080a,#251018)' },
        gameId: retroGame.juegoId || null,
        winner: topRetro, valColor: '#f59e0b',
        detail: retroGame.titulo + ' (' + retroGame.año + ')',
        value:  retroGame.año + ''
      });
    } else {
      logros.push({ badge:'🕹️ EL RETRO', desc:'Juego más antiguo jugado',
        visual:{ type:'icon', icon:'🕹️', bg:'linear-gradient(160deg,#12080a,#251018)' },
        winner:null, detail:'Sin datos de lanzamiento', value:'' });
    }

    /* 9 — Explorador: más géneros distintos jugados */
    var genPJ = {};
    entries.forEach(function(r){
      var g = Biblioteca.getById(r.juegoId);
      if (!g || !g.generos) return;
      if (!genPJ[r.jugador]) genPJ[r.jugador] = new Set();
      g.generos.forEach(function(gen){ genPJ[r.jugador].add(gen); });
    });
    var topG = Object.keys(genPJ).sort(function(a,b){ return genPJ[b].size - genPJ[a].size; })[0];
    if (topG) {
      logros.push({
        badge: '🌍 EXPLORADOR', desc: 'Más géneros distintos explorados',
        visual: { type: 'bigtext', text: genPJ[topG].size + '',
                  sub: genPJ[topG].size !== 1 ? 'géneros' : 'género',
                  bg: 'linear-gradient(135deg,#031420,#04203a)' },
        winner: topG, valColor: '#22d3ee',
        detail: genPJ[topG].size + ' géneros distintos',
        value:  genPJ[topG].size + ' géneros'
      });
    } else {
      logros.push({ badge:'🌍 EXPLORADOR', desc:'Más géneros explorados',
        visual:{ type:'icon', icon:'🌍', bg:'linear-gradient(135deg,#031420,#04203a)' },
        winner:null, detail:'Sin datos', value:'' });
    }

    return logros;
  }

  function renderLogros(year, player) {
    var el     = document.getElementById('logrosGrid');
    var logros = computeLogros(year, player);

    el.innerHTML = logros.map(function(l) {
      var v = l.visual;

      /* Banner visual content */
      var bannerInner = '';
      if (v.type === 'cover' && v.src) {
        bannerInner = '<img class="logro-banner__cover" src="' + Utils.escapeHtml(v.src) +
          '" style="object-position:' + Utils.escapeHtml(v.pos || 'center top') +
          '" onerror="this.style.display=\'none\'">';
      } else if (v.type === 'trophy') {
        bannerInner = '<img class="logro-banner__trophy" src="' + Utils.escapeHtml(v.src) + '" alt="Platino" onerror="this.style.display=\'none\'">';
      } else if (v.type === 'bigtext') {
        bannerInner = '<div class="logro-banner__bignum">' + Utils.escapeHtml(v.text) +
          (v.sub ? '<span class="logro-banner__bignumsub">' + Utils.escapeHtml(v.sub) + '</span>' : '') +
          '</div>';
      } else {
        bannerInner = '<div class="logro-banner__icon">' + (v.icon || '') + '</div>';
      }

      /* Footer */
      var footerHtml;
      if (l.winner) {
        footerHtml =
          '<div class="logro-footer__info">' +
            '<div class="logro-winner-name" style="color:' + playerColor(l.winner) + '">' + Utils.escapeHtml(l.winner) + '</div>' +
            '<div class="logro-winner-detail">' + Utils.escapeHtml(l.detail) + '</div>' +
          '</div>' +
          '<div class="logro-footer__val" style="color:' + (l.valColor || 'var(--txt2)') + '">' + Utils.escapeHtml(String(l.value)) + '</div>';
      } else {
        footerHtml =
          '<div class="logro-footer__info">' +
            '<div class="logro-winner-name" style="color:var(--txt3);font-size:0.85rem">Sin datos</div>' +
            '<div class="logro-winner-detail">' + Utils.escapeHtml(l.detail || '') + '</div>' +
          '</div>';
      }

      var cardClick = l.gameId
        ? ' onclick="window.GT.GameDetailModal.open(\'' + l.gameId.replace(/'/g, "\\'") + '\')" style="cursor:pointer" title="Ver ficha del juego"'
        : '';
      return '<div class="logro-card"' + cardClick + '>' +
        '<div class="logro-banner" style="background:' + v.bg + '">' +
          bannerInner +
          '<div class="logro-banner__overlay">' +
            '<span class="logro-badge">' + Utils.escapeHtml(l.badge) + '</span>' +
            '<span class="logro-desc-badge">' + Utils.escapeHtml(l.desc) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="logro-footer">' + footerHtml + '</div>' +
      '</div>';
    }).join('');
  }

  /* ── RENDER ALL ─────────────────────────────────────────── */
  function renderAll(year, player) {
    renderStatCards(year, player);
    renderGenreChart(year, player);
    renderPlatformChart(year, player);
    renderHistoryChart(player);
    renderLogros(year, player);
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
    a.download = 'gametracker-backup-' + new Date().toISOString().slice(0, 10) + '.json';
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
              var b = db.batch(); ch.forEach(function(d){ b.delete(d.ref); }); return b.commit();
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
              ch.forEach(function(item){ b.set(db.collection(col).doc(item.id), Object.assign({}, item, { importadoEn: now })); });
              return b.commit();
            });
          }, Promise.resolve());
        }

        Promise.all([db.collection('biblioteca').get(), db.collection('registro').get()])
          .then(function(res){ return deleteDocs(res[0].docs.concat(res[1].docs)); })
          .then(function(){ Toast.show('Importando ' + totalB + ' juegos... ☕'); return writeDocs('biblioteca', data.biblioteca); })
          .then(function(){ Toast.show('Importando ' + totalR + ' entradas...'); return writeDocs('registro', data.registro); })
          .then(function(){
            Toast.show('¡' + totalB + ' juegos y ' + totalR + ' entradas importadas! ✓ Recargando...');
            setTimeout(function(){ location.reload(); }, 2000);
          })
          .catch(function(err){ Toast.show('Error Firestore: ' + err.message, 'error'); });
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
    sel.innerHTML = '<option value="0">🌐 Global</option>' +
      years.map(function(y){
        return '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
      }).join('');
    sel.value = String(currentYear);
    sel.addEventListener('change', function(){
      state.year = parseInt(this.value) || 0;
      renderAll(state.year || null, state.player);
    });
  }

  /* ── PLAYER TABS ────────────────────────────────────────── */
  function buildPlayerTabs() {
    document.getElementById('statsPlayerTabs').querySelectorAll('.player-tab').forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.player = this.dataset.player;
        document.querySelectorAll('#statsPlayerTabs .player-tab').forEach(function(b){ b.className = 'player-tab'; });
        var cls = state.player === 'All' ? 'active-all' :
                  'active-' + state.player.toLowerCase();
        this.className = 'player-tab ' + cls;
        renderAll(state.year || null, state.player);
      });
    });
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    var _ny = document.getElementById('navYear'); if (_ny) _ny.textContent = currentYear;
    var _fy = document.getElementById('footerYear'); if (_fy) _fy.textContent = currentYear;

    buildYearOptions();
    buildPlayerTabs();

    /* Pre-select active player from localStorage */
    var ap = window.GT.getActivePlayer ? window.GT.getActivePlayer() : null;
    if (ap && ap !== 'All') {
      state.player = ap;
      document.querySelectorAll('#statsPlayerTabs .player-tab').forEach(function(b){ b.className = 'player-tab'; });
      var activeTab = document.querySelector('#statsPlayerTabs [data-player="' + ap + '"]');
      if (activeTab) activeTab.className = 'player-tab active-' + ap.toLowerCase();
    }

    document.getElementById('btnExport').addEventListener('click', exportData);
    document.getElementById('btnImport').addEventListener('click', function(){ document.getElementById('importFile').click(); });
    document.getElementById('importFile').addEventListener('change', function(){ if (this.files[0]) importData(this.files[0]); this.value = ''; });
    document.getElementById('btnReset').addEventListener('click', function(){
      if (!confirm('¿Restaurar los datos de demostración? Perderás los cambios actuales.')) return;
      window.GT.SampleData.reset();
      Toast.show('Datos de demo restaurados. Recargando...');
      setTimeout(function(){ location.reload(); }, 1000);
    });

    renderAll(state.year, state.player);
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      safe(init, 'init');
      window.GT.onDataChange(function () {
        safe(function(){ renderAll(state.year || null, state.player); }, 'renderAll');
      });
    });
  });
})();
