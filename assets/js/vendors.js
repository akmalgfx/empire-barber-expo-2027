/* Empire Barber Expo 2027 · Vendors page */

(() => {
  'use strict';

  /* ---------- Config ----------
     Same Apps Script web app as the waitlist (assets/js/waitlist.js). It sees
     type=vendor and writes the request to the Sheet's "Vendors" tab. */
  const VENDOR_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwFtcj9A4fkYdwW3phf9atlU3h77WJBPHnGCW5EkNauZqP4pgt9msn6fnEnaxzat4rO/exec';

  const $ = (sel, root = document) => root.querySelector(sel);

  /* ---------- Booth request form ---------- */
  (() => {
    const wrap = $('[data-vendor]');
    if (!wrap) return;
    const form = $('[data-vform]', wrap);
    const trap = $('.trap', form);
    const button = $('.vform-send', form);
    const label = $('.submit-label', button);
    const done = $('[data-vdone]', wrap);
    const status = $('[data-vstatus]', wrap);

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const checks = [
      ['name', (v) => v.length > 0, 'Enter your name.'],
      ['company', (v) => v.length > 0, 'Enter your company name.'],
      ['email', (v) => EMAIL_RE.test(v), 'Enter a full email address, like you@yourbrand.com.'],
    ];

    const say = (text, isError = false) => {
      status.textContent = text;
      status.classList.toggle('is-error', isError);
    };

    // Clear a field's error as soon as it's fixed
    form.addEventListener('input', (e) => {
      const check = checks.find(([name]) => name === e.target.name);
      if (check && e.target.getAttribute('aria-invalid') === 'true' && check[1](e.target.value.trim())) {
        e.target.setAttribute('aria-invalid', 'false');
        if (!form.querySelector('[aria-invalid="true"]')) say('');
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (button.getAttribute('aria-busy') === 'true') return;

      let firstBad = null;
      for (const [name, ok, msg] of checks) {
        const input = form.elements[name];
        const bad = !ok(input.value.trim());
        input.setAttribute('aria-invalid', String(bad));
        if (bad && !firstBad) firstBad = { input, msg };
      }
      if (firstBad) {
        say(firstBad.msg, true);
        firstBad.input.focus();
        return;
      }

      const finish = () => {
        form.hidden = true;
        done.hidden = false;
        done.scrollIntoView({ block: 'center', behavior: 'smooth' });
      };

      // A bot filled the hidden field: act normal, send nothing
      if (trap.value) { finish(); return; }

      const data = new URLSearchParams({ type: 'vendor' });
      for (const name of ['name', 'company', 'website', 'email', 'phone', 'products']) {
        data.set(name, form.elements[name].value.trim());
      }

      button.setAttribute('aria-busy', 'true');
      label.textContent = 'Sending…';
      say('');

      try {
        // Google Apps Script web apps don't send CORS headers, so the reply
        // is opaque: a request that goes through counts as sent.
        await fetch(VENDOR_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data });
        finish();
      } catch {
        say('That didn’t go through. Check your connection and try again, or email info@empirebarber.ca.', true);
      } finally {
        button.removeAttribute('aria-busy');
        label.textContent = 'Send';
      }
    });
  })();
})();
