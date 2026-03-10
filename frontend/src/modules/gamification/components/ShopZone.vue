<template>
  <div class="shop-container">
    <div class="panel-header">
      <div class="header-text">
        <div class="kicker-wrap">
          <i class="fas fa-scroll-old opacity-40 text-xs"></i>
          <p class="kicker">THIÊN ĐỊA TRÂN BẢO</p>
          <i class="fas fa-scroll-old opacity-40 text-xs"></i>
        </div>
        <h2 class="majestic-title">VẠN BẢO CÁC</h2>
      </div>

      <div class="currency-display">
        <div class="currency-label">Linh Thạch Hiện Có</div>
        <div class="currency-value-wrap">
          <i class="fas fa-gem gem-icon-rotate"></i>
          <strong class="gold-text">{{ (userCurrency || 0).toLocaleString() }}</strong>
        </div>
        <div class="currency-glow"></div>
      </div>
    </div>

    <div class="sub-tabs">
      <button
        v-for="zone in shopZones"
        :key="zone.id"
        class="sub-tab-btn"
        :class="{ active: activeShopZone === zone.id }"
        @click="$emit('change-zone', zone.id)"
      >
        <i class="fas" :class="zone.icon"></i>
        <span>{{ zone.label }}</span>
      </button>
    </div>

    <div v-if="!filteredShopItems || filteredShopItems.length === 0" class="empty-state">Khu nay dang trong.</div>

    <div v-else class="shop-grid">
      <button
        v-for="item in filteredShopItems"
        :key="item.id"
        class="shop-slot"
        :class="[item.css_class || '', { owned: item.isOwned }]"
        :disabled="item.isOwned"
        @click="$emit('buy', item)"
      >
        <div class="shop-slot-core">
          <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="shop-slot-image item-img" />
          <i v-else class="fas fa-sparkles shop-slot-fallback"></i>
        </div>

        <div class="shop-meta">
          <p class="shop-name">{{ item.name }}</p>
          <p class="shop-tag">{{ getItemTypeLabel(item.item_type) }}</p>
          <p class="shop-price"><i class="fas fa-gem"></i> {{ (item.price || 0).toLocaleString() }}</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  shopItems: Array,
  shopZones: Array,
  activeShopZone: String,
  filteredShopItems: Array,
  userCurrency: Number,
  getItemTypeLabel: Function,
});

defineEmits(['change-zone', 'buy']);
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
  border-left: 4px solid #fbbf24;
}

.kicker-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.kicker {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  color: #94a3b8;
  text-transform: uppercase;
}

.majestic-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #fff 30%, #fbbf24 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  letter-spacing: 1px;
}

.currency-display {
  position: relative;
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  padding: 0.6rem 1.2rem;
  min-width: 180px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.currency-display:hover {
  border-color: rgba(251, 191, 36, 0.6);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.15);
}

.currency-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.2rem;
}

.currency-value-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.gem-icon-rotate {
  color: #fbbf24;
  font-size: 1.1rem;
  animation: gem-float 3s ease-in-out infinite;
}

@keyframes gem-float {
  0% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-3px) rotate(15deg); }
  100% { transform: translateY(0) rotate(0); }
}

.gold-text {
  color: #fbbf24;
  font-size: 1.4rem;
  font-weight: 800;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
}

.currency-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.sub-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.52rem;
  margin-bottom: 1rem;
}

.sub-tab-btn {
  border: 1px solid rgba(125, 211, 252, 0.2);
  background: rgba(7, 16, 33, 0.52);
  color: #93a7c2;
  border-radius: 999px;
  padding: 0.42rem 0.78rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.sub-tab-btn.active {
  color: #dbf8ff;
  border-color: rgba(45, 212, 191, 0.6);
  background: rgba(20, 184, 166, 0.16);
}

.empty-state {
  border: 1px dashed rgba(148, 163, 184, 0.3);
  border-radius: 13px;
  padding: 1rem;
  color: #9cb0ca;
  text-align: center;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 0.8rem;
}

.shop-slot {
  border: 1px solid rgba(45, 212, 191, 0.28);
  border-radius: 15px;
  background: radial-gradient(circle at 50% 10%, rgba(20, 184, 166, 0.1), rgba(7, 12, 24, 0.88));
  padding: 0.66rem;
  transition: all 0.22s ease;
  cursor: pointer;
}

.shop-slot:hover {
  transform: translateY(-2px);
  border-color: rgba(45, 212, 191, 0.58);
  box-shadow: 0 0 22px rgba(45, 212, 191, 0.2);
}

.shop-slot:disabled,
.shop-slot.owned {
  opacity: 0.62;
  cursor: not-allowed;
}

.shop-slot-core {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  border: 1px solid rgba(45, 212, 191, 0.35);
  background: radial-gradient(circle, rgba(45, 212, 191, 0.12), rgba(6, 10, 22, 0.93));
  display: flex;
  align-items: center;
  justify-content: center;
}

.shop-slot-image {
  width: 92%;
  height: 92%;
  object-fit: contain;
  filter: drop-shadow(0 9px 12px rgba(0, 0, 0, 0.55));
}

.shop-slot-fallback {
  color: #94a3b8;
  font-size: 1.5rem;
}

.shop-meta {
  margin-top: 0.58rem;
  text-align: center;
}

.shop-name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #dbefff;
}

.shop-tag {
  margin: 0.22rem 0 0;
  font-size: 0.72rem;
  color: #8da5c1;
}

.shop-price {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: #fbbf24;
}

@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .currency-display {
    min-width: 0;
    text-align: left;
  }

  .sub-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .sub-tab-btn {
    justify-content: center;
    padding-inline: 0.4rem;
    font-size: 0.74rem;
  }

  .shop-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.56rem;
  }

  .shop-slot {
    padding: 0.42rem;
    border-radius: 12px;
  }

  .shop-slot-core {
    border-radius: 10px;
  }

  .shop-meta {
    display: none;
  }
}
</style>
