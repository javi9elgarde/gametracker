(function () {
  'use strict';

  /* ── ELEMENTOS ─────────────────────────────────────────── */
  var hub       = document.getElementById('hub');
  var zoneLeft  = document.getElementById('zoneLeft');
  var zoneRight = document.getElementById('zoneRight');
  var canvas    = document.getElementById('hubCanvas');
  var ctx       = canvas.getContext('2d');
  var flash     = document.getElementById('hubFlash');

  /* ── CANVAS RESIZE ─────────────────────────────────────── */
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ── SISTEMA DE PARTÍCULAS ─────────────────────────────── */
  var particles = [];
  var spawnTimer = null;
  var currentSide = null;

  function spawnBatch(side) {
    var isLeft = (side === 'left');
    var count  = 10;
    var cx     = window.innerWidth;
    var cy     = window.innerHeight;

    for (var i = 0; i < count; i++) {
      var xRange = isLeft ? [0, cx * 0.45] : [cx * 0.55, cx];
      var x = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
      var y = cy * 0.25 + Math.random() * (cy * 0.55);

      particles.push({
        x:     x,
        y:     y,
        vx:    (Math.random() - 0.5) * 1.2,
        vy:    -(0.4 + Math.random() * 1.4),
        life:  1,
        decay: 0.007 + Math.random() * 0.01,
        size:  isLeft ? (3 + Math.random() * 5) : (2 + Math.random() * 4),
        color: isLeft ? '#00ff88' : '#4facfe',
        shape: isLeft ? 'square' : 'circle',
        rot:   Math.random() * Math.PI * 2,
        rotV:  (Math.random() - 0.5) * 0.06
      });
    }
  }

  function startSpawning(side) {
    if (currentSide === side) return;
    currentSide = side;
    clearInterval(spawnTimer);
    spawnBatch(side);
    spawnTimer = setInterval(function () { spawnBatch(side); }, 280);
  }

  function stopSpawning() {
    currentSide = null;
    clearInterval(spawnTimer);
  }

  function tickParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotV;
      p.life -= p.decay;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.save();
      ctx.globalAlpha = p.life * 0.75;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 8;

      if (p.shape === 'square') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* Loop de animación */
  function loop() {
    tickParticles();
    drawParticles();
    requestAnimationFrame(loop);
  }
  loop();

  /* ── HOVER — cambio de estado ──────────────────────────── */
  zoneLeft.addEventListener('mouseenter', function () {
    hub.classList.add('hover-left');
    hub.classList.remove('hover-right');
    startSpawning('left');
  });

  zoneRight.addEventListener('mouseenter', function () {
    hub.classList.add('hover-right');
    hub.classList.remove('hover-left');
    startSpawning('right');
  });

  /* Al salir del hub completo → estado neutro */
  hub.addEventListener('mouseleave', function () {
    hub.classList.remove('hover-left', 'hover-right');
    stopSpawning();
  });

  /* ── SONIDOS (Web Audio API sintetizados) ──────────────── */
  function playGameSound() {
    try {
      var ac  = new (window.AudioContext || window.webkitAudioContext)();
      var now = ac.currentTime;
      /* 8-bit coin jingle: C5-E5-G5-C6 */
      [523, 659, 784, 1047].forEach(function (freq, i) {
        var osc = ac.createOscillator();
        var g   = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = 'square';
        osc.frequency.value = freq;
        var t = now + i * 0.08;
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t); osc.stop(t + 0.2);
      });
    } catch (e) {}
  }

  function playCinemaSound() {
    try {
      var ac  = new (window.AudioContext || window.webkitAudioContext)();
      var now = ac.currentTime;

      /* Low dramatic boom */
      var o1 = ac.createOscillator(), g1 = ac.createGain();
      o1.connect(g1); g1.connect(ac.destination);
      o1.type = 'sine';
      o1.frequency.setValueAtTime(110, now);
      o1.frequency.exponentialRampToValueAtTime(50, now + 0.45);
      g1.gain.setValueAtTime(0.28, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      o1.start(now); o1.stop(now + 0.65);

      /* High shimmer */
      var o2 = ac.createOscillator(), g2 = ac.createGain();
      o2.connect(g2); g2.connect(ac.destination);
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(880, now + 0.04);
      o2.frequency.exponentialRampToValueAtTime(1760, now + 0.22);
      g2.gain.setValueAtTime(0.07, now + 0.04);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      o2.start(now + 0.04); o2.stop(now + 0.55);
    } catch (e) {}
  }

  /* ── FLASH DE PANTALLA ─────────────────────────────────── */
  function doFlash(side) {
    flash.className = 'hub__flash hub__flash--' + side + ' active';
    setTimeout(function () { flash.className = 'hub__flash'; }, 600);
  }

  /* ── OVERLAY PRÓXIMAMENTE ──────────────────────────────── */
  function showComingSoon() {
    var overlay = document.createElement('div');
    overlay.className = 'hub__soon';
    overlay.innerHTML =
      '<div class="hub__soon-title">🎬 PRÓXIMAMENTE</div>' +
      '<div class="hub__soon-sub">CineTracker · Películas · Series · Anime</div>' +
      '<div class="hub__soon-sub" style="font-size:0.75rem;margin-top:0.25rem">En construcción...</div>' +
      '<button class="hub__soon-back" id="soonBack">← VOLVER AL HUB</button>';
    document.body.appendChild(overlay);

    /* Forzar reflow para la transición */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('visible');
      });
    });

    document.getElementById('soonBack').addEventListener('click', function () {
      overlay.classList.remove('visible');
      setTimeout(function () { overlay.remove(); }, 400);
    });
  }

  /* ── CHARACTER SELECTION ────────────────────────────────── */
  var pselOverlay = document.getElementById('pselOverlay');
  var pselFlash   = document.getElementById('pselFlash');

  var PLAYER_COLORS = { David: '#3b82f6', Javi: '#9b1742', Mery: '#9b59ff' };

  function openPlayerSelect() {
    pselOverlay.classList.add('open');
    document.querySelectorAll('.psel__card').forEach(function(c) { c.classList.remove('choosing'); });
    pselFlash.style.background = '';
    pselFlash.classList.remove('active');
  }

  function closePlayerSelect() {
    pselOverlay.classList.remove('open');
  }

  document.getElementById('pselBack').addEventListener('click', closePlayerSelect);

  document.querySelectorAll('.psel__card').forEach(function(card) {
    card.addEventListener('click', function() {
      var player = this.dataset.player;
      var color  = PLAYER_COLORS[player] || '#4facfe';

      document.querySelectorAll('.psel__card').forEach(function(c) { c.classList.remove('choosing'); });
      this.classList.add('choosing');

      try { localStorage.setItem('GT_player', player); } catch(e) {}

      pselFlash.style.background = color;
      pselFlash.classList.add('active');
      playGameSound();

      setTimeout(function() { window.location.href = 'index.html'; }, 420);
    });
  });

  /* ── CLICKS ────────────────────────────────────────────── */
  zoneLeft.addEventListener('click', function () {
    openPlayerSelect();
  });

  zoneRight.addEventListener('click', function () {
    playCinemaSound();
    doFlash('right');
    setTimeout(function () { window.location.href = 'mt-hub.html'; }, 300);
  });

  /* ── TOUCH (móvil) ─────────────────────────────────────── */
  var touchSide = null;

  document.addEventListener('touchstart', function (e) {
    var x = e.touches[0].clientX;
    touchSide = x < window.innerWidth / 2 ? 'left' : 'right';
    hub.classList.toggle('hover-left',  touchSide === 'left');
    hub.classList.toggle('hover-right', touchSide === 'right');
    startSpawning(touchSide);
  }, { passive: true });

  document.addEventListener('touchend', function () {
    hub.classList.remove('hover-left', 'hover-right');
    stopSpawning();
  });

})();
