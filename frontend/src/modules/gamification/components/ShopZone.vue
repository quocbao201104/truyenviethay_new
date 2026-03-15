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
.animate-spin-slow { animation: spin 4s linear infinite; }

.majestic-title-gold {
  margin: 0; font-size: 2rem; font-weight: 900; letter-spacing: 2px;
  background: linear-gradient(135deg, #fff 20%, #fbbf24 80%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.4));
}

.currency-display-jade {
  border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 16px;
  background: rgba(10, 15, 30, 0.8); padding: 0.8rem 1.5rem;
  box-shadow: inset 0 0 20px rgba(251, 191, 36, 0.1);
}
.currency-label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.3rem; }
.currency-value-wrap { display: flex; align-items: center; gap: 0.8rem; }
.gem-icon-float { color: #fbbf24; font-size: 1.2rem; animation: float 3s ease-in-out infinite; }
.gold-text-glow { color: #fbbf24; font-size: 1.6rem; font-weight: 900; text-shadow: 0 0 15px rgba(251, 191, 36, 0.6); }

.sub-tabs-array { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 2rem; }
.sub-tab-rune {
  border: 1px solid rgba(255,255,255,0.1); background: rgba(10, 15, 30, 0.6); color: #94a3b8;
  border-radius: 50px; padding: 0.6rem 1.5rem; font-size: 0.9rem; font-weight: 800; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.3s;
}
.sub-tab-rune:hover { background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.4); color: #fbbf24; }
.sub-tab-rune.active { color: #050510; border-color: #fbbf24; background: linear-gradient(135deg, #fbbf24, #d97706); box-shadow: 0 0 15px rgba(251, 191, 36, 0.4); }

.empty-state-cosmic { border: 1px dashed rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 2rem; color: #fbbf24; text-align: center; background: rgba(251, 191, 36, 0.05); }

.shop-grid-divine { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }

.shop-slot-pedestal {
  position: relative; border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 20px;
  background: linear-gradient(180deg, rgba(10, 15, 30, 0.2), rgba(10, 15, 30, 0.9));
  padding: 1rem; transition: all 0.3s; cursor: pointer; overflow: hidden;
}
.shop-slot-pedestal:hover:not(:disabled) { transform: translateY(-5px); border-color: #fbbf24; box-shadow: 0 10px 25px rgba(251, 191, 36, 0.2); }

.shop-slot-core {
  width: 100%; aspect-ratio: 1; border-radius: 16px; position: relative;
  display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;
}
.magic-glow-bg { position: absolute; inset: 0; background: radial-gradient(circle, rgba(251, 191, 36, 0.2), transparent 70%); border-radius: 50%; }
.shop-slot-image { width: 85%; height: 85%; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.8)); z-index: 2; transition: transform 0.3s; }
.shop-slot-pedestal:hover:not(:disabled) .shop-slot-image { transform: scale(1.1); }

.shop-meta-info { text-align: center; }
.shop-name { margin: 0; font-size: 1rem; font-weight: 800; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.shop-tag { margin: 0.3rem 0; font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
.price-tag-gold { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; background: rgba(251, 191, 36, 0.15); padding: 0.4rem 1rem; border-radius: 50px; color: #fbbf24; font-weight: 900; font-size: 1.1rem; border: 1px solid rgba(251, 191, 36, 0.3); }

.shop-slot-pedestal.owned { opacity: 0.6; filter: grayscale(40%); cursor: not-allowed; }
.owned-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10; }
.owned-overlay span { border: 2px solid #ef4444; color: #ef4444; font-weight: 900; padding: 0.5rem 1rem; transform: rotate(-15deg); letter-spacing: 2px; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

@media (max-width: 768px) {
  .panel-header-cosmic { flex-direction: column; align-items: stretch; }
  .currency-display-jade { text-align: center; }
  .currency-value-wrap { justify-content: center; }
  .shop-grid-divine { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
  .shop-slot-pedestal { padding: 0.8rem; }
}
</style>