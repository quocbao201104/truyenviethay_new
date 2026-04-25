<template>
  <div class="shop-container-divine">
    <div class="panel-header-cosmic">
      <div class="header-text">
        <div class="kicker-wrap">
          <i class="fas fa-bahai text-amber-400 text-xs animate-spin-slow"></i>
          <p class="kicker-gold">THIÊN ĐỊA TRÂN BẢO</p>
          <i class="fas fa-bahai text-amber-400 text-xs animate-spin-slow"></i>
        </div>
        <h2 class="majestic-title-gold">VẠN GIỚI THƯƠNG CÁC</h2>
      </div>

      <div class="currency-display-jade">
        <div class="currency-label">Linh Thạch Trữ Vị</div>
        <div class="currency-value-wrap">
          <i class="fas fa-gem gem-icon-float"></i>
          <strong class="gold-text-glow">{{ (userCurrency || 0).toLocaleString() }}</strong>
        </div>
      </div>
    </div>

    <div class="sub-tabs-array">
      <button
        v-for="zone in shopZones"
        :key="zone.id"
        class="sub-tab-rune"
        :class="{ active: activeShopZone === zone.id }"
        @click="$emit('change-zone', zone.id)"
      >
        <i class="fas" :class="zone.icon"></i>
        <span>{{ zone.label }}</span>
      </button>
    </div>

    <div v-if="!filteredShopItems || filteredShopItems.length === 0" class="empty-state-cosmic">Thương các hiện chưa nhập thêm pháp bảo.</div>

    <div v-else class="shop-grid-divine">
      <button
        v-for="item in filteredShopItems"
        :key="item.id"
        class="shop-slot-pedestal"
        :class="[item.css_class || '', { owned: item.isOwned }]"
        :disabled="item.isOwned"
        @click="$emit('buy', item)"
      >
        <div class="shop-slot-core">
          <div class="magic-glow-bg"></div>
          <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="shop-slot-image item-img" />
          <i v-else class="fas fa-sparkles shop-slot-fallback"></i>
        </div>

        <div class="shop-meta-info">
          <p class="shop-name">{{ item.name }}</p>
          <p class="shop-tag">{{ getItemTypeLabel(item.item_type) }}</p>
          <div class="price-tag-gold">
            <i class="fas fa-gem"></i> <span>{{ (item.price || 0).toLocaleString() }}</span>
          </div>
        </div>
        
        <div v-if="item.isOwned" class="owned-overlay">
          <span>ĐÃ SỞ HỮU</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ shopItems: Array, shopZones: Array, activeShopZone: String, filteredShopItems: Array, userCurrency: Number, getItemTypeLabel: Function });
defineEmits(['change-zone', 'buy']);
</script>

<style scoped>
.panel-header-cosmic {
  display: flex; justify-content: space-between; align-items: center; gap: 1.5rem;
  margin-bottom: 2rem; padding: 1.5rem;
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.1), transparent);
  border-radius: 20px; border-left: 4px solid #fbbf24;
}

.kicker-wrap { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.kicker-gold { margin: 0; font-size: 0.75rem; font-weight: 900; letter-spacing: 0.3em; color: #fbbf24; text-transform: uppercase; }
.animate-spin-slow { opacity: 0.8; }

.majestic-title-gold {
  margin: 0; font-size: 2rem; font-weight: 900; letter-spacing: 2px;
  background: linear-gradient(135deg, #fff 20%, #fbbf24 80%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.currency-display-jade {
  border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 16px;
  background: rgba(10, 15, 30, 0.8); padding: 0.8rem 1.5rem;
  box-shadow: inset 0 0 12px rgba(251, 191, 36, 0.06);
}
.currency-label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem; }
.currency-value-wrap { display: flex; align-items: center; gap: 0.8rem; }
.gem-icon-float { color: #fbbf24; font-size: 1.2rem; }
.gold-text-glow { color: #fbbf24; font-size: 1.6rem; font-weight: 900; }

.sub-tabs-array { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 2rem; }
.sub-tab-rune {
  border: 1px solid rgba(255,255,255,0.1); background: rgba(10, 15, 30, 0.6); color: #94a3b8;
  border-radius: 50px; padding: 0.6rem 1.5rem; font-size: 0.9rem; font-weight: 800; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.5rem;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}
.sub-tab-rune:hover { background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.4); color: #fbbf24; }
.sub-tab-rune.active { color: #050510; border-color: #fbbf24; background: linear-gradient(135deg, #fbbf24, #d97706); box-shadow: 0 7px 16px rgba(251, 191, 36, 0.16); }

.empty-state-cosmic { border: 1px dashed rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 2rem; color: #fbbf24; text-align: center; background: rgba(251, 191, 36, 0.05); }

.shop-grid-divine { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }

.shop-slot-pedestal {
  position: relative; border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 20px;
  background: linear-gradient(180deg, rgba(10, 15, 30, 0.2), rgba(10, 15, 30, 0.9));
  padding: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
  cursor: pointer; overflow: hidden;
}
.shop-slot-pedestal:hover:not(:disabled) { transform: translateY(-3px); border-color: #fbbf24; box-shadow: 0 10px 22px rgba(251, 191, 36, 0.14); }

.shop-slot-core {
  width: 100%; aspect-ratio: 1; border-radius: 16px; position: relative;
  display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;
}
.magic-glow-bg { position: absolute; inset: 0; background: radial-gradient(circle, rgba(251, 191, 36, 0.2), transparent 70%); border-radius: 50%; }
.shop-slot-image { width: 85%; height: 85%; object-fit: contain; z-index: 2; transition: transform 0.2s ease; }
.shop-slot-pedestal:hover:not(:disabled) .shop-slot-image { transform: scale(1.035); }

.shop-meta-info { text-align: center; }
.shop-name { margin: 0; font-size: 1rem; font-weight: 800; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.shop-tag { margin: 0.3rem 0; font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
.price-tag-gold { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; background: rgba(251, 191, 36, 0.15); padding: 0.4rem 1rem; border-radius: 50px; color: #fbbf24; font-weight: 900; font-size: 1.1rem; border: 1px solid rgba(251, 191, 36, 0.3); }

.shop-slot-pedestal.owned { opacity: 0.6; cursor: not-allowed; }
.owned-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10; }
.owned-overlay span { border: 2px solid #ef4444; color: #ef4444; font-weight: 900; padding: 0.5rem 1rem; transform: rotate(-15deg); letter-spacing: 2px; }

@media (prefers-reduced-motion: reduce) {
  .animate-spin-slow,
  .sub-tab-rune,
  .shop-slot-pedestal,
  .shop-slot-image {
    animation: none !important;
    transition: none !important;
  }
}

@media (max-width: 768px) {
  .panel-header-cosmic { flex-direction: column; align-items: stretch; }
  .currency-display-jade { text-align: center; }
  .currency-value-wrap { justify-content: center; }
  .shop-grid-divine { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
  .shop-slot-pedestal { padding: 0.8rem; }
}
</style>
