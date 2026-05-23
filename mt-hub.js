/* ============================================================
   MEDIA TRACKER HUB — Lógica de selección
   Version: 20260522a
   ============================================================ */
(function () {
  'use strict';

  var phasePlayer  = document.getElementById('phasePlayer');
  var phaseCat     = document.getElementById('phaseCat');
  var greetPlayer  = document.getElementById('greetPlayer');
  var flash        = document.getElementById('mthFlash');
  var backBtn      = document.getElementById('backToPlayer');

  /* ── SONIDOS ─────────────────────────────────────────────── */
  function playSelectSound(freq1, freq2) {
    try {
      var ac = new (window.AudioContext || window.webkitAudioContext)();
      var now = ac.currentTime;
      [freq1, freq2].forEach(function (f, i) {
        var osc = ac.createOscillator(), g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.value = f;
        var t = now + i * 0.1;
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t); osc.stop(t + 0.3);
      });
    } catch (e) {}
  }

  function playCatSound(cat) {
    var sounds = {
      peliculas: [440, 554],   /* La-Do# — dramático */
      series:    [523, 659],   /* Do-Mi  — TV jingle */
      anime:     [587, 784]    /* Re-Sol — alegre */
    };
    var s = sounds[cat] || [440, 554];
    playSelectSound(s[0], s[1]);
  }

  /* ── FASE 1 → 2: selección de jugador ───────────────────── */
  document.querySelectorAll('.mth-pcard').forEach(function (card) {
    card.addEventListener('click', function () {
      var player = this.dataset.player;
      try { localStorage.setItem('MT_player', player); } catch (e) {}

      greetPlayer.textContent = player;
      playSelectSound(330, 415);

      /* Salida de fase 1 */
      phasePlayer.classList.add('mth-phase--exit');
      setTimeout(function () {
        phasePlayer.classList.add('mth-phase--hidden');
        phasePlayer.classList.remove('mth-phase--exit');
        phasePlayer.style.display = 'none';

        /* Entrada de fase 2 */
        phaseCat.classList.remove('mth-phase--hidden');
        phaseCat.style.display = '';
        phaseCat.classList.add('mth-phase--enter');
      }, 320);
    });
  });

  /* ── FASE 2 → 1: volver a cambiar jugador ───────────────── */
  backBtn.addEventListener('click', function () {
    phaseCat.classList.add('mth-phase--exit');
    setTimeout(function () {
      phaseCat.classList.add('mth-phase--hidden');
      phaseCat.classList.remove('mth-phase--exit', 'mth-phase--enter');

      phasePlayer.style.display = '';
      phasePlayer.classList.remove('mth-phase--hidden', 'mth-phase--exit');
    }, 320);
  });

  /* ── SELECCIÓN DE CATEGORÍA ─────────────────────────────── */
  document.querySelectorAll('.mth-cat').forEach(function (cat) {
    cat.addEventListener('click', function () {
      var catName = this.dataset.cat;
      try { localStorage.setItem('MT_cat', catName); } catch (e) {}

      playCatSound(catName);

      flash.className = 'mth-flash mth-flash--' + catName + ' mth-flash--active';
      setTimeout(function () {
        window.location.href = 'mt-biblioteca.html';
      }, 380);
    });
  });

  /* ── RESTAURAR JUGADOR SI VUELVES ───────────────────────── */
  try {
    var savedPlayer = localStorage.getItem('MT_player');
    if (savedPlayer) {
      greetPlayer.textContent = savedPlayer;
    }
  } catch (e) {}

})();
