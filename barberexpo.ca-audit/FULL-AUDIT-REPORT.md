# SEO Audit: barberexpo.ca

Requested as `www.barebrexpo.ca`. That hostname does not resolve (DNS NXDOMAIN, "barebr" is a typo). The real site is `barberexpo.ca` (per `CNAME`, canonicals, sitemap). Audit is based on the repo source plus one live content fetch.

**Not verified (sandbox could not resolve DNS for curl):** HTTP status/headers, www to apex redirect, HTTPS redirect, Core Web Vitals, live crawl. Treat the score as provisional.

**Business type:** Event (annual trade expo), single-venue, Calgary AB. Not Local Service, not e-commerce.

## Provisional score: ~74 / 100

| Category | Score | Note |
|---|---|---|
| Technical | 80 | Clean robots, sitemap, canonicals; headers unverified |
| Content | 62 | Only 2 indexable pages |
| On-page | 88 | Strong titles/descriptions/H1, geo terms present |
| Schema | 78 | Good graph, Offer incomplete, FAQ rich result unlikely |
| Performance | 70 (est.) | Not measured; fonts + video are risks |
| AI readiness | 85 | llms.txt, AI bots allowed, plain-language facts |
| Images | 70 | Few images, all alt="" |

## What works
- Titles and meta descriptions are unique, within length, and name "barber expo", "hair expo", Calgary, Canada.
- Canonicals set on every page; `/waitlist/` is `noindex` and canonicals to home; 404 is `noindex`.
- robots.txt open to Google, Bing and all major AI crawlers; sitemap declared.
- JSON-LD graph: Organization, WebSite, ExhibitionEvent (correct 2027-05-02 single date, address, organizer), FAQPage.
- OG/Twitter cards with 1200x630 images and alt text; `en_CA` locale.
- Hero image preloaded with `fetchpriority="high"` and explicit width/height.
- `llms.txt` with accurate date, venue, vendor and contact facts.

## Findings

### High
1. **Hostname typo / www.** `barebrexpo.ca` is dead. If it appears anywhere (ads, print, Instagram bio, Showpass), fix it. Also confirm `www.barberexpo.ca` 301s to the apex; canonicals point to apex.
2. **Thin site footprint.** Only `/` and `/vendors/` are indexable. No pages for schedule/education, Education Day, past expos (2025, 2026 recap), venue and travel/parking/hotels, sponsors, FAQ. The ranking terms ("barber expo Calgary", "hair show Alberta", "Calgary barber trade show") compete on one page. Ticketing copy lives on Showpass, which owns the ticket-intent traffic.

### Medium
3. **Event Offer incomplete.** `offers` has `url`, `availability`, `validFrom` but no `price` / `priceCurrency`. Google's Event rich result flags this. Add prices once tickets are set (Nov 9, 2026), or add `price: 0` only if true.
4. **Event schema thin.** No `performer`/`subEvent` list, no `previousStartDate` chain to 2025/2026 events. Add past events as separate Event nodes on a history page.
5. **FAQPage rich results** are restricted to government/health sites; keep the markup for AI parsing but expect no SERP feature. The same Q&A should be visible on-page (verify it is).
6. **Render-blocking Google Fonts** CSS (Archivo wdth/wght variable axes + Instrument Serif). Self-host and subset, or trim axes. Likely LCP/CLS cost on mobile.
7. **Video + large hero.** `hero-poster.webp` is 115 KB (fine). Confirm film video uses `preload="metadata"` only (it does) and is not fetched above the fold.
8. **Sitemap `lastmod`** is a manual 2026-10-28 on both URLs; keep it updated when content changes. Add new pages as they ship.

### Low
9. All 3 `<img>` have `alt=""`. Acceptable for decorative badge/hero, but the hero crowd photo is meaningful: give it descriptive alt.
10. `twitter:title/description/image` absent; X falls back to OG so this is fine, optional.
11. `/waitlist/` canonical uses relative `../`; use absolute `https://barberexpo.ca/`.
12. Security headers (HSTS, CSP, X-Content-Type-Options) can't be set on GitHub Pages directly; put Cloudflare in front if wanted.
13. `llms.txt` is ignored by Google Search; harmless, keep for AI assistants.
14. No `Content-Signal` line in robots.txt (optional).

## Local / off-site (not audited)
No Google Business Profile applies (event, not storefront). Do claim: Showpass event pages, Google Events, Eventbrite-type listings, Calgary tourism/Stampede Park event calendar, and link each back to `barberexpo.ca` to build the entity.
