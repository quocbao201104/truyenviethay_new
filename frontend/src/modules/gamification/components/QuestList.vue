<template>
  <div v-if="loading" class="empty-state">Đang cảm ứng Thiên Đạo...</div>
  <div v-else-if="!tasks || tasks.length === 0" class="empty-state">Chưa có nhiệm vụ mới.</div>
  <div v-else class="list-layout">
    <article
      v-for="task in orderedTasks"
      :key="task.task_id"
      class="list-card"
      :class="{
        'is-completed': task.status === 'claimed',
        'is-claimable': task.status === 'completed',
      }"
    >
      <div class="card-content">
        <p class="kicker">Nhiệm vụ</p>
        <h3 class="card-title">{{ task.task_name || task.title }}</h3>
        <p class="card-desc">{{ task.description }}</p>
        <p v-if="task.progress_target && task.progress_target > 1" class="progress-text">
          Tiến độ: {{ task.progress_current || 0 }}/{{ task.progress_target }}
        </p>
      </div>
      <div class="card-actions">
        <span class="reward-text">+{{ (task.points_awarded || 0).toLocaleString() }} Tu Vi</span>

        <button
          v-if="task.status === 'completed'"
          class="claim-btn"
          :disabled="processingTaskId === task.task_id"
          @click="$emit('claim', task.task_id)"
        >
          <i v-if="processingTaskId === task.task_id" class="fas fa-spinner fa-spin"></i>
          <template v-else>Lĩnh Thưởng</template>
        </button>

        <span v-else class="status-tag" :class="task.status || 'pending'">
          {{ getStatusLabel(task.status) }}
        </span>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tasks: Array,
  loading: Boolean,
  processingTaskId: [Number, String, null],
});

defineEmits(['claim']);

const orderedTasks = computed(() => {
  const safeTasks = props.tasks || [];
  const rank = {
    completed: 0,
    in_progress: 1,
    pending: 2,
    claimed: 3,
    expired: 4,
    null: 5,
  };

  return [...safeTasks].sort((a, b) => {
    const aRank = rank[a?.status ?? 'null'] ?? 99;
    const bRank = rank[b?.status ?? 'null'] ?? 99;
    return aRank - bRank;
  });
});

const getStatusLabel = (status) => {
  if (status === 'claimed') return 'Đã nhận';
  if (status === 'in_progress') return 'Đang tiến hành';
  if (status === 'expired') return 'Hết hạn';
  return 'Chưa hoàn thành';
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255,255,255,0.05);
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  transition: all 0.2s;
}

.list-card:hover { border-color: rgba(255,255,255,0.1); background: rgba(51, 65, 85, 0.4); }
.list-card.is-completed { opacity: 0.6; }
.list-card.is-claimable {
  border-color: rgba(251, 191, 36, 0.35);
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.08);
}

.card-title { font-size: 1.15rem; color: #fff; margin: 0; }
.card-desc { font-size: 0.9rem; color: #94a3b8; margin: 0.25rem 0 0; line-height: 1.5; }
.progress-text {
  margin: 0.55rem 0 0;
  color: #67e8f9;
  font-size: 0.84rem;
  font-weight: 700;
}

.kicker {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #22d3ee;
  margin-bottom: 0.25rem;
}

.card-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; min-width: 140px; }
.reward-text { color: #fbbf24; font-weight: 700; font-size: 1rem; }

.status-tag,
.claim-btn {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
}

.status-tag {
  background: rgba(255,255,255,0.1);
  color: #94a3b8;
}

.status-tag.claimed {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-tag.in_progress {
  background: rgba(59, 130, 246, 0.14);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.claim-btn {
  border: 1px solid rgba(251, 191, 36, 0.45);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.24));
  color: #fde68a;
  cursor: pointer;
  min-width: 118px;
}

.claim-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.16);
}

.claim-btn:disabled {
  opacity: 0.75;
  cursor: wait;
}

@media (max-width: 768px) {
  .list-card { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .card-actions { align-items: flex-start; min-width: auto; }
}
</style>
