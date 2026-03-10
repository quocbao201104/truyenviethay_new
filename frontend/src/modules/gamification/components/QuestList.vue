<template>
  <div v-if="loading" class="empty-state">Đang cảm ứng Thiên Đạo...</div>
  <div v-else-if="!tasks || tasks.length === 0" class="empty-state">Chưa có nhiệm vụ mới.</div>
  <div v-else class="list-layout">
    <article v-for="task in orderedTasks" :key="task.task_id" class="list-card" :class="{ 'is-completed': task.status === 'completed' }">
      <div class="card-content">
        <p class="kicker">Nhiệm vụ</p>
        <h3 class="card-title">{{ task.title }}</h3>
        <p class="card-desc">{{ task.description }}</p>
      </div>
      <div class="card-actions">
        <span class="reward-text">+{{ (task.points_awarded || 0).toLocaleString() }} Tu Vi</span>
        <span class="status-tag" :class="task.status">{{ task.status === 'completed' ? 'Đã hoàn thành' : 'Đang tiến hành' }}</span>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tasks: Array,
  loading: Boolean
});

const orderedTasks = computed(() => {
  const safeTasks = props.tasks || [];
  return [
    ...safeTasks.filter((task) => task.status !== 'completed'),
    ...safeTasks.filter((task) => task.status === 'completed'),
  ];
});
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
.list-card.is-completed { opacity: 0.6; }

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

.card-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; min-width: 140px; }
.reward-text { color: #fbbf24; font-weight: 700; font-size: 1rem; }

.status-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: #94a3b8;
}

.status-tag.completed { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }

@media (max-width: 768px) {
  .list-card { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .card-actions { align-items: flex-start; min-width: auto; }
}
</style>
