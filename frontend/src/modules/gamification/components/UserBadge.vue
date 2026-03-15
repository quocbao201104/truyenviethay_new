<template>
  <span
    v-if="badge"
    class="user-badge-divine"
    :class="[`rarity-${badge.rarity || 'common'}`, `anim-${badge.animation_type || 'none'}`, `size-${size}`, { 'is-fallback': !resolvedIconUrl || imageFailed }]"
    :style="{ '--badge-color': badge.color || '#fbbf24' }"
    :title="badge.badge_name"
  >
    <span class="badge-img-wrap">
      <img
        v-if="resolvedIconUrl && !imageFailed"
        :src="resolvedIconUrl"
        :alt="badge.badge_name"
        class="badge-icon-spirit"
        @error="onImgError"
      />
      <span v-else class="badge-fallback-rune">
        {{ badge.badge_name?.charAt(0) || '?' }}
      </span>
    </span>
    <span v-if="showName" class="badge-name-gold">{{ badge.badge_name }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Badge } from '@/types/badge';
import { getImageUrl } from '@/config/constants';

const props = withDefaults(
  defineProps<{
    badge?: Badge | null;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showName?: boolean;
  }>(),
  {
    badge: null,
    size: 'sm',
    showName: false,
  }
);

const imageFailed = ref(false);

const resolvedIconUrl = computed(() => {
  if (!props.badge?.icon_url) return null;
  return getImageUrl(props.badge.icon_url, 128);
});

watch(
  () => props.badge?.icon_url,
  () => {
    imageFailed.value = false;
  },
  { immediate: true }
);

const onImgError = () => {
  imageFailed.value = true;
};
</script>

<style scoped>
/* ── Base ───────────────────────────────────────────────────────────────────── */
.user-badge-divine {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  vertical-align: middle;
  position: relative;
  line-height: 1;
}

/* ── Kích thước tỷ lệ theo font-size ────────────────────────────────────────── */
.badge-img-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.size-xs .badge-img-wrap { width: 1.2em;  height: 1.2em; }
.size-sm .badge-img-wrap { width: 1.6em;  height: 1.6em; }
.size-md .badge-img-wrap { width: 2.2em;  height: 2.2em; }
.size-lg .badge-img-wrap { width: 3.2em;  height: 3.2em; }

/* ── Badge Icon (Hình ảnh Đạo Ấn) ───────────────────────────────────────────── */
.badge-icon-spirit {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s ease;
}

.badge-fallback-rune {
  width: 100%;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--badge-color) 30%, #fff), color-mix(in srgb, var(--badge-color) 80%, #050510));
  color: #fff;
  font-weight: 900;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 0 0 10px color-mix(in srgb, var(--badge-color) 60%, transparent), inset 0 0 8px rgba(0,0,0,0.5);
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
}

/* ── Tên Lệnh Bài ───────────────────────────────────────────────────────────── */
.badge-name-gold {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--badge-color);
  letter-spacing: 0.05em;
  white-space: nowrap;
  text-shadow: 0 0 8px color-mix(in srgb, var(--badge-color) 40%, transparent);
}

/* ── Rarity Glow (Phân Cấp Phẩm Giai) ───────────────────────────────────────── */
/* Phàm Phẩm (Common): Sáng nhẹ */
.rarity-common .badge-icon-spirit {
  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--badge-color) 40%, transparent));
}

/* Linh Phẩm (Uncommon): Sáng tỏ */
.rarity-uncommon .badge-icon-spirit {
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--badge-color) 60%, transparent));
}

/* Tiên Phẩm (Rare): Hào quang rõ rệt */
.rarity-rare .badge-icon-spirit {
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--badge-color) 80%, transparent));
}

/* Thần Phẩm (Epic): Hào quang kép */
.rarity-epic .badge-icon-spirit {
  filter: 
    drop-shadow(0 0 12px var(--badge-color))
    drop-shadow(0 0 4px color-mix(in srgb, var(--badge-color) 50%, #fff));
}

/* Hỗn Độn Phẩm (Legendary): Hào quang chân thần rực rỡ */
.rarity-legendary .badge-icon-spirit {
  filter:
    drop-shadow(0 0 8px var(--badge-color))
    drop-shadow(0 0 18px color-mix(in srgb, var(--badge-color) 80%, transparent))
    drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
}

/* Animations and hover effects removed as requested */
</style>