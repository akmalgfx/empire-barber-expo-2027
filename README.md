# Empire Barber Expo 2027 · Part 3

Landing page for Part III of the Empire Barber Expo: Sunday, May 2, 2027 at the Big Four Roadhouse, Calgary.

Plain HTML, CSS and JavaScript with no build step. All photos and video are from the 2026 expo.

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Pages

- `/` — the coming-soon waitlist page with the countdown and Part II recap
- `/expo-2027-preview-lyqui6/` — the full landing page, kept off the root until launch (marked `noindex`, but anyone with the link or the repo can still open it)
- `/vendors/` — vendor info: floor plan, what's included in every booth, and the booth request form (linked from the waitlist header)
- `/waitlist/` — redirects to `/` so links shared earlier keep working

## Launch the full page

Swap the two pages back: move `expo-2027-preview-lyqui6/index.html` to `index.html` (change its `../assets/` and `../vendors/` paths to `assets/` and `vendors/`, and remove the `noindex` meta), and move the waitlist to a subfolder or remove it.

## Connect the waitlist

The waitlist form is not connected to a service yet. Until it is, submitting shows "Sign-ups open soon" and saves nothing. To start collecting emails, create a form endpoint (for example a free form at formspree.io) and paste its URL into `WAITLIST_ENDPOINT` at the top of `assets/js/waitlist.js`.

## Vendor booth requests

The form on `/vendors/` posts to the same Apps Script as the waitlist (`VENDOR_ENDPOINT` in `assets/js/vendors.js`), which writes each request to a `Vendors` tab in the Sheet. After changing `apps-script/waitlist.gs`, paste it into the Sheet's Apps Script and redeploy with Deploy > Manage deployments > edit > New version, which keeps the same URL.

## Update links

Ticket, competition, Education Day, hotel and map links live in `LINKS` at the top of `assets/js/main.js`. The ticket links (including Education Day) currently point to the 2026 Showpass event; swap in the 2027 URL when it goes live.
