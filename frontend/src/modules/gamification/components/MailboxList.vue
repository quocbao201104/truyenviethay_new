<template>
  <div v-if="!mailbox || mailbox.length === 0" class="empty-state">Chưa có cơ duyên mới trong hộp thư.</div>
  <div v-else class="list-layout">
    <article v-for="mail in mailbox" :key="mail.id" class="list-card" :class="{ 'is-read': mail.status === 'read', 'is-claimed': mail.is_claimed }">
      <div class="card-content">
        <p class="kicker">{{ getSourceLabel(mail.mail_type) }}</p>
        <h3 class="card-title">{{ mail.subject }}</h3>
        <p class="card-desc">{{ mail.body || 'Có duyên đang chờ đạo hữu lĩnh ngộ.' }}</p>
        <div v-if="mail.attachments && mail.attachments.length > 0" class="attachments-preview">
           <span v-for="att in mail.attachments" :key="att.id" class="att-badge">
             {{ att.reward_name || 'Vật phẩm' }} x{{ att.quantity }}
           </span>
        </div>
      </div>
      <div class="card-actions row">
        <button 
          v-if="mail.is_claimable"
          class="game-btn primary" 
          :disabled="processingId === mail.id || mail.is_claimed" 
          @click="$emit('claim', mail.id)"
        >
          <i v-if="processingId === mail.id" class="fas fa-spinner fa-spin"></i>
          <template v-else>{{ mail.is_claimed ? 'Đã Nhận' : 'Lĩnh Thưởng' }}</template>
        </button>
        <span v-else class="status-badge">{{ mail.is_claimed ? 'Hoàn tất' : 'Đã Xem' }}</span>
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
    announcement: 'Truyền Tin',
    compensation: 'Bồi Hoàn',
    system: 'Hệ Thống',
  };
  return labels[type] || 'Hệ Thống';
};
</script>

<style scoped>
.empty-state {
  padding: 3rem;
  border-radius: 16px;
  border: 1px dashed rgba(100, 116, 139, 0.4);
  text-align: center;
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.2);
}

.list-layout { display: flex; flex-direction: column; gap: 1rem; }

.list-card {
  display: flex; justify-content: space-between; align-items: center; gap: 1.5rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255,255,255,0.05);
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  transition: all 0.2s;
}

.list-card:hover { border-color: rgba(255,255,255,0.1); background: rgba(51, 65, 85, 0.4); }

.card-title { font-size: 1.15rem; color: #fff; margin: 0; }
.card-desc { font-size: 0.9rem; color: #94a3b8; margin: 0.25rem 0 0; line-height: 1.5; }

.kicker {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #22d3ee;
  margin-bottom: 0.25rem;
}

.attachments-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.att-badge {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.list-card.is-claimed {
  opacity: 0.7;
}

.status-badge {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 600;
}

.card-actions { display: flex; align-items: center; gap: 1rem; min-width: 150px; justify-content: flex-end; }

.game-btn {
  border: none; border-radius: 99px;
  font-weight: 600; cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.75rem 1.25rem;
}

.game-btn.primary { background: #22d3ee; color: #020617; }
.game-btn.primary:hover:not(:disabled) { box-shadow: 0 0 15px rgba(34, 211, 238, 0.5); transform: translateY(-1px); }
.game-btn:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
  .list-card { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .card-actions { width: 100%; justify-content: space-between; min-width: auto; }
}
</style>
