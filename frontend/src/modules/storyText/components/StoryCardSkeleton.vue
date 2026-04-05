<template>
  <div class="story-card-skeleton">
    <div class="skeleton-cover">
      <div class="shimmer" />
    </div>
    <div class="skeleton-body">
      <div class="skeleton-line lg shimmer" />
      <div class="skeleton-line md shimmer" />
      <div class="skeleton-footer">
        <div class="skeleton-chip shimmer" />
        <div class="skeleton-chip shimmer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Matches NewStoryCard proportion exactly */
.story-card-skeleton {
  border-radius: var(--app-radius-md, 18px);
  overflow: hidden;
  border: 1px solid rgba(120, 144, 168, 0.12);
  background: rgba(21, 31, 47, 0.7);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

/* Cover — same 140% padding-top as NewStoryCard */
.skeleton-cover {
  position: relative;
  width: 100%;
  padding-top: 140%;
  background: rgba(15, 23, 40, 0.8);
  overflow: hidden;
}
.skeleton-cover .shimmer {
  position: absolute;
  inset: 0;
}

/* Content body */
.skeleton-body {
  padding: 14px 13px 13px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  border-radius: 6px;
  height: 14px;
}
.skeleton-line.lg  { width: 88%; }
.skeleton-line.md  { width: 55%; height: 11px; }

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 4px;
}

.skeleton-chip {
  width: 42%;
  height: 10px;
  border-radius: 6px;
}

/* Shimmer animation */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.03) 0%,
    rgba(255,255,255,0.09) 40%,
    rgba(255,255,255,0.03) 80%
  );
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite linear;
}

@media (max-width: 640px) {
  .story-card-skeleton { border-radius: 15px; }
  .skeleton-body { padding: 11px 10px 10px; }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .shimmer { animation: none; }
}
</style>
