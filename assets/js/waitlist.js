/* Empire Barber Expo 2027 · Waitlist page */

(() => {
  'use strict';

  /* ---------- Config ----------
     Paste a form endpoint here to start collecting sign-ups, e.g. a Formspree
     form URL: 'https://formspree.io/f/abcdwxyz'. Any endpoint that accepts a
     POSTed form and answers 2xx works. While empty, the form says sign-ups
     aren't open yet instead of pretending to save the email. */
  const WAITLIST_ENDPOINT = '';
  const INSTAGRAM_URL = 'https://www.instagram.com/empirebarbersupply/';

  // Doors open 9:00 AM Mountain Daylight Time, Sunday May 2, 2027
  const EVENT_START = new Date('2027-05-02T09:00:00-06:00').getTime();

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
     Muted highlight loop while it's on screen; tap plays the full recap
     with sound in the same frame. Ending returns it to the loop. */
  (() => {
    const film = $('[data-film]');
    if (!film) return;
    const video = $('video', film);
    const play = $('[data-film-play]', film);
    let full = false;
    let onScreen = false;

    const startPreview = () => {
      full = false;
      film.classList.remove('is-playing');
      video.controls = false;
      video.muted = true;
      video.loop = true;
      if (reduceMotion) { video.removeAttribute('src'); video.load(); return; } // poster only
      if (!video.src.endsWith(video.dataset.preview)) video.src = video.dataset.preview;
      if (onScreen) video.play().catch(() => {});
    };

    play.addEventListener('click', () => {
      full = true;
      film.classList.add('is-playing');
      video.src = video.dataset.full; // the 21 MB file loads only now
      video.loop = false;
      video.muted = false;
      video.controls = true;
      video.play().catch(() => {});
      video.focus({ preventScroll: true });
    });
    video.addEventListener('ended', () => { if (full) startPreview(); });

    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (full) { if (!onScreen) video.pause(); return; }
      if (reduceMotion) return;
      if (onScreen) {
        if (!video.src) video.src = video.dataset.preview;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, { threshold: 0.25 }).observe(film);

    startPreview();
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
        say(`Sign-ups open soon. Until then, follow <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener">@empirebarbersupply</a> for the ticket drop.`);
        return;
      }

      button.setAttribute('aria-busy', 'true');
      label.textContent = 'Joining…';
      say('');

      try {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error(String(res.status));
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
