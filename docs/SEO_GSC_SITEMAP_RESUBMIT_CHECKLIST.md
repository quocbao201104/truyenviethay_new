# GSC Sitemap Resubmit Checklist

## Target Property
- Domain property: `https://truyenviethay.id.vn`

## Submit
1. Open Google Search Console -> property `truyenviethay.id.vn`.
2. Go to `Sitemaps`.
3. Submit sitemap URL:
   - `https://truyenviethay.id.vn/sitemap.xml`

## Immediate Validation
- Confirm status is not `Couldn't fetch`.
- Confirm discovered sitemaps include:
  - `/sitemaps/static.xml`
  - `/sitemaps/stories.xml`
  - `/sitemaps/categories.xml`
  - `/sitemaps/chapters-*.xml`

## 24-72h Monitoring
- Check `Pages` report:
  - `Indexed` trend
  - `Discovered - currently not indexed`
  - `Crawled - currently not indexed`
- Spot-check 5 story URLs + 5 chapter URLs with URL Inspection.

## Alerts to Watch
- `Submitted URL not found (404)`
- `Submitted URL has crawl issue`
- `Submitted URL marked noindex`
- `Duplicate without user-selected canonical`

## Notes
- Audio sitemap is intentionally disabled (`SITEMAP_INCLUDE_AUDIO=false`).
- If large canonical/noindex mismatches appear, prioritize ticket `SEO-HEAD-001` before Batch 2C rollout.
