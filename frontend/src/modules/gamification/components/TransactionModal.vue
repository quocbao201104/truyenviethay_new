<template>
  <BaseModal :isOpen="isOpen" title="THIÊN ĐỊA KHẾ ƯỚC" @close="handleClose">
    <div v-if="item" class="modal-buy-cosmic">
      
      <div class="modal-item-preview-array">
        <div class="item-icon-shrine large">
          <div class="shrine-glow"></div>
          <img v-if="item.image_url" :src="item.image_url" :alt="item.name" />
        </div>
        <div class="modal-item-info">
          <span class="game-tag-rune">{{ getItemTypeLabel(item.item_type) }}</span>
          <h3 class="magic-item-name">{{ item.name }}</h3>
          <p class="magic-item-desc">{{ item.description || 'Vật phẩm chứa đựng thiên cơ, đang chờ người hữu duyên.' }}</p>
        </div>
      </div>

      <div v-if="item.item_type === 'consumable'" class="qty-row-divine">
        <span class="qty-label">Số lượng luyện hóa</span>
        <div class="qty-controls">
          <button class="qty-btn-rune" @click="dec" :disabled="localQty <= 1">−</button>
          <span class="qty-value-gold">{{ localQty }}</span>
          <button class="qty-btn-rune" @click="inc" :disabled="localQty >= 99">+</button>
        </div>
      </div>
      
      <div class="transaction-details-jade">
        <div class="detail-box-crystal">
          <span class="label">Hao tổn linh thạch</span>
          <span class="value price">{{ (item.price || 0).toLocaleString() }} <i class="fas fa-gem text-amber-400"></i></span>
        </div>
        <div class="detail-box-crystal" v-if="item.item_type === 'consumable' && localQty > 1">
          <span class="label">Tổng linh thạch (x{{ localQty }})</span>
          <span class="value price total">{{ ((item.price || 0) * localQty).toLocaleString() }} <i class="fas fa-gem text-amber-400"></i></span>
        </div>
        <div class="detail-box-crystal">
          <span class="label">Linh thạch trữ vị</span>
          <span class="value wallet">{{ (userCurrency || 0).toLocaleString() }} <i class="fas fa-gem text-amber-400"></i></span>
        </div>
        <div class="detail-box-crystal">
          <span class="label">Kết dư sau khế ước</span>
          <span class="value" :class="remaining < 0 ? 'insufficient-blood' : 'wallet-safe'">
            {{ remaining.toLocaleString() }} <i class="fas fa-gem text-amber-400"></i>
          </span>
        </div>
      </div>

      <div class="modal-actions-array">
        <button class="game-btn-rune ghost" @click="handleClose">Hủy Khế Ước</button>
        <button class="game-btn-rune primary" :disabled="processing || remaining < 0" @click="$emit('confirm', localQty)">
          <i v-if="processing" class="fas fa-yin-yang fa-spin"></i>
          <template v-else>Kết Ấn Giao Dịch{{ localQty > 1 ? ` (x${localQty})` : '' }}</template>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';

const props = defineProps({ isOpen: Boolean, item: Object, userCurrency: Number, processing: Boolean, getItemTypeLabel: Function });
const emit = defineEmits(['close', 'confirm']);

const localQty = ref(1);

watch(() => props.isOpen, (open) => { if (open) localQty.value = 1; });

const inc = () => { if (localQty.value < 99) localQty.value++; };
const dec = () => { if (localQty.value > 1) localQty.value--; };

const remaining = computed(() => {
  if (!props.item) return 0;
  return (props.userCurrency || 0) - (props.item.price || 0) * localQty.value;
});

const handleClose = () => { localQty.value = 1; emit('close'); };
</script>

<style scoped>
.modal-buy-cosmic { display: flex; flex-direction: column; gap: 1.5rem; }

.modal-item-preview-array { display: flex; align-items: center; gap: 1.5rem; padding: 1rem; background: rgba(10, 15, 30, 0.4); border-radius: 16px; border: 1px dashed rgba(251, 191, 36, 0.2); }

.item-icon-shrine {
  width: 80px; height: 80px; background: radial-gradient(circle, rgba(251, 191, 36, 0.1), #050510);
  border-radius: 16px; border: 1px solid rgba(251, 191, 36, 0.4);
  display: flex; align-items: center; justify-content: center; position: relative;
  box-shadow: inset 0 0 12px rgba(251, 191, 36, 0.06), 0 5px 12px rgba(0,0,0,0.34);
}
.item-icon-shrine.large { width: 110px; height: 110px; border-radius: 20px; flex-shrink: 0; }
.item-icon-shrine img { width: 85%; height: 85%; object-fit: contain; z-index: 2; }
.shrine-glow { position: absolute; inset: 0; background: radial-gradient(circle, rgba(251, 191, 36, 0.18), transparent); border-radius: inherit; z-index: 1; }

.modal-item-info { flex: 1; }
.magic-item-name { margin: 0; color: #fff; font-size: 1.5rem; font-weight: 900; }
.magic-item-desc { color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem; line-height: 1.5; }

.game-tag-rune {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 0.3rem 0.6rem; border-radius: 6px; border: 1px solid rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.1); color: #fbbf24; margin-bottom: 0.6rem; display: inline-block;
}

/* Bảng Chi Tiết Giao Dịch */
.transaction-details-jade { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: rgba(5, 5, 16, 0.8); padding: 1.2rem; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05); }
.detail-box-crystal { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.5rem; background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
.detail-box-crystal .label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
.detail-box-crystal .value { font-size: 1.3rem; font-weight: 900; display: flex; align-items: center; gap: 0.4rem; }
.detail-box-crystal .price { color: #fff; }
.detail-box-crystal .total { color: #fbbf24; }
.detail-box-crystal .wallet { color: #34d399; }
.detail-box-crystal .wallet-safe { color: #34d399; }
.detail-box-crystal .insufficient-blood { color: #ef4444; }

/* Điều chỉnh số lượng */
.qty-row-divine { display: flex; align-items: center; justify-content: space-between; background: rgba(10, 15, 30, 0.6); border: 1px solid rgba(251, 191, 36, 0.2); padding: 1rem 1.2rem; border-radius: 16px; }
.qty-label { font-size: 0.9rem; color: #fbbf24; font-weight: 800; text-transform: uppercase; }
.qty-controls { display: flex; align-items: center; gap: 1.5rem; }
.qty-btn-rune {
  width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(251, 191, 36, 0.4); background: rgba(251, 191, 36, 0.1); color: #fbbf24;
  font-size: 1.2rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}
.qty-btn-rune:hover:not(:disabled) { background: #fbbf24; color: #050510; transform: scale(1.04); }
.qty-btn-rune:disabled { opacity: 0.3; cursor: not-allowed; border-color: rgba(255,255,255,0.1); color: #64748b; background: transparent; box-shadow: none; }
.qty-value-gold { font-size: 1.6rem; font-weight: 900; color: #fff; min-width: 3rem; text-align: center; }

/* Nút Action */
.modal-actions-array { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }

.game-btn-rune {
  border: none; border-radius: 50px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.9rem 1.8rem;
}
.game-btn-rune.primary { background: linear-gradient(135deg, #fbbf24, #d97706); color: #050510; box-shadow: 0 7px 16px rgba(251, 191, 36, 0.16); border: 1px solid #fef3c7; }
.game-btn-rune.primary:hover:not(:disabled) { box-shadow: 0 9px 20px rgba(251, 191, 36, 0.24); transform: translateY(-2px); }
.game-btn-rune.ghost { background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.game-btn-rune.ghost:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.4); }
.game-btn-rune:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

@media (prefers-reduced-motion: reduce) {
  .qty-btn-rune,
  .game-btn-rune {
    transition: none !important;
  }
}

@media (max-width: 480px) {
  .modal-item-preview-array { flex-direction: column; text-align: center; }
  .item-icon-shrine.large { margin-bottom: 0.5rem; }
  .transaction-details-jade { grid-template-columns: 1fr; }
  .modal-actions-array { flex-direction: column-reverse; }
  .game-btn-rune { width: 100%; }
}
</style>
