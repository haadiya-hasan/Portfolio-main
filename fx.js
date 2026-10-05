/* FX LAYER — cursor, living background, figures, interactions */
(() => {
  const fine = matchMedia('(pointer:fine)').matches;
  const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const rnd = n => Math.random() * n;
  let mx = -999, my = -999;

  /* ---------- sound engine (WebAudio, no files; muted by default) ---------- */
  const PENT = [523.25, 587.33, 659.25, 783.99, 880];
  const snd = {
    on: false, ctx: null, _l: 0,
    init() {
      if (!this.ctx) {
        const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
        this.ctx = new A(); this.master = this.ctx.createGain(); this.master.gain.value = .6; this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    },
    tone(f, d = .25, v = .06, type = 'sine', at = 0, glide = 0) {
      if (!this.on || !this.ctx) return;
      const t = this.ctx.currentTime + at, o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + d);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(this.master); o.start(t); o.stop(t + d + .05);
    },
    chime() { const n = performance.now(); if (n - this._l < 130) return; this._l = n; this.tone(PENT[rnd(5) | 0] * 2, .4, .022); },
    burst() { [0, 1, 2, 3, 4].forEach(i => this.tone(PENT[i] * (i % 2 ? 2 : 1), .5, .04, 'sine', i * .05)); },
    pop() { this.tone(520, .09, .06, 'triangle'); this.tone(780, .09, .04, 'sine', .04); },
    tick() { this.tone(1800, .035, .014); },
    whoosh() { this.tone(180, .7, .035, 'sine', 0, 900); },
    done() { [0, 2, 4, 3, 4].forEach((n, i) => this.tone(PENT[n] * 2, .45, .05, 'sine', i * .09)); }
  };
  const btnSnd = $('.snd-toggle');
  function setSound(v) {
    snd.on = v; if (v) snd.init();
    btnSnd?.classList.toggle('on', v); btnSnd?.setAttribute('title', v ? 'Sound on' : 'Sound off');
    try { localStorage.setItem('snd', v ? '1' : '0'); } catch (e) {}
    if (v) snd.pop();
  }
  btnSnd?.addEventListener('click', () => setSound(!snd.on));
  addEventListener('pointerdown', () => { if (snd.on) snd.init(); });
  let lastHover = null;
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('a,button,.project,.chip');
    if (t && t !== lastHover && t !== btnSnd) snd.tick(); lastHover = t;
  });
  $('.bot')?.addEventListener('click', () => { snd.tone(330, .12, .07, 'triangle'); snd.tone(494, .15, .06, 'triangle', .08); });

  // bug fix: hero headline/kicker are .reveal (opacity 0) but were never revealed
  $$('.reveal').forEach(e => e.classList.add('show'));

  // bug fix: script.js wraps the <br> in a .word span, so the headline never breaks and "intelligent" touches "things"
  $$('.hero h1 .word').forEach(w => { if (w.querySelector('br') && !w.textContent.trim()) w.replaceWith(document.createElement('br')); });

  // marquee loop
  const mq = $('.marquee div');
  if (mq) mq.innerHTML += mq.innerHTML;

  /* ---------- sparkles ---------- */
  const chars = ['✦', '✧', '♡', '✿'], cols = ['#c98fb8', '#8d718b', '#e8a6c4'];
  function spark(x, y, n, burst) {
    burst ? snd.burst() : snd.chime();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i'), a = rnd(6.28), d = burst ? 40 + rnd(60) : 8 + rnd(14);
      s.className = 'spark';
      s.textContent = chars[rnd(4) | 0];
      s.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d + (burst ? 0 : 16)}px;--s:${.6 + rnd(.9)};color:${cols[rnd(3) | 0]}`;
      document.body.append(s);
      s.onanimationend = () => s.remove();
    }
  }

  /* ---------- cute cursor ---------- */
  if (fine && !still) {
    document.body.classList.add('fx-cursor');
    const mk = (c, h) => { const e = document.createElement('div'); e.className = c; e.innerHTML = h; document.body.append(e); return e; };
    const dot = mk('c-dot', '<svg viewBox="0 0 24 24"><path d="M12 1c1 6 5 10 11 11-6 1-10 5-11 11-1-6-5-10-11-11 6-1 10-5 11-11z"/></svg>');
    const ring = mk('c-ring', '<i></i><span></span>');
    const label = $('span', ring);
    let rx = innerWidth / 2, ry = innerHeight / 2, last = 0;

    addEventListener('pointermove', e => {
      dot.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      document.body.classList.add('c-live');
      const t = performance.now();
      if (t - last > 50) { last = t; spark(e.clientX, e.clientY, 1); }
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('a,button,.project,.stack-list article,.orb,.bot');
      document.body.classList.toggle('c-hover', !!t);
      label.textContent = !t ? '' : t.classList.contains('project') ? 'OPEN' : t.matches('.orb,.bot') ? 'POP!' : '';
    });
    addEventListener('pointerdown', e => { document.body.classList.add('c-down'); spark(e.clientX, e.clientY, 10, true); });
    addEventListener('pointerup', () => document.body.classList.remove('c-down'));
  }
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  /* ---------- living background: drifting neural particles ---------- */
  const cv = $('#bg');
  if (cv) {
    const cx = cv.getContext('2d');
    let W, H, P = [];
    const size = () => {
      W = cv.width = innerWidth; H = cv.height = innerHeight;
      P = Array.from({ length: Math.min(80, (W * H / 20000) | 0) }, () => ({ x: rnd(W), y: rnd(H), vx: rnd(.5) - .25, vy: rnd(.5) - .25, r: 1 + rnd(2) }));
    };
    size(); addEventListener('resize', size);
    const draw = () => {
      cx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < 110 && d > 0) { p.x += dx / d * 1.1; p.y += dy / d * 1.1; }
      }
      for (let i = 0; i < P.length; i++) {
        const a = P[i];
        for (let j = i + 1; j < P.length; j++) {
          const b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) { cx.strokeStyle = `rgba(190,150,185,${.22 * (1 - d / 130)})`; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
        }
        const dm = Math.hypot(a.x - mx, a.y - my);
        if (dm < 170) { cx.strokeStyle = `rgba(201,143,184,${.5 * (1 - dm / 170)})`; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(mx, my); cx.stroke(); }
        cx.fillStyle = 'rgba(190,150,185,.45)'; cx.beginPath(); cx.arc(a.x, a.y, a.r, 0, 6.28); cx.fill();
      }
      if (!still) requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- neural net figure ---------- */
  const net = $('.net');
  if (net) {
    const L = [3, 5, 5, 2];
    const ns = L.map((n, i) => Array.from({ length: n }, (_, j) => [30 + i * 86, 100 + (j - (n - 1) / 2) * 34]));
    let h = '';
    ns.forEach((l, i) => i && l.forEach(b => ns[i - 1].forEach(a => h += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="animation-delay:${-rnd(3)}s"/>`)));
    ns.flat().forEach(p => h += `<circle cx="${p[0]}" cy="${p[1]}" r="6" style="animation-delay:${-rnd(3)}s"/>`);
    net.innerHTML = h;
  }

  /* ---------- floating shapes with parallax ---------- */
  const art = [
    '<circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 4"/>',
    '<path d="M20 6v28M6 20h28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    '<path d="M20 3c1 9 8 16 17 17-9 1-16 8-17 17-1-9-8-16-17-17 9-1 16-8 17-17z" fill="currentColor"/>',
    '<path d="M2 20q6-14 12 0t12 0t12 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  ];
  const shapes = [];
  $$('.section,.contact').forEach((sec, i) => {
    for (let k = 0; k < 2; k++) {
      const f = document.createElement('div');
      f.className = 'fshape';
      f.innerHTML = `<svg viewBox="0 0 40 40" width="${34 + rnd(34)}">${art[(i * 2 + k) % 4]}</svg>`;
      f.style.cssText = `top:${10 + rnd(75)}%;${k ? 'right' : 'left'}:${1 + rnd(5)}%`;
      sec.append(f);
      shapes.push({ f, sec, v: (k ? -1 : 1) * (.05 + rnd(.1)) });
    }
  });

  /* ---------- scroll: shape parallax, marquee skew, nav hide ---------- */
  let lastY = scrollY, ticking = false;
  const nav = $('.nav');
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY, dy = y - lastY;
      shapes.forEach(s => { const r = s.sec.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) s.f.style.transform = `translateY(${(r.top - innerHeight / 2) * s.v}px)`; });
      if (mq) mq.parentElement.style.transform = `skewY(${-1.2 + Math.max(-4, Math.min(4, dy * .12))}deg)`;
      if (nav) nav.classList.toggle('hide', y > 400 && dy > 6 && !$('.nav nav.open'));
      lastY = y; ticking = false;
    });
  }, { passive: true });

  /* ---------- robot buddy: eyes follow cursor, talks on click ---------- */
  const bot = $('.bot');
  if (bot) {
    const pus = $$('.pu', bot), lines = ['hi! ♡', 'beep boop', 'hire her!', 'loss: 0.001 ✦', 'try pressing H', 'ship it!'];
    let n = 0, t;
    addEventListener('pointermove', e => {
      const r = bot.getBoundingClientRect(), a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
      pus.forEach(p => p.style.transform = `translate(${Math.cos(a) * 3}px,${Math.sin(a) * 3}px)`);
    }, { passive: true });
    bot.addEventListener('click', () => {
      $('.say', bot).textContent = lines[++n % lines.length];
      bot.classList.add('talk'); clearTimeout(t); t = setTimeout(() => bot.classList.remove('talk'), 1600);
    });
  }

  /* ---------- click bursts on orb + logo ---------- */
  $$('.orb,.logo').forEach(el => el.addEventListener('click', e => {
    spark(e.clientX, e.clientY, 22, true);
    if (el.matches('.orb')) el.animate([{ filter: 'hue-rotate(0)' }, { filter: 'hue-rotate(60deg)' }, { filter: 'hue-rotate(0)' }], { duration: 700 });
  }));

  /* ---------- text scramble on headings ---------- */
  const G = '01<>/_*+#';
  $$('.project-info h3,.stack-list h3,.timeline h3').forEach(h => {
    const o = h.textContent; let t;
    h.addEventListener('pointerenter', () => {
      let f = 0; clearInterval(t);
      t = setInterval(() => {
        h.textContent = [...o].map((c, i) => c === ' ' || i < f / 2 ? c : G[rnd(G.length) | 0]).join('');
        if (++f > o.length * 2) { h.textContent = o; clearInterval(t); }
      }, 28);
    });
  });

  /* ---------- scroll-scrubbed section transitions (no jumps: everything is tied to scroll position) ---------- */
  const secs = $$('main > section');
  const blobs = $('.blobs');
  if (!still && secs.length) {
    const cl = v => Math.max(0, Math.min(1, v));
    const ss = t => t * t * (3 - 2 * t);
    const lr = (a, b, t) => a + (b - a) * t;
    const pageTop = el => { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; };
    const measure = () => secs.forEach(s => { s._t = pageTop(s); s._h = s.offsetHeight; });
    measure();
    addEventListener('load', measure);
    addEventListener('resize', measure);
    new ResizeObserver(measure).observe(document.body);

    function frame() {
      const vh = innerHeight, max = document.documentElement.scrollHeight - vh;
      secs.forEach((s, i) => {
        const top = s._t - scrollY, bot = top + s._h;
        const e = i ? ss(cl((vh - top) / (vh * .85))) : 1;                       // entering: 0 → 1
        const x = i < secs.length - 1 ? ss(cl(1 - bot / (vh * .85))) : 0;        // leaving: 0 → 1
        if (e === 1 && x === 0) { s.style.transform = s.style.opacity = s.style.borderRadius = ''; return; }
        const sc = lr(.84, 1, e) * lr(1, .9, x);
        const y = (1 - e) * vh * .14 + x * vh * .05;
        const rx = (1 - e) * 9 - x * 6;
        s.style.transform = `perspective(1600px) translate3d(0,${y}px,0) rotateX(${rx}deg) scale(${sc})`;
        s.style.opacity = lr(.08, 1, e) * lr(1, .12, x);
        s.style.borderRadius = `${(1 - e) * 80 + x * 80}px`;
      });
      // background drifts and changes hue smoothly with scroll
      if (blobs && max > 0) {
        const p = scrollY / max;
        blobs.style.transform = `translateY(${-p * 25}vh) scale(${1 + p * .25})`;
        blobs.style.filter = `hue-rotate(${p * 150}deg)`;
      }
    }
    let queued = false;
    const tick = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; frame(); }); };
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
    frame();
  }

  /* ---------- 3D planet: rotating network sphere on canvas ---------- */
  const orb = $('.orb');
  if (orb) {
    const cv = document.createElement('canvas'); cv.className = 'planet'; orb.prepend(cv);
    const g = cv.getContext('2d'), N = 150, pts = [], ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) { const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), t = ga * i; pts.push([Math.cos(t) * r, y, Math.sin(t) * r]); }
    const links = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) { const a = pts[i], b = pts[j]; if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < .42) links.push([i, j]); }
    const pulses = Array.from({ length: 10 }, () => ({ l: rnd(links.length) | 0, t: rnd(1), s: .008 + rnd(.01) }));
    let S = 0, ry = 0, rx = .3; const proj = [];
    const fit = () => { const d = devicePixelRatio || 1; S = orb.clientWidth; cv.width = cv.height = S * d; g.setTransform(d, 0, 0, d, 0, 0); };
    fit(); addEventListener('resize', fit);
    const draw = () => {
      if (scrollY < innerHeight * 1.3 && S) {
        const rc = orb.getBoundingClientRect(), ox = (mx - rc.left - rc.width / 2) / innerWidth, oy = (my - rc.top - rc.height / 2) / innerHeight;
        ry += .004 + ox * .012; rx += (.3 + oy * .8 - rx) * .05;
        g.clearRect(0, 0, S, S);
        const c = S / 2, R = S * .34, gr = g.createRadialGradient(c, c, R * .2, c, c, R * 1.4);
        gr.addColorStop(0, 'rgba(180,138,176,.25)'); gr.addColorStop(1, 'rgba(180,138,176,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(c, c, R * 1.4, 0, 6.283); g.fill();
        const cy = Math.cos(ry), sy = Math.sin(ry), cxr = Math.cos(rx), sxr = Math.sin(rx);
        for (let i = 0; i < N; i++) {
          const p = pts[i], x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy, y2 = p[1] * cxr - z1 * sxr, z2 = p[1] * sxr + z1 * cxr, f = 1 / (1 - z2 * .3);
          proj[i] = [c + x1 * R * f, c + y2 * R * f, z2];
        }
        g.lineWidth = 1;
        for (const [i, j] of links) {
          const a = proj[i], b = proj[j];
          g.strokeStyle = `rgba(214,166,205,${.05 + .33 * ((a[2] + b[2]) / 2 + 1) / 2})`;
          g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
        }
        for (const p of proj) { const t = (p[2] + 1) / 2; g.fillStyle = `rgba(240,200,235,${.25 + .75 * t})`; g.beginPath(); g.arc(p[0], p[1], 1 + 2.2 * t, 0, 6.283); g.fill(); }
        g.fillStyle = '#fff';
        for (const q of pulses) {
          q.t += q.s; if (q.t > 1) { q.t = 0; q.l = rnd(links.length) | 0; }
          const a = proj[links[q.l][0]], b = proj[links[q.l][1]];
          g.globalAlpha = .35 + .65 * (a[2] + 1) / 2;
          g.beginPath(); g.arc(a[0] + (b[0] - a[0]) * q.t, a[1] + (b[1] - a[1]) * q.t, 2.4, 0, 6.283); g.fill();
        }
        g.globalAlpha = 1;
      }
      if (!still) requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- project filters (FLIP animated) + detail popups ---------- */
  const EASE = 'cubic-bezier(.77,0,.18,1)';
  const D = [
    { cat: 'ml data', desc: 'A machine-learning project that predicts house prices from property features: cleaning and preprocessing the data, training a model and checking how well it predicts.', learn: ['Data preprocessing and feature handling', 'Training and evaluating a prediction model', 'Reading error metrics honestly'] },
    { cat: 'web', desc: 'A Flask web app that turns math practice into a quiz game, with difficulty levels, scoring and progression.', learn: ['Flask routes and templates', 'Tracking score and level state', 'Designing a friendly quiz interface'] },
    { cat: 'data', desc: 'Exploratory analysis across several datasets, hunting for patterns and relationships and turning them into clear charts.', learn: ['Cleaning messy data with Pandas', 'Choosing the right chart', 'Telling a story with numbers'] },
    { cat: 'web', desc: 'A minimal real-time clock built around JavaScript logic and a clean interface.', learn: ['Updating the DOM on a timer', 'Formatting time', 'Keeping CSS small and tidy'] },
    { cat: 'web ml', desc: 'A browser game with full game logic and an optional AI opponent.', learn: ['Game state and win detection', 'Building a simple AI opponent', 'Handling user interaction'] },
    { cat: 'data', desc: 'Dashboards and visual analysis that turn raw information into something people can read at a glance.', learn: ['Data modelling and visuals in Power BI', 'Dashboard layout and hierarchy', 'Preparing data in Excel'] }
  ];
  const cards = $$('.project');
  if (cards.length) {
    cards.forEach((c, i) => c.dataset.cat = (D[i] || { cat: '' }).cat);
    const bar = document.createElement('div'); bar.className = 'filters';
    bar.innerHTML = [['all', 'All'], ['ml', 'ML & AI'], ['data', 'Data'], ['web', 'Web']].map(([k, l], i) =>
      `<button type="button" data-f="${k}" class="${i ? '' : 'on'}">${l}<sup>${k === 'all' ? cards.length : cards.filter(c => c.dataset.cat.split(' ').includes(k)).length}</sup></button>`).join('');
    $('.projects').before(bar);
    const match = (c, f) => f === 'all' || c.dataset.cat.split(' ').includes(f);
    let fbusy = false;
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || fbusy) return;
      fbusy = true; snd.pop();
      $$('button', bar).forEach(x => x.classList.toggle('on', x === b));
      const f = b.dataset.f, vis = cards.filter(c => !c.classList.contains('is-off'));
      const first = new Map(vis.map(c => [c, c.getBoundingClientRect()]));
      const leaving = vis.filter(c => !match(c, f));
      leaving.forEach(c => c.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.9)' }], { duration: 240, fill: 'forwards' }));
      setTimeout(() => {
        leaving.forEach(c => c.getAnimations().forEach(a => a.cancel()));
        cards.forEach(c => c.classList.toggle('is-off', !match(c, f)));
        cards.filter(c => !c.classList.contains('is-off')).forEach((c, i) => {
          const a = first.get(c), r = c.getBoundingClientRect();
          if (a) c.animate([{ transform: `translate(${a.left - r.left}px,${a.top - r.top}px)` }, { transform: 'none' }], { duration: 650, easing: EASE });
          else c.animate([{ opacity: 0, transform: 'translateY(40px) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: i * 70, easing: EASE, fill: 'backwards' });
        });
        setTimeout(() => fbusy = false, 500);
      }, leaving.length ? 250 : 0);
    });

    const modal = document.createElement('div'); modal.className = 'modal';
    modal.innerHTML = '<div class="m-back"></div><div class="m-card" role="dialog" aria-modal="true"><button class="m-x" aria-label="Close">×</button><div class="m-art"></div><div class="m-body"><span class="mono m-kind"></span><h3></h3><p></p><h4 class="mono">WHAT I PRACTISED</h4><ul></ul><div class="tags"></div><a class="button dark" target="_blank" rel="noreferrer">View on GitHub <span>↗</span></a></div></div>';
    document.body.append(modal);
    const open = c => {
      const d = D[cards.indexOf(c)] || { desc: '', learn: [] };
      $('.m-art', modal).replaceChildren($('.project-art', c).cloneNode(true));
      $('.m-kind', modal).textContent = $('.project-info .mono', c).textContent;
      $('h3', modal).textContent = $('h3', c).textContent;
      $('.m-body p', modal).textContent = d.desc;
      $('ul', modal).innerHTML = d.learn.map(x => `<li>${x}</li>`).join('');
      $('.tags', modal).innerHTML = $('.tags', c).innerHTML;
      $('.m-body a', modal).href = c.href;
      modal.classList.add('open'); document.body.classList.add('modal-open'); snd.whoosh();
    };
    const close = () => { modal.classList.remove('open'); document.body.classList.remove('modal-open'); };
    cards.forEach(c => c.addEventListener('click', e => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); open(c); }));
    $('.m-back', modal).onclick = close; $('.m-x', modal).onclick = close;
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- timeline that draws itself ---------- */
  const tl = $('.timeline');
  if (tl) {
    const line = document.createElement('div'); line.className = 'tl-line'; line.innerHTML = '<b></b>'; tl.append(line);
    const items = $$('article', tl); items.forEach(a => a.append(Object.assign(document.createElement('i'), { className: 'tl-dot' })));
    const upd = () => {
      const r = tl.getBoundingClientRect(), p = Math.max(0, Math.min(1, (innerHeight * .65 - r.top) / r.height));
      $('b', line).style.transform = `scaleY(${p})`;
      items.forEach(a => a.classList.toggle('on', a.getBoundingClientRect().top < innerHeight * .65));
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  /* ---------- contact: live clock, copy email, form ---------- */
  const ist = $('#ist');
  if (ist) { const f = () => ist.textContent = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); f(); setInterval(f, 1000); }
  const burstAt = el => { const r = el.getBoundingClientRect(); spark(r.left + r.width / 2, r.top + r.height / 2, 28, true); };
  $('.copy')?.addEventListener('click', async e => {
    const b = e.currentTarget, em = $('em', b);
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch (err) {}
    b.classList.add('done'); em.textContent = 'COPIED ✓'; burstAt(b); snd.done();
    setTimeout(() => { b.classList.remove('done'); em.textContent = 'COPY'; }, 1800);
  });
  const form = $('.cform');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const note = $('.fnote', form), f = new FormData(form);
    if (![...form.elements].filter(x => x.required).every(x => x.value.trim() && x.checkValidity())) {
      note.textContent = 'PLEASE FILL EVERY FIELD (WITH A VALID EMAIL) ✦';
      form.classList.add('shake'); setTimeout(() => form.classList.remove('shake'), 450); return;
    }
    location.href = `mailto:hasan.haadiya@gmail.com?subject=${encodeURIComponent('Portfolio message from ' + f.get('name'))}&body=${encodeURIComponent(f.get('msg') + '\n\n— ' + f.get('name') + ' (' + f.get('email') + ')')}`;
    note.textContent = 'OPENING YOUR MAIL APP… THANK YOU ♡'; burstAt(form); snd.done(); form.reset();
  });

  /* ---------- preloader intro ---------- */
  const ld = $('.loader');
  if (ld) {
    document.body.classList.add('loading');
    const txt = $('#ldText'), name = 'Haadiya Faruqi', num = $('.ld-num'), bar = $('.ld-bar b'), t0 = performance.now();
    let ti = 0; const ty = setInterval(() => { txt.textContent = name.slice(0, ++ti); if (ti >= name.length) clearInterval(ty); }, 80);
    (function step() {
      const k = Math.min(1, (performance.now() - t0) / 1800), p = Math.round(100 * (1 - Math.pow(1 - k, 3)));
      num.textContent = String(p).padStart(3, '0'); bar.style.transform = `scaleX(${p / 100})`;
      k < 1 ? requestAnimationFrame(step) : ld.classList.add('ready');
    })();
    let done = false;
    const enter = withSound => {
      if (done) return; done = true;
      if (withSound) setSound(true);
      snd.whoosh();
      ld.animate([{ transform: 'none', borderRadius: '0 0 0 0' }, { transform: 'translateY(-100%)', borderRadius: '0 0 50% 50% / 0 0 14vh 14vh' }], { duration: 1200, easing: EASE, fill: 'forwards' })
        .onfinish = () => { ld.remove(); document.body.classList.remove('loading'); };
      $('.hero-main')?.animate([{ opacity: 0, transform: 'translateY(60px)' }, { opacity: 1, transform: 'none' }], { duration: 1300, delay: 450, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      $('.orb')?.animate([{ opacity: 0, scale: '.6' }, { opacity: 1, scale: '1' }], { duration: 1500, delay: 500, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    };
    $$('button', ld).forEach(b => b.onclick = () => enter(b.dataset.snd === '1'));
    setTimeout(() => enter(false), 5000);
  }

  /* =========================================================
     TOOLKIT UPGRADE
     ========================================================= */
  const stackSec = $('#stack');
  if (stackSec) {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const onSee = (el, fn) => { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { fn(); io.disconnect(); } }, { threshold: .25 }); io.observe(el); };
    const PN = cards.map(c => $('h3', c).textContent);
    const jump = p => {
      const c = cards[p]; if (!c) return;
      if (c.classList.contains('is-off')) $('.filters button[data-f="all"]')?.click();
      setTimeout(() => { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.classList.add('hl'); setTimeout(() => c.classList.remove('hl'), 2400); }, 120);
    };

    /* ---- 1. click-to-expand rows (edit the notes!) [tool, how I use it, project index or -1] ---- */
    const ROWS = [
      [['Python', 'House price model, EDA notebooks', 0], ['SQL', 'Querying and analysing data', -1], ['Java', 'Programming fundamentals', -1], ['HTML & CSS', 'This portfolio, MathMaster, Digital Clock', 3], ['JavaScript', 'Tic-Tac-Toe, Digital Clock, this site', 4]],
      [['Machine Learning', 'House Price Prediction', 0], ['Data Analysis & EDA', 'EDA Collection', 2], ['Visualisation', 'Power BI dashboards, Matplotlib, Seaborn', 5]],
      [['Flask', 'MathMaster quiz app', 1], ['Responsive UI', 'Every page on this site', -1], ['Git & GitHub', 'Version control for all projects', -1], ['APIs', 'Connecting apps to data', -1]],
      [['Canva', 'Posters, decks and social media', -1], ['UI thinking', 'Layout, hierarchy and motion', -1], ['Presentations', 'Campus projects and events', -1], ['Public speaking', 'Explaining ideas clearly', -1]]
    ];
    const rows = $$('.stack-list article');
    rows.forEach((a, i) => {
      if (!ROWS[i]) return;
      const m = document.createElement('div'); m.className = 'sl-more';
      m.innerHTML = '<ul>' + ROWS[i].map(([t, n, p]) => `<li${p >= 0 ? ` class="lk" data-p="${p}"` : ''}><b>${t}</b><span>${n}</span>${p >= 0 ? '<em>↗</em>' : ''}</li>`).join('') + '</ul>';
      $('div', a).append(m); $('.arrow', a).textContent = '+';
      a.addEventListener('click', e => {
        const li = e.target.closest('li[data-p]'); if (li) { jump(+li.dataset.p); return; }
        const was = a.classList.contains('open'); rows.forEach(x => x.classList.remove('open'));
        if (!was) a.classList.add('open'); snd.pop();
      });
    });

    /* ---- inject new blocks ---- */
    const TOOLS = [
      ['Python', 'Py', '#4b8bbe', 'python', 'LANGUAGE', [0, 2]], ['SQL', 'SQL', '#e6a15c', '', 'LANGUAGE', []], ['Java', 'Jv', '#e76f51', 'java', 'LANGUAGE', []],
      ['HTML', 'H5', '#e8643c', 'html5', 'LANGUAGE', [1, 3, 4]], ['CSS', '{ }', '#4a8fe7', 'css3', 'LANGUAGE', [1, 3]], ['JavaScript', 'JS', '#f0d848', 'javascript', 'LANGUAGE', [3, 4]],
      ['Machine Learning', 'ML', '#d79bc3', '', 'AI / DATA', [0, 4]], ['Pandas', 'Pd', '#8a7fe0', 'pandas', 'AI / DATA', [2], 1], ['Matplotlib', 'Mp', '#6fb3e0', 'matplotlib', 'AI / DATA', [2]],
      ['Seaborn', 'Sb', '#5fc4b8', '', 'AI / DATA', [2]], ['Power BI', 'BI', '#f2c811', 'powerbi', 'AI / DATA', [5]], ['Excel', 'Xl', '#4caf7a', '', 'AI / DATA', [5]],
      ['Flask', 'Fl', '#e8e8e8', 'flask', 'DEV', [1], 1], ['Git', 'Gt', '#f0643c', 'git', 'DEV', []], ['GitHub', 'GH', '#f0f0f0', 'github', 'DEV', [], 1], ['Canva', 'Cv', '#35c4c9', 'canva', 'CREATIVE', []]
    ].map(([n, m, c, s, g, p, inv]) => ({ n, m, c, s, g, p, inv }));
    const mkLogo = t => {
      const lg = document.createElement('span'); lg.className = 'lg'; lg.innerHTML = `<span>${t.m}</span>`;
      if (t.s) { const im = new Image(); im.alt = ''; im.draggable = false; if (t.inv) im.style.filter = 'invert(1)'; im.onload = () => lg.classList.add('has-img'); im.src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${t.s}/${t.s}-original.svg`; lg.append(im); }
      return lg;
    };
    const wrap = document.createElement('div'); wrap.className = 'tk';
    wrap.innerHTML = `
      <div class="tk-row">
        <div class="tk-card radar"><div class="tk-cap mono">SKILL RADAR · SELF-ASSESSED</div><svg class="rd" viewBox="-30 -10 360 320"></svg><ul class="rd-leg"></ul></div>
        <div class="tk-card term"><div class="term-bar"><i></i><i></i><i></i><span class="mono">haadiya@portfolio ~ zsh</span></div><div class="term-out"></div><label class="term-in"><span>$</span><input spellcheck="false" autocomplete="off" placeholder="type a command… try help"></label></div>
      </div>
      <div class="tk-head"><div><p class="eyebrow">WHAT I WORK WITH</p><h3>My <em>toolbox.</em></h3></div></div>
      <div class="tiles"></div>
      <div class="tk-head"><div><p class="eyebrow">PLAY WITH THEM</p><h3>Grab one. <em>Throw it.</em></h3></div><button class="shake mono" type="button">SHAKE IT ✦</button></div>
      <div class="pit"></div>`;
    $('.section-grid', stackSec).after(wrap);

    /* ---- 2. radar chart (levels 1-5: Exploring · Learning · Comfortable · Confident · Expert) ---- */
    const AX = [['Python', 4], ['SQL', 3], ['ML', 3], ['Web', 3], ['Data Viz', 4], ['Design', 3]], LV = ['', 'Exploring', 'Learning', 'Comfortable', 'Confident', 'Expert'];
    const pt = (i, r) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [150 + Math.cos(a) * r, 150 + Math.sin(a) * r]; };
    const poly = r => AX.map((_, i) => pt(i, r).map(v => v.toFixed(1)).join(',')).join(' ');
    const rd = $('.rd', wrap);
    rd.innerHTML = [1, 2, 3, 4, 5].map(k => `<polygon class="ring" points="${poly(k * 20)}"/>`).join('') +
      AX.map((_, i) => { const [x, y] = pt(i, 100); return `<line class="ax" x1="150" y1="150" x2="${x}" y2="${y}"/>`; }).join('') +
      AX.map((a, i) => { const [x, y] = pt(i, 122), an = Math.abs(x - 150) < 8 ? 'middle' : x > 150 ? 'start' : 'end'; return `<text x="${x}" y="${y + 4}" text-anchor="${an}">${a[0].toUpperCase()}</text>`; }).join('') +
      '<line class="sweep" x1="150" y1="150" x2="150" y2="50"/>' +
      `<g class="shape"><polygon class="area" points="${AX.map((a, i) => pt(i, a[1] * 20).join(',')).join(' ')}"/>${AX.map((a, i) => { const [x, y] = pt(i, a[1] * 20); return `<circle class="dot" cx="${x}" cy="${y}" r="4.5"/>`; }).join('')}</g>`;
    const dots = $$('.dot', rd), leg = $('.rd-leg', wrap);
    leg.innerHTML = AX.map(a => `<li style="--v:${a[1] / 5}"><span>${a[0]}</span><em>${LV[a[1]].toUpperCase()}</em><i></i></li>`).join('');
    $$('li', leg).forEach((li, i) => { li.onmouseenter = () => dots[i].classList.add('h'); li.onmouseleave = () => dots[i].classList.remove('h'); });
    onSee($('.radar', wrap), () => $('.radar', wrap).classList.add('in'));

    /* ---- 3. terminal ---- */
    const out = $('.term-out', wrap), tin = $('.term-in input', wrap);
    const say = (t, cls = '') => { const d = document.createElement('div'); d.className = cls; d.textContent = t; out.append(d); out.scrollTop = out.scrollHeight; return d; };
    const typeLine = async (t, cls, speed = 22) => { const d = say('', cls); for (const ch of t) { d.textContent += ch; await sleep(speed); } };
    const CMD = {
      help: () => 'commands: help · whoami · skills · projects · contact · clear · sudo hire haadiya',
      whoami: () => 'haadiya faruqi — AI & ML student at AAFT, Noida. builds things, then makes them prettier.',
      skills: () => TOOLS.map(t => t.n).join(' · '),
      projects: () => PN.map((n, i) => `${i + 1}. ${n}`).join('\n'),
      contact: () => 'email   hasan.haadiya@gmail.com\ngithub  github.com/haadiya-hasan',
      ls: () => 'about/  stack/  work/  journey/  contact/  Resume.pdf',
      clear: () => { out.textContent = ''; return ''; },
      'sudo hire haadiya': () => 'permission granted ♡  ➜  generating offer letter… 100%\nnow send that email!'
    };
    tin.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key.length === 1) snd.tone(1100 + rnd(500), .03, .012);
      if (e.key !== 'Enter') return;
      const v = tin.value.trim().toLowerCase(); tin.value = ''; if (!v) return;
      say('$ ' + v, 'c');
      const r = CMD[v] ? CMD[v]() : `command not found: ${v}  (try "help")`;
      if (r) say(r, CMD[v] ? 'dim' : 'p');
      if (v.startsWith('sudo')) { burstAt(out); snd.done(); }
    });
    onSee($('.term', wrap), async () => {
      for (const [l, c] of [['$ python3 portfolio.py', 'c'], ['>>> import pandas as pd', 'p'], ['>>> stack = ["Python", "SQL", "ML", "Flask", "Power BI"]', 'p'], ['>>> [t + " ✓" for t in stack]', 'p']]) { await typeLine(l, c); await sleep(260); }
      say("['Python ✓', 'SQL ✓', 'ML ✓', 'Flask ✓', 'Power BI ✓']", 'ok'); await sleep(500);
      say('type "help" below to explore ↓', 'dim');
    });

    /* ---- 4. logo tiles ---- */
    const grid = $('.tiles', wrap);
    TOOLS.forEach(t => {
      const el = document.createElement('div'); el.className = 'tile'; el.style.setProperty('--c', t.c);
      el.append(mkLogo(t)); el.title = t.n; el.setAttribute('aria-label', t.n);
      if (fine) {
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          el.style.setProperty('--gx', x * 100 + '%'); el.style.setProperty('--gy', y * 100 + '%');
          el.style.transform = `perspective(600px) rotateX(${(.5 - y) * 16}deg) rotateY(${(x - .5) * 16}deg) translateY(-4px)`;
        });
        el.addEventListener('pointerleave', () => el.style.transform = '');
      }
      el.addEventListener('click', e => { spark(e.clientX, e.clientY, 8, true); if (t.p.length) jump(t.p[0]); });
      grid.append(el);
    });

    /* ---- 5. draggable tags with physics ---- */
    const pit = $('.pit', wrap), bodies = [];
    let W = 0, H = 0, running = false;
    TOOLS.forEach(t => {
      const el = document.createElement('div'); el.className = 'ptag'; el.title = t.n; el.append(mkLogo(t)); el.style.setProperty('--c', t.c);
      pit.append(el); bodies.push({ el, x: 0, y: -200, vx: 0, vy: 0, w: 0, h: 0, drag: false, lm: 0 });
    });
    const measure = () => { W = pit.clientWidth; H = pit.clientHeight; bodies.forEach(b => { b.w = b.el.offsetWidth; b.h = b.el.offsetHeight; }); };
    const scatter = () => bodies.forEach(b => { b.x = rnd(Math.max(1, W - b.w)); b.y = -rnd(500) - b.h; b.vx = rnd(8) - 4; b.vy = 0; });
    const shake = () => bodies.forEach(b => { b.vy = -(10 + rnd(18)); b.vx = rnd(18) - 9; });
    addEventListener('resize', measure);
    $('.shake', wrap).onclick = () => { shake(); snd.whoosh(); };
    const clampV = v => Math.max(-38, Math.min(38, v));
    function stepPhysics() {
      for (const b of bodies) {
        if (b.drag) continue;
        b.vy += .6; b.x += b.vx; b.y += b.vy; b.vx *= .995;
        if (b.x < 0) { b.x = 0; b.vx *= -.5; } else if (b.x > W - b.w) { b.x = W - b.w; b.vx *= -.5; }
        if (b.y > H - b.h) { if (b.vy > 7) snd.tone(160 + b.w, .1, .03, 'triangle'); b.y = H - b.h; b.vy *= -.4; b.vx *= .9; if (Math.abs(b.vy) < 1.2) b.vy = 0; }
      }
      for (let i = 0; i < bodies.length; i++) for (let k = i + 1; k < bodies.length; k++) {
        const a = bodies[i], c = bodies[k];
        const dx = a.x + a.w / 2 - (c.x + c.w / 2), dy = a.y + a.h / 2 - (c.y + c.h / 2);
        const px = (a.w + c.w) / 2 - Math.abs(dx), py = (a.h + c.h) / 2 - Math.abs(dy);
        if (px <= 0 || py <= 0) continue;
        if (px < py) {
          const s = dx < 0 ? -1 : 1;
          if (!a.drag) a.x += s * px / (c.drag ? 1 : 2); if (!c.drag) c.x -= s * px / (a.drag ? 1 : 2);
          const t = a.vx; if (!a.drag) a.vx = c.vx * .6; if (!c.drag) c.vx = t * .6;
        } else {
          const s = dy < 0 ? -1 : 1;
          if (!a.drag) a.y += s * py / (c.drag ? 1 : 2); if (!c.drag) c.y -= s * py / (a.drag ? 1 : 2);
          const t = a.vy; if (!a.drag) a.vy = c.vy * .3; if (!c.drag) c.vy = t * .3;
        }
      }
      for (const b of bodies) b.el.style.transform = `translate(${b.x}px,${b.y}px)`;
    }
    (function loop() { if (running) stepPhysics(); requestAnimationFrame(loop); })();
    new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !running) { measure(); if (!bodies.some(b => b.y > -150)) scatter(); } running = v; }, { threshold: .15 }).observe(pit);
    bodies.forEach(b => {
      let ox = 0, oy = 0;
      b.el.addEventListener('pointerdown', e => {
        e.preventDefault(); b.el.setPointerCapture(e.pointerId); b.drag = true; b.el.classList.add('drag');
        const r = pit.getBoundingClientRect(); ox = e.clientX - r.left - b.x; oy = e.clientY - r.top - b.y; b.vx = b.vy = 0; snd.tick();
      });
      b.el.addEventListener('pointermove', e => {
        if (!b.drag) return;
        const r = pit.getBoundingClientRect(), nx = Math.max(0, Math.min(W - b.w, e.clientX - r.left - ox)), ny = Math.max(0, Math.min(H - b.h, e.clientY - r.top - oy));
        b.vx = clampV(nx - b.x); b.vy = clampV(ny - b.y); b.x = nx; b.y = ny; b.lm = performance.now();
      });
      const up = () => { if (!b.drag) return; b.drag = false; b.el.classList.remove('drag'); if (performance.now() - b.lm > 90) b.vx = b.vy = 0; };
      b.el.addEventListener('pointerup', up); b.el.addEventListener('pointercancel', up);
    });
  }
})();
