<template>
  <BaseModal :isOpen="isOpen" title="XÁC NHẬN GIAO DỊCH" @close="$emit('close')">
    <div v-if="item" class="modal-buy-content">
      <div class="modal-item-preview">
        <div class="item-icon-box large">
          <img v-if="item.image_url" :src="item.image_url" :alt="item.name" />
        </div>
        <div class="modal-item-info">
          <span class="game-tag">{{ getItemTypeLabel(item.item_type) }}</span>
          <h3>{{ item.name }}</h3>
          <p>{{ item.description || 'Vật phẩm này đang chờ đạo hữu kết duyên.' }}</p>
        </div>
      </div>
      
      <div class="transaction-details">
        <div class="detail-box">
          <span class="label">Giá mua</span>
          <span class="value price">{{ (item.price || 0).toLocaleString() }} <i class="fas fa-gem"></i></span>
        </div>
        <div class="detail-box">
          <span class="label">Số dư hiện tại</span>
          <span class="value wallet">{{ (userCurrency || 0).toLocaleString() }} <i class="fas fa-gem"></i></span>
        </div>
      </div>

      <div class="modal-actions">
        <button class="game-btn ghost" @click="$emit('close')">Hủy bỏ</button>
        <button class="game-btn primary" :disabled="processing" @click="$emit('confirm')">
          <i v-if="processing" class="fas fa-spinner fa-spin"></i>
          <template v-else>Xác Nhận Mua</template>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/common/BaseModal.vue';

defineProps({
  isOpen: Boolean,
  item: Object,
  userCurrency: Number,
  processing: Boolean,
  getItemTypeLabel: Function
});

defineEmits(['close', 'confirm']);
</script>

<style scoped>
.modal-buy-content { display: flex; flex-direction: column; gap: 1.5rem; }
.modal-item-preview { display: flex; align-items: center; gap: 1rem; }

.item-icon-box {
  width: 80px; height: 80px;
  background: #020617;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
}
.item-icon-box.large { width: 120px; height: 120px; border-radius: 16px; margin-right: 1.5rem; }
.item-icon-box img { width: 100%; height: 100%; object-fit: contain; z-index: 1; filter: drop-shadow(0 4px 5px rgba(0,0,0,0.5)); }

.modal-item-info { flex: 1; }
.modal-item-info h3 { margin: 0; color: #fff; font-size: 1.4rem; }
.modal-item-info p { color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem; line-height: 1.5; }

.game-tag {
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem; border-radius: 6px;
  background: rgba(255,255,255,0.1); color: #94a3b8;
  margin-bottom: 0.5rem; display: inline-block;
}

.transaction-details { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 12px; }
.detail-box { display: flex; flex-direction: column; gap: 0.25rem; }
.detail-box .label { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; }
.detail-box .value { font-size: 1.25rem; font-weight: 700; }
.detail-box .price { color: #fff; }
.detail-box .wallet { color: #fbbf24; }

.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }

.game-btn {
  border: none; border-radius: 99px;
  font-weight: 600; cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.75rem 1.5rem;
}
.game-btn.primary { background: #22d3ee; color: #020617; }
.game-btn.primary:hover:not(:disabled) { box-shadow: 0 0 15px rgba(34, 211, 238, 0.5); transform: translateY(-1px); }
.game-btn.ghost { background: transparent; color: #94a3b8; }
.game-btn.ghost:hover { background: rgba(255,255,255,0.05); color: #fff; }
.game-btn:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 480px) {
  .modal-item-preview { flex-direction: column; text-align: center; }
  .item-icon-box.large { margin-right: 0; margin-bottom: 1rem; }
  .transaction-details { grid-template-columns: 1fr; }
}
</style>
