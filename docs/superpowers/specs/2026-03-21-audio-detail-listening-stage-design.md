# Audio Detail Listening Stage Design

**Goal:** Redesign `/truyen-audio/:slug` so it feels like a dedicated listening stage centered on cover art, title, and mood instead of a text-story detail page with an audio player attached.

**Primary UX Direction:** Listening Stage

**Success Criteria:**
- The page immediately reads as an audio-first experience.
- Cover art, title, and listening mood dominate the first screen.
- The audio player remains convenient but visually integrated into the hero instead of feeling like a separate utility card.
- The page aligns with the new premium editorial direction introduced on `/truyen-audio`.

## Visual Direction

Carry forward the premium editorial language from the audio listing page:

- deep navy-to-ink background
- jade/cyan accents with restrained champagne highlights
- softer, more luxurious panel borders
- less generic “dashboard card” feeling

The detail page should feel more intimate than the list page, with stronger atmosphere and less visual clutter.

## Layout

### Top Stage

The first screen becomes a listening stage made from three coordinated zones:

- Left: large cover presentation
- Center: title, mood copy, story metadata, integrated player controls
- Right: playlist summary / listening queue

The hero should read as one composed stage rather than three unrelated cards.

### Lower Editorial Section

Below the stage:

- story introduction
- copyright / source channel
- any secondary metadata that does not deserve hero priority

This area should feel like editorial notes, not admin metadata.

## Hero Composition

### Cover

- Larger and more premium than the current detail page cover
- Stronger framing with soft glow/shadow
- Optional ambient background derived from the cover area or color palette

### Title and Mood

This becomes the visual center of the page:

- title should be significantly stronger typographically
- short mood-oriented copy sits close to the title
- author, status, and source/channel become supporting metadata

The tone should feel curated and atmospheric rather than informational first.

### Player Integration

The player should move inside the hero composition:

- primary play/pause CTA remains prominent
- transport controls stay available
- the browser audio controls can remain, but should sit inside a premium listening block

The player must feel like part of the story stage, not a detached utility panel.

## Playlist

The playlist remains important, but it should visually defer to the hero:

- resembles a refined track list rather than a heavy admin accordion
- current item stays obvious
- cluster groups should still work, but styling should feel lighter and more premium

The playlist column should support the hero rather than compete with it.

## Introduction Block

The `Gioi thieu` section should be reframed as editorial content:

- calmer heading treatment
- cleaner paragraph rhythm
- copyright/source line styled as an attribution note

This section should visually connect to the premium page language introduced on the listing route.

## Motion

Use restrained motion only:

- subtle cover breathing / glow
- light state changes on play controls
- softer hover transitions in playlist items

Avoid aggressive visualizers or animated backgrounds that overpower reading and listening.

## Responsive Behavior

- Desktop keeps the listening stage with cover, content, and playlist in coordinated columns.
- Tablet collapses the stage into stacked sections while preserving the cover-first hierarchy.
- Mobile should still prioritize:
  - cover
  - title
  - main player CTA
  - current playback context

The playlist may move below the hero on smaller screens, but the page should still feel intentionally audio-first.

## Error Handling and Empty States

- Loading state should feel on-brand with the audio section.
- Missing playlist data should not collapse the hero composition awkwardly.
- Missing source/copyright data should hide cleanly.
- Missing description should fall back to a softer editorial placeholder.

## Implementation Scope

In scope:

- `/truyen-audio/:slug` visual redesign
- hero stage redesign
- player block visual integration
- playlist restyle
- introduction/copyright restyle

Out of scope for this pass:

- changing audio playback mechanics
- changing progress persistence logic
- changing data model beyond already available metadata
- adding recommendation rails or personalized sections

## Testing Strategy

- Verify the page hierarchy on desktop, tablet, and mobile
- Verify the player still works after being visually repositioned
- Verify the playlist remains usable and clear when clusters expand/collapse
- Verify introduction and copyright still render correctly
- Run frontend build after implementation

## Recommended Rollout

Implement this as a focused redesign of the existing audio detail route. Preserve the current playback, resume, and clustering logic, but reorganize the top-stage composition and supporting panels so the page becomes unmistakably audio-first and visually consistent with the premium editorial list experience.
