/* Empire Barber Expo 2027 · The Fusion
   Vanilla JS. Transform/opacity only in animation paths. */

(() => {
  'use strict';

  // Asset root resolved from this script's URL, so pages in subfolders still find the files
  const ASSETS = new URL('../', document.currentScript.src).href;

  /* ---------- Config: swap links here ---------- */
  const LINKS = {
    // Replace with the 2027 Showpass event URL when it is live.
    tickets: 'https://www.showpass.com/the-empire-barber-expo-2026/',
    compete: 'https://www.showpass.com/the-empire-barber-expo-2026/',
    education: 'https://www.showpass.com/the-empire-barber-expo-2026/',
    hotel: 'https://www.marriott.com/event-reservations/reservation-link.mi?id=1765828965307&key=GRP&app=resvlink',
    map: 'https://www.google.com/maps/search/?api=1&query=Big+Four+Roadhouse+Calgary',
  };

  // Doors open 9:00 AM Mountain Daylight Time, Sunday May 2, 2027
  const EVENT_START = new Date('2027-05-02T09:00:00-06:00').getTime();

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobileQuery = matchMedia('(max-width: 899px)');

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  // Frame-rate independent smoothing: same feel at 60Hz and 120Hz
  const damp = (current, target, smoothing, dt) =>
    current + (target - current) * (1 - Math.pow(1 - smoothing, dt / 16.667));

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- Links ---------- */
  $$('[data-link]').forEach((a) => {
    const href = LINKS[a.dataset.link];
    if (!href) return;
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Intro ---------- */
  const markLoaded = () => requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded')));
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 900))]).then(markLoaded);

  const heroVideo = $('.hero-video');
  const root = document.documentElement;
  const motionPaused = () => root.classList.contains('is-motion-paused');

  /* ---------- Pause control for looping motion (WCAG 2.2.2) ---------- */
  (() => {
    const btn = $('[data-motion-toggle]');
    const setPaused = (paused) => {
      root.classList.toggle('is-motion-paused', paused);
      if (btn) {
        btn.setAttribute('aria-pressed', String(paused));
        btn.setAttribute('aria-label', paused ? 'Play background video and animations' : 'Pause background video and animations');
      }
      if (heroVideo) paused ? heroVideo.pause() : heroVideo.play().catch(() => {});
      $$('video[data-inview]').forEach((v) => { if (paused) v.pause(); });
    };
    if (btn) btn.addEventListener('click', () => setPaused(!motionPaused()));
    if (reduceMotion) setPaused(true);
  })();

  /* ---------- Countdown ---------- */
  function initCountdown() {
    const root = $('[data-countdown]');
    const daysLeft = $('[data-days-left]');
    if (!root) return;

    const slots = {
      d: $('[data-unit="d"]', root),
      h: $('[data-unit="h"]', root),
      m: $('[data-unit="m"]', root),
      s: $('[data-unit="s"]', root),
    };

    const build = (slot, str) => {
      slot.textContent = '';
      for (const ch of str) {
        const cell = document.createElement('span');
        cell.className = 'digit';
        const s = document.createElement('span');
        s.textContent = ch;
        cell.append(s);
        slot.append(cell);
      }
      slot.dataset.v = str;
    };

    const roll = (slot, str) => {
      const prev = slot.dataset.v || '';
      if (prev === str) return;
      if (prev.length !== str.length || document.hidden) return build(slot, str);

      [...str].forEach((ch, i) => {
        if (prev[i] === ch) return;
        const cell = slot.children[i];
        const old = cell.lastElementChild;
        const next = document.createElement('span');
        next.textContent = ch;
        cell.append(next);

        if (reduceMotion) { old.remove(); return; }

        const opts = { duration: 520, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' };
        old.animate(
          [{ transform: 'translateY(0)', opacity: 1, filter: 'blur(0px)' },
           { transform: 'translateY(-70%)', opacity: 0, filter: 'blur(3px)' }],
          { ...opts, fill: 'forwards' }
        ).finished.then(() => old.remove(), () => old.remove());
        next.animate(
          [{ transform: 'translateY(70%)', opacity: 0, filter: 'blur(3px)' },
           { transform: 'translateY(0)', opacity: 1, filter: 'blur(0px)' }],
          opts
        );
      });
      slot.dataset.v = str;
    };

    const pad = (n) => String(n).padStart(2, '0');

    const tick = () => {
      const diff = Math.max(0, EVENT_START - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);

      roll(slots.d, pad(d));
      roll(slots.h, pad(h));
      roll(slots.m, pad(m));
      roll(slots.s, pad(s));
      if (daysLeft) daysLeft.textContent = d.toLocaleString();

      // Re-align to the next whole second so digits flip together
      setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
    };
    tick();
  }
  initCountdown();

  /* ---------- Shared scroll loop ---------- */
  const scrollTasks = [];
  let scrollQueued = false;
  const runScrollTasks = () => {
    scrollQueued = false;
    for (const task of scrollTasks) task();
  };
  const queueScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(runScrollTasks);
  };
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', queueScroll);

  /* ---------- Nav ---------- */
  (() => {
    const nav = $('[data-nav]');
    if (!nav) return;
    let lastY = scrollY;
    scrollTasks.push(() => {
      const y = scrollY;
      nav.classList.toggle('is-solid', y > 40);
      const delta = y - lastY;
      if (y > innerHeight * 0.6 && delta > 6) nav.classList.add('is-hidden');
      else if (delta < -6 || y < innerHeight * 0.6) nav.classList.remove('is-hidden');
      lastY = y;
    });
  })();

  /* ---------- Hero spotlight ---------- */
  (() => {
    const hero = $('.hero');
    const spot = $('[data-spot]');
    if (!hero || !spot) return;

    let w = hero.clientWidth;
    let h = hero.clientHeight;
    let tx = w * 0.62, ty = h * 0.42;
    let x = tx, y = ty;
    let lastMove = -1e4;
    let running = false;
    let last = performance.now();
    const t0 = last;

    addEventListener('resize', () => { w = hero.clientWidth; h = hero.clientHeight; });

    if (finePointer) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
        lastMove = performance.now();
      });
    }

    const frame = (now) => {
      if (!running) return;
      const dt = Math.min(64, now - last);
      last = now;

      // Drift on its own when nobody is steering it (touch, idle mouse)
      if (now - lastMove > 2400) {
        const t = (now - t0) / 1000;
        tx = w * (0.58 + Math.sin(t * 0.32) * 0.24);
        ty = h * (0.4 + Math.cos(t * 0.47) * 0.12);
      }
      x = damp(x, tx, 0.075, dt);
      y = damp(y, ty, 0.075, dt);
      spot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      requestAnimationFrame(frame);
    };

    spot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (reduceMotion) return;

    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      } else if (!entry.isIntersecting) {
        running = false;
      }
    }).observe(hero);
  })();

  /* ---------- Reveal on view ---------- */
  (() => {
    const els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
  })();

  /* ---------- Story: words light up as you read ---------- */
  (() => {
    const el = $('[data-words]');
    if (!el) return;

    const words = [];
    const wrap = (text, cls) => {
      const frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(' '); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = part;
        words.push(s);
        frag.append(s);
      });
      return frag;
    };

    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        node.replaceWith(wrap(node.textContent.replace(/\s+/g, ' ')));
      } else if (node.nodeType === 1) {
        const text = node.textContent;
        node.textContent = '';
        node.append(wrap(text));
      }
    });

    if (reduceMotion) return;
    const n = words.length;
    let lastLit = -1;

    scrollTasks.push(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      // 0 when the text top hits 85% of the viewport, 1 when its bottom reaches 50%
      const start = innerHeight * 0.85;
      const end = innerHeight * 0.5;
      const p = clamp((start - r.top) / (start - end + r.height), 0, 1);
      const lit = p * (n + 3);
      if (Math.abs(lit - lastLit) < 0.02) return;
      lastLit = lit;
      for (let i = 0; i < n; i++) {
        const o = 0.16 + 0.84 * clamp((lit - i) / 3, 0, 1);
        words[i].style.opacity = o.toFixed(3);
      }
    });
  })();

  /* ---------- Acts: vertical scroll drives a horizontal track ---------- */
  (() => {
    const section = $('[data-acts]');
    const track = $('[data-track]');
    if (!section || !track) return;
    const bar = $('[data-acts-bar]');
    const count = $('[data-acts-count]');
    const acts = $$('.act', track);
    const medias = acts.map((a) => $('.act-media', a));
    let dist = 0;
    let enabled = false;

    const measure = () => {
      enabled = !reduceMotion && !mobileQuery.matches;
      if (!enabled) {
        section.style.height = '';
        track.style.transform = '';
        medias.forEach((m) => (m.style.transform = ''));
        return;
      }
      dist = Math.max(0, track.scrollWidth - innerWidth);
      section.style.height = `${dist + innerHeight}px`;
    };

    measure();
    addEventListener('resize', measure);
    mobileQuery.addEventListener('change', measure);
    addEventListener('load', measure);

    let lastIdx = -1;
    scrollTasks.push(() => {
      if (!enabled) return;
      const r = section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;

      const idx = Math.min(acts.length - 1, Math.floor(p * acts.length * 0.999));
      if (count && idx !== lastIdx) {
        count.textContent = String(idx + 1).padStart(2, '0');
        lastIdx = idx;
      }

      // Slight counter-drift inside each frame for depth
      // Read every rect first, then write, so the loop never forces layout mid-write
      const vwHalf = innerWidth / 2;
      const rects = acts.map((act) => act.getBoundingClientRect());
      rects.forEach((ar, i) => {
        if (ar.right < -200 || ar.left > innerWidth + 200) return;
        const off = clamp((ar.left + ar.width / 2 - vwHalf) / innerWidth, -1, 1);
        medias[i].style.transform = `translate3d(${(off * -6).toFixed(2)}%, 0, 0)`;
      });
    });
  })();

  /* ---------- Wall: columns drift at different speeds ---------- */
  (() => {
    const wall = $('[data-wall]');
    if (!wall || reduceMotion) return;
    const grid = $('.wall-grid', wall);
    const cols = $$('.wall-col', wall).map((el) => ({ el, speed: parseFloat(el.dataset.speed) || 0 }));

    scrollTasks.push(() => {
      const r = grid.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (innerHeight - r.top) / (innerHeight + r.height); // 0 → 1 across the pass
      const range = r.height;
      cols.forEach(({ el, speed }) => {
        el.style.transform = `translate3d(0, ${((p - 0.5) * speed * range).toFixed(1)}px, 0)`;
      });
    });
  })();

  /* ---------- Recap: slow push-in + cursor chip ---------- */
  (() => {
    const recap = $('[data-recap]');
    if (!recap) return;
    const img = $('.recap-media img', recap);
    const chip = $('[data-recap-chip]', recap);

    if (!reduceMotion && img) {
      scrollTasks.push(() => {
        const r = recap.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
        img.style.transform = `scale(${(1.16 - p * 0.14).toFixed(4)})`;
      });
    }

    if (!finePointer || !chip) return;

    let w = recap.clientWidth, h = recap.clientHeight;
    const rest = () => ({ x: w * 0.68, y: h * 0.48 });
    let { x, y } = rest();
    let tx = x, ty = y;
    let running = false;
    let last = performance.now();
    let hovering = false;

    const place = () => {
      const cw = chip.offsetWidth, ch = chip.offsetHeight;
      chip.style.transform = `translate3d(${(x - cw / 2).toFixed(1)}px, ${(y - ch / 2).toFixed(1)}px, 0)`;
    };
    place();

    const frame = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      x = damp(x, tx, 0.16, dt);
      y = damp(y, ty, 0.16, dt);
      place();
      if (hovering || Math.abs(x - tx) > 0.3 || Math.abs(y - ty) > 0.3) requestAnimationFrame(frame);
      else running = false;
    };
    const kick = () => {
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    };

    recap.addEventListener('pointerenter', () => { hovering = true; recap.classList.add('is-hover'); kick(); });
    recap.addEventListener('pointermove', (e) => {
      const r = recap.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      kick();
    });
    recap.addEventListener('pointerleave', () => {
      hovering = false;
      recap.classList.remove('is-hover');
      ({ x: tx, y: ty } = rest());
      kick();
    });
    addEventListener('resize', () => {
      w = recap.clientWidth; h = recap.clientHeight;
      if (!hovering) { ({ x, y } = rest()); tx = x; ty = y; place(); }
    });
  })();

  /* ---------- Video dialog ---------- */
  (() => {
    const dlg = $('[data-player]');
    if (!dlg) return;
    const video = $('video', dlg);

    const open = () => {
      if (!video.src) video.src = video.dataset.src;
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    const close = () => (dlg.close ? dlg.close() : dlg.removeAttribute('open'));

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-play], [data-recap]')) {
        e.preventDefault();
        open();
      }
    });
    $('[data-player-close]', dlg).addEventListener('click', close);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('close', () => video.pause());
  })();

  /* ---------- Clip videos: play only while on screen ---------- */
  (() => {
    const vids = $$('video[data-inview]');
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting) {
          if (!v.src) v.src = v.dataset.src;
          if (!motionPaused()) v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: '120px 0px', threshold: 0.15 });
    vids.forEach((v) => io.observe(v));
  })();

  /* ---------- Lineup: hide separator stars that land at the start of a wrapped line ---------- */
  (() => {
    const list = $('[data-poster-names]');
    if (!list) return;
    const items = $$('li', list);
    let queued = false;

    const layout = () => {
      queued = false;
      const tops = items.map((li) => li.offsetTop);
      items.forEach((li, i) => li.classList.toggle('is-line-start', i > 0 && tops[i] > tops[i - 1] + 2));
    };
    const queue = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(layout);
    };

    layout();
    if (document.fonts) document.fonts.ready.then(queue);
    addEventListener('resize', queue);
  })();

  /* ---------- Lineup: portrait follows the cursor ---------- */
  (() => {
    const poster = $('[data-poster]');
    const float = $('[data-float]');
    const inner = $('[data-float-inner]');
    if (!poster || !float || !finePointer) return;

    const imgs = new Map();
    const names = $$('[data-person]', poster);
    let built = false;
    const build = () => {
      if (built) return;
      built = true;
      names.forEach((a) => {
        const key = a.dataset.person;
        if (imgs.has(key)) return;
        const img = new Image();
        img.src = `${ASSETS}people/${key}.webp`;
        img.alt = '';
        img.decoding = 'async';
        inner.append(img);
        imgs.set(key, img);
      });
    };

    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    let rot = 0, prevX = x;
    let active = false, running = false;
    let last = performance.now();
    const W = () => float.offsetWidth;
    const H = () => float.offsetHeight;

    const frame = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      x = damp(x, tx, 0.14, dt);
      y = damp(y, ty, 0.14, dt);
      const vx = (x - prevX) / Math.max(1, dt / 16.667);
      prevX = x;
      rot = damp(rot, clamp(vx * 0.5, -10, 10), 0.12, dt);
      float.style.transform = `translate3d(${(x + 28).toFixed(1)}px, ${(y - H() / 2).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      if (active || Math.abs(rot) > 0.05) requestAnimationFrame(frame);
      else running = false;
    };

    let current = null;
    const show = (key) => {
      if (current === key) return;
      current = key;
      imgs.forEach((img, k) => img.classList.toggle('is-active', k === key));
    };

    poster.addEventListener('pointerenter', build);
    names.forEach((a) => {
      a.addEventListener('pointerenter', (e) => {
        build();
        if (!active) {
          // Jump to the cursor on first show so it doesn't fly in from afar
          x = tx = e.clientX; y = ty = e.clientY; prevX = x;
        }
        active = true;
        show(a.dataset.person);
        float.classList.add('is-on');
        if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
      });
      a.addEventListener('pointerleave', () => {
        active = false;
        float.classList.remove('is-on');
      });
    });
    addEventListener('pointermove', (e) => {
      if (!active) return;
      tx = e.clientX;
      ty = e.clientY;
      // Flip to the left side near the right edge
      if (tx + W() + 40 > innerWidth) tx -= W() + 56;
    }, { passive: true });
  })();

  /* ---------- Tickets: tilt + light sheen ---------- */
  (() => {
    if (!finePointer || reduceMotion) return;
    $$('[data-tilt]').forEach((card) => {
      const sheen = $('.t-sheen', card);
      let rx = 0, ry = 0, trx = 0, try_ = 0;
      let running = false, last = 0;

      const frame = (now) => {
        const dt = Math.min(64, now - last);
        last = now;
        rx = damp(rx, trx, 0.12, dt);
        ry = damp(ry, try_, 0.12, dt);
        card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        if (Math.abs(rx - trx) > 0.01 || Math.abs(ry - try_) > 0.01) requestAnimationFrame(frame);
        else running = false;
      };
      const kick = () => {
        if (running) return;
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      };

      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        trx = (0.5 - py) * 8;
        try_ = (px - 0.5) * 10;
        sheen.style.setProperty('--sx', `${(px * 100).toFixed(1)}%`);
        sheen.style.setProperty('--sy', `${(py * 100).toFixed(1)}%`);
        card.classList.add('is-tilting');
        kick();
      });
      card.addEventListener('pointerleave', () => {
        trx = 0; try_ = 0;
        card.classList.remove('is-tilting');
        kick();
      });
    });
  })();

  /* ---------- Mobile sticky ticket bar ---------- */
  (() => {
    const bar = $('[data-mobile-cta]');
    const hero = $('.hero');
    if (!bar || !hero) return;
    let pastHero = false;
    const blockers = new Set();
    const update = () => bar.classList.toggle('is-on', pastHero && blockers.size === 0);

    new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      update();
    }).observe(hero);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? blockers.add(e.target) : blockers.delete(e.target)));
      update();
    }, { threshold: 0.25 });
    $$('.ticket-row, .finale').forEach((el) => io.observe(el));
  })();

  queueScroll();
})();
