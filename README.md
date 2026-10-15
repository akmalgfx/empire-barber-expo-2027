# Empire Barber Expo 2027 · The 3Peat

Landing page for Part III of the Empire Barber Expo: Sunday, May 2, 2027 at the Big Four Roadhouse, Calgary.

Plain HTML, CSS and JavaScript with no build step. All photos and video are from the 2026 expo.

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Pages

- `/` — the full landing page
- `/waitlist/` — a minimal coming-soon page with the countdown and an email waitlist

## Connect the waitlist

The waitlist form is not connected to a service yet. Until it is, submitting shows "Sign-ups open soon" and saves nothing. To start collecting emails, create a form endpoint (for example a free form at formspree.io) and paste its URL into `WAITLIST_ENDPOINT` at the top of `assets/js/waitlist.js`.

## Update links

Ticket, competition, vendor, hotel and map links live in `LINKS` at the top of `assets/js/main.js`. The ticket links currently point to the 2026 Showpass event; swap in the 2027 URL when it goes live.
