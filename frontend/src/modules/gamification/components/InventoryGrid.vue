<template>
  <div class="inventory-section">
    <div class="panel-header">
      <div class="header-text">
        <div class="kicker-wrap">
          <i class="fas fa-ring opacity-40 text-xs"></i>
          <p class="kicker">LINH KHÍ KHU VỰC</p>
          <i class="fas fa-ring opacity-40 text-xs"></i>
        </div>
        <h2 class="majestic-title">NHẪN TRỮ VẬT</h2>
      </div>
      <div class="stat-badge">
        <span class="label">Dung Lượng</span>
        <strong class="value">{{ inventoryItems?.length || 0 }} <small>ITEM</small></strong>
      </div>
    </div>

    <div v-if="!inventoryItems || inventoryItems.length === 0" class="empty-state">Túi đồ đang rỗng.</div>

    <div v-else class="inventory-grid">
      <button
        v-for="item in inventoryItems"
        :key="item.inventory_id"
        class="inventory-slot"
        :class="[
          item.css_class || '',
          {
            equipped: item.is_equipped,
            usable: canEquipItem(item.item_type),
            pulse: pulseItemId === item.inventory_id,
          },
        ]"
        :disabled="processingItemId === item.inventory_id || !canEquipItem(item.item_type)"
        @click="handleUseItem(item)"
      >
        <span class="star-rune rune-a"></span>
        <span class="star-rune rune-b"></span>

        <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="slot-image" />
        <i v-else class="fas fa-cube slot-fallback"></i>

        <span class="slot-qty">x{{ item.quantity }}</span>
        <span v-if="item.is_equipped" class="slot-state equipped-text">Đang dùng </span>
        <span v-else-if="canEquipItem(item.item_type)" class="slot-state use-text">Sử dụng</span>

        <span v-if="processingItemId === item.inventory_id" class="slot-loading">
          <i class="fas fa-spinner fa-spin"></i>
        </span>
      </button>
    </div>

    <div class="badges-section">
      <div class="panel-header compact">
        <div class="header-text">
          <div class="kicker-wrap">
            <i class="fas fa-medal opacity-40 text-xs"></i>
            <p class="kicker">DANH VỌNG CÁ NHÂN</p>
          </div>
          <h3 class="majestic-title-sm">LỆNH BÀI CẢNH GIỚI</h3>
        </div>
        <div class="stat-badge cyan">
          <span class="label">Đã Đạt</span>
          <strong class="value">{{ badges?.length || 0 }} <small>/ 16</small></strong>
        </div>
      </div>

      <div class="badge-grid">
        <button
          v-for="badge in badges || []"
          :key="badge.reward_id"
          class="badge-slot"
          :class="{ equipped: badge.is_equipped, active: activeBadgeHint === badge.reward_id }"
          :style="{ '--badge-color': badge.color || '#34d399' }"
          @click="handleBadgeClick(badge)"
        >
          <UserBadge :badge="badge" size="md" />

          <span v-if="processingBadgeId === badge.reward_id" class="badge-loading">
            <i class="fas fa-spinner fa-spin"></i>
          </span>

          <span class="badge-tip desktop-tip">
            <strong>{{ badge.badge_name }}</strong>
            <small>{{ badge.is_equipped ? 'Đang đeo' : 'Chạm để đeo' }}</small>
          </span>

          <span class="badge-tip-mobile" v-if="activeBadgeHint === badge.reward_id">
            {{ badge.badge_name }}
          </span>
        </button>

        <div v-for="i in Math.max(0, 16 - (badges?.length || 0))" :key="`empty-${i}`" class="badge-slot empty"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UserBadge from './UserBadge.vue';

const props = defineProps({
  inventoryItems: Array,
  badges: Array,
  processingItemId: [Number, String],
  processingBadgeId: [Number, String],
  getItemTypeLabel: Function,
  formatExpiry: Function,
  canEquipItem: Function,
});

const emit = defineEmits(['use-item', 'equip-badge']);

const pulseItemId = ref(null);
const activeBadgeHint = ref(null);

const handleUseItem = (item) => {
  if (!props.canEquipItem(item.item_type) || item.is_equipped) return;

  pulseItemId.value = item.inventory_id;
  emit('use-item', item);

  setTimeout(() => {
    if (pulseItemId.value === item.inventory_id) {
      pulseItemId.value = null;
    }
  }, 850);
};

const handleBadgeClick = (badge) => {
  activeBadgeHint.value = activeBadgeHint.value === badge.reward_id ? null : badge.reward_id;
  if (!badge.is_equipped) {
    emit('equip-badge', badge.reward_id);
  }
};
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.2rem;
  background: linear-gradient(to right, rgba(15, 23, 42, 0.4), transparent);
  border-radius: 16px;
  border-left: 4px solid #3b82f6;
}

.panel-header.compact {
  margin-top: 2rem;
  border-left-color: #06b6d4;
  padding: 0.8rem 1.2rem;
}

.kicker-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.kicker {
  margin: 0;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  color: #94a3b8;
  text-transform: uppercase;
}

.majestic-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 900;
  background: linear-gradient(135deg, #fff 30%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.majestic-title-sm {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 30%, #06b6d4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-badge {
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  padding: 0.4rem 1rem;
  text-align: right;
  min-width: 130px;
}

.stat-badge.cyan { border-color: rgba(6, 182, 212, 0.3); }

.stat-badge .label {
  display: block;
  font-size: 0.6rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-badge .value {
  color: #3b82f6;
  font-size: 1.1rem;
  font-weight: 800;
}

.stat-badge.cyan .value { color: #22d3ee; }

.panel-title {
  margin: 0.2rem 0 0;
  font-size: clamp(1.04rem, 2.2vw, 1.3rem);
}

.desc {
  margin: 0.34rem 0 0;
  color: #9cb0ca;
  font-size: 0.86rem;
}

.item-count {
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 12px;
  background: rgba(7, 16, 33, 0.6);
  padding: 0.5rem 0.72rem;
  min-width: 124px;
  text-align: right;
  font-size: 0.78rem;
  color: #98adca;
}

.empty-state {
  border: 1px dashed rgba(148, 163, 184, 0.3);
  border-radius: 13px;
  padding: 1rem;
  text-align: center;
  color: #9cb0ca;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
  gap: 0.72rem;
}

.inventory-slot {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  border: 1px solid rgba(251, 191, 36, 0.2);
  background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15), rgba(8, 14, 28, 0.95));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.inventory-slot:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.15);
}

.inventory-slot:disabled {
  opacity: 0.56;
  cursor: not-allowed;
}

.star-rune {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  transform: rotate(45deg);
  opacity: 0.4;
  transition: all 0.3s ease;
}

.inventory-slot:hover .star-rune {
  opacity: 0.8;
  border-color: #fbbf24;
  transform: rotate(135deg);
}

.rune-a {
  top: 6px;
  left: 6px;
}

.rune-b {
  right: 6px;
  bottom: 6px;
}

.slot-image {
  width: 80%;
  height: 80%;
  object-fit: contain;
  filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.58));
}

.slot-fallback {
  font-size: 1.5rem;
  color: #94a3b8;
}

.slot-qty,
.slot-state {
  position: absolute;
  left: 6px;
  right: 6px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.66rem;
  font-weight: 700;
}

.slot-qty {
  top: 6px;
  color: #def8ff;
  background: rgba(2, 6, 23, 0.62);
  padding: 0.15rem 0.26rem;
}

.slot-state {
  bottom: 6px;
  color: #ebfcff;
  padding: 0.19rem 0.3rem;
}

.equipped-text {
  background: rgba(6, 78, 59, 0.56);
}

.use-text {
  background: rgba(14, 116, 144, 0.62);
}

.slot-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(2, 6, 23, 0.6);
}

.inventory-slot.equipped {
  border-color: rgba(74, 222, 128, 0.65);
  box-shadow: inset 0 0 0 1px rgba(74, 222, 128, 0.45), 0 0 24px rgba(74, 222, 128, 0.2);
}

.inventory-slot.pulse {
  animation: qiPulse 0.85s ease-out;
}

.badges-section {
  margin-top: 1.2rem;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 0.72rem;
}

.badge-slot {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15), rgba(8, 14, 28, 0.9));
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.badge-slot:hover,
.badge-slot.active,
.badge-slot.equipped {
  border-color: var(--badge-color);
  box-shadow: 0 0 20px color-mix(in srgb, var(--badge-color) 35%, transparent);
}

.badge-slot.empty {
  opacity: 0.22;
  cursor: default;
}

.badge-loading {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  display: grid;
  place-items: center;
  background: rgba(2, 6, 23, 0.5);
}

.badge-tip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  background: rgba(2, 6, 23, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 8px;
  color: #e2e8f0;
  padding: 0.38rem 0.5rem;
  text-align: center;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  font-size: 0.72rem;
}

.badge-tip strong {
  display: block;
  margin-bottom: 0.12rem;
}

.badge-slot:hover .desktop-tip {
  opacity: 1;
}

.badge-tip-mobile {
  position: absolute;
  left: 50%;
  bottom: -1.65rem;
  transform: translateX(-50%);
  font-size: 0.64rem;
  background: rgba(2, 6, 23, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 7px;
  padding: 0.2rem 0.44rem;
  white-space: nowrap;
}

@keyframes qiPulse {
  0% {
    transform: scale(0.96);
    box-shadow: 0 0 0 rgba(45, 212, 191, 0.4);
  }
  40% {
    transform: scale(1.02);
    box-shadow: 0 0 25px rgba(45, 212, 191, 0.44);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(45, 212, 191, 0);
  }
}

@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .item-count {
    min-width: 0;
    text-align: left;
  }

  .inventory-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.56rem;
  }

  .slot-qty,
  .slot-state {
    font-size: 0.59rem;
  }

  .badge-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .desktop-tip {
    display: none;
  }
}
</style>
