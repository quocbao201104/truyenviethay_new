# SEO Ticket: Initial HTML Canonical/Robots Fix

## Ticket Info
- ID: `SEO-HEAD-001`
- Priority: `Critical`
- Status: `Open`
- Owner: `Frontend + SEO + Platform`
- Created: `2026-03-27`
- Related phase: `Phase 1 (post Batch 2B, pre Batch 2C)`

## Problem Statement
Current production pages are mostly CSR-first. Runtime QA shows:
- Initial HTML source does not contain canonical link tags on public pages.
- URL types that should be `noindex` by policy (for example `tim-kiem`, deep/listing query variants) can still expose `index, follow` in initial source.

This creates index-governance risk while waiting for JS execution.

## Goal
Make canonical + robots directives available in **initial HTML source** for SEO-critical route types.

## In Scope
- Public route templates:
  - Home
  - Story list / category list / audio list
  - Story detail
  - Chapter detail
  - Audio detail
  - Search
- Query-governance mapping for canonical + robots in server-rendered/source HTML
- Validation script/checklist for source HTML compliance

## Out of Scope
- Structured data expansion (Batch 2C)
- Full content rendering optimization beyond head/indexability signals

## Requirements
1. Canonical in initial source
- Every indexable public URL must expose one canonical tag in initial HTML.
- Canonical must match the route policy (clean URL, normalized query policy).

2. Robots in initial source
- Indexable pages: `index, follow`
- Non-indexable policy pages (search/faceted/deep pages by policy): `noindex, follow`
- Do not rely on client-side runtime head patching for these critical signals.

3. Consistent policy source
- Canonical/noindex rules used by sitemap eligibility and initial HTML must be aligned to one mapping source (shared policy module or mirrored contract).

4. Verification
- Add automated check for representative URLs (minimum 20 URLs across route types):
  - Status = 200
  - canonical exists in initial HTML and matches expected target
  - robots content matches expected policy

## Implementation Options (choose 1)
### Option A (Preferred): Selective SSR for public SEO routes
- Render head tags server-side for SEO routes.
- Keep private/auth/admin routes CSR-only.

### Option B: Prerender selected route sets
- Prerender top templates and high-value URL sets from sitemap.
- Needs refresh job strategy for frequently updated chapters.

### Option C: Edge/server head injection layer
- Inject canonical/robots in initial HTML based on request URL + query policy.
- Fastest mitigation if SSR migration is not immediate.

## Acceptance Criteria (Definition of Done)
- [ ] Initial HTML of sample URLs contains canonical tag (correct value).
- [ ] Initial HTML of sample non-index pages contains `noindex, follow`.
- [ ] Initial HTML of sample indexable pages contains `index, follow`.
- [ ] No contradictory head signals between initial HTML and runtime head updates.
- [ ] Source-html QA script/checklist is documented and repeatable.
- [ ] SEO team sign-off after GSC URL Inspection spot-check.

## QA Checklist (Runtime)
Use representative URLs from:
- `/`
- `/truyen-chu`
- `/truyen-chu/:slug`
- `/truyen-chu/:storySlug/:chapterSlug`
- `/the-loai?categories=:id`
- `/tim-kiem`
- `/the-loai?page=2`
- `/truyen-audio?page=2`

For each URL verify:
- HTTP status
- Canonical in initial HTML
- Robots in initial HTML
- Canonical target compliance with policy

## Dependencies
- Existing sitemap/canonical governance from Batch 2A/2B
- robots.txt hotfix already deployed as temporary risk reduction

## Notes
- `robots.txt` is temporary mitigation only.
- Long-term stable solution must deliver canonical/robots in initial HTML source.
