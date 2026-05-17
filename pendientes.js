/* ============================================================
   GAMETRACKER — Pendientes / Perfiles Page
   Version: 20260518c
   ============================================================ */
(function () {
  'use strict';

  var Utils      = window.GT.Utils;
  var Biblioteca = window.GT.Biblioteca;
  var Registro   = window.GT.Registro;
  var Toast      = window.GT.Toast;

  var PLAYERS = [
    { key: 'David', name: 'David Garde',   initial: 'D', color: 'var(--player-david)' },
    { key: 'Javi',  name: 'Javier Garde',  initial: 'J', color: 'var(--player-javi)'  },
    { key: 'Mery',  name: 'Mariam Moreno', initial: 'M', color: 'var(--player-mery)'  }
  ];

  function safe(fn, name) {
    try { fn(); } catch(e) { console.warn('pendientes.js ' + name + ':', e); }
  }

  /* ── RENDER PLAYER PROFILE ──────────────────────────────────── */
  function renderPlayer(player) {
    var key   = player.key;
    var color = player.color;

    /* --- Pending games ---------------------------------------- */
    var pendingGames = Biblioteca.getAll().filter(function(g) {
      return (g.pendientePor || []).includes(key);
    }).sort(function(a, b) { return a.titulo.localeCompare(b.titulo, 'es'); });

    /* --- Registro data ---------------------------------------- */
    var entries = Registro.filter({ jugador: key });

    var totalJuegos = new Set(entries.map(function(r) { return r.juegoId; })).size;
    var totalHoras  = Math.round(entries.reduce(function(acc, r) { return acc + (parseFloat(r.horas) || 0); }, 0));
    var scored      = entries.filter(function(r) { return r.nota !== null && r.nota !== undefined && r.nota !== ''; });
    var avgScore    = scored.length
      ? Math.round((scored.reduce(function(a, r) { return a + parseFloat(r.nota); }, 0) / scored.length) * 100) / 100
      : null;

    /* --- Top rated -------------------------------------------- */
    var gameScores = {};
    scored.forEach(function(r) {
      if (!gameScores[r.juegoId]) gameScores[r.juegoId] = [];
      gameScores[r.juegoId].push(parseFloat(r.nota));
    });
    var topRated = Object.keys(gameScores).map(function(id) {
      var notas = gameScores[id];
      var avg   = Math.round((notas.reduce(function(a, b) { return a + b; }, 0) / notas.length) * 100) / 100;
      return { game: Biblioteca.getById(id), avg: avg };
    }).filter(function(x) { return x.game; })
      .sort(function(a, b) { return b.avg - a.avg; })
      .slice(0, 6);

    /* --- Completados (Terminado / Rejugado, deduplicated) ------- */
    var completadosSeen = {};
    var completados = [];
    entries.filter(function(r) { return r.estado === 'Terminado' || r.estado === 'Rejugado'; })
      .forEach(function(r) {
        if (!completadosSeen[r.juegoId]) {
          completadosSeen[r.juegoId] = true;
          var g = Biblioteca.getById(r.juegoId);
          if (g) completados.push({ game: g, entry: r });
        }
      });

    /* ── Build HTML ──────────────────────────────────────────── */

    /* Header */
    var statsStr = totalJuegos + ' jugados · ' + totalHoras + 'h' +
      (avgScore ? ' · ★ ' + avgScore.toFixed(2).replace('.', ',') : '');

    var headerHtml =
      '<div class="pp-header">' +
        '<div class="pp-avatar" style="background:' + color + '">' + player.initial + '</div>' +
        '<div style="flex:1">' +
          '<div class="pp-name">' + Utils.escapeHtml(player.name) + '</div>' +
          '<div class="pp-stats">' + pendingGames.length + ' pendientes · ' + statsStr + '</div>' +
        '</div>' +
        '<a href="registro.html" class="btn btn-ghost btn-sm" style="font-size:0.75rem">📋 Registro</a>' +
      '</div>';

    /* ── Pending games list ------------------------------------- */
    var pendListHtml;
    if (pendingGames.length) {
      pendListHtml = pendingGames.map(function(game, idx) {
        var hidden = idx >= 8 ? ' pp-pend-item--more hidden' : '';
        return '<div class="pp-pend-item' + hidden + '">' +
          '<div class="mini-cover" style="width:34px;height:34px;flex-shrink:0">' +
            (game.portadaUrl ? '<img src="' + Utils.escapeHtml(game.portadaUrl) + '" alt="" onerror="this.style.display=\'none\'">' : '') +
            '<span class="mini-cover__letter" style="font-size:0.65rem">' + Utils.escapeHtml(game.titulo.charAt(0)) + '</span>' +
          '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-weight:600;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + Utils.escapeHtml(game.titulo) + '</div>' +
            '<div style="margin-top:0.1rem">' + Utils.platformBadgesHtml(game.plataformas) + '</div>' +
          '</div>' +
          '<button class="btn btn-ghost btn-sm" style="font-size:0.68rem;flex-shrink:0" ' +
            'onclick="window.GT_Pend.markPlayed(\'' + game.id + '\',\'' + key + '\')">✓</button>' +
        '</div>';
      }).join('');

      if (pendingGames.length > 8) {
        pendListHtml += '<button class="btn btn-ghost btn-sm pp-show-more" ' +
          'onclick="window.GT_Pend.toggleMore(this)">+ Ver ' + (pendingGames.length - 8) + ' más</button>';
      }
    } else {
      pendListHtml = '<p style="font-size:0.8rem;color:var(--txt3);font-style:italic;padding:0.5rem 0">Sin juegos pendientes asignados.<br>' +
        '<a href="biblioteca.html" style="color:' + color + '">Márcarlos en la Biblioteca →</a></p>';
    }

    /* ── Top rated --------------------------------------------- */
    var topHtml = topRated.length
      ? '<div class="pp-top-grid">' + topRated.map(function(item) {
          var sc = Utils.scoreColor(item.avg);
          var objPos = Utils.escapeHtml(item.game.portadaPos || 'center top');
          return '<div class="pp-top-item" onclick="window.GT.GameDetailModal.open(\'' + item.game.id + '\')" title="' + Utils.escapeHtml(item.game.titulo) + '">' +
            '<div class="pp-top-cover">' +
              (item.game.portadaUrl
                ? '<img src="' + Utils.escapeHtml(item.game.portadaUrl) + '" alt="" style="object-position:' + objPos + '">'
                : '<div class="pp-top-ph">' + Utils.escapeHtml(item.game.titulo.charAt(0)) + '</div>') +
            '</div>' +
            '<div style="font-size:0.67rem;font-weight:600;text-align:center;margin-top:0.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--txt2)">' + Utils.escapeHtml(item.game.titulo) + '</div>' +
            '<div style="text-align:center;font-family:Orbitron,sans-serif;font-size:0.72rem;font-weight:700;color:' + sc + '">' + Utils.formatScore(item.avg) + '</div>' +
          '</div>';
        }).join('') + '</div>'
      : '<p style="font-size:0.8rem;color:var(--txt3);font-style:italic;padding:0.5rem 0">Sin notas registradas aún</p>';

    /* ── Completados -------------------------------------------- */
    var compHtml = completados.length
      ? completados.slice(0, 12).map(function(item) {
          var sc = Utils.scoreColor(item.entry.nota);
          return '<div class="pp-comp-item" onclick="window.GT.GameDetailModal.open(\'' + item.game.id + '\')">' +
            '<div class="mini-cover" style="width:30px;height:30px;flex-shrink:0">' +
              (item.game.portadaUrl ? '<img src="' + Utils.escapeHtml(item.game.portadaUrl) + '" alt="" onerror="this.style.display=\'none\'">' : '') +
              '<span class="mini-cover__letter" style="font-size:0.6rem">' + Utils.escapeHtml(item.game.titulo.charAt(0)) + '</span>' +
            '</div>' +
            '<span style="flex:1;min-width:0;font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + Utils.escapeHtml(item.game.titulo) + '</span>' +
            (item.entry.nota !== null && item.entry.nota !== undefined && item.entry.nota !== ''
              ? '<span style="font-family:Orbitron,sans-serif;font-size:0.72rem;font-weight:700;color:' + sc + ';flex-shrink:0">' + Utils.formatScore(item.entry.nota) + '</span>'
              : '') +
            '<span class="badge badge-terminado" style="font-size:0.62rem;flex-shrink:0">' + Utils.escapeHtml(item.entry.estado) + '</span>' +
          '</div>';
        }).join('')
      : '<p style="font-size:0.8rem;color:var(--txt3);font-style:italic;padding:0.5rem 0">Sin juegos completados aún</p>';

    /* ── Compose section ---------------------------------------- */
    return '<div class="player-profile" style="--pp-color:' + color + '">' +
      headerHtml +
      '<div class="pp-body">' +
        '<div class="pp-sub">' +
          '<div class="pp-sub-title">⏳ Pendientes (' + pendingGames.length + ')</div>' +
          '<div class="pp-pend-list">' + pendListHtml + '</div>' +
        '</div>' +
        '<div class="pp-sub">' +
          '<div class="pp-sub-title">⭐ Mejores valorados</div>' +
          topHtml +
        '</div>' +
        '<div class="pp-sub">' +
          '<div class="pp-sub-title">🏆 Completados (' + completados.length + ')</div>' +
          '<div class="pp-comp-list">' + compHtml + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── RENDER ALL ─────────────────────────────────────────────── */
  function render() {
    var container = document.getElementById('playerProfiles');
    if (!container) return;
    container.innerHTML = PLAYERS.map(function(p) {
      return renderPlayer(p);
    }).join('');
  }

  /* ── ACTIONS ─────────────────────────────────────────────────── */
  function markPlayed(gameId, playerKey) {
    var game = Biblioteca.getById(gameId);
    if (!game) return;
    var por = (game.pendientePor || []).filter(function(p) { return p !== playerKey; });
    Biblioteca.update(gameId, { pendientePor: por, pendiente: por.length > 0 });
    Toast.show(playerKey + ': "' + game.titulo + '" marcado como jugado ✓');
    render();
  }

  function toggleMore(btn) {
    var list  = btn.closest('.pp-pend-list');
    var items = list.querySelectorAll('.pp-pend-item--more');
    var anyHidden = Array.prototype.some.call(items, function(el) { return el.classList.contains('hidden'); });
    items.forEach(function(el) {
      el.classList.toggle('hidden', !anyHidden ? true : false);
    });
    if (anyHidden) {
      items.forEach(function(el) { el.classList.remove('hidden'); });
      btn.textContent = '▲ Ver menos';
    } else {
      items.forEach(function(el) { el.classList.add('hidden'); });
      btn.textContent = '+ Ver ' + items.length + ' más';
    }
  }

  /* ── INIT ────────────────────────────────────────────────────── */
  function init() {
    document.getElementById('navYear').textContent    = new Date().getFullYear();
    document.getElementById('footerYear').textContent = new Date().getFullYear();
    render();
  }

  window.GT_Pend = { markPlayed: markPlayed, toggleMore: toggleMore };

  document.addEventListener('DOMContentLoaded', function () {
    window.GT.onDataReady(function () {
      safe(init, 'init');
      window.GT.onDataChange(function () { safe(render, 'render'); });
    });
  });
})();
