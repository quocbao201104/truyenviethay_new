<template>
  <div v-if="loading" class="empty-state-cosmic">
    <i class="fas fa-yin-yang fa-spin text-3xl mb-3 text-amber-400"></i>
    <p>Đang cảm ứng Thiên Cơ...</p>
  </div>
  <div v-else-if="!tasks || tasks.length === 0" class="empty-state-cosmic">
    <i class="fas fa-scroll opacity-20 text-4xl mb-3"></i>
    <p>Tông môn hiện chưa ban bố lịch luyện mới.</p>
  </div>
  <div v-else class="list-layout-divine">
    <article
      v-for="task in orderedTasks"
      :key="task.task_id"
      class="list-card-cosmic"
      :class="{
        'is-completed': task.status === 'claimed',
        'is-claimable': task.status === 'completed',
      }"
    >
      <div class="card-content">
        <p class="kicker-gold">LỊCH LUYỆN</p>
        <h3 class="card-title-divine">{{ task.task_name || task.title }}</h3>
        <p class="card-desc-aura">{{ task.description }}</p>
        <div v-if="task.progress_target && task.progress_target > 1" class="progress-bar-wrap">
          <div class="progress-info">
            <span>Tiến trình giác ngộ</span>
            <span>{{ task.progress_current || 0 }} / {{ task.progress_target }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${((task.progress_current || 0) / task.progress_target) * 100}%` }"></div>
          </div>
        </div>
      </div>
      <div class="card-actions-array">
        <span class="reward-text-gold">+{{ (task.points_awarded || 0).toLocaleString() }} Tu Vi</span>

        <button
          v-if="task.status === 'completed'"
          class="claim-btn-divine"
          :disabled="processingTaskId === task.task_id"
          @click="$emit('claim', task.task_id)"
        >
          <i v-if="processingTaskId === task.task_id" class="fas fa-spinner fa-spin"></i>
          <template v-else>Nhận Đạo Quả</template>
        </button>

        <span v-else class="status-tag-rune" :class="task.status || 'pending'">
          {{ getStatusLabel(task.status) }}
        </span>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ tasks: Array, loading: Boolean, processingTaskId: [Number, String, null] });
defineEmits(['claim']);

const orderedTasks = computed(() => {
  const safeTasks = props.tasks || [];
  const rank = { completed: 0, in_progress: 1, pending: 2, claimed: 3, expired: 4, null: 5 };
  return [...safeTasks].sort((a, b) => (rank[a?.status ?? 'null'] ?? 99) - (rank[b?.status ?? 'null'] ?? 99));
});

const getStatusLabel = (status) => {
  if (status === 'claimed') return 'Đã lĩnh ngộ';
  if (status === 'in_progress') return 'Đang tiến hành';
  if (status === 'expired') return 'Đã tiêu tán';
  return 'Chưa đạt thành';
};
</script>

<style scoped>
.empty-state-cosmic { padding: 3rem; border-radius: 16px; border: 1px dashed rgba(251, 191, 36, 0.3); text-align: center; color: #fbbf24; background: rgba(251, 191, 36, 0.05); }
.list-layout-divine { display: flex; flex-direction: column; gap: 1.2rem; }

.list-card-cosmic {
  display: flex; justify-content: space-between; align-items: center; gap: 1.5rem;
  background: rgba(10, 15, 30, 0.6); border: 1px solid rgba(255,255,255,0.05);
  padding: 1.5rem; border-radius: 20px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.list-card-cosmic:hover { border-color: rgba(251, 191, 36, 0.2); background: rgba(15, 20, 40, 0.8); transform: translateX(2px); }
.list-card-cosmic.is-completed { opacity: 0.56; }
.list-card-cosmic.is-claimable {
  border-color: rgba(251, 191, 36, 0.6);
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.1), rgba(10, 15, 30, 0.8));
  box-shadow: inset 0 0 10px rgba(251, 191, 36, 0.08);
}

.kicker-gold { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: #fbbf24; margin-bottom: 0.5rem; }
.card-title-divine { font-size: 1.2rem; font-weight: 800; color: #fff; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.card-desc-aura { font-size: 0.9rem; color: #94a3b8; margin: 0.4rem 0 1rem; line-height: 1.5; }

.progress-bar-wrap { width: 100%; max-width: 300px; }
.progress-info { display: flex; justify-content: space-between; font-size: 0.8rem; color: #fbbf24; font-weight: 700; margin-bottom: 0.3rem; }
.progress-track { height: 6px; background: rgba(0,0,0,0.5); border-radius: 10px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.2); }
.progress-fill { height: 100%; background: linear-gradient(90deg, #d97706, #fbbf24); transition: width 0.35s ease; }

.card-actions-array { display: flex; flex-direction: column; align-items: flex-end; gap: 0.8rem; min-width: 150px; }
.reward-text-gold { color: #fbbf24; font-weight: 900; font-size: 1.1rem; text-shadow: 0 0 10px rgba(251, 191, 36, 0.4); }

.status-tag-rune, .claim-btn-divine { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.6rem 1.2rem; border-radius: 8px; }
.status-tag-rune { background: rgba(255,255,255,0.05); color: #64748b; border: 1px solid rgba(255,255,255,0.1); }
.status-tag-rune.claimed { background: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.3); }
.status-tag-rune.in_progress { background: rgba(251, 191, 36, 0.1); color: #fbbf24; border-color: rgba(251, 191, 36, 0.3); }

.claim-btn-divine {
  border: 1px solid #fbbf24;
  background: linear-gradient(135deg, #d97706, #fbbf24); color: #050510; cursor: pointer; min-width: 140px;
  box-shadow: 0 7px 16px rgba(251, 191, 36, 0.16);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.claim-btn-divine:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 9px 20px rgba(251, 191, 36, 0.24); }
.claim-btn-divine:disabled { opacity: 0.6; cursor: wait; }

@media (prefers-reduced-motion: reduce) {
  .list-card-cosmic,
  .progress-fill,
  .claim-btn-divine {
    transition: none !important;
  }
}

@media (max-width: 768px) {
  .list-card-cosmic { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .card-actions-array { align-items: flex-start; min-width: auto; }
}
</style>
