<template>
  <div class="inventory-section-cosmic">
    <div class="panel-header-divine">
      <div class="header-text">
        <div class="kicker-wrap">
          <i class="fas fa-ring text-amber-400 opacity-60 text-xs"></i>
          <p class="kicker-gold">KHÔNG GIAN TRỮ VẬT</p>
          <i class="fas fa-ring text-amber-400 opacity-60 text-xs"></i>
        </div>
        <h2 class="majestic-title-gold">NHẪN CÀN KHÔN</h2>
      </div>
      <div class="stat-badge-gold">
        <span class="label">Hư Không Dung Lượng</span>
        <strong class="value">{{ inventoryItems?.length || 0 }} <small>BẢO VẬT</small></strong>
      </div>
    </div>

    <div v-if="!inventoryItems || inventoryItems.length === 0" class="empty-state-cosmic">
      <i class="fas fa-box-open opacity-30 text-4xl mb-3"></i>
      <p>Không gian tĩnh lặng, nhẫn Càn Khôn đang rỗng.</p>
    </div>

    <div v-else class="inventory-grid-array">
      <button
        v-for="item in inventoryItems"
        :key="item.inventory_id"
        class="inventory-slot-cosmic"
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
        <div class="magic-array-bg"></div>
        <span class="star-rune rune-a"></span>
        <span class="star-rune rune-b"></span>

        <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="slot-image item-img" />
        <i v-else class="fas fa-cube slot-fallback"></i>

        <span class="slot-qty">x{{ item.quantity }}</span>
        
        <div class="slot-state-wrap">
          <span v-if="item.is_equipped" class="slot-state equipped-text">Đang Ngự</span>
          <span v-else-if="canEquipItem(item.item_type)" class="slot-state use-text">
            {{ item.item_type === 'consumable' ? 'Luyện Hóa' : 'Tế Luyện' }}
          </span>
        </div>

        <span v-if="processingItemId === item.inventory_id" class="slot-loading">
          <i class="fas fa-yin-yang fa-spin text-amber-400 text-2xl"></i>
        </span>
      </button>
    </div>

    <div class="badges-section-divine">
      <div class="panel-header-divine compact">
        <div class="header-text">
          <div class="kicker-wrap">
            <i class="fas fa-medal text-amber-400 opacity-60 text-xs"></i>
            <p class="kicker-gold">DANH VỌNG CÁ NHÂN</p>
          </div>
          <h3 class="majestic-title-sm">LỆNH BÀI CẢNH GIỚI</h3>
        </div>
        <div class="stat-badge-gold outline">
          <span class="label">Đã Hàng Phục</span>
          <strong class="value">{{ badges?.length || 0 }} <small>/ 16</small></strong>
        </div>
      </div>

      <div class="badge-grid-cosmic">
        <button
          v-for="badge in badges || []"
          :key="badge.reward_id"
          class="badge-slot-rune"
          :class="{ equipped: badge.is_equipped, active: activeBadgeHint === badge.reward_id }"
          :style="{ '--badge-color': badge.color || '#fbbf24' }"
          @click="handleBadgeClick(badge)"
        >
          <div class="badge-glow-bg"></div>
          <UserBadge :badge="badge" size="md" />

          <span v-if="processingBadgeId === badge.reward_id" class="badge-loading">
            <i class="fas fa-yin-yang fa-spin text-amber-400"></i>
          </span>

          <span class="badge-tip-gold desktop-tip">
            <strong>{{ badge.badge_name }}</strong>
            <small>{{ badge.is_equipped ? 'Đang kết ấn' : 'Chạm để kết ấn' }}</small>
          </span>

          <span class="badge-tip-mobile" v-if="activeBadgeHint === badge.reward_id">
            {{ badge.badge_name }}
          </span>
        </button>

        <div v-for="i in Math.max(0, 16 - (badges?.length || 0))" :key="`empty-${i}`" class="badge-slot-rune empty">
          <i class="fas fa-lock opacity-20"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UserBadge from './UserBadge.vue';

const props = defineProps({
  inventoryItems: Array, badges: Array, processingItemId: [Number, String], processingBadgeId: [Number, String],
  getItemTypeLabel: Function, formatExpiry: Function, canEquipItem: Function,
});

const emit = defineEmits(['use-item', 'equip-badge']);
const pulseItemId = ref(null);
const activeBadgeHint = ref(null);

const handleUseItem = (item) => {
  if (!props.canEquipItem(item.item_type) || item.is_equipped) return;
  pulseItemId.value = item.inventory_id;
  emit('use-item', item);
  setTimeout(() => { if (pulseItemId.value === item.inventory_id) pulseItemId.value = null; }, 850);
};

const handleBadgeClick = (badge) => {
  activeBadgeHint.value = activeBadgeHint.value === badge.reward_id ? null : badge.reward_id;
  if (!badge.is_equipped) emit('equip-badge', badge.reward_id);
};
</script>

<style scoped>
/* Headers */
.panel-header-divine {
  display: flex; justify-content: space-between; align-items: center; gap: 1.5rem;
  margin-bottom: 1.5rem; padding: 1.2rem 1.5rem;
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.1), transparent);
  border-radius: 16px; border-left: 4px solid #fbbf24;
}

.panel-header-divine.compact { margin-top: 2.5rem; padding: 0.8rem 1.2rem; }

.kicker-wrap { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
.kicker-gold { margin: 0; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.25em; color: #fbbf24; text-transform: uppercase; }

.majestic-title-gold { margin: 0; font-size: 1.6rem; font-weight: 900; background: linear-gradient(135deg, #fff 30%, #fbbf24 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1px; }
.majestic-title-sm { margin: 0; font-size: 1.3rem; font-weight: 800; color: #fff; text-shadow: 0 2px 5px rgba(0,0,0,0.8); }

/* Stats Badge */
.stat-badge-gold {
  border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 14px;
  background: rgba(10, 15, 30, 0.8); box-shadow: inset 0 0 10px rgba(251, 191, 36, 0.06);
  padding: 0.5rem 1.2rem; text-align: right; min-width: 140px;
}
.stat-badge-gold.outline { background: transparent; border-style: dashed; box-shadow: none; }
.stat-badge-gold .label { display: block; font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
.stat-badge-gold .value { color: #fbbf24; font-size: 1.2rem; font-weight: 900; }
.stat-badge-gold .value small { font-size: 0.7rem; color: #fff; }

.empty-state-cosmic { border: 1px dashed rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 3rem; text-align: center; color: #fbbf24; background: rgba(251, 191, 36, 0.05); margin-top: 1rem; }

/* Grid Nhẫn Càn Khôn */
.inventory-grid-array { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1rem; }

.inventory-slot-cosmic {
  position: relative; width: 100%; aspect-ratio: 1; border-radius: 16px;
  border: 1px solid rgba(251, 191, 36, 0.2); background: radial-gradient(circle at 50% 50%, rgba(10, 15, 30, 0.4), rgba(5, 5, 16, 0.95));
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
  box-shadow: 0 5px 12px rgba(0,0,0,0.34);
}

/* Hiệu ứng Trận pháp xoay dưới đáy item */
.magic-array-bg {
  position: absolute; inset: -10px; border-radius: 50%;
  border: 1px dashed rgba(251, 191, 36, 0.15);
  background-image: repeating-conic-gradient(rgba(251, 191, 36, 0.05) 0% 5%, transparent 5% 10%);
  pointer-events: none; opacity: 0; transition: opacity 0.2s ease, border-color 0.2s ease;
}
.inventory-slot-cosmic:hover:not(:disabled) .magic-array-bg { opacity: 1; border-color: rgba(251, 191, 36, 0.4); }

.inventory-slot-cosmic:hover:not(:disabled) {
  transform: translateY(-2px); border-color: rgba(251, 191, 36, 0.6);
  box-shadow: 0 9px 18px rgba(251, 191, 36, 0.14), inset 0 0 14px rgba(251, 191, 36, 0.07);
}
.inventory-slot-cosmic:disabled { opacity: 0.5; cursor: not-allowed; }

/* Rune viền */
.star-rune { position: absolute; width: 15px; height: 15px; border: 1px solid rgba(251, 191, 36, 0.3); transform: rotate(45deg); opacity: 0.3; transition: 0.3s; }
.inventory-slot-cosmic:hover .star-rune { opacity: 1; border-color: #fbbf24; transform: rotate(95deg) scale(1.08); }
.rune-a { top: 8px; left: 8px; } .rune-b { right: 8px; bottom: 8px; }

.slot-image { width: 75%; height: 75%; object-fit: contain; z-index: 2; transition: transform 0.2s ease; }
.inventory-slot-cosmic:hover:not(:disabled) .slot-image { transform: scale(1.035); }

.slot-fallback { font-size: 2rem; color: #94a3b8; z-index: 2; }

/* Trạng thái */
.slot-qty {
  position: absolute; top: 8px; right: 8px; border-radius: 6px;
  background: rgba(0, 0, 0, 0.8); border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fbbf24; padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 800; z-index: 3;
}

.slot-state-wrap { position: absolute; bottom: 8px; left: 0; width: 100%; text-align: center; z-index: 3; }
.slot-state { display: inline-block; padding: 0.25rem 0.8rem; border-radius: 50px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }

.equipped-text { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
.use-text { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4); opacity: 0; transition: 0.3s; transform: translateY(10px); }
.inventory-slot-cosmic:hover:not(:disabled) .use-text { opacity: 1; transform: translateY(0); }

.inventory-slot-cosmic.equipped { border-color: rgba(16, 185, 129, 0.6); box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.2); }
.slot-loading { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(5, 5, 16, 0.8); z-index: 10; }
.inventory-slot-cosmic.pulse { animation: divinePulse 0.8s ease-out; }

/* Grid Lệnh Bài */
.badge-grid-cosmic { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 1rem; margin-top: 1rem; }
.badge-slot-rune {
  position: relative; width: 100%; aspect-ratio: 1; border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(10, 15, 30, 0.6);
  display: grid; place-items: center; cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
  overflow: visible;
}

.badge-glow-bg {
  position: absolute; inset: 0; border-radius: 50%; background: var(--badge-color);
  opacity: 0; transition: opacity 0.2s ease; z-index: 0; pointer-events: none;
}
.badge-slot-rune:hover .badge-glow-bg, .badge-slot-rune.active .badge-glow-bg, .badge-slot-rune.equipped .badge-glow-bg { opacity: 0.16; }
.badge-slot-rune:hover, .badge-slot-rune.active, .badge-slot-rune.equipped { border-color: var(--badge-color); transform: scale(1.025); }

.badge-slot-rune.empty { opacity: 0.5; background: rgba(0,0,0,0.5); cursor: default; }
.badge-slot-rune.empty:hover { transform: none; border-color: rgba(255,255,255,0.1); }

.badge-loading { position: absolute; inset: 0; border-radius: 50%; display: grid; place-items: center; background: rgba(5, 5, 16, 0.8); z-index: 5; }

.badge-tip-gold {
  position: absolute; left: 50%; bottom: calc(100% + 15px); transform: translateX(-50%);
  background: rgba(10, 15, 30, 0.95); border: 1px solid #fbbf24; border-radius: 8px; color: #fff;
  padding: 0.5rem 0.8rem; text-align: center; white-space: nowrap; opacity: 0; pointer-events: none; font-size: 0.75rem;
  box-shadow: 0 5px 12px rgba(0,0,0,0.42); transition: opacity 0.2s ease, bottom 0.2s ease; z-index: 20;
}
.badge-tip-gold::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-width: 6px; border-style: solid; border-color: #fbbf24 transparent transparent transparent; }
.badge-tip-gold strong { display: block; color: #fbbf24; margin-bottom: 0.2rem; font-size: 0.85rem; }
.badge-slot-rune:hover .desktop-tip { opacity: 1; bottom: calc(100% + 10px); }

.badge-tip-mobile { position: absolute; left: 50%; bottom: -2rem; transform: translateX(-50%); font-size: 0.7rem; background: #fbbf24; color: #000; border-radius: 4px; padding: 0.2rem 0.5rem; white-space: nowrap; font-weight: 800; z-index: 20; }

@keyframes divinePulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 rgba(251, 191, 36, 0.4); } 50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(251, 191, 36, 0.6); } 100% { transform: scale(1); box-shadow: 0 0 0 transparent; } }

@media (prefers-reduced-motion: reduce) {
  .inventory-slot-cosmic,
  .magic-array-bg,
  .star-rune,
  .slot-image,
  .use-text,
  .badge-slot-rune,
  .badge-glow-bg,
  .badge-tip-gold,
  .inventory-slot-cosmic.pulse {
    animation: none !important;
    transition: none !important;
  }
}

@media (max-width: 768px) {
  .panel-header-divine { flex-direction: column; align-items: stretch; padding: 1rem; }
  .stat-badge-gold { text-align: left; }
  .inventory-grid-array { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.8rem; }
  .use-text { opacity: 1; transform: translateY(0); background: rgba(0,0,0,0.8); border: none; }
  .badge-grid-cosmic { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .desktop-tip { display: none; }
}
</style>
