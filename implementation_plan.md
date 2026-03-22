# Mobile Audio Player Optimization

Optimize the mobile experience of the audio player in [StoryAudioDetailView.vue](file:///c:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue) without affecting the desktop layout.

## Proposed Changes

### [Component] StoryAudioDetailView.vue
#### [MODIFY] [StoryAudioDetailView.vue](file:///c:/Users/Admin/Downloads/web/truyenviethay_new/frontend/src/modules/storyAudio/views/StoryAudioDetailView.vue)
- **State Management**:
  - Add `isMobile` check via `window.matchMedia`.
  - Add `isPlayerExpanded` state for mobile.
  - Add `showPlaylist` state for mobile bottom sheet.
- **Template Updates**:
  - Wrap existing desktop layout in a conditional or use CSS to hide/show mobile-specific elements.
  - Add `Mobile Mini Player`: A sticky bottom bar with thumbnail, title, play/pause, and next buttons.
  - Add `Mobile Full Player View`: 
    - Compact header with back button and episode title.
    - Responsive cover image that shrinks on scroll.
    - Custom controls row: `Previous`, `Skip -10s`, `Play/Pause`, `Skip +10s`, `Next`.
    - Secondary actions row: `Favorite`, `Download`, `Playback Speed`, `Sleep Timer`, `Loop`.
  - Add `Mobile Playlist Sheet`: A bottom sheet triggered by a "Playlist" button or swipe up.
- **Interaction Logic**:
  - Implement `skipTime(delta: number)` function for +/- 10s.
  - Implement swipe gestures using basic touch events.
  - Implement double-tap detection for skipping.
- **CSS Improvements**:
  - Use media queries to transition from the 2-column desktop grid to a vertical mobile layout.
  - Add animations for mini-player ↔ full-player transitions.

## Verification Plan

### Automated Tests
- N/A (Manual verification is more suitable for UI/UX/Responsive changes).

### Manual Verification
1. **Desktop View**: Open the page on a desktop browser. Ensure the layout remains exactly as it was (2-column, cover on left, playlist on right).
2. **Mobile Breakpoint (<= 768px)**:
   - Verify the "Mini Player" appears at the bottom.
   - Tap Mini Player to expand to "Full Player".
   - Verify the vertical layout: Header -> Shrinking Cover -> Title -> Progress Bar -> Large Controls -> Secondary Actions.
   - Test "Skip -10s" and "Skip +10s" buttons.
   - Verify the Playlist appears as a bottom sheet or a toggleable section.
3. **Interactions**:
   - Test double-tap on the cover image area to skip.
   - Test swipe down on the full player to minimize it back to the mini-player.
   - Verify playback position is remembered when switching episodes.
