# Audio List Premium Editorial Design

**Goal:** Reframe `/truyen-audio` as a premium, branded audio destination instead of a generic story list with audio buttons.

**Primary UX Direction:** Premium Editorial

**Success Criteria:**
- Users immediately understand that the page is a dedicated audio experience.
- The page feels more curated and premium while preserving the current dark visual language.
- Audio-first metadata such as part count, total duration, and source/channel become easier to scan.
- The UI improves perceived quality without requiring a full information architecture rewrite.

## Visual Direction

Keep the dark foundation, but push the page toward a more editorial, curated aesthetic:

- Use a deeper navy background instead of flat dark panels.
- Shift highlights from bright cyan-only accents to a more controlled mix of jade/cyan plus subtle champagne highlights.
- Increase spacing and hierarchy so the layout feels less dense and less utility-driven.
- Reduce the “sticker” feel of badges and use quieter premium labels instead.

## Layout

### Hero

Add a compact hero section above the list:

- Left side:
  - label such as `Truyen Audio Tuyen Chon`
  - page title
  - one short editorial tagline
  - one featured audio story with a clear `Nghe ngay` CTA
- Right side:
  - compact stats cards such as total stories, recent updates, and total episodes

The hero should stay relatively shallow so the main list remains visible without excessive scrolling.

### Main Section

Preserve the current two-column page structure:

- Left: sticky filter panel
- Right: editorial-style audio list

The change is mainly about hierarchy, spacing, and component styling rather than replacing the page structure.

## Audio Card Design

Replace the current “regular list card with audio button” feel with a more editorial horizontal card.

### Card Hierarchy

- Narrower, cleaner cover presentation with a soft border and shadow
- Larger title with stronger visual weight
- Author and release status grouped into one clear metadata row
- Audio-first info row for:
  - total parts
  - total duration
  - source/channel when available

### Badges

- `AUDIO` becomes a compact premium capsule
- release state badges such as `Dang ra` and `Hoan thanh` become calmer and more consistent
- avoid multiple loud colors competing at once

### Actions

Keep one primary action and one secondary action:

- Primary: `Nghe ngay`
- Secondary: `Nghe thu` or `Xem chi tiet`

Avoid a row of equally weighted icon buttons. The listening CTA should dominate.

## Filter Panel

Keep the sidebar but restyle it as a curated control panel rather than a utility form.

### Changes

- Add a softer subtitle under the filter heading
- Increase spacing between sections
- Simplify and soften genre chips
- Keep status and sort controls short and highly scannable
- Add a lightweight “active filters” summary either at the top of the sidebar or above the list

The filter should feel premium and calm, not dense or admin-like.

## Content Strategy

The page should communicate audio value directly in the listing UI:

- favor audio-specific metadata over placeholder engagement metrics
- surface source/channel when available
- optionally mark recently updated audio stories with a small editorial label

If a story lacks meaningful audio metadata, the UI should fall back gracefully without creating empty visual slots.

## Motion

Use restrained motion:

- slight lift on card hover
- gentle cover zoom
- subtle CTA sheen or glow
- no heavy animated backgrounds

The page should feel polished, not flashy.

## Responsive Behavior

- Desktop keeps the current sidebar + content split.
- Tablet collapses to a single-column list with a filter drawer.
- Mobile keeps the drawer pattern, but the card layout should preserve the title, primary CTA, and the most important two pieces of audio metadata without becoming cramped.

## Error Handling and Empty States

- Loading state should feel branded and intentional, not generic.
- Empty state should suggest removing or relaxing filters.
- Missing metadata such as duration or channel should hide cleanly rather than rendering empty labels.

## Implementation Scope

In scope:

- `/truyen-audio` list page visual redesign
- hero section
- audio card redesign
- filter panel restyle
- audio-first metadata prioritization in the list UI

Out of scope for this pass:

- full light theme
- complete detail page redesign
- new recommendation engine
- personalized continue-listening rail
- backend schema changes beyond existing available metadata

## Testing Strategy

- Verify layout and spacing on desktop, tablet, and mobile
- Verify the hero degrades cleanly when featured story data is missing
- Verify cards handle missing duration/channel/source without breaking alignment
- Run frontend build after implementation

## Recommended Rollout

Implement this as a targeted redesign of the existing `/truyen-audio` route using the current data flow. Reuse the existing filter/query behavior and focus the first pass on visual hierarchy, card composition, and premium branding cues instead of changing navigation or backend search logic.
