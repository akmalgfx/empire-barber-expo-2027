/* Empire Barber Expo 2027 · Waitlist page */

(() => {
  'use strict';

  /* ---------- Config ----------
     Paste a form endpoint here to start collecting sign-ups, e.g. a Formspree
     form URL: 'https://formspree.io/f/abcdwxyz'. Any endpoint that accepts a
     POSTed form and answers 2xx works. While empty, the form says sign-ups
     aren't open yet instead of pretending to save the email. */
  const WAITLIST_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwFtcj9A4fkYdwW3phf9atlU3h77WJBPHnGCW5EkNauZqP4pgt9msn6fnEnaxzat4rO/exec';
  const INSTAGRAM_URL = 'https://www.instagram.com/empirebarberexpo/';

  // Tickets drop Nov 9, 2026 at 12:00 AM Mountain Standard Time
  const EVENT_START = new Date('2026-11-09T00:00:00-07:00').getTime();

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);

  /* ---------- Countdown ---------- */
  (() => {
    const root = $('[data-countdown]');
    if (!root) return;
    const slots = ['d', 'h', 'm', 's'].map((u) => $(`[data-unit="${u}"]`, root));

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

        const opts = { duration: 480, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' };
        old.animate(
          [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-60%)', opacity: 0 }],
          { ...opts, fill: 'forwards' }
        ).finished.then(() => old.remove(), () => old.remove());
        next.animate([{ transform: 'translateY(60%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], opts);
      });
      slot.dataset.v = str;
    };

    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const diff = Math.max(0, EVENT_START - Date.now());
      const parts = [
        Math.floor(diff / 86400000),
        Math.floor((diff / 3600000) % 24),
        Math.floor((diff / 60000) % 60),
        Math.floor((diff / 1000) % 60),
      ];
      parts.forEach((n, i) => roll(slots[i], pad(n)));
      setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
    };
    tick();
  })();

  /* ---------- Part II recap film ----------
     Muted loop while on screen. Bottom-left restarts, bottom-right toggles
     sound, tapping the picture pauses or resumes. */
  (() => {
    const film = $('[data-film]');
    if (!film) return;
    const video = $('video', film);
    const muteBtn = $('[data-film-mute]', film);
    const restartBtn = $('[data-film-restart]', film);
    let onScreen = false;
    let userPaused = reduceMotion; // reduced motion: start on the still frame, play on tap

    const ensureSrc = () => { if (!video.src) video.src = video.dataset.src; };
    const sync = () => film.classList.toggle('is-paused', video.paused);
    const play = () => { ensureSrc(); video.play().catch(sync); };

    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);

    const togglePlay = () => {
      if (video.paused) { userPaused = false; play(); }
      else { userPaused = true; video.pause(); }
    };
    video.addEventListener('click', togglePlay);
    // Keyboard users get the same pause control: focus the video, press Space or Enter
    video.tabIndex = 0;
    video.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'k') { e.preventDefault(); togglePlay(); }
    });

    restartBtn.addEventListener('click', () => {
      ensureSrc();
      video.currentTime = 0;
      userPaused = false;
      play();
    });

    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      const soundOn = !video.muted;
      muteBtn.setAttribute('aria-pressed', String(soundOn));
      muteBtn.setAttribute('aria-label', soundOn ? 'Mute video' : 'Unmute video');
      if (soundOn && video.paused) { userPaused = false; play(); }
    });

    // Only play while visible; never resume something the viewer paused
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !userPaused) play();
      else if (!onScreen && !video.paused) video.pause();
    }, { threshold: 0.25 }).observe(film);

    // Start right away if it's already on screen; don't wait for the observer's first report
    const r = film.getBoundingClientRect();
    if (!userPaused && r.top < innerHeight && r.bottom > 0) play();
    sync();
  })();

  /* ---------- Waitlist form ---------- */
  (() => {
    const wrap = $('[data-signup]');
    if (!wrap) return;
    const form = $('[data-form]', wrap);
    const input = $('#email', form);
    const trap = $('.trap', form);
    const button = $('.submit', form);
    const label = $('.submit-label', button);
    const done = $('[data-done]', wrap);
    const status = $('[data-status]', wrap);

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const say = (html, isError = false) => {
      status.innerHTML = html;
      status.classList.toggle('is-error', isError);
    };
    const setInvalid = (on) => {
      form.classList.toggle('is-invalid', on);
      input.setAttribute('aria-invalid', String(on));
    };
    const finish = () => {
      form.hidden = true;
      done.hidden = false;
      say('');
    };

    input.addEventListener('input', () => {
      if (form.classList.contains('is-invalid') && EMAIL_RE.test(input.value.trim())) {
        setInvalid(false);
        say('');
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (button.getAttribute('aria-busy') === 'true') return;

      const email = input.value.trim();
      if (!EMAIL_RE.test(email)) {
        setInvalid(true);
        say('Enter a full email address, like you@yourshop.com.', true);
        input.focus();
        return;
      }
      setInvalid(false);

      // A bot filled the hidden field: act normal, send nothing
      if (trap.value) { finish(); return; }

      if (!WAITLIST_ENDPOINT) {
        say(`Sign-ups open soon. Until then, follow <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener">@empirebarberexpo</a> for the ticket drop.`);
        return;
      }

      button.setAttribute('aria-busy', 'true');
      label.textContent = 'Joining…';
      say('');

      try {
        // Google Apps Script web apps don't send CORS headers, so the reply
        // is opaque: a request that goes through counts as a sign-up.
        const google = /script\.google(usercontent)?\.com/.test(WAITLIST_ENDPOINT);
        const res = await fetch(WAITLIST_ENDPOINT, google
          ? { method: 'POST', mode: 'no-cors', body: new URLSearchParams({ email }) }
          : { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        if (!google && !res.ok) throw new Error(String(res.status));
        finish();
      } catch {
        say('That didn’t go through. Check your connection and try again.', true);
      } finally {
        button.removeAttribute('aria-busy');
        label.textContent = 'Join the Waitlist';
      }
    });
  })();
})();
