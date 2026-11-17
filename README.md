# Cliptika website

Static HTML deployed by the GitHub Pages Actions workflow. This repository does not contain the Mac app.

## Website analytics setup

Analytics is disabled until both GitHub Actions variables are configured. Create a free [Umami Cloud Hobby account](https://cloud.umami.is/signup?plan=hobby), choose the data region, add a website for `cliptika.app`, and open its settings → Tracking code. Copy the website ID and the script URL from that code. In GitHub, open Settings → Secrets and variables → Actions → Variables and set `UMAMI_WEBSITE_ID` and `UMAMI_SCRIPT_URL`. These values appear in the public website and are not secrets; never put API keys or credentials here. Confirm the GitHub Pages source is Actions and deploy only after owner approval. An empty variable leaves tracking off. The tracker loads only on cliptika.app and www.cliptika.app. Local files, previews and other domains do not send production traffic.

The Hobby plan's limits and retention can change; see [pricing](https://umami.is/pricing). Each page view, event and event property consumes usage. Verify the account's retention and region and review the privacy disclosure before enabling. Do not put personal information into campaign URLs. Umami may collect URLs, referrers and UTM values; it processes IP addresses to create anonymous rotating identifiers. Do Not Track is honored where supported. Analytics may be blocked by browsers and is an estimate.

## App Store launch checklist

There are currently no App Store links; the site says “Coming soon.” Once the official listing exists, replace the appropriate launch CTAs with ordinary direct links to that exact listing. On each link use the following attributes, with placement one of `hero`, `navigation`, `pricing`, or `footer`:

```html
<a href="OFFICIAL_APP_STORE_URL" data-umami-event="app_store_click" data-umami-event-placement="hero">Download on the Mac App Store</a>
```

Do not add an additional JavaScript click handler for the same event. This records clicks, not downloads or installs. Navigation remains a direct link and is not delayed; events can be missed if the tracker is blocked, has not loaded, or navigation interrupts delivery. Run `python3 tests/check_analytics.py` after adding links; verify the destination against the official listing and manually test mouse, keyboard and mobile navigation and a single event per click.

## Dashboard and definitions

Sign in to Umami Cloud, open Websites and select Cliptika. Overview shows page views, visitors, referrers, countries and devices; Growth → UTM shows campaigns. Events → `app_store_click` shows click totals, and the Properties tab breaks down `placement`. There is no separate Pricing page: it is the `#free-pro` section on Home, so normal page views do not measure visits to that section. Hashes are excluded; do not interpret Home views as Pricing views.

For the requested conversion measure, define a website visitor session as an Umami anonymous session with at least one page view during the selected date range, and a click session as one of those sessions with at least one `app_store_click` in that same range. Conversion is 100 × click sessions / page-view sessions. Multiple clicks in one session count once; total event count divided by visits is not this conversion. Umami's Goals report describes a conversion of users/sessions, not visits; its denominator must be checked against the page-view-session definition before relying on it. Use an export or a verified report that deduplicates session IDs and filters both sets to page views and the same time range; Hobby API access is not included. Umami identifiers can merge people sharing IP/browser, split people across rotating salts or devices, and may be affected by blockers, so these numbers are estimates. See [metric definitions](https://docs.umami.is/docs/metric-definitions), [Goals](https://docs.umami.is/docs/goals), and [data export](https://docs.umami.is/docs/cloud/export-data).

## Validation

Run `python3 tests/check_analytics.py` and `node tests/analytics-loader.test.js`. Before launch, use a test Umami website and an authorized preview hostname (temporarily adjusted in a local test copy, never production config) to confirm one page view and one event with the expected placement for every CTA. Verify the official direct destinations, mobile layout, privacy wording and absence of duplicate tracking before owner-approved deployment.
