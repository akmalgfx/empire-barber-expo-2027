# Empire Barber Expo 2027 · Part 3

Landing page for Part III of the Empire Barber Expo: Sunday, May 2, 2027 at the Big Four Roadhouse, Calgary.

Plain HTML, CSS and JavaScript with no build step. All photos and video are from the 2026 expo.

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Pages

- `/` — the 2027 landing page: hero, lineup, schedule, tickets and venue
- `/vendors/`, `/venue/`, `/past-expos/`, `/faq/` — supporting pages, linked from the home footer
- `/expo-2027-preview-lyqui6/` and `/waitlist/` — redirect to `/` so links shared before launch keep working

The pre-launch waitlist page was replaced on November 9, 2026. It is in git history (and `assets/js/waitlist.js` is no longer loaded) if it is ever needed again.

## Vendor booth requests

The form on `/vendors/` posts to the same Apps Script as the waitlist (`VENDOR_ENDPOINT` in `assets/js/vendors.js`), which writes each request to a `Vendors` tab in the Sheet. After changing `apps-script/waitlist.gs`, paste it into the Sheet's Apps Script and redeploy with Deploy > Manage deployments > edit > New version, which keeps the same URL.

## Update links

Ticket, competition, Education Day, hotel and map links live in `LINKS` at the top of `assets/js/main.js`. The ticket links point to the 2027 Showpass event. The subpages (`/vendors/`, `/venue/`, `/past-expos/`, `/faq/`) and `llms.txt` also link to it directly, so update them too if the URL changes.
