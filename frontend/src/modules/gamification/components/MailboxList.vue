<template>
  <div v-if="!mailbox || mailbox.length === 0" class="empty-state-cosmic">
    <i class="fas fa-dove opacity-30 text-5xl mb-4"></i>
    <p>Bầu trời tĩnh lặng, chưa có Phi Kiếm Truyền Thư nào gửi đến đạo hữu.</p>
  </div>
  
  <div v-else class="list-layout-divine">
    <article 
      v-for="mail in mailbox" 
      :key="mail.id" 
      class="list-card-cosmic" 
      :class="{ 'is-read': mail.status === 'read', 'is-claimed': mail.is_claimed }"
    >
      <div class="card-content-aura">
        <p class="kicker-gold">
          <i class="fas fa-feather-pointed mr-1"></i> {{ getSourceLabel(mail.mail_type) }}
        </p>
        <h3 class="card-title-divine">{{ mail.subject }}</h3>
        <p class="card-desc-spirit">{{ mail.body || 'Bí mật thiên cơ, hãy dùng thần thức để lĩnh ngộ.' }}</p>
        
        <div v-if="mail.attachments && mail.attachments.length > 0" class="attachments-preview-array">
           <span v-for="att in mail.attachments" :key="att.id" class="att-badge-gem">
             <i class="fas fa-gem opacity-70 mr-1"></i> 
             {{ att.reward_name || 'Kỳ Trân Thượng Cổ' }} 
             <span class="qty-highlight">x{{ att.quantity }}</span>
           </span>
        </div>
      </div>

      <div class="card-actions-array">
        <button 
          v-if="mail.is_claimable"
          class="claim-btn-divine" 
          :disabled="processingId === mail.id || mail.is_claimed" 
          @click="$emit('claim', mail.id)"
        >
          <i v-if="processingId === mail.id" class="fas fa-yin-yang fa-spin"></i>
          <template v-else>{{ mail.is_claimed ? 'Đã Thu Nhận' : 'Nhận Lễ Vật' }}</template>
        </button>
        
        <span v-else class="status-badge-rune">
          <i class="fas fa-check-double mr-1" v-if="mail.is_claimed"></i>
          {{ mail.is_claimed ? 'Đã thu thập' : 'Đã hội kiến' }}
        </span>
      </div>
    </article>
  </div>
</template>

<script setup>
defineProps({
  mailbox: Array,
  processingId: [Number, String]
});

defineEmits(['claim']);

const getSourceLabel = (type) => {
  const labels = {
    reward: 'Thiên Đạo Ban Thưởng',
    announcement: 'Tông Môn Truyền Âm',
    compensation: 'Thiên Đạo Bồi Hoàn',
    system: 'Hệ Thống Trận Pháp',
  };
  return labels[type] || 'Phi Kiếm Truyền Thư';
};
</script>

<style scoped>
.empty-state-cosmic {
  padding: 4rem 2rem;
  border-radius: 20px;
  border: 1px dashed rgba(251, 191, 36, 0.3);
  text-align: center;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.05);
  box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
}

.list-layout-divine { 
  display: flex; 
  flex-direction: column; 
  gap: 1.2rem; 
}

.list-card-cosmic {
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  gap: 1.5rem;
  background: rgba(10, 15, 30, 0.8);
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 1.5rem 1.8rem;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 20px rgba(0,0,0,0.4), inset 0 0 15px rgba(251, 191, 36, 0.05);
}

.list-card-cosmic:hover { 
  border-color: rgba(251, 191, 36, 0.8); 
  background: rgba(15, 20, 40, 0.9);
  transform: translateX(5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.6), inset 0 0 25px rgba(251, 191, 36, 0.1); 
}

/* Thư đã đọc */
.list-card-cosmic.is-read { 
  border-color: rgba(255,255,255,0.1); 
  background: rgba(10, 15, 30, 0.4); 
  box-shadow: none; 
}

/* Thư đã nhận quà */
.list-card-cosmic.is-claimed { 
  opacity: 0.6; 
  filter: grayscale(40%); 
}

.card-content-aura { flex: 1; }

.kicker-gold {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.card-title-divine { 
  font-size: 1.25rem; 
  color: #fff; 
  margin: 0; 
  font-weight: 900;
  text-shadow: 0 2px 5px rgba(0,0,0,0.8);
}

.card-desc-spirit { 
  font-size: 0.95rem; 
  color: #94a3b8; 
  margin: 0.5rem 0 0; 
  line-height: 1.6; 
}

.attachments-preview-array {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1rem;
}

.att-badge-gem {
  background: rgba(251, 191, 36, 0.1);
  color: #fef3c7;
  border: 1px solid rgba(251, 191, 36, 0.4);
  padding: 0.35rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
}

.qty-highlight {
  color: #fbbf24;
  font-weight: 900;
  margin-left: 6px;
}

.card-actions-array { 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
  min-width: 160px; 
  justify-content: flex-end; 
}

.claim-btn-divine {
  border: 1px solid #fef3c7; 
  border-radius: 50px;
  font-weight: 900; 
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  gap: 0.5rem;
  padding: 0.85rem 1.6rem;
  background: linear-gradient(135deg, #fbbf24, #d97706); 
  color: #050510;
  box-shadow: 0 5px 15px rgba(251, 191, 36, 0.3);
}

.claim-btn-divine:hover:not(:disabled) { 
  box-shadow: 0 0 25px rgba(251, 191, 36, 0.6); 
  transform: translateY(-2px) scale(1.05); 
}

.claim-btn-divine:disabled { 
  opacity: 0.6; 
  cursor: not-allowed; 
  filter: grayscale(50%);
  box-shadow: none;
}

.status-badge-rune {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  font-style: italic;
}

@media (max-width: 768px) {
  .list-card-cosmic { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 1.2rem; 
    padding: 1.2rem;
  }
  .card-actions-array { 
    width: 100%; 
    justify-content: flex-start; 
  }
  .claim-btn-divine {
    width: 100%;
  }
}
</style>