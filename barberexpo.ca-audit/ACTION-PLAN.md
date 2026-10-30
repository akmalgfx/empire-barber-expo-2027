# Action Plan: barberexpo.ca

## Critical
- Find and fix any use of `barebrexpo.ca` (typo domain, does not resolve).

## High (week 1)
- Verify live: `www` to apex 301, http to https, 200 on `/`, `/vendors/`, `/sitemap.xml`, `/robots.txt`.
- Run PageSpeed Insights / CrUX on `/` mobile; record LCP, INP, CLS.
- Plan new indexable pages: `/education/` (schedule, speakers), `/past-expos/` (2025, 2026 recap + photos), `/venue/` (Big Four Roadhouse, parking, hotels), `/faq/`.

## Medium (weeks 2-3)
- After Nov 9 ticket launch: add `price`/`priceCurrency` to the Offer and point it to the Showpass link.
- Self-host and subset fonts; drop unused variable axes.
- Add every new page to `sitemap.xml` with real `lastmod`.
- Make the FAQ answers visible on-page and match the schema.

## Low (backlog)
- Descriptive alt on hero photo; absolute canonical on `/waitlist/`.
- Past Event nodes in schema; Twitter card title/image.
- Off-site listings (Stampede Park calendar, Showpass, Google Events) linking to the apex domain.
