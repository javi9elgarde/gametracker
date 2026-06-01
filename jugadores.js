(function () {
  'use strict';

  var PLAYERS = [
    { key: 'David', cls: 'david', avatar: 'icondavidneutral.png', fullName: 'David Garde' },
    { key: 'Javi',  cls: 'javi',  avatar: 'iconjavineutral.png',  fullName: 'Javier Garde' },
    { key: 'Mery',  cls: 'mery',  avatar: 'iconmeryneutral.png',  fullName: 'Mariam Moreno' }
  ];

  function waitForDb(cb) {
    if (window.GT && window.GT.db) return cb(window.GT.db);
    setTimeout(function () { waitForDb(cb); }, 100);
  }

  function goToPlayer(key) {
    if (window.GT && window.GT.setActivePlayer) window.GT.setActivePlayer(key);
    window.location.href = 'pendientes.html';
  }

  function renderCards(stats) {
    var grid = document.getElementById('jugadoresGrid');
    if (!grid) return;
    grid.innerHTML = PLAYERS.map(function (p) {
      var s = stats[p.key] || { juegos: 0, horas: 0, pendientes: 0, platinos: 0 };
      return '<div class="jugador-card jugador-card--' + p.cls + '" onclick="window.GT_goToPlayer(\'' + p.key + '\')" role="button" tabindex="0">' +
        '<div class="jugador-card__avatar">' +
          '<img src="' + p.avatar + '" alt="' + p.fullName + '" onerror="this.style.display=\'none\'">' +
        '</div>' +
        '<div class="jugador-card__name">' + p.fullName + '</div>' +
        '<div class="jugador-card__stats">' +
          '<div class="jugador-card__stat"><div class="jugador-card__stat-val">' + s.juegos + '</div><div class="jugador-card__stat-lbl">Jugados</div></div>' +
          '<div class="jugador-card__stat"><div class="jugador-card__stat-val">' + (s.horas > 999 ? Math.round(s.horas / 1000 * 10) / 10 + 'k' : s.horas) + '</div><div class="jugador-card__stat-lbl">Horas</div></div>' +
          '<div class="jugador-card__stat"><div class="jugador-card__stat-val">' + s.platinos + '</div><div class="jugador-card__stat-lbl">Platinos</div></div>' +
          '<div class="jugador-card__stat"><div class="jugador-card__stat-val">' + s.pendientes + '</div><div class="jugador-card__stat-lbl">Pendientes</div></div>' +
        '</div>' +
      '</div>';
    }).join('');

    /* keyboard enter support */
    grid.querySelectorAll('.jugador-card').forEach(function (card, i) {
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') goToPlayer(PLAYERS[i].key);
      });
    });
  }

  window.GT_goToPlayer = goToPlayer;

  document.addEventListener('DOMContentLoaded', function () {
    if (window.GT && window.GT.Nav) window.GT.Nav.init();
  });

  waitForDb(function (db) {
    var stats = {};
    PLAYERS.forEach(function (p) { stats[p.key] = { juegos: 0, horas: 0, pendientes: 0, platinos: 0 }; });

    /* Load from Registro (entries) */
    db.collection('registro').get().then(function (snap) {
      snap.forEach(function (doc) {
        var r = doc.data();
        var p = stats[r.jugador];
        if (!p) return;
        p.juegos++;
        p.horas += parseFloat(r.horas) || 0;
        if (r.estado === 'Platinado') p.platinos++;
        if (r.estado === 'Retomar' || r.estado === 'Jugando') p.pendientes++;
      });
      /* Round horas */
      PLAYERS.forEach(function (pl) { stats[pl.key].horas = Math.round(stats[pl.key].horas); });
      renderCards(stats);

      if (window.GT && window.GT.Nav) window.GT.Nav.init();
      if (window.GT && window.GT.hideLoading) window.GT.hideLoading();
      else {
        var el = document.getElementById('gtLoading');
        if (el) { el.style.opacity = '0'; setTimeout(function () { el.style.display = 'none'; }, 400); }
      }
    }).catch(function () {
      /* Fallback: render with zeros */
      renderCards(stats);
      var el = document.getElementById('gtLoading');
      if (el) { el.style.opacity = '0'; setTimeout(function () { el.style.display = 'none'; }, 400); }
    });
  });
})();
